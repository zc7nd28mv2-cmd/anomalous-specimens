"use client";

import { useEffect, useState } from "react";
import { useArchive } from "@/context/ArchiveContext";
import { useAudio } from "@/context/AudioContext";
import { BackLink } from "@/components/system/BackLink";
import { PulseNode } from "@/components/dialogue/PulseNode";
import { FieldRecord } from "@/components/dialogue/FieldRecord";
import { InfectionOverlay } from "@/components/finale/InfectionOverlay";
import { STORY } from "@/lib/story";
import { DOSSIER, ENDING } from "@/lib/content";

export function StoryArchive() {
  const { go, autoOpenPd001, startFinale, pd001Done, finishPd001 } = useArchive();
  const audio = useAudio();
  const [open, setOpen] = useState(autoOpenPd001);
  const [finale, setFinale] = useState<"off" | "run" | "done">(
    startFinale ? "run" : pd001Done ? "done" : "off",
  );

  useEffect(() => {
    if (autoOpenPd001 || startFinale) {
      window.setTimeout(() => {
        document.getElementById("sec-pd001")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 80);
    }
  }, [autoOpenPd001, startFinale]);

  return (
    <div className="relative min-h-dvh bg-bg px-5 py-16 sm:px-10 sm:py-20 md:px-16">
      <div className="mx-auto w-full max-w-[620px] md:ml-[6vw]">
        <p className="sys-meta">01 / 仙桃梦的故事</p>
        <h1 className="mt-4 font-sans text-[26px] font-normal text-ink sm:text-[32px]">
          仙桃梦
        </h1>
        <p className="mt-2 font-mono text-[12px] tracking-[0.08em] text-sys">
          STORY ARCHIVE
        </p>

        <section className="mt-14">
          <p className="sys-meta">[01] 项目档案</p>
          <dl className="mt-6 space-y-4">
            {[
              [DOSSIER.projectLabel, DOSSIER.project],
              [DOSSIER.classLabel, DOSSIER.classification],
              [DOSSIER.versionLabel, DOSSIER.version],
              [DOSSIER.statusLabel, DOSSIER.status],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="sys-meta">{label}</dt>
                <dd className="mt-1 font-mono text-[12px] text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 space-y-6">
            <p className="story-body">{STORY.origin.p1}</p>
            <p className="story-body">{STORY.origin.p2}</p>
          </div>
        </section>

        <section className="mt-14">
          <p className="sys-meta">[02] 记忆档案</p>
          <div className="mt-8 space-y-6">
            <p className="story-body">{STORY.interface.p1}</p>
            <p className="story-body">{STORY.reconstruction.p1}</p>
            <p className="story-body">{STORY.reconstruction.p2}</p>
            <p className="story-body pt-2">{STORY.reconstruction.summer}</p>
            <p className="story-body">{STORY.reconstruction.lover}</p>
            <p className="story-body">{STORY.reconstruction.self}</p>
            <p className="story-body pt-2">{STORY.reconstruction.unique}</p>
            <p className="mt-8 font-mono text-[13px] text-ink">{STORY.lastPlace.en}</p>
            <p className="story-body">{STORY.lastPlace.zh}</p>
          </div>
        </section>

        <section className="mt-14">
          <p className="sys-meta">[03] 终止报告</p>
          <div className="mt-8 space-y-6">
            <p className="story-body">{STORY.termination.p1}</p>
            <p className="story-body">{STORY.termination.p2}</p>
            <p className="story-body">{STORY.termination.p3}</p>
            <p className="story-body pt-2">{STORY.termination.p4}</p>
            <p className="story-body">{STORY.termination.p5}</p>
            <p className="story-body">{STORY.termination.p6}</p>
            <p className="story-body">{STORY.termination.p7}</p>
            <p className="story-body pt-4">{STORY.abandonment.lead}</p>
            <p className="mt-2 font-mono text-[13px] tracking-[0.16em] text-ink">
              {STORY.abandonment.death}
            </p>
            <p className="story-body pt-3">{STORY.abandonment.instead}</p>
            <p className="mt-2 font-mono text-[13px] tracking-[0.14em] text-ink">
              {STORY.abandonment.term}
            </p>
          </div>
        </section>

        <section className="mt-14">
          <p className="sys-meta">[04] 数据泄漏</p>
          <div className="mt-8 space-y-6">
            <p className="story-body">{STORY.leak.p1}</p>
            <p className="story-body pt-2">{STORY.leak.removedLead}</p>
            <ul className="space-y-1">
              {STORY.leak.removed.map((item) => (
                <li key={item} className="story-body">
                  {item}
                </li>
              ))}
            </ul>
            <p className="story-body pt-2">{STORY.leak.retainedLead}</p>
            <ul className="space-y-1">
              {STORY.leak.retained.map((item) => (
                <li key={item} className="story-body">
                  {item}
                </li>
              ))}
            </ul>
            <p className="story-body pt-2">{STORY.leak.pack}</p>
            <p className="font-mono text-[13px] tracking-[0.1em] text-ink">
              {STORY.leak.opium}
            </p>
            <p className="story-body">{STORY.leak.became}</p>
            <p className="font-mono text-[13px] tracking-[0.08em] text-ink">
              {STORY.leak.fragment}
            </p>
            <p className="story-body pt-2">{STORY.leak.close1}</p>
            <p className="story-body">{STORY.leak.close2}</p>
            <p className="story-body pt-8 text-mute">{STORY.city.l1}</p>
            <p className="story-body">{STORY.city.l2}</p>
          </div>
        </section>

        <section id="sec-pd001" className="mt-20 border-t border-line pt-12">
          <p className="font-mono text-[11px] tracking-[0.16em] text-green-dim">
            ARCHIVE LOG / PD-001
          </p>
          <p className="mt-3 font-sans text-[16px] text-ink">现场数据记录</p>
          <p className="mt-2 sys-meta">恢复度 91% · 未知神经中继</p>
          <div className="mt-14 flex flex-col items-center">
            <PulseNode onOpen={() => setOpen(true)} />
          </div>
        </section>

        {finale === "done" || pd001Done ? (
          <section className="mt-16 space-y-4">
            <p className="sys-meta text-danger">STATUS: CORRUPTED</p>
            <p className="story-body">{ENDING.line}</p>
            <p className="font-sans text-[13px] text-mute">{ENDING.attr}</p>
          </section>
        ) : null}

        <BackLink onClick={() => go("specimen")} />
      </div>

      {open && finale !== "run" ? (
        <div className="record-veil fixed inset-0 z-40 flex items-end justify-center bg-black/72 px-3 py-6 sm:items-center sm:px-6">
          <div className="record-panel flex max-h-[88vh] w-full max-w-[720px] flex-col border border-green-border bg-term">
            <div className="flex items-center justify-between border-b border-green-border/50 px-4 py-3">
              <p className="font-mono text-[10px] tracking-[0.16em] text-green-dim">
                PD-001 / FIELD RECORD
              </p>
              <button
                type="button"
                onClick={() => {
                  audio.click();
                  if (finale === "off") {
                    setOpen(false);
                  }
                }}
                className="font-sans text-[13px] text-mute hover:text-ink"
              >
                ← 关闭
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-1">
              <FieldRecord
                onComplete={() => {
                  if (finale === "off") {
                    setFinale("run");
                  }
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {finale === "run" ? (
        <InfectionOverlay
          onDone={() => {
            setFinale("done");
            setOpen(false);
            finishPd001();
          }}
        />
      ) : null}
    </div>
  );
}
