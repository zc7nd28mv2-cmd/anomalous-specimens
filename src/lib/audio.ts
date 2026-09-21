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
    void audio.resume();
  }
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

function tone({ freq, dur, type, gain }: Tone) {
  const audio = context();
  if (!audio || !enabled || audio.state !== "running") {
    return;
  }
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.value = gain;
  osc.connect(amp);
  amp.connect(audio.destination);
  const now = audio.currentTime;
  osc.start(now);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.stop(now + dur);
}

export function playClick() {
  tone({ freq: 168, dur: 0.045, type: "square", gain: 0.035 });
}

export function playTick() {
  if (Math.random() > 0.62) {
    return;
  }
  tone({ freq: 640 + Math.random() * 80, dur: 0.012, type: "square", gain: 0.012 });
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

export function playResult() {
  tone({ freq: 480, dur: 0.055, type: "triangle", gain: 0.028 });
  window.setTimeout(() => {
    tone({ freq: 640, dur: 0.12, type: "sine", gain: 0.032 });
  }, 60);
}
