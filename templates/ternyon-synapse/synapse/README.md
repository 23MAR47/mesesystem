# Synapse

A scroll-driven landing page in the spirit of the reference recording — same
grammar (a hero that tips away, a 3D card reel, a particle field, a horizontal
work rail, a parallax mosaic, a chrome closing panel), its own copy, palette
and geometry.

```
npm run dev      # http://localhost:3000
npm run build
```

## Stages

| Stage | Height | What moves |
| --- | --- | --- |
| `hero` | 240vh | The whole hero tips back and recedes as one CSS 3D plane; the media card floats against it |
| `reel` | 340vh | Six cards on a CSS 3D cylinder turn a full revolution; a giant marquee runs behind them |
| `neural` | 340vh | WebGL point cloud, ring → sphere → vortex, with the headline split into opposite corners |
| `work` | 380vh | Vertical scroll drives a horizontal rail of project cards |
| `mosaic` | 260vh | Tiles drift at rates set by one depth value per tile |
| `cta` | 170vh | Procedural chrome star, analytic studio environment, no HDRI |

## Architecture

- `lib/state.ts` — one mutable `view` object shared by the scroll layer and the
  render loop. Nothing here is React state; the tree never re-renders while the
  page moves.
- `components/ScrollEngine.tsx` — owns Lenis, measures every stage, and writes
  each stage's transforms as inline styles once per frame. Renders `null`.
- `components/three/Scene.tsx` — one fixed transparent canvas holding both 3D
  subjects. Each gates itself on its own **pin** window, so neither can paint
  over a neighbouring section.
- `lib/shapes.ts` — the cloud's three shapes, generated once from a seeded PRNG
  into `Float32Array` pairs; the morph itself happens in the vertex shader.
- `lib/star.ts` — the four-point star as a superellipse (`p = 0.55`) inflated
  along Z, wrap column indexed back to column zero, both poles welded.
- `lib/art.ts` — every image on the page is a hand-authored gradient stack, so
  there are no binary assets to load or license.

## Notes

- No postprocessing pass: the canvas composites over real DOM, and bloom on a
  transparent target lifts the alpha of everything it touches. The point
  sprite's own halo + core profile carries the glow instead.
- DPR is capped at 1.75 (1.35 above DPR 2) — these scenes are fill-rate bound.
- `prefers-reduced-motion` takes a separate path: no Lenis, no idle drift, no
  intro tween, reveals set to their end state.
