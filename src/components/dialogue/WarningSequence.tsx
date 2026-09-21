"use client";

import { useEffect, useRef, useState } from "react";
import { useScaledMs } from "@/hooks/useTiming";
import {
  WARNING_SCREENS,
  WARNING_SEQUENCE_STEPS,
  type WarningSequenceState,
} from "@/lib/warning-sequence";
import { cn } from "@/lib/cn";

let activeRun = 0;
let phaseNow: WarningSequenceState = "warning_01";
const listeners = new Set<(phase: WarningSequenceState) => void>();
const timerIds: number[] = [];

function emit(next: WarningSequenceState) {
  phaseNow = next;
  listeners.forEach((fn) => fn(next));
}

function clearTimers() {
  timerIds.forEach((id) => window.clearTimeout(id));
  timerIds.length = 0;
}

function startRun(
  runId: number,
  scale: (ms: number) => number,
  onDone: () => void,
) {
  if (activeRun === runId) {
    return;
  }
  clearTimers();
  activeRun = runId;
  emit("warning_01");
  WARNING_SEQUENCE_STEPS.forEach(([next, at]) => {
    timerIds.push(
      window.setTimeout(() => {
        if (next === "complete") {
          emit("complete");
          onDone();
          return;
        }
        emit(next);
      }, scale(at)),
    );
  });
}

export function WarningSequence({
  runId,
  onDone,
}: {
  runId: number;
  onDone: () => void;
}) {
  const scale = useScaledMs();
  const [phase, setPhase] = useState<WarningSequenceState>(phaseNow);
  const done = useRef(onDone);

  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    startRun(runId, scale, () => done.current());
    listeners.add(setPhase);
    setPhase(phaseNow);
    return () => {
      listeners.delete(setPhase);
    };
  }, [runId, scale]);

  const screen = WARNING_SCREENS.find((item) => item.id === phase);
  const rank = Number(String(phase).slice(-1)) || 1;

  if (phase === "complete") {
    return null;
  }

  if (phase === "flash") {
    return (
      <div className="intrude-root is-flash" aria-live="assertive">
        <div className="intrude-flash" />
      </div>
    );
  }

  if (phase === "black") {
    return <div className="intrude-root is-cut" aria-live="assertive" />;
  }

  if (!screen) {
    return null;
  }

  return (
    <div className={cn("intrude-root", `is-${rank}`)} aria-live="assertive">
      <div className={cn("intrude-frame", `is-${rank}`)}>
        <p className="intrude-kicker">{screen.kicker}</p>
        <p className={cn("intrude-title", screen.key && "is-key")}>{screen.title}</p>
        <div className="intrude-body">
          {screen.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <p className="intrude-foot">{screen.foot}</p>
      </div>
    </div>
  );
}
