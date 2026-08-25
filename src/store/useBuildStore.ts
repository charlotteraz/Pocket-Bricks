import { create } from 'zustand'
import type { Brick, BrickType } from '../lib/types'
import { COLORS } from '../lib/colors'
import { SETS } from '../data/sets'

type Rotation = 0 | 90 | 180 | 270
type Mode = 'edit' | 'playback'

type BuildStore = {
  bricks: Brick[]
  addBrick: (brick: Brick) => void
  loadBricks: (bricks: Brick[]) => void

  // Which of the fixed sets (src/data/sets.ts) is currently loaded, if any --
  // undefined once a brick's been placed/removed by hand or a custom file
  // imported, since the bricks no longer necessarily match that set.
  activeSetId: string | undefined
  loadSet: (id: string) => void

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
  bricks: SETS[0].bricks,
  addBrick: (brick) =>
    set((state) => ({ bricks: [...state.bricks, brick], activeSetId: undefined })),
  loadBricks: (bricks) => set({ bricks, mode: 'edit', step: 0, activeSetId: undefined }),

  activeSetId: SETS[0].id,
  loadSet: (id) => {
    const found = SETS.find((s) => s.id === id)
    if (!found) return
    set({ bricks: found.bricks, activeSetId: id, mode: 'edit', step: 0 })
  },

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
