---
tags: [meta, changelog]
updated: 2026-07-28
---

# Changelog

Chronological log of notable changes to the project. Newest first.
This is a human-curated log — not a mirror of `git log`.

## 2026-07-28

- **Desktop perf pass — four cuts, zero look change.**
  - **Scene capped at ~60 fps on desktop** (`frameBudgetMs` 0 → 14 ms). On a 120/144 Hz display
    the whole pipeline (32k-instance update, ~2.8 MB matrix upload, shadow pass, bloom chain)
    ran at double rate for motion this slow; 14 ms lets every 60 Hz tick through untouched while
    120 Hz drops every other tick.
  - **`antialias: false` on every tier.** Everything visible renders through the composer's
    render targets, which carry **no MSAA samples** (checked in three r180's `EffectComposer`) —
    the default framebuffer the flag multisamples only receives the final full-screen quad, so
    it bought zero smoothing for real memory + resolve bandwidth per frame.
  - **Shadow depth pass gated on the glyph act** (`shadowMap.autoUpdate = glyphActive`): the
    hand and tree sit beyond the shadow camera's 110-unit far plane, so past the burst the pass
    rasterised an empty 2048² map every frame for the whole wave/tree half of the scroll.
    Re-entering the hero act re-enables it (`needsUpdate` refreshes the stale map) — verified by
    a hero → tree → hero scrub round-trip screenshot.
  - **Desktop shadow map 4096² → 2048²** — the hero act's dominant fill item; at bead scale the
    coarser texel is indistinguishable (screenshot-compared) and tablet shipped 2048 all along.
  `lib/scene/device.ts`, `particle-scene.tsx`. `yarn lint` / `yarn build` clean; hero
  self-shadow depth verified intact after the round-trip.

- **Figures tilt toward the cursor.** The X, hand, and tree now ease a few degrees of yaw +
  pitch toward the pointer (`life.cursorTilt`, ~4°/~2.3° at the screen edges) on top of their
  idle rock — a frame-rate-independent low-pass on the pointer NDC, folded into `rockMesh`
  (which now takes the full centre + pitch and compensates via `applyEuler` so the pivot stays
  at the figure). Gated by the same per-act holds as the rock, zero on touch. Kept small on
  purpose: the pointer-repulsion/hover simulations measure from unrotated rest positions, so
  past ~0.1 rad they'd visibly miss the cursor. Verified by corner-to-corner cursor screenshots.
  `particle-scene.tsx`, `scene.config.ts`. `yarn lint` / `yarn build` clean.

- **Lattice choreography round 3: delayed weaves, impulses, forever-spin; the hand pirouettes.**
  - **Hero net now waits for the X.** Instead of weaving ahead of the fly-in it holds until the
    figure is `intro.netDelay` (75 %) assembled, then closes around the nearly-finished X over
    `intro.netWeaveSeconds` (1.4 s) — the cage arrives as a *response* to the figure.
  - **Tree net waits for the tree.** Its weave now runs from the **midpoint of the tree scan**
    to the scan's end (`progress 0.935 → 0.99`) instead of during the wipe — the wipe uncovers
    empty haze, the tree grows, and the cage closes around it at half-height.
  - **The hand spins a full eased 360°** about its own axis as it scans in (`seqP 0.42 → 0.57`,
    smootherstep; 2π ≡ 0 so it hands over seamlessly to the resting float and the wave morph
    still sees an unrotated mesh).
  - **Pink impulses on every lattice** (`uTime` in the field shader): a narrow accent ring
    rising through the cylinder plus sparse per-segment random flashes — brief glints (high
    exponents), gated by the build state so an unwoven cage can't sparkle.
  - **Every cage turns forever** — `field.spin` (0.08 rad/s ≈ 80 s/revolution) on
    `lines.rotation.y`, counterpoint to the figures' rock.
  - **Hero rock/bob sped up** (yaw 0.32 → 0.45 rad/s, bob 0.22 → 0.3) — the X's float reads at
    a glance now.
  `containment-field.ts`, `particle-scene.tsx`, `scene.config.ts`. `yarn lint` / `yarn build`
  clean; delay/spin/impulse timings verified by screenshot at load +1.0 s (X collected, no net),
  +2.2 s (net weaving), `seqP 0.5` (hand mid-spin), `progress 0.93/0.965/0.995` (tree net
  waiting → weaving → complete). No console errors.

- **Lattices weave themselves in; figures float.** Second pass on the same day:
  - **Per-segment lattice build effect** (`containment-field.ts` now returns
    `{ lines, uBuild }`): every wireframe segment gets a bottom-biased random threshold and
    *draws itself* from one end to the other as `uBuild` passes it, flashing toward the shared
    accent mid-draw — the cage weaves together line by line instead of fading in as a sheet.
    Hero net: builds with the intro fly-in, **un-weaves over `netRange` on scroll** (replaces
    the `scale.y` collapse, which read as a skew); hand net builds over `seqP 0.3 → 0.47`; tree
    net over the wipe (`0.74 → 0.88`), each just ahead of its figure's reveal.
  - **Hero X and its net are 20 % bigger** — glyph bars/beads ×1.2 (`barLength 16.8`,
    `barWidth 3.1`, `barDepth 3.4`, `particleSize 0.12`), new `field.heroScale 1.2` scales the
    hero net radius+height with the base kept planted (hand/tree nets unchanged). Radial extent
    ~8.6 vs net radius 9.1 — near-touching, on purpose; still inside the shadow frustum.
  - **Whole-figure float**: each cloud slowly yaws left/right about its **own** vertical axis
    and bobs (`rockMesh` — mesh rotation + the translation that keeps the pivot at the figure,
    since instance positions bake the world centre in). Amplitudes in `sceneConfig.life`
    (`rock`/`bob`): the X the furthest (~7°), hand and tree subtler. Gated per act so
    scatter/flight and the wave morph never run on a rotated frame (hero fades out by
    `seqP 0.08`, hand only between its scan and the morph).
  `containment-field.ts`, `particle-scene.tsx`, `scene.config.ts`. `yarn lint` / `yarn build`
  clean; every act re-verified via `?debug` scrub screenshots (no console errors). See
  [[decisions-log]] **ADR-0039**.

- **The set is reduced to the lattice.** All podium discs, the infinite floors, and both ring
  fixtures (with their desktop `PointLight`s) are **removed** — `podium.ts` / `ring-light.ts`
  deleted, `podium2/podium3` renamed `handAnchor`/`treeAnchor`. The containment net now fades at
  **both ends** (`sin(π·t)`), not just the top, so each act is a weightless hologram in the haze.
  Fill compensation: hemisphere 0.14 → 0.3, ambient 0.05 → 0.12 (same look on every tier now —
  the point light was desktop-only). See [[decisions-log]] **ADR-0037**.
- **Immersive load intro.** The X now **assembles out of the camera** — every particle launches
  from a scattered point around the viewer and streams onto its spot, staggered, with a pink
  comet trail (`updateCloud`'s new `assemble` path; `sequence.intro`, ~1.8 s, replaces the old
  `introScanSeconds` scan and `glyph.scanGlow`). `HeroLights` gained a staged entrance off the
  same hand-off signal (rays swing into place, glint rises from its corner), and the hero copy's
  reveal delays were re-paced to land with the fly-in (words 200/520 ms → pills 950 → tagline
  1300 → CTAs 1600).
- **The 2π camera roll is now a ~15° bank** — `roll · sin(π·ep)` out and back, upright by
  `arrive` (`camera.roll` 2π → 0.26). `HeroLights.rollDegAt` mirrors the same envelope, staying
  frame-locked. (ADR-0037.)
- **GPU idle life in every resting act.** New `life` uniforms in the shared particle shader
  (`uTime`/`uFlowTint`/`uFlowAmp`): a violet band flows through each cloud (below the bloom
  threshold — a tint, not a glow) plus a gentle whole-form sway. Per-cloud strengths in
  `sceneConfig.life`; the **baked tree** — previously fully frozen — leans on it hardest
  (`sway 0.14`, `flow 0.8`). See **ADR-0038**.
- **Rising accent motes** (`rising-motes.ts`, new): sparse additive pink sparks that climb and
  dissolve — one system over the wave "terrain" (hidden until the hand act), one as fireflies
  around the finale tree. Entire life cycle in the vertex shader; CPU cost is one `uTime` write
  per system per frame. (ADR-0038.)
- **Tree finale deepened**: fireflies + GPU sway/flow + a slow **tree-camera drift** (sub-unit
  sine orbit, in both the wipe re-render and the direct render) for parallax against the motes
  and dust.
- **Perf, same look:** bead geometry `SphereGeometry(0.5, 16, 12)` → **`(0.5, 8, 6)`** — 384 →
  96 tris per instance, ~4× off the dominant vertex load (every cloud pass + the 4096² shadow
  pass); plus everything the set removal saves (no `PointLight` term on any lit fragment, fewer
  draws). Ambient **dust motes shrunk** `size 0.5 → 0.3` (they read as white blobs covering
  empty space).
  `particle-cloud.ts`, `particle-scene.tsx`, `scene.config.ts`, `containment-field.ts`,
  `rising-motes.ts`, `hero-lights.tsx`, `hero-overlay.tsx`. `yarn lint` / `yarn build` clean;
  every act verified via `?debug` scrubs + headless screenshots (no console errors, program
  count stable after warm-up).

## 2026-07-27

- **Published to GitHub** — `origin` is now
  [ternyon/auralis](https://ternyon/auralis), `main`
  tracking `origin/main`. The whole build landed as one commit on top of the starter's initial
  commit (87 files, +10 605 / −103), covering the scene, the overlays, the preloader, the reveal
  system, the generated icon set, and this vault. The repo was empty, so nothing was overwritten.
  - `.env` is gitignored and **is not** in the repo (verified against `origin/main`); `.env.example`
    carries placeholders only. No credential-shaped strings anywhere in the tree.
  - ⚠️ **Still open before this is a real deployment:** `NEXT_PUBLIC_SITE_URL` is the starter's
    `https://example.com`, so every canonical / OG / sitemap URL points at the placeholder.
  - ⚠️ **`src/app/fonts/` now contains three Google Sans Flex `.ttf` files.** That is a proprietary
    Google typeface, not an open-licensed one — worth confirming the licence covers redistribution
    before this repository is made public.

- **Hand turned further and thinned again; flare parallax restored to the wave and the tree.**
  - **Hand:** `rotation` −15° → **−30°** about Y (a further 15° on the existing turn, so the palm
    reads three-quarter rather than near face-on), and `sparse` 0.38 → **0.55**. Measured
    **13 144 / 29 211 live at the hand**; the wave still gets every instance.
  - **Flare parallax now runs in the wave *and* the tree finale.** It was gated off for everything
    past `treeStart`, but the real constraint is narrower: only inside `[treeStart, wipeRange[1])`
    are the layers cut to the wipe line, where per-layer drift slides the tree-side and wave-side
    cuts apart and opens a dark seam. New `isWipeMasked()` gates exactly that window, so the finale
    — which carries no masks at all — parallaxes again.
  - **Drift raised only where there was proven slack:** `RAYS_DRIFT` 26 → 32 (bounded by the ~87 px
    the 130vmax square's inscribed circle clears a 16:9 diagonal by, *not* by the box) and
    `BOKEH_DRIFT` 20 → 34 (against a 10vmax ≈ 144 px overhang). `GLINT_DRIFT` left at 46: that
    layer's top and right edges sit inside the viewport and only its feather hides them.
  - Checked for exposed edges at both cursor extremes in the wave and the finale, and that the wipe
    window still holds the layers still with no seam.
  `scene.config.ts`, `hero-lights.tsx`. `yarn lint` / `yarn build` clean.

- **Sparser hand at full wave density; the tree finally gets its glowing hero beads.**
  - **`hand.sparse` (new, 0.38).** The hand *is* the wave — same instances — so thinning it via
    `density` would have thinned the curtain too and shrunk what its `columns × rows` grid must
    cover. Instead a fixed slice of beads (picked by a stable per-index hash) is held at **zero
    scale** through the hand act and grown in over the first third of the transform, under cover of
    the vortex. Measured: **18 111 / 29 211 live at the hand (exactly 62 %), 28 691 at the wave** —
    every held-back bead returns.
  - **The tree had no bloom beads because a bake-once cloud can't ease.** Every value in
    `updateCloud` *approaches* its target by `ease` per call, which assumes a per-frame loop; the
    tree is updated exactly once at load, so at the idle floor of 0.05 it kept 5 % of everything.
    Its hero beads' emissive stopped at **0.25 against a bloom threshold of 3.5** — present in the
    data, invisible on screen. New `immediate: true` sets `ease = 1` so a single call lands on
    target. The tree now sparkles like the X and the hand.
  - `?debug` → `__scene.inspect()` now reports `hand: { live, total }`, which is what made the
    sparse/wave claim checkable rather than a matter of squinting at two screenshots.
  `particle-cloud.ts`, `particle-scene.tsx`, `scene.config.ts`. `yarn lint` / `yarn build` clean.

- **Tree hover: the actual cause was a shared program cache key. Faster X intro, more saturated pink.**
  - **Root cause found.** The previous fix (attribute + shader variant off one flag) was necessary but
    not sufficient — the hover still only worked after a reload. three.js keys its program cache on
    `material.customProgramCacheKey()`, whose default returns **`onBeforeCompile.toString()`**; all
    three clouds share one `patchParticleShader` closure, so they produced the *same key* and the
    tree was handed the glyph's compiled program — the analytic branch, no `aRelaxUv`. A missing
    attribute reads zero in GLSL rather than failing, so the simulation looked perfect and nothing
    moved. Reloads restore scroll to the finale, where the tree compiles first and therefore wins the
    shared slot — hence "only after a reload". Fixed with an explicit `customProgramCacheKey`.
    → **[[decisions-log#ADR-0036 — Heavy-cloud hover is a GPU simulation (ping-pong texture), not a shader formula|ADR-0036]]**.
  - **`__scene.relax()` now reports the geometry's attributes and each compiled program's**, because
    the CPU-side readback alone said "working" for two rounds of this bug. Verified after the fix:
    separate `relax` / `analytic` programs, `hasRelaxAttribute: true` on the relax one, and the crown
    visibly parting on screen (not just in the numbers).
  - **The X intro is quicker** — `introScanSeconds` 1.8 → 1.2, so it no longer trails the copy
    animating in beside it.
  - **The pink is more saturated.** Bloom pulls highlights toward white, so the old pale lilacs landed
    as near-colourless glare: `bloomParticles.color` `#a774ff` → `#b552ff` (scan bands, scatter,
    vortex) and `pointer.color` `#c49dff` → `#b579ff` (hover heat). Both keep blue at full so it stays
    the channel clearing `bloom.threshold`.
  `particle-cloud.ts`, `particle-scene.tsx`, `scene.config.ts`. `yarn lint` / `yarn build` clean.

- **Tree hover fixed (it needed a reload to work), tree reveal moved later and given its pink band.**
  - **The hover was silently dead until a reload.** The shader declared `attribute vec2 aRelaxUv;`
    from `CloudOptions.pointerRelax`, but the attribute was *created* in the scene's **async** tree
    loader and only when `wantsPointer(tier)` — two conditions, two files, one of them async. A
    vertex shader reading a missing attribute isn't an error in GLSL: it reads zero, every bead
    samples texel 0, nothing moves. Both now come off the same flag inside `buildParticleCloud`, and
    the simulator is **primed with one cursor-less step before `renderer.compile`** so the material
    never links against a null sampler. Verified without reloading: arriving through the wipe and
    then hovering drives max displacement 0 → 3.4 (300 ms) → 3.8 (1 s), and letting go decays it
    3.8 → 2.1 (500 ms) → 0.7 (1.5 s) → 0.08 (3.5 s) — the slow `returnRelax` ooze, not a snap.
  - **The tree came in too early and with no bloom band.** The scan was derived from the wipe range,
    so the two tracked each other and the tree was already standing wherever the wipe had passed.
    It now runs on its own **`sequence.treeScanRange` = `[0.88, 0.99]`**, trailing the wipe of
    `[0.74, 0.95]`: the wipe uncovers a bare podium and the tree grows into it. And the GPU scan
    gained the **pink band** the hand has always had (`uScanTint` = the live pink × `tree.scanGlow`,
    4.2 — lower than the hand's 6 because the tree's beads are smaller and far denser). ⚠️ The band
    is gated on `uScan < 1`, or the crown glows forever: the line runs to `uScan · 1.05`, so at rest
    the top beads sit inside the glow width.
  - Also fixed while in there: the simulator's first-step clear restored only the renderer's clear
    **alpha**, leaving it clearing black for the rest of the session; and `pointerEnabled` moved up
    beside the tier read, since the async loaders close over it.
  `particle-cloud.ts`, `pointer-relax.ts`, `particle-scene.tsx`, `scene.config.ts`.
  `yarn lint` / `yarn build` clean; all three verified in-browser.

- **Tree hover becomes a real simulation; the X materialises on load; finale copy balanced.**
  - **The tree's hover now has memory.** ADR-0035 matched the glyph's force law and it still read
    wrong, because `updateCloud`'s hover isn't a formula — it's a simulation: beads ease out at
    `relax` and drift back at the much slower `returnRelax`. A stateless shader can't do that, so the
    state moved to a **ping-pong half-float texture** (new `pointer-relax.ts`), one texel per bead
    (`xyz` displacement, `w` heat), advanced by one 388×388 pass per frame running `updateCloud`'s
    law *including the easing*. The violet bloom rides the same eased heat, so it fades in and out
    with the displacement instead of snapping. → **[[decisions-log#ADR-0036 — Heavy-cloud hover is a GPU simulation (ping-pong texture), not a shader formula|ADR-0036]]**.
    `?debug` gained `__scene.relax()` (a GPU readback) because this state has no DOM and no CPU mirror.
  - **The X scans in bottom-up when the preloader lets go**, with the hand's pink bloom band — the
    site's first move is the glyph assembling rather than a finished X sitting there. Driven off the
    scene clock (`sequence.introScanSeconds`), not scroll, since the glyph is already on screen at
    progress 0. `markPageRevealed` moved from `act-window.ts` into `scene-ready.ts`, which now carries
    the loader hand-off in both directions for its two consumers (the DOM reveals and the scene).
  - **Both finale taglines rewritten to three lines**, so the two columns balance the tree instead of
    one hanging short. Verified by measuring the rendered `.line-word` spans at 1440 px.
  ⚠️ **Backticks cannot appear in a `/* glsl */` template literal** — they close the string. Cost a
  confusing round of stale Turbopack errors that survived a dev-server restart.
  `pointer-relax.ts` (new), `particle-cloud.ts`, `particle-scene.tsx`, `tree-particles.ts`,
  `scene.config.ts`, `scene-ready.ts`, `act-window.ts`, `preloader.tsx`, `tree-overlay.tsx`.
  `yarn lint` / `yarn build` clean.

- **Review pass: tree hover rebuilt, tree materialises bottom-up, hero intro no longer plays under
  the loader, duplicate copy removed.**
  - **Tree hover is now the glyph's hover.** The GPU push (ADR-0026) measured its force from `wPos` —
    the *vertex* position, sphere offset included — so every vertex of a bead got a different direction
    and the beads inflated; the view-plane workaround shipped for that swept every depth behind the
    cursor and gathered the tree into a ball. Both are fixed by measuring from the **instance centre**,
    which lets the shader run the hero's law verbatim (world-space `influence = 1 − d/radius`,
    displacement `influence²·strength`) plus the same violet heat tint via a new `uPointerTint`.
    → **[[decisions-log#ADR-0035 — GPU cloud effects measure from the instance centre (amends ADR-0026)|ADR-0035]]**, which corrects ADR-0026's reasoning.
  - **The tree materialises bottom-up like the hand**, via new `uScan/uScanMinY/uScanMaxY` in the same
    patch (scales each bead in local space against the cloud's world-Y range), driven from
    `range(progress, treeStart, wipeRange[1] − 0.01)`. Zero per-frame CPU — the 150k cloud stays baked.
    ⚠️ The reveal line runs to `uScan · 1.05`: at plain `uScan` the topmost beads sit exactly *on* the
    line at "fully materialised" and scale to zero, which shaved the crown off **every** cloud
    (the X glyph lost its top arms until this was caught).
  - **Hero elements animate after the loader, not behind it.** Its act window starts at progress 0 —
    the same place the page sits under the veil — so the whole intro had already played by the time
    the page was uncovered. `act-window.ts` now holds all acts until `markPageRevealed()`, which
    `Preloader` calls as it starts fading, and re-evaluates on the spot so the hero starts next frame.
  - **Copy.** The tree's two edge taglines were the same Figma placeholder twice; they're now two
    distinct lines (what the studio does / the invitation). The hero's mobile-only `MANIFEST` was
    rendering on desktop as well, stacked under the real one — `md:hidden` can't work on a
    `RevealText`, because `TextEngine` writes `display: flex` **inline**; moved to a wrapper. The hero
    tagline was widened (`md:w-[34rem]`) so it reads as the intended two lines.
  `particle-cloud.ts`, `particle-scene.tsx`, `act-window.ts`, `preloader.tsx`, `hero-overlay.tsx`,
  `tree-overlay.tsx`. `yarn lint` / `yarn build` clean; verified in-browser at 1440×900.

- **Preloader, mobile layouts + burger, and real metadata with a generated icon set.**
  - **`Preloader`** (new) — a black hold in the site's own type language (wordmark, one filling
    hairline, a three-digit readout), gated on a **real** signal: new `scene-ready.ts` publishes the
    scene's three loading steps (hand cloud, tree cloud, warm-up pass), so the hand-off lands *after*
    the shaders compile. A failed asset still counts as settled, so a missing file can't trap the page.
    Three bugs found and fixed while building it, all recorded in the vault: `useSpring` without a
    `from` faded the veil **in** over the page; `onRest` closes over the render that *started* the
    animation so it read a stale `progress` and never exited; and a wall-clock `setTimeout` fires in a
    background tab where rAF (and therefore the spring) is frozen, yanking the veil mid-travel — the
    exit now polls the spring's own value on rAF. Also retuned: the site's soft spring crept to the
    target and held the page ~15 s after the assets were in.
  - **Responsive.** The overlays were desktop Figma compositions and the adaptive grid only scales rem
    — it can't re-compose. Each act now has a mobile-first layout with `md:` restoring the desktop one
    (hero words stack, footer goes vertical, the hand's second heading drops, the wave block spans full
    width, the tree shows one tagline and stacks its form). `SiteHeader` collapses to **brand +
    burger**; new **`MobileMenu`** is a full-screen black panel with a burger that crosses into an X
    and staggered links. Its panel and close button are **portalled to `<body>`** — the header's
    `backdrop-filter` makes it a containing block for `fixed` children (the panel rendered as a strip
    under the bar), and the scene container's `isolation: isolate` scopes the header's `z-20` so it
    can never rise above a body-level panel.
  - **Metadata.** `siteConfig` filled in with the real Auralis name/positioning/theme colour. The brand
    mark (the scene's glyph, two crossed bars — `public/assets/brand/logo.svg`) now generates
    `app/icon.tsx`, `app/apple-icon.tsx` and `app/opengraph-image.tsx` via `ImageResponse` at build
    time, the card using the site's own display face. Removed `app/favicon.ico` and the starter's
    placeholder icon set, and dropped the `icons` / `openGraph.images` blocks from `generateMetadata`
    — declaring paths there **overrides** the generated routes. `manifest.json` rewritten to match.
    Verified in the served `<head>`: `og:image` → `/opengraph-image` at 1200×630 with alt, Twitter
    reusing it, `icon` → `/icon`, `apple-touch-icon` → `/apple-icon`.
  - ⚠️ Not changed, needs a decision: `.env` still carries the starter's `NEXT_PUBLIC_SITE_URL=
    https://example.com`, so every canonical/OG/sitemap URL points at the placeholder until the real
    origin is set.
  `preloader/`, `scene-ready.ts`, `mobile-menu.tsx`, `site-header.tsx`, the four overlays, `home.tsx`,
  `site.ts`, `generate-page-metadata.ts`, `app/{icon,apple-icon,opengraph-image}.tsx`, `manifest.json`.
  `yarn lint` / `yarn build` clean.

- **Scene optimised for mobile / low-end: device tiering, shared ticker, prewarmed post chain.**
  Everything derives from one tier read once at construction (`lib/scene/device.ts` — new), so DPR,
  counts, bloom, lights, the frame budget and the pointer can't drift apart.
  - **The micro-freeze is fixed.** `renderer.info.programs` grew **41 → 42** across a full scroll,
    which means a shader linked *mid-scroll* — `WipePass` compiles on first use, and its first use is
    the wave→tree transition. It's now compiled at load into a throwaway target (plus `initTexture`
    on every scene texture). Measured after: **42 → 42, stable across the whole sweep.**
  - **Render loop** moved off its own forever-`rAF` onto the app-wide `subscribeToTicker`, gated on
    `document.hidden` + an `IntersectionObserver`, and throttled per tier (**30 fps mobile / 45 tablet
    / uncapped desktop**). The scene clock became **real seconds with a clamped `dt`** instead of
    `tick / 60` — a frame counter would have run the drift and ripple at half speed once the mobile
    cap applied, and a backgrounded tab would have teleported everything on return.
  - **Per tier** (verified in-browser, desktop → mobile): DPR `1.5 → 0.85`; shadows `on → off` (the
    key light's 4096² PCF-soft map over tens of thousands of instances is the frame's most expensive
    item); lights `6 → 3`; glyph `32 000 → 10 880`; hand density `12 → 4` (~50k → ~17k); tree density
    `3 → 1` (~150k → ~50k); dust `700 → 238` per field; bloom strength and radius halved and the pass
    **skipped entirely when strength ≈ 0**. Net shader programs on mobile: **42 → 22**.
  - **`EffectComposer` now clamps its own pixel ratio** from the same function as the renderer —
    otherwise the whole post chain renders at raw DPR and throws the scene-pass saving away.
  - Renderer flags per tier: `antialias` off on mobile, `alpha: false`, `stencil: false`,
    `powerPreference` high-performance on desktop only.
  - **iOS specifics**: no `ResizeObserver` on mobile (Safari fires a viewport change every time the
    URL bar collapses mid-scroll, and rebuilding the drawing buffer + both HDR targets reads as a
    full-scene flash — the surface is sized once per session, at the cost of not reflowing on
    rotation); the canvas wrapper is promoted to its own compositor layer
    (`transform-gpu backface-hidden will-change-transform`); pointer listeners **not attached at all**
    on mobile, and `{ passive: true }` elsewhere.
  - `window.__scene.info()` (debug builds) now reports tier, DPR, shadows, light count, per-cloud
    counts, frame budget and `programs`, so §0/§14 can be re-measured at any time.
  Not done, and why: the scene is not stripped for bots (`isBot()` exists but the scene *is* the page
  — there is no poster to fall back to yet), and assets are already a baked `bin_u16` point cloud, so
  Draco/KTX2 don't apply. `device.ts`, `particle-scene.tsx`, `ring-light.ts`, `bloom-pass.ts`.
  `yarn lint` / `yarn build` clean.

## 2026-07-26

- **Wave UI no longer outlives its own act — the two scenes stopped stacking.** The wipe line is
  **tilted so the top-right corner is covered last**, and that is exactly where this overlay's heading
  sits: a big, bright fragment of the wave act survived to the very end of the wipe, floating over a
  tree scene that already owned the rest of the frame. Two acts on screen at once, which is what read as
  "the layers overlap".
  - Fix: new **`waveUiOpacityAt(progress)`** retires the leftover wedge — the UI holds **full opacity
    through most of the wipe** and fades out over `w ≈ 0.45 → 0.72`, tuned to the heading's own
    geometry (the tilted line reaches its patch of screen around `w ≈ 0.64–0.75`), so it's gone by the
    time the tree dominates. Applied to the same content layer as the drift.
  - The **clip still does the disappearing and still sits exactly on the scene's line** — this only
    disposes of what's left once its own region is being covered, so it isn't a return to
    "content fades out instead of being masked".
  Measured: opacity 1 at `w ≤ 0.43`, 0.575 at `w = 0.57`, 0.033 at `w = 0.69`, 0 at `w = 0.76`; the
  wave act itself is untouched. `scene/wipe-line.ts`, `scene/index.ts`, `wave-overlay.tsx`.
  `yarn lint` / `yarn build` clean.

- **Wave UI now drifts with the wave view during the wipe — the real cause of "the mask lags".**
  Chased down by measurement, and the clip was never the problem: a hit test (which honours `clip-path`)
  showed the cards straddling the line are cut **exactly on it** — a probe point below the line misses
  the card, one above hits it — and the applied polygon matched the frame's scroll to the digit.
  - What was actually wrong: **`WipePass` slides the wave layer down** while the tree wipes in
    (`wipeWaveDrop = 0.07`, up to 7 vh — it and the tree drift at different rates, which is what reads
    as depth), and the **DOM overlay didn't move at all**. The scene slid out from under a stationary UI
    that was merely being cut, which is exactly what "the mask lags behind" looks like.
  - Fix: new **`waveDriftAt(progress)`** (next to `wipeLineAt`, same single source for the wipe maths),
    applied as a `translateY` to a **content layer inside** `WaveOverlay` — never to the root, which
    carries the clip: the cut lives in screen space and must hold its line while the content moves under
    it. Verified: 2 vh → 13.48 px, 4 vh → 26.94 px, 6 vh → 40.39 px at a 673 px viewport, matching the
    shader, with the clip advancing independently; and mid-glide the cards cut exactly on the scene's
    diagonal.
  - Note for future digs: **the Browser pane throttles rAF when the tab isn't fronted**, which freezes
    the scroll-driven loops and makes screenshots look like a canvas/DOM mismatch that isn't there. An
    earlier "promoted layers ignore the ancestor clip" reading came from exactly that artefact.
  `scene/wipe-line.ts`, `scene/index.ts`, `wave-overlay.tsx`. `yarn lint` / `yarn build` clean.

- **"The mask lags while scrolling" — it wasn't the mask; a promoted layer was ignoring it.**
  *(Partly superseded — the clip was fine; see the entry above. The `filter` removal from `RevealItem`
  is kept: it's still the right call for blocks that a clip has to cut.)* Measured
  rather than guessed, and the clip turned out to be exactly right the whole time:
  - The applied `clip-path` matched the current frame's scroll **to the digit** (`errNow: 0` across
    every sampled frame), and a debug hairline drawn from the clip values sat **pixel-exact on the
    scene's wipe edge** — both at rest *and* mid-scroll.
  - What actually broke: **the wave cards weren't being clipped by it while moving.** `RevealItem`
    animated `filter: blur()`, and any non-`none` filter (even `blur(0px)` at rest) promotes the element
    to its own composited layer — a promoted layer picks up an **ancestor's `clip-path` a frame late**,
    so the white cards kept drawing past a line that was itself in the right place. Statically they
    clipped fine, which is why it read as the *mask* lagging.
  - Fix: `RevealItem` animates **`y` + `opacity` only**, no filter, so the blocks are never promoted and
    the ancestor clip applies in the same frame. `RevealText` keeps its blur — letters/words aren't the
    thing being clipped mid-motion, and the blur is the point of the copy reveal.
  Verified with the debug hairline during a slow glide: every card now cuts exactly on the line.
  `reveal-item.tsx`. `yarn lint` / `yarn build` clean.

- **Wave clip back to a single root `clip-path` — fixes the broken mask and the ghost bands.** Two
  reports, one cause: the reveals put a `transform` **and** `filter: blur()` on the very cards the wipe
  clip was applied to.
  - **The mask was wrong** because the per-element clip cached each element's
    `getBoundingClientRect()` to map the wipe line into local percentages — and by the time it measured,
    the reveal spring was holding the cards at their `translateY(30px)` start, so every cached top was
    offset and each card clipped along its own wrong line instead of one shared one.
  - **Horizontal bands bled into the tree scene** because `clip-path` and `filter: blur()` sat on the
    same element: a card clipped down to a sliver was then blurred, smearing it into a soft white bar.
  - Fix: **clip the overlay root, not each element.** The root is `inset-0`, i.e. exactly the viewport,
    so the wipe line's `y` (already in % of viewport height) *is* the local percentage — no geometry to
    measure, nothing to cache or go stale, and the animation and the clip end up on separate elements.
    Per-element clipping only ever existed to protect the cards' `backdrop-filter`, and the cards have
    been opaque since they went solid white, so nothing is lost. Dropped `data-wave-clip` and the
    `ResizeObserver`/measure pass with it.
  Verified: mid-wipe the whole overlay cuts along one continuous line matching the scene, and the tree
  scene is clean (root resolves to an empty polygon, cards carry no clip of their own).
  `wave-overlay.tsx`. `yarn lint` / `yarn build` clean.

- **Reveal exits are now actually animated (they were snapping), and the springs are softer.**
  Reported as "the animations aren't smooth, and the exits are just a plain opacity fade". Both were
  real, and the second had a specific cause: **`TextEngine`'s `immediateOut` defaults to `true`** — its
  `playOut` passes that straight through as the spring's `immediate` flag *and* zeroes every out-delay,
  so the text **snapped** to hidden with no motion and no stagger. The only thing left moving was
  `ScrollFade`'s block opacity — exactly what was described. `<Inview>` has the same default. Both now
  get **`immediateOut={false}`**, so the exit is the entry played backwards, staggered.
  - **Trigger rebuilt: `enabled`, not scroll progress.** A progress trigger *cannot* animate out while
    scrolling forward (progress only increases), so exits could only ever have played on scroll-up —
    and `TextEngine` froze its state entirely once its marker left the viewport. Both engines drive
    `playIn`/`playOut` off their **`enabled`** prop in every non-`manual` mode, and the pinned overlays
    are permanently "in view", so `enabled` alone gates them. New **`act-window.ts`** publishes a
    per-act on-screen boolean from the shared frame-memoised progress through `useSyncExternalStore`
    (one rAF for every reveal on the page). This **deleted `RevealScope`** — no markers, no context, no
    spacer ownership; the spacer went back to `HomeView`.
  - **The hero reverses too now.** It was previously `mode="once"` (a progress trigger can't reverse it)
    and left on the block fade alone; with an `enabled`-driven window it plays in on mount *and* walks
    back out as the X bursts.
  - **Softer motion:** one shared spring `{ mass: 1, tension: 88, friction: 30 }` (friction well above
    tension → eases and settles, no snap or overshoot) replacing the old ~190/26; staggers relaxed
    (letters 14→22 ms, words 26→45 ms, items 70→80 ms) and the blur deepened 9→12 px.
  - Act windows end slightly **before** the matching `ScrollFade` disappear window, so the reveal's own
    exit is what reads and the block fade only mops up behind it.
  Verified frame-by-frame: the hero exit now cascades (`[0.76, 0.85, 0.93, 0.96, 1, 1, 1]` mid-flight)
  instead of jumping to hidden, and every act holds its neighbours in the reversed state.
  `act-window.ts` (new), `reveal-text.tsx`, `reveal-item.tsx`, `index.ts`, `hero-overlay.tsx`,
  `home.tsx`; `reveal-scope.tsx` deleted. `yarn lint` / `yarn build` clean.

- **Reveal animations for the whole overlay stack (rise + blur + fade), reversed on the way out.**
  New `components/common/reveal/`:
  - **`RevealText`** — the only way copy animates (hard rule #1: text is `spring-text-engine`). Two
    variants, both rising **from below** through a **blur + opacity** dissolve: `"heading"` splits
    **per letter** (tight stagger, for the section `h1`/`h2`s), `"copy"` **per word** (looser, for
    taglines and descriptions).
  - **`RevealItem`** — the non-text counterpart (glass pills, CTAs, stats, work cards, the contact bar)
    on `<Inview>`, same rise/blur/fade so the page reads as one motion system. `index`/`count` stagger a
    group and run the **exit in reverse order**.
  - **`RevealScope`** — the scroll anchors. The overlays live in the `fixed inset-0` scene container, so
    they're *permanently* in the viewport and the usual observer triggers fire once at mount and never
    again. It renders a **marker block per act inside the scroll spacer** (the only part that scrolls)
    and hands the refs down by context, so overlays stay Server Components — only the reveal leaves are
    client. Markers are pure CSS: top edge at `at·maxScroll + 50vh` so the toggle fires exactly at the
    act's scroll position, running down to where the act leaves the screen.
  - **Exit is the entry played backwards**, per requirement — inherent for `TextEngine` (`*Out` *is* the
    resting state), and for `Inview` it needed **`immediateOut={false}`** (it defaults to `true`, which
    snaps the exit instantly).
  - The **hero** takes no act: it's on screen at load, so it plays in **once on mount** as the page
    intro (scroll progress only ever increases, so it can't drive a reverse-out) and leaves with its
    `ScrollFade` block fade.
  Two engine constraints drove the markup: `TextEngine` forces `position: relative; display: flex` on
  its own tag, so **layout/position classes moved to a wrapper**; and its tag is a *wrapping flex row*,
  so two-line headings are **one engine per line** stacked by the semantic element (keeping a single
  `<h2>`). Verified per act in-browser: each act's elements reveal, neighbours hold their reversed
  state, and scrolling back reverses them. `yarn lint` / `yarn build` clean.

- **Hand no longer appears fully-formed and dissolve away before its scan-in.** Reported as: mid-flight
  the hand shows complete for a moment, vanishes, then scans in properly — every reload. **Root cause:
  the particle scale is _eased_, never set** (`s = current + (target − current) · ease`). The hand is
  only `updateCloud`-ed while `handActive` (`seqP > 0.4`), so until then its matrices sit at the
  fully-formed **resting** pose; the frame it becomes visible runs with `scan = 0`, whose target scale
  is `0` — but one eased step only moves it ~30 % of the way, leaving the hand at **~70 % size** and
  shrinking away over the next dozen frames. That's the phantom appearance. It repeats on every
  approach from above too, since the cloud isn't updated while hidden, so its matrices stay formed.
  Fix in `updateCloud`: **un-revealed particles (`scanning && revealScale === 0`) snap to exactly zero
  instead of easing**; revealed ones still ease, so the reveal keeps its ramp and the hand-off at
  `scan = 1` stays smooth. Verified at `progress 0.29` (active, `scan = 0`) both on a fresh load and
  approaching from the formed hand — nothing renders; scan-in, formed hand and wave unchanged.
  - Also (found while tracing this, kept): the **async** hand loader now adds its cloud **hidden and
    pre-reveal** (`visible = false` + a one-off `updateCloud({ scan: 0 })`) and **pre-compiles** it off
    the scroll path (`renderer.compile` with the mesh briefly visible — `compile` draws nothing), so the
    freshly-built resting pose can't be drawn between `scene.add` and the next frame, and the first
    genuinely-visible frame doesn't hitch on shader compile + 50k matrix upload. Same treatment the tree
    loader already had.
  `particle-cloud.ts`, `particle-scene.tsx`. `yarn lint` / `yarn build` clean.

- **Wave↔tree boundary flash: mask and opacity were written a frame apart.** Reported precisely — one
  flash per crossing of the wave↔tree boundary, in both directions. A per-frame canvas capture across
  `wipeRange[1]` (0.95) showed **no discontinuity in the WebGL output** either way, so it was again the
  DOM. Cause: a flare's visibility is the product of **two** things — its `mask-image` (which side of
  the wipe line it's on) and its `opacity` — and they were written by **different loops**: the masks
  directly from `HeroLights`'s own rAF, the opacities through react-spring, which flushes style writes
  in its **own** rAF pass, i.e. one frame later. At the boundary both flip at once, so for a single
  frame the pair disagreed — "mask says show, opacity hasn't dropped yet" — and `light_3` is a
  **full-screen `mix-blend-mode: overlay`** layer, so one frame of it unmasked visibly flashes the
  whole scene. Exactly once per crossing.
  - **Fix: the mask now lives in the spring.** Each flare's spring carries `angle` + `edge`, and the
    `mask-image` is an interpolation (`to([angle, edge], …)`) off those — so mask and opacity are
    always written in the **same flush**. Verified per frame across the crossing: the pair is now
    always consistent (`op:1, edge≈96` → `op:0, edge:150`, never mixed).
  - The mask is also **always a gradient** again (the `none` switch from the previous round is gone):
    changing the *type* of `mask-image` forces a layer rebuild, another one-shot glitch at exactly that
    boundary. The bokeh's mask alone is now correct on both sides (`ALL_CUT` before the wipe, `NO_CUT`
    after), so opacity is just a second line of defence.
  - **`wipeLine` store → `wipeLineAt(progress)` pure function.** `HeroLights` wrote it and
    `WaveOverlay` read it, so the reader could run first and clip to the **previous** frame's line.
    Both now derive it independently from the shared, frame-memoised progress — no ordering dependency.
  `hero-lights.tsx`, `scene/wipe-line.ts`, `scene/index.ts`, `wave-overlay.tsx`. Verified in-browser
  (visuals unchanged, clean console). `yarn lint` / `yarn build` clean.

- **Found the tree-scene flicker: a zero-width `disappear` window blanked the overlay at progress 1.**
  Reported as "the scene flickers just before the tree text is fully in". `ScrollFade`'s `ramp()` treats a
  **zero-width window as a step at `start`** — that's deliberate, it's what makes `appear={[0, 0]}` mean
  "on from the beginning". But `HomeView` passed `disappear={[1, 1]}` to the wave **and** tree overlays
  intending "never fades out", which `ramp` therefore read as *fully faded out at progress ≥ 1*. Measured:
  at exactly progress 1 the tree overlay was `opacity: 0; visibility: hidden` — the whole finale UI blanked
  at the very bottom of the page, and Lenis easing onto/off that exact value made it **blink**.
  `disappear` is now **optional**; omit it for overlays that never fade out (the tree — the last act; and
  the wave — which the tree wipe clips away instead). Verified across the sequence: hero 1 → 0.42 → 0,
  hand 0.61 → 0.5 → 0, wave → 1, and **tree `opacity: 1, visible` at exactly progress 1** (was `0/hidden`).
  `scroll-fade.tsx`, `home.tsx`. `yarn lint` / `yarn build` clean.

- **Flicker, round 3: removed per-frame layout thrashing + needless masked blend layers.** The flash
  reproduced on the **production** build too, so HMR was ruled out. A 75 s capture on the prod build with
  `?debug=1` (which turns on `preserveDrawingBuffer`, making the canvas reliably readable) sampled canvas
  luminance for **3472 frames → zero excursions**: the WebGL output is stable, so the flash is in the **DOM
  compositing** over it. Two real causes found there:
  - **Six forced layouts per frame, interleaved with style writes.** The four `ScrollFade`s, `HeroLights`
    and `ParticleScene` each computed scroll progress from `documentElement.scrollHeight` in their own rAF
    — a forced synchronous layout each — while those same loops write spring styles: textbook
    write→read→write **layout thrashing**, every frame of every scroll. New **`utils/scroll-progress.ts`**
    measures `scrollHeight` **once** (`ResizeObserver`-invalidated) and memoises the result **per frame**
    via `document.timeline.currentTime`. Measured: **6 → 0** `scrollHeight` reads per frame (240 frames
    instrumented).
  - **Full-screen `mix-blend-mode` layers carrying a mask that cut nothing.** All three flares held a
    `mask-image` at all times, though outside the wave→tree wipe it was a fully-opaque gradient. They now
    carry **`mask-image: none`** whenever nothing is being cut (masks are CSS vars written by the same
    rAF), so two full-screen masked blend layers leave the compositing path for ~95 % of the scroll. The
    glint keeps its design feather.
  - Also **`isolation: isolate`** on the pinned container, scoping the blend group instead of letting its
    backdrop be the whole page.
  `utils/scroll-progress.ts` (new), `scroll-fade.tsx`, `hero-lights.tsx`, `particle-scene.tsx`, `home.tsx`.
  Verified on the prod build: visuals identical (wipe masks still resolve to the same hard counter-cuts),
  clean console. `yarn lint` / `yarn build` clean.

- **Intermittent full-screen flicker: instrumented end-to-end — no app defect found; attributed to dev-mode
  HMR.** *(Superseded — it reproduced on the prod build; see the entry above.)* After the per-frame fixes below, the flicker persisted, so a 90 s in-page capture was run (real
  wheel scroll through Lenis): **zero** layout shifts, long tasks, rAF gaps, WebGL context losses, canvas
  resizes, or canvas luminance spikes. Only periodic document mutation: Lenis toggling `lenis-scrolling` /
  `lenis-smooth` classes on `<html>` at scroll start/stop — but no CSS rule in the project matches them, so
  their recalc cost is ~zero. Dev-server logs showed the real pattern: **continuous Turbopack rebuilds from
  the editing session** — every source edit rebuilds, Tailwind regenerates the full stylesheet, and the open
  tab's Fast Refresh hot-swaps CSS → a one-frame full-page flash, matching the report exactly ("periodic,
  ~1 ms, at any scroll position"). A DOM-injecting browser extension (`bis_register` attributes in the
  hydration-mismatch log) is a secondary suspect. **No app code changed.** Added a `winter-prod` config to
  `.claude/launch.json` (`next start` on :3011) for an HMR-free A/B check; user to confirm on :3011.

- **Killed the two per-frame/periodic DOM stalls behind the intermittent full-screen flicker.**
  A brief flash was reported *periodically, at any scroll position*. Two causes, both DOM-side (the
  WebGL loop itself measured clean at 60 fps with no long frames or context loss):
  - **Periodic forced reflow.** `applySize()` — which reads `container.clientWidth/Height` and so forces
    a synchronous layout — was called **every 30 frames** (~0.5 s) from inside `renderFrame`, i.e. a
    forced mid-frame reflow on a timer. Replaced the poll (and the `window.resize` listener) with a
    **`ResizeObserver`** on the container: event-driven, fires only on real size changes, and covers
    window *and* layout changes.
  - **Per-frame document-wide style invalidation.** `HeroLights` wrote `--wave-clip-l/-r` on
    **`:root`** every frame (custom properties inherit → dirties every element on the page) and
    `WaveOverlay` read them back with `getComputedStyle` every frame (a **forced full style recalc**).
    The line now travels through a shared **`wipeLine`** module (new `scene/wipe-line.ts`, same pattern
    as `tuning`) — zero style cost. The flare mask vars still have to be CSS, but they're now set on
    **`HeroLights`'s own root element** instead of `:root`, so invalidation stays inside those three
    layers. On a page stacked with `mix-blend-mode` + `backdrop-filter`, that per-frame churn is a
    well-known repaint/flicker hazard.
  `particle-scene.tsx`, `hero-lights.tsx`, `wave-overlay.tsx`, new `scene/wipe-line.ts`, `scene/index.ts`.
  Verified: clip polygons byte-identical to before, flare masks resolve, resize still tracked, 60 fps,
  clean console. `yarn lint` / `yarn build` clean.

- **Wave cards → solid white; wipe renders both views live (kills the dust jump/flicker).**
  - **Wave work cards are now opaque solid white** (`bg-overlay-ink`) with **black text** (`text-overlay-solid`)
    — dropped the translucent `bg-overlay-glass`, the `backdrop-blur`, and the border. (The per-element
    clip in `WaveOverlay` is kept — still correct, and cheap — even though its original glass rationale is
    now moot.)
  - **Wipe no longer bakes the tree once.** The old path baked `rtTree` a single time and reused it for the
    whole transition; but `treeDust` drifts every frame, so the baked dust sat **frozen** through the wipe
    and then **snapped** to its live position when the direct render took over (the reported flicker + "pollen
    jumps"). Now **both** views render **live every frame** during the wipe (`rtWave` = wave, `rtTree` = tree)
    — the tree cloud is static so it's a **warm redraw**, and the composited tree is pixel-identical to the
    post-wipe direct render, so the dust stays live and the boundary is seamless. Removed the `bakeStep` /
    `bakedW/H` machinery. Verified **60 fps** through the wipe (warm double-render; the old "~74 ms" was the
    cold compile, now done once at load). Tree cursor-push is forced off mid-transition.
  `wave-overlay.tsx`, `particle-scene.tsx`. Verified in-browser (clean console, 60 fps). `yarn lint` /
  `yarn build` clean.

- **Wave/tree polish: per-element card clip, no scan band, screen-plane tree hover, glass form + blinking CTA.**
  Follow-up fixes on the same acts:
  - **Card glass now survives the clip (for real).** The previous fix left `WaveOverlay`'s `clip-path`
    on the **root**, so the moment the line started clipping (polygon, not `none`) the ancestor became a
    backdrop-root and the cards' `backdrop-filter` died again. `WaveOverlay` is now a **client** leaf
    that clips **each element individually** (heading, tagline, every card) — an element's _own_
    clip-path doesn't break its _own_ backdrop-filter. `HeroLights` publishes the wipe line as
    `--wave-clip-l` / `--wave-clip-r` (raw viewport-height %); a small rAF reprojects it into each
    element's box (geometry cached, `ResizeObserver`-refreshed). Verified `blur(6px)` stays live through
    the active clip.
  - **Scan band removed.** `WipePass`'s bright glow on the wipe line read as a hard white gradient on the
    contour — dropped it (and the `uBandColor/Strength/Width` uniforms + the `Color` import); the cut is
    now a clean AA edge.
  - **Tree hover fixed.** The GPU push was **world-space radial**, so near beads were shoved toward the
    camera and perspective magnified them into giant jittery blobs (also the "twitching" at the end). It
    now pushes in the **view plane (screen-space x/y only)**, so beads part *around* the cursor like the
    hero glyph and rest stably.
  - **Tree form** is now proper glass (`--blur-overlay-form: 16px`), its copy is fresh (distinct from the
    wave block), and the CTA's live indicator is a **blinking green square** — new `LiveDot` client leaf
    (spring loop, no CSS keyframes; hard rule #1).
  `wave-overlay.tsx` (→ client), `hero-lights.tsx`, `wipe-pass.ts`, `particle-cloud.ts`,
  `tree-overlay.tsx`, new `hero-overlay/live-dot.tsx`, `globals.css`. Verified in-browser (clean
  console). `yarn lint` / `yarn build` clean.

- **Tree-section UI, finer tree + wave, GPU cursor hover, tree scan-in, more dust, card-glass fix.**
  A batch on the wave/tree acts:
  - **`TreeOverlay`** (new, Figma 808:156) — the final act's UI: centred **ENVISION** heading, a tagline
    pinned to each edge, and a bottom-centre **glass form bar** (Name / Email + "Start a Project" CTA
    with a `--overlay-accent` dot). Fades **in** once the tree has wiped in (`ScrollFade [0.93,0.98]`).
  - **Finer particles.** Tree: `particleSize 0.13 → 0.08`, `density 2 → 3` (~150k). Wave: `hand.density
    8 → 12` (~50k) with the grid regrown (`columns 275→336`, `rows 122→150`, `spacing 0.5→0.41`) and
    `wave.sizeBoost 1.4 → 0.9` — smaller, sandier curtains.
  - **Cursor hover on the wave + tree** (like the hero). Wave: the live hand cloud takes the pointer
    once formed (`pointerOnPlane(waveCenter)`, gated by `waveGate`). Tree: it's ~150k (too heavy to
    re-run `updateCloud`), so the repulsion is done on the **GPU** — `buildParticleCloud` adds
    `uPointer/uPointerR/uPointerS` to the material and the vertex shader pushes each instance out of a
    sphere around the cursor; the scene sets them each frame in the direct tree render (projected via
    `treeCamera`). The cloud stays baked; only a uniform + re-render.
  - **Tree scan-in.** `WipePass` now adds a bright **scan band** riding the wipe line (tree side), so
    the tree *materialises* bottom-up like the hand's scan instead of just sliding in.
  - **Dust** now hangs over the **hand** and **tree** acts too (their own `createDust` fields at each
    podium), not just the X.
  - **Wave card glass fixed for real.** The clip that hides the wave UI is a `clip-path` — but even a
    no-op one makes the box a backdrop-root and kills the cards' `backdrop-filter`. `HeroLights` now
    publishes `--wave-clip: none` (not a full-cover polygon) while the wipe line is still off-screen,
    switching to the real `polygon(…)` only once it actually clips — so the glass survives the wave.
  `scene.config.ts`, `particle-cloud.ts`, `particle-scene.tsx`, `wipe-pass.ts`, `hero-lights.tsx`,
  `wave-overlay.tsx`, new `hero-overlay/tree-overlay.tsx`, `home.tsx`, `globals.css`. Verified
  in-browser. `yarn lint` / `yarn build` clean.

- **Card glass restored (mask → `clip-path`); live dev tuning panel for pink + bloom.** Two things:
  (1) The wave UI's disappear-clip was a CSS **`mask`**, which (even fully open) made the overlay a
  backdrop-root and **killed the glass cards' `backdrop-filter`**. Swapped it for a **`clip-path:
  polygon(…)`** cut along the same wipe line (clip doesn't isolate `backdrop-filter`), so the cards
  are frosted again *and* still clip to the tree. `HeroLights` now publishes `--wave-clip-l` /
  `--wave-clip-r` (the wipe line's on-screen `y%` at each edge, for **all** progress) on `:root`
  instead of `--flare-edge-content`. (2) New **`TuningPanel`** (`components/common/tuning-panel/`,
  mounts only with `?tune`): live sliders for the **pink bloom particles** (colour + glow) and the
  **bloom pass** (threshold / strength / radius). Writes a shared `scene/tuning.ts` store the scene
  reads every frame — `scatter.color/glow` (by reference → `updateCloud` picks it up) and
  `BloomPass.setConfig()`. Seeded from `sceneConfig`; edits are runtime-only. `hero-lights.tsx`,
  `wave-overlay.tsx`, `home.tsx`, `bloom-pass.ts`, `particle-scene.tsx`, new `tuning.ts` +
  `tuning-panel/`. Verified in-browser (glass back; changing the colour recolours the burst live).
  `yarn lint` / `yarn build` clean.

- **Wave UI now _clips_ along the tree wipe (not opacity fade); flare seam de-banded (hard cut).**
  Two fixes: (1) The wave-section UI (`WaveOverlay`) was cross-faded out by `ScrollFade`; now it
  **disappears by being clipped along the tree-wipe line** — a hard-cut `linear-gradient` mask on its
  root reading `--flare-wipe-angle` / `--flare-edge-content` (published on `:root` by `HeroLights` each
  frame; the content box is the plain viewport, and the var is forced to `150%` = fully clipped once
  the wipe passes so the UI stays gone). Its `ScrollFade` now only fades it **in** (`disappear` is a
  no-op `[1,1]`). (2) The flare masks were **feathered** (~0.3% AA), and that sliver **overlapped** the
  opposing (wave-side vs tree-side) mask, so `light_1` and `light_3` both blended in the band →
  **double `overlay` darkening = a dark blurry seam**. Changed all four wipe masks (rays/glint/bokeh/
  content) to **hard cuts** (both stops at the edge), so every pixel carries exactly one flare and the
  1-px boundary hides in the crisp scene wipe. The mask vars moved from the `HeroLights` wrapper to
  `document.documentElement` so the overlay subtree can read them. `hero-lights.tsx`,
  `hero-overlay/wave-overlay.tsx`, `home.tsx`. Verified in-browser (isolated flare seam clean; UI
  clips along the line and stays gone). `yarn lint` / `yarn build` clean.

- **Wave cards stretch to screen height; flare parallax gated off through the wipe; `light_3`
  enlarged.** Three tweaks: (1) `WaveOverlay`'s work-card block now spans `top-[14.9375rem]` →
  `bottom-[1.875rem]` as a `flex-col`, and the grid is `flex-1 grid-rows-2` — so the 2×2 cards
  **stretch to fill the viewport height**. (2) `HeroLights` **disables the cursor parallax from
  `treeStart` on** (`applyParallax` gate): during the wave→tree wipe each layer drifted a different
  amount, shifting the spatial mask cuts apart and opening a **dark seam** where they overlapped — now
  the drift eases to 0 before the wipe, so the cuts stay on the line. (The pointer listener + rAF were
  merged into one effect so both share the gate.) (3) `light_3` is **oversized** by
  `BOKEH_OVERHANG_VMAX` (10vmax per side, `inset: -10vmax`) so its wave-phase parallax never drags a
  viewport edge into view; `edgeFor` uses the enlarged box so its wipe cut still lands on the line.
  `hero-lights.tsx`, `hero-overlay/wave-overlay.tsx`. Verified in-browser. `yarn lint`/`build` clean.

- **Tree flares restored to `light_1`+`light_2`; flare sets now swap _through the wipe_.** The last
  act (tree) again gets `light_1` + `light_2` — like the first scene — instead of holding `light_3`.
  And the **wave → tree** flare change now rides the **same screen-space wipe that swaps the scenes**:
  `light_3` is masked to the **wave side** of the tilted wipe line and `light_1`/`light_2` to the
  **tree side** (`wipeMaskFields` + `edgeFor` place each layer's `linear-gradient` cut on the line;
  `--flare-edge-rays/-glint/-bokeh` set per-frame). As the wipe sweeps, the flares hand over exactly
  with the scenes — a crossover (both sides carry a flare, meeting at the crisp scene cut), so no soft
  edge like the earlier tree-only reveal. The X/hand → wave hand-off stays a plain opacity crossfade.
  Only `hero-lights.tsx`. Verified: tree `light_1`=1/`light_3`=0, wave `light_3`=1, mid-wipe both cut
  to their side of the line. `yarn lint` / `yarn build` clean.

- **Wave-section UI overlay (`WaveOverlay`) + `light_3` bokeh flare.** Recreated the third-section UI
  from Figma frame 793:256 (styles/spacing kept, copy rewritten for **Auralis**): a right-half block —
  right-aligned `<h2>` "SHAPED FOR / WHAT COMES NEXT", a tagline, and a **2×2 `<ul>` of glass work
  cards** (number + one-line uppercase description; `bg-overlay-glass` + `border-overlay-edge`),
  right-anchored with `max-w-[calc(100vw-3.75rem)]`. Shares the persistent `SiteHeader`; `HomeView`
  cross-fades it over the wave via `ScrollFade` (`appear [0.6,0.67]`, `disappear [0.77,0.83]`). Added
  a **third flare** `light_3.png` to `HeroLights` (`mix-blend-mode: overlay`, full-frame `inset-0`):
  it **crossfades in as `light_1`/`light_2` fade out** over the camera crane-up (`handoffAt`), then
  holds through the wave + tree — so it appears *in place of* the first two. This **replaces** the
  previous "flares fade back in over the tree" behaviour (the tree is now `light_3`'s act, not
  `light_1`/`light_2`'s). `hero-lights.tsx`, new `hero-overlay/wave-overlay.tsx`, `home.tsx`. Verified
  in-browser: X/hand show `light_1`+`light_2`, they crossfade to `light_3` by ~0.65, the wave shows
  the new UI. `yarn lint` / `yarn build` clean.

- **Tree flares now fade in by _opacity_ (no spatial wipe mask) — the seam is clean.** The flare was
  spatially masked along the tree's wipe line, but `light_1` is a soft image, so a hard cut through it
  still read as a **soft/gradient seam** (the mask itself was verified crisp on a solid fill — the
  softness was the image content, not the cut). Replaced with a plain **opacity fade-in** synced to
  the **back half of the wipe** (`TREE_FADE_START_FRAC` 0.5 → the flare arrives as the tree finishes
  revealing, without darkening the still-prominent wave earlier). No spatial edge → **no seam**.
  Removed the `wipeMaskFields`/`edgeFor` angle/edge machinery, the `--flare-wipe-*` vars, and the
  glint's wipe/`mask-composite` (feather only again). Only `hero-lights.tsx`. `yarn lint`/`build` clean.
  _(Supersedes the "exact wipe line" reveal below — a spatial reveal of a soft image can't be crisp.)_

- **Film grain over the scenes (below the UI).** New `Grain` component (`components/common/grain/`):
  a tiled monochrome SVG `feTurbulence` noise, `mix-blend-mode: overlay` at `--grain-opacity` (0.13),
  `pointer-events-none`, at `z-[5]` inside the pinned scene container — above the canvas + flares
  (auto `z`), below the UI overlays (`z-10`) and header (`z-20`), so every scene is grained but the UI
  stays crisp. Static (a texture, not motion — hard rule #1). `home.tsx` renders it after `HeroLights`.

- **Pink bloom particles surfaced as one knob (`bloomParticles`).** New top-level
  `sceneConfig.bloomParticles { color, glow }` (a shared `BLOOM_PARTICLES` const, "TUNE HERE") is the
  single colour/intensity knob for the pink-glowing beads — the X scatter burst, the hand→wave vortex
  streams, and (now) the hand scan-in all read it; pair with `sceneConfig.bloom` (threshold/strength/
  radius) for the bloom pass. `scatter.color/glow` now source from it.

- **Hand scan-in glows pink, not white.** The bottom-up scan reveal band was a plain white bloom;
  it's now **tinted with `bloomParticles.color`** (via `scatterTint` in `updateCloud`) so it matches
  the scatter/vortex pink. `hand.scanGlow` 4 → 6 so the tinted red+blue channels still clear the bloom
  threshold and read pink (not just blue).

- **Tree finale camera pulled back to match the other scenes.** `camera.treePos` z −140 → **−125**
  (35 → **~50 units** back, the X-start / hand-end standoff), so the tree is framed at the same scale
  as the X/hand instead of zoomed in.

- **Flare mask seam cleaned up (no grey gradient band).** The tree-reveal flare mask's soft edge (1%)
  sat on the *wave* side of the wipe line, so the darkening feathered up across the seam into the light
  wave view as a grey gradient band. The cut is now **crisp** (~0.2% AA) and **entirely on the tree
  side** (`#000` ends just before the edge, `transparent` exactly at it) — nothing bleeds past the line.

- **Wave no longer flickers when scrolling back up to it.** In the direct tree section
  (`progress ≥ wipeRange[1]`) the hidden wave curtain used to **freeze** (not updated); scrolling back
  up re-rendered that stale frame and eased it to the live ripple over a few frames — a visible
  flicker/settle as the wave re-appeared. Now the hidden curtain **keeps updating** (`wave = 1`, 33k —
  cheap, the tree render is static) so it's always current and re-appears seamlessly.

- **HeroLights flares: fade out much later, and re-reveal through the tree's *exact* wipe line.**
  Refines the previous entry per feedback. (1) The post-hand fade now runs much later —
  `FLARE_FADE_SPAN` 0.34 → 0.42, so `flareOpacityAt` reaches 0 at ≈ real progress 0.71 (was 0.64):
  the flares linger through the whole crane-up + vortex and only clear **just before the wave forms**.
  (2) The tree-scene reveal was an approximate bottom-up sweep; now the flare mask matches the tree's
  screen-space wipe **exactly**. `wipeMaskFields` reconstructs the wipe field (`lineC = vUv.y +
  (vUv.x−0.5)·wipeTilt`, `uWipe = −0.3 + w·1.6`) and `edgeFor` solves the tilted `linear-gradient`
  **angle** + **stop %** per layer (set as `--flare-wipe-angle` / `--flare-edge-rays` /
  `--flare-edge-glint` on the wrapper each frame) so the mask's cut lands on the *same tilted line*
  that reveals the tree — anchoring each box's centre and stepping to `uWipe` so the oversized rays
  square and offset glint box both land right. Glint scale 1.15 → 1 (keeps its mask box unscaled).
  Only `hero-lights.tsx`. Verified in-browser: flare edge tracks the wipe line across the sweep; fade
  now ends ≈ 0.71. `yarn lint` / `yarn build` clean.

- **HeroLights flares: slower fade-out, and they re-appear over the tree through a reveal mask.**
  (1) The fade as the camera cranes up off the hand was too quick (real progress 0.40 → 0.50); widened
  via a new `FLARE_FADE_SPAN` (0.34, ≈ 0.40 → 0.64) for a slow, gentle fade that still finishes before
  the wipe. (2) Added the **same flares to the final (tree) scene**, revealed through a **bottom-up
  mask** (`flareRevealAt` → `--flare-reveal` on the wrapper → a `linear-gradient(to top …)` mask on
  each layer) swept **in sync with the tree's screen-space wipe** (`sequence.wipeRange`), so they wipe
  in exactly as the tree does. `flareOpacityAt` returns to 1 in the tree section (the mask gates it
  there); the glint composites its feather + the reveal via `mask-composite: intersect`. All per-layer
  (a masked/faded wrapper would cut `mix-blend-mode` off the canvas). Only `hero-lights.tsx`. Verified
  in-browser (fade now spans 0.40 → 0.64; flares wipe in over the tree). `yarn lint` / `yarn build` clean.

- **Wave beads brightened to match the other scenes (`wave.lift`).** The wave curtain sits far
  (z ≈ −120), high and tilted, so the static key light (aimed at the glyph) rakes it obliquely and
  the white beads read **dark grey** — much darker than the well-lit hand/X beads. Added a white
  **emissive lift** (`wave.lift = 2`, HDR) floored onto the settled beads via the `aGlow` emissive
  path, ramped in over the **back half** of each particle's journey (so the mid-transition vortex
  streams keep their pink). Kept **below** `glow.bloom.threshold` (3.5) so they brighten to the
  bright-white range without glowing. `particle-cloud.ts` + `scene.config.ts`. Verified the wave now
  reads as crisp white beads (no bloom halos) matching the hand. `yarn lint` / `yarn build` clean.

- **HeroLights flares fade out through transparency as the camera pitches up.** The light-flare
  overlay belongs to the head-on X/hand view; once the camera cranes up off the hand (from `arrive`
  onward) it lingered over the wave/tree. Now both layers' `opacity` is driven per-frame by scroll
  (`1 → 0` over the remapped window `[arrive, arrive + 0.14]`, ≈ real progress 0.40 → 0.50), via the
  same scroll-locked spring path as the roll. Applied **per-layer** (a wrapper with `opacity < 1`
  would form a stacking context and cut the layers' `mix-blend-mode` off the canvas). Only
  `hero-lights.tsx`. `yarn lint` / `yarn build` clean.

- **Wave no longer freezes in the tree section — it keeps rippling.** The tree-reveal wipe baked
  *both* views (wave + tree) once on entry, so the moment the wave finished forming (at `treeStart`)
  the curtain **froze** — it "formed then stopped." Fix: only the **tree** is baked once (150k,
  expensive, genuinely static); the **wave** (33k, cheap) is now re-rendered into `rtWave` **every
  frame**, with the hand updated to the fully-formed rippling curtain (`wave = 1`, advancing `time`),
  so it stays dynamic until the wipe covers it. The tree bake is split onto its own frame so it never
  shares a frame with the wave render (no double-render hitch); `handUpdating` now stops at `treeStart`
  (the wipe block drives the wave update past it, avoiding a double update). Verified: the curtain
  visibly undulates at a held scroll position in the tree section, and the wipe→tree finale is intact.
  Only `particle-scene.tsx`. `yarn lint` / `yarn build` clean. (Amends [[decisions-log]] ADR-0025.)

- **HeroLights: dropped the rays mask entirely — the layer is now an oversized centred _square_, so
  rotation never crops or exposes an edge.** `light_1` is authored square specifically so it survives
  the camera roll; the real bug was the layer being **viewport-shaped** (`inset-0`, landscape) — a
  rotated rectangle leaves gaps at the frame corners, which every previous fix tried to paper over by
  *masking/cropping the source art*. Correct fix honouring the square art: the rays layer is a centred
  square of `RAYS_SIZE` (`130vmax`, ≥ the viewport diagonal for common desktop aspects), so it fully
  covers the frame at **every** rotation angle and no edge is revealed. `light_1` is shown in full,
  **uncropped and unmasked** — no `mask-image`, no `--rays-fade`, no cover-scale. Verified at rest (no
  oval, composition intact) and across the roll (0°→360°, no border). Only `hero-lights.tsx`.
  `yarn lint` / `yarn build` clean. _(Supersedes the two mask-based attempts below.)_

- **HeroLights: replaced the ellipse mask with a _rectangular_ edge feather — no oval ever crops the
  scene.** Even fully opaque, `radial-gradient(ellipse closest-side, …)` inscribes an ellipse and
  **hard-clips `light_1`'s ~39% mid-edges into a visible oval that cut across the scene** at rest —
  exactly what the user objected to. Fix: the mask is now **two crossed linear gradients composited
  with `mask-composite: intersect`** (`-webkit`: `source-in`), a rectangular fade band whose alpha
  reaches `0` following the layer's *rectangle*, so nothing is clipped into an oval. The band width
  `--rays-fade` is still engaged only while rotating (driven per-frame by **`14·|sin(roll)|`%**): `0%`
  when level → both gradients fully opaque → `light_1`'s natural full-frame darkening, **no shape cut
  into the scene**; ~14% mid-roll so the alpha still reaches 0 at the edges and no border sweeps in.
  Verified at rest (no oval) and across the roll (no border). Only `hero-lights.tsx`. `yarn lint` /
  `yarn build` clean. _(Superseded same day: masking still **crops** the square source art — replaced
  by the oversized-square layer above.)_

- **HeroLights: killed the oval halo — the darkening mask is now engaged only while rotating.** At a
  strong opaque stop the ellipse mask read as an ugly oval vignette when the flares were **upright**
  (most of the scroll — hand/wave/tree), where no mask is needed anyway (the border only shows while
  rotating). Fix: the mask's opaque stop is now driven per-frame by `|sin(roll)|` via a `--rays-fade`
  CSS var — **`100%` (no fade → full darkening, no halo) when level**, dropping to ~82% mid-roll so
  the alpha still reaches 0 at the edges and no border sweeps in. Result: dark/moody everywhere, no
  oval, no border. Only `hero-lights.tsx`. `yarn lint` / `yarn build` clean. _(Superseded same day:
  at `100%` the ellipse is still a hard oval crop — see the rectangular-feather entry above.)_

- **HeroLights darkening restored (moodier).** The edge-fix's ellipse mask on the rays layer feathered
  the darkening from 58% of the radius, which lightened the frame and cut contrast. Pushed the mask's
  opaque stop `58% → 88%` (`radial-gradient(ellipse closest-side, #000 88%, transparent 100%)`) so the
  darkening stays strong across almost the whole frame and only feathers in the last sliver at the
  edge — mood/saturation back, still `0` at the edge so **no border returns** when the flares rotate
  (verified at rest and mid-roll). Only `hero-lights.tsx`. `yarn lint` / `yarn build` clean.

- **Second (hand-scene) UI overlay + per-scene cross-fade; header made persistent.** Added the
  hand section's UI from Figma (frame 742:290) as `HandOverlay` (top-left heading, bottom-left
  tagline + 3 stats with left-border accents, bottom-right heading — styles preserved, copy
  rewritten). Refactored the overlay stack: the nav bar is now a **persistent `SiteHeader`** (shared,
  pinned top, doesn't flicker), and each section's body (`HeroOverlay`, `HandOverlay`) is wrapped in
  a new **`ScrollFade`** client leaf that reads `window.scrollY` per-frame and cross-fades opacity so
  each shows only while its scene is on screen (hero fades out as the X bursts ~`[0.05, 0.14]`; hand
  fades in as the hand frames ~`[0.34, 0.41]`, out as the wave morph begins ~`[0.47, 0.53]`). Also
  **tags + CTA buttons forced to one line** (`whitespace-nowrap`; tag width `8.75 → 9.5rem` to fit),
  and a new `--overlay-strong` token (0.8 white) for the stat rules. `yarn lint` / `yarn build` clean.

- **Hero UI overlay (`HeroOverlay`) recreated from Figma over the particle scene.** New
  [`hero-overlay/`](../../src/components/common/hero-overlay/hero-overlay.tsx) — a glass UI laid over
  the scene on the home view (Figma frame "Ternyon" 767:162), styles/spacing preserved, copy
  rewritten (brand **Auralis**; hero **IMAGINE / MANIFEST**; nav, tags, tagline, CTAs invented).
  Three zones **anchor to the viewport** so they hold on resize: header pinned top, the two hero
  words at the exact vertical centre (one pinned to each edge), footer pinned bottom — all via
  `absolute` on a `fixed inset-0` layer, `pointer-events-none` except nav/buttons (the scene keeps
  its cursor interaction). Added the **Google Sans Flex** typeface (`src/app/fonts/`, 3 static
  instances) via `next/font/local` → `--font-google-sans` → `--font-display`; and an `overlay-*`
  colour/blur token palette in `globals.css` (sourced from the frame). `yarn lint` / `yarn build`
  clean. (Note: `@theme` token changes need a `.next` purge + dev restart to propagate — Turbopack
  caches the compiled CSS.)

- **Fixed the finale freeze (tree/wipe perf).** Scrolling to the tree hitched hard. Causes + fixes:
  (1) the tree ran `updateCloud` over **150k particles every frame** (a ~90 ms JS block) — but the
  tree is **static** (the wipe does the reveal), so it's now updated **once at load** and never per
  frame (finale render dropped to ~0.1 ms CPU); (2) the wipe **baked both views in one frame**
  (~74 ms) and **re-baked on every crossing** — now the bake is **split across two frames** and
  **cached for the session** (only re-baked on resize); (3) the tree's first render (shader compile +
  GPU matrix upload) was a ~90 ms hitch at the finale — now **pre-compiled + pre-baked to `rtTree`
  at load** (`renderer.compile` + one offscreen render), off the scroll path; (4) tree `density`
  `3 → 2` (150k → 100k) to lighten the one-time upload. Result: scrolling the whole wave→wipe→tree
  finale holds ~60 fps (max frame 94 ms → 27 ms, 2 slow frames of 221). Verified via real-loop frame
  deltas. `yarn lint` / `yarn build` clean.

- **HeroLights roll: ellipse mask kills the last edge (border was `light_1`'s own mid-edge alpha).**
  Even without the cover-scale, a border still showed when rotated: `light_1`'s alpha is `~39`
  (~15% darkening) at its **mid-edges**, a step to 0 at the layer border that sweeps across as a
  line under rotation. Added a **`radial-gradient(ellipse closest-side …)` mask** that forces the
  rays layer's alpha to `0` at all four edges/corners — nothing left at the border to step off, so
  **no edge at any roll angle**, and the ellipse keeps the darkening full-frame (mood preserved).
  Also fixed the glint's `transformOrigin` (was `63.6%`, should be `22.7%`) so it truly pivots about
  the screen centre. Verified at 0°, −52°, −77° on a wide viewport — clean. Only `hero-lights.tsx`.
  `yarn lint` / `yarn build` clean.

- **HeroLights roll: dropped the cover-scale — it *was* the visible border.** The rays layer was
  scaled up (`cover`) so its rectangle would keep covering the frame when rotated. But `light_1` is
  a **centred darkening blob that fades to transparent at its edges** (sampled: `alpha 255` centre →
  `~3` corners), so it never had an opaque rectangle edge to hide — and scaling it instead
  **enlarged the blob and made its own fade-ring show up as a moving arc** (the "border" that
  persisted). Removed the cover entirely; the layers now just rotate about the screen centre. No
  seam (edge-transparent), and the rays still turn with the camera. Only `hero-lights.tsx`; the
  rAF frame-lock stays. `yarn lint` / `yarn build` clean.

- **HeroLights roll: frame-locked to the camera + edge margin (no seam).** The flare roll was
  driven by `scroll` events, which lag the scene's per-frame rAF by a frame — at the lagged angle
  the scaled overlay's edge peeked out. Moved it to a **per-frame `requestAnimationFrame` loop**
  reading `window.scrollY` (the same cadence the scene reads it), so the flares turn frame-locked
  with the camera. Also padded the cover scale `|cos| + aspect·|sin|` → `|cos| + (aspect+0.2)·|sin|`
  (margin zero at roll 0) so no pixel-thin edge shows at the extreme angles. Only `hero-lights.tsx`.
  `yarn lint` / `yarn build` clean.

- **HeroLights flares now roll with the camera during the first transition.** They were a
  screen-locked overlay, so the bright light rays sat still while the 3D world flipped (the camera
  rolls a full turn). Now each flare layer is **rotated about the screen centre by the camera roll**,
  read from `window.scrollY` via the same `sceneConfig.sequence` formula the scene uses (set
  immediately so it tracks exactly). Two gotchas handled: (a) the rotation is on **each layer's own
  transform, not a wrapper** — a transformed wrapper isolates `mix-blend-mode` from the canvas and
  the hero goes black; (b) the full-frame darkening rays layer is scaled by `cover = |cosθ| +
  aspect·|sinθ|` (minimal, `1` at roll 0) so its rectangle keeps filling the frame when rotated,
  while the additive glint (transparent surround) rotates about screen-centre with no cover. Only
  `hero-lights.tsx` changed. `yarn lint` / `yarn build` clean.

- **Wipe: removed the bright seam + added parallax between the two layers.** The seam band was
  dropped — the wipe edge is now a **clean anti-aliased cut** (`WipePass`: `1 − smoothstep(uWipe±uAA,
  lineC)`, no glow). During the transition the two views drift vertically at **different rates** for
  depth: the wave slides **down** (`wipeWaveDrop`) while the tree **descends into place** (starts
  `wipeTreeDrop` higher, settles to rest by the wipe end so it matches the direct render — no jump).
  Done as per-layer UV offsets in the shader (`uWaveShift`/`uTreeShift`), driven by
  `sequence.wipeWaveDrop`/`wipeTreeDrop`; `wipeGlow` removed. `yarn lint` / `yarn build` clean.

- **Wave→tree transition reworked into a screen-space wipe (was a camera fly).** Per a reference:
  the tree scene should be revealed *over* the wave by a moving masked edge, with the camera
  **staying put on the wave**. New [`wipe-pass.ts`](../../src/components/common/scene/wipe-pass.ts)
  (`WipePass`) composites two pre-rendered HDR views by a screen-space mask — a **tilted line
  sweeping bottom-up** (`vUv.y + (vUv.x−0.5)·tilt < uWipe` → tree below, wave above), with a bright
  seam on the edge. Each frame during the transition, the frozen wave (from the held wave camera)
  and the fully-materialised tree (from a **separate static `treeCamera`**) are rendered to two
  `HalfFloatType` targets — **baked once** on entry since both are static, then only the mask moves
  — and the WipePass (added to the composer before bloom, so both sides + the seam still bloom)
  blends them. After the wipe the tree renders directly from `treeCamera`. The camera's fly-to-tree
  segment was removed (it now holds on the wave); the in-world bottom-up tree reveal + `tree.scanTilt`/
  `scanGlow` were dropped (the screen wipe does the reveal). New config: `sequence.wipeRange`/
  `wipeTilt`/`wipeGlow`; `treeArrive` removed. ~13 ms/frame at the full tree. `yarn lint` /
  `yarn build` clean.

- **New final section: a particle tree below the wave, revealed bottom-up through an angled mask.**
  Added `public/assets/tree/` (50k `bin_u16` points, same format as the hand) and
  [`tree-particles.ts`](../../src/components/common/scene/tree-particles.ts) (`createTreeParticles`,
  a hand-style loader with no wave destinations — the tree doesn't morph, it just materialises).
  It's the same studio environment as the X: its own podium (`podium3` at z −175), containment net,
  and ring light. **Sequence remap:** the whole X→hand→wave act is now driven by `seqP =
  progress / sequence.treeStart` (so every existing boundary/tuning is unchanged) and occupies real
  progress `[0, treeStart=0.72]`; `[treeStart, 1]` is the tree section — a third camera segment
  flies forward past the wave to frame the tree (`camera.treePos`/`treeTarget`), settling by
  `treeArrive=0.85`, then the tree **reveals bottom-up** (`treeArrive+0.01 → 0.99`). The reveal is
  the hand's scan mechanism plus a new `scanTilt` (a Y-slope per world-unit X) so the mask's top
  edge rides at a slight angle. `scrollVh` 860 → 1180 to give both acts room; the hand freezes
  (stops updating) once the tree section starts, and the tree is upsampled `density` 3 (→150k) with
  slightly bigger beads so the bushy volume reads solid. ~13 ms/frame at full reveal;
  `yarn lint` / `yarn build` clean.

- **Morph curves tightened to thin threads (killed the fluff).** They were still fluffy; now they're
  thin dense threads like the X→hand flight ribbons. `wave.vortex`: halo `radius` 4 → 2 (thin tube),
  `coreBias` 4 → 6 (even the radial tail stays close to the spine), `stagger` 0.34 → 0.26 (fewer
  mid-journey particles scattered into a cloud around the curves). ~4.5 ms/frame; wave still resolves.
  `yarn lint` / `yarn build` clean.

- **Sequence lengthened so the hand→wave morph plays over more scroll.** `sequence.scrollVh`
  640 → 860. The morph owns the last ~third of progress (`transformRange [0.66, 0.99]`), so it now
  spans ~284vh of scroll instead of ~211vh. Purely the scroll-length → progress mapping — every
  phase's per-progress visuals and the camera/hand-hold pacing are unchanged (verified: page scroll
  height ~7.4 → ~8.6 viewports, app loads clean). `yarn lint` / `yarn build` clean.

- **Whole hand→wave morph made more gradual.** Three levers: `wave.transformRange` widened
  `[0.68, 0.96] → [0.66, 0.99]` (plays over more scroll, settles later), the per-particle progress
  easing changed **smoothstep → smootherstep** (quintic — zero 1st & 2nd derivatives at both ends,
  so the peel-off and settle are gentler), and `vortex.stagger` `0.22 → 0.34` (particles peel off
  the hand / rejoin the wave over a longer span). `coreBias` bumped `3.6 → 4` to keep the curves
  dense despite the wider stagger. ~6 ms/frame; verified (`?debug=1`: gradual dissolve 0.72, curves
  0.82, clean wave 0.97); `yarn lint` / `yarn build` clean.

- **Morph curves tightened into dense ribbons.** They read as a dusty cloud; now they're dense
  concentrated curves like the X→hand flight ribbons. `wave.vortex` tuning: halo `radius` 9 → 4,
  `coreBias` 2.4 → 3.6 (packs particles hard onto each spine), `stagger` 0.32 → 0.22 (more
  particles sit on the curve at once). Perf actually improved (~4.8 ms/frame — tighter spread).
  Verified (`?debug=1`, wave still resolves at 0.93); `yarn lint` / `yarn build` clean.

- **Vortex → several meandering curves + seamless staggered morph.** The single meandering stream
  read like the X→hand flight curves and the user liked it — so it's now **several** of them
  (`vortex.strands`, bases spread symmetrically across X by `spread`, each with its own snake phase),
  and the hand→curves→wave morph was made **seamless**: each particle's journey is **staggered**
  (`vortex.stagger` → per-particle start delay `ph`, so its local eased progress `we` reaches 1 only
  at `wave` = 1), and the plateau was softened (`1.7 → 1.3`) so particles pass *through* the curves
  instead of freezing on them. Result: the hand peels off the fingertips gradually and the curves
  dissolve into the wave gradually, no snapping between states. `wave.vortex` gained `strands`,
  `spread`, `stagger`. (Note: `clamp01` isn't in `particle-cloud.ts` scope — inlined the clamp.)
  ~7.7 ms/frame; verified (`?debug=1`: hand peeling 0.70, curves 0.78, dissolving 0.88, wave 0.94);
  `yarn lint` / `yarn build` clean.

- **Vortex reshaped into a meandering bright stream (matched to a reference image).** The vortex
  was a symmetric swirling tube; the user supplied a reference of a **sinuous vertical stream** —
  a dense glowing spine snaking side-to-side (S-curve) up a diffuse dust halo. Reworked: the
  column's centreline now **meanders** (`sin(hY·meanderFreq·2π)` in X, a smaller phase-shifted
  wander in Z) symmetric about the hand's axis (so it still rises straight up overall), and the
  radial density is **core-biased** (`radius·rj^coreBias`) so most particles pack into a tight
  bright spine with a thinning halo, glow weighted to the centreline (`bloom ∝ 1−rj`). Dropped
  the discrete `strands`/`flare`; `wave.vortex` fields are now
  `strength`/`plateau`/`radius`/`height`/`meander`/`meanderFreq`/`coreBias`/`twist`/`spin`/`flash`.
  ~6.8 ms/frame at the peak (the per-particle `Math.pow` for the core bias; still well under
  budget). Verified (`?debug=1`: bright blobs bunching up the spine 0.73, snaking stream 0.78,
  wave 0.93); `yarn lint` / `yarn build` clean.

- **Hand→wave morph replaced with a strictly-vertical vortex (whirlwind).** The supernova blast
  drifted sideways/off-centre (rejected). Now the hand's particles are swept onto swirling spiral
  arms around a **vertical axis fixed at the hand's X/Z**, rising **strictly straight up** (only Y
  grows with height) so the column never wanders left/right, then settle into the wave. Arms wind
  up the column (`along·twist`), the whole thing rotates over time (`spin` → the visible swirl),
  the radius flares toward the top (`flare`), and per-particle radial jitter gives the arms
  thickness so it reads as a filled whirlwind, not stacked rings. `wave.nova` config replaced by
  `wave.vortex` (`strength`/`plateau`/`strands`/`radius`/`height`/`twist`/`spin`/`flare`/`flash`).
  Pure trig, no curl noise → ~5 ms/frame. Verified (`?debug=1`: column rising 0.73–0.78, wave
  0.93); `yarn lint` / `yarn build` clean.

- **Hand→wave morph replaced with an epic singularity-collapse → supernova.** Dropped the burst
  of thin curves entirely. Now the hand's particles rush **up and back to a single blinding point
  at the heart of the wave** (drain-swirling in like an accretion spiral, held on a plateau), the
  core **detonates** (a short outward pulse throws every particle *past* its wave cell), and they
  settle into the rippling grid. Same particles/colours — a real transform. Core is placed at
  `waveConfig.center` (high in frame, where the craned-up camera already looks) so the collapse is
  visible, not down at the low hand centroid. `wave.tornado` config replaced by `wave.nova`
  (`strength`/`plateau`/`coreLift`/`swirl`/`burst`/`flash`); `tornadoPeak` and the fingertip-trail
  constants removed from `particle-cloud.ts`. Pure trig, no curl noise → ~4.5 ms/frame. Verified
  (`?debug=1`: gather 0.72, singularity 0.76, detonation 0.84, wave 0.94); `yarn lint` / `yarn build`
  clean.

- **Hand→wave morph starts later — the hand holds framed for a beat first.** The crumble began
  almost the instant the camera arrived. Pushed `wave.transformRange` `[0.58, 0.96]` → `[0.68, 0.96]`
  so the intact hand sits framed inside its net for ~0.1 of scroll after the camera settles, then
  its particles fly off into the curves. End unchanged, so the wave still resolves by 0.96. Verified
  (`?debug=1`: intact hand at 0.66, curves bursting at 0.82, ~4.6 ms/frame).

- **Hand→wave morph reworked into a burst of curves flying off in different directions.** The
  tendrils still read as parallel vertical "sticks" — they rose along shared up-vectors, so the
  craning-up camera foreshortened them straight. Replaced the vertical-tendril attractor with a
  **radial burst**: each of a few trails launches from its fingertip base along its **own azimuth**
  (`az = strand·2π/strands + time·spin`), flying **outward with an accelerating reach**
  (`along²·reach` along `cos az`/`sin az`) while **rising steadily** (`along·rise`) — an arc, not a
  stick — with a small sideways `wobble`. Distinct azimuths make them scatter in different
  directions instead of stacking into rings. `tornado` config swapped `bendFreq`/`bendAmp`/`fanOut`/
  `height` → `reach`/`rise`/`wobble`; values `{ strength 1, strands 7, fingerSpread 8, reach 55,
  rise 42, wobble 5, spin 0.4 }`. Verified (`?debug=1`, ~4.7 ms/frame, resolves to the wave at
  `progress` 0.92); `yarn lint` / `yarn build` clean.

## 2026-07-24

- **Morph tendrils tuned to match the X→hand flight curves (thin, sparse, arcing).** They were
  reading as dense packed columns, not the thin sparse arcs the X makes. Now: fewer (`strands`
  4), **taller** (`height` 105 — spreads the particles thin/dotted along each curve instead of a
  short packed column), **full pull** (`strength` 1 → no residual wave-grid thickness), and each
  tendril **arcs over** in its own 2D direction (`cos ph`/`sin ph` × `bendAmp` × `along²` — a
  clear hook like the reference, not a subtle sway that foreshortens to a straight line under the
  craning-up camera). `bendAmp` 9→20, `fanOut` 24→18. Verified (`?debug=1`, ~5 ms); `yarn lint` /
  `yarn build` clean.

- **Morph: organic curving tendrils that fan out from the fingertips (killed the rings, killed
  the straight lines).** The "vertical vortex" still read as **straight lines** and still banded
  into **rings** — because the strands shared a **synchronised** rotation (any shared spiral
  stacks into horizontal rings) and, away from the peak, the residual wave-grid position blurred
  them. Reworked to match the reference sketch: each strand is now an **independent** snaking
  curve (its own sine sway in X/Z by per-strand phase — no shared rotation) that **fans out**
  from its fingertip base as it rises (`tornado.fanOut`) so the tendrils separate into distinct
  curves, with one gentle bend (`bendFreq`/`bendAmp`). The pull plateau widened to `×2.2` so the
  tendrils fully dominate (grid never shows through). Config: `radius`/`turns`/`wobble` →
  `bendFreq`/`bendAmp`/`fanOut`. Still pink → white into the wave, still ~5 ms/frame. Verified
  (`?debug=1`); `yarn lint` / `yarn build` clean.

- **Morph vortex: vertical thin curves from the fingertips (killed the rings).** The
  fingertip "tornado" still read as horizontal **rings** — because (a) high `turns` made each
  strand wrap around (horizontal), and (b) away from the exact peak the vortex only pulled
  ~70%, so the residual **wave-grid rows** showed through. Fixed: strands are now **mostly
  vertical** (`tornado.turns` 6 → 0.7) with bases **spread across the fingertip line**
  (`tornado.fingerSpread`) blending up into a narrow swirl (`tornado.radius`), tall
  (`height` 72 → vertical format); and the vortex pull is **plateaued near 1** across the middle
  of the transition (`min(1, sin(π·wave)·1.7)`) so the grid never shows through. Config fields
  `baseRadius`/`topRadius` → `fingerSpread`/`radius`. Verified (`?debug=1`, ~7ms); `yarn lint` /
  `yarn build` clean.

- **Second morph: fingertip tornado of thin curves + big perf fix (42ms → ~6ms/frame).**
  - **Perf:** the morph ran at ~42 ms/frame (24 fps, a visible freeze) because **both** clouds
    updated (32k glyph + 33k hand) and the hand ran **per-particle curl noise** (33k calls).
    Fixed: (a) the glyph is `visible = false` and its `updateCloud` **skipped** once it's fully
    dispersed (`progress > 0.54`); the hand is skipped before it scans in (`progress < 0.4`);
    (b) the hand's `castShadow`/`receiveShadow` turn **off** during the wave morph (33k spreading
    particles don't need self-shadow); (c) the new tornado is **pure trig — no curl noise**. Now
    ~6 ms/frame.
  - **Look:** replaced the pink hand→wave *arcs* with a **tornado of a few thin spiralling
    curves rising from the fingertips** (`tTipY = cloud.maxY`): `tornado.strands` (6) helices,
    narrow at the tips (`baseRadius`) widening up (`topRadius`) over `height`, `turns` spiral
    turns, a light sine `wobble` (no curl). Still pink mid-morph, settling white into the wave.
    Rewrote the `wave.tornado` config (baseRadius/topRadius/wobble; dropped
    radius/top/taper/densityTaper/curlFreq/turbulence/offset). Verified (`?debug=1`); `yarn lint`
    / `yarn build` clean.

- **Hand→wave morph goes through pink curves (not a tornado); hand matches the X count/size.**
  - The tornado funnel (which read as **rings** from the hand) is replaced by **a few pink
    twisting curves** — reusing the `wave.tornado` config fields: `strands` (8) curves arc from
    the hand up toward the wave with a lens-profile snake bulge (0 at both ends → curves, not
    rings) + curl wisp, peaking mid-transition. They **glow pink** mid-morph (the wave branch
    sets `bloom = tornadoPeak·1.4` → the scatter `sTint` path) and only lerp to **white in the
    second half** of the transform, so the curves read pink then settle white into the wave.
    Removed the now-unused funnel consts (`tTop`/`tHeight`/`tTaper`/`tDensity`/`tAxis*`).
  - **Hand = X count & size**: `hand.density` 2→**8** (4173 → ~33k ≈ glyph 32000),
    `hand.particleSize` 0.15→**0.1** (= glyph). Wave grid resized to cover it
    (`columns/rows/spacing` 140/62/0.63 → **275/122/0.5**); upsample jitter widened for the
    higher density. Verified (`?debug=1`); `yarn lint` / `yarn build` clean.

- **Smoothed exit curves (no sharp corners); camera start pulled back to hand distance.**
  - The exit curves had cusps: a hard floor clamp (`fy = max(fy,1)`) made a sharp V where a
    curve hit the ground; the vertical lift used `sin(u·π)` which dipped back to corridor height
    (a downward V); the corridor→sweep join turned ~90° instantly; and the −X ribbons swept
    ~270° into a spiral. Fixed: the sweep heading turns a **symmetric ±90° from −Z** (the
    corridor's own heading, via smoothstep → tangent-matched at the join, no kink), the lift is
    **monotonic**, and the floor is a **soft (softplus) bound** instead of a hard clamp.
  - `sequence.camera.startPos` z 40 → **50** so the glyph podium is viewed from the same ~50-unit
    distance as the hand podium in the end framing.
  - Verified (`?debug=1`); `yarn lint` / `yarn build` clean.

- **Hand: denser, rotated, scan-in reveal; curves disperse earlier.**
  - **Curves earlier** — flight exit window `0.3→0.56` ⇒ `0.24→0.5`; assemble `0.03→0.2`.
  - **Denser hand** — `hand.density` (2) upsamples the loaded 4173-point cloud (each point
    spawns `density` jittered copies) → ~8346 particles. The wave grid was resized to cover it
    (`columns/rows/spacing` 96/44/0.92 → 140/62/0.63, same extent, denser).
  - **Rotated** — `hand.rotation` −15° (clockwise about Y), applied to the loaded points.
  - **Scan-in reveal** — the hand materialises **bottom-up like a movie body-scan**: a rising
    line (`scan` 0→1 over progress 0.42→0.57, before the wave) reveals particles below it
    (`revealScale`) with a **bright white bloom band** trailing the line (`hand.scanGlow`, fed
    through `aGlow` so the bloom pass catches it). New `scan`/`scanGlow` params on `CloudUpdate`
    + `cloud.minY`/`maxY` (rest Y bounds) drive it. Verified (`?debug=1`); `yarn lint` /
    `yarn build` clean.

- **Just a couple of flight curves.** `flight.ribbons` 11→3 — the cloud now reassembles into
  a few distinct dense curves instead of surrounding the frame. `yarn lint` / `yarn build` clean.

- **Exit is now a tip-driven stream (far end leads, body follows its path).** The previous
  exit was still a shear — the far end stayed and the near half swung out, so the pivot read
  as the middle. Rebuilt as a **stream**: the ribbon's **far tip** (param 1, out by the hand —
  the end actually in frame; the near end is behind the camera by exit time) is pulled out
  first, and every particle shifts its along-ribbon param toward the tip (`pShift = t + hp`,
  `hp = exit·flight.exitSpan`). While `pShift ≤ 1` a particle slides along the corridor toward
  the tip; once `pShift > 1` it's on the tip's exit arc — so the **whole ribbon flows to where
  the tip went**, tip leading, no middle pivot. Replaced `flight.exitLag` with
  `flight.exitSpan` (how far the tip is pulled, 1.2). `exitDistance` 90→60. Verified
  (`?debug=1`); `yarn lint` / `yarn build` clean.

- **Exit fade made global so the head visibly leads.** The exit motion was follow-the-leader,
  but the **per-particle fade** made the head (start of the curve) vanish as soon as it
  finished its own sweep — so the visible leading edge looked like the middle. Changed the
  exit fade to **global** (all particles stay full through the sweep, then fade together over
  the last ~28% of the exit, by which point ribbons are mostly off-frame). Exit window widened
  to `0.3→0.56` to give the sweep room. Now the head clearly initiates and leads the motion.
  Verified (`?debug=1`); `yarn lint` / `yarn build` clean.

- **Exit starts earlier; thinner tubes; hard floor clamp.** Exit window moved earlier
  (`0.4→0.56` ⇒ `0.3→0.52`) so the curves are already dispersing while the camera is still
  approaching the hand, not only at arrive. Tube radius `flight.thickness` 0.4→0.2 (half).
  Corridor `flight.vScale` 0.7→0.5 and a hard **floor clamp** (`fy = max(fy, 1)` in the flight
  branch) so the far/wide ribbons never sink through the ground. Verified (`?debug=1`);
  `yarn lint` / `yarn build` clean.

- **Exit is now true follow-the-leader (head sweeps out, body traces its path).** The lateral
  part still read as the whole ribbon sliding sideways as a block. Reworked: each ribbon's
  **head** (near end) sweeps out to the ribbon's side along a **curving arc**
  (`flight.exitCurve` + `exitLift` vertical rise-and-settle), and each particle down the line
  lags **strongly** (`flight.exitLag` now in ribbon-lengths, 1.6) and moves along the *same*
  arc — so the body streams **along the path the head traced**, not a block shift. `side`/
  handedness are per-**ribbon** (from `phase`), fixing a per-particle-`side` bug that tore
  ribbons. Replaced the `exitSnake`/`exitWaves` knobs with `exitCurve`/`exitLift`. Verified
  (`?debug=1`); `yarn lint` / `yarn build` clean.

- **Thread-thin curves; exit parts smoothly to the left/right sides.** `flight.thickness`
  0.7→0.4. (Superseded by the follow-the-leader exit above.)

- **Tubes thinner again.** `flight.thickness` 1.4→0.7 — fine thread-like curves.

- **Thinner tubes; exit disperses each ribbon its own way ("snakes in water").** Tube radius
  `flight.thickness` 2.5→1.4. The exit no longer pushes everything up-and-right: each ribbon
  now swims off along its **own 3D heading** — a unique azimuth (full circle) + up-biased
  elevation per ribbon (from a second per-ribbon hash), so they scatter to all sides of the
  frame yet never straight down (no floor sink) — with a lateral **snake undulation**
  (`flight.exitSnake`/`exitWaves`) so each curve wriggles like a snake dispersing in water.
  Still head-leads-tail (`flight.exitLag`) and per-particle staggered fade. Replaced the
  `exitRise`/`exitCurve` knobs with `exitSnake`/`exitWaves`. Verified (`?debug=1`); `yarn lint`
  / `yarn build` clean.

- **Flight ribbons are now round tubes; exit rises up-and-out (no floor sink), gradual.** The
  ribbons read as flat sheets because the "thickness" offset was derived from
  `stagger`/`radial` (correlated with position → planar) and only in world-XY. Now each
  particle carries a fixed random point on the **unit disc** (`cloud.tubeOffset`, own RNG),
  applied on the plane **perpendicular to the corridor** (radial/tangential basis) × the tube
  radius → a solid **round tube**. The corridor cross-section is lifted (`flight.axisY` 10→14)
  and vertically squashed (`flight.vScale` 0.7) so ribbons don't dip below the floor. The
  **exit** was reworked: heads now **rise** (`flight.exitRise`) and spread outward in the
  horizontal plane along a curving path — never downward, so nothing sinks through the ground —
  staggered per ribbon and with a **per-particle fade** (each fades as it finishes its own
  whip), so it's smooth instead of an abrupt synchronized vanish. Verified across the flight
  (`?debug=1`, ~217fps); `yarn lint` / `yarn build` clean.

- **X reassembles directly into the flight curves; whip exit moved before the camera lifts.**
  Dropped the intermediate corkscrew-ribbon state — the glyph now blends **straight from its X
  rest positions into the world-space corridor streamers** (flight branch, assemble over
  progress 0.03→0.22), so there's no separate "twisting ribbons near the glyph" beat. Removed
  the now-dead `buildStrandDestinations` (+ its `RIBBONS`/`RIBBON_*` constants) and stopped
  passing `scatterDest`/`flowOverride` from `glyph-particles.ts`; the scatter branch splits
  into a flight path and a legacy curl path. The **whip exit** window moved earlier
  (0.42→0.55) so it plays out **in front of the hand while the camera faces it head-on**,
  finishing before the camera pitches up off the hand (arrive 0.56) — it no longer spills into
  the upward turn. Verified across the flight (`?debug=1`); `yarn lint` / `yarn build` clean.

- **Flight streamers: fatter bands, wider spread, and a whip exit.** Follow-up on the corridor
  streamers: they were too thin (hairlines), bunched into the centre, and left little stubs;
  the exit still read as a shift. Now — fewer but **fatter ribbons** (`flight.ribbons` 11,
  `flight.thickness` scatters each into a solid band around its centreline), a **wider radius**
  + far-widening (`flight.radius` 14, `flight.spread` counters perspective) so they stay out at
  the **sides** with the centre clear, and the exit is reworked into a **whip**: each ribbon's
  head flies out along a per-ribbon **curving** trajectory (`flight.exitCurve`, `exitDistance`)
  and the rest of the line **lags** behind it (`flight.exitLag`), following the path the head
  traced — heads curve off in different directions dragging their tails, then fade. Exit window
  widened to 0.5→0.7. Verified across the flight (`?debug=1`); `yarn lint` / `yarn build` clean.

- **X ribbons bridge the gap as world-space corridor streamers (the camera flies through
  them).** Iterated: a camera-relative *ring* of streamers read as mechanical — it lagged (the
  eased chase of a fast-moving lens-locked target), the camera's roll spun the whole ring
  ("rotating in a circle"), and the exit was a uniform radius push ("a dumb shift"). Replaced
  with **world-space streamers strung along the flight corridor** (`scatter.flight`: `ribbons`
  12, `radius`, `bend`/`bendWaves`/`turn`/`speed`, `axisY`, `zStart`→`zEnd`): the camera flies
  *through* them, so they sweep past with real **parallax** (no lag). Each ribbon is an
  **asymmetric** snaking curve (per-ribbon varied radius/phase + a helical `turn`), so the
  roll no longer reads as a clean rotating circle. During flight the ease is raised so they
  track without trailing. `exit` now **dissolves** them (fade + shrink), not a shift. Morph
  (`flight`, progress 0.16→0.25) completes before the camera passes the corridor start so it
  never blends a ribbon through the lens. `cameraFrame` param dropped (no longer needed).
  Verified across the flight (`?debug=1`); `yarn lint` / `yarn build` clean.

- **All beads halved.** `particleSize` glyph `0.2 → 0.1`, hand `0.3 → 0.15` — a finer, more
  granular cloud. The hero beads shrink with it (their `bigScale` 2× is relative). `yarn lint`
  / `yarn build` clean.

- **More beads + oversized white-bloom "hero" beads; selective bloom back on.** Denser cloud
  (glyph `count` 20000 → **32000**). A random **`bigFraction`** (~4%) of beads are rendered
  **`bigScale`× (2×)** and carry a saturated white emissive glow (`idle.bigGlow` 0 → **5**,
  routed through the `aGlow` → `totalEmissiveRadiance` patch); they set `bloomMask = 1`, so the
  glow is chosen per-bead now, not by size ranking. The custom **`BloomPass` is re-added** to
  the composer (`RenderPass → BloomPass → Vignette → OutputPass`) with a threshold (**3.5**)
  that sits *above* the lit-white cloud (~2.6 on the HDR HalfFloat composer buffer) but below
  those glowing beads, so **only** the hero beads (and the scatter/cursor emissive) bloom — no
  scene-wide haze. `bigFraction`/`bigScale` added to `GlyphConfig`/`HandConfig` + `CloudOptions`.
  Verified across X / scatter / wave (`?debug=1`); `yarn lint` / `yarn build` clean.

- **Transparency experiments dropped (back to opaque beads).** Over this session the particles
  were tried semi-transparent (`opacity 0.6`), then with feathered edges, then hollow glass
  centres — none read well, so all were reverted: `opacity` removed from `MaterialFinish`, the
  material is opaque again, and `patchParticleShader` keeps only the glow injection. (Kept the
  rename `patchEmissive` → `patchParticleShader`.)

- **Volume now comes from real self-shadowing, not baked albedo.** The prior passes still
  produced the form's depth by *painting* one side of the cloud darker in `instanceColor` —
  recolouring, not lighting ("объем чисто засчет перекраски… а нужно засчет освещения"). Now
  the particle `InstancedMesh` **casts + receives real shadows** (`castShadow` /
  `receiveShadow` on — reversing the original "spheres speckle" choice), so front/top
  particles shadow the ones behind/below/inside the crossing → they go dark because light
  doesn't reach them. The baked directional shade is dialled back to a faint base
  (`shade {floor 0.82, dir 0.18}`, nearly flat), the key `DirectionalLight` strengthened
  (`1.3 → 2.6`), and its shadow map sharpened for the tiny spheres (**4096²**, tight ±14
  frustum, `bias −0.0003` + `normalBias 0.08` against acne). The **podium meshes are set
  `receiveShadow = false`** (`podium.ts`) so the volume lives on the X only — its `castShadow`
  self-shadows the cloud but drops no shadow on the floor. Cost is negligible (~4 ms/frame
  incl. the shadow pass). Amends ADR-0022 → **ADR-0023**. Verified across X / scatter / wave
  (`?debug=1`); `yarn lint` / `yarn build` clean.

- **Realistic soft shadows on the X (was an "anime/cel shader").** ADR-0021's unlit +
  discrete-box-face-normal bake read flat and hard-edged. Now the X shades from **two**
  sources: (1) the material is **lit again** (`MeshBasicMaterial` → `MeshStandardMaterial`,
  chalk-matte) so the key light gives every sphere a soft diffuse gradient; (2) a **smooth**
  baked form shade in `instanceColor` carries the form-level light/shadow. Two changes make
  it soft, not cel: the glyph's form normal is now a **smooth rounded-box normal** (the three
  box faces blended by `frac^SHARP`, `SHARP = 3`, then normalised — no snap to one face), and
  the bake uses a **half-Lambert wrap** `floor + dir·(0.5 + 0.5·n·L)` (no hard terminator).
  The `aGlow` scatter/cursor glow moved back to **pure emissive** (`totalEmissiveRadiance +=
  vGlow` after `<emissivemap_fragment>`). Supersedes ADR-0021 → **ADR-0022**.
  - _Follow-up (same day) — deepened for volume._ The first pass read too flat/washed
    ("объём слабо чувствуется"): the soft wrap + a strong per-ball key lifted the whole
    shadow side. The wrap gained a **`^1.7` gamma** (deeper mid/shadow falloff, terminator
    still soft), shade went to `floor 0.2` / `dir 0.76`, and the key light dropped `1.6 → 1.3`
    so the baked form shade — not the per-ball key — dominates the read. Verified across the
    X / scatter / wave phases (`?debug=1`); `yarn lint` / `yarn build` clean.

## 2026-07-23

- **X volume: light the whole form, not each sphere.** The per-sphere real lighting looked
  chaotic (every ball an identical highlight). Switched back to a **baked directional
  shade** — but lit against each particle's **form surface normal** (glyph computes
  box-face normals; hand uses `normalize(point)`), so the X's front faces read bright and
  the sides/back fall into shadow (like the reference). Particles are now rendered **unlit**
  (`MeshStandardMaterial` → `MeshBasicMaterial`); the `aGlow` patch adds the scatter/cursor
  glow on top of the baked shade (`diffuseColor.rgb += vGlow` after `color_fragment`).
  `CloudOptions` regained `lightDirection`/`shade`/`normals` (dropped `albedo`);
  `glyph.lightDirection` aimed front-top-left; shade `floor 0.34` / `dir 0.66`. Amends
  ADR-0020 → **ADR-0021**. `yarn lint` / `yarn build` clean.
- **Bloom removed entirely; dust dispersion removed.** Even a tightly-thresholded bloom
  still read as an unwanted scene-wide haze, so the `BloomPass` was **taken out of the
  composer** (chain is back to `RenderPass → Vignette → OutputPass`). `bloom-pass.ts` +
  `sceneConfig.bloom` kept dormant for easy re-enable (ADR-0019 still records that it works
  where UnrealBloomPass doesn't). Dust `dispersion` set to **0** — the motes are plain round
  soft dots again (the shader/knob stay). `yarn lint` / `yarn build` clean.
- **Overall scene bloom removed; dust gains a chromatic-dispersion fringe.** The general
  bloom haze (the soft glow around the whole X + scene) came from the bloom pass catching
  lit-particle highlights in the 0.88–1.0 band; raised `bloom.threshold` 0.88 → **0.94** and
  tightened the bright-pass knee 0.12 → **0.05**, so only near-white emissive pixels bloom
  — i.e. only the **scattering** particles (scroll scatter + cursor glow), not the lit
  cloud/podium/backdrop. Dust reworked from `PointsMaterial` to a **custom point shader**
  that draws each mote as a round dot with a **chromatic-dispersion** fringe (R/B channels
  split like a prism) + linear fog; new `dust.dispersion` config and a `resize()` on the
  `Dust` API (point-size attenuation). `yarn lint` / `yarn build` clean.
- **Resting particles no longer bloom; dust drift bug fixed.** `idle.bigGlow` → **0**, so
  resting particles don't bloom — only the **scattering** ones (scroll scatter + cursor
  repulsion) do. Fixed the **dust** disappearing: its per-frame update wrote `live = live +
  sway` into the *same* array it read from, so the motes accumulated and flew off to
  infinity within ~1 s; now `dust.ts` keeps a separate static `home` base and writes the
  live buffer from it. Dust size/opacity retuned so the round floating motes read clearly.
  `yarn lint` / `yarn build` clean.
- **Particles reworked: smooth balls, lit volume, selective bloom, super-slow drift.**
  Five-part polish. **(1)** Sphere geometry `6×4` → **`16×12`** so particles read as round
  balls, not faceted chips. **(2)** Volume now comes from **real lighting** of the smooth
  spheres, not baked shading — `CloudOptions.shade`/`lightDirection` removed, replaced by a
  flat `albedo` (0.6); fill lights lowered (`HemisphereLight 0.22→0.14`, key `3.4→2.1`) so
  the directional key carries the form (amends ADR-0016 → ADR-0020). **(3)** Bloom is now
  **selective** — the flat-albedo lit particles sit under the threshold; only the emissive
  **big** particles (`cloud.bloomMask`, top ~10% by size, `idle.bigGlow`) and the
  **cursor-scattered** ones bloom. The old blur-the-whole-cloud look is gone. **(4)** Idle
  "bloom points" (random 2%) replaced by the big-particle glow; `IdleConfig` fields
  swapped. **(5)** Idle shimmer + dust drift slowed **way** down (`idle.speed 0.8→0.16`,
  dust rise/sway ~4× slower) for a super-smooth float. Pointer glow lowered (blooms now).
  `yarn lint` / `yarn build` clean; ~60 fps.
- **Particle bloom (custom pass), moving round dust, glint reposition.** Three hero polish
  changes: **(1)** New `bloom-pass.ts` (`BloomPass`) — a **custom additive bloom**
  (threshold → half-res separable-Gaussian blur → add back) added to the composer, since
  `UnrealBloomPass` renders black here (ADR-0015 → amended by ADR-0019). The white particles
  now bloom strongly and softly (`sceneConfig.bloom`), giving the X real volume. **(2)**
  Dust is now **round** (soft radial sprite instead of square `Points`) and **drifts** (float
  up + sway, updated per-frame) — `createDust` returns `{ points, update }`. **(3)** The
  bottom-left `light_2` glint was pushed further off-corner + its feather tightened so its
  border no longer shows under the cursor parallax. `yarn lint` / `yarn build` clean.
- **Hero light flares added (`HeroLights`).** Two blended light-flare overlays on the hero
  (over the particle scene): `light_1` full-frame `mix-blend-mode: overlay` (darkens the
  studio + adds the diagonal ray streak) and `light_2` a bottom-left `plus-lighter` glint
  (feathered with a radial mask). They **parallax the cursor in opposite phase** via
  `useSpring` (no `springs/` component fits a cursor trigger) + a `pointermove` listener;
  `pointer-events-none`, fine-pointer only. New `src/components/common/hero-lights/`, assets
  in `public/assets/lights/`, mounted in `HomeView`. `yarn lint` / `yarn build` clean.
- **Camera final is now a pure upward pitch; the wave's diagonal comes from the plane.**
  The camera no longer yaws right in the final segment (it felt like it "flew up and
  right") — `x` stays 0 from arrive to final, a clean upward rotation. The bottom-left
  diagonal composition is preserved by giving the **wave plane its own yaw** (`wave.yaw`,
  swings the right side into the fog) on top of its tilt, so it recedes diagonally without
  any camera yaw. The tornado axis offset was reverted to 0 (funnel centred again).
  `buildWaveDestinations` applies the yaw; the edge-fade math inverts tilt+yaw to recover
  grid-local coords. `yarn lint` / `yarn build` clean; screenshot-verified.
- **Wave restyled: white, angled into the lower-left, borderless.** The final wave now
  sits in the **lower-left** at an **oblique tilt** (`wave.tilt` — the grid recedes in
  depth so its far edge sinks into fog), its particles **fade out toward all borders**
  (`wave.edgeFade`, scale → 0 in the outer fraction, so no hard edge shows), and the albedo
  lerps to **pure white** through the transform (`troughShade` 0, sphere lighting carries
  the form). Camera final segment now **yaws right** as well as up so the wave lands in the
  bottom-left corner; the tornado axis gained an `offsetX/offsetZ` so it stays framed
  despite the yaw. Grid widened/spaced out (`sizeBoost` 1→1.4 to compensate). `yarn lint` /
  `yarn build` clean; screenshot-verified.
- **Tornado reworked — density taper + curl turbulence for wispy filaments.** The first
  tornado (clean geometric cone of ~4173 dots) read as sparse and random. Added: a
  **density taper** (`tornado.densityTaper`, packs particles into the flaring base skirt),
  **curl-noise turbulence** (`tornado.curlFreq`/`turbulence`, coherent so strands wisp into
  organic filaments, stronger up the thin rope), more strands (26→46), and a tighter,
  gentler-twisting funnel. Now reads as a spiralling twisting vortex. `yarn lint` /
  `yarn build` clean; screenshot-verified.
- **Morph now routes through a tornado; wave is a clean grid of small dots.** The
  transition's in-place vortex swirl became a **tornado funnel**: particles are grouped
  into `tornado.strands` spiral strands (flaring base → pinched twisting top) and pulled
  onto the funnel by `sin(π·wave)` at mid-transition, then unwind onto the wave. The wave
  destinations are now a **clean grid** (`buildWaveDestinations`: one particle per cell,
  no jitter) and the particles are **small** (`sizeBoost` 1, was 2.4) — the reference is a
  fine grid, not chunky spheres. Idle bloom points fade out through the transform so the
  grid has no stray highlights. `WaveConfig.vortexTurns`/`vortexLift` → a `tornado` block.
  `yarn lint` / `yarn build` clean; screenshots verified (tornado funnel + grid wave).
- **Hand → wave is now a real vortex transform of the hand's own particles.** The
  previous "seed a ~40k wave field from the hand and scale it up" read as *new*,
  differently-shaded particles appearing (and looked like uniform grey mush), so it was
  scrapped: `wave-field.ts` is **deleted**. Instead the hand's own ~4173 particles
  transform — `buildWaveDestinations` (`hand-particles.ts`) gives each a wave-curtain
  cell as its `scatterDest`, and a new **wave branch in `updateCloud`** swirls each
  particle from its rest, through a **vortex** (differential Y-rotation peaking mid-transition
  via `sin(π·wave)`) with an upward billow, onto its rippling curtain cell (depth ripple,
  size boost, trough shading). Same particles, same colours, genuine crumble. New
  `sceneConfig.wave` (`WaveConfig`); `WaveFieldConfig`/`waveField` and the `updateCloud`
  `visibility` fade + `sequence.handFadeRange` removed; `patchEmissive` un-exported.
  Because only 4173 particles must fill the curtain, it's kept compact (tight grid + size
  boost). `yarn lint` / `yarn build` clean; ~4.6 ms/frame.
- **Wave curtain now morphs out of the hand's own particles.** Instead of the hand
  fading while a separate wave field fades in, the wave field is **seeded from the hand**:
  `createWaveField` takes an `originPoints` arg (the hand cloud's `basePositions`) and is
  built in the hand's load `.then`; each of its ~40k particles starts at a jittered hand
  point, so at `reveal` 0 the field is clustered in the hand shape, then `update` scales it
  up, lets the shape dwell, and lerps every particle out to its curtain cell — the hand
  streams apart into the wave. The hand cloud fades over the same window
  (`handFadeRange` retuned to overlap; `revealRange` widened). Wave build moved async
  (guard `if (wave)`); the field is gone if the hand asset is missing. `yarn lint` /
  `yarn build` clean; ~4.8 ms/frame.
- **Wave field turned into a vertical curtain; camera cranes up; wave is white.**
  Follow-up on the wave field. The camera now genuinely **cranes up** in the final
  segment (look-at swings from world y 8 to y 60, ~45° up) instead of flying in flat —
  so the wave field was rotated 90° to a **vertical curtain** (grid across X and up Y,
  rippling in Z at z −140) that the up-craned camera looks into. Colour changed to
  **white** (matching the glyph): to keep it readable on the light backdrop it bakes a
  glyph-style dark-floor shade *and* recolours per frame so wave crests brighten and
  troughs darken (`instanceColor`), and density was raised to ~40k particles. `freqZ`→
  `freqY`; `waveField` retuned (`columns`/`rows`/`spacing`/`center`/`amplitude`, white
  `color`/`glowColor`). `yarn lint` / `yarn build` clean; ~4.6 ms/frame.
- **Hand morph removed; final phase is now a particle wave field.** The whole
  morph feature is gone (`MorphConfig`, `SheetConfig`, `buildPerforatedSheetDestinations`,
  the `updateCloud` morph branch). Instead: the hand rises, holds, then **fades out**
  (new `updateCloud` `visibility` fade over `sequence.handFadeRange`) while a new
  **wave field** forms — `wave-field.ts` (`createWaveField`): a large `columns × rows`
  grid of instanced spheres displaced by two crossing travelling sine waves, receding to
  a horizon, with sparse emissive **bokeh** points; `wave.update(time, reveal)` runs it
  and scales it up from nothing over `waveField.revealRange`. `patchEmissive` is now
  exported from `particle-cloud.ts` for it to share. The camera's final segment **lifts
  and pitches up** off the hand to look out over the field (retuned `finalPos`/
  `finalTarget`). Palette keeps the **light** studio, so the field is **muted indigo**
  particles (they'd vanish if white) with lavender bokeh — new note: contrast on the
  light scene comes from going darker, not brighter. New `sceneConfig.waveField`;
  `sceneConfig.morph`/`sheet` removed. `yarn lint` / `yarn build` clean; ~200 fps.
- **Final figure changed to a perforated sheet; camera tilts ~90° up; morph no longer
  blanket-blooms.** The final form is now a **wavy perforated membrane** — a horizontal
  sheet with a lattice of organic holes (`buildPerforatedSheetDestinations` in
  `hand-particles.ts`: particles rejection-sampled onto the strut network of a warped
  hexagonal trig field), still the hand's own particles morphing onto `scatterDest`.
  `RibbonConfig`→`SheetConfig`, `sceneConfig.ribbon`→`sceneConfig.sheet`. The camera's
  final segment now **pitches ~90° up** into the overhead sheet (`finalPos`/`finalTarget`
  retuned). `morph.glow` set to **0** so the particles keep their baked shading instead of
  all whitening/blooming — only the sparse `nodeGlow` nodes + idle bloom points glow.
  Two rendering fixes this surfaced: **(a)** `updateCamera` rebuilds a stable up-vector
  when looking near-vertical (world-up ∥ view axis was a `lookAt` gimbal singularity that
  blanked the frame); **(b)** `buildParticleCloud` sets `mesh.frustumCulled = false` —
  an `InstancedMesh` is culled by its origin-centred geometry sphere, not its displaced
  instances, so the moved-overhead cloud was being wrongly dropped. Debug `window.__scene`
  gained `inspect()` (live particle bounds + camera pose). `yarn lint` / `yarn build`
  clean; 60 fps.
- **Final figure changed to a folded ribbon loop; idle life + bloom points added.**
  Three changes. **(1)** The final form is no longer a DNA helix — it's a **Möbius-like
  folded ribbon loop** (`buildRibbonLoopDestinations` in `hand-particles.ts`: a band
  swept once around a loop while it twists, with radial pleats), still the hand's own
  particles morphing onto `scatterDest`. `HelixConfig`→`RibbonConfig`, `sceneConfig.helix`
  →`sceneConfig.ribbon`. Because a camera-facing loop can't use continuous Y-rotation
  (it would spin edge-on to a line), `morph.drift` was replaced by a **bounded yaw sway**
  (`morph.sway`/`swaySpeed`). Camera `finalPos`/`finalTarget` retuned to frame the loop.
  **(2)** Sparse always-on **white bloom particles** in every figure — ~2% of particles
  (`sceneConfig.idle.bloomFraction`, index-hashed subset) get a twinkling white emissive
  glow + slight size bump. **(3)** A subtle **per-particle idle shimmer** on every figure
  at rest (`idle.amplitude`, eased with an `idle.relax` floor) so nothing is ever frozen
  without the cursor. New `sceneConfig.idle`; `updateCloud` gained an `idle` param passed
  to both clouds. `yarn lint` / `yarn build` clean; 60 fps.
- **Final helix reverted to particles (was glossy tubes).** The tube figure
  (`helix-figure.ts`) was removed — the brief was that the final form must be made
  of **particles** that **morph from the hand**, not separate geometry. Restored the
  particle morph: `hand-particles.ts` builds per-particle DNA double-helix
  destinations (`buildHelixDestinations`, two π-offset strands + rungs) as the
  cloud's `scatterDest`, and the `updateCloud` **morph branch** eases the hand's own
  particles onto them (no dissolve — it holds the helix), rotating slowly about Y
  with a white glow + sparse bright nodes. `sceneConfig.morph` back to
  `{ color, glow, nodeGlow, drift }`; `sceneConfig.helix` repurposed to the particle
  helix params (`turns`/`height`/`radius`/`bottom`/`rungFraction`/`jitter`).
  `helix-figure.ts` deleted and its wiring removed from `particle-scene.tsx`. Camera
  `finalPos` `[0,12,-80]` / `finalTarget` `[0,24,-110]`. `yarn lint` / `yarn build`
  clean; 60 fps. Supersedes the "glossy tubes" entry below.

## 2026-07-20

- **Scene became a scroll-driven sequence.** The home scene is now one
  continuous scroll shot: the camera flies forward and **rolls a full 360°**
  (floor → ceiling → upright) while the glyph bursts into glowing purple
  **strands** and the containment net collapses, and a **second podium with a
  particle hand** emerges from the fog ahead. Fully reversible (scrubbed by
  scroll). `OrbitControls` removed — the camera is entirely scroll-controlled
  (no drag, no zoom). New modules: `curl-noise.ts` (divergence-free flow for
  strands), `particle-cloud.ts` (shared builder + `updateCloud`, extracted from
  the glyph so the hand reuses it), `hand-particles.ts` (procedural hand from an
  SDF — palm slab + curled finger capsules — sampled in the glyph's style).
  `sceneConfig` gained `hand`, `podium2`, `scatter`, `sequence`; `camera` reduced
  to `{ fov }`. `HomeView` pins the canvas (`fixed`) over a `sequence.scrollVh`
  spacer; the starter's `body` rule (forced `100vh` + flex-centering, which can't
  scroll) was neutralised to a plain scrolling block. Debug `window.__scene`
  gained `progress(p)` to scrub the sequence; `autoRotate` dropped. Cursor
  repulsion stays as an idle effect, gated off once the scatter begins. See
  [[decisions-log]] ADR-0017. `yarn lint` and `yarn build` clean; ~60 fps.
- **Glyph turned about Y; scatter reworked into twisting ribbons.** `glyph.rotation`
  now turns the "X" about the **vertical Y axis** (a 3D turn) instead of in-plane.
  The scatter was rebuilt: a dense volume scattered by a flow field always reads
  as a cloud, so particles now **morph onto ~16 precomputed corkscrew ribbons**
  (`buildStrandDestinations` in `glyph-particles.ts` → `cloud.scatterTarget`), and
  the "X" resolves into distinct thin twisting ribbons with negative space between
  them. Shape and fade were **decoupled** (`updateCloud`) so the ribbons form and
  hold before dissolving. (Interim four-arm streams from the prior round were
  replaced.) `LocalPoint.fx/fy/fz` and the travel-proportional Y-twist remain for
  the curl path (the hand). `yarn lint` and `yarn build` clean; 60 fps.
- **Final helix rebuilt as glossy tubes (was particles).** Review: the particle
  helix didn't match the reference (smooth braided tubes). Replaced it with real
  geometry — new `helix-figure.ts`: `TubeGeometry` along helical
  `CatmullRomCurve3` curves (double-helix core + rungs + sweeping outer strands)
  with additive glow-node sprites, one glossy `MeshStandardMaterial` revealed via
  `setReveal(t)` opacity. The hand now **dissolves** (drift up + shrink) as the
  tubes fade in, so it appears to become the helix; the `updateCloud` morph branch
  was simplified to that dissolve and `sceneConfig.morph` reduced to `{ rise }`.
  New `sceneConfig.helix` holds the strand/tube/node params. Camera pulled back
  (`finalPos` z −78 → −62) so the ~46-unit braid reads as a whole. Two segments
  (`arrive` → 1: push in + tilt up) unchanged. `yarn lint` / `yarn build` clean;
  60 fps.
- **Final phase: hand morphs into a helix (superseded above).** Added the
  `sequence.arrive`/`morphRange` split, `camera.finalPos`/`finalTarget`, and
  `scrollVh` `420` → `640`.
- **Hand parity with the glyph.** The hand now gets the **same containment net**
  (a second, static `createContainmentField` scaled to wrap it on the second
  podium) and the **same cursor repulsion** (it's updated every frame with
  `scatter: 0`, gated on over `progress` 0.82→0.96; `pointerOnPlane(focus)`
  extracted as the shared raycast). Its **shading was fixed**: the baked `dir`
  term (position-from-centre vs light) reads as an unnatural front/back split on a
  surface point cloud, so `CloudOptions.shade` is now configurable and the hand
  uses a soft top-lit set (`floor 0.5`, `height 0.5`, `dir 0.16`) while the glyph
  keeps its volume-reading defaults. `yarn lint` / `yarn build` clean; 61 fps.
- **Real hand model; ribbons flow along themselves.** Two review fixes. (1) The
  procedural SDF hand was replaced with a **loaded point cloud** exported from a
  model — `public/assets/hand/points.bin` (`bin_u16`, 4173 pts, decoded via the
  manifest's offset/scale, Y-up). `createHandParticles` is now **async** (fetches
  the asset) and the scene adds the mesh when it resolves; `HandConfig` dropped
  `count`/`spillChance`. (2) The held ribbons only *scaled* before — now they
  visibly move: `updateCloud` takes a `time` (`tick/60`) and applies a coherent
  rotation of the whole cloud (`scatter.drift`) plus a small per-particle wander
  along each particle's **ribbon tangent** (`flowOverride` on the cloud), so
  particles flow *along* the thin curve. Values kept modest — too much of either
  smears the ribbons back into a cloud. Only the glyph scatters, so the hand is
  unaffected. `yarn lint` / `yarn build` clean; 60 fps.
- **Scatter pacing (from review): quicker, camera moves during it.** The ribbon
  formation took too much scroll while the camera sat nearly still. Dropped the
  camera ease-in (an interim `pow 1.7`, back to plain `smoother`) so the camera
  visibly approaches and rolls *while* the glyph unravels; compressed the scatter
  (`scatterRange` `[0.02, 0.42]` → `[0.02, 0.34]`, `stagger` `0.35` → `0.25`) and
  shortened the shot (`sequence.scrollVh` `560` → `420`). The thin dissolving
  ribbons still keep the corridor clear for the moving camera. `yarn lint` /
  `yarn build` clean; 60 fps.
- **Scroll-sequence timing pass (from review).** Two rounds. First the camera was
  flying *into* the burst, fixed by particles that **dissolve on their tails** (a
  diagonal-matrix scale fade in `updateCloud`) plus `scatter.distance` < the
  camera standoff; `sequence.scrollVh` grew `320` → `560` to stretch and smooth
  the transition. Then, per follow-up, the **dolly and scatter were made
  simultaneous** (`sequence.dollyStart` `0.28` → `0.02`, so the camera moves from
  the start instead of holding) — kept clean by a new `scatter.towardCamera` that
  damps each particle's +Z motion, so the burst opens sideways/backward and dodges
  the advancing lens. `yarn lint` and `yarn build` clean; 60 fps.
- **Removed light shafts; net fade + stronger cursor scatter.** The light shafts
  were dropped entirely (`light-rays.ts` deleted, `RaysConfig` / `sceneConfig.rays`
  removed). The containment net now **fades top-down** — brightest at the base,
  transparent at the top — via an `onBeforeCompile` patch on its
  `LineBasicMaterial` that multiplies opacity by a local-Y falloff; `field.opacity`
  (`0.05` → `0.32`) is now the base strength. The cursor scatter got stronger
  (`pointer.strength` `3.4` → `6`) and a **two-rate easing**: particles snap out
  at `relax` (`0.22`) but drift home at the new, much softer `returnRelax`
  (`0.035`), so the "X" bursts and reassembles slowly instead of snapping back.
  `yarn lint` and `yarn build` clean; ~60 fps.
- **Smoothed the horizon + added a WebGL debug mode.** The horizon showed a dark
  band across the middle: the floor fades to `fog` with distance and the sky
  meets it there, and that shared value — dark `#6f777f`, darkened further by
  ACES tone mapping — rendered below both the lit near-floor and the sky above,
  so it read as a dark line even though there was no seam. Lightening `fog` /
  `backdropBottom` to `#868e96` (and `backdropTop` to `#aab2ba`) flattens the
  vertical luminance profile through the horizon (measured ~130–140 across the
  band, previously a trough at ~96) so the floor melts into the sky, without
  washing the scene out. Diagnosed with a new **`?debug=1`** mode:
  `preserveDrawingBuffer` for reliable screenshots plus `window.__scene`
  (`pause` / `resume` / `frame` / `autoRotate`) to pin a still frame, paired with
  a `readPixels` luminance probe. The flag is off in production. `yarn lint` and
  `yarn build` clean.
- **Light shafts re-hung on the ring fixture** — the shafts now stand
  **vertically around the lamp's circumference** (`rays.radius` / `rays.topY`
  tracking `ringLight.radius` / `ringLight.y`) instead of raking across the room
  as a diagonal sheet, so they read as the fixture's own light. `tilt`,
  `azimuth`, `spread` and `fan` dropped; `radius` and `topY` added. The beam
  texture now **fades out along its length**, dissolving in mid-air rather than
  ending on the floor — at constant opacity a shaft terminates in a hard
  rectangular edge that reads as a plane stabbed into the ground. `yarn lint` and
  `yarn build` clean; 61 fps.
- **Emissive particles + believable shafts** — the cursor now scatters particles
  harder (`strength` `1.5` → `3.4`, `radius` → `5`; past ~`5` the cursor engulfs
  the glyph and the "X" collapses into a ball) and touched particles **actually
  glow**. Brightening the tint was not enough: `instanceColor` drives albedo,
  which is multiplied by incoming light, so touched particles sitting in shadow
  stayed dull. three has no per-instance emissive, so the glyph now carries an
  `aGlow` `InstancedBufferAttribute` and patches `MeshStandardMaterial` through
  `onBeforeCompile` to add it to `totalEmissiveRadiance` — glow that ignores
  lighting entirely. The light shafts were rebuilt with **per-shaft variation**
  (width, length, opacity, depth, spacing, all seeded) and made narrower and
  fainter; identical evenly-spaced beams were what made them read as a flat
  graphic overlay rather than light in haze. 60 fps; `yarn lint` and `yarn build`
  clean.
- **Cursor interaction + sun shafts + contrast pass** — five more art-direction
  fixes. The light shafts became a **near-parallel sheet from one direction**
  (new `rays.azimuth` / `spread` / `fan`, `spin` dropped) instead of radiating
  around the vertical axis, where every shaft crossed in the middle and read as
  an artificial star. Particles are **fewer and larger** (`45000` → `20000`,
  size `0.105` → `0.2`). New **cursor repulsion**: `updateGlyphPointer()` pushes
  nearby particles aside and tints them a glowing lilac, easing back to rest
  afterwards — it writes directly into the instance buffers (only the three
  translation slots per matrix, since spheres carry no rotation), because
  recomposing 20k `Matrix4`s per frame would not hold 60 fps. The ring fixture
  reads **pure white**: it was grey because `MeshBasicMaterial` is fogged like
  any other material, so the emissive materials now set `fog: false` alongside
  `toneMapped: false`. Finally, **contrast on the glyph** was rebuilt around a
  baked **directional** shading term (particle offset vs. `glyph.lightDirection`)
  with a low floor — scene lighting alone can't shade the cloud, because every
  sphere carries identical normals wherever it sits. Both techniques are recorded
  as [[decisions-log]] ADR-0016. 61 fps; `yarn lint` and `yarn build` clean.
- **Lighting pass: matte-white particles, light shafts, glowing ring** — five
  art-direction fixes. Particles are now **matte white** (`#ffffff`,
  `metalness 0`, `envMapIntensity 0.08`, shading floor raised `0.22` → `0.58`);
  any metalness was tinting them with the grey environment and reading as dull
  metal. The **horizon finally disappeared**: a huge floor disc was not enough —
  the unfogged backdrop also had to meet it at the same value, so
  `colors.backdropBottom` now equals `colors.fog` and the backdrop's
  `gradientOffset` is `0`. The podium was lightened (`#cfd6dd`). The ring
  fixture dropped to `y 25` and gained a real glow. New `light-rays.ts` adds
  seven **diagonal additive shafts** that sweep slowly and flare past the camera.
  Two rendering traps recorded in [[components/common]]: a ring's glow must be a
  **coplanar annulus** (nested additive tori stack into horizontal bands
  edge-on; a camera-facing sprite glows in the middle of the ring, where there is
  nothing), and additive shafts need **cylindrical billboarding** every frame or
  they collapse into hard bright hairlines when they line up edge-on. 61 fps;
  `yarn lint` and `yarn build` clean.
- **Metal podium + the ring fixture restored** — the podium is now brushed metal
  (`metalness 0.88`, `roughness 0.24`). Because a metal surface shows almost
  nothing but reflections, this required a **scene environment**: one is
  pre-filtered from the scene's own gradient backdrop via
  `PMREMGenerator.fromScene()` rather than a stock HDRI, keeping reflections in
  palette with no external asset. Surface finishes moved into a new
  `sceneConfig.materials` block (`particle` / `podium` / `floor`, each with
  `roughness` / `metalness` / `envMapIntensity`) instead of being hardcoded in
  the builders; the particles sit at `envMapIntensity 0.3` so reflections don't
  wash out their baked shading gradient. The overhead ring fixture is back —
  thinner (`tube 0.7`) and higher (`y 28`) than the version that was removed, so
  only its far arc grazes the top of the frame instead of cutting a hard-edged
  ellipse across it. 61 fps; `yarn lint` and `yarn build` clean.
- **Particle-scene art direction pass** — five refinements from design review:
  particles are now **spheres** (`SphereGeometry(0.5, 6, 4)`, low-poly by
  necessity at 45k instances; random per-instance rotation dropped as
  meaningless for spheres); the podium is a single **lathed** surface with
  quarter-circle **rounded edges** instead of stacked cylinders with hard 90°
  corners; the containment field is a **straight cylinder** (equal top/bottom
  radii) rather than a flared cone; the floor disc grew `70` → `300` so its rim
  sits far beyond `fog.far` and **no horizon line** resolves — the ground reads
  as an infinite plane; and the overhead **torus fixture was removed** (it cut a
  hard-edged bright ellipse across the top of the frame) leaving just the point
  light and its soft halo. Gotcha recorded: `LatheGeometry` takes its winding
  from the point order, so the top-down profile must be reversed or the podium
  renders as a hollow crater. 61 fps; `yarn lint` and `yarn build` clean.
- **Terrain scene replaced by a 3D particle scene** — the white terrain hero was
  removed (`terrain.ts`, `center-plane.ts`, `noise.ts`, `white-scene.tsx`
  deleted) and rebuilt from a visual reference: a volumetric "X" of ~45k
  instanced cubes suspended in a triangulated containment field above a stepped
  podium, lit by an overhead ring fixture in a deep, foggy studio. New files in
  `src/components/common/scene/`: `random.ts` (seeded mulberry32),
  `glyph-particles.ts`, `podium.ts`, `containment-field.ts`, `dust.ts`,
  `ring-light.ts`, `backdrop.ts` (gradient sphere shader), `particle-scene.tsx`.
  `<WhiteScene>` → **`<ParticleScene>`**; `--scene-backdrop` now tracks
  `colors.fog`. No new dependencies — still vanilla `three` (ADR-0014).
- **`UnrealBloomPass` dropped — it renders black** — the post-processing chain is
  `RenderPass → VignetteShader → OutputPass`. Adding the bloom pass blacked out
  the entire canvas **with no console error** (a black pass propagates down the
  chain), both when seeded with a `1×1` resolution — where its 5-level mip chain
  degenerates to zero-sized targets — and with the real viewport size. Isolated
  by bypassing the composer and rendering directly. The halo is now geometry: an
  additive sprite in `createRingLight`. Documented in [[components/common]] so it
  isn't re-added.
- **Volume technique** — particles are rejection-sampled through the glyph's
  *interior* (not just its shell), each cube gets a random orientation and a
  vertical shading gradient baked into its instance colour, and the glyph casts
  no shadow (tens of thousands of cubes produce a speckled shadow that dirties
  the podium). `yarn lint` and `yarn build` are clean.

## 2026-07-08

- **Scene composition & lighting tuned** — the first pass rendered almost flat
  (a gradient with a pale ellipse): the fill light washed out all shading, the
  fog ate the mountains, and a high camera compressed the distance. Fixed by
  cutting the fill (hemisphere `1.1` → `0.5`, ambient `0.3` → `0.15`) and letting
  the key light carry the form (`2.1` → `3.2`, exposure `1.05` → `0.95`);
  enlarging the terrain (`60` → `120`) and the range (`mountainHeight` `7.5` →
  `45`); replacing the mountains' sharp power curve with a smoothstep ramp over
  the back half plus a lower ridge-noise frequency, so the peaks are broad and
  smooth rather than noisy; pushing the fog back (`20/62` → `45/170`); and
  dropping the camera near ground level (`y 7` → `5`) so distant peaks rise above
  the horizon instead of flattening. Verified visually in the browser.
- **White 3D scene added to the home view** — the home view now renders
  `<WhiteScene>`, a full-viewport **three.js** scene in white tones: a smooth
  noise-displaced relief with mountains fading into a fog backdrop and a flat
  polished plane at the centre. New module `src/components/common/scene/`
  (`scene.config.ts` tokens, self-contained `noise.ts` fbm, `terrain.ts` +
  `center-plane.ts` mesh builders, `white-scene.tsx` client leaf). Added the
  `three` + `@types/three` dependencies; a new `--scene-backdrop` token in
  `globals.css`; `HomeView` renders the canvas full-bleed (`fixed inset-0`) with
  an `sr-only` `<h1>` and stays a Server Component. **`@react-three/fiber` +
  `@react-three/drei` were installed first, then removed** — R3F augments the
  global JSX namespace, which collapsed the `#do-not-modify` animation engine's
  dynamic-`Tag` children to `never` and broke `yarn build`; the scene is driven
  imperatively on vanilla three.js instead. **Canvas sizing** is applied at
  setup, on `window` `resize`, and re-checked every 30th frame: the container is
  0×0 in the mount effect, and `ResizeObserver` never fires in the in-app preview
  browser, which left the canvas stuck at its 300×150 default. The auto-orbit
  honours `prefers-reduced-motion`. `yarn lint` and `yarn build` are clean. See
  [[decisions-log]] ADR-0014, [[tech-stack]], and [[components/common]].

## 2026-06-07

- **Fixed `<Inview>` standalone reveal + spring resize gating** — `<Inview>`
  never animated unless an external `trigger` ref was passed. The JSX `ref`
  callback wrote `inViewRef.current = node`, but that tuple slot is a *callback
  ref* (`setNode`), so the element was never observed and the `node` stayed
  `null`. Now calls `setInViewNode(node)`. This was also a build-breaking type
  error. Additionally, `<Inview>`, `<Spring>`, and `<Hover>` tracked `width` as a
  hook dependency but never passed it to `isMobileDisabled` — fixed by passing the
  tracked `width`, restoring resize re-evaluation and clearing the
  `react-hooks/exhaustive-deps` warnings. `yarn build` and `yarn lint` are now
  clean. See [[decisions-log]] ADR-0013 and [[components/animation-springs]].

## 2026-06-05

- **Home view emptied** — removed the animation showcase (`src/views/home-showcase.tsx`
  deleted) and reduced `HomeView` to an empty `<main>`. The home view is now the
  blank starting point for new work. Documented the convention — *if the project
  is empty and no other instructions are provided, start developing in the home
  view on route `/`* — in [[ai-agent-guide]] and [[new-page]].

## 2026-05-23

- **README — setup + Vercel deploy steps added** — *Getting started* expanded
  into a four-step flow (clone the template → delete bundled `.git` →
  initialise your own GitHub repo → install & run), with a macOS hint for
  revealing the hidden `.git` folder (`⇧ + ⌘ + .`). Added a *🚀 Deploy to
  Vercel* section covering the CLI flow (`vercel` / `vercel --prod`) and the
  dashboard import path, plus an `env pull` pointer to
  [[environment-variables]].
- **README rewritten to lead with the AI workflow** — root `README.md`
  reorganised so the AI usage guide is the first section: how the three
  `.claude/settings.json` hooks (`SessionStart`, `UserPromptSubmit`, `Stop`)
  enforce the vault workflow automatically, how to write a good request
  against this convention layer, and a cost-expectations note recommending
  **Claude Max (5×)** as the minimum plan (the vault-fan-out + hook
  re-injection on every turn is token-intensive by design). Technical
  *Getting started* and the existing AI-agents entry-point pointer stay
  below.

## 2026-05-22

- **Styling-placement convention added** — to stop `globals.css` accumulating
  hundreds of component-specific classes, styling now follows a strict
  placement order: one-offs are Tailwind utilities, repeated patterns become
  **React components** (not `@layer components` classes), and `@layer
  components` is reserved strictly for pseudo-elements and third-party
  overrides. `globals.css` stays bounded — `@import`, tokens, base resets only.
  No CSS Modules. Codified in [[decisions-log]] ADR-0012; [[design-system]]
  (new *Where a style goes* section) and [[component-conventions]] updated.
- **Semantic-HTML / SEO-markup convention added** — new [[html-semantics]]
  rulebook: landmarks, one `<h1>` + heading outline, native elements over
  `div`s, forms/images/ARIA, JSON-LD over microdata, a `data-*` convention, and
  passing a semantic `tag` to animation components. Codified as AGENTS.md hard
  rule #10; cross-linked from [[component-conventions]] and [[new-page]]. Fixed
  the demo (`home-showcase.tsx`) to a single `<h1>` to follow it.
- **API layer added** — a convention for reaching external services.
  `app/api/<resource>/route.ts` Route Handlers own their logic and read secret
  env vars directly (safe — route files never reach the browser). New: `zod`
  dependency; `src/env.ts` (validated env, public/server split); `src/lib/api/`
  (`handle` wrapper + `ApiError` + `{ data }`/`{ error }` envelope);
  `src/lib/api-client.ts` (typed same-origin fetch); example
  `app/api/contact/route.ts`. Codified as AGENTS.md hard rule #9. See
  [[decisions-log]] ADR-0011 and [[api-architecture]].

## 2026-05-21

- **Asset convention added** — site content assets (images, videos) now live
  under `public/assets/<section>/`, one folder per section; meta/PWA/SEO assets
  stay at the `public/` root. Documented in [[folder-structure]],
  [[component-conventions]], and the [[new-page]] playbook; `public/assets/`
  created with a `.gitkeep`.
- **SEO & performance hardening** — a broad pass on the starter. **SEO:** new
  `src/lib/site.ts` config (single source of truth, fed by `NEXT_PUBLIC_SITE_URL`);
  `metadataBase` is now always set (relative OG/canonical URLs resolve);
  `themeColor` moved to a `viewport` export; added `app/robots.ts`,
  `app/sitemap.ts`, and an `Organization`+`WebSite` JSON-LD helper; OG image
  dimensions corrected to match the asset; dead `keywords`/`other` tags dropped.
  **Performance:** populated `next.config.ts` (`removeConsole` in prod,
  AVIF/WebP, `next/image` breakpoints aligned to the grid, `poweredByHeader:
  false`); fixed a `requestAnimationFrame` leak in `ScrollLayout` (Lenis loop
  never cancelled on unmount); `HomeView` is now a Server Component with the
  animation demo split into the `HomeShowcase` client leaf; added
  `<ReducedMotion>` (honours `prefers-reduced-motion` via react-spring's global
  `skipAnimation`); removed a per-frame `console.log` from the demo; added
  `app/loading.tsx` / `error.tsx` / `not-found.tsx`. See [[decisions-log]]
  ADR-0010, [[seo-metadata]], and [[environment-variables]].
- **Animation engine — lint pass** — cleared all 13 pre-existing ESLint problems
  in the engine (2 errors + 11 warnings), an authorized engine edit (ADR-0009).
  `isMobileDisabled` now takes an optional `viewportWidth` argument, so the
  `active` memos in `<Spring>` / `<Hover>` / `<Inview>` / the trigger hooks
  depend on it genuinely. Added missing `disableOnMobile` effect deps; fixed a
  `trigger.current`-in-cleanup hazard in `<Hover>`; ref-stabilised `<Handle>`'s
  transition effects. **API change:** `useProgressTrigger` now returns `progress`
  as a `RefObject<number>` (read `.current`) instead of a render-time ref read —
  no consumer was affected (`<ProgressTrigger>` discards the return).
- **Animation engine — performance refactor** — fixed load issues that scaled
  with the number of animated components. Added `src/lib/animation/ticker.ts`, a
  single reference-counted `requestAnimationFrame` loop; `useLoop` (and all loop
  hooks) now subscribe to it instead of each starting its own rAF. `useWindowWidth`
  / `Height` / `Size` now share one debounced `resize` listener via a
  `useSyncExternalStore` store (the `debounceDelay` param was dropped — unused).
  `useDynamicInView` rewritten without the per-render `Proxy`/observer churn.
  Fixed a stale-closure bug in `useLoop`. `mode="forward"` scroll listeners made
  `passive`. This was an **authorized edit to `#do-not-modify` engine files** —
  hard rule #2 amended. See [[decisions-log]] ADR-0009 and [[animation-system]].
- **`spring-text-engine` updated** — bumped `^0.1.3` → `^0.1.5` (latest). The
  public API, types, and dependencies are unchanged between these versions
  (verified) — an internal-only patch bump, no code changes required.
- **Adaptive scaling grid added** — a root-font-size scaling system landed in
  `src/components/common/grid/` (`<AdaptiveGrid>` + `useAdaptiveGrid` hook +
  `grid.config.ts`), with `vw` media queries in `globals.css` for scale-down.
  It was dropped into `common/` as a `styled-components` system; ported to the
  project stack — config-driven TS + CSS-only Tailwind, no `styled-components`.
  The unused dropped files (`colors.ts`, `fonts.ts`, `utils.ts`, `index.ts`,
  the `styled-components` `grid.tsx`) were removed. Mounted via `<AdaptiveGrid>`
  in the root layout. See [[components/common]] and [[decisions-log]] ADR-0008.
- **Vault created** — `obsidian/` Obsidian vault initialised as the project's
  second brain. Architecture, frontend, and workflow docs populated. See [[decisions-log]] ADR-0001.
- **Root README rewritten** — replaced `create-next-app` boilerplate with a real
  project README that points into this vault.
- **`generic-layout-prompt.md` moved** — relocated from repo root to
  `obsidian/workflows/` as [[generic-layout-prompt]].
- **Navigation convention resolved** — standard `next/link` confirmed; the unbuilt
  `<AnimLink>` / `useAnimRouter()` convention dropped. See [[decisions-log]] ADR-0005.
- **Docs consolidated into the vault** — `project-specs.md` deleted (decomposed into
  vault notes + new [[environment-variables]]); `text-engine-docs.md` moved in as
  [[text-engine-reference]]. `AGENTS.md` rewritten as a thin shim; `.cursorrules`
  repointed to `@AGENTS.md`. The vault is now the single source of truth.
  See [[decisions-log]] ADR-0006.
- **Vault renamed & restructured** — vault folder `Ternyon.io/` → `obsidian/`;
  number prefixes dropped from section folders (`00-meta` → `meta`, etc.). Project
  name standardised to **`next16-claude-starter`** across docs and `package.json`.
- **Components linked to docs** — every file in `src/components/` now carries a
  `// 📖 Docs:` pointer comment to its catalog note, so agents can jump from code
  to docs and back.
- **Vault workflow automated** — added `.claude/settings.json` with `SessionStart`,
  `UserPromptSubmit`, and `Stop` hooks that make agents read the vault first,
  follow the relevant guide, and update docs after every change — with no manual
  reminder. See [[decisions-log]] ADR-0007 and [[ai-agent-guide]].
- **Cookie component replaced** — the `react-cookie-consent`-based `cookie.tsx`
  was replaced by an in-house `Cookie/` component (banner + category preferences
  modal + Zustand store). `react-cookie-consent` removed from dependencies. The
  component shipped using `styled-components` + an external design system; it was
  ported to the project stack — Tailwind v4 tokens and `@react-spring/web` motion.
  Mounted via `<LazyCookie>`. See [[components/common]].
- **Fixed TextEngine spring type mismatch** — the `mode="once"` heading in
  `views/home.tsx` mixed `lineIn={{ y: 0 }}` (number) with `lineOut={{ y: "100%" }}`
  (string), throwing *"Cannot animate between _AnimatedString and _AnimatedValue"*.
  Changed to `y: "0%"`. The buggy pattern in [[text-engine]] / [[text-engine-reference]]
  examples was corrected and a type-matching gotcha note added.

## Project baseline (git history)

| Commit | Description |
|--------|-------------|
| `94b0870` | feat: update starter |
| `5280ef2` | fix: linter errors & build |
| `b2b84e6` | initial — `next16-claude-starter` scaffold |

> [!note]
> The starter shipped with: Next.js 16.2, React 19.2, Tailwind v4, `@react-spring/web`,
> `spring-text-engine`, Lenis, and Zustand. See [[tech-stack]] for the current state.
