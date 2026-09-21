"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useScaledMs } from "@/hooks/useTiming";
import { useAudio } from "@/context/AudioContext";
import { TypingIndicator } from "@/components/dialogue/TypingIndicator";
import { SensoryChoice } from "@/components/dialogue/SensoryChoice";
import {
  ANALYSIS,
  INVESTIGATION,
  charInterval,
  DIALOGUE,
  TYPING_INDICATOR_DELAY,
  KAI_HOLD_MS,
  messagePause,
  type DialogueBeat,
} from "@/lib/dialogue";
import { SENSORY, type SensoryId } from "@/lib/sensory";
import { SOURCE_BIND, SOURCE_BOOT } from "@/lib/source";
import { cn } from "@/lib/cn";

const INJECT = [...SOURCE_BOOT, ...SOURCE_BIND] as const;
const SCROLLBAR_HIDE_MS = 850;

type LogItem =
  | { key: string; kind: "time"; text: string }
  | { key: string; kind: "msg"; speaker: string; text: string }
  | { key: string; kind: "sys"; k: string; v: string }
  | { key: string; kind: "code"; text: string }
  | { key: string; kind: "warn"; title: string; body?: string; faded?: boolean }
  | { key: string; kind: "note"; text: string; danger?: boolean }
  | { key: string; kind: "analysis"; steps: string[]; result: string[] }
  | { key: string; kind: "invest" }
  | { key: string; kind: "lost" };

type Status = "play" | "choice" | "hold" | "analysis" | "warn" | "after";

function nameOf(speaker: "LIN" | "KAI" | null) {
  if (speaker === "LIN") {
    return "Lin";
  }
  if (speaker === "KAI") {
    return "Kai";
  }
  return "";
}

function pausePhase(index: number) {
  const seen = DIALOGUE.slice(0, index + 1);
  const times = seen.filter(
    (item): item is Extract<DialogueBeat, { kind: "time" }> => item.kind === "time",
  );
  const last = times[times.length - 1];
  if (seen.some((item) => item.kind === "lost") || last?.text === "21:19:47") {
    return "lost" as const;
  }
  if (seen.some((item) => item.kind === "warn") || last?.text === "21:18:02") {
    return "warn" as const;
  }
  if (last?.text === "21:12:33") {
    return "mid" as const;
  }
  return "early" as const;
}

