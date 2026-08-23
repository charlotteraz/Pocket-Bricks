// One fixed shape for now (phase 2); the palette in phase 3 adds more.
export type BrickType = 'brick2x4'

export type Brick = {
  type: BrickType
  // World units: x/z are the footprint's min-corner in studs, y is the
  // stack layer's base height (multiples of BRICK_HEIGHT).
  position: [number, number, number]
  rotation: 0 | 90 | 180 | 270
  color: string
}
