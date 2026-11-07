---
tags: [meta, decision]
updated: 2026-07-10
---

# Decisions Log (ADRs)

Architecture Decision Records. Each entry captures a choice, its context, and its
consequences. Use [[templates/adr-note]] for new entries. Newest first.

---

## ADR-0017 — Hero responsiveness rework: fluid desktop fill + polish

- **Status:** Accepted
- **Date:** 2026-07-11

**Context.** Several responsiveness problems surfaced in the hero (ADR-0016):
1. **Desktop letterbox.** The desktop hero was a fixed 90rem × 50rem (1.8-aspect)
   stage centred in the viewport with `StageFit` compressing its height
   (ADR-0008). On laptops taller than 1.8 (16:10 — most MacBooks) it left **large
   top/bottom gaps** — it could not fill the screen. Scaling the fixed frame up to
   fill would crop the nav/CTA (content touches all four edges); stretching would
   distort — neither is acceptable.
2. Resizing across the 1024px breakpoint replayed the whole 3s preloader intro
   (looked like a page reload).
3. The preloader counter rode off the panel top at 100% instead of resolving.
4. `HeroModel` ran its rAF loop unconditionally (hidden tab / off-screen).
5. The mobile/tablet headline overran narrow phones and, mid-fix, lost its word
   spacing (see the `columnGap` note below); on tablets it was oversized.

**Decision.**
- **Desktop is now fluid vertically, not a fixed scaled frame.** Only the
  *horizontal* metrics track the Figma 1440 frame (`1rem` = viewport width / 90,
  so the stage fills the width). The stage height is `100dvh` and its contents are
  **anchored to the viewport edges**: nav pinned top, CTA + social proof pinned
  bottom, headline centred, media panel `inset-y` (full height). The hero fills any
  viewport aspect edge-to-edge — no letterbox gaps, no crop, no distortion, no
  scroll. This **supersedes the vertical half of ADR-0008**: `StageFit` and the
  `--stage-scale-y` transform are removed (`stage-fit.tsx` deleted). The stat cards
  and the preloader curtain are re-anchored to the panel bottom / expressed as a
  percentage of the now-fluid panel so they track its height.
- **Play the intro once per session.** Both preloaders initialise `gone` from the
  module-level `usePreloader.getState().isRevealed` (ADR-0015) and short-circuit,
  so a breakpoint-crossing remount never replays the curtain.
- **Counter fades in place.** Position clamps at 90%, opacity eases 1→0 over
  90→100% (`counterFade`), combined with the collapse fade via `to([...])`.
- **Gate the render loop.** `HeroModel` starts/stops its rAF via `visibilitychange`
  + an `IntersectionObserver`; the clock idle gap is dropped on resume.
- **Mobile/tablet headline.** `clamp(1.5rem, 5vw, 2rem)` — fits two rows down to
  320px and caps sensibly (~40px) on large tablets. **`columnGap` is the word gap
  (em), not letter tracking** — it must stay ≈ the default (0.15); shrinking it
  collapses the spaces between words. The stacked layout centres in a
  `max-w-[42rem]` column (media panel `sm:max-w-[34rem]`).
- **Spring-based hovers.** CTA / Contact / nav-link hovers use the vendored
  `<Hover>` (never CSS transitions, per ADR-0002); a positioning transform stays on
  a static wrapper so the hover transform can't fight it.

**Consequences.** The desktop hero fills every screen (verified 1280×800 → 1920×1080
and 16:10/16:9), so the fixed-aspect letterbox is gone; the trade-off is that the
vertical rhythm now stretches with the viewport rather than being pixel-locked to the
Figma frame — an intentional move toward standard responsive behaviour. `StageFit` is
gone; keep `grid.config.ts` and the width-side of ADR-0008 in sync. The intro plays
once, the 3D scene idles when unseen, and the loader resolves cleanly.

---

## ADR-0016 — Responsive hero: desktop stage vs stacked mobile

- **Status:** Accepted
- **Date:** 2026-07-10

**Context.** The hero is a fixed 90rem × 50rem stage scaled to a single screen
(ADR-0008) — right for desktop, but below ~1024px it becomes an unusable,
letterboxed miniature. Mobile wants a different shape: headline on top, media
panel below, on a normal scrollable page, with the nav as a burger.

