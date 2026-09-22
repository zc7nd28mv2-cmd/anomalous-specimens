"use client";

import type { Surface } from "@/lib/scenes";
import { useArchive } from "@/context/ArchiveContext";

export function SystemChrome({ surface }: { surface: Surface }) {
  const { go } = useArchive();

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
      {left === "异常样本" ? (
        <button
          type="button"
          onClick={() => go("boot")}
          className="pointer-events-auto -ml-2 -mt-1 cursor-pointer bg-transparent px-2 py-1.5 text-left font-mono text-[9px] tracking-[0.2em] text-dim shadow-none hover:text-mute sm:text-[10px]"
        >
          {left}
        </button>
      ) : (
        <span className="font-mono text-[9px] tracking-[0.2em] text-dim sm:text-[10px]">
          {left}
        </span>
      )}
      <span className="font-mono text-[9px] tracking-[0.2em] text-dim sm:text-[10px]">
        {right}
      </span>
    </div>
  );
}
