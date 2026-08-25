import * as THREE from 'three'

type Vec3 = [number, number, number]

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function centroidOf(points: Vec3[]): Vec3 {
  const n = points.length
  return [
    points.reduce((s, p) => s + p[0], 0) / n,
    points.reduce((s, p) => s + p[1], 0) / n,
    points.reduce((s, p) => s + p[2], 0) / n,
  ]
}

// Builds a flat-shaded solid from a list of planar faces, each an ordered
// vertex loop walking its boundary (triangle or convex polygon -- fan
// triangulated). Loop direction doesn't need to be winding-correct: each
// face is auto-oriented outward by checking whether its raw normal points
// toward the solid's overall centroid, and reversed if so. That removes the
// usual hand-derived cross-product bookkeeping for custom shapes, which is
// exactly the error-prone part of authoring more than a couple of these.
// Only valid for solids where every face centroid sees the true centroid on
// the interior side (true for the convex slope/wedge shapes here).
export function buildFacetedGeometry(faces: Vec3[][]): THREE.BufferGeometry {
  const solidCentroid = centroidOf(faces.flat())
  const positions: number[] = []

  for (const face of faces) {
    const faceCentroid = centroidOf(face)
    const rawNormal = cross(sub(face[1], face[0]), sub(face[2], face[0]))
    const towardSolid = sub(solidCentroid, faceCentroid)
    const ordered = dot(rawNormal, towardSolid) > 0 ? [...face].reverse() : face

    for (let i = 1; i < ordered.length - 1; i++) {
      positions.push(...ordered[0], ...ordered[i], ...ordered[i + 1])
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.computeVertexNormals()
  return geometry
}
