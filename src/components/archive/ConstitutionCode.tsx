"use client";

import { useState } from "react";
import { CONSTITUTION } from "@/lib/constitution";
import { useAudio } from "@/context/AudioContext";
import { SpecimenTag } from "@/components/system/SpecimenTag";

export function ConstitutionCode() {
  const [open, setOpen] = useState(false);
  const audio = useAudio();

  return (
    <section id="sec-constitution" className="border-t border-line pt-16">
      <button
        type="button"
        onClick={() => {
          audio.click();
          setOpen((value) => !value);
        }}
        className="text-left"
      >
        <SpecimenTag size="chapter">{CONSTITUTION.title}</SpecimenTag>
        <p className="mt-2 font-mono text-[11px] tracking-[0.18em] text-sys">
          {CONSTITUTION.en}
        </p>
        <p className="mt-4 font-sans text-[13px] text-green-dim">
          {open ? "收起样本构成" : "展开样本构成"}
        </p>
      </button>

      {open ? (
        <div className="mt-10 space-y-10">
          {CONSTITUTION.groups.map((group) => (
            <div key={group.id}>
              <p className="font-mono text-[11px] tracking-[0.16em] text-sys">
                {group.id} / {group.en}
              </p>
              <p className="mt-2 font-sans text-[15px] text-mute">【{group.zh}】</p>
              <ul className="mt-4 space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="story-body">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
