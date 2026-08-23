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

Defined in `src/lib/grid.ts` — import from there rather than hardcoding.

- `STUD = 1` world unit — the X/Z footprint spacing. A brick's `position` in the data model above is in studs.
- `PLATE_HEIGHT = 0.4` — a plate's height.
- `BRICK_HEIGHT = PLATE_HEIGHT * 3 = 1.2` — a brick is 3 plates tall.

These ratios match real LEGO proportions (8mm stud pitch : 3.2mm plate height = 1 : 0.4), just scaled to a stud = 1 world unit.

- `GRID_SIZE = 32` — baseplate footprint, in studs.

## Cut for v1

Full brick catalog, physics-accurate collision, auto-generated instructions, multiple sets, touch/mobile input, save/load accounts. See build plan for details.
