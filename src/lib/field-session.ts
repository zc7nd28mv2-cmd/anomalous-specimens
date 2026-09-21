import type { SensoryId } from "@/lib/sensory";

export type FieldLogItem =
  | { key: string; kind: "time"; text: string }
  | { key: string; kind: "msg"; speaker: string; text: string }
  | { key: string; kind: "sys"; k: string; v: string }
  | { key: string; kind: "code"; text: string }
  | { key: string; kind: "warn"; title: string; body?: string; faded?: boolean }
  | { key: string; kind: "note"; text: string; danger?: boolean }
  | { key: string; kind: "analysis"; steps: string[]; result: string[] }
  | { key: string; kind: "invest" }
  | { key: string; kind: "lost" };

export type FieldStatus = "play" | "choice" | "hold" | "analysis" | "warn" | "after";

export type InvestGate = "idle" | "opening" | "recovering" | "open";

export type FieldSession = {
  index: number;
  status: FieldStatus;
  log: FieldLogItem[];
  keyCount: number;
  picked: boolean;
  choice: SensoryId | null;
  scroll: number;
  pinBottom: boolean;
  investGate: InvestGate;
  investStep: number;
  canLeave: boolean;
  warning: "off" | "run" | "done";
  scan: "off" | "run" | "resume" | "done";
  scanLines: string[] | null;
};

export const FIELD_STORAGE_KEY = "anomalous-specimens-investigation";

export const EMPTY_FIELD: FieldSession = {
  index: 0,
  status: "play",
  log: [],
  keyCount: 0,
  picked: false,
  choice: null,
  scroll: 0,
  pinBottom: true,
  investGate: "idle",
  investStep: 0,
  canLeave: false,
  warning: "off",
  scan: "off",
  scanLines: null,
};

export function loadFieldSession(): FieldSession {
  if (typeof window === "undefined") {
    return EMPTY_FIELD;
  }
  try {
    const raw = window.sessionStorage.getItem(FIELD_STORAGE_KEY);
    if (!raw) {
      return EMPTY_FIELD;
    }
    const parsed = JSON.parse(raw) as Partial<FieldSession>;
    return { ...EMPTY_FIELD, ...parsed, log: parsed.log ?? [] };
  } catch {
    return EMPTY_FIELD;
  }
}

export function writeFieldSession(session: FieldSession) {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(FIELD_STORAGE_KEY, JSON.stringify(session));
}

export function clearFieldSession() {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(FIELD_STORAGE_KEY);
}

export function isYumeStoryPhase(phase: string) {
  return (
    phase === "specimen" ||
    phase === "story" ||
    phase === "constitution" ||
    phase === "pd001" ||
    phase === "unknown" ||
    phase === "ending"
  );
}
