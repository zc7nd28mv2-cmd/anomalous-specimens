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
  if (level < 2 || sounded.has(level)) {
    return;
  }
  sounded.add(level);
  playWarningSound(level as 2 | 3 | 4 | 5);
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
        <p className="font-mono text-[12px] tracking-[0.14em]">{screen.kicker}</p>
        {screen.title ? (
          <p className="mt-5 font-mono text-[14px] leading-7 tracking-[0.06em]">
            {screen.title}
          </p>
        ) : null}
        {screen.lines.length > 0 ? (
          <div className="mt-2 font-mono text-[14px] leading-7 tracking-[0.06em]">
            {screen.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : null}
        {screen.foot ? (
          <p className="mt-7 font-mono text-[11px] tracking-[0.1em]">{screen.foot}</p>
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
          shift={clusterNow[screen.anchor]}
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
