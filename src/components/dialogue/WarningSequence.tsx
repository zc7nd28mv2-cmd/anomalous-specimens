"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildWarningTimeline,
  isCollapseCut,
  isCollapseFlash,
  visibleWarningScreens,
  type WarningBurst,
  type WarningScreen,
  type WarningSequenceState,
} from "@/lib/warning-sequence";
import { cn } from "@/lib/cn";

type SeqView = {
  phase: WarningSequenceState;
  burst: WarningBurst;
};

let activeRun = 0;
let viewNow: SeqView = { phase: "warning_01", burst: "off" };
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

function startRun(runId: number, onDone: () => void) {
  if (activeRun === runId) {
    return;
  }
  clearTimers();
  activeRun = runId;
  const beats = buildWarningTimeline();
  const first = beats[0] ?? { at: 0, phase: "warning_01" as const, burst: "off" as const };
  emit({ phase: first.phase, burst: first.burst ?? "off" });
  beats.slice(1).forEach((beat) => {
    timerIds.push(
      window.setTimeout(() => {
        if (beat.phase === "complete") {
          emit({ phase: "complete", burst: "off" });
          onDone();
          return;
        }
        emit({ phase: beat.phase, burst: beat.burst ?? "off" });
      }, beat.at),
    );
  });
}

function WarningWindow({ screen }: { screen: WarningScreen }) {
  return (
    <div
      className={cn(
        "fail-panel is-in",
        `is-anchor-${screen.anchor}`,
        `is-size-${screen.size}`,
      )}
    >
      <div className="fail-panel-inner">
        <p className="font-mono text-[12px] tracking-[0.14em]">{screen.kicker}</p>
        {screen.title ? (
          <p className="mt-5 font-mono text-[14px] leading-6 tracking-[0.06em]">
            {screen.title}
          </p>
        ) : null}
        {screen.lines.length > 0 ? (
          <div className="mt-2 font-mono text-[14px] leading-6 tracking-[0.06em]">
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
        <WarningWindow key={screen.id} screen={screen} />
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
