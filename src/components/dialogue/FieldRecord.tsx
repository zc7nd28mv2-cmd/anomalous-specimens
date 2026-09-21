"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useScaledMs } from "@/hooks/useTiming";
import { useAudio } from "@/context/AudioContext";
import { TypingIndicator } from "@/components/dialogue/TypingIndicator";
import { SensoryChoice } from "@/components/dialogue/SensoryChoice";
import {
  charInterval,
  DIALOGUE,
  LOG_AFTER,
  type DialogueBeat,
  type Pace,
} from "@/lib/dialogue";
import { SENSORY, type SensoryId } from "@/lib/sensory";
import { SOURCE_BIND, SOURCE_BOOT } from "@/lib/source";
import { cn } from "@/lib/cn";

type LogItem =
  | { key: string; kind: "time"; text: string }
  | { key: string; kind: "msg"; speaker: string; text: string }
  | { key: string; kind: "sys"; k: string; v: string }
  | { key: string; kind: "code"; text: string }
  | { key: string; kind: "warn"; title: string; body?: string }
  | { key: string; kind: "note"; text: string; danger?: boolean }
  | { key: string; kind: "sense"; lines: string[] }
  | { key: string; kind: "lost" };

type Status = "play" | "choice" | "after";

const INJECT = [...SOURCE_BOOT, ...SOURCE_BIND] as const;
const EXIT = [
  "> EXIT REQUEST",
  "PROCESSING...",
  "TERMINATION PROTOCOL",
  "ERROR",
] as const;

function nameOf(speaker: "LIN" | "KAI" | null) {
  if (speaker === "LIN") {
    return "Lin";
  }
  if (speaker === "KAI") {
    return "Kai";
  }
  return "";
}

function speakerWait(pace: Pace) {
  switch (pace) {
    case "faster":
      return 260;
    case "fast":
      return 420;
    case "normal":
      return 640;
    case "slow":
      return 980;
    case "crawl":
      return 1400;
    default:
      return 640;
  }
}

