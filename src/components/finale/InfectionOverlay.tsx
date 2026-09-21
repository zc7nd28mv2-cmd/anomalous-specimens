"use client";

import { useEffect, useState } from "react";
import { useAfter } from "@/hooks/useReveal";
import { useScaledMs } from "@/hooks/useTiming";
import { useAudio } from "@/context/AudioContext";
import { CodeLine } from "@/components/system/CodeLine";
import { Cursor } from "@/components/system/Cursor";
import {
  PEACH_DREAM_SOURCE,
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

const PROTOCOL_LINES = PEACH_DREAM_SOURCE.split("\n").filter((line) => line.length > 0);

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

  return <ProtocolPath onHoldDone={() => setGate("flash")} />;
}

function StillThere({ onYes }: { onYes: () => void }) {
  const scale = useScaledMs();
  const audio = useAudio();
  const [chunk, setChunk] = useState(0);
  const [typed, setTyped] = useState("");
  const [choices, setChoices] = useState(false);
  const [denyPlay, setDenyPlay] = useState(0);
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
      {denyPlay > 0 ? <DenyLog key={denyPlay} /> : null}
      <div className="still-prompt">
        <div className={done ? "still-ask" : undefined}>
          <p className="font-mono text-[13px] tracking-[0.06em] text-ink">
            {typed}
            <Cursor />
          </p>
        </div>
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
                setDenyPlay((value) => value + 1);
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

function DenyLog() {
  const scale = useScaledMs();
  const audio = useAudio();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (shown >= DENY_LINES.length) {
      return;
    }
    const id = window.setTimeout(() => {
      audio.tick();
      setShown((value) => value + 1);
    }, scale(irregular(150, 300)));
    return () => window.clearTimeout(id);
  }, [audio, scale, shown]);

  return (
    <div className="still-fault" aria-hidden>
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
  useAfter(280, onDone, true);
  return <div className="still-overlay" />;
}

function ProtocolPath({ onHoldDone }: { onHoldDone: () => void }) {
  const scale = useScaledMs();
  const [shown, setShown] = useState(0);
  const finished = shown >= PROTOCOL_LINES.length;

  useEffect(() => {
    if (shown >= PROTOCOL_LINES.length) {
      return;
    }
    const id = window.setTimeout(
      () => setShown((value) => value + 1),
      scale(irregular(140, 240)),
    );
    return () => window.clearTimeout(id);
  }, [scale, shown]);

  useAfter(4000, onHoldDone, finished);

  return (
    <div className="still-overlay still-protocol">
      <div className="still-protocol-log">
        {PROTOCOL_LINES.slice(0, shown).map((line, index) => (
          <CodeLine key={`${index}-${line}`} text={line} className="text-[12px] text-mute" />
        ))}
      </div>
    </div>
  );
}
