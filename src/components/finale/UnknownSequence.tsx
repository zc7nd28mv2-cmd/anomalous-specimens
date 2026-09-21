"use client";

import { useState } from "react";
import { useArchive } from "@/context/ArchiveContext";
import { useAfter, useReveal } from "@/hooks/useReveal";
import { useScaledMs } from "@/hooks/useTiming";
import { CodeLine } from "@/components/system/CodeLine";
import { Cursor } from "@/components/system/Cursor";
import { Command } from "@/components/system/Command";
import { ENDING, FAILURE, WAKE } from "@/lib/content";
import {
  SOURCE_BIND,
  SOURCE_BOOT,
  SOURCE_EXIT,
  SOURCE_LOCK,
  SOURCE_LOOP,
  SOURCE_RENDER,
  SOURCE_RETURN,
  SOURCE_SEED,
  SOURCE_WAKE_LOGIC,
} from "@/lib/source";

type Stage =
  | "black"
  | "still"
  | "interrupt"
  | "code"
  | "wake"
  | "resolve"
  | "fail"
  | "ending";

export function UnknownSequence() {
  const { go } = useArchive();
  const [stage, setStage] = useState<Stage>("black");
  const [wakeOn, setWakeOn] = useState(false);
  const scale = useScaledMs();

  useAfter(1600, () => setStage("still"), stage === "black");

  if (stage === "black") {
    return <div className="min-h-dvh bg-bg" />;
  }

  if (stage === "still") {
    return <StillThere onDone={() => setStage("interrupt")} />;
  }

  if (stage === "interrupt") {
    return <Interrupt onDone={() => setStage("code")} />;
  }

  if (stage === "code") {
    return <CodeCover onDone={() => setStage("wake")} />;
  }

  if (stage === "wake") {
    return (
      <div className="min-h-dvh bg-bg px-5 py-16 sm:px-10">
        <div className="mx-auto max-w-[520px] md:ml-[6vw]">
          <CodeLine text={WAKE.condition} />
          <p className="mt-8 font-mono text-[12px] tracking-[0.14em] text-mute">
            {WAKE.detected}
          </p>
          <div className="mt-12 flex items-center gap-2">
            <span className="text-sys">&gt;</span>
            <button
              type="button"
              onClick={() => {
                setWakeOn(true);
                window.setTimeout(() => setStage("resolve"), scale(400));
              }}
              className="font-mono text-[12px] tracking-[0.28em] text-mute hover:text-ink"
            >
              WAKE
            </button>
            <Cursor />
          </div>
          {wakeOn ? (
            <p className="mt-8 font-mono text-[12px] text-sys">{WAKE.received}</p>
          ) : null}
        </div>
      </div>
    );
  }

  if (stage === "resolve") {
    return <Resolve onDone={() => setStage("fail")} />;
  }

  if (stage === "fail") {
    return <FailBurst onDone={() => setStage("ending")} />;
  }

  return (
    <div className="flex min-h-dvh items-center bg-bg px-6">
      <div className="mx-auto max-w-[360px]">
        <p className="fade font-sans text-[15px] leading-[2] text-ink/90">
          {ENDING.line}
        </p>
        <p className="fade mt-6 font-sans text-[13px] text-mute">{ENDING.attr}</p>
        <Command className="mt-16" onClick={() => go("specimen")}>
          RETURN
        </Command>
      </div>
    </div>
  );
}

function StillThere({ onDone }: { onDone: () => void }) {
  const step = useReveal([500, 1600, 700, 280, 900, 700]);
  useAfter(350, onDone, step >= 6);

  if (step === 0 || step >= 6) {
    return <div className="min-h-dvh bg-bg" />;
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg">
      {step >= 1 && step < 5 ? (
        <p
          className={`font-mono text-[13px] tracking-[0.06em] ${
            step === 3 ? "opacity-20" : step >= 4 ? "text-sys" : "text-ink"
          }`}
        >
          Are you still there？
          {step >= 2 ? <Cursor /> : null}
        </p>
      ) : null}
    </div>
  );
}

