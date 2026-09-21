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
