"use client";

import { useEffect, useState } from "react";
import { useAfter } from "@/hooks/useReveal";
import { useScaledMs } from "@/hooks/useTiming";
import { CodeLine } from "@/components/system/CodeLine";
import { Cursor } from "@/components/system/Cursor";
import { Stage } from "@/components/system/Stage";
import {
  SOURCE_BIND,
  SOURCE_BOOT,
  SOURCE_LOCK,
  SOURCE_LOOP,
  SOURCE_RENDER,
  SOURCE_REWARD,
  SOURCE_SEED,
  SOURCE_SUPPRESS,
  SOURCE_WAKE_IF,
} from "@/lib/source";

const SEQUENCE = [
  { text: SOURCE_BOOT[0], wait: 700 },
  { text: SOURCE_BOOT[1], wait: 900 },
  { text: SOURCE_BOOT[2], wait: 900 },
  { text: SOURCE_BIND[0], wait: 1100 },
  { text: SOURCE_BIND[1], wait: 500 },
  { text: SOURCE_BIND[2], wait: 500 },
  { text: SOURCE_SEED, wait: 1400 },
  { text: SOURCE_LOCK, wait: 900 },
  { text: SOURCE_LOOP, wait: 1100 },
  { text: SOURCE_SUPPRESS, wait: 1200 },
  { text: SOURCE_RENDER, wait: 1300 },
  { text: SOURCE_REWARD, wait: 700 },
  { text: SOURCE_WAKE_IF, wait: 1100 },
] as const;

export function CodeScene({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [flicker, setFlicker] = useState(false);
  const scale = useScaledMs();

  useEffect(() => {
    if (count >= SEQUENCE.length) {
      return;
    }

    const current = SEQUENCE[count];
    const id = window.setTimeout(() => {
      if (current.text === SOURCE_RENDER) {
        setFlicker(true);
        window.setTimeout(() => {
          setFlicker(false);
          setCount((value) => value + 1);
        }, scale(180));
        return;
      }
      setCount((value) => value + 1);
    }, scale(current.wait));

    return () => window.clearTimeout(id);
  }, [count, scale]);

  const executing = count > 10;
  useAfter(1600, onComplete, count >= SEQUENCE.length);

  return (
    <Stage>
      <div
        className={`space-y-2 ${flicker ? "opacity-40" : "opacity-100"} transition-opacity duration-300`}
      >
        {SEQUENCE.slice(0, count).map((item, index) => (
          <div
            key={`${item.text}-${index}`}
            className={executing && index < 10 ? "opacity-40" : undefined}
          >
            <CodeLine text={item.text} />
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Cursor />
      </div>
    </Stage>
  );
}
