import { useEffect, useMemo, useRef, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { GRID_SIZE, STUD, cellFromPoint, clampToBaseplate } from '../lib/grid'
import { effectiveFootprint } from '../lib/bricks'
import { buildOccupancy, hasCollision, layerFromY, yFromLayer } from '../lib/occupancy'
import { playSnapSound } from '../lib/sound'
import { useBuildStore } from '../store/useBuildStore'
import Brick from './bricks/Brick'
import PlacedBrick from './bricks/PlacedBrick'

type HoverCell = { cellX: number; cellZ: number; layer: number }

// A click that moved more than this many screen pixels between down and up
// is an orbit/pan drag, not a placement -- OrbitControls and our own
// pointer handlers see the same raw events, so without this a camera drag
// that starts and ends over the plate silently drops a brick.
const DRAG_THRESHOLD_PX = 6

export default function BuildScene() {
  const [hovered, setHovered] = useState<HoverCell | null>(null)
  const pointerDownAt = useRef<[number, number] | null>(null)
  const mode = useBuildStore((s) => s.mode)
  const step = useBuildStore((s) => s.step)
  const bricks = useBuildStore((s) => s.bricks)
  const addBrick = useBuildStore((s) => s.addBrick)
  const undo = useBuildStore((s) => s.undo)
  const redo = useBuildStore((s) => s.redo)
  const activeType = useBuildStore((s) => s.activeType)
  const activeColor = useBuildStore((s) => s.activeColor)
  const activeRotation = useBuildStore((s) => s.activeRotation)
  const rotateActive = useBuildStore((s) => s.rotateActive)

  function recordPointerDown(e: ThreeEvent<PointerEvent>) {
    pointerDownAt.current = [e.nativeEvent.clientX, e.nativeEvent.clientY]
  }

  function wasDrag(e: ThreeEvent<MouseEvent>): boolean {
    const start = pointerDownAt.current
    if (!start) return false
    const dx = e.nativeEvent.clientX - start[0]
    const dy = e.nativeEvent.clientY - start[1]
    return Math.hypot(dx, dy) > DRAG_THRESHOLD_PX
  }

  useEffect(() => {
    if (mode !== 'edit') return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === 'r') {
        rotateActive()
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mode, rotateActive, undo, redo])

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
    playSnapSound()
  }

  const anchor = hovered
    ? clampToBaseplate(hovered.cellX, hovered.cellZ, activeFootprintX, activeFootprintZ)
    : null
  const blocked =
    hovered !== null &&
    anchor !== null &&
    hasCollision(occupancy, anchor[0], anchor[1], activeFootprintX, activeFootprintZ, hovered.layer)

  if (mode === 'playback') {
    const targetBrick = bricks[step]
    return (
      <>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
          <meshStandardMaterial color="#e5e4e7" />
        </mesh>
        <gridHelper args={[GRID_SIZE, GRID_SIZE, '#999999', '#bbbbbb']} />

        {bricks.slice(0, step).map((brick, i) => {
          const [fx, fz] = effectiveFootprint(brick.type, brick.rotation)
          return <PlacedBrick key={i} brick={brick} footprintX={fx} footprintZ={fz} />
        })}

        {targetBrick && (
          <group position={targetBrick.position}>
            <Brick
              type={targetBrick.type}
              rotation={targetBrick.rotation}
              color={targetBrick.color}
              opacity={0.4}
            />
          </group>
        )}
      </>
    )
  }

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onPointerDown={recordPointerDown}
        onPointerMove={(e) => {
          e.stopPropagation()
          const [cx, cz] = cellFromPoint(e.point.x, e.point.z)
          setHovered({ cellX: cx, cellZ: cz, layer: 0 })
        }}
        onPointerOut={() => setHovered(null)}
        onClick={(e) => {
          e.stopPropagation()
          if (wasDrag(e)) return
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
          <PlacedBrick
            key={i}
            brick={brick}
            footprintX={fx}
            footprintZ={fz}
            interactive
            onColliderPointerDown={recordPointerDown}
            onColliderPointerMove={(e) => {
              e.stopPropagation()
              const [hx, hz] = hoverCellFromEvent(e)
              setHovered({ cellX: hx, cellZ: hz, layer: layer + 1 })
            }}
            onColliderPointerOut={() => setHovered(null)}
            onColliderClick={(e) => {
              e.stopPropagation()
              if (wasDrag(e)) return
              const [hx, hz] = hoverCellFromEvent(e)
              tryPlace(hx, hz, layer + 1)
            }}
          />
        )
      })}

      {anchor && (
        <group position={[anchor[0] * STUD, yFromLayer(hovered!.layer), anchor[1] * STUD]}>
          <Brick
            type={activeType}
            rotation={activeRotation}
            color={blocked ? '#ff3b3b' : activeColor}
            opacity={blocked ? 0.3 : 0.45}
          />
        </group>
      )}
    </>
  )
}
