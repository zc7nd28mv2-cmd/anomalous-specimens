"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArchiveProvider, useArchive } from "@/context/ArchiveContext";
import { AudioProvider, useAudio } from "@/context/AudioContext";
import { TimingProvider, usePrefersReducedMotion, useScaledMs } from "@/hooks/useTiming";
import { CRTOverlay } from "@/components/overlay/CRTOverlay";
import { ArchiveCut } from "@/components/overlay/ArchiveCut";
import { SystemChrome } from "@/components/system/SystemChrome";
import { AudioToggle } from "@/components/system/AudioToggle";
import { BootScene } from "@/components/scenes/BootScene";
import { IndexScene } from "@/components/scenes/IndexScene";
import { PeachDreamHub } from "@/components/archive/PeachDreamHub";
import { StoryArchive } from "@/components/archive/StoryArchive";
import { CrystalBloomArchive } from "@/components/archive/CrystalBloomArchive";
import { ConstitutionArchive } from "@/components/archive/ConstitutionArchive";
import { WarningSequence } from "@/components/dialogue/WarningSequence";

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
  const {
    phase,
    go,
    activeSpecimenId,
    warningOverlayLive,
    warningOverlayRun,
    finishWarningOverlay,
  } = useArchive();
  const scale = useScaledMs();
  const reduced = usePrefersReducedMotion();
  const [cut, setCut] = useState(false);
  const [hubReveal, setHubReveal] = useState(false);
  const cutting = useRef(false);

  const startReadCut = useCallback(() => {
    if (cutting.current) {
      return;
    }
    cutting.current = true;
    setCut(true);
    const wait = reduced ? 80 : 320;
    window.setTimeout(() => {
      go("specimen");
      setHubReveal(true);
      setCut(false);
      cutting.current = false;
    }, scale(wait));
  }, [go, reduced, scale]);

  useEffect(() => {
    if (phase !== "specimen") {
      setHubReveal(false);
    }
  }, [phase]);

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
        <IndexScene onComplete={startReadCut} />
      ) : null}
      {phase === "specimen" ? <PeachDreamHub reveal={hubReveal} /> : null}
      {phase === "story" ||
      phase === "pd001" ||
      phase === "unknown" ||
      phase === "ending" ? (
        activeSpecimenId === "002" ? (
          <CrystalBloomArchive />
        ) : (
          <StoryArchive />
        )
      ) : null}
      {phase === "constitution" ? <ConstitutionArchive /> : null}
      {warningOverlayLive ? (
        <WarningSequence
          key={warningOverlayRun}
          runId={warningOverlayRun}
          onDone={finishWarningOverlay}
        />
      ) : null}
      {cut ? <ArchiveCut /> : null}
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
