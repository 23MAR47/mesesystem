---
tags: [frontend, stable]
updated: 2026-09-02
---

# Catalog — Common Components

Files in `src/components/common/` — shared infrastructure that may depend on
providers. Conventions: [[component-conventions]].

## Cookie — `Cookie/`

Self-contained cookie consent system — a bottom-right **banner** plus a full
category **preferences modal**. No third-party library (the old
`react-cookie-consent` dependency was removed). Lives in `src/components/common/Cookie/`.

| File | Role |
|------|------|
| `Cookie.tsx` | Mount component — hydrates the store, renders banner + modal |
| `LazyCookie.tsx` | `next/dynamic` `ssr:false` wrapper — keeps cookie JS out of first-load |
| `CookieBanner.tsx` | Bottom-right consent banner |
| `CookiePreferencesModal.tsx` | Category preferences dialog with per-category toggles |
| `CookieButton.tsx` | Local button primitive — `primary` / `secondary` variants |
| `cookieStore.ts` | Zustand store + `localStorage` persistence |
| `index.ts` | Barrel exports — `Cookie`, `LazyCookie`, `useCookieStore`, `CookieConsent` |

**Mounting** — the root layout renders `<LazyCookie />` inside `ScrollLayout`:
```tsx
import { LazyCookie } from "@/components/common/Cookie";
```

**State** — `useCookieStore` (Zustand). `consent` is `null` until the user decides;
the banner shows only after hydration confirms `consent === null`. Persisted to
`localStorage` under key `cookie-consent-v1`. Three categories: `necessary`
(always on), `analytics`, `marketing`.

**Styling & motion** — ported to the project stack: Tailwind v4 with the
`background` / `foreground` design tokens (dark-mode adaptive, no hardcoded hex),
and `@react-spring/web` for all motion — `useTransition` drives the banner and
modal mount/unmount, `useSpring` drives the toggle knob. No CSS transitions.
The modal locks scroll through the Lenis [[smooth-scroll|scroll store]]
(`useScroll.stop()`), not `body` overflow.

> [!note] `#todo`
> The privacy-policy link points to `/privacy-policy` — that route does not exist
> yet. Placeholder consent copy should be reviewed before launch.

## Grid — adaptive scaling (`grid/`)

The **adaptive scaling grid** keeps a rem-based layout proportional across every
viewport by scaling the root (`<html>`) font-size. Design in `rem` once, and the
whole UI scales as one unit. Lives in `src/components/common/grid/`.

| File | Role |
|------|------|
| `grid.config.ts` | Breakpoints + `FONT_BASE` — the single source of truth for the grid |
| `adaptive-grid.tsx` | `<AdaptiveGrid>` client component — drives the scale-up, renders `null` |
| `index.ts` | Barrel exports — `AdaptiveGrid`, `GRID_BREAKPOINTS`, … |

**How it works** — two halves cover the whole viewport range:

- **Scale down** (viewport ≤ 1920px) — `vw`-based `html { font-size }` media
  queries in `globals.css`. At each breakpoint's design base width the root
  font-size resolves to 16px; between breakpoints it tracks the viewport.
- **Scale up** (viewport > 1920px) — the `<AdaptiveGrid>` component sets an
  inline `html` font-size at runtime via [[hooks|`useAdaptiveGrid`]], so the
  design keeps growing (damped by `coef`) on large displays.

The `globals.css` media queries and `grid.config.ts` describe the same
breakpoints — **keep them in sync** (formula: `font-size = 16 * 100 / baseWidth vw`).

**Mounting** — the root layout renders `<AdaptiveGrid />` inside `ScrollLayout`:
```tsx
import { AdaptiveGrid } from "@/components/common/grid";
```
Mount it once. Props: `baseWidth` (defaults to the largest breakpoint) and
`coef` (0–1 scale-up damping, default `0.6666`).

> [!note]
> This replaced a `styled-components`-based scaling system that was dropped into
> `common/` — see [[decisions-log]] ADR-0008. `styled-components` is **not** a
> project dependency; the scale-down CSS lives in `globals.css` per [[design-system]].

## ReducedMotion — `reduced-motion.tsx`

`<ReducedMotion>` — a client leaf that calls react-spring's `useReducedMotion()`.
It watches the `prefers-reduced-motion` media query and toggles react-spring's
global `skipAnimation`, so every spring — and `spring-text-engine` — jumps to its
end state instead of animating. Renders `null`; mounted once in the root layout.
See [[animation-system]] and [[seo-metadata]].

## Skeleton loaders

Three skeleton components for `loading` states of async-data components — every
async component must mirror its final layout with one of these
(see [[component-conventions]]).

| Component | File | For |
|-----------|------|-----|
| `<SkeletonImage>` | `skeleton-image.tsx` | image placeholders |
| `<SkeletonLoader>` | `skeleton-loader.tsx` | generic block placeholders |
| `<SkeletonVideo>` | `skeleton-video.tsx` | video placeholders |

## Model scene (`scene/`)

The home hero's WebGL layer. Three components, split so the bot path and the
real-user path never share a chunk.

| Component | File | Role |
|-----------|------|------|
| `<LazyModelViewer>` | `lazy-model-viewer.tsx` | `dynamic(ssr: false)` wrapper — the boundary that keeps `three` in its own chunk. Its loading placeholder is the runway at full height, so the document does not grow by two screens at hydration |
| `<ModelViewer>` | `model-viewer.tsx` | Client leaf: owns the scroll runway and the sticky canvas, feeds scroll progress to the scene, gates rendering on in-view + tab visibility, reveals on scene-ready, falls back to the poster if WebGL is unavailable. Also serialises scene lifetimes — see the warning below |
| `<ModelPoster>` | `model-poster.tsx` | Static first frame (`/assets/hero/model-poster.webp`) for crawlers and for browsers without WebGL |
| `<TierReload>` | `tier-reload.tsx` | Render-nothing guard: reloads the page when a settled resize changes the device tier, since the scene's whole shape is chosen from the tier at mount. Only a tier change reloads — never a URL bar, a rotation, or a same-tier resize. ADR-0127 |

> [!info] The model arrives; it is not found already there
> The hero's instance is built with `arrive: true`: warm under the curtain but
> held at a level of 0 — every fragment discarded — and on `released` the
> viewer's `arrival` spring walks `setArrival` from 0 to 1. One value drives the
> approach (nearer the camera and higher, settling into place) and the burn-in
> (`arriveLevel` in the shader: drifting noise thresholds, an ember of the
> accent along each front). The still instance never arrives. Tune it in
> `sceneConfig.arrival`. ADR-0122, amending ADR-0119.

> [!danger] The construction effect must not depend on `released`
> It did, and the hero's scene was rebuilt the moment the curtain left — its
> prewarm walking every scroll stop on a canvas the reader could see. Depend on
> the derived `buildable` (true from the start for the hero) — ADR-0122.

> [!info] One scene on the page
> The hero's is the only `ModelScene`. The closing screen was a second, still
> instance (ADR-0115/0123/0124) and is now `<ClosingStage>`, a cutout image
> with DOM reveals — ADR-0125. Everything the scene builds is built under the
> curtain (ADR-0123), and the canvas is never multisampled: the composer's
> target carries the MSAA (ADR-0124).


### The brush reveal

Moving the pointer over the model opens a mark on the **white stage**: it takes
the texture away and the topology shows through, and the ground under it goes a
few shades down. Below the tide line there is no mark at all — the mesh is
carrying the subject there on its own, and patches of texture put back over it
read as damage rather than as a reveal (ADR-0059). It is desktop/tablet only,
since there is no hover on a phone, so the raycast is not attached there. The
wireframe geometry *is* built on every tier, because the stages reveal it
without any pointer.

