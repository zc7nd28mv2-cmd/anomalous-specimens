import { cn } from "@/lib/cn";

export function SpecimenTag({
  children,
  size = "name",
  tone = "paper",
  className,
}: {
  children: string;
  size?: "system" | "name" | "chapter";
  tone?: "paper" | "dim";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block font-sans tracking-[0.04em]",
        tone === "paper" ? "bg-ink text-[#111111]" : "bg-[#2a2a28] text-mute",
        size === "system" && "px-3 py-1.5 text-[24px] font-medium sm:text-[32px]",
        size === "name" && "px-3 py-1.5 text-[30px] font-normal sm:text-[36px]",
        size === "chapter" && "px-2 py-1 text-[13px] font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}
