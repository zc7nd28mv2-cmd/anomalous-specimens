"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { playCrashSound, playWarningSound, stopCrashAudio } from "@/lib/audio";
import {
  buildCrashScript,
  idleCrashView,
  type CrashEvent,
  type CrashView,
  type CrashWindowFault,
} from "@/lib/warning-crash";
import {
  buildWarningCluster,
  buildWarningTimeline,
  isCrashPhase,
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
let crashRun = 0;
let crashRaf = 0;
let viewNow: SeqView = { phase: "warning_01", burst: "off" };
let crashNow: CrashView = idleCrashView();
let clusterNow = buildWarningCluster();
const sounded = new Set<number>();
const listeners = new Set<(view: SeqView) => void>();
const crashListeners = new Set<(view: CrashView) => void>();
const timerIds: number[] = [];

function emit(next: SeqView) {
  viewNow = next;
  listeners.forEach((fn) => fn(next));
}

function emitCrash(next: CrashView) {
  crashNow = next;
  crashListeners.forEach((fn) => fn(next));
}

function clearTimers() {
  timerIds.forEach((id) => window.clearTimeout(id));
  timerIds.length = 0;
}

function clearCrash() {
  if (crashRaf) {
    window.cancelAnimationFrame(crashRaf);
    crashRaf = 0;
  }
  crashRun = 0;
  stopCrashAudio();
  crashNow = idleCrashView();
  crashListeners.forEach((fn) => fn(crashNow));
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

function applyCrashEvent(event: CrashEvent) {
  if (event.kind === "phase") {
    emitCrash({ ...crashNow, active: true, phase: event.phase });
    return;
  }
  if (event.kind === "flash") {
    emitCrash({ ...crashNow, flash: event.mode });
    return;
  }
  if (event.kind === "slices") {
    emitCrash({ ...crashNow, slices: event.slices });
    return;
  }
  if (event.kind === "band") {
    emitCrash({ ...crashNow, band: event.band });
    return;
  }
  if (event.kind === "noise") {
    emitCrash({ ...crashNow, noise: event.on });
    return;
  }
  if (event.kind === "shake") {
    emitCrash({ ...crashNow, shake: event.px });
    return;
  }
  if (event.kind === "window") {
    emitCrash({
      ...crashNow,
      windows: {
        ...crashNow.windows,
        [event.id]: { ...crashNow.windows[event.id], ...event.patch },
      },
    });
    return;
  }
  if (event.kind === "sound") {
    try {
      playCrashSound(event.name);
    } catch {
      return;
    }
  }
}

function startCrash(runId: number, onDone: () => void) {
  if (crashRun === runId) {
    return;
  }
  clearCrash();
  crashRun = runId;
  emitCrash({ ...idleCrashView(), active: true, phase: 1 });
  const events = buildCrashScript();
  const origin = performance.now();
  let cursor = 0;

  const tick = (now: number) => {
    if (crashRun !== runId) {
      return;
    }
    const elapsed = now - origin;
    while (cursor < events.length && events[cursor].at <= elapsed) {
      const event = events[cursor];
      cursor += 1;
      if (event.kind === "done") {
        clearCrash();
        emit({ phase: "complete", burst: "off" });
        onDone();
        return;
      }
      applyCrashEvent(event);
    }
    if (cursor < events.length) {
      crashRaf = window.requestAnimationFrame(tick);
    }
  };

  crashRaf = window.requestAnimationFrame(tick);
}

function startRun(runId: number, onDone: () => void) {
  clearTimers();
  clearCrash();
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
        if (activeRun !== runId) {
          return;
        }
        if (beat.phase === "complete") {
          clearCrash();
          emit({ phase: "complete", burst: "off" });
          onDone();
          return;
        }
        if (beat.phase === "crash") {
          startCrash(runId, onDone);
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
  fault,
  crashing,
}: {
  screen: WarningScreen;
  shift: WarningShift;
  fault: CrashWindowFault;
  crashing: boolean;
}) {
  return (
    <div
      className={cn(
        "fail-panel is-cluster is-in",
        `is-anchor-${screen.anchor}`,
        `is-size-${screen.size}`,
        crashing && "is-crash-live",
        fault.hide && "is-crash-gone",
        crashing && !fault.hide && "is-fault",
      )}
      style={{
        zIndex: shift.z,
        ["--shift-x" as string]: String(shift.x),
        ["--shift-y" as string]: String(shift.y),
        ["--fault-x" as string]: String(fault.dx),
        ["--fault-bright" as string]: String(fault.brightness),
        ["--fault-opacity" as string]: String(fault.opacity),
        ["--fault-clip" as string]: fault.clip ?? "none",
      }}
    >
      <div className="fail-panel-copy">
        <p className={cn("fail-head", fault.headTear && "is-head-tear")}>
          {fault.headTear ? (
            <>
              <span className="fail-head-slice is-top">{screen.kicker}</span>
              <span className="fail-head-slice is-bot">{screen.kicker}</span>
            </>
          ) : (
            screen.kicker
          )}
        </p>
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

function WarningWorld({
  screens,
  crash,
}: {
  screens: readonly WarningScreen[];
  crash: CrashView;
}) {
  return (
    <>
      {screens.map((screen) => (
        <WarningWindow
          key={screen.id}
          screen={screen}
          shift={clusterNow[screen.id]}
          fault={crash.windows[screen.id]}
          crashing={crash.active}
        />
      ))}
    </>
  );
}

function firstView(): SeqView {
  return { phase: "warning_01", burst: "off" };
}

export function WarningSequence({
  runId,
  onDone,
}: {
  runId: number;
  onDone: () => void;
}) {
  const [view, setView] = useState<SeqView>(() => firstView());
  const [crash, setCrash] = useState<CrashView>(crashNow);
  const [mounted, setMounted] = useState(false);
  const done = useRef(onDone);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    listeners.add(setView);
    crashListeners.add(setCrash);
    startRun(runId, () => done.current());
    return () => {
      listeners.delete(setView);
      crashListeners.delete(setCrash);
    };
  }, [runId]);

  if (view.phase === "complete" || !mounted) {
    return null;
  }

  const screens = visibleWarningScreens(view.phase);
  const crashing = isCrashPhase(view.phase) || crash.active;
  const liveSlices = crash.slices.filter((slice) => slice.x !== 0);

  return createPortal(
    <div
      className={cn("fail-root", crashing && "is-crash")}
      aria-live="assertive"
    >
      {!crashing ? <div className="fail-dim" /> : null}
      <div
        className={cn(
          "fail-signal",
          crashing && "is-live",
          crash.flash === "hot" && "is-hot",
          crash.flash === "void" && "is-void",
        )}
        style={{ ["--signal-shake" as string]: String(crash.shake) }}
      >
        <div className="fail-signal-plate" />
        <div className="fail-crash-world">
          <WarningWorld screens={screens} crash={crash} />
        </div>
        {liveSlices.map((slice, index) => (
          <div
            key={`${slice.y}-${index}`}
            className="fail-crash-world is-ghost"
            style={{
              clipPath: `inset(${slice.y}% 0 ${Math.max(0, 100 - slice.y - slice.h)}% 0)`,
              transform: `translateX(${slice.x}px)`,
            }}
          >
            <WarningWorld screens={screens} crash={crash} />
          </div>
        ))}
        {crash.noise ? <div className="fail-crash-noise" /> : null}
        {crash.band ? (
          <div
            className="fail-crash-band"
            style={{
              top: `${crash.band.y}%`,
              height: `${crash.band.h}%`,
              transform: `translateX(${crash.band.x}px)`,
            }}
          />
        ) : null}
      </div>
      {view.burst !== "off" && !crashing ? (
        <div className={cn("fail-burst", `is-${view.burst}`)} />
      ) : null}
    </div>,
    document.body,
  );
}

export type { WarningScreen };
