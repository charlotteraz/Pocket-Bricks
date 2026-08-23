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

See `src/lib/types.ts`:

```ts
type BrickType = 'brick1x1' | 'brick1x2' | 'brick1x4' | 'brick2x2' | 'brick2x3' | 'brick2x4'

type Brick = {
  type: BrickType
  position: [number, number, number] // world units, see below
  rotation: 0 | 90 | 180 | 270 // degrees about Y
  color: string
}

type Build = Brick[] // useBuildStore's `bricks` array
```

`position` is a brick's footprint min-corner: x/z in studs, y at the base of its stack layer (multiples of `BRICK_HEIGHT`). Brick geometry (`src/components/bricks/Brick.tsx`) is built local-origin-at-corner to match.

Shape defs (footprint in studs, per type) live in `src/lib/bricks.ts`. Rotation is **not** a mesh transform — since a box with a symmetric grid of round studs looks identical either way, `effectiveFootprint()` just swaps `studsX`/`studsZ` when `rotation` is 90 or 270. That function is the single place both the ghost and placed-brick rendering read footprint from, so it must stay in sync with anything that reasons about occupied cells (occupancy, below).

Color swatches are a fixed 6-color set in `src/lib/colors.ts`.

## Stacking & occupancy

`src/lib/occupancy.ts` tracks which `(x, layer, z)` unit cells are claimed — one Zustand-derived `Set<string>` built fresh from `bricks` each render (`useMemo` in `BuildScene`), not stored separately. `layer` is `y / BRICK_HEIGHT` rounded to an integer stack level. `hasCollision()` is the single gate `BuildScene`'s `tryPlace()` checks before calling `addBrick` — nothing else should call `addBrick` directly.

There's no manual bounding-box raycast math: every placed brick renders an invisible full-volume collider alongside its visible mesh (`src/components/BuildScene.tsx`), so three.js's own nearest-hit raycasting resolves "what's under the cursor" — the ground plane, or whichever brick is topmost/frontmost at that pixel. Hitting a brick's collider (any face) always means "stack on the layer above that brick," never "land inside it" — you can't click through a brick to its own occupied cell, so occupancy collisions only arise when a *wider* footprint, anchored at an open cell, overlaps a neighboring occupied cell at the same layer.

Verified: `hasCollision`/`buildOccupancy` pure-logic checks (same-cell block, cross-layer and disjoint-cell pass, wider-footprint overlap detection) and stacking (ghost renders on top of a placed brick, one layer up) were confirmed via Playwright against the running dev server.

## Grid units

Defined in `src/lib/grid.ts` — import from there rather than hardcoding.

- `STUD = 1` world unit — the X/Z footprint spacing. A brick's `position` in the data model above is in studs.
- `PLATE_HEIGHT = 0.4` — a plate's height.
- `BRICK_HEIGHT = PLATE_HEIGHT * 3 = 1.2` — a brick is 3 plates tall.

These ratios match real LEGO proportions (8mm stud pitch : 3.2mm plate height = 1 : 0.4), just scaled to a stud = 1 world unit.

- `GRID_SIZE = 32` — baseplate footprint, in studs.

## Cut for v1

Full brick catalog, physics-accurate collision, auto-generated instructions, multiple sets, touch/mobile input, save/load accounts. See build plan for details.
