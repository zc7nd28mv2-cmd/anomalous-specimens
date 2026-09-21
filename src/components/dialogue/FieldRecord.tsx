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
  messagePause,
  type DialogueBeat,
} from "@/lib/dialogue";
import { SENSORY, type SensoryId } from "@/lib/sensory";
import { SOURCE_BIND, SOURCE_BOOT } from "@/lib/source";

const INJECT = [...SOURCE_BOOT, ...SOURCE_BIND] as const;

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

type Status = "play" | "choice" | "analysis" | "warn" | "after";

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
}: {
  onComplete: () => void;
  onWarning?: () => void;
  warningCleared?: boolean;
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
  const [pending, setPending] = useState<string[] | null>(null);
  const force = useRef(false);
  const keys = useRef(0);
  const end = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const pinBottom = useRef(true);

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
  }, [log, draft, indicator, choice, pending]);

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

  function onPick(optionId: string) {
    if (!choice) {
      return;
    }
    const option = SENSORY[choice].options.find((item) => item.id === optionId);
    if (!option) {
      return;
    }
    setPending(option.lines);
    setChoice(null);
    setStatus("analysis");
  }

  function onAnalysisDone() {
    if (pending) {
      push({
        key: nextKey(),
        kind: "analysis",
        steps: [],
        result: pending,
      });
    }
    setPending(null);
    setStatus("play");
    advance();
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
        if (!node) {
          return;
        }
        pinBottom.current =
          node.scrollHeight - node.scrollTop - node.clientHeight < 56;
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
          <LogLine key={item.key} item={item} onInvestDone={onComplete} />
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

        {choice ? <SensoryChoice id={choice} onPick={onPick} /> : null}

        {status === "analysis" && pending ? (
          <AnalysisSequence result={pending} onDone={onAnalysisDone} />
        ) : null}

        <div ref={end} />
      </div>
    </div>
  );
}

function AnalysisSequence({
  result,
  onDone,
}: {
  result: string[];
  onDone: () => void;
}) {
  const scale = useScaledMs();
  const [step, setStep] = useState(0);
  const [shown, setShown] = useState(0);

  const stages = [
    ANALYSIS.title,
    ANALYSIS.analyzing,
    `${ANALYSIS.input}\n${ANALYSIS.recognized}`,
    `${ANALYSIS.signature}\n${ANALYSIS.matching}`,
    ANALYSIS.complete,
  ];

  const done = useRef(onDone);

  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (step < stages.length) {
      const wait = step === 3 ? 600 + Math.random() * 400 : 500 + Math.random() * 300;
      const id = window.setTimeout(() => setStep((value) => value + 1), scale(wait));
      return () => window.clearTimeout(id);
    }
    if (shown < result.length) {
      const id = window.setTimeout(() => setShown((value) => value + 1), scale(280));
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => done.current(), scale(700));
    return () => window.clearTimeout(id);
  }, [result.length, scale, shown, step, stages.length]);

  return (
    <div className="analysis-panel space-y-3">
      {stages.slice(0, step).map((line) => (
        <p
          key={line}
          className="whitespace-pre-line font-mono text-[12px] tracking-[0.08em] text-green"
        >
          {line}
        </p>
      ))}
      {step >= stages.length
        ? result.slice(0, shown).map((line) => (
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
          ))
        : null}
    </div>
  );
}

function InvestigationRecord({ onDone }: { onDone: () => void }) {
  const scale = useScaledMs();
  const [phase, setPhase] = useState(0);

  const done = useRef(onDone);
  const once = useRef(false);

  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const waits = [0, 420, 480, 380, 420, 420, 450];
    let total = 0;
    const timers = waits.map((wait, i) => {
      total += wait || 80;
      return window.setTimeout(() => {
        setPhase(i + 1);
      }, scale(total));
    });
    const end = window.setTimeout(() => {
      if (!once.current) {
        once.current = true;
        done.current();
      }
    }, scale(total + 900));
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(end);
    };
  }, [scale]);

  return (
    <div className="invest-panel space-y-4">
      {phase >= 1 ? (
        <p className="font-mono text-[12px] tracking-[0.1em] text-green-dim">
          {INVESTIGATION.recovering}
        </p>
      ) : null}
      {phase >= 2 ? (
        <p className="font-mono text-[12px] tracking-[0.1em] text-green">
          {INVESTIGATION.found}
        </p>
      ) : null}
      {phase >= 3 ? (
        <div>
          <p className="font-mono text-[11px] tracking-[0.12em] text-sys">
            {INVESTIGATION.en}
          </p>
          <p className="mt-2 font-sans text-[14px] text-ink">{INVESTIGATION.zh}</p>
        </div>
      ) : null}
      {phase >= 4 ? (
        <p className="font-sans text-[14px] leading-7 text-ink">
          {INVESTIGATION.foundNote}
        </p>
      ) : null}
      {INVESTIGATION.fields.map((field, i) =>
        phase >= 5 + i ? (
          <div key={field.k}>
            <p className="font-mono text-[11px] tracking-[0.08em] text-sys">{field.k}</p>
            <p className="mt-1 font-sans text-[14px] text-ink">{field.v}</p>
          </div>
        ) : null,
      )}
    </div>
  );
}

function LogLine({
  item,
  onInvestDone,
}: {
  item: LogItem;
  onInvestDone: () => void;
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
    return <InvestigationRecord onDone={onInvestDone} />;
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