**Decision.** Split the hero by viewport rather than bending one layout.
- `Hero` (`hero.tsx`) is a thin **client switcher**: `useWindowWidth() < 1024`
  (`MOBILE_MAX`) → `<HeroMobile>`, else `<HeroDesktop>`. `useWindowWidth` (built
  on `useSyncExternalStore`) reports 0 on the server and during hydration, so both
  SSR and the hydration render pick **desktop**; the switch to mobile happens only
  after the real width is known — no hydration mismatch. The `width > 0` guard
  keeps the pre-measurement state on desktop (one `<h1>`, SEO-friendly). The brief
  desktop-shell → mobile remount on phones is hidden behind the preloader.
- `HeroDesktop` = the previous fixed-stage layout, unchanged.
- `HeroMobile` = a flowing, scrollable stack (nav → headline block → media panel)
  reusing the same reveals, gating (ADR-0015), `HeroModel`, video and content
  data. The nav is a burger dropdown (`hero-mobile-nav.tsx`); the preloader is a
  full-screen curtain variant (`hero-mobile-preloader.tsx`).
- Below 1024px, `globals.css` drops the 1440 vw grid for a conventional
  `clamp(14px, 4.2vw, 20px)` root font-size and turns `body` back into a
  scrollable block; the desktop single-screen rules (fixed stage, StageFit,
  `overflow: hidden`) apply only ≥1024px.

**Consequences.** Desktop and mobile each get a purpose-built layout without one
compromising the other. Cost: two layouts to maintain, and a one-time desktop-shell
render before the mobile switch on phones. The breakpoint is one constant
(`MOBILE_MAX = 1024`) mirrored by the `max-width: 1023px` CSS media queries — keep
them in sync.

---

## ADR-0015 — Intro preloader and preloader-gated reveals

- **Status:** Accepted
- **Date:** 2026-07-10

**Context.** The hero should open with a loading intro — a rising percentage
counter plus a gradient curtain over the media panel — and only *then* play its
entrance animations, in sync with the curtain lifting. The reveals already
existed (`<Spring>` + `spring-text-engine`, `mode="once"`) but played on mount,
i.e. **during** the preloader, invisibly — finishing before the intro did.

**Decision.** Gate every hero reveal behind a Zustand flag `isRevealed`
(`src/views/home/preloader-store.ts`), flipped once by the preloader when it
completes.
- **Spring reveals** go through a `<Reveal>` wrapper (`reveal.tsx`) that reads the
  store and passes `enabled={isRevealed}` to `<Spring>`. A disabled `<Spring>`
  holds its `from` (hidden) state, then animates when `enabled` flips true —
  `delayIn` still staggers. Used for nav / badge / CTA / social-proof / panel /
  stat cards / avatars.
