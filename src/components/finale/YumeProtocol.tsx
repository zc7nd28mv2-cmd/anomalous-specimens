"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  YUME_LINES,
  classifyYumeLines,
  highlightYumeLines,
  type YumeLineKind,
} from "@/lib/yume";

function irregular(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function nextStep(index: number, kinds: readonly YumeLineKind[]) {
  const kind = kinds[index] ?? "code";
  if (kind === "blank") {
    return { add: 1, wait: 20 };
  }
  if (kind === "comment") {
    return { add: 1, wait: irregular(90, 160) };
  }
  let add = 1;
  if (Math.random() < 0.42) {
    while (add < 3 && kinds[index + add] === "code") {
      add += 1;
    }
  }
  return { add, wait: irregular(36, 80) };
}

export function YumeProtocol({ onHoldDone }: { onHoldDone: () => void }) {
  const kinds = useMemo(() => classifyYumeLines(YUME_LINES), []);
  const hold = useRef(onHoldDone);
  const [shown, setShown] = useState(1);
  const finished = shown >= YUME_LINES.length;

  useEffect(() => {
    hold.current = onHoldDone;
  }, [onHoldDone]);
  const tokens = useMemo(
    () => highlightYumeLines(YUME_LINES.slice(0, shown)),
    [shown],
  );

  useEffect(() => {
    if (shown >= YUME_LINES.length) {
      return;
    }
    const step = nextStep(shown, kinds);
    const id = window.setTimeout(() => {
      setShown((value) => Math.min(YUME_LINES.length, value + step.add));
    }, step.wait);
    return () => window.clearTimeout(id);
  }, [kinds, shown]);

  useEffect(() => {
    if (!finished) {
      return;
    }
    const id = window.setTimeout(() => hold.current(), 4000);
    return () => window.clearTimeout(id);
  }, [finished]);

  return (
    <div className="yume-view">
      <pre className="yume-code">
        {tokens.map((line, index) => (
          <span key={index} className="yume-line">
            {line.map((token, tokenIndex) => (
              <span
                key={`${index}-${tokenIndex}`}
                className={
                  token.kind === "key"
                    ? "yume-key"
                    : token.kind === "cmt"
                      ? "yume-cmt"
                      : undefined
                }
              >
                {token.text}
              </span>
            ))}
            {index < tokens.length - 1 ? "\n" : null}
          </span>
        ))}
      </pre>
    </div>
  );
}
