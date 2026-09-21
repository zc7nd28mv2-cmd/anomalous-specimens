"use client";

import { useEffect, useState } from "react";
import { useArchive } from "@/context/ArchiveContext";
import { BackLink } from "@/components/system/BackLink";
import { startNoteStreams, type NoteStreamId } from "@/lib/code-stream";
import { CONSTITUTION } from "@/lib/constitution";
import { cn } from "@/lib/cn";

export function ConstitutionArchive() {
  const { go } = useArchive();
  const [topStream, setTopStream] = useState<string>(CONSTITUTION.traces["01"]);
  const [heartStream, setHeartStream] = useState<string>(CONSTITUTION.traces["02"]);
  const [baseStream, setBaseStream] = useState<string>(CONSTITUTION.traces["03"]);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);

  useEffect(() => {
    const setters = {
      top: setTopStream,
      heart: setHeartStream,
      base: setBaseStream,
    };
    return startNoteStreams(
      (id: NoteStreamId, text: string) => {
        setters[id](text);
      },
      () => setIsAnalysisComplete(true),
    );
  }, []);

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
            running={!isAnalysisComplete}
            revealed={isAnalysisComplete}
            items={CONSTITUTION.groups[0].items.join(" / ")}
          />
          <NoteBlock
            title={`【${CONSTITUTION.groups[1].zh}】`}
            trace={heartStream}
            running={!isAnalysisComplete}
            revealed={isAnalysisComplete}
            items={CONSTITUTION.groups[1].items.join(" / ")}
          />
          <NoteBlock
            title={`【${CONSTITUTION.groups[2].zh}】`}
            trace={baseStream}
            running={!isAnalysisComplete}
            revealed={isAnalysisComplete}
            items={CONSTITUTION.groups[2].items.join(" / ")}
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
  revealed,
  items,
}: {
  title: string;
  trace: string;
  running: boolean;
  revealed: boolean;
  items: string;
}) {
  return (
    <section>
      <p className="font-sans text-[14px] text-ink">{title}</p>
      <p className={cn("compose-code mt-3", running && "is-run")}>{trace}</p>
      <p className="compose-result mt-5">{CONSTITUTION.result}</p>
      <p className="compose-items is-plate composition-materials mt-4">
        <span className={revealed ? "materials-visible" : "materials-hidden"}>
          {items}
        </span>
      </p>
    </section>
  );
}
