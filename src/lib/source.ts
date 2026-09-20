/**
 * Complete Peach Dream source. Must remain unmodified.
 * Never render this string as a single chapter.
 */
export const PEACH_DREAM_SOURCE = `PROJECT PEACH DREAM
INTERNAL NAME 桃源神经重建协议
ALIAS 「仙桃梦」
VERSION 2.0.41-beta
CLASSIFICATION Cognitive Hospice Program

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

Developer Note:

Dream Generator does not create happiness.

It only rebuilds the place where the subject most wishes to remain.

exit.protocol = NULL;

return DREAM;`;

export const CODE_KEYS = [
  "dream.seed",
  "dream.lock",
  "subject.conscious",
  "subject.request",
  "dream.attachment",
  "exit.protocol",
] as const;

const SOURCE_LINES = PEACH_DREAM_SOURCE.split("\n");

export const SOURCE_HEADER = SOURCE_LINES.slice(0, 5);
export const SOURCE_BOOT = [
  SOURCE_LINES[6],
  SOURCE_LINES[7],
  SOURCE_LINES[8],
] as const;
export const SOURCE_BIND = [
  SOURCE_LINES[10],
  SOURCE_LINES[11],
  SOURCE_LINES[12],
] as const;
export const SOURCE_SEED = SOURCE_LINES[14];
export const SOURCE_LOCK = SOURCE_LINES[15];
export const SOURCE_LOOP = SOURCE_LINES[17];
export const SOURCE_SUPPRESS = SOURCE_LINES.slice(19, 25).join("\n");
export const SOURCE_RENDER = SOURCE_LINES[26].trim();
export const SOURCE_REWARD = SOURCE_LINES[28].trim();
export const SOURCE_WAKE_IF = SOURCE_LINES[30].trim();
export const SOURCE_WAKE_LOGIC = SOURCE_LINES.slice(32, 40).join("\n");
export const SOURCE_NOTE_TITLE = SOURCE_LINES[43];
export const SOURCE_NOTE_1 = SOURCE_LINES[45];
export const SOURCE_NOTE_2 = SOURCE_LINES[47];
export const SOURCE_EXIT = SOURCE_LINES[49];
export const SOURCE_RETURN = SOURCE_LINES[51];
