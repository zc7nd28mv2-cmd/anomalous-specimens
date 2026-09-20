"use client";

import { useReveal } from "@/hooks/useReveal";
import { Command } from "@/components/system/Command";
import { CITY } from "@/lib/content";

const DELAYS = [800, 1200, 1600] as const;

export function CityScene({ onContinue }: { onContinue: () => void }) {
  const step = useReveal(DELAYS);

  return (
    <div className="flex min-h-dvh items-center bg-bg px-6 py-20 sm:px-12">
      <div className="mx-auto w-full max-w-[440px]">
        {step >= 1 ? (
          <p className="rise font-sans text-[15px] leading-[2] text-mute sm:text-[16px]">
            {CITY.l1}
          </p>
        ) : null}
        {step >= 2 ? (
          <p className="rise mt-8 font-sans text-[15px] leading-[2] text-ink/90 sm:text-[16px]">
            {CITY.l2}
          </p>
        ) : null}
        {step >= 3 ? (
          <Command onClick={onContinue}>RECOVER DATA</Command>
        ) : null}
      </div>
    </div>
  );
}
