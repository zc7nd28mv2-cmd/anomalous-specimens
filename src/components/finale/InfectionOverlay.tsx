"use client";

import { useAfter, useReveal } from "@/hooks/useReveal";
import { Cursor } from "@/components/system/Cursor";
import { CodeLine } from "@/components/system/CodeLine";
import { SOURCE_EXIT, SOURCE_RETURN } from "@/lib/source";
import { ENDING } from "@/lib/content";

type Stage = "black" | "still" | "fail" | "end";

export function InfectionOverlay({ onDone }: { onDone: () => void }) {
  const step = useReveal([900, 400]);
  const stage: Stage = step < 1 ? "black" : "still";

  if (stage === "black") {
    return <div className="fixed inset-0 z-50 bg-black" />;
  }

  return <StillThere onDone={onDone} />;
}

function StillThere({ onDone }: { onDone: () => void }) {
  const step = useReveal([500, 1600, 700, 280, 900, 400, 280, 280, 280, 400, 700, 900]);
  useAfter(700, onDone, step >= 12);

  if (step === 0) {
    return <div className="fixed inset-0 z-50 bg-black" />;
  }

  if (step >= 1 && step < 6) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        {step < 5 ? (
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

  if (step >= 12) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black px-6">
        <div className="max-w-[360px]">
          <p className="font-sans text-[18px] leading-[2] text-ink/90">{ENDING.line}</p>
          <p className="mt-6 font-sans text-[14px] text-mute">{ENDING.attr}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 px-6 py-20 ${step === 7 ? "bg-danger-dim" : "bg-black"}`}>
      <div className="mx-auto max-w-[480px] space-y-4 font-mono text-[13px] tracking-[0.14em]">
        {step >= 6 ? <p className="phosphor-red text-danger">WARNING</p> : null}
        {step >= 8 ? <p className="text-danger">ERROR</p> : null}
        {step >= 9 ? <p className="text-mute">SYSTEM FAILURE</p> : null}
        {step >= 10 ? <p className="text-danger">TERMINATION FAILED</p> : null}
        {step >= 11 ? (
          <div className="space-y-3 pt-4">
            <CodeLine text={SOURCE_EXIT} />
            <CodeLine text={SOURCE_RETURN} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
