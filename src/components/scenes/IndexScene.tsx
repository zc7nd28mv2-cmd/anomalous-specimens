"use client";

import { useState } from "react";
import { Command } from "@/components/system/Command";
import { Rule } from "@/components/system/Rule";
import { SPECIMENS, SYSTEM } from "@/lib/content";
import { useAudio } from "@/context/AudioContext";

export function IndexScene({ onAccess }: { onAccess: () => void }) {
  const [denied, setDenied] = useState<string | null>(null);
  const audio = useAudio();

  return (
    <div className="relative min-h-dvh bg-bg px-5 py-16 sm:px-10 sm:py-20 md:px-16">
      <div className="story-content mx-auto md:ml-[6vw]">
        <div className="rise">
          <h1 className="title-system text-ink">{SYSTEM.titleZh}</h1>
          <p className="aux-en mt-3">{SYSTEM.title}</p>
          <p className="mt-8 font-sans text-[13px] text-mute">{SYSTEM.index}</p>
        </div>

        <div className="mt-14 space-y-12">
          {SPECIMENS.map((specimen) => (
            <section key={specimen.id} className="rise">
              <Rule className="mb-7" />
              <p className="sys-meta">{specimen.id}</p>
              {specimen.locked ? (
                <div>
                  <h2 className="title-product mt-4 text-mute">{specimen.title}</h2>
                  <p className="aux-en mt-2">{specimen.name}</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    audio.click();
                    onAccess();
                  }}
                  className="block border-0 bg-transparent p-0 text-left shadow-none"
                >
                  <h2 className="title-product mt-4 text-ink">{specimen.title}</h2>
                  <p className="aux-en mt-2">{specimen.name}</p>
                </button>
              )}
              {specimen.kind ? (
                <p className="aux-en mt-5">MEDICAL NEURAL PROGRAM</p>
              ) : null}
              <p className="aux-en mt-2">
                {specimen.locked ? "RESTRICTED" : "RECOVERED 91%"}
              </p>
              <p className="mt-2 font-sans text-[13px] text-mute">
                状态 / {specimen.status}
              </p>

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
                <button
                  type="button"
                  onClick={() => {
                    audio.click();
                    onAccess();
                  }}
                  className="read-tag"
                >
                  读取档案
                </button>
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
