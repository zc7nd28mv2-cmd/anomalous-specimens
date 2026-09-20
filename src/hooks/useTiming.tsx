"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const TimingContext = createContext(1);

function readRate() {
  const raw = Number(new URLSearchParams(window.location.search).get("rate"));
  return Number.isFinite(raw) && raw > 0 ? raw : 1;
}

export function TimingProvider({ children }: { children: ReactNode }) {
  const rate = useSyncExternalStore(() => () => undefined, readRate, () => 1);

  return (
    <TimingContext.Provider value={rate}>{children}</TimingContext.Provider>
  );
}

export function useRate() {
  return useContext(TimingContext);
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return reduced;
}

export function useScaledMs() {
  const rate = useRate();
  const reduced = usePrefersReducedMotion();
  return useMemo(
    () => (ms: number) => (reduced ? Math.min(ms, 80) : ms / rate),
    [rate, reduced],
  );
}
