"use client";

import { useEffect, useRef } from "react";

const FAULTS = ["is-a", "is-b", "is-c", "is-d"] as const;

function waitMs() {
  return 2000 + Math.random() * 3000;
}

function burstMs() {
  return 320 + Math.random() * 420;
}

export function UnstableEnglishTitle({
  className,
  children,
}: {
  className?: string;
  children: string;
}) {
  const title = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const node = title.current;
    if (!node) {
      return;
    }
    if (
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let alive = true;
    let timer = 0;
    let onEnd: ((event: AnimationEvent) => void) | null = null;

    const clearFault = () => {
      if (onEnd) {
        node.removeEventListener("animationend", onEnd);
        onEnd = null;
      }
      node.classList.remove("title-fault", ...FAULTS);
      node.style.animationDuration = "";
    };

    const arm = () => {
      timer = window.setTimeout(() => {
        if (!alive) {
          return;
        }
        const fault = FAULTS[Math.floor(Math.random() * FAULTS.length)];
        clearFault();
        node.style.animationDuration = `${burstMs()}ms`;
        node.classList.add("title-fault", fault);
        onEnd = (event: AnimationEvent) => {
          if (event.target !== node || !event.animationName.startsWith("title-fault")) {
            return;
          }
          clearFault();
          if (alive) {
            arm();
          }
        };
        node.addEventListener("animationend", onEnd);
      }, waitMs());
    };

    arm();

    return () => {
      alive = false;
      window.clearTimeout(timer);
      clearFault();
    };
  }, []);

  return (
    <p ref={title} className={className}>
      {children}
    </p>
  );
}
