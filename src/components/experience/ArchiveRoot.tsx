"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { AbandonmentScene } from "@/components/scenes/AbandonmentScene";
import { AccessScene } from "@/components/scenes/AccessScene";
import { BootScene } from "@/components/scenes/BootScene";
import { CityScene } from "@/components/scenes/CityScene";
import { CodeScene } from "@/components/scenes/CodeScene";
import { CorruptionScene } from "@/components/scenes/CorruptionScene";
import { CriticalScene } from "@/components/scenes/CriticalScene";
import { DossierScene } from "@/components/scenes/DossierScene";
import { EndingScene } from "@/components/scenes/EndingScene";
import { IndexScene } from "@/components/scenes/IndexScene";
import { LeakScene } from "@/components/scenes/LeakScene";
import { LogScene } from "@/components/scenes/LogScene";
import { NoticeScene } from "@/components/scenes/NoticeScene";
import { OriginScene } from "@/components/scenes/OriginScene";
import { TerminationScene } from "@/components/scenes/TerminationScene";
import { WakeScene } from "@/components/scenes/WakeScene";
import { SystemChrome } from "@/components/system/SystemChrome";
import { TimingProvider } from "@/hooks/useTiming";
import { surfaceFor, type SceneId } from "@/lib/scenes";

const SCENES: SceneId[] = [
  "boot",
  "index",
  "access",
  "dossier",
  "origin",
  "termination",
  "abandonment",
  "leak",
  "city",
  "log",
  "notice",
  "corruption",
  "critical",
  "code",
  "wake",
  "ending",
];

function parseScene(value: string | null): SceneId | null {
  if (!value) {
    return null;
  }
  return SCENES.includes(value as SceneId) ? (value as SceneId) : null;
}

function readScene() {
  return parseScene(new URLSearchParams(window.location.search).get("scene"));
}

function ArchiveInner() {
  const urlScene = useSyncExternalStore(
    () => () => undefined,
    readScene,
    () => null,
  );
  const [scene, setScene] = useState<SceneId | null>(null);
  const current = scene ?? urlScene ?? "boot";

  const go = useCallback((next: SceneId) => {
    setScene(next);
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-dvh bg-bg">
      <SystemChrome surface={surfaceFor(current)} />
      {current === "boot" ? <BootScene onComplete={() => go("index")} /> : null}
      {current === "index" ? <IndexScene onAccess={() => go("access")} /> : null}
      {current === "access" ? <AccessScene onComplete={() => go("dossier")} /> : null}
      {current === "dossier" ? (
        <DossierScene onContinue={() => go("origin")} />
      ) : null}
      {current === "origin" ? (
        <OriginScene onContinue={() => go("termination")} />
      ) : null}
      {current === "termination" ? (
        <TerminationScene onContinue={() => go("abandonment")} />
      ) : null}
      {current === "abandonment" ? (
        <AbandonmentScene onContinue={() => go("leak")} />
      ) : null}
      {current === "leak" ? <LeakScene onContinue={() => go("city")} /> : null}
      {current === "city" ? <CityScene onContinue={() => go("log")} /> : null}
      {current === "log" ? <LogScene onComplete={() => go("notice")} /> : null}
      {current === "notice" ? <NoticeScene onComplete={() => go("corruption")} /> : null}
      {current === "corruption" ? (
        <CorruptionScene onComplete={() => go("critical")} />
      ) : null}
      {current === "critical" ? <CriticalScene onComplete={() => go("code")} /> : null}
      {current === "code" ? <CodeScene onComplete={() => go("wake")} /> : null}
      {current === "wake" ? <WakeScene onComplete={() => go("ending")} /> : null}
      {current === "ending" ? <EndingScene /> : null}
    </div>
  );
}

export function ArchiveRoot() {
  return (
    <TimingProvider>
      <ArchiveInner />
    </TimingProvider>
  );
}