> [!important] The **stage line** bows with the scroll
> While the reader is scrolling, the boundary between the white ground and the
> tide arches upward — half a sine across the viewport, pinned at the screen's
> edges — and it goes straight the moment they stop (`stages.bowHeight`,
> `bowSpeed`, `bowResponse`, uniform `uLineBow`). Driven by *speed*, not
> acceleration: acceleration is zero through the middle of a long steady
> scroll, exactly where the line should be deepest. Needing no pointer, it
> works on touch too.
>
> Neither the pointer nor its mark bows anything. The mark carried this for
> five rounds on a misreading, and then the line carried it on the wrong
> driver for one more. ADR-0065, ADR-0066.
>
> Anything measured **along** the stroke — the taper, the bow — is normalised
> over the *live* span, never over the ring. The live points sit at the end
> of the ordered array until the ring fills, so `k / (size - 1)` gives a
> short stroke almost no taper and almost no bow, and lets both grow in as
> it is drawn: the mark changes character mid-gesture and reads as moving
> strangely. ADR-0060.
>
> The outline's noise is sampled in **screen space**, and three attempts at
> something cleverer are the argument for it. The stroke is a polyline of
> heavily overlapping capsules — a dozen cover every pixel — so no coordinate
> can be inferred from *which* capsule a pixel is nearest: against a segment's
> axis it jumps at every bend (ADR-0062), off the winning capsule it jumps
> between far-apart segments on the smallest move (ADR-0063), averaged it
> smears. Screen-fixed is continuous everywhere and cannot turn; that trade is
> deliberate — a tear is a defect, a missing rotation is a missing flourish.
> ADR-0064.
>
> If the orientation is ever wanted, do **not** add a fourth coordinate. Give
> the stroke a real arc length, accumulated on the CPU and carried per point,
> so the shader never infers position along a curve from nearby geometry.

> [!important] The boundary is a contour, and it has to be hard *and* smooth
> Those two pull against each other and every shortcut loses one of them: a
> soft disc is smooth and has no edge, a tessellation has an edge and reads as
> chopped. The mask is therefore a **smooth field cut by a `step`** — the
> stroke's reach plus a drifting noise, thresholded at `brush.threshold`. The
> field being smooth makes the contour smooth; the step makes it an edge; the
> noise (`brush.wobble`) is what stops it being a circle *and* what makes the
> mark shed islands as it decays instead of fading. Read ADR-0053 → 0054 →
> 0055 → 0056 before changing any of it; each one is a way of getting this
> wrong.
>
> The **taper** is driven by a point's place in the ring (`brush.head`), not
> by its remaining life: mid-drag every point is young, so a width taken
> from life hardly narrows and the mark comes out a tube. Life drives the
> weight instead, which is how it dissolves. ADR-0057.
>
> The mask walks **capsules**, not discs, and that is what makes the taper
> possible at all: a field of discs stays continuous only while the radius
> exceeds the spacing, and a taper's whole job is to drive the radius under
> it — the tail turns into a row of separate circles. Which means the ring
> must arrive in stroke order, and stroke ends must be marked (`brush.ends`,
> sent as the sign of the radius) or a gap gets bridged by a bar across the
> model. ADR-0058.
>
> The mark falls on the **ground** as well as the model — `brush.shade` inside
> `stageColor`, which the model and the background quad both call. Take that
> away and the shape stops at the silhouette and reads as a hole cut in the
> subject.

> [!warning] Under 768px the scene tiers to mobile and attaches no pointer at all
> Which means a narrow preview pane shows no hover whatever, and nothing is
> wrong. Test it at 1280.

| Piece | Where | Role |
|-------|-------|------|
| stroke | `lib/scene/brush.ts` | Ring of 32 **object-space** points, each decaying over 0.7s. `projectBrush` writes them to the uniform in **stroke order**, tapering each radius by its place in the stroke; the shader joins consecutive entries into **capsules**, so the ribbon is continuous however thin the tail gets |
| mask + effects | `lib/scene/scene-shader.ts` | GLSL injected into **both** materials via `onBeforeCompile`, sharing one uniforms object by reference so they cannot disagree |
| topology | `lib/scene/coarse-wireframe.ts` | Grid-welded wireframe — the raw 102k-triangle mesh renders as a smudge (ADR-0026) |

The stroke lives in **object space**: it then sticks to the surface as the model
sways, and needs neither a render target nor this asset's fragmented UV atlas.
Off the subject it falls back to the plane the subject stands in, so one mark
crosses from the model to the ground without a break.
The pointer is projected onto the surface with a real raycast, throttled to at
most once per frame and only when the pointer actually moved — 102k triangles is
too much to test more often than that.

Two details that go together: the mask is a **hard disc** with only a thin
antialiasing rim (a wide gradient reads as a blur trailing the cursor, not as a
mark), and because of that the stroke has to be **interpolated** — the raycast
runs once per frame, so a fast drag leaves gaps that a soft edge used to hide and
a crisp one exposes as separate dots. `Brush.add()` walks the segment rather than
recording only the endpoint.

### The three stages

The stage is `position: sticky` inside a runway `sceneConfig.stages.runwayViewports`
screens tall, so scrolling past it sweeps hard horizontal lines up the screen
without moving the canvas. Two lines cut it into three stages:

| Stage | Ground | Model | Hover |
|-------|--------|-------|-------|
| 1 | `--scene-surface` white | textured, lit | brush **opens** the model — the white shows through it, with the mesh over it |
| 2 | a live **tide field** | dissolved into the field: a hairline mesh with a lit spark on every junction | **inverted** — brush puts the texture back, and the sparks go out with it |
| 3 | the same field — this stage brings no colour | the mesh fades out as a regular lattice spelling "AI" contracts into place | none: the mesh is leaving |

> [!info] The mark lifts to `--scene-mark`, on the subject and on the ground
> It carries what it covers to white rather than shading it down, and the
> background quad carries its alpha on the white stage so the shape does not
> stop at the silhouette. Measured `255,255,255` on both sides of it.

> [!danger] `box.corner` may never be zero — the crease has a minimum radius
> At zero, `seatAt` flips a band from 0° to 90° between two frames: it stops
> covering its full-height strip and covers a foreshortened ribbon above the
> crease, so the strip below is momentarily covered by nothing. At rest the bleed
> hides it; **scrolling, every band crosses in turn and it flashes white**. The
> floor is about one band. ADR-0103.
>
> This is why a scroll-driven fold must be checked by *stepping* the scroll
> across a band boundary. A screenshot at one position sees nothing.

> [!danger] `card.bandBleed` is a **length**, and it reaches both ways
> Eighteen boxes stacked edge to edge round apart into hairlines, and the fold
> quantises to a band boundary and leaves a wedge at the crease. One bleed closes
> both — but as a *multiplier* it shrinks as `bands` grows (0.12 of a device
> pixel at 18 bands, which closes nothing), and reaching only downward leaves the
> crease bare, because the folded band's bleed extends in depth rather than on
> screen. ADR-0101.
>
> To tell a gap from a break in the picture, paint the section behind the cards
> red: a seam that turns red is the stage showing through.

> [!info] The bar's links are a disc on a phone, and that is why `StageNav` is a client component
> One boolean. The links are rendered on the server in both forms, so a crawler
> and a reader without JavaScript still get all four. The disc carries
> `data-nav-shell`, so the bar's clip animation picks it up without knowing it
> exists — and being round, the clip's floor is already its shape. ADR-0111.

> [!danger] A pixel-ratio clamp is unsafe for a scene that draws type
> `clampedPixelRatio` is a fill-rate decision, and it is safe exactly to the
> extent that nothing in the scene has an edge that must land on a pixel. This
> one paints display type, a one-device-pixel rule and a thin wireframe, so the
> mobile tier sits at 1.25 like the desktop tier — not the 0.85 a soft-shaped
> scene would take. Raising the ink atlas cannot reach past it: the atlas is
> sampled *into* that buffer. ADR-0112.

> [!warning] The scene's ink atlas does **not** use the framebuffer's pixel ratio
> `clampedPixelRatio` is a fill-rate decision. Glyphs are drawn once into a
> canvas and sampled thereafter, so the clamp buys nothing there and costs
> visible stepping on a phone. `sceneConfig.stageInk` gives the atlas its own
> scale. ADR-0110.

> [!warning] Below `md` the first screen's rule is measured off `[data-stage-rule]`
> Its `vw` row is a distance up from the bottom edge — right for a band of the
> design's height, meaningless for a stacked column, where it landed through the
> middle of the copy. ADR-0110.

