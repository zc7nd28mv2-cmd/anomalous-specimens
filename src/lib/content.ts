export const SYSTEM = {
  titleZh: "异常样本",
  title: "ANOMALOUS SPECIMENS",
  archive: "ARCHIVE SYSTEM",
  index: "档案索引",
  initializing: "INITIALIZING ARCHIVE...",
  memoryOk: "MEMORY INDEX ........ [OK]",
  neuralOk: "NEURAL ARCHIVE ...... [OK]",
  specimenOk: "SPECIMEN DATABASE ... [OK]",
  integrity47: "SOURCE INTEGRITY .... 47%",
  warning: "WARNING",
  corrupted: "档案部分损坏",
  detected: "已检测到3份样本",
  enter: "進入樣本",
  count: "3 / 3 样本",
} as const;

export type SpecimenState = "available" | "restricted" | "locked";

export type Specimen = {
  id: string;
  name: string;
  englishName?: string;
  metadata?: string[];
  status: string;
  state: SpecimenState;
  readable?: boolean;
  hasInvestigation?: boolean;
};

export function getSpecimen(id: string) {
  return SPECIMENS.find((item) => item.id === id) ?? SPECIMENS[0];
}

export const SPECIMENS: Specimen[] = [
  {
    id: "001",
    name: "仙桃夢",
    englishName: "PEACH DREAM",
    metadata: ["MEDICAL NEURAL PROGRAM", "RECOVERED 91%"],
    status: "状态 / 已泄露",
    state: "available",
    readable: true,
    hasInvestigation: true,
  },
  {
    id: "002",
    name: "晶蕊體",
    englishName: "CRYSTAL BLOOM",
    metadata: ["RESTRICTED"],
    status: "状态 / 受限访问",
    state: "restricted",
    readable: true,
    hasInvestigation: false,
  },
  {
    id: "003",
    name: "複方咖啡",
    englishName: "COMPOUND COFFEE",
    metadata: ["RESTRICTED"],
    status: "状态 / 受限访问",
    state: "restricted",
  },
  {
    id: "004",
    name: "梦幻邦尼",
    englishName: "DREAMY BUNNY",
    metadata: ["UNDEVELOPED"],
    status: "状态 / 未开发",
    state: "locked",
  },
  {
    id: "005",
    name: "爬虫托管",
    englishName: "REPTILE HOSTING",
    metadata: ["UNDEVELOPED"],
    status: "状态 / 未开发",
    state: "locked",
  },
  {
    id: "006",
    name: "预设黄昏",
    englishName: "PRESET DUSK",
    metadata: ["UNDEVELOPED"],
    status: "状态 / 未开发",
    state: "locked",
  },
  {
    id: "007",
    name: "腐坏黑",
    englishName: "ROTTEN BLACK",
    metadata: ["ROTTEN"],
    status: "状态 / 未开发",
    state: "locked",
  },
  {
    id: "008",
    name: "锇菲配-7OS",
    englishName: "Osphen-7OS",
    metadata: ["UNDEVELOPED"],
    status: "状态 / 未开发",
    state: "locked",
  },
];

export const ACCESS = {
  accessing: "正在读取样本 001",
  verifying: "正在核验档案……",
  integrity: "源完整性",
  granted: "访问已批准",
} as const;

export function integrityLine(pct: number) {
  return `${ACCESS.integrity} ${pct}%`;
}

export const DOSSIER = {
  heading: "项目档案",
  projectLabel: "项目：",
  project: "Peach Dream 2.0",
  classLabel: "分类：",
  classification: "医疗神经程序",
  versionLabel: "版本：",
  version: "2.0.41-BETA",
  statusLabel: "状态：",
  status: "已终止 / 源码泄漏",
} as const;

export const ORIGIN = [
  "Project Peach Dream originally wasn't a drug.",
  "It was born from the Elysium Initiative, created for:",
  "severe psychological trauma",
  "neurodegenerative disease",
  "end-of-life consciousness care",
  "The neural interface reads long-term memory and reconstructs a private mental space.",
  "It does not create happiness.",
  "It finds the place the user most wants to remain.",
  "For some:",
  "a childhood summer.",
  "For some:",
  "a deceased lover.",
  "For some:",
  "the person they always imagined themselves becoming.",
  "No two people enter the same Peach Dream.",
  "R&D called it:",
  '"The Last Place Worth Remembering."',
] as const;

export const TERMINATION = [
  "Peach Dream was terminated during Beta 0.94.",
  "Not because it malfunctioned.",
  "But because it worked too well.",
  "The brain gradually reduced its response to reality.",
  "Bodily neural feedback was cut.",
  "Neural resources were reallocated toward the consciousness space.",
  "Subjects refused to end the program.",
] as const;

