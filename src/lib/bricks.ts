import * as THREE from 'three'
import type { ShapeId } from './types'
import { STUD, PLATE_HEIGHT } from './grid'
import { buildSlopeGeometry } from './shapes/slope'
import { buildWedgeGeometry } from './shapes/wedge'

// A shape's body geometry is always authored min-corner-anchored, spanning
// [0, studsX*STUD] x [0, height] x [0, studsZ*STUD] in its own canonical
// (rotation 0) orientation -- see Brick.tsx for how rotation is then
// applied as a real transform on top of that, rather than baked in here.
export type ShapeDef = {
  type: ShapeId
  studsX: number
  studsZ: number
  heightInPlates: number // 3 = a full brick's height; plates will be 1
  hasStuds: boolean
  label: string
  buildGeometry: (studsX: number, studsZ: number, heightInPlates: number) => THREE.BufferGeometry
}

const BODY_INSET = 0.98 // slight gap so adjacent bricks don't z-fight

function buildBoxGeometry(
  studsX: number,
  studsZ: number,
  heightInPlates: number,
): THREE.BufferGeometry {
  const height = heightInPlates * PLATE_HEIGHT
  const geometry = new THREE.BoxGeometry(
    studsX * STUD * BODY_INSET,
    height,
    studsZ * STUD * BODY_INSET,
  )
  // THREE.BoxGeometry is centered at its own origin; shift it to match the
  // min-corner-anchored convention every other shape builder follows.
  geometry.translate((studsX * STUD) / 2, height / 2, (studsZ * STUD) / 2)
  return geometry
}

export const SHAPES: ShapeDef[] = [
  { type: 'brick1x1', studsX: 1, studsZ: 1, heightInPlates: 3, hasStuds: true, label: '1x1', buildGeometry: buildBoxGeometry },
  { type: 'brick1x2', studsX: 1, studsZ: 2, heightInPlates: 3, hasStuds: true, label: '1x2', buildGeometry: buildBoxGeometry },
  { type: 'brick1x4', studsX: 1, studsZ: 4, heightInPlates: 3, hasStuds: true, label: '1x4', buildGeometry: buildBoxGeometry },
  { type: 'brick2x2', studsX: 2, studsZ: 2, heightInPlates: 3, hasStuds: true, label: '2x2', buildGeometry: buildBoxGeometry },
  { type: 'brick2x3', studsX: 2, studsZ: 3, heightInPlates: 3, hasStuds: true, label: '2x3', buildGeometry: buildBoxGeometry },
  { type: 'brick2x4', studsX: 2, studsZ: 4, heightInPlates: 3, hasStuds: true, label: '2x4', buildGeometry: buildBoxGeometry },
  { type: 'slope2x2', studsX: 2, studsZ: 2, heightInPlates: 3, hasStuds: false, label: 'Slope 2x2', buildGeometry: buildSlopeGeometry },
  { type: 'wedge2x3', studsX: 2, studsZ: 3, heightInPlates: 3, hasStuds: false, label: 'Wedge 2x3', buildGeometry: buildWedgeGeometry },
]

export function shapeDef(type: ShapeId): ShapeDef {
  const def = SHAPES.find((d) => d.type === type)
  if (!def) throw new Error(`Unknown shape: ${type}`)
  return def
}

// Rotation swaps the footprint's X/Z extent at 90/270 regardless of shape --
// that's just what rotating a rectangle does. Whether the shape *looks*
// different when rotated (a slope's angled face points somewhere specific;
// a symmetric brick doesn't) is handled separately, as a real transform, in
// Brick.tsx -- this function only answers "which cells does it occupy."
export function effectiveFootprint(type: ShapeId, rotation: number): [number, number] {
  const def = shapeDef(type)
  return rotation === 90 || rotation === 270
    ? [def.studsZ, def.studsX]
    : [def.studsX, def.studsZ]
}
