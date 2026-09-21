"use client";

import { useState } from "react";
import { Command } from "@/components/system/Command";
import { Rule } from "@/components/system/Rule";
import { SPECIMENS, SYSTEM } from "@/lib/content";
import { useAudio } from "@/context/AudioContext";
import { cn } from "@/lib/cn";

export function IndexScene({ onAccess }: { onAccess: () => void }) {
  const [denied, setDenied] = useState<string | null>(null);
  const audio = useAudio();

  return (
    <div className="relative min-h-dvh bg-bg px-5 py-16 sm:px-10 sm:py-20 md:px-16">
      <div className="mx-auto w-full max-w-[720px] md:ml-[6vw]">
        <div className="rise">
          <h1 className="font-sans text-[48px] font-bold leading-none tracking-tight text-ink sm:text-[64px] md:text-[72px]">
            {SYSTEM.titleZh}
          </h1>
          <p className="phosphor mt-4 font-mono text-[11px] tracking-[0.26em] text-sys">
            {SYSTEM.title}
          </p>
          <p className="mt-8 font-sans text-[14px] text-mute">{SYSTEM.index}</p>
        </div>

        <div className="mt-16 space-y-14">
          {SPECIMENS.map((specimen) => (
            <section key={specimen.id} className="rise">
              <Rule className="mb-8" />
              <p className="sys-meta">档案 / {specimen.id}</p>
              {specimen.locked ? (
                <>
                  <h2 className="mt-4 font-sans text-[28px] font-bold text-mute sm:text-[32px]">
                    {specimen.title}
                  </h2>
                  <p className="mt-2 font-mono text-[12px] tracking-[0.14em] text-sys">
                    {specimen.name}
                  </p>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    audio.click();
                    onAccess();
                  }}
                  className="block text-left"
                >
                  <h2 className="mt-4 font-sans text-[40px] font-bold leading-none text-ink sm:text-[56px] md:text-[64px]">
                    {specimen.title}
                  </h2>
                  <p className="mt-3 font-mono text-[13px] tracking-[0.16em] text-sys">
                    {specimen.name}
                  </p>
                </button>
              )}
              {specimen.kind ? (
                <p className="mt-5 font-sans text-[14px] text-mute">{specimen.kind}</p>
              ) : null}
              <p className={cn("mt-3 sys-meta", specimen.locked && "text-sys")}>
                状态 / {specimen.status}
              </p>

              {specimen.locked ? (
                <div>
                  <Command
                    className="mt-6"
                    onClick={() => setDenied(specimen.id)}
                  >
                    锁定
                  </Command>
                  {denied === specimen.id ? (
                    <p className="fade mt-4 font-sans text-[13px] text-danger">
                      访问被拒绝
                    </p>
                  ) : null}
                </div>
              ) : (
                <Command className="mt-6 act px-3 py-2" onClick={onAccess}>
                  读取档案
                </Command>
              )}
            </section>
          ))}
        </div>

        <Rule className="mt-14" />
        <p className="mt-6 sys-meta">{SYSTEM.count}</p>
      </div>
    </div>
  );
}
