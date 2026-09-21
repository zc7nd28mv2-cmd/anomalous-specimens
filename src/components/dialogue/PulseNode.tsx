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
      className="relative flex h-8 w-8 items-center justify-center"
      aria-label={hint}
    >
      <span className="signal-dot" />
    </button>
  );
}
