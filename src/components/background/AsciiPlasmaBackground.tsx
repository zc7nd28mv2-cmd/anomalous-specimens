"use client";

import { useEffect, useRef } from "react";
import { startAsciiPlasma } from "@/components/background/ascii-plasma";

export function AsciiPlasmaBackground() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = host.current;
    if (!node) {
      return;
    }
    return startAsciiPlasma(node);
  }, []);

  return (
    <>
      <div ref={host} className="ascii-plasma" aria-hidden="true" />
      <div className="ascii-veil" aria-hidden="true" />
    </>
  );
}
