"use client";

import type { CSSProperties, ReactNode } from "react";
import { useAudio } from "@/context/AudioContext";
import { cn } from "@/lib/cn";

export function Command({
  children,
  onClick,
  disabled,
  className,
  style,
  bracket = true,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  bracket?: boolean;
}) {
  const audio = useAudio();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        audio.click();
        onClick?.();
      }}
      style={style}
      className={cn("sys-cmd", className)}
    >
      {bracket ? `[ ${children} ]` : children}
    </button>
  );
}
