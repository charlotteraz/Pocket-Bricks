import { create } from 'zustand'
import type { Brick, ShapeId } from '../lib/types'
import { COLORS } from '../lib/colors'
import { SETS } from '../data/sets'

type Rotation = 0 | 90 | 180 | 270
type Mode = 'edit' | 'playback'

type BuildStore = {
  bricks: Brick[]
  addBrick: (brick: Brick) => void
  loadBricks: (bricks: Brick[]) => void
  clearBricks: () => void

  // Undo/redo over `bricks` as a whole -- each entry is a prior snapshot of
  // the array (placement, import, or set switch all push one), not a diff,
  // since builds are small enough that whole-array snapshots are cheap.
  undoStack: Brick[][]
  redoStack: Brick[][]
  undo: () => void
  redo: () => void

  // Which of the fixed sets (src/data/sets.ts) is the current reference --
  // shown in SetPreview, but deliberately not loaded onto the plate: the
  // point is to look at it and build it yourself by hand.
  activeSetId: string | undefined
  loadSet: (id: string) => void

  activeType: ShapeId
  activeColor: string
  activeRotation: Rotation
  setActiveType: (type: ShapeId) => void
  setActiveColor: (color: string) => void
  rotateActive: () => void

  // Instructions playback: steps through the active set's own bricks in
  // placement order -- a how-to-build walkthrough of the reference set,
  // independent of whatever the builder has placed on the plate themselves.
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
  bricks: [],
  addBrick: (brick) =>
    set((state) => ({
      bricks: [...state.bricks, brick],
      undoStack: [...state.undoStack, state.bricks],
      redoStack: [],
    })),
  loadBricks: (bricks) =>
    set((state) => ({
      bricks,
      undoStack: [...state.undoStack, state.bricks],
      redoStack: [],
      mode: 'edit',
      step: 0,
    })),
  clearBricks: () =>
    set((state) => {
      if (state.bricks.length === 0) return state
      return {
        bricks: [],
        undoStack: [...state.undoStack, state.bricks],
        redoStack: [],
      }
    }),

  undoStack: [],
  redoStack: [],
  undo: () =>
    set((state) => {
      if (state.undoStack.length === 0) return state
      const prev = state.undoStack[state.undoStack.length - 1]
      return {
        bricks: prev,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.bricks],
      }
    }),
  redo: () =>
    set((state) => {
      if (state.redoStack.length === 0) return state
      const next = state.redoStack[state.redoStack.length - 1]
      return {
        bricks: next,
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, state.bricks],
      }
    }),

  activeSetId: SETS[0].id,
  loadSet: (id) => {
    const found = SETS.find((s) => s.id === id)
    if (!found) return
    // Clears the plate rather than pre-building the set -- picking a set
    // swaps the reference preview and gives you a fresh plate to build it
    // on, it doesn't hand you the finished thing.
    set((state) => ({
      bricks: [],
      undoStack: [...state.undoStack, state.bricks],
      redoStack: [],
      activeSetId: id,
      mode: 'edit',
      step: 0,
    }))
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
  nextStep: () =>
    set((state) => {
      const total = SETS.find((s) => s.id === state.activeSetId)?.bricks.length ?? 0
      return { step: Math.min(state.step + 1, total) }
    }),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 0) })),

  started: false,
  start: () => set({ started: true }),
}))
