"use client";

import { useArchive } from "@/context/ArchiveContext";
import { BackLink } from "@/components/system/BackLink";
import { CONSTITUTION } from "@/lib/constitution";

export function ConstitutionArchive() {
  const { go } = useArchive();

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
            trace={CONSTITUTION.traces["01"]}
            items={CONSTITUTION.groups[0].items.join(" / ")}
          />
          <NoteBlock
            title={`【${CONSTITUTION.groups[1].zh}】`}
            trace={CONSTITUTION.traces["02"]}
            items={CONSTITUTION.groups[1].items.join(" / ")}
          />
          <NoteBlock
            title={`【${CONSTITUTION.groups[2].zh}】`}
            trace={CONSTITUTION.traces["03"]}
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
  items,
}: {
  title: string;
  trace: string;
  items: string;
}) {
  return (
    <section>
      <p className="font-sans text-[14px] text-ink">{title}</p>
      <p className="compose-code mt-3">{trace}</p>
      <p className="compose-result mt-5">{CONSTITUTION.result}</p>
      <p className="compose-items mt-4">{items}</p>
    </section>
  );
}
