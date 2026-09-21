"use client";

import { useEffect, useState } from "react";
import { useArchive } from "@/context/ArchiveContext";
import { useAfter, useReveal } from "@/hooks/useReveal";
import { useScaledMs } from "@/hooks/useTiming";
import { BackLink } from "@/components/system/BackLink";
import { Cursor } from "@/components/system/Cursor";
import { CONSTITUTION } from "@/lib/constitution";

const INTRO = [180, 140, 140, 200] as const;
const SCAN_MS = 2200;

export function ConstitutionArchive() {
  const { go } = useArchive();
  const intro = useReveal(INTRO);
  const analyzing = intro >= 4;
  const [settled, setSettled] = useState(false);
  const [results, setResults] = useState(false);

  useAfter(SCAN_MS, () => setSettled(true), analyzing);
  useAfter(320, () => setResults(true), settled);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-bg px-5 py-16 sm:px-10 sm:py-20 md:px-16">
      <div className="story-content mx-auto md:ml-[6vw]">
        {intro >= 1 ? (
          <h1 className="compose-fade title-module text-ink">{CONSTITUTION.title}</h1>
        ) : null}
        {intro >= 2 ? (
          <p className="compose-fade aux-en mt-2">{CONSTITUTION.en}</p>
        ) : null}
        {intro >= 3 ? (
          <p className="compose-fade sys-meta mt-6">{CONSTITUTION.record}</p>
        ) : null}

        {analyzing ? (
          <p className={`compose-fade compose-code mt-12 ${settled ? "" : "is-run"}`}>
            {CONSTITUTION.scan}
            {settled ? null : <Cursor />}
          </p>
        ) : null}

        {analyzing ? (
          <div className="mt-10 space-y-10">
            <NoteStream
              title={`【${CONSTITUTION.groups[0].zh}】`}
              frames={CONSTITUTION.streams.top}
              settle={CONSTITUTION.traces["01"]}
              items={CONSTITUTION.groups[0].items.join(" / ")}
              running={!settled}
              showResult={results}
            />
            <NoteStream
              title={`【${CONSTITUTION.groups[1].zh}】`}
              frames={CONSTITUTION.streams.heart}
              settle={CONSTITUTION.traces["02"]}
              items={CONSTITUTION.groups[1].items.join(" / ")}
              running={!settled}
              showResult={results}
              offset={4}
            />
            <NoteStream
              title={`【${CONSTITUTION.groups[2].zh}】`}
              frames={CONSTITUTION.streams.base}
              settle={CONSTITUTION.traces["03"]}
              items={CONSTITUTION.groups[2].items.join(" / ")}
              running={!settled}
              showResult={results}
              offset={7}
            />
          </div>
        ) : null}

        <BackLink label="返回 仙桃夢" onClick={() => go("specimen")} />
      </div>
    </div>
  );
}

function NoteStream({
  title,
  frames,
  settle,
  items,
  running,
  showResult,
  offset = 0,
}: {
  title: string;
  frames: readonly string[];
  settle: string;
  items: string;
  running: boolean;
  showResult: boolean;
  offset?: number;
}) {
  const code = useScanStream(frames, running, settle, offset);

  return (
    <section>
      <p className="compose-fade font-sans text-[14px] text-ink">{title}</p>
      <p className={`compose-code mt-3 ${running ? "is-run" : ""}`}>
        {code}
        {running ? <Cursor /> : null}
      </p>
      {showResult ? (
        <p className="compose-fade compose-result mt-5">{CONSTITUTION.result}</p>
      ) : null}
      {showResult ? (
        <p className="compose-fade compose-items mt-4">{items}</p>
      ) : null}
    </section>
  );
}

function useScanStream(
  frames: readonly string[],
  running: boolean,
  settle: string,
  offset: number,
) {
  const scale = useScaledMs();
  const [index, setIndex] = useState(offset);

  useEffect(() => {
    if (!running) {
      return;
    }
    let cancelled = false;
    let id = 0;
    const tick = () => {
      id = window.setTimeout(() => {
        if (cancelled) {
          return;
        }
        setIndex((value) => value + 1);
        tick();
      }, scale(22 + Math.random() * 48));
    };
    tick();
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [running, scale]);

  if (!running) {
    return settle;
  }
  return frames[index % frames.length] ?? settle;
}
