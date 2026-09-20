"use client";

import { useReveal } from "@/hooks/useReveal";
import { Command } from "@/components/system/Command";
import { Stage, StoryLine } from "@/components/system/Stage";
import { TERMINATION } from "@/lib/content";

const DELAYS = [400, 800, 900, 900, 800, 800, 800, 1000] as const;

export function TerminationScene({ onContinue }: { onContinue: () => void }) {
  const step = useReveal(DELAYS);

  return (
    <Stage>
      {TERMINATION.map((line, index) =>
        step >= index + 1 ? (
          <StoryLine
            key={line}
            className={`rise ${index === 0 ? "" : index === 3 ? "mt-10" : "mt-4"}`}
          >
            {line}
          </StoryLine>
        ) : null,
      )}

      {step >= 8 ? <Command onClick={onContinue}>CONTINUE</Command> : null}
    </Stage>
  );
}
