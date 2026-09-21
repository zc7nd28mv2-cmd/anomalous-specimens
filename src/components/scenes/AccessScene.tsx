"use client";

import { useEffect, useState } from "react";
import { useAfter } from "@/hooks/useReveal";
import { useScaledMs } from "@/hooks/useTiming";
import { Stage, SysLine } from "@/components/system/Stage";
import { ACCESS } from "@/lib/content";

const BAR_STEPS = [
  { pct: 18, wait: 180 },
  { pct: 31, wait: 200 },
  { pct: 47, wait: 220 },
  { pct: 58, wait: 260 },
  { pct: 73, wait: 300 },
  { pct: 82, wait: 520 },
  { pct: 86, wait: 380 },
  { pct: 96, wait: 240 },
  { pct: 100, wait: 200 },
] as const;

export function AccessScene({ onComplete }: { onComplete: () => void }) {
  const scale = useScaledMs();
  const [pct, setPct] = useState(0);
  const loaded = pct >= 100;

  useEffect(() => {
    let index = 0;
    let id = 0;
    let cancelled = false;
    const run = () => {
      const step = BAR_STEPS[index];
      if (!step || cancelled) {
        return;
      }
      id = window.setTimeout(() => {
        if (cancelled) {
          return;
        }
        setPct(step.pct);
        index += 1;
        run();
      }, scale(step.wait));
    };
    run();
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [scale]);

  useAfter(2780, onComplete, loaded);

  return (
    <Stage className="overflow-hidden">
      <SysLine>{ACCESS.accessing}</SysLine>
      <SysLine className="mt-2">{ACCESS.verifying}</SysLine>
      <SysLine className="mt-2">{ACCESS.integrity}</SysLine>
      <div className="boot-bar" aria-hidden>
        <div className="boot-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      {loaded ? (
        <p className="grant-mark is-breathe">{ACCESS.granted}</p>
      ) : null}
    </Stage>
  );
}
