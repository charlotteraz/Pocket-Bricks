import { useEffect, useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { GRID_SIZE, PLATE_HEIGHT, STUD } from '../../lib/grid'

// A real LEGO baseplate: a thin green slab studded on the same 1:1 grid as
// the placement cells, instead of a flat plane standing in for the ground
// with a wireframe gridHelper standing in for the studs.
const PLATE_COLOR = '#4a9d52'
const PLATE_THICKNESS = PLATE_HEIGHT
const STUD_RADIUS = STUD * 0.24
const STUD_HEIGHT = PLATE_HEIGHT * 0.5
const STUD_COUNT = GRID_SIZE * GRID_SIZE

// Sinks each stud's base slightly into the slab so its bottom cap sits
// inside solid geometry instead of exactly coplanar with the slab's top
// face -- two coplanar faces at the same depth flicker (z-fighting) as the
// camera moves, which coplanar-but-embedded faces don't.
const STUD_EMBED = PLATE_HEIGHT * 0.1

type Props = {
  interactive?: boolean
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void
  onPointerMove?: (e: ThreeEvent<PointerEvent>) => void
  onPointerOut?: () => void
  onClick?: (e: ThreeEvent<MouseEvent>) => void
}

// Top face sits at y=0, same as the flat plane it replaces, so brick layer
// 0 (yFromLayer(0) === 0) still rests flush on the surface.
export default function Baseplate({
  interactive = false,
  onPointerDown,
  onPointerMove,
  onPointerOut,
  onClick,
}: Props) {
  const studRef = useRef<THREE.InstancedMesh>(null)

  useEffect(() => {
    const mesh = studRef.current
    if (!mesh) return
    const half = GRID_SIZE / 2
    const dummy = new THREE.Object3D()
    let i = 0
    for (let ix = -half; ix < half; ix++) {
      for (let iz = -half; iz < half; iz++) {
        dummy.position.set((ix + 0.5) * STUD, STUD_HEIGHT / 2 - STUD_EMBED, (iz + 0.5) * STUD)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        i++
      }
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <group>
      <mesh
        position={[0, -PLATE_THICKNESS / 2, 0]}
        receiveShadow
        onPointerDown={interactive ? onPointerDown : undefined}
        onPointerMove={interactive ? onPointerMove : undefined}
        onPointerOut={interactive ? onPointerOut : undefined}
        onClick={interactive ? onClick : undefined}
      >
        <boxGeometry args={[GRID_SIZE * STUD, PLATE_THICKNESS, GRID_SIZE * STUD]} />
        <meshStandardMaterial color={PLATE_COLOR} roughness={0.55} metalness={0.05} />
      </mesh>
      <instancedMesh ref={studRef} args={[undefined, undefined, STUD_COUNT]} receiveShadow>
        <cylinderGeometry args={[STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 12]} />
        <meshStandardMaterial color={PLATE_COLOR} roughness={0.55} metalness={0.05} />
      </instancedMesh>
    </group>
  )
}
