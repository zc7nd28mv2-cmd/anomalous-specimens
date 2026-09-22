export const CONSTITUTION = {
  title: "構成代碼",
  en: "CONSTITUTION CODE",
  record: "MATERIAL COMPOSITION RECORD",
  result: "分析结果",
  scan: "ANALYZE(SAMPLE_001::COMPOSITION)",
  traces: {
    "01": "TRACE::TOP_NOTE",
    "02": "TRACE::HEART_NOTE",
    "03": "TRACE::BASE_NOTE",
  },
  streams: {
    top: [
      "TRACE::TOP_NOTE",
      "SCAN::RUBBER",
      "MATERIAL::02",
      "MATCH::87.4%",
      "RUBBER::WET",
      "ANALYZE::CONDUCTOR",
      "RATIO::0.73",
      "TRACE::TOP_NOTE",
      "MATCH::91%",
    ],
    heart: [
      "TRACE::HEART_NOTE",
      "SCAN::SILICONE",
      "MATERIAL::07",
      "MATCH::82.1%",
      "VIRUS::DIFFUSE",
      "ANALYZE::NEURAL",
      "RATIO::0.61",
      "TRACE::HEART_NOTE",
      "MATCH::94%",
    ],
    base: [
      "TRACE::BASE_NOTE",
      "SCAN::SILICONE_OIL",
      "MATERIAL::11",
      "MATCH::79.3%",
      "CARBON::RESIDUE",
      "ANALYZE::THERMAL",
      "RATIO::0.88",
      "TRACE::BASE_NOTE",
      "MATCH::96%",
    ],
  },
  groups: [
    {
      id: "01",
      zh: "前調",
      en: "TOP",
      items: ["光脈導管", "工業橡膠", "載氣"],
    },
    {
      id: "02",
      zh: "中調",
      en: "HEART",
      items: ["彌散病毒", "軟質矽膠", "電子桃漿", "冷卻劑"],
    },
    {
      id: "03",
      zh: "後調",
      en: "BASE",
      items: ["重質矽油", "老化橡膠", "碳化殘渣", "2-DDG"],
    },
  ],
} as const;

const CONSTITUTION_002 = {
  title: CONSTITUTION.title,
  en: CONSTITUTION.en,
  record: CONSTITUTION.record,
  result: CONSTITUTION.result,
  scan: "ANALYZE(SAMPLE_002::COMPOSITION)",
  traces: CONSTITUTION.traces,
  streams: {
    top: [
      "TRACE::TOP_NOTE",
      "SCAN::NONANAL",
      "MATERIAL::04",
      "MATCH::86.2%",
      "FILM::CONDENSATE",
      "ANALYZE::LEAF",
      "RATIO::0.69",
      "TRACE::TOP_NOTE",
      "MATCH::92%",
    ],
    heart: [
      "TRACE::HEART_NOTE",
      "SCAN::TUBEROSE",
      "MATERIAL::08",
      "MATCH::84.7%",
      "SKIN::BIOMIMETIC",
      "ANALYZE::ENDOCRINE",
      "RATIO::0.58",
      "TRACE::HEART_NOTE",
      "MATCH::95%",
    ],
    base: [
      "TRACE::BASE_NOTE",
      "SCAN::LABDANUM",
      "MATERIAL::13",
      "MATCH::81.6%",
      "MUSK::CLONE",
      "ANALYZE::CIVET",
      "RATIO::0.84",
      "TRACE::BASE_NOTE",
      "MATCH::97%",
    ],
  },
  groups: [
    {
      id: "01",
      zh: "前調",
      en: "TOP",
      items: ["壬醛", "冷凝气膜", "生物叶相", "硅基润滑介质"],
    },
    {
      id: "02",
      zh: "中調",
      en: "HEART",
      items: ["晚香玉2026 [ 天然 ]", "纯白花序", "仿生皮肤", "合成内分泌介质"],
    },
    {
      id: "03",
      zh: "後調",
      en: "BASE",
      items: ["劳丹脂", "矿物硅胶", "克隆麝香", "硅介", "工业树脂", "灵猫信息素"],
    },
  ],
} as const;

export const CONSTITUTION_BY_SPECIMEN = {
  "001": CONSTITUTION,
  "002": CONSTITUTION_002,
} as const;

export function constitutionFor(id: string) {
  return CONSTITUTION_BY_SPECIMEN[id as keyof typeof CONSTITUTION_BY_SPECIMEN] ?? CONSTITUTION;
}
