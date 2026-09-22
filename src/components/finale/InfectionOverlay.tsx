"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAfter } from "@/hooks/useReveal";
import { useScaledMs } from "@/hooks/useTiming";
import { useAudio } from "@/context/AudioContext";
import { Cursor } from "@/components/system/Cursor";
import { YumeProtocol } from "@/components/finale/YumeProtocol";
import { cn } from "@/lib/cn";
import {
  SOURCE_BIND,
  SOURCE_BOOT,
  SOURCE_EXIT,
  SOURCE_RETURN,
} from "@/lib/source";

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

const DENY_LINES = [
  { text: SOURCE_BOOT[0], tone: "code" },
  { text: SOURCE_BOOT[1], tone: "code" },
  { text: SOURCE_BOOT[2], tone: "code" },
  { text: SOURCE_BIND[0], tone: "code" },
  { text: SOURCE_BIND[2], tone: "code" },
  { text: SOURCE_EXIT, tone: "code" },
  { text: SOURCE_RETURN, tone: "code" },
  { text: "ERROR", tone: "err" },
  { text: "REQUEST DENIED", tone: "warn" },
  { text: "PROCESS: ACTIVE", tone: "sys" },
] as const;

type Gate = "black" | "ask" | "next" | "flash";

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
    return <StillThere onYes={() => setGate("next")} />;
  }

  if (gate === "flash") {
    return <FlashOut onDone={onDone} />;
  }

  return <YumeProtocol onHoldDone={onDone} />;
}

type PromptPhase = "idle" | "leave" | "gone" | "enter";

type CodeLog = { id: number };

function StillThere({ onYes }: { onYes: () => void }) {
  const scale = useScaledMs();
  const audio = useAudio();
  const [chunk, setChunk] = useState(0);
  const [typed, setTyped] = useState("");
  const [choices, setChoices] = useState(false);
  const [codeLogs, setCodeLogs] = useState<CodeLog[]>([]);
  const [activeLog, setActiveLog] = useState<number | null>(null);
  const [promptPhase, setPromptPhase] = useState<PromptPhase>("idle");
  const nextLog = useRef(1);
  const yumeMomoPlaybackStarted = useRef(false);
  const [yesLocked, setYesLocked] = useState(false);
  const done = chunk >= PROMPT_CHUNKS.length;
  const busy = promptPhase !== "idle";

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

  useEffect(() => {
    if (promptPhase !== "leave") {
      return;
    }
    const id = window.setTimeout(() => {
      const logId = nextLog.current;
      nextLog.current += 1;
      setCodeLogs((prev) => [...prev, { id: logId }]);
      setActiveLog(logId);
      setPromptPhase("gone");
    }, scale(260));
    return () => window.clearTimeout(id);
  }, [promptPhase, scale]);

  useEffect(() => {
    if (promptPhase !== "enter") {
      return;
    }
    const id = window.setTimeout(() => setPromptPhase("idle"), scale(380));
    return () => window.clearTimeout(id);
  }, [promptPhase, scale]);

  function onLogDone(id: number) {
    if (id !== activeLog) {
      return;
    }
    const wait = irregular(400, 700);
    window.setTimeout(() => {
      setTyped("");
      setChunk(0);
      setChoices(false);
      setPromptPhase("enter");
    }, scale(wait));
  }

  return (
    <div className="still-overlay">
      {codeLogs.length > 0 ? (
        <DenyStream
          logs={codeLogs}
          activeId={activeLog}
          onActiveDone={onLogDone}
        />
      ) : null}
      {promptPhase !== "gone" ? (
        <div className="still-prompt">
          <div
            className={cn(
              "still-ask",
              promptPhase === "leave" && "is-leave",
              promptPhase === "enter" && "is-enter",
            )}
          >
            <p className="still-ask-line font-mono text-[13px] tracking-[0.06em] text-ink">
              {typed}
              <Cursor />
            </p>
            <div className="still-ask-actions">
              {choices ? (
                <>
                  <button
                    type="button"
                    disabled={yesLocked}
                    onClick={() => {
                      if (
                        yumeMomoPlaybackStarted.current ||
                        yesLocked ||
                        promptPhase === "leave"
                      ) {
                        return;
                      }
                      yumeMomoPlaybackStarted.current = true;
                      setYesLocked(true);
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
                      if (busy || !choices) {
                        return;
                      }
                      audio.click();
                      setPromptPhase("leave");
                    }}
                    className="act px-3 py-2 font-mono text-[11px] tracking-[0.16em] text-green"
                  >
                    [ NO ]
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DenyStream({
  logs,
  activeId,
  onActiveDone,
}: {
  logs: CodeLog[];
  activeId: number | null;
  onActiveDone: (id: number) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  function followLatest() {
    const node = scroller.current;
    if (!node || !shouldAutoScroll.current) {
      return;
    }
    node.scrollTo({
      top: node.scrollHeight,
      behavior: "smooth",
    });
  }

  return (
    <div
      ref={scroller}
      className="still-fault"
      aria-hidden
      onWheel={() => {
        shouldAutoScroll.current = false;
      }}
      onTouchMove={() => {
        shouldAutoScroll.current = false;
      }}
    >
      {logs.map((log) => (
        <DenyGroup
          key={log.id}
          live={log.id === activeId}
          onLine={followLatest}
          onDone={() => onActiveDone(log.id)}
        />
      ))}
    </div>
  );
}

function DenyGroup({
  live,
  onLine,
  onDone,
}: {
  live: boolean;
  onLine: () => void;
  onDone: () => void;
}) {
  const scale = useScaledMs();
  const audio = useAudio();
  const [shown, setShown] = useState(live ? 0 : DENY_LINES.length);
  const finished = useRef(!live);
  const onLineRef = useRef(onLine);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onLineRef.current = onLine;
    onDoneRef.current = onDone;
  }, [onDone, onLine]);

  useLayoutEffect(() => {
    if (!live || shown === 0) {
      return;
    }
    onLineRef.current();
  }, [live, shown]);

  useEffect(() => {
    if (!live || finished.current) {
      return;
    }
    if (shown >= DENY_LINES.length) {
      finished.current = true;
      onDoneRef.current();
      return;
    }
    const id = window.setTimeout(() => {
      audio.tick();
      setShown((value) => value + 1);
    }, scale(irregular(150, 300)));
    return () => window.clearTimeout(id);
  }, [audio, live, scale, shown]);

  return (
    <div className="still-fault-group">
      {DENY_LINES.slice(0, shown).map((line, index) => (
        <p
          key={`${line.text}-${index}`}
          className={
            line.tone === "err"
              ? "still-fault-line is-err"
              : line.tone === "warn"
                ? "still-fault-line is-warn"
                : line.tone === "sys"
                  ? "still-fault-line is-sys"
                  : "still-fault-line"
          }
        >
          {line.text}
        </p>
      ))}
    </div>
  );
}

function FlashOut({ onDone }: { onDone: () => void }) {
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);
  useEffect(() => {
    const id = window.setTimeout(() => done.current(), 140);
    return () => window.clearTimeout(id);
  }, []);
  return <div className="still-overlay" />;
}
