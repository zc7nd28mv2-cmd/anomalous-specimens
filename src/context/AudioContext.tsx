"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  isAudioEnabled,
  playAlert,
  playClick,
  playMessage,
  playTick,
  setAudioEnabled,
  unlockAudio,
} from "@/lib/audio";

type AudioApi = {
  enabled: boolean;
  toggle: () => void;
  unlock: () => void;
  click: () => void;
  tick: () => void;
  message: () => void;
  alert: () => void;
};

const AudioContext = createContext<AudioApi | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(isAudioEnabled);

  const unlock = useCallback(() => {
    unlockAudio();
  }, []);

  const toggle = useCallback(() => {
    unlockAudio();
    const next = !isAudioEnabled();
    setAudioEnabled(next);
    setEnabled(next);
  }, []);

  const value = useMemo<AudioApi>(
    () => ({
      enabled,
      toggle,
      unlock,
      click: () => {
        unlockAudio();
        playClick();
      },
      tick: playTick,
      message: playMessage,
      alert: playAlert,
    }),
    [enabled, toggle, unlock],
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const value = useContext(AudioContext);
  if (!value) {
    throw new Error("useAudio must be used inside AudioProvider");
  }
  return value;
}
