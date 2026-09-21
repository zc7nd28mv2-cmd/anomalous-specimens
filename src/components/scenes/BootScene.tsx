"use client";

import { useEffect, useRef, useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import { usePrefersReducedMotion, useScaledMs } from "@/hooks/useTiming";
import { useAudio } from "@/context/AudioContext";
import { Cursor } from "@/components/system/Cursor";
import { Stage, SysLine } from "@/components/system/Stage";
import { SYSTEM } from "@/lib/content";

const INTRO_DELAYS = [900, 800, 700, 900] as const;
const AFTER_DELAYS = [80, 120, 100, 60] as const;
const EMPTY_DELAYS = [] as const;

const INIT_LINES = [
  SYSTEM.initializing,
  SYSTEM.memoryOk,
  SYSTEM.neuralOk,
  SYSTEM.specimenOk,
  SYSTEM.integrity47,
] as const;

const LINE_PACE = [18, 16, 20, 17, 19] as const;

function nextGap(base: number) {
  return Math.min(25, Math.max(12, base + (Math.random() - 0.5) * 8));
}

function planStamps(lines: readonly string[], scale: (ms: number) => number) {
  return lines.map((line, index) => {
    const base = LINE_PACE[index] ?? 17;
    const stamps = [0];
    let t = 0;
    for (let i = 1; i < line.length; i += 1) {
      t += scale(nextGap(base));
      stamps.push(t);
    }
    return stamps;
  });
}

function countVisible(stamps: number[], elapsed: number) {
  let count = 0;
  while (count < stamps.length && stamps[count] <= elapsed) {
    count += 1;
  }
  return count;
}

function useParallelType(lines: readonly string[], enabled: boolean) {
  const scale = useScaledMs();
  const reduced = usePrefersReducedMotion();
  const [parts, setParts] = useState<string[]>(() => lines.map(() => ""));
  const [finished, setFinished] = useState(false);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (reduced) {
      setParts([...lines]);
      setFinished(true);
      return;
    }

    const stamps = planStamps(lines, scale);
    const start = performance.now();
    let cancelled = false;
    let last = "";

    const tick = (now: number) => {
      if (cancelled) {
        return;
      }
      const elapsed = now - start;
      const next = lines.map((line, index) =>
        line.slice(0, countVisible(stamps[index], elapsed)),
      );
      const key = next.join("\n");
      if (key !== last) {
        last = key;
        setParts(next);
      }
      if (next.every((part, index) => part.length >= lines[index].length)) {
        setFinished(true);
        return;
      }
      frame.current = window.requestAnimationFrame(tick);
    };

    frame.current = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (frame.current != null) {
        window.cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    };
  }, [enabled, lines, reduced, scale]);

  return { parts, finished };
}

export function BootScene({ onComplete }: { onComplete: () => void }) {
  const intro = useReveal(INTRO_DELAYS);
  const typing = intro >= 4;
  const init = useParallelType(INIT_LINES, typing);
  const after = useReveal(init.finished ? AFTER_DELAYS : EMPTY_DELAYS);
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

      {after >= 1 ? (
        <p className="boot-snap mt-12 font-mono text-[12px] tracking-[0.28em] text-danger">
          {SYSTEM.warning}
        </p>
      ) : null}

      {after >= 2 ? (
        <p className="boot-snap mt-3 font-mono text-[12px] tracking-[0.08em] text-danger">
          {SYSTEM.corrupted}
        </p>
      ) : null}

      {after >= 3 ? (
        <p className="boot-snap mt-3 font-mono text-[12px] tracking-[0.08em] text-mute">
          {SYSTEM.detected}
        </p>
      ) : null}

      {after >= 4 ? (
        <button
          type="button"
          onClick={() => {
            audio.click();
            onComplete();
          }}
          className="read-tag boot-snap"
        >
          {SYSTEM.enter}
        </button>
      ) : null}
    </Stage>
  );
}
