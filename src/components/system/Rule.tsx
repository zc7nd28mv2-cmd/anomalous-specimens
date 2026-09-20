import { cn } from "@/lib/cn";

export function Rule({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-px w-full max-w-[280px] bg-line", className)}
      aria-hidden
    />
  );
}