- **The preloader** (`hero-preloader.tsx`) drives its **phases** with `setTimeout`
  (reliable wall-clock) and its **visuals** (counter %, curtain height/collapse)
  with react-spring. Timer-driven phases avoid depending on react-spring's
  `onRest` (which also fires on React StrictMode's dev-unmount cancellation) and
  keep the reveal moment exact.
- **TextEngine text** (heading / body / overline) can't be hidden via `enabled` —
  that prop shows the *end* state, not the hidden one. So those render as plain
  `opacity: 0` text (in the DOM for SEO + to reserve layout) until `isRevealed`,
  then mount the animated TextEngine, which plays its once-entrance on mount.

**Consequences.** Every reveal fires together the instant the curtain lifts. The
preloader adds ~3 s to first paint **by design**. The reveal gate is a clean seam
for any future "play on X" trigger. Dev note: the project's headless preview does
**not** honour react-spring's frame clock or `setTimeout` reliably, so animations
look instant there — they play correctly in a real browser (verified by holding
the preloader open with a long duration and screenshotting).

---

## ADR-0014 — 3D via plain three.js (not react-three-fiber)

- **Status:** Accepted
- **Date:** 2026-07-10

**Context.** The home hero (Figma "Ternyon", node 610:557) needs a live 3D
element on the right panel: a chrome-material model (`public/assets/hands.glb`,
Draco-compressed) with a star that spins on its vertical axis and a whole-model
tilt that follows the cursor. The obvious tool is `@react-three/fiber` (+
`@react-three/drei`). It was installed and a working declarative version built —
but `yarn build` then failed to type-check **in the vendored spring engine**:

```
src/components/animation/springs/*.tsx — This JSX tag's 'children' prop
expects type 'never' … (animated[tag] as ElementType)
```

Root cause: `@react-three/fiber` **globally augments** `React.JSX.IntrinsicElements`
with three's elements (`<mesh>`, `<primitive>`, …). Those elements have
restrictive `children`, so the union that `ElementType` resolves to now
intersects `children` down to `never`. The engine renders `animated[tag] as
ElementType` (`animated-var-text-tag.tsx`, `hover.tsx`, `spring.tsx`,
`spring-trigger.tsx`, `progress-trigger.tsx`) — a pattern that is only valid
while `ElementType` stays HTML-only. The engine is `#do-not-modify` (ADR-0002/0009),
so the cast can't be changed, and the conflict is purely a compile-time artifact
(runtime is unaffected). Confirmed by stubbing the model: with no fiber import in
the graph, the build passes.

**Decision.** Render the 3D with **plain three.js** in a `"use client"` leaf
(`src/views/home/hero-model.tsx`) — no react-three-fiber, no drei. `@react-three/fiber`
and `@react-three/drei` were uninstalled. The component:
- Loads the GLB with `GLTFLoader` + `DRACOLoader` (decoder self-hosted at
  `public/draco/`, copied from `three/examples/jsm/libs/draco/` — offline, no CDN).
- Re-materialises every mesh as chrome (`MeshStandardMaterial`, `metalness: 1`,
  low `roughness`) lit by an env map baked from `RoomEnvironment` via
  `PMREMGenerator` — offline studio reflections, no external HDR.
- Finds the `Curve` mesh (the star), recenters its geometry onto its centroid so
  it spins in place, and drives one imperative `requestAnimationFrame` loop for
  the star spin + eased cursor tilt. Cleans up fully on unmount.

**Consequences.** The app's JSX types stay HTML-only, so the spring engine
type-checks and `yarn build` / `yarn lint` are clean — with **zero** engine
edits. Dependency surface is smaller (`three` only; fiber/drei dropped). The
in-canvas rAF loop is **not** a violation of the spring-only rule (ADR-0002),
which governs **DOM** motion — WebGL has no spring/CSS equivalent and renders on
its own loop. Trade-off: the scene is imperative three.js rather than declarative
JSX; if a future feature needs many R3F components, revisit isolating fiber's
types (e.g. a separate tsconfig project) in a new ADR.

---

## ADR-0013 — `<Inview>` self-observe fix; spring components honour resize

- **Status:** Accepted
- **Date:** 2026-06-07

**Context.** `<Inview>` only animated when an external `trigger` ref was passed.
Without one it never revealed. Root cause: `useDynamicInView` returns its target
attachment as a **callback ref** (`setNode`) in the first tuple slot, but
`in-view.tsx` destructured it as `inViewRef` and wrote `inViewRef.current = node`
in the JSX `ref` callback — assigning `.current` to a function instead of calling
it. `setNode` never ran, the observed `node` stayed `null`, and with no `trigger`
the observer had nothing to watch (`trigger?.current ?? node` → `null`). With a
`trigger` it worked only because `trigger.current` bypassed the dead `node` path.
TypeScript flagged this at build time (`Property 'current' does not exist on type
'TargetRefCallback'`), so the build was already failing.

Separately, `<Inview>`, `<Spring>`, and `<Hover>` tracked `width`
(`useWindowWidth()`) as a `useMemo`/`useEffect` dependency to re-evaluate mobile
gating on resize, but never passed it to `isMobileDisabled()` — so the value was
genuinely unused (ESLint `react-hooks/exhaustive-deps` warning) **and** resize
re-evaluation silently did nothing; the check always read `window.innerWidth` at
call time.

**Decision.** This is the second authorized edit to the `#do-not-modify` engine
(after ADR-0009). Two corrections:
1. In `in-view.tsx`, call the callback ref — `setInViewNode(node)` — instead of
   assigning `.current`, so the component observes itself when no `trigger` is
   given.
2. Pass the React-tracked `width` into every `isMobileDisabled(value, width)`
   call across `in-view.tsx`, `spring.tsx`, and `hover.tsx`. This is the
   documented second parameter of `isMobileDisabled` and makes the `width`
   dependency meaningful, fixing resize re-evaluation and clearing the lint
   warnings.

**Consequences.** `<Inview>` now works standalone (the common case). `yarn build`
and `yarn lint` are both clean (0 errors, 0 warnings). The springs folder remains
`#do-not-modify` by default — these were explicitly signed-off bug fixes.

---

## ADR-0012 — Styling lives in utilities and components, not `globals.css`

- **Status:** Accepted
- **Date:** 2026-05-22

**Context.** ADR-0004 made design tokens the styling currency and ruled that
"new values must be added to `globals.css` first." Combined with the
design-system guidance to *"extract repeated multi-class patterns to
`@layer components`"*, the path of least resistance for any repeated visual
pattern became a named class in `globals.css`. On an animation-heavy,
multi-section marketing site that grows the file without bound — a single
global stylesheet accumulating hundreds of component-specific classes that are
never deleted when their component is. The fix is a placement rule, not a
file-splitting trick: splitting `globals.css` into many files only spreads the
same bloat.

**Decision.** Styling follows a strict placement order; `globals.css` stays
bounded by design.

- One-off styling → **Tailwind utilities** in `className`. Nothing enters CSS.
- A repeated pattern with markup/structure/props → a **React component**
  (`components/ui/`), *not* a CSS class. This is the default answer to "this
  looks repeated" — e.g. an eyebrow label with a `::before` dot is an
  `<Eyebrow>` component, not a `.label-eyebrow` class.
- A repeated pure-utility combo with no structure → a Tailwind v4 `@utility`.
- `@layer components` is reserved **strictly** for what utilities and
  components genuinely cannot express: pseudo-elements (`::before`/`::after`),
  third-party DOM overrides (`!important` on library markup), complex
  descendant/state selectors.
- `globals.css` only ever holds: `@import`, tokens (`:root` + `@theme`), base
  element resets (`@layer base`), and the narrow `@layer components`
  exceptions above. If it grows past that, something was misplaced.
- CSS Modules were considered and **rejected** — a second styling mechanism
  for the rare bespoke-CSS case is not worth the extra mental model when
  motion is spring-based (no keyframes — ADR-0002) and utilities + components
  cover everything else.

**Consequences.** `globals.css` stays a few-hundred-line file indefinitely.
"Repeated thing" pressure now pushes toward React components — which the
project wants anyway. This **amends ADR-0004**: design *tokens* still go in
`globals.css` first, but component-specific *classes* no longer do.
[[design-system]] and [[component-conventions]] updated to match.

---

## ADR-0011 — API layer: `app/api` route handlers, secrets server-side

- **Status:** Accepted
- **Date:** 2026-05-22

**Context.** The starter had no API layer. It needs a convention for reaching
external services that keeps secret keys off the client and gives endpoints a
consistent shape.

**Decision.** External calls go through Next.js Route Handlers —
`src/app/api/<resource>/route.ts`:
- **The handler owns the work** — business logic, multiple upstream calls,
  filtering, and reading secret env vars all live in `route.ts`. No mandatory
  passthrough service layer; extract shared code only when genuinely reused.
- Secrets are safe in handlers because `route.ts` is never bundled to the
  browser. Secret env vars are **unprefixed**; `NEXT_PUBLIC_` only for
  browser-safe values.
- Every endpoint: validates input with `zod`, returns the `{ data }` /
  `{ error }` envelope via the shared `handle()` wrapper (`src/lib/api/`), runs
  on the Node runtime (not Edge).
- `src/env.ts` validates env with zod — `publicEnv` vs `getServerEnv()`.
- Client Components fetch via `apiFetch` (`src/lib/api-client.ts`), same-origin
  only. Render-time data is read in Server Components.
- Added `zod`. The example endpoint is `app/api/contact/route.ts`.
- Codified as **AGENTS.md hard rule #9**.

**Consequences.** A clear, secret-safe API convention (full note:
[[api-architecture]]). Server Actions were considered for mutations but
deferred — for now everything goes through `app/api`. The choice can be
revisited if forms need progressive enhancement. First server dependency
(`zod`) and first server-only env var (`CONTACT_ENDPOINT`) now exist.

---

## ADR-0010 — SEO & performance hardening

- **Status:** Accepted
- **Date:** 2026-05-21

**Context.** A review found gaps that would hurt a production marketing site:
`metadataBase` defaulted to `null` (relative OG/canonical URLs never resolved to
absolute — broken social previews); `themeColor` sat on the deprecated metadata
field; there was no `robots.txt`, `sitemap.xml`, or structured data; the
`next.config.ts` was empty; `ScrollLayout` leaked a `requestAnimationFrame`
loop; the home view was a top-level `"use client"` (violating hard rule #6);
and the animation-heavy starter ignored `prefers-reduced-motion`.

**Decision.**
- **Site config.** `src/lib/site.ts` (`siteConfig`) is the single source of
  truth for SEO, fed by `NEXT_PUBLIC_SITE_URL` (fallback `http://localhost:3000`).
- **Metadata.** `metadataBase` is always set; `themeColor` moved to a
  `generateViewport()` / `viewport` export; dead `keywords` / `other` tags
  dropped; OG dimensions corrected to match the asset.
- **Crawlability.** Added `app/robots.ts`, `app/sitemap.ts`, and a JSON-LD
  `Organization`+`WebSite` helper rendered once in the root layout.
- **App Router files.** Added `loading.tsx` (enables streaming), `error.tsx`,
  `not-found.tsx`.
- **Rendering.** `HomeView` is a Server Component; client-only animation moved
  to the `HomeShowcase` leaf — models hard rule #6 instead of breaking it.
- **Reduced motion.** `<ReducedMotion>` calls react-spring's `useReducedMotion`,
  toggling the global `skipAnimation` — one app-root mount covers every spring
  and `spring-text-engine`. Chosen over per-component handling for its reach.
- **Build config.** `next.config.ts` now sets `removeConsole` (prod),
  AVIF/WebP, `next/image` breakpoints aligned to the adaptive-grid widths, and
  `poweredByHeader: false`. React Compiler is left as a documented opt-in (needs
  `babel-plugin-react-compiler`).
- Fixed the `ScrollLayout` Lenis rAF leak (cancel on unmount).

**Consequences.** Social/SEO metadata is correct in production once
`NEXT_PUBLIC_SITE_URL` is set. The first project env var now exists (see
[[environment-variables]]). `isBot()` stays available but is discouraged — it
opts routes out of static rendering; reduced-motion is the preferred lever (see
[[seo-metadata]]). React Compiler remains opt-in pending a dependency install.

---

## ADR-0009 — Shared animation ticker; authorized engine performance refactor

- **Status:** Accepted
- **Date:** 2026-05-21

**Context.** A performance review of the animation engine found load issues that
scale with the number of animated components on a page:
- `useLoop` started a **private `requestAnimationFrame` loop per hook instance** —
  N scroll-driven components meant N rAF loops, none of which ever stopped.
- `useWindowWidth` attached a **separate debounced `resize` listener per call** —
  one per spring component.
- `useDynamicInView` re-created its `IntersectionObserver` **on every render**
  (effect keyed on an unstable `options` object), and a dead `Proxy` branch
  created observers that were never disconnected.
- `useLoop`'s mount-only effect captured a **stale `onRender`**, so prop changes
  after mount were ignored.
All of this lives under `src/hooks/animation/` and `src/components/animation/springs/`
— `#do-not-modify` (ADR-0002).

**Decision.** With explicit user sign-off, apply a one-time performance refactor
to the protected engine, and introduce a shared, unprotected loop primitive:
- New `src/lib/animation/ticker.ts` — a single app-wide, reference-counted rAF
  loop (`subscribeToTicker`). It starts on the first subscriber, stops on the
  last, and throttles each subscriber independently. **Not** `#do-not-modify` —
  it is the supported extension point.
- `useLoop` now subscribes to the ticker and reads `onRender` / `framerate`
  through refs (fixes the stale-closure bug). Public signature unchanged.
- `useDynamicInView` rewritten without the `Proxy`: one observer, re-created only
  when the observed element or options actually change; exposes a callback ref.
- `use-window-size.ts` (not protected) now serves all three hooks from one
  debounced `resize` listener via `useSyncExternalStore`. The unused
  `debounceDelay` parameter was dropped.
- `mode="forward"` `scroll` listeners in `<Spring>` / `<Inview>` made `passive`.
- Hard rule #2 amended: the engine stays protected by default; changes require
  explicit sign-off.

**Consequences.** A page with N animated components now runs **one** rAF loop and
**one** resize listener instead of N of each, with no observer churn. Public
hook/component APIs are unchanged except `useWindowWidth`/`Height`/`Size`, which
no longer take a `debounceDelay` argument (no caller passed one). This **amends
ADR-0002's** do-not-modify scope.

A follow-up pass then cleared all 13 pre-existing ESLint problems in the engine
(also authorized): `isMobileDisabled` gained an optional `viewportWidth`
argument, missing `disableOnMobile` effect deps were added, a
`trigger.current`-in-cleanup hazard in `<Hover>` was fixed, `<Handle>`'s
transition effects were ref-stabilised, and `useProgressTrigger` now returns
`progress` as a `RefObject<number>` (no consumer affected).

---

## ADR-0008 — Adaptive scaling grid via root font-size

- **Status:** Accepted
- **Date:** 2026-05-21

**Context.** An adaptive scaling system was dropped into `src/components/common/`
to keep a rem-based design proportional across viewports. It shipped as a
`styled-components` implementation (`createGlobalStyle`, a `css` `media` helper,
`rm`/`em` helpers, plus `colors.ts` / `fonts.ts` / `utils.ts`). `styled-components`
is not a project dependency, and global CSS belongs in `globals.css` per ADR-0004.

**Decision.** Keep only the scaling behaviour; rebuild it to the project stack.
- **Scale down** (viewport ≤ largest breakpoint) — `vw`-based `html { font-size }`
  media queries in `globals.css`, inside `@layer base`.
- **Scale up** (viewport > largest breakpoint) — a `<AdaptiveGrid>` client
  component (`useAdaptiveGrid` hook) sets an inline `html` font-size at runtime,
  reusing the existing `useResizeLoop` render loop.
- Breakpoints live in `grid.config.ts` as typed config; the `globals.css` media
  queries mirror them and must be kept in sync (formula in both files).
- The dropped `styled-components` files were deleted, not committed.

**Consequences.** A rem-based layout now scales as one unit on every viewport.
`styled-components` stays out of the dependency tree. The breakpoint set is
duplicated across `grid.config.ts` and `globals.css` by design — the CSS-only
config rule (ADR-0004) forbids generating the media queries from JS.

> [!note] Amendment (2026-07-10) — single 1440 base, fill-width, StageFit
> The project ships one 1440 × 800 design (the home hero) that must **fill the
> viewport width** and fit a single screen at any resolution. `html { font-size:
> 1.111111vw }` (one 1440 base) makes the 90rem stage always span 100vw — no side
> margins. Height is handled separately: the stage sits in a `100dvh`
> overflow-hidden **frame** (so nothing can scroll) and is compressed vertically —
> never stretched — by the **`StageFit`** client component
> (`src/views/home/stage-fit.tsx`), which sets `--stage-scale-y = min(1,
> 1.8·ih/iw)` on resize; the stage applies it as `transform: scaleY(var(...))`.
> On viewports at/above the 1.8 aspect it fills width with small top/bottom
> margins; below it, it compresses to fit. The **`AdaptiveGrid` mount was removed**
> (an earlier contain-fit attempt with `min(1.111vw, 2dvh)` was also dropped — it
> letterboxed wide viewports). `grid.config.ts` keeps its single 1440 breakpoint;
> the AdaptiveGrid component/hook remain, unused. A `position: fixed` stage was
> tried and rejected: Lenis transforms an ancestor, which becomes the containing
> block for fixed descendants and collapses the stage. Re-introduce per-breakpoint
> bases if a distinct mobile layout is added.

> [!warning] Superseded in part (2026-07-11) by [[decisions-log|ADR-0017]]
> The **vertical** half of this amendment no longer holds. `StageFit`, the `100dvh`
> **fixed-frame + `scaleY` compression**, and `--stage-scale-y` were removed
> (`stage-fit.tsx` deleted) because the fixed 1.8-aspect stage left large top/bottom
> letterbox gaps on 16:10 laptops. The desktop hero is now **fluid vertically**
> (`100dvh` stage, edge-anchored contents, panel fills the height). The
> **horizontal** half still stands: `html { font-size: 1.111111vw }` (one 1440 base)
> keeps the stage filling the viewport width. See ADR-0017.

---

## ADR-0007 — Automate the vault workflow with Claude Code hooks

- **Status:** Accepted
- **Date:** 2026-05-21

**Context.** The "read the vault first, follow the relevant guide, update the docs
after every change" workflow depended on the user reminding the agent each time.
Documentation drifts the moment it relies on memory.

**Decision.** Encode the workflow as Claude Code hooks in `.claude/settings.json`
(committed, team-wide):
- `SessionStart` — injects a pointer to read the vault first.
- `UserPromptSubmit` — on every request, reminds the agent to consult the relevant
  guide and to update docs for any change made.
- `Stop` — at the end of every turn, blocks **once** to confirm the vault was
  updated. A `${TMPDIR}` marker keyed by session id guarantees it blocks at most
  once per turn (no infinite loop).

**Consequences.** The documentation workflow is enforced without user prompting.
`.claude/settings.json` is now a tracked project file. Hooks are reviewable and
disableable via `/hooks`. New hooks take effect on the next session start (or after
opening `/hooks`). See [[ai-agent-guide]].

---

## ADR-0006 — The vault is the single source of truth

- **Status:** Accepted
- **Date:** 2026-05-21

**Context.** ADR-0001 left dense spec files (`project-specs.md`, `text-engine-docs.md`)
at the repo root alongside the vault, creating duplication — the same conventions
existed both as terse specs and as expanded vault notes, which would drift.

**Decision.** The vault is the **only** documentation source.
- `project-specs.md` — deleted; its content was already decomposed into the
  `architecture/` and `frontend/` notes (and `environment-variables.md`).
- `text-engine-docs.md` — moved into the vault as [[text-engine-reference]].
- `generic-layout-prompt.md` — moved into the vault (see ADR via [[changelog]]).
- Root keeps only thin shims: `AGENTS.md` carries the breaking-change warning and
  hard rules and points into the vault; `CLAUDE.md` and `.cursorrules` both
  `@`-import `AGENTS.md`.

**Consequences.** No documentation duplication. Agents bootstrap from `AGENTS.md`
and read vault notes on demand. This **amends ADR-0001** — root files no longer
hold canonical spec content.

---

## ADR-0005 — Use standard `next/link` for navigation

- **Status:** Accepted
- **Date:** 2026-05-21

**Context.** Two conflicting conventions existed: `project-specs.md` specified
standard `next/link` / `useRouter`, while `generic-layout-prompt.md` specified
custom `<AnimLink>` / `useAnimRouter()` wrappers. The custom wrappers were never
built.

**Decision.** Use standard Next.js navigation — `<Link>` from `next/link` and
`useRouter` from `next/navigation`. The `AnimLink` / `useAnimRouter` convention is
dropped. See [[routing]].

**Consequences.** `generic-layout-prompt.md` §5 updated to match. No animated-route-
transition layer exists; if one is needed later, revisit with a new ADR.

---

## ADR-0001 — Adopt an Obsidian vault as the project brain

- **Status:** Accepted — amended by ADR-0006
- **Date:** 2026-05-21

**Context.** Project knowledge was scattered across root markdown files
(`project-specs.md`, `text-engine-docs.md`, `AGENTS.md`). New contributors and AI
agents had no structured map of the system.

**Decision.** Introduce `obsidian/` as an Obsidian vault — a linked, navigable
second brain. Root spec files remain as machine-read sources; the vault expands on
them. See [[ai-agent-guide]].

**Consequences.** Docs must now be maintained alongside code. The vault is the
canonical place to *understand* the project; root files stay canonical for *tooling*.

---

## ADR-0002 — All motion is spring-based (`@react-spring/web`)

- **Status:** Accepted (inherited from starter)
- **Date:** Project baseline

**Context.** Marketing sites need rich, interruptible, physically natural motion.
CSS transitions and keyframes are rigid; competing libraries add weight.

**Decision.** Use `@react-spring/web` for every animation. A custom component layer
(`src/components/animation/springs/`) wraps it. CSS transitions, CSS keyframes, and
`framer-motion` are **banned**.

**Consequences.** All animation goes through the [[animation-system]]. The springs
folder is `#do-not-modify`. Text animation is delegated to [[text-engine]].

---

## ADR-0003 — Routes delegate to Views

- **Status:** Accepted (inherited from starter)
- **Date:** Project baseline

**Context.** Mixing routing concerns with page UI makes `app/` files heavy and hard
to test.

**Decision.** `app/**/page.tsx` files only import and render a component from
`src/views/`. All layout/UI logic lives in the view. See [[routing]].

**Consequences.** Every route is a 3-line file. Views are the real page components.

---

## ADR-0004 — Tailwind v4 with CSS-based config

- **Status:** Accepted (inherited from starter)
- **Date:** Project baseline

**Context.** Tailwind v4 removes `tailwind.config.js` in favour of CSS-native config.

**Decision.** All theme tokens live in `globals.css` under `:root` and `@theme inline`.
No JS config file. Raw values in class names are banned. See [[design-system]].

**Consequences.** Design tokens are the only styling currency. New values must be
added to `globals.css` first.
