"use client";

import { useEffect } from "react";
import { ArchiveProvider, useArchive } from "@/context/ArchiveContext";
import { AudioProvider, useAudio } from "@/context/AudioContext";
import { TimingProvider } from "@/hooks/useTiming";
import { CRTOverlay } from "@/components/overlay/CRTOverlay";
import { SystemChrome } from "@/components/system/SystemChrome";
import { AudioToggle } from "@/components/system/AudioToggle";
import { BootScene } from "@/components/scenes/BootScene";
import { IndexScene } from "@/components/scenes/IndexScene";
import { PeachDreamHub } from "@/components/archive/PeachDreamHub";
import { StoryArchive } from "@/components/archive/StoryArchive";
import { ConstitutionArchive } from "@/components/archive/ConstitutionArchive";

function UnlockAudio() {
  const audio = useAudio();

  useEffect(() => {
    const unlock = () => audio.unlock();
    window.addEventListener("pointerdown", unlock);
    return () => window.removeEventListener("pointerdown", unlock);
  }, [audio]);

  return null;
}

function ArchiveInner() {
  const { phase, go } = useArchive();

  return (
    <div className="min-h-dvh bg-bg">
      <CRTOverlay />
      <UnlockAudio />
      <AudioToggle />
      {phase !== "boot" ? (
        <SystemChrome surface="archive" />
      ) : (
        <SystemChrome surface="void" />
      )}

      {phase === "boot" ? <BootScene onComplete={() => go("index")} /> : null}
      {phase === "index" || phase === "access" ? (
        <IndexScene onComplete={() => go("specimen")} />
      ) : null}
      {phase === "specimen" ? <PeachDreamHub /> : null}
      {phase === "story" ||
      phase === "pd001" ||
      phase === "unknown" ||
      phase === "ending" ? (
        <StoryArchive />
      ) : null}
      {phase === "constitution" ? <ConstitutionArchive /> : null}
    </div>
  );
}

export function ArchiveRoot() {
  return (
    <TimingProvider>
      <AudioProvider>
        <ArchiveProvider>
          <ArchiveInner />
        </ArchiveProvider>
      </AudioProvider>
    </TimingProvider>
  );
}
