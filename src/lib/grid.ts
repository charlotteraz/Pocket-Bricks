// Brick coordinate system. 1 world unit = 1 stud, matching real LEGO
// proportions (8mm stud pitch : 3.2mm plate height = 1 : 0.4) so bricks,
// plates, and the baseplate grid all line up without per-shape fudging.
export const STUD = 1
export const PLATE_HEIGHT = STUD * 0.4
export const BRICK_HEIGHT = PLATE_HEIGHT * 3

// Baseplate footprint, in studs.
export const GRID_SIZE = 32

export function snapToGrid(x: number, z: number): [number, number] {
  return [Math.round(x / STUD) * STUD, Math.round(z / STUD) * STUD]
}
