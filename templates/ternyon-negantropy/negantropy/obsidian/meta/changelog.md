---
tags: [meta, changelog]
updated: 2026-05-31
---

# Changelog

Chronological log of notable changes to the project. Newest first.
This is a human-curated log — not a mirror of `git log`.

## 2026-05-31

- **Mobile content appears on entry + deeper particle cut**
  ([[components/negentropy]]).
  - **`scroll-fade`**: on mobile the bottom fade-in is now skipped (held at
    `1`), so section content is fully opaque the instant it enters from below
    — the per-letter `Inview`/`TextEngine` reveals handle the entrance. The
    previous px-based bottom ramp was keeping the wrapper dim until content had
    scrolled well into view. Top fade-out (viewport-relative, ADR per the
    20 % threshold) is unchanged.
  - **`scene`**: mobile `densityScale` dropped from `0.7` → `0.49` (a further
    30 % cut, compounding to ~half the desktop particle count). See
    [[decisions-log]] ADR-0017 (amended).

- **Mobile WebGL performance budget** ([[decisions-log]] ADR-0017,
  [[components/negentropy]]). On mobile (≤ 768 px, `springsConfig.mobileWidth`)
  the scene now renders **30 % fewer particles** and **drops the bloom
  postprocessing pass**. A `densityScale` prop (default `1`) was added to all
  six particle leaves (`Starfield`, `SpiralNetwork`, `Molecule`, `RedStorm`,
  `HourglassGalaxy`, `StarfieldClose`); `Scene` passes `0.7` on mobile and
  gates `<EffectComposer>` behind `!isMobile`. Desktop is unchanged (full
  count + ADR-0015 bloom).

- **`yarn build` unblocked — dynamic-tag typing fix in the animation engine**
  ([[decisions-log]] ADR-0016). Authorized (`#do-not-modify`) typing-only
  patch across `animated-var-text-tag.tsx`, `spring.tsx`,
  `spring-trigger.tsx`, `progress-trigger.tsx`, `hover.tsx`: the dynamic
  `Tag` local is now `(animated as any)[tag]` / `tag as any`, fixing two
  React-19 `@types/react` errors (a bare `ElementType` JSX tag resolving its
  props to `never`, and the `animated[tag]` index-signature error). Removed a
  stale `// @ts-expect-error` and the unused `ElementType` imports. No
  runtime/behaviour change.

- **Mobile typography & CTA pass (follow-up to the chrome pass below)**
  ([[components/negentropy]]). All mobile-only tweaks use the `max-sm:`
  variant so desktop stays pixel-identical.
  - **Eyebrow clusters** (`hero` ×2, `section` ×2): the bracketed
    `( VI ) — SEC.006 — PERSIST` line now carries `whitespace-nowrap` +
    `max-sm:text-[0.625rem] max-sm:tracking-[0.18em]` so the longest meta
    (`SEC.004 — THE BODY AS UNIVERSE`) fits one line on phones.
  - **CTA pills** (`hero`, `choice-cta`): added `whitespace-nowrap` and a
    mobile **filled-amber** treatment — `max-sm:bg-negentropy-amber
    max-sm:border-negentropy-amber max-sm:text-negentropy-void` plus
    `max-sm:px-5 max-sm:text-xs max-sm:tracking-[0.16em]` so the label fits
    one line. Desktop keeps the outlined-bone style + amber hover.
  - **Loader** (`loader-flow-field`): manifesto text is 20 % smaller on
    mobile — `max-sm:text-[clamp(1.28rem,1.68vw,1.52rem)]` — to keep each
    beat on one line.
  - **`scroll-fade`**: the top fade-out threshold is now viewport-relative on
    mobile (≤ 640 px) — content stays fully visible until its top edge
    reaches 20 % of the viewport, then fades by 5 % (vs the fixed 120/140 px
    desktop zone). Content was disappearing too early on phones.
  - **`biomarker-grid`**: the bracketed value now has `min-w-[7ch] shrink-0
    tabular-nums` so the labels after numbers of differing widths
    (`(1,977)` / `(-5.1)` / `(99th)`) all start on the same vertical line.

