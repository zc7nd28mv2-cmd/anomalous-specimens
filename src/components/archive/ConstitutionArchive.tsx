"use client";

import { useArchive } from "@/context/ArchiveContext";
import { BackLink } from "@/components/system/BackLink";
import { CONSTITUTION } from "@/lib/constitution";

export function ConstitutionArchive() {
  const { go } = useArchive();

  return (
    <div className="relative min-h-dvh bg-bg px-5 py-16 sm:px-10 sm:py-20 md:px-16">
      <div className="mx-auto w-full max-w-[620px] md:ml-[6vw]">
        <p className="sys-meta">02 / 构成代码</p>
        <h1 className="mt-4 font-sans text-[26px] font-normal text-ink sm:text-[32px]">
          {CONSTITUTION.title}
        </h1>
        <p className="mt-2 font-mono text-[12px] tracking-[0.08em] text-sys">
          {CONSTITUTION.en}
        </p>

        <div className="mt-14 space-y-12">
          {CONSTITUTION.groups.map((group) => (
            <section key={group.id}>
              <p className="font-mono text-[11px] tracking-[0.12em] text-sys">
                {group.id} / {group.en}
              </p>
              <p className="mt-2 font-sans text-[14px] text-mute">【{group.zh}】</p>
              <ul className="mt-5 space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="story-body">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <BackLink onClick={() => go("specimen")} />
      </div>
    </div>
  );
}
