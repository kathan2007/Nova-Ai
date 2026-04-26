// Sound design: subtle sci-fi interaction sounds using Web Audio API

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
  fadeIn = 0.01,
  fadeOut = 0.1
) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.type = type;

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + fadeIn);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration - fadeOut);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

export const sounds = {
  // Soft beep when listening starts
  listeningStart: () => {
    playTone(880, 0.15, 0.06, "sine", 0.01, 0.08);
    setTimeout(() => playTone(1100, 0.1, 0.04, "sine", 0.01, 0.06), 80);
  },

  // Subtle click when command received
  commandReceived: () => {
    playTone(660, 0.08, 0.05, "square", 0.005, 0.04);
    setTimeout(() => playTone(880, 0.06, 0.04, "square", 0.005, 0.03), 50);
  },

  // Soft tone when response starts
  responseStart: () => {
    playTone(440, 0.2, 0.04, "sine", 0.02, 0.12);
    setTimeout(() => playTone(660, 0.25, 0.03, "sine", 0.02, 0.15), 100);
    setTimeout(() => playTone(880, 0.2, 0.025, "sine", 0.02, 0.12), 200);
  },

  // Wake word detection
  wakeWord: () => {
    playTone(528, 0.12, 0.05, "sine", 0.01, 0.08);
    setTimeout(() => playTone(660, 0.12, 0.05, "sine", 0.01, 0.08), 80);
    setTimeout(() => playTone(792, 0.15, 0.06, "sine", 0.01, 0.1), 160);
  },

  // Error
  error: () => {
    playTone(220, 0.2, 0.05, "sawtooth", 0.02, 0.1);
  },
};

// Ambient background hum
let ambientNode: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

export function startAmbient() {
  try {
    const ctx = getAudioCtx();

    if (ambientNode) return; // Already running

    // Low-frequency hum
    ambientNode = ctx.createOscillator();
    ambientGain = ctx.createGain();

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(200, ctx.currentTime);

    ambientNode.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(ctx.destination);

    ambientNode.frequency.setValueAtTime(55, ctx.currentTime);
    ambientNode.type = "sine";

    // Very subtle volume
    ambientGain.gain.setValueAtTime(0, ctx.currentTime);
    ambientGain.gain.linearRampToValueAtTime(0.008, ctx.currentTime + 2);

    ambientNode.start(ctx.currentTime);

    // Subtle frequency modulation for "alive" feel
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
    lfoGain.gain.setValueAtTime(2, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(ambientNode.frequency);
    lfo.start(ctx.currentTime);
  } catch {
    // Audio not supported
  }
}

export function stopAmbient() {
  if (ambientNode && ambientGain) {
    const ctx = getAudioCtx();
    ambientGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    setTimeout(() => {
      ambientNode?.stop();
      ambientNode = null;
      ambientGain = null;
    }, 1100);
  }
}
