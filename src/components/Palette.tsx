import { SHAPES } from '../lib/bricks'
import { COLORS } from '../lib/colors'
import { SETS } from '../data/sets'
import { useBuildStore } from '../store/useBuildStore'

export default function Palette() {
  const activeType = useBuildStore((s) => s.activeType)
  const activeColor = useBuildStore((s) => s.activeColor)
  const activeRotation = useBuildStore((s) => s.activeRotation)
  const setActiveType = useBuildStore((s) => s.setActiveType)
  const setActiveColor = useBuildStore((s) => s.setActiveColor)
  const rotateActive = useBuildStore((s) => s.rotateActive)
  const bricks = useBuildStore((s) => s.bricks)
  const canUndo = useBuildStore((s) => s.undoStack.length > 0)
  const canRedo = useBuildStore((s) => s.redoStack.length > 0)
  const undo = useBuildStore((s) => s.undo)
  const redo = useBuildStore((s) => s.redo)
  const clearBricks = useBuildStore((s) => s.clearBricks)
  const activeSetId = useBuildStore((s) => s.activeSetId)
  const loadSet = useBuildStore((s) => s.loadSet)
  const enterPlayback = useBuildStore((s) => s.enterPlayback)
  const deleteMode = useBuildStore((s) => s.deleteMode)
  const toggleDeleteMode = useBuildStore((s) => s.toggleDeleteMode)
  const activeSet = SETS.find((s) => s.id === activeSetId)

  return (
    <div className="pixel-panel fixed inset-x-0 bottom-0 z-10 flex max-h-[62vh] w-full flex-col overflow-hidden sm:absolute sm:inset-x-auto sm:top-4 sm:left-4 sm:bottom-auto sm:max-h-[calc(100dvh-2rem)] sm:w-60">
      <div className="pixel-titlebar shrink-0">
        <span>Pocket Bricks</span>
        <span className="pixel-dots">
          <span />
          <span />
          <span />
        </span>
      </div>
      <div className="flex flex-col gap-4 overflow-y-auto p-4">
        <div>
          <h2 className="pixel-label mb-2">Set</h2>
          <div className="flex flex-wrap gap-2">
            {SETS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => loadSet(s.id)}
                className={`pixel-btn whitespace-nowrap ${activeSetId === s.id ? 'pixel-btn-active' : ''}`}
              >
                {s.name} <span className="opacity-60">({s.bricks.length})</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="pixel-label mb-2">Bricks</h2>
          <div className="flex flex-wrap gap-2">
            {SHAPES.map((def) => (
              <button
                key={def.type}
                type="button"
                onClick={() => setActiveType(def.type)}
                className={`pixel-btn whitespace-nowrap ${activeType === def.type ? 'pixel-btn-active' : ''}`}
              >
                {def.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="pixel-label mb-2">Color</h2>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                title={c.name}
                aria-label={c.name}
                onClick={() => setActiveColor(c.hex)}
                style={{ backgroundColor: c.hex }}
                className={`pixel-swatch ${activeColor === c.hex ? 'pixel-swatch-active' : ''}`}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="pixel-label mb-2">Rotation</h2>
          <button type="button" onClick={rotateActive} className="pixel-btn w-full">
            {activeRotation}° — press R to rotate
          </button>
        </div>

        <button
          type="button"
          onClick={toggleDeleteMode}
          disabled={bricks.length === 0}
          title="Toggle delete tool (press X)"
          className={`pixel-btn w-full ${deleteMode ? 'pixel-btn-active' : ''}`}
        >
          {deleteMode ? 'Deleting — click a brick' : 'Delete brick — press X'}
        </button>

        <div className="flex gap-2 border-t-[3px] border-[var(--color-ink)] pt-3">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl/Cmd+Z)"
            className="pixel-btn flex-1"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl/Cmd+Shift+Z)"
            className="pixel-btn flex-1"
          >
            Redo
          </button>
        </div>

        <button
          type="button"
          onClick={clearBricks}
          disabled={bricks.length === 0}
          className="pixel-btn w-full"
        >
          Clear plate
        </button>

        <div className="border-t-[3px] border-[var(--color-ink)] pt-3">
          <button
            type="button"
            onClick={enterPlayback}
            disabled={!activeSet || activeSet.bricks.length === 0}
            className="pixel-btn w-full"
          >
            Play instructions ({activeSet?.bricks.length ?? 0} bricks)
          </button>
        </div>
      </div>
    </div>
  )
}
