export const SYSTEM = {
  title: "ANOMALOUS SPECIMENS",
  archive: "ARCHIVE SYSTEM",
  index: "ARCHIVE INDEX",
  initializing: "INITIALIZING ARCHIVE...",
  memoryOk: "MEMORY INDEX ........ OK",
  neuralOk: "NEURAL ARCHIVE ...... OK",
  specimenOk: "SPECIMEN DATABASE ... OK",
  integrity47: "SOURCE INTEGRITY .... 47%",
  warning: "WARNING",
  corrupted: "ARCHIVE PARTIALLY CORRUPTED",
  detected: "3 / SPECIMENS DETECTED",
  count: "3 / 3 SPECIMENS",
} as const;

export const SPECIMENS = [
  {
    id: "001",
    name: "PEACH DREAM",
    alias: "「仙桃梦」",
    kind: "MEDICAL NEURAL PROGRAM",
    status: "LEAKED",
    locked: false,
  },
  {
    id: "002",
    name: "CRYSTAL BLOOM",
    alias: "「晶蕊体」",
    kind: null,
    status: "RESTRICTED",
    locked: true,
  },
  {
    id: "003",
    name: "COMPOUND COFFEE",
    alias: "「复方咖啡」",
    kind: null,
    status: "RESTRICTED",
    locked: true,
  },
] as const;

export const ACCESS = {
  accessing: "ACCESSING SPECIMEN 001",
  verifying: "VERIFYING ARCHIVE...",
  integrity: "SOURCE INTEGRITY 82%",
  granted: "ACCESS GRANTED",
} as const;

export const DOSSIER = {
  heading: "PROJECT DOSSIER",
  projectLabel: "PROJECT:",
  project: "YUME MOMO 2.0",
  classLabel: "CLASSIFICATION:",
  classification: "MEDICAL NEURAL PROGRAM",
  versionLabel: "VERSION:",
  version: "2.0.41-BETA",
  statusLabel: "STATUS:",
  status: "TERMINATED / SOURCE CODE LEAKED",
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
  l1: "Nobody becomes addicted to a hallucination.",
  l2: "People become addicted to a dream worth waking up for.",
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
  line: "贪食人间烟火，终成仙梦。",
  attr: "——「仙桃梦」",
} as const;
