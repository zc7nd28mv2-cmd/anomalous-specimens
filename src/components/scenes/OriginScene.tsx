"use client";

import { useReveal } from "@/hooks/useReveal";
import { Command } from "@/components/system/Command";
import { Stage, StoryLine } from "@/components/system/Stage";

const DELAYS = [300, 700, 900, 500, 400, 400, 1000, 900, 900, 800, 700, 800, 700, 800, 700, 1000, 800, 900] as const;

export function OriginScene({ onContinue }: { onContinue: () => void }) {
  const step = useReveal(DELAYS);

  return (
    <Stage>
      {step >= 1 ? (
        <StoryLine className="rise">
          Project Peach Dream originally wasn&apos;t a drug.
        </StoryLine>
      ) : null}

      {step >= 2 ? (
        <StoryLine className="rise mt-8">
          It was born from the Elysium Initiative, created for:
        </StoryLine>
      ) : null}

      {step >= 3 ? (
        <ul className="rise mt-6 space-y-2 font-sans text-[15px] leading-[1.9] text-mute sm:text-[16px]">
          {step >= 3 ? <li>severe psychological trauma</li> : null}
          {step >= 4 ? <li>neurodegenerative disease</li> : null}
          {step >= 5 ? <li>end-of-life consciousness care</li> : null}
        </ul>
      ) : null}

      {step >= 6 ? (
        <StoryLine className="rise mt-10">
          The neural interface reads long-term memory and reconstructs a
          private mental space.
        </StoryLine>
      ) : null}

      {step >= 7 ? (
        <StoryLine className="rise mt-8">It does not create happiness.</StoryLine>
      ) : null}

      {step >= 8 ? (
        <StoryLine className="rise mt-3">
          It finds the place the user most wants to remain.
        </StoryLine>
      ) : null}

      {step >= 9 ? (
        <div className="mt-12 space-y-8">
          <QuietPair show={step >= 9} lead="For some:" line="a childhood summer." />
          <QuietPair show={step >= 11} lead="For some:" line="a deceased lover." />
          <QuietPair
            show={step >= 13}
            lead="For some:"
            line="the person they always imagined themselves becoming."
          />
        </div>
      ) : null}

      {step >= 15 ? (
        <StoryLine className="rise mt-12">
          No two people enter the same Peach Dream.
        </StoryLine>
      ) : null}

      {step >= 16 ? (
        <p className="rise mt-12 font-mono text-[11px] tracking-[0.16em] text-dim">
          R&amp;D called it:
        </p>
      ) : null}

      {step >= 17 ? (
        <p className="rise mt-4 font-mono text-[13px] leading-8 text-ink sm:text-[14px]">
          &quot;The Last Place Worth Remembering.&quot;
        </p>
      ) : null}

      {step >= 18 ? <Command onClick={onContinue}>CONTINUE</Command> : null}
    </Stage>
  );
}

function QuietPair({
  show,
  lead,
  line,
}: {
  show: boolean;
  lead: string;
  line: string;
}) {
  if (!show) {
    return null;
  }

  return (
    <div className="rise">
      <p className="font-sans text-[14px] text-dim">{lead}</p>
      <p className="mt-2 font-sans text-[15px] leading-[1.9] text-ink/90 sm:text-[16px]">
        {line}
      </p>
    </div>
  );
}