> [!danger] Never write a template interpolation immediately after a class
> A class written flush against a `${` in a `className` template is not a
> candidate Tailwind's scanner recognises, so it **never generates the rule**.
> The class is on the element and the stylesheet has nothing for it; the box
> collapses and nothing warns. Build conditional class lists from an array of
> plain string literals and `join(" ")`. ADR-0109.

> [!danger] `stacked:`, not `max-md:` — and the floors are `px`
> The bottom band is a landscape shape, so the variant is
> `(max-width: 1179px) and (max-aspect-ratio: 1/1)`: a portrait tablet stacks, a
> landscape phone keeps the band. And a floor written in `rem` is not a floor,
> because `GRID_BREAKPOINTS` re-bases the root font-size — at 834px wide it is
> 13.03px, so every `rem` floor delivered 81%. ADR-0113.

> [!info] The frame scales, the type has a floor
> Positions and display type stay in `vw` — that is the composition. Body copy,
> nav labels and controls use the `--frame-*` scale, each `max(floor, design)`,
> which is the whole of what the tablet range needs. The **phone** additionally
> stacks: `<StageBottom stack>` plus `stackChild` on every child, opt-in because
> a child that has not been through the pass stays pinned where the column no
> longer is. The variant is `stacked:`, **not** a width — see the callout above
> and ADR-0113.
> ADR-0109.

> [!info] The process steps are windows on one published number
> `applyTurn` writes the raw turn as `--strip-travel`; each step is a `calc()`
> window on it. Add a column and it costs one expression, not one clock. The
> window only **rises** — the overlay's own `opacity` owns the exit, and two
> clocks fading the same type is how a handover starts looking broken.
> ADR-0108.

> [!info] `StageReveal` has a `floor`
> What a unit is worth before the reveal reaches it. `0` — the default — is type
> that is *not there yet*; a floor is type that **is** there and has not been
> inked in. Use it when the reader should see the shape of a screen and watch it
> resolve, rather than meeting its parts one at a time. ADR-0108.

> [!danger] A hairline is a **row**, not a position
> `rowAt` snaps to a fragment centre and `ruleAt` is written against that snap.
> Unsnapped, a one-pixel rule lights two rows at half weight: grey, soft, and
> different at every window height. ADR-0104.

> [!warning] The delivery rule's timing comes from its **layer**, not its zone
> A scroll zone opens as soon as the deep line starts crossing — saturated a
> whole screen before the copy that hangs from the rule begins to fade in. Take
> `uRuleImmersedFade` from the delivery layer's window; the zone only says which
> screen the line belongs to. ADR-0104.

> [!warning] The scene-drawn rule is the **delivery** screen's, and only that one
> Gate it on `bgZones.z`. The wireframe screen before it has no full-width rule —
> its only rules are the three short DOM ones down the right column, one per
> statistic. `y + z` puts a line across a screen that never asked for one.
> ADR-0102.

> [!info] Below the tide line the heading shows **through** the subject
> The model's surface is given to the stage down there, but it still writes
> depth — so the quad is rejected behind it and the painted heading came out cut
> in the shape of a body that is not itself visible. The model's shader mixes
> `stageInk()` into the stage it dissolves towards, gated to the immersed zones.
> On the first screen the model *is* visible and the name stays behind it.
> ADR-0102.

> [!warning] The first screen's rule and its name are **not** drawn by the DOM
> Both are painted by the scene's background quad, which the model depth-rejects
> — so the subject occludes them, and the pointer's mark passes underneath them.
> The rule is gated by `ModelSceneOptions.stageRule` (the hero only); the name is
> marked `data-scene-ink` and is still laid out, styled and rasterised by the
> browser, the scene only reading its box, font and colour. Neither can go back
> to being a DOM layer behind the canvas: the mark would wipe them. And the rule
> must **not** go into `stageColor` — that is what the model dissolves into, and
> the line came through the shirt. ADR-0081, ADR-0083.

| `<StageReveal>` | `stage-reveal.tsx` | DOM type that resolves unit by unit from `--stage-reveal`, for text with no scene behind it or text that wraps (ADR-0085) |
| `<StageNavBar>` | `stage-nav-bar.tsx` | The one navigation bar for the middle of the page — fixed, arriving after the first screen and leaving before the closing block, each plate opening out of a circle (ADR-0086) |

> [!info] A layer window can be `auto`
> Its edges become thresholds and a spring owns everything between, so the
> screen plays on its own clock instead of being scrubbed by scroll. Used for
> the second screen, which has already arrived by the time its type starts —
> `stages.tide` has filled the frame at 0.28. ADR-0090.

> [!danger] Never reveal a clock-driven value with a scroll-driven gate
> `elapsed * k` behind a `morph === 1` test snaps: the reader can arrive at that
> gate at any time, so the value it reveals is arbitrary — and it snaps back
> every time the condition flickers, which a scroll-driven one does constantly.
> Integrate the rate and let the condition scale it. The accent's spin and the
> scroll turn are both this shape. ADR-0096, ADR-0089.

> [!danger] The closing parallax uses `1 - travel`, not `travel`
> An offset multiplied by the travel is **largest when the panel has landed** —
> which is the one frame that must be the design, because it is where the reader
> stops and reads. Both halves invert it, so the planes disagree on the climb and
> agree at the top. ADR-0106.

> [!warning] `CurvedGallery` has two slots, and only one of them fades
> `overlay` has a window — in with the cards, out before the closing panel
> climbs. Anything **structural** put there inherits the fade: the column rules
> did, and vanished a third of the way down the strip. `frame` renders under the
> cards and never fades. ADR-0107.

> [!info] The closing screen's depth is parallax, and it has two halves
> The panel publishes its phase as an inline `--closing-travel`. DOM planes take
> it in a `calc()` transform; the **painted** name cannot, so it takes the
> `uInkShift` uniform instead. Both are needed because the block's planes are
> not all DOM. Read the property from the panel's *inline* style, never from
> `getComputedStyle` — that is a style recalculation every frame for one number.
> ADR-0100.

> [!info] The field is driven by the reader's **position and speed**, not just time
> `tideField.scrollDrift` slides the noise domain as they descend;
> `scrollSurge` leans the front by the same eased speed the stage lines bow on.
> Adding more clock makes the field busier, not more alive. The position is read
> through a follower (`scrollResponse`), never raw — progress moves instantly on
> a wheel flick and the ground would snap with it. ADR-0097, ADR-0099.

> [!info] The **last** screen of a runway has no exit
> What takes it away is the pinned stage scrolling into the next section, and
> that is a handover the boundary already performs. A fade on top of it is an
> earlier disappearance with nothing to hand over to — it left the reader
> watching an empty field. `end` not past `out` is how a window says this.
> ADR-0098.

> [!danger] The morph's length is **three** numbers
> `stages.morph.to`, `rotation.to` and `spin.from` are the same instant — the
> bust hands the turn to the word there. Change one and the turn stalls or
> jumps; `text.fill` has to stay behind all three or the chrome pours into a
> word that is still assembling. Everything *inside* the morph is in morph-local
> units and stretches for free. ADR-0095.

> [!info] The chrome reflects its **own** studio, not the scene's room
> A mirror shows what is around it, and `scene.environment` is deliberately
> featureless — it is a fill floor for skin. `chrome.environment` paints an
> equirect strip and prefilters it for the word's material alone. Its sky is not
> white on purpose: it is the largest area, so at full value the letters' faces
> bloom as one and the form disappears. ADR-0094.

> [!warning] A `<ProgressTrigger>` only reports while its element is on screen
> Anything that must be switched **off** when the reader is far from it cannot
> take that element as its span — the trigger goes quiet and the last value it
> saw stands. Give it something always in view and compare the numbers yourself.
> `<StageNavBar>` froze half-open this way. ADR-0092.

> [!info] The pointer is a **lamp** below the tide line, not a mark
> The mesh and the sparks are held back and lifted within a radius of the cursor
> (`pointerGlow`). Screen space, unlike the brush on the first stage: a light
> held up to the model rather than a mark painted onto it. The dim stays when the
> cursor leaves — only the lit patch travels off — and the whole effect is gated
> on `(hover: hover)`. ADR-0091.

