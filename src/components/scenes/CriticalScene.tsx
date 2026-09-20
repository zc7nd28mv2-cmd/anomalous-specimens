"use client";

import { useAfter, useReveal } from "@/hooks/useReveal";
import { CRITICAL } from "@/lib/content";

const DELAYS = [200, 1000, 900, 800, 1200] as const;

export function CriticalScene({ onComplete }: { onComplete: () => void }) {
  const step = useReveal(DELAYS);
  useAfter(400, onComplete, step >= 5);

  if (step === 0 || step >= 5) {
    return <div className="min-h-dvh bg-bg" />;
  }

  return (
    <div className="flex min-h-dvh items-center bg-bg px-6">
      <div className="mx-auto w-full max-w-[440px]">
        {step >= 2 ? (
          <p className="font-mono text-[12px] tracking-[0.32em] text-danger">
            {CRITICAL.warning}
          </p>
        ) : null}
        {step >= 3 ? (
          <p className="mt-6 font-mono text-[12px] tracking-[0.08em] text-mute">
            {CRITICAL.compromised}
          </p>
        ) : null}
        {step >= 4 ? (
          <p className="mt-4 font-mono text-[12px] tracking-[0.08em] text-dim">
            {CRITICAL.doNot}
          </p>
        ) : null}
      </div>
    </div>
  );
}
