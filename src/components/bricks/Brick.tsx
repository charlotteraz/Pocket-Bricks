import { useMemo } from 'react'
import { STUD, PLATE_HEIGHT } from '../../lib/grid'
import { shapeDef } from '../../lib/bricks'
import type { ShapeId } from '../../lib/types'

const STUD_RADIUS = STUD * 0.24
const STUD_HEIGHT = PLATE_HEIGHT * 0.5

type BrickProps = {
  type: ShapeId
  rotation?: 0 | 90 | 180 | 270
  color?: string
  opacity?: number
}

type PlasticProps = { color: string; opacity: number; transparent: boolean }

// Glossy injection-molded plastic look via a tight, low-roughness specular
// highlight -- per the plan's "single biggest visual upgrade for the least
// effort." A full clearcoat layer needs environment reflections to read
// correctly and just washes the color out under plain directional lights,
// so this stays on meshStandardMaterial rather than chasing full PBR here.
function Plastic({ color, opacity, transparent }: PlasticProps) {
  return (
    <meshStandardMaterial
      color={color}
      transparent={transparent}
      opacity={opacity}
      roughness={0.3}
      metalness={0.05}
    />
  )
}

// Every shape's buildGeometry() is authored min-corner-anchored in its own
// *canonical* (rotation 0) orientation. Rotation is a real transform here
// (not baked into the geometry) so asymmetric shapes -- a slope's angled
// face, a wedge's point -- actually point the right way once rotated,
// unlike the old footprint-swap trick that only worked because a plain box
// with a symmetric stud grid looks identical either way.
//
// After rotating around the local origin, the rotated footprint's own min
// corner has drifted off (0,0); each case's `offset` is the translation
// that brings it back, so the parent group can keep positioning this at
// `brick.position` with no rotation-awareness of its own. Derived by
// rotating the four canonical footprint corners through three.js's
// standard Y-rotation matrix and re-deriving the new min corner -- see
// SPEC.md "Shape registry" for the full derivation.
function rotationTransform(
  studsX: number,
  studsZ: number,
  rotation: number,
): { rotationY: number; offset: [number, number] } {
  const sx = studsX * STUD
  const sz = studsZ * STUD
  switch (rotation) {
    case 90:
      return { rotationY: Math.PI / 2, offset: [0, sx] }
    case 180:
      return { rotationY: Math.PI, offset: [sx, sz] }
    case 270:
      return { rotationY: -Math.PI / 2, offset: [sz, 0] }
    default:
      return { rotationY: 0, offset: [0, 0] }
  }
}

export default function Brick({ type, rotation = 0, color = '#d33f3f', opacity = 1 }: BrickProps) {
  const def = shapeDef(type)
  const transparent = opacity < 1
  const geometry = useMemo(
    () => def.buildGeometry(def.studsX, def.studsZ, def.heightInPlates),
    [def],
  )
  const { rotationY, offset } = rotationTransform(def.studsX, def.studsZ, rotation)
  const height = def.heightInPlates * PLATE_HEIGHT

  const studs: [number, number][] = []
  if (def.hasStuds) {
    for (let ix = 0; ix < def.studsX; ix++) {
      for (let iz = 0; iz < def.studsZ; iz++) {
        studs.push([ix + 0.5, iz + 0.5])
      }
    }
  }

  return (
    <group rotation={[0, rotationY, 0]} position={[offset[0], 0, offset[1]]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <Plastic color={color} opacity={opacity} transparent={transparent} />
      </mesh>
      {studs.map(([sx, sz], i) => (
        <mesh key={i} position={[sx * STUD, height + STUD_HEIGHT / 2, sz * STUD]} castShadow>
          <cylinderGeometry args={[STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 16]} />
          <Plastic color={color} opacity={opacity} transparent={transparent} />
        </mesh>
      ))}
    </group>
  )
}
