"use client";

import { useState } from "react";
import { Command } from "@/components/system/Command";
import { Rule } from "@/components/system/Rule";
import { Stage } from "@/components/system/Stage";
import { SPECIMENS, SYSTEM } from "@/lib/content";

export function IndexScene({ onAccess }: { onAccess: () => void }) {
  const [denied, setDenied] = useState<string | null>(null);

  return (
    <Stage>
      <div className="rise">
        <p className="phosphor font-mono text-[11px] tracking-[0.26em] text-ink sm:text-[12px]">
          {SYSTEM.title}
        </p>
        <p className="mt-2 font-mono text-[10px] tracking-[0.22em] text-dim sm:text-[11px]">
          {SYSTEM.index}
        </p>
      </div>

      <div className="mt-14 space-y-12">
        {SPECIMENS.map((specimen) => (
          <section key={specimen.id} className="rise">
            <Rule className="mb-8" />
            <p className="font-mono text-[10px] tracking-[0.24em] text-dim">
              {specimen.id}
            </p>
            {specimen.locked ? (
              <>
                <h2 className="mt-3 font-mono text-[15px] tracking-[0.12em] text-mute sm:text-[16px]">
                  {specimen.name}
                </h2>
                <p className="mt-2 font-sans text-[14px] text-mute">{specimen.alias}</p>
              </>
            ) : (
              <button type="button" onClick={onAccess} className="block text-left">
                <h2 className="mt-3 font-mono text-[15px] tracking-[0.12em] text-ink transition-colors duration-300 hover:text-ink sm:text-[16px]">
                  {specimen.name}
                </h2>
                <p className="mt-2 font-sans text-[14px] text-mute">{specimen.alias}</p>
              </button>
            )}
            {specimen.kind ? (
              <p className="mt-5 font-mono text-[10px] tracking-[0.16em] text-dim">
                {specimen.kind}
              </p>
            ) : null}
            <p
              className={`mt-4 font-mono text-[10px] tracking-[0.18em] ${
                specimen.locked ? "text-dim" : "text-mute"
              }`}
            >
              STATUS: {specimen.status}
            </p>

            {specimen.locked ? (
              <div>
                <Command
                  className="mt-6"
                  onClick={() => setDenied(specimen.id)}
                >
                  LOCKED
                </Command>
                {denied === specimen.id ? (
                  <p className="fade mt-4 font-mono text-[10px] tracking-[0.16em] text-danger">
                    ACCESS DENIED
                  </p>
                ) : null}
              </div>
            ) : (
              <Command className="mt-6" onClick={onAccess}>
                ACCESS SPECIMEN
              </Command>
            )}
          </section>
        ))}
      </div>

      <Rule className="mt-12" />
      <p className="mt-6 font-mono text-[10px] tracking-[0.18em] text-dim">
        {SYSTEM.count}
      </p>
    </Stage>
  );
}
