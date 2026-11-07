---
tags: [frontend, components, project, wip]
updated: 2026-05-31
project: negentropy
sections: 6
---

# Components — `src/views/negentropy/`

Feature-scoped components for the [[projects/negentropy/concept|NEGENTROPY]]
WebGL scroll narrative. All live under `src/views/negentropy/` per the
"next to the feature" rule in [[component-conventions]]. R3F components are
mounted via `next/dynamic` with `ssr: false` per
[[decisions-log]] ADR-0013.

**Route:** `/` (`src/app/page.tsx` delegates to `NegentropyView`). The page
is the site's home route.

**Typeface — single family.** As of v0.5 the negentropy page uses the
system stack (`-apple-system, "Helvetica Neue", Helvetica, system-ui,
Arial, sans-serif` via `--font-system`) for **everything** — brand,
headline, body, labels, loader, biomarkers. The `font-system` Tailwind
utility is set on `main[data-scroll-narrative]` so children inherit.
Italic styling for the hero's "is" comes from per-letter
`fontStyle: italic` in `HeadlineLines`. Unbounded is no longer used on
this page.

**Loader cadence (`loader-flow-field.tsx`):** TextEngine is *not* used —
its programmatic exit requires `mode="manual"`, which is banned. Instead
a leaf `BeatLetters` component uses `useSprings` over the letter array,
remounted per beat via `key={beatIdx}`. Per beat:
1. Letters slide in from `x: 1rem → 0` with per-letter stagger
   (`letterStaggerMs = 22`, `letterDurationMs = 320`, `easeOutQuart`).
2. **No hold** — `holdMs = 0` by default, so the in-cascade rolls
   straight into the exit without a dead beat (changed from the
   previous `360 ms` pause).
3. Every letter — *no stagger, all together* — slides further left to
   `x: -2.25rem` and fades over `exitMs = 360` (`easeInQuart`).
4. The last letter's `onRest` advances `beatIdx`; the new beat mounts
   and the cycle replays.

All motion travels strictly right → left.

**Loader flow field:** larger curl features (FX 0.0028, FY 0.0034, step
2.4) and a `destination-out` per-frame erase at alpha `0.055` so old
strokes are erased cleanly rather than overlaying semi-opaque black into
a gray haze. The loader container wears `bg-negentropy-void` underneath
the canvas; canvas initial fill matches (`#050608`). The body keeps the
same bg via the `body:has(main[data-scroll-narrative])` rule, so the
page colour is constant across all three phases.

**Loader → scene → UI handover (`NegentropyClient`):** three-phase
state machine `"loading" | "scene-revealed" | "ui-revealed"`.
- `loading` — only the loader is mounted; nothing else exists in the DOM.
- `scene-revealed` — fires the **instant** the last loader sentence
  finishes exiting (`contentRevealDelayMs = 0`). Only the R3F `Scene`
  mounts; UI chrome stays unmounted. The user watches the nebula
  materialise *through* the loader's 1.5 s bg-fade.
- `ui-revealed` — fires when the loader's bg fade lands
  (`bgFadeMs = 1500`). Frame, BrandMark, NavJumplinks, and the section
  content mount — each runs its own Inview/Spring intro. Loader
  unmounts at the same moment.

Loader exposes `onReveal` (mount-content cue) and `onComplete`
(unmount-loader cue). `BeatLetters` guards `onExitComplete` with a
local `hasFired` boolean so the per-letter `onRest` callbacks resolve
to exactly **one** advance per beat — every sentence plays through.

**Loader text face:** system stack (`--font-system` →
`-apple-system, "Helvetica Neue", Helvetica, system-ui, Arial,
sans-serif`) at `clamp(1.6rem, 2.1vw, 1.9rem)` — manifesto-scale, not
a UI label. The brand display face (Unbounded) is reserved for the
page's section headings + brand mark.

**Loader beats:** three lines — `Every cell is falling apart. / Until
one refused. / Don't die.` (the methodology + thesis middle beats were
trimmed in v0.4 to halve the loader runtime). Stored in
`src/data/mocks/negentropy.ts` → `loaderBeats`.

## Component map

