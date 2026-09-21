"use client";

import { useArchive } from "@/context/ArchiveContext";
import { FOLDERS, FOLDER_FILES, type FolderId } from "@/lib/folders";
import { STORY } from "@/lib/story";
import { DOSSIER } from "@/lib/content";
import { Command } from "@/components/system/Command";
import { StoryLine } from "@/components/system/Stage";
import { cn } from "@/lib/cn";

export function ArchiveReader() {
  const { folder, file, openFile, closeReader } = useArchive();
  if (!folder || folder === "pd001" || folder === "unknown") {
    return null;
  }

  const meta = FOLDERS.find((item) => item.id === folder);
  const files = FOLDER_FILES[folder];
  const active = file ?? files[0]?.id ?? null;

  return (
    <div className="relative min-h-dvh bg-bg px-5 py-16 sm:px-10 sm:py-20 md:px-16">
      <div className="mx-auto w-full max-w-[640px] md:ml-[6vw]">
        <p className="font-mono text-[10px] tracking-[0.2em] text-sys">FILE OPENED</p>
        <p className="phosphor mt-3 font-mono text-[13px] tracking-[0.14em] text-ink">
          {meta?.title}
        </p>

        <div className="mt-8 space-y-2">
          {files.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openFile(item.id)}
              className={cn(
                "folder-plate flex w-full items-baseline justify-between gap-4 px-3 py-3 text-left transition-colors duration-300",
                active === item.id ? "border-green-dim text-ink" : "text-sys hover:text-mute",
              )}
            >
              <span className="font-mono text-[10px] tracking-[0.16em]">
                {item.label}
              </span>
              <span className="font-mono text-[11px] tracking-[0.08em]">
                {item.name}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-10">
          {active ? (
            <>
              <p className="mb-6 font-mono text-[10px] tracking-[0.18em] text-sys">
                {files.find((item) => item.id === active)?.name}
              </p>
              <FileBody folder={folder} file={active} />
            </>
          ) : null}
        </div>

        <Command onClick={closeReader}>CLOSE FILE</Command>
      </div>
    </div>
  );
}

function FileBody({ folder, file }: { folder: FolderId; file: string }) {
  if (folder === "dossier" && file === "classification") {
    return (
      <dl className="space-y-7">
        {[
          [DOSSIER.projectLabel, DOSSIER.project],
          [DOSSIER.classLabel, DOSSIER.classification],
          [DOSSIER.versionLabel, DOSSIER.version],
          [DOSSIER.statusLabel, DOSSIER.status],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="font-mono text-[10px] tracking-[0.18em] text-sys">{label}</dt>
            <dd className="mt-2 font-mono text-[13px] text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  if (folder === "dossier" && file === "origin") {
    return (
      <div className="space-y-6">
        <StoryLine>{STORY.origin.p1}</StoryLine>
        <StoryLine>{STORY.origin.p2}</StoryLine>
      </div>
    );
  }

  if (folder === "memory" && file === "interface") {
    return <StoryLine>{STORY.interface.p1}</StoryLine>;
  }

  if (folder === "memory" && file === "reconstruct") {
    return (
      <div className="space-y-6">
        <StoryLine>{STORY.reconstruction.p1}</StoryLine>
        <StoryLine>{STORY.reconstruction.p2}</StoryLine>
        <StoryLine className="pt-4">{STORY.reconstruction.summer}</StoryLine>
        <StoryLine>{STORY.reconstruction.lover}</StoryLine>
        <StoryLine>{STORY.reconstruction.self}</StoryLine>
        <StoryLine className="pt-4">{STORY.reconstruction.unique}</StoryLine>
      </div>
    );
  }

  if (folder === "memory" && file === "last-place") {
    return (
      <div className="space-y-5">
        <p className="font-mono text-[13px] leading-8 text-ink">
          {STORY.lastPlace.en}
        </p>
        <StoryLine>{STORY.lastPlace.zh}</StoryLine>
      </div>
    );
  }

  if (folder === "termination" && file === "beta") {
    return (
      <div className="space-y-5">
        <StoryLine>{STORY.termination.p1}</StoryLine>
        <StoryLine>{STORY.termination.p2}</StoryLine>
        <StoryLine>{STORY.termination.p3}</StoryLine>
        <StoryLine className="pt-3">{STORY.termination.p4}</StoryLine>
        <StoryLine>{STORY.termination.p5}</StoryLine>
        <StoryLine>{STORY.termination.p6}</StoryLine>
        <StoryLine>{STORY.termination.p7}</StoryLine>
      </div>
    );
  }

  if (folder === "termination" && file === "abandonment") {
    return (
      <div className="space-y-6">
        <StoryLine>{STORY.abandonment.lead}</StoryLine>
        <p className="phosphor font-mono text-[13px] tracking-[0.24em] text-ink">
          {STORY.abandonment.death}
        </p>
        <StoryLine>{STORY.abandonment.instead}</StoryLine>
        <p className="phosphor font-mono text-[13px] tracking-[0.16em] text-ink">
          {STORY.abandonment.term}
        </p>
      </div>
    );
  }

  if (folder === "leak" && file === "theft") {
    return (
      <div className="space-y-5">
        <StoryLine>{STORY.leak.p1}</StoryLine>
        <StoryLine className="pt-3">{STORY.leak.removedLead}</StoryLine>
        <ul className="space-y-1 font-sans text-[15px] text-mute">
          {STORY.leak.removed.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <StoryLine className="pt-3">{STORY.leak.retainedLead}</StoryLine>
        <ul className="space-y-1 font-sans text-[15px] text-mute">
          {STORY.leak.retained.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (folder === "leak" && file === "fragment") {
    return (
      <div className="space-y-5">
        <StoryLine>{STORY.leak.pack}</StoryLine>
        <p className="font-mono text-[13px] tracking-[0.14em] text-ink">
          {STORY.leak.opium}
        </p>
        <StoryLine className="pt-3">{STORY.leak.became}</StoryLine>
        <p className="font-mono text-[13px] tracking-[0.1em] text-ink">
          {STORY.leak.fragment}
        </p>
        <StoryLine className="pt-4">{STORY.leak.close1}</StoryLine>
        <StoryLine>{STORY.leak.close2}</StoryLine>
      </div>
    );
  }

  if (folder === "leak" && file === "city") {
    return (
      <div className="space-y-6 py-8">
        <p className="font-sans text-[15px] leading-[2] text-mute">{STORY.city.l1}</p>
        <p className="font-sans text-[15px] leading-[2] text-ink/90">{STORY.city.l2}</p>
      </div>
    );
  }

  return null;
}
