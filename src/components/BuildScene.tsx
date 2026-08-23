import { useEffect, useMemo, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { GRID_SIZE, STUD, BRICK_HEIGHT, cellFromPoint, clampToBaseplate } from '../lib/grid'
import { effectiveFootprint } from '../lib/bricks'
import { buildOccupancy, hasCollision, layerFromY, yFromLayer } from '../lib/occupancy'
import { useBuildStore } from '../store/useBuildStore'
import Brick from './bricks/Brick'

type HoverCell = { cellX: number; cellZ: number; layer: number }

export default function BuildScene() {
  const [hovered, setHovered] = useState<HoverCell | null>(null)
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

  const occupancy = useMemo(() => buildOccupancy(bricks), [bricks])
  const [activeFootprintX, activeFootprintZ] = effectiveFootprint(activeType, activeRotation)

  function tryPlace(cellX: number, cellZ: number, layer: number) {
    const [ax, az] = clampToBaseplate(cellX, cellZ, activeFootprintX, activeFootprintZ)
    if (hasCollision(occupancy, ax, az, activeFootprintX, activeFootprintZ, layer)) return
    addBrick({
      type: activeType,
      position: [ax * STUD, yFromLayer(layer), az * STUD],
      rotation: activeRotation,
      color: activeColor,
    })
  }

  const anchor = hovered
    ? clampToBaseplate(hovered.cellX, hovered.cellZ, activeFootprintX, activeFootprintZ)
    : null
  const blocked =
    hovered !== null &&
    anchor !== null &&
    hasCollision(occupancy, anchor[0], anchor[1], activeFootprintX, activeFootprintZ, hovered.layer)

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onPointerMove={(e) => {
          e.stopPropagation()
          const [cx, cz] = cellFromPoint(e.point.x, e.point.z)
          setHovered({ cellX: cx, cellZ: cz, layer: 0 })
        }}
        onPointerOut={() => setHovered(null)}
        onClick={(e) => {
          e.stopPropagation()
          const [cx, cz] = cellFromPoint(e.point.x, e.point.z)
          tryPlace(cx, cz, 0)
        }}
      >
        <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
        <meshStandardMaterial color="#e5e4e7" />
      </mesh>
      <gridHelper args={[GRID_SIZE, GRID_SIZE, '#999999', '#bbbbbb']} />

      {bricks.map((brick, i) => {
        const [fx, fz] = effectiveFootprint(brick.type, brick.rotation)
        const layer = layerFromY(brick.position[1])
        const minX = brick.position[0]
        const minZ = brick.position[2]
        const maxX = minX + fx * STUD
        const maxZ = minZ + fz * STUD

        function hoverCellFromEvent(e: ThreeEvent<PointerEvent | MouseEvent>): [number, number] {
          const clampedX = Math.min(Math.max(e.point.x, minX), maxX - 1e-6)
          const clampedZ = Math.min(Math.max(e.point.z, minZ), maxZ - 1e-6)
          return cellFromPoint(clampedX, clampedZ)
        }

        return (
          <group key={i} position={brick.position}>
            <Brick studsX={fx} studsZ={fz} color={brick.color} />
            {/* Invisible full-volume collider: whichever brick's box the
                pointer ray actually hits (nearest to camera wins) is what
                the next brick stacks on top of, regardless of which face
                was clicked. */}
            <mesh
              position={[(fx * STUD) / 2, BRICK_HEIGHT / 2, (fz * STUD) / 2]}
              onPointerMove={(e) => {
                e.stopPropagation()
                const [hx, hz] = hoverCellFromEvent(e)
                setHovered({ cellX: hx, cellZ: hz, layer: layer + 1 })
              }}
              onPointerOut={() => setHovered(null)}
              onClick={(e) => {
                e.stopPropagation()
                const [hx, hz] = hoverCellFromEvent(e)
                tryPlace(hx, hz, layer + 1)
              }}
            >
              <boxGeometry args={[fx * STUD, BRICK_HEIGHT, fz * STUD]} />
              <meshBasicMaterial visible={false} />
            </mesh>
          </group>
        )
      })}

      {anchor && (
        <group position={[anchor[0] * STUD, yFromLayer(hovered!.layer), anchor[1] * STUD]}>
          <Brick
            studsX={activeFootprintX}
            studsZ={activeFootprintZ}
            color={blocked ? '#ff3b3b' : activeColor}
            opacity={blocked ? 0.3 : 0.45}
          />
        </group>
      )}
    </>
  )
}