| File | Role | Notes |
|------|------|-------|
| `negentropy-client.tsx` | Top-level client wrapper. Owns scroll-progress ref + the three-phase state machine. Mounts loader / chrome / scene / sections as siblings (fragment) — the isolated UI stacking context was removed when the Frame matte was retired. | `"use client"`. Dynamic-imports `Scene`. |
| `scene.tsx` | R3F `<Canvas>` host. **`CameraRig` lerps between 7 scroll-anchored camera poses** + cursor parallax (damped). `camera.position.copy(targetPos)` (not lerp) so the camera lands **exactly** on the scroll-driven target every frame — Lenis already smooths the scroll. **§V (`p=0.83`)**: `pos (0, 0, 7) → look (0, 0, 0)` — straight along −Z at the storm. **§VI (`p=1.0`)**: `pos (0, 0, 5) → look (0, 0, 0)` — dolly two units forward *into* the storm's blow-up point, where the hourglass emerges. Hosts `MouseTracker` that writes the **world-space cursor** into a shared `Vector3` ref **and** a 0–1 **activity** scalar. **Bloom postprocessing** is back as of v0.20: `EffectComposer multisampling={0}` + `Bloom intensity 0.55, luminanceThreshold 0.4, luminanceSmoothing 0.08, mipmapBlur false`. The conservative settings combined with the 2× brightness pass on every shader give clean glow on particle cores without retripping the `WebGLRenderer: Context Lost` that killed earlier attempts. **Mobile performance budget (ADR-0017):** `Scene` derives `isMobile` from `useWindowWidth()` vs `springsConfig.mobileWidth` (768) and (a) passes `densityScale={0.49}` to every particle leaf (~half the particles — two compounded 30 % cuts) and (b) renders the `<EffectComposer>`/`<Bloom>` block only when `!isMobile`. Desktop keeps full count + bloom. | Wrapper `bg-negentropy-void` + `gl.alpha:false` + `onCreated` `setClearColor("#050608", 1)`. Canvas `dpr [1, 2]`, `antialias: true`. |
| `spiral-network.tsx` | **§I hero** — two-arm spiral of ≈80 k particles at fixed `position={[0, 2.5, 0]}`. Group spins on Y, accelerating through the §I fade. Brighter source colours (`#b3ffd6 / #a78cff`) + HSV `sat 0.75 / val 1.0`. Hard-edged points (`step(0.5)`), `gl_PointSize 8 × aScale`. Cursor-void repulsion. Renamed from `nebula-galaxy.tsx` in v0.13. | Opacity `1 − ramp(0.18, 0.32)`. Repel `radius 1.6 / strength 1.0`. |
| `molecule.tsx` | **§II/§III** centerpiece — **icosahedral atom cage** (12 atoms × 600 particles + 30 bonds × 60 thin particles ≈ 9 k, radius 3.0). Palette: atoms `#dcf7ff → #4cb8ff` (cyan core → vivid blue rim), bonds stored at `#808080` (half-brightness source, see fragment multiplier note). **Scroll-driven counter-Y-rotation**: `rotation.y = -p * Math.PI`. Internal particle wobble. **Two-stage forward drift**: zoom `ramp(0.18, 0.52) × 4.0` + fly-past `ramp(0.52, 0.71) × 14.0`. **Radial blow-up dissolve**: `aStartPos` is the particle's outward direction × `SCATTER_DISTANCE` + jitter. Cursor-void repulsion. | Master `assembly = ramp(0.18, 0.35) × (1 − ramp(0.52, 0.65))`. Per-particle `aDelay` 0 – 0.65. Repel `radius 1.9 / strength 1.2`. Bond tube radius `0.025`. **Fragment multiplier `× 4.0`** (double the house-style 2× pass) so the cyan/blue palette reads as luminous under bloom; bonds compensate via the halved source colour. |
| `red-storm.tsx` | **§IV/§V — last object in the scene.** Dense wobbling mass. **Flyby motion** from `(0, -2, 4)` at p=0.52 to **world origin `(0, 0, 0)`** at p=0.83 — reads as the storm rising up from below the viewer's eyeline and landing dead-centre. **Blow-up** at p=0.83 → 0.95. 50 k particles, radius 2.5, `uSize 38`. Palette: `#0aff7f → #3affd0 → #caffff` (bright green core → teal → bone rim), mixed with `smoothstep(rN, 0.25, 0.85)` for `deepRed → hotRed` and `(rN − 0.7) × 3` for `→ ember` — keeps the inner ~25 % purely on the deep green and pushes the bright bone rim to the outer crust only. (Variable names `deepRed` / `hotRed` / `ember` were retained when the palette shifted from the original red/hot/ember run for diff-friendliness.) | Opacity `ramp(0.52, 0.71)`. Blow-up `ramp(0.83, 0.95)`. Repel `radius 1.4 / strength 1.0`. **Fragment multiplier `× 4.0`** (double the 2× pass) so the storm reads as a luminous mass under bloom. |
| `starfield-close.tsx` | **Always-on travelling backdrop from §II → §VI.** 5 k bright cyan / violet / bone particles in a 24×16×30 box wrapping the entire camera path (every anchor stays well inside on all axes). **Endless +Z drift via `mod()`** — particles stream toward the camera and wrap, so the field reads as an infinite tunnel of starlight. **Scroll-driven speed**: baseline `1.4 + p × 3` gives a "we're going somewhere" feel that picks up as the user scrolls deeper; per-frame Δprogress × 80 (clamped at 6) adds an instant whoosh on active scroll gestures. `uSize = 36` (vs 22 in the §VI-only version) + wider `aScale` ceiling (≈3) so the field reads as a noticeable foreground layer, not background dust. Per-particle twinkle phase. Cursor repulsion at half storm strength. Distinct from the ambient `Starfield` (sparse static far sphere). | Opacity `ramp(0.16, 0.28)` (fades in across the §I→§II handover), then holds at 1.0 for the rest of the page. Repel `radius 1.2 / strength 0.6`. |
| `hourglass-galaxy.tsx` | **§VI emblem.** Two counter-rotating spiral funnels stacked on Y (top vortex direction +1, bottom -1) form a sand-timer figure. Ported from `obsidian/projects/negentropy/source/hourglass-galaxy.reference.js`. Reference palette `#ff6030 → #1b3984` preserved. 70 k particles **per funnel** (140 k total), `branches=3`, `randomness=0.5`. **Scaled down 2× vs. reference** (radius 2.5 / y-offset 2.5) so the figure frames inside the §VI camera at `pos (0, 0, 5) → look (0, 0, 0)`. Cursor-void repulsion. Originally built v0.1 for §I–§III, retired v0.10, brought back v0.17 per user request — the scene "we had at the beginning but it was lost." | Opacity `ramp(0.83, 0.95)` — emerges through the storm blow-up. Repel `radius 1.3 / strength 0.7`. |
| `starfield.tsx` | Ambient `THREE.Points` backdrop (sparse, distant sphere). | Static, no `useFrame`. Buffers built in effect. Source RGB doubled with hard `min(1, …)` clamp and material `opacity = 1.0` — part of the **2× brightness pass** that runs across every 3D scene. |
| `frame.tsx` | **Viewport frame — single 1 px rounded rectangle** (`z-31`). The "contrast carrier" from the IRIS_AI reference. The earlier knockout matte that masked UI at the perimeter has been removed; scroll-time overlap with the pinned chrome is now handled by `<ScrollFade>` on `Section` / `Hero` content. | `pointer-events-none`. **Responsive inset: `inset-4` (1 rem) on mobile, `sm:inset-8` (2 rem) ≥ 640 px** — matches the 640 px font-scaling breakpoint in `globals.css`. |
| `nav-jumplinks.tsx` | Section navigation with two presentations. **≥ sm:** fixed top-right stack of `↗` jumplinks (`#void` / `#entropy` / `#refusal` / `#universe` / `#choice` / `#persist`), `hidden sm:flex`. **< sm:** a burger toggle (`right-8 top-8`, `z-50`) that springs a full-screen overlay menu (`bg-negentropy-void/95`, `z-40`) open from `open` state. | Real `<a>`s — Lenis handles smooth scroll; tapping an overlay link closes the menu. Desktop stack at `right-16 top-16`. **Burger lines + overlay both animate via `<Spring mode="always" enabled={open}>`** (no CSS keyframes); the two burger lines spring from horizontal to a 45°/−45° X. `aria-expanded` on the button, `aria-label` toggles open/close. |
| `hero.tsx` | Corner-loaded §I layout. Bottom-left headline, bottom-right meta + body + outbound CTA pill (to Blueprint URL), bottom-center scroll arrow. Whole bottom cluster wrapped in `<ScrollFade>` so the headline fades cleanly as it scrolls into the chrome zone. CTA `href` comes from `content.cta.href`; the `↓` scroll cue still uses the in-page `nextHref`. | **Responsive padding:** `px-8 pb-8 pt-24` on mobile → `sm:px-16 sm:pb-16 sm:pt-32` → `md:pb-20 md:pt-40`. Body / scroll arrow at `text-base`; eyebrows + CTA label at `text-sm`. Scroll arrow is `hidden md:flex`. **Mobile (`max-sm:`):** eyebrow shrinks to `text-[0.625rem]` + `whitespace-nowrap` (one line); CTA pill is `whitespace-nowrap` + filled amber (`bg-negentropy-amber`, `text-negentropy-void`, `text-xs`). |
| `headline-lines.tsx` | Multi-line letter-by-letter reveal with italic + accent-word support. | One project `Spring mode="once"` per letter — deterministic, lands at `to` and stays. Used by `Hero`. |
| `loader-flow-field.tsx` | Full-bleed Canvas2D flow-field loader with 3-beat text cycle + 3-phase handover. | Uses `subscribeToTicker`. `BeatLetters` per beat (custom animator, not TextEngine). Manifesto text is **20 % smaller on mobile** (`max-sm:text-[clamp(1.28rem,1.68vw,1.52rem)]`) so each beat fits one line. |
| `brand-mark.tsx` | Fixed top-left wordmark `( NEGENTROPY )` + `[ DON'T DIE ]` badge. Holds the page's single `<h1>`. | Bracketed-label vocabulary. **`left-8 top-8` on mobile → `sm:left-16 sm:top-16`** (always 1 rem inside the responsive frame), `z-40`. Name `text-base`, badge `text-sm`. |
| `section.tsx` | **Corner-loaded section shell for §II–§VI** + a **`centered` variant** for §VI. Default layout uses a 12-col grid with **grid `align-self`** to anchor each column to its row bottom / top: heading column gets `md:self-end` (title at section bottom, the corner-loaded anchor), meta column gets `md:self-start` (eyebrow + body start at the top of the row = top of the heading). This replaces the earlier `flex justify-end / justify-start` chain, which was being overridden by the grid's default `align-items: stretch` and collapsing the columns to the same height. All content wrapped in `<ScrollFade>`. The **`children` slot renders under the heading** — §III uses it for the biomarker row, §VI for the final CTA. **Reveal vocabulary** unified with the hero title / loader — per-letter X-slide on heading, per-word X-slide on body, block-level X-slide on bracketed eyebrow + slot. **`flip` prop** swaps columns and applies `md:text-right` to the heading TextEngine; **`centered` prop** discards the grid entirely and stacks eyebrow / heading / body / slot vertically (used for §VI Persist). In the centred variant the body TextEngine carries `flex flex-wrap justify-center text-center` so words centre even if TextEngine renders them as flex children. | Props: `index`, `meta`, `heading`, `body`, optional `flip` / `centered` / `children`. **Responsive padding** matches `Hero`: `px-8 py-24` (centred) / `px-8 pb-8 pt-24` (grid) on mobile → `sm:px-16` … restores the desktop values. The 12-col grid is `md:`-gated, so mobile stacks single-column. The bracketed eyebrow shrinks on mobile (`max-sm:text-[0.625rem]` + `whitespace-nowrap`) — same treatment as `Hero`. |
| `biomarker-grid.tsx` | Slot for §III — Blueprint biomarker stats. **Inline rows** under the §III heading: bracketed amber value (`(1,977)`) sits next to a small uppercase label, one row per stat. Replaces the earlier stacked `value-above-label` cells that read as off-balance. Inherits the parent section's `text-align`. | Three rows, single Inview block X-slide each, staggered (120 ms apart, 500 ms base). Value type `clamp(1.125rem, 1.6vw, 1.4rem)`; label `text-sm`. **Value span is `min-w-[7ch] shrink-0 tabular-nums`** so labels after numbers of differing widths all start on the same vertical line. |
| `choice-cta.tsx` | Slot for §VI (Persist) — outbound link to `blueprint.bryanjohnson.com`. **Outlined-bone pill** matching the Hero CTA style exactly (same border / hover / typography) so the page's two outbound buttons read as a pair. Inview X-slide reveal (`from x: 24`), 800 ms delay so body lands first. | Native `<a target="_blank" rel="noopener noreferrer">`. `whitespace-nowrap`; **filled amber on mobile** (`max-sm:bg-negentropy-amber` + `text-negentropy-void`, smaller `text-xs` / tracking) — outlined-bone ≥ sm. |
| `use-scroll-progress.ts` | Just exports the `ScrollProgressRef` type (`RefObject<number>`). | Pass the ref *object* through props, never `ref.current`. |
| `scroll-fade.tsx` | **Smooth scroll-progress opacity fade** wrapper. Reads `getBoundingClientRect()` every RAF and computes `opacity = min(fadeOutAtTop, fadeInFromBottom)`. As the wrapper's top approaches the top zone (default 120 px from viewport top — clear of the chrome at `top-16`), opacity ramps 1 → 0; as the bottom rises into the viewport, opacity ramps 0 → 1. Used by `Hero` and `Section` so text doesn't overlap the pinned BrandMark / NavJumplinks while scrolling. Independent of the per-letter / per-word TextEngine reveals (those handle initial entrance; this layer handles smooth fade-out and fade-back-in). | Props: `topZone`, `topFade`, `bottomZone`, `bottomFade` (all px). **On mobile (≤ 640 px) the top zone is overridden to be viewport-relative** — `effTopZone = vh × 0.05`, `effTopFade = vh × 0.15` — so content stays fully visible until its top reaches 20 % of the viewport before fading (the px props were making it disappear too early on phones). **The bottom fade-in is also skipped on mobile (held at `1`)** so content is fully opaque the instant it enters from below; its per-letter `Inview`/`TextEngine` reveals animate the entrance instead of a wrapper-opacity ramp. |

