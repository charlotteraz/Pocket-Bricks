import type { BrickType } from './types'

export type BrickDef = {
  type: BrickType
  studsX: number
  studsZ: number
  label: string
}

export const BRICK_DEFS: BrickDef[] = [
  { type: 'brick1x1', studsX: 1, studsZ: 1, label: '1x1' },
  { type: 'brick1x2', studsX: 1, studsZ: 2, label: '1x2' },
  { type: 'brick1x4', studsX: 1, studsZ: 4, label: '1x4' },
  { type: 'brick2x2', studsX: 2, studsZ: 2, label: '2x2' },
  { type: 'brick2x3', studsX: 2, studsZ: 3, label: '2x3' },
  { type: 'brick2x4', studsX: 2, studsZ: 4, label: '2x4' },
]

export function brickDef(type: BrickType): BrickDef {
  const def = BRICK_DEFS.find((d) => d.type === type)
  if (!def) throw new Error(`Unknown brick type: ${type}`)
  return def
}

// Our brick geometry (a box with a symmetric grid of round studs) looks
// identical whether you rotate the mesh 90° or just swap its footprint
// dimensions, so rotation is applied by swapping studsX/studsZ rather than
// a mesh transform — simpler, and no corner-pivot math to get wrong.
export function effectiveFootprint(type: BrickType, rotation: number): [number, number] {
  const def = brickDef(type)
  return rotation === 90 || rotation === 270
    ? [def.studsZ, def.studsX]
    : [def.studsX, def.studsZ]
}
