"use client";

import { useEffect, useRef, useState } from "react";
import { useScaledMs } from "@/hooks/useTiming";
import { ANALYSIS } from "@/lib/dialogue";
import { cn } from "@/lib/cn";

type Phase =
  | "wait"
  | "in"
  | "analyzing"
  | "input"
  | "match"
  | "complete"
  | "result"
  | "out";

export function AnalysisOverlay({
  result,
  onDone,
}: {
  result: string[];
  onDone: () => void;
}) {
  const scale = useScaledMs();
  const [phase, setPhase] = useState<Phase>("wait");
  const done = useRef(onDone);

  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const steps: Array<[Phase, number]> = [
      ["in", 150],
      ["analyzing", 600],
      ["input", 1100],
      ["match", 1600],
      ["complete", 2200],
      ["result", 2500],
      ["out", 4100],
    ];
    const timers = steps.map(([next, at]) =>
      window.setTimeout(() => setPhase(next), scale(at)),
    );
    const end = window.setTimeout(() => done.current(), scale(4900));
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(end);
    };
  }, [scale]);

  if (phase === "wait") {
    return null;
  }

  return (
    <div className="scan-root" aria-live="polite">
      <div className={cn("scan-panel", phase === "out" && "is-out")}>
        <p className="font-mono text-[11px] tracking-[0.14em] text-green">
          {ANALYSIS.title}
        </p>

        {phase !== "in" ? (
          <p className="mt-4 font-mono text-[12px] tracking-[0.08em] text-green-dim">
            {phase === "analyzing" ? <PulseWord word="ANALYZING" /> : "ANALYZING..."}
          </p>
        ) : null}

        {phase === "input" ||
        phase === "match" ||
        phase === "complete" ||
        phase === "result" ||
        phase === "out" ? (
          <div className="mt-4 font-mono text-[12px] leading-5 tracking-[0.06em] text-green-dim">
            <p>SENSORY INPUT</p>
            <p>RECOGNIZED</p>
          </div>
        ) : null}

        {phase === "match" ||
        phase === "complete" ||
        phase === "result" ||
        phase === "out" ? (
          <div className="mt-4 font-mono text-[12px] leading-5 tracking-[0.06em] text-green-dim">
            <p>MATERIAL SIGNATURE</p>
            <p>{phase === "match" ? <PulseWord word="MATCHING" /> : "MATCHING..."}</p>
          </div>
        ) : null}

        {phase === "complete" || phase === "result" || phase === "out" ? (
          <p className="mt-4 font-mono text-[12px] tracking-[0.08em] text-green">
            {ANALYSIS.complete}
          </p>
        ) : null}

        {phase === "result" || phase === "out" ? (
          <div className="mt-4 space-y-1">
            {result.map((line) => (
              <p
                key={line}
                className={
                  line === "WARNING"
                    ? "font-mono text-[14px] text-danger"
                    : "font-mono text-[14px] leading-6 text-ink"
                }
              >
                {line}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PulseWord({ word }: { word: string }) {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCount((value) => (value % 3) + 1);
    }, 420);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      {word}
      {".".repeat(count)}
    </>
  );
}