## Conventions specific to this feature

- **Scroll → uniform.** `<ProgressTrigger>` writes the 0–1 scroll progress into
  the ref on every frame; R3F components read `progressRef.current` only
  inside `useFrame`. No React renders per scroll tick. See
  [[decisions-log]] ADR-0013.
- **Buffer construction.** Random particle data is generated in `useEffect`
  (React Compiler purity rules forbid `Math.random` in render path), stored
  in `useState`, disposed on unmount.
- **Material uniforms.** Set on the `<shaderMaterial ref={matRef}>`; mutated
  through `matRef.current.uniforms.X.value = ...` inside `useFrame`.
- **GLSL.** Currently inline as template strings. If the page grows, extract
  to `.glsl.ts` modules under `src/views/negentropy/shaders/`.
- **2× brightness pass.** Every shader scene multiplies its fragment
  `color` output by `2.0` before composing alpha; the ambient
  `starfield` doubles its source RGB with a hard `min(1, …)` clamp.
  Under additive blending this saturates dense fields harder so the
  scene reads as foreground against the dark backdrop. Treat the
  multiplier as the project's house-style brightness — match it on
  any new particle leaf. **Scene-specific boosts on top** are
  acceptable: `molecule` and `red-storm` use `× 4.0` (double the
  house-style pass) for hotter cores under bloom. When boosting, make
  sure any pure-white source colours (e.g. `molecule` bonds) are
  pre-halved at the source so they don't run away into a fat halo.
