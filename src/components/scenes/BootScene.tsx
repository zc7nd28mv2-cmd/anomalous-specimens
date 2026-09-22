"use client";

import { useEffect, useRef, useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import { usePrefersReducedMotion, useScaledMs } from "@/hooks/useTiming";
import { useAudio } from "@/context/AudioContext";
import { Cursor } from "@/components/system/Cursor";
import { UnstableEnglishTitle } from "@/components/system/useTitleFault";
import { Stage, SysLine } from "@/components/system/Stage";
import { SYSTEM } from "@/lib/content";
import { cn } from "@/lib/cn";

const INTRO_DELAYS = [900, 800, 700, 900] as const;
const OK_MARK = "[OK]";
const INTEGRITY_CAP = 47;
const SCAN_LINES = [
  "检测到.份样本",
  "检测到..份样本",
  "检测到...份样本",
  SYSTEM.detected,
] as const;

const OK_LINES = [SYSTEM.memoryOk, SYSTEM.neuralOk, SYSTEM.specimenOk] as const;

function splitOk(line: string) {
  const at = line.lastIndexOf(OK_MARK);
  if (at < 0) {
    return { label: line, ok: "" };
  }
  return { label: line.slice(0, at), ok: OK_MARK };
}

function integrityPrefix() {
  return SYSTEM.integrity47.replace(/\d+%$/, "");
}

export function BootScene({ onComplete }: { onComplete: () => void }) {
  const intro = useReveal(INTRO_DELAYS);
  const ready = intro >= 4;
  const audio = useAudio();
  const scale = useScaledMs();
  const reduced = usePrefersReducedMotion();
  const audioRef = useRef(audio);
  const [phase, setPhase] = useState(0);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    audioRef.current = audio;
  }, [audio]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (reduced) {
      setPercent(INTEGRITY_CAP);
      setPhase(13);
      return;
    }

    let timer = 0;
    let counter = 0;
    const later = (ms: number, run: () => void) => {
      timer = window.setTimeout(run, scale(ms));
    };

    if (phase === 0) {
      later(180, () => {
        audioRef.current.bootLine();
        setPhase(1);
      });
    } else if (phase === 1) {
      later(760, () => {
        audioRef.current.bootOk();
        setPhase(2);
      });
    } else if (phase === 2) {
      later(200, () => {
        audioRef.current.bootOk();
        setPhase(3);
      });
    } else if (phase === 3) {
      later(200, () => {
        audioRef.current.bootOk();
        setPhase(4);
      });
    } else if (phase === 4) {
      later(720, () => {
        audioRef.current.bootLine();
        setPercent(0);
        setPhase(5);
      });
    } else if (phase === 5) {
      let value = 0;
      counter = window.setInterval(() => {
        value += 1;
        if (value >= INTEGRITY_CAP) {
          window.clearInterval(counter);
          counter = 0;
          setPercent(INTEGRITY_CAP);
          setPhase(6);
          return;
        }
        setPercent(value);
      }, scale(22));
    } else if (phase === 6) {
      later(1200, () => {
        audioRef.current.bootWarn();
        setPhase(7);
      });
    } else if (phase === 7) {
      later(820, () => setPhase(8));
    } else if (phase === 8) {
      later(700, () => {
        audioRef.current.bootScan();
        setPhase(9);
      });
    } else if (phase === 9 || phase === 10 || phase === 11) {
      later(480, () => {
        audioRef.current.bootScan();
        setPhase(phase + 1);
      });
    } else if (phase === 12) {
      later(640, () => {
        audioRef.current.bootReveal();
        setPhase(13);
      });
    }

    return () => {
      window.clearTimeout(timer);
      if (counter) {
        window.clearInterval(counter);
      }
    };
  }, [phase, ready, reduced, scale]);

  const scanIndex = Math.min(SCAN_LINES.length - 1, Math.max(0, phase - 9));

  return (
    <Stage className="overflow-hidden">
      {intro >= 1 ? (
        <p className="title-system text-ink">{SYSTEM.titleZh}</p>
      ) : null}

      {intro >= 2 ? (
        <UnstableEnglishTitle className="phosphor mt-3 font-mono text-[11px] tracking-[0.26em] text-sys">
          {SYSTEM.title}
        </UnstableEnglishTitle>
      ) : null}

      {intro >= 3 ? (
        <p className="mt-8 font-mono text-[13px] text-mute">
          {"> "}
          {intro < 4 ? <Cursor /> : null}
        </p>
      ) : null}

      <div className="mt-10 space-y-1">
        {phase >= 1 ? <SysLine>{SYSTEM.initializing}</SysLine> : null}
        {OK_LINES.map((line, index) =>
          phase >= index + 2 ? <OkLine key={line} line={line} /> : null,
        )}
        {phase >= 5 ? (
          <SysLine>
            {integrityPrefix()}
            <span
              className={cn(
                "inline-block min-w-[4ch] tabular-nums",
                phase >= 6 && "integrity-stuck",
              )}
            >
              {percent}%
            </span>
          </SysLine>
        ) : null}
      </div>

      {phase >= 7 ? (
        <p className="boot-snap mt-12 font-mono text-[12px] tracking-[0.28em] text-danger">
          {SYSTEM.warning}
        </p>
      ) : null}

      {phase >= 8 ? (
        <p className="boot-fault-in mt-3 font-mono text-[12px] tracking-[0.08em] text-danger">
          {SYSTEM.corrupted}
        </p>
      ) : null}

      {phase >= 9 ? (
        <p className="boot-snap mt-3 font-mono text-[12px] tracking-[0.08em] text-mute">
          {SCAN_LINES[scanIndex]}
        </p>
      ) : null}

      {phase >= 13 ? (
        <button
          type="button"
          onClick={() => {
            audio.confirm();
            onComplete();
          }}
          className="read-tag boot-snap"
        >
          {SYSTEM.enter}
        </button>
      ) : null}
    </Stage>
  );
}

function OkLine({ line }: { line: string }) {
  const parts = splitOk(line);
  return (
    <SysLine>
      {parts.label}
      {parts.ok ? <span className="boot-ok">{parts.ok}</span> : null}
    </SysLine>
  );
}
