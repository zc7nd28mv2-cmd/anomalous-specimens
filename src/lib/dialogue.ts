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
    }
  | { kind: "sys"; k: string; v: string }
  | { kind: "flash"; code: string }
  | { kind: "warn"; title: string; body?: string }
  | { kind: "inject" }
  | { kind: "exitreq" }
  | { kind: "choice"; id: "see" | "smell" }
  | { kind: "lost" };

export const DIALOGUE: DialogueBeat[] = [
  { kind: "time", text: "21:07:14" },
  { kind: "line", speaker: "LIN", text: "上线了吗？", pace: "fast" },
  { kind: "line", speaker: "KAI", text: "嗯。", pace: "faster" },
  { kind: "sys", k: "NEURAL LINK", v: "STABLE" },
  { kind: "flash", code: "dream.seed = memory.last_safe_place();" },
  { kind: "line", speaker: "LIN", text: "看见什么了？", pace: "normal" },
  { kind: "line", speaker: "KAI", text: "一颗……仙桃？", pace: "slow", hold: 700 },
  { kind: "line", speaker: "LIN", text: "……", pace: "slow" },
  { kind: "line", speaker: "LIN", text: "系统生成的？", pace: "normal" },
  { kind: "line", speaker: "KAI", text: "不是。", pace: "fast" },
  { kind: "line", speaker: "KAI", text: "它在等我。", pace: "slow", hold: 1400 },
  { kind: "choice", id: "see" },
  { kind: "sys", k: "MEMORY SYNC", v: "ACTIVE" },
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
  { kind: "warn", title: "SYSTEM WARNING" },
  { kind: "inject" },
  {
    kind: "line",
    speaker: "KAI",
    text: "她知道只有我们两个知道的事。",
    pace: "slow",
  },
  { kind: "line", speaker: "LIN", text: "操！退出……快退出。", pace: "fast" },
  { kind: "exitreq" },
  { kind: "line", speaker: "KAI", text: "她哭了。", pace: "crawl", freeze: 1100 },
  { kind: "choice", id: "smell" },
  { kind: "time", text: "21:18:02" },
  {
    kind: "warn",
    title: "⚠ WARNING!",
    body: "HOST VITAL SIGNS ARE DECLINING.",
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

export function charInterval(pace: Pace, char: string) {
  if (char === "…" || char === "。") {
    return pace === "crawl" ? 220 : 140;
  }
  switch (pace) {
    case "faster":
      return 22;
    case "fast":
      return 30;
    case "normal":
      return 42;
    case "slow":
      return 64;
    case "crawl":
      return 90;
    default:
      return 42;
  }
}
