"use client";

import { useEffect, useRef, useState } from "react";
import { playWarningSound } from "@/lib/audio";
import {
  buildWarningCluster,
  buildWarningTimeline,
  isCollapseCut,
  isCollapseFlash,
  visibleWarningScreens,
  warningLevel,
  type WarningBurst,
  type WarningScreen,
  type WarningSequenceState,
  type WarningShift,
} from "@/lib/warning-sequence";
import { cn } from "@/lib/cn";

type SeqView = {
  phase: WarningSequenceState;
  burst: WarningBurst;
};

let activeRun = 0;
let viewNow: SeqView = { phase: "warning_01", burst: "off" };
let clusterNow = buildWarningCluster();
const sounded = new Set<number>();
const listeners = new Set<(view: SeqView) => void>();
const timerIds: number[] = [];

function emit(next: SeqView) {
  viewNow = next;
  listeners.forEach((fn) => fn(next));
}

function clearTimers() {
  timerIds.forEach((id) => window.clearTimeout(id));
  timerIds.length = 0;
}

function soundOnce(phase: WarningSequenceState) {
  const level = warningLevel(phase);
  if (level < 1 || sounded.has(level)) {
    return;
  }
  sounded.add(level);
  try {
    playWarningSound(level);
  } catch {
    return;
  }
}

function startRun(runId: number, onDone: () => void) {
  if (activeRun === runId) {
    return;
  }
  clearTimers();
  activeRun = runId;
  sounded.clear();
  clusterNow = buildWarningCluster();
  const beats = buildWarningTimeline();
  const first = beats[0] ?? {
    at: 0,
    phase: "warning_01" as const,
    burst: "off" as const,
  };
  emit({ phase: first.phase, burst: first.burst ?? "off" });
  soundOnce(first.phase);
  beats.slice(1).forEach((beat) => {
    timerIds.push(
      window.setTimeout(() => {
        if (beat.phase === "complete") {
          emit({ phase: "complete", burst: "off" });
          onDone();
          return;
        }
        soundOnce(beat.phase);
        emit({ phase: beat.phase, burst: beat.burst ?? "off" });
      }, beat.at),
    );
  });
}

function WarningWindow({
  screen,
  shift,
}: {
  screen: WarningScreen;
  shift: WarningShift;
}) {
  return (
    <div
      className={cn(
        "fail-panel is-cluster is-in",
        `is-anchor-${screen.anchor}`,
        `is-size-${screen.size}`,
      )}
      style={{
        zIndex: shift.z,
        ["--shift-x" as string]: String(shift.x),
        ["--shift-y" as string]: String(shift.y),
      }}
    >
      <div className="fail-panel-copy">
        <p className="fail-head">{screen.kicker}</p>
        {screen.title || screen.lines.length > 0 || screen.foot ? (
          <div className="fail-body">
            {screen.title ? <p>{screen.title}</p> : null}
            {screen.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            {screen.foot ? <p className="fail-foot">{screen.foot}</p> : null}
          </div>
        ) : null}
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
  const [view, setView] = useState<SeqView>(viewNow);
  const done = useRef(onDone);

  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    listeners.add(setView);
    startRun(runId, () => done.current());
    return () => {
      listeners.delete(setView);
    };
  }, [runId]);

  if (view.phase === "complete") {
    return null;
  }

  const screens = visibleWarningScreens(view.phase);
  const collapsing = isCollapseFlash(view.phase) || isCollapseCut(view.phase);

  return (
    <div
      className={cn(
        "fail-root",
        isCollapseFlash(view.phase) && "is-flash",
        isCollapseCut(view.phase) && "is-cut",
      )}
      aria-live="assertive"
    >
      {!collapsing ? <div className="fail-dim" /> : null}
      {screens.map((screen) => (
        <WarningWindow
          key={screen.id}
          screen={screen}
          shift={clusterNow[screen.id]}
        />
      ))}
      {view.burst !== "off" ? (
        <div className={cn("fail-burst", `is-${view.burst}`)} />
      ) : null}
      {isCollapseFlash(view.phase) ? (
        <div
          className={cn(
            "intrude-flash",
            view.phase === "flash_a" && "is-brief",
            view.phase === "flash_b" && "is-hard",
            view.phase === "flash_c" && "is-hard",
          )}
        />
      ) : null}
    </div>
  );
}

export type { WarningScreen };
