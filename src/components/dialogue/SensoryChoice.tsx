"use client";

import { SENSORY, type SensoryId } from "@/lib/sensory";
import { Command } from "@/components/system/Command";

export function SensoryChoice({
  id,
  onPick,
}: {
  id: SensoryId;
  onPick: (optionId: string) => void;
}) {
  const pack = SENSORY[id];

  return (
    <div className="mt-6 border-t border-green-border/50 pt-5">
      <p className="font-mono text-[11px] tracking-[0.16em] text-green-dim">
        {pack.label}
      </p>
      <p className="mt-3 font-sans text-[14px] text-green">{pack.prompt}</p>
      <div className="mt-5 space-y-2">
        {pack.options.map((option, index) => (
          <Command
            key={option.id}
            bracket={false}
            onClick={() => onPick(option.id)}
            className="sense-enter w-full flex-col items-start justify-start px-3 py-3"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className="block font-mono text-[11px] text-sys">
              {option.id}
            </span>
            <span className="mt-1 block font-sans text-[14px] text-ink">
              {option.label}
            </span>
          </Command>
        ))}
      </div>
    </div>
  );
}
