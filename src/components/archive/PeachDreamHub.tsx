"use client";

import { useArchive } from "@/context/ArchiveContext";
import { useAudio } from "@/context/AudioContext";
import { getSpecimen } from "@/lib/content";
import { BackLink } from "@/components/system/BackLink";
import { Rule } from "@/components/system/Rule";
import { cn } from "@/lib/cn";

export function PeachDreamHub({ reveal = false }: { reveal?: boolean }) {
  const { go, activeSpecimenId } = useArchive();
  const audio = useAudio();
  const specimen = getSpecimen(activeSpecimenId);
  const meta = specimen.metadata ?? [];

  return (
    <div
      className={cn(
        "relative min-h-dvh bg-bg px-5 py-16 sm:px-10 sm:py-20 md:px-16",
        reveal && "hub-build",
      )}
    >
      <div className="story-content mx-auto md:ml-[6vw]">
        <p className="sys-meta hub-l2">ARCHIVE / {specimen.id}</p>
        <h1 className="title-product mt-4 text-ink hub-l2">{specimen.name}</h1>
        <p className="aux-en mt-2 hub-l1">{specimen.englishName || "\u00a0"}</p>
        {meta[0] ? <p className="aux-en mt-6 hub-l3">{meta[0]}</p> : null}
        {meta[1] ? <p className="aux-en mt-1 hub-l3">{meta[1]}</p> : null}

        <div className="mt-16 space-y-4">
          <Entry
            index="01"
            title="原始资料"
            en="ORIGINAL FILES"
            action="阅读完整档案"
            onClick={() => {
              audio.click();
              go("story");
            }}
          />
          <Rule className="my-8 hub-l3" />
          <Entry
            index="02"
            title="構成代碼"
            en="CONSTITUTION CODE"
            action="查看样本构成"
            onClick={() => {
              audio.click();
              go("constitution");
            }}
          />
        </div>

        <BackLink className="hub-l4" onClick={() => go("index")} />
      </div>
    </div>
  );
}

function Entry({
  index,
  title,
  en,
  action,
  onClick,
}: {
  index: string;
  title: string;
  en: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="block w-full bg-transparent text-left shadow-none">
      <p className="sys-meta hub-l3">{index}</p>
      <p className="title-module mt-3 text-ink hub-l3">{title}</p>
      <p className="aux-en mt-2 hub-l3">{en}</p>
      <p className="mt-4 font-sans text-[13px] text-green hub-l4">
        {action}
        <span className="ml-2">→</span>
      </p>
    </button>
  );
}
