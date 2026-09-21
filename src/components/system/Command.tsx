"use client";

import { useAudio } from "@/context/AudioContext";
import { cn } from "@/lib/cn";

export function Command({
  children,
  onClick,
  disabled,
  className,
  sound = "click",
}: {
  children: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  sound?: "click" | "denied";
}) {
  const audio = useAudio();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (sound === "denied") {
          audio.denied();
        } else {
          audio.click();
        }
        onClick?.();
      }}
      className={cn(
        "mt-12 text-left font-sans text-[13px] tracking-[0.08em] text-mute transition-colors duration-300",
        "hover:text-green focus-visible:text-green focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-30",
        className,
      )}
    >
      [ {children} ]
    </button>
  );
}
