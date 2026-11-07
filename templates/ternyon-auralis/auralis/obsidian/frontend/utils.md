---
tags: [frontend, stable]
updated: 2026-07-26
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

## `scroll-progress.ts`

`getScrollProgress(): number` — scroll progress `0 → 1` through the pinned scene sequence,
**measured at most once per frame** however many callers ask. *(Not pure — it caches, and it lazily
attaches a `ResizeObserver`.)*

Six rAF loops need this number every frame (the four `ScrollFade`s, `HeroLights`, `ParticleScene`) and
each used to compute it itself from `documentElement.scrollHeight` — a **forced synchronous layout**,
interleaved with those same loops' spring style writes, i.e. **layout thrashing** on every frame of
every scroll. Now `scrollHeight` is measured **once** (a `ResizeObserver` on `documentElement`
invalidates it; the page height is fixed by the sequence spacer) and the result is memoised **per
frame** via `document.timeline.currentTime`, which is constant within a frame — so one `scrollY` read
serves every caller. Measured **6 → 0** `scrollHeight` reads per frame.

Callers still run their own rAF; this only dedupes the measurement. **Rule:** nothing on a per-frame
path may measure layout itself — see [[decisions-log#ADR-0029 — No forced layout root style writes or no-op effects in per-frame paths|ADR-0029]]
and [[components/common]].

## `math.ts`

| Function | Purpose |
|----------|---------|
| `transformRange(value, min, max, newMin, newMax)` | remap a value between ranges (clamped) |
| `lerp(start, end, t)` | linear interpolation |
| `debounce(...)` | debounce helper (used by `useWindowSize`) |

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

## Adding a util

Keep utilities **pure** and side-effect-free (server-only ones like `isBot` are the
exception — note it clearly). Group by domain under `utils/<domain>/`.

## Related

[[hooks]] · [[seo-metadata]] · [[smooth-scroll]]
