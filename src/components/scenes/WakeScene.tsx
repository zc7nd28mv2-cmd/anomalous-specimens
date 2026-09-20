"use client";

import { useEffect, useState } from "react";
import { useAfter, useReveal } from "@/hooks/useReveal";
import { CodeLine } from "@/components/system/CodeLine";
import { Cursor } from "@/components/system/Cursor";
import { Stage } from "@/components/system/Stage";
import { FAILURE, WAKE } from "@/lib/content";
import {
  SOURCE_EXIT,
  SOURCE_NOTE_1,
  SOURCE_NOTE_2,
  SOURCE_NOTE_TITLE,
  SOURCE_RETURN,
  SOURCE_WAKE_LOGIC,
} from "@/lib/source";

type Phase =
  | "prompt"
  | "logic"
  | "check"
  | "ignore"
  | "note"
  | "exit"
  | "hold"
  | "ret"
  | "fail"
  | "loop";

export function WakeScene({ onComplete }: { onComplete: () => void }) {
  const intro = useReveal([400, 800, 1100]);
  const [phase, setPhase] = useState<Phase>("prompt");
  const [typed, setTyped] = useState("");

  const ready = intro >= 3 && phase === "prompt";

  function submitWake() {
    if (phase !== "prompt") {
      return;
    }
    setPhase("logic");
  }

  useEffect(() => {
    if (!ready) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (typed.trim().toUpperCase() === WAKE.command) {
          setPhase("logic");
        }
        return;
      }
      if (event.key === "Backspace") {
        setTyped((value) => value.slice(0, -1));
        return;
      }
      if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
        setTyped((value) => (value + event.key).slice(0, 12));
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, typed]);

  useAfter(1000, () => setPhase("check"), phase === "logic");
  useAfter(900, () => setPhase("ignore"), phase === "check");
  useAfter(2800, () => setPhase("note"), phase === "ignore");
  useAfter(2400, () => setPhase("exit"), phase === "note");
  useAfter(3200, () => setPhase("hold"), phase === "exit");
  useAfter(1600, () => setPhase("ret"), phase === "hold");
  useAfter(1400, () => setPhase("fail"), phase === "ret");
  useAfter(1800, () => setPhase("loop"), phase === "fail");
  useAfter(2000, onComplete, phase === "loop");

  return (
    <Stage>
      {intro >= 1 ? (
        <CodeLine text={WAKE.condition} />
      ) : null}
      {intro >= 2 ? (
        <p className="mt-8 font-mono text-[12px] tracking-[0.14em] text-mute">
          {WAKE.detected}
        </p>
      ) : null}

      {ready ? (
        <div className="mt-12 flex items-center gap-2">
          <span className="font-mono text-[12px] text-dim">&gt;</span>
          <button
            type="button"
            onClick={submitWake}
            className="font-mono text-[12px] tracking-[0.28em] text-mute transition-colors duration-300 hover:text-ink"
          >
            {typed || WAKE.command}
          </button>
          <Cursor />
        </div>
      ) : null}

      {phase === "logic" || phase === "check" || phase === "ignore" ? (
        <div className="mt-12 space-y-6">
          <p className="font-mono text-[12px] tracking-[0.12em] text-mute">
            {WAKE.received}
          </p>
          {phase === "check" || phase === "ignore" ? (
            <p className="font-mono text-[12px] tracking-[0.12em] text-dim">
              {WAKE.checking}
            </p>
          ) : null}
          {phase === "ignore" ? (
            <div className="space-y-4">
              <CodeLine text={SOURCE_WAKE_LOGIC} />
              <CodeLine text={WAKE.attachment} />
              <CodeLine text={WAKE.ignore} />
            </div>
          ) : null}
        </div>
      ) : null}

      {phase === "ignore" && intro >= 0 ? (
        <div className="mt-10">
          <Cursor />
        </div>
      ) : null}

      {["note", "exit", "hold", "ret", "fail", "loop"].includes(phase) ? (
        <div className="mt-6 space-y-8">
          <div className="space-y-3">
            <p className="font-mono text-[12px] text-dim">{SOURCE_NOTE_TITLE}</p>
            <p className="font-mono text-[12px] leading-7 text-mute">
              {SOURCE_NOTE_1}
            </p>
            <p className="font-mono text-[12px] leading-7 text-mute">
              {SOURCE_NOTE_2}
            </p>
          </div>

          {["exit", "hold", "ret", "fail", "loop"].includes(phase) ? (
            <CodeLine text={SOURCE_EXIT} />
          ) : null}

          {phase === "hold" ? (
            <div className="pt-2">
              <Cursor />
            </div>
          ) : null}

          {["ret", "fail", "loop"].includes(phase) ? (
            <CodeLine text={SOURCE_RETURN} />
          ) : null}

          {phase === "fail" || phase === "loop" ? (
            <div className="space-y-3 pt-4">
              <p className="font-mono text-[12px] tracking-[0.12em] text-mute">
                {FAILURE.returned}
              </p>
              <p className="font-mono text-[12px] tracking-[0.28em] text-danger">
                {FAILURE.error}
              </p>
              <p className="font-mono text-[12px] tracking-[0.08em] text-mute">
                {FAILURE.terminated}
              </p>
              <div className="pt-6">
                <p className="font-mono text-[10px] tracking-[0.18em] text-dim">
                  {FAILURE.unstable.warning}
                </p>
                <p className="mt-4 font-mono text-[11px] leading-7 text-dim">
                  {FAILURE.unstable.unauthorized}
                </p>
                <p className="mt-6 font-mono text-[11px] leading-7 text-dim">
                  {FAILURE.unstable.source} {FAILURE.unstable.sourceVal}
                </p>
                <p className="font-mono text-[11px] leading-7 text-dim">
                  {FAILURE.unstable.process} {FAILURE.unstable.processVal}
                </p>
                <p className="font-mono text-[11px] leading-7 text-dim">
                  {FAILURE.unstable.termination} {FAILURE.unstable.terminationVal}
                </p>
                <p className="font-mono text-[11px] leading-7 text-dim">
                  {FAILURE.unstable.state} {FAILURE.unstable.stateVal}
                </p>
              </div>
            </div>
          ) : null}

          {phase === "loop" ? (
            <div className="pt-4">
              <CodeLine text={SOURCE_RETURN} />
            </div>
          ) : null}
        </div>
      ) : null}
    </Stage>
  );
}
