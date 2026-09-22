"use client";

import { createPortal } from "react-dom";

const SLICES = [0, 1, 2, 3, 4] as const;

export function ArchiveCut() {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="archive-cut" aria-hidden="true">
      {SLICES.map((index) => (
        <div
          key={index}
          className="archive-cut-slice"
          style={{
            top: `${index * 20}%`,
            animationDelay: `${index * 24}ms`,
          }}
        />
      ))}
    </div>,
    document.body,
  );
}
