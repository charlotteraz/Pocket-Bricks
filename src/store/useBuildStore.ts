import { create } from 'zustand'
import type { Brick } from '../lib/types'

type BuildStore = {
  bricks: Brick[]
  addBrick: (brick: Brick) => void
}

export const useBuildStore = create<BuildStore>((set) => ({
  bricks: [],
  addBrick: (brick) => set((state) => ({ bricks: [...state.bricks, brick] })),
}))
