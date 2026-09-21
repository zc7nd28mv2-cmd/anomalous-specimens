import type { Surface } from "@/lib/scenes";

export function SystemChrome({ surface }: { surface: Surface }) {
  if (surface === "void") {
    return null;
  }

  const left =
    surface === "terminal"
      ? "PROCESS"
      : surface === "system"
        ? "UNSTABLE"
        : "异常样本";

  const right =
    surface === "terminal"
      ? "INTERNAL"
      : surface === "system"
        ? "SOURCE UNKNOWN"
        : "ARCHIVE / 部分恢复";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-10 flex items-start justify-between px-5 py-4 sm:px-8">
      <span className="font-mono text-[9px] tracking-[0.2em] text-dim sm:text-[10px]">
        {left}
      </span>
      <span className="font-mono text-[9px] tracking-[0.2em] text-dim sm:text-[10px]">
        {right}
      </span>
    </div>
  );
}
