"use client";

import { useEffect, useRef, useState } from "react";
import { useAfter, useReveal } from "@/hooks/useReveal";
import { useScaledMs } from "@/hooks/useTiming";
import { useAudio } from "@/context/AudioContext";
import { CodeLine } from "@/components/system/CodeLine";
import { Cursor } from "@/components/system/Cursor";
import {
  SOURCE_BIND,
  SOURCE_BOOT,
  SOURCE_EXIT,
  SOURCE_LOCK,
  SOURCE_RETURN,
} from "@/lib/source";
import { CRITICAL, ENDING, FAILURE, WAKE } from "@/lib/content";

const PROMPT_CHUNKS = ["Ar", "e", " you st", "ill", " there?"] as const;

const CHUNK_PAUSE: ReadonlyArray<[number, number]> = [
  [180, 300],
  [300, 500],
  [150, 250],
  [350, 550],
];

function irregular(min: number, max: number) {
  return min + Math.random() * (max - min);
}

const FAULT_POOL = [
  FAILURE.error,
  "SYSTEM FAILURE",
  "TERMINATION FAILED",
  "REQUEST DENIED",
  `${FAILURE.unstable.process} ${FAILURE.unstable.processVal}`,
  FAILURE.unstable.warning,
  FAILURE.unstable.unauthorized,
  `${FAILURE.unstable.source} ${FAILURE.unstable.sourceVal}`,
  `${FAILURE.unstable.state} ${FAILURE.unstable.stateVal}`,
  `${FAILURE.unstable.termination} ${FAILURE.unstable.terminationVal}`,
  FAILURE.terminated,
  FAILURE.returned,
  CRITICAL.compromised,
  CRITICAL.doNot,
  "Connection Lost.",
  SOURCE_BOOT[0],
  SOURCE_BOOT[1],
  SOURCE_BOOT[2],
  SOURCE_BIND[0],
  SOURCE_BIND[1],
  SOURCE_BIND[2],
  SOURCE_LOCK,
  SOURCE_EXIT,
  SOURCE_RETURN,
  WAKE.ignore,
  WAKE.detected,
  WAKE.condition,
  "UNKNOWN SIGNAL DETECTED",
  "HOST VITAL SIGNS ARE DECLINING",
  "UNKNOWN NEURAL RELAY",
] as const;

const DENY_CODE = [
  SOURCE_BOOT[0],
  SOURCE_BOOT[1],
  SOURCE_BOOT[2],
  SOURCE_BIND[0],
  SOURCE_BIND[2],
  SOURCE_EXIT,
  SOURCE_RETURN,
] as const;

type Gate = "black" | "ask" | "deny" | "next";

