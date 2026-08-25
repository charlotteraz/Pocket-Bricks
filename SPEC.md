# Pocket Bricks — Spec

Browser-based LEGO builder: one fixed set (~30–80 pieces), 5–6 brick shapes, drag-to-place, instructions playback. See `Pocket-Bricks-Build-Plan.docx` for the full build plan and phase-by-phase order.

## Stack

- Vite + React + TypeScript
- three.js + @react-three/fiber + @react-three/drei (Canvas, OrbitControls)
- Zustand (app state)
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Hand-built shape geometry (box/cylinder primitives plus custom `BufferGeometry` for angled shapes) — no imported assets
- Hosting: Vercel

## Data model

One ordered array is both "the set" and the instruction step order:

See `src/lib/types.ts`:

```ts
type ShapeId = 'brick1x1' | 'brick1x2' | 'brick1x4' | 'brick2x2' | 'brick2x3' | 'brick2x4'
  | 'slope2x2' | 'wedge2x3'

type Brick = {
  type: ShapeId
  position: [number, number, number] // world units, see below
  rotation: 0 | 90 | 180 | 270 // degrees about Y
  color: string
}

type Build = Brick[] // useBuildStore's `bricks` array
```

`position` is a piece's footprint min-corner: x/z in studs, y at the base of its stack layer (multiples of `BRICK_HEIGHT`). Shape geometry (`src/components/bricks/Brick.tsx`) is built local-origin-at-corner to match.

## Shape registry

`src/lib/bricks.ts` is a shape registry, not a hardcoded list of boxes: `SHAPES: ShapeDef[]` is a config array, one entry per shape --

```ts
type ShapeDef = {
  type: ShapeId
  studsX: number
  studsZ: number
  heightInPlates: number // 3 = a full brick's height; plates (later) will be 1
  hasStuds: boolean
  label: string
  buildGeometry: (studsX: number, studsZ: number, heightInPlates: number) => THREE.BufferGeometry
}
```

`buildGeometry()` always returns body geometry authored min-corner-anchored in the shape's *canonical* (rotation 0) orientation, spanning `[0, studsX*STUD] x [0, height] x [0, studsZ*STUD]`. For the six original brick shapes this is a translated `THREE.BoxGeometry`; adding a new box-shaped size is a one-line entry in `SHAPES`, nothing else.

**Slopes and wedges** (`src/lib/shapes/slope.ts`, `wedge.ts`) needed real custom geometry: a slope's height ramps linearly from 0 at the front edge to full height at the back (a roof-style angled top, no studs), and a wedge keeps full height but tapers in *plan view* from full width at the back to a point at the front (a triangular-prism footprint, still occupying its full rectangular bounding box for placement — same simplification real wedge plates use, and why occupancy didn't need to change for this pass). Both are built with `src/lib/shapes/geometryUtils.ts`'s `buildFacetedGeometry()`: you list each face as a simple ordered boundary walk (no need to get 3D winding order right by hand), and it auto-orients every face outward by checking whether its raw normal points toward the solid's centroid, flipping if so, before flat-shading and fan-triangulating. This was worth building once — hand-deriving correct CCW winding for a 6-faced custom solid by cross-product sign-checking is exactly the kind of thing that's easy to get subtly wrong with no live rendering feedback loop (Playwright screenshots are the only feedback here), and the auto-orientation approach turns that into "just describe the shape."

