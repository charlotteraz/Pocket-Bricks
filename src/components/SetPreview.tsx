import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useMemo, useState } from 'react'
import { SETS } from '../data/sets'
import { effectiveFootprint } from '../lib/bricks'
import { BRICK_HEIGHT, STUD } from '../lib/grid'
import type { Brick as BrickData } from '../lib/types'
import { useBuildStore } from '../store/useBuildStore'
import Brick from './bricks/Brick'

function bounds(bricks: BrickData[]) {
  let minX = 0
  let minY = 0
  let minZ = 0
  let maxX = 0
  let maxY = 0
  let maxZ = 0
  for (const b of bricks) {
    const [fx, fz] = effectiveFootprint(b.type, b.rotation)
    const [x, y, z] = b.position
    minX = Math.min(minX, x)
    minZ = Math.min(minZ, z)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + fx * STUD)
    maxZ = Math.max(maxZ, z + fz * STUD)
    maxY = Math.max(maxY, y + BRICK_HEIGHT)
  }
  return { minX, minY, minZ, maxX, maxY, maxZ }
}

function useFraming(bricks: BrickData[]) {
  return useMemo(() => {
    const b = bounds(bricks)
    const center: [number, number, number] = [
      (b.minX + b.maxX) / 2,
      (b.minY + b.maxY) / 2,
      (b.minZ + b.maxZ) / 2,
    ]
    const size = Math.max(b.maxX - b.minX, b.maxY - b.minY, b.maxZ - b.minZ, 1)
    return { center, distance: size * 1.5 + 2 }
  }, [bricks])
}

type SceneProps = {
  bricks: BrickData[]
  center: [number, number, number]
  distance: number
  interactive: boolean
  autoRotateSpeed?: number
}

function ReferenceScene({ bricks, center, distance, interactive, autoRotateSpeed }: SceneProps) {
  return (
    <Canvas
      camera={{
        position: [center[0] + distance, center[1] + distance * 0.75, center[2] + distance],
        fov: 35,
      }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 8, 4]} intensity={1} />
      <directionalLight position={[-4, 3, -3]} intensity={0.3} />
      {bricks.map((brick, i) => (
        <group key={i} position={brick.position}>
          <Brick type={brick.type} rotation={brick.rotation} color={brick.color} />
        </group>
      ))}
      <OrbitControls
        target={center}
        enableZoom={interactive}
        enablePan={false}
        enableRotate={interactive}
        minDistance={distance * 0.4}
        maxDistance={distance * 3}
        autoRotate={!interactive}
        autoRotateSpeed={autoRotateSpeed}
      />
    </Canvas>
  )
}

// A small, separate scene showing a fixed set fully built -- the point is a
// reference to look at *off* the plate, not the plate pre-filled for them.
// Hovering grows it in place; clicking opens a larger, freely-orbitable
// modal view for a proper look before building it by hand.
export default function SetPreview() {
  const activeSetId = useBuildStore((s) => s.activeSetId)
  const set = SETS.find((s) => s.id === activeSetId)
  const [hovered, setHovered] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const { center, distance } = useFraming(set?.bricks ?? [])

  useEffect(() => {
    if (!expanded) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [expanded])

  if (!set) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`absolute top-4 right-4 z-10 rounded-lg bg-white/90 p-3 text-left shadow-lg backdrop-blur transition-[width,height] duration-200 ease-out ${
          hovered ? 'w-72' : 'w-44'
        }`}
      >
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">Reference</h2>
        <div
          className={`w-full overflow-hidden rounded border border-neutral-200 bg-neutral-100 transition-[height] duration-200 ease-out ${
            hovered ? 'h-60' : 'h-36'
          }`}
        >
          <ReferenceScene
            key={set.id}
            bricks={set.bricks}
            center={center}
            distance={distance}
            interactive={false}
            autoRotateSpeed={4}
          />
        </div>
        <p className="mt-2 text-[11px] leading-snug text-neutral-500">
          {set.name} — {set.bricks.length} bricks. Click to inspect, or build it yourself on the
          plate.
        </p>
      </button>

      {expanded && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-neutral-900/70 backdrop-blur-sm"
          onClick={() => setExpanded(false)}
        >
          <div
            className="flex w-[min(90vw,640px)] flex-col gap-3 rounded-lg bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-800">
                {set.name} — {set.bricks.length} bricks
              </h2>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="Close"
                className="rounded px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
              >
                ✕
              </button>
            </div>
            <div className="h-[min(70vh,520px)] w-full overflow-hidden rounded border border-neutral-200 bg-neutral-100">
              <ReferenceScene
                key={set.id}
                bricks={set.bricks}
                center={center}
                distance={distance}
                interactive
              />
            </div>
            <p className="text-xs text-neutral-500">
              Drag to rotate, scroll to zoom. Close and build it yourself on the plate.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