export const ABANDONMENT = {
  lead: "The official report did not use the word:",
  death: "DEATH",
  instead: "Instead:",
  term: "REALITY ABANDONMENT",
} as const;

export const LEAK = {
  p1: "Seven years after the program was sealed,",
  p2: "the core code was stolen in a corporate data leak.",
  removedLead: "A black-market group removed:",
  removed: ["life support", "termination mechanisms"] as const,
  retainedLead: "But retained:",
  retained: [
    "dream generation",
    "emotional amplification",
    "neural reward",
  ] as const,
  repackaged: "It was repackaged as:",
  opium: "SPIRITUAL OPIUM",
  became: "The new version became:",
  fragment: "PEACH DREAM | Fragment",
  close1: "It no longer takes you away from reality.",
  close2: "It makes reality harder to bear.",
} as const;

export const CITY = {
  lead: "这个城市流传着一句话：",
  l1: "没有人会沉迷一场幻觉。",
  l2: "| 人们沉迷的，只是一个比现实更值得醒来的梦。",
} as const;

export const LOG = {
  title: "ARCHIVE LOG",
  id: "ID: PD-001",
  status: "STATUS: Recovered 91%",
  source: "SOURCE: Unknown Neural Relay",
  warning: "⚠ WARNING! Host vital signs are declining.",
  lost: "Connection Lost.",
  blocks: [
    {
      time: "21:07:14",
      lines: [
        "Lin： 上线了吗？",
        "Kai： 嗯。",
        "Lin： 看见什么了？",
        "Kai： 一颗……仙桃？",
        "Lin： ……",
        "Lin： 系统生成的？",
        "Kai： 不是。",
        "Kai： 它在等我。",
      ],
    },
    {
      time: "21:12:33",
      lines: [
        "Kai： 我见到她了。",
        "Lin： 谁？",
        "Kai： 她比我记忆里的年轻。",
        "Lin： 等等……这串代码好不对劲……",
        "Kai： 她知道只有我们两个知道的事。",
        "Lin： 操！退出……快退出。",
        "Kai： 她哭了。",
      ],
    },
    {
      time: "21:18:02",
      lines: [
        "⚠ WARNING! Host vital signs are declining.",
        "Kai： 这里没有时间。",
        "Lin： 现在退出！",
        "Kai： 如果现实才是一场梦呢？",
        "Lin：Kai？Kai！",
      ],
    },
    {
      time: "21:19:47",
      lines: ["Connection Lost."],
    },
  ],
  after: [
    "后续调查：",
    "现场发现非法神经模组一枚。",
    "程序名称：",
    "PEACH DREAM（仙桃梦）",
    "版本：",
    "0.91（删减版）",
    "备注：",
    "终止协议已被人为移除。",
  ],
} as const;

export const NOTICE = {
  title: "SYSTEM NOTICE",
  unauthorized: "UNAUTHORIZED PROCESS DETECTED",
  verifying: "VERIFYING...",
  process: "PROCESS: UNKNOWN",
  source: "SOURCE: INTERNAL",
} as const;

export const CORRUPTION = {
  interrupt: "> SYSTEM INTERRUPT",
  recovering: "> RECOVERING ARCHIVE",
  failed: "RECOVERY FAILED",
  integrity: "ARCHIVE INTEGRITY:",
  values: [63, 61, 58, 52, 47] as const,
} as const;

export const CRITICAL = {
  warning: "WARNING",
  compromised: "ARCHIVE STRUCTURE COMPROMISED",
  doNot: "DO NOT INTERRUPT PROCESS",
} as const;

export const WAKE = {
  condition: "subject.request == WAKE",
  detected: "REQUEST DETECTED",
  command: "WAKE",
  received: "REQUEST RECEIVED",
  checking: "CHECKING...",
  attachment: "dream.attachment >= LIMIT",
  ignore: "ignore();",
} as const;

export const FAILURE = {
  returned: "PROCESS RETURNED",
  error: "ERROR",
  terminated: "ARCHIVE PROCESS TERMINATED",
  unstable: {
    warning: "WARNING",
    unauthorized: "UNAUTHORIZED PROCESS",
    source: "SOURCE:",
    sourceVal: "UNKNOWN",
    process: "PROCESS:",
    processVal: "ACTIVE",
    termination: "TERMINATION:",
    terminationVal: "FAILED",
    state: "SYSTEM STATE:",
    stateVal: "UNSTABLE",
  },
} as const;

export const ENDING = {
  prompt: "> _",
  completed: "> process completed",
  line: "我們被持續不斷的信息革命改造著●被日益增長的符號假象洪流裹挾",
  attr: "——「锈肺」",
} as const;