> [!warning] Which reveal a heading uses is decided by two questions
> **Does it have to sit behind the model?** If yes it is painted by the scene
> (`data-scene-ink`, drawn by the depth-tested background quad) — the only way,
> because on the tide stages the quad *is* the ground. If no, it is
> `<StageReveal>` in the DOM. Wrapping text can only be the second: the painter
> draws one line with one `fillText`.
>
> **And is bloom on for that stretch of scroll?** If it is, painting glows — the
> pass is full-screen and the type is in the frame before it. That is why the
> delivery screen's headings are DOM: bloom is on there for the chrome pour.
> ADR-0085, ADR-0088.

> [!danger] Never place painted type from `getBoundingClientRect`
> It reports the box after every ancestor transform, and the closing screen's
> scene lives inside the gallery's *tilted* rising panel. Use the layout:
> `clientWidth`/`clientHeight` for the surface, an `offsetParent` walk for the
> type — and count the element's own `translate` (Tailwind v4 writes that, not
> `transform`, and keeps its percentages). ADR-0087.

> [!danger] A material that calls an injected function must be given it
> `neutralToneMap` was added to the word-chrome material without adding
> `toneMapFunction` to that material's own chunk, and the fragment shader failed
> to compile — so the poured chrome drew **nothing** while everything around it
> carried on. Nothing about the page looks broken when this happens; the error is
> only in the console. Read the console after touching any injected shader.

> [!info] The painted name is animated in the scene, not by the text engine
> It resolves letter by letter in a scrambled order, on opacity alone. It cannot
> go through `spring-text-engine`: there are no letter elements (the name is a
> texture), and the engine's scroll modes measure an element that never moves
> while the stage is pinned. The entrance spring and the layer's window are
> multiplied into `setInkOpacity`, which does the stagger. ADR-0084.

> [!info] `StageFrame` anchors to the top, `StageBottom` to the bottom
> Width still scales in `vw`; height does not. The design's top group keeps the
> top edge and its bottom group keeps the bottom edge, so a tall window opens the
> gap in the middle rather than floating the whole composition. Children of
> `StageBottom` keep the `top-[…vw]` the design gives them. ADR-0082.

> [!warning] A design token only reaches the screen because the tone map is in the materials
> Three compiles a material's tone mapping in only when the render target is the
> canvas, so with a composer `OutputPass` would tone map everything at the end —
> and the Khronos neutral curve never reaches 1.0, which put pure white and the
> saturated accent permanently out of range. The renderer is `NoToneMapping` and
> `neutralToneMap()` is called by hand on the lit colours alone. Set
> `renderer.toneMapping` back and every injected token shifts. ADR-0079.

> [!info] `Brush` keeps one **live** head
> The head slot is rewritten in place on every sighting of the pointer and only
> committed once it has travelled a whole `minStep`. Restore the old
> "drop anything shorter than a step" rule and the mark advances in visible
> ticks whenever the pointer moves slowly. `head` steps past the live slot so
> the taper still starts at the true tail. ADR-0078.

The model also turns a full revolution on scroll, from the first frame of it.
What keeps this front-only capture's untextured back out of sight is the *rate*,
not a delay: one revolution across the runway puts the back at half a turn, which
lands inside the accent hold, where the model is drawn as a wireframe and has no
texture to miss. Change `rotation.turns` or the stage windows and that alignment
goes with it — see [[decisions-log]] ADR-0030. ADR-0028 covers why the chrome is
a per-fragment override rather than a second material.

> [!info] The turn **follows** the scroll rather than equalling it
> Progress sets a target and the angle integrates towards it (`motion.turn`, a
> critically-damped follower), so the model carries a little past where the
> scroll left it and settles instead of stopping dead in the same frame the
> reader does. The target stays absolute and only the velocity is integrated —
> dropped frames cost speed, never position, so the alignment above still holds.
> ADR-0089.

**Stage 2's ground is not a colour, it is a field.** A fire front creeping
across a fuel field — char behind the line, an ember on it, licks above —
evaluated **inside the scene's own shaders**, because the background quad and the
dissolving model both have to arrive at the same colour at the same pixel or the
model melts into a different field than the one behind it. It costs 6 noise
evaluations per pixel, and the shader still skips it wherever that stage has no
weight. ADR-0031 (the integration) and ADR-0034 (this field).

The front advances because the **fuel scrolls past a fixed threshold**, not
because the threshold ramps — animating the threshold instead would eventually
have to wrap, and a wrap in a fire is a seam across the whole stage. The pointer
enters twice: its position pulls the threshold down nearby so the front bulges
toward the hand, and its *velocity* — the gap between two follower poles, not a
measurement — smears the front into a wake that dissolves on its own. That
follower is deliberately separate from the one driving the model's tilt.

**The quad that paints those grounds draws *last*, not first**, at the far plane
with the depth test on — so the model rejects it wherever it already drew. That
is not a sorting detail: the model's shader computes the same field at the same
pixels, so a quad in front meant paying for the walk twice over the whole
subject. Anything you add to the scene must write depth, or it will let the quad
paint over it.

**Stage 3 is where the mesh leaves.** Its line brings no ground colour — the
field runs straight through — so what it sweeps is the model *opening*: past it
`stageOpen` returns 1 outright, brush or no brush. Then the bust's mesh fades
where it stands while a **separate, regular lattice** spelling the word
contracts into place from sources on the bust. Then the word takes the runway's
last two viewports for itself: a **second full revolution** while chrome rises
through it from the bottom. The slab keeps it legible at any angle, which is what
makes turning it possible at all. ADR-0036 (the staging), ADR-0037 (the word),
ADR-0038 (its shape), ADR-0039 (its ending).

> [!warning] `NODE_THRESHOLD` is 0.5 because the contour is
> Lowering it admits nodes *outside* the contour, and only nodes with an absent
> neighbour get projected onto it — so an unprojected ring ends up outside the
> letter at raw grid positions and becomes the silhouette. That is a staircase,
> and it has been introduced once already (ADR-0040).

**The word is a solid as well as a lattice.** A level rising through a wireframe
is a level rising through nothing, so the same nodes are triangulated into a
mesh — front and back faces plus a side wall — and the wireframe is drawn over
it. Sharing the nodes is what makes the two silhouettes agree. The chrome that
was dormant from ADR-0036 lives here now, and needed two things to read as metal
rather than paint: brightness moved to the material's own `envMapIntensity` (the
old `envBoost` inflated the albedo past F0 = 1 and still could not brighten a dim
environment), and a per-fragment normal perturbation, because a slab's front
faces are coplanar and would otherwise all reflect the same flat tone.

> [!warning] Releasing the bust's depth is visible — key it to the fill, not the morph
> The bust's own wireframe is depth-tested against the buffer the bust writes.
> Stop that write and the **back half of the net stops being occluded**: the
> lines on screen roughly double and the model flares. Keyed to the morph, that
> happened in the last beat before the bust faded out and read as a whole extra
> "suddenly very bright" state. It is keyed to `uWordFill` now, which starts
> long after the net has gone. ADR-0046.

> [!warning] The invisible bust writes depth — this bit twice
> ADR-0037 gave the lattice `depthTest: false` for it. The solid cannot do the
> same, because it has to depth-test to occlude its own back faces, so it came
> out with bites taken along the silhouette of a body nobody can see. The fix
> is at the source: the **bust stops writing depth** once the morph begins. The
> stage quad covers those pixels with the field either way.