export function InfectionOverlay({ onDone }: { onDone: () => void }) {
  const [gate, setGate] = useState<Gate>("black");

  useEffect(() => {
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  useAfter(700, () => setGate("ask"), gate === "black");

  if (gate === "black") {
    return <div className="still-overlay" />;
  }

  if (gate === "ask") {
    return (
      <StillThere
        onYes={() => setGate("next")}
        onNo={() => setGate("deny")}
      />
    );
  }

  if (gate === "deny") {
    return <DenyBurst onDone={() => setGate("ask")} />;
  }

  return <FailPath onDone={onDone} />;
}

function StillThere({
  onYes,
  onNo,
}: {
  onYes: () => void;
  onNo: () => void;
}) {
  const scale = useScaledMs();
  const audio = useAudio();
  const [chunk, setChunk] = useState(0);
  const [typed, setTyped] = useState("");
  const [choices, setChoices] = useState(false);
  const done = chunk >= PROMPT_CHUNKS.length;

  useEffect(() => {
    if (chunk >= PROMPT_CHUNKS.length) {
      return;
    }
    const wait =
      chunk === 0 ? irregular(160, 240) : irregular(...CHUNK_PAUSE[chunk - 1]);
    const id = window.setTimeout(() => {
      setTyped((value) => value + PROMPT_CHUNKS[chunk]);
      audio.tick();
      setChunk((value) => value + 1);
    }, scale(wait));
    return () => window.clearTimeout(id);
  }, [audio, chunk, scale]);

  useEffect(() => {
    if (!done) {
      return;
    }
    const id = window.setTimeout(() => setChoices(true), scale(640));
    return () => window.clearTimeout(id);
  }, [done, scale]);

  return (
    <div className="still-overlay">
      {done ? <FaultStream /> : null}
      <div className="still-prompt">
        <p className="font-mono text-[13px] tracking-[0.06em] text-ink">
          {typed}
          <Cursor />
        </p>
        {choices ? (
          <div className="mt-10 flex justify-center gap-10">
            <button
              type="button"
              onClick={() => {
                audio.click();
                onYes();
              }}
              className="act px-3 py-2 font-mono text-[11px] tracking-[0.16em] text-green"
            >
              [ YES ]
            </button>
            <button
              type="button"
              onClick={() => {
                audio.click();
                onNo();
              }}
              className="act px-3 py-2 font-mono text-[11px] tracking-[0.16em] text-green"
            >
              [ NO ]
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FaultStream() {
  const scale = useScaledMs();
  const [lines, setLines] = useState<{ key: number; text: string }[]>([]);
  const step = useRef(0);
  const uid = useRef(0);
  const queue = useRef<string[]>([]);

  useEffect(() => {
    let id = 0;
    let cancelled = false;

    const pull = () => {
      if (queue.current.length > 0) {
        return queue.current.shift() ?? "";
      }
      const line = FAULT_POOL[step.current % FAULT_POOL.length] ?? "";
      step.current += 1;
      if (line.length > 8 && Math.random() < 0.24) {
        queue.current.push(line.slice(0, 3 + Math.floor(Math.random() * 5)));
        if (line.length > 12 && Math.random() < 0.55) {
          queue.current.push(line.slice(0, Math.floor(line.length * 0.58)));
        }
        queue.current.push(line);
        return queue.current.shift() ?? line;
      }
      return line;
    };

    const run = () => {
      if (cancelled) {
        return;
      }
      const text = pull();
      uid.current += 1;
      const key = uid.current;
      setLines((value) => {
        const next = [...value, { key, text }];
        return next.length > 26 ? next.slice(-26) : next;
      });
      id = window.setTimeout(run, scale(irregular(70, 190)));
    };

    id = window.setTimeout(run, scale(60));
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [scale]);

  return (
    <div className="still-fault" aria-hidden>
      {lines.map((item) => (
        <p key={item.key} className="still-fault-line">
          {item.text}
        </p>
      ))}
    </div>
  );
}

function DenyBurst({ onDone }: { onDone: () => void }) {
  const step = useReveal([180, 220, 220, 220, 220, 220, 220, 280, 320, 400, 500]);
  useAfter(900, onDone, step >= 11);

  return (
    <div
      className={`still-overlay px-6 py-20 ${
        step === 8 ? "bg-danger-dim" : ""
      }`}
    >
      <div className="mx-auto max-w-[480px] space-y-3 font-mono text-[12px] tracking-[0.08em] text-sys">
        {DENY_CODE.slice(0, Math.min(step, DENY_CODE.length)).map((line) => (
          <p key={line}>
            <CodeLine text={line} />
          </p>
        ))}
        {step >= 8 ? (
          <p className="pt-4 font-mono text-[13px] tracking-[0.14em] text-danger">
            ERROR
          </p>
        ) : null}
        {step >= 9 ? (
          <p className="font-mono text-[12px] tracking-[0.12em] text-danger">
            REQUEST DENIED
          </p>
        ) : null}
        {step >= 10 ? (
          <p className="font-mono text-[11px] tracking-[0.12em] text-sys">
            PROCESS: ACTIVE
          </p>
        ) : null}
      </div>
    </div>
  );
}

function FailPath({ onDone }: { onDone: () => void }) {
  const step = useReveal([400, 280, 900, 400, 280, 280, 280, 400, 700, 900]);
  useAfter(700, onDone, step >= 10);

  if (step >= 10) {
    return (
      <div className="still-overlay flex items-center justify-center px-6">
        <div className="max-w-[360px]">
          <p className="font-sans text-[18px] leading-[2] text-ink/90">{ENDING.line}</p>
          <p className="mt-6 font-sans text-[14px] text-mute">{ENDING.attr}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`still-overlay px-6 py-20 ${step === 1 ? "bg-danger-dim" : ""}`}>
      <div className="mx-auto max-w-[480px] space-y-4 font-mono text-[13px] tracking-[0.14em]">
        {step >= 0 ? <p className="text-danger">WARNING</p> : null}
        {step >= 2 ? <p className="text-danger">ERROR</p> : null}
        {step >= 3 ? <p className="text-mute">SYSTEM FAILURE</p> : null}
        {step >= 4 ? <p className="text-danger">TERMINATION FAILED</p> : null}
        {step >= 5 ? (
          <div className="space-y-3 pt-4">
            <CodeLine text={SOURCE_EXIT} />
            <CodeLine text={SOURCE_RETURN} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
