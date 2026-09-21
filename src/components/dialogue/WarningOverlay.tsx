"use client";

import { useEffect, useRef, useState } from "react";
import { useScaledMs } from "@/hooks/useTiming";
import { cn } from "@/lib/cn";

type Phase = "flicker" | "tear" | "black" | "recover" | "in" | "hold" | "out";

export function WarningOverlay({ onDone }: { onDone: () => void }) {
  const scale = useScaledMs();
  const [phase, setPhase] = useState<Phase>("flicker");
  const done = useRef(onDone);

  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const steps: Array<[Phase, number]> = [
      ["tear", 80],
      ["black", 140],
      ["recover", 190],
      ["in", 350],
      ["hold", 800],
      ["out", 2600],
    ];
    const timers = steps.map(([next, at]) =>
      window.setTimeout(() => setPhase(next), scale(at)),
    );
    const end = window.setTimeout(() => done.current(), scale(3550));
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(end);
    };
  }, [scale]);

  const glitch =
    phase === "flicker" ||
    phase === "tear" ||
    phase === "black" ||
    phase === "recover";
  const panel = phase === "in" || phase === "hold" || phase === "out";

  return (
    <div className="fail-root" aria-live="assertive">
      {glitch ? (
        <div
          className={cn(
            "fail-glitch",
            phase === "flicker" && "is-flicker",
            phase === "tear" && "is-tear",
            phase === "black" && "is-black",
            phase === "recover" && "is-scan",
          )}
        />
      ) : null}

      {panel ? <div className="fail-dim" /> : null}

      {panel ? (
        <div className={cn("fail-panel", phase === "out" ? "is-out" : "is-in")}>
          <div className="fail-panel-inner">
            <p className="font-mono text-[12px] tracking-[0.14em]">⚠ WARNING</p>
            <div className="mt-6 font-mono text-[14px] leading-6 tracking-[0.06em]">
              <p>HOST VITAL SIGNS</p>
              <p>ARE DECLINING</p>
            </div>
            <p className="mt-8 font-mono text-[11px] tracking-[0.1em]">
              SYSTEM STATUS: CRITICAL
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
