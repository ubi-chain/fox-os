type BootVoice = { stop: () => void; resume: () => void; running: boolean };

export function playBootSound(): BootVoice {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0.55;
  master.connect(ctx.destination);
  const now = ctx.currentTime;

  const noiseLen = Math.floor(2.6 * ctx.sampleRate);
  const buffer = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < noiseLen; i += 1) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 0.6;
  filter.frequency.setValueAtTime(220, now);
  filter.frequency.exponentialRampToValueAtTime(3200, now + 2.2);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.001, now);
  noiseGain.gain.linearRampToValueAtTime(0.45, now + 0.4);
  noiseGain.gain.linearRampToValueAtTime(0.001, now + 2.6);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(master);
  noise.start(now);
  noise.stop(now + 2.6);

  const howl = ctx.createOscillator();
  howl.type = "sawtooth";
  howl.frequency.setValueAtTime(220, now + 0.15);
  howl.frequency.exponentialRampToValueAtTime(660, now + 1.35);
  howl.frequency.exponentialRampToValueAtTime(330, now + 2.6);
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 5;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 18;
  lfo.connect(lfoGain);
  lfoGain.connect(howl.frequency);
  const howlFilter = ctx.createBiquadFilter();
  howlFilter.type = "lowpass";
  howlFilter.frequency.value = 2200;
  const howlGain = ctx.createGain();
  howlGain.gain.setValueAtTime(0.001, now + 0.1);
  howlGain.gain.exponentialRampToValueAtTime(0.35, now + 0.9);
  howlGain.gain.exponentialRampToValueAtTime(0.001, now + 2.9);
  howl.connect(howlFilter);
  howlFilter.connect(howlGain);
  howlGain.connect(master);
  howl.start(now + 0.1);
  howl.stop(now + 3);
  lfo.start(now + 0.1);
  lfo.stop(now + 3);

  const tone = ctx.createOscillator();
  tone.type = "sine";
  tone.frequency.setValueAtTime(440, now + 0.15);
  tone.frequency.exponentialRampToValueAtTime(880, now + 1.35);
  tone.frequency.exponentialRampToValueAtTime(520, now + 2.6);
  const toneGain = ctx.createGain();
  toneGain.gain.setValueAtTime(0.001, now + 0.1);
  toneGain.gain.exponentialRampToValueAtTime(0.28, now + 1);
  toneGain.gain.exponentialRampToValueAtTime(0.001, now + 2.85);
  tone.connect(toneGain);
  toneGain.connect(master);
  tone.start(now + 0.1);
  tone.stop(now + 2.95);

  let closed = false;
  const stop = () => {
    if (closed) return;
    closed = true;
    try {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(0, ctx.currentTime);
      void ctx.close();
    } catch {
      /* already closed */
    }
  };
  return {
    running: ctx.state === "running",
    resume: () => {
      if (!closed) void ctx.resume();
    },
    stop,
  };
}

let armed: BootVoice | null = null;
let held: BootVoice | null = null;
let retain = 0;

export function armBootSound(): void {
  const voice = playBootSound();
  if (held && held !== voice) held.stop();
  armed?.stop();
  armed = voice;
  held = voice;
  retain += 1;
}

export function takeBootSound(): BootVoice | null {
  return armed;
}

export function holdBootSound(voice: BootVoice): number {
  if (held && held !== voice) held.stop();
  held = voice;
  armed = voice;
  retain += 1;
  return retain;
}

export function releaseBootSound(voice: BootVoice, ticket: number): void {
  if (held === voice && ticket === retain) {
    voice.stop();
    held = null;
    armed = null;
  }
}

