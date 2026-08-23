import { useBuildStore } from '../store/useBuildStore'

export default function StartScreen() {
  const start = useBuildStore((s) => s.start)

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-900/70 backdrop-blur-sm">
      <div className="flex max-w-sm flex-col items-center gap-4 rounded-lg bg-white p-8 text-center shadow-xl">
        <h1 className="text-2xl font-semibold text-neutral-800">Pocket Bricks</h1>
        <p className="text-sm text-neutral-600">
          A small browser-based brick builder. Pick a shape and color, click the baseplate to
          place bricks, and press R to rotate. Stack anything on top of anything.
        </p>
        <button
          type="button"
          onClick={start}
          className="mt-2 w-full rounded bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Start Building
        </button>
      </div>
    </div>
  )
}
