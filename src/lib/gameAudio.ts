let audioContext: AudioContext | null = null;

export function playMoveSound(enabled: boolean, merged: boolean): void {
  if (!enabled || !window.AudioContext) return;
  try {
    audioContext ??= new window.AudioContext();
    if (audioContext.state === "suspended") void audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = merged ? 560 : 340;
    gain.gain.setValueAtTime(0.025, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.08);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.08);
  } catch {
    // Audio is progressive enhancement; a device policy must not break a move.
  }
}

export function stopGameAudio(): void {
  try {
    if (audioContext?.state === "running") void audioContext.suspend();
  } catch {
    // A host pause must not fail on a device with restricted audio.
  }
}
