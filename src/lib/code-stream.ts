import { CONSTITUTION } from "@/lib/constitution";

export type NoteStreamId = "top" | "heart" | "base";

const STREAM_WAITS = [55, 90, 130, 70, 180, 95, 140, 60, 160, 75, 110, 200] as const;

const SETTLE: Record<NoteStreamId, string> = {
  top: CONSTITUTION.traces["01"],
  heart: CONSTITUTION.traces["02"],
  base: CONSTITUTION.traces["03"],
};

let streamRun = 0;

function irregularWait() {
  return STREAM_WAITS[Math.floor(Math.random() * STREAM_WAITS.length)] ?? 90;
}

export function startNoteStreams(
  onFrame: (id: NoteStreamId, text: string) => void,
  onSettled?: (id: NoteStreamId) => void,
) {
  const run = ++streamRun;
  const timers: number[] = [];

  const settle = (id: NoteStreamId) => {
    if (run !== streamRun) {
      return;
    }
    onFrame(id, SETTLE[id]);
    onSettled?.(id);
  };

  (["top", "heart", "base"] as const).forEach((id) => {
    const frames = CONSTITUTION.streams[id];
    const limit = 1500 + Math.random() * 1000;
    let index = 0;
    let elapsed = 0;

    const step = () => {
      if (run !== streamRun) {
        return;
      }
      const next = frames[index % frames.length];
      if (next) {
        onFrame(id, next);
      }
      index += 1;
      const wait = irregularWait();
      elapsed += wait;
      if (elapsed >= limit) {
        timers.push(window.setTimeout(() => settle(id), wait));
        return;
      }
      timers.push(window.setTimeout(step, wait));
    };

    timers.push(window.setTimeout(step, irregularWait()));
  });

  return () => {
    if (streamRun === run) {
      streamRun += 1;
    }
    timers.forEach((id) => window.clearTimeout(id));
  };
}
