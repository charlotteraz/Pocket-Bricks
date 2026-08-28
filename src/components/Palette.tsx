import { useRef } from 'react'
import { SHAPES } from '../lib/bricks'
import { COLORS } from '../lib/colors'
import { downloadBuild, parseBuild } from '../lib/io'
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
  const loadBricks = useBuildStore((s) => s.loadBricks)
  const canUndo = useBuildStore((s) => s.undoStack.length > 0)
  const canRedo = useBuildStore((s) => s.redoStack.length > 0)
  const undo = useBuildStore((s) => s.undo)
  const redo = useBuildStore((s) => s.redo)
  const clearBricks = useBuildStore((s) => s.clearBricks)
  const activeSetId = useBuildStore((s) => s.activeSetId)
  const loadSet = useBuildStore((s) => s.loadSet)
  const enterPlayback = useBuildStore((s) => s.enterPlayback)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeSet = SETS.find((s) => s.id === activeSetId)

  return (
    <div className="pixel-panel fixed inset-x-0 bottom-0 z-10 flex max-h-[62vh] w-full flex-col overflow-hidden sm:absolute sm:inset-x-auto sm:top-4 sm:left-4 sm:bottom-auto sm:w-60 sm:max-h-none">
      <div className="pixel-titlebar shrink-0">
        <span>Pocket Bricks</span>
        <span className="pixel-dots">
          <span />
          <span />
          <span />
        </span>
      </div>
      <div className="flex flex-col gap-4 overflow-y-auto p-4 sm:overflow-visible">
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

        <div className="flex flex-col gap-2 border-t-[3px] border-[var(--color-ink)] pt-3">
          <button
            type="button"
            onClick={enterPlayback}
            disabled={!activeSet || activeSet.bricks.length === 0}
            className="pixel-btn w-full"
          >
            Play instructions ({activeSet?.bricks.length ?? 0} bricks)
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => downloadBuild(bricks)}
              disabled={bricks.length === 0}
              className="pixel-btn flex-1"
            >
              Export
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="pixel-btn flex-1"
            >
              Import
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              try {
                const text = await file.text()
                loadBricks(parseBuild(text))
              } catch (err) {
                window.alert(`Couldn't load that file: ${err instanceof Error ? err.message : String(err)}`)
              } finally {
                e.target.value = ''
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
