let audioCtx: AudioContext | null = null

// A short synthesized click, no audio asset needed. Triggered from click
// handlers, so there's always a user gesture already unlocking playback.
export function playSnapSound() {
  try {
    audioCtx ??= new AudioContext()
    const ctx = audioCtx
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.12)
  } catch {
    // Audio unavailable (e.g. blocked before any gesture) -- skip silently.
  }
}
