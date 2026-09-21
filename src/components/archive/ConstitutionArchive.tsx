"use client";

import { useEffect, useState } from "react";
import { useArchive } from "@/context/ArchiveContext";
import { BackLink } from "@/components/system/BackLink";
import {
  startMaterialReveal,
  startNoteStreams,
  type NoteStreamId,
} from "@/lib/code-stream";
import { CONSTITUTION } from "@/lib/constitution";
import { cn } from "@/lib/cn";

type Phase = "analyzing" | "complete" | "reveal" | "stable";

const MATERIAL_LINES = [
  CONSTITUTION.groups[0].items.join(" / "),
  CONSTITUTION.groups[1].items.join(" / "),
  CONSTITUTION.groups[2].items.join(" / "),
] as const;

export function ConstitutionArchive() {
  const { go } = useArchive();
  const [topStream, setTopStream] = useState<string>(CONSTITUTION.traces["01"]);
  const [heartStream, setHeartStream] = useState<string>(CONSTITUTION.traces["02"]);
  const [baseStream, setBaseStream] = useState<string>(CONSTITUTION.traces["03"]);
  const [phase, setPhase] = useState<Phase>("analyzing");
  const [typed, setTyped] = useState<[string, string, string]>(["", "", ""]);

  useEffect(() => {
    const setters = {
      top: setTopStream,
      heart: setHeartStream,
      base: setBaseStream,
    };
    let stopReveal: (() => void) | null = null;
    const stopStreams = startNoteStreams(
      (id: NoteStreamId, text: string) => {
        setters[id](text);
      },
      () => {
        setPhase("complete");
        stopReveal = startMaterialReveal(
          MATERIAL_LINES,
          (parts) => {
            setPhase((current) => (current === "analyzing" ? current : "reveal"));
            setTyped(parts);
          },
          () => setPhase("stable"),
        );
      },
    );
    return () => {
      stopStreams();
      stopReveal?.();
    };
  }, []);

  const analyzing = phase === "analyzing";
  const showPlate = phase !== "analyzing";

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-bg px-5 py-16 sm:px-10 sm:py-20 md:px-16">
      <div className="story-content mx-auto md:ml-[6vw]">
        <h1 className="title-module text-ink">{CONSTITUTION.title}</h1>
        <p className="aux-en mt-2">{CONSTITUTION.en}</p>
        <p className="sys-meta mt-6">{CONSTITUTION.record}</p>

        <p className="compose-code mt-12">{CONSTITUTION.scan}</p>

        <div className="mt-10 space-y-10">
          <NoteBlock
            title={`【${CONSTITUTION.groups[0].zh}】`}
            trace={topStream}
            running={analyzing}
            showPlate={showPlate}
            typed={phase === "stable" ? MATERIAL_LINES[0] : typed[0]}
          />
          <NoteBlock
            title={`【${CONSTITUTION.groups[1].zh}】`}
            trace={heartStream}
            running={analyzing}
            showPlate={showPlate}
            typed={phase === "stable" ? MATERIAL_LINES[1] : typed[1]}
          />
          <NoteBlock
            title={`【${CONSTITUTION.groups[2].zh}】`}
            trace={baseStream}
            running={analyzing}
            showPlate={showPlate}
            typed={phase === "stable" ? MATERIAL_LINES[2] : typed[2]}
          />
        </div>

        <BackLink label="返回 仙桃夢" onClick={() => go("specimen")} />
      </div>
    </div>
  );
}

function NoteBlock({
  title,
  trace,
  running,
  showPlate,
  typed,
}: {
  title: string;
  trace: string;
  running: boolean;
  showPlate: boolean;
  typed: string;
}) {
  return (
    <section>
      <p className="font-sans text-[14px] text-ink">{title}</p>
      <p className={cn("compose-code mt-3", running && "is-run")}>{trace}</p>
      <p className="compose-result mt-5">{CONSTITUTION.result}</p>
      <div className="composition-slot">
        {showPlate ? (
          <p className="compose-items is-plate composition-materials">
            {typed}
          </p>
        ) : null}
      </div>
    </section>
  );
}
