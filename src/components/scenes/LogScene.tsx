"use client";

import { useMemo } from "react";
import { useAfter, useReveal } from "@/hooks/useReveal";
import { Cursor } from "@/components/system/Cursor";
import { Rule } from "@/components/system/Rule";
import { Stage } from "@/components/system/Stage";
import { LOG } from "@/lib/content";

type Entry =
  | { kind: "meta"; text: string }
  | { kind: "rule" }
  | { kind: "time"; text: string }
  | { kind: "line"; text: string }
  | { kind: "warn"; text: string }
  | { kind: "lost"; text: string }
  | { kind: "after"; text: string };

function buildEntries(): Entry[] {
  const entries: Entry[] = [
    { kind: "meta", text: LOG.title },
    { kind: "meta", text: LOG.id },
    { kind: "meta", text: LOG.status },
    { kind: "meta", text: LOG.source },
    { kind: "rule" },
  ];

  for (const block of LOG.blocks) {
    entries.push({ kind: "time", text: block.time });
    for (const line of block.lines) {
      if (line === LOG.warning) {
        entries.push({ kind: "warn", text: line });
      } else if (line === LOG.lost) {
        entries.push({ kind: "lost", text: line });
      } else {
        entries.push({ kind: "line", text: line });
      }
    }
    entries.push({ kind: "rule" });
  }

  for (const line of LOG.after) {
    entries.push({ kind: "after", text: line });
  }

  return entries;
}

function delayFor(entry: Entry, index: number) {
  if (index === 0) {
    return 400;
  }
  switch (entry.kind) {
    case "meta":
      return 220;
    case "rule":
      return 360;
    case "time":
      return 900;
    case "warn":
      return 1100;
    case "lost":
      return 1400;
    case "after":
      return 520;
    default:
      return 640;
  }
}

export function LogScene({ onComplete }: { onComplete: () => void }) {
  const entries = useMemo(() => buildEntries(), []);
  const delays = useMemo(() => entries.map(delayFor), [entries]);
  const step = useReveal(delays);
  const done = step >= entries.length;

  useAfter(2200, onComplete, done);

  return (
    <Stage>
      <div className="space-y-3">
        {entries.slice(0, step).map((entry, index) => (
          <LogEntry key={`${entry.kind}-${index}`} entry={entry} />
        ))}
      </div>
      <div className="mt-8">
        <Cursor still={done} />
      </div>
    </Stage>
  );
}

function LogEntry({ entry }: { entry: Entry }) {
  if (entry.kind === "rule") {
    return <Rule className="my-5" />;
  }

  if (entry.kind === "meta") {
    return (
      <p className="font-mono text-[11px] tracking-[0.12em] text-dim">{entry.text}</p>
    );
  }

  if (entry.kind === "time") {
    return (
      <p className="pt-2 font-mono text-[11px] tracking-[0.14em] text-mute">
        {entry.text}
      </p>
    );
  }

  if (entry.kind === "warn") {
    return (
      <p className="font-mono text-[12px] tracking-[0.04em] text-danger">
        {entry.text}
      </p>
    );
  }

  if (entry.kind === "lost") {
    return (
      <p className="font-mono text-[12px] tracking-[0.08em] text-danger">
        {entry.text}
      </p>
    );
  }

  if (entry.kind === "after") {
    const systemLike =
      entry.text.startsWith("PEACH DREAM") ||
      entry.text.startsWith("0.91") ||
      entry.text === "后续调查：" ||
      entry.text === "程序名称：" ||
      entry.text === "版本：" ||
      entry.text === "备注：";

    return (
      <p
        className={
          systemLike
            ? "font-mono text-[12px] leading-7 text-mute"
            : "font-sans text-[14px] leading-8 text-ink/90"
        }
      >
        {entry.text}
      </p>
    );
  }

  return (
    <p className="font-sans text-[15px] leading-8 text-ink/90 sm:text-[16px]">
      {entry.text}
    </p>
  );
}