> [!warning] The scene renders through a post chain — do not pre-encode colour
> Three switches a material's tone mapping **off** when the target is a
> render target, and `OutputPass` does it at the end instead. Every colour
> the injected shaders write past `<colorspace_fragment>` must therefore be
> **linear**: pre-encoding it to sRGB gets it encoded twice and the whole
> frame washes out. The chain is also constant — only the bloom pass is
> gated — because switching between a direct and a composed render changes
> the tone-mapping define and recompiles every program. ADR-0052.
>
> [!important] The accent's axis is the asset's pivot
> `word-model.ts` reads each node's origin **before** the node matrix is baked
> into the positions — after that, an origin and a centre of mass are the same
> thing to the geometry — and the accent turns about that, not about a
> bounding-box centre. A pivot is placed; a box centre is where the extremes
> average out, and on a shape not symmetric about the axis the two differ and
> the spin wobbles. If the mark ever stops turning cleanly, check the pivot in
> the asset first. ADR-0051.
>
> [!important] The accent turns, so it cannot be merged in
> The mark above the `i` is kept as its own part and its own group, because a
> merged geometry has no axis to turn about. Its geometry stays in the word's
> space — the chrome's fill level and the morph's sources are both measured
> there — and the group carries a compensating translation so `rotation.y`
> spins it in place. The spin waits for the morph to finish: a rotation before
> then drags the nodes' sources round with it. ADR-0048.
>
> [!important] The word is its own mesh — do not try to morph the bust into it
> Dragging the bust's junctions into the word's shape drags its *connections*
> with them: a scan's topology is irregular and joined by whatever its triangles
> spanned, so edges end up crossing from one letter to the next, and **no gap
> can ever open between them** because something is always connected across it.
>
> The word is an **authored model** (`text.modelUrl`), welded into a lattice by
> the very same `buildCoarseWireframe` the bust's own net comes from. That
> shared treatment is what makes the morph meaningful: both ends are junctions
> of the same kind, so mapping one set onto the other maps like to like. It also
> means a new asset can be dropped in and the whole effect follows — lattice,
> junction sparks, the journey out of the bust, the turn, the chrome — with
> nothing to rebuild but the file. ADR-0047.
>
> It was, for a while, letters manufactured here from a font: a glyph
> rasterised into a canvas, sampled on a coverage grid, its boundary snapped to
> an isoline, extruded and bevelled. That machinery is gone with the asset that
> made it unnecessary; ADR-0038 records what it was for, in case type ever
> comes back.
>
> `MORPH_FROM` is the define that says which side of the hand-over a material is
> on, and therefore which way `morphed()` runs and which fade it reads. Set once
> at construction; flipping it at runtime would recompile.
>
> The two fades **do not overlap** — the bust's net is out before the letters'
> net is in, and in between only the particles are on screen. That is checkable:
> the frame at mid-morph issues 4 draw calls, not 7.

> [!warning] An invisible mesh still writes depth
> The bust is not drawn in this stage, but its geometry filled the depth buffer
> and the word forms as a thin slab near z = 0 — inside that volume. Four
> letters were cut out along the silhouette of a body nobody could see. The
> three mesh passes turn `depthTest` off once the morph starts, and only then:
> before it, the test is doing real work hiding the back of the net.

**Stage 3's chrome is dormant** — with the surface given over to the field
nothing it computes reaches the screen. It is kept rather than deleted in case
the look is wanted back.

The live chrome is the **word's**, and it is now `roughness: 0.12` — near
mirror-polished. The old 0.3, and the note that used to stand here saying a
sharper surface "reads as glass with two hotspots", were both true *of the
environment it had*: `RoomEnvironment` is a diffuse box, and blur was the only
way to make two hotspots on flat grey follow the form. With `chrome.environment`
underneath it (ADR-0094) the reasoning inverts — there are bands to reflect, and
roughness only throws them away. Raise it again and the metal goes back to
plastic.

**Both immersed stages run the same lighter net, and light its junctions.** A GL
line is always one device pixel — `linewidth` is ignored in WebGL, so there is no
thinner line to ask for. What reads as thickness is the additive halo pass, and
`wireframe.haloOpacity` is what takes it down, with `immersedOpacity` behind it.

> [!warning] `tideField.glow` is 0.3, not the specified 1.0 — do not "restore" it
> `col += light * glow * pow(f, 4.0)` is a quartic amplifier on the field's own
> variation, and at 1.0 it swung the mean brightness of the **whole frame** by
> 1.72x at a completely fixed scroll. That is the scene visibly lighting up and
> settling by itself; the mesh only took the blame for being the subject. At 0.3
> the same measurement gives 1.19x. It is the single value this scene takes from
> the Kindle specification and does not use as given. ADR-0045.

> [!important] Anything glowing over the tide field **screens**, it does not add
> `AdditiveBlending` is `dst + src` with no ceiling, so how bright a glow looks
> depends entirely on what is behind it. Over a live field that is a feedback
> path from the background into the subject: a bright ridge drifting behind the
> model pushed the whole mesh into saturation and back out, and it read as the
> model flashing on its own with the scroll standing still.
>
> `applyScreenBlending` puts the halo and both spark clouds on
> `src * (1 - dst) + dst` instead. Screen also swallows a pale source over a
> blue ground, which is what `particles.gain` and the raised `haloOpacity` buy
> back — a gain above 1 is safe here, it lifts the sprite's core without
> restoring the ground's grip on it. Additive is still right over a controlled
> background; this field is not one. ADR-0044.

> [!warning] A screen-blended pass carries its weight in the colour, not the alpha
> The mesh's halo, the junction sparks and the word's glow shell are all
> blended `OneMinusDstColor` / `One`, where the contribution is
> `rgb * (1 - dst)` — `gl_FragColor.a` is not in the equation. Any mask
> written to alpha on one of those passes silently does nothing. The halo
> ignored the bottom fade this way for four passes of debugging. If a mask
> has no effect, check the blend function before you check the mask.
> ADR-0050.
>
> [!important] The mesh's hem ends above the cut, not at the geometry's bottom
> The lit model's fade runs to the lowest point of the geometry — which on
> this asset is the ends of the hair, well below the flat cut across the
> chest. That is the thing needing hiding, so the mesh has its own start
> *and* end (`fade.meshStartRatio` / `meshEndRatio`): it dissolves through
> the cut and is gone before it. It is also longer than the lit model's,
> because fading to transparency over a live field is a longer journey than
> fading to a ground colour. ADR-0049.
>
> The mesh no longer has a soft band across the stage lines — it starts at
> the line, or the body shows a gap where it should simply continue as a
> net. The flare that band was written for was really the depth-write
> release (ADR-0046).

> [!note] The mesh once had its own, softer version of the stage lines
> `meshZones()` read the same two lines through a band about 300x wider than
> `edgePixels`, so the net eased in rather than switching on at the razor edge.
> It is **gone** (ADR-0049). Two things killed it: the flare it was written for
> was really the depth-write release (ADR-0046), and a band that deep leaves the
> mesh at nothing immediately below the line — a gap through the shoulders where
> the body should simply carry on as a net. Softening now belongs to the hem at
> the bottom, not to the line. Recorded so it is not reintroduced. ADR-0043 has
> the original reasoning.

> [!warning] Do not make the mesh's weight depend on the stage mask
> It did — 0.85 past the third line, 0.42 on the tide, blended by `zones.y` —
> and because that line is a hard edge sweeping up the screen, what the blend
> actually drew was **the heavier net climbing the body bottom-to-top**, looking
> for all the world like a second, denser mesh appearing out of nowhere. There
> is only ever one wireframe geometry; a weight that varies across a
> screen-space line will always read as a second one. ADR-0042.

`haloScale` is **1.0** — the halo sits exactly on the line it belongs to. It
was 1.007, a copy scaled a hair larger so the spill fell beside each strand, and
at hero size that offset is several pixels: what it drew was a visible **second
grid** over the first. The sparks carry the glow now, so the offset had nothing
left to do (ADR-0037).

The sparks are additive sprites on the **junctions of the welded mesh** —
`buildCoarseWireframe` returns them as a `Points` geometry built from the very
vertices the line endpoints are copied from, so a spark cannot drift off a
junction. 4,961 of them here. They exist because thinning the lines alone leaves
a smudge: lit nodes on hairlines read as a structure, hairlines alone do not.
Their material is a **patched stock `PointsMaterial`** for the same reason the
wireframe is — see the blank-canvas trap below — and `brushMask`, `bottomFade`
and `wireGlow` are evaluated per *vertex*, because all three are constant across
a point sprite. ADR-0035.

