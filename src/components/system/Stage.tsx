import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Stage({
  children,
  className,
  align = "start",
}: {
  children: ReactNode;
  className?: string;
  align?: "start" | "center";
}) {
  return (
    <div
      className={cn(
        "relative min-h-dvh w-full bg-bg px-5 py-16 sm:px-10 sm:py-20 md:px-16 lg:px-24",
        align === "center" && "flex items-center",
        className,
      )}
    >
      <div
        className={cn(
          "w-full max-w-[520px]",
          align === "start" && "md:ml-[6vw] lg:ml-[10vw]",
          align === "center" && "mx-auto",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] tracking-[0.22em] text-dim sm:text-[11px]">
      {children}
    </p>
  );
}

export function SysLine({
  children,
  danger,
  className,
}: {
  children: ReactNode;
  danger?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-[12px] leading-7 tracking-[0.04em] sm:text-[13px]",
        danger ? "text-danger" : "text-mute",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function StoryLine({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-sans text-[15px] leading-[1.9] text-ink/90 sm:text-[16px]",
        className,
      )}
    >
      {children}
    </p>
  );
}
