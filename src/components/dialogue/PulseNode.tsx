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
  const [burst, setBurst] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => {
        audio.click();
        setBurst(true);
        window.setTimeout(onOpen, 280);
      }}
      className="group relative mx-auto flex h-24 w-24 items-center justify-center"
      aria-label={hint}
    >
      <span className={cn("signal-ring", burst && "is-burst")} />
      <span className="signal-dot" />
      <span
        className={cn(
          "pointer-events-none absolute top-full mt-4 font-sans text-[12px] text-green-dim transition-opacity",
          hover ? "opacity-100" : "opacity-0",
        )}
      >
        {hint}
      </span>
    </button>
  );
}
