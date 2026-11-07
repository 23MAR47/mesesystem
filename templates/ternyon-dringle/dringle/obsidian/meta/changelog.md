---
tags: [meta, changelog]
updated: 2026-07-10
---

# Changelog

Chronological log of notable changes to the project. Newest first.
This is a human-curated log — not a mirror of `git log`.

## 2026-07-11

- **Instant layout switch on resize** — the hero desktop⇄mobile switch keyed off
  the debounced `useWindowWidth` (300 ms, and the trailing timer reset on every
  resize event — so during a drag it wouldn't swap until you *stopped*, and the
  CSS `@media` font-size flipped meanwhile → a transient broken frame that felt
  like it needed a reload). New `useMediaQuery` hook (`use-media-query.ts`, via
  `matchMedia`'s `change` event) drives the switch instead: event-driven, no
  debounce, flips the instant the 1024px breakpoint is crossed, in lockstep with
  the CSS. Also aligns the JS breakpoint to the CSS one exactly
  (`(max-width: 1023px)`), removing a fractional-width mismatch. See [[hooks]].
- **Hero responsiveness rework** — see [[decisions-log]] ADR-0017:
  - *Desktop fills the screen (no letterbox gaps)* — the desktop hero was a fixed
    1.8-aspect stage centred by `StageFit`, leaving big top/bottom gaps on 16:10
    laptops. It is now **fluid vertically**: `100dvh` stage with nav pinned top,
    CTA/social pinned bottom, headline centred, media panel `inset-y` (full
    height). Verified edge-to-edge fill from 1280×800 → 1920×1080. `StageFit` /
    `--stage-scale-y` removed (`stage-fit.tsx` deleted); stat cards + preloader
    curtain re-anchored to the fluid panel. Supersedes the vertical half of
    ADR-0008.
- **Hero polish — performance & interaction pass** (same ADR-0017):
  - *Preloader plays once* — both preloaders start `gone` from the persisted
    `isRevealed` flag, so a breakpoint-crossing resize no longer replays the intro
    (which looked like a page reload).
  - *Loader counter fades in place* — clamps its rise at 90% and eases opacity 1→0
    over 90→100% (`counterFade`) instead of drifting off the panel top.
  - *WebGL loop gated* — `HeroModel` starts/stops via `visibilitychange` + an
    `IntersectionObserver` (idle when the tab is hidden or panel off-screen).
  - *Mobile/tablet headline* — `clamp(1.5rem, 5vw, 2rem)`: fits two rows down to
    320px, caps ~40px on large tablets. Note: TextEngine `columnGap` is the **word
    gap** (em), not letter tracking — shrinking it collapses spaces between words.
    Stacked layout centres in `max-w-[42rem]` (panel `sm:max-w-[34rem]`).
  - *Button hovers* — spring-based `<Hover>` lift/scale on the CTA and Contact
    buttons and a dim on the nav links (no CSS transitions, per ADR-0002).
- **Mobile layout (stacked) + burger nav** — below 1024px the hero switches to a
  stacked mobile layout: the headline block on top, the media panel below, on a
  normal scrollable page; the nav collapses to a burger with a dropdown. `hero.tsx`
  is now a thin **client switcher** — `useWindowWidth() < 1024` → `<HeroMobile>`,
  else `<HeroDesktop>`. Since `useWindowWidth` reports 0 on the server + during
  hydration, both render desktop and the switch happens only once the real width
  is known (no hydration mismatch; the preloader hides the transition). New:
  `hero-desktop.tsx` (the former fixed-stage hero), `hero-mobile.tsx`,
  `hero-mobile-nav.tsx` (burger), `hero-mobile-preloader.tsx` (full-screen curtain).
  Below 1024, `globals.css` returns the root font-size to `clamp(14px, 4.2vw,
  20px)` and makes `body` a scrollable block — the desktop single-screen rules
  (fixed stage, StageFit, `overflow: hidden`) apply only ≥1024. The mobile layout
  reuses the same reveals / gating / `HeroModel` / content data. See
  [[decisions-log]] ADR-0016.
- **Intro preloader + preloader-gated reveals** — the hero now opens with a
  loading intro: a percentage counter (0→100%) on the left rises together with a
  gradient curtain that fills the media panel from the bottom; at 100% the curtain
  collapses upward to reveal the panel (video + chrome model + cards) and the
  whole hero animates in at that same moment. New files: `hero-preloader.tsx`
  (phases driven by `setTimeout` for reliable timing, counter/curtain visuals by
  react-spring), `preloader-store.ts` (a Zustand `isRevealed` gate), and
  `reveal.tsx` (a `<Spring>` wrapper gated on `isRevealed`). Every reveal now holds
  its hidden `from` state until the preloader finishes: the nav / badge / CTA /
  social-proof / panel / cards / avatars go through `<Reveal>`; the heading / body
  / overline render as hidden plain text (`opacity: 0`, kept in the DOM for SEO)
  until reveal, then mount the animated TextEngine — because TextEngine's
  `enabled` shows the *end* state rather than hiding. Added the
  `--gradient-preloader` token. See [[decisions-log]] ADR-0015.
- **Centered left copy; fill-width single-screen fit** — two fixes. (1) The
  headline + body copy are centered again: `spring-text-engine` renders each line
  as a flex row, so `text-center` did nothing — added `justify-center`. (2) The
  hero now **fills the viewport width** at every resolution (no big side margins;
  the earlier contain-fit letterboxed wide-short viewports). Root font-size is
  back to `1.111111vw` (width-fill). The stage sits inside a `100dvh`
  overflow-hidden frame and is compressed vertically — never stretched — by the
  new **`StageFit`** client component (sets `--stage-scale-y = min(1, 1.8·ih/iw)`)
  when the viewport is shorter than the design's 1.8 aspect, so it always fits one
  screen with no scroll. The stage's dynamic `scaleY` transform is an inline style
  (a dynamic value — allowed). Note: `position: fixed` was tried for the stage but
  Lenis transforms an ancestor, which reparents fixed descendants and collapsed
  it — hence the in-flow frame + `scaleY`. See [[decisions-log]] ADR-0008.
- **Star axis, single-screen fit, soft UI reveals** — a third hero pass. (1) The
  star now spins around the **diagonal that runs along the hands** (a fixed axis
  applied via `quaternion.premultiply` in the model frame) instead of the
  vertical. (2) The hero fits a **single screen at any resolution, no scroll** —
  `html { font-size: min(1.111111vw, 2dvh) }` contains the 90rem × 50rem stage to
  the viewport (width term fills width, height term caps height); the
  `<AdaptiveGrid>` mount was removed (it couldn't honour the height cap), body is
  `overflow: hidden` + `100dvh`. See [[decisions-log]] ADR-0008. (3) **Soft,
  spring-based entrance reveals** on every element (no CSS transitions): the
  `<h1>` cascades letter-by-letter (rise + blur + opacity) via `spring-text-engine`,
  body copy + panel overline reveal word-by-word, and nav / badge / CTA /
  social-proof / panel / stat cards / avatars stagger in with `<Spring>`. Shared
  presets live in `hero-motion.ts`; TextEngine wrappers in `hero-text.tsx`. The
  heading's two-line break is preserved by rendering each line as its own block
  TextEngine with a tuned `columnGap` (word-splitting + the default 0.3em gap
  otherwise wrapped it to three lines). Mobile note unchanged: below ~1024px the
  desktop layout scales down rather than reflowing.
- **Hero scales to fill any viewport; 3D + copy tweaks** — the adaptive grid was
  collapsed to a **single 1440 base** so the 90rem stage always spans 100vw with
  small mockup-accurate insets at any resolution (was: base 1920 above 1440 →
  large side margins; base 1024/360 below → overflow). `globals.css` is now one
  uniform `html { font-size: 1.111111vw }`; `grid.config.ts` has one breakpoint;
  `<AdaptiveGrid coef={1} />` gives an un-damped, fully proportional scale-up.
  Amends [[decisions-log]] ADR-0008. Also: the 3D model was enlarged
  (`TARGET_SIZE` 3.6 → 6.6) so the hands crop off the panel edges; the star now
  spins **in-plane around its face normal** (its thinnest axis) instead of
  flipping edge-on on Y; and the "Chosen by ambitious founders" pill is forced to
  a single line (`whitespace-nowrap`). Mobile note: below ~1024px the desktop
  layout now shrinks to fit rather than reflowing — a mobile design is still TODO.
- **Home hero built (Figma "Ternyon" 610:557)** — the first real page. The
  home view (`src/views/home/`) now renders a pixel-matched hero: a fixed
  90rem × 50rem stage (the 1440 × 800 frame) that rides the adaptive rem grid,
  with the nav pill, headline block, "Start a Project" CTA, social-proof pill,
  and a dark media panel (looping `purple-glass.mp4` + frosted stat cards +
  overline). Content is data-driven from `src/data/mocks/home.ts`; new feature
  components `hero.tsx` / `hero-nav.tsx` / `hero-panel.tsx` / `stat-card.tsx` /
  `avatar-stack.tsx` / `hero-model.tsx`. New tokens (palette, radii, CTA
  gradient) in `globals.css`; `siteConfig` name/description set to Dringle.
- **Font swapped Onest → General Sans** — the hero typeface. Loaded via
  `next/font/local` from `src/app/fonts/GeneralSans-{Light,Regular}.otf`
  (weights 300/400), exposed as `--font-general-sans`. `body` references it
  directly (with `@theme inline`, Tailwind inlines `--font-sans` into utilities
  and never emits it as a property, so `var(--font-sans)` was empty). The
  `prefers-color-scheme: dark` override was removed — the hero is a fixed design,
  not theme-adaptive. See [[design-system]] and [[tech-stack]].
- **3D chrome model via plain three.js** — the panel carries a live WebGL model
  (`public/assets/hands.glb`, Draco): chrome material, a star spinning on its
  vertical axis, whole-model cursor tilt. Built on **`three`** directly —
  `@react-three/fiber` was tried first but its global JSX augmentation broke the
  `#do-not-modify` spring engine's type-check (`animated[tag] as ElementType` →
  `children: never`), so fiber/drei were dropped. Draco decoder self-hosted in
  `public/draco/`. `yarn build` + `yarn lint` clean. See [[decisions-log]]
  ADR-0014 and [[tech-stack]].

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
