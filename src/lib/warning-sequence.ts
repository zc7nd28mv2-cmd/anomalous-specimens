export type WarningSequenceState =
  | "idle"
  | "warning_01"
  | "warning_02"
  | "warning_03"
  | "warning_04"
  | "warning_05"
  | "hold"
  | "flash_a"
  | "cut_a"
  | "flash_b"
  | "cut_b"
  | "flash_c"
  | "black"
  | "complete";

export type WarningAnchor = "center" | "tl" | "tr" | "bl" | "br";

export type WarningSize = "compact" | "medium" | "tall" | "wide" | "large";

export type WarningBurst = "off" | "soft" | "mid" | "hard";

export type WarningScreen = {
  id: "warning_01" | "warning_02" | "warning_03" | "warning_04" | "warning_05";
  anchor: WarningAnchor;
  size: WarningSize;
  kicker: string;
  title: string;
  lines: readonly string[];
  foot: string;
};

export type WarningBeat = {
  at: number;
  phase: WarningSequenceState;
  burst?: WarningBurst;
};

export const WARNING_SCREENS: readonly WarningScreen[] = [
  {
    id: "warning_01",
    anchor: "center",
    size: "compact",
    kicker: "⚠ WARNING!",
    title: "Host vital signs are declining.",
    lines: [],
    foot: "",
  },
  {
    id: "warning_02",
    anchor: "tl",
    size: "medium",
    kicker: "⚠ SYSTEM WARNING",
    title: "CODE INTRUSION DETECTED",
    lines: ["UNAUTHORIZED CODE", "HAS ENTERED THE NEURAL ARCHIVE"],
    foot: "PROCESS: BLOCKED",
  },
  {
    id: "warning_03",
    anchor: "tr",
    size: "tall",
    kicker: "⚠ SYSTEM WARNING",
    title: "VIRUS INTERCEPTION",
    lines: ["MALICIOUS PROCESS DETECTED", "DEFENSE PROTOCOL"],
    foot: "FAILED TO CONTAIN PROCESS",
  },
  {
    id: "warning_04",
    anchor: "bl",
    size: "wide",
    kicker: "⚠ SYSTEM WARNING",
    title: "SYSTEM INTEGRITY FAILURE",
    lines: ["NEURAL ARCHIVE", "IS NO LONGER STABLE"],
    foot: "MEMORY INDEX: CORRUPTED",
  },
  {
    id: "warning_05",
    anchor: "br",
    size: "large",
    kicker: "⚠ CRITICAL WARNING",
    title: "RISK CANNOT BE PREDICTED",
    lines: ["SYSTEM CANNOT DETERMINE", "THE CONSEQUENCE OF CONTINUED OPERATION"],
    foot: "ABORT PROTOCOL: FAILED",
  },
];

const WINDOW_ORDER = [
  "warning_01",
  "warning_02",
  "warning_03",
  "warning_04",
  "warning_05",
] as const;

export function randomRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function buildWarningTimeline(): WarningBeat[] {
  const afterFirst = randomRange(700, 1200);
  const gap03 = randomRange(70, 180);
  const gap04 = randomRange(150, 300);
  const gap05 = randomRange(100, 250);
  const hold = randomRange(1800, 2200);
  const flicker02 = randomRange(40, 70);
  const flicker03 = randomRange(50, 85);
  const flicker04 = randomRange(40, 70);
  const flicker05 = randomRange(70, 100);
  const t02 = afterFirst;
  const t03 = t02 + gap03;
  const t04 = t03 + gap04;
  const t05 = t04 + gap05;
  const holdAt = t05 + flicker05;
  const collapse = t05 + hold;
  const flashA = randomRange(60, 100);
  const cutA = randomRange(40, 80);
  const flashB = randomRange(50, 120);
  const cutB = randomRange(40, 80);
  const flashC = randomRange(50, 100);
  const black = randomRange(80, 120);

  const beats: WarningBeat[] = [
    { at: 0, phase: "warning_01", burst: "off" },
    { at: t02, phase: "warning_02", burst: "soft" },
    { at: t03, phase: "warning_03", burst: "mid" },
    { at: t04, phase: "warning_04", burst: "soft" },
    { at: t05, phase: "warning_05", burst: "hard" },
    { at: holdAt, phase: "hold", burst: "off" },
    { at: collapse, phase: "flash_a", burst: "off" },
    { at: collapse + flashA, phase: "cut_a", burst: "off" },
    { at: collapse + flashA + cutA, phase: "flash_b", burst: "off" },
    { at: collapse + flashA + cutA + flashB, phase: "cut_b", burst: "off" },
    {
      at: collapse + flashA + cutA + flashB + cutB,
      phase: "flash_c",
      burst: "off",
    },
    {
      at: collapse + flashA + cutA + flashB + cutB + flashC,
      phase: "black",
      burst: "off",
    },
    {
      at: collapse + flashA + cutA + flashB + cutB + flashC + black,
      phase: "complete",
      burst: "off",
    },
  ];

  if (t02 + flicker02 < t03) {
    beats.push({ at: t02 + flicker02, phase: "warning_02", burst: "off" });
  }
  if (t03 + flicker03 < t04) {
    beats.push({ at: t03 + flicker03, phase: "warning_03", burst: "off" });
  }
  if (t04 + flicker04 < t05) {
    beats.push({ at: t04 + flicker04, phase: "warning_04", burst: "off" });
  }

  return beats.sort((a, b) => a.at - b.at);
}

export function visibleWarningScreens(phase: WarningSequenceState) {
  if (
    phase === "idle" ||
    phase === "black" ||
    phase === "complete"
  ) {
    return [];
  }
  if (
    phase === "flash_a" ||
    phase === "cut_a" ||
    phase === "flash_b" ||
    phase === "cut_b" ||
    phase === "flash_c" ||
    phase === "hold"
  ) {
    return [...WARNING_SCREENS];
  }
  const current = phase;
  const end = WINDOW_ORDER.indexOf(current);
  if (end < 0) {
    return [];
  }
  return WARNING_SCREENS.filter((_, index) => index <= end);
}

export function isCollapseFlash(phase: WarningSequenceState) {
  return phase === "flash_a" || phase === "flash_b" || phase === "flash_c";
}

export function isCollapseCut(phase: WarningSequenceState) {
  return phase === "cut_a" || phase === "cut_b" || phase === "black";
}
