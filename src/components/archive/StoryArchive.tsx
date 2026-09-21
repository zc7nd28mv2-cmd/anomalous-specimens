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
import { cn } from "@/lib/cn";

export function StoryArchive() {
  const { go, autoOpenPd001, startFinale, pd001Done, finishPd001 } = useArchive();
  const audio = useAudio();
  const [open, setOpen] = useState(autoOpenPd001);
  const [closing, setClosing] = useState(false);
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

  function closeModal() {
    if (finale !== "off") {
      return;
    }
    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 240);
  }

  return (
    <div className="relative min-h-dvh bg-bg px-5 py-16 sm:px-10 sm:py-20 md:px-16">
      <div className="story-content mx-auto md:ml-[6vw]">
        <p className="sys-meta">ARCHIVE / 001</p>
        <p className="aux-en mt-2">01 / ORIGINAL FILES</p>
        <h1 className="title-product mt-5 text-ink">仙桃夢</h1>
        <p className="aux-en mt-2">PEACH DREAM</p>

        <dl className="mt-12 space-y-4">
          {[
            [DOSSIER.projectLabel, DOSSIER.project],
            [DOSSIER.classLabel, DOSSIER.classification],
            [DOSSIER.versionLabel, DOSSIER.version],
            [DOSSIER.statusLabel, DOSSIER.status],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="sys-meta">{label}</dt>
              <dd className="aux-en mt-1 text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 space-y-6">
          <p className="story-body">{STORY.origin.p1}</p>
          <p className="story-body">{STORY.origin.p2}</p>
        </div>

        <div className="story-divider" />

        <div className="space-y-6">
          <p className="story-body">{STORY.interface.p1}</p>
          <p className="story-body">{STORY.reconstruction.p1}</p>
          <p className="story-body">{STORY.reconstruction.p2}</p>
          <p className="story-body">{STORY.reconstruction.summer}</p>
          <p className="story-body">{STORY.reconstruction.lover}</p>
          <p className="story-body">{STORY.reconstruction.self}</p>
          <p className="story-body">{STORY.reconstruction.unique}</p>
          <p className="story-key mt-6">{STORY.lastPlace.en}</p>
          <p className="story-body">{STORY.lastPlace.zh}</p>
        </div>

        <div className="story-divider" />

        <div className="space-y-6">
          <p className="story-body">{STORY.termination.p1}</p>
          <p className="story-body">{STORY.termination.p2}</p>
          <p className="story-body">{STORY.termination.p3}</p>
          <p className="story-body">{STORY.termination.p4}</p>
          <p className="story-body">{STORY.termination.p5}</p>
          <p className="story-body">{STORY.termination.p6}</p>
          <p className="story-body">{STORY.termination.p7}</p>
          <p className="story-body">{STORY.abandonment.lead}</p>
          <p className="story-key">{STORY.abandonment.death}</p>
          <p className="story-body">{STORY.abandonment.instead}</p>
          <p className="story-key">{STORY.abandonment.term}</p>
        </div>

        <div className="story-divider" />

        <div className="space-y-6">
          <p className="story-body">{STORY.leak.p1}</p>
          <p className="story-body">{STORY.leak.removedLead}</p>
          <ul className="space-y-1">
            {STORY.leak.removed.map((item) => (
              <li key={item} className="story-body">
                {item}
              </li>
            ))}
          </ul>
          <p className="story-body">{STORY.leak.retainedLead}</p>
          <ul className="space-y-1">
            {STORY.leak.retained.map((item) => (
              <li key={item} className="story-body">
                {item}
              </li>
            ))}
          </ul>
          <p className="story-body">{STORY.leak.pack}</p>
          <p className="story-key">{STORY.leak.opium}</p>
          <p className="story-body">{STORY.leak.became}</p>
          <p className="story-key">{STORY.leak.fragment}</p>
          <p className="story-body">{STORY.leak.close1}</p>
          <p className="story-body">{STORY.leak.close2}</p>
        </div>

        <div className="story-divider" />

        <div className="space-y-6">
          <p className="story-body">{STORY.city.lead}</p>
          <p className="story-body">{STORY.city.l1}</p>
          <p className="story-rumor">{STORY.city.l2}</p>
        </div>

        <section id="sec-pd001" className="mt-16">
          <p className="aux-en text-green-dim">ARCHIVE LOG / PD-001</p>
          <div className="field-module mt-4">
            <div className="field-titlebar">現場數據記錄</div>
            <div className="field-node">
              <PulseNode onOpen={() => setOpen(true)} />
            </div>
          </div>
        </section>

        {finale === "done" || pd001Done ? (
          <section className="mt-16 space-y-4">
            <p className="sys-meta text-danger">STATUS: CORRUPTED</p>
            <p className="story-body">{ENDING.line}</p>
            <p className="font-sans text-[13px] text-mute">{ENDING.attr}</p>
          </section>
        ) : null}

        <BackLink label="返回 仙桃夢" onClick={() => go("specimen")} />
      </div>

      {open && finale !== "run" ? (
        <div className="record-veil fixed inset-0 z-40 flex items-center justify-center bg-black/72 px-6 py-10">
          <div className={cn("pd-modal", closing && "is-out")}>
            <div className="flex shrink-0 items-center justify-between border-b border-green-border/50 px-5 py-3">
              <div>
                <p className="aux-en text-green-dim">ARCHIVE LOG / PD-001</p>
                <p className="mt-1 font-sans text-[13px] text-mute">現場數據記錄</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  audio.click();
                  closeModal();
                }}
                className="font-mono text-[14px] text-mute hover:text-ink"
              >
                ×
              </button>
            </div>
            <FieldRecord
              onComplete={() => {
                if (finale === "off") {
                  setFinale("run");
                }
              }}
            />
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
