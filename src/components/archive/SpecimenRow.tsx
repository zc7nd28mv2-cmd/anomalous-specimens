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
      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M8.25 7.15A3.75 3.75 0 0 1 12 3.4a3.75 3.75 0 0 1 3.75 3.75V10H18a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3h2.25V7.15ZM12 5.4A1.75 1.75 0 0 0 10.25 7.15V10h3.5V7.15A1.75 1.75 0 0 0 12 5.4Zm0 9.1a1.6 1.6 0 0 0-.7 3.04V19h1.4v-1.46A1.6 1.6 0 0 0 12 14.5Z"
        />
      </svg>
    </span>
  );
}
