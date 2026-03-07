// Synthesized celebration chime using Web Audio API — no external service needed

let audioCtx: AudioContext | null = null;

function getCtx() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export function playCelebrationChime() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Play a quick ascending arpeggio (C5 → E5 → G5 → C6)
    const frequencies = [523.25, 659.25, 783.99, 1046.5];
    const noteDuration = 0.12;

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now + i * noteDuration);
      gain.gain.linearRampToValueAtTime(0.15, now + i * noteDuration + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * noteDuration + noteDuration + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * noteDuration);
      osc.stop(now + i * noteDuration + noteDuration + 0.2);
    });

    // Sparkle overtone
    const sparkle = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkle.type = "triangle";
    sparkle.frequency.value = 2093;
    sparkleGain.gain.setValueAtTime(0, now + 0.35);
    sparkleGain.gain.linearRampToValueAtTime(0.08, now + 0.38);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    sparkle.connect(sparkleGain);
    sparkleGain.connect(ctx.destination);
    sparkle.start(now + 0.35);
    sparkle.stop(now + 0.8);
  } catch {
    // Silently fail if audio not available
  }
}
