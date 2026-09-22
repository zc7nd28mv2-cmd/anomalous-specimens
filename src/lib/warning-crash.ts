import { randomRange, type WarningScreen } from "@/lib/warning-sequence";

export type CrashFlash = "off" | "hot" | "void";
export type CrashSound = "static" | "burst" | "cut" | "crackle";
export type CrashWindowId = WarningScreen["id"];

export type CrashWindowFault = {
  hide: boolean;
  brightness: number;
  opacity: number;
  dx: number;
  clip: string | null;
  headTear: boolean;
};

export type CrashSlice = {
  y: number;
  h: number;
  x: number;
};

export type CrashBand = {
  y: number;
  h: number;
  x: number;
};

export type CrashView = {
  active: boolean;
  phase: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  flash: CrashFlash;
  slices: CrashSlice[];
  band: CrashBand | null;
  noise: boolean;
  shake: number;
  windows: Record<CrashWindowId, CrashWindowFault>;
};

export type CrashEvent =
  | { at: number; kind: "phase"; phase: CrashView["phase"] }
  | { at: number; kind: "flash"; mode: CrashFlash }
  | { at: number; kind: "slices"; slices: CrashSlice[] }
  | { at: number; kind: "band"; band: CrashBand | null }
  | { at: number; kind: "noise"; on: boolean }
  | { at: number; kind: "shake"; px: number }
  | { at: number; kind: "window"; id: CrashWindowId; patch: Partial<CrashWindowFault> }
  | { at: number; kind: "sound"; name: CrashSound }
  | { at: number; kind: "done" };

const IDS: CrashWindowId[] = [
  "warning_01",
  "warning_02",
  "warning_03",
  "warning_04",
  "warning_05",
];

const SLICE_LAYOUT: Omit<CrashSlice, "x">[] = [
  { y: 0, h: 18 },
  { y: 18, h: 20 },
  { y: 38, h: 16 },
  { y: 54, h: 22 },
  { y: 76, h: 24 },
];

export function idleWindowFault(): CrashWindowFault {
  return {
    hide: false,
    brightness: 1,
    opacity: 1,
    dx: 0,
    clip: null,
    headTear: false,
  };
}

export function idleSlices(): CrashSlice[] {
  return SLICE_LAYOUT.map((slice) => ({ ...slice, x: 0 }));
}

export function idleCrashView(): CrashView {
  return {
    active: false,
    phase: 0,
    flash: "off",
    slices: idleSlices(),
    band: null,
    noise: false,
    shake: 0,
    windows: {
      warning_01: idleWindowFault(),
      warning_02: idleWindowFault(),
      warning_03: idleWindowFault(),
      warning_04: idleWindowFault(),
      warning_05: idleWindowFault(),
    },
  };
}

function jitter(base: number, spread = 35) {
  return Math.max(0, base + randomRange(-spread, spread));
}

function clipInset() {
  return `inset(${randomRange(6, 34).toFixed(1)}% 0 ${randomRange(14, 46).toFixed(1)}% 0)`;
}

function offsetSlices(count: number, amount: [number, number]): CrashSlice[] {
  const chosen = new Set<number>();
  while (chosen.size < count) {
    chosen.add(Math.floor(Math.random() * SLICE_LAYOUT.length));
  }
  return SLICE_LAYOUT.map((slice, index) => ({
    ...slice,
    x: chosen.has(index)
      ? (Math.random() > 0.5 ? 1 : -1) * randomRange(amount[0], amount[1])
      : 0,
  }));
}

function pulse(id: CrashWindowId, at: number, events: CrashEvent[]) {
  const hold = randomRange(30, 100);
  events.push({
    at,
    kind: "window",
    id,
    patch: {
      hide: false,
      brightness: randomRange(1.18, 1.75),
      opacity: randomRange(0.42, 1),
      dx: randomRange(-8, 8),
      clip: Math.random() > 0.4 ? clipInset() : null,
      headTear: Math.random() > 0.55,
    },
  });
  events.push({
    at: at + hold,
    kind: "window",
    id,
    patch: {
      brightness: 1,
      opacity: 1,
      dx: 0,
      clip: null,
      headTear: false,
    },
  });
}

function dimPulse(id: CrashWindowId, at: number, events: CrashEvent[]) {
  const hold = randomRange(30, 90);
  events.push({
    at,
    kind: "window",
    id,
    patch: {
      brightness: randomRange(0.28, 0.7),
      opacity: randomRange(0.12, 0.45),
      dx: randomRange(-6, 6),
      clip: Math.random() > 0.5 ? clipInset() : null,
    },
  });
  events.push({
    at: at + hold,
    kind: "window",
    id,
    patch: {
      brightness: 1,
      opacity: 1,
      dx: 0,
      clip: null,
    },
  });
}

function hideAt(id: CrashWindowId, at: number, events: CrashEvent[]) {
  events.push({
    at,
    kind: "window",
    id,
    patch: {
      hide: true,
      opacity: 0,
      brightness: 0.35,
      dx: randomRange(-5, 5),
      headTear: false,
      clip: null,
    },
  });
}

