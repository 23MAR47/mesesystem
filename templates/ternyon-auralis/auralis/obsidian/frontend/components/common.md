---
tags: [frontend, stable]
updated: 2026-07-28
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

> [!note]
> `components/ui/` (design-system primitives) does not exist yet — create it when
> the first primitive is added. See [[folder-structure]].

## Scene UI overlay — `hero-overlay/`

The **glass UI** laid over the particle scene on the home view, recreated from the Figma "Ternyon" frames (styles/spacing preserved, copy rewritten — brand **Auralis**). Lives in
`src/components/common/hero-overlay/`; six pieces, all rendered inside `HomeView`'s fixed scene
wrapper (above `ParticleScene` + `HeroLights`):

| File | Role |
|------|------|
| `site-header.tsx` | `<SiteHeader>` — **persistent** translucent blurred nav bar pinned to the top (`fixed inset-x-0 top-0 z-20`): left `<nav>`, centred brand `<Link>` flanked by gradient hairlines, right `<nav>`. Shared by all sections so it doesn't flicker on cross-fade. `pointer-events-auto`. Below `md` the two navs and the brand's hairlines are dropped and it collapses to **brand + burger** (`MobileMenu`) — the Figma composition needs the full width, and at phone width the rules squeeze the wordmark to nothing |
| `mobile-menu.tsx` | `<MobileMenu>` — **client leaf**. The burger and its full-screen black panel, mounted only below `md`. Burger rules cross into an X, the panel fades/lifts in, links stagger via `useTransition`; the page is locked (`overflow: hidden` on `<html>`) while open and `Escape` closes it. ⚠️ **Panel and close button are portalled to `<body>`** — the header carries `backdrop-filter`, which makes it a containing block for `fixed` descendants (rendered in place, `inset-0` resolved against the 3.25rem bar and the panel was a strip), and the pinned scene container is `isolation: isolate`, so the header's `z-20` is scoped inside it and can never rise above a body-level panel |
| `hero-overlay.tsx` | `<HeroOverlay>` — the **glyph** section body (frame 767:162): two hero words (**IMAGINE / MANIFEST**) kept at the **exact vertical centre** (`top-1/2 -translate-y-1/2`, one pinned to each edge), and a bottom-pinned footer — 2×2 glass tag pills, a hairline, tagline + two CTA `<button>`s |
| `hand-overlay.tsx` | `<HandOverlay>` — the **hand** section body (frame 742:290): a top-left `<h2>` heading pinned below the header, and a bottom-pinned cluster — tagline + 3 stats (value + label, left-border accents in `border-overlay-strong`) on the left, a right-aligned heading on the right |
| `wave-overlay.tsx` | `<WaveOverlay>` — **client leaf**. The **wave** section body (frame 793:256): everything in the **right half** (the wave falls to the lower-left) — a right-aligned `<h2>` near the top, a tagline, and a **2×2 `<ul>` of solid white work cards** (`bg-overlay-ink` + black `text-overlay-solid`, each a number + one-line uppercase description). The card block spans `top` → `bottom` as a `flex-col` and the grid is `flex-1 grid-rows-2`, so the **cards stretch to the viewport height**. Right-anchored with `max-w-[calc(100vw-3.75rem)]` so it hugs the right and never overflows. **Two layers: the root carries the _clip_, an inner content layer carries the _drift_.** One rAF sets both from the shared progress. The **clip** (`wipeLineAt`) goes on the root, which is `inset-0` (exactly the viewport) so the line's `y` in % of viewport height *is* the local percentage — no geometry to measure or cache — and it lives in **screen space**, holding its line. The **drift** (`waveDriftAt`, a `translateY`) goes on the content *inside* it, because `WipePass` slides the wave view down as the tree wipes in and the UI has to travel with its scene; putting it on the root would drag the cut along with the content. That content layer also carries **`waveUiOpacityAt`**, which retires the wedge the tilted line covers last (the heading's corner) so this act never lingers on top of the tree — the clip still does the disappearing, this only disposes of the remainder. **Disappears by _clip_, not opacity:** `none` while the line is off the bottom, an empty polygon once it's past the top. ⚠️ It was briefly clipped **per element** (to protect the cards' `backdrop-filter`, since an ancestor clip is a backdrop-root that kills descendants' blur). The cards are opaque now, and per-element clipping **broke** once reveals landed: it cached `getBoundingClientRect()` including the reveal spring's `translateY` (so every local % was offset → a wrong, per-card mask), and it put `clip-path` on the same elements carrying `filter: blur()` (so a card clipped to a sliver smeared into a horizontal band over the next scene). Keep the clip and the animation on **separate** elements. `ScrollFade` gives it no `disappear` window |
| `tree-overlay.tsx` | `<TreeOverlay>` — the **tree** (final) section body (frame 808:156): a centred `<h2>` **ENVISION** near the top, a tagline pinned to **each edge** at mid-height — **two different lines** (what the studio does / the invitation); the Figma frame repeats one placeholder on both sides, which on the real page just reads as a duplicated paragraph. Both are written to wrap to **three lines** in the `20rem` column so the two columns balance the tree; re-check the wrap (count the rendered `.line-word` tops, not the `<p>` height — the engine's sr-only span throws off a naive count) if the copy, the column width or the type scale changes, and a bottom-centre **glass form bar** (`bg-overlay-glass` + the stronger `--blur-overlay-form`) — Name / Email `<input>`s + a solid-fill "Start a Project" `<button>` whose "live" indicator is a **blinking green square** (`<LiveDot>`). A visual mock (no backend). Fades **in** after the tree wipes in; never fades out (last act) |
| `hero-overlay/live-dot.tsx` | `<LiveDot>` — **client leaf**. The small **green `overlay-accent` square** on the tree CTA that **blinks** (opacity pulse). Spring-driven `useSpring` loop with `reverse` (hard rule #1 — no CSS keyframes), so `TreeOverlay` stays a Server Component |
| `scroll-fade.tsx` | `<ScrollFade>` — **client leaf** that cross-fades a section with scroll. A per-frame rAF reads the shared `getScrollProgress()` (same cadence as the scene) → opacity ramps up over `appear` and down over the **optional** `disappear` (`[start,end]` real-progress windows), set immediately via `@react-spring/web`; `visibility:hidden` when faded so it never intercepts the pointer. It must use the **shared** progress: four of these mount at once, and each measuring its own `scrollHeight` was a forced layout per instance per frame — see `utils/scroll-progress.ts`. ⚠️ **A zero-width window is a _step at `start`_, not a no-op** — that's what makes `appear={[0,0]}` mean "on from the start", but it also means `disappear={[1,1]}` reads as *fully faded out at progress 1* (it blanked the finale UI at the bottom of the page and blinked as Lenis settled there). For "never fades out", **omit `disappear`** |

**How they fit together (`HomeView`).** `SiteHeader` is always on; each section body is wrapped in a
`ScrollFade` so it shows only while its scene is framed — hero fades out as the X bursts
(`[0.05, 0.14]`), hand fades in as the hand frames (`[0.34, 0.41]`) and out as the wave morph begins
(`[0.47, 0.53]`), the **wave** UI fades in once the curtain has formed (`[0.6, 0.67]`) — but is
**clipped away by the tree wipe** (a `clip-path`, not an opacity fade — see its row), so it takes
**no `disappear` window at all** — and the **tree** UI fades in once the tree has wiped in
(`[0.93, 0.98]`) and, as the last act, likewise takes none. Neither may use `[1, 1]` to mean "never":
that's a step, and it blanks them at exactly progress 1 (see the `scroll-fade.tsx` row).
All are `pointer-events-none` except the header/CTAs, so the scene
keeps its cursor repulsion. The heading text is decorative (`aria-hidden` / plain) except the section
`<h2>`s; semantics live in the view's single `sr-only <h1>`.

**Reveal.** The section bodies don't just fade with `ScrollFade` — their text and blocks animate in via
[[#Reveal — reveal|`RevealText` / `RevealItem`]] (rise + blur + fade, reversed on exit), bound to each
act's scroll marker. The hero's plays in once on mount instead.

**Responsive.** The overlays were laid out from desktop Figma frames, and the [[design-system|adaptive
grid]] only scales rem proportionally — it can't re-compose. So each act carries a **mobile-first
layout with `md:` restoring the desktop one**: the hero words stack centred instead of pinning to
opposite edges; the hero footer goes vertical with full-width CTAs; the hand act drops its second
4rem heading (nowhere to sit beside the stats); the wave block spans the full width, keeps its 2×2
grid, and its heading gets a **left bound** (the engine's tag is a wrapping flex row, so a
right-anchored heading with no left bound grew off the screen edge and collided with the tagline);
the tree shows one centred tagline instead of two flanking the trunk, and its form stacks above a
full-width CTA. Header: see `MobileMenu` above.

**Tokens & type.** All colours are `overlay-*` tokens (incl. `--overlay-strong` for the stat rules)
and blur amounts `--blur-overlay-*` in `globals.css` (sourced from the frames); the typeface is
**Google Sans Flex** (`font-display`, `next/font/local` in `layout.tsx`). Sizes/spacing are one-off
`rem` utilities (they scale with the [[design-system|adaptive grid]]); fixed-width pills/buttons use
`whitespace-nowrap` so relabelled copy stays on one line. **Gotcha:** `@theme` token edits need a
`.next` purge + dev restart to show up — Turbopack caches the built CSS.

## Reveal — `reveal/`

How everything in the scene overlays **appears and disappears**. One motion language: rise **from
below** through a **blur + opacity** dissolve, and the **exit is the entry played backwards**.

| File | Role |
|------|------|
| `reveal-text.tsx` | `<RevealText>` — **client leaf**. All copy animation, via `spring-text-engine` (hard rule #1 — never a hand-rolled text component). `variant="heading"` splits **per letter** (tight stagger, section `h1`/`h2`s); `variant="copy"` **per word** (looser — taglines, descriptions, labels). `act` picks the on-screen window that plays it in and out |
| `reveal-item.tsx` | `<RevealItem>` — **client leaf**. The **non-text** counterpart (glass pills, CTAs, stat blocks, work cards, the contact bar) on `<Inview>`, rising and fading on the same soft spring. `index` + `count` stagger a group and run its **exit in reverse order**. Forwards `data-*` etc. **No `filter`** — see the warning below |
| `act-window.ts` | `useActActive(act)` — the switch everything hangs off: a per-act **on-screen boolean**, published from the shared frame-memoised scroll progress through `useSyncExternalStore` (**one rAF** for every reveal on the page). `ACT_WINDOW` holds the ranges. Every act is additionally gated on `isPageRevealed()` from `scene-ready.ts`, which the preloader flips via **`markPageRevealed()`** as it leaves |

**Why a boolean and not scroll progress.** Every overlay sits in the `fixed inset-0` scene container, so
it is *permanently* in the viewport — an `IntersectionObserver` fires once at mount and never again. The
obvious alternative, `TextEngine`'s `mode="progress"` against a marker in the scroll spacer, **cannot
animate an exit while scrolling forward**: progress only ever increases, so it can only walk an
animation back out on scroll-*up*, and the engine freezes its state outright once the marker leaves the
viewport (`useLoopInView` pauses the loop). Both engines expose the right switch instead — for every
mode except `manual` (banned, hard rule #3) they call `playIn`/`playOut` off their **`enabled`** prop,
and since the elements are permanently "in view", `enabled` is the *only* thing gating them. So the act
window drives `enabled`, and in/out both animate in both scroll directions. Act windows end slightly
**before** the matching `ScrollFade` disappear window, so the reveal's own exit is what reads and the
block fade only mops up behind it.

**Softness** is one shared spring — `{ mass: 1, tension: 88, friction: 30 }`. Friction well above
tension means it eases up and settles rather than snapping or overshooting; staggers (22 ms letters /
45 ms words / 80 ms items) carry the flow.

> [!warning] Don't put `filter` on anything that a clip has to cut
> Any non-`none` filter — **including `blur(0px)` at rest** — promotes the element to its own composited
> layer, and a promoted layer takes an **ancestor's `clip-path` a frame late**. That's why the wave
> cards kept drawing past the tree-wipe line while scrolling even though the clip itself was
> pixel-exact (verified with a debug hairline drawn from the clip values: it sat right on the scene's
> wipe edge, at rest *and* in motion). It only showed while moving, so it read as "the mask lags".
> `RevealItem` therefore animates **`y` + `opacity` only**; `RevealText` keeps its blur because
> letters/words are never the thing being clipped mid-motion.

> [!warning] Two `TextEngine` constraints that shape the markup
> - It forces **`position: relative; display: flex`** on its own tag, so **layout/position classes must
>   go on a wrapper** — put only typography on the engine, or an `absolute`-positioned heading silently
>   falls back into normal flow. That's an **inline** style, so it also beats every `display` utility:
>   `md:hidden` on a `RevealText` does nothing (a mobile-only heading rendered on desktop too, stacked
>   under the real one). Responsive show/hide belongs on the wrapper.
> - That tag is a **wrapping flex row**, so a two-line heading can't be two `block` spans in one engine
>   (they'd sit side by side, and `w-full` can't resolve against a content-sized container). Use **one
>   engine per line**, stacked by the semantic element — which also keeps a single `<h2>`.

> [!important] Exits are instant unless you say otherwise — on **both** engines
> `<Inview>` **and** `TextEngine` default `immediateOut` to **`true`**. In `TextEngine` that value is
> passed straight through as the spring's `immediate` flag in `playOut` *and* zeroes every out-delay, so
> the text snaps to hidden with no motion and no stagger — leaving only the `ScrollFade` block opacity
> visibly moving, which reads as "the exit is just a fade". Reveals pass **`immediateOut={false}`** on
> both, so the exit is the entry played backwards, staggered.

The **hero** is no different: it's on screen at progress 0, so its window starts there — the intro plays
and then **reverses out** as the X bursts.

> [!important] Acts don't start until the preloader lets go
> The hero's window opens at progress 0, which is also where the page sits **behind the loader**. Left
> alone, its whole intro played out under the veil and the page was uncovered already assembled — the
> entrance simply never seen. `act-window.ts` therefore holds every act `false` until
> **`markPageRevealed()`** (called by `Preloader` as it starts fading); its rAF loop reads the flag
> every frame, so the hero begins on the next one rather than waiting for the first scroll. The server
> snapshot is `false` for the same reason: the first HTML must carry the `Out` state. The scene gates
> the glyph's materialise on the same signal, so DOM and 3D start together.

## Preloader — `preloader/`

`<Preloader>` — **client leaf**. A black hold over the page until the 3D scene is worth looking at:
the wordmark, one hairline rule that fills, and a three-digit readout. Minimal, and in the site's own
language (`--overlay-solid`, `font-display`, extra-light letter-spaced caps), so it reads as the same
object as the mobile menu's panel. `z-[70]` — above the scene, header and menu panel, below the
cookie modal (`z-100`). `?preload` holds it open for design review (same convention as `?debug` /
`?tune`).

It waits on a **real signal**, not a timer: `scene-ready.ts` publishes three gating steps — the hand
cloud, the tree cloud, and the scene's warm-up pass — via `useSyncExternalStore`, so the hand-off
lands after the shaders have compiled, which is the stall the warm-up exists to hide. A **failed**
asset still counts as settled (`.finally`), so a missing file can never trap the page behind a loader.

As it leaves it calls **`markPageRevealed()`**, which lives in the same module — `scene-ready.ts`
carries the hand-off in **both** directions, because two unrelated consumers wait on the return leg:
the DOM reveals (see [[#Reveal — reveal|Reveal]]) and the scene's own **glyph materialise**. Both poll
`isPageRevealed()` from a rAF loop they already run, so it needs no subscription.

> [!warning] Three things this got wrong, all worth remembering
> - **`useSpring` needs an explicit `from`.** Without it the veil animated *up* from 0 and faded **in**
>   over the page it was meant to hide.
> - **`onRest` closes over the render that _started_ the animation.** Reading `progress` inside it saw
>   a stale, pre-completion value and the veil never left. The exit now polls the spring's own value.
> - **Don't gate an animation on a wall-clock `setTimeout`.** Springs ride rAF, which a background tab
>   freezes, while `setTimeout` keeps running — a timer fired against a bar that hadn't moved and
>   yanked the veil mid-travel. The rAF poll is measured in the same clock the spring runs on, so it
>   can neither fire early nor hang.
>
> Also: the site's soft spring (tension 88) is heavily overdamped and *crept* to the target, holding
> the page ~15 s after the assets were in. The bar uses a snappy one (tension 260) — it only has to
> smooth three discrete jumps.

## HeroLights — `hero-lights/`

`<HeroLights>` — a client leaf overlaid on the hero (over the particle scene in
`HomeView`) that adds three blended **light-flare** layers which **parallax the cursor**.
Lives in `src/components/common/hero-lights/`.

| Layer | Asset | Blend | Placement |
|-------|-------|-------|-----------|
| Light rays | `/assets/lights/light_1.png` | `mix-blend-mode: overlay` | centred square `RAYS_SIZE` (`130vmax`), `bg-cover` |
| Corner glint | `/assets/lights/light_2.png` | `mix-blend-mode: plus-lighter` | bottom-left, feathered |
| Bokeh flare | `/assets/lights/light_3.png` | `mix-blend-mode: overlay` | oversized `inset: -10vmax` (`BOKEH_OVERHANG_VMAX`), `bg-cover` |

**Flares change with the acts (two hand-offs).** `light_1` + `light_2` own the head-on **X/hand**
view; `light_3` (bokeh) owns the **wave**; and the **tree** (last act) gets `light_1` + `light_2`
**back — like the first scene**.
- **X/hand → wave** (camera crane-up): a plain **opacity crossfade** (`handoffAt`) — the first two
  fade `1 → 0` (`flareOpacityAt`), `light_3` fades `0 → 1` (`bokehOpacityAt`), done just before the
  wave forms.
- **wave → tree**: the flare sets swap **through the *same wipe* that swaps the scenes** (not opacity).
  `wipeMaskFields` reconstructs the tree wipe's tilted screen-space line (`lineC = vUv.y +
  (vUv.x−0.5)·wipeTilt`, `uWipe = −0.3 + w·1.6`); `edgeFor` solves each layer's `linear-gradient` cut
  (`--flare-wipe-angle` + `--flare-edge-rays/-glint/-bokeh`, published per-frame on **this component's
  own root element** — *not* `:root`, so the invalidation stays inside these three layers instead of
  dirtying every element on the page each frame; the wave **UI overlay** clips to the same line by
  reading the shared `wipeLine` module) so `light_3` is masked to the **wave side** of the line and
  `light_1`/`light_2` to the **tree side**. As the wipe sweeps the tree in, the flares hand over
  exactly along it. **The cuts are _hard_** (both gradient stops at the edge — not feathered): a
  feathered sliver overlapped the opposing-side mask, so both flares blended in that band → **double
  `overlay` darkening = a dark blurry seam**; a hard cut gives every pixel exactly one flare and the
  1-px boundary hides in the crisp scene wipe. Outside the transition the edges sit at "no cut"
  (`NO_CUT` tree-side / `ALL_CUT` wave-side → fully shown), and past the wipe the bokeh's edge flips to
  `NO_CUT` so its **mask alone** hides it.

> [!warning] The mask must be written **with** the opacity, never separately
> A flare's visibility is the product of its `mask-image` **and** its `opacity`, and both flip at the
> wave↔tree boundary. They used to be written by different loops — masks straight to the DOM from this
> component's rAF, opacities through react-spring, which flushes its style writes in its **own** rAF
> pass, a frame later. For one frame the pair disagreed ("mask says show, opacity hasn't dropped"), and
> `light_3` is a **full-screen `mix-blend-mode: overlay`** layer, so that single frame flashed the whole
> scene — once per crossing, in both directions. So each spring now carries `angle` + `edge` and the
> `mask-image` is an interpolation off them (`to([angle, edge], …)`): one spring, one flush, always
> consistent. For the same reason the mask is **always a gradient** — switching `mask-image` to/from
> `none` changes the property's *type* and forces a layer rebuild, which glitches at that same boundary.
`light_3` needs no *roll* (the camera's turn is done by its act), but it is **oversized** (`inset:
-10vmax`) so its cursor parallax during the wave never exposes a viewport edge (see Motion, below).
The flares parallax in **every act except the wave→tree wipe** — including the tree finale.

**Blend, not tint.** The overlay rays *darken* the light studio and add the bright
diagonal streak (that's why the hero reads darker/more dramatic than the raw scene);
the plus-lighter glint *adds* light in the bottom-left. Blend modes are set inline
(`mixBlendMode`) — the layers blend down onto the scene canvas. The glint is feathered
with a `radial-gradient` mask (anchored bottom-left) so the added light fades out instead
of showing a hard rectangle.

**Rolls with the camera.** During the first transition the 3D camera **banks** — a gentle
out-and-back lean (`roll · sin(π·ep)`, peaking mid-flight, upright again by `arrive`; the old full
2π barrel roll was retired as tacky) — so the flares are **rotated about the screen centre by the
same angle** (otherwise they sit screen-locked while the world tilts — an obvious disconnect). The
roll is read from `window.scrollY` via the **same formula the scene uses** (`sceneConfig.sequence`:
`camera.roll` on the sin envelope over
`[dollyStart, arrive]` in the remapped `sp`), and driven from a **per-frame `requestAnimationFrame`
loop — the same cadence the scene reads scroll** — set **immediately** (no spring). This
**frame-locks** it to the camera: a `scroll`-event driver lags the scene's rAF by a frame, and at
the lagged angle the overlay looks out of sync. Two subtleties:
- The rotation is applied to **each layer's own transform, never a wrapping div.** A transformed
  wrapper creates a **stacking context that isolates `mix-blend-mode`** from the canvas — the flares
  stop blending and the hero goes black. (A layer having its *own* transform is fine; it still
  blends against its backdrop.)
- **`light_1` is authored _square_; the rays layer is an oversized centred square, so rotation never
  exposes an edge — no mask, no crop.** The rays layer rolls with the camera's bank (and, at load,
  swings ~9° into place as its entrance). Earlier this exposed the layer's edge as a moving border (`light_1`
  samples `alpha 255` centre → `~39` mid-edges → `~3` corners, so the ~15% mid-edge steps to 0 at the
  layer boundary). The **root cause was the layer being viewport-shaped** (`inset-0`, i.e. landscape):
  a rotated rectangle leaves gaps at the frame corners. Fix that honours the square source art: the
  rays layer is a **centred square of `RAYS_SIZE` (`130vmax`)** — a centred square only covers the
  viewport at *every* rotation angle when its side ≥ the viewport diagonal, and `130vmax` clears that
  for all common desktop aspects (16:9 needs ~115%, 4:3 ~125%). So `light_1` is shown **in full,
  uncropped and unmasked**, and no edge is ever revealed as it turns. (Dead ends, for the record:
  masking the edges to `0` with a `radial-gradient(ellipse closest-side …)` **inscribed an ellipse and
  hard-clipped the mid-edges into a visible oval cropping the scene**; a rectangular two-gradient
  `mask-composite: intersect` feather avoided the oval but still *cropped* the source art; and a
  `bg-cover` scale-up *enlarged the blob so its fade-ring became a moving arc*. All removed in favour
  of the oversized square.) The rays layer rotates about its own centre (= screen centre, via
  `left/top-1/2` + negative-half margins); the offset glint rotates about the screen centre via a
  `transformOrigin` set to that point in its box.
- **The flares come and go with the acts — all through _transparency_ (`flareOpacityAt`).** They
  belong to the head-on X/hand view. As the camera cranes up off the hand (from `arrive` onward in
  the remapped `sp`) each layer's `opacity` fades `1 → 0` over `[arrive, arrive + FLARE_FADE_SPAN]`
  (`FLARE_FADE_SPAN` 0.42 ≈ real progress 0.40 → 0.71 — a slow fade that only finishes **just before
  the wave forms**, so the flares linger through the whole crane-up + vortex; gone before the wipe).
  In the **tree** section they **fade back in**, synced to the **back half of the wipe** (from
  `wipeRange[0] + TREE_FADE_START_FRAC·span` to `wipeRange[1]`, so they arrive as the tree finishes
  revealing and don't darken the still-prominent wave earlier in the wipe). Both fades are `opacity`
  only — **no spatial mask**. (An earlier version spatially *masked* the flare along the wipe line —
  computing the tilted `linear-gradient` angle + cut to match the tree's screen-space wipe exactly —
  so it wiped in *with* the tree. But `light_1` is a **soft image**: a hard cut through it still read
  as a **soft/gradient seam** at the line, no matter how crisp the mask — the mask was verified crisp
  on a solid fill. A uniform opacity fade leaves no seam at all. All the `wipeMaskFields`/`edgeFor`
  angle/edge machinery was removed.) Applied **per-layer** — a wrapper with `opacity < 1` would form
  a stacking context and cut the layers' `mix-blend-mode` off the canvas (same trap as a wrapper
  transform, above). Set immediately each frame from the same scroll rAF as the roll.

**Motion — spring parallax (hard rule #1).** Motion is `@react-spring/web`, but no
`springs/` component fits a *cursor* trigger (they're scroll / hover / in-view), so it
uses **`useSpring` directly**: a window `pointermove` listener sets each layer's spring
target and the springs smooth the follow. The layers take **different-sign / -magnitude**
`*_DRIFT` targets → opposite-phase parallax with a depth feel. It's
`pointer-events-none` (so the scene's own cursor repulsion still works) and only runs on
a **fine pointer** (`matchMedia("(pointer: fine)")`) so a touch drag doesn't shift it.
**Gated off through the wipe — and only there.** The pointer listener and the scroll rAF share one
effect and one `applyParallax(progress)`, which zeros the drift inside **`isWipeMasked`**
(`[treeStart, wipeRange[1])`): there the layers are spatially masked to the wipe line, a layer's mask
travels with it, and per-layer drift would slide the tree-side and wave-side cuts apart and open a
**dark seam** where they should meet. Everywhere else — X/hand, the **wave**, and the **tree finale**
— nothing is masked and the layers parallax freely. (Gating on the mask rather than on "anything past
`treeStart`" is what gives the finale its parallax; the springs ease the drift out well before the cut
is on screen, since `uWipe` starts below the frame.)

**Each layer's drift is bounded by its own slack**, and the three budgets are very different:
`light_1` is a `RAYS_SIZE` (130vmax) centred square whose inscribed circle clears a 16:9 viewport
diagonal by only ~87 px — that, not the box, is what `RAYS_DRIFT` has to fit inside. `light_3` is
**oversized** (`inset: -BOKEH_OVERHANG_VMAX vmax`, 10vmax/side ≈ 144 px at 1440×900), and `edgeFor`
uses that enlarged box so its wipe cut still lands on the line. `light_2` is the tight one: its box's
top and right edges sit *inside* the viewport and only `GLINT_FEATHER` hides them, so raising
`GLINT_DRIFT` is the one change here that can actually expose a hard edge.

## Grain — `grain/`

`<Grain>` — **film grain over the 3D scenes, below the UI.** A single non-interactive `<div>`: a
tiled greyscale **SVG `feTurbulence`** noise (inline data URI, `feColorMatrix saturate 0`),
`mix-blend-mode: overlay` at `--grain-opacity` (globals.css, 0.13). It sits at **`z-[5]`** inside the
pinned scene container (`home.tsx`), so it textures the canvas **and** the flares (both at auto `z`)
but renders **below** the UI overlays (`z-10`) and header (`z-20`) — the UI stays crisp. **Static**
(a texture, not motion, so no CSS keyframes — hard rule #1); it reads as alive because the scene
moves underneath it. It's over the scene, not a wrapper around it, so the flares' `mix-blend-mode`
still blends against the canvas.

## TuningPanel — `tuning-panel/`

`<TuningPanel>` — a **dev-only live control panel** for the pink bloom particles. Rendered in
`HomeView` but **only mounts with `?tune` in the URL** (a dev tool, so plain inline styling — not the
`overlay-*` design tokens). Fixed top-left, `pointer-events-auto`. Sliders for the **pink particles**
(colour + glow) and the **bloom pass** (threshold / strength / radius); a native colour input for the
hue. It writes a tiny shared **`scene/tuning.ts`** store (seeded from `sceneConfig`, runtime-only)
that the scene reads **every frame** in `renderFrame`: `scatter.color`/`.glow` are mutated **by
reference** (so `updateCloud`'s next `scatterTint.set(...)` picks them up — recolouring the burst,
vortex, and hand scan) and the bloom pass takes the values via `BloomPass.setConfig()`. So edits are
instant. `scene/tuning.ts` is the seam — anything wanting live tweaks reads it there.

## Scene — 3D particle glyph (`scene/`)

`<ParticleScene>` — a full-viewport **3D scene** rendered with **vanilla
three.js**, driven entirely by **scroll**. It opens with the volumetric "X" **assembling out of
the camera** (every particle flies in from around the viewer with a pink comet trail, on the
preloader hand-off) inside a containment **lattice** that **weaves itself in line by line**
(`uBuild`, ADR-0039) — no ground, no podium discs, no ring fixture; each act is its lattice
floating in the gradient haze, faded at both ends, **closing around its figure once the figure
is mostly formed** (hero: after ¾ of the fly-in; tree: after half its scan), pulsing with pink
impulses and turning forever (`field.spin`). Every figure also **rocks** — a slow whole-mesh
yaw about its own axis plus a vertical bob (`sceneConfig.life.*.rock/bob`, `rockMesh` in the
render loop), gated off during the scroll choreography — **tilts a few degrees toward the
cursor** (`life.cursorTilt`, low-passed pointer NDC → yaw + pitch; zero on touch, and kept
under ~0.1 rad so the unrotated-rest pointer simulations don't visibly miss) — and the **hand
spins a full eased 360°** as it scans in. As you
scroll, the camera flies forward with a **gentle mid-flight bank** (`roll · sin(π·ep)` — out and
back, never a full turn) while the glyph bursts
into glowing purple strands and the net un-weaves, and a
particle **hand** in its own lattice emerges from the fog ahead. In the next phase the camera
**cranes up** while the hand's particles **rise into several meandering vertical curves (a vortex)
that then settle into a rippling grid wave**. Finally a **screen-space wipe** (a tilted line
sweeping bottom-up) reveals a **particle tree** — its own framed scene — *over* the still-rippling
wave, the camera holding still. It is the home view's hero and lives in `src/components/common/scene/`.
Camera choreography and effect timings are in `sceneConfig.sequence`. See [[decisions-log]] ADR-0017.

| File | Role |
|------|------|
| `scene.config.ts` | The scene's "design tokens" — every colour, light, geometry, and the scroll `sequence`. The single source of truth for the 3D layer |
| `random.ts` | `createRandom(seed)` — deterministic mulberry32 PRNG, so every layout is identical on each run |
| `curl-noise.ts` | `curl()` — divergence-free 3D flow field; particles displaced along it bundle into strands rather than scattering uniformly |
| `particle-cloud.ts` | `buildParticleCloud()` (shared by glyph + hand + tree) → shading, emissive patch, curl-flow, and a **GPU mirror of two `updateCloud` effects** — the **cursor hover** (`uPointerTint` + either the analytic `uPointer/uPointerR/uPointerS` or, with `pointerRelax`, a sampled `uRelaxMap`) and the **bottom-up scan-in** (`uScan/uScanMinY/uScanMaxY`) — for clouds too heavy to re-run per frame, i.e. the ~150k tree: it stays baked, both effects are uniforms + a re-render. Plus **GPU idle life** (`life`: `uTime`/`uFlowTint`/`uFlowAmp`) — a tinted band flowing through each cloud + a whole-form sway, so even the baked tree breathes at rest; per-cloud strengths in `sceneConfig.life`. See the GPU-parity note below. `updateCloud()` → per-frame cursor repulsion + scroll scatter + **hand→wave vertical-vortex transform** + scan-in + the **intro assemble** (fly-in from around the camera: `assemble`/`assembleFrom`/`assembleSpread`/`assembleGlow`, staggered per particle, pink comet trail via the scan-tint path) + idle life |
| `pointer-relax.ts` | `createPointerRelax()` → the tree's hover, **simulated on the GPU**. A ping-pong half-float texture holds one texel per bead (`xyz` world displacement, `w` heat), advanced by one fullscreen pass per frame running `updateCloud`'s hover law *including its easing*; the cloud reads it through the per-instance `aRelaxUv` that `createRelaxUv()` builds (in `buildParticleCloud`, off the same flag as the shader variant — see the ADR's warning). `debugStats()` reads the state back; `?debug` → **`__scene.relax()`** reports it *plus* the tree geometry's attributes and the compiled programs' — this subsystem has no DOM and no CPU mirror, and a healthy simulation still draws nothing if the program it renders with lacks `aRelaxUv`. See ADR-0036, including the program-cache-key trap |
| `glyph-particles.ts` | `createGlyphParticles()` → samples the "X" (union of two bars), turns it about Y by `glyph.rotation`, computes per-particle form normals, and hands them to `buildParticleCloud`. (No scatter destinations — the glyph reassembles directly into the flight corridor streamers, see below.) |
| `hand-particles.ts` | `createHandParticles()` (async) → loads a baked point cloud (`public/assets/hand/points.bin`, `bin_u16`, 4173 pts), **upsamples** it by `hand.density` (12 in config, **scaled down per tier** — 29 211 instances on this desktop; jittered copies) at the glyph's bead size, turns it about Y by `hand.rotation` (−30°, a three-quarter view), and precomputes a per-particle **wave-curtain grid destination** (`buildWaveDestinations` → `scatterDest`) so the hand's own particles crumble through a **fingertip fan of thin curving pink tendrils** into the grid wave. The grid (`wave.columns/rows`) must cover `4173 × density` |
| `tree-particles.ts` | `createTreeParticles()` (async) → loads a baked point cloud (`public/assets/tree/points.bin`, `bin_u16`, 50k pts), **upsamples** it by `tree.density` (3 → ~150k; the bushy tree volume needs the density to read solid) at a small bead size (`particleSize 0.08`). **No wave destinations** and no in-world reveal — it's fully materialised, updated **once at load**, and revealed by the screen-space **wipe** (`wipe-pass.ts`). The final tableau |
| `wipe-pass.ts` | `WipePass` → a post-process that composites two pre-rendered HDR views (`tWave`, `tTree`) by a **screen-space mask**: a tilted line sweeps bottom-up (`vUv.y + (vUv.x−0.5)·tilt < uWipe`), tree below it / wave above, as a **clean anti-aliased cut** (no seam). Each layer is sampled with its own vertical offset (`uWaveShift`/`uTreeShift`) so the two drift at different rates — a **parallax**. Sits before bloom so both sides still bloom. The cut is a clean AA edge — **no scan band / bright seam** on the contour (an earlier glow band read as a hard white gradient) |
| `wipe-line.ts` | `wipeLineAt` + `waveDriftAt` + `waveUiOpacityAt` → **pure functions** mirroring the wipe shader, all keyed off progress. `waveDriftAt` is how far the **wave view slides down** during the wipe (`wipeWaveDrop`, % of viewport height): `WaveOverlay` applies it to its **content layer** so the UI travels with its scene — a stationary overlay being cut while the scene slid out from under it was the real "the mask lags while scrolling". `waveUiOpacityAt` retires the UI's **leftover wedge**: the line is tilted so the **top-right is covered last**, exactly where the heading sits, so it survived to the end of the wipe over an already-complete tree scene ("the layers overlap"); it holds full opacity through most of the wipe, then fades over `w ≈ 0.45 → 0.72`. `wipeLineAt` → where the wipe line sits on screen (`{left, right}` — its `y` in **% of viewport height** at each viewport edge; `>100` = nothing cut yet, `<0` = everything cut). `HeroLights` masks its flares to it, `WaveOverlay` clips its elements to it. **Not a CSS variable** (`--wave-clip-l/-r` on `:root` dirtied the whole document's inherited style every frame and forced a `getComputedStyle` recalc in the consumer) and **not a shared mutable store** either — a writer/reader store let the reader's rAF run first and use the *previous* frame's line, a one-frame skew visible at the wipe. Deriving it independently on both sides from the shared, frame-memoised `getScrollProgress()` removes the ordering dependency entirely |
| `containment-field.ts` | `createContainmentField()` → `{ lines, uBuild, uTime }`: wireframe cylinder, brightest at its **waist** and faded to transparent at **both ends** (`sin(π·t)` shader patch) so it floats weightless in the haze. **`uBuild` (0 → 1) weaves it in per segment** — each line has a bottom-biased random threshold and *draws itself* end-to-end with an accent flash as the value passes it; run backwards to dissolve. **`uTime` drives the pink impulses** — a narrow accent ring rising through the cylinder + sparse per-segment flashes, gated by the build state — and the caller spins every cage forever (`field.spin` on `rotation.y`). Timings: hero net (×`field.heroScale`) **waits** until the X is `intro.netDelay` assembled, weaves over `intro.netWeaveSeconds`, un-weaves over `netRange` on scroll (replaced the `scale.y` collapse that read as a skew); hand net builds `seqP 0.3→0.47`; tree net from **half the tree scan** to its end. See ADR-0039 |
| `dust.ts` | `createDust()` → airborne motes (`Points`) that give the air scale — a custom point shader draws each as a **round** soft mote + fog; they **drift** (float up + sway). Small (`size 0.3`) so they read as fine air, not white blobs. Has a `dust.dispersion` knob for a chromatic prism fringe (currently **0**/off). Returns `{ points, update(time), resize(h) }`. **Three fields** — one at the X (origin), one at the hand anchor, one inside the tree group — so every act sits in the same air |
| `rising-motes.ts` | `createRisingMotes()` → sparse **accent motes** that float up and dissolve (additive, tinted with the shared pink accent). **Fully GPU-driven** — the whole climb/sway/fade cycle runs in the vertex shader off one `uTime` uniform per frame. Two systems: one over the **wave "terrain"** (hidden until the hand act — `seqP > 0.35`), one inside the tree group (fireflies around the finale crown) |
| `backdrop.ts` | `createBackdrop()` → inverted sphere with a vertical gradient shader |
| `bloom-pass.ts` | `BloomPass` → a **custom additive bloom** post-process (threshold → half-res blur → add back), the working stand-in for `UnrealBloomPass` (which renders black here). **Wired, selective**: a high threshold (3.5, on the HDR composer buffer) blooms only the glowing hero beads + scatter/cursor emissive, not the lit cloud (ADR-0024) |
| `particle-scene.tsx` | `"use client"` leaf — owns the renderer, lights, post-processing, the scroll-driven camera + effects, sizing, and disposal |
| `index.ts` | Barrel — `ParticleScene`, `sceneConfig`, scene types |

**Making particles read as a volume.** Points are sampled through the glyph's
*interior*, not just its surface, so the cloud has real depth. A small fraction
is kept just outside the solid, eroding the silhouette into loose debris.

Volume comes from **real light**, not paint. The material is **lit** (`MeshStandardMaterial`,
chalk-matte) and — crucially — the particle `InstancedMesh` **casts and receives shadows**
(`castShadow`/`receiveShadow` both on), so the front/top particles shadow the ones behind,
below, and in the crossing's dense interior: those go dark because the key light physically
doesn't reach them. That self-shadowing is the volume. The scene key is strong (`2.6`) with a
sharp shadow map (**2048²**, tight ±14 frustum, `normalBias` against sphere acne — dropped from
4096² with no visible change at bead scale) so the shadow reads deep and clean. With the ground
and podiums gone the shadow map serves the cloud's self-shadowing *only* — there is no floor for
it to fall on — and the depth pass **re-renders only while the glyph act is live**
(`shadowMap.autoUpdate` gated on `glyphActive`): the hand and tree sit beyond the shadow
camera's 110-unit far plane, so past the burst the pass was rasterising an empty map every frame.

A **faint** directional shade is still baked into `instanceColor` for a base gradient — each
particle carries a **form surface normal** (glyph = a **smooth rounded-box normal** blended
from the box faces by `frac^SHARP` then normalised; hand = `normalize(point)`), lit against
`CloudOptions.lightDirection` via a gamma'd half-Lambert `shade.floor + shade.dir·(0.5 +
0.5·n·L)^1.7`. But it's kept **nearly flat** (`floor 0.82` / `dir 0.18`) on purpose: it's a
subtle base, *not* the volume source — recolouring the form dark reads as paint, not lighting
(the mistake corrected in ADR-0023). Bead geometry is `SphereGeometry(0.5, 8, 6)` — 96 tris,
down from the original 16×12/384: at a few px on screen the silhouettes are identical, and the
cut is ~4× off the frame's dominant vertex load (every cloud pass *and* the shadow pass run
these instances); fog fades the far ones. See ADR-0016 → ADR-0020 → ADR-0021 → ADR-0022 →
**ADR-0023**.
(The particles are **opaque** — a run of transparency experiments this session, semi-transparent
→ soft edges → hollow centres, were all tried and reverted.)

**Oversized "hero" beads (`bigFraction` / `bigScale`).** A random ~4% of beads are built at
2× size and flagged `bloomMask = 1`; `updateCloud` gives them an always-on saturated white
emissive (`idle.bigGlow`), so they read as bright glowing points scattered through the form
and are the **only** thing the bloom pass catches (ADR-0024). The subset is chosen per-bead at
build time — not by size-ranking as the old `bloomMask` heuristic did.

**One update, two drivers (`updateCloud`).** Both the cursor idle-repulsion and
the scroll scatter write one target position per particle, combined per frame. It
writes **straight into the instance buffers**: the particles are spheres, so their
matrices carry only a uniform scale and a translation, and only the three
translation slots need touching. Recomposing 20k `Matrix4`s per frame would not
hold 60 fps; writing three floats each does.

> [!important] It is a per-frame loop, not a setter — a one-shot call lands 5 % of the way
> Every value here *approaches* its target by `ease` (0.035–0.22, floored by `idle.relax` = 0.05)
> once per call. That is invisible for the glyph and hand, which are updated every frame, but the
> **tree is updated exactly once at load** and then only rendered — so it kept 5 % of everything.
> Most visibly its hero beads' emissive, which stopped at 0.25 of the 5 it was aiming for and so sat
> under the 3.5 bloom threshold: the tree had no glowing beads at all, and the values were *there*
> in the buffer the whole time. Any bake-once cloud must pass **`immediate: true`** (`ease = 1`).

- **Cursor** (idle): projected onto a camera-facing plane through the focused
  figure, it pushes nearby particles aside and lights them lilac. Two easing rates
  give it feel — particles snap out at `pointer.relax`, then drift home at the
  softer `pointer.returnRelax`. **Both figures get it**, gated by scroll so only
  the framed one responds: the glyph at the start (faded out as the scatter
  begins), the hand near the end (`progress` 0.82→0.96). `pointerOnPlane(focus)`
  is the shared raycast; the hand is updated with `scatter: 0` (cursor only).
- **Scroll scatter** → **flight corridor streamers** (glyph only; two `updateCloud` params,
  `flight` + `exit`): the "X" reassembles **directly** into a handful of long world-space
  ribbons — there is no intermediate corkscrew-ribbon state (that + `buildStrandDestinations`
  were removed). `flight` (progress ~0.03→0.22) blends each particle **straight from its X
  rest position** to its spot on a streamer strung **along the flight corridor** (offset
  around an axis at `flight.axisY`, running `flight.zStart`→`flight.zEnd`). The camera flies
  *through* the corridor, so they sweep past with real **parallax** — no lag, and (unlike a
  lens-locked ring) the camera roll doesn't spin them as a circle. Each ribbon is
  **asymmetric** (per-ribbon varied radius/phase + a helical `flight.turn`), **snakes** over
  time (`flight.bend`/`bendWaves`/`speed`), and its offset radius **grows toward the far end**
  (`flight.spread`) so perspective doesn't bunch the far parts into the centre — they stay out
  at the sides with the centre clear. Each ribbon is a **solid round tube**: every particle
  carries a fixed random point on the unit disc (`cloud.tubeOffset`, its own RNG so there are
  no position-correlated sheet artefacts) placed on the plane **perpendicular to the corridor**
  (radial/tangential basis) × `flight.thickness`. The corridor is lifted (`flight.axisY`),
  vertically squashed (`flight.vScale`), and hard-clamped just above the floor (`fy = max(fy,
  1)`) so the tubes never sink through the ground. Ends stay visible (near end at `zStart`, far
  end past the hand); the flight ease is raised so they track without trailing. The **exit**
  (progress ~0.3→0.56, **before** the camera pitches up off the hand at `arrive` 0.56 — so it
  plays out in front of the hand head-on, not during the upward turn) is a **tip-driven
  stream**: the ribbon's **far tip** (param 1, out by the hand — the end that's actually in
  frame; the near end is behind the camera by now) is pulled out first, and every particle
  shifts its along-ribbon param toward the tip (`pShift = t + hp`, `hp = exit·flight.exitSpan`).
  While `pShift ≤ 1` a particle slides along the corridor toward the tip; once `pShift > 1` it's
  on the tip's exit arc. So the **whole ribbon flows to where the tip went** — the tip leads and
  the body follows its path, not a middle pivot or block slide. The exit arc is built to be
  **corner-free**: the heading turns a **symmetric ±90° from −Z** (the corridor's own heading)
  via a smoothstep, so at the join it's tangent-matched (no ~90° kink) and neither side
  over-rotates into a spiral; the vertical rises **monotonically** (`flight.exitLift`, not a
  `sin` arc that would dip back into a downward V); and a **soft (softplus) floor** eases curves
  off the ground instead of a hard clamp (which cut a sharp V at `y=1`). `side` is per-**ribbon**
  (from `phase`). The fade is **global** (whole ribbon stays visible through the
  stream, then fades together over the last stretch, mostly off-frame by then) — a per-particle
  fade made the leading tip vanish first, so the motion looked like it came from the middle. A
  purple emissive bloom
  (`aGlow`) grows from the core outward; toward-camera motion is damped (`scatter.towardCamera`)
  so the initial burst clears the camera corridor. A **legacy curl/strand path** (the `else`
  branch — twist, `scatter.drift`/`wander`/`radial`, `scatterTarget` morph) is kept for any
  scatter cloud without the flight corridor, but nothing uses it currently.

Particles are `SphereGeometry(0.5, 16, 12)` — enough segments to read as round
balls (not faceted chips) up close, since the self-shadowing now depends on smooth
sphere normals. Spheres need **no** random orientation, unlike the cubes used
originally — they look identical from every angle, which is also what makes the
buffer-level cursor update possible.

The glyph **casts and receives shadows** (its self-shadowing is the volume — see
above; ADR-0023). The original "no shadow, spheres speckle everything below" concern was
reversed: a high-res soft shadow map + `normalBias` keeps it clean and the measured
cost is negligible (~4 ms/frame). With the ground gone there is nothing else for the
shadow to fall on — the volume lives on the X itself.

**Why vanilla three.js and not React Three Fiber.** R3F (`@react-three/fiber`)
augments the **global** JSX `IntrinsicElements` with every three.js element. That
collapses the animation engine's `string`-typed dynamic-`Tag` children to `never`
and breaks `yarn build` in the `#do-not-modify` springs. Driving three.js
imperatively in one `useEffect` keeps the global JSX namespace clean. See
[[decisions-log]] ADR-0014.

**Motion is scroll-driven.** There is no auto-orbit and **no `OrbitControls`** —
the camera is fully controlled by scroll (no drag, no zoom). Each frame reads
scroll progress and drives the camera along a **two-segment path**: the fly
(`dollyStart` → `arrive`) approaches the hand with a **gentle bank** — `roll · sin(π·ep)`
leans out to ~15° mid-flight and settles back upright by `arrive` (a Rodrigues rotation of the
up vector about the view axis; the original full 2π barrel roll read as tacky);
the final segment (`arrive` → 1) cranes up off the hand (a ~45° upward pitch) into the vertical wave curtain. The dolly and the glyph
scatter run **simultaneously** with a natural ease (`smoother`), so the camera is
visibly approaching and rolling *while* the glyph unravels into ribbons — it does
not linger. The scatter also resolves quickly (`scatterRange` ends ~0.34) so the
figure isn't stuck mid-burst for long. The thin, dissolving ribbons keep the
corridor clear (toward-camera damping + the scale fade), so the moving camera
doesn't fly into them. Render-loop motion, not
DOM animation — orthogonal to the spring rule (ADR-0002). See [[decisions-log]]
ADR-0017.

Debug: append `?debug=1` and drive `window.__scene.progress(p)` (0–1, or `null`
to return to live scroll) with `pause()` / `frame()` to scrub the sequence
frame-by-frame — see the debug tip below.

> [!note] Scroll plumbing — pinned canvas + spacer
> The scene canvas is `position: fixed` (pinned to the viewport) inside
> `HomeView`, and a `sequence.scrollVh`-tall spacer beneath it gives the page its
> scroll length. Progress is `window.scrollY / (scrollHeight − innerHeight)` —
> Lenis drives **native** scroll, so `scrollY` is already the smoothed value, no
> Lenis subscription needed. This also required neutralising the starter's
> `body` rule (it forced `height: 100vh` + flex-centering, which can't scroll);
> `body` is now a plain scrolling block.

> [!note] Hand — loaded point cloud (`public/assets/hand/`)
> `hand-particles.ts` loads a **baked point cloud** exported from a real hand
> model (`points.bin` + `points.manifest.json`). Format `bin_u16`: three uint16s
> per point, decoded as `offset + (u16 / 65535) · scale` (params in the manifest)
> → normalised model coords, **Y up**, height 2. Points are scaled by
> `sceneConfig.hand.scale` and fed to the same `buildParticleCloud` as the glyph,
> so the style matches exactly. (This replaced an earlier procedural SDF hand.)
>
> ⚠️ **An async cloud must be added hidden and pre-reveal.** A freshly built cloud holds its
> fully-formed **resting** pose, and `Mesh.visible` defaults to `true` — so adding it on promise
> resolve drew a *complete hand* until the next `renderFrame` re-derived visibility from scroll, and
> that same frame compiles the material + uploads ~50k instance matrices, stretching the wrong pose out
> long enough to read as the hand popping in mid-flight and vanishing again. So the loader sets
> `visible = false`, runs one `updateCloud({ scan: 0 })` to put the buffers in the un-materialised
> state, and **pre-compiles** (`renderer.compile` with the mesh briefly visible — it draws nothing) so
> the first genuinely-visible frame doesn't hitch. The tree loader does the same.
>
> The hand gets the **same containment
> net** as the glyph (a second `createContainmentField`, static, positioned at
> `handAnchor` and scaled to wrap it) and the **same cursor repulsion**
> (in a brief window after it arrives, before it fades out for the wave field).

> [!important] Final phase: the hand rises into **several meandering bright curves (vortex)** then settles into a grid wave
> After the hand rises and is framed, the camera **cranes up** and the hand's **own
> particles** peel off into **several vertical streams** — bright dense spines snaking up through a
> dust halo — that then settle onto a clean grid that ripples as a wave. It's a genuine transform
> of the hand's particles — not new particles fading in — so they keep the hand's exact count and colours.
>
> **How.** `createHandParticles` precomputes a **grid destination** per particle
> (`buildWaveDestinations` → the cloud's `scatterDest`). The `updateCloud` **wave branch** (driven by
> `wave` = `range(progress, wave.transformRange)`) then, per particle, lerps rest → grid cell, adds a
> depth (Z) **ripple**, and **routes it through the vortex** (`wave.vortex`). Each particle belongs to
> one of `vortex.strands` **curves** whose base is spread across X (`spread`, symmetric about the
> axis) and whose **spine snakes** side-to-side up the height (`spineX = base + sin(hY·meanderFreq·2π
> + phase)·meander`, a smaller phase-shifted wander in Z, own phase per curve); the particle wraps
> that spine at a **core-biased radius** (`radius·rj^coreBias`, `rj` a cheap per-particle hash) so
> most pack into a **tight bright spine** with a thinning **dust halo**, swirling slowly
> (`hY·twist + time·spin`). Glow is weighted to the centreline (`bloom = vpk·flash·(0.12 + 0.88·(1−rj))`).
>
> **Seamless three-state blend.** The pull onto the curves is
> `vpk = min(1, sin(π·we)·plateau)·strength`, but `we` is a **per-particle staggered** eased progress:
> each particle starts its hand→curve→wave journey a little later (`ph = hash·stagger`, `we =
> smootherstep((wave − ph)/(1 − stagger))` — quintic, for a gentle onset/settle), so particles
> **peel off the hand and rejoin the wave at different times** rather than the whole cloud moving in
> lockstep — the hand dissolves gradually and the curves melt into the wave gradually, no snapping
> between states. The plateau is kept **modest**
> (~1.3) so particles pass *through* the curves instead of freezing on them. All `we` reach 1 at
> `wave` = 1, so everything lands on the grid.
>
> **Why it still reads as vertical:** the snakes are **symmetric about the hand's axis** and only Y
> grows with height (`hY`), so the group rises **straight up** and never drifts left or right — the
> local S-curves are the *shape*, not a net sideways slide. (Earlier cuts — a singularity→supernova
> and a fingertip burst — drifted off-axis wholesale and were rejected.) The albedo lerps to **white
> in the second half**, so the curves read pink then settle white into the wave.
>
> **Perf.** The morph runs only the hand: the glyph is hidden + its `updateCloud` **skipped**
> once fully dispersed (`progress > 0.54`), the hand is skipped before it scans in
> (`progress < 0.4`), and the hand's shadow casting is **off during the wave** (spreading
> particles don't need self-shadow). It's **pure trig — no curl noise** — so at 33k particles the
> morph holds ~5 ms/frame (an earlier curl-noise version was a ~42 ms freeze).
>
> **The wave: white, angled, lower-left, borderless.** The grid is **tilted back**
> (`wave.tilt`, recedes in depth as it goes up) **and yawed about vertical** (`wave.yaw`,
> swings its right side back into the fog), so the plane recedes **diagonally** — a dense
> near corner (bottom-left) fading to a far corner (top-right). Its particles **fade out
> toward the borders** (`wave.edgeFade`: scale → 0 in the outer fraction, so the wave
> dissolves at its edges instead of ending in a hard line — no visible border anywhere).
> The albedo is lerped to **pure white** through the transform (the baked grey shade → 1),
> leaving the sphere lighting to carry the form (`troughShade` 0). But the curtain sits far
> (z ≈ −120), high and tilted, so the static key light (aimed at the glyph) rakes it obliquely and
> those white beads would otherwise read **dark grey** — much darker than the well-lit hand/X beads.
> So a white **emissive lift** (`wave.lift`, HDR, via the `aGlow` path) is floored onto the settled
> beads to bring them back into the bright-white range, ramped in over the **back half** of each
> particle's journey (so the vortex streams keep their pink) and kept **below** the bloom threshold
> (3.5) so they brighten without glowing. Idle bloom points fade
> out (`× (1 - waveEased)`) so the clean grid has no stray highlights. The hand's 4173 baked
> points are **upsampled by `hand.density`** (each spawns jittered copies) so both the hand
> and the wave are denser — a light touch that keeps the hand's shape, unlike the scrapped
> 40k separate-field attempt (which read as different, fake particles).
>
> **`hand.sparse` thins the hand *only*.** Because the two states share one set of instances, the
> obvious knob — `density` — thins the curtain as well, and shrinks what `columns × rows` has to
> cover. So a fixed slice (0.55, chosen by a stable per-index hash so the thinning never crawls) is
> instead held at **exactly zero scale** through the hand act and grown in over the first third of
> the transform, where the vortex is busiest and nothing reads as popping. It snaps to zero rather
> than easing, for the same reason un-revealed beads do: the act is entered from a formed pose.
> Verified with `?debug` → `__scene.inspect().hand`: **13 144 / 29 211 live at the hand (45 %), and
> the full set once the wave forms.** Past ~0.6 the silhouette starts breaking up.

> [!note] The hand scans in bottom-up (movie body-scan)
> Before the wave, the hand **materialises from the bottom up** with a bright bloom band, like
> a sci-fi scan. `updateCloud`'s `scan` param (0→1, `range(progress, 0.42, 0.57)` — after the
> curves have dispersed, before the wave) drives it against the cloud's rest **Y bounds**
> (`cloud.minY`/`maxY`): a particle's normalised height `h` vs the rising line — below the line
> it grows in (`revealScale`), and a **pink bloom band** (`hand.scanGlow`, via `aGlow` so the bloom
> pass catches it — tinted with `bloomParticles.color` so it matches the scatter/vortex pink, not a
> plain white band) trails just under the line. The ease is raised while scanning so the
> line is crisp, not a slow fade. `scan` = 1 (the default for all other clouds/states) is a
> no-op.
>
> **The tree gets the same reveal, on the GPU.** It's ~150k instances and deliberately never
> re-`updateCloud`ed per frame (a single pass is a ~90 ms JS block), so its scan runs in the shader
> instead: `uScan` 0 → 1 scales each bead in local space against the same world-Y bounds, and
> `uScanTint` (the live pink × `tree.scanGlow`) puts the same trailing bloom band on the line. The
> instance keeps its position and only its size animates — identical in shape to `revealScale`, zero
> CPU per frame.
>
> ⚠️ **The band must be gated on `uScan < 1`.** The reveal line runs to `uScan · 1.05`, so at rest
> the topmost beads sit 0.05 behind it — inside the 0.14 glow width — and the crown would glow pink
> forever.
>
> ⚠️ **Run it on its own window, later than the wipe** (`sequence.treeScanRange`, currently
> `[0.88, 0.99]` against a wipe of `[0.74, 0.95]`). Derived from the wipe the two track each other,
> so the tree is already standing wherever the line has passed and the finale reads as arriving
> fully formed. Trailing the wipe means it uncovers a **bare lattice** and the tree grows into it.
>
> **The X opens with a different reveal — the assemble fly-in, off the clock instead of the
> scroll.** The glyph is already on screen at progress 0, so there is no scroll window to hang a
> reveal on; instead `introAssemble()` starts on the preloader's hand-off (`isPageRevealed()`)
> and ramps over `sequence.intro.seconds` (~1.8 s). It drives `updateCloud`'s **assemble** path:
> every particle launches from a scattered point around the camera's opening pose
> (`sequence.camera.startPos`, spread via each particle's flow vector × `intro.spread`) and
> streams onto its spot in the X, staggered per particle, carrying a pink comet trail
> (`intro.glow`, through the shared scan-tint path so it blooms the same pink as the reveals).
> The hero copy's reveal delays are paced to land with it (words → pills → tagline → CTAs), and
> `HeroLights` fires its own entrance off the same signal.
>

> ⚠️ **Un-revealed particles snap to zero scale — they must never be eased there.** Every other
> property in `updateCloud` *eases* toward its target (`s += (target − s) · ease`), and the scale is no
> exception — but the hand is only updated while `handActive` (`seqP > 0.4`), so before that its
> matrices sit at the **fully-formed resting pose**. The first frame it is shown runs with `scan = 0`
> (target scale `0`), and one eased step only closes ~30 % of the gap: the hand rendered at **~70 %
> size** and shrank away over the next dozen frames — a phantom hand appearing and dissolving right
> before its real scan-in, on every load and on every approach from above. So `revealScale === 0`
> while scanning assigns `0` outright. Revealed particles keep easing, so the reveal ramp and the
> hand-off at `scan = 1` are unchanged.
>
> **The camera only rotates *up*.** The final segment (`sequence.arrive` → 1) is a **pure
> upward pitch** — `x` stays 0 from arrive to final, so there's no sideways drift (an
> earlier version yawed the camera right to place the wave and was rejected as feeling like
> it "flew up and right"). The bottom-left framing instead comes from the **wave plane's own
> tilt + yaw**; the camera just rotates up to meet it. The morph's **vortex** rises on the hand's
> own vertical axis (centred, straight up), and the wave it settles into is placed by the plane's
> tilt/yaw — so the camera only ever rotates up. `updateCamera` keeps a
> **gimbal guard** (rebuilds a stable up when `|up·forward| > 0.99`). `window.__scene.inspect()`
> (debug) dumps live particle bounds + camera pose (hand **and** tree).

> [!important] Final section: a screen-space wipe reveals the tree over the (live) wave
> After the wave, the camera **holds still on the wave** and a **screen-space wipe** reveals a
> **particle tree** — its own framed scene (a containment net at `treeAnchor` z −175, the same
> lattice environment as the X, plus its own dust, **firefly motes**, and a slowly **drifting
> tree camera** for parallax) — *over* the wave. A tilted line sweeps
> **bottom-up**; below it you see the tree, above it the wave (matched to a reference — a film-style
> wipe, not a camera move). The tree is a loaded cloud (`tree-particles.ts`, 50k ×2), fully
> materialised — the wipe does the reveal.
>
> **Sequence remap.** To bolt a whole new act on the end without re-tuning the (heavily iterated)
> X→hand→wave timings, that act is driven by a **remapped** progress `seqP = progress /
> sequence.treeStart` and occupies real progress `[0, treeStart]` (0.72). Every existing boundary
> (`scatterRange`, `arrive`, `wave.transformRange`, …) is unchanged — it just reads `seqP`. At
> `treeStart` the wave is fully formed and `[treeStart, 1]` is the wipe. The wave curtain **keeps
> rippling** through the whole tree section (it is **not** frozen — see Perf) so it never looks stuck.
>
> **How the wipe composites (`WipePass`).** The tree is a **separate view** — the main camera stays
> framing the wave, and a static `treeCamera` frames the tree head-on. Each frame in the transition,
> both views are rendered to **HalfFloat** targets (`rtWave` from the held camera with the tree
> scene hidden; `rtTree` from `treeCamera` with the wave hidden) and `WipePass` blends them by the
> tilted screen mask `vUv.y + (vUv.x−0.5)·wipeTilt < uWipe`, `uWipe` swept over `sequence.wipeRange`.
> The edge is a **clean anti-aliased cut**, no seam. It sits **before bloom** so both sides still
> bloom (both targets are HDR). **Parallax:** each layer is sampled with its own vertical UV shift —
> the wave drifts **down** (`wipeWaveDrop`) while the tree **descends into place** (starts
> `wipeTreeDrop` higher, settling to rest by the wipe end so it matches the direct render — no jump).
> After the wipe (`progress ≥ wipeRange[1]`) the tree renders **directly** from `treeCamera`.
>
> **Perf (the finale must not hitch).** The **tree cloud** is static — the wipe does the reveal, not
> any in-world motion — so `updateCloud` over its ~150k particles (a ~90 ms JS block) runs **once, at
> load**, never per frame; every render thereafter is just a *draw* (~0.1 ms CPU). Its first render
> (shader compile + GPU matrix upload) is also a ~90 ms hitch, so it's **pre-compiled and pre-baked
> to `rtTree` at load** (`renderer.compile` + one offscreen render from `treeCamera` — everything
> else is behind that camera, so no visibility juggling). **During the wipe both views are rendered
> live every frame** (`rtWave` from the held camera with the tree hidden; `rtTree` from `treeCamera`
> with the wave hidden). The tree render is a **warm redraw** of the already-resident static cloud, so
> the double render holds **~60 fps** (the old "~74 ms double-render" was the *cold* compile, now done
> once at load). We render `rtTree` live rather than baking it once because its `treeDust` **drifts**:
> a single bake froze the dust through the wipe, then snapped it to its live position at the direct
> handoff — a flicker + "dust jump". Live rendering keeps the composited tree **pixel-identical** to
> the post-wipe direct render, so the boundary is seamless. The **wave** (~50k) keeps rippling
> (`wave = 1`, advancing `time`) so the curtain **never freezes**. **After** the wipe
> (`progress ≥ wipeRange[1]`, direct tree render) the curtain is *hidden* but **still updated** every
> frame — otherwise scrolling back up would re-render a stale frame and ease it to the live ripple over
> a few frames (a visible flicker). Tree shadow passes are off (outside the glyph's shadow frustum).
> Net: the whole wave→wipe→tree scroll holds ~60 fps.
>
> **Device tiering (`lib/scene/device.ts`).** One module decides the tier — `mobile` (`< 768px` **or**
> a coarse pointer, which is what catches tablets and large phones), `tablet`, `desktop` — **read once
> at construction**, because a device doesn't change tier mid-session and rebuilding 150k-instance
> buffers on a resize costs more than the mismatch. Everything derives from it, so the values can't
> drift apart:
>
> | | desktop | tablet | mobile |
> |---|---|---|---|
> | pixel ratio | ≤ 1.5 | ≤ 1.25 | **0.85** |
> | frame budget | ~60 fps (14 ms) | 45 fps | **30 fps** |
> | shadows | 2048² | 2048² | **off** |
> | lights | 6 | 6 | **3** |
> | glyph / hand density / tree density | 32k / 12 / 3 | 19k / 7 / 2 | **10.9k / 4 / 1** |
> | dust per field | 700 | 420 | 238 |
> | bloom | full | full | **half, skipped at ≈0** |
> | pointer listeners | yes | yes | **not attached** |
>
> The **composer clamps its own pixel ratio** from the same function — it owns its render targets, and
> leaving it at raw DPR renders the whole post chain at full resolution and throws the scene-pass
> saving away. The scene clock is **real seconds with `dt` clamped to 50 ms**, not a frame counter:
> under the mobile cap a counter would run every drift and ripple at half speed, and a backgrounded
> tab would teleport the scene on return. `window.__scene.info()` (debug builds) reports all of it plus
> `renderer.info` for re-measuring.
>
> **Prewarm.** A pass compiles its program on *first use*, and `WipePass`'s first use is the wave→tree
> boundary — so it used to link mid-scroll (measured: `programs` 41 → 42 across a sweep). It is now
> compiled at load into a throwaway target, and every scene texture goes through `initTexture`.
> `programs` is stable across a full scroll afterwards, which is the acceptance test for "no
> micro-freezes".
>
> **The render loop rides the shared ticker** (`subscribeToTicker`), gated on `document.hidden` and an
> `IntersectionObserver`, throttled per tier — not its own `requestAnimationFrame`. A second
> forever-rAF beside the springs' loop is the classic cause of scroll jank. On mobile the
> `ResizeObserver` is **not attached at all**: iOS Safari changes the viewport every time the URL bar
> collapses mid-scroll, and rebuilding the drawing buffer + both HDR targets then reads as a
> whole-scene flash (the cost: rotation doesn't reflow the surface). The canvas wrapper is promoted to
> its own compositor layer (`transform-gpu backface-hidden will-change-transform`) so a neighbouring
> fixed element repainting can't invalidate the WebGL composite on WebKit. See
> [[decisions-log#ADR-0031 — One device tier drives the whole scene; the phone gets a smaller scene not a different one|ADR-0031]].

> **No forced layout in the render loop.** Sizing (`applySize`) reads `container.clientWidth/Height`,
> which forces a synchronous layout — so it is **event-driven via a `ResizeObserver`**, never polled.
> It used to run every 30 frames from inside `renderFrame` (a forced mid-frame reflow ~2×/second),
> which showed up as an intermittent full-screen flash on this blend-mode/backdrop-filter stack. Same
> rule applies to the DOM overlays: nothing in a per-frame path may call `getComputedStyle` or write an
> inherited custom property on `:root` (see the `wipe-line.ts` row above and the `HeroLights` notes).

> [!warning] Particle clouds set `frustumCulled = false`
> The clouds move their instances arbitrarily far from the mesh origin every frame (the
> scatter, and the hand's wave transform up into the curtain). Three.js frustum-culls an
> `InstancedMesh` by its *geometry* bounding sphere (a 0.5-radius sphere at the mesh
> origin) — it does **not** track the displaced instances — so once that origin leaves the
> view the whole cloud is wrongly culled and vanishes (this blanked the frame when the
> camera first pitched up and away). `buildParticleCloud` sets `mesh.frustumCulled = false`;
> don't re-enable it.

> [!note] Idle life: a slow shimmer + a glow on the biggest particles
> No figure is ever fully static. `updateCloud` adds two idle effects (`sceneConfig.idle`,
> passed to **every** cloud) on top of whatever state a particle is in:
> 1. **Per-particle shimmer** — a small sinusoidal wander (`idle.amplitude`, phase from
>    the particle's `stagger`) added to the target each frame, so the glyph and hand
>    both breathe at rest and gain a little floating depth. Kept **slow** (`idle.speed`,
>    ~0.16) so it never looks fast; the rest easing is floored at `idle.relax` or the slow
>    wander would be over-damped and invisible. (The wave field has its own motion.)
> 2. **Hero-bead glow** — `cloud.bloomMask` marks the oversized `bigFraction` beads (chosen
>    per-bead at build, 2× size) and `idle.bigGlow` (**5**) gives them a saturated white
>    emissive. That bright emissive is what the (re-enabled, selective) bloom pass catches, so
>    those beads glow with a white bloom while the rest of the cloud stays matte — see ADR-0024
>    and the post-processing note.

> [!note] Strand scatter needs a *medium* curl frequency
> The scatter reads as wisps only when nearby particles share a flow direction
> but the whole cloud does not. Sample `curl()` too low and every particle moves
> the same way (a shear, not strands); too high and it's noise again. `0.09` over
> the ~14-unit glyph gives a handful of coherent bundles.

> [!warning] Camera and scatter run *together* — keep the corridor clear
> The dolly and the burst are simultaneous (`sequence.dollyStart` ≈ 0), so the
> camera must not fly into the particles it is advancing toward. Three guards keep
> the corridor clear without holding the camera back:
> 1. **The burst dodges the lens.** `scatter.towardCamera` damps each particle's
>    +Z (toward the camera's start) motion, so strands open sideways/backward
>    instead of into the approaching camera.
> 2. **Particles dissolve.** Each fades its scale to zero on the tail of its
>    burst (a diagonal-matrix write), so nothing lingers where the camera passes.
> 3. **Reach < standoff.** `scatter.distance` stays shorter than the camera's
>    distance to the glyph, so the burst can't reach the lens even side-on.

> [!warning] Bloom is on but **selective**; never use `UnrealBloomPass`
> The chain is `RenderPass → BloomPass → VignetteShader → OutputPass`. Bloom was removed once
> (it read as a scene-wide haze) and is now **back, keyed to brightness**: the custom
> `BloomPass` threshold (3.5) sits above the lit-white cloud (~2.6 on the HDR HalfFloat
> composer buffer) but below the glowing hero beads (lit + `bigGlow` ≈ 7) and the scatter/cursor
> emissive, so **only those** bloom — see ADR-0024. This depends on the composer buffer being
> HDR (three's default preserves values >1); if that ever changes, everything clamps to 1 and
> the threshold can't separate lit from emissive — force `HalfFloatType` on the composer.
> **Do not** reach for `UnrealBloomPass` — it blacks out the **entire** frame in this WebGL
> environment (its 5-level mip chain degenerates to zero-sized targets → a fully black canvas
> with **no console error**, easy to misdiagnose). The custom `bloom-pass.ts` (threshold →
> half-res blur → add back) avoids that. See ADR-0019 / ADR-0024.

> [!tip] Tuning the look — the levers that matter
> **Keep the fill light low.** On a near-monochrome palette, form reads *only*
> through directional shading; a strong `AmbientLight`/`HemisphereLight` flattens
> everything into a gradient. The fill sits at `0.1`/`0.22` while the key light
> does the work at `3.4`.
> **Fog + a gradient backdrop are the atmosphere.** A flat `scene.background`
> reads as a void. The vertical-gradient backdrop sphere plus linear fog is what
> makes the space feel like a lit room, and the vignette seals the edges.
> **Bright fixtures need `toneMapped = false`** or the tone mapper pulls them
> back down to grey and the glow disappears.

> [!important] Particles must stay matte white — and the environment is home-made
> The particles must read as **matte white**, and any `metalness` at all tints them with the grey
> environment until they look like dull metal. They sit at `metalness 0`, `roughness 0.98`,
> `envMapIntensity 0.08`, and their baked shading gradient is floored at `0.58` — darker values
> turn the cloud grey rather than white. The faint environment term comes from the scene
> pre-filtering its **own gradient backdrop** through `PMREMGenerator.fromScene()` rather than a
> stock HDRI, so reflections stay in the scene's palette and no external asset is fetched.
> (The metal podium and the overhead ring fixture this environment was originally built for were
> **removed** — each act is now just its lattice in the haze; the compensating fill lives in the
> raised hemisphere/ambient lights in `particle-scene.tsx`.)

> [!important] Glowing particles need an emissive term, not a bright colour
> The particle is **lit** (`MeshStandardMaterial`) and `instanceColor` carries the baked form
> shade, so a touched particle in the shadowed part of the form would stay dull no matter how
> bright its albedo. So `particle-cloud.ts` adds a per-instance `aGlow`
> `InstancedBufferAttribute` and patches the material via `onBeforeCompile`
> (`patchParticleShader`) — injecting `totalEmissiveRadiance += vGlow` after `#include
> <emissivemap_fragment>`. That adds the glow as **pure emissive** *after* lighting, so
> touched/scattering particles read as bright light sources wherever they sit in the form,
> regardless of how the key light shades them. (`attribute`/`varying` are fine to write in the
> patch — three rewrites them to `in`/`out` for GLSL3.) The oversized hero beads use this same
> path (always-on white `aGlow`) to feed the selective bloom.

> [!note] The containment net fades at both ends via a shader patch
> `LineBasicMaterial` has no per-vertex alpha, so `containment-field.ts` patches
> it through `onBeforeCompile`: a `vFieldFade` varying derived from each vertex's
> local Y multiplies the material opacity — `pow(sin(π·t), 1.5)`, full strength at
> the **waist**, zero at **both ends**. `field.opacity` is therefore the
> **middle** strength, not the average. With the ground and fixtures removed an
> unfaded base read as a hard rim floating on nothing; the double fade keeps the
> lattice a weightless hologram. Injection points are three's
> `MeshBasicMaterial` chunks (`<common>`, `<begin_vertex>`, and the
> `vec4 diffuseColor = vec4( diffuse, opacity )` line), the same coupling as the
> glyph's emissive patch.

> [!note] No seam at the horizon — fog and backdrop must agree
> `colors.backdropBottom` **must equal `colors.fog`**, and the backdrop's
> `gradientOffset` must be `0` so the gradient's darkest stop lands at ground
> level. The backdrop is unfogged, so if the sky just above the horizon is any
> other value than the fully-fogged distance, the two meet in a visible seam.
> `fog` must also not be **darker** than the sky above it, or it renders (after
> ACES tone mapping) as a dark band across the middle even with no seam. `fog`
> is kept light (`#868e96`); verify with the debug luminance probe, not by eye,
> since tone mapping makes the on-screen value hard to predict from the hex.

> [!tip] Debugging a live WebGL canvas — `?debug=1`
> Screenshot tools capture the front buffer, which a continuously-animating
> canvas has usually already cleared, so a grab comes back blank or hangs.
> Appending `?debug=1` to the URL turns on `preserveDrawingBuffer` and exposes
> `window.__scene`: `pause()` freezes the render loop on a stable frame,
> `resume()` restarts it, `frame()` renders exactly one more, `progress(p)`
> **scrubs the whole scroll sequence** to a value in `[0, 1]` (or `null` to hand
> control back to real scroll) — the way to inspect the choreography without
> scrolling — and `inspect()` returns the live hand-cloud instance bounds plus the
> camera pose (position / direction / up), for diagnosing framing and culling.
> Because the wave transform eases per frame, scrub with `progress(p)` then call
> `frame()` ~130× to let the final phase settle before grabbing a still. Pair it with a `readPixels` luminance probe to
> measure gradients rather than judging by eye, since ACES tone mapping makes the
> on-screen value hard to predict from a hex colour. Off without the query param,
> so production is unaffected.

> [!warning] Canvas sizing — don't rely on `ResizeObserver`
> The container measures **0×0** inside the mount effect, so a one-shot
> `clientWidth`/`Height` read leaves the canvas at its 300×150 default and nothing
> is visible. `ResizeObserver` is **not** a safe fix either — in some embedded
> browsers (the in-app preview pane) it never fires at all, not even its initial
> observation. Sizing is therefore applied three ways: once at setup, on `window`
> `resize`, and re-checked every 30th frame in the render loop. `applySize()`
> exits early unless the size actually changed, so the polling is cheap.

**Tokens.** three.js materials can't read Tailwind tokens, so `sceneConfig` is the
token source for the 3D layer. The CSS backdrop shown before the canvas paints
(`--scene-backdrop` in `globals.css`) is kept in sync with `sceneConfig.colors.fog`
— the same duplication rationale as the grid (ADR-0008).

**Mounting** — the home view renders it full-bleed as a client leaf, staying a
Server Component itself:
```tsx
import { ParticleScene } from "@/components/common/scene";
```

## Shared scroll progress — `utils/scroll-progress.ts`

`getScrollProgress()` — the sequence's scroll progress `0 → 1`, **measured at most once per frame** no
matter how many callers ask. Six independent rAF loops need it (the four `ScrollFade`s, `HeroLights`,
`ParticleScene`); each used to compute `window.scrollY / (documentElement.scrollHeight - innerHeight)`
itself, and `scrollHeight` is a **forced synchronous layout**. Because those same loops also write
spring styles, that was write→read→write **layout thrashing** on every frame of every scroll (measured:
6 forced reads per frame → **0**).

Two mechanisms: `scrollHeight` is measured **once** and cached (a `ResizeObserver` on
`documentElement` invalidates it — the page height is fixed by the sequence spacer, so it only changes
on reflow), and the computed value is memoised **per frame** using `document.timeline.currentTime`,
which is constant for the whole frame — so all six callers in a frame share a single `scrollY` read.
Callers still run their own rAF; this only dedupes the measurement. `ParticleScene` layers its
`?debug` progress override on top. **Rule:** nothing on a per-frame path may measure layout itself —
see also [[decisions-log#ADR-0029 — No forced layout or root style writes in per-frame paths|ADR-0029]].

## Related

[[component-conventions]] · [[components/animation-springs]]