**The wireframe, its glow and the sparks are hidden while they cannot draw** — above the
first stage line, with no stroke alive, every fragment of both is discarded, but
their 31,616 vertices are not, and the glow is a second copy of the same
geometry. The gate is applied only after the scene prewarms, because
`compileAsync` walks `traverseVisible` and would otherwise skip the program.
ADR-0033.

**Stage 1's brush opens the model rather than bleaching it.** Inside a stroke the
surface hands over to the stage entirely, so the section's white shows *through*
the model instead of leaving a lit grey patch where the texture used to be.
`stageOpen` is the single quantity behind both the dissolve and the mesh reveal:
wherever the mesh shows, the lit surface is gone.

**The mesh glows unevenly.** A second copy of the lines, a hair larger and
additively blended, is the only honest bloom for 1px geometry — a GL line cannot
be widened. Its brightness is modulated by a noise in *object* space, so the
bright patches belong to the model and travel with it as it turns; a uniform
bloom would flatten the net back into a decal.

The lines are **screen-space** — fields arriving over the stage, so they must not
tilt as the model turns — and their antialiasing rim is set in device pixels so
the edge stays hard at every resolution. The ground is painted by a fullscreen
quad rather than the renderer's clear colour, which can only be one colour at a
time. Progress comes from the starter's `<ProgressTrigger>` (`top top` ->
`bottom bottom`) on the shared ticker, so the scene adds no scroll listener.
> [!warning] Never let two `ModelScene`s exist on one canvas
> A canvas element has exactly **one** WebGL context for its whole life —
> `getContext` returns the same one every time — so overlapping scenes are two
> `WebGLRenderer`s over one context, and disposing either clears that context's
> program cache. The survivor then draws some materials and not others: the
> symptom is a bust with its wireframe but no lit surface, appearing on some
> page loads and not others.
>
> It happened because the instance was kept only in `sceneRef`, assigned after
> `load()` resolved, so a teardown mid-load disposed nothing. `teardownRef` now
> chains construction behind the previous scene's disposal. React's development
> double-mount makes this reliable, but any remount reproduces it — the guard is
> the fix, not disabling Strict Mode. ADR-0041.

`<ModelViewer>` owns the runway because its length and the stages are one
setting; the bot path has no stages and gets a single screen instead.

The same shader also carries the film grain (so the empty stage stays clean) and
the bottom fade that dissolves the bust's flat cut. See [[decisions-log]]
ADR-0025 for why they belong there rather than in a fullscreen pass, and for the
two failure modes that present as a blank canvas rather than an error.

The renderer itself is **not** a component — it is `src/lib/scene/model-scene.ts`,
a plain class on the shared ticker (ADR-0023). The split matters:

- `src/views/home.tsx` is a Server Component and calls `isBot()`. Bots get
  `<ModelPoster>`, and because that path never references `<LazyModelViewer>`,
  the `three` chunk is not in the graph they download at all.
- `<ModelViewer>` renders the canvas transparent until `load()` resolves — which
  is *after* every program is compiled and every texture uploaded — then fades it
  in with `<Spring>`. Revealing on scene-ready rather than on a timer is what
  keeps the first frame free of compile hitches.
- The canvas is `aria-hidden`; the section's `<h1>` carries the description, so
  it is announced once rather than twice.

Content (the heading text and the poster path) comes from
`src/data/mocks/home.ts` via props — components hardcode neither.
See [[optimize-3d-scene]] and [[decisions-log]] ADR-0023, ADR-0024.

## Screens over the scene (`hero/`)

The page's first two screens are **layers on the scene's own runway**, not
sections: one canvas, pinned for seven viewports, with the copy composited into
it. Each layer has its own window on the scroll, and `<ModelViewer>` drives them
all from the progress it already tracks. ADR-0075.

| Layer | Prop | Window | Screen |
|---|---|---|---|
| `<HeroStageTitle>` | `behind` | out by 0.26 | first — **behind** the canvas |
| `<HeroStageCopy>` | `front` | out by **0.12** | first — over the canvas |
| `<ImmersedStage>` | `immersed` | **`auto`**: in at 0.28, out at 0.48 | second — over the tide |
| `<DeliveryStage>` | `delivery` | 0.56–0.72 in, **no exit** | third — over the mark |

A layer's `--stage-reveal` is its window **times the entrance**, for the DOM as
for the painted type, so a screen's copy arrives on the same clock as its
heading. `<StageReveal>` resolves a line word by word from it; `stageRise(at)`
(`stage-rise.ts`) brings a whole block up — opacity and a `--stage-rise` lift —
from its own start on the reveal, which is how the first screen's copy staggers
(`sceneConfig.arrival.copyStagger`). Both are CSS over one custom property;
neither animates anything itself. ADR-0085, ADR-0122.

The first screen's two halves leave at **different** times, and that is the
point: the tide climbs from the bottom, so it reaches the copy long before the
name, and anything still drawn when it arrives is drawn over the blue. Each half
goes ahead of the line coming for it (ADR-0093). The name still leaves slowly,
because it is being covered rather than replaced —
`stages.tide` is climbing over it from 0.067. The second does not begin until
that climb is **finished** (0.28), and then plays on a spring rather than on
scroll: it has already arrived by then, so there is nothing left for the scroll
to narrate. See the `auto` note above.

The gallery has one too, on **its own** runway rather than the scene's:

| Layer | Prop | Window | Screen |
|---|---|---|---|
| `<ProcessStage>` | `<CurvedGallery overlay>` | 0.02–0.18 in, 0.38–0.56 out | fourth — over the travelling strip |
| `<ProcessRules>` | `<CurvedGallery frame>` | **none** — never faded | the columns the strip runs in; outlasts the copy (ADR-0107) |

And the closing screen has **no** runway at all — `<ModelViewer still>` renders
one screen and holds the scene at progress 0, so there is nothing for a window
to track. It is not a section either: it rides **on** the gallery's rising
plane, passed as `<CurvedGallery closing>`, so it is whole from the moment it
appears (ADR-0077).

| Layer | Prop | Screen |
|---|---|---|
| `<ContactStageTitle>` | `behind` | fifth — behind a second, still scene |
| `<ContactStageCopy>` | `front` | fifth — over it |

> [!warning] Do not give the closing screen a section of its own again
> It was one, and it cost two screens of scroll to deliver one screen: the plane
> climbed blank, the runway ended, and only then did the block scroll up behind
> it. Both are the accent, so the reader saw a screen of empty blue for the
> whole of it.

> [!warning] A scene on a ground that is not `--scene-surface` must be told
> The model dissolves *towards* its stage's colour at its foot and hands itself
> over to it under the pointer's mark. An instance standing on the accent blue
> while reading the default token smears porcelain across the block on the way
> out. Pass `surfaceToken`. ADR-0076.

The windows are keyed to the scene's own config — `stages.tide`, `stages.deep`,
`stages.morph` and `text.fill`. Move a stage and the windows follow.

Two pieces are **shared, not copied**, and that is deliberate: a second copy is
how screens quietly drift out of register with each other.

| Piece | File | What it is |
|---|---|---|
| `<StageFrame>` | `stage-frame.tsx` | The coordinate frame every screen is drawn in — full height, **top-anchored**, and the `pointer-events-none` that keeps the pointer on the canvas |
| `<StageBottom>` | `stage-frame.tsx` | The design's own `55.5556vw` height hung from the **bottom** edge, so its children keep the `top-[…vw]` Figma gives them and stay that far up from the bottom (ADR-0082). `stack` turns it into a padded column under `stacked:` — a portrait window, not a narrow one (ADR-0113) — `underBar` reserves room for the floating bar, and every child needs `stackChild` — opt-in, because a child that has not been through that pass stays pinned where the column no longer is (ADR-0109) |
| `stackChild` | `stage-frame.tsx` | The classes a child of a stacked `StageBottom` drops at `md`. One string, shared, so two stages cannot spell it differently |
| `<StageNav>` | `stage-nav.tsx` | The pill of section links and the call to action beside it — folding to a **disc** with three lines beside the action under `stacked:`. **A client component**, for the one boolean that disc needs; both forms render on the server, so all four links reach a crawler (ADR-0111) |

