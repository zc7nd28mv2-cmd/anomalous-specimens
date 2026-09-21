"use client";

import { useEffect, useRef, useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import { usePrefersReducedMotion, useScaledMs } from "@/hooks/useTiming";
import { useAudio } from "@/context/AudioContext";
import { Cursor } from "@/components/system/Cursor";
import { Stage, SysLine } from "@/components/system/Stage";
import { SYSTEM } from "@/lib/content";

const INTRO_DELAYS = [900, 800, 700, 900] as const;
const AFTER_DELAYS = [1400, 500, 700, 140] as const;
const EMPTY_DELAYS = [] as const;

const INIT_LINES = [
  SYSTEM.initializing,
  SYSTEM.memoryOk,
  SYSTEM.neuralOk,
  SYSTEM.specimenOk,
  SYSTEM.integrity47,
] as const;

const DETECTED_LINES = [SYSTEM.detected] as const;

function charWait() {
  return 25 + Math.random() * 20;
}

function lineWait() {
  return 100 + Math.random() * 80;
}

function useFastType(lines: readonly string[], enabled: boolean) {
  const scale = useScaledMs();
  const reduced = usePrefersReducedMotion();
  const [parts, setParts] = useState<string[]>(() => lines.map(() => ""));
  const [finished, setFinished] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (reduced) {
      setParts([...lines]);
      setFinished(true);
      return;
    }

    let cancelled = false;
    let line = 0;
    let count = 0;

    const clear = () => {
      if (timer.current != null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };

    const schedule = (fn: () => void, ms: number) => {
      clear();
      timer.current = window.setTimeout(fn, ms);
    };

    const step = () => {
      if (cancelled) {
        return;
      }
      const current = lines[line];
      if (current == null) {
        setFinished(true);
        return;
      }
      count += 1;
      const slice = current.slice(0, count);
      setParts((prev) => {
        const next = prev.slice();
        next[line] = slice;
        return next;
      });
      if (count >= current.length) {
        line += 1;
        count = 0;
        if (line >= lines.length) {
          setFinished(true);
          return;
        }
        schedule(step, scale(lineWait()));
        return;
      }
      schedule(step, scale(charWait()));
    };

    schedule(step, scale(charWait()));

    return () => {
      cancelled = true;
      clear();
    };
  }, [enabled, lines, reduced, scale]);

  return { parts, finished };
}

export function BootScene({ onComplete }: { onComplete: () => void }) {
  const intro = useReveal(INTRO_DELAYS);
  const typing = intro >= 4;
  const init = useFastType(INIT_LINES, typing);
  const after = useReveal(init.finished ? AFTER_DELAYS : EMPTY_DELAYS);
  const detect = useFastType(DETECTED_LINES, after >= 4);
  const audio = useAudio();

  return (
    <Stage className="overflow-hidden">
      {intro >= 1 ? (
        <p className="title-system text-ink">{SYSTEM.titleZh}</p>
      ) : null}

      {intro >= 2 ? (
        <p className="phosphor micro-flicker mt-3 font-mono text-[11px] tracking-[0.26em] text-sys">
          {SYSTEM.title}
        </p>
      ) : null}

      {intro >= 3 ? (
        <p className="mt-8 font-mono text-[13px] text-mute">
          {"> "}
          {intro < 4 ? <Cursor /> : null}
        </p>
      ) : null}

      <div className="mt-10 space-y-1">
        {init.parts.map((line, index) =>
          line ? <SysLine key={INIT_LINES[index]}>{line}</SysLine> : null,
        )}
      </div>

      {after >= 2 ? (
        <p className="mt-12 font-mono text-[12px] tracking-[0.28em] text-danger">
          {SYSTEM.warning}
        </p>
      ) : null}

      {after >= 3 ? (
        <p className="mt-3 font-mono text-[12px] tracking-[0.08em] text-danger">
          {SYSTEM.corrupted}
        </p>
      ) : null}

      {detect.parts[0] ? (
        <p className="mt-3 font-mono text-[12px] tracking-[0.08em] text-mute">
          {detect.parts[0]}
        </p>
      ) : null}

      {detect.finished ? (
        <button
          type="button"
          onClick={() => {
            audio.click();
            onComplete();
          }}
          className="read-tag"
        >
          {SYSTEM.enter}
        </button>
      ) : null}
    </Stage>
  );
}
