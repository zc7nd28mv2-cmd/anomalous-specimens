"use client";

import { useEffect, useRef, useState } from "react";
import { useScaledMs } from "@/hooks/useTiming";

export function useReveal(delays: readonly number[]) {
  const [count, setCount] = useState(0);
  const scale = useScaledMs();

  useEffect(() => {
    if (count >= delays.length) {
      return;
    }

    const id = window.setTimeout(() => {
      setCount((value) => value + 1);
    }, scale(delays[count] ?? 0));

    return () => window.clearTimeout(id);
  }, [count, delays, scale]);

  return count;
}

export function useAfter(
  ms: number,
  callback: () => void,
  enabled = true,
) {
  const scale = useScaledMs();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const id = window.setTimeout(() => {
      callbackRef.current();
    }, scale(ms));

    return () => window.clearTimeout(id);
  }, [enabled, ms, scale]);
}