function Interrupt({ onDone }: { onDone: () => void }) {
  const step = useReveal([300, 700, 800, 700, 700, 900]);
  useAfter(500, onDone, step >= 6);

  return (
    <div className="min-h-dvh bg-bg px-6 py-20">
      <div className="mx-auto max-w-[480px] space-y-4 font-mono text-[12px] tracking-[0.12em] text-mute">
        {step >= 1 ? <p>SYSTEM INTERRUPTION</p> : null}
        {step >= 2 ? <p className="text-ink">UNAUTHORIZED PROCESS DETECTED</p> : null}
        {step >= 3 ? <p>SOURCE:</p> : null}
        {step >= 4 ? <p>UNKNOWN</p> : null}
        {step >= 5 ? <p>PROCESS:</p> : null}
        {step >= 6 ? <p>ACTIVE</p> : null}
      </div>
    </div>
  );
}

function CodeCover({ onDone }: { onDone: () => void }) {
  const lines = [
    SOURCE_BOOT[0],
    SOURCE_BOOT[1],
    SOURCE_BOOT[2],
    SOURCE_BIND[0],
    SOURCE_BIND[1],
    SOURCE_BIND[2],
    SOURCE_SEED,
    SOURCE_LOCK,
    SOURCE_LOOP,
    SOURCE_RENDER,
  ];
  const step = useReveal(lines.map((_, i) => (i === 0 ? 400 : 700)));
  useAfter(1200, onDone, step >= lines.length);

  return (
    <div className="relative min-h-dvh bg-bg px-5 py-16">
      <div className="space-y-3">
        {lines.slice(0, step).map((line, i) => (
          <p
            key={line}
            className={`font-mono text-[12px] text-sys ${
              i % 2 === 0 ? "ml-[8vw]" : "ml-[28vw]"
            }`}
          >
            <CodeLine text={line} />
          </p>
        ))}
      </div>
    </div>
  );
}

function Resolve({ onDone }: { onDone: () => void }) {
  const step = useReveal([400, 800, 900, 1400, 1600]);
  useAfter(800, onDone, step >= 5);

  return (
    <div className="min-h-dvh bg-bg px-5 py-16">
      <div className="mx-auto max-w-[520px] space-y-5 md:ml-[6vw]">
        {step >= 1 ? (
          <p className="font-mono text-[12px] text-mute">{WAKE.checking}</p>
        ) : null}
        {step >= 2 ? <CodeLine text={SOURCE_WAKE_LOGIC} /> : null}
        {step >= 3 ? <CodeLine text={WAKE.attachment} /> : null}
        {step >= 4 ? <CodeLine text={WAKE.ignore} /> : null}
        {step >= 5 ? (
          <div className="space-y-3 pt-6">
            <CodeLine text={SOURCE_EXIT} />
            <CodeLine text={SOURCE_RETURN} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FailBurst({ onDone }: { onDone: () => void }) {
  const step = useReveal([200, 300, 300, 300, 400, 700]);
  useAfter(900, onDone, step >= 6);

  return (
    <div className={`min-h-dvh px-6 py-20 ${step === 2 ? "bg-danger-dim" : "bg-bg"}`}>
      <div className="mx-auto max-w-[480px] space-y-4 font-mono text-[13px] tracking-[0.16em]">
        {step >= 1 ? <p className="phosphor-red text-danger">WARNING</p> : null}
        {step >= 3 ? <p className="text-danger">{FAILURE.error}</p> : null}
        {step >= 4 ? <p className="text-mute">SYSTEM FAILURE</p> : null}
        {step >= 5 ? <p className="text-danger">TERMINATION FAILED</p> : null}
        {step >= 6 ? (
          <div className="space-y-3 pt-4">
            <CodeLine text={SOURCE_EXIT} />
            <CodeLine text={SOURCE_RETURN} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