## Magnetic (`magnetic/`)

| Piece | File | What it is |
|---|---|---|
| `<Magnetic>` | `magnetic/magnetic.tsx` | Leans a control's **label** toward the pointer by a fraction of the offset from the control's centre, and eases it home on leave. Listens on its **parent** and moves its own span — wrap the label, not the button. Two bare `SpringValue`s writing the transform; nothing attached without a pointer (ADR-0120) |
| `magneticConfig` | `lib/magnetic/magnetic.config.ts` | The pull, as a share of the offset, and the spring |

> [!danger] Wrap the label, never the control
> The element `<Magnetic>` wraps is what **moves**; its parent is the area that
> is **felt**. Moving the control itself makes the button come loose from the
> layout *and* drags its hover area out from under the cursor. No clip is needed
> to hold the label in — the lean is bounded by `pull` of the half-width — and
> an `overflow-hidden` would fight a `leading-none` plate for its glyphs
> (hard rule #3). ADR-0120.

> [!danger] Both springs must repaint
> Hang `onChange` on one of them and a pointer moving along that axis's own
> centre line leaves the other travelling with nothing to write it out — the
> control does not move, and only for paths that cross the middle. ADR-0120.

> [!info] The box is measured per move, not cached
> This sits on the closing screen, which is carried up by a rising panel: its
> rect is somewhere different on every frame of the climb, so a remembered one
> aims at where the control used to be.

## Preloader (`preloader/`)

| Piece | File | What it is |
|---|---|---|
| `<Preloader>` | `preloader/preloader.tsx` | The opening curtain — a counter filling on the accent, leaving upward when the scene is warm. The number is written to the DOM from a bare `SpringValue`, never rendered from state |
| `usePreloader` | `hooks/preloader/use-preloader.ts` | The handover: `sceneReady` (the scene saying it is warm — or broken — and the curtain may finish) and `released` (the curtain saying the page may begin) |
| `preloaderConfig` | `lib/preloader/preloader.config.ts` | `minShow`, `hold`, the three springs — fill, finish, exit — and `releaseAt`, how far up the curtain is when the page is released |

> [!danger] `if (x) return null` does not unmount, and the effects stay
> The curtain hid itself that way and its scroll-unlock lived in an effect
> cleanup, so the page was left permanently locked — on the one path that always
> happens. Release such a lock on the state change as well as in the cleanup.
> ADR-0114.

> [!warning] The two signals are deliberately not one
> `released` is set when the curtain is **leaving** — at `releaseAt` of its
> travel, half-way up — not when the counter reached a hundred. Gate an
> entrance on that, never on `sceneReady`, or it plays behind a curtain still
> fully on screen. The element outlives the signal: a local `gone` removes it
> on rest, so it never vanishes mid-screen. ADR-0122.

> [!info] Gate on `released` what the reader should **watch**; on `ready` what
> they should **find already there**
> The painted type's entrance waits for the curtain — letters resolving behind
> it are wasted. The model is warm under the curtain (ADR-0119) but since
> ADR-0122 it is *watched* too: held back at a level of 0 and walked in on
> `released`, ahead of the type by `inkDelay`.

> [!danger] The curtain lifts onto the top of the page, and has to make sure of it
> A reload's scroll position is restored by the browser while the document
> streams, *after* the layout's scroll-to-top. The curtain scrolls to 0 when it
> locks the page and again as it leaves — the window **and** Lenis, which keeps
> a target of its own while stopped — and the root layout sets
> `history.scrollRestoration = "manual"` inline. ADR-0122.

> [!danger] Nothing else may build under the curtain
> The closing screen's `still` scene was constructing at page load beside the
> hero's, putting **two** of every block under a loader that has to animate
> through them. Whatever the curtain is not waiting for defers to `released`.
> ADR-0115.

> [!info] `minShow` is a floor, and floors are allowed
> Ending a loader on a timer promises something about the network that cannot
> be kept. A **minimum** showing is the opposite problem — without it a fast
> connection gets a flash. The end stays `sceneReady && waited`. ADR-0115.

> [!note] The turning square that used to be here is gone, and its lessons are not
> It was removed on request; ADR-0114, ADR-0117 and ADR-0119 hold what it cost
> to build, and every one of those findings applies to the next thing that
> animates:
>
> - **One number, two readings.** Two motions cannot be made to feel
>   simultaneous by coordinating them — this project tried twice — only by
>   deriving one from the other.
> - **Integrate a rate; never map onto load progress.** Progress creeps,
>   plateaus and jumps, and anything derived from it inherits all three.
> - **One writer per frame.** Two springs repainting one element from their own
>   `onChange` handlers each compose with a stale reading of the other.
> - **Cap the integrator's delta.** A main-thread stall then costs a moment of
>   stillness rather than a skip.

## Still stage (`hero/still-stage.tsx`)

| Piece | What it is |
|---|---|
| `<StillStage>` | A screen of the narrative as a still: a full-bleed frame captured from the scene (`stage.stills.*`), with the screen's copy revealing over it — `<Inview mode="once">` springs `--stage-reveal` 0→1 — and a small parallax: a `<ProgressTrigger>` across the viewport, a bare `SpringValue` chasing its progress, the image's transform written on change (`sceneConfig.lite.stillParallax`). Rendered by `<ModelViewer>` after the runway on the lite path, in place of the immersed and delivery layers. ADR-0126 |
| `<ImmersedStage painted={false}>` | The immersed screen with its heading resolved in the DOM rather than painted by the scene — the form the still uses |

> [!info] The lite path
> `wantsLiteScene()` (the mobile tier): the lite model, a 2.2-viewport runway
> with `LITE_WINDOWS` (no exit — the type stays and the screen leaves whole),
> one motion (the turn), no idle sway, draw-on-change, 60fps at one pixel per
> CSS pixel with MSAA on the composer target. The desktop path is unchanged.
> Recipes for the stills and the lite model are in [[changelog]] (98).

> [!danger] The still's transform has one writer
> No transform class on the image: the spring writes `style.transform`, and
> the first write would silently replace a class translate. Placement is
> `height`/`top` inline instead.

## Closing stage (`hero/closing-stage.tsx`)

| Piece | What it is |
|---|---|
| `<ClosingStage>` | The closing screen without a scene: `<ContactStageTitle>` and `<ContactStageCopy>` around a cutout of the bust (`stage.cutoutSrc`), inside an `<Inview mode="once">` that springs `--stage-reveal` 0→1 as the panel rises. Client component; the same markup for a reader and a crawler. ADR-0125 |
| the cutout | `public/assets/hero/model-cutout.webp`, captured from the scene on the accent so the foot is already dissolved into it. Re-capture if the model, lighting or accent change — see [[changelog]] (97) |

> [!info] The depth cue is CSS on both planes
> The heading lags and the copy leads against the panel's `--closing-travel`
> (`sceneConfig.closingParallax`), each as a `translate3d` on the element. The
> scene used to shift the painted heading; there is no painted heading here.

## Title stage (`hero/`)

The first screen: the name across the full width, the **live model** over the
middle of it, a rule, and the copy hung beneath. Built from Figma frame
`2691:864`.

It is **not a section of its own** — it is two layers around the scene's own
pinned stage, passed to `<ModelViewer>` as `behind` and `front`. One screen with
the model in it, not a title card followed by a second copy of the same subject.

| Component | File | Role |
|-----------|------|------|
| `<HeroStageTitle>` | `hero-stage.tsx` | The name — **behind** the canvas, so the model covers its middle |
| `<HeroStageCopy>` | `hero-stage.tsx` | Rule, claim, summary, notes, call to action — **over** the canvas |

> [!warning] Only the **ground** is transparent — never the model
> The pointer's mark and the bottom fade both work by handing the model over to
> the stage's colour, with the wireframe screen-blended against what that
> leaves behind. Turn that hand-over into transparency and both break at once,
> silently. The model is opaque; only the background quad's alpha is gated, and
> it must be written **premultiplied** (`vec4(colour * alpha, alpha)`) because
> the context is `premultipliedAlpha` and that material has no blending — write
> straight alpha and the ground washes over whatever is behind the canvas.
> ADR-0074.

> [!warning] The layers belong to the first screen, not the runway
> They live in a stage pinned for seven viewports, so their opacity is driven
> by the scene's own scroll progress and gone by a tenth of it. Without that
> they sit over the tide and the letters for the entire scroll.

> [!warning] The copy layer must stay `pointer-events-none`
> It covers the canvas, and the scene's mark is drawn by hovering the model.
> Only the two links take the pointer back. Forget it and the hover dies
> silently — nothing errors, the mark simply never appears. ADR-0073.

Both layers share one `55.5556vw` frame centred in the pinned stage: that is
what keeps them in register and what makes the whole composition fit one screen
at any window shape.

> [!important] It is measured in `vw`, deliberately outside the adaptive rem grid
> Every length is its Figma pixel over 1440, times 100. The grid re-bases the
> root font-size per breakpoint (1440, then 1024, then 360), which is right for
> a layout redrawn at each width and wrong for one drawn once at 1440 — below
> 1024 it inflates the composition against its own design width and the name
> clips at both edges. The stage's height is `55.5556vw` for the same reason,
> not `100lvh`. When this screen gets a mobile drawing, it should go back to the
> grid. ADR-0072.

The order of the layers **is** the design: ground, rule, name, then the portrait
over the top of it — the head covers the middle of the word on purpose.

## Work gallery (`gallery/`)

The white section after the hero: cards travelling bottom-to-top round a **box**,
closed by the accent plane rising from below — which carries the page's closing
screen up with it. The strip itself shows **no visible UI** — no heading, no
labels — so it is read entirely as a strip; everything on the plane belongs to
the closing screen, not to the gallery.

| Component | File | Role |
|-----------|------|------|
| `<CurvedGallery>` | `curved-gallery.tsx` | The section: scroll runway, sticky stage, the travelling strip, the closing panel's rise, an `overlay` layer with its own window on the turn, and the `closing` screen carried on the panel |
| `<GalleryCard>` | `gallery-card.tsx` | One card, as a stack of horizontal **bands** so it can bend round a corner — an image when the item has a `src`, a bare placeholder surface when it does not |

> [!info] The card's `title` is its **alt text**, not a caption
> It is never drawn. The item carries `role="img"` with `aria-label={title}` and
> the image under it takes `alt=""`, so the two do not announce twice. Describe
> what is in the frame; a heading repeated across seven cards tells a screen
> reader nothing. Artwork lives in `public/assets/gallery/` named for the card
> id it belongs to.

Geometry lives in `src/lib/gallery/gallery.config.ts`, in `rem` so the adaptive
grid scales the whole arrangement with the viewport.

**The path is a square seen edge-on**: a flat front face, a crease at each end
of it, and a side face running **forward, out of the screen**. The crease reads
as square but is not built square — its radius is one band, which is the floor
below which a fold made of discrete bands breaks up in motion (ADR-0103). The box
opens towards the reader — the front face is the far wall, at `z = 0` on the
perspective plane — so a creased card comes at you and what shows at the top and
bottom of the frame is the underside of a face passing overhead. Positive travel
is **down** the screen, so a later card starts lower and rises into place.

Everything in `box` is an **arc length in rem along that path**, measured from
the middle of the front face — not an angle. `seatAt` maps a travel distance to
a position and a facing across three cases (face, corner, side) that agree at
their joins in both.

Four things worth knowing before changing any of it:

- **It was a cylinder, and an arc cannot do this.** A circle bends every card by
  the same small amount and none of them squarely: there is no flat run and no
  corner, so "square-on in the middle, folded at the ends" is not a shape it can
  make. ADR-0067.
- **There is no single transform any more.** A circle is the same shape from
  every angle, which let the whole strip move by turning one parent. A square is
  not, so each card is placed individually every frame — eight style writes
  instead of one. That is the price of having corners at all.
- **A card bends; it does not turn.** It is a stack of `card.bands` horizontal
  bands, each seated on the path at its *own* arc length, so a card straddling
  a corner creases — its top lying flat on the box's top face while the rest of
  it still stands square to the camera. One element can only be rotated, and a
  rotating card reads as tumbling however good the path is: five rounds went
  into the path before that was spotted. ADR-0070.
- **`corner` is 0 — the crease is a right angle.** Bands hinge one after
  another, so the corner needs no length to stay continuous, and the reference
  shows a picture that is flat and then abruptly perpendicular. The arc is still
  implemented, so a rounded corner is one number away.
- **`faceHalf` decides two things at once**, which is why it kept being wrong:
  how many cards stay square to the camera, *and* whether there is dead stage
  between the strip and the frame. At 28, against a viewport about 32rem from
  middle to edge, the face runs almost to the edge and the crease lands just
  inside it. ADR-0071.
- **The forward run is capped** by `box.reach`. Bands on a side face draw almost
  nothing, but z climbing without limit takes them through the camera plane, and
  a plane that reaches the camera smears across the viewport rather than
  disappearing.
- **Bands bleed into each other by `card.bandBleed`**, both ways, and it is a
  **length** rather than a share of the band. Eighteen boxes stacked edge to edge
  round apart into hairlines, and the crease leaves a wedge where the fold
  quantises to a band boundary; one bleed closes both, but only if it does not
  shrink when `bands` grows and only if it reaches upward as well — the folded
  band's own bleed extends in *depth*, not on screen. ADR-0101.
- **`corner` must finish on screen.** It sets how long the ninety degrees take.
  Too small and a card snaps from square-on to edge-on between one seat and the
  next; too large and the fold runs off the top of the viewport before it
  completes — the same "they never turned" symptom, from the opposite cause. At
  9 it completes 33rem from the middle against a viewport about 32rem from
  middle to edge — on purpose, so a card finishes turning as it leaves the
  frame and what shows at the top and bottom is a folded card almost edge-on.
- **`faceHalf` decides how many cards stand still**, and getting it small is
  what makes the strip read as *flipping* rather than wrapping. At 13 only the
  centred card was flat and both neighbours were mid-corner: always turning,
  never standing. At 24 the face carries three cards flat. ADR-0069.

> [!tip] When a geometry cannot be seen in the app, write a static probe
> The preview pane renders static HTML perfectly; it is the animated canvas
> that composites black. A standalone page in `public/` with the same CSS
> structure, the same seat maths and its parameters on the query string gives
> back a visual loop in a couple of minutes, and these bugs are arithmetic —
> a page with no framework, no animation and no scroll engine reproduces them
> faithfully. Delete it once it has answered. ADR-0069.

**The two phases overlap, on purpose.** The turn's marker is the whole section
(`top center` → `bottom bottom`): it starts once the section has risen half a
viewport, and keeps going to the handover so the strip never parks and waits.
The panel's marker starts partway down (`scroll.riseStartViewports`) and climbs
over the still-moving strip.

The strip also travels *past* the last card by `overshoot` card steps. Stopping
on the final card leaves it parked dead centre, which reads as the strip
breaking down; the overshoot carries it up and out of frame instead, by which
point the panel has covered most of the screen.

**The closing panel is not a card.** It is a full-width plane rising from below,
tilted away so its top edge is foreshortened, unwinding to flat as it lands. It
has its own perspective context, which is what lets it tilt independently of the
arc and paint over it. See [[decisions-log]] ADR-0030.

The heading prop is never rendered visibly: it names the section for assistive
technology and keeps the heading outline intact as an `sr-only` `<h2>`. Card
titles are `alt` text for when artwork arrives, not captions.

**It drives its own transforms** rather than using `<SpringTrigger>`, which does
not work — see [[decisions-log]] ADR-0029, and the two traps that come with
writing transforms by hand (re-apply after every render; a trigger element needs
real width).

> [!important] `--foreground` inverts with the OS theme; this stage does not
> The gallery sits on the permanently-white `--scene-surface`, so `text-foreground`
> renders near-white on white in dark mode. Use `--scene-surface-foreground`.

> [!note]
> `components/ui/` (design-system primitives) does not exist yet — create it when
> the first primitive is added. See [[folder-structure]].

## Related

[[component-conventions]] · [[components/animation-springs]]
