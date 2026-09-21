import { DIALOGUE } from "@/lib/dialogue";
import type { SensoryBranchId, SensoryId } from "@/lib/sensory";

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

export type StoryState =
  | "intro"
  | "kai_typing_before_choice"
  | "sensory_choice"
  | "selected_sensory_result"
  | "matching_result"
  | "post_matching_dialogue"
  | "time_21_12_33"
  | "time_21_18_02"
  | "connection_lost";

export type FieldStatus = StoryState | "warn" | "after";

export type InvestGate = "idle" | "opening" | "recovering" | "open";

export const SELECTED_SENSORY_ID = "kai-selected-sensory";
export const BRANCH_MERGE_ID = "branch-merge-wait";

export function branchLineId(optionId: SensoryBranchId, who: "lin" | "kai") {
  return `branch-${optionId}-${who}`;
}

export type FieldState = {
  index: number;
  status: FieldStatus;
  log: FieldLogItem[];
  picked: boolean;
  pickedOption: SensoryBranchId | null;
  choice: SensoryId | null;
  scroll: number;
  pinBottom: boolean;
  investGate: InvestGate;
  investStep: number;
  isInvestigationUnlocked: boolean;
  isInvestigationOpen: boolean;
  canLeave: boolean;
  warning: "off" | "run" | "done";
  warningSequence: "off" | "run" | "done";
  scan: "off" | "run" | "resume" | "done";
  scanLines: string[] | null;
  draft: string;
  indicator: string;
};

export const EMPTY_FIELD: FieldState = {
  index: 0,
  status: "intro",
  log: [],
  picked: false,
  pickedOption: null,
  choice: null,
  scroll: 0,
  pinBottom: true,
  investGate: "idle",
  investStep: 0,
  isInvestigationUnlocked: false,
  isInvestigationOpen: false,
  canLeave: false,
  warning: "off",
  warningSequence: "off",
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
