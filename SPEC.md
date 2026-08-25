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

## Modes, playback, and set data

`useBuildStore.mode` is `'edit'` (free placement, phases 2–4) or `'playback'` (phase 6 instructions). `App.tsx` swaps the `Palette` panel for `PlaybackControls` based on it. Playback doesn't have its own data — it steps through the *same* `bricks` array in placement order (`step` indexes into it): steps before `step` render solid, `bricks[step]` renders as a ghost, `step === bricks.length` is the finished state. This means playback works on whatever's currently in the store, live-built or imported — there's no separate "instructions" format.

`src/lib/io.ts` exports/imports that `bricks` array as JSON (`downloadBuild` / `parseBuild`), wired to Export/Import buttons in `Palette`. This is how phase 5's actual design work gets captured as durable content — since there's no backend (see Cut for v1), build the set in the browser, then **Export** and commit the resulting JSON somewhere durable (e.g. `src/data/set.json`, loaded at startup) once it's final. Import exists so that file can be reloaded for further editing.

`CameraFramer.tsx` lerps the `OrbitControls` target toward the current playback step's brick center each frame; it's a no-op in edit mode so it never fights the builder's manual camera control.

## Polish

- **Material/lighting**: `Brick.tsx` uses `meshStandardMaterial` (roughness 0.3, metalness 0.05) for a glossy-plastic sheen. A `meshPhysicalMaterial` clearcoat was tried first per the plan's wording, but clearcoat needs environment reflections to read correctly — without one it just washes the base color out under plain directional lights, and a procedural (no-CDN) environment via three's `RoomEnvironment`/`PMREMGenerator` didn't fix that within a reasonable tuning budget. Standard material at low roughness gives a convincing sheen without that failure mode. Lighting is one shadow-casting key light plus two dim fill/rim lights and ambient (`Scene.tsx`); `ContactShadows` (drei) grounds the bricks with a soft local shadow, no HDR/CDN dependency either.
- **Snap + bounce**: `src/lib/sound.ts` synthesizes a short click via the Web Audio API (no audio asset). `PlacedBrick.tsx` plays a one-shot scale-bounce whenever it *mounts* — which happens for a genuinely new brick appended in edit mode, or a newly-revealed solid brick when stepping forward in playback (both use stable `key={i}`, so already-existing indices never remount). Sound is triggered explicitly at the two placement call sites (`BuildScene.tryPlace`, `PlaybackControls`' Next) rather than tied to mount, so a bulk `loadBricks` import doesn't fire a stampede of sounds — the bounce animation is harmless in bulk, but N simultaneous clicks would not be.
- **Start/finish**: `started: boolean` in the store gates a `StartScreen` overlay shown until dismissed (`App.tsx`). The playback "Build complete" state (added in phase 6) got a green highlight and checkmark as the finish-state polish.

## The fixed sets

`src/data/sets/*.json` hold three fixed sets (phase 5, later widened from the plan's original "one fixed set" scope to let users pick between builds): a striped **lighthouse** with an attached keeper's cottage (43 bricks), a blocky **car** (19 bricks), and a **flower** in a pot (19 bricks). All three use only the 6 box-brick shapes — no slopes or curves in the catalog — so recognizability leans on color: the lighthouse uses banding (white/red courses, a black gallery, a blue "glass" lantern, a yellow beacon), the car uses black corner bricks as wheel stubs plus a blue windshield and yellow headlights, and the flower is a green stem/leaf column topped with a 3x3 plus-shaped head of red and yellow petal bricks.

`src/data/sets.ts` exports `SETS: {id, name, bricks}[]`, the registry both the store and the UI read from. Each layout was authored as data (hand-placed stud coordinates) rather than by clicking through the UI, then verified against the app's real `effectiveFootprint`/occupancy math (via a headless import of `src/lib/bricks.ts` and `src/lib/grid.ts`) to confirm zero collisions and zero out-of-baseplate placements before being adopted into `sets/`. Placement order in each array is that set's instruction order.

`useBuildStore` tracks `activeSetId` alongside `bricks`; `loadSet(id)` swaps in a set's bricks and mode/step reset, while manually placing/removing a brick or importing a custom file clears `activeSetId` (the bricks no longer necessarily match a registered set). `Palette` renders a "Set" picker above the brick palette from `SETS`, highlighting whichever id is active. The app boots on `SETS[0]` (the lighthouse).

`resolveJsonModule` is on in `tsconfig.app.json` so these JSON imports type-check.

## Grid units

Defined in `src/lib/grid.ts` — import from there rather than hardcoding.

- `STUD = 1` world unit — the X/Z footprint spacing. A brick's `position` in the data model above is in studs.
- `PLATE_HEIGHT = 0.4` — a plate's height.
- `BRICK_HEIGHT = PLATE_HEIGHT * 3 = 1.2` — a brick is 3 plates tall.

These ratios match real LEGO proportions (8mm stud pitch : 3.2mm plate height = 1 : 0.4), just scaled to a stud = 1 world unit.

- `GRID_SIZE = 32` — baseplate footprint, in studs.

## Cut for v1

Full brick catalog, physics-accurate collision, auto-generated instructions, touch/mobile input, save/load accounts. See build plan for details. (Multiple sets, originally cut here, was added later — see "The fixed sets" above.)
