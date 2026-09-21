"use client";

import { useArchive } from "@/context/ArchiveContext";
import { BackLink } from "@/components/system/BackLink";
import { Command } from "@/components/system/Command";
import { Rule } from "@/components/system/Rule";

export function PeachDreamHub() {
  const { go } = useArchive();

  return (
    <div className="relative min-h-dvh bg-bg px-5 py-16 sm:px-10 sm:py-20 md:px-16">
      <div className="story-content mx-auto md:ml-[6vw]">
        <p className="sys-meta">ARCHIVE / 001</p>
        <h1 className="title-product mt-4 text-ink">仙桃夢</h1>
        <p className="aux-en mt-2">PEACH DREAM</p>
        <p className="aux-en mt-6">MEDICAL NEURAL PROGRAM</p>
        <p className="aux-en mt-1">RECOVERED 91%</p>

        <div className="mt-16 space-y-4">
          <Entry
            index="01"
            title="原始资料"
            en="ORIGINAL FILES"
            action="阅读完整档案"
            onClick={() => go("story")}
          />
          <Rule className="my-8" />
          <Entry
            index="02"
            title="構成代碼"
            en="CONSTITUTION CODE"
            action="查看样本构成"
            onClick={() => go("constitution")}
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
    <div>
      <p className="sys-meta">{index}</p>
      <p className="title-module mt-3 text-ink">{title}</p>
      <p className="aux-en mt-2">{en}</p>
      <Command className="mt-4" onClick={onClick}>
        {action}
      </Command>
    </div>
  );
}
