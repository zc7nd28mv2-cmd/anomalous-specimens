"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useArchive } from "@/context/ArchiveContext";
import { useAudio } from "@/context/AudioContext";
import { BackLink } from "@/components/system/BackLink";
import { PulseNode } from "@/components/dialogue/PulseNode";
import { SimpleFieldLog } from "@/components/dialogue/SimpleFieldLog";
import { InfectionOverlay } from "@/components/finale/InfectionOverlay";
import { resetYumeProtocol } from "@/components/finale/YumeProtocol";
import {
  CRYSTAL_BLOOM_BLOCKS,
  CRYSTAL_BLOOM_DOSSIER,
  CRYSTAL_BLOOM_LOG_META,
} from "@/lib/crystal-bloom";
import { cn } from "@/lib/cn";

export function CrystalBloomArchive() {
  const {
    go,
    archiveEnterTop,
    fieldOpen,
    field,
    fieldEpoch,
    openField,
    closeField,
    patchField,
  } = useArchive();
  const audio = useAudio();
  const [closing, setClosing] = useState(false);
  const [fieldMounted, setFieldMounted] = useState(fieldOpen);
  const [finale, setFinale] = useState<"off" | "run" | "done">("off");
  const [canLeave, setCanLeave] = useState(field.canLeave);
  const canLeaveRef = useRef(field.canLeave);
  const closeTimer = useRef<number | null>(null);

  if (fieldOpen && !fieldMounted) {
    setFieldMounted(true);
  }

  useEffect(() => {
    if (!archiveEnterTop) {
      return;
    }
    window.scrollTo(0, 0);
  }, [archiveEnterTop]);

  useEffect(() => {
    return () => {
      if (closeTimer.current != null) {
        window.clearTimeout(closeTimer.current);
      }
    };
  }, []);

  const closeModal = useCallback(() => {
    if (finale !== "off") {
      return;
    }
    setClosing(true);
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current);
    }
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      closeField();
      setClosing(false);
    }, 240);
  }, [closeField, finale]);

  const leaveArchive = useCallback(() => {
    if (finale !== "off") {
      return;
    }
    audio.click();
    setFinale("run");
  }, [audio, finale]);

  const handleRecordClose = useCallback(() => {
    if (canLeaveRef.current || canLeave) {
      leaveArchive();
      return;
    }
    audio.click();
    closeModal();
  }, [audio, canLeave, closeModal, leaveArchive]);

  const handleReadyToLeave = useCallback(() => {
    canLeaveRef.current = true;
    setCanLeave(true);
    patchField({ canLeave: true });
  }, [patchField]);

  const visible = fieldOpen || closing;
  const fieldActive = fieldOpen && !closing && finale !== "run";
  const lastIndex = CRYSTAL_BLOOM_BLOCKS.length - 1;

  return (
    <div className="relative min-h-dvh bg-bg px-5 py-16 sm:px-10 sm:py-20 md:px-16">
      <div className="story-content mx-auto md:ml-[6vw]">
        <p className="sys-meta">ARCHIVE / 002</p>
        <p className="aux-en mt-2">01 / ORIGINAL FILES</p>
        <h1 className="title-product mt-5 text-ink">晶蕊體</h1>
        <p className="aux-en mt-2">CRYSTAL BLOOM</p>

        <dl className="mt-12 space-y-4">
          {CRYSTAL_BLOOM_DOSSIER.map(([label, value]) => (
            <div key={label}>
              <dt className="sys-meta">{label}</dt>
              <dd className="aux-en mt-1 text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 space-y-4">
          {CRYSTAL_BLOOM_BLOCKS.map((block, index) => (
            <p
              key={`${index}-${block.slice(0, 12)}`}
              className={cn(
                "story-body",
                index === lastIndex && "story-lift story-strong story-breathe",
              )}
            >
              {block.split("\n").map((line, lineIndex) => (
                <span key={`${index}-${lineIndex}`}>
                  {lineIndex > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </p>
          ))}
        </div>

        <section id="sec-mo808" className="mt-16">
          <div className="field-module">
            <div className="field-titlebar">現場數據記錄</div>
            <div className="field-meta">
              <p>ARCHIVE LOG / {CRYSTAL_BLOOM_LOG_META.id}</p>
              <p>STATUS: {CRYSTAL_BLOOM_LOG_META.status}</p>
              <p>SOURCE: {CRYSTAL_BLOOM_LOG_META.source}</p>
            </div>
            <div className="field-node">
              <PulseNode onOpen={() => openField()} />
            </div>
          </div>
        </section>

        <BackLink
          label="返回 晶蕊體"
          onClick={() => {
            if (finale === "run") {
              return;
            }
            go("specimen");
          }}
        />
      </div>

      {fieldMounted && finale !== "run" ? (
        <div
          className={cn(
            "record-veil fixed inset-0 flex items-center justify-center bg-black/72 px-6 py-10",
            !visible && "invisible pointer-events-none",
          )}
          aria-hidden={!visible}
          inert={!visible}
        >
          <div className={cn("pd-modal", closing && "is-out")}>
            <div className="flex shrink-0 items-center justify-between border-b border-green-border/50 px-5 py-3">
              <div>
                <p className="aux-en text-green-dim">
                  ARCHIVE LOG / {CRYSTAL_BLOOM_LOG_META.id}
                </p>
                <p className="mt-1 font-sans text-[13px] text-mute">現場數據記錄</p>
              </div>
              <button
                type="button"
                onClick={handleRecordClose}
                className="font-mono text-[14px] text-mute hover:text-ink"
              >
                ×
              </button>
            </div>
            <SimpleFieldLog
              key={fieldEpoch}
              active={fieldActive}
              initialDone={canLeave}
              onReadyToLeave={handleReadyToLeave}
            />
          </div>
        </div>
      ) : null}

      {finale === "run" ? (
        <InfectionOverlay
          onDone={() => {
            resetYumeProtocol();
            setFinale("done");
            closeField();
            go("specimen");
          }}
        />
      ) : null}
    </div>
  );
}
