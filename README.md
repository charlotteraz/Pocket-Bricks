# Pocket Bricks

A scoped-down, browser-based LEGO builder: one small fixed set, drag-to-place bricks, and playback instructions.

See [`BUILD_PLAN.md`](./BUILD_PLAN.md) for the full phase-by-phase plan and [`SPEC.md`](./SPEC.md) for the data model and stack decisions.

## Stack

Vite + React + TypeScript, three.js via `@react-three/fiber` + `@react-three/drei`, Zustand for state, Tailwind CSS v4.

## Getting started

```bash
npm install
npm run dev
```

## Status

Phase 0 — scaffolding: bare canvas with `OrbitControls` and a ground plane.
