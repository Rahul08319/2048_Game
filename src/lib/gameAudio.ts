/**
 * Apple-inspired Web Audio Synthesizer & Tactile Haptic Feedback
 */

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined" || !window.AudioContext) return null;
  if (!audioContext) {
    audioContext = new window.AudioContext();
  }
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }
  return audioContext;
}

// Gentle haptic pulse
export function triggerHaptic(type: "light" | "medium" | "heavy" | "success" = "light"): void {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  try {
    switch (type) {
      case "light":
        navigator.vibrate(8);
        break;
      case "medium":
        navigator.vibrate(18);
        break;
      case "heavy":
        navigator.vibrate(30);
        break;
      case "success":
        navigator.vibrate([15, 30, 25]);
        break;
    }
  } catch {
    //
  }
}

/**
 * Play subtle organic movement sound
 */
export function playMoveSound(enabled: boolean, merged: boolean, mergeValue?: number): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (!merged) {
      // Soft wood/felt tap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.05);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
      triggerHaptic("light");
    } else {
      // Harmonic chime based on tile value
      // Higher tile values produce brighter, richer tones
      const frequencies: Record<number, number> = {
        4: 330,   // E4
        8: 392,   // G4
        16: 440,  // A4
        32: 523,  // C5
        64: 587,  // D5
        128: 659, // E5
        256: 784, // G5
        512: 880, // A5
        1024: 988,// B5
        2048: 1046 // C6
      };

      const freq = mergeValue ? (frequencies[mergeValue] || 523) : 440;

      // Primary tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freq, now);

      gain1.gain.setValueAtTime(0.06, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      // Warm octave harmonic
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(freq * 1.5, now);

      gain2.gain.setValueAtTime(0.02, now);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      osc1.connect(gain1).connect(ctx.destination);
      osc2.connect(gain2).connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.15);
      osc2.stop(now + 0.11);
      triggerHaptic("medium");
    }
  } catch {
    // Audio is progressive enhancement
  }
}

/**
 * Play undo sound
 */
export function playUndoSound(enabled: boolean): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
    triggerHaptic("light");
  } catch {
    //
  }
}

/**
 * Play celebratory victory sound for 2048 achievement
 */
export function playWinSound(enabled: boolean): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, index) => {
      const start = now + index * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);

      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.36);
    });

    triggerHaptic("success");
  } catch {
    //
  }
}

export function stopGameAudio(): void {
  try {
    if (audioContext?.state === "running") {
      void audioContext.suspend();
    }
  } catch {
    //
  }
}
