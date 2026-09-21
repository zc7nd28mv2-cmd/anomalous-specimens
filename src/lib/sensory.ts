export type SensoryId = "see" | "smell";

export type SensoryOption = {
  id: string;
  label: string;
  lines: string[];
};

export type SensoryBranchId = "01" | "02" | "03" | "04";

export type SensoryBranch = {
  option: string;
  linResponse: string;
  kaiResponse: string;
};

export const BRANCH_MERGE_TEXT = "它在等我。";

export const sensoryBranches: Record<SensoryBranchId, SensoryBranch> = {
  "01": {
    option: "一颗熟透的桃子",
    linResponse: "系统生成的？",
    kaiResponse: "不是。",
  },
  "02": {
    option: "潮湿的工业橡胶",
    linResponse: "橡胶？你碰到接口了？",
    kaiResponse: "湿的。贴着我。",
  },
  "03": {
    option: "冰冷的化学气体",
    linResponse: "那不是空气。",
    kaiResponse: "已经进来了。",
  },
  "04": {
    option: "烧焦后的残留物",
    linResponse: "烧过了？",
    kaiResponse: "还留着。",
  },
};

export function isSensoryBranchId(id: string): id is SensoryBranchId {
  return id === "01" || id === "02" || id === "03" || id === "04";
}

export const SENSORY: Record<
  SensoryId,
  { label: string; prompt: string; options: SensoryOption[] }
> = {
  see: {
    label: "感官记录 / 01",
    prompt: "你看到了什么？",
    options: [
      {
        id: "01",
        label: "一颗熟透的桃子",
        lines: [
          "感官匹配",
          "有机物 / 果实",
          "匹配度 91%",
          "来源：",
          "未知",
          "检测到痕迹。",
          "PEACH",
          "→ MEMORY",
          "→ EMOTION",
          "→ ATTACHMENT",
        ],
      },
      {
        id: "02",
        label: "潮湿的工业橡胶",
        lines: [
          "材料痕迹",
          "硅胶",
          "橡胶",
          "聚合物",
          "匹配度 87%",
          "来源：",
          "神经接口",
        ],
      },
      {
        id: "03",
        label: "冰冷的化学气体",
        lines: [
          "环境痕迹",
          "载气",
          "冷却剂",
          "挥发性化合物",
          "匹配度 73%",
          "WARNING",
          "检测到未知化合物",
        ],
      },
      {
        id: "04",
        label: "烧焦后的残留物",
        lines: [
          "残留物检测",
          "碳化物",
          "聚合物",
          "未知痕迹",
          "匹配度 64%",
          "数据完整性：",
          "下降中",
        ],
      },
    ],
  },
  smell: {
    label: "感官记录 / 02",
    prompt: "你闻到了什么？",
    options: [
      {
        id: "01",
        label: "熟透的桃肉",
        lines: [
          "气味匹配",
          "有机物 / 果实",
          "匹配度 88%",
          "来源：",
          "未知",
        ],
      },
      {
        id: "02",
        label: "冷却液与橡胶",
        lines: [
          "材料痕迹",
          "冷却剂",
          "橡胶",
          "匹配度 81%",
          "来源：",
          "神经接口",
        ],
      },
      {
        id: "03",
        label: "潮湿的金属与硅胶",
        lines: [
          "环境痕迹",
          "金属氧化物",
          "硅胶",
          "匹配度 76%",
          "来源：",
          "未知神经中继",
        ],
      },
      {
        id: "04",
        label: "烧焦的电子设备",
        lines: [
          "残留物检测",
          "碳化物",
          "聚合物",
          "匹配度 61%",
          "数据完整性：",
          "下降中",
        ],
      },
    ],
  },
};
