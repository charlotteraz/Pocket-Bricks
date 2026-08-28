import { useBuildStore } from '../store/useBuildStore'

export default function StartScreen() {
  const start = useBuildStore((s) => s.start)

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--color-ink)]/70 p-4">
      <div className="pixel-panel w-full max-w-sm overflow-hidden">
        <div className="pixel-titlebar">
          <span>Welcome</span>
          <span className="pixel-dots">
            <span />
            <span />
            <span />
          </span>
        </div>
        <div className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
          <h1 className="pixel-heading">Pocket Bricks</h1>
          <p className="text-xl leading-snug">
            A small browser-based brick builder. Pick a shape and color, click the baseplate to
            place bricks, and press R to rotate. Stack anything on top of anything.
          </p>
          <button type="button" onClick={start} className="pixel-btn mt-2 w-full">
            Start Building
          </button>
        </div>
      </div>
    </div>
  )
}
