"use client";

import { useEffect, useState } from "react";
import { useAfter, useReveal } from "@/hooks/useReveal";
import { useScaledMs } from "@/hooks/useTiming";
import { Cursor } from "@/components/system/Cursor";
import { Command } from "@/components/system/Command";
import { Stage, SysLine } from "@/components/system/Stage";
import { ACCESS, SYSTEM } from "@/lib/content";

const BOOT_DELAYS = [900, 800, 700, 900, 500, 420, 420, 500, 1400, 500, 700, 800] as const;

const BAR_STEPS = [
  { pct: 18, wait: 180 },
  { pct: 31, wait: 200 },
  { pct: 47, wait: 220 },
  { pct: 58, wait: 260 },
  { pct: 73, wait: 300 },
  { pct: 82, wait: 520 },
  { pct: 86, wait: 380 },
  { pct: 96, wait: 240 },
  { pct: 100, wait: 200 },
] as const;

type Gate = "boot" | "load" | "granted";

export function BootScene({ onComplete }: { onComplete: () => void }) {
  const [gate, setGate] = useState<Gate>("boot");

  return (
    <Stage className="overflow-hidden">
      {gate === "boot" ? <BootLog onEnter={() => setGate("load")} /> : null}
      {gate === "load" ? <SampleLoad onReady={() => setGate("granted")} /> : null}
      {gate === "granted" ? <AccessGranted onDone={onComplete} /> : null}
    </Stage>
  );
}

function BootLog({ onEnter }: { onEnter: () => void }) {
  const step = useReveal(BOOT_DELAYS);

  return (
    <>
      {step >= 1 ? (
        <p className="title-system text-ink">{SYSTEM.titleZh}</p>
      ) : null}

      {step >= 2 ? (
        <p className="phosphor micro-flicker mt-3 font-mono text-[11px] tracking-[0.26em] text-sys">
          {SYSTEM.title}
        </p>
      ) : null}

      {step >= 3 ? (
        <p className="mt-8 font-mono text-[13px] text-mute">
          {"> "}
          {step < 4 ? <Cursor /> : null}
        </p>
      ) : null}

      <div className="mt-10 space-y-1">
        {step >= 4 ? <SysLine>{SYSTEM.initializing}</SysLine> : null}
        {step >= 5 ? <SysLine>{SYSTEM.memoryOk}</SysLine> : null}
        {step >= 6 ? <SysLine>{SYSTEM.neuralOk}</SysLine> : null}
        {step >= 7 ? <SysLine>{SYSTEM.specimenOk}</SysLine> : null}
        {step >= 8 ? <SysLine>{SYSTEM.integrity47}</SysLine> : null}
      </div>

      {step >= 10 ? (
        <p className="mt-12 font-mono text-[12px] tracking-[0.28em] text-danger">
          {SYSTEM.warning}
        </p>
      ) : null}

      {step >= 11 ? (
        <p className="mt-3 font-mono text-[12px] tracking-[0.08em] text-danger">
          {SYSTEM.corrupted}
        </p>
      ) : null}

      {step >= 12 ? (
        <p className="mt-3 font-mono text-[12px] tracking-[0.08em] text-mute">
          {SYSTEM.detected}
        </p>
      ) : null}

      {step >= 12 ? (
        <Command className="mt-10" onClick={onEnter}>
          {SYSTEM.enter}
        </Command>
      ) : null}
    </>
  );
}

function SampleLoad({ onReady }: { onReady: () => void }) {
  const scale = useScaledMs();
  const [pct, setPct] = useState(0);
  const done = pct >= 100;

  useEffect(() => {
    let index = 0;
    let id = 0;
    let cancelled = false;
    const run = () => {
      const step = BAR_STEPS[index];
      if (!step || cancelled) {
        return;
      }
      id = window.setTimeout(() => {
        if (cancelled) {
          return;
        }
        setPct(step.pct);
        index += 1;
        run();
      }, scale(step.wait));
    };
    run();
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [scale]);

  useAfter(360, onReady, done);

  return (
    <>
      <SysLine>{ACCESS.accessing}</SysLine>
      <SysLine className="mt-2">{ACCESS.verifying}</SysLine>
      <SysLine className="mt-2">{ACCESS.integrity}</SysLine>
      <div className="boot-bar" aria-hidden>
        <div className="boot-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </>
  );
}

function AccessGranted({ onDone }: { onDone: () => void }) {
  useAfter(2780, onDone, true);

  return (
    <>
      <SysLine>{ACCESS.accessing}</SysLine>
      <SysLine className="mt-2">{ACCESS.verifying}</SysLine>
      <SysLine className="mt-2">{ACCESS.integrity}</SysLine>
      <div className="boot-bar" aria-hidden>
        <div className="boot-bar-fill" style={{ width: "100%" }} />
      </div>
      <p className="grant-breathe mt-10 font-mono text-[13px] tracking-[0.12em] text-ink">
        {ACCESS.granted}
      </p>
    </>
  );
}
