import type * as THREE from 'three'
import { STUD, PLATE_HEIGHT } from '../grid'
import { buildFacetedGeometry } from './geometryUtils'

// A pointed wedge: full brick height throughout, but the footprint tapers
// in plan view from the full width at the back edge (z=studsZ) down to a
// single centered point at the front (z=0). Occupies the full rectangular
// bounding footprint for placement/occupancy even though the solid itself
// is a triangular prism -- same simplification real wedge plates use.
export function buildWedgeGeometry(
  studsX: number,
  studsZ: number,
  heightInPlates: number,
): THREE.BufferGeometry {
  const sx = studsX * STUD
  const sz = studsZ * STUD
  const h = heightInPlates * PLATE_HEIGHT

  const a: [number, number, number] = [0, 0, sz]
  const b: [number, number, number] = [sx, 0, sz]
  const c: [number, number, number] = [sx / 2, 0, 0]
  const a2: [number, number, number] = [0, h, sz]
  const b2: [number, number, number] = [sx, h, sz]
  const c2: [number, number, number] = [sx / 2, h, 0]

  return buildFacetedGeometry([
    [a, b, c], // bottom
    [a2, b2, c2], // top
    [a, b, b2, a2], // back (vertical)
    [a, c, c2, a2], // left slant
    [b, c, c2, b2], // right slant
  ])
}
