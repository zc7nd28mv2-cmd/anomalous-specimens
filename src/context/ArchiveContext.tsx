"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { FOLDER_FILES, type FileId, type FolderId } from "@/lib/folders";
import { emptyField, type FieldState } from "@/lib/field-state";

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
  sample001AccessApproved: boolean;
  approveSample001: () => void;
  autoOpenPd001: boolean;
  startFinale: boolean;
  archiveEnterTop: boolean;
  fieldOpen: boolean;
  field: FieldState;
  fieldEpoch: number;
  go: (phase: Phase) => void;
  openFolder: (id: FolderId) => void;
  openFile: (id: FileId) => void;
  closeReader: () => void;
  finishPd001: () => void;
  openField: () => void;
  closeField: () => void;
  readField: () => FieldState;
  persistField: (patch: Partial<FieldState>) => void;
  patchField: (patch: Partial<FieldState>) => void;
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

function isYumeStoryPhase(phase: string) {
  return (
    phase === "specimen" ||
    phase === "story" ||
    phase === "constitution" ||
    phase === "pd001" ||
    phase === "unknown" ||
    phase === "ending"
  );
}

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
  const [sample001AccessApproved, setSample001AccessApproved] = useState(false);
  const [fieldGate, setFieldGate] = useState<"auto" | "open" | "shut">("auto");
  const [field, setField] = useState<FieldState>(emptyField);
  const [fieldEpoch, setFieldEpoch] = useState(0);
  const [archiveEnterTop, setArchiveEnterTop] = useState(false);
  const fieldRef = useRef<FieldState>(field);
  const fieldOpen = fieldGate === "open" || (fieldGate === "auto" && autoOpenPd001);

  const current = phase ?? urlPhase ?? "boot";
  const currentRef = useRef(current);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const resetYumeMomoStory = useCallback(() => {
    const next = emptyField();
    fieldRef.current = next;
    setField(next);
    setFieldGate("shut");
    setPd001Done(false);
    setFieldEpoch((value) => value + 1);
  }, []);

  const go = useCallback(
    (next: Phase) => {
      const dest =
        next === "pd001" || next === "unknown" || next === "ending" ? "story" : next;
      const from = currentRef.current;
      if (isYumeStoryPhase(from) && !isYumeStoryPhase(dest)) {
        resetYumeMomoStory();
      }
      setArchiveEnterTop(from === "specimen" && dest === "story");
      setPhase(dest);
      setFolder(null);
      setFile(null);
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
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

  const approveSample001 = useCallback(() => {
    setSample001AccessApproved(true);
  }, []);

  const openField = useCallback(() => {
    setFieldGate("open");
  }, []);

  const closeField = useCallback(() => {
    setFieldGate("shut");
  }, []);

  const readField = useCallback(() => fieldRef.current, []);

  const persistField = useCallback((patch: Partial<FieldState>) => {
    fieldRef.current = { ...fieldRef.current, ...patch };
  }, []);

  const patchField = useCallback((patch: Partial<FieldState>) => {
    fieldRef.current = { ...fieldRef.current, ...patch };
    setField({ ...fieldRef.current });
  }, []);

  const value = useMemo(
    () => ({
      phase: current,
      folder,
      file,
      pd001Done,
      sample001AccessApproved,
      approveSample001,
      autoOpenPd001,
      startFinale,
      archiveEnterTop,
      fieldOpen,
      field,
      fieldEpoch,
      go,
      openFolder,
      openFile,
      closeReader,
      finishPd001,
      openField,
      closeField,
      readField,
      persistField,
      patchField,
      resetYumeMomoStory,
    }),
    [
      approveSample001,
      archiveEnterTop,
      autoOpenPd001,
      closeField,
      closeReader,
      current,
      field,
      fieldEpoch,
      fieldOpen,
      file,
      finishPd001,
      folder,
      go,
      openField,
      openFile,
      openFolder,
      patchField,
      persistField,
      pd001Done,
      readField,
      resetYumeMomoStory,
      sample001AccessApproved,
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
