"use client";

import { useEffect, useRef, useState } from "react";
import { Command } from "@/components/system/Command";
import { Rule } from "@/components/system/Rule";
import { SpecimenLock, SpecimenRow } from "@/components/archive/SpecimenRow";
import { ACCESS, SPECIMENS, SYSTEM, integrityLine } from "@/lib/content";
import { useAudio } from "@/context/AudioContext";
import { useArchive } from "@/context/ArchiveContext";
import { useScaledMs } from "@/hooks/useTiming";
import { UnstableEnglishTitle } from "@/components/system/useTitleFault";

type ReadPhase =
  | { kind: "off" }
  | { kind: "accessing" }
  | { kind: "verifying" }
  | { kind: "integrity"; pct: number }
  | { kind: "granted" };

const INTEGRITY = [
  0, 7, 13, 19, 27, 34, 41, 48, 53, 61, 68, 73, 77, 80, 81, 82,
] as const;

const INTEGRITY_WAIT = [
  40, 45, 35, 50, 42, 55, 45, 60, 48, 55, 50, 60, 65, 70, 75,
] as const;

function irregular(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function IndexScene({ onComplete }: { onComplete: () => void }) {
  const { sample001AccessApproved, approveSample001 } = useArchive();
  const [denied, setDenied] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [read, setRead] = useState<ReadPhase>(() =>
    sample001AccessApproved ? { kind: "granted" } : { kind: "off" },
  );
  const audio = useAudio();
  const scale = useScaledMs();
  const [alreadyApproved] = useState(sample001AccessApproved);
  const [cutting, setCutting] = useState(false);
  const animating =
    cutting ||
    read.kind === "accessing" ||
    read.kind === "verifying" ||
    read.kind === "integrity" ||
    (read.kind === "granted" && !alreadyApproved);
  const finish = useRef(onComplete);

  function leaveToArchive() {
    if (cutting) {
      return;
    }
    setCutting(true);
    finish.current();
  }

  useEffect(() => {
    finish.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (read.kind === "off") {
      return;
    }
    let cancelled = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) {
          fn();
        }
      }, scale(ms));
      timers.push(id);
    };

    if (read.kind === "accessing") {
      later(() => setRead({ kind: "verifying" }), irregular(400, 600));
    } else if (read.kind === "verifying") {
      later(() => setRead({ kind: "integrity", pct: 0 }), irregular(500, 800));
    } else if (read.kind === "integrity") {
      const step = INTEGRITY.indexOf(read.pct as (typeof INTEGRITY)[number]);
      if (step >= 0 && step < INTEGRITY.length - 1) {
        later(
          () => setRead({ kind: "integrity", pct: INTEGRITY[step + 1] }),
          INTEGRITY_WAIT[step] ?? 240,
        );
      } else {
        later(() => setRead({ kind: "granted" }), 180);
      }
    } else if (read.kind === "granted") {
      if (alreadyApproved) {
        return;
      }
      approveSample001();
      later(() => leaveToArchive(), 60);
    }

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [alreadyApproved, approveSample001, read, scale]);

  return (
    <div className="relative min-h-dvh bg-bg px-5 py-16 sm:px-10 sm:py-20 md:px-16">
      <div className="story-content mx-auto md:ml-[6vw]">
        <div className="rise">
          <h1 className="title-system text-ink">{SYSTEM.titleZh}</h1>
          <UnstableEnglishTitle className="aux-en mt-3">
            {SYSTEM.title}
          </UnstableEnglishTitle>
          <p className="mt-8 font-sans text-[13px] text-mute">{SYSTEM.index}</p>
        </div>

        <div className="mt-14 space-y-12">
          {SPECIMENS.map((specimen) => (
            <SpecimenRow
              key={specimen.id}
              specimen={specimen}
              action={
                specimen.state === "available" ? (
                  <div>
                    <button
                      type="button"
                      disabled={animating}
                      onClick={() => {
                        if (animating) {
                          return;
                        }
                        audio.click();
                        if (sample001AccessApproved || alreadyApproved) {
                          leaveToArchive();
                          return;
                        }
                        setRead({ kind: "accessing" });
                      }}
                      className="read-tag"
                    >
                      读取档案
                    </button>
                    <ReadLine phase={read} />
                  </div>
                ) : specimen.state === "restricted" ? (
                  <div>
                    <Command
                      className={flash === specimen.id ? "mt-5 is-lock-deny" : "mt-5"}
                      sound="denied"
                      onClick={() => {
                        setDenied(specimen.id);
                        setFlash(specimen.id);
                        window.setTimeout(() => setFlash(null), 220);
                      }}
                    >
                      锁定
                    </Command>
                    {denied === specimen.id ? (
                      <p className="fade mt-3 font-sans text-[13px] text-danger">
                        访问被拒绝
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <SpecimenLock />
                )
              }
            />
          ))}
        </div>

        <Rule className="mt-12" />
        <p className="mt-5 sys-meta">
          {SPECIMENS.length} / {SPECIMENS.length} 样本
        </p>
      </div>
    </div>
  );
}

function ReadLine({ phase }: { phase: ReadPhase }) {
  if (phase.kind === "off") {
    return null;
  }
  const text =
    phase.kind === "accessing"
      ? ACCESS.accessing
      : phase.kind === "verifying"
        ? ACCESS.verifying
        : phase.kind === "granted"
          ? ACCESS.granted
          : integrityLine(phase.pct);
  return (
    <div className="read-status">
      <p
        className={
          phase.kind === "granted"
            ? "font-sans text-[13px] text-danger"
            : "font-sans text-[13px] text-green-dim"
        }
      >
        {text}
      </p>
    </div>
  );
}
