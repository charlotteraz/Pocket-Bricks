# Pocket Bricks — Build Plan

> Portfolio project build plan. A scoped-down, browser-based LEGO builder: one small fixed set, drag-to-place bricks, and playback instructions — built to actually ship, not to out-build Mecabricks.

## The constraint that makes this buildable

No open brick library, no physics engine, no auto-generated instructions. One set (~30–80 pieces), five or six brick shapes, and instructions that are just your own placement order played back. That's what turns a multi-year product into a two-to-four-weekend portfolio piece.

## The Stack

Chosen for two things: strong AI-assistant familiarity, so vibe-coding stays fast and unstuck, and a free, git-connected path to a live link.

| Role | Tool | Why |
|---|---|---|
| Scaffold | Vite + React + TS | Fast dev server, near-universal AI-tool fluency, zero config wrestling. |
| 3D render | three.js + @react-three/fiber + drei | R3F wraps three.js in React components; drei supplies OrbitControls, lighting and environment helpers. |
| App state | Zustand | One small store for placed bricks, active palette selection, and the instructions step index. |
| Geometry | Hand-built primitives | Box + cylinder meshes parametrized by stud count — no imported assets, no LEGO CAD licensing questions, only 5–6 shapes needed. |
| UI chrome | Tailwind CSS | Palette panel, swatches, step controls — fast to style, easy for an assistant to generate consistently. |
| Data model | One ordered JSON array | `{ type, position, rotation, color }[]` — the same list is both "the set" and the instruction step order. |
| Hosting | Vercel | Git-connected, free, instant preview URLs per commit — deploy the empty shell on day one. |
| AI coding tool | Claude Code or Cursor | Keep a short spec file in the repo describing grid units and data shape to keep the assistant consistent across sessions. |

## Build Order

Sequenced so the hardest mechanic — stacking bricks on top of other bricks — gets tackled early, while the scope is still small, rather than surfacing as a surprise after content and polish are already invested.

### 0 · Setup & scaffolding — easy · ~1 evening

- Vite + React + TypeScript scaffold; install three, @react-three/fiber, @react-three/drei, Tailwind, Zustand
- Bare canvas rendering with OrbitControls and a ground plane
- Push to GitHub and deploy the empty shell to Vercel immediately

**WHY NOW** A live URL from day one means every future commit is a visible, shareable improvement — useful for momentum and for showing process later.

### 1 · Grid & camera — easy–medium

- Fix the brick coordinate system — pick a stud unit size and a plate-height ratio (1 brick = 3 plates) and write it down
- OrbitControls with constrained polar angle so the camera can't go under the baseplate
- Draw a reference grid on the baseplate

### 2 · One brick, click-to-place — medium

- Raycast from pointer to the grid plane; snap to the nearest stud cell
- Ghost preview of the brick before commit; click to place
- Placed bricks live in the Zustand array

**WHY NOW** This is the core mechanic in miniature. Getting one brick type working end to end proves the whole interaction model before adding variety.

### 3 · Palette, color, rotation — medium

- Side panel listing 5–6 brick shapes and a small color swatch set
- Selecting a palette item swaps the active ghost brick
- A key or button rotates the active ghost in 90° steps

### 4 · Stacking & collision — hardest step, budget slack

- Raycast against placed-brick bounding boxes, not just the ground plane, so bricks can land on top of each other
- Basic occupancy check so two bricks can't claim the same cell

**WHY NOW** Everything after this point — the actual set, instructions playback, polish — depends on placement being solid. Better to hit this wall in week one than week three.

### 5 · Design the fixed set — easy, but unhurried

- Away from code: design one real build (30–80 pieces) — a car, a flower, a small turret — inside your own tool
- Record the final `{type, position, rotation, color}` for every brick, in the order you'd want someone to build it

**WHY NOW** That ordered list is content now and instruction data later — no separate authoring step required.

### 6 · Instructions playback — medium

- "Build mode": step counter, next / previous, camera auto-frames the incoming piece
- Already-placed steps render solid; the current step's target renders as a ghost

**WHY NOW** This reuses phase 2–4's rendering — it's just replaying phase 5's data instead of accepting free clicks.

### 7 · Polish pass — easy–medium · don't skip

- Glossy plastic material (clearcoat) and soft studio lighting — the single biggest visual upgrade for the least effort
- A snap sound and a small scale-bounce on placement
- A start screen and a finish state for the completed set

### 8 · Ship the case study — easy

- Final deploy to Vercel; record a short clip of building the set start to finish
- Write the portfolio note: the constraint you chose and why, what was hardest (stacking), what you'd add with more time

## Cut For v1

Real LEGO-builder features, deliberately left out so the project stays shippable. Good material for a "what's next" line in the case study.

| Feature | Cut down to |
|---|---|
| Full brick catalog | Five or six shapes only, not the hundreds LEGO actually makes. |
| Physics-accurate collision | Simple cell occupancy, not real clutch-power simulation. |
| Auto-generated instructions | Recorded build order instead of algorithmic step inference. |
| Multiple sets | One fixed model, not a builder for arbitrary creations. |
| Touch / mobile input | Desktop pointer input only for v1. |
| Save / load accounts | No backend — the build resets on refresh. |

## Rough Timeline

Two to four weekends end to end for one person vibe-coding, if the scope above holds. Phase 4 (stacking) is the one place worth padding — everything else is close to its estimate.