**Rotation is a real transform**, not the footprint-dimension-swap trick the original 6 box shapes used to get away with (a box with a symmetric stud grid looks identical whether you rotate the mesh or just rebuild it with swapped width/depth — that trick silently breaks for anything asymmetric, like a slope's angled face or a wedge's point). `Brick.tsx`'s `rotationTransform()` rotates the canonical geometry around the local Y axis by the piece's `rotation`, then translates it so the *rotated* footprint's own min corner still lands back at local `(0,0,0)` — derived by rotating the four canonical footprint corners through three.js's standard Y-rotation matrix and re-deriving the new bounding min per rotation (worked example in that file's comment). This is why a 4-slope test (one at each rotation) forms a clean staircase with the ramp pointing a different way each time, verified via Playwright screenshot.

`effectiveFootprint()` in `bricks.ts` is unrelated to that visual transform — it only answers "which cells does the rotated footprint occupy," by swapping `studsX`/`studsZ` at 90°/270° (still correct for every shape, since rotating a rectangle's *bounding box* by 90° always swaps its extents regardless of what's drawn inside it). That function is the single place both the ghost and placed-piece code read footprint from for occupancy, so it must stay in sync with anything that reasons about occupied cells (occupancy, below) — verified unaffected by this pass via the existing `hasCollision`/`buildOccupancy` checks plus new cases for the two new shapes' footprint-swap and cross-shape collision.

Deferred to a later pass (per the roadmap this followed): cylinders/cones/arches, which have round or irregular footprints and need occupancy generalized from "one grid cell" to "each shape declares its own occupied cells"; and plates/tiles, which need `heightInPlates` to actually vary (right now every shape, including the slope/wedge, is `heightInPlates: 3`, so `occupancy.ts`'s one-layer-per-piece assumption is still exactly true).

Color swatches are a fixed 6-color set in `src/lib/colors.ts`.

## Stacking & occupancy

`src/lib/occupancy.ts` tracks which `(x, layer, z)` unit cells are claimed — one Zustand-derived `Set<string>` built fresh from `bricks` each render (`useMemo` in `BuildScene`), not stored separately. `layer` is `y / BRICK_HEIGHT` rounded to an integer stack level. `hasCollision()` is the single gate `BuildScene`'s `tryPlace()` checks before calling `addBrick` — nothing else should call `addBrick` directly.

There's no manual bounding-box raycast math: every placed brick renders an invisible full-volume collider alongside its visible mesh (`src/components/BuildScene.tsx`), so three.js's own nearest-hit raycasting resolves "what's under the cursor" — the ground plane, or whichever brick is topmost/frontmost at that pixel. Hitting a brick's collider (any face) always means "stack on the layer above that brick," never "land inside it" — you can't click through a brick to its own occupied cell, so occupancy collisions only arise when a *wider* footprint, anchored at an open cell, overlaps a neighboring occupied cell at the same layer.

Verified: `hasCollision`/`buildOccupancy` pure-logic checks (same-cell block, cross-layer and disjoint-cell pass, wider-footprint overlap detection) and stacking (ghost renders on top of a placed brick, one layer up) were confirmed via Playwright against the running dev server.

**Click vs. drag**: OrbitControls and `BuildScene`'s own pointer handlers listen on the same underlying pointer events, so an orbit/pan drag that starts and ends over the plate used to also register as a placement click — no drag threshold, so dragging the camera around could silently drop a brick. `BuildScene` now records screen-space `clientX/clientY` on `onPointerDown` (both the ground plane and every brick collider) and compares it to the position at `onClick`; only a move under `DRAG_THRESHOLD_PX = 6` counts as a real click. Verified via Playwright: a 200px orbit-drag over the plate leaves the brick count unchanged, while a stationary click still places.

## Undo/redo

`useBuildStore` keeps `undoStack`/`redoStack: Brick[][]` — whole-array snapshots rather than diffs, since a set's bricks list is small enough that this is cheap. `addBrick`, `loadBricks` (import), and `loadSet` (switching the reference, which clears the plate) all push the *previous* `bricks` onto `undoStack` and clear `redoStack` before applying their change; `undo`/`redo` pop one stack, push the current `bricks` onto the other. `Palette` has Undo/Redo buttons (disabled when their stack is empty); `BuildScene`'s existing edit-mode keydown handler also listens for Ctrl/Cmd+Z (undo) and Ctrl/Cmd+Shift+Z (redo).

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

`useBuildStore` tracks `activeSetId` separately from `bricks` and deliberately never copies a set's bricks onto the plate: `loadSet(id)` sets `activeSetId` and *clears* `bricks` to `[]` (plus a mode/step reset), so picking a set hands you a fresh plate and a reference to build toward, not the finished thing. `SetPreview.tsx` is the reference itself — a second, independent `<Canvas>` (its own small scene, not connected to the main build scene or its controls) that renders the active set's bricks fully built and slowly auto-rotates them, framed by a bounding-box computed per set. It sits in a small fixed panel (top-right) alongside `Palette`'s "Set" picker (top-left), both visible only in edit mode. Manually placing bricks or importing a file no longer touches `activeSetId` — the reference and the plate are fully decoupled, so `activeSetId` just means "which reference is currently shown," not "the plate matches this set." The app boots on `SETS[0]` (the lighthouse) as the reference, with an empty plate.

The reference panel has two escalating ways to get a better look: hovering grows it in place (a CSS width/height transition, same auto-rotating non-interactive `ReferenceScene`), and clicking opens it in a centered modal at a much larger size with real `OrbitControls` (drag to rotate, scroll to zoom) instead of auto-rotate. `ReferenceScene` is shared between the two so framing math isn't duplicated; the modal can't be left open across a set switch because its own backdrop (`z-30`) sits above the Set picker (`z-10`) and blocks it.

`resolveJsonModule` is on in `tsconfig.app.json` so these JSON imports type-check.

**Camera range**: `OrbitControls` in `Scene.tsx` was tuned against the earlier auto-loaded lighthouse and turned out too tight once building started from an empty plate at the default camera distance — `minDistance`/`maxDistance` are now `1.5`/`120` (up from `3`/`40`) for close-up detail work and full-model overview shots alike, with `zoomSpeed={1.4}` so fewer scroll notches are needed to get there. Panning (`enablePan`, `screenSpacePanning`, `panSpeed={1.5}`) is explicit rather than relying on drei's defaults, since right-drag panning — including vertically, e.g. to look up a tall build like the lighthouse — is the main way to move the view target off center; orbit alone only rotates around whatever the current target is.

## Grid units

Defined in `src/lib/grid.ts` — import from there rather than hardcoding.

- `STUD = 1` world unit — the X/Z footprint spacing. A brick's `position` in the data model above is in studs.
- `PLATE_HEIGHT = 0.4` — a plate's height.
- `BRICK_HEIGHT = PLATE_HEIGHT * 3 = 1.2` — a brick is 3 plates tall.

These ratios match real LEGO proportions (8mm stud pitch : 3.2mm plate height = 1 : 0.4), just scaled to a stud = 1 world unit.

- `GRID_SIZE = 32` — baseplate footprint, in studs.

## Cut for v1

Full brick catalog, physics-accurate collision, auto-generated instructions, touch/mobile input, save/load accounts. See build plan for details. (Multiple sets, originally cut here, was added later — see "The fixed sets" above.)
