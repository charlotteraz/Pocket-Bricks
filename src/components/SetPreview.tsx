import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useMemo } from 'react'
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

// A small, separate scene (its own Canvas) that renders a fixed set fully
// built and slowly turntables it -- the point the user asked for is a
// reference to look at *off* the plate, not the plate pre-filled for them.
export default function SetPreview() {
  const activeSetId = useBuildStore((s) => s.activeSetId)
  const set = SETS.find((s) => s.id === activeSetId)

  const { center, distance } = useMemo(() => {
    if (!set) return { center: [0, 0, 0] as const, distance: 10 }
    const b = bounds(set.bricks)
    const c: [number, number, number] = [
      (b.minX + b.maxX) / 2,
      (b.minY + b.maxY) / 2,
      (b.minZ + b.maxZ) / 2,
    ]
    const size = Math.max(b.maxX - b.minX, b.maxY - b.minY, b.maxZ - b.minZ, 1)
    return { center: c, distance: size * 1.5 + 2 }
  }, [set])

  if (!set) return null

  return (
    <div className="absolute top-4 right-4 z-10 w-44 rounded-lg bg-white/90 p-3 shadow-lg backdrop-blur">
      <h2 className="mb-2 text-sm font-semibold text-neutral-700">Reference</h2>
      <div className="h-36 w-full overflow-hidden rounded border border-neutral-200 bg-neutral-100">
        <Canvas
          key={set.id}
          camera={{
            position: [center[0] + distance, center[1] + distance * 0.75, center[2] + distance],
            fov: 35,
          }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 8, 4]} intensity={1} />
          <directionalLight position={[-4, 3, -3]} intensity={0.3} />
          {set.bricks.map((brick, i) => {
            const [fx, fz] = effectiveFootprint(brick.type, brick.rotation)
            return (
              <group key={i} position={brick.position}>
                <Brick studsX={fx} studsZ={fz} color={brick.color} />
              </group>
            )
          })}
          <OrbitControls
            target={center}
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
            autoRotate
            autoRotateSpeed={4}
          />
        </Canvas>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-neutral-500">
        {set.name} — {set.bricks.length} bricks. Build it yourself on the plate.
      </p>
    </div>
  )
}
