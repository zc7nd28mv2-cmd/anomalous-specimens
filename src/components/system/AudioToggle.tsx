"use client";

import { useAudio } from "@/context/AudioContext";

export function AudioToggle() {
  const audio = useAudio();

  return (
    <button
      type="button"
      onClick={audio.toggle}
      className="fixed bottom-4 right-5 z-30 font-mono text-[10px] tracking-[0.16em] text-sys hover:text-mute"
    >
      声音 / {audio.enabled ? "ON" : "OFF"}
    </button>
  );
}
