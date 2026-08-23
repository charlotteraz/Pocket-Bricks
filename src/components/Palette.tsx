import { useRef } from 'react'
import { BRICK_DEFS } from '../lib/bricks'
import { COLORS } from '../lib/colors'
import { downloadBuild, parseBuild } from '../lib/io'
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
  const enterPlayback = useBuildStore((s) => s.enterPlayback)
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="absolute top-4 left-4 z-10 flex w-56 flex-col gap-4 rounded-lg bg-white/90 p-4 shadow-lg backdrop-blur">
      <div>
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">Bricks</h2>
        <div className="grid grid-cols-3 gap-2">
          {BRICK_DEFS.map((def) => (
            <button
              key={def.type}
              type="button"
              onClick={() => setActiveType(def.type)}
              className={`rounded border px-2 py-2 text-xs font-medium transition-colors ${
                activeType === def.type
                  ? 'border-neutral-800 bg-neutral-800 text-white'
                  : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500'
              }`}
            >
              {def.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">Color</h2>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              title={c.name}
              aria-label={c.name}
              onClick={() => setActiveColor(c.hex)}
              style={{ backgroundColor: c.hex }}
              className={`h-7 w-7 rounded-full border-2 shadow transition-transform ${
                activeColor === c.hex ? 'scale-110 border-neutral-800' : 'border-white'
              }`}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">Rotation</h2>
        <button
          type="button"
          onClick={rotateActive}
          className="w-full rounded border border-neutral-300 bg-white px-2 py-2 text-xs font-medium text-neutral-700 hover:border-neutral-500"
        >
          {activeRotation}° — press R to rotate
        </button>
      </div>

      <div className="flex flex-col gap-2 border-t border-neutral-200 pt-3">
        <button
          type="button"
          onClick={enterPlayback}
          disabled={bricks.length === 0}
          className="w-full rounded border border-neutral-300 bg-white px-2 py-2 text-xs font-medium text-neutral-700 hover:enabled:border-neutral-500 disabled:opacity-40"
        >
          Play instructions ({bricks.length} bricks)
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => downloadBuild(bricks)}
            disabled={bricks.length === 0}
            className="flex-1 rounded border border-neutral-300 bg-white px-2 py-2 text-xs font-medium text-neutral-700 hover:enabled:border-neutral-500 disabled:opacity-40"
          >
            Export
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 rounded border border-neutral-300 bg-white px-2 py-2 text-xs font-medium text-neutral-700 hover:border-neutral-500"
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
  )
}
