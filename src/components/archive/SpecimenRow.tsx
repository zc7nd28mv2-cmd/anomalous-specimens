import type { ReactNode } from "react";
import type { Specimen } from "@/lib/content";
import { Rule } from "@/components/system/Rule";
import { cn } from "@/lib/cn";

export function SpecimenRow({
  specimen,
  action,
}: {
  specimen: Specimen;
  action: ReactNode;
}) {
  const meta = specimen.metadata ?? [];

  return (
    <section
      className={cn(
        "rise specimen-row",
        specimen.state === "restricted" && "is-restricted",
        specimen.state === "locked" && "is-undeveloped",
      )}
    >
      <Rule className="mb-7" />
      <SpecimenId>{specimen.id}</SpecimenId>
      <SpecimenName>{specimen.name}</SpecimenName>
      <SpecimenEnglishName>{specimen.englishName}</SpecimenEnglishName>
      <SpecimenMetadata items={meta} />
      <SpecimenStatus>{specimen.status}</SpecimenStatus>
      <SpecimenAction>{action}</SpecimenAction>
    </section>
  );
}

function SpecimenId({ children }: { children: string }) {
  return <p className="sys-meta">{children}</p>;
}

function SpecimenName({ children }: { children: string }) {
  return <h2 className="title-product specimen-name mt-4">{children}</h2>;
}

function SpecimenEnglishName({ children }: { children?: string }) {
  return <p className="aux-en specimen-en">{children || "\u00a0"}</p>;
}

function SpecimenMetadata({ items }: { items: readonly string[] }) {
  return (
    <div className={cn("specimen-meta", items.length > 1 && "has-lead")}>
      {items.length > 0 ? (
        items.map((line, index) => (
          <p key={`${index}-${line}`} className="aux-en specimen-meta-line">
            {line}
          </p>
        ))
      ) : (
        <p className="aux-en specimen-meta-line" aria-hidden="true">
          &nbsp;
        </p>
      )}
    </div>
  );
}

function SpecimenStatus({ children }: { children: string }) {
  return <p className="specimen-status">{children}</p>;
}

function SpecimenAction({ children }: { children: ReactNode }) {
  return <div className="specimen-action">{children}</div>;
}

export function SpecimenLock() {
  return (
    <span className="specimen-lock" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    </span>
  );
}
