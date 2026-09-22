"use client";

import { useEffect, useRef, useState } from "react";
import { Command } from "@/components/system/Command";
import { Rule } from "@/components/system/Rule";
import { ACCESS, SPECIMENS, SYSTEM, integrityLine } from "@/lib/content";
import { useAudio } from "@/context/AudioContext";
import { useArchive } from "@/context/ArchiveContext";
import { useScaledMs } from "@/hooks/useTiming";

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
  const animating =
    read.kind === "accessing" ||
    read.kind === "verifying" ||
    read.kind === "integrity" ||
    (read.kind === "granted" && !alreadyApproved);
  const finish = useRef(onComplete);

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
      later(() => finish.current(), 520);
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
          <p className="aux-en title-flicker mt-3">{SYSTEM.title}</p>
          <p className="mt-8 font-sans text-[13px] text-mute">{SYSTEM.index}</p>
        </div>

        <div className="mt-14 space-y-12">
          {SPECIMENS.map((specimen) => (
            <section key={specimen.id} className="rise">
              <Rule className="mb-7" />
              <p className="sys-meta">{specimen.id}</p>
              <div>
                <h2
                  className={
                    specimen.locked
                      ? "title-product mt-4 text-mute"
                      : "title-product mt-4 text-ink"
                  }
                >
                  {specimen.title}
                </h2>
                <p className="aux-en mt-2">{specimen.name}</p>
              </div>
              {specimen.kind ? (
                <p className="aux-en mt-5">MEDICAL NEURAL PROGRAM</p>
              ) : null}
              <p className="aux-en mt-2">
                {specimen.locked ? "RESTRICTED" : "RECOVERED 91%"}
              </p>
              <p className="mt-2 font-sans text-[13px] text-mute">
                状态 / {specimen.status}
              </p>

              {specimen.locked ? (
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
                        finish.current();
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
              )}
            </section>
          ))}
        </div>

        <Rule className="mt-12" />
        <p className="mt-5 sys-meta">{SYSTEM.count}</p>
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
