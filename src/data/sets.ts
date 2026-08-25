import type { Brick } from '../lib/types'
import lighthouse from './sets/lighthouse.json'
import car from './sets/car.json'
import flower from './sets/flower.json'

export type BuildSet = {
  id: string
  name: string
  bricks: Brick[]
}

export const SETS: BuildSet[] = [
  { id: 'lighthouse', name: 'Lighthouse', bricks: lighthouse as Brick[] },
  { id: 'car', name: 'Car', bricks: car as Brick[] },
  { id: 'flower', name: 'Flower', bricks: flower as Brick[] },
]