export function buildCrashScript() {
  const events: CrashEvent[] = [];
  const end = randomRange(430, 580);

  events.push({ at: 0, kind: "phase", phase: 1 });
  events.push({ at: 0, kind: "noise", on: true });
  events.push({ at: 0, kind: "shake", px: randomRange(-1.2, 1.2) });
  events.push({
    at: 0,
    kind: "window",
    id: "warning_01",
    patch: { brightness: 1.08 },
  });
  events.push({
    at: 0,
    kind: "window",
    id: "warning_04",
    patch: { brightness: 0.9, dx: randomRange(-2, 2) },
  });

  const t2 = jitter(70, 22);
  const hotHold = randomRange(60, 100);
  events.push({ at: t2, kind: "phase", phase: 2 });
  events.push({ at: t2, kind: "flash", mode: "hot" });
  events.push({ at: t2, kind: "slices", slices: offsetSlices(2, [8, 15]) });
  events.push({
    at: t2,
    kind: "band",
    band: { y: randomRange(24, 40), h: randomRange(4, 8), x: randomRange(-8, 8) },
  });
  events.push({ at: t2, kind: "sound", name: "static" });
  events.push({ at: t2, kind: "shake", px: randomRange(-2.5, 2.5) });
  pulse("warning_02", t2 + randomRange(0, 22), events);
  pulse("warning_04", t2 + randomRange(18, 48), events);
  events.push({ at: t2 + randomRange(28, 56), kind: "slices", slices: idleSlices() });
  events.push({ at: t2 + randomRange(30, 60), kind: "band", band: null });
  events.push({ at: t2 + hotHold, kind: "shake", px: 0 });

  const t3 = Math.max(t2 + hotHold + 8, jitter(150, 20));
  const voidHold = randomRange(40, 80);
  events.push({ at: t3, kind: "phase", phase: 3 });
  events.push({ at: t3, kind: "flash", mode: "void" });
  events.push({ at: t3, kind: "sound", name: "cut" });
  events.push({ at: t3, kind: "slices", slices: idleSlices() });
  dimPulse("warning_01", t3 + randomRange(18, 48), events);
  dimPulse("warning_03", t3 + randomRange(40, 78), events);
  dimPulse("warning_05", t3 + randomRange(55, 95), events);

  const t4 = Math.max(t3 + voidHold + 8, jitter(230, 22));
  const hot2Hold = randomRange(50, 120);
  events.push({ at: t4, kind: "phase", phase: 4 });
  events.push({ at: t4, kind: "flash", mode: "hot" });
  events.push({ at: t4, kind: "slices", slices: offsetSlices(3, [10, 18]) });
  events.push({
    at: t4,
    kind: "band",
    band: { y: randomRange(46, 62), h: randomRange(6, 11), x: randomRange(-12, 12) },
  });
  events.push({ at: t4 + randomRange(8, 24), kind: "sound", name: "burst" });
  events.push({
    at: t4,
    kind: "window",
    id: "warning_01",
    patch: { hide: false, brightness: 1.5, opacity: 1, dx: 0, clip: null },
  });
  events.push({
    at: t4,
    kind: "window",
    id: "warning_05",
    patch: {
      hide: false,
      dx: randomRange(6, 12),
      brightness: 1.22,
      headTear: true,
      clip: clipInset(),
    },
  });
  events.push({ at: t4 + randomRange(12, 28), kind: "sound", name: "crackle" });
  events.push({
    at: t4 + randomRange(36, 68),
    kind: "slices",
    slices: offsetSlices(2, [5, 12]),
  });
  events.push({ at: t4 + randomRange(70, 100), kind: "slices", slices: idleSlices() });
  events.push({ at: t4 + randomRange(70, 100), kind: "band", band: null });
  events.push({
    at: t4 + randomRange(40, 80),
    kind: "window",
    id: "warning_05",
    patch: { dx: 0, brightness: 1, headTear: false, clip: null },
  });

  const t5 = Math.max(t4 + hot2Hold + 8, jitter(360, 24));
  events.push({ at: t5, kind: "phase", phase: 5 });
  events.push({ at: t5, kind: "flash", mode: "void" });
  events.push({ at: t5, kind: "sound", name: "cut" });
  events.push({ at: t5, kind: "shake", px: randomRange(-1.8, 1.8) });
  hideAt("warning_03", t5 + randomRange(8, 36), events);
  hideAt("warning_01", t5 + randomRange(42, 88), events);
  hideAt("warning_04", t5 + randomRange(78, 126), events);
  hideAt("warning_02", t5 + randomRange(110, 168), events);

  const t6 = Math.min(end - 28, Math.max(t5 + 90, jitter(480, 20)));
  events.push({ at: t6, kind: "phase", phase: 6 });
  events.push({ at: t6, kind: "flash", mode: "void" });
  events.push({ at: t6, kind: "noise", on: false });
  events.push({ at: t6, kind: "slices", slices: idleSlices() });
  events.push({ at: t6, kind: "band", band: null });
  events.push({ at: t6, kind: "shake", px: 0 });
  hideAt("warning_05", t6 + randomRange(12, 42), events);
  IDS.forEach((id) => hideAt(id, t6 + 52, events));

  events.push({ at: end, kind: "done" });
  return events.sort((a, b) => a.at - b.at);
}
