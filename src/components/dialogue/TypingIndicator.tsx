"use client";

import { useEffect, useState } from "react";

export function TypingIndicator({ name }: { name: string }) {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const id = window.setInterval(() => {
      setDots((value) => (value % 3) + 1);
    }, 380);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="font-mono text-[11px] text-green-dim">
      <p className="phosphor-green tracking-[0.22em] text-green">{name}</p>
      <p className="mt-3 tracking-[0.08em]">
        正在输入{".".repeat(dots)}
      </p>
    </div>
  );
}
