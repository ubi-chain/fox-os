export function playBootSound(): { stop: () => void; resume: () => void } {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0.2;
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
  filter.frequency.setValueAtTime(160, now);
  filter.frequency.exponentialRampToValueAtTime(2800, now + 2.3);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0, now);
  noiseGain.gain.linearRampToValueAtTime(0.28, now + 0.45);
  noiseGain.gain.linearRampToValueAtTime(0.001, now + 2.6);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(master);
  noise.start(now);
  noise.stop(now + 2.6);

  const howl = ctx.createOscillator();
  howl.type = "sawtooth";
  howl.frequency.setValueAtTime(196, now + 0.35);
  howl.frequency.exponentialRampToValueAtTime(540, now + 1.45);
  howl.frequency.exponentialRampToValueAtTime(310, now + 2.7);
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 5.2;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 14;
  lfo.connect(lfoGain);
  lfoGain.connect(howl.frequency);
  const howlFilter = ctx.createBiquadFilter();
  howlFilter.type = "lowpass";
  howlFilter.frequency.setValueAtTime(700, now + 0.35);
  howlFilter.frequency.linearRampToValueAtTime(1800, now + 1.5);
  const howlGain = ctx.createGain();
  howlGain.gain.setValueAtTime(0.0001, now + 0.3);
  howlGain.gain.exponentialRampToValueAtTime(0.2, now + 1.2);
  howlGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.95);
  howl.connect(howlFilter);
  howlFilter.connect(howlGain);
  howlGain.connect(master);
  howl.start(now + 0.3);
  howl.stop(now + 3.05);
  lfo.start(now + 0.3);
  lfo.stop(now + 3.05);

  const body = ctx.createOscillator();
  body.type = "triangle";
  body.frequency.setValueAtTime(98, now + 0.35);
  body.frequency.exponentialRampToValueAtTime(270, now + 1.45);
  body.frequency.exponentialRampToValueAtTime(155, now + 2.7);
  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime(0.0001, now + 0.3);
  bodyGain.gain.exponentialRampToValueAtTime(0.12, now + 1.1);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.85);
  body.connect(bodyGain);
  bodyGain.connect(master);
  body.start(now + 0.3);
  body.stop(now + 2.95);

  const chime = ctx.createOscillator();
  chime.type = "sine";
  chime.frequency.value = 880;
  const chimeGain = ctx.createGain();
  chimeGain.gain.setValueAtTime(0.0001, now + 2.65);
  chimeGain.gain.exponentialRampToValueAtTime(0.07, now + 2.8);
  chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
  chime.connect(chimeGain);
  chimeGain.connect(master);
  chime.start(now + 2.65);
  chime.stop(now + 3.55);

  let closed = false;
  return {
    resume: () => {
      if (!closed) void ctx.resume();
    },
    stop: () => {
      if (closed) return;
      closed = true;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(0, ctx.currentTime);
      void ctx.close();
    },
  };
}
