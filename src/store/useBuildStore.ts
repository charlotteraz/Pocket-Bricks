import { create } from 'zustand'
import type { Brick, BrickType } from '../lib/types'
import { COLORS } from '../lib/colors'

type Rotation = 0 | 90 | 180 | 270

type BuildStore = {
  bricks: Brick[]
  addBrick: (brick: Brick) => void

  activeType: BrickType
  activeColor: string
  activeRotation: Rotation
  setActiveType: (type: BrickType) => void
  setActiveColor: (color: string) => void
  rotateActive: () => void
}

const ROTATIONS: Rotation[] = [0, 90, 180, 270]

export const useBuildStore = create<BuildStore>((set) => ({
  bricks: [],
  addBrick: (brick) => set((state) => ({ bricks: [...state.bricks, brick] })),

  activeType: 'brick2x4',
  activeColor: COLORS[0].hex,
  activeRotation: 0,
  setActiveType: (type) => set({ activeType: type }),
  setActiveColor: (color) => set({ activeColor: color }),
  rotateActive: () =>
    set((state) => ({
      activeRotation:
        ROTATIONS[(ROTATIONS.indexOf(state.activeRotation) + 1) % ROTATIONS.length],
    })),
}))
