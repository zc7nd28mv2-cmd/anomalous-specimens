import { DIALOGUE } from "@/lib/dialogue";
import type { SensoryId } from "@/lib/sensory";

export type FieldLogItem =
  | { id: string; kind: "time"; text: string }
  | { id: string; kind: "msg"; speaker: string; text: string }
  | { id: string; kind: "sys"; k: string; v: string }
  | { id: string; kind: "code"; text: string }
  | { id: string; kind: "warn"; title: string; body?: string; faded?: boolean }
  | { id: string; kind: "note"; text: string; danger?: boolean }
  | { id: string; kind: "analysis"; steps: string[]; result: string[] }
  | { id: string; kind: "invest" }
  | { id: string; kind: "lost" };

export type FieldStatus = "play" | "choice" | "hold" | "analysis" | "warn" | "after";

export type InvestGate = "idle" | "opening" | "recovering" | "open";

export type FieldState = {
  index: number;
  status: FieldStatus;
  log: FieldLogItem[];
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
  draft: string;
  indicator: string;
};

export const EMPTY_FIELD: FieldState = {
  index: 0,
  status: "play",
  log: [],
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
  draft: "",
  indicator: "",
};

export function emptyField(): FieldState {
  return { ...EMPTY_FIELD, log: [] };
}

function lastTimeStamp(index: number) {
  for (let i = index; i >= 0; i -= 1) {
    const beat = DIALOGUE[i];
    if (beat?.kind === "time") {
      return beat.text.replace(/:/g, "-");
    }
  }
  return "00-00-00";
}

export function beatId(index: number, suffix = "") {
  const beat = DIALOGUE[index];
  if (beat?.kind === "line") {
    const who =
      beat.speaker === "KAI" ? "kai" : beat.speaker === "LIN" ? "lin" : "sys";
    const id = `${who}-${lastTimeStamp(index)}-${String(index).padStart(3, "0")}`;
    return suffix ? `${id}-${suffix}` : id;
  }
  if (beat?.kind === "time") {
    return `time-${beat.text.replace(/:/g, "-")}`;
  }
  const id = `d-${index}`;
  return suffix ? `${id}-${suffix}` : id;
}

export function logHas(log: FieldLogItem[], id: string) {
  return log.some((item) => item.id === id);
}
