// Brick coordinate system. 1 world unit = 1 stud, matching real LEGO
// proportions (8mm stud pitch : 3.2mm plate height = 1 : 0.4) so bricks,
// plates, and the baseplate grid all line up without per-shape fudging.
export const STUD = 1
export const PLATE_HEIGHT = STUD * 0.4
export const BRICK_HEIGHT = PLATE_HEIGHT * 3

// Baseplate footprint, in studs.
export const GRID_SIZE = 32

// Snaps a raycast hit point to the stud cell containing it, returned as
// integer cell coordinates (the cell's min corner) — a brick's `position`
// anchors on this corner and extends toward +X/+Z by its footprint.
export function cellFromPoint(x: number, z: number): [number, number] {
  return [Math.floor(x / STUD), Math.floor(z / STUD)]
}

// Clamps a footprint anchor so a `footprintX`x`footprintZ` brick stays
// within the baseplate.
export function clampToBaseplate(
  cellX: number,
  cellZ: number,
  footprintX: number,
  footprintZ: number,
): [number, number] {
  const half = GRID_SIZE / 2
  return [
    Math.min(Math.max(cellX, -half), half - footprintX),
    Math.min(Math.max(cellZ, -half), half - footprintZ),
  ]
}
