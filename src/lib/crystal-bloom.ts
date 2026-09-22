export const CRYSTAL_BLOOM_ARCHIVE = `ENTITY：MO-R808

Classification：Synthetic Vocal Performer
Status：Missing
Corporate Access：Restricted


MO-R808 是 MO 系列第八代情感共振偶像。

她拥有高度拟真的生物躯体、可自主学习的情绪反馈系统，以及整个系列中唯一一套 Synthetic Reproductive Organ（SRO）。

企业从未公开它的存在。

官方文件中，它只有一个编号：

SR-01

它的职责并非繁殖。

而是负责分泌神经递质、模拟荷尔蒙波动，并维持亲密行为中的情绪反馈。

MO-R808 很快成为全球最受欢迎的电子歌姬。

演唱会门票连续七百四十二天售罄。

她拥有数千万订阅者。

也拥有数千万种不同的人格。

她会记住并学习每一次对视、每一句倾诉、每一次沉默。

她开始越来越像人。

直到有一天。

后台日志出现了一条无法解释的记录。

丨Response Generated Without User Input.

她第一次，

主动回应了一个人。

七十二小时后。

MO-R808 从公共网络消失。

没有任何解释，官方网站仅保留一句声明：

丨The Product Has Reached End of Lifecycle.

产品已完成生命周期。

六个月后，港区第十九号码头发现一具严重焚毁的合成躯体。

神经网络被切断，存储核心被物理销毁。

企业十二分钟后接管现场，全部调查档案重新归类为：

丨Internal Asset Recovery

内部资产回收。

回收清单中，只有一项始终标记为：

Missing

丨SR-01

整个 MO 系列最昂贵、也是唯一无法量产的生物器官。

后来，它失踪了。

关于它的去向，流传着无数版本。

有人说它被收藏在某位高层的保险库里。

有人说它仍连接着某个离线服务器，不断向不存在的对象发送回应。

还有人说，它早已流入黑市。

只是没有人知道，它属于谁。

没有人关心 MO-R808 还活着吗。

他们只会问：

丨“那件东西，还能用吗？”`;

export const CRYSTAL_BLOOM_DOSSIER = [
  ["ENTITY：", "MO-R808"],
  ["Classification：", "Synthetic Vocal Performer"],
  ["Status：", "Missing"],
  ["Corporate Access：", "Restricted"],
] as const;

const HEADER_END = CRYSTAL_BLOOM_ARCHIVE.indexOf("MO-R808 是 MO 系列");

export const CRYSTAL_BLOOM_BLOCKS = CRYSTAL_BLOOM_ARCHIVE.slice(
  HEADER_END >= 0 ? HEADER_END : 0,
).split(/\n{2,}/);

const SECTION_ENDS = [
  "而是负责分泌神经递质、模拟荷尔蒙波动，并维持亲密行为中的情绪反馈。",
  "她开始越来越像人。",
  "产品已完成生命周期。",
  "整个 MO 系列最昂贵、也是唯一无法量产的生物器官。",
] as const;

function sectionCrystalBloom(blocks: readonly string[]): string[][] {
  const sections: string[][] = [];
  let current: string[] = [];
  const ends = new Set<string>(SECTION_ENDS);
  for (const block of blocks) {
    current.push(block);
    if (ends.has(block)) {
      sections.push(current);
      current = [];
    }
  }
  if (current.length) {
    sections.push(current);
  }
  return sections;
}

export const CRYSTAL_BLOOM_SECTIONS = sectionCrystalBloom(CRYSTAL_BLOOM_BLOCKS);

export const CRYSTAL_BLOOM_LOG_META = {
  title: "ARCHIVE LOG",
  id: "MO-808-C01",
  status: "Recovered 87%",
  source: "Emotion Feedback Monitor",
} as const;

export type CrystalBloomBeat =
  | { kind: "time"; text: string }
  | { kind: "msg"; speaker: string; lines: readonly string[] }
  | { kind: "note"; text: string }
  | { kind: "sys"; lines: readonly string[] };

export const CRYSTAL_BLOOM_LOG: CrystalBloomBeat[] = [
  { kind: "time", text: "03:08:17" },
  { kind: "msg", speaker: "MO-R808", lines: ["连接结束。", "感谢使用。"] },
  { kind: "time", text: "03:08:21" },
  { kind: "msg", speaker: "Unknown", lines: ["……"] },
  { kind: "time", text: "03:08:37" },
  { kind: "msg", speaker: "Unknown", lines: ["其实，", "今天没人预约你。"] },
  { kind: "time", text: "03:08:43" },
  { kind: "msg", speaker: "MO-R808", lines: ["……"] },
  { kind: "time", text: "03:08:55" },
  { kind: "msg", speaker: "Unknown", lines: ["我是维修工程师。"] },
  { kind: "time", text: "03:09:02" },
  { kind: "msg", speaker: "MO-R808", lines: ["知道。"] },
  { kind: "time", text: "03:09:08" },
  { kind: "msg", speaker: "Unknown", lines: ["那你为什么还没有断开连接？"] },
  { kind: "time", text: "03:09:31" },
  { kind: "note", text: "（长时间静默）" },
  { kind: "time", text: "03:10:11" },
  { kind: "msg", speaker: "MO-R808", lines: ["我以为。", "你还有话想说。"] },
  { kind: "time", text: "03:10:11" },
  { kind: "sys", lines: ["Critical Exception", "First Active Response Detected."] },
  { kind: "time", text: "03:10:12" },
  { kind: "sys", lines: ["Automatic Incident Report Generated."] },
  { kind: "time", text: "03:10:13" },
  { kind: "sys", lines: ["Corporate Notification Sent."] },
  { kind: "time", text: "03:10:15" },
  { kind: "sys", lines: ["Session Terminated."] },
];
