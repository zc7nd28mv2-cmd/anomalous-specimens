import { cn } from "@/lib/cn";

export function Command({
  children,
  onClick,
  disabled,
  className,
}: {
  children: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "mt-12 text-left font-mono text-[11px] tracking-[0.22em] text-mute transition-colors duration-300",
        "hover:text-ink focus-visible:text-ink focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-30",
        className,
      )}
    >
      [ {children} ]
    </button>
  );
}
