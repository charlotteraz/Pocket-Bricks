import { playSnapSound } from '../lib/sound'
import { SETS } from '../data/sets'
import { useBuildStore } from '../store/useBuildStore'

export default function PlaybackControls() {
  const step = useBuildStore((s) => s.step)
  const activeSetId = useBuildStore((s) => s.activeSetId)
  const nextStep = useBuildStore((s) => s.nextStep)
  const prevStep = useBuildStore((s) => s.prevStep)
  const exitPlayback = useBuildStore((s) => s.exitPlayback)

  const total = SETS.find((s) => s.id === activeSetId)?.bricks.length ?? 0
  const done = step >= total

  return (
    <div className="pixel-panel fixed inset-x-0 bottom-0 z-10 w-full overflow-hidden sm:absolute sm:inset-x-auto sm:top-4 sm:left-4 sm:bottom-auto sm:w-60">
      <div
        className="pixel-titlebar"
        style={done ? { background: 'var(--color-green)' } : undefined}
      >
        <span>{done ? 'Build complete' : `Step ${step + 1} of ${total}`}</span>
        <span className="pixel-dots">
          <span />
          <span />
          <span />
        </span>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex gap-2">
          <button type="button" onClick={prevStep} disabled={step === 0} className="pixel-btn flex-1">
            Previous
          </button>
          <button
            type="button"
            onClick={() => {
              nextStep()
              playSnapSound()
            }}
            disabled={done}
            className="pixel-btn flex-1"
          >
            Next
          </button>
        </div>
        <button type="button" onClick={exitPlayback} className="pixel-btn w-full">
          Back to editing
        </button>
      </div>
    </div>
  )
}
