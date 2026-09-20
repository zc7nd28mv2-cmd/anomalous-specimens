import { cn } from "@/lib/cn";
import { CODE_KEYS } from "@/lib/source";

function splitHighlighted(text: string) {
  const pattern = new RegExp(`(${CODE_KEYS.join("|")})`, "g");
  return text.split(pattern);
}

export function CodeLine({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const parts = splitHighlighted(text);

  return (
    <pre
      className={cn(
        "font-mono text-[12px] leading-[1.55] text-dim whitespace-pre-wrap sm:text-[13px]",
        className,
      )}
    >
      {parts.map((part, index) => {
        const bright = CODE_KEYS.includes(
          part as (typeof CODE_KEYS)[number],
        );
        return (
          <span key={`${part}-${index}`} className={bright ? "text-ink" : undefined}>
            {part}
          </span>
        );
      })}
    </pre>
  );
}