- **Mobile-responsive UI chrome** ([[components/negentropy]]). The 3D scene
  was already fluid; this pass makes the 2D chrome read correctly on phones.
  Breakpoint is `sm` (640 px), aligned with the existing font-scaling jump in
  `globals.css`.
  - **`frame`** inset: `inset-4` (1 rem) on mobile → `sm:inset-8` (2 rem). The
    "offset till the outline" on mobile is now 1 rem per the brief.
  - **`brand-mark`** offset: `left-8 top-8` → `sm:left-16 sm:top-16` — kept at
    1 rem inside the responsive frame on both sizes.
  - **`hero` / `section`** padding: `px-8 pb-8 pt-24` on mobile →
    `sm:px-16 sm:pb-16 sm:pt-32` → `md:pb-20 md:pt-40`. The 12-col grid stays
    `md:`-gated, so mobile stacks single-column.
  - **`nav-jumplinks`** now collapses into a **burger** below `sm`: the desktop
    jumplink stack is `hidden sm:flex`; a `sm:hidden` burger toggle (`z-50`)
    springs a full-screen overlay menu (`bg-negentropy-void/95`, `z-40`) open.
    Burger lines + overlay both animate via `<Spring mode="always"
    enabled={open}>` (spring-based per hard rule #1 — no CSS keyframes); the
    two lines spring from horizontal to a 45°/−45° X. `aria-expanded` +
    toggling `aria-label`; tapping an overlay link closes the menu.

## 2026-05-28

- **Repalette: molecule blue, red-storm green** ([[components/negentropy]]).
  - **`molecule`** atoms: `#ffe9c0 → #ff8a40` (cream → amber) →
    `#dcf7ff → #4cb8ff` (bright cyan core → vivid blue rim). Bond
    half-brightness source (`#808080`) and 4× fragment multiplier
    unchanged.
  - **`red-storm`** mass: `#ff2030 → #ff7d3a → #ffd09a`
    (deep red → hot red → ember) → `#0aff7f → #3affd0 → #caffff`
    (bright green core → teal → bone rim). The `smoothstep(rN,
    0.25, 0.85)` gradient logic (long deep-tone core,
    bright rim only at the outer crust) is preserved; only the
    three palette stops changed. Variable names (`deepRed` /
    `hotRed` / `ember`) intentionally retained so the diff stays
    small and the gradient math stays readable as
    "deepest-tone-at-the-core".

- **Section column alignment fixed (grid align-self) + §VI body justify-center**
  ([[components/negentropy]]).
  - The earlier `flex justify-end / justify-start` chain on each
    column wasn't anchoring the meta cluster to the row's top
    line — grid items default to `align-items: stretch`, which was
    collapsing the columns and leaving the meta cluster floating
    near the row bottom. Switched to **grid `align-self`**:
    heading column gets `md:self-end`, meta column gets
    `md:self-start`. Row height now sizes to the heading's content,
    and the meta cluster anchors to the row top so its first line
    lands on the heading's first line — visible on §V especially
    (`flip` layout).
  - **§VI body** now carries `flex flex-wrap justify-center
    text-center` on the TextEngine className (plus `text-center`
    on the wrapper) so the body words centre regardless of whether
    TextEngine renders them as flex children. Per the user's hint
    that `justify-content: center` would fix it.

- **§VI heading forced to a single centred line**
  ([[components/negentropy]]). The previous `mx-auto w-full
  max-w-[20ch]` wrapper was sometimes tight enough that TextEngine's
  letter-span layout broke "Begin today." onto two rows. Switched
  the heading wrapper to `mx-auto w-fit whitespace-nowrap` so the
  box sizes to its own content and never wraps; `mx-auto` still
  centres the (now content-sized) box. Body wrapper unchanged
  (multi-line prose, keeps `max-w-[44ch]`).

- **§VI heading reliably centred + loader cadence tightened**
  ([[components/negentropy]]).
  - **§VI centred heading + body** wrapped in `mx-auto w-full
    max-w-[N]` divs so the centred boxes are reliable regardless of
    how TextEngine lays out letter / word spans inside. The
    TextEngine itself just renders the `<h2>` / `<p>` with
    `text-center`. Fixes the case where "Begin today." was breaking
    onto two visually mis-aligned lines.
  - **Loader: dead hold removed.** `holdMs = 360 → 0` so the exit
    fires the instant the in-cascade lands — the next sentence
    begins appearing immediately. Other defaults tightened:
    `letterStaggerMs 28 → 22`, `letterDurationMs 360 → 320`,
    `exitMs 460 → 360`. With three beats the loader now lands
    ~1.7 s sooner.

- **§VI body width fix + outlined CTA + matte removed**
  ([[components/negentropy]]).
  - **§VI body was wrapping one word per line** because the
    centred-variant body's `<p>` had `max-w-[40ch]` but no
    `w-full`; flex children of `flex-col items-center` shrink to
    `min-content` (the longest unbreakable word) by default. Added
    `w-full` to both the heading and body TextEngine classNames in
    the centred variant so they take the available width up to
    their cap and the text wraps correctly across multiple lines.
  - **`ChoiceCta` reverted to outlined-bone pill** matching the
    Hero CTA style 1:1 (border, hover, typography, paddings) so
    the page's two outbound buttons read as a pair. The filled
    amber treatment was retired.
  - **Frame matte removed.** `frame.tsx` is back to a single 1 px
    rounded rectangle at `inset-8`; scroll-time overlap with pinned
    chrome is handled by `<ScrollFade>` on the section content
    instead of a hard clip. The `relative z-20 isolation: isolate`
    wrapper around UI in `NegentropyClient` was also removed since
    its only purpose was scoping the matte's destination-out blend
    — UI is back to a fragment of siblings under `<main>`.

- **Section UX pass — alignment, biomarkers, scroll-fade, §VI CTA**
  ([[components/negentropy]]). Six fixes in one pass.
  1. **Meta column top now aligns with heading top.** Grid switched
     from `items-end` to `md:items-stretch`; heading column gets
     `md:justify-end` (heading at section bottom), meta column gets
     `md:justify-start` (eyebrow + body start at the top of the
     row = top of the heading). Smaller right-column content always
     begins on the same line as the title's first row.
  2. **`BiomarkerGrid` simplified to inline rows.** Bracketed amber
     value `(1,977)` next to a small uppercase label, one row per
     stat. Replaces the stacked `value-above-label` cells that read
     as off-balance (giant number over tiny copy).
  3. **§VI body explicitly `text-center`.** TextEngine got an
     explicit class so word-spans align centred inside the centred
     variant's text-center parent.
  4. **`ChoiceCta` redesigned** as a filled amber pill with a soft
     amber glow shadow and void-coloured label; hovers to bone with
     a deeper glow. The earlier outlined pill read as secondary
     against the §VI starfield backdrop.
  5. **Hero CTA renamed** `BEGIN SCROLL → Read full blueprint` and
     re-pointed at `blueprint.bryanjohnson.com`. `cta.href` is now
     part of `HeroSectionContent`; the `↓` scroll cue keeps using
     the in-page `nextHref`.
  6. **`§V` heading explicitly right-aligned** when `flip=true` —
     `md:text-right` added to the heading TextEngine className in
     addition to the parent column's inherited `text-right`.
  7. **`ScrollFade` wrapper added** ([[components/negentropy]]).
     Reads `getBoundingClientRect()` per RAF and ramps opacity
     `1 → 0` as the wrapper's top approaches the chrome zone, and
     `0 → 1` as the bottom rises into the viewport. Wraps each
     `Section`'s content and the `Hero` bottom cluster, so text
     no longer overlaps the pinned BrandMark / NavJumplinks during
     scroll. Independent of the TextEngine entrance reveals.

- **Frame matte upgraded to a real UI knockout mask**
  ([[components/negentropy]]). The previous matte painted void colour
  over the perimeter — it clipped UI but also hid the canvas at the
  edges. Replaced with `mix-blend-mode: destination-out` on the same
  border ring, so the matte now *erases* underlying pixels instead of
  painting on top. To scope the blend to UI only,
  `NegentropyClient` wraps every UI element in a
  `relative z-20 isolation: isolate` div; the canvas at `z-10` sits
  outside that isolated stacking context and stays full-screen
  visible behind the UI. Net effect: UI is clipped to the framed
  rectangle exactly as before, **and** the 3D scene fills the full
  viewport unaffected.

- **Molecule + red-storm 2× brighter on top of the house-style pass**
  ([[components/negentropy]]).
  - **Molecule** fragment multiplier `× 2.0 → × 4.0` so the amber atom
    palette reads as a hotter orange under bloom. Bond source colour
    halved (`#ffffff → #808080`) so connectors still land on
    pure-white visually instead of running away into a fat halo.
  - **Red-storm** fragment multiplier `× 2.0 → × 4.0` for the same
    "hot pumping mass" effect.
  - **Red-storm gradient retuned** for a more clearly red core. The
    old `deepRed.lerp(hotRed, min(1, rN * 1.4))` reached pure hotRed
    by `rN ≈ 0.71`; the new
    `deepRed.lerp(hotRed, smoothstep(rN, 0.25, 0.85))` holds the
    inner ~25 % of the storm purely on deep red and S-curves out to
    hot red toward the shell. Ember-rim bias pushed later
    (`(rN − 0.7) × 3`, clamped) so bright cream sits at the outermost
    crust only. Closer-to-centre particles smoothly read more red.
  - Convention captured in [[components/negentropy]] § conventions:
    scene-specific `× N` boosts are allowed on top of the house-style
    2× pass; any pure-white source colours in the boosted scene must
    be pre-halved.

- **Fix: point-sprite corner artefacts under bloom**
  ([[components/negentropy]]). Hours after bloom landed, large
  point-sprite quads (especially the close starfield at close range
  and dense storm/molecule particles) showed visible **black square
  fringes** outside the soft disc. Root cause: every shader other
  than `spiral-network` and `hourglass-galaxy` computed
  `strength = pow(1.0 - length(uv) * 2.0, N)` and discarded on
  `strength <= 0`. But `pow(negative, 4)` is *positive* (even
  integer power) and `pow(negative, 4.5)` is undefined / positive on
  most GPUs, so the discard never fired in the four corners outside
  the inscribed circle. The corner fringe contributed dim colour
  under additive blending — invisible without bloom, square-shaped
  black artefacts *with* bloom.
  - Patched `molecule`, `red-storm`, `starfield-close`,
    `hourglass-galaxy` fragment shaders: compute `d = length(uv)`,
    early-discard when `d > 0.5`, then run the existing strength
    math on the safe inscribed circle.
  - `spiral-network` already used `step(0.5, strength)` so it
    produced a clean 0 outside; no change needed.

- **Bloom postprocessing brought back** ([[components/negentropy]]).
  Earlier v0.6–v0.8 attempts tripped `WebGLRenderer: Context Lost` on
  the dense particle field and the OutputPass / linear-space variant
  produced no visible glow — those attempts were stripped at the user's
  request. Now reinstated with a conservative configuration that works
  cleanly with the new 2× brightness pass:
    - `@react-three/postprocessing` `EffectComposer multisampling={0}`
      → no MSAA on the post pass; cheap and stable.
    - `Bloom intensity={0.55}`, `luminanceThreshold={0.4}`,
      `luminanceSmoothing={0.08}`, `radius={0.8}`,
      `mipmapBlur={false}` → classic gaussian blur (no per-frame
      mipmap chain — the crash vector last time), and the threshold
      catches only the brightest particle cores so alpha-blended
      fringes are ignored.
  Sits at the end of the scene tree so every particle leaf is
  composited before bloom runs.

- **2× brightness pass across every 3D scene** ([[components/negentropy]]).
  Five shader scenes (`spiral-network`, `molecule`, `red-storm`,
  `hourglass-galaxy`, `starfield-close`) now multiply their fragment
  `color` output by 2.0 before composing alpha — particles saturate
  harder under additive blending so the negative space reads as a
  backdrop, not the foreground. The non-shader ambient `starfield`
  PointsMaterial got the same treatment: source RGB doubled with a
  hard `min(1, …)` clamp, and material `opacity 0.85 → 1.0`, keeping
  the far backdrop in scale with the brighter close scenes.

- **2 rem gap between Frame border and UI** ([[components/negentropy]]).
  Follow-up to the inset unification: the previous pass put `Frame`
  and the pinned UI both at `inset-8` (overlapping). Frame now stays
  at `inset-8` (2 rem from viewport edge); all UI moves another 2 rem
  inward to `left/right/top-16` (chrome) and `px-16` / `pb-16` md:`pb-20`
  (content), giving a clean 2 rem corridor between the border line and
  anything inside it. Touches `BrandMark`, `NavJumplinks`, `Hero`,
  `Section` (both default and centred variants).

- **UI consistency pass — 2 rem unified inset, biomarker row, §VI centred, typography floor**
  ([[components/negentropy]]).
  - **Whole UI sits at 2 rem from viewport edges**, single value
    across all breakpoints. `Frame` → `inset-8`; `BrandMark` →
    `left-8 top-8`; `NavJumplinks` → `right-8 top-8`; `Hero` +
    `Section` → `px-8`. Brand + nav z-bumped to `z-40` so they sit
    above the frame border line at the overlap.
  - **`Section` slot moved under the heading.** `children` now
    renders in the headline column (default layout) or under the
    body (centred layout) instead of the meta cluster. §III's
    biomarkers and §VI's CTA picked up the new placement.
  - **`Section.centered` variant added** — discards the 12-col grid
    and stacks eyebrow / heading / body / slot vertically in the
    middle of the viewport. Wired on §VI so "Read the Blueprint"
    lands dead-centre on screen.
  - **`BiomarkerGrid` reshaped** from a right-column vertical stack
    into a **horizontal `grid-cols-3` row** rendered directly under
    the §III heading. Value type bumped to
    `clamp(1.75rem, 3vw, 2.75rem)`; label switched to `text-sm`.
  - **Typography floor 14 px / default 16 px.** Every sub-1 rem
    inline font size replaced with `text-sm` (0.875 rem floor for
    decorative uppercase labels) or `text-base` (1 rem default for
    body, links, CTA labels, scroll arrow). Headings keep their
    clamp values. Touches `BrandMark`, `NavJumplinks`, `Hero`,
    `Section`, `BiomarkerGrid`, `ChoiceCta`.
  - **CTA pill paddings bumped** to keep proportions with the
    larger text — Hero CTA `px-5 py-2.5 → px-6 py-3`; ChoiceCta
    `px-7 py-3 → px-8 py-3.5`.

- **Section UX pass — padding aligned, sides alternate, reveals unified to hero/loader motion**
  ([[components/negentropy]]). Follow-up to the section vocabulary
  unification, addressing three asks: match content padding to the
  page chrome, alternate which side the title lands on, and use the
  hero title / loader appear animation everywhere.
  - **Horizontal padding** on `Hero` and `Section` changed
    `px-10 md:px-16` → `px-6 md:px-10` so content edges align with
    `BrandMark` (`md:left-10`) and `NavJumplinks` (`md:right-10`)
    on every viewport.
  - **`Section.flip` prop added.** When true, the headline column
    moves to `md:col-start-6` (right side) and the meta cluster to
    `md:col-start-1` (left); the text-align / items-{start,end}
    classes flip with it. Wired on §III (Refusal) and §V (Choice)
    so the page alternates default → flip → default → flip →
    default across §II–§VI.
  - **Reveal motion unified to the hero title / loader X-slide.**
    Every appearing element now translates from `x: 16 → x: 0`
    with `easeOutQuart` instead of mixed Y-slides. Heading uses
    TextEngine **`letterIn`** (per-letter, 22 ms stagger, 620 ms
    duration — same numbers as the hero `HeadlineLines`); body
    uses **`wordIn`** (per-word, 45 ms stagger); eyebrow / CTA /
    biomarker label use Inview block X-slide; biomarker value uses
    TextEngine `letterIn`. All `mode="once"` so each beat fires as
    its section scrolls into view.
  - **`biomarker-grid.tsx`** alignment now inherits from the parent
    section's `text-align`, so the grid follows §III's `flip` state
    without needing a prop of its own.

- **Sections §II–§VI unified to the Hero corner-loaded vocabulary**
  ([[components/negentropy]]). Was: centred eyebrow / heading / body
  stack with a slot underneath. Now: bottom-left `<h2>` heading on
  `md:col-span-7` + bottom-right meta cluster on
  `md:col-span-4 md:col-start-9` mirroring `Hero`, with the same
  bracketed `( II ) — SEC.002 — ENTROPY` eyebrow, hairline separators
  and uppercase tracking used in `Hero` / `BrandMark`.
  - **Mock data shape change.** `eyebrow` removed; replaced with
    `index` + `meta`. A new shared `SectionContent` type covers
    §II–§VI (refusal extends it with `biomarkers`, persist with
    `cta`). Roman numerals + `SEC.00N — <NAME>` lines added per
    section.
  - **`section.tsx` rewritten** as the corner-loaded shell. Heading
    typography lands at `clamp(2.25rem, 5.6vw, 5.25rem)`; preserves
    natural case (vs. Hero's uppercase) so longer prose stays
    readable.
  - **`biomarker-grid.tsx` reshaped** from a three-column grid into
    a right-aligned vertical mini-stack so it fits inside §III's
    right-column meta cluster without overflowing. Per-row reveal
    delays bumped to 500 ms base + 140 ms stagger so the section
    heading and body land first.
  - **`choice-cta.tsx`** — leftover `mt-10` (sized for the old
    centred layout) tightened to `mt-2`. Section's `gap-5` now
    handles vertical rhythm between body and CTA.

- **StarfieldClose promoted to always-on travelling backdrop**
  ([[components/negentropy]]). Was scoped to §VI as the closing beat;
  now fades in across the §I→§II handover (`ramp(0.16, 0.28)`) and
  holds at full opacity for §II–§VI so every section after the hero
  feels like motion through space.
  - **Box dimensions 18×12×18 → 24×16×30** so the wider/farther
    camera anchors (z=9 at §II/III) stay well inside the field on
    all axes with margin on both sides of the +Z drift loop.
  - **`uSize 22 → 36`** + **aScale ceiling ≈ 2.05 → ≈ 3.0** so the
    field reads as a noticeable foreground layer, not background
    dust. Count `3.5 k → 5 k` to fill the larger volume.
  - **Scroll-driven drift speed.** Baseline `1.4 + p × 3` (was a
    flat 0.55) gives a sense of accelerating as the user scrolls
    deeper. A per-frame Δprogress × 80 term (clamped at 6) piles on
    top so an active scroll gesture *briefly* whooshes the stars
    past, then settles back to the progress pace.

- **§VI emblem — hourglass galaxy brought back**
  ([[components/negentropy]]). The original "scene we had at the
  beginning but lost" (retired in v0.10) is restored as the §VI focal
  emblem under the close starfield drift.
  - **`hourglass-galaxy.tsx` rewritten** against the live scene
    contract. Old version was the standalone §I hero with a
    `ramp(0.0, 0.06)` opacity envelope and a `ramp(0.32, 0.6)`
    direction reverse for the retired §III refusal beat. New version
    is a §VI emblem: opacity `ramp(0.83, 0.95)` (emerges through the
    storm blow-up), no direction reverse, dual-funnel via two
    `<Funnel>` leaves driven by a `uVortexDirection` uniform (+1 top
    / -1 bottom) instead of two separate vertex shaders. Added
    cursor-void repulsion (`radius 1.3 / strength 0.7`) for
    consistency with every other particle scene.
  - **Half-scale figure** (radius 2.5, y-offset 2.5; reference uses
    5/5) so the full sand-timer frames inside the §VI camera at
    `pos (0, 0, 5) → look (0, 0, 0)`. 70 k particles per funnel,
    140 k total. Palette preserved exactly from the reference
    (`#ff6030 → #1b3984`).
  - **§VI camera anchor retargeted** from
    `pos (0, 0, 1) → look (0, 0, -6)` (deep dive into starfield
    only) to `pos (0, 0, 5) → look (0, 0, 0)` (dolly two units
    forward *into* the storm's blow-up point, where the hourglass
    waist sits). The close starfield still wraps around — the
    camera is inside its 18-unit-deep box at z=5.

- **§VI added — close starfield drift + final CTA + storm blow-up**
  ([[components/negentropy]]). The page extends from five sections to
  six. The Read-the-Blueprint CTA moves out of §V (Choice) and into
  the new §VI (Persist); §V is now CTA-free so its single word
  ("Choose.") lands clean before the final beat.
  - **`red-storm.tsx` — new `uBlowUp` uniform** driven by
    `ramp(p, 0.83, 0.95)`. Vertex shader shoves each particle along
    its own radial direction (`normalize(pos) × blow² × (10 +
    aNoise × 18) × aRadialPush`) so the storm explodes outward in
    every direction. Fragment shader fades alpha with a
    `smoothstep(0.15, 1.0, uBlowUp)` so the explosion reads bright at
    the start, then collapses to nothing.
  - **`starfield-close.tsx` — new shader-driven foreground field.**
    3.5 k bright cyan / violet / bone particles in an 18×12×18 box.
    Endless +Z drift via `mod()` so the field reads as an infinite
    tunnel of stars streaming past. Per-particle twinkle phase.
    Cursor repulsion at half storm strength. Opacity fade-in via
    `ramp(p, 0.85, 0.97)` so it emerges *through* the dying storm.
  - **Camera anchors rescaled by 5/6** (`0.18 / 0.4 / 0.62 / 0.78 /
    1.0` → `0.15 / 0.33 / 0.52 / 0.65 / 0.83`) so the original
    five-section storyboard still hits the same scroll-vh moments on
    the new six-section page. **New §VI anchor** dollies into the
    starfield: `pos (0, 0, 1) → look (0, 0, -6)`.
  - **Scene timings rescaled** to match: spiral fade ramp `0.22–0.38
    → 0.18–0.32`; molecule assemble `0.22–0.42 → 0.18–0.35`;
    molecule dissolve `0.62–0.78 → 0.52–0.65`; molecule zoom
    `0.22–0.62 → 0.18–0.52`; molecule fly-past `0.62–0.85 →
    0.52–0.71`; storm opacity-in `0.62–0.85 → 0.52–0.71`; storm
    position-to-centre `0.62–1.0 → 0.52–0.83`.
  - **Mock data: new `persist` section** in
    `src/data/mocks/negentropy.ts`. `choice` now lacks the
    `cta` field — the type was split accordingly. Nav stack grows
    to six items.

- **Fix: molecule actually centred on screen during §II/§III**
  ([[components/negentropy]]). The previous camera anchors looked
  at `(0, 0, 1.5)` at p=0.4 while the molecule's centre was at
  `z = 1.8` at the same scroll point — a small but real offset
  that pulled the cage slightly off-centre. Also, the per-page
  Y-rotation of `-p × 4π` (~2 full turns) made the
  perspective-induced visual centroid wobble noticeably as
  closer-to-camera atoms dominated the projection.
  - **§II camera anchor**: look-at `(0, 0, 1.5) → (0, 0, 1.8)` —
    exact match to `ramp(0.4, 0.22, 0.62) × 4 = 1.8`. §II/§III
    anchor look-at z=4 already matched the molecule's max-zoom.
  - **§IV anchor**: look-at re-aimed at the rising storm's
    current position (`(0, -1.16, 2.3)`), camera pos `(0, 0, 8)`
    — replaces the previous static `(0, -0.5, 2)`.
  - **Molecule Y rotation slowed** `-p × 4π → -p × π` (half turn
    over full page). Cuts the visual wobble that came from
    rotating the asymmetric cage too fast under perspective.

- **Fix: molecule no longer drifts off-centre after scrolling back and forth**
  ([[components/negentropy]]). Two culprits combined to break the
  user's "scroll down → up → down" experience:
  1. **Camera was lerping toward its scroll target** instead of
     snapping. `camera.position.lerp(targetPos, 0.08)` left a small
     residual lag every frame, and rapid up-then-down scrolls
     compounded the lag visibly. Changed to direct
     `camera.position.copy(targetPos)` — Lenis already smooths the
     scroll progress, no need for a second damping layer here.
  2. **Molecule's Y rotation was time-accumulating**
     (`+= delta * -0.18`). After scrolling forward and back, the
     cage was at a different rotation angle than before, so the
     visible silhouette landed in a different place even though
     the centre hadn't moved. Switched to scroll-driven absolute
     rotation: `rotation.y = -p * Math.PI * 4` — same scroll
     position always gives the same orientation. Net ~2 full
     counter-turns across the page. X-rotation stays a tiny time
     wobble for "alive" feel without affecting centring. Trade-off:
     molecule no longer spins while the user is idle on §II/§III,
     but the up/down/down problem is gone.

- **Storm + §V camera aligned on axes — storm dead-centre at p=1.0**
  ([[components/negentropy]]). The previous setup placed the storm
  at `TOP_ATOM (0, 1.577, 6.553)` and the §V camera at
  `TOP_ATOM + (0, 0, 7)` — same X/Y but a non-zero Y offset that
  made the apparent centring sensitive to cursor parallax and to
  the rest of the camera path.
  - **`TOP_ATOM` constant replaced** with `STORM_CENTER (0, 0, 0)`.
  - **§V camera anchor** moved to `pos (0, 0, 7) → look (0, 0, 0)` —
    sits 7 units in front of the storm on the +Z axis, looking
    straight back along −Z. X and Y match the storm exactly.
  - **Red Storm flyby endpoint** moved to `(0, 0, 0)`. Start
    `(0, -2, 4)` (middle-bottom of camera view at p=0.62), end
    world origin at p=1.0. Initial JSX `position` updated to
    match the start.
  - **§IV camera anchor** retimed to pan *down* toward the rising
    storm: `(0, -0.5, 8) → look(0, -0.5, 2)` (was `(0, 1.0, 11) →
    look(0, 1.4, 5.5)`). Smoother lead-in to the dead-centre §V.
  - Result: storm lands at world origin, camera looks straight at
    origin — perfect axial alignment, storm visibly centred.

- **Reverted: moving-camera setup restored**
  ([[components/negentropy]]). The fixed-camera refactor didn't land
  visually for the user; rolled back to the moving-camera +
  moving-scenes setup that preceded it. Restored:
  - `TOP_ATOM` constant `(0, 1.577, 6.553)` and the 6-anchor
    `cameraAnchors` array in `scene.tsx`. `CameraRig` takes
    `progressRef` again and lerps between anchors.
  - `molecule.tsx` two-stage forward drift
    `ramp(0.22, 0.62) × 4.0 + ramp(0.62, 0.85) × 14.0`.
  - `spiral-network.tsx` back to fixed `position={[0, 2.5, 0]}`,
    no scroll-driven Z translation.
  - `red-storm.tsx` flyby `(0, -2, 10) → TOP_ATOM (0, 1.577,
    6.553)` across p=0.62…1.0.

- **Refactor: fixed camera, scenes move themselves**
  ([[components/negentropy]]). After several iterations trying to
  land a "Red Storm centred on the screen" via a moving camera +
  moving scenes, switched the entire scene architecture to
  **fixed camera + moving objects** — like a stage with a locked
  audience POV and the props sliding in/out.
  - **Camera** now sits at `CAMERA_POS (0, 0, 10)` looking at
    `CAMERA_TARGET (0, 0, 0)` for the whole scroll. `CameraRig`
    dropped its 5-anchor scroll lerp and its `progressRef` prop;
    only **cursor parallax** still moves the camera (small offsets
    around the fixed pose). The `TOP_ATOM` constant + 6-anchor
    array deleted.
  - **Centre of screen is now a known world coordinate.** Anything
    at `(0, 0, anything)` projects to dead centre — no more
    iterating to align the Red Storm with the camera's moving
    look-at.
  - **Each scene component now drives its own world position
    based on scroll progress.**
    - `spiral-network.tsx`: `position.z = 5 + ramp(0, 0.38) × -10`
      — starts close (large hero), drifts away to `z=-5` as it
      fades. Y offset dropped (was 2.5) — centred now.
    - `molecule.tsx`: `position.z = -10 + ramp(0.22, 0.85) × 24`
      — single linear motion `-10 → 5 → 14`. Smooth zoom in then
      fly past the camera. Replaces the previous two-stage drift.
    - `red-storm.tsx`: lerps `(0, -3, 0) → (0, 0, 0)` across
      p=0.62…1.0. **End position is dead centre**, period.
      Initial JSX position matches the start.
  - Less moving parts; deterministic compositions; "middle of
    screen" is finally pinnable.

- **Molecule flies past camera + Red Storm enters as a flyby**
  ([[components/negentropy]]).
  - **Molecule no longer stops at z=4.** Position now uses a
    two-stage drift:
    - **Stage 1**: `ramp(0.22, 0.62) × 4.0` — zoom in to §III look
      (unchanged).
    - **Stage 2**: `+ ramp(0.62, 0.85) × 14.0` — keeps flying forward
      another 14 units, so the cage passes *behind the camera* as
      it explodes outward. By the time the dissolve completes the
      cage is fully off-screen behind the viewer.
  - **Red Storm enters as a flyby.** Group `position` is now
    animated in `useFrame`: lerps from `(0, -2, 10)`
    (middle-bottom of the camera view at p=0.62, the moment the
    fade-in starts) to `TOP_ATOM (0, 1.577, 6.553)` at p=1.0.
    Reads as the storm rising up from below the viewer's eyeline
    into the centre of frame as the camera dollies forward.
    Initial JSX `position` updated to the start point so the
    first frame doesn't snap. *(v1 had storm entering from
    middle-bottom-right; user re-aimed to pure middle-bottom.)*

- **Molecule blow-up + harder zoom + global brighter palette**
  ([[components/negentropy]]).
  - **Fake-bloom on spiral reverted.** Restored `step(0.5, strength)`
    and point size `8.0 × aScale` so the hero reads as before.
  - **Molecule zoom roughly doubled.** Forward drift `2.5 → 4.0`. By
    p ≈ 0.62 the cage has moved 4 units toward the camera; with the
    look-at also tracking forward (`(0,0,4.0)` at p=0.62), the
    molecule fills much more of the frame than before.
  - **Molecule rotates the opposite direction** — Y rotation
    `+0.18 → -0.18`. Reads as a counter-spin against the spiral
    network's positive-Y rotation.
  - **Radial blow-up dissolve.** `aStartPos` was random points on a
    sphere; now it's the particle's *outward direction from origin*
    × `SCATTER_DISTANCE` + a 3.5-unit jitter. On dissolve, each
    particle interpolates from its home back out along its radial
    direction, so the cage **explodes outward** instead of
    scattering in random directions.
  - **Red Storm fades in *during* the blow-up.** Window moved
    `ramp(0.72, 0.92) → ramp(0.62, 0.85)`, exactly overlapping the
    molecule's dissolve. Storm materialises in the same world spot
    where the molecule is exploding away from — reads as
    "the molecule blows out, the storm grows in its place".
  - **`TOP_ATOM` / Red Storm position synced** to the new 4-unit
    drift: `(0, 1.577, 5.053) → (0, 1.577, 6.553)`. Camera anchors
    at p=0.62 and p=0.78 follow.
  - **Brighter palette across all three scenes** (per user request,
    sans real bloom):
    - Spiral inner `#86ffbd → #b3ffd6`, outer `#6b4ce0 → #a78cff`;
      fragment HSV bumped to `sat 0.75 / val 1.0`.
    - Molecule atom inner `#ffd49a → #ffe9c0`, outer
      `#ff6030 → #ff8a40`, bonds `#e8e3d8 → #ffffff`.
    - Red Storm deep `#c10f1f → #ff2030`, hot `#ff5230 → #ff7d3a`,
      ember `#ffb46b → #ffd09a`.

- **Spiral network — shader-side "fake bloom" added to particles**
  ([[components/negentropy]]). After removing real post-processing,
  added a glow-from-within effect to `spiral-network.tsx` only via
  the fragment shader: smooth radial falloff (no `step()`) so every
  particle has a soft halo around a brighter core, layered as
  `core + halo × 0.45` strength with the core boosted as
  `pow(halo, 3.0)`. Inner colour scaled `× (1 + core × 0.7)` so the
  centre reads HDR-lit. Point size bumped `8.0 → 11.0 × aScale` so
  the halo has room. Zero extra render targets — pure shader cost.
  Not yet applied to molecule / red-storm — keeping the trial
  scoped while we eyeball it.

- **Bloom removed entirely — not landing right after multiple attempts**
  ([[components/negentropy]]). Tried in three flavours
  (`@react-three/postprocessing`, then vanilla three.js
  `EffectComposer` + `UnrealBloomPass`, then add `OutputPass` for the
  sRGB output) — each either crashed (`WebGLRenderer: Context Lost`)
  or produced no visible glow. Stripped all bloom-related code from
  `scene.tsx`: `BloomLayer` component, all `three/examples/jsm/postprocessing/*`
  imports, the JSX usage, and the bloom-related defensive Canvas
  tweaks (`gl.alpha`, `dpr` cap, `antialias`). Canvas restored to its
  pre-bloom config: `dpr [1, 2]`, `antialias: true`, `alpha: false`,
  `onCreated setClearColor`. `@react-three/postprocessing` +
  `postprocessing` packages still in `package.json` but unused.
  Glow comes from particle-shader brightness alone now.

- **Bloom finally visible — `OutputPass` added to the composer chain**
  ([[components/negentropy]]). The earlier vanilla
  `EffectComposer` + `UnrealBloomPass` setup rendered without crashing
  but produced **no visible glow** — modern three.js (r152+) renders
  the post-processed buffer in linear colour space and needs an
  explicit `OutputPass` at the end of the chain to convert back to
  sRGB before the canvas. Added
  `c.addPass(new OutputPass())` after the `UnrealBloomPass`. Bloom
  config also tuned (in collaboration with the user): `strength 1.6`,
  `radius 0.5`, `threshold 0.01` — catches the bright cores of every
  particle and produces real glow. Pass chain is now
  `RenderPass → UnrealBloomPass → OutputPass`.

- **Bloom swapped to vanilla three.js `UnrealBloomPass`**
  ([[components/negentropy]]). `@react-three/postprocessing`'s
  `<Bloom>` kept tripping `WebGLRenderer: Context Lost` on our
  ~140 k particle scene even after softening parameters / capping
  resolution. Replaced it with a hand-rolled `BloomLayer` that uses
  three.js's built-in `EffectComposer` + `RenderPass` + `UnrealBloomPass`
  (the same pass `@react-three/drei`'s deprecated `<Effects>` wrapper
  used internally). Hooks into R3F's render loop with
  `useFrame(fn, 1)` so the composer's `.render()` runs *instead of*
  the default scene render. Bloom config: `strength 0.6`, `radius 0.5`,
  `threshold 0.2`. `setSize` follows viewport changes; `composer.dispose`
  on unmount. `@react-three/postprocessing` import is gone; the package
  itself stays in `package.json` in case we revisit.

- **Bloom re-added the docs-recommended way + DPR capped at 1.5**
  ([[components/negentropy]]). After confirming the scene works
  without bloom, brought it back via
  `@react-three/postprocessing`'s `<EffectComposer>` + `<Bloom>`
  (per `https://react-postprocessing.docs.pmnd.rs/effects/bloom`).
  Config: `intensity 1.0`, `luminanceThreshold 0.2`,
  `luminanceSmoothing 0.4`, no `mipmapBlur` (that was the
  context-loss trigger on ~140 k particles), no explicit
  `multisampling`. Canvas DPR pulled from `[1, 2]` to `[1, 1.5]`
  to give the GPU headroom for the bloom pass on top of the
  particle fields. `gl.alpha: false` kept.

- **Bloom pass disabled entirely — was crashing the scene**
  ([[components/negentropy]]). Even after softening, the
  `@react-three/postprocessing` integration kept tripping context
  loss / stale-HMR `ReferenceError: EffectComposer is not defined`
  on dense particle fields (~140 k particles across spiral +
  molecule + red storm + starfield). Removed the
  `<EffectComposer>` + `<Bloom>` JSX and the imports from
  `scene.tsx`. Canvas `gl.alpha` reverted to `false` to keep the
  loader-handover anti-flash behaviour. The deps
  (`@react-three/postprocessing`, `postprocessing`) stay installed
  for a future, more careful retry. Replacement note left inline
  in the scene tree pointing at the components catalog. Glow has
  to come from particle-shader brightness alone for now.

- **Bloom config softened to fix `WebGLRenderer: Context Lost`**
  ([[components/negentropy]]). The initial bloom config
  (`mipmapBlur` + `radius 0.85` + `intensity 1.2`) layered several
  extra render targets on top of ~140 k particles and tripped a WebGL
  context-loss on some GPUs (visible in dev log right after the
  bloom compile). Pulled back to a minimal single-pass:
  `intensity 0.9 / luminanceThreshold 0.25 / luminanceSmoothing 0.5`,
  no `mipmapBlur`, no `radius` override. Canvas `gl.alpha` flipped
  `false → true` so postprocessing has its preferred RGBA buffer to
  composite into; clearColor still pinned to `#050608` with full
  alpha so the loader-handover behaviour is unchanged.

- **Molecule drifts toward camera + thin wire-bonds + Bloom pass**
  ([[projects/negentropy/concept]], [[components/negentropy]],
  [[tech-stack]]).
  - **Molecule now drifts forward across §II/§III.** New scroll-driven
    `groupRef.current.position.z = ramp(0.22, 0.62) × 2.5` translates
    the whole cage from `z = 0` to `z = 2.5` (toward the camera) so
    the molecule visibly grows in frame as the user scrolls. Plays
    alongside the existing continuous Y-rotation, internal particle
    wobble, and assembly envelope.
  - **`TOP_ATOM` constant updated** from `(0, 1.577, 2.553)` to
    `(0, 1.577, 5.053)` to account for the forward drift. `red-storm.tsx`
    group position and `scene.tsx` `p=1.0` look-at follow suit. The
    §IV camera path was also retimed (`p=0.78` anchor moved to
    `(0, 1.0, 10) → look(0, 1.4, 4.5)`) so the dolly lands on the
    new TOP_ATOM position.
  - **Bonds slimmed to wire-thin connectors.** `BOND_PARTICLES
    200 → 60`, `BOND_TUBE_RADIUS 0.07 → 0.025`, per-particle scale
    bumped down to `0.28 + Math.random() × 0.2`. Bonds now read as
    delicate glints between the dense atom clusters instead of fat
    tubes competing with them for visual weight.
  - **Bloom post-processing pass.** New deps
    `@react-three/postprocessing@^3.0.4` + `postprocessing@^6.39.1`.
    Added `<EffectComposer multisampling={0}>` with a single
    `<Bloom intensity={1.2} luminanceThreshold={0.18}
    luminanceSmoothing={0.55} mipmapBlur radius={0.85} />` at the end
    of the scene tree. The bright (additive-blended) particle cores
    now glow softly — atoms feel hot, nebula highlights bleed, red
    storm has presence. `mipmapBlur` keeps it cheap on dense particle
    fields.

- **Molecule alive, Red Storm finally seen from outside**
  ([[components/negentropy]]).
  - **Molecule rotates again — infinite Y-tumble.** `delta × 0.18`
    on `rotation.y` plus a small `sin(t × 0.45) × 0.06` X drift.
    The cage tumbles continuously across §II/§III. (The §IV
    zoom-to-storm doesn't depend on a specific atom landing in a
    specific place — the molecule dissolves around the camera path
    and the Red Storm appears at a fixed point; the visual story
    reads as "the molecule transforms into the storm" regardless of
    where the atoms are rotated to at that moment.)
  - **Internal atom/bond motion.** New `uTime` uniform on the
    molecule's shader. Vertex shader adds a per-particle wobble keyed
    off `aScale` (phase) and `uTime`: `sin × cos × sin × 0.06` of
    `uTime + aScale × 2π`, multiplied by the per-particle assembly
    `t` so the wobble only kicks in once particles have landed. Each
    atom + bond now reads as a living cluster, not a static spray of
    dots.
  - **More particles.** `ATOM_PARTICLES 320 → 600`,
    `BOND_PARTICLES 140 → 200`. Total cage particle count
    `~5.6k → ~13.2k`.
  - **Red Storm shrunk so the camera can stay outside it.**
    `radius 4.0 → 2.5`, `uSize 32 → 38`, repulsion
    `radius 1.8 → 1.4 / strength 1.2 → 1.0`. Particle count stays at
    50 k — at the smaller radius the storm is denser, reading as a
    thick coherent mass instead of a sparse cloud.
  - **Final camera anchor pulled back.** `p=1.0` moved from
    `TOP_ATOM + (0, -0.1, 1.2)` (camera *inside* the storm) to
    `TOP_ATOM + (0, 0, 7)` — 7 units away from the storm centre, so
    the storm with radius 2.5 fills ≈ half the vertical FOV. `p=0.78`
    intermediate anchor also adjusted to lead the camera in along
    the new path.

- **Scene polish — spiral keeps spinning through fade, bonds readable,
  atom → Red Storm zoom-and-transform**
  ([[projects/negentropy/concept]], [[components/negentropy]]).
  - **Spiral network rotation now accelerates through the whole §I
    fade.** Scroll envelope changed from `ramp(0, 0.25) × 0.45` to
    `ramp(0, 0.38) × 1.4`. Rotation visibly speeds up all the way to
    `p ≈ 0.38` (the point the network fully disappears) rather than
    capping at `p=0.25` mid-section.
  - **Molecule bonds finally visible.** Particle count per bond
    `70 → 140`, tube radius `0.05 → 0.07`, bond particle scale
    `0.35–0.75 → 0.55–1.0`, **colour `#6b4ce0` violet → `#e8e3d8`
    bone-neutral** (the violet was almost invisible against the
    dark void). Atoms still amber-orange.
  - **Molecule rotation locked.** The Y-tumble was preventing
    predictable atom positions for the §IV camera-zoom. Now only a
    tiny `sin(t × 0.45) × 0.04` X jitter — alive but locked to the
    canonical icosahedron.
  - **§IV camera zooms into the top icosahedron atom.** Added a new
    camera anchor at `p=0.78` mid-zoom, plus a final anchor at
    `p=1.0` very close to `TOP_ATOM = (0, 1.577, 2.553)` (vertex
    `[0, 1, phi]` × radius 3 — top of the cage).
  - **Red Storm relocated to the top atom + scaled up to fill the
    final frame.** Position `(0, 0, 0) → (0, 1.577, 2.553)`. Radius
    `2.6 → 4.0`. Particle count `22 k → 50 k`. `uSize 26 → 32`.
    Repulsion `radius 1.4 / strength 1.0 → 1.8 / 1.2`. Fade-in
    window `ramp(0.68, 0.85) → ramp(0.72, 0.92)` so it appears as
    the molecule dissolves. Net effect: the camera zooms toward
    the top atom, the molecule dissolves around it, and a huge
    dense red mass takes over the screen — the atom **becomes**
    the storm.

- **`nebula-galaxy.tsx` renamed to `spiral-network.tsx`** for clarity.
  The visual reads as a connected two-arm spiral network, not a
  diffuse cloud — the file name now matches what's on screen.
  `NebulaGalaxy` export → `SpiralNetwork`. Internal vertex/fragment
  shader names also renamed `nebulaVertex` → `networkVertex`,
  `nebulaFragment` → `networkFragment`. No behaviour change — same
  geometry, same shader, same opacity envelope, same cursor/activity
  uniforms. `scene.tsx` import updated; old file deleted. Catalog
  note updated.

- **Molecule rebuilt — DNA helix retired, icosahedral cage with assemble-on-scroll**
  ([[projects/negentropy/concept]], [[components/negentropy]]).
  - **Helix is gone.** §II no longer renders as a double-helix
    strand — the visual was reading too specifically as DNA. New
    geometry: an **icosahedral atom cage** (12 atoms × 320 particles
    + 30 bonds × 70 particles ≈ 5.6 k particles).
  - **Bigger and brighter.** Cage radius bumped 1.4 → **3.0**, atom
    cluster radius 0.32, point-size uniform `uSize` 28 → **34**.
    Atoms render with an amber → orange core-to-rim gradient, bonds
    in violet. Reads as a chunky chemistry-textbook molecule.
  - **"Unbelievable construction effect."** Two new per-particle
    attributes (`aStartPos` random point on a sphere of radius 22,
    `aDelay` 0 – 0.6) plus a new `uAssembly` uniform. The vertex
    shader interpolates `mix(aStartPos, position, smoothstep(...))`
    so each particle waits for its `aDelay` to pass under the
    rising `uAssembly`, then flies in from far away to its final
    spot. **Atoms** assemble first (delays 0 → 0.3); **bonds**
    materialise after them (delays 0.35 → 0.65) — so the user sees
    "atoms first → bonds form between them." Particle opacity is
    driven by the same per-particle `t` (varying `vT`) so
    pre-assembled particles aren't visible cluttering the frame.
  - **Master envelope** tied to scroll progress:
    `assembly = ramp(0.22, 0.42) × (1 − ramp(0.62, 0.78))` —
    builds across §I → §II handover, holds through §II/§III,
    dissolves outward as the red storm takes over. Opacity follows
    the same envelope.
  - Cursor repulsion / activity uniforms preserved. Repel radius
    bumped 1.7 → **1.9** to keep the void proportional to the
    larger cage.
  - Group rotation: Y `delta × 0.18`, X `delta × 0.04` — a slow
    tumble that reads as molecular vibration.

- **Cursor void now fades in/out with cursor activity**
  ([[components/negentropy]]). New shared
  `CursorActivityRef = RefObject<number>` (0–1) in
  `use-scroll-progress.ts`. `MouseTracker` records `lastMoveAt` on every
  `mousemove` and each frame computes a target activity — `1` if the
  cursor has moved within the last 3 s (`idleAfterSeconds`), `0`
  otherwise — then lerps `activityRef.current` toward it at `0.06`
  per frame for a smooth ~1 s fade. Every particle scene takes a
  `uActivity` uniform and multiplies repulsion by it
  (`falloff * uRepelStrength * uActivity`), so the avoidance bubble
  smoothly **dissolves** when the user stops moving and **reforms**
  the moment they move again. Initial value is `0` — no avoidance
  until the cursor first moves.

- **Liquid-void cursor blob — invisible repulsion across every scene**
  ([[components/negentropy]]).
  - New `MouseTracker` component in `scene.tsx`: listens to window
    `mousemove`/`mouseout`, projects the 2D cursor onto the `z = 0`
    plane in scene coords via `unproject`, and lerps a damped
    `cursorRef.current` (a `THREE.Vector3` ref) toward that target
    every frame (`0.12` lerp).
  - New shared type `CursorRef = RefObject<THREE.Vector3>` in
    `use-scroll-progress.ts` — same prop-the-object pattern as
    `ScrollProgressRef`.
  - Every particle scene (`nebula-galaxy`, `molecule`, `red-storm`)
    now accepts a `cursorRef` prop, ships a `uCursor` /
    `uRepelRadius` / `uRepelStrength` uniform set, and runs a smooth
    repulsion in the vertex shader:
    ```glsl
    vec3 toParticle = modelPosition.xyz - uCursor;
    float dist = length(toParticle);
    float falloff = smoothstep(uRepelRadius, 0.0, dist);
    modelPosition.xyz += normalize(toParticle + vec3(0.0001)) * falloff * uRepelStrength;
    ```
    Result: an invisible "blob" carves a moving bubble in the
    particle field. Nothing visible rendered at the cursor — the
    void itself *is* the blob (per user follow-up clarification).
  - Per-scene tuning: nebula `radius 1.6 / strength 1.0`, molecule
    `1.7 / 1.1`, red storm `1.4 / 1.0`. Starfield is left untouched
    — far-background stars don't need to react.
  - Camera parallax (iteration earlier) is preserved — it sits on top
    of the cursor void; both react to the same cursor but to
    different ends.

- **Cursor parallax on the WebGL camera** —
  ([[components/negentropy]]). `CameraRig` now reads window
  `mousemove`/`mouseout` into a target ref, lerps a damped `mouse`
  value toward it each frame, and offsets the scroll-anchor camera
  position by `mouse.x × 0.7` / `mouse.y × 0.45`. The look-at point
  tilts the opposite way (`× -0.15` / `× -0.1`) so the parallax reads
  as a head shift, not a straight slide. Recentered when the cursor
  leaves the window. Scroll anchors and per-scene timings are
  untouched — the parallax sits *on top* of the existing composition.

- **Browser theme-color matched to brand void** —
  `siteConfig.themeColor` in `src/lib/site.ts` flipped from
  `#000000` → `#050608` (same as `--negentropy-void`). Drives the
  `<meta name="theme-color">` tag via `generateViewport`, so the
  mobile address-bar / PWA splash blends seamlessly into the page bg.

- **Root bg locked to brand void** — `html, body { background:
  var(--negentropy-void) }` in `globals.css`. Replaces the previous
  `body { background: var(--background) }` which resolved to white
  (light mode) or near-black (dark mode), and the
  `body:has(main[data-scroll-narrative])` override that only kicked in
  per-page. Now the root elements always sit on the brand void —
  belt-and-suspenders against any one-frame gap during loader → scene
  → UI hand-off revealing a wrong-colour underlayer. The `:has()` rule
  still scopes the *layout* opt-out (flex → block, height: auto, etc.)
  for scroll-narrative pages but no longer needs to set bg. Pages that
  want a different bg can override on their own root. Documented in
  [[design-system]].

- **NEGENTROPY iteration 12 — white-flash fix on loader → scene handover**
  ([[components/negentropy]]).
  - **The flicker** between the loader bg fading out and the R3F scene
    rendering its first frame was the dynamic-imported `<Canvas>`
    briefly showing the browser's default white before the first paint
    (alpha-true canvas + WebGLRenderer default clearColor).
  - **Triple defence:**
    1. Wrapper `<div>` around `<Canvas>` now wears
       `bg-negentropy-void` — even if the canvas were transparent
       for a frame, the layer behind it is the brand void.
    2. `gl.alpha: true → false` so the canvas itself is opaque from
       creation, no compositing through the canvas alpha channel.
    3. `onCreated={({ gl }) => gl.setClearColor("#050608", 1)}` so the
       WebGLRenderer's first `gl.clear()` call already uses the dark
       brand colour, not the default white.
  - No visual change once the scene is running — purely a fix for the
    sub-second flash during dynamic-import warm-up.

- **NEGENTROPY iteration 11 — loader → scene → UI hand-off retimed**
  ([[projects/negentropy/concept]], [[components/negentropy]]).
  - **Loader timing tightened.**
    `contentRevealDelayMs` 167 → **0** (loader bg fade starts the
    instant the last sentence finishes exiting). `bgFadeMs`
    3000 → **1500** (fade now completes in 1.5 s rather than 3 s).
  - **Three-phase hand-off introduced.** `NegentropyClient`'s phase
    enum becomes `"loading" | "scene-revealed" | "ui-revealed"`:
    - `scene-revealed` fires from the loader's `onReveal` at **t=0**
      (right when the last sentence is gone). Only the R3F `Scene`
      mounts so the nebula appears *through* the fading loader bg.
      UI chrome stays unmounted.
    - `ui-revealed` fires from the loader's `onComplete` at **t=1.5 s**
      (when the bg fade lands). Frame, BrandMark, NavJumplinks, and
      the section content all mount — each runs its own Inview/Spring
      intro on mount. Loader unmounts at the same moment.
  - **Old contentFade opacity spring removed.** The `<animated.div>`
    wrapper that wrapped everything in a 700 ms opacity fade is gone —
    individual UI elements handle their own intros, and the loader's
    bg fade already carries the global visual reveal of the nebula.

- **NEGENTROPY iteration 10 — nebula hero, red storm closes, hourglass retired**
  ([[projects/negentropy/concept]], [[components/negentropy]]).
  - **Scene order rewired.** Final sequence is now:
    **Nebula (§I, immersive close-up) → Molecule (§II/§III) → Red
    Storm (§IV/§V, last)**. The hourglass is **no longer rendered**
    by `scene.tsx` (component file kept for reference; can be wired
    back in later if needed).
  - **Nebula reveals on load — single window, no scroll required.**
    Reverted the v0.9 double-peak envelope (`Math.max(hero, closing)`).
    Opacity is now `1 − ramp(0.22, 0.38)` — **fully present at
    `p === 0`** (the visible reveal comes from the loader's 3 s
    z-50 background fade-out, which uncovers the scene at full
    opacity), recedes for the molecule. A Y-rotation on the nebula's
    group accelerates with scroll progress
    (`baseSpin 0.08 + ramp(0.0, 0.25) × 0.45`) so the user sees it
    visibly turning as they scroll out of §I. (The earlier
    `ramp(0.0, 0.06)` in-ramp was dropped — at exact `p=0` it
    produced opacity 0, which made the hero feel empty for the first
    moment.)
  - **Camera rebuilt for immersion.** Anchors are now
    `(0,2.5,5)→(0,2.5,0)` → `(3,2,6.5)→(0,2,0)` → `(0,0,9)→(0,0,0)` →
    `(0,0,8.5)→(0,0,0)` → `(0,0,7.5)→(0,0,0)`. Default camera in
    `<Canvas>` matches the first anchor so there's no jump on mount.
    FOV 60 → **70** for a wider, more immersive hero feel.
  - **Molecule opacity window shifted later** to
    `ramp(0.28, 0.42) × (1 − ramp(0.62, 0.78))` — now §II/§III.
  - **Red Storm is the last object** — `ramp(0.68, 0.85)` in, **no
    fade-out**. Owns the closing.

- **NEGENTROPY iteration 9 — nebula doubled into hero atmosphere**
  ([[projects/negentropy/concept]], [[components/negentropy]]).
  - **Nebula now reveals on load and sits behind the §I hourglass** as
    an atmospheric layer. Same component, no new instance — its
    opacity envelope was rewritten to two peaks using
    `Math.max(heroEnvelope, closingEnvelope)`:
    - `reveal = ramp(0, 0.08)` — initial reveal-on-load fade.
    - `heroEnvelope = 1 − ramp(0.18, 0.32)` — full presence during §I,
      recedes as the molecule (§II) takes over.
    - `closingEnvelope = ramp(0.55, 0.78)` — fades back in for §IV–§V.
    - End dim `(1 − 0.2 × ramp(0.95, 1.0))` unchanged.
    Hourglass timing in §I unchanged — nebula sits **behind** it as
    depth, not replacing it.

- **NEGENTROPY iteration 8 — scene re-order + DNA helix + red storm + title fix**
  ([[projects/negentropy/concept]], [[components/negentropy]]).
  - **Hero scene swap.** Hourglass moves to §I (the hero). Its opacity
    ramp is now `ramp(0.0, 0.06) * (1 − ramp(0.16, 0.28))` — full on
    page entry, fades out as the molecule takes over for §II.
  - **Cell Core replaced with a DNA-helix Molecule.** New
    `views/negentropy/molecule.tsx`: two helical particle strands
    (amber + violet) wrapping a central axis with **rungs in bone**
    between them. Two-and-a-half turns over ~6 units of height,
    radius 1.4. Geometry has ~5.6k particles (1.6k × 2 strands + 56
    rungs × 60 particles). Slow vertical rotation. Opacity ramp
    `ramp(0.18, 0.28) * (1 − ramp(0.4, 0.5))` — §II window. Replaces
    the v0.7 cell-core sphere; `cell-core.tsx` deleted.
  - **New `RedStorm` for §III.** New `views/negentropy/red-storm.tsx`:
    a denser ~22k-particle red mass (deep-red core → hot-red →
    ember-orange shell) that **wobbles** in/out via a per-particle
    sine keyed by `aNoise` and `aRadialPush`, plus a slow group
    rotation around X + Y. The "body in crisis" beat — refusing to
    settle into entropy. Opacity ramp
    `ramp(0.42, 0.52) * (1 − ramp(0.6, 0.72))` — §III window.
  - **Nebula now closes the page** (§IV–§V). Opacity ramp updated to
    `ramp(0.62, 0.78) * (1 − 0.2 × ramp(0.95, 1.0))`.
  - **New camera anchors** for the new scene order:
    `(0,0,17)→(0,0,0)` → `(0,0,11)→(0,0,0)` → `(0,0,9)→(0,0,0)` →
    `(0,1.5,10)→(0,2.2,0)` → `(0,2.5,8)→(0,2.5,0)`. Hero opens dead-
    on and far enough to see the full hourglass; molecule + red
    storm both have intimate close-up shots; nebula gets the lift
    for the closing beats.
  - **HeadlineLines rewritten on top of the engine's `Spring`
    component, one per letter.** The previous custom
    `useSprings` + `useEffect` path appeared to occasionally settle
    letters back toward `from` in dev (the user-reported "title
    disappears after appearing" bug). `Spring mode="once"` has
    deterministic behaviour — plays once on mount via
    `useSpring({ to: active ? to : from })` where `active` is
    pinned to `true` for `once`. Same per-letter API: line gap +
    stagger + italic + accent.

- **NEGENTROPY iteration 7 — Inview ref-wiring fixed + bottom-left meta**
  ([[projects/negentropy/concept]], [[components/negentropy]],
  [[decisions-log]] ADR-0014).
  - **Inview was silently broken everywhere.**
    `components/animation/springs/in-view.tsx` was writing
    `inViewRef.current = node` to the *attach callback* returned by
    `useDynamicInView`, not to a RefObject. Result: the
    IntersectionObserver never received the element, `inView` stayed
    `false`, the spring never reached `to`, and every `Inview` consumer
    rendered invisibly at `opacity: 0`. This silently broke the
    NEGENTROPY **frame border, nav jumplinks, brand-mark badge, hero
    meta cluster, biomarker grid, and choice CTA** — the user-visible
    "I can't see the UI in the top-right / bottom-left" complaint.
    Patched both `ref={(node) => …}` callbacks to call
    `inViewRef(node)` instead. Authorized fix per
    [[decisions-log]] ADR-0014 (animation engine is `#do-not-modify`
    by default).
  - **Bottom-left meta tag added.** The hero's bottom-left column was
    just the headline; the user expected a corner-meta element. Added
    a small `[ ENTROPY × 1%/YR ]` badge below the headline with a
    leading hairline, animating in via `Inview` (now working).

- **NEGENTROPY iteration 6 — hourglass timing rolled back + hero meta cleanup**
  ([[projects/negentropy/concept]], [[components/negentropy]]).
  - **Restored the §II hourglass.** Iteration 5 pushed the hourglass
    opacity ramp to `ramp(0.55, 0.78)` — that meant §II ("One percent
    lost each year after thirty") played with **no hourglass behind it**
    because the cell rupture window had moved too late. Rolled back to
    `ramp(p, 0.15, 0.3) * (1 - ramp(p, 0.62, 0.8))` so the hourglass
    fades up across the §I → §II handover, holds through §II + §III,
    and fades out across §IV as the nebula takes over.
  - **Cell Core dispersion realigned** to the new window — opacity
    `1 - ramp(0.15, 0.3)`, `uDispersion` `ramp(0.15, 0.3)`,
    `uPulse` `1 - ramp(0.13, 0.25)`. The cell ruptures right as the
    hourglass fades in, so the transition reads as cell → hourglass
    instead of cell → empty → hourglass.
  - **Extra camera anchor** at `p=0.25` (`(2, 7, 13) → (0, 4.5, 0)`) so
    the §I → §II camera ride lerps smoothly through the rupture moment
    rather than jumping from cell-face to wide-orbit in one beat.
  - **Removed duplicate `[ SEC.001 — THE VOID ]`** that was rendered
    both in the hero's top-left absolute slot and in the bottom-right
    meta cluster. Only the bottom-right one survives.
  - **Frame border made readable.** `inset-5 border-bone/25` →
    `inset-4 border-bone/40`. The contrast carrier was too dim to
    register as intentional UI.

- **NEGENTROPY iteration 5 — hero redesign + chrome + cell core**
  ([[projects/negentropy/concept]], [[components/negentropy]]).
  - **Section §I is now a real hero.** Replaces the generic centered
    Section. Corner-loaded grid inspired by an IRIS_AI reference:
    huge bottom-left headline (*EVERY CELL / **is** FALLING / APART.*
    with italic `is`), a bottom-right meta cluster — `( I )` badge,
    `[ SEC.001 — THE VOID ]`, body copy, **BEGIN SCROLL** pill — and a
    bottom-center scroll-down arrow over a faint vertical guide. New
    leaf components `views/negentropy/hero.tsx` +
    `views/negentropy/headline-lines.tsx` (the latter a custom
    `useSprings` letter animator with italic + accent-word support —
    same family as `BeatLetters` in the loader, since `mode="manual"`
    is banned).
  - **Cell Core — the missing centerpiece.** New
    `views/negentropy/cell-core.tsx`: dense ~32k-particle sphere at
    `y=5`, amber-core → violet-rim, slow rotation, scroll-driven
    `uPulse` and `uDispersion` uniforms. From `p≈0.45` it ruptures —
    particles fly outward along pre-baked radial directions biased
    upward — handing the stage to the hourglass galaxy that fades in
    over the same window (`ramp(0.55, 0.78)`). This is the §I → §II
    transition Bryan would actually retweet.
  - **Camera rewired for the cell.** §I anchor moved from
    `(4, 12, 14) → look(0, 4, 0)` (high oblique) to
    `(0, 5, 9) → look(0, 5, 0)` (face-on with the cell). Subsequent
    anchors at p ≈ 0.5 / 0.8 / 1.0 unchanged.
  - **Frame border + nav-jumplinks chrome.** New `frame.tsx` —
    1px rounded rectangle inset 20–32 px from the viewport, in
    `bone/25` — the "contrast carrier" from the reference. New
    `nav-jumplinks.tsx` — fixed top-right stack of five `↗` jumplinks
    (`#void / #entropy / #refusal / #universe / #choice`), each a
    real anchor so Lenis handles the smooth scroll.
  - **Brand mark restyled** to
    `( NEGENTROPY )` + `[ DON'T DIE ]` matching the corner-label
    vocabulary; tagline dropped.
  - **Unbounded purged from the page.** Body of `main[data-scroll-
    narrative]` set to `font-system`, every component drops the
    `font-display` class. The Google `Unbounded` font is still loaded
    in `layout.tsx` (could be removed; left for any future page).
    Documented in [[design-system]].
  - **Section eyebrow toned down** — old amber-tint `text-[0.78rem]
    tracking-[0.32em] amber-soft/80` → `bone-muted` to match the new
    cooler palette and the loader's restrained UI tone.
  - **Hourglass ramp pushed later** — opacity `ramp(0.04→0.18) → ramp
    (0.55→0.78)`, fade-out `(0.6→0.78) → (0.82→0.95)`. Hourglass no
    longer competes with the cell during §I.
  - **Data shape updated**. `negentropy.ts` adds `nav: NavItem[]`,
    `brand.badge`, and a new richer `HeroSectionContent` for `void`
    (`index`, `meta`, `headlineLines`, `italicWord`, `body`, `cta`).
    Other sections unchanged.

- **NEGENTROPY iteration 4 — loader tightened**
  ([[projects/negentropy/concept]], [[components/negentropy]]).
  - **Loader beats trimmed from 5 → 3** in
    `src/data/mocks/negentropy.ts`. Kept the first, second, and final
    lines — *"Every cell is falling apart." / "Until one refused." /
    "Don't die."* — drops the methodology and thesis middle beats to
    halve the loader runtime.
  - **Loader text doubled in size** —
    `clamp(0.8rem, 1.05vw, 0.95rem)` → `clamp(1.6rem, 2.1vw, 1.9rem)`.
    Still system stack (Helvetica Neue) but now reads as a real
    manifesto line rather than a UI label.
  - **`contentRevealDelayMs` cut 1000 → 333 → 167**. The post-last-beat
    silent breath is now barely there; the page begins materialising
    almost immediately after *"Don't die."* finishes its slide-out.
    `bgFadeMs` (3 s background fade) unchanged.

- **NEGENTROPY iteration 3 — loader orchestration + content gating**
  ([[projects/negentropy/concept]], [[components/negentropy]]).
  - **Skipped-beats bug fixed.** `BeatLetters` used a parallel
    `api.start({...onRest})` whose `onRest` fired once per letter — the
    parent's `setBeatIdx(idx => idx + 1)` advanced multiple times per
    beat, skipping sentences and short-circuiting straight to the canvas
    fade. Now guarded with a `hasFired` boolean inside the effect so
    `onExitComplete` runs exactly once per beat. Every sentence now plays
    through its full in/hold/out cycle.
  - **Loader → page handover is now a three-phase sequence.** Loader
    exposes `onReveal` (page-content cue) and `onComplete` (loader-can-
    unmount cue). After the last beat's exit lands, the loader holds
    silent for `contentRevealDelayMs` (default 1000 ms), then fires
    `onReveal` and starts a 3 s `bgFadeMs` opacity fade to 0 in parallel.
    On the fade's `onRest`, `onComplete` fires and the loader unmounts.
  - **Page content gated behind a phase state in `NegentropyClient`**
    (`"loading" | "revealing" | "revealed"`). During `loading` the brand
    mark, R3F scene, and sections are **not mounted at all** — their
    `mode="once"` TextEngine entrances and the WebGL canvas don't fire
    behind the loader. On `revealing` they mount under a 700 ms opacity
    spring (`easeOutQuart`) so they materialize through the dimming
    loader. On `revealed` the loader unmounts.
  - **Beat-letters output suppressed during fade.** Once the loader
    enters its fade phase, the `BeatLetters` slot renders `null` so the
    last sentence's resting state doesn't sit ghosting under the fade.
  - **Loader container bg + persistent body bg.** Loader root now wears
    `bg-negentropy-void` so the canvas (which is progressively erased to
    transparency by `destination-out`) shows a brand-correct colour
    underneath instead of whatever sits behind it. The
    `body:has(main[data-scroll-narrative])` rule in `globals.css` also
    locks the body bg to `var(--negentropy-void)` so the page colour is
    constant across `loading → revealing → revealed`. No flash through
    the global `--background` token at hand-off. Canvas initial fill
    also bumped from `#000` to `#050608` to match.

- **NEGENTROPY iteration 2 — loader trail / loader text rewrite**
  ([[projects/negentropy/concept]], [[components/negentropy]]).
  - **Loader trail no longer leaves a gray haze.** Flow field's per-frame
    erase switched from a low-alpha black `source-over` overlay (which
    accumulated semi-opaque rectangles into a gray underlayer) to a pure
    `destination-out` erase at alpha `0.055`. Background now stays true
    black regardless of how long the loader runs.
  - **Loader text rebuilt without TextEngine.** TextEngine cannot fire a
    programmatic exit without `mode="manual"` (banned). New `BeatLetters`
    leaf component uses `useSprings` over the letter array with a
    `key={beatIdx}` remount per beat. Cadence per beat:
    1. letters slide in from `x: 1rem → 0` with `letterStaggerMs` (28 ms)
       delay between siblings, opacity 0 → 1, `easeOutQuart`.
    2. hold (~360 ms).
    3. every letter — *no stagger* — slides further left to `x: -2.25rem`
       and fades to 0 over `exitMs` (460 ms, `easeInQuart`).
    4. on the last letter's `onRest`, parent advances `beatIdx`; the new
       beat mounts fresh and the cascade replays. Last beat triggers the
       outer canvas fade.
    All motion is strictly right → left.
  - **System face for loader text.** New `--font-system` token in
    `globals.css` (`-apple-system, "Helvetica Neue", Helvetica, system-ui,
    Arial, sans-serif`). Loader renders at
    `clamp(0.8rem, 1.05vw, 0.95rem)` for the small-label feel the brief
    asked for. Documented in [[design-system]].

- **NEGENTROPY iteration — route move, display font, loader cadence rebuild**
  ([[projects/negentropy/concept]], [[components/negentropy]]).
  - **Route now lives at `/`** — `src/app/page.tsx` renders `NegentropyView`;
    the previous `src/app/negentropy/` folder is removed. The original spring
    demo (`views/home*.tsx`) stays as reference files but is no longer
    wired to any route.
  - **Display typeface** — `Unbounded` from `next/font/google` added in
    `src/app/layout.tsx`, bound to `--font-unbounded` and exposed as
    `--font-display` in `globals.css` `@theme inline`. Applied via Tailwind
    `font-display` utility on: brand-mark `<h1>`, section `<h2>` headings,
    biomarker numerals, loader beats. Body copy / eyebrows / labels stay
    on Onest. Reasoning: a sharper, geometric, slightly-sci-fi voice for
    the manifesto headings — fits the "immortality / high-tech" brief.
  - **Loader text cadence rewritten.** Per-beat sequence now:
    letters slide in from a small right offset (`x: 0.75rem → 0`) with
    `letterStagger` 22 ms + extra `wordStagger` 55 ms between words; the
    sentence holds (~320 ms); the *whole* sentence then slides out to the
    left and fades via a wrapper `useSpring` (`translate3d(-72px,0,0)` +
    `opacity: 0`, 440 ms `easeInQuart`); on `onRest` the next beat mounts
    via `key` and the cycle repeats. Final beat triggers the outer canvas
    fade. No `mode="manual"` — TextEngine stays `mode="once"` per project
    hard rule.
  - **Loader flow field — bigger features, stronger trails.** Spatial
    frequencies dropped (FX 0.0042 → 0.0028, FY 0.0051 → 0.0034) so the
    curl features feel zoomed-in; step size 1.6 → 2.4 for longer per-frame
    arcs; trail-fade alpha 0.085 → 0.028 for the long sweeping trails seen
    in the green-shader reference; line width 1 → 1.15; line opacity 0.55
    → 0.6.

- **NEGENTROPY page built — first WebGL scroll narrative on the starter**
  ([[projects/negentropy/concept]]). Live at `/negentropy`. Five-section
  scroll arc — Void → Entropy → Refusal → Universe → Choice — fronted by a
  sticky R3F canvas with a particle hourglass that visibly reverses across
  Section 3 and dissolves into a nebula in Section 4. Loader is a full-bleed
  Canvas2D flow field with five animated text beats. Brand mark, biomarker
  grid (Bryan Johnson's Blueprint numbers — 1,977 / -5.1 yrs / 99th pct),
  CTA to `blueprint.bryanjohnson.com`.
  - **New deps** in [[tech-stack]]: `three@^0.184`,
    `@react-three/fiber@^9.6`, `@react-three/drei@^10.7`. `@types/three`
    devDep. `@react-spring/three` was tried and **removed** — it broadens
    the spring `ElementType` union and breaks the existing
    `animated-var-text-tag.tsx` JSX type inference. Rationale & full policy
    in [[decisions-log]] ADR-0013.
  - **Files added** under `src/views/negentropy/` —
    `negentropy-client.tsx`, `scene.tsx`, `hourglass-galaxy.tsx`,
    `nebula-galaxy.tsx`, `starfield.tsx`, `loader-flow-field.tsx`,
    `brand-mark.tsx`, `section.tsx`, `biomarker-grid.tsx`, `choice-cta.tsx`,
    `use-scroll-progress.ts`. Mock content at
    `src/data/mocks/negentropy.ts`. Route shell at
    `src/app/negentropy/page.tsx` delegating to `src/views/negentropy.tsx`.
  - **`globals.css` additions** — NEGENTROPY palette tokens
    (`--negentropy-void`, `-amber`, `-violet`, `-bone`, etc.) and a
    `body:has(main[data-scroll-narrative])` opt-out so multi-screen
    pages bypass the centered-shell body rules used by [[home view]].
  - **Scroll → uniform pattern** — `<ProgressTrigger>` writes to a
    `useRef<number>` on the client wrapper; R3F components receive the ref
    *object* and read `.current` only inside `useFrame`. No re-renders per
    scroll tick. See ADR-0013.
  - **Known pre-existing blocker for `yarn build`** — `#do-not-modify`
    files `animation/springs/animated-var-text-tag.tsx` and
    `animation/springs/in-view.tsx` have React-19-era ref/JSX-typing
    issues that surface during a full TypeScript build. Lint (`yarn lint`)
    is clean and the dev server compiles and serves the page cleanly. Fix
    needs explicit sign-off (animation engine is protected by ADR-0009).
  - Catalog updates: see [[components/negentropy]] (new catalog note).

- **NEGENTROPY concept doc added** — new `obsidian/projects/negentropy/`
  folder holds the concept brief for the first marketing project on this
  starter: a particle-driven, scroll-through-the-universe site framed as a
  tribute to Bryan Johnson's longevity research. Five scroll sections + a
  loader (green curl-flow shader → starfield), hourglass particle figure as
  protagonist, hourglass-reversal motif in Section 3. Brand name
  **NEGENTROPY** (scientific term for life's resistance to entropy) with
  tagline *"The science of refusing to fall apart."* Open decisions logged
  in the doc: loader palette, real-vs-poetic biomarker numbers, outreach
  copy. Indexed under a new *05 — Projects* section in
  [[README|the vault MoC]]. Reference screenshots referenced from
  `projects/negentropy/assets/` (need to be re-dropped — macOS cleaned the
  source temp files).

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
