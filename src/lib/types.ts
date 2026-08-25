export type ShapeId =
  | 'brick1x1'
  | 'brick1x2'
  | 'brick1x4'
  | 'brick2x2'
  | 'brick2x3'
  | 'brick2x4'
  | 'slope2x2'
  | 'wedge2x3'

export type Brick = {
  type: ShapeId
  // World units: x/z are the footprint's min-corner in studs, y is the
  // stack layer's base height (multiples of BRICK_HEIGHT).
  position: [number, number, number]
  rotation: 0 | 90 | 180 | 270
  color: string
}
