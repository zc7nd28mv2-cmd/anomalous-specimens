"use client";

import { useReveal } from "@/hooks/useReveal";
import { useAudio } from "@/context/AudioContext";
import { Cursor } from "@/components/system/Cursor";
import { Stage, SysLine } from "@/components/system/Stage";
import { SYSTEM } from "@/lib/content";

const DELAYS = [900, 800, 700, 900, 500, 420, 420, 500, 1400, 500, 700, 800] as const;

export function BootScene({ onComplete }: { onComplete: () => void }) {
  const step = useReveal(DELAYS);
  const audio = useAudio();

  return (
    <Stage className="overflow-hidden">
      {step >= 1 ? (
        <p className="title-system text-ink">{SYSTEM.titleZh}</p>
      ) : null}

      {step >= 2 ? (
        <p className="phosphor micro-flicker mt-3 font-mono text-[11px] tracking-[0.26em] text-sys">
          {SYSTEM.title}
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

      {step >= 12 ? (
        <p className="mt-3 font-mono text-[12px] tracking-[0.08em] text-mute">
          {SYSTEM.detected}
        </p>
      ) : null}

      {step >= 12 ? (
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
