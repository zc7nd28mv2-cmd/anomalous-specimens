"use client";

import { useArchive } from "@/context/ArchiveContext";
import { BackLink } from "@/components/system/BackLink";
import { CONSTITUTION } from "@/lib/constitution";

export function ConstitutionArchive() {
  const { go } = useArchive();

  return (
    <div className="relative min-h-dvh bg-bg px-5 py-16 sm:px-10 sm:py-20 md:px-16">
      <div className="story-content mx-auto md:ml-[6vw]">
        <p className="sys-meta">ARCHIVE / 001</p>
        <p className="aux-en mt-2">02 / CONSTITUTION CODE</p>
        <h1 className="title-archive mt-5 text-ink">{CONSTITUTION.title}</h1>
        <p className="aux-en mt-2">{CONSTITUTION.en}</p>

        <div className="mt-14 space-y-12">
          {CONSTITUTION.groups.map((group) => (
            <section key={group.id}>
              <p className="font-sans text-[14px] text-ink">【{group.zh}】</p>
              <p className="story-body mt-4">{group.items.join(" / ")}</p>
            </section>
          ))}
        </div>

        <BackLink label="返回 仙桃梦" onClick={() => go("specimen")} />
      </div>
    </div>
  );
}
