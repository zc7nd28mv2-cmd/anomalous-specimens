"use client";

import { useReveal } from "@/hooks/useReveal";
import { Command } from "@/components/system/Command";
import { Stage } from "@/components/system/Stage";
import { DOSSIER } from "@/lib/content";

const DELAYS = [400, 700] as const;

const FIELDS = [
  [DOSSIER.projectLabel, DOSSIER.project],
  [DOSSIER.classLabel, DOSSIER.classification],
  [DOSSIER.versionLabel, DOSSIER.version],
  [DOSSIER.statusLabel, DOSSIER.status],
] as const;

export function DossierScene({ onContinue }: { onContinue: () => void }) {
  const step = useReveal(DELAYS);

  return (
    <Stage>
      {step >= 1 ? (
        <p className="rise font-mono text-[11px] tracking-[0.24em] text-dim">
          {DOSSIER.heading}
        </p>
      ) : null}

      {step >= 2 ? (
        <dl className="mt-14 space-y-8">
          {FIELDS.map(([label, value]) => (
            <div key={label} className="rise">
              <dt className="font-mono text-[10px] tracking-[0.2em] text-dim">
                {label}
              </dt>
              <dd className="mt-2 font-mono text-[13px] tracking-[0.06em] text-ink sm:text-[14px]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {step >= 2 ? (
        <Command onClick={onContinue}>OPEN RECORD</Command>
      ) : null}
    </Stage>
  );
}
