export type SceneId =
  | "boot"
  | "index"
  | "access"
  | "dossier"
  | "origin"
  | "termination"
  | "abandonment"
  | "leak"
  | "city"
  | "log"
  | "notice"
  | "corruption"
  | "critical"
  | "code"
  | "wake"
  | "ending";

export type Surface = "void" | "archive" | "system" | "terminal";

export function surfaceFor(scene: SceneId): Surface {
  switch (scene) {
    case "boot":
    case "critical":
    case "ending":
      return "void";
    case "code":
    case "wake":
      return "terminal";
    case "notice":
    case "corruption":
      return "system";
    default:
      return "archive";
  }
}
