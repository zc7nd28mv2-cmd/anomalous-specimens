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

function readPhase(): Phase | null {
  const value = new URLSearchParams(window.location.search).get("scene");
  return PHASES.includes(value as Phase) ? (value as Phase) : null;
}

export function ArchiveProvider({ children }: { children: ReactNode }) {
  const urlPhase = useSyncExternalStore(
    () => () => undefined,
    readPhase,
    () => null,
  );
  const [phase, setPhase] = useState<Phase | null>(null);
  const [folder, setFolder] = useState<FolderId | null>(null);
  const [file, setFile] = useState<FileId | null>(null);
  const [pd001Done, setPd001Done] = useState(false);

  const current = phase ?? urlPhase ?? "boot";

  const go = useCallback((next: Phase) => {
    setPhase(next);
    setFolder(null);
    setFile(null);
    window.scrollTo(0, 0);
  }, []);

  const openFolder = useCallback((id: FolderId) => {
    if (id === "pd001") {
      setPhase("pd001");
      setFolder(null);
      setFile(null);
      window.scrollTo(0, 0);
      return;
    }
    if (id === "unknown") {
      setPhase("unknown");
      setFolder(null);
      setFile(null);
      window.scrollTo(0, 0);
      return;
    }
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
    setPhase("specimen");
    setFolder(null);
    setFile(null);
    window.scrollTo(0, 0);
  }, []);

  const value = useMemo(
    () => ({
      phase: current,
      folder,
      file,
      pd001Done,
      go,
      openFolder,
      openFile,
      closeReader,
      finishPd001,
    }),
    [closeReader, current, file, finishPd001, folder, go, openFile, openFolder, pd001Done],
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
