import { create } from 'zustand'
import type { Brick, BrickType } from '../lib/types'
import { COLORS } from '../lib/colors'
import defaultSet from '../data/set.json'

type Rotation = 0 | 90 | 180 | 270
type Mode = 'edit' | 'playback'

type BuildStore = {
  bricks: Brick[]
  addBrick: (brick: Brick) => void
  loadBricks: (bricks: Brick[]) => void

  activeType: BrickType
  activeColor: string
  activeRotation: Rotation
  setActiveType: (type: BrickType) => void
  setActiveColor: (color: string) => void
  rotateActive: () => void

  // Instructions playback: steps through `bricks` in placement order.
  mode: Mode
  step: number
  enterPlayback: () => void
  exitPlayback: () => void
  nextStep: () => void
  prevStep: () => void

  started: boolean
  start: () => void
}

const ROTATIONS: Rotation[] = [0, 90, 180, 270]

export const useBuildStore = create<BuildStore>((set) => ({
  bricks: defaultSet as Brick[],
  addBrick: (brick) => set((state) => ({ bricks: [...state.bricks, brick] })),
  loadBricks: (bricks) => set({ bricks, mode: 'edit', step: 0 }),

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

  mode: 'edit',
  step: 0,
  enterPlayback: () => set({ mode: 'playback', step: 0 }),
  exitPlayback: () => set({ mode: 'edit' }),
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, state.bricks.length) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 0) })),

  started: false,
  start: () => set({ started: true }),
}))
