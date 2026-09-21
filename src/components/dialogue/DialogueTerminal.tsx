"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useArchive } from "@/context/ArchiveContext";
import { useScaledMs } from "@/hooks/useTiming";
import { Cursor } from "@/components/system/Cursor";
import { Command } from "@/components/system/Command";
import { charInterval, DIALOGUE, LOG_AFTER, type DialogueBeat } from "@/lib/dialogue";
import { SOURCE_BIND, SOURCE_BOOT } from "@/lib/source";
import { cn } from "@/lib/cn";

type Mode = "play" | "after";

export function DialogueTerminal() {
  const { finishPd001 } = useArchive();
  const scale = useScaledMs();
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState(true);
  const [shown, setShown] = useState("");
  const [indicator, setIndicator] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [mode, setMode] = useState<Mode>("play");
  const forceComplete = useRef(false);

  const beat = DIALOGUE[index] as DialogueBeat | undefined;
  const seen = useMemo(() => DIALOGUE.slice(0, index + 1), [index]);

  const sys = [...seen].reverse().find((item) => item.kind === "sys");
  const warn = [...seen].reverse().find((item) => item.kind === "warn");
  const flash = beat?.kind === "flash" ? beat.code : null;
  const inject = seen.some((item) => item.kind === "inject");
  const exitReq = seen.some((item) => item.kind === "exitreq");
  const lost = seen.some((item) => item.kind === "lost");
  const darken = seen.some(
    (item) =>
      (item.kind === "line" && item.text.includes("她比我记忆里的年轻")) ||
      (item.kind === "warn" && item.title.includes("WARNING!")),
  );

  const advance = useCallback(() => {
    if (index + 1 >= DIALOGUE.length) {
      setMode("after");
      return;
    }
    setIndex((value) => value + 1);
    setTyping(true);
    setShown("");
    setIndicator(false);
  }, [index]);

  useEffect(() => {
    if (mode !== "play" || !beat) {
      return;
    }

    if (beat.kind !== "line") {
      const wait =
        beat.kind === "flash"
          ? 320
          : beat.kind === "lost"
            ? 1400
            : beat.kind === "exitreq"
              ? 1600
              : beat.kind === "inject"
                ? 800
                : beat.kind === "warn"
                  ? 1100
                  : 700;
      const id = window.setTimeout(() => {
        if (beat.kind === "lost") {
          setMode("after");
          return;
        }
        advance();
      }, scale(wait));
      return () => window.clearTimeout(id);
    }

    forceComplete.current = false;
    let cancelled = false;
    const start = window.setTimeout(() => {
      if (cancelled) {
        return;
      }
      setIndicator(false);
      let i = 0;
      const tick = () => {
        if (cancelled) {
          return;
        }
        if (forceComplete.current) {
          setShown(beat.text);
          setTyping(false);
          window.setTimeout(advance, scale(beat.hold ?? 350));
          return;
        }
        i += 1;
        setShown(beat.text.slice(0, i));
        if (i >= beat.text.length) {
          setTyping(false);
          const hold = beat.freeze ?? beat.hold ?? 400;
          if (beat.freeze) {
            setFrozen(true);
            window.setTimeout(() => {
              setFrozen(false);
              advance();
            }, scale(hold));
            return;
          }
          window.setTimeout(advance, scale(hold));
          return;
        }
        window.setTimeout(tick, scale(charInterval(beat.pace, beat.text[i] ?? "")));
      };
      window.setTimeout(tick, scale(charInterval(beat.pace, beat.text[0] ?? "")));
    }, scale(beat.speaker ? 700 : 200));

    const hint = window.setTimeout(() => {
      if (!cancelled) {
        setIndicator(Boolean(beat.speaker));
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(start);
      window.clearTimeout(hint);
    };
  }, [advance, beat, mode, scale]);

  function onBoxClick() {
    if (mode !== "play" || !beat || beat.kind !== "line" || !typing) {
      return;
    }
    forceComplete.current = true;
    setShown(beat.text);
    setTyping(false);
    setIndicator(false);
  }

  const line = beat?.kind === "line" ? beat : null;

  return (
    <div
      className={cn(
        "relative min-h-dvh px-4 py-10 sm:px-8 sm:py-16",
        darken ? "bg-black" : "bg-term",
        frozen && "opacity-40",
      )}
    >
      {inject && !lost ? (
        <div className="pointer-events-none absolute inset-x-4 top-16 space-y-2 opacity-40 sm:inset-x-10">
          {[...SOURCE_BOOT, ...SOURCE_BIND].map((code) => (
            <p key={code} className="font-mono text-[11px] text-sys">
              {code}
            </p>
          ))}
        </div>
      ) : null}

      {flash ? (
        <p className="pointer-events-none absolute left-6 top-1/3 font-mono text-[12px] text-sys sm:left-16">
          {flash}
        </p>
      ) : null}

      <div className="relative mx-auto flex min-h-[70vh] max-w-[720px] flex-col justify-end">
        <div className="mb-6 font-mono text-[10px] tracking-[0.16em] text-green-dim">
          <p className="phosphor-green">ARCHIVE LOG</p>
          <p className="mt-1">ID: PD-001</p>
          <p>STATUS: Recovered 91%</p>
          <p>SOURCE: Unknown Neural Relay</p>
        </div>

        {sys && sys.kind === "sys" && !lost ? (
          <div className="mb-4 font-mono text-[10px] tracking-[0.18em] text-green-dim">
            <p>{sys.k}</p>
            <p>{sys.v}</p>
          </div>
        ) : null}

        {warn && warn.kind === "warn" ? (
          <div className="mb-4 font-mono text-[12px] tracking-[0.12em] text-danger">
            <p className="phosphor-red">{warn.title}</p>
            {warn.body ? <p className="mt-2">{warn.body}</p> : null}
          </div>
        ) : null}

        {exitReq && !lost ? (
          <div className="mb-4 space-y-1 font-mono text-[11px] text-danger">
            <p>&gt; EXIT REQUEST</p>
            <p>PROCESSING...</p>
            <p>TERMINATION PROTOCOL</p>
            <p className="phosphor-red">ERROR</p>
          </div>
        ) : null}

        {mode === "play" && !lost ? (
          <button
            type="button"
            onClick={onBoxClick}
            className="dialogue-box w-full px-5 py-5 text-left sm:px-7 sm:py-6"
          >
            {beat?.kind === "time" ? (
              <p className="font-mono text-[12px] tracking-[0.16em] text-green">
                {beat.text}
              </p>
            ) : null}

            {indicator && line?.speaker ? (
              <div className="font-mono text-[11px] text-green-dim">
                <p className="phosphor-green tracking-[0.2em] text-green">
                  {line.speaker}
                </p>
                <p className="mt-3">正在输入...</p>
              </div>
            ) : null}

            {line && !indicator ? (
              <div className="font-mono text-[15px] leading-8 text-green sm:text-[16px]">
                {line.speaker ? (
                  <p className="phosphor-green mb-3 text-[12px] tracking-[0.22em]">
                    {line.speaker}
                  </p>
                ) : null}
                <p>
                  {shown}
                  {typing ? <Cursor /> : <span className="ml-3 text-green-dim">▼</span>}
                </p>
              </div>
            ) : null}
          </button>
        ) : null}

        {lost ? (
          <p className="phosphor-red font-mono text-[14px] tracking-[0.12em] text-danger">
            Connection Lost.
          </p>
        ) : null}

        {mode === "after" ? (
          <div className="mt-10 space-y-2">
            {LOG_AFTER.map((lineText) => (
              <p
                key={lineText}
                className={
                  lineText.startsWith("PEACH") ||
                  lineText.startsWith("0.91") ||
                  lineText.endsWith("：")
                    ? "font-mono text-[12px] text-mute"
                    : "font-sans text-[14px] leading-8 text-ink/90"
                }
              >
                {lineText}
              </p>
            ))}
            <Command onClick={finishPd001}>RETURN</Command>
          </div>
        ) : null}
      </div>
    </div>
  );
}
