export type WarningSequenceState =
  | "idle"
  | "warning_01"
  | "warning_02"
  | "warning_03"
  | "warning_04"
  | "warning_05"
  | "out"
  | "flash"
  | "black"
  | "complete";

export type WarningAnchor = "center" | "tl" | "tr" | "bl" | "br";

export type WarningScreen = {
  id: Exclude<
    WarningSequenceState,
    "idle" | "out" | "flash" | "black" | "complete"
  >;
  anchor: WarningAnchor;
  kicker: string;
  title: string;
  lines: readonly string[];
  foot: string;
};

export const WARNING_SCREENS: readonly WarningScreen[] = [
  {
    id: "warning_01",
    anchor: "center",
    kicker: "⚠ WARNING",
    title: "HOST VITAL SIGNS",
    lines: ["ARE DECLINING"],
    foot: "SYSTEM STATUS: CRITICAL",
  },
  {
    id: "warning_02",
    anchor: "tl",
    kicker: "⚠ SYSTEM WARNING",
    title: "VIRUS INTERCEPTION",
    lines: ["MALICIOUS PROCESS DETECTED", "DEFENSE PROTOCOL"],
    foot: "FAILED TO CONTAIN PROCESS",
  },
  {
    id: "warning_03",
    anchor: "tr",
    kicker: "⚠ SYSTEM WARNING",
    title: "SYSTEM INTEGRITY FAILURE",
    lines: ["NEURAL ARCHIVE", "IS NO LONGER STABLE"],
    foot: "MEMORY INDEX: CORRUPTED",
  },
  {
    id: "warning_04",
    anchor: "bl",
    kicker: "⚠ SYSTEM WARNING",
    title: "ILLEGAL CODE DETECTED",
    lines: ["UNKNOWN PROCESS", "IS MODIFYING MEMORY", "SOURCE: UNKNOWN"],
    foot: "PERMISSION: DENIED",
  },
  {
    id: "warning_05",
    anchor: "br",
    kicker: "⚠ CRITICAL WARNING",
    title: "RISK CANNOT BE PREDICTED",
    lines: ["SYSTEM CANNOT DETERMINE", "THE CONSEQUENCE OF CONTINUED OPERATION"],
    foot: "ABORT PROTOCOL: FAILED",
  },
];

export const WARNING_SEQUENCE_STEPS: ReadonlyArray<[WarningSequenceState, number]> = [
  ["warning_02", 600],
  ["warning_03", 1200],
  ["warning_04", 1850],
  ["warning_05", 2500],
  ["out", 3400],
  ["flash", 3600],
  ["black", 3720],
  ["complete", 3900],
];
