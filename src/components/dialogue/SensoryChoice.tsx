"use client";

import { SENSORY, type SensoryId } from "@/lib/sensory";
import { useAudio } from "@/context/AudioContext";

export function SensoryChoice({
  id,
  onPick,
}: {
  id: SensoryId;
  onPick: (optionId: string) => void;
}) {
  const pack = SENSORY[id];
  const audio = useAudio();

  return (
    <div className="mt-6 border-t border-green-border/50 pt-5">
      <p className="font-mono text-[11px] tracking-[0.16em] text-green-dim">
        {pack.label}
      </p>
      <p className="mt-3 font-sans text-[14px] text-green">{pack.prompt}</p>
      <div className="mt-5 space-y-2">
        {pack.options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              audio.click();
              onPick(option.id);
            }}
            className="act sense-enter block w-full px-3 py-3 text-left"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className="block font-mono text-[11px] text-green-dim">
              {option.id}
            </span>
            <span className="mt-1 block font-sans text-[14px] text-green">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
