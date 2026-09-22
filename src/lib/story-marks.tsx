import type { ReactNode } from "react";

export const STORY_HIT_TERMS = [
  "严重精神创伤",
  "神经退行性疾病",
  "意识护理",
  "长期记忆",
  "生命维持",
  "终止机制",
  "梦境生成",
] as const;

export const STORY_STRIKE_TERMS = ["黑市", "受试者"] as const;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const HIT_SET = new Set<string>(STORY_HIT_TERMS);
const STRIKE_SET = new Set<string>(STORY_STRIKE_TERMS);

const MARK_PATTERN = new RegExp(
  `(${[...STORY_HIT_TERMS, ...STORY_STRIKE_TERMS]
    .slice()
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|")})`,
);

export function decorateStory(text: string): ReactNode {
  const parts = text.split(MARK_PATTERN);
  if (parts.length === 1) {
    return text;
  }

  return parts.map((part, index) => {
    if (HIT_SET.has(part)) {
      return (
        <span key={`hit-${index}`} className="story-hit">
          {part}
        </span>
      );
    }

    if (STRIKE_SET.has(part)) {
      return (
        <span key={`strike-${index}`} className="story-strike">
          {part}
        </span>
      );
    }

    return part;
  });
}
