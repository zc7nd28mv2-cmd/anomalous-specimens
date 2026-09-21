"use client";

import { useAfter, useReveal } from "@/hooks/useReveal";
import { Cursor } from "@/components/system/Cursor";
import { Stage, SysLine } from "@/components/system/Stage";
import { SYSTEM } from "@/lib/content";

const DELAYS = [900, 800, 700, 900, 500, 420, 420, 500, 1400, 500, 700, 1600, 400] as const;

export function BootScene({ onComplete }: { onComplete: () => void }) {
  const step = useReveal(DELAYS);
  const blackout = step >= 12 && step < 13;

  useAfter(1500, onComplete, step >= 13);

  if (step === 0 || blackout) {
    return <div className="min-h-dvh bg-bg" />;
  }

  if (step >= 13) {
    return (
      <Stage>
        <p className="rise font-mono text-[12px] tracking-[0.18em] text-mute">
          {SYSTEM.detected}
        </p>
      </Stage>
    );
  }

  return (
    <Stage>
      {step >= 1 ? (
        <p className="phosphor micro-flicker font-mono text-[13px] tracking-[0.28em] text-ink sm:text-[14px]">
          {SYSTEM.title}
        </p>
      ) : null}

      {step >= 2 ? (
        <p className="mt-3 font-mono text-[11px] tracking-[0.22em] text-mute">
          {SYSTEM.archive}
        </p>
      ) : null}

      {step >= 3 ? (
        <p className="mt-8 font-mono text-[13px] text-mute">
          {"> "}
          {step < 4 ? <Cursor /> : null}
        </p>
      ) : null}

      <div className="mt-10 space-y-1">
        {step >= 4 ? <SysLine>{SYSTEM.initializing}</SysLine> : null}
        {step >= 5 ? <SysLine>{SYSTEM.memoryOk}</SysLine> : null}
        {step >= 6 ? <SysLine>{SYSTEM.neuralOk}</SysLine> : null}
        {step >= 7 ? <SysLine>{SYSTEM.specimenOk}</SysLine> : null}
        {step >= 8 ? <SysLine>{SYSTEM.integrity47}</SysLine> : null}
      </div>

      {step >= 10 ? (
        <p className="mt-12 font-mono text-[12px] tracking-[0.28em] text-danger">
          {SYSTEM.warning}
        </p>
      ) : null}

      {step >= 11 ? (
        <p className="mt-3 font-mono text-[12px] tracking-[0.08em] text-danger">
          {SYSTEM.corrupted}
        </p>
      ) : null}
    </Stage>
  );
}
