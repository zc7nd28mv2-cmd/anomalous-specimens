"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useScaledMs } from "@/hooks/useTiming";
import { useAudio } from "@/context/AudioContext";
import { useArchive } from "@/context/ArchiveContext";
import { TypingIndicator } from "@/components/dialogue/TypingIndicator";
import { SensoryChoice } from "@/components/dialogue/SensoryChoice";
import {
  ANALYSIS,
  INVESTIGATION,
  charInterval,
  DIALOGUE,
  TYPING_INDICATOR_DELAY,
  messagePause,
  type DialogueBeat,
} from "@/lib/dialogue";
import { SENSORY, type SensoryId } from "@/lib/sensory";
import { SOURCE_BIND, SOURCE_BOOT } from "@/lib/source";
import {
  loadFieldSession,
  type FieldLogItem,
  type FieldSession,
  type FieldStatus,
  type InvestGate,
} from "@/lib/field-session";

const INJECT = [...SOURCE_BOOT, ...SOURCE_BIND] as const;

type LogItem = FieldLogItem;
type Status = FieldStatus;

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
  const { patchField } = useArchive();
  const saved = useRef(loadFieldSession());
  const [index, setIndex] = useState(saved.current.index);
  const [status, setStatus] = useState<Status>(saved.current.status);
  const [log, setLog] = useState<LogItem[]>(saved.current.log);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [indicator, setIndicator] = useState("");
  const [choice, setChoice] = useState<SensoryId | null>(saved.current.choice);
  const [choiceLeaving, setChoiceLeaving] = useState(false);
  const force = useRef(false);
  const picked = useRef(saved.current.picked);
  const keys = useRef(saved.current.keyCount);
  const end = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const pinBottom = useRef(saved.current.pinBottom);
  const restoring = useRef(saved.current.log.length > 0 || saved.current.scroll > 0);
  const snapshot = useRef<Partial<FieldSession>>({});
  const live = useRef({
    index,
    status,
    log,
    typing,
    draft,
    indicator,
  });
  live.current = { index, status, log, typing, draft, indicator };

  const nextKey = () => {
    keys.current += 1;
    return `k-${keys.current}`;
  };

  const push = useCallback((item: LogItem) => {
    setLog((value) => [...value, item]);
  }, []);

  useLayoutEffect(() => {
    if (!restoring.current) {
      return;
    }
    const node = scroller.current;
    const top = saved.current.scroll;
    if (!node) {
      return;
    }
    const apply = () => {
      node.scrollTop = top;
      pinBottom.current = saved.current.pinBottom;
    };
    apply();
    const frame = window.requestAnimationFrame(() => {
      apply();
      window.requestAnimationFrame(() => {
        apply();
        restoring.current = false;
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [log.length]);

  useEffect(() => {
    if (restoring.current || !pinBottom.current) {
      return;
    }
    end.current?.scrollIntoView({ block: "end" });
  }, [log, draft, indicator, choice]);

  useEffect(() => {
    snapshot.current = {
      index,
      status,
      log,
      keyCount: keys.current,
      picked: picked.current,
      choice,
      scroll: scroller.current?.scrollTop ?? saved.current.scroll,
      pinBottom: pinBottom.current,
    };
    patchField(snapshot.current);
  }, [choice, index, log, patchField, status]);

  useEffect(() => {
    return () => {
      const current = live.current;
      const beat = DIALOGUE[current.index] as DialogueBeat | undefined;
      const next: Partial<FieldSession> = { ...snapshot.current };
      if (
        current.status === "play" &&
        beat?.kind === "line" &&
        (current.typing || current.draft || current.indicator)
      ) {
        const item: LogItem = {
          key: `k-${(keys.current += 1)}`,
          kind: "msg",
          speaker: nameOf(beat.speaker),
          text: beat.text,
        };
        next.log = [...current.log, item];
        next.index = current.index + 1;
        next.keyCount = keys.current;
        next.status = "play";
      }
      patchField(next);
    };
  }, [patchField]);

  const advance = useCallback(() => {
    setIndex((value) => value + 1);
    setDraft("");
    setTyping(false);
    setIndicator("");
    force.current = false;
  }, []);

  useEffect(() => {
    if (status !== "play") {
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
      if (picked.current) {
        later(() => setIndex((value) => value + 1), 0);
        return () => {
          cancelled = true;
          timers.forEach((id) => window.clearTimeout(id));
        };
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
      later(() => setIndicator(nameOf(beat.speaker)), 0);
      later(() => {
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
      }, TYPING_INDICATOR_DELAY);
    }

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [advance, audio, index, onWarning, push, scale, status]);

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
    const beat = DIALOGUE[next] as DialogueBeat | undefined;
    setIndex(next);
    setDraft("");
    setTyping(false);
    force.current = false;
    if (beat?.kind === "line") {
      setIndicator(nameOf(beat.speaker));
    } else {
      setIndicator("");
    }
    setStatus("play");
  }

  function onPick(optionId: string) {
    if (!choice || picked.current || choiceLeaving) {
      return;
    }
    const option = SENSORY[choice].options.find((item) => item.id === optionId);
    if (!option) {
      return;
    }
    picked.current = true;
    setChoiceLeaving(true);
    onAnalysis?.(option.lines);
    enterNextBeat(index);
    window.setTimeout(() => {
      setChoice(null);
      setChoiceLeaving(false);
    }, scale(260));
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
      onScroll={() => {
        const node = scroller.current;
        if (!node || restoring.current) {
          return;
        }
        pinBottom.current =
          node.scrollHeight - node.scrollTop - node.clientHeight < 56;
        snapshot.current = {
          ...snapshot.current,
          scroll: node.scrollTop,
          pinBottom: pinBottom.current,
        };
        patchField({
          scroll: node.scrollTop,
          pinBottom: pinBottom.current,
        });
      }}
      onClick={onBoxClick}
      className="chat-content px-5 py-4"
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
            investGate={saved.current.investGate}
            investStep={saved.current.investStep}
            onInvestChange={(investGate, investStep) => {
              snapshot.current = { ...snapshot.current, investGate, investStep };
              patchField({ investGate, investStep });
            }}
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
  initialGate = "idle",
  initialStep = 0,
  onInvestChange,
}: {
  onDone: () => void;
  onReadyToLeave?: () => void;
  initialGate?: InvestGate;
  initialStep?: number;
  onInvestChange?: (gate: InvestGate, step: number) => void;
}) {
  const scale = useScaledMs();
  const audio = useAudio();
  const unlocked = initialGate !== "idle" || initialStep > 0;
  const [gate, setGate] = useState<InvestGate>(unlocked ? "open" : "idle");
  const [step, setStep] = useState(unlocked ? 4 : initialStep);
  const investChange = useRef(onInvestChange);
  investChange.current = onInvestChange;

  useEffect(() => {
    if (unlocked) {
      investChange.current?.("open", 4);
      return;
    }
    if (gate === "opening") {
      const id = window.setTimeout(() => setGate("recovering"), scale(400));
      return () => window.clearTimeout(id);
    }
    if (gate === "recovering") {
      const id = window.setTimeout(() => {
        setGate("open");
        investChange.current?.("open", 0);
      }, scale(500));
      return () => window.clearTimeout(id);
    }
    if (gate !== "open") {
      return;
    }
    investChange.current?.("open", 0);
    const waits = [80, 420, 1400, 420, 420];
    let total = 0;
    const timers = waits.map((wait, i) => {
      total += wait;
      return window.setTimeout(() => {
        setStep(i + 1);
        investChange.current?.("open", i + 1);
      }, scale(total));
    });
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [gate, scale, unlocked]);

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
              investChange.current?.("opening", 0);
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
                <CorruptName settled={unlocked} />
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

function CorruptName({ settled = false }: { settled?: boolean }) {
  const scale = useScaledMs();
  const [index, setIndex] = useState(settled ? INVESTIGATION.garbles.length : -1);
  const clear = index >= INVESTIGATION.garbles.length;

  useEffect(() => {
    if (settled) {
      return;
    }
    const start = window.setTimeout(() => setIndex(0), scale(340));
    return () => window.clearTimeout(start);
  }, [scale, settled]);

  useEffect(() => {
    if (settled || index < 0 || index >= INVESTIGATION.garbles.length) {
      return;
    }
    const wait = index === INVESTIGATION.garbles.length - 1 ? 280 : 150;
    const id = window.setTimeout(() => setIndex((value) => value + 1), scale(wait));
    return () => window.clearTimeout(id);
  }, [index, scale]);

  if (settled) {
    return <p className="recover-name is-clear">{INVESTIGATION.name}</p>;
  }

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
  investGate,
  investStep,
  onInvestChange,
}: {
  item: LogItem;
  onInvestDone: () => void;
  onReadyToLeave?: () => void;
  investGate?: InvestGate;
  investStep?: number;
  onInvestChange?: (gate: InvestGate, step: number) => void;
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
    return (
      <InvestigationRecord
        onDone={onInvestDone}
        onReadyToLeave={onReadyToLeave}
        initialGate={investGate}
        initialStep={investStep}
        onInvestChange={onInvestChange}
      />
    );
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
