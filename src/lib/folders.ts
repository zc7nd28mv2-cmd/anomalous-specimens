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
};

export const FOLDERS: FolderDef[] = [
  {
    id: "dossier",
    index: "01",
    title: "PROJECT DOSSIER",
    subtitle: "MEDICAL PROGRAM",
    status: "RECOVERED",
    recovery: "82%",
    kind: "FILE / CLASSIFIED",
  },
  {
    id: "memory",
    index: "02",
    title: "MEMORY ARCHIVE",
    subtitle: "RECOVERED DATA",
    status: "RECOVERED",
    recovery: "91%",
    kind: "RECORD / PARTIAL",
  },
  {
    id: "termination",
    index: "03",
    title: "TERMINATION REPORT",
    subtitle: "CLASSIFIED",
    status: "RESTRICTED",
    recovery: "74%",
    kind: "REPORT / SEALED",
  },
  {
    id: "leak",
    index: "04",
    title: "DATA LEAK",
    subtitle: "FRAGMENT",
    status: "CORRUPTED",
    recovery: "47%",
    kind: "FRAGMENT / UNKNOWN",
  },
  {
    id: "pd001",
    index: "05",
    title: "PD-001",
    subtitle: "UNKNOWN NEURAL RELAY",
    status: "RECOVERED",
    recovery: "91%",
    kind: "LOG / RELAY",
  },
  {
    id: "unknown",
    index: "06",
    title: "UNKNOWN",
    subtitle: "NO LABEL",
    status: "LOCKED",
    recovery: "—",
    kind: "UNKNOWN",
  },
];

export const FOLDER_FILES: Record<
  Exclude<FolderId, "pd001" | "unknown">,
  { id: FileId; label: string; name: string }[]
> = {
  dossier: [
    { id: "classification", label: "FILE 000", name: "CLASSIFICATION" },
    { id: "origin", label: "FILE 001", name: "PROJECT ORIGIN" },
  ],
  memory: [
    { id: "interface", label: "FILE 002", name: "NEURAL INTERFACE" },
    { id: "reconstruct", label: "FILE 003", name: "MEMORY RECONSTRUCTION" },
    { id: "last-place", label: "FILE 004", name: "LAST PLACE" },
  ],
  termination: [
    { id: "beta", label: "FILE 005", name: "BETA 0.94" },
    { id: "abandonment", label: "FILE 006", name: "REALITY ABANDONMENT" },
  ],
  leak: [
    { id: "theft", label: "FILE 007", name: "CORPORATE LEAK" },
    { id: "fragment", label: "FILE 008", name: "PEACH DREAM | Fragment" },
    { id: "city", label: "FILE 009", name: "CITY RECORD" },
  ],
};
