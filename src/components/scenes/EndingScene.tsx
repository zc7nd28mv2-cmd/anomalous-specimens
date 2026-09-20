"use client";

import { useReveal } from "@/hooks/useReveal";
import { Cursor } from "@/components/system/Cursor";
import { ENDING } from "@/lib/content";

const DELAYS = [1800, 900, 1400, 1200, 1600, 1400, 1800] as const;

export function EndingScene() {
  const step = useReveal(DELAYS);

  if (step === 0 || step === 5) {
    return <div className="min-h-dvh bg-bg" />;
  }

  if (step >= 6) {
    return (
      <div className="flex min-h-dvh items-center bg-bg px-6">
        <div className="mx-auto max-w-[360px] text-left">
          <p className="fade font-sans text-[15px] leading-[2] text-ink/90 sm:text-[16px]">
            {ENDING.line}
          </p>
          <p className="fade mt-6 font-sans text-[13px] text-mute">
            {ENDING.attr}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg px-6 py-16 sm:px-10">
      {step >= 1 && step < 5 ? (
        <p className="font-mono text-[13px] text-mute">
          {"> "}
          {step === 1 || step === 3 ? <Cursor /> : null}
        </p>
      ) : null}
      {step >= 2 && step < 4 ? (
        <p className="mt-6 font-mono text-[12px] tracking-[0.04em] text-dim">
          {ENDING.completed}
        </p>
      ) : null}
    </div>
  );
}
