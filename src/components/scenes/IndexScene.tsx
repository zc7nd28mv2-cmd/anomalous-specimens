"use client";

import { useState } from "react";
import { Command } from "@/components/system/Command";
import { Rule } from "@/components/system/Rule";
import { SpecimenTag } from "@/components/system/SpecimenTag";
import { SPECIMENS, SYSTEM } from "@/lib/content";
import { useAudio } from "@/context/AudioContext";

export function IndexScene({ onAccess }: { onAccess: () => void }) {
  const [denied, setDenied] = useState<string | null>(null);
  const audio = useAudio();

  return (
    <div className="relative min-h-dvh bg-bg px-5 py-16 sm:px-10 sm:py-20 md:px-16">
      <div className="mx-auto w-full max-w-[640px] md:ml-[6vw]">
        <div className="rise">
          <h1 className="font-sans text-[24px] font-medium tracking-[0.04em] text-ink sm:text-[32px]">
            {SYSTEM.titleZh}
          </h1>
          <p className="mt-3 font-mono text-[11px] tracking-[0.22em] text-sys">
            {SYSTEM.title}
          </p>
          <p className="mt-8 font-sans text-[13px] text-mute">{SYSTEM.index}</p>
        </div>

        <div className="mt-14 space-y-12">
          {SPECIMENS.map((specimen) => (
            <section key={specimen.id} className="rise">
              <Rule className="mb-7" />
              {specimen.locked ? (
                <div>
                  <SpecimenTag tone="dim">{specimen.title}</SpecimenTag>
                  <p className="mt-3 font-mono text-[12px] tracking-[0.12em] text-sys">
                    {specimen.name}
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    audio.click();
                    onAccess();
                  }}
                  className="block text-left"
                >
                  <SpecimenTag>{specimen.title}</SpecimenTag>
                  <p className="mt-3 font-mono text-[12px] tracking-[0.12em] text-sys">
                    {specimen.name}
                  </p>
                </button>
              )}
              <p className="mt-4 sys-meta">档案 / {specimen.id}</p>
              {specimen.kind ? (
                <p className="mt-3 font-sans text-[13px] text-mute">{specimen.kind}</p>
              ) : null}
              <p className="mt-2 sys-meta">状态 / {specimen.status}</p>

              {specimen.locked ? (
                <div>
                  <Command className="mt-5" onClick={() => setDenied(specimen.id)}>
                    锁定
                  </Command>
                  {denied === specimen.id ? (
                    <p className="fade mt-3 font-sans text-[13px] text-danger">
                      访问被拒绝
                    </p>
                  ) : null}
                </div>
              ) : (
                <Command className="mt-5 act px-3 py-2" onClick={onAccess}>
                  读取档案
                </Command>
              )}
            </section>
          ))}
        </div>

        <Rule className="mt-12" />
        <p className="mt-5 sys-meta">{SYSTEM.count}</p>
      </div>
    </div>
  );
}
