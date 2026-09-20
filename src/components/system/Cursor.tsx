import { cn } from "@/lib/cn";

export function Cursor({
  still = false,
  className,
}: {
  still?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "cursor-glyph",
        still ? "is-still" : "is-blink",
        className,
      )}
    />
  );
}
