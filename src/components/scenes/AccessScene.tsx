"use client";

import { useReveal, useAfter } from "@/hooks/useReveal";
import { Stage, SysLine } from "@/components/system/Stage";
import { ACCESS } from "@/lib/content";

const DELAYS = [400, 800, 900, 900, 700, 1200] as const;

export function AccessScene({ onComplete }: { onComplete: () => void }) {
  const step = useReveal(DELAYS);
  useAfter(400, onComplete, step >= 6);

  if (step >= 5) {
    return <div className="min-h-dvh bg-bg" />;
  }

  return (
    <Stage>
      {step >= 1 ? <SysLine>{ACCESS.accessing}</SysLine> : null}
      {step >= 2 ? <SysLine className="mt-2">{ACCESS.verifying}</SysLine> : null}
      {step >= 3 ? <SysLine className="mt-2">{ACCESS.integrity}</SysLine> : null}
      {step >= 4 ? (
        <SysLine className="mt-8 text-ink">{ACCESS.granted}</SysLine>
      ) : null}
    </Stage>
  );
}
