"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { FOLDER_FILES, type FileId, type FolderId } from "@/lib/folders";

export type Phase =
  | "boot"
  | "index"
  | "access"
  | "specimen"
  | "pd001"
  | "unknown"
  | "ending";

type ArchiveContextValue = {
  phase: Phase;
  folder: FolderId | null;
  file: FileId | null;
  pd001Done: boolean;
  autoOpenPd001: boolean;
  startFinale: boolean;
  go: (phase: Phase) => void;
  openFolder: (id: FolderId) => void;
  openFile: (id: FileId) => void;
  closeReader: () => void;
  finishPd001: () => void;
};

const ArchiveContext = createContext<ArchiveContextValue | null>(null);

const PHASES: Phase[] = [
  "boot",
  "index",
  "access",
  "specimen",
  "pd001",
  "unknown",
  "ending",
];

function readSearch() {
  return new URLSearchParams(window.location.search);
}

function readPhase(): Phase | null {
  const value = readSearch().get("scene");
  if (value === "pd001" || value === "unknown" || value === "ending") {
    return "specimen";
  }
  return PHASES.includes(value as Phase) ? (value as Phase) : null;
}

function readAutoOpen() {
  return readSearch().get("scene") === "pd001";
}

function readFinale() {
  const value = readSearch().get("scene");
  return value === "unknown" || value === "ending";
}

export function ArchiveProvider({ children }: { children: ReactNode }) {
  const urlPhase = useSyncExternalStore(
    () => () => undefined,
    readPhase,
    () => null,
  );
  const autoOpenPd001 = useSyncExternalStore(
    () => () => undefined,
    readAutoOpen,
    () => false,
  );
  const startFinale = useSyncExternalStore(
    () => () => undefined,
    readFinale,
    () => false,
  );
  const [phase, setPhase] = useState<Phase | null>(null);
  const [folder, setFolder] = useState<FolderId | null>(null);
  const [file, setFile] = useState<FileId | null>(null);
  const [pd001Done, setPd001Done] = useState(false);

  const current = phase ?? urlPhase ?? "boot";

  const go = useCallback((next: Phase) => {
    setPhase(next === "pd001" || next === "unknown" || next === "ending" ? "specimen" : next);
    setFolder(null);
    setFile(null);
    window.scrollTo(0, 0);
  }, []);

  const openFolder = useCallback((id: FolderId) => {
    setFolder(id);
    const first = FOLDER_FILES[id as keyof typeof FOLDER_FILES]?.[0]?.id ?? null;
    setFile(first);
  }, []);

  const openFile = useCallback((id: FileId) => {
    setFile(id);
  }, []);

  const closeReader = useCallback(() => {
    setFolder(null);
    setFile(null);
  }, []);

  const finishPd001 = useCallback(() => {
    setPd001Done(true);
  }, []);

  const value = useMemo(
    () => ({
      phase: current,
      folder,
      file,
      pd001Done,
      autoOpenPd001,
      startFinale,
      go,
      openFolder,
      openFile,
      closeReader,
      finishPd001,
    }),
    [
      autoOpenPd001,
      closeReader,
      current,
      file,
      finishPd001,
      folder,
      go,
      openFile,
      openFolder,
      pd001Done,
      startFinale,
    ],
  );

  return (
    <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>
  );
}

export function useArchive() {
  const value = useContext(ArchiveContext);
  if (!value) {
    throw new Error("useArchive must be used inside ArchiveProvider");
  }
  return value;
}
