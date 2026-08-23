import { playSnapSound } from '../lib/sound'
import { useBuildStore } from '../store/useBuildStore'

export default function PlaybackControls() {
  const step = useBuildStore((s) => s.step)
  const bricks = useBuildStore((s) => s.bricks)
  const nextStep = useBuildStore((s) => s.nextStep)
  const prevStep = useBuildStore((s) => s.prevStep)
  const exitPlayback = useBuildStore((s) => s.exitPlayback)

  const total = bricks.length
  const done = step >= total

  return (
    <div
      className={`absolute top-4 left-4 z-10 flex w-56 flex-col gap-3 rounded-lg p-4 shadow-lg backdrop-blur ${
        done ? 'bg-green-50/90' : 'bg-white/90'
      }`}
    >
      <h2 className={`text-sm font-semibold ${done ? 'text-green-700' : 'text-neutral-700'}`}>
        {done ? '✓ Build complete' : `Step ${step + 1} of ${total}`}
      </h2>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={prevStep}
          disabled={step === 0}
          className="flex-1 rounded border border-neutral-300 bg-white px-2 py-2 text-xs font-medium text-neutral-700 hover:enabled:border-neutral-500 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => {
            nextStep()
            playSnapSound()
          }}
          disabled={done}
          className="flex-1 rounded border border-neutral-300 bg-white px-2 py-2 text-xs font-medium text-neutral-700 hover:enabled:border-neutral-500 disabled:opacity-40"
        >
          Next
        </button>
      </div>
      <button
        type="button"
        onClick={exitPlayback}
        className="w-full rounded border border-neutral-300 bg-white px-2 py-2 text-xs font-medium text-neutral-700 hover:border-neutral-500"
      >
        Back to editing
      </button>
    </div>
  )
}
