export type FolderId =
  | "dossier"
  | "memory"
  | "termination"
  | "leak"
  | "pd001"
  | "unknown";

export type FileId = string;

export type FolderDef = {
  id: FolderId;
  index: string;
  title: string;
  subtitle: string;
  status: string;
  recovery: string;
  kind: string;
  stamp: string;
};

export const FOLDERS: FolderDef[] = [
  {
    id: "dossier",
    index: "01",
    title: "项目档案",
    subtitle: "医疗神经程序",
    status: "已恢复",
    recovery: "82%",
    kind: "档案 / 机密",
    stamp: "STAMP 00:14:07",
  },
  {
    id: "memory",
    index: "02",
    title: "记忆档案",
    subtitle: "恢复数据",
    status: "已恢复",
    recovery: "91%",
    kind: "记录 / 部分恢复",
    stamp: "STAMP 00:14:22",
  },
  {
    id: "termination",
    index: "03",
    title: "终止报告",
    subtitle: "机密资料",
    status: "受限访问",
    recovery: "74%",
    kind: "报告 / 已封存",
    stamp: "STAMP 00:15:03",
  },
  {
    id: "leak",
    index: "04",
    title: "数据泄漏",
    subtitle: "残留片段",
    status: "数据损坏",
    recovery: "47%",
    kind: "片段 / 未知来源",
    stamp: "STAMP 00:16:41",
  },
  {
    id: "pd001",
    index: "05",
    title: "PD-001",
    subtitle: "未知神经中继",
    status: "已恢复",
    recovery: "91%",
    kind: "现场记录",
    stamp: "21:07:14",
  },
  {
    id: "unknown",
    index: "06",
    title: "未知档案",
    subtitle: "无标题",
    status: "数据损坏",
    recovery: "—",
    kind: "来源 / 未知",
    stamp: "—",
  },
];

export const FOLDER_FILES: Record<
  Exclude<FolderId, "pd001" | "unknown">,
  { id: FileId; label: string; name: string }[]
> = {
  dossier: [
    { id: "classification", label: "FILE 000", name: "分类" },
    { id: "origin", label: "FILE 001", name: "项目起源" },
  ],
  memory: [
    { id: "interface", label: "FILE 002", name: "神经接口" },
    { id: "reconstruct", label: "FILE 003", name: "记忆重构" },
    { id: "last-place", label: "FILE 004", name: "最后停留处" },
  ],
  termination: [
    { id: "beta", label: "FILE 005", name: "BETA 0.94" },
    { id: "abandonment", label: "FILE 006", name: "REALITY ABANDONMENT" },
  ],
  leak: [
    { id: "theft", label: "FILE 007", name: "企业泄漏" },
    { id: "fragment", label: "FILE 008", name: "PEACH DREAM | Fragment" },
    { id: "city", label: "FILE 009", name: "城市记录" },
  ],
};
