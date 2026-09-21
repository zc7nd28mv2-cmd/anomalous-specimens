"use client";

import { useEffect, useRef, useState } from "react";
import { useScaledMs } from "@/hooks/useTiming";
import {
  WARNING_SCREENS,
  WARNING_SEQUENCE_STEPS,
  type WarningAnchor,
  type WarningScreen,
  type WarningSequenceState,
} from "@/lib/warning-sequence";
import { cn } from "@/lib/cn";

const WINDOW_ORDER = [
  "warning_01",
  "warning_02",
  "warning_03",
  "warning_04",
  "warning_05",
] as const;

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

function visibleScreens(phase: WarningSequenceState) {
  if (
    phase === "idle" ||
    phase === "flash" ||
    phase === "black" ||
    phase === "complete"
  ) {
    return [];
  }
  const current = phase === "out" ? "warning_05" : phase;
  const end = WINDOW_ORDER.indexOf(current);
  if (end < 0) {
    return [];
  }
  return WARNING_SCREENS.filter((_, index) => index <= end);
}

function WarningWindow({
  screen,
  leaving,
}: {
  screen: WarningScreen;
  leaving: boolean;
}) {
  return (
    <div
      className={cn(
        "fail-panel",
        leaving ? "is-out" : "is-in",
        `is-anchor-${screen.anchor}`,
      )}
    >
      <div className="fail-panel-inner">
        <p className="font-mono text-[12px] tracking-[0.14em]">{screen.kicker}</p>
        <div className="mt-6 font-mono text-[14px] leading-6 tracking-[0.06em]">
          <p>{screen.title}</p>
          {screen.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <p className="mt-8 font-mono text-[11px] tracking-[0.1em]">{screen.foot}</p>
      </div>
    </div>
  );
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

  if (phase === "complete") {
    return null;
  }

  if (phase === "flash") {
    return (
      <div className="fail-root is-flash" aria-live="assertive">
        <div className="intrude-flash" />
      </div>
    );
  }

  if (phase === "black") {
    return <div className="fail-root is-cut" aria-live="assertive" />;
  }

  const screens = visibleScreens(phase);
  const leaving = phase === "out";

  return (
    <div className="fail-root" aria-live="assertive">
      <div className="fail-dim" />
      {screens.map((screen) => (
        <WarningWindow key={screen.id} screen={screen} leaving={leaving} />
      ))}
    </div>
  );
}

export type { WarningAnchor };
