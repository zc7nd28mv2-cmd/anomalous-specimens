"use client";

import { useAfter, useReveal } from "@/hooks/useReveal";
import { Stage, SysLine } from "@/components/system/Stage";
import { NOTICE } from "@/lib/content";

const DELAYS = [800, 900, 1100, 800, 800] as const;

export function NoticeScene({ onComplete }: { onComplete: () => void }) {
  const step = useReveal(DELAYS);
  useAfter(1400, onComplete, step >= 5);

  return (
    <Stage>
      {step >= 1 ? (
        <p className="font-mono text-[11px] tracking-[0.24em] text-dim">
          {NOTICE.title}
        </p>
      ) : null}
      {step >= 2 ? (
        <p className="mt-8 font-mono text-[12px] tracking-[0.1em] text-ink">
          {NOTICE.unauthorized}
        </p>
      ) : null}
      {step >= 3 ? (
        <SysLine className="mt-10">{NOTICE.verifying}</SysLine>
      ) : null}
      {step >= 4 ? <SysLine className="mt-2">{NOTICE.process}</SysLine> : null}
      {step >= 5 ? <SysLine className="mt-2">{NOTICE.source}</SysLine> : null}
    </Stage>
  );
}
