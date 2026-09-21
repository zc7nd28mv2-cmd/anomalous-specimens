"use client";

import { useArchive } from "@/context/ArchiveContext";
import { FOLDERS, type FolderId } from "@/lib/folders";
import { cn } from "@/lib/cn";
import { Command } from "@/components/system/Command";

export function SpecimenHome() {
  const { openFolder, go, pd001Done } = useArchive();

  return (
    <div className="relative min-h-dvh bg-bg px-5 py-16 sm:px-10 sm:py-20 md:px-16">
      <div className="mx-auto w-full max-w-[640px] md:ml-[6vw]">
        <p className="phosphor font-mono text-[11px] tracking-[0.26em] text-ink">
          ANOMALOUS SPECIMENS
        </p>
        <p className="mt-2 font-mono text-[10px] tracking-[0.2em] text-sys">
          ARCHIVE / 001
        </p>
        <h1 className="phosphor mt-8 font-mono text-[16px] tracking-[0.16em] text-ink sm:text-[18px]">
          PEACH DREAM
        </h1>
        <p className="mt-2 font-sans text-[15px] text-mute">「仙桃夢」</p>

        {pd001Done ? (
          <p className="mt-8 font-mono text-[10px] tracking-[0.16em] text-danger">
            UNKNOWN SIGNAL DETECTED
          </p>
        ) : null}

        <div className="mt-12 space-y-3">
          {FOLDERS.map((folder) => {
            const locked = folder.id === "unknown" && !pd001Done;
            const corrupted = folder.id === "unknown" && pd001Done;
            return (
              <button
                key={folder.id}
                type="button"
                onClick={() => {
                  if (locked) {
                    return;
                  }
                  openFolder(folder.id as FolderId);
                }}
                className={cn(
                  "folder-plate block w-full px-4 py-4 text-left transition-colors duration-300 sm:px-5",
                  locked && "opacity-40",
                  corrupted && "border-danger-dim",
                )}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-mono text-[10px] tracking-[0.2em] text-sys">
                    [{folder.index}]
                  </p>
                  <p
                    className={cn(
                      "font-mono text-[10px] tracking-[0.16em]",
                      corrupted ? "text-danger" : "text-sys",
                    )}
                  >
                    {corrupted ? "CORRUPTED" : folder.status}
                  </p>
                </div>
                <p
                  className={cn(
                    "mt-3 font-mono text-[13px] tracking-[0.1em]",
                    folder.id === "pd001" ? "phosphor-green text-green" : "text-ink",
                    corrupted && "phosphor-red text-danger",
                  )}
                >
                  {folder.title}
                </p>
                <p className="mt-1 font-mono text-[11px] tracking-[0.08em] text-mute">
                  {folder.subtitle}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] tracking-[0.12em] text-sys">
                  <span>{folder.kind}</span>
                  <span>
                    {corrupted ? "RECOVERY —" : `RECOVERY ${folder.recovery}`}
                  </span>
                  <span>{corrupted ? "STAMP —" : folder.stamp}</span>
                </div>
              </button>
            );
          })}
        </div>

        <Command className="mt-10" onClick={() => go("index")}>
          RETURN
        </Command>
      </div>
    </div>
  );
}
