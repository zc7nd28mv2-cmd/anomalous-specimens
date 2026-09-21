"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { FOLDER_FILES, type FileId, type FolderId } from "@/lib/folders";
import {
  EMPTY_FIELD,
  clearFieldSession,
  isYumeStoryPhase,
  loadFieldSession,
  writeFieldSession,
  type FieldSession,
} from "@/lib/field-session";

export type Phase =
  | "boot"
  | "index"
  | "access"
  | "specimen"
  | "story"
  | "constitution"
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
  fieldOpen: boolean;
  field: FieldSession;
  go: (phase: Phase) => void;
  openFolder: (id: FolderId) => void;
  openFile: (id: FileId) => void;
  closeReader: () => void;
  finishPd001: () => void;
  openField: () => void;
  closeField: () => void;
  patchField: (patch: Partial<FieldSession>) => void;
  resetYumeMomoStory: () => void;
};

const ArchiveContext = createContext<ArchiveContextValue | null>(null);

const PHASES: Phase[] = [
  "boot",
  "index",
  "access",
  "specimen",
  "story",
  "constitution",
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
    return "story";
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
  const [fieldOpen, setFieldOpen] = useState(autoOpenPd001);
  const [field, setField] = useState<FieldSession>(loadFieldSession);
  const persistAllowed = useRef(true);

  const current = phase ?? urlPhase ?? "boot";
  const currentRef = useRef(current);
  currentRef.current = current;

  const resetYumeMomoStory = useCallback(() => {
    persistAllowed.current = false;
    setFieldOpen(false);
    setPd001Done(false);
    setField(EMPTY_FIELD);
    clearFieldSession();
  }, []);

  const go = useCallback(
    (next: Phase) => {
      const dest =
        next === "pd001" || next === "unknown" || next === "ending" ? "story" : next;
      const from = currentRef.current;
      if (isYumeStoryPhase(from) && !isYumeStoryPhase(dest)) {
        resetYumeMomoStory();
      } else if (isYumeStoryPhase(dest)) {
        persistAllowed.current = true;
      }
      setPhase(dest);
      setFolder(null);
      setFile(null);
      window.scrollTo(0, 0);
    },
    [resetYumeMomoStory],
  );

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

  const openField = useCallback(() => {
    setFieldOpen(true);
  }, []);

  const closeField = useCallback(() => {
    setFieldOpen(false);
  }, []);

  const patchField = useCallback((patch: Partial<FieldSession>) => {
    if (!persistAllowed.current) {
      return;
    }
    setField((prev) => {
      const next = { ...prev, ...patch };
      writeFieldSession(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      phase: current,
      folder,
      file,
      pd001Done,
      autoOpenPd001,
      startFinale,
      fieldOpen,
      field,
      go,
      openFolder,
      openFile,
      closeReader,
      finishPd001,
      openField,
      closeField,
      patchField,
      resetYumeMomoStory,
    }),
    [
      autoOpenPd001,
      closeField,
      closeReader,
      current,
      field,
      fieldOpen,
      file,
      finishPd001,
      folder,
      go,
      openField,
      openFile,
      openFolder,
      patchField,
      pd001Done,
      resetYumeMomoStory,
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
