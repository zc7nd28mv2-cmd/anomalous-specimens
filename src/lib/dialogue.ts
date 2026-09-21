export type Pace = "faster" | "fast" | "normal" | "slow" | "crawl";

export type DialogueBeat =
  | { kind: "time"; text: string }
  | {
      kind: "line";
      speaker: "LIN" | "KAI" | null;
      text: string;
      pace: Pace;
      hold?: number;
      freeze?: number;
      hidden?: boolean;
    }
  | { kind: "sys"; k: string; v: string }
  | { kind: "flash"; code: string }
  | { kind: "warn"; title: string; body?: string }
  | { kind: "inject" }
  | { kind: "exitreq" }
  | { kind: "choice"; id: "see" }
  | { kind: "lost" };

// Canonical PD-001 remains in content.ts LOG, including:
// Kai：一颗……仙桃？
// That line is hidden from the live interaction UI.
export const DIALOGUE: DialogueBeat[] = [
  { kind: "time", text: "21:07:14" },
  { kind: "line", speaker: "LIN", text: "上线了吗？", pace: "fast" },
  { kind: "line", speaker: "KAI", text: "嗯。", pace: "faster" },
  { kind: "line", speaker: "LIN", text: "看见什么了？", pace: "normal" },
  { kind: "choice", id: "see" },
  { kind: "time", text: "21:12:33" },
  { kind: "line", speaker: "KAI", text: "我见到她了。", pace: "slow", hold: 1600 },
  { kind: "line", speaker: "LIN", text: "谁？", pace: "normal" },
  { kind: "line", speaker: "KAI", text: "她比我记忆里的年轻。", pace: "slow", hold: 900 },
  {
    kind: "line",
    speaker: "LIN",
    text: "等等……这串代码好不对劲……",
    pace: "slow",
  },
  { kind: "inject" },
  {
    kind: "line",
    speaker: "KAI",
    text: "她知道只有我们两个知道的事。",
    pace: "slow",
  },
  { kind: "line", speaker: "LIN", text: "操！退出……快退出。", pace: "fast" },
  { kind: "line", speaker: "KAI", text: "她哭了。", pace: "crawl", freeze: 1100 },
  { kind: "time", text: "21:18:02" },
  {
    kind: "warn",
    title: "⚠ WARNING",
    body: "HOST VITAL SIGNS ARE DECLINING",
  },
  { kind: "line", speaker: "KAI", text: "这里没有时间。", pace: "slow" },
  { kind: "line", speaker: "LIN", text: "现在退出！", pace: "fast" },
  {
    kind: "line",
    speaker: "KAI",
    text: "如果现实才是一场梦呢？",
    pace: "crawl",
    hold: 2800,
  },
  { kind: "line", speaker: "LIN", text: "Kai？Kai！", pace: "fast" },
  { kind: "time", text: "21:19:47" },
  { kind: "lost" },
];

export const LOG_AFTER = [
  "后续调查：",
  "现场发现非法神经模组一枚。",
  "程序名称：",
  "PEACH DREAM（仙桃梦）",
  "版本：",
  "0.91（删减版）",
  "备注：",
  "终止协议已被人为移除。",
] as const;

export const INVESTIGATION = {
  opening: "OPENING FILE...",
  recovering: "RECOVERING DATA...",
  en: "FOLLOW-UP INVESTIGATION",
  zh: "後續調查",
  prompt: "后续调查",
  title: "后续调查：",
  close: "关闭",
  foundNote: "现场发现非法神经模组一枚。",
  nameLabel: "程序名称：",
  name: "PEACH DREAM（仙桃梦）",
  versionLabel: "版本：",
  version: "0.91（删减版）",
  noteLabel: "备注：",
  note: "终止协议已被人为移除。",
  garbles: [
    "P€@CH_D█EAM",
    "PEA▒H DR░AM",
    "PΞACH_DREAM",
    "▓EACH DR█AM",
    "P3ACH_DRE4M",
    "PEACH_▒▒▒M",
  ],
} as const;

export const ANALYSIS = {
  title: "SYSTEM ANALYSIS",
  analyzing: "ANALYZING...",
  input: "SENSORY INPUT",
  recognized: "RECOGNIZED",
  signature: "MATERIAL SIGNATURE",
  matching: "MATCHING...",
  complete: "ANALYSIS COMPLETE",
} as const;

const PUNCT = new Set(["，", "。", "……", "…", "？", "！", "：", ",", ".", "?", "!", ":"]);

export const TYPING_INDICATOR_DELAY = 700;

export function charInterval(_pace: Pace, char: string) {
  const base = 65 + Math.random() * 35;
  if (PUNCT.has(char) || char === "…") {
    return base + 150 + Math.random() * 150;
  }
  return base;
}

export function messagePause(phase: "early" | "mid" | "warn" | "lost") {
  switch (phase) {
    case "early":
      return 900 + Math.random() * 400;
    case "mid":
      return 900 + Math.random() * 400;
    case "warn":
      return 700 + Math.random() * 300;
    case "lost":
      return 500 + Math.random() * 300;
    default:
      return 1000;
  }
}
