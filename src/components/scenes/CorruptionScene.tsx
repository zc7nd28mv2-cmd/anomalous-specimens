"use client";

import { useEffect, useState } from "react";
import { useAfter } from "@/hooks/useReveal";
import { useScaledMs } from "@/hooks/useTiming";
import { Stage, SysLine } from "@/components/system/Stage";
import { CORRUPTION } from "@/lib/content";
import { SOURCE_HEADER } from "@/lib/source";

type Phase = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function CorruptionScene({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>(0);
  const [integrity, setIntegrity] = useState<number>(CORRUPTION.values[0]);
  const [header, setHeader] = useState(0);
  const scale = useScaledMs();

  useEffect(() => {
    const plan: Array<{ at: number; run: () => void }> = [
      { at: 400, run: () => setPhase(1) },
      { at: 1200, run: () => setPhase(2) },
      { at: 2200, run: () => setPhase(3) },
      { at: 3000, run: () => setPhase(4) },
    ];

    const timers = plan.map(({ at, run }) => window.setTimeout(run, scale(at)));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [scale]);

  useEffect(() => {
    if (phase < 4) {
      return;
    }

    const values = CORRUPTION.values;
    const timers = values.slice(1).map((value, index) =>
      window.setTimeout(() => {
        setIntegrity(value);
      }, scale(700 * (index + 1))),
    );

    const headerTimer = window.setTimeout(() => {
      setPhase(5);
    }, scale(700 * values.length + 400));

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(headerTimer);
    };
  }, [phase, scale]);

  useEffect(() => {
    if (phase < 5) {
      return;
    }

    const timers = SOURCE_HEADER.map((_, index) =>
      window.setTimeout(() => {
        setHeader(index + 1);
      }, scale(280 * (index + 1))),
    );

    const next = window.setTimeout(() => {
      setPhase(6);
    }, scale(280 * SOURCE_HEADER.length + 900));

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(next);
    };
  }, [phase, scale]);

  useAfter(600, onComplete, phase >= 6);

  const fading = phase >= 4;

  return (
    <Stage>
      <div className={fading && header === 0 ? "vanish" : undefined}>
        {phase >= 1 ? <SysLine>{CORRUPTION.interrupt}</SysLine> : null}
        {phase >= 2 ? <SysLine className="mt-2">{CORRUPTION.recovering}</SysLine> : null}
        {phase >= 3 ? (
          <p className="mt-8 font-mono text-[12px] tracking-[0.12em] text-danger">
            {CORRUPTION.failed}
          </p>
        ) : null}
        {phase >= 4 ? (
          <div className="mt-10">
            <p className="font-mono text-[11px] tracking-[0.16em] text-dim">
              {CORRUPTION.integrity}
            </p>
            <p className="mt-3 font-mono text-[18px] tracking-[0.08em] text-mute">
              {integrity}%
            </p>
          </div>
        ) : null}
      </div>

      {phase >= 5 ? (
        <div className="mt-14 space-y-1">
          {SOURCE_HEADER.slice(0, header).map((line) => (
            <p
              key={line}
              className="font-mono text-[11px] leading-6 text-dim sm:text-[12px]"
            >
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </Stage>
  );
}