export function FieldRecord({ onComplete }: { onComplete: () => void }) {
  const scale = useScaledMs();
  const audio = useAudio();
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<Status>("play");
  const [log, setLog] = useState<LogItem[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [indicator, setIndicator] = useState("");
  const [choice, setChoice] = useState<SensoryId | null>(null);
  const [unstable, setUnstable] = useState(false);
  const force = useRef(false);
  const keys = useRef(0);
  const end = useRef<HTMLDivElement>(null);

  const nextKey = () => {
    keys.current += 1;
    return `k-${keys.current}`;
  };

  const push = useCallback((item: LogItem) => {
    setLog((value) => [...value, item]);
  }, []);

  useEffect(() => {
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
    if (status !== "play") {
      return;
    }
    const beat = DIALOGUE[index] as DialogueBeat | undefined;
    if (!beat) {
      const id = window.setTimeout(() => setStatus("after"), scale(600));
      return () => window.clearTimeout(id);
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
      }, 360);
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
        setUnstable(true);
        push({ key: nextKey(), kind: "warn", title: beat.title, body: beat.body });
        advance();
      }, 240);
    } else if (beat.kind === "inject") {
      INJECT.forEach((line, i) => {
        later(() => push({ key: nextKey(), kind: "code", text: line }), 220 * i);
      });
      later(advance, 220 * INJECT.length + 200);
    } else if (beat.kind === "exitreq") {
      EXIT.forEach((line, i) => {
        later(
          () => push({ key: nextKey(), kind: "note", text: line, danger: true }),
          380 * i,
        );
      });
      later(advance, 380 * EXIT.length + 200);
    } else if (beat.kind === "lost") {
      later(() => {
        push({ key: nextKey(), kind: "lost" });
        setStatus("after");
      }, 200);
    } else if (beat.kind === "line") {
      later(() => setIndicator(nameOf(beat.speaker)), 0);
      later(() => {
        setIndicator("");
        setTyping(true);
        let i = 0;
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
              later(advance, beat.freeze ?? beat.hold ?? 420);
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
              later(advance, beat.freeze ?? beat.hold ?? 420);
            }, 50);
            return;
          }
          later(tick, charInterval(beat.pace, beat.text[i] ?? ""));
        };
        later(tick, charInterval(beat.pace, beat.text[0] ?? ""));
      }, beat.speaker ? speakerWait(beat.pace) : 160);
    }

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [advance, audio, index, push, scale, status]);

  useEffect(() => {
    if (status !== "after") {
      return;
    }
    let cancelled = false;
    const timers: number[] = [];
    LOG_AFTER.forEach((line, i) => {
      const id = window.setTimeout(() => {
        if (!cancelled) {
          push({ key: nextKey(), kind: "note", text: line });
        }
      }, scale(220 * (i + 1)));
      timers.push(id);
    });
    const done = window.setTimeout(() => {
      if (!cancelled) {
        onComplete();
      }
    }, scale(220 * (LOG_AFTER.length + 4)));
    timers.push(done);
    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [onComplete, push, scale, status]);

  function onPick(optionId: string) {
    if (!choice) {
      return;
    }
    const option = SENSORY[choice].options.find((item) => item.id === optionId);
    if (option) {
      push({ key: nextKey(), kind: "sense", lines: option.lines });
    }
    setChoice(null);
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
      className={cn(
        "mt-8 border border-green-border bg-term px-4 py-5 sm:px-6",
        unstable && "shadow-[0_0_24px_rgba(104,26,23,0.18)]",
      )}
    >
      <div className="sys-meta space-y-1 text-green-dim">
        <p className="phosphor-green">ARCHIVE LOG</p>
        <p>ID: PD-001</p>
        <p>STATUS: Recovered 91%</p>
        <p>SOURCE: Unknown Neural Relay</p>
      </div>
      <div className="mt-4 font-sans text-[13px] text-mute">
        <p>现场数据记录</p>
        <p>恢复度 91%</p>
        <p>来源 / 未知神经中继</p>
      </div>

      <button
        type="button"
        onClick={onBoxClick}
        className="mt-8 block max-h-[62vh] w-full overflow-y-auto text-left"
      >
        <div className="space-y-5 pb-4">
          {log.map((item) => (
            <LogLine key={item.key} item={item} />
          ))}

          {indicator ? <TypingIndicator name={indicator} /> : null}

          {draft && !indicator ? (
            <div className="font-sans text-[16px] leading-8 text-green">
              {DIALOGUE[index]?.kind === "line" && DIALOGUE[index].speaker ? (
                <p className="phosphor-green mb-1 font-mono text-[11px] tracking-[0.18em]">
                  {nameOf(DIALOGUE[index].speaker)}
                </p>
              ) : null}
              <p>{draft}</p>
            </div>
          ) : null}

          {choice ? <SensoryChoice id={choice} onPick={onPick} /> : null}
          <div ref={end} />
        </div>
      </button>
    </div>
  );
}

function LogLine({ item }: { item: LogItem }) {
  if (item.kind === "time") {
    return (
      <p className="font-mono text-[12px] tracking-[0.14em] text-green-dim">{item.text}</p>
    );
  }
  if (item.kind === "msg") {
    return (
      <div className="font-sans text-[16px] leading-8 text-green">
        {item.speaker ? (
          <p className="phosphor-green mb-1 font-mono text-[11px] tracking-[0.18em]">
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
    return (
      <div className="font-mono text-[13px] text-danger">
        <p className="phosphor-red">{item.title}</p>
        {item.body ? <p className="mt-1">{item.body}</p> : null}
      </div>
    );
  }
  if (item.kind === "sense") {
    return (
      <div className="space-y-1 border-l border-green-border pl-3">
        {item.lines.map((line) => (
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
  if (item.kind === "lost") {
    return (
      <p className="phosphor-red font-mono text-[14px] tracking-[0.1em] text-danger">
        Connection Lost.
      </p>
    );
  }
  return (
    <p
      className={
        item.danger
          ? "font-mono text-[12px] text-danger"
          : item.text.endsWith("：") || item.text.startsWith("PEACH") || item.text.startsWith("0.91")
            ? "font-mono text-[12px] text-mute"
            : "font-sans text-[15px] leading-8 text-ink/90"
      }
    >
      {item.text}
    </p>
  );
}