export function FieldRecord({
  onComplete,
  onWarning,
  warningCleared = false,
  onAnalysis,
  analysisCleared = false,
  onReadyToLeave,
}: {
  onComplete: () => void;
  onWarning?: () => void;
  warningCleared?: boolean;
  onAnalysis?: (lines: string[]) => void;
  analysisCleared?: boolean;
  onReadyToLeave?: () => void;
}) {
  const scale = useScaledMs();
  const audio = useAudio();
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<Status>("play");
  const [log, setLog] = useState<LogItem[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [indicator, setIndicator] = useState("");
  const [choice, setChoice] = useState<SensoryId | null>(null);
  const [choiceLeaving, setChoiceLeaving] = useState(false);
  const [kaiHold, setKaiHold] = useState(false);
  const [scrollbarVisible, setScrollbarVisible] = useState(false);
  const force = useRef(false);
  const picked = useRef(false);
  const skipIndicator = useRef(false);
  const pickTimers = useRef<number[]>([]);
  const holdFrom = useRef<number | null>(null);
  const keys = useRef(0);
  const end = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const pinBottom = useRef(true);
  const scrollbarTimerRef = useRef<number | null>(null);
  const scrollbarVisibleRef = useRef(false);

  const nextKey = () => {
    keys.current += 1;
    return `k-${keys.current}`;
  };

  const push = useCallback((item: LogItem) => {
    setLog((value) => [...value, item]);
  }, []);

  useEffect(() => {
    if (!pinBottom.current) {
      return;
    }
    end.current?.scrollIntoView({ block: "end" });
  }, [log, draft, indicator, choice]);

  const advance = useCallback(() => {
    setIndex((value) => value + 1);
    setDraft("");
    setTyping(false);
    setIndicator("");
    force.current = false;
  }, []);

  useEffect(() => {
    return () => {
      pickTimers.current.forEach((id) => window.clearTimeout(id));
      if (scrollbarTimerRef.current != null) {
        window.clearTimeout(scrollbarTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (status !== "hold") {
      return;
    }
    setKaiHold(true);
    setIndicator("Kai");
    const from = holdFrom.current ?? index;
    const id = window.setTimeout(() => {
      setKaiHold(false);
      skipIndicator.current = true;
      enterNextBeat(from);
    }, KAI_HOLD_MS);
    return () => window.clearTimeout(id);
  }, [index, status]);

  useEffect(() => {
    if (status !== "play" || kaiHold) {
      return;
    }
    const beat = DIALOGUE[index] as DialogueBeat | undefined;
    if (!beat) {
      const id = window.setTimeout(() => setStatus("after"), scale(600));
      return () => window.clearTimeout(id);
    }

    if (beat.kind === "line" && beat.hidden) {
      const skip = window.setTimeout(() => setIndex((value) => value + 1), 0);
      return () => window.clearTimeout(skip);
    }

    let cancelled = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) {
          fn();
        }
      }, scale(ms));
      timers.push(id);
    };

    if (beat.kind === "choice") {
      if (picked.current || kaiHold) {
        return;
      }
      later(() => {
        setChoice(beat.id);
        setStatus("choice");
      }, 180);
      return () => {
        cancelled = true;
        timers.forEach((id) => window.clearTimeout(id));
      };
    }

    if (beat.kind === "time") {
      later(() => {
        push({ key: nextKey(), kind: "time", text: beat.text });
        advance();
      }, 280);
    } else if (beat.kind === "sys") {
      later(() => {
        push({ key: nextKey(), kind: "sys", k: beat.k, v: beat.v });
        advance();
      }, 500);
    } else if (beat.kind === "flash") {
      later(() => {
        push({ key: nextKey(), kind: "code", text: beat.code });
        advance();
      }, 320);
    } else if (beat.kind === "warn") {
      later(() => {
        audio.alert();
        if (!onWarning) {
          advance();
          return;
        }
        onWarning();
        setStatus("warn");
      }, 40);
    } else if (beat.kind === "inject") {
      INJECT.forEach((line, i) => {
        later(() => push({ key: nextKey(), kind: "code", text: line }), 220 * i);
      });
      later(advance, 220 * INJECT.length + 200);
    } else if (beat.kind === "exitreq") {
      later(advance, 40);
    } else if (beat.kind === "lost") {
      later(() => {
        push({ key: nextKey(), kind: "lost" });
        later(() => {
          push({ key: nextKey(), kind: "invest" });
          setStatus("after");
        }, 700);
      }, 200);
    } else if (beat.kind === "line") {
      const beginLine = () => {
        setIndicator("");
        setTyping(true);
        let i = 0;
        const hold = beat.freeze ?? messagePause(pausePhase(index));
        const tick = () => {
          if (force.current) {
            setDraft(beat.text);
            setTyping(false);
            later(() => {
              push({
                key: nextKey(),
                kind: "msg",
                speaker: nameOf(beat.speaker),
                text: beat.text,
              });
              audio.message();
              later(advance, hold);
            }, 40);
            return;
          }
          i += 1;
          setDraft(beat.text.slice(0, i));
          audio.tick();
          if (i >= beat.text.length) {
            setTyping(false);
            later(() => {
              push({
                key: nextKey(),
                kind: "msg",
                speaker: nameOf(beat.speaker),
                text: beat.text,
              });
              setDraft("");
              audio.message();
              later(advance, hold);
            }, 50);
            return;
          }
          later(tick, charInterval(beat.pace, beat.text[i] ?? ""));
        };
        later(tick, charInterval(beat.pace, beat.text[0] ?? ""));
      };
      if (skipIndicator.current) {
        skipIndicator.current = false;
        beginLine();
      } else {
        later(() => setIndicator(nameOf(beat.speaker)), 0);
        later(beginLine, TYPING_INDICATOR_DELAY);
      }
    }

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [advance, audio, index, kaiHold, onWarning, push, scale, status]);

  useEffect(() => {
    if (status !== "warn" || !warningCleared) {
      return;
    }
    setStatus("play");
    advance();
  }, [advance, status, warningCleared]);

  useEffect(() => {
    if (status !== "analysis" || !analysisCleared) {
      return;
    }
    setStatus("play");
  }, [analysisCleared, status]);

  useEffect(() => {
    const node = scroller.current;
    if (!node) {
      return;
    }

    const hideBar = () => {
      scrollbarTimerRef.current = null;
      scrollbarVisibleRef.current = false;
      setScrollbarVisible(false);
    };

    const showBar = () => {
      if (!scrollbarVisibleRef.current) {
        scrollbarVisibleRef.current = true;
        setScrollbarVisible(true);
      }
      if (scrollbarTimerRef.current != null) {
        window.clearTimeout(scrollbarTimerRef.current);
      }
      scrollbarTimerRef.current = window.setTimeout(hideBar, SCROLLBAR_HIDE_MS);
    };

    const handleScroll = () => {
      pinBottom.current =
        node.scrollHeight - node.scrollTop - node.clientHeight < 56;
      if (scrollbarVisibleRef.current) {
        showBar();
      }
    };

    node.addEventListener("scroll", handleScroll, { passive: true });
    node.addEventListener("wheel", showBar, { passive: true });
    node.addEventListener("touchmove", showBar, { passive: true });
    return () => {
      node.removeEventListener("scroll", handleScroll);
      node.removeEventListener("wheel", showBar);
      node.removeEventListener("touchmove", showBar);
    };
  }, []);

  function enterNextBeat(from: number) {
    let next = from + 1;
    while (next < DIALOGUE.length) {
      const beat = DIALOGUE[next];
      if (beat.kind === "time") {
        push({ key: nextKey(), kind: "time", text: beat.text });
        next += 1;
        continue;
      }
      if (beat.kind === "line" && beat.hidden) {
        next += 1;
        continue;
      }
      break;
    }
    setIndex(next);
    setDraft("");
    setTyping(false);
    force.current = false;
    if (skipIndicator.current) {
      setIndicator("");
    } else {
      const beat = DIALOGUE[next] as DialogueBeat | undefined;
      setIndicator(beat?.kind === "line" ? nameOf(beat.speaker) : "");
    }
    setStatus("play");
  }

  function onPick(optionId: string) {
    if (!choice || picked.current || choiceLeaving || kaiHold || status === "hold") {
      return;
    }
    const option = SENSORY[choice].options.find((item) => item.id === optionId);
    if (!option) {
      return;
    }
    picked.current = true;
    holdFrom.current = index;
    setChoiceLeaving(true);
    onAnalysis?.(option.lines);
    const fade = window.setTimeout(() => {
      setChoice(null);
      setChoiceLeaving(false);
      setStatus("hold");
    }, scale(260));
    pickTimers.current.push(fade);
  }

  function onBoxClick() {
    if (status !== "play" || !typing) {
      return;
    }
    force.current = true;
    const beat = DIALOGUE[index];
    if (beat?.kind === "line") {
      setDraft(beat.text);
      setTyping(false);
      setIndicator("");
    }
  }

  return (
    <div
      ref={scroller}
      onClick={onBoxClick}
      className={cn("chat-content px-5 py-4", scrollbarVisible && "is-scrolling")}
    >
      <div className="sys-meta space-y-1 text-green-dim">
        <p>ARCHIVE LOG</p>
        <p>ID: PD-001</p>
        <p>STATUS: Recovered 91%</p>
        <p>SOURCE: Unknown Neural Relay</p>
      </div>

      <div className="mt-6 space-y-5 pb-4">
        {log.map((item) => (
          <LogLine
            key={item.key}
            item={item}
            onInvestDone={onComplete}
            onReadyToLeave={onReadyToLeave}
          />
        ))}

        {indicator ? <TypingIndicator name={indicator} /> : null}

        {draft && !indicator ? (
          <div className="font-sans text-[14px] leading-7 text-green">
            {DIALOGUE[index]?.kind === "line" && DIALOGUE[index].speaker ? (
              <p className="mb-1 font-mono text-[11px] tracking-[0.18em] text-green">
                {nameOf(DIALOGUE[index].speaker)}
              </p>
            ) : null}
            <p>{draft}</p>
          </div>
        ) : null}

        {choice ? (
          <SensoryChoice id={choice} leaving={choiceLeaving} onPick={onPick} />
        ) : null}

        <div ref={end} />
      </div>
    </div>
  );
}

function InvestigationRecord({
  onDone,
  onReadyToLeave,
}: {
  onDone: () => void;
  onReadyToLeave?: () => void;
}) {
  const scale = useScaledMs();
  const audio = useAudio();
  const [gate, setGate] = useState<"idle" | "opening" | "recovering" | "open">("idle");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (gate === "opening") {
      const id = window.setTimeout(() => setGate("recovering"), scale(400));
      return () => window.clearTimeout(id);
    }
    if (gate === "recovering") {
      const id = window.setTimeout(() => setGate("open"), scale(500));
      return () => window.clearTimeout(id);
    }
    if (gate !== "open") {
      return;
    }
    const waits = [80, 420, 1400, 420, 420];
    let total = 0;
    const timers = waits.map((wait, i) => {
      total += wait;
      return window.setTimeout(() => setStep(i + 1), scale(total));
    });
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [gate, scale]);

  return (
    <div className="invest-panel is-enter">
      <div className="invest-head">
        <p className="invest-en font-mono text-[11px] tracking-[0.12em] text-sys">
          {INVESTIGATION.en}
        </p>
        <p className="invest-zh mt-2 font-sans text-[14px] text-ink">{INVESTIGATION.zh}</p>
      </div>

      <div className="invest-body">
        {gate === "idle" ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              audio.click();
              onReadyToLeave?.();
              setGate("opening");
            }}
            className="invest-open is-enter"
          >
            [ {INVESTIGATION.prompt} ]
          </button>
        ) : null}

        {gate === "opening" ? (
          <p className="font-mono text-[12px] tracking-[0.1em] text-green-dim">
            {INVESTIGATION.opening}
          </p>
        ) : null}

        {gate === "recovering" ? (
          <p className="font-mono text-[12px] tracking-[0.1em] text-green-dim">
            {INVESTIGATION.recovering}
          </p>
        ) : null}

        {gate === "open" ? (
          <div className="space-y-5">
            {step >= 1 ? (
              <p className="font-sans text-[14px] leading-7 text-ink">
                {INVESTIGATION.foundNote}
              </p>
            ) : null}
            {step >= 2 ? (
              <div>
                <p className="font-mono text-[11px] tracking-[0.08em] text-sys">
                  {INVESTIGATION.nameLabel}
                </p>
                <CorruptName />
              </div>
            ) : null}
            {step >= 3 ? (
              <div>
                <p className="font-mono text-[11px] tracking-[0.08em] text-sys">
                  {INVESTIGATION.versionLabel}
                </p>
                <p className="mt-1 font-sans text-[14px] text-ink">{INVESTIGATION.version}</p>
              </div>
            ) : null}
            {step >= 4 ? (
              <div>
                <p className="font-mono text-[11px] tracking-[0.08em] text-sys">
                  {INVESTIGATION.noteLabel}
                </p>
                <p className="mt-1 font-sans text-[14px] text-ink">{INVESTIGATION.note}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {gate === "open" ? (
        <div className="invest-foot">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onDone();
            }}
            className="invest-exit"
          >
            [ EXIT ]
          </button>
        </div>
      ) : null}
    </div>
  );
}

