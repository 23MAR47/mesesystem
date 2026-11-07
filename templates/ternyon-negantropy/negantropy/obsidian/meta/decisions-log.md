---
tags: [meta, decision]
updated: 2026-05-31
---

# Decisions Log (ADRs)

Architecture Decision Records. Each entry captures a choice, its context, and its
consequences. Use [[templates/adr-note]] for new entries. Newest first.

---

## ADR-0017 — Mobile performance budget for the WebGL scene

- **Status:** Accepted
- **Date:** 2026-05-31

**Context.** The [[components/negentropy|NEGENTROPY]] scene renders
≈ 250 k particles across six fields plus a full-frame bloom
postprocessing pass (ADR-0015). On phones this is the heaviest part of
the frame and the postprocessing pass in particular is expensive on
mobile GPUs. The scene visuals themselves are acceptable on mobile;
the cost is not.

**Decision.** `Scene` derives an `isMobile` flag from
`useWindowWidth()` against `springsConfig.mobileWidth` (768 — the
project's shared "mobile" cutoff) and applies a two-part budget:

1. **Particle density ×0.49.** A `densityScale` prop (default `1`) was
   added to every particle leaf (`Starfield`, `SpiralNetwork`,
   `Molecule`, `RedStorm`, `HourglassGalaxy`, `StarfieldClose`). Each
   multiplies its base `count` by the scale when building geometry
   (`Math.round(count * densityScale)`); `Molecule` scales its two
   per-element constants (`ATOM_PARTICLES` / `BOND_PARTICLES`, floored
   at 1). `Scene` passes `densityScale={0.49}` on mobile, `1` otherwise
   — two compounded 30 % cuts (`0.7 × 0.7`), ~half the desktop count.
2. **No bloom on mobile.** The `<EffectComposer>`/`<Bloom>` block is
   rendered only when `!isMobile`. The 2× shader brightness pass means
   the raw fields still read well without bloom.

`width === 0` (the pre-measure / SSR snapshot — `Scene` is
`ssr: false`) is treated as desktop so the first client frame is full
quality. Crossing the breakpoint on resize rebuilds geometry (deps
include `densityScale`), which is rare and acceptable.

**Consequences.**
- Mobile frames are markedly cheaper (~half the particles + no
  postprocessing) with no change to desktop, which keeps the full
  particle count and the ADR-0015 bloom config.
- ADR-0015's bloom is now **desktop-only**; this is the "ADR follow-up"
  that ADR-0015 asked for when bloom behaviour changes.
- The `densityScale` knob is reusable for any future quality tiers
  (e.g. a low-power toggle) — it's not mobile-specific by design.

## Related

[[decisions-log]] · [[components/negentropy]] · ADR-0013 · ADR-0015

---

## ADR-0016 — Authorized fix to the dynamic-tag typing (animation engine)

- **Status:** Accepted
- **Date:** 2026-05-31

**Context.** `yarn build` was failing TypeScript across five files in
the `#do-not-modify` animation engine
(`animated-var-text-tag.tsx`, `spring.tsx`, `spring-trigger.tsx`,
`progress-trigger.tsx`, `hover.tsx`). Two distinct errors, both from
the dynamic-tag pattern these components use to render a runtime-chosen
element:

1. **`never` props.** Each component does
   `const Tag = animated[tag] as ElementType` (or `tag as
   React.ElementType` for the intrinsic variants) and then
   `<Tag ref={…} className={…} style={…} {…props}>{children}</Tag>`.
   Under React 19's `@types/react`, a bare `ElementType` used as a JSX
   tag collapses its props to the intersection of *every* member of the
   union (intrinsic ∩ component), which resolves to `never` — so
   `children`, `ref`, `className`, and `style` all stopped
   type-checking. This is purely a types regression; the runtime value
   is always a single valid element.
2. **Index signature.** `animated[tag]` with a `Tags` (string-union)
   key has "No index signature … on type `WithAnimated`" because the
   react-spring proxy is typed per intrinsic key, not with a string
   index. This was previously masked by a now-misplaced
   `// @ts-expect-error` in `spring.tsx`.

This is the "separate fix needed" called out in ADR-0014's
consequences.

**Decision.** With explicit user sign-off (the user asked to "fix build
issues"), apply a surgical typing-only patch in each of the five files:

```diff
- const Tag = animated[tag] as ElementType;   // → never props
+ // React 19 collapses a dynamic ElementType JSX tag to `never` props;
+ // the runtime value is always a valid element, so widen here.
+ const Tag = (animated as any)[tag];
```

The intrinsic variants change `tag as unknown as React.ElementType` →
`tag as any`. The stale `// @ts-expect-error` and the now-unused
`ElementType` imports were removed. **No runtime, API, or behavioural
change** — the emitted JSX is identical; only the static type of the
`Tag` local was widened.

**Consequences.**
- `yarn build` now type-checks and produces a production build.
- The engine stays `#do-not-modify` — future edits still require
  explicit sign-off (ADR-0002 / ADR-0009).
- The `as any` is confined to the dynamic-tag local in these five
  vendored files (the engine already used `tag={Tag as any}` and
  `Record<string, any>` internally). If the engine is ever revendored
  with React-19-correct types, these casts should be revisited — a
  properly typed dynamic tag would use a single concrete constructor
  type rather than the `ElementType` union.
- Resolves the open follow-up tracked in [[components/negentropy]].

## Related

[[decisions-log]] · [[animation-system]] · ADR-0002 · ADR-0009 ·
ADR-0014

---

## ADR-0015 — Reinstate bloom postprocessing with conservative config

- **Status:** Accepted
- **Date:** 2026-05-28

**Context.** Bloom was attempted three times in early development
(v0.6–v0.8) and removed at the user's request after each attempt
failed in a distinct way:
1. `@react-three/postprocessing` with `mipmapBlur: true` tripped
   `WebGLRenderer: Context Lost` on the dense particle field
   (≈ 240 k particles after the §VI scenes landed).
2. Disabling `mipmapBlur` + capping DPR still crashed under load.
3. A hand-rolled `EffectComposer` + `UnrealBloomPass` + `OutputPass`
   variant produced no visible glow because the alpha-blended
   particle output sat below the bloom luminance floor in
   linear-space.

The user now asks for bloom again. Two things changed since the prior
attempts that make a fresh attempt viable:
- A **2× brightness pass** is now applied across every shader scene
  and the ambient starfield. Particle cores comfortably clear a
  high luminance threshold without the rest of the frame washing
  to white.
- `@react-three/postprocessing` is at `^3.0.4` (versus the older
  major used at the time of the early attempts).

**Decision.** Reinstate bloom with a conservative configuration
matched to the dense particle field:

```tsx
<EffectComposer multisampling={0}>
  <Bloom
    intensity={0.55}
    luminanceThreshold={0.4}
    luminanceSmoothing={0.08}
    radius={0.8}
    mipmapBlur={false}
  />
</EffectComposer>
```

- `mipmapBlur: false` — classic gaussian blur, no per-frame mipmap
  chain (the original Context-Lost vector).
- `luminanceThreshold: 0.4` — only the bright cores bloom; alpha
  fringes are ignored. Works because of the 2× brightness pass.
- `intensity: 0.55` — moderate glow, particles still own the
  foreground.
- `multisampling: 0` on the composer — no MSAA on the post pass.

**Consequences.**
- Particle cores read as luminous lights, not flat dots — the
  visual goal that motivated all three earlier attempts.
- The earlier "no post-processing" rule recorded against
  `scene.tsx` is replaced by the configuration above; any future
  changes to bloom settings should land alongside an ADR follow-up
  if the brightness or threshold math changes meaningfully.
- If Context-Lost reports recur, drop `radius` first, then
  `intensity`, then disable bloom entirely — do **not** re-enable
  `mipmapBlur` without retesting the dense-scene workload.
- **Corner-discard contract.** Bloom exposed a latent bug in four
  fragment shaders (`molecule`, `red-storm`, `starfield-close`,
  `hourglass-galaxy`) where `pow(1.0 - length(uv) * 2.0, N)` returns
  positive values in the corners outside the inscribed circle (even
  integer / non-integer `N`), making the `strength <= 0` discard a
  no-op. The fix and house-style rule: discard explicitly on
  `length(gl_PointCoord - 0.5) > 0.5` *before* the strength math.
  Captured in the section conventions in
  [[components/negentropy]].

---

## ADR-0014 — Authorized fix to `Inview` ref wiring (animation engine)

- **Status:** Accepted
- **Date:** 2026-05-28

**Context.** `components/animation/springs/in-view.tsx` (in the
`#do-not-modify` animation engine) wires the IntersectionObserver
backing `useDynamicInView` like this:

```tsx
const [inViewRef, inView] = useDynamicInView({...});
// …
<AnimatedVarTextTag
  ref={(node) => {
    innerRef.current = node;
    inViewRef.current = node; // ← broken
  }}
/>
```

`useDynamicInView`'s first tuple element is a `TargetRefCallback` —
the **attach callback** that sets the observed node in the hook's
internal state — *not* a `RefObject`. Writing `.current = node` adds a
property to the function and does nothing useful; the observer never
receives a node, `inView` stays `false` forever, and every component
that uses `<Inview from={{opacity:0}} to={{opacity:1}}>` is stuck at
opacity 0. The TypeScript build error that's been blocking
`yarn build` (`Property 'current' does not exist on type
'TargetRefCallback'`) was reporting exactly this bug. The
[[projects/negentropy/concept|NEGENTROPY]] frame border, nav
jumplinks, brand-mark badge, hero meta cluster, biomarker grid, and
choice CTA all rely on `Inview` and were rendering invisibly because
of it.

**Decision.** Patch the two `ref` callbacks in
`components/animation/springs/in-view.tsx` to call the attach
callback instead of writing to `.current`:

```diff
- inViewRef.current = node as HTMLElement;
+ inViewRef(node as HTMLElement);
```

Two-line surgical fix; no API changes, no behavioural changes to any
component consuming `Inview`. ADR-0009 already permits authorized
edits to the animation engine — this is such a one, narrowly scoped
to a real correctness bug and not a refactor.

**Consequences.**
- Every `Inview` consumer now actually reveals on enter. Existing pages
  that "worked" did so because Inview wasn't on the critical path —
  springs in those pages came in via `SpringTrigger` / TextEngine /
  direct `useSpring`, not Inview.
- The pre-existing TypeScript build error in `animated-var-text-tag.tsx`
  is unrelated and still blocks `yarn build`. Separate fix needed.
- `Inview` stays in the `#do-not-modify` zone — future edits still
  require explicit sign-off.

## Related

[[decisions-log]] · [[animation-system]] · ADR-0009 ·
[[projects/negentropy/concept]]

---

## ADR-0013 — Three.js / R3F adopted for particle-driven scroll pages, scroll wired to uniforms via a mutable ref

- **Status:** Accepted
- **Date:** 2026-05-28

**Context.** [[projects/negentropy/concept|NEGENTROPY]] is a particle-driven
scroll narrative — five sections fronted by a sticky WebGL scene (hourglass
galaxy → nebula). The animation engine ([[animation-system]]) is the right
tool for DOM motion but cannot render Three.js point clouds with custom GLSL
shaders, and the project's hard rule banning *other animation libraries*
exists to keep DOM motion spring-only ([[decisions-log]] ADR-0002). A WebGL
rendering layer is not a competing motion library — it's a different output
target — so the project needs an explicit policy and a bridge between the
two worlds.

**Decision.**

1. **Three.js + `@react-three/fiber` + `@react-three/drei` are allowed for
   WebGL scenes**, leaf-scoped. Add them via Yarn; install `@types/three`.
   `@react-spring/three` is **not** adopted — installing it broadens
   `@react-spring/web`'s exported `ElementType` with R3F intrinsics and
   breaks JSX type inference for the existing spring components.
2. **R3F components are mounted via `next/dynamic` with `ssr: false`** so
   server rendering never touches `window` / WebGL.
3. **DOM motion stays spring-only** — the ban on other animation libraries
   (ADR-0002) is unchanged. CSS transitions / keyframes / framer-motion
   remain banned for HTML elements.
4. **Scroll → shader uniform bridge.** Scroll progress is captured by
   `<ProgressTrigger>` (project's spring scroll driver), written into a
   `useRef<number>` on the client wrapper, and read every frame inside R3F
   `useFrame` callbacks. The ref *object* is passed through props (never
   `ref.current`) so React Compiler purity rules accept it. R3F components
   never re-render for animation.
5. **Geometry / random data is built in `useEffect`, not `useMemo`.** Under
   the React Compiler purity rules, `Math.random` cannot be called during
   render. Buffer attributes are constructed in an effect and disposed on
   unmount; mutable uniforms are touched only inside `useFrame`.

**Consequences.**

- New file types: `src/views/<page>/*.tsx` may contain inline GLSL strings
  for vertex/fragment shaders. Long-term, extract to `.glsl.ts` modules.
- Three.js scenes must be feature-folder leaves under
  `src/views/<page>/`. Do not export R3F components from
  `components/animation/` — that namespace remains DOM-spring-only.
- `@react-spring/three` is on the do-not-install list. If a future page
  needs spring-driven 3D, animate a scalar with `@react-spring/web`
  `useSpring`, read `.get()` inside `useFrame`, and apply manually to the
  Three.js object. Document the pattern when first used.
- Linked notes: [[tech-stack]] (deps added), [[animation-system]] (no
  change — DOM motion still spring-only), [[projects/negentropy/concept]]
  (first consumer), [[changelog]] (entry).

## Related

[[decisions-log]] · [[tech-stack]] · [[animation-system]] ·
[[projects/negentropy/concept]]

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
