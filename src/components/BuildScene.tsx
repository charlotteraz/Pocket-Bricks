import { useEffect, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { GRID_SIZE, STUD, cellFromPoint, clampToBaseplate } from '../lib/grid'
import { effectiveFootprint } from '../lib/bricks'
import { useBuildStore } from '../store/useBuildStore'
import Brick from './bricks/Brick'

export default function BuildScene() {
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null)
  const bricks = useBuildStore((s) => s.bricks)
  const addBrick = useBuildStore((s) => s.addBrick)
  const activeType = useBuildStore((s) => s.activeType)
  const activeColor = useBuildStore((s) => s.activeColor)
  const activeRotation = useBuildStore((s) => s.activeRotation)
  const rotateActive = useBuildStore((s) => s.rotateActive)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === 'r') rotateActive()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [rotateActive])

  const [activeFootprintX, activeFootprintZ] = effectiveFootprint(activeType, activeRotation)

  function cellFromEvent(e: ThreeEvent<PointerEvent | MouseEvent>): [number, number] {
    const [cx, cz] = cellFromPoint(e.point.x, e.point.z)
    return clampToBaseplate(cx, cz, activeFootprintX, activeFootprintZ)
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
            type: activeType,
            position: [cx * STUD, 0, cz * STUD],
            rotation: activeRotation,
            color: activeColor,
          })
        }}
      >
        <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
        <meshStandardMaterial color="#e5e4e7" />
      </mesh>
      <gridHelper args={[GRID_SIZE, GRID_SIZE, '#999999', '#bbbbbb']} />

      {bricks.map((brick, i) => {
        const [fx, fz] = effectiveFootprint(brick.type, brick.rotation)
        return (
          <group key={i} position={brick.position}>
            <Brick studsX={fx} studsZ={fz} color={brick.color} />
          </group>
        )
      })}

      {hoveredCell && (
        <group position={[hoveredCell[0] * STUD, 0, hoveredCell[1] * STUD]}>
          <Brick studsX={activeFootprintX} studsZ={activeFootprintZ} color={activeColor} opacity={0.45} />
        </group>
      )}
    </>
  )
}
