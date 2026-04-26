let ctx: AudioContext | null = null;

interface VoiceConfig {
  freq: number;
  type: OscillatorType;
  duration: number;
  gain: number;
}

const VOICES: Record<string, VoiceConfig> = {
  // Sam: higher, brighter, shorter — chirpy
  sam: { freq: 2000, type: "triangle", duration: 0.05, gain: 0.07 },
  // Pink Truck V: lower, rounder, longer — gravelly
  "pink-truck-v": { freq: 180, type: "square", duration: 0.07, gain: 0.06 },
};

const DEFAULT_VOICE: VoiceConfig = {
  freq: 300,
  type: "square",
  duration: 0.05,
  gain: 0.06,
};

export function playBlip(speakerId: string) {
  if (typeof window === "undefined") return;
  try {
    ctx ??= new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();
    if (ctx.state === "suspended") ctx.resume();

    const v = VOICES[speakerId] ?? DEFAULT_VOICE;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = v.type;
    osc.frequency.value = v.freq * (0.94 + Math.random() * 0.12);

    gain.gain.setValueAtTime(v.gain, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + v.duration);

    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + v.duration + 0.01);
  } catch {
    // ignore audio failures silently
  }
}
