"use client";

import { useArchive } from "@/context/ArchiveContext";
import { useAudio } from "@/context/AudioContext";
import { BackLink } from "@/components/system/BackLink";
import { Rule } from "@/components/system/Rule";

export function PeachDreamHub() {
  const { go } = useArchive();
  const audio = useAudio();

  return (
    <div className="relative min-h-dvh bg-bg px-5 py-16 sm:px-10 sm:py-20 md:px-16">
      <div className="mx-auto w-full max-w-[620px] md:ml-[6vw]">
        <p className="sys-meta">001</p>
        <h1 className="mt-4 font-sans text-[30px] font-normal text-ink sm:text-[36px]">
          仙桃梦
        </h1>
        <p className="mt-2 font-mono text-[12px] tracking-[0.08em] text-sys">
          PEACH DREAM
        </p>
        <p className="mt-6 font-mono text-[11px] tracking-[0.08em] text-sys">
          MEDICAL NEURAL PROGRAM
        </p>
        <p className="mt-2 sys-meta">RECOVERED 91%</p>

        <div className="mt-16 space-y-10">
          <Entry
            index="01"
            title="仙桃梦的故事"
            en="STORY ARCHIVE"
            onClick={() => {
              audio.click();
              go("story");
            }}
          />
          <Entry
            index="02"
            title="构成代码"
            en="CONSTITUTION CODE"
            onClick={() => {
              audio.click();
              go("constitution");
            }}
          />
        </div>

        <BackLink onClick={() => go("index")} />
      </div>
    </div>
  );
}

function Entry({
  index,
  title,
  en,
  onClick,
}: {
  index: string;
  title: string;
  en: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      <Rule className="mb-6" />
      <p className="sys-meta">{index}</p>
      <p className="mt-3 font-sans text-[22px] font-normal text-ink sm:text-[26px]">
        {title}
      </p>
      <p className="mt-2 font-mono text-[12px] tracking-[0.08em] text-sys">{en}</p>
    </button>
  );
}
