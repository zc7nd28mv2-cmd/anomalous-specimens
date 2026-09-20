"use client";

import { useReveal } from "@/hooks/useReveal";
import { Command } from "@/components/system/Command";
import { Stage, StoryLine } from "@/components/system/Stage";
import { LEAK } from "@/lib/content";

const DELAYS = [400, 700, 900, 500, 400, 900, 400, 400, 400, 1000, 800, 900, 800, 900] as const;

export function LeakScene({ onContinue }: { onContinue: () => void }) {
  const step = useReveal(DELAYS);

  return (
    <Stage>
      {step >= 1 ? <StoryLine className="rise">{LEAK.p1}</StoryLine> : null}
      {step >= 2 ? <StoryLine className="rise mt-2">{LEAK.p2}</StoryLine> : null}

      {step >= 3 ? (
        <StoryLine className="rise mt-10">{LEAK.removedLead}</StoryLine>
      ) : null}
      {step >= 4 ? (
        <ul className="rise mt-4 space-y-2 font-sans text-[15px] text-mute">
          {LEAK.removed.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}

      {step >= 6 ? (
        <StoryLine className="rise mt-10">{LEAK.retainedLead}</StoryLine>
      ) : null}
      {step >= 7 ? (
        <ul className="rise mt-4 space-y-2 font-sans text-[15px] text-mute">
          {LEAK.retained.map((item, index) =>
            step >= 7 + index ? <li key={item}>{item}</li> : null,
          )}
        </ul>
      ) : null}

      {step >= 10 ? (
        <StoryLine className="rise mt-12">{LEAK.repackaged}</StoryLine>
      ) : null}
      {step >= 11 ? (
        <p className="rise mt-4 font-mono text-[13px] tracking-[0.16em] text-ink">
          {LEAK.opium}
        </p>
      ) : null}

      {step >= 12 ? (
        <StoryLine className="rise mt-12">{LEAK.became}</StoryLine>
      ) : null}
      {step >= 13 ? (
        <p className="rise mt-4 font-mono text-[13px] tracking-[0.12em] text-ink">
          {LEAK.fragment}
        </p>
      ) : null}

      {step >= 14 ? (
        <div className="rise mt-12 space-y-3">
          <StoryLine>{LEAK.close1}</StoryLine>
          <StoryLine>{LEAK.close2}</StoryLine>
        </div>
      ) : null}

      {step >= 14 ? <Command onClick={onContinue}>CONTINUE</Command> : null}
    </Stage>
  );
}
