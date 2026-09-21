"use client";

import { useAudio } from "@/context/AudioContext";

export function PulseNode({
  onOpen,
  hint = "读取现场记录",
}: {
  onOpen: () => void;
  hint?: string;
}) {
  const audio = useAudio();

  return (
    <button
      type="button"
      onClick={() => {
        audio.click();
        onOpen();
      }}
      className="relative mx-auto flex h-20 w-28 items-center justify-center"
      aria-label={hint}
    >
      <span className="signal-ring" />
      <span className="signal-dot" />
      <span className="signal-hint">{hint}</span>
    </button>
  );
}
