import type * as THREE from 'three'
import { STUD, PLATE_HEIGHT } from '../grid'
import { buildFacetedGeometry } from './geometryUtils'

// A roof-style slope: same rectangular footprint as a standard brick, but
// the height ramps linearly from 0 at the front edge (z=0) up to full
// height at the back edge (z=studsZ). No studs -- the top is an angled
// plane, not a landing surface.
export function buildSlopeGeometry(
  studsX: number,
  studsZ: number,
  heightInPlates: number,
): THREE.BufferGeometry {
  const sx = studsX * STUD
  const sz = studsZ * STUD
  const h = heightInPlates * PLATE_HEIGHT

  const v0: [number, number, number] = [0, 0, 0]
  const v1: [number, number, number] = [sx, 0, 0]
  const v2: [number, number, number] = [0, 0, sz]
  const v3: [number, number, number] = [sx, 0, sz]
  const v4: [number, number, number] = [0, h, sz]
  const v5: [number, number, number] = [sx, h, sz]

  return buildFacetedGeometry([
    [v0, v1, v3, v2], // bottom
    [v2, v3, v5, v4], // back (vertical)
    [v0, v4, v5, v1], // slope (angled top)
    [v0, v2, v4], // left
    [v1, v5, v3], // right
  ])
}
