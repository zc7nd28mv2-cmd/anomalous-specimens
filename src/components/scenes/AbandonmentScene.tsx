"use client";

import { useReveal } from "@/hooks/useReveal";
import { Command } from "@/components/system/Command";
import { Stage, StoryLine } from "@/components/system/Stage";
import { ABANDONMENT } from "@/lib/content";

const DELAYS = [500, 900, 1200, 900, 800] as const;

export function AbandonmentScene({ onContinue }: { onContinue: () => void }) {
  const step = useReveal(DELAYS);

  return (
    <Stage>
      {step >= 1 ? (
        <StoryLine className="rise">{ABANDONMENT.lead}</StoryLine>
      ) : null}

      {step >= 2 ? (
        <p className="rise mt-10 font-mono text-[13px] tracking-[0.28em] text-ink">
          {ABANDONMENT.death}
        </p>
      ) : null}

      {step >= 3 ? (
        <StoryLine className="rise mt-12">{ABANDONMENT.instead}</StoryLine>
      ) : null}

      {step >= 4 ? (
        <p className="rise mt-8 font-mono text-[13px] tracking-[0.18em] text-ink">
          {ABANDONMENT.term}
        </p>
      ) : null}

      {step >= 5 ? <Command onClick={onContinue}>CONTINUE</Command> : null}
    </Stage>
  );
}
