---
tags: [frontend, stable]
updated: 2026-09-02
---

# Catalog — Utilities

Pure helper functions in `src/utils/` (no side effects, unless noted).

## `is-bot.ts`

`isBot(): Promise<boolean>` — **server-only**. Reads the `user-agent` header,
returns `true` for crawlers/audit tools. Used to skip heavy animation for bots.
See [[seo-metadata]].

## `scroll-to.ts`

`scrollTo(id?, immediate?)` — programmatic scroll to an element id (string) or a
numeric position. Integrates with the Lenis [[smooth-scroll|scroll store]];
temporarily disables scroll state during the animation. Has `//if lenis` guards so
the Lenis dependency can be stripped if smooth scroll is removed.

## `math.ts`

| Export | Purpose |
|--------|---------|
| `SpringValues` | `Record<string, string \| number>` — the shape `from`/`to` take on every spring component |
| `transformRange(value, min, max, newMin, newMax)` | remap a value between ranges (clamped) |
| `lerp(start, end, t)` | linear interpolation |
| `debounce(fn, delay)` | debounce helper — **currently unused**; `useWindowSize` has its own inline timer |
| `interpolate(from, to, progress)` | interpolate a whole `SpringValues` bag, preserving CSS units and transform functions (`"10px"`, `"45deg"`, `"translate(10px)"`) |

`interpolate` is the scrub engine's workhorse — [[hooks|useSpringTrigger]] calls it
every frame in `mode="scrub"`. It is the one util inside the animation hot path, so
changes here are felt everywhere.

> [!note] Typed in the 2026-08-18 pass
> These signatures used `any` (a hard rule #7 violation, caught by
> `.claude/scripts/verify.sh` on its first run). `interpolate` now takes and
> returns `SpringValues`, which is exactly what its only caller already declared;
> `extractNumber` takes `unknown` and narrows by `typeof`; `debounce`'s generic
> constraint uses `(...args: never[]) => void`, the strict-safe idiom for
> "any function". No runtime behaviour changed.

## `lvh.ts`

CSS-string builders for viewport-height units with fallbacks
(`vh` → `lvh` → `calc(var(--vh) …)`): `heightLvh`, `minHeightLvh`, `marginTopLvh`,
`marginBottomLvh`. Solves mobile-browser viewport-height inconsistencies.

## `animation/coords.ts`

Element-coordinate helpers — `getElementCoords`, `getScrollCoordsFromElement` —
used internally by the scroll/animation system. Marked `@ts-nocheck`. `#do-not-modify`

## `seo/generate-page-metadata.ts`

`generateMetadata(props?)` — shared page-`Metadata` builder. `generateViewport()`
— the `Viewport` export (carries `themeColor`). See [[seo-metadata]].

## `seo/structured-data.ts`

`getSiteStructuredData()` — builds the `Organization` + `WebSite` JSON-LD graph
rendered by the root layout. See [[seo-metadata]].

> [!note] Scene modules live in `lib/`, not `utils/`
> `src/lib/scene/` holds the 3D layer — `device.ts` (tier, DPR clamp, frame
> budget, texture ceiling, shadow/pointer gates), `scene.config.ts` (every
> tuning constant),
> `model-scene.ts` (the renderer), `scene-shader.ts` (the GLSL injected into
> every patched material), `brush.ts` (the pointer stroke's object-space
> ring buffer) and `coarse-wireframe.ts` (the grid-welded topology).
>
> `word-model.ts` fetches the word the bust becomes — an authored, Draco-packed
> asset — and returns its **parts**, each with the node's own **pivot**, baking
> the centring and the fit into the positions, so object space is the space the chrome's fill
> level is measured in. `sourceFromJunctions` (also here) gives each of the
> word's junctions a junction on the bust to fly from. It does **not** build the
> lattice: `buildCoarseWireframe` does that, exactly as it does for the bust,
> which is what makes the morph map like to like. ADR-0047.
>
> It replaced `text-cloud.ts`, which manufactured letters from a font — canvas
> raster, coverage grid, isoline snap, extrusion, bevel. All of that existed to
> produce a 3D object out of type; none of the effect depended on it.
>
> `buildCoarseWireframe` returns **two** geometries, `{ lines, points }`, plus
> `junctions` and `lineJunction`: the
> surviving edges, and the deduplicated cells those edges meet at. Both come off
> the same weld on purpose — that is what puts a junction spark exactly on a
> junction. ADR-0035.
>
> `src/lib/gallery/gallery.config.ts` is the same idea for the work gallery: the
> cylinder's radius, angle step and perspective, plus the scroll runway's spans.
>
> The tide field lives inside the scene rather than beside it: its GLSL is a
> chunk in `scene-shader.ts` and its numbers are `sceneConfig.tideField`. See
> [[components/common]], [[decisions-log]] ADR-0031 (why it is inside) and
> ADR-0034 (the Kindle fire front that now fills it). `model-scene.ts` carries a
> **second** pointer follower for that field alone — the tilt wants a settled
> position, the field wants a heading.
>
> `device.ts` caps desktop DPR at **1.25**, below the 1.5 the starter's other
> scenes use — that field is a per-pixel noise walk and fill goes with the square
> of the ratio. Do not raise it back without re-measuring. ADR-0033. Mobile is
> **also** 1.25, and for the opposite kind of reason: this scene paints display
> type into the framebuffer, so the framebuffer is that type's resolution
> (ADR-0112).
>
> `textureLimit(tier)` caps a model texture's longest edge — 1024 mobile, 1536
> tablet, the author's own resolution on desktop. A texture costs its **decoded**
> size in VRAM whatever it weighed on the wire: this model's three 2048² maps
> arrive from an 818KB Draco'd GLB as **67.8MB**, and the cap measured that down
> to 20MB. ADR-0118.
> They are stateful and hold GPU resources, so they are `lib/` by
> [[folder-structure]]'s rule, not pure utilities. See [[optimize-3d-scene]] and
> [[decisions-log]] ADR-0023.

## Adding a util

Keep utilities **pure** and side-effect-free (server-only ones like `isBot` are the
exception — note it clearly). Group by domain under `utils/<domain>/`.

## Related

[[hooks]] · [[seo-metadata]] · [[smooth-scroll]]
