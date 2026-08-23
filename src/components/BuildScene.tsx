import { useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { GRID_SIZE, STUD, cellFromPoint, clampToBaseplate } from '../lib/grid'
import { useBuildStore } from '../store/useBuildStore'
import Brick from './bricks/Brick'

const BRICK_COLOR = '#d33f3f'
const FOOTPRINT_X = 2
const FOOTPRINT_Z = 4

export default function BuildScene() {
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null)
  const bricks = useBuildStore((s) => s.bricks)
  const addBrick = useBuildStore((s) => s.addBrick)

  function cellFromEvent(e: ThreeEvent<PointerEvent | MouseEvent>): [number, number] {
    const [cx, cz] = cellFromPoint(e.point.x, e.point.z)
    return clampToBaseplate(cx, cz, FOOTPRINT_X, FOOTPRINT_Z)
  }

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onPointerMove={(e) => {
          e.stopPropagation()
          setHoveredCell(cellFromEvent(e))
        }}
        onPointerOut={() => setHoveredCell(null)}
        onClick={(e) => {
          e.stopPropagation()
          const [cx, cz] = cellFromEvent(e)
          addBrick({
            type: 'brick2x4',
            position: [cx * STUD, 0, cz * STUD],
            rotation: 0,
            color: BRICK_COLOR,
          })
        }}
      >
        <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
        <meshStandardMaterial color="#e5e4e7" />
      </mesh>
      <gridHelper args={[GRID_SIZE, GRID_SIZE, '#999999', '#bbbbbb']} />

      {bricks.map((brick, i) => (
        <group key={i} position={brick.position}>
          <Brick studsX={FOOTPRINT_X} studsZ={FOOTPRINT_Z} color={brick.color} />
        </group>
      ))}

      {hoveredCell && (
        <group position={[hoveredCell[0] * STUD, 0, hoveredCell[1] * STUD]}>
          <Brick studsX={FOOTPRINT_X} studsZ={FOOTPRINT_Z} color={BRICK_COLOR} opacity={0.45} />
        </group>
      )}
    </>
  )
}
