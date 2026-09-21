"use client";

import { useEffect, useState } from "react";
import { useArchive } from "@/context/ArchiveContext";
import { useAudio } from "@/context/AudioContext";
import { BackLink } from "@/components/system/BackLink";
import { PulseNode } from "@/components/dialogue/PulseNode";
import { FieldRecord } from "@/components/dialogue/FieldRecord";
import { ConstitutionCode } from "@/components/archive/ConstitutionCode";
import { InfectionOverlay } from "@/components/finale/InfectionOverlay";
import { STORY } from "@/lib/story";
import { DOSSIER, ENDING } from "@/lib/content";
import { FOLDERS } from "@/lib/folders";
import { cn } from "@/lib/cn";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function PeachDreamDossier() {
  const { go, autoOpenPd001, startFinale, pd001Done, finishPd001 } = useArchive();
  const audio = useAudio();
  const [open, setOpen] = useState(autoOpenPd001);
  const [finale, setFinale] = useState<"off" | "run" | "done">(
    startFinale ? "run" : pd001Done ? "done" : "off",
  );

  useEffect(() => {
    if (autoOpenPd001) {
      window.setTimeout(() => scrollToId("sec-pd001"), 80);
    }
  }, [autoOpenPd001]);

  useEffect(() => {
    if (startFinale) {
      window.setTimeout(() => scrollToId("sec-pd001"), 80);
    }
  }, [startFinale]);

  return (
    <div className="relative min-h-dvh bg-bg px-5 py-16 sm:px-10 sm:py-20 md:px-16">
      <div className="mx-auto w-full max-w-[680px] md:ml-[6vw]">
        <p className="sys-meta">档案 / 001</p>
        <h1 className="mt-5 font-sans text-[48px] font-bold leading-none tracking-tight text-ink sm:text-[64px] md:text-[72px]">
          仙桃梦
        </h1>
        <p className="phosphor mt-4 font-mono text-[13px] tracking-[0.18em] text-sys">
          PEACH DREAM
        </p>
        <p className="mt-6 font-sans text-[15px] text-mute">医疗神经程序</p>
        <p className="mt-3 sys-meta">状态 / 已恢复</p>
        <p className="sys-meta">恢复度 / 91%</p>

        <div className="mt-12 space-y-2">
          {FOLDERS.map((folder) => {
            const locked = folder.id === "unknown" && finale !== "done" && !pd001Done;
            return (
              <button
                key={folder.id}
                type="button"
                onClick={() => {
                  audio.click();
                  if (locked) {
                    return;
                  }
                  if (folder.id === "pd001") {
                    scrollToId("sec-pd001");
                    return;
                  }
                  if (folder.id === "unknown") {
                    scrollToId("sec-unknown");
                    return;
                  }
                  scrollToId(`sec-${folder.id}`);
                }}
                className={cn(
                  "flex w-full items-baseline justify-between gap-4 py-2 text-left",
                  locked && "opacity-40",
                )}
              >
                <span className="font-mono text-[11px] text-sys">[{folder.index}]</span>
                <span className="flex-1 font-sans text-[14px] text-ink">{folder.title}</span>
                <span className="font-mono text-[10px] text-sys">{folder.status}</span>
              </button>
            );
          })}
        </div>

        <section id="sec-dossier" className="mt-24">
          <Chapter label="[01]" title="项目档案" />
          <dl className="mt-8 space-y-5">
            {[
              [DOSSIER.projectLabel, DOSSIER.project],
              [DOSSIER.classLabel, DOSSIER.classification],
              [DOSSIER.versionLabel, DOSSIER.version],
              [DOSSIER.statusLabel, DOSSIER.status],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="sys-meta">{label}</dt>
                <dd className="mt-1 font-mono text-[13px] text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-12 space-y-8">
            <p className="story-body">{STORY.origin.p1}</p>
            <p className="story-body">{STORY.origin.p2}</p>
          </div>
        </section>

        <section id="sec-memory" className="mt-24">
          <Chapter label="[02]" title="记忆档案" />
          <div className="mt-12 space-y-8">
            <p className="story-body">{STORY.interface.p1}</p>
            <p className="story-body">{STORY.reconstruction.p1}</p>
            <p className="story-body">{STORY.reconstruction.p2}</p>
            <p className="story-body pt-4">{STORY.reconstruction.summer}</p>
            <p className="story-body">{STORY.reconstruction.lover}</p>
            <p className="story-body">{STORY.reconstruction.self}</p>
            <p className="story-body pt-4">{STORY.reconstruction.unique}</p>
            <p className="mt-10 font-mono text-[15px] text-ink">{STORY.lastPlace.en}</p>
            <p className="story-body">{STORY.lastPlace.zh}</p>
          </div>
        </section>

        <section id="sec-termination" className="mt-24">
          <Chapter label="[03]" title="终止报告" />
          <div className="mt-12 space-y-8">
            <p className="story-body">{STORY.termination.p1}</p>
            <p className="story-body">{STORY.termination.p2}</p>
            <p className="story-body">{STORY.termination.p3}</p>
            <p className="story-body pt-4">{STORY.termination.p4}</p>
            <p className="story-body">{STORY.termination.p5}</p>
            <p className="story-body">{STORY.termination.p6}</p>
            <p className="story-body">{STORY.termination.p7}</p>
            <p className="story-body pt-6">{STORY.abandonment.lead}</p>
            <p className="phosphor mt-2 font-mono text-[14px] tracking-[0.2em] text-ink">
              {STORY.abandonment.death}
            </p>
            <p className="story-body pt-4">{STORY.abandonment.instead}</p>
            <p className="phosphor mt-2 font-mono text-[14px] tracking-[0.16em] text-ink">
              {STORY.abandonment.term}
            </p>
          </div>
        </section>

        <section id="sec-leak" className="mt-24">
          <Chapter label="[04]" title="数据泄漏" />
          <div className="mt-12 space-y-8">
            <p className="story-body">{STORY.leak.p1}</p>
            <p className="story-body pt-4">{STORY.leak.removedLead}</p>
            <ul className="space-y-1">
              {STORY.leak.removed.map((item) => (
                <li key={item} className="story-body">
                  {item}
                </li>
              ))}
            </ul>
            <p className="story-body pt-4">{STORY.leak.retainedLead}</p>
            <ul className="space-y-1">
              {STORY.leak.retained.map((item) => (
                <li key={item} className="story-body">
                  {item}
                </li>
              ))}
            </ul>
            <p className="story-body pt-4">{STORY.leak.pack}</p>
            <p className="font-mono text-[14px] tracking-[0.12em] text-ink">
              {STORY.leak.opium}
            </p>
            <p className="story-body">{STORY.leak.became}</p>
            <p className="font-mono text-[14px] tracking-[0.1em] text-ink">
              {STORY.leak.fragment}
            </p>
            <p className="story-body pt-4">{STORY.leak.close1}</p>
            <p className="story-body">{STORY.leak.close2}</p>
            <p className="story-body pt-10 text-mute">{STORY.city.l1}</p>
            <p className="story-body">{STORY.city.l2}</p>
          </div>
        </section>

        <section id="sec-pd001" className="mt-28 border-t border-line pt-16">
          <p className="phosphor-green font-mono text-[12px] tracking-[0.16em] text-green">
            ARCHIVE LOG / PD-001
          </p>
          <p className="mt-3 font-sans text-[20px] font-bold text-ink">现场数据记录</p>
          <p className="mt-2 sys-meta">恢复度 91%</p>
          <p className="sys-meta">未知神经中继</p>

          {!open ? (
            <div className="mt-16 flex flex-col items-center">
              <PulseNode onOpen={() => setOpen(true)} />
            </div>
          ) : (
            <FieldRecord
              onComplete={() => {
                if (finale === "off") {
                  setFinale("run");
                }
              }}
            />
          )}
        </section>

        <section id="sec-unknown" className="mt-24">
          {finale === "done" || pd001Done ? (
            <div className="space-y-8">
              <Chapter label="[06]" title="未知档案" tone="danger" />
              <p className="sys-meta text-danger">STATUS: CORRUPTED</p>
              <p className="story-body pt-6">{ENDING.line}</p>
              <p className="font-sans text-[15px] text-mute">{ENDING.attr}</p>
            </div>
          ) : (
            <div className="opacity-40">
              <Chapter label="[06]" title="未知档案" />
              <p className="mt-6 sys-meta">数据损坏 · 无法读取</p>
            </div>
          )}
        </section>

        {finale === "done" || pd001Done ? (
          <div className="mt-28">
            <ConstitutionCode />
          </div>
        ) : null}

        <BackLink onClick={() => go("index")} />
      </div>

      {finale === "run" ? (
        <InfectionOverlay
          onDone={() => {
            setFinale("done");
            finishPd001();
          }}
        />
      ) : null}
    </div>
  );
}

function Chapter({
  label,
  title,
  tone,
}: {
  label: string;
  title: string;
  tone?: "danger";
}) {
  return (
    <div>
      <p className={cn("sys-meta", tone === "danger" && "text-danger")}>{label}</p>
      <h2
        className={cn(
          "mt-2 font-sans text-[22px] font-bold",
          tone === "danger" ? "text-danger" : "text-ink",
        )}
      >
        {title}
      </h2>
    </div>
  );
}
