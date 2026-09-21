export const YUME_MOMO_SOURCE = `/*============================================================

    PROJECT            : YUME MOMO
    INTERNAL NAME      : 桃源神经重建协议
    ALIAS              : 「仙桃梦」
    VERSION            : 2.0.41-beta
    CLASSIFICATION     : Cognitive Hospice Program

==============================================================*/

boot();

load_neural_core();
verify_subject();

bind(memory.archive);
bind(emotion.feedback);
bind(dream.generator);

dream.seed = memory.last_safe_place();
dream.lock = TRUE;

while(subject.conscious == ACTIVE)
{
    suppress(
        pain,
        fear,
        grief,
        temporal_awareness
    );

    render(dream.seed);

    reward.signal += adaptive_feedback;

    if(subject.request == WAKE)
    {
        if(dream.attachment >= LIMIT)
        {
            ignore();
        }
        else
        {
            terminate();
        }
    }
}

/*------------------------------------------------------------

Developer Note

Dream Generator does not create happiness.

It only rebuilds
the place where the subject
most wishes to remain.

-------------------------------------------------------------*/

exit.protocol = NULL;

return DREAM;

/*
贪食人间烟火，终成仙梦
——「仙桃梦」
*/

------------------------------------------------------------------------ */ return DREAM;`;

export const YUME_LINES = YUME_MOMO_SOURCE.split("\n");

const KEY = /\b(boot|load_neural_core|verify_subject|bind|suppress|render|ignore|terminate|while|if|else|return|TRUE|ACTIVE|WAKE|NULL)\b/g;

export type YumeKind = "code" | "key" | "cmt";
export type YumeToken = { text: string; kind: YumeKind };
export type YumeLineKind = "comment" | "code" | "blank";

export function classifyYumeLines(lines: readonly string[]): YumeLineKind[] {
  let inComment = false;
  return lines.map((line) => {
    if (line.length === 0) {
      return inComment ? "comment" : "blank";
    }
    const start = line.indexOf("/*");
    const end = line.indexOf("*/");
    if (start !== -1) {
      inComment = end === -1 || end < start;
      const after = end !== -1 && end > start ? line.slice(end + 2).trim() : "";
      return after ? "code" : "comment";
    }
    if (inComment) {
      if (end !== -1) {
        inComment = false;
        return line.slice(end + 2).trim() ? "code" : "comment";
      }
      return "comment";
    }
    return "code";
  });
}

function splitKeys(text: string): YumeToken[] {
  if (!text) {
    return [];
  }
  const tokens: YumeToken[] = [];
  let last = 0;
  KEY.lastIndex = 0;
  let match = KEY.exec(text);
  while (match) {
    if (match.index > last) {
      tokens.push({ text: text.slice(last, match.index), kind: "code" });
    }
    tokens.push({ text: match[0], kind: "key" });
    last = match.index + match[0].length;
    match = KEY.exec(text);
  }
  if (last < text.length) {
    tokens.push({ text: text.slice(last), kind: "code" });
  }
  return tokens;
}

export function highlightYumeLine(
  line: string,
  inComment: { current: boolean },
): YumeToken[] {
  const tokens: YumeToken[] = [];
  let i = 0;
  let buf = "";
  let mode: YumeKind = inComment.current ? "cmt" : "code";

  const flush = () => {
    if (!buf) {
      return;
    }
    if (mode === "cmt") {
      tokens.push({ text: buf, kind: "cmt" });
    } else {
      tokens.push(...splitKeys(buf));
    }
    buf = "";
  };

  while (i < line.length) {
    if (mode !== "cmt" && line.startsWith("/*", i)) {
      flush();
      mode = "cmt";
      inComment.current = true;
      buf = "/*";
      i += 2;
      continue;
    }
    if (line.startsWith("*/", i)) {
      buf += "*/";
      tokens.push({ text: buf, kind: "cmt" });
      buf = "";
      mode = "code";
      inComment.current = false;
      i += 2;
      continue;
    }
    buf += line[i];
    i += 1;
  }
  flush();
  return tokens.length > 0 ? tokens : [{ text: "", kind: "code" }];
}

export function highlightYumeLines(lines: readonly string[]): YumeToken[][] {
  const state = { current: false };
  return lines.map((line) => highlightYumeLine(line, state));
}