function CorruptName() {
  const scale = useScaledMs();
  const [index, setIndex] = useState(-1);
  const clear = index >= INVESTIGATION.garbles.length;

  useEffect(() => {
    const start = window.setTimeout(() => setIndex(0), scale(340));
    return () => window.clearTimeout(start);
  }, [scale]);

  useEffect(() => {
    if (index < 0 || index >= INVESTIGATION.garbles.length) {
      return;
    }
    const wait = index === INVESTIGATION.garbles.length - 1 ? 280 : 150;
    const id = window.setTimeout(() => setIndex((value) => value + 1), scale(wait));
    return () => window.clearTimeout(id);
  }, [index, scale]);

  if (index < 0) {
    return null;
  }

  return (
    <p className={clear ? "recover-name is-clear" : "recover-name"}>
      {clear ? INVESTIGATION.name : INVESTIGATION.garbles[index]}
    </p>
  );
}

function LogLine({
  item,
  onInvestDone,
  onReadyToLeave,
}: {
  item: LogItem;
  onInvestDone: () => void;
  onReadyToLeave?: () => void;
}) {
  if (item.kind === "time") {
    return (
      <p className="font-mono text-[12px] tracking-[0.14em] text-green-dim">{item.text}</p>
    );
  }
  if (item.kind === "msg") {
    return (
      <div className="font-sans text-[14px] leading-7 text-green">
        {item.speaker ? (
          <p className="mb-1 font-mono text-[11px] tracking-[0.18em] text-green">
            {item.speaker}
          </p>
        ) : null}
        <p>{item.text}</p>
      </div>
    );
  }
  if (item.kind === "sys") {
    return (
      <p className="font-mono text-[11px] tracking-[0.12em] text-green-dim">
        {item.k} / {item.v}
      </p>
    );
  }
  if (item.kind === "code") {
    return <p className="font-mono text-[12px] text-sys">{item.text}</p>;
  }
  if (item.kind === "warn") {
    return null;
  }
  if (item.kind === "analysis") {
    return (
      <div className="analysis-panel space-y-2">
        <p className="font-mono text-[12px] text-green">{ANALYSIS.complete}</p>
        {item.result.map((line) => (
          <p
            key={line}
            className={
              line === "WARNING"
                ? "font-mono text-[12px] text-danger"
                : "font-mono text-[12px] text-green-dim"
            }
          >
            {line}
          </p>
        ))}
      </div>
    );
  }
  if (item.kind === "invest") {
    return <InvestigationRecord onDone={onInvestDone} onReadyToLeave={onReadyToLeave} />;
  }
  if (item.kind === "lost") {
    return (
      <p className="font-mono text-[14px] tracking-[0.1em] text-danger">
        Connection Lost.
      </p>
    );
  }
  return (
    <p
      className={
        item.danger
          ? "font-mono text-[12px] text-danger"
          : "font-sans text-[14px] leading-8 text-ink/90"
      }
    >
      {item.text}
    </p>
  );
}
