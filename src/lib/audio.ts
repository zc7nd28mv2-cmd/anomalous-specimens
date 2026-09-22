type Tone = {
  freq: number;
  dur: number;
  type: OscillatorType;
  gain: number;
};

let ctx: AudioContext | null = null;
let enabled = true;

function context() {
  if (typeof window === "undefined") {
    return null;
  }
  if (!ctx) {
    const Ctor = window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) {
      return null;
    }
    ctx = new Ctor();
  }
  return ctx;
}

export function unlockAudio() {
  const audio = context();
  if (audio && audio.state === "suspended") {
    return audio.resume().catch(() => undefined);
  }
  return Promise.resolve();
}

export function setAudioEnabled(value: boolean) {
  enabled = value;
  if (value) {
    unlockAudio();
  }
}

export function isAudioEnabled() {
  return enabled;
}

function speak(audio: AudioContext, { freq, dur, type, gain }: Tone) {
  if (!enabled || audio.state !== "running") {
    return;
  }
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, audio.currentTime);
  osc.connect(amp);
  amp.connect(audio.destination);
  const now = audio.currentTime;
  osc.start(now);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.stop(now + dur);
}

function tone(spec: Tone) {
  try {
    const audio = context();
    if (!audio || !enabled) {
      return;
    }
    if (audio.state === "suspended") {
      void audio.resume().then(() => speak(audio, spec)).catch(() => undefined);
      return;
    }
    speak(audio, spec);
  } catch {
    // Audio is optional. Never block the page.
  }
}

export function playClick() {
  tone({ freq: 168, dur: 0.045, type: "square", gain: 0.035 });
}

export function playDenied() {
  tone({ freq: 92, dur: 0.052, type: "sawtooth", gain: 0.03 });
  window.setTimeout(() => {
    tone({ freq: 58, dur: 0.034, type: "square", gain: 0.018 });
  }, 16);
}

export function playTick() {
  if (Math.random() > 0.62) {
    return;
  }
  tone({ freq: 640 + Math.random() * 80, dur: 0.012, type: "square", gain: 0.012 });
}

export function playTerminalTick() {
  if (Math.random() > 0.72) {
    return;
  }
  tone({
    freq: 490 + Math.random() * 110,
    dur: 0.016 + Math.random() * 0.018,
    type: "square",
    gain: 0.007 + Math.random() * 0.003,
  });
}

export function playSystemConfirm() {
  tone({ freq: 196, dur: 0.072, type: "triangle", gain: 0.046 });
  tone({ freq: 98, dur: 0.096, type: "sine", gain: 0.022 });
}

export function playMessage() {
  tone({ freq: 390, dur: 0.028, type: "square", gain: 0.026 });
}

export function playAlert() {
  tone({ freq: 132, dur: 0.2, type: "sawtooth", gain: 0.04 });
  window.setTimeout(() => {
    tone({ freq: 96, dur: 0.16, type: "triangle", gain: 0.02 });
  }, 90);
}

export function playWarningSound(level: 1 | 2 | 3 | 4 | 5) {
  const table = {
    1: { freq: 136, dur: 0.1, type: "sawtooth" as const, gain: 0.032 },
    2: { freq: 148, dur: 0.09, type: "sawtooth" as const, gain: 0.034 },
    3: { freq: 118, dur: 0.11, type: "square" as const, gain: 0.03 },
    4: { freq: 156, dur: 0.08, type: "sawtooth" as const, gain: 0.033 },
    5: { freq: 108, dur: 0.13, type: "sawtooth" as const, gain: 0.036 },
  } as const;
  tone(table[level]);
}

export function playResult() {
  tone({ freq: 480, dur: 0.055, type: "triangle", gain: 0.028 });
  window.setTimeout(() => {
    tone({ freq: 640, dur: 0.12, type: "sine", gain: 0.032 });
  }, 60);
}
