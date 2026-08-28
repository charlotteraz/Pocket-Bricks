import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { OrbitControls } from 'three-stdlib'
import { useBuildStore } from '../store/useBuildStore'
import { effectiveFootprint } from '../lib/bricks'
import { STUD, BRICK_HEIGHT } from '../lib/grid'
import { SETS } from '../data/sets'

export type OrbitControlsHandle = OrbitControls

type Props = { controlsRef: React.RefObject<OrbitControlsHandle | null> }

// During instructions playback, smoothly pans the OrbitControls target to
// the current step's brick so the incoming piece is framed. Inert in edit
// mode -- never fights the builder's own camera control.
export default function CameraFramer({ controlsRef }: Props) {
  const mode = useBuildStore((s) => s.mode)
  const step = useBuildStore((s) => s.step)
  const activeSetId = useBuildStore((s) => s.activeSetId)
  const target = useRef(new THREE.Vector3())

  useFrame(() => {
    const controls = controlsRef.current
    if (!controls || mode !== 'playback') return
    const brick = SETS.find((s) => s.id === activeSetId)?.bricks[step]
    if (!brick) return

    const [fx, fz] = effectiveFootprint(brick.type, brick.rotation)
    target.current.set(
      brick.position[0] + (fx * STUD) / 2,
      brick.position[1] + BRICK_HEIGHT / 2,
      brick.position[2] + (fz * STUD) / 2,
    )
    controls.target.lerp(target.current, 0.08)
    controls.update()
  })

  return null
}
