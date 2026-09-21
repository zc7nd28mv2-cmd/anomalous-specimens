"use client";

import { useAudio } from "@/context/AudioContext";
import { cn } from "@/lib/cn";

export function BackLink({
  onClick,
  className,
  label = "返回",
}: {
  onClick: () => void;
  className?: string;
  label?: string;
}) {
  const audio = useAudio();

  return (
    <button
      type="button"
      onClick={() => {
        audio.click();
        onClick();
      }}
      className={cn(
        "mt-12 text-left font-sans text-[14px] text-mute transition-colors duration-300",
        "hover:text-ink focus-visible:text-ink focus-visible:outline-none",
        className,
      )}
    >
      ← {label}
    </button>
  );
}
