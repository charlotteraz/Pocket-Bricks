# Pocket Bricks — Spec

Browser-based LEGO builder: one fixed set (~30–80 pieces), 5–6 brick shapes, drag-to-place, instructions playback. See `Pocket-Bricks-Build-Plan.docx` for the full build plan and phase-by-phase order.

## Stack

- Vite + React + TypeScript
- three.js + @react-three/fiber + @react-three/drei (Canvas, OrbitControls)
- Zustand (app state)
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Hand-built brick geometry (box/cylinder primitives) — no imported assets
- Hosting: Vercel

## Data model

One ordered array is both "the set" and the instruction step order:

```ts
type Brick = {
  type: string // one of 5-6 fixed shapes
  position: [number, number, number] // grid units, see below
  rotation: 0 | 90 | 180 | 270 // degrees about Y
  color: string
}

type Build = Brick[]
```

## Grid units

TBD — decided in Phase 1 (grid & camera). Record the stud unit size and plate-height ratio (1 brick = 3 plates) here once fixed, so later phases and AI sessions stay consistent.

## Cut for v1

Full brick catalog, physics-accurate collision, auto-generated instructions, multiple sets, touch/mobile input, save/load accounts. See build plan for details.
