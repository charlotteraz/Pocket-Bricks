import { BRICK_DEFS } from '../lib/bricks'
import { COLORS } from '../lib/colors'
import { useBuildStore } from '../store/useBuildStore'

export default function Palette() {
  const activeType = useBuildStore((s) => s.activeType)
  const activeColor = useBuildStore((s) => s.activeColor)
  const activeRotation = useBuildStore((s) => s.activeRotation)
  const setActiveType = useBuildStore((s) => s.setActiveType)
  const setActiveColor = useBuildStore((s) => s.setActiveColor)
  const rotateActive = useBuildStore((s) => s.rotateActive)

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
    </div>
  )
}
