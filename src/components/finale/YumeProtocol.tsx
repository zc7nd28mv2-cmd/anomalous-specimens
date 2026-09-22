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

function lineWait(kind: YumeLineKind) {
  if (kind === "comment") {
    return irregular(100, 180);
  }
  if (kind === "blank") {
    return irregular(70, 110);
  }
  return irregular(60, 120);
}

let yumeMomoPlaybackStarted = false;
let yumeMomoCompleted = false;
let yumeReturnFinished = false;
let yumeShownCount = 0;
let yumeReturnLeft = 10;
let yumeReturnTimer = 0;
let yumeReturnOnDone: (() => void) | null = null;
const yumeListeners = new Set<(count: number) => void>();
const yumeReturnListeners = new Set<(count: number) => void>();
const yumeTimers: number[] = [];

function emitYume(count: number) {
  yumeShownCount = count;
  yumeListeners.forEach((fn) => fn(count));
}

function startYumePlayback(kinds: readonly YumeLineKind[]) {
  if (yumeMomoPlaybackStarted) {
    return;
  }
  yumeMomoPlaybackStarted = true;
  emitYume(1);

  const playFrom = (index: number) => {
    if (index >= YUME_LINES.length) {
      return;
    }
    yumeTimers.push(
      window.setTimeout(() => {
        const next = index + 1;
        emitYume(next);
        playFrom(next);
      }, lineWait(kinds[index] ?? "code")),
    );
  };

  playFrom(1);
}

function emitYumeReturn(count: number) {
  yumeReturnLeft = count;
  yumeReturnListeners.forEach((fn) => fn(count));
}

function clearYumeReturn() {
  if (yumeReturnTimer) {
    window.clearInterval(yumeReturnTimer);
    yumeReturnTimer = 0;
  }
}

function finishYumeReturn() {
  if (yumeReturnFinished) {
    return;
  }
  yumeReturnFinished = true;
  clearYumeReturn();
  yumeReturnOnDone?.();
}

function startYumeReturn(onDone: () => void) {
  yumeReturnOnDone = onDone;
  if (yumeMomoCompleted || yumeReturnFinished || yumeReturnTimer) {
    return;
  }
  yumeMomoCompleted = true;
  emitYumeReturn(10);
  yumeReturnTimer = window.setInterval(() => {
    const next = yumeReturnLeft - 1;
    emitYumeReturn(next);
    if (next <= 0) {
      finishYumeReturn();
    }
  }, 1000);
}

export function YumeProtocol({
  onHoldDone,
}: { onHoldDone?: () => void } = {}) {
  const kinds = useMemo(() => classifyYumeLines(YUME_LINES), []);
  const [shown, setShown] = useState(yumeShownCount);
  const [returnLeft, setReturnLeft] = useState(yumeReturnLeft);
  const scroller = useRef<HTMLPreElement>(null);
  const done = useRef(onHoldDone);

  useEffect(() => {
    done.current = onHoldDone;
  }, [onHoldDone]);

  useEffect(() => {
    yumeListeners.add(setShown);
    yumeReturnListeners.add(setReturnLeft);
    startYumePlayback(kinds);
    return () => {
      yumeListeners.delete(setShown);
      yumeReturnListeners.delete(setReturnLeft);
    };
  }, [kinds]);

  const tokens = useMemo(
    () => highlightYumeLines(YUME_LINES.slice(0, shown)),
    [shown],
  );

  useEffect(() => {
    const node = scroller.current;
    if (!node) {
      return;
    }
    const id = window.requestAnimationFrame(() => {
      node.scrollTo({
        top: node.scrollHeight,
        behavior: shown >= YUME_LINES.length ? "auto" : "smooth",
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [shown]);

  useEffect(() => {
    if (shown < YUME_LINES.length) {
      return;
    }
    const node = scroller.current;
    if (!node) {
      return;
    }
    node.scrollTop = node.scrollHeight - node.clientHeight;
  }, [shown, returnLeft]);

  const completed = shown >= YUME_LINES.length;

  useEffect(() => {
    if (!completed) {
      return;
    }
    startYumeReturn(() => done.current?.());
  }, [completed]);

  useEffect(() => {
    if (!completed) {
      return;
    }
    const onPointer = () => finishYumeReturn();
    window.addEventListener("pointerdown", onPointer, true);
    return () => window.removeEventListener("pointerdown", onPointer, true);
  }, [completed]);

  return (
    <div className="yume-view">
      <pre ref={scroller} className="yume-code">
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
        {completed ? (
          <>
            {"\n\n"}
            <span className="yume-return">
              RETURNING TO ARCHIVE... {returnLeft}
            </span>
          </>
        ) : null}
      </pre>
    </div>
  );
}
