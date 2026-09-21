"use client";

import { useEffect, useState } from "react";
import { useAfter, useReveal } from "@/hooks/useReveal";
import { useScaledMs } from "@/hooks/useTiming";
import { useAudio } from "@/context/AudioContext";
import { CodeLine } from "@/components/system/CodeLine";
import { SOURCE_BIND, SOURCE_BOOT, SOURCE_EXIT, SOURCE_RETURN } from "@/lib/source";
import { ENDING } from "@/lib/content";

const PROMPT = "Are you still there?";

function promptDelay(char: string) {
  if (char === " ") {
    return 30 + Math.random() * 20;
  }
  if (char === "?" || char === "？" || char === "." || char === "!") {
    return 100 + Math.random() * 80;
  }
  return 50 + Math.random() * 20;
}

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

  useAfter(700, () => setGate("ask"), gate === "black");

  if (gate === "black") {
    return <div className="fixed inset-0 z-[500] bg-black" />;
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
  const [typed, setTyped] = useState("");
  const [caret, setCaret] = useState<"on" | "blink" | "off">("on");
  const [choices, setChoices] = useState(false);
  const done = typed.length >= PROMPT.length;

  useEffect(() => {
    if (typed.length >= PROMPT.length) {
      return;
    }
    const next = PROMPT[typed.length] ?? "";
    const id = window.setTimeout(() => {
      setTyped((value) => value + next);
    }, scale(promptDelay(next)));
    return () => window.clearTimeout(id);
  }, [scale, typed]);

  useEffect(() => {
    if (!done) {
      return;
    }
    setCaret("blink");
    const hide = window.setTimeout(() => {
      setCaret("off");
      setChoices(true);
    }, scale(1200));
    return () => window.clearTimeout(hide);
  }, [done, scale]);

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black">
      <div className="px-6 text-center">
        <p className="font-mono text-[13px] tracking-[0.06em] text-ink">
          {typed}
          {caret !== "off" ? (
            <span className={caret === "blink" ? "term-caret is-blink" : "term-caret"} />
          ) : null}
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

function DenyBurst({ onDone }: { onDone: () => void }) {
  const step = useReveal([180, 220, 220, 220, 220, 220, 220, 280, 320, 400, 500]);
  useAfter(900, onDone, step >= 11);

  return (
    <div
      className={`fixed inset-0 z-[500] px-6 py-20 ${
        step === 8 ? "bg-danger-dim" : "bg-black"
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
      <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black px-6">
        <div className="max-w-[360px]">
          <p className="font-sans text-[18px] leading-[2] text-ink/90">{ENDING.line}</p>
          <p className="mt-6 font-sans text-[14px] text-mute">{ENDING.attr}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[500] px-6 py-20 ${step === 1 ? "bg-danger-dim" : "bg-black"}`}>
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
