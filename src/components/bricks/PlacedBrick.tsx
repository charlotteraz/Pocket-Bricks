import { useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { BRICK_HEIGHT, STUD } from '../../lib/grid'
import Brick from './Brick'
import type { Brick as BrickData } from '../../lib/types'

type Props = {
  brick: BrickData
  footprintX: number
  footprintZ: number
  interactive?: boolean
  highlighted?: boolean
  onColliderPointerDown?: (e: ThreeEvent<PointerEvent>) => void
  onColliderPointerMove?: (e: ThreeEvent<PointerEvent>) => void
  onColliderPointerOut?: () => void
  onColliderClick?: (e: ThreeEvent<MouseEvent>) => void
}

const BOUNCE_DURATION = 0.22 // seconds

// Wraps Brick with an invisible full-volume collider (edit mode only, for
// stacking raycasts) and a one-shot scale-bounce that plays whenever this
// component mounts -- i.e. whenever a brick newly appears, placed or
// revealed by playback stepping forward.
export default function PlacedBrick({
  brick,
  footprintX,
  footprintZ,
  interactive = false,
  highlighted = false,
  onColliderPointerDown,
  onColliderPointerMove,
  onColliderPointerOut,
  onColliderClick,
}: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const elapsed = useRef(0)

  useFrame((_, delta) => {
    if (!groupRef.current || elapsed.current >= BOUNCE_DURATION) return
    elapsed.current += delta
    const t = Math.min(elapsed.current / BOUNCE_DURATION, 1)
    const scale = t >= 1 ? 1 : 1 + Math.sin(t * Math.PI) * (1 - t) * 0.25
    groupRef.current.scale.setScalar(scale)
  })

  return (
    <group ref={groupRef} position={brick.position}>
      <Brick type={brick.type} rotation={brick.rotation} color={highlighted ? '#ff3b3b' : brick.color} />
      {interactive && (
        <mesh
          position={[(footprintX * STUD) / 2, BRICK_HEIGHT / 2, (footprintZ * STUD) / 2]}
          onPointerDown={onColliderPointerDown}
          onPointerMove={onColliderPointerMove}
          onPointerOut={onColliderPointerOut}
          onClick={onColliderClick}
        >
          <boxGeometry args={[footprintX * STUD, BRICK_HEIGHT, footprintZ * STUD]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}
    </group>
  )
}
