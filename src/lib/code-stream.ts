import { CONSTITUTION } from "@/lib/constitution";

export type NoteStreamId = "top" | "heart" | "base";

type StreamSource = {
  traces: { "01": string; "02": string; "03": string };
  streams: { top: readonly string[]; heart: readonly string[]; base: readonly string[] };
};

const STREAM_WAITS = [55, 90, 130, 70, 180, 95, 140, 60, 160, 75, 110, 200] as const;

let streamRun = 0;
let revealRun = 0;

function irregularWait() {
  return STREAM_WAITS[Math.floor(Math.random() * STREAM_WAITS.length)] ?? 90;
}

export function startNoteStreams(
  onFrame: (id: NoteStreamId, text: string) => void,
  onAllSettled?: () => void,
  source: StreamSource = CONSTITUTION,
) {
  const run = ++streamRun;
  const timers: number[] = [];
  const duration = 1800 + Math.random() * 400;
  let ended = false;
  const settle = {
    top: source.traces["01"],
    heart: source.traces["02"],
    base: source.traces["03"],
  };

  const clear = () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.length = 0;
  };

  (["top", "heart", "base"] as const).forEach((id) => {
    const frames = source.streams[id];
    let index = 0;

    const step = () => {
      if (run !== streamRun || ended || index >= frames.length) {
        return;
      }
      const next = frames[index];
      if (next) {
        onFrame(id, next);
      }
      index += 1;
      if (index < frames.length) {
        timers.push(window.setTimeout(step, irregularWait()));
      }
    };

    timers.push(window.setTimeout(step, irregularWait()));
  });

  timers.push(
    window.setTimeout(() => {
      if (run !== streamRun || ended) {
        return;
      }
      ended = true;
      clear();
      onFrame("top", settle.top);
      onFrame("heart", settle.heart);
      onFrame("base", settle.base);
      onAllSettled?.();
    }, duration),
  );

  return () => {
    ended = true;
    if (streamRun === run) {
      streamRun += 1;
    }
    clear();
  };
}

export function startMaterialReveal(
  texts: readonly [string, string, string],
  onTick: (parts: [string, string, string]) => void,
  onDone?: () => void,
) {
  const run = ++revealRun;
  const timers: number[] = [];
  const chars = texts.map((text) => Array.from(text));
  const max = Math.max(...chars.map((list) => list.length), 0);
  let index = 0;

  const clear = () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.length = 0;
  };

  const step = () => {
    if (run !== revealRun) {
      return;
    }
    index += 1;
    onTick(
      chars.map((list) => list.slice(0, index).join("")) as [
        string,
        string,
        string,
      ],
    );
    if (index >= max) {
      onDone?.();
      return;
    }
    timers.push(window.setTimeout(step, 35 + Math.random() * 35));
  };

  timers.push(window.setTimeout(step, 50 + Math.random() * 100));

  return () => {
    if (revealRun === run) {
      revealRun += 1;
    }
    clear();
  };
}
