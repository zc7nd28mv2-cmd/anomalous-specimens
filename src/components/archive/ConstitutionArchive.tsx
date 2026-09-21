"use client";

import { useArchive } from "@/context/ArchiveContext";
import { useReveal } from "@/hooks/useReveal";
import { BackLink } from "@/components/system/BackLink";
import { Cursor } from "@/components/system/Cursor";
import { CONSTITUTION } from "@/lib/constitution";

const DELAYS = [
  360, 300, 300, 500, 2000, 420, 360, 1600, 420, 500, 720, 360, 1600, 420, 500,
  720, 360, 1600, 420, 500,
] as const;

export function ConstitutionArchive() {
  const { go } = useArchive();
  const step = useReveal(DELAYS);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-bg px-5 py-16 sm:px-10 sm:py-20 md:px-16">
      <div className="story-content mx-auto md:ml-[6vw]">
        {step >= 1 ? (
          <h1 className="compose-fade title-module text-ink">{CONSTITUTION.title}</h1>
        ) : null}
        {step >= 2 ? (
          <p className="compose-fade aux-en mt-2">{CONSTITUTION.en}</p>
        ) : null}
        {step >= 3 ? (
          <p className="compose-fade sys-meta mt-6">{CONSTITUTION.record}</p>
        ) : null}

        {step >= 4 ? (
          <ScanLine
            text={CONSTITUTION.scan}
            running={step === 4}
            className="mt-12"
          />
        ) : null}

        {step >= 6 ? (
          <NoteBlock
            title={`【${CONSTITUTION.groups[0].zh}】`}
            code={CONSTITUTION.traces["01"]}
            items={CONSTITUTION.groups[0].items.join(" / ")}
            showCode={step >= 7}
            running={step === 7}
            showResult={step >= 9}
            showItems={step >= 10}
          />
        ) : null}

        {step >= 11 ? (
          <NoteBlock
            title={`【${CONSTITUTION.groups[1].zh}】`}
            code={CONSTITUTION.traces["02"]}
            items={CONSTITUTION.groups[1].items.join(" / ")}
            showCode={step >= 12}
            running={step === 12}
            showResult={step >= 14}
            showItems={step >= 15}
          />
        ) : null}

        {step >= 16 ? (
          <NoteBlock
            title={`【${CONSTITUTION.groups[2].zh}】`}
            code={CONSTITUTION.traces["03"]}
            items={CONSTITUTION.groups[2].items.join(" / ")}
            showCode={step >= 17}
            running={step === 17}
            showResult={step >= 19}
            showItems={step >= 20}
          />
        ) : null}

        <BackLink label="返回 仙桃夢" onClick={() => go("specimen")} />
      </div>
    </div>
  );
}

function ScanLine({
  text,
  running,
  className,
}: {
  text: string;
  running: boolean;
  className?: string;
}) {
  return (
    <p className={`compose-fade compose-code ${running ? "is-run" : ""} ${className ?? ""}`}>
      {text}
      {running ? <Cursor /> : null}
    </p>
  );
}

function NoteBlock({
  title,
  code,
  items,
  showCode,
  running,
  showResult,
  showItems,
}: {
  title: string;
  code: string;
  items: string;
  showCode: boolean;
  running: boolean;
  showResult: boolean;
  showItems: boolean;
}) {
  return (
    <section className="mt-14">
      <p className="compose-fade font-sans text-[14px] text-ink">{title}</p>
      {showCode ? <ScanLine text={code} running={running} className="mt-4" /> : null}
      {showResult ? (
        <p className="compose-fade compose-result mt-5">{CONSTITUTION.result}</p>
      ) : null}
      {showItems ? <p className="compose-fade compose-items mt-4">{items}</p> : null}
    </section>
  );
}