- **Point-sprite corner discard.** New particle leaves **must**
  discard fragments outside the inscribed circle of the point-sprite
  quad — compute `d = length(gl_PointCoord - 0.5)` and `discard`
  when `d > 0.5` **before** running the strength math. `pow(neg, N)`
  for even-integer / non-integer `N` returns positive values, so the
  intuitive `strength <= 0.0` check silently fails in the four
  corners. Without bloom this fringe is invisible; with bloom it
  becomes obvious black squares. See ADR-0015.
- **Particle density (`densityScale`).** Every particle leaf
  (`Starfield`, `SpiralNetwork`, `Molecule`, `RedStorm`,
  `HourglassGalaxy`, `StarfieldClose`) takes a `densityScale` prop
  (default `1`) that multiplies its base `count` at geometry-build time
  (`Math.round(count * densityScale)`; `Molecule` scales its
  `ATOM_PARTICLES` / `BOND_PARTICLES` constants, floored at 1).
  `Scene` passes `0.49` on mobile (~half the count — two compounded 30 %
  cuts; ADR-0017). New particle leaves should accept and apply
  `densityScale` the same way.
- **Content.** Reads from `src/data/mocks/negentropy.ts` — no hardcoded
  copy or numbers in the components.

## Mock data

`src/data/mocks/negentropy.ts` exports `negentropy: NegentropyContent` with:

