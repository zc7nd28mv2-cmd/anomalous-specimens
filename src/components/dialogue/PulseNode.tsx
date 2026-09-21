"use client";

import { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import { cn } from "@/lib/cn";

export function PulseNode({
  onOpen,
  hint = "读取现场记录",
}: {
  onOpen: () => void;
  hint?: string;
}) {
  const audio = useAudio();
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => {
        audio.click();
        onOpen();
      }}
      className="group relative mx-auto flex h-20 w-20 items-center justify-center"
      aria-label={hint}
    >
      <span className="signal-ring" />
      <span className="signal-dot" />
      <span
        className={cn(
          "pointer-events-none absolute top-full mt-3 font-sans text-[12px] text-green-dim transition-opacity",
          hover ? "opacity-100" : "opacity-0",
        )}
      >
        {hint}
      </span>
    </button>
  );
}
