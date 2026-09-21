"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useArchive } from "@/context/ArchiveContext";
import { useScaledMs } from "@/hooks/useTiming";
import { Cursor } from "@/components/system/Cursor";
import { Command } from "@/components/system/Command";
import { TypingIndicator } from "@/components/dialogue/TypingIndicator";
import {
  charInterval,
  DIALOGUE,
  LOG_AFTER,
  type DialogueBeat,
  type Pace,
} from "@/lib/dialogue";
import { SOURCE_BIND, SOURCE_BOOT } from "@/lib/source";
import { cn } from "@/lib/cn";

type Mode = "play" | "dead" | "after";

const INJECT_LINES = [...SOURCE_BOOT, ...SOURCE_BIND] as const;
const EXIT_LINES = [
  "> EXIT REQUEST",
  "PROCESSING...",
  "TERMINATION PROTOCOL",
  "ERROR",
] as const;

function speakerWait(pace: Pace) {
  switch (pace) {
    case "faster":
      return 320;
    case "fast":
      return 480;
    case "normal":
      return 700;
    case "slow":
      return 920;
    case "crawl":
      return 1200;
    default:
      return 700;
  }
}

export function DialogueTerminal() {
  const { finishPd001 } = useArchive();
  const scale = useScaledMs();
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState(false);
  const [shown, setShown] = useState("");
  const [indicator, setIndicator] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [mode, setMode] = useState<Mode>("play");
  const [exitCount, setExitCount] = useState(0);
  const [injectCount, setInjectCount] = useState(0);
  const forceComplete = useRef(false);
  const timers = useRef<number[]>([]);

  const beat = DIALOGUE[index] as DialogueBeat | undefined;
  const seen = useMemo(() => DIALOGUE.slice(0, index + 1), [index]);

  const sys = [...seen].reverse().find((item) => item.kind === "sys");
  const warn = [...seen].reverse().find((item) => item.kind === "warn");
  const flash = beat?.kind === "flash" ? beat.code : null;
  const inject = seen.some((item) => item.kind === "inject");
  const exitReq = seen.some((item) => item.kind === "exitreq");
  const lost = mode !== "play" || seen.some((item) => item.kind === "lost");
  const darken = seen.some(
    (item) =>
      (item.kind === "line" && item.text.includes("她比我记忆里的年轻")) ||
      (item.kind === "warn" && item.title.includes("WARNING!")),
  );
  const redShift = seen.some(
    (item) => item.kind === "warn" && item.title.includes("WARNING!"),
  );

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const later = useCallback(
    (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, scale(ms));
      timers.current.push(id);
    },
    [scale],
  );

  const advance = useCallback(() => {
    clearTimers();
    if (index + 1 >= DIALOGUE.length) {
      setMode("dead");
      return;
    }
    setIndex((value) => value + 1);
    setTyping(false);
    setShown("");
    setIndicator(false);
    forceComplete.current = false;
  }, [clearTimers, index]);

  useEffect(() => {
    if (mode !== "play" || !beat) {
      return;
    }

    clearTimers();
    forceComplete.current = false;

    if (beat.kind !== "line") {
      const wait =
        beat.kind === "flash"
          ? 320
          : beat.kind === "lost"
            ? 900
            : beat.kind === "exitreq"
              ? 1680
              : beat.kind === "inject"
                ? 900
                : beat.kind === "warn"
                  ? 1100
                  : 700;
      later(() => {
        if (beat.kind === "lost") {
          setMode("dead");
          return;
        }
        advance();
      }, wait);
      return clearTimers;
    }

    later(() => {
      setIndicator(Boolean(beat.speaker));
    }, 0);

    later(() => {
      setIndicator(false);
      setTyping(true);
      let i = 0;
      const tick = () => {
        if (forceComplete.current) {
          setShown(beat.text);
          setTyping(false);
          later(() => {
            if (beat.freeze) {
              setFrozen(true);
              later(() => {
                setFrozen(false);
                advance();
              }, beat.freeze);
              return;
            }
            later(advance, beat.hold ?? 480);
          }, 80);
          return;
        }
        i += 1;
        setShown(beat.text.slice(0, i));
        if (i >= beat.text.length) {
          setTyping(false);
          if (beat.freeze) {
            setFrozen(true);
            later(() => {
              setFrozen(false);
              advance();
            }, beat.freeze);
            return;
          }
          later(advance, beat.hold ?? 480);
          return;
        }
        later(tick, charInterval(beat.pace, beat.text[i] ?? ""));
      };
      later(tick, charInterval(beat.pace, beat.text[0] ?? ""));
    }, beat.speaker ? speakerWait(beat.pace) : 180);

    return clearTimers;
  }, [advance, beat, clearTimers, later, mode]);

  useEffect(() => {
    if (!exitReq || lost) {
      return;
    }
    const ids = [1, 2, 3, 4].map((step, i) =>
      window.setTimeout(() => setExitCount(step), scale(420 * i)),
    );
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [exitReq, lost, scale]);

  useEffect(() => {
    if (!inject || lost || frozen) {
      return;
    }
    if (injectCount >= INJECT_LINES.length) {
      return;
    }
    const id = window.setTimeout(() => {
      setInjectCount((value) => Math.min(INJECT_LINES.length, value + 1));
    }, scale(280));
    return () => window.clearTimeout(id);
  }, [frozen, inject, injectCount, lost, scale]);

  useEffect(() => {
    if (mode !== "dead") {
      return;
    }
    const id = window.setTimeout(() => setMode("after"), scale(1600));
    return () => window.clearTimeout(id);
  }, [mode, scale]);

  function onBoxClick() {
    if (mode !== "play" || !beat || beat.kind !== "line" || frozen) {
      return;
    }
    if (typing) {
      forceComplete.current = true;
      setShown(beat.text);
      setTyping(false);
      setIndicator(false);
      return;
    }
    if (shown === beat.text) {
      advance();
    }
  }

  const line = beat?.kind === "line" ? beat : null;

  return (
    <div
      className={cn(
        "relative min-h-dvh overflow-hidden px-4 py-10 sm:px-8 sm:py-16",
        darken || lost ? "bg-black" : "bg-term",
        frozen && "opacity-30",
        redShift && !lost && "after:pointer-events-none after:absolute after:inset-0 after:bg-[rgba(104,26,23,0.12)]",
      )}
    >
      {inject && !lost && !frozen ? (
        <div className="pointer-events-none absolute inset-x-4 top-14 space-y-2 sm:inset-x-10">
          {INJECT_LINES.slice(0, injectCount).map((code, i) => (
            <p
              key={code}
              className={cn(
                "font-mono text-[11px] text-sys/80",
                i % 2 === 0 ? "ml-[2vw]" : "ml-[18vw]",
              )}
            >
              {code}
            </p>
          ))}
        </div>
      ) : null}

      {flash && !lost ? (
        <p className="pointer-events-none absolute left-6 top-1/3 font-mono text-[12px] text-sys sm:left-16">
          {flash}
        </p>
      ) : null}

      <div className="relative mx-auto flex min-h-[70vh] max-w-[720px] flex-col justify-end">
        <div className="mb-6 font-mono text-[10px] tracking-[0.16em] text-green-dim">
          <p className="phosphor-green">ARCHIVE LOG</p>
          <p className="mt-1">ID: PD-001</p>
          <p>STATUS: Recovered 91%</p>
          <p>SOURCE: Unknown Neural Relay</p>
        </div>

        {sys && sys.kind === "sys" && !lost ? (
          <div className="mb-4 font-mono text-[10px] tracking-[0.18em] text-green-dim">
            <p>{sys.k}</p>
            <p>{sys.v}</p>
          </div>
        ) : null}

        {warn && warn.kind === "warn" ? (
          <div className="mb-4 font-mono text-[12px] tracking-[0.12em] text-danger">
            <p className="phosphor-red">{warn.title}</p>
            {warn.body ? <p className="mt-2">{warn.body}</p> : null}
          </div>
        ) : null}

        {exitReq && !lost ? (
          <div className="mb-4 space-y-1 font-mono text-[11px] text-danger">
            {EXIT_LINES.slice(0, exitCount).map((item) => (
              <p
                key={item}
                className={item === "ERROR" ? "phosphor-red" : undefined}
              >
                {item}
              </p>
            ))}
          </div>
        ) : null}

        {mode === "play" && !lost ? (
          <button
            type="button"
            onClick={onBoxClick}
            className="dialogue-box w-full px-5 py-5 text-left sm:px-7 sm:py-6"
          >
            {beat?.kind === "time" ? (
              <p className="font-mono text-[12px] tracking-[0.16em] text-green">
                {beat.text}
              </p>
            ) : null}

            {indicator && line?.speaker ? (
              <TypingIndicator name={line.speaker} />
            ) : null}

            {line && !indicator ? (
              <div className="font-mono text-[15px] leading-8 text-green sm:text-[16px]">
                {line.speaker ? (
                  <p className="phosphor-green mb-3 text-[12px] tracking-[0.22em]">
                    {line.speaker}
                  </p>
                ) : null}
                <p>
                  {shown}
                  {typing ? <Cursor /> : <span className="ml-3 text-green-dim">▼</span>}
                </p>
              </div>
            ) : null}
          </button>
        ) : null}

        {lost ? (
          <p className="phosphor-red font-mono text-[14px] tracking-[0.12em] text-danger">
            Connection Lost.
          </p>
        ) : null}

        {mode === "after" ? (
          <div className="mt-10 space-y-2">
            {LOG_AFTER.map((lineText) => (
              <p
                key={lineText}
                className={
                  lineText.startsWith("PEACH") ||
                  lineText.startsWith("0.91") ||
                  lineText.endsWith("：")
                    ? "font-mono text-[12px] text-mute"
                    : "font-sans text-[14px] leading-8 text-ink/90"
                }
              >
                {lineText}
              </p>
            ))}
            <Command onClick={finishPd001}>RETURN</Command>
          </div>
        ) : null}
      </div>
    </div>
  );
}
