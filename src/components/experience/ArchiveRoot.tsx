"use client";

import { ArchiveProvider, useArchive } from "@/context/ArchiveContext";
import { TimingProvider } from "@/hooks/useTiming";
import { CRTOverlay } from "@/components/overlay/CRTOverlay";
import { SystemChrome } from "@/components/system/SystemChrome";
import { BootScene } from "@/components/scenes/BootScene";
import { IndexScene } from "@/components/scenes/IndexScene";
import { AccessScene } from "@/components/scenes/AccessScene";
import { SpecimenHome } from "@/components/archive/SpecimenHome";
import { ArchiveReader } from "@/components/archive/ArchiveReader";
import { DialogueTerminal } from "@/components/dialogue/DialogueTerminal";
import { UnknownSequence } from "@/components/finale/UnknownSequence";

function ArchiveInner() {
  const { phase, folder, go } = useArchive();

  return (
    <div className="min-h-dvh bg-bg">
      <CRTOverlay />
      {phase !== "pd001" && phase !== "unknown" && phase !== "ending" ? (
        <SystemChrome
          surface={
            phase === "boot" ? "void" : phase === "access" ? "archive" : "archive"
          }
        />
      ) : null}

      {phase === "boot" ? <BootScene onComplete={() => go("index")} /> : null}
      {phase === "index" ? <IndexScene onAccess={() => go("access")} /> : null}
      {phase === "access" ? (
        <AccessScene onComplete={() => go("specimen")} />
      ) : null}
      {phase === "specimen" && !folder ? <SpecimenHome /> : null}
      {phase === "specimen" && folder ? <ArchiveReader /> : null}
      {phase === "pd001" ? <DialogueTerminal /> : null}
      {phase === "unknown" || phase === "ending" ? <UnknownSequence /> : null}
    </div>
  );
}

export function ArchiveRoot() {
  return (
    <TimingProvider>
      <ArchiveProvider>
        <ArchiveInner />
      </ArchiveProvider>
    </TimingProvider>
  );
}
