"use client";

import { useEffect, useRef, useState } from "react";
import { useScaledMs } from "@/hooks/useTiming";
import { TypingIndicator } from "@/components/dialogue/TypingIndicator";
import { charInterval, TYPING_INDICATOR_DELAY } from "@/lib/dialogue";
import {
  CRYSTAL_BLOOM_LOG,
  CRYSTAL_BLOOM_LOG_META,
  type CrystalBloomBeat,
} from "@/lib/crystal-bloom";
import { cn } from "@/lib/cn";

type Shown =
  | { kind: "time"; text: string }
  | { kind: "msg"; speaker: string; text: string }
  | { kind: "note"; text: string }
  | { kind: "sys"; text: string };

export function SimpleFieldLog({
  active,
  initialDone = false,
  onReadyToLeave,
}: {
  active: boolean;
  initialDone?: boolean;
  onReadyToLeave: () => void;
}) {
  const scale = useScaledMs();
  const [shown, setShown] = useState<Shown[]>(() =>
    initialDone ? flattenLog(CRYSTAL_BLOOM_LOG) : [],
  );
  const [indicator, setIndicator] = useState("");
  const [draft, setDraft] = useState("");
  const [draftSpeaker, setDraftSpeaker] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const latest = useRef<HTMLDivElement>(null);
  const readyRef = useRef(initialDone);
  const running = useRef(false);
  const scaleRef = useRef(scale);
  const onReadyRef = useRef(onReadyToLeave);
  scaleRef.current = scale;
  onReadyRef.current = onReadyToLeave;

  useEffect(() => {
    if (!active || readyRef.current || running.current) {
      return;
    }
    running.current = true;
    setShown([]);
    setIndicator("");
    setDraft("");
    setDraftSpeaker("");
    let cancelled = false;
    const timers: number[] = [];
    const later = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, scaleRef.current(ms)));
      });

    const typeLine = async (text: string) => {
      let out = "";
      for (const char of Array.from(text)) {
        if (cancelled) {
          return;
        }
        out += char;
        setDraft(out);
        await later(charInterval("normal", char));
      }
    };

    const play = async () => {
      for (const beat of CRYSTAL_BLOOM_LOG) {
        if (cancelled) {
          return;
        }
        if (beat.kind === "time") {
          setShown((current) => [...current, { kind: "time", text: beat.text }]);
          await later(280);
          continue;
        }
        if (beat.kind === "note") {
          await later(1600);
          setShown((current) => [...current, beat]);
          await later(700);
          continue;
        }
        if (beat.kind === "sys") {
          for (const line of beat.lines) {
            if (cancelled) {
              return;
            }
            setShown((current) => [...current, { kind: "sys", text: line }]);
            await later(220);
          }
          await later(360);
          continue;
        }
        setIndicator(beat.speaker);
        await later(TYPING_INDICATOR_DELAY);
        if (cancelled) {
          return;
        }
        setIndicator("");
        setDraftSpeaker(beat.speaker);
        for (const line of beat.lines) {
          if (cancelled) {
            return;
          }
          setDraft("");
          await typeLine(line);
          if (cancelled) {
            return;
          }
          setShown((current) => [
            ...current,
            { kind: "msg", speaker: beat.speaker, text: line },
          ]);
          setDraft("");
          await later(420);
        }
        setDraftSpeaker("");
      }
      if (!cancelled) {
        readyRef.current = true;
        onReadyRef.current();
      }
    };

    void play();
    return () => {
      cancelled = true;
      running.current = false;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [active]);

  useEffect(() => {
    latest.current?.scrollIntoView({ block: "nearest" });
  }, [shown, draft, indicator]);

  const last = shown[shown.length - 1];
  const rest = shown.slice(0, -1);

  return (
    <div className="field-record-shell">
      <div ref={scroller} className="chat-content px-5 py-4">
        <div className="chat-stack">
          <div className="sys-meta space-y-1 text-green-dim">
            <p>{CRYSTAL_BLOOM_LOG_META.title}</p>
            <p>ID: {CRYSTAL_BLOOM_LOG_META.id}</p>
            <p>STATUS: {CRYSTAL_BLOOM_LOG_META.status}</p>
            <p>SOURCE: {CRYSTAL_BLOOM_LOG_META.source}</p>
          </div>
          <div className="mt-6 space-y-5">
            {rest.map((item, index) => (
              <LogItem key={`${item.kind}-${index}`} item={item} />
            ))}
            <div ref={latest} className="chat-latest space-y-5">
              {last ? <LogItem item={last} /> : null}
              {indicator ? <TypingIndicator name={indicator} /> : null}
              {draft && !indicator ? (
                <div className="font-sans text-[14px] leading-7 text-green">
                  {draftSpeaker ? (
                    <p className="mb-1 font-mono text-[11px] tracking-[0.18em] text-green">
                      {draftSpeaker}
                    </p>
                  ) : null}
                  <p>{draft}</p>
                </div>
              ) : null}
            </div>
          </div>
          <div className="chat-breath" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function LogItem({ item }: { item: Shown }) {
  if (item.kind === "time") {
    return (
      <p className="font-mono text-[12px] tracking-[0.14em] text-green-dim">
        {item.text}
      </p>
    );
  }
  if (item.kind === "msg") {
    return (
      <div className="font-sans text-[14px] leading-7 text-green">
        <p className="mb-1 font-mono text-[11px] tracking-[0.18em] text-green">
          {item.speaker}
        </p>
        <p>{item.text}</p>
      </div>
    );
  }
  if (item.kind === "note") {
    return <p className="font-sans text-[14px] leading-7 text-mute">{item.text}</p>;
  }
  return (
    <p className={cn("font-mono text-[12px] tracking-[0.08em] text-sys")}>
      {item.text}
    </p>
  );
}

function flattenLog(beats: readonly CrystalBloomBeat[]): Shown[] {
  const out: Shown[] = [];
  for (const beat of beats) {
    if (beat.kind === "time") {
      out.push(beat);
    } else if (beat.kind === "note") {
      out.push(beat);
    } else if (beat.kind === "msg") {
      beat.lines.forEach((text) => {
        out.push({ kind: "msg", speaker: beat.speaker, text });
      });
    } else {
      beat.lines.forEach((text) => {
        out.push({ kind: "sys", text });
      });
    }
  }
  return out;
}
