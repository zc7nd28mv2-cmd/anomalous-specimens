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
import { resetYumeProtocol } from "@/components/finale/YumeProtocol";

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
  activeSpecimenId: string;
  selectSpecimen: (id: string) => void;
  pd001Done: boolean;
  sample001AccessApproved: boolean;
  approveSample001: () => void;
  approveSpecimen: (id: string) => void;
  isSpecimenApproved: (id: string) => boolean;
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
  reopenFieldFresh: () => void;
  warningOverlayLive: boolean;
  warningOverlayRun: number;
  startWarningOverlay: () => void;
  finishWarningOverlay: () => void;
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
  const [activeSpecimenId, setActiveSpecimenId] = useState("001");
  const [pd001Done, setPd001Done] = useState(false);
  const [sample001AccessApproved, setSample001AccessApproved] = useState(false);
  const [accessById, setAccessById] = useState<Record<string, boolean>>({});
  const [fieldGate, setFieldGate] = useState<"auto" | "open" | "shut">("auto");
  const [field, setField] = useState<FieldState>(emptyField);
  const [fieldEpoch, setFieldEpoch] = useState(0);
  const [warningOverlayLive, setWarningOverlayLive] = useState(false);
  const [warningOverlayRun, setWarningOverlayRun] = useState(0);
  const [archiveEnterTop, setArchiveEnterTop] = useState(false);
  const fieldRef = useRef<FieldState>(field);
  const fieldsRef = useRef<Record<string, FieldState>>({ "001": emptyField() });
  const activeSpecimenRef = useRef("001");
  const fieldOpen = fieldGate === "open" || (fieldGate === "auto" && autoOpenPd001);

  const current = phase ?? urlPhase ?? "boot";
  const currentRef = useRef(current);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const resetYumeMomoStory = useCallback(() => {
    const next = emptyField();
    const id = activeSpecimenRef.current;
    fieldsRef.current[id] = next;
    fieldRef.current = next;
    setField(next);
    setFieldGate("shut");
    if (id === "001") {
      setPd001Done(false);
      resetYumeProtocol();
    }
    setFieldEpoch((value) => value + 1);
  }, []);

  const selectSpecimen = useCallback((id: string) => {
    fieldsRef.current[activeSpecimenRef.current] = { ...fieldRef.current };
    if (!fieldsRef.current[id]) {
      fieldsRef.current[id] = emptyField();
    }
    activeSpecimenRef.current = id;
    fieldRef.current = fieldsRef.current[id];
    setActiveSpecimenId(id);
    setField({ ...fieldRef.current });
    setFieldGate("shut");
    setFieldEpoch((value) => value + 1);
  }, []);

  const approveSpecimen = useCallback((id: string) => {
    if (id === "001") {
      setSample001AccessApproved(true);
    }
    setAccessById((current) => ({ ...current, [id]: true }));
  }, []);

  const isSpecimenApproved = useCallback(
    (id: string) => {
      if (id === "001") {
        return sample001AccessApproved;
      }
      return Boolean(accessById[id]);
    },
    [accessById, sample001AccessApproved],
  );

  const reopenFieldFresh = useCallback(() => {
    const next = emptyField();
    fieldsRef.current[activeSpecimenRef.current] = next;
    fieldRef.current = next;
    setField(next);
    setFieldGate("open");
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
    fieldsRef.current[activeSpecimenRef.current] = fieldRef.current;
  }, []);

  const patchField = useCallback((patch: Partial<FieldState>) => {
    fieldRef.current = { ...fieldRef.current, ...patch };
    fieldsRef.current[activeSpecimenRef.current] = fieldRef.current;
    setField({ ...fieldRef.current });
  }, []);

  const startWarningOverlay = useCallback(() => {
    setWarningOverlayLive(true);
    setWarningOverlayRun((value) => value + 1);
  }, []);

  useEffect(() => {
    const host = window as Window & { __pdStartWarning?: () => void };
    host.__pdStartWarning = startWarningOverlay;
    const onStart = () => startWarningOverlay();
    window.addEventListener("pd001-warning-sequence", onStart);
    return () => {
      window.removeEventListener("pd001-warning-sequence", onStart);
      if (host.__pdStartWarning === startWarningOverlay) {
        delete host.__pdStartWarning;
      }
    };
  }, [startWarningOverlay]);

  const finishWarningOverlay = useCallback(() => {
    setWarningOverlayLive(false);
  }, []);

  const value = useMemo(
    () => ({
      phase: current,
      folder,
      file,
      activeSpecimenId,
      selectSpecimen,
      pd001Done,
      sample001AccessApproved,
      approveSample001,
      approveSpecimen,
      isSpecimenApproved,
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
      reopenFieldFresh,
      warningOverlayLive,
      warningOverlayRun,
      startWarningOverlay,
      finishWarningOverlay,
    }),
    [
      activeSpecimenId,
      approveSample001,
      approveSpecimen,
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
      isSpecimenApproved,
      openField,
      openFile,
      openFolder,
      patchField,
      persistField,
      pd001Done,
      readField,
      reopenFieldFresh,
      resetYumeMomoStory,
      sample001AccessApproved,
      selectSpecimen,
      startFinale,
      startWarningOverlay,
      finishWarningOverlay,
      warningOverlayLive,
      warningOverlayRun,
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
