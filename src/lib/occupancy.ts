import { BRICK_HEIGHT } from './grid'
import { effectiveFootprint } from './bricks'
import type { Brick } from './types'

// A brick's y position is always a whole number of stack layers up.
export function layerFromY(y: number): number {
  return Math.round(y / BRICK_HEIGHT)
}

export function yFromLayer(layer: number): number {
  return layer * BRICK_HEIGHT
}

function cellKey(x: number, layer: number, z: number): string {
  return `${x},${layer},${z}`
}

function footprintCells(
  cellX: number,
  cellZ: number,
  footprintX: number,
  footprintZ: number,
  layer: number,
): string[] {
  const cells: string[] = []
  for (let dx = 0; dx < footprintX; dx++) {
    for (let dz = 0; dz < footprintZ; dz++) {
      cells.push(cellKey(cellX + dx, layer, cellZ + dz))
    }
  }
  return cells
}

// Basic cell occupancy, not real clutch-power simulation (see BUILD_PLAN.md
// "Cut for v1") — a cell is either free or claimed by exactly one brick.
export function buildOccupancy(bricks: Brick[]): Set<string> {
  const occupied = new Set<string>()
  for (const brick of bricks) {
    const [fx, fz] = effectiveFootprint(brick.type, brick.rotation)
    const layer = layerFromY(brick.position[1])
    for (const cell of footprintCells(brick.position[0], brick.position[2], fx, fz, layer)) {
      occupied.add(cell)
    }
  }
  return occupied
}

export function hasCollision(
  occupied: Set<string>,
  cellX: number,
  cellZ: number,
  footprintX: number,
  footprintZ: number,
  layer: number,
): boolean {
  return footprintCells(cellX, cellZ, footprintX, footprintZ, layer).some((cell) =>
    occupied.has(cell),
  )
}
