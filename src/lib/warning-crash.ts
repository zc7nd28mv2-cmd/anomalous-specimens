import { randomRange, type WarningScreen } from "@/lib/warning-sequence";

export type CrashFlash = "off" | "hot" | "void";
export type CrashSound = "static" | "burst" | "cut";
export type CrashWindowId = WarningScreen["id"];

export type CrashWindowFault = {
  hide: boolean;
  brightness: number;
  opacity: number;
  dx: number;
  clip: string | null;
  headTear: boolean;
};

export type CrashTear = {
  y: number;
  h: number;
  x: number;
};

export type CrashView = {
  active: boolean;
  phase: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  flash: CrashFlash;
  tear: CrashTear | null;
  noise: boolean;
  windows: Record<CrashWindowId, CrashWindowFault>;
};

export type CrashEvent =
  | { at: number; kind: "phase"; phase: CrashView["phase"] }
  | { at: number; kind: "flash"; mode: CrashFlash }
  | { at: number; kind: "tear"; tear: CrashTear | null }
  | { at: number; kind: "noise"; on: boolean }
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

export function idleCrashView(): CrashView {
  return {
    active: false,
    phase: 0,
    flash: "off",
    tear: null,
    noise: false,
    windows: {
      warning_01: idleWindowFault(),
      warning_02: idleWindowFault(),
      warning_03: idleWindowFault(),
      warning_04: idleWindowFault(),
      warning_05: idleWindowFault(),
    },
  };
}

function jitter(base: number) {
  return Math.max(0, base + randomRange(-30, 40));
}

function pulse(id: CrashWindowId, at: number, events: CrashEvent[]) {
  const hold = randomRange(30, 100);
  const dx = randomRange(-8, 8);
  const bright = randomRange(1.15, 1.7);
  const clip =
    Math.random() > 0.45
      ? `inset(${randomRange(8, 36).toFixed(1)}% 0 ${randomRange(18, 48).toFixed(1)}% 0)`
      : null;
  events.push({
    at,
    kind: "window",
    id,
    patch: {
      brightness: bright,
      opacity: randomRange(0.55, 1),
      dx,
      clip,
      headTear: Math.random() > 0.62,
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

function hideAt(id: CrashWindowId, at: number, events: CrashEvent[]) {
  events.push({
    at,
    kind: "window",
    id,
    patch: { hide: true, opacity: 0, brightness: 0.4, dx: randomRange(-4, 4) },
  });
}

export function buildCrashScript() {
  const events: CrashEvent[] = [];
  const end = randomRange(430, 580);

  events.push({ at: 0, kind: "phase", phase: 1 });
  events.push({ at: 0, kind: "noise", on: true });
  events.push({
    at: 0,
    kind: "window",
    id: "warning_02",
    patch: { brightness: 1.12 },
  });

  const t2 = jitter(70);
  events.push({ at: t2, kind: "phase", phase: 2 });
  events.push({ at: t2, kind: "flash", mode: "hot" });
  events.push({
    at: t2,
    kind: "tear",
    tear: { y: randomRange(22, 38), h: randomRange(7, 13), x: randomRange(-14, -8) },
  });
  events.push({ at: t2, kind: "sound", name: "static" });
  pulse("warning_02", t2 + randomRange(0, 20), events);
  pulse("warning_04", t2 + randomRange(10, 40), events);
  events.push({ at: t2 + randomRange(36, 70), kind: "tear", tear: null });

  const t3 = jitter(150);
  events.push({ at: t3, kind: "phase", phase: 3 });
  events.push({ at: t3, kind: "flash", mode: "void" });
  events.push({ at: t3, kind: "sound", name: "cut" });
  pulse("warning_01", t3 + randomRange(20, 50), events);
  pulse("warning_03", t3 + randomRange(40, 80), events);
  pulse("warning_05", t3 + randomRange(55, 90), events);

  const t4 = jitter(230);
  events.push({ at: t4, kind: "phase", phase: 4 });
  events.push({ at: t4, kind: "flash", mode: "hot" });
  events.push({
    at: t4,
    kind: "tear",
    tear: { y: randomRange(48, 64), h: randomRange(8, 16), x: randomRange(10, 18) },
  });
  events.push({ at: t4 + randomRange(12, 28), kind: "sound", name: "burst" });
  events.push({
    at: t4,
    kind: "window",
    id: "warning_01",
    patch: { brightness: 1.45, opacity: 1, hide: false },
  });
  events.push({
    at: t4,
    kind: "window",
    id: "warning_05",
    patch: { dx: randomRange(6, 12), brightness: 1.2, headTear: true },
  });
  events.push({
    at: t4 + randomRange(40, 70),
    kind: "tear",
    tear: { y: randomRange(12, 24), h: randomRange(5, 9), x: randomRange(-10, 6) },
  });
  events.push({ at: t4 + randomRange(70, 95), kind: "tear", tear: null });

  const t5 = jitter(340);
  events.push({ at: t5, kind: "phase", phase: 5 });
  events.push({ at: t5, kind: "flash", mode: "void" });
  events.push({ at: t5, kind: "sound", name: "cut" });
  hideAt("warning_03", t5 + randomRange(8, 40), events);
  hideAt("warning_01", t5 + randomRange(40, 80), events);
  hideAt("warning_04", t5 + randomRange(70, 110), events);
  hideAt("warning_02", t5 + randomRange(100, 140), events);

  const t6 = Math.min(end - 30, jitter(470));
  events.push({ at: t6, kind: "phase", phase: 6 });
  events.push({ at: t6, kind: "flash", mode: "void" });
  events.push({ at: t6, kind: "noise", on: false });
  events.push({ at: t6, kind: "tear", tear: null });
  hideAt("warning_05", t6 + randomRange(10, 40), events);
  IDS.forEach((id) => hideAt(id, t6 + 50, events));

  events.push({ at: end, kind: "done" });
  return events.sort((a, b) => a.at - b.at);
}
