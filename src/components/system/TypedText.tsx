"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion, useScaledMs } from "@/hooks/useTiming";
import { Cursor } from "@/components/system/Cursor";
import { cn } from "@/lib/cn";

export function TypedText({
  text,
  speed = 28,
  className,
  cursor = true,
  onDone,
}: {
  text: string;
  speed?: number;
  className?: string;
  cursor?: boolean;
  onDone?: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const scale = useScaledMs();
  const [index, setIndex] = useState(reduced ? text.length : 0);

  useEffect(() => {
    if (index >= text.length) {
      onDone?.();
      return;
    }

    const id = window.setTimeout(() => {
      setIndex((value) => value + 1);
    }, scale(speed));

    return () => window.clearTimeout(id);
  }, [index, onDone, scale, speed, text.length]);

  return (
    <span className={cn("whitespace-pre-wrap", className)}>
      {text.slice(0, index)}
      {cursor && index < text.length ? <Cursor /> : null}
    </span>
  );
}