- `brand` — name + tagline
- `loaderBeats` — 5 strings for the loader sequence
- `sections.{void,entropy,refusal,universe,choice,persist}` — six beats total. Sections II–VI share a `SectionContent` shape (`index`, `meta`, `heading`, `body`); refusal extends it with `biomarkers`, persist with `cta`. `eyebrow` was removed in v0.18 in favour of `index` + `meta` to match the §I `Hero` bracketed-label vocabulary
- `sections.refusal.biomarkers` — Bryan Johnson Blueprint stats (verify before launch)
- `sections.persist.cta` — Blueprint outbound link (moved out of `choice` on the §VI introduction)

## Open follow-ups

- Verify the live Blueprint numbers against `blueprint.bryanjohnson.com`
  shortly before launch.
- Decide whether to extract shaders to `.glsl.ts` files.
- ~~Resolve the pre-existing TypeScript errors in the animation engine so
  `yarn build` succeeds.~~ **Done 2026-05-31** — dynamic-tag typing fixed
  across five engine files under [[decisions-log]] ADR-0016; `yarn build`
  now passes.
- Replace placeholder screenshot references in
  `obsidian/projects/negentropy/assets/` once the user re-drops the
  source files.

## Related

[[projects/negentropy/concept]] · [[decisions-log]] ADR-0013 ·
[[component-conventions]] · [[animation-system]] · [[text-engine]] ·
[[smooth-scroll]]
