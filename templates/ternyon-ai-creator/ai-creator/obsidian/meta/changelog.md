---
tags: [meta, changelog]
updated: 2026-09-06
---

# Changelog

Chronological log of notable changes to **this project**. Newest first.
Human-curated — not a mirror of `git log`.

Log a change here when it would surprise someone returning in six months: a new
dependency, a new route or section, a convention bent, a bug whose cause is worth
remembering. Routine commits do not need an entry.

For *why* the conventions are what they are, see [[decisions-log]].

---

## Baseline — built from `next16-claude-starter` v0.1.0

What the starter ships, so the first project entry has something to diff against:

| Area | What is there |
|------|---------------|
| Framework | Next.js 16 App Router · React 19 · TypeScript · Yarn · Node ≥ 20.19 |
| Styling | Tailwind v4, CSS-only config, three-tier design tokens ([[design-system]]) |
| Motion | Vendored spring engine + `spring-text-engine`, shared rAF ticker, reduced-motion ([[animation-system]]) |
| Layout | Adaptive scaling grid — root font-size tracks the viewport ([[design-system]]) |
| Scroll | Lenis smooth scroll + Zustand scroll store ([[smooth-scroll]]) |
| Server | `app/api` route handlers, zod-validated env, `{ data }`/`{ error }` envelope ([[api-architecture]]) |
| SEO | Metadata generator, `robots.ts`, `sitemap.ts`, JSON-LD ([[seo-metadata]]) |
| Agent harness | 8 commands, 7 path-scoped rules, 11 skills, 4 subagents, `verify.sh` ([[agent-harness]]) |
| Not included | CMS, database, auth, payments, i18n, tests — added per project ([[backend/README]]) |

The home view (`src/views/home.tsx`, route `/`) ships empty on purpose — start
there ([[new-page]]).

<!-- Log this project's changes below, newest first, under a `## YYYY-MM-DD` heading. -->

## 2026-09-07 (99) — a resize across a tier boundary reloads the page

The page was not adaptive across a resize: the tier is read once at mount, and
with (98) everything the scene is built from follows it — the model decoded,
the runway's length and which screens ride it, the pixel ratio, the budget.
Drag a desktop window under 768px, or toggle a device in DevTools, and the
full choreography kept running in a phone-sized window.

`<TierReload>` (`scene/tier-reload.tsx`, mounted in the home view beside the
curtain) records the tier at mount and, on a resize that has settled for
`tierReloadSettleMs` (400ms), re-reads it; a **different** tier reloads the
page. Nothing else does: a phone's URL bar collapsing, a rotation within the
mobile tier, a desktop window resized within its own range all fire `resize`
and none reload. Verified on the production build: 1440 → 1200 keeps the page
(one load); 1440 → 430 reloads into the lite path (one canvas at 430×932, two
stills); 430 → 1440 reloads back into the full path. ADR-0127.

**New**: `scene/tier-reload.tsx`. **Changed**: `home.tsx`, `scene.config.ts`
(`tierReloadSettleMs`), `scene/index.ts`.

---

## 2026-09-07 (98) — the lite path: one model on a short runway, the rest as stills

The hero still lagged on an iPhone 17 Pro Max after (97). Measured on a
phone-sized viewport, it was not heavy — 3–8 draws and ~300k vertices a frame,
32 programs stable — it was **capped**: the mobile tier drew at 26fps under a
120Hz scroll, at 1.25 pixels per CSS pixel on a 3× screen, and every stage
(the sweeping lines, the field, the net, the morph, the chrome and its bloom)
ran on the phone as on a workstation. The owner's call: simplify the motion
on mobile, fewer vertices, 60fps, one pixel per CSS pixel, and let later
screens be images.

**The lite path** (`wantsLiteScene`, the mobile tier):

- **60fps, DPR 1.** `MOBILE_FPS` 60, `MOBILE_MAX_DPR` 1 — and the budget is a
  millisecond under the frame, because the ticker's `<=` skip let a budget of
  exactly 1000/60 land at 40fps on a 120Hz panel.
- **One motion.** The runway is 2.2 viewports; the model burns in as before,
  then turns 0.22 of a revolution as the reader scrolls off, and the title and
  copy fade with it (`LITE_WINDOWS`). No line sweeps, no field, no morph, no
  idle sway — the frame is drawn only when something changed, so the GPU
  sleeps between gestures.
- **Fewer vertices.** `model-lite.glb`: 42k triangles against 102k, textures
  at 1024, 380kB against 818kB. No net and no word are built, so the two
  31k-vertex line passes are gone too.
- **Multisampled after all.** At one pixel per CSS pixel the model's edges
  aliased visibly; four samples over a 440×956 composer target cost less than
  the lines they clean up, so the lite path gets the MSAA the mobile tier
  never had (`buildComposer`).
- **The second and third screens are stills.** `<StillStage>`
  (`hero/still-stage.tsx`) — a full-bleed frame captured from the scene at
  phone aspect with the stage fully arrived (`immersed-still.webp`,
  `delivery-still.webp`, 880×1912), with the screen's own copy revealing over
  it through the page's one DOM mechanism (`<Inview>` → `--stage-reveal`).
  `<ModelViewer>` renders them after the runway on the lite path in place of
  the two layers; `<ImmersedStage painted={false}>` resolves its heading in
  the DOM there, since no scene paints it.

The desktop path is unchanged. ADR-0126.

**Changed**: `device.ts`, `scene.config.ts` (`lite`), `model-scene.ts`,
`model-viewer.tsx` (`stills`, `LITE_WINDOWS`), `immersed-stage.tsx`
(`painted`), `home.tsx`, `mocks/home.ts` (`stage.stills`), `globals.css`
(`--color-scene-tide`). **New**: `hero/still-stage.tsx`, `model-lite.glb`,
`immersed-still.webp`, `delivery-still.webp`.

| hero, 440×956 @3×, production, 4× CPU | before | after |
|---|---|---|
| drawing buffer | 550×1195 | 440×956 |
| programs linked | 32 | 12 |
| draws · vertices per frame, first screen | 3 · 306k | 3 · 127k |
| draws · vertices per frame, later stages | up to 22 · 440k | — (stills) |
| scene frames/s at rest | 26 | 0 (draws on change) |
| full scroll: worst frame · frames > 50ms | 275ms · 4 | 27ms · 0 |

**Follow-up, same day — checked on the phone.** Three adjustments to the
lite path from that look:

- **The hero's type stays.** `LITE_WINDOWS` has no exit now (`end` not past
  `out`): the pinned screen leaves as a whole when the runway scrolls off,
  instead of the name and copy dissolving first, which read as the page
  emptying.
- **The second still is the net facing the camera, particles lit.** Captured
  at progress 0.34 with `rotation.turns` set to 0 for the capture only — the
  full timeline never shows the net face-on, since the bust has turned past
  a third of a revolution by the time the tide has it. The config was
  restored after; the build in the repo carries the real value.
- **Both stills drift against the scroll.** `<StillStage>` wraps its section
  in a `<ProgressTrigger>` ("top bottom" → "bottom top") and a bare
  `SpringValue` chases that progress, writing the image's `translate3d` on
  change. The image is taller than the section by `stillParallax.travel`
  (12%) and moves half of that each way, centred at rest. Sprung rather than
  bound because a thumb's momentum scroll arrives in steps
  (optimize-3d-scene §10), and the spring is what makes it read as smooth.

> [!warning] The phone itself was not measured
> As in (97): headless Chromium on a Mac GPU. What transfers is the counted
> work per frame and the frame cap; the fill rate on the device does not.
> Try it on the phone. If it is still not smooth, the next suspect is touch
> scrolling on the main thread (`syncTouch`), which the profile shows as the
> largest non-idle item — that is a feel decision, not a cost one.

> [!note] How the stills were made
> Playwright at 880×1912 (phone aspect, twice the CSS size, DPR 1 so the tier
> stays tablet and the scene renders at full resolution), `preserveDrawingBuffer`
> forced on, `fillText` stubbed and the DOM layers hidden, scrolled to
> progress 0.34 (with `rotation.turns` temporarily 0, for the face-on net)
> and 0.995 of the full runway, `canvas.toDataURL`, then sharp.
> The lite model: `gltf-transform simplify --ratio 0.3 --error 0.0005`,
> `resize 1024`, `draco`. Re-run both if the model, lighting or palette change.

---

## 2026-09-07 (97) — one scene: the closing screen is a still image with DOM reveals

The page lagged on an iPhone 17 Pro Max. The decision (the owner's): keep WebGL
in the hero only, and make the rest UI motion on scroll. The only other scene
was the closing screen's — a second full renderer for one screen at progress 0
(slimmed in (96), but still a renderer, its own canvas, textures, post chain,
shadow map, and a second copy of the model to decode under the curtain).

**What replaced it.** `<ClosingStage>` (`hero/closing-stage.tsx`): the same
bust as a **cutout on transparency**, captured from the scene itself on the
accent ground so the foot is already dissolved into it
(`public/assets/hero/model-cutout.webp`, 1300×1872, 150kB), placed where the
scene framed the subject. The type resolves in the DOM — `<StageReveal>`
letter by letter for the heading, `stageRise` blocks for the copy — off one
`--stage-reveal` that `<Inview mode="once">` springs from 0 to 1 as the panel
rises. The panel's depth cue is kept: the heading now lags in CSS
(`closingParallax.heading`), as the copy already led. Reader and crawler get
the same markup.

**What went with it**: `still`, `surfaceToken` and `arrive` on `ModelScene`
and `<ModelViewer>`, the scene's `[data-closing-panel]` lookup and ink shift,
`closingReady` in the preloader store (one scene reports), and the closing
block's bot branch in `home.tsx`. The hero is unchanged.

| full scroll, 430×932 @3×, production | before | after |
|---|---|---|
| WebGL contexts on the page | 2 | 1 |
| model decodes under the curtain | 2 | 1 |
| frames > 50ms · worst frame, 4× CPU | 4 · 275ms | 2 · 63ms |
| frames > 50ms · worst frame, 1× CPU | 1 · 113ms | 0 · 16ms |

ADR-0125. **Verified**: closing screen captured at 1440×800 and 430×932,
`yarn lint`, `yarn build`, `verify.sh` 0 FAIL.

> [!warning] The phone itself was not measured
> Headless Chromium on a Mac GPU cannot stand in for an A19's fill rate; the
> frame times above are CPU-side and transfer only as counts (optimize-3d-scene
> §0). The change removes a whole renderer, which is the largest lever there
> is — but the hero's own cost on the device is the next thing to look at if
> it still lags: `sceneConfig` tiering, the tide field's two fbm walks, the
> wireframe passes.

> [!note] How the cutout was made
> Playwright against the live closing scene with `preserveDrawingBuffer`
> forced on and `fillText` stubbed (so no painted type), `canvas.toDataURL`,
> then `sharp().trim().webp()`. Re-run if the model, its lighting or the
> accent change — the foot's dissolve is baked to that colour.

---

## 2026-09-07 (96) — the closing scene is a still, and is built like one

The page stalled as the closing panel began to rise and the floating bar left.
Traced on the production build at a Retina window (1728×1117 @2×): **no long
task, no shader link, no texture upload** — the stall was in Chrome's GPU
process, a 74ms shared-image allocation followed by two frames waiting on the
GPU (47ms, 31ms), the moment the panel carrying the second WebGL canvas came
on screen. On a machine under GPU-memory pressure that is the multi-second
freeze reported.

The cause was what that second scene *carried*. The still instance was a
complete hero renderer: a multisampled canvas, a post chain with a bloom mip
chain allocated whether or not the pass was enabled, the whole word asset it
would never morph into, and a prewarm walking five scroll stops of a timeline
it never leaves. And the canvas MSAA was redundant on **both** instances —
nothing is drawn to the canvas but the post chain's final quad; the composer's
own target already carries the tier's MSAA.

| at the panel's rise, 1728×1117 @2× | before | after |
|---|---|---|
| longest frame gap | 153ms + 52ms | 55ms once · none in a second run |
| GPU shared-image allocation | 74ms (2160×1396) | not in the top events |

- `ModelScene` takes `still`: no `buildWord`, no `UnrealBloomPass`, prewarm
  stops `[0]`. Every guard on the bloom pass and word groups already tolerated
  their absence.
- `antialias: false` on the renderer for every instance. `wantsAntialias`
  still decides the composer targets' `samples`, which is where the edges are.

ADR-0124. **Verified**: hero and closing screen captured after the change,
`yarn lint`, `yarn build`, `verify.sh` 0 FAIL.

> [!note] What is left is per-frame, not a stall
> While the panel climbs the compositor renders it through an offscreen
> surface (perspective + tilt + clip) with the closing scene drawing inside it.
> That is a steady GPU cost, ~35–80ms on the heaviest frames in the trace
> window at 2×, not an allocation. Capping the still at 30fps or flattening the
> panel's 3D tilt would cut it further; neither was taken, to keep the mark's
> hover and the design's rise as they are.

---

## 2026-09-07 (95) — everything builds under the curtain; the reveal runs on an idle thread

The reveal froze part-way through. Traced on the production build with a
`longtask` observer against the curtain's own timeline: every long task after
the curtain passed the half — the release point — was the **closing screen's
scene** being built. ADR-0115 had deferred it to `released` so it would not
double the work under the curtain, which was right while the model was found
already there and wrong the moment the arrival became a performance on that
same signal.

| after the curtain begins leaving | before | after |
|---|---|---|
| long tasks, unthrottled | 73 · 76 · 51 ms | **none** |
| long tasks, 4× CPU | 237 · 62 · 173 · 91 ms | **none** |
| frame gaps > 50ms, either | 3 · 5 | **0** |

The closing instance now builds **under the curtain, after the hero's scene
has reported ready** — in sequence, so the two never interleave — and the
curtain waits for **both** (`closingReady` beside `sceneReady` in the store).
A scene that fails to build reports too, so a browser without WebGL is not
left behind a curtain waiting on a canvas that never comes. The curtain leaves
about a second later than before (≈3.7s unthrottled, ≈4.7s at 4×); the page
after it compiles, decodes and uploads nothing. ADR-0123.

**Changed**: `use-preloader.ts`, `preloader.tsx`, `model-viewer.tsx`
(`buildable` for a still instance is now `sceneReady`, `reportSettled` on
ready **or** failed). **Verified**: production build, GPU-backed headless
Chromium, `yarn lint`, `yarn build`, `verify.sh` 0 FAIL.

> [!note] What still blocks, and where
> Under the curtain at 4× CPU there are two indivisible draws of ~260ms and
> ~190ms — the composer's first frame for each scene (ADR-0115 noted the
> first). The counter stutters through them; nothing after the curtain does.

---

## 2026-09-07 (94) — the model arrives, and the curtain lifts onto the top of the page

**The bug.** After a reload the page showed every section, finished, for about
a second before snapping to the hero. Two causes, both measured with a
per-frame trace in headless Chromium:

- **The browser restored the reload's scroll position, and won.** Scroll was
  put back to the old position while the document streamed, the layout's
  `scrollTo(0, 0)` ran at hydration, and the browser restored it *again* four
  frames later. The curtain covered that — and then lifted onto the middle of
  the page. Fixed at three points: an inline `history.scrollRestoration =
  "manual"` at the top of `<body>`, before anything has parsed; the curtain
  scrolls to the top when it locks the page; and it tells both the window and
  Lenis (`scrollTo(0, { immediate, force })`) again as it leaves, since a
  stopped Lenis keeps a target of its own.
- **The hero's scene was rebuilt the moment the curtain left.** The scene
  effect depended on `released` (added for the closing instance in ADR-0115),
  so the hero's own instance was torn down and built again — and the rebuild's
  prewarm walked every scroll stop on a canvas the reader could now see: a
  flash of the tide field and the chrome word, 1.6s into the opening. The
  effect now depends on a derived `buildable`, which for the hero never changes.

**The reveal.** The model no longer waits, finished, under the curtain. On
`released` it **arrives**: it starts nearer the camera and higher than its
rest and settles down and back into place, easing out; and it **burns in** —
every fragment discarded until a drifting three-octave noise falls under a
rising level, so the surface opens in scattered liquid patches with an ember of
the accent along each front and the tide's light stop at the very edge. Both
read one spring (`sceneConfig.arrival`). A beat later the name resolves
(`inkDelay`) and the first screen's copy rises in block by block, in reading
order (`stageRise`, `copyStagger`). The closing screen's still instance is
untouched: its level is 1 from construction. ADR-0122.

- **`scene.config.ts`**: `arrival` — approach, rise, edge, noise scale and
  drift, the spring, the ink delay, the copy stagger.
- **`scene-shader.ts`**: `arrivalFunction` (`arriveLevel`), injected into the
  model material — discard before lighting, ember after the stage mix — and
  `patchModelDepthMaterial`, so the shadow map discards the same fragments.
- **`model-scene.ts`**: `arrive` option, `setArrival`, `applyArrival` (the
  offset sits on the tilt group, above the sway), `setArrivalScale` (cells per
  radius of the **geometry**, the space the shader samples in).
- **`model-viewer.tsx`**: the `arrival` spring ahead of the ink's; the layer
  reveal is now `window × entrance` for the DOM copy as well as the painted
  type (`writeReveal`); the front layer starts at `--stage-reveal: 0`.
- **`hero/stage-rise.ts`**: `stageRise(at)` — opacity and a lift off the
  layer's reveal, in CSS, like `<StageReveal>`. `<StageReveal>` takes a
  `style`. The hero's button hover is a colour now, not an opacity — the rise
  owns that element's opacity.
- **`globals.css`**: `--raw-size-lift` → `--stage-rise`.

**Verified**: the reload trace holds `scrollY` at 0 from the first frame to
past the curtain; the reveal captured frame by frame at 1440×800 and 390×844
(patches open with the ember, the head stays in frame, name and copy follow);
`yarn lint`, `yarn build`, `verify.sh` 0 FAIL.

**Follow-up, same day — the entrance plays under the curtain's trailing edge.**
Watched, the first version left a beat of empty screen with a few ember marks
floating on it: the page was released only once the curtain had fully gone,
and the burn's first patches are small. Three changes:

- `preloaderConfig.releaseAt` (0.5): `release()` fires from the exit spring's
  `onChange` once the curtain is half-way up, so the arrival is already under
  way as the screen is uncovered. The element itself stays until the travel
  ends — a local `gone` state, separate from the store's `released`.
- The burn's thresholds lean low (`pow(…, 1.6)`), so most of the surface has
  opened by the half of the level rather than at the end.
- `arrival.spring` is quicker (58/22) and `inkDelay` is 120ms.

> [!note] What is not tuned to the eye yet
> The numbers in `arrival` were set from headless captures, not from watching
> it run. `approach`/`rise` decide how far it travels, `edge` how wide the
> burning front is, the spring how long the whole thing takes, and
> `preloaderConfig.releaseAt` how early under the curtain it all starts.

---

## 2026-09-06 (93) — the curtain is just a counter, and the site has its own identity

**The opening curtain is the number alone.** The square, its dots, the turn and
the swell are gone, and `preloader.config.ts` is down to the five values a
counter needs — the floor on the showing, the creep, and the three springs.
Nothing about *when* it leaves changed: still `sceneReady && waited`, still
released on rest.

**And the project has real metadata.** It was shipping the starter's
placeholders — "New Project", `@newproject`, a black theme colour, an icon set
of someone else's squares.

- **`siteConfig`**: the name, the hero's own sentence as the description (one
  promise, not two that drift), the accent as the theme colour — which is what
  the reader actually sees first, the curtain being a full-bleed field of it —
  and `twitterHandle` left **empty** rather than guessed.
- **Icons**, all generated from one derived mark by
  `scripts/generate-brand-assets.mjs`: `app/icon.svg`, `app/favicon.ico`,
  `app/apple-icon.png`, plus the Android and Windows tiles under `public/`. The
  hand-written `icons` block in the metadata generator is gone — Next's file
  conventions emit those tags, and two sources for one set is two to drift.
- **The share card**, 1200×630: the accent, the mark, and the porcelain panel
  with the subject. No burned-in type — see ADR-0121 for why that is a decision.
- **Structured data**: `Person` + `WebSite` + `Service`, replacing the
  placeholder `Organization`.
- **`NEXT_PUBLIC_SITE_URL`** now `https://elenamirgut.com`, inferred from the
  address the page itself invites people to write to. Every canonical, OG URL
  and JSON-LD `@id` is built from it, so it was `https://example.com` in all of
  them until now.

[[decisions-log]] ADR-0121.

**Dependency**: `sharp` `^0.35.3` as a **devDependency**, and a `yarn brand`
script. It was already on disk as a transitive install of Next's — relying on
that means a Next upgrade can take the script's dependency away without anyone
touching the script. See [[tech-stack]].

**New**: `scripts/generate-brand-assets.mjs`, `src/app/icon.svg`,
`src/app/apple-icon.png`, `src/app/opengraph-image.png`. **Changed**:
`preloader.tsx`, `preloader.config.ts`, `site.ts`, `generate-page-metadata.ts`,
`structured-data.ts`, `manifest.json`, `browserconfig.xml`, `.env`.
**Removed**: `public/favicon.ico` (claimed the same URL as the app file),
`public/favicon-16x16.png`, `public/favicon-32x32.png`,
`public/apple-icon-180x180.png`, `public/open-graph.png`.

**Verified** against the served production build: `<title>Elena Mirgut</title>`,
one `og:image` at 1200×630, two icon links (`.ico` and `.svg`, not duplicates),
`apple-touch-icon`, a linked manifest, JSON-LD carrying Person / WebSite /
Service / AggregateOffer, and `canonical` + `og:url` + `robots.txt` +
`sitemap.xml` all on the real origin. Every icon URL returns 200 with the right
content type. `yarn lint`, `yarn build`, `verify.sh` 0 FAIL.

> [!note] Two things the user has to decide, not me
> The **domain** is inferred from `hello@elenamirgut.com`; if it is wrong, one
> line of `.env`. And the **mark** is derived from the design's geometry because
> the repo has no logo file — dropping a real one in means editing `mark()` and
> re-running the script.

---

## 2026-09-06 (92) — the label leans, the plate does not; a larger, calmer square

**Only the address moves now.** `<Magnetic>` was wrapping the whole pill, so the
button slid with the cursor — which comes loose from the layout and drags its own
hover area out from under the pointer. It listens on the **parent** and moves the
**child**: wrap the label, and the control around it is the area that is felt.
Measured: the plate's transform is `(none)` and it moves 0px, while the label
goes to `translate3d(68.96px, 16.25px, 0)` and returns to exactly (0, 0).
[[decisions-log]] ADR-0120, amended.

**The curtain's square is larger and breathes less.** `size` 220 → 300 (and the
narrow-window ceiling 34 → 42vw), and one quarter turn now takes 1.15s rather
than 0.62. Measured over a full run: **2 breaths where there were 3**, ending at
180°, scale 1. Fewer, longer phases are what let each one be watched — a shape
that goes in and out three times before leaving reads as busy rather than as
calm. The sequence itself is unchanged: 1.00 at every square angle, 0.78 at
every diamond.

**Changed**: `magnetic.tsx` (listens on the parent, moves the child),
`contact-stage.tsx`, `preloader.config.ts` (`size`, `sizeMaxVw`, `leg`).

> [!bug] `verify.sh` caught a rule I broke on the way
> The first version clipped the plate with `overflow-hidden` so the leaning label
> could not escape it. `overflow` clips to the line-height box, and the plate is
> `leading-none` — hard rule #3, glyphs shaved. The clip was not needed anyway:
> at full lean the label ends 103px short of the plate's edge.

`yarn lint`, `yarn build`, `verify.sh` 0 FAIL.

---

## 2026-09-06 (91) — the reference sequence, a magnetic address, and a model already there

**The curtain's square follows the reference exactly.** Large when square to the
frame, small when standing on a corner — so the scale stopped being a companion
motion and became a **function of the angle**: a raised cosine, one cycle per
quarter turn. Measured off the transform: **1.00 at 1.1°, 90.2° and 270°; 0.78
at 44.7°, 135.8° and 225.4°.**

That also removed the last exception. The ending settles the phase to a whole
quarter, and a whole quarter *is* the resting size — so the separate spring that
carried the scale home is gone, and there is no moment left where the two are on
different clocks. [[decisions-log]] ADR-0119.

**The model is there the instant the curtain goes.** Its fade was gated on
`released` beside the painted type's entrance — right for the type, which is a
performance nobody can watch through a curtain, wrong for the model, which is
just meant to be present. Measured: canvas at full opacity at **1629ms**, curtain
gone at **4900ms**.

**And the address pill is magnetic** — it leans toward the cursor by a fraction
of the offset from its own centre and eases home when the cursor leaves. New
`<Magnetic>`. ADR-0120.

**New**: `magnetic.tsx`, `magnetic.config.ts`. **Changed**:
`preloader.config.ts`, `preloader.tsx` (`scaleAt` as a cosine of the angle; the
scale's settle spring removed), `model-viewer.tsx` (the canvas fades on `ready`,
the ink still waits for `released`), `contact-stage.tsx`.

**Verified** at 1440x900 by driving the events and reading the values back: the
pill pulls to `translate3d(70.27px, 17.57px, 0)` against an expected (70, 18) and
returns to exactly (0, 0) on leave. `yarn lint`, `yarn build`, `verify.sh`
0 FAIL.

> [!bug] One bug, found by measuring rather than by looking
> `<Magnetic>` first shipped with `onChange` on the **y** spring only. A pointer
> moving along the element's vertical centre leaves x travelling with nothing to
> write it out — the control simply does not move, and only for paths that cross
> the middle. Both springs repaint now. ADR-0120.

---

## 2026-09-06 (90) — the scene audit, and a square that stops shrinking

**The curtain's square keeps its size.** `pulse.from` was 1.16 against a `rest`
of 1, so it finished at 86% of the size it started — and since every even leg
drew it *in* from there, the whole thing read as a shape steadily getting
smaller. The size it starts at, returns to between breaths, and rests at are one
number now (`size` carries the difference, so it looks the same).

**Then the `optimize-3d-scene` audit, run properly.** Most of it was already in
place — bot path, tiering, in-view gate, frame budget, composer DPR clamped
alongside the renderer, desktop-only resize, pointer gated on the tier, Draco
with a local decoder, passive listeners. Two things were not, and its own §14
check is what found them.

**Eight shaders were compiling mid-scroll.** `compileAsync` walks
`traverseVisible`, and the word's scaffold, sparks and poured solids are all
invisible at progress 0. The loader now walks the whole timeline —
`prewarmStops` 0, 0.25, 0.5, 0.75, 1 — compiling and rendering at each.

**And the model's textures cost 67.8MB of VRAM** for an 818KB file, because a
texture costs its *decoded* size. `textureLimit(tier)` caps the longest edge and
the maps are redrawn before upload. [[decisions-log]] ADR-0118.

| measured | before | after |
|---|---|---|
| programs after loader → after full scroll (desktop) | 18 → **26** | 26 → **26** |
| programs after loader → after full scroll (mobile) | — | 25 → **25** |
| model texture VRAM, mobile | 67.8MB | **20MB** |
| texture edge, mobile | 2048 | **1024** |
| blocked under the curtain | 307ms / 3 tasks / worst 182 | **209ms / 3 / worst 99** |
| desktop texture edge | 2048 | 2048 (unchanged) |

The compile spread is why the blocking *fell* while the work grew: five yielded
frames broke up the composer's single 182ms first-frame block.

**Changed**: `device.ts` (`textureLimit`), `scene.config.ts` (`prewarmStops`),
`model-scene.ts` (`capTextures`, `downscaled`, the timeline walk in `prewarm`),
`preloader.config.ts` (the pulse's base size).

> [!note] What was measured and what was not
> Counted quantities only, on a production build against a fresh server, as §0
> requires — programs, textures, VRAM, blocked milliseconds. **Not** measured: a
> real phone, and Lighthouse. Absolute frame rates out of this browser pane are
> meaningless (§0), so none are quoted.
>
> **Not done**: KTX2. A GPU-compressed texture stays compressed in VRAM, which
> the runtime cap cannot match — but it is an offline asset change plus a new
> loader, not something to pull in unasked. ADR-0118.

`yarn lint`, `yarn build`, `verify.sh` 0 FAIL.

---

## 2026-09-06 (89) — the curtain's square turns and breathes as one gesture

"It should shrink and rotate at the same time, and grow and rotate at the same
time." It now cannot do otherwise, because there is only **one number**.

`phase` counts quarter turns, integrated per frame. The angle is `phase * 90`;
the scale is the fractional part of the same value, eased — even quarters draw
the square in, odd quarters open it back out. A change of direction therefore
lands on a whole quarter turn by construction, not by tuning.

(87) and (88) both tried to *coordinate* two motions — first by deriving the turn
from load progress, then by giving each its own even clock. The first was jerky,
the second was smooth but uncoupled: the two were even and unrelated, so a shrink
could start anywhere in a turn. [[decisions-log]] ADR-0117.

**Changed**: `preloader.config.ts` (`spin` + `pulse.config` → `leg`, one
duration for one quarter), `preloader.tsx` (`scaleAt(phase)`; the beat's spring
and its loop are gone).

**Verified** by reading the transform back, frame by frame:

| angle | scale |
|---|---|
| 0° → 90° | 1.16 → **0.74** |
| 90° → 180° | 0.74 → **1.16** |
| 180° → 270° | 1.16 → 0.84, then settles |

The angle advances 9.7° every 67ms throughout — 145°/s, even — and the run ends
at `rotate(269.543deg) scale(0.998785)`: level, own size, counter at 100.
`yarn lint`, `yarn build`, `verify.sh` 0 FAIL.

---

## 2026-09-06 (88) — the curtain's square turns evenly

"It scales and rotates asynchronously and it all feels jerky." Both halves were
true and neither was the pulse.

**The turn was mapped onto load progress**, which creeps, plateaus and then
jumps — so the rotation did all three while the beat ran evenly beside it. It is
a **rate** now, integrated against each frame's elapsed time, so it is even
whatever the load is doing. Measured: 97% of frames advance 2.46–3.5° against a
2.50° ideal at 60fps, and the integrator is capped at 64ms so a main-thread
stall costs a moment of stillness rather than a skip.

**And two springs were writing one transform**, each from its own `onChange`,
each composing with wherever it last saw the other. One ticker subscriber paints
now, sampling everything live — one write, one consistent moment.

It still lands square: the ending puts the turn on a spring aimed at the next
**quarter** turn, so the settle is never more than 90° and never reads as a
slide back to a mark. Measured, it rests at exactly `rotate(270deg) scale(1)`.

[[decisions-log]] ADR-0116.

**Changed**: `preloader.config.ts` (`turn` → `spin` as °/s, plus `settle`),
`preloader.tsx` (painting moved onto the shared ticker; the turn integrated
rather than derived).

`yarn lint`, `yarn build`, `verify.sh` 0 FAIL.

---

## 2026-09-06 (87) — the curtain's square breathes twice, and stops stuttering

Two reports, two different causes.

**"It only shrinks."** True, and the loop was innocent: its first leg takes
~0.63s and the scene reported ready at ~1.2s, so the settle took over before the
square could come back out. The curtain now has `minShow` — a **floor** on how
long it stays, 1800ms, which is two whole breaths. That is not the anti-pattern
ADR-0114 warned about: *ending* on a timer promises something about the network
that cannot be kept, but without a floor a fast connection gets a flash of blue
and a shape that shrank. It still ends only when the scene says so.

**"It lags."** It did, and the cause was not the preloader. The closing screen's
**still** scene was building at page load beside the hero's — every step twice,
back to back — which put six main-thread blocks of 82–199ms under a curtain that
was trying to animate. It waits for `released` now: a screen the reader reaches
minutes later has no business building during the opening.

And the load hands a frame back between its steps — the four builds, the texture
uploads, and the composer's first frame were single tasks and are now separated
by yields. Same work, different shape.

| under the curtain | before | after |
|---|---|---|
| long tasks | 6 | 3 |
| blocked total | ~773ms | **307ms** |
| worst single | 199ms | 182ms |

[[decisions-log]] ADR-0115.

**Changed**: `preloader.config.ts` (`minShow`), `preloader.tsx` (the floor),
`model-viewer.tsx` (a still instance defers to `released`), `model-scene.ts`
(`nextFrame`, yields in `load` and `prewarm`).

**Verified** at 1440x900: turning points now at 0.740 (1022ms) → 1.160 (1680ms)
→ heading down again by 1964ms — shrink, grow, shrink, which is what was asked
for. The run ends at `rotate(358.294deg) scale(0.99675)` with the counter at
100: level, own size. The remaining 182ms is the composer's first frame, one
indivisible call chain; cutting it is its own piece of work. `yarn lint`,
`yarn build`, `verify.sh` 0 FAIL.

---

## 2026-09-06 (86) — the curtain's square breathes, and lands level

Two corrections to (85).

**It pulses instead of growing.** The square drew steadily up to 2.4x across the
load; now it ping-pongs between 1.16 and 0.74 and keeps doing it for as long as
the wait lasts. That is a **second spring on its own clock**, not a function of
progress — a pulse tied to progress stops beating exactly when the wait is
longest, which is the opposite of what a loading indicator is for. `reverse` on
the loop rather than a repeat, so it draws in and opens again instead of
snapping back to full size to start over.

**And it finishes square to the frame.** The turn was 405°, a revolution plus
the forty-five that left it standing on a corner. It is 360° now, and the beat
settles to its own size rather than wherever the loop had reached, so the last
thing before the curtain goes is a square at rest.

**Changed**: `preloader.config.ts` (`turn` 405 → 360, `scale` → `pulse` +
`rest`), `preloader.tsx` (a second `SpringValue`, and one `paint()` composing
the pair — neither spring owns the transform alone).

**Verified** by logging the transform rather than watching it. With the ready
signal temporarily held back six seconds, the turning points alternate cleanly
and indefinitely:

| t | scale |
|---|---|
| 1346 | 0.740 |
| 1976 | 1.159 |
| 2596 | 0.742 |
| 3280 | 1.159 |
| 3903 | 0.742 |
| 4588 | 1.160 |
| 5212 | 0.741 |
| 5898 | 1.160 |

Probe reverted. On the real signal the run ends at
`rotate(359.151deg) scale(0.999)` — level, own size, counter at 100. The beat's
config was set from that measurement too: at half this rate the scene reported
in before the square had drawn in even once, so what the reader saw was a shrink
and a settle rather than a pulse. `yarn lint`, `yarn build`, `verify.sh` 0 FAIL.

---

## 2026-09-06 (85) — an opening curtain

The page now opens on one: a square with a dot on each corner, turning through a
full revolution plus the forty-five that leaves it standing as a diamond, growing
to 2.4x, with a counter upright in the middle. **The dots do not grow** — they
are children of the square and divide its scale straight back out of themselves.

> [!note] The motion described here was replaced the same day by (86)
> The square **pulses** rather than growing, and finishes square to the frame
> rather than as a diamond. The dots, the two signals and the counter's handover
> are unchanged; read (86) for the shape's movement.

**What ends it is the scene, not a timer.** The counter creeps to 0.9 on its own
and the last stretch waits for the model to load and warm. And the hero's
entrance waits for the *curtain*, not for the scene: two signals in
`usePreloader`, deliberately not one, or the letters resolve behind a curtain
that is still up. [[decisions-log]] ADR-0114.

**New**: `use-preloader.ts` (the store), `preloader.config.ts`,
`preloader.tsx`. **Changed**: `model-viewer.tsx` (reports ready, and gates both
its canvas fade and its ink entrance on `released`), `home.tsx` (mounts the
curtain for readers only — a crawler never enters the `three` chunk, so nothing
would ever tell a curtain it could leave).

**Verified** at 1440x900 and 390x844 by logging the run rather than watching it:

| t | |
|---|---|
| 0 → 2.55s | counter 0 → 100, no jump |
| 2.96 → 4.17s | curtain travels to -99.8% |
| 4.37s | curtain gone, scroll unlocked (`lenis`, no `lenis-stopped`) |
| 4.37 → 4.99s | canvas 0.31 → 1.00 |

The canvas reads **0.00 for every sample while the curtain is up**, which is the
ordering the whole design turns on. Dot counter-scale measured 0.816961 against
a square scale of 1.22405 — exact. `yarn lint`, `yarn build`, `verify.sh`
0 FAIL.

> [!bug] `return null` is not an unmount
> First run left the page permanently unscrollable. The curtain hid itself with
> `if (released) return null`, and the scroll-unlock was in an effect cleanup —
> which never ran, because returning `null` removes the element and keeps the
> effects. It unlocks on the state change now.

---

## 2026-09-06 (84) — the tablet's UI was 81% of the size it was promised

**The frame scale's floors were in `rem`, and this app scales `rem`.**
`GRID_BREAKPOINTS` re-bases the root font-size per breakpoint: measured, the
root is **13.03px** at 834px wide. So a floor of `0.8125rem`, written to mean
13px, came out at **10.6** — and with it a 44px control at 35.8 and nav labels
at 12.2. Every floor was delivering 81% of its promise, and worst exactly where
a floor is the whole point. They are `px` now, which is the only unit in that
file that means what it says: 14 / 16 / 24 / 30 / 46 / 22. The same fault was in
fifteen inline `max(…rem, …vw)` values across the stage components; those are
`px` too. [[decisions-log]] ADR-0113.

**And with the floors actually in force, the design's band does not fit a
portrait tablet.** It is two to four things side by side — a landscape shape —
and at 834x1112 the type is now 51% larger than the layout was drawn for: the
summary ran into the button, the claims into the statistics. So the stacking
rule stops being a width. `stacked:` is a custom variant,
`(max-width: 1179px) and (max-aspect-ratio: 1/1)`, and all 97 `max-md:` uses
moved to it.

A landscape phone at 844x390 is almost exactly the design's own 1.8 aspect and
now keeps the band, which the width rule could never have given it.

**Changed**: `globals.css` (px floors, the `stacked` variant, `--frame-navbar`'s
query), and `max-md:` → `stacked:` across `hero-stage.tsx`,
`immersed-stage.tsx`, `delivery-stage.tsx`, `contact-stage.tsx`,
`process-stage.tsx`, `stage-frame.tsx`, `stage-nav.tsx`.

**Verified** by measuring the computed sizes at four windows, not by eye:

| | 390x844 | 834x1112 | 1112x834 | 1440x900 |
|---|---|---|---|---|
| layout | stacked | **stacked** (was band) | band | band |
| body | 14px | **14** (was 10.6) | 14 | 16 = design |
| nav | 16px | **16** (was 12.2) | 16 | 18 = design |
| control | 46px | **46** (was 35.8) | 46 | 50 = design |

No collisions at 834 or 1112, no horizontal overflow at 390, and 1440 lands on
the design's own numbers exactly. `yarn lint`, `yarn build`, `verify.sh` 0 FAIL.

---

## 2026-09-06 (83) — the phone pass, third round

**The painted headings are actually sharp now, and (82) had the wrong culprit.**
Raising the ink atlas changed nothing visible, which should have been the tell:
the atlas was never the limit. The **framebuffer** is the type's resolution —
the display type is painted into the scene, and `clampedPixelRatio` had the
mobile tier at 0.85, measured as a 331x717 buffer for a 430x932 canvas on a 2x
screen. Every glyph was upscaled 2.6x on its way to the panel. Mobile is clamped
at 1.25 now, the same as desktop; the 30fps budget is what pays for the 2.2x
fill. [[decisions-log]] ADR-0112.

**Touch scrolling is smoothed.** `syncTouch` was sitting commented out in the
Lenis options. The OS owns momentum scrolling, so `scrollY` arrives in discrete
steps — harmless for a page of text, visible stepping for a scene deriving every
value from that number, and compounded by the tier's frame budget.

**Air in the hero's column**: the stacked group's gap goes 4 → 6, and the action
row's 4 → 5.

**One gutter at every edge.** The display type was still placed against the
design's `2.0833vw` — 8px on a phone — while the copy beneath it sat in the
column's 20px padding, so every screen had two different left edges. All of it
takes `--frame-gutter` below `md` now, and the second line of a heading pair
keeps a real indent (gutter + 1rem) rather than the near-nothing it had.

**And the headings fit their screens**: the immersed pair at `max(2.5rem, …)`,
the closing screen's at a `15vw` ceiling — measured at 390px, every painted
heading now lands inside the viewport (widest right edge 380 of 390).

**Changed**: `device.ts` (`MOBILE_MAX_DPR`), `scroll-layout.tsx` (`syncTouch`),
`stage-frame.tsx` (column gap), `hero-stage.tsx`, `immersed-stage.tsx`,
`delivery-stage.tsx`, `contact-stage.tsx`.

**Verified** at 390x844 across all five screens: the framebuffer is 487x1055
where it was 331x717, and the name and headings read clean-edged; every
`data-scene-ink` box measured inside the viewport at 360, 390 and 430;
`lenis.options.syncTouch` is true at runtime. `yarn lint`, `yarn build`,
`verify.sh` 0 FAIL.

**And the display headings drop away from the top edge** on the second and
third screens, `--frame-heading-top` (10lvh). The design hangs them at the top
against a landscape frame, where the subject starts immediately below; in
portrait the subject is a long way down and the heading was stranded on its own
over a band of empty ground. Dropped, the heading and the subject read as one
composition. `lvh` rather than `vh` because the screens are `h-lvh` — a heading
that moved when the URL bar collapsed would be the only thing on the page that
did.

> [!note] This one was asked, not guessed
> "Прижми к низу" against a crop of the second screen had two readings — move the
> **subject** down to close the band, or move the **heading** down to it — and
> they are different pieces of work. The subject reading also has a cost the
> screenshot does not show: the camera is one setting for every screen, so
> lowering it there puts the model back onto the first screen's copy column,
> which was the fix two rounds ago. The heading was the intent.

---

## 2026-09-06 (82) — the phone pass, second round

Eight corrections on top of (81), all of them things that only show up on a
phone.

**The painted headings are sharp.** The ink atlas was rasterised at the
framebuffer's scale — the pixel ratio *after* the fill-rate clamp, 0.85 on a
phone — and then shown on a 3x screen. Glyph coverage is not fill: the letters
are drawn once and sampled forever after, so the clamp was buying nothing there.
The atlas now has its own scale, at least 2 device pixels per CSS pixel, capped
at 4096. [[decisions-log]] ADR-0110.

**The first screen's rule is measured, not computed.** A fixed distance up from
the bottom edge is right for a band of the design's own height and meaningless
for (81)'s column — it landed through the middle of the paragraph. Below `md`
the scene reads `[data-stage-rule]`, the row of actions the line belongs above.

**The four links fold into a disc** — a white circle with three lines, in a row
with the blue action, links on tap. (81) stacked them, which worked and spent
two rows of the screen on navigation. `StageNav` becomes a client component for
exactly one boolean. ADR-0111.

**And five smaller things**: the hero's action and its aside link share one row;
the model is bigger on every screen (`camera.mobile.fitMargin` 1.5 → 1.16,
`targetHeightRatio` -0.34 → -0.2 — (81) pulled it back further than the copy
needed); the second and third screens' headings take a floor of their own so
they read as display type rather than as subheadings; the address pill is twice
the control height; and the process screen holds. That last one was the steps
finishing at ~0.5 against an overlay that started leaving at 0.56 — a tenth of
the runway at full black. The stagger is tighter (0.13 → 0.11, arrival 0.18 →
0.16) and the exit later (0.56 → 0.66).

**Changed**: `scene.config.ts` (`stageInk`, `stageRule.markerGap`,
`camera.mobile`), `model-scene.ts` (atlas scale, the measured rule row),
`gallery.config.ts` (`process.arriveAt`, `process.stagger`),
`curved-gallery.tsx` (the overlay's exit), `stage-nav.tsx` (rewritten as the
disc), `hero-stage.tsx`, `immersed-stage.tsx`, `delivery-stage.tsx`,
`contact-stage.tsx`.

**Verified** at 390x844 on all five screens and at 1440x900 for regressions: the
name and both immersed headings are clean-edged where they were stepped; the
rule sits above the action row; "Four hundred takes" fits (right edge 343 of
390, where it was running off); the disc opens its four links; the three process
steps are still at full black at 0.72 where they used to be leaving; the address
pill is 88px. Desktop unchanged — the marker path is mobile-only and the frame
scale still evaluates to the design's own numbers at 1440. `yarn lint`,
`yarn build`, `verify.sh` 0 FAIL; console clean apart from the pre-existing
`/privacy-policy` prefetch 404.

---

## 2026-09-06 (81) — tablet and phone

The stage frame keeps scaling with the window's width — that is what holds the
composition together — but type and controls no longer shrink with it. A new
frame scale (`--frame-body`, `--frame-lead`, `--frame-figure`, `--frame-nav`,
`--frame-control`, `--frame-gutter`) is `max(floor, design)` at every size.
[[decisions-log]] ADR-0109.

**Tablet needs nothing else.** It is the same composition with smaller numbers;
what was wrong with it was 9px body copy, and the floor fixes that.

**The phone gets a second shape.** Below `md` (768px — the same threshold
`deviceTier()` uses, so layout and scene agree) each screen's bottom group stops
being a band across the window and becomes a column:

- **hero** — claim, summary, the two notes as one row, a full-width button, the
  aside link;
- **immersed** — the two claims, then each statistic as a rule with its figure
  and sentence beside it;
- **delivery** — the four stepped lines become a plain list, the note sets left;
- **contact** — the address pill goes full width and centres, at 44px;
- **process** — three columns are 108px each on a phone, which is a margin, not
  a column. They stack into a list at the foot of the screen, over the strip,
  and keep the per-step reveal windows from (80). The two column rules are
  hidden: they are the gaps between three columns and there are none.
- **the bar** — the links pill and the call to action stack, both at 44px. Side
  by side they want ~420px, and the four links are the only navigation the page
  has, so shrinking them away was not on offer.

**Also**: the camera pulls back and frames higher on a phone (`camera.mobile`)
— `fitCamera` fills the tighter axis and on a portrait window the bust ran the
full height with the copy on top of it. And the gallery card is capped at
`min(25rem, 84vw)`, because the rem grid lands 25rem at ~433px on a 390px screen
and the photograph bled off both edges.

**Changed**: `globals.css` (the frame scale, `--frame-navbar`),
`stage-frame.tsx` (`stack`, `underBar`, `className`, `stackChild`),
`hero-stage.tsx`, `immersed-stage.tsx`, `delivery-stage.tsx`,
`contact-stage.tsx`, `process-stage.tsx`, `stage-nav.tsx`, `stage-nav-bar.tsx`,
`scene.config.ts` (`camera.mobile`, `card.maxWidthVw`), `model-scene.ts`
(`fitCamera` reads the tier), `gallery-card.tsx`.

**Verified** at 390x844, 834x1112 and 1440x900, on all five screens each: no
horizontal overflow at 390; every stacked group readable and clear of the
floating bar; the phone's camera leaves the copy clear ground. Desktop is
untouched **by measurement** — at 1440 the frame scale evaluates to 16 / 40 / 18
/ 50px against the design's own 16 / 40 / 18 / 50. `yarn lint`, `yarn build`,
`verify.sh` 0 FAIL.

> [!bug] One real bug found by looking, and it would not have shown up any other way
> The tablet lost the whole bottom group of every screen. `h-[55.5556vw]`
> written immediately before a template interpolation in a `className` is not a
> candidate Tailwind's scanner recognises, so the rule was never generated — the
> class sat on the element with no rule behind it, the box collapsed, and the
> copy went 434px below the fold. Conditional class lists are now built from
> plain string literals joined with `join(" ")`. ADR-0109.

---

## 2026-09-06 (80) — the process screen reads in order

Brief, then build, then batch — the three columns now arrive in the order they
are meant to be read, paced by the strip's own scroll, instead of resolving
together on the overlay's single fade.

All three are present from the first frame at a **floor** rather than at nothing:
the screen's shape is there and the later columns ink in as the reader comes down.
Each heading uses the site's letter-by-letter resolve; each body only **darkens**,
on a plain ramp trailing its heading — the two gestures at once were competing.

Mechanically it is one number: `applyTurn` publishes the raw turn as
`--strip-travel` and each step is a `calc()` window on it, so there is no clock
per column and nothing to keep in step. `StageReveal` gained an optional `floor`
(default 0, so every other heading is untouched). [[decisions-log]] ADR-0108.

**Changed**: `gallery.config.ts` (`process` block — floor, arrival, stagger, span,
body lag), `curved-gallery.tsx` (publishes `--strip-travel`), `stage-reveal.tsx`
(`floor`), `process-stage.tsx` (per-step window, body ramp).

**Verified** at 1440x900 by driving `--strip-travel` directly and reading the
computed opacities back — headings averaged over every letter, bodies as a whole:

| travel | Brief | Build | Batch |
|---|---|---|---|
| 0 | 0.16 / 0.16 | 0.16 / 0.16 | 0.16 / 0.16 |
| 0.18 | **1** / 0.69 | 0.19 / 0.16 | 0.16 / 0.16 |
| 0.26 | 1 / **1** | 0.67 / 0.38 | 0.16 / 0.16 |
| 0.34 | 1 / 1 | **1** / 0.88 | 0.28 / 0.16 |
| 0.42 | 1 / 1 | 1 / 1 | 0.99 / 0.56 |
| 0.50 | 1 / 1 | 1 / 1 | 1 / 1 |

In order, never below the floor, each body behind its own heading, and all three
complete by 0.5 — before the overlay starts leaving at 0.56.

> [!note] The visual pass did not run
> The browser pane was hidden, and a hidden pane stops `requestAnimationFrame`:
> the ticker never reads scroll, so `--strip-travel` stays at 0 however far the
> page is scrolled, and screenshots come back black. Injecting the number tests
> the same chain without the driver — and the driver is demonstrably writing the
> property, which is visible in the layer's inline style. Worth re-checking on
> screen next time the pane is open.

`yarn lint`, `yarn build`, `verify.sh` 0 FAIL.

---

## 2026-09-06 (79) — one loop, a parallax that lets go, and columns that stay

**Smooth scroll and the animations now share one frame.** Lenis ran its own rAF
beside the shared ticker, so the order between "write the scroll position" and
"read it back" was mount order. It was wrong: measured, a frame in which the page
had already moved 64px still drew the gallery where it had been the frame before
— a constant one-frame arrears the whole way down the strip, which is what the
gallery "scrolling unevenly" actually was. `subscribeToTicker` takes a priority,
and `ScrollController` drives `lenis.raf` from the shared loop at
`SCROLL_PRIORITY`, before every reader. [[decisions-log]] ADR-0105.

**The closing screen's parallax resolves.** Its offsets were multiplied by the
panel's travel, so they peaked exactly when the panel had landed — the heading
resting 3.8vw below its designed inset and the copy 3.6vw above its foot, both
drifted in toward the middle of the frame. That displaced frame was the one the
reader sits and reads. Both consumers use `1 - travel` now: the planes disagree
while the panel climbs and agree when it arrives. ADR-0106.

**The gallery's column rules no longer disappear.** They lived in `ProcessStage`,
which is the overlay, which fades out before the closing panel climbs — so the
photographs ran down a frame with no columns in it. `CurvedGallery` has a second
slot, `frame`, under the cards and never faded; the rules ship as
`ProcessRules`. ADR-0107.

**Changed**: `ticker.ts` (priority, ordered list, `SCROLL_PRIORITY`),
`scroll-layout.tsx`, `model-scene.ts` + `contact-stage.tsx` (`1 - travel`),
`process-stage.tsx` (`ProcessRules`), `curved-gallery.tsx` (`frame`),
`hero/index.ts`, `home.tsx`.

**Verified** at 1440x900. Loop order: the panel's `--closing-travel` now changes
in the **same frame** the scroll does (0.23932 at 8300 → 0.26325 at 8356, exactly
the 0.000427/px the static sweep gives) where before the first moving frame still
carried the previous value. Parallax: the copy's offset runs -39.4 → -26.1 →
-10.6 → 0 as the panel climbs, and the browser's red copy of the painted heading
now sits **on** the painted one at rest instead of above it. Rules: opacity 1 and
full height at scroll 5600, 7000, 7900 and 8300. `yarn lint`, `yarn build`,
`verify.sh` 0 FAIL.

---

## 2026-09-06 (78) — the rules get quieter, thinner and better timed

Four notes on the horizontal rules, three of them one bug each.

**One device pixel, actually.** `rowAt` returned a fractional row and the ramp ran
a full row past the half-thickness, so a rule landing between two fragment centres
lit both at half weight — two grey pixels instead of one solid one, and it changed
with the window height. The row is snapped to a fragment centre now and the ramp
is written against that snap.

**The delivery rule arrives with its copy, not a screen early.** It was gated on
its scroll zone, which is saturated at scroll 2900 while the lines hanging from
the rule are still at zero and do not start until 3050 — measured, not guessed. It
takes the delivery **layer's** window now, the same value that fades that copy.

**And it crosses the word instead of being chopped by it.** The subject there is a
word drawn as open lace; depth-tested against its solid silhouette the line
disappeared across a region that looks empty. It is mixed into the model's
handover as well now, exactly as the heading is.

**Quieter.** The delivery rule is at 30% of its token, and the three short rules
heading the statistics on the wireframe screen are `bg-stage-immersed-ink/30`.
They are datums the copy hangs from, not dividers demanding attention.

**Gone**: the blue connector beside "See recent runs" in the hero.

[[decisions-log]] ADR-0104.

**Changed**: `scene.config.ts` (`immersedOpacity`, `immersedLayer`),
`scene-shader.ts` (`ruleAt` rewritten, `stageRuleMask` folded into it,
`immersedRuleWeight`, `uRuleImmersedFade`), `model-scene.ts` (`rowAt` snap, the
fade written from `setInkOpacity`), `immersed-stage.tsx`, `hero-stage.tsx`.

**Verified** at 1440x900 with `stageRule.thickness` temporarily at 8 so a hairline
could survive the pane's screenshot scaling, then reverted: at scroll 2900 the
rule is absent where it used to be fully drawn, at 3400 it is arriving with the
copy, at 3900 it runs **unbroken across the "AI"**. Hero and stats screens
re-checked at thickness 1. `yarn lint`, `yarn build`, `verify.sh` 0 FAIL; console
clean apart from the pre-existing `/privacy-policy` prefetch 404.

---

## 2026-09-06 (77) — the rule belongs to one screen, not two

The scene-drawn rule was crossing the wireframe screen, where no full-width rule
was ever meant to be — that screen's only rules are the three short DOM ones down
the right column, each heading a statistic.

It came in with the move in (74): the DOM rule being replaced lived in
`delivery-stage.tsx` alone, but the shader gate was written
`bgZones.y + bgZones.z` and so painted it on the screen before as well. Now
`bgZones.z`. Moving a DOM element into the scene means inheriting its **scope**
as well as its position. [[decisions-log]] ADR-0102, corrected.

**Changed**: `scene-shader.ts` (the immersed rule's zone weight).

**Verified** at 1440x900 with `stageRule.thickness` temporarily at 6 so a
one-device-pixel line could survive the screenshot scaling, then reverted: no
rule on the wireframe screen; the delivery rule still there and still
**interrupted by the chrome word**, which is the proof it is drawn by the quad
and depth-tested rather than laid over the top; the first screen's black rule
unchanged. `yarn lint`, `yarn build`, `verify.sh` 0 FAIL.

---

## 2026-09-06 (76) — no more white strips along the fold

The pictures were continuous at rest and still flashed white strips **while
scrolling**, which is the whole clue: the geometry was right, the way it changed
was not.

`box.corner` was zero, so `seatAt` never interpolated the turn — a band went from
flat to perpendicular between one frame and the next. Flat it covered a
full-height strip; perpendicular it covers a foreshortened ribbon above the
crease, leaving the strip below it covered by nothing, because its neighbour is
still flat and starts lower. At rest that gap usually fell inside `bandBleed`,
which is why every screenshot said it was fixed. Scrolling, every band crosses in
turn and the gap opens and closes with each one.

`corner` is 1.5rem now — about one band against a 28rem card, so the fold still
reads as a right angle but the turn takes several frames and each band is only
ever a few degrees from its neighbour. **A crease made of discrete bands has a
minimum radius, and it is roughly one band.** [[decisions-log]] ADR-0103.

**Changed**: `gallery.config.ts` (`box.corner` 0 → 1.5).

**Verified** at 800x1000 against a red ground, stepping the scroll 9px at a time
across a band boundary and screenshotting every step — at both creases, the one
at the top of the strip and the one at the bottom. No red at any step; a check
that samples a single scroll position cannot see this fault at all. Then repeated
on the real background. `yarn lint`, `yarn build`, `verify.sh` 0 FAIL.

---

## 2026-09-06 (75) — the photographs are continuous

**Correcting yesterday's fix, which was a regression.** Entry (74) cut
`bandOverlap` to 1.004 on the theory that the overlap was tearing the pictures at
the fold. It was not, and at 18 bands that ratio came to **0.12 of a device
pixel** — so it stopped closing the rounding gaps between the bands and put a
hairline across every one of the eighteen seams, which is what "the photos are
still torn" meant.

The bleed is now a **length** (`card.bandBleed`, 0.2rem) rather than a share of
the band, so it cannot shrink when the band count changes — and it reaches
**both** ways. Only reaching downward left the crease bare: there the two bands
meet at ninety degrees, and the folded one's bleed extends in depth rather than
on screen, so nothing covered the wedge the fold's quantisation leaves. Reasoning
in [[decisions-log]] ADR-0101, rewritten.

**Settled by measurement, not by eye**: the section behind the cards was painted
red, which proved the seams were gaps showing the stage rather than a break in
the picture, and made every subsequent change unambiguous.

**Changed**: `gallery.config.ts` (`bandOverlap` → `bandBleed`),
`gallery-card.tsx` (symmetric bleed, compensated slice offset).

**Verified** at 800x1000, against the red ground and then the real one: no
hairline at any of the eighteen seams, and both creases — the card folding at the
top of the strip and the one folding at the bottom — continuous. `yarn lint`,
`yarn build`, `verify.sh` clean.

---

## 2026-09-06 (74) — bigger cards, no tear, and two things that belong under the model

**The photographs are bigger**: `card` 19x21rem → 25x28rem, with `box.step`
24 → 31 so the gap between cards on the flat is the 3rem it always was, and
`bands` 14 → 18 to keep the crease landing at the same 1.5rem granularity.

**The tear along the top and bottom of a card is gone.** `bandOverlap` was 1.06,
written for a *rounded* corner where consecutive bands are chords of an arc and
leave gaps on the outside of the bend. With `box.corner` at zero there is no arc
and nothing to close — the overlap simply spilled six percent of every band into
the next, and across a ninety-degree crease that sliver is drawn perpendicular to
the band covering it, so it read as a doubled slab of the picture. Now 1.004.
[[decisions-log]] ADR-0101.

> [!warning] Corrected by (77): it is the **delivery** screen's rule, one zone
> only. As shipped here it was weighted `bgZones.y + bgZones.z` and also crossed
> the wireframe screen, which has no full-width rule.

**The immersed screens' rule is drawn by the scene**, not by a DOM span in front
of the canvas — so it passes under the wireframe bust and under the chrome word
instead of across them. Same move as the first screen's rule, same reason.

**And the heading shows through the subject** below the tide line. The model's
surface is given to the stage down there, but it still writes depth, so the quad
was rejected behind it and the painted heading came out cut in the shape of a
body that is not itself visible. The model's shader mixes the ink into the stage
it dissolves towards, gated to the immersed zones so the first screen still keeps
the name behind the model. ADR-0102.

**Changed**: `gallery.config.ts`, `scene.config.ts` (`immersedTopRatio`),
`scene-shader.ts` (`ruleAt`, the immersed rule, ink into the model's handover),
`model-scene.ts` (`rowAt`, the immersed rule's colour), `delivery-stage.tsx`.

**Verified** at 1200x750: a card on the crease folds without a doubled slab; the
rule is interrupted by the chrome word rather than crossing it; "Four hundred
takes" reads across the wireframe body; the first screen is unchanged — name
behind the model, one rule, interrupted by the subject. `yarn lint`,
`yarn build`, `verify.sh` clean, console free of shader errors.

---

## 2026-09-06 (73) — the strip has its artwork

Seven photographs into `public/assets/gallery/`, wired to the seven cards. The
placeholder surfaces are gone; the strip carries real work.

The exports were renamed `work-01.png` … `work-07.png` to match the card ids, so
the data file reads as a list rather than a column of hashes — and re-exporting
one now means overwriting a file instead of re-wiring a path.

**Each `title` describes what is in the frame**, because it is the card's
accessible name (`role="img"` + `aria-label` on the item, `alt=""` on the image
under it). None of them claims a client: the pictures show garments, not
commissions, so they are described as what they are.

Ordered so neighbours differ — studio, editorial, outdoors, round again. Two or
three are on screen at once, and a run of similar frames reads as one long
picture rather than as separate pieces.

The eighth placeholder is gone: seven images, seven cards. Nothing in the
gallery's geometry is fixed to the count.

**Changed**: `src/data/mocks/home.ts`, `public/assets/gallery/`.

**Verified** at 1200x750: all 98 band images (7 cards x 14 bands) load, served
through `/_next/image` as optimised variants; the bands of a card are continuous
across its fold. `yarn lint`, `yarn build`, `verify.sh` clean.

---

## 2026-09-06 (72) — a quieter field, and a last screen that stays

**The field moves less and lands softly.** `tideField.scrollDrift` 1.6 → 0.45,
the surge halved, and the scroll it reads is now eased through a 0.4s follower
(`scrollResponse`) instead of taken raw — a flick of the wheel used to snap the
ground with it. Felt rather than watched. [[decisions-log]] ADR-0099.

**The delivery screen no longer fades out.** It is the last screen of the
runway, and the thing that takes it away is the pinned stage scrolling into the
next section; fading at 0.86 left the reader watching an empty field for the
last stretch of the pin. Its window says so now — `out` and `end` both 1, which
is how `fadeLayers` expresses "no exit". ADR-0098.

**Changed**: `scene.config.ts` (`scrollDrift`, `scrollSurge`,
`scrollResponse`), `model-scene.ts` (the eased follower),
`model-viewer.tsx` (the delivery window).

**Verified** at 1200x750: the delivery layer measures 1 at 0.75, 0.90 and 0.99;
the field shifts only slightly between 0.35 and 0.45 where it used to jump.
`yarn lint`, `yarn build`, `verify.sh` clean, console free of shader errors.

---

## 2026-09-06 (71) — depth on the closing screen

The closing block's planes now disagree about how far they have travelled, which
is the only depth cue available to a panel that rises as one piece. The name
lags behind, the copy leads, and the subject sits between them as the anchor.
Reasoning in [[decisions-log]] ADR-0100.

`applyRise` publishes the panel's phase as an inline `--closing-travel`. The
copy is DOM and takes it in a `calc()` transform. The name is a texture the
scene paints, so it takes a uniform instead — new `uInkShift`, applied where the
ink is sampled — and the scene reads the property back off the panel's inline
style, which costs nothing where `getComputedStyle` would force a recalculation
every frame.

**Changed**: `scene.config.ts` (`closingParallax`), `curved-gallery.tsx`
(publishes the travel, `data-closing-panel`), `contact-stage.tsx`,
`scene-shader.ts` (`uInkShift`), `model-scene.ts` (reads the panel, drives the
shift).

**Verified** at 1200x750 by making the browser's own copy of the name visible in
red beside the painted one: the red copy, which does not move, sits clearly above
the white one at the end of the travel — the lag, made visible. The copy's
transform measures exactly `-3.6vw` at full travel. `yarn lint`, `yarn build`,
`verify.sh` clean, console free of shader errors.

---

## 2026-09-06 (70) — the star stops snapping, and the field travels

**The accent's jitter during the morph is fixed.** Its angle was
`elapsed * accentSpin` behind a `morph === 1` gate, so the star jumped to
whatever the clock had accumulated the instant the gate opened — and jumped back
every time the morph dipped under 1 again, which it does constantly while the
reader scrolls around the end of it. The angle is integrated now and the gate is
a ramp (`text.accentSpinFrom`): crossing it only changes the speed.
[[decisions-log]] ADR-0096.

**The blue field now moves with the scroll.** Two terms, different in kind:
`tideField.scrollDrift` slides the noise domain as the reader descends —
position, so it travels with them and stops when they stop — and
`tideField.scrollSurge` leans the fire front by the same eased speed the stage
lines bow on. More clock would only have made it busier; what was missing was
the reader's own movement. ADR-0097.

**Changed**: `model-scene.ts` (`spinAccent` integrated, the two tide uniforms),
`scene-shader.ts` (`uTideScroll`, `uTideSurge`), `scene.config.ts`
(`accentSpinFrom`, `scrollDrift`, `scrollSurge`).

**Verified** at 1200x750: the field is visibly in a different place at 0.35 and
0.45 where it used to be the same picture; the accent turns continuously through
the end of the morph. `yarn lint`, `yarn build`, `verify.sh` clean, console free
of shader errors.

---

## 2026-09-06 (69) — a longer morph and chrome worth looking at

**The morph takes nearly twice the scroll**: `stages.morph` 0.48–0.64 →
0.44–0.74. `rotation.to` and `spin.from` moved with it — those three are one
instant, where the bust hands the turn to the word — and `text.fill` follows at
0.76 so the pour does not start into a word still assembling. Everything inside
the morph is in morph-local units and stretched for free. [[decisions-log]]
ADR-0095.

**The chrome was rebuilt around what it reflects.** A mirror has no shading of
its own, and it was reflecting `RoomEnvironment` — a diffuse box with nothing in
it — which is why no amount of roughness or intensity made it read as metal. It
now has its own painted studio (`chrome.environment`): sky, hard horizon, key
softbox, floor bounce, four vertical strips, prefiltered into its own PMREM and
hung on the word's material alone so the skin's lighting is untouched.

Roughness 0.3 → 0.12 (there is something to reflect now), `envMapIntensity`
17 → 13, and the sky deliberately not white — it is the largest area, so at 1.0
the broad faces bloomed as one and the form vanished. Bloom retuned with it:
threshold 0.82 → 0.95, strength 0.62 → 0.42. ADR-0094.

**And the second and third screens no longer dissolve through each other** — the
immersed window now closes at 0.48 and the delivery one opens at 0.56, where they
used to overlap by two hundredths. Same fault as the first seam, found while
checking this one.

**Changed**: `scene.config.ts` (morph, rotation, spin, fill, chrome, bloom),
`model-scene.ts` (`buildChromeEnvironment`), `model-viewer.tsx` (the two
windows).

**Verified** at 1200x750: the word is still travelling at 0.58 where it used to
be nearly formed, assembled by 0.72, and the chrome at 0.97 has a dark horizon
band through the form, hot bevels and a legible shape instead of a glowing slab.
`yarn lint`, `yarn build`, `verify.sh` clean, console free of shader errors.

---

## 2026-09-06 (68) — a brighter lamp, a bar that actually leaves, a clean seam

**The lamp on the immersed mesh is much stronger.** `dim` 0.42 → 0.26 and `lift`
1.35 → 2.6 — the weight it multiplies is `immersedOpacity`, so anything under
1/0.42 left the lit patch short of full strength and the whole thing read as a
slightly less grey area. And it has its own glow now: a separate, higher
`haloLift` (4.2) drives the mesh's **halo**, the scaled screen-blended copy that
is the scene's own bloom. A full-screen bloom pass could not be used here — it
would light the painted headings on this stage too (ADR-0088) — so the lamp gets
its bloom where it can be aimed.

**The navigation bar leaves properly.** Its `<ProgressTrigger>` was sized to the
band it lives over, and a trigger stops reporting once its element is off screen
— so scrolling back to the top never told it to go, and it froze half-open as two
circles over the first screen. The marker now spans the document and the band is
arithmetic. It fades as it closes as well, because the clip's floor is a disc.
[[decisions-log]] ADR-0092.

**Nothing is drawn over the blue at the seam any more.** The first screen's copy
sits along the bottom edge, which is where the tide arrives *first*, so on one
shared window it was still half-there under the field. The two halves now leave
ahead of the line coming for each: the copy by 0.12, the name by 0.26.
ADR-0093.

**Changed**: `scene.config.ts` (`pointerGlow`), `scene-shader.ts` (`glowNear`,
`glowHalo`, halo weight), `stage-nav-bar.tsx` (document-wide marker, fade on
close), `model-viewer.tsx` (the two first-screen windows).

**Verified** at 1400x800: bar hidden at the top, up through the middle, gone at
the end **and gone again after scrolling back to the top**; nothing of the first
screen visible over the field at 0.14 or 0.21; the mesh reads as a bright pool
under the cursor against a held-back body. `yarn lint`, `yarn build`,
`verify.sh` clean, console free of shader errors.

---

## 2026-09-06 (67) — the second screen on its own clock, and a lamp on the mesh

**The first screen leaves more slowly** (`end` 0.18 → 0.26) and **the second no
longer starts until the field has filled the frame** — `stages.tide` finishes at
0.28, and that is now its `in`. From there it plays on a **spring rather than on
scroll**: new `auto` flag on a layer window turns its edges into thresholds and
lets the spring own everything between. Reasoning in [[decisions-log]] ADR-0090.

**The navigation bar sits where the design puts it** — `bottom-[2.0833vw]`, the
same gutter as everything else on the screen; it had been three and a half
viewport-widths too high. Its arrival is new: each plate opens **out of a circle**
from the middle of the screen, the pill leftwards and the call to action
rightwards, done with `clip-path` so the rounded ends stay round and the type is
never stretched. The labels resolve behind the opening.

**The pointer is a lamp on the immersed stages.** The mesh and the sparks are
held back to 0.42 and lifted to 1.35 within a radius of the cursor, so the model
reads as something being looked over rather than an even sheet of light. Screen
space, not the surface — it is a light held up to the model, not a mark left on
it. The dim holds when the cursor leaves; only the lit patch travels off. Gated
on `(hover: hover)`. ADR-0091.

**Changed**: `model-viewer.tsx` (`auto` windows, per-layer springs,
`paintLayer`), `stage-nav.tsx`, `stage-nav-bar.tsx` (clip reveal, placement),
`scene-shader.ts` (`glowFunction`, wireframe and spark weights),
`model-scene.ts` (the lamp), `scene.config.ts` (`pointerGlow`, exit spring).

**Verified** at 1400x800 across the runway: the second screen's type holds off
until the field is full and then resolves on its own; the nav opens from two
circles at the centre and sits at the design's margin; the mesh is quiet with the
cursor away and lights under it. `yarn lint`, `yarn build`, `verify.sh` clean,
console free of shader errors.

---

## 2026-09-06 (66) — five visual bugs, one of them three deep

**The navigation bar was off-screen at any real width.** `StageNav` still carried
`absolute left-1/2 top-[50vw]` from when it lived inside a stage frame; kept
after the move into `<StageNavBar>` it pushed the bar half a viewport-width below
the fixed wrapper holding it. Harmless at 900px, invisible at 1900. It has no
placement of its own now.

**Painted type is measured in layout space.** The closing screen's scene sits
inside the gallery's rising panel, so everything measured with
`getBoundingClientRect` was measured through that panel's tilt — including the
drawing buffer, which came out 2356x1347 for an 1885x980 box, stretching the
camera and throwing every painted heading right and large. The surface now sizes
from `clientWidth`/`clientHeight` and each piece of type from an `offsetParent`
walk. [[decisions-log]] ADR-0087.

**No more glow on the delivery headings.** Bloom is on for exactly that stretch
of scroll — the chrome pour — and type painted into the frame before a
full-screen bloom pass glows. Nothing on that screen needs to sit behind the
model, so it is DOM again with `<StageReveal>`. ADR-0088.

**The model no longer stops dead.** The scroll-driven turn is a critically-damped
follower rather than progress mapped onto an angle, so it carries past where the
scroll left it and settles. ADR-0089.

**The reveals are slower**: every layer window widened (the first screen's out to
0.18, the immersed 0.12-0.46, the delivery 0.52-0.99, the gallery overlay
0.02-0.56) and the arrival spring softened from 120 to 62 tension.

**Changed**: `model-scene.ts` (`layoutBox`, `cssLength`, layout sizing, turn
follower), `stage-nav.tsx`, `delivery-stage.tsx`, `model-viewer.tsx`,
`curved-gallery.tsx`, `scene.config.ts`.

**Verified** across the whole page at 1200 and 1900 wide, screen by screen: name
centred and whole, immersed headings behind the wireframe, delivery headings
unglowing, chrome pouring, process names resolving, closing heading at its left
margin and complete, nav hidden at the top, up through the middle, gone before
the closing block. `yarn lint`, `yarn build`, `verify.sh` clean, console free of
shader errors.

---

## 2026-09-06 (65) — all the headings, the nav, and a chrome regression

**The chrome word was not rendering at all**, and it was mine: ADR-0079 added a
`neutralToneMap` call to the word-chrome material without adding the function to
*that* material's chunk — the earlier edit only reached materials that include
`stageFunctions`. The fragment shader failed to compile, so the poured letters
drew nothing while the lattice around them carried on. Found in the console,
which had been logging it all along; one missing include.

**The painted name was being clipped.** `leading-none` sets the line box to one
em while the display face's ink runs taller — measured at 238px of ascent and
descent inside a 189px line — so a texture the size of the element's box shaved
the tops and the descenders. The DOM never showed it because `overflow` is
visible. The texture is now grown to the ink's measured extent on all four sides.

**Every level-1 heading is painted by the scene**, not just the first screen's
name: the ink system takes many pieces of type into one atlas, keyed to the layer
that fades each. That is also what puts the immersed and delivery headings
**behind the model** — the quad they are drawn by depth-tests against the subject.

**Second-level copy resolves by word**, and the process screen's names by letter,
through the new `<StageReveal>` — CSS only, driven by the `--stage-reveal` the
layers already write. Reasoning for the split in [[decisions-log]] ADR-0085.

**One navigation bar for the whole middle of the page**, arriving once after the
first screen and leaving once before the closing block, on a rise rather than a
fade. ADR-0086.

**Smoother throughout**: a unit's own fade is now smoothstepped before the ease
rather than eased alone, so it starts moving gently instead of switching on.

**Changed**: `scene-shader.ts` (ink atlas uniforms, chrome include),
`model-scene.ts` (multi-piece painter, `packInk`, per-layer `setInkOpacity`),
`model-viewer.tsx` (`data-scene-layer`, per-layer windows, `LAYER_WINDOWS`
hoisted, still instances get a window), `stage-reveal.tsx` and
`stage-nav-bar.tsx` (new), all five stage components, `curved-gallery.tsx`,
`scene.config.ts`, `home.tsx`.

**Verified** on a production build: the chrome pours again; the name keeps its
descenders; "Four hundred takes" is occluded by the wireframe head; headings
resolve in scrambled order and copy resolves by word; the nav is hidden at the
top, up through the middle, and gone at the end. `yarn lint`, `yarn build`,
`verify.sh` clean (0 FAIL), console free of shader errors.

---

## 2026-09-06 (64) — the name resolves letter by letter

Built against `trionn.com`, measured rather than eyeballed. Reasoning in
[[decisions-log]] ADR-0084.

**The first screen's name arrives and leaves one character at a time**, in a
scrambled order, on opacity alone — no rise, no scale. The reference does its
twenty-four characters over a 730ms spread at ~500ms each; ours is held as
fractions of the layer's window (`inkLetters.spread` 0.6, `ease` 2) so it stays
in step with the screen however long that window is.

It is done **in the scene**, not with `spring-text-engine`: the name is a texture
now (ADR-0083), so there are no letter elements, and the engine's scroll modes
cannot drive an element that never moves while the stage is pinned. A
`uInkChar` array carries each character's start across the texture and its
current alpha; the shader folds over it to find which letter a fragment is in.

**Both directions come from one place.** A `SpringValue` entrance (1300ms,
clamped) and the layer's scroll window are multiplied and handed to
`setInkOpacity`, which turns any value into the per-letter stagger — so the
arrival on load and the departure on scroll are the same code read forwards and
backwards.

**Changed**: `scene.config.ts` (`inkLetters`), `scene-shader.ts` (`INK_CHARS`,
`uInkChar`, `inkLetter`), `model-scene.ts` (per-letter measurement,
`shuffledSeed`, `setInkOpacity`), `model-viewer.tsx` (entrance spring).

**Verified** on a production build: entrance measured at 1300ms end to end, mid
-entrance only a couple of letters standing; scrolling into the layer's falling
edge takes them away in the same scrambled order; the line is whole at rest.
`yarn lint`, `yarn build`, `verify.sh` clean (0 FAIL).

---

## 2026-09-06 (63) — height anchoring, and the name inside the canvas

Reasoning in [[decisions-log]] ADR-0082 and ADR-0083.

**Height is anchored, not scaled.** `StageFrame` was the design's `55.5556vw`
box centred in the stage, so a taller window pushed everything to the middle and
left dead bands top and bottom. It is now full-height and top-anchored, with a
new `StageBottom` hanging the design's own height from the bottom edge. Every
screen splits at the rule: headings to the top group, copy, stats and the nav
pill to the bottom. At the design's aspect nothing moves.

**The name is painted by the scene.** The pointer's mark was wiping the letters,
because the name is a DOM layer behind the canvas and everything the scene draws
over it is opaque. The browser still lays it out and rasterises it — the scene
reads the element's box, font and colour off `data-scene-ink`, paints the glyphs
into a texture and hides the original. Drawn by the background quad it lands
above the mark and below the model, which is the order the design always implied.

**The rule no longer shows through the model.** It was in `stageColor`, which is
what the model dissolves *into* — and the dissolve starts above the waist, so by
the rule's own height the model was handing 20-30% of every fragment to the
stage and the line came through the shirt. It is drawn by the background quad
only, which the model depth-rejects.

**And it is thinner**: `stageRule.thickness` is now buffer pixels, so the line is
one device pixel rather than 1.25 of them — solid, with no grey edge.

**Changed**: `stage-frame.tsx` (`StageBottom`), all five stage components,
`scene-shader.ts` (`inkFunction`, `paintOver`, rule out of `stageColor`),
`model-scene.ts` (`paintStageInk`, `setInkOpacity`, `overlayHost`, rule
geometry), `model-viewer.tsx` (`stageRef`, window → ink), `scene.config.ts`.

**Verified** on a production build at 800x620, 820x400 and through the runway:
the name survives the mark passing over it and is gone by 0.20 with its layer;
the rule is absent across the subject and unbroken beside it; top and bottom
groups hold their edges at both heights; the closing screen and the tide, word
and gallery stages all still render. `yarn lint`, `yarn build`, `verify.sh`
clean (0 FAIL).

---

## 2026-09-06 (62) — the mark on the ground, the rule in the scene

Reasoning in [[decisions-log]] ADR-0081.

**The mark paints the page's ground again**, in the same pure white it has on
the model — measured `255,255,255` on both sides of the silhouette.

**The rule moved out of the DOM and into `stageColor`.** It had to: it belongs
behind the model, and both the mark and the model's dissolved footprint are
opaque canvas pixels that wiped it. Drawn by the stage, the model's dissolve
mixes towards a ground that contains the line — which is exactly what a
transparent model over it would look like, with none of the render-order cost of
actually making the model transparent. New `stageRule` config block and
`ModelSceneOptions.stageRule`, on for the hero only.

**The foot of the dissolve finishes higher**, `fade.endRatio` -0.94 → -0.82 and
`meshEndRatio` -0.8 → -0.7. The last tenth used to spread across the widest part
of the subject and sit there as a haze — measured still 33 levels off the ground
80px from the bottom of the screen. It now reaches the ground exactly, with the
footprint below it indistinguishable from the page.

**Grain: nothing was wrong with it.** Measured directly — two captures inside one
grain seed differ by **0**, two across seeds by **3.6** — so it is live and
resampling at its 24fps cadence on the lit model. It is absent only where the
model hands over to the stage: the foot of the dissolve and inside the mark,
where there is no lit surface left to carry it. That is by construction; grain
there would make the model's footprint visible as a grainy patch against a clean
page.

**Changed**: `scene-shader.ts` (`stageRuleMask`, rule uniforms, background
alpha), `model-scene.ts` (`placeStageRule`, `stageRule` option),
`scene.config.ts` (`stageRule`, fade ratios), `model-viewer.tsx`,
`hero-stage.tsx` (DOM rule removed), `home.tsx`.

**Verified** by reading the framebuffer on a production build with
`preserveDrawingBuffer` temporarily on, then reverted: mark `255,255,255` on the
ground, rule solid black at y=486 against the copy's frame row of 486.6, fade
column reaching the page's exact 240. `yarn lint`, `yarn build`, `verify.sh`
clean (0 FAIL).

---

## 2026-09-06 (61) — the mark is actually white, and the mesh is actually the accent

Three corrections, two of which came from measuring the framebuffer rather than
looking at it. Reasoning in [[decisions-log]] ADR-0079 and ADR-0080.

**Tone mapping moved into the materials.** The mark was set to white and
rendered 241,241,241; the mesh was set to the button's `#0051ff` and rendered
34,146,242. Three only compiles a material's tone mapping when the target is the
canvas, so with a composer the one tone map is `OutputPass` over everything —
including the flat colours the design injects — and the Khronos neutral curve
never reaches 1.0, so pure white was out of its range and no token value could
have reached it. The renderer is now `NoToneMapping`, `OutputPass` does the sRGB
encode alone, and the same curve at the same exposure is called by hand on the
model's lit colour, the word chrome's, and the tide field. **Measured after: the
mark is 255,255,255 exactly.**

**The mesh is at full weight.** A GL line is one device pixel and `linewidth`
does nothing in WebGL, so `wireframe.opacity: 0.5` was blending the accent with
the white behind it — measured 185,192,255. Now 1.

**The mark no longer paints the page's ground.** It wiped the name and the rule,
which are DOM layers behind the canvas so the model can cover them. Reverts that
half of (60); the mark is the model's alone again, still pure white.

**Changed**: `scene-shader.ts` (`neutralToneMap`, `uToneExposure`, background
alpha back), `model-scene.ts` (`NoToneMapping`), `scene.config.ts`
(`wireframe.opacity`).

**Verified** by reading the framebuffer on a production build with
`preserveDrawingBuffer` temporarily on, then reverted: mark 255,255,255, button
`rgb(0, 81, 255)`, line pixels moved from 185,192,255 towards the token (a 1px
line on white never fully covers a pixel). The tide and word stages still render
correctly. `yarn lint`, `yarn build`, `verify.sh` clean (0 FAIL).

---

## 2026-09-06 (60) — the mark, and the first screen's typography

Six corrections, four to the pointer's mark and two to the layout. Reasoning in
[[decisions-log]] ADR-0078.

**The mark no longer ticks forward at slow pointer speeds.** `Brush` keeps a
live head: every sighting of the pointer rewrites the head slot in place, and
only a full `minStep` of travel commits it. Before, anything shorter than a step
was thrown away, so the leading end sat still while the tail decayed and then
jumped a whole step at once. Measured over 60 frames of a very slow drag: 57
stalled frames and 2 full-step jumps before, 0 and 0 after, with the same 6
points laid down.

**The mark is white, and it covers the block, not just the model.** New
`--scene-mark` token (white); `stageColor` mixes the ground towards it instead
of shading it down, and the background quad now carries the mark's alpha on the
white stage, where it used to be fully transparent — which had been clipping the
shape to the silhouette. Note that it therefore paints over the `<h1>` behind
the canvas: passing the pointer across the name wipes the letters under it.

**The mesh under the mark is the accent blue**, `--scene-wire` moved from black
to `--raw-color-electric-500` — the button's colour.

**The name drops** from `-3.2639vw` to `1.3889vw`, clear of the top edge, and
**the rule moves behind the model** — it was drawn in the front layer and ran
straight across the subject's arm; behind, the model interrupts it. All Mulish
copy is set at **110%** leading (`leading-[1.1]`), on every screen.

**Changed**: `brush.ts` (live head, `write`/`commit` split), `scene-shader.ts`
(`uMarkDisplay`/`uMarkWash`, background alpha), `model-scene.ts`,
`scene.config.ts` (`shade` → `wash`), `globals.css` (`--scene-mark`,
`--scene-wire`), `hero-stage.tsx`, `contact-stage.tsx`, `delivery-stage.tsx`,
`immersed-stage.tsx`, `process-stage.tsx`.

**Verified** on a production build at an 800-wide desktop viewport: the mark
draws white with a blue mesh, spills past the silhouette onto the ground, and
wipes the name where it crosses it; the rule stops at the model; the name sits
clear of the top. The brush fix was measured directly against the old code, not
eyeballed. `yarn lint`, `yarn build`, `verify.sh` clean (0 FAIL).

---

## 2026-09-06 (59) — the closing screen arrives on the plane

The blue closing block and the gallery's rising plane are now one thing.
Reasoning in [[decisions-log]] ADR-0077.

**The accent is blue everywhere.** `--surface-accent` was still the orange while
the closing block had been rebuilt blue, so the handover was broken at its only
load-bearing point — the plane the reader watches arrive has to be the ground
they land on. It now shares `--raw-color-electric-500` with `--stage-accent`;
`--raw-color-orange-500` is deleted, and the comments that named the colour
instead of the role were rewritten with it.

**And then the block moved onto the plane.** Separate, they cost two screens of
scroll to deliver one screen of content, the first of them blank blue: the plane
climbed empty, the runway ended, the invitation scrolled up behind it. New
`<CurvedGallery closing>` renders the closing screen inside the panel, so it
tilts and climbs complete. The standalone section is gone — `main` has two
sections now, and the page is one viewport shorter.

- **`panel.landAt` 0.82** — the climb finishes before the runway does, so the
  last stretch is a rest on the landed screen rather than a screen that is only
  square on the final pixel of the page.
- **Landed, `transform: none`** rather than an identity `rotateX(0deg)`, which
  would keep the element in a 3D rendering context and rasterise the display
  type and the canvas soft.
- The panel is no longer `aria-hidden` — it carries the heading and the address.

**Changed**: `globals.css` (accent repointed, orange primitive removed),
`curved-gallery.tsx` (`closing`, `landAt`, transform snap, no `aria-hidden`),
`gallery.config.ts`, `scene.config.ts` (comment), `home.tsx`,
`model-viewer.tsx` (`surfaceToken` in the effect's deps).

**Verified** at 1440-wide production (`:3100`): plane and block both measure
`rgb(0, 81, 255)` with no seam; mid-climb the heading, model, scarcity line,
copy and address pill all ride up on the tilted plane; landed at max scroll the
computed transform is `none` and the screen fills the viewport; document height
down 702px to 8565. `yarn lint`, `yarn build`, `verify.sh` clean (0 FAIL).

---

## 2026-09-06 (58) — the closing screen, on a second scene

Built from Figma frame `2698:1137`. The block that was the orange placeholder is
now the invitation: the accent blue, the heading behind a **live** model, the
scarcity line, the copy, and the address in its own pill. Reasoning in
[[decisions-log]] ADR-0076.

**A second, still instance of the scene.** `<ModelViewer still>` drops the
runway and the scroll trigger and renders one screen; nothing advances the
scene, so it holds the first stage — textured model, pointer's mark live —
which is exactly what the design shows. The render loop needed no change: it
runs off the shared ticker rather than the scroll trigger.

**It is told its ground.** New `ModelSceneOptions.surfaceToken`, passed
`--stage-accent` here. The model dissolves towards its stage's colour and hands
itself over to it under the mark, so an instance reading `--scene-surface` on a
blue block would smear porcelain over it — ADR-0074's defect by another road.

Layers as before: `<ContactStageTitle>` behind the canvas so the model stands in
front of the words, `<ContactStageCopy>` over it, both in the shared
`<StageFrame>`. No windows here — there is no runway to have windows on.

**Changed**: `contact-stage.tsx` (new), `hero/index.ts`, `model-viewer.tsx`
(`still`, `surfaceToken`), `model-scene.ts` (`surfaceToken`), `home.ts`
(`accent` → `contact`), `home.tsx`.

**Verified**: two canvases, three sections; the closing block shows the blue
ground, the heading behind the live model, and the copy and address in front.
`yarn lint`, `yarn build`, `verify.sh` clean (0 FAIL).

---

## 2026-09-06 (57) — the gallery's screen

Built from Figma frame `2697:1119` — the three steps that run across the
travelling strip. Same pattern as the three screens before it (ADR-0075), moved
onto the **gallery's** own runway rather than the scene's: its Figma background
is a render of the cards going past, so the strip underneath is the live one and
nothing is imported.

`<CurvedGallery>` now takes an `overlay`, drawn inside its pinned stage and
faded on the same turn progress it already tracks — in over 0.04–0.12, out over
0.42–0.52, so the copy arrives with the cards and is gone before the closing
panel starts climbing at `scroll.riseStartViewports` (half way down that
runway).

`<ProcessStage>` reuses `<StageFrame>` and `<StageNav>`, so the fourth screen
cost neither a coordinate frame nor a nav pill. Its copy is **black** — this
stage is the porcelain ground, not the tide — and the rules between the columns
are `stage-ink/10`.

The three steps are an ordered list, because that is what they are. Each `li`
spans the frame's full height and carries its own heading at the top and its
body at the foot: a column, not a card. The two rules are the gaps *between*
columns rather than borders *on* them, so they are their own elements at the
design's own x.

**Changed**: `process-stage.tsx` (new), `hero/index.ts`, `curved-gallery.tsx`,
`home.ts`, `home.tsx`.

**Verified**: at 0.22 of the gallery's runway the three columns, both rules and
the pill sit over the live strip; at 0.70 the overlay is gone and the closing
panel climbs a clean stage. `yarn lint`, `yarn build`, `verify.sh` clean
(0 FAIL).

---

## 2026-09-06 (56) — the third screen, and the parts the screens share

Built from Figma frame `2696:1099` — the copy that rides the mark the bust
becomes. Same pattern as the two before it (ADR-0075): a layer over the scene's
pinned stage, not a section, with its background left to the live scene because
the Figma's is a render of exactly that.

`<DeliveryStage>` goes in as `delivery`, with a window of 0.58–0.65 in and
0.90–0.97 out — the mark is formed by the end of `stages.morph` (0.64) and poured
with chrome from `text.fill` (0.7), so the copy arrives as the letters stand and
leaves with the runway.

**Two things were extracted rather than copied a third time.**

- `<StageFrame>` — the `55.5556vw` centred coordinate frame every screen is
  drawn in. It was duplicated in the first two screens; a third copy is how the
  screens quietly drift out of register with each other.
- `<StageNav>` — the pill of links and the call to action. It is the same object
  in the same place in both the second and third designs.

The heading is two blocks on one baseline, one hung on the left margin and one
picked up past the middle, so the mark stands in the gap between them — set as
a single string with padding, that gap would land wherever the text happened to
wrap. The deliverables are a real `ul` whatever their stepped indents look like;
the indents are per item, from the design.

**Changed**: `delivery-stage.tsx`, `stage-frame.tsx`, `stage-nav.tsx` (new),
`hero-stage.tsx` and `immersed-stage.tsx` (now share both), `hero/index.ts`,
`model-viewer.tsx`, `home.ts`, `home.tsx`.

**Verified** at four scroll positions: 0.50 shows a clean stage between the
second screen's exit and this one's entry, 0.68 the third screen complete over
the live wireframe mark, 0.99 the poured chrome alone with the copy gone. `yarn
lint`, `yarn build`, `verify.sh` clean (0 FAIL).

---

## 2026-09-06 (55) — the second screen

Built from Figma frame `2695:1078`, to the same rules as the first. Reasoning in
[[decisions-log]] ADR-0075.

**Another layer, not another section.** The frame's background is a render of
the tide stage the scene already draws, so nothing is imported: the heading,
the two claims, the three ruled statistics and the pill of links sit over the
live field. `<ImmersedStage>` is passed to `<ModelViewer>` as `immersed` and has
its **own window** on the runway — in over 0.16–0.24, out over 0.34–0.42, keyed
to `stages.tide` and `stages.deep` — so it arrives with the field and is gone
before the letters. `ModelViewer`'s fade now drives a list of windows rather
than one hard-coded ramp.

**Proportions**: every length is its Figma pixel over 1440, in `vw`, in the same
`55.5556vw` centred frame the title stage uses — so the two screens are in
register with each other as well as with the design.

**Tokens**: `--stage-immersed-ink` (white), `--stage-pill` and
`--stage-pill-ink` — the second screen rides a dark field, so its copy is the
inverse of the title stage's ink and its pill is a light island on it. The
pill's hairline border is `stage-pill-ink/10` rather than a fourth token.

**Changed**: `immersed-stage.tsx` (new), `hero/index.ts`, `model-viewer.tsx`,
`globals.css`, `home.ts`, `home.tsx`.

**Verified** at three scroll positions: 0.02 shows the title screen alone, 0.29
the second screen complete over the live mesh and field, 0.50 a clean stage with
the layer gone before the letters arrive. `yarn lint`, `yarn build`,
`verify.sh` clean (0 FAIL).

---

## 2026-09-06 (54) — fixing the transparency I broke

Reported: the hover and the bottom mask are broken. Both were, and by my own
change. Reasoning in [[decisions-log]] ADR-0074.

**The model is opaque again.** Entry 53 turned its hand-over to the stage into
transparency on the white stage — and the mark and the bottom fade are both
built on that hand-over, with the wireframe screen-blended against what it
leaves behind. The dissolve is a colour again, which is indistinguishable from
dissolving into the page now that the scene surface *is* the page's ground.

**The ground is written premultiplied.** My first fix wrote straight alpha and
the title behind the canvas washed out: the context is `premultipliedAlpha` and
the background material has no blending, so a full-strength colour at alpha 0
still reaches the page. Confirmed with `getContextAttributes()`.

**The overlay fades with the scroll.** The layers sat over the tide and the
letters for the whole seven-viewport runway; their opacity now follows the
scene's own progress and is gone by a tenth of it.

**Changed**: `scene-shader.ts`, `model-viewer.tsx`.

**Verified**: first screen — name full width, live model over its middle, copy
in front, no wash; at 0.30 of the runway the tide is clean, with no overlay left
on it. `yarn lint`, `yarn build` clean.

**Not verified**: the hover mark itself. The preview pane is 749px wide, which
tiers the scene to mobile, where no pointer is attached at all. The logic is
back to what it was before entry 53 touched it, but I have not seen it move.

---

## 2026-09-06 (53) — one screen: the title over the live scene

Reported: the UI has to fit one screen and lie over the 3D hero, not stand as a
second section. Correct — the first cut gave the page the same subject twice.
Reasoning in [[decisions-log]] ADR-0073.

`HeroStage` is gone as a section. It is two layers now, `HeroStageTitle` and
`HeroStageCopy`, passed to `ModelViewer` as `behind` and `front` and rendered
inside the scene's own pinned stage. Both share one `55.5556vw` frame centred in
the stage, which is what keeps them in register and what makes the composition
fit one screen at any window shape. The Figma's still portrait is deleted — the
model is the live canvas.

**The scene's white stage paints nothing now**, so the name can sit behind the
canvas and only the model covers it: renderer `alpha: true` clearing to 0, the
background quad's alpha gated on `zones.y + zones.z`, and the model's hand-over
to the stage expressed as alpha rather than colour on the white stage.
`--scene-surface` is porcelain and must stay equal to `--stage-ground`.

The copy layer is `pointer-events-none` apart from its two links, or it would
swallow the hover the scene's mark is drawn with.

**Changed**: `hero-stage.tsx` (split into two layers), `hero/index.ts`,
`model-viewer.tsx` (`behind` / `front`), `model-scene.ts`, `scene-shader.ts`,
`globals.css`, `home.ts`, `home.tsx`.

**Verified**: one screen, three layers — 3 sections, one `h1`, one canvas, the
name spanning the width with the live model over its middle and the copy in
front. `yarn lint`, `yarn build`, `verify.sh` clean (0 FAIL).

---

## 2026-09-06 (52) — the title stage, from Figma

The first screen, built from the Figma frame `2691:864`. Reasoning in
[[decisions-log]] ADR-0072.

**Proportional in `vw`, not in the rem grid.** Every length is its Figma pixel
over 1440 times 100, so the name spans the screen at any width and the whole
composition scales as one. The app's adaptive rem grid re-bases per breakpoint,
which is right for a layout redrawn at each width and wrong for one drawn once
at 1440 — below 1024 it inflated the stage against its own design width and the
name clipped at both edges.

**Fonts**: Melodrama Light (Fontshare) for the name, committed as woff2 and
loaded with `next/font/local` because `next/font/google` cannot reach Fontshare;
Instrument Serif and Mulish from Google. `--font-sans` is now Mulish rather than
Onest — the design names it.

**Tokens**: `--raw-color-porcelain` (#f0f0f0) and `--raw-color-electric-500`
(#0051ff) into a `--stage-*` family (ground, ink, rule, accent,
accent-foreground), bound in `@theme`.

**Also fixed `verify.sh`**: the `duration-fast` check matched inside
`duration-[var(--duration-fast)]` — the very form its own message prescribes —
so every correct use reported itself as a FAIL. The pattern now requires the
match not to be preceded by a hyphen.

**Changed**: `hero-stage.tsx` + barrel (new), `layout.tsx` (fonts),
`globals.css` (tokens), `home.ts` (copy), `home.tsx` (wired in, and the scene's
`h1` demoted to `h2` so the page keeps one `h1`),
`src/assets/fonts/melodrama-light.woff2` and
`public/assets/hero/stage-portrait.png` (committed assets),
`.claude/scripts/verify.sh`.

**Verified visually** at two widths: the composition is identical at 749px and
1280px, just scaled — name edge to edge with the portrait over its middle, rule,
claim, summary, notes, pill and link all in their Figma positions. `yarn lint`,
`yarn build`, `verify.sh` clean (0 FAIL).

> [!note] The 3D scene is still its own section, below the new stage
> The Figma's model is a still. Putting the **live** canvas into this
> composition needs the scene's white ground to become transparent, so the name
> can sit behind the model — a contained change, but not one to make while the
> preview pane will not composite the canvas.

---

## 2026-09-06 (51) — the strip comes forward, and creases square

Reported: the gallery is inverted — the cards go back and should come forward;
the crease is rounded and should be a right angle; and there should be no empty
stage between the strip and the top and bottom of the frame, with the fold still
visible. Reasoning in [[decisions-log]] ADR-0071.

**Forward**: the box now opens towards the reader. Past the crease a band runs
*out of* the screen instead of into it, capped at `box.reach` (26rem against a
60rem perspective) so nothing travels through the camera plane.

**Square**: `box.corner` 3 → **0**. Bands hinge one after another, so the corner
does not need length to stay continuous — the picture is flat and then abruptly
perpendicular.

**No dead stage**: `box.faceHalf` 24 → **28**, against a viewport about 32rem
from middle to edge, so the face runs almost to the frame and the crease lands
just inside it.

**Changed**: `curved-gallery.tsx` (`seatAt`), `gallery.config.ts`.

**Verified** by probe and then numerically in the shipped component. Card 4
crosses the bottom crease: bands at `z 0 / 0deg` on the flat face, then
`y 28 / z +2.28 / 90deg`, then z 6.8, 11.3, 17.3, 21.8, clamped at 26. So z is
**positive** past the crease (forward), the angle jumps 0 to 90 between adjacent
bands with nothing in between (a true right angle), and the crease sits at
y ±28rem. `yarn lint`, `yarn build`, `verify.sh` clean (0 FAIL); the probe was
deleted.

---

## 2026-09-06 (50) — the cards bend, they no longer merely turn

Reported, with an angled reference: the cards are being rotated, not bent —
their own plane should fold. Reasoning in [[decisions-log]] ADR-0070.

**A card is a stack of bands now.** One element can only be rotated; whatever
the path, a rigid plane meets a corner and tips over whole. A card is cut into
14 horizontal bands (`card.bands`), each seated on the path at its **own** arc
length, so a card straddling a corner creases: its top can be flat on the box's
top face while the rest still stands square to the camera.

`box.corner` 9 → **3**: with bands the corner is a crease in the picture, not a
curve to wrap it around, and the old reason to keep it long (a rigid card
snapping between seats) is gone. New `card.bandOverlap` (1.06) closes the
hairline gaps consecutive chords leave on the outside of a bend.

Each band clips a full-card wrapper shifted up by the bands above it, so
`next/image` still serves one optimised request per card. Bands are
`aria-hidden`; the card carries its alt text as `aria-label`.

**Changed**: `gallery-card.tsx` (rewritten as bands), `curved-gallery.tsx`
(seats bands, not cards), `gallery.config.ts`.

**Verified visually and numerically.** A static probe (see ADR-0069) was used to
choose the crease by eye; the shipped component then read back from the DOM as:
card 3 flat (all 14 bands `0deg`), card 2 creased across itself
(`[52, 23, 0, 0, ...]` — two bands folded, the rest flat), card 4 bending
through its own surface (`[0, 0, -5, -34, -63, -90, -90, ...]`), and the rest
fully on the side faces at `±90deg`. `yarn lint`, `yarn build`, `verify.sh`
clean (0 FAIL). The probe was deleted.

---

## 2026-09-06 (49) — three cards flat, and the fold lands at the frame's edge

Reported, with a reference from an angled view: the cards are being flipped
rather than wrapped, and the wrong way. The direction was right; the **scale**
was not. Reasoning in [[decisions-log]] ADR-0069.

`box.faceHalf` 13 → **24**. At 13 the flat face was 26rem against a 21rem card,
so only the centred card was ever square to the camera and both neighbours were
already deep in a corner — a strip that is always turning and never standing,
which reads as flipping. The face now carries three cards flat.

`box.corner` 12 → **9**, so the fold completes 33rem from the middle, just past
a viewport about 32rem from middle to edge: a card finishes turning as it leaves
the frame, and what shows at the top and bottom is a folded card almost
edge-on — the shallow trapezoid the reference has there.

**Changed**: `gallery.config.ts`.

**Verified visually and numerically.** A static probe page reproducing the seat
maths (the preview pane renders static HTML fine — it is the animated canvas
that composites black) was used to choose the numbers by eye; the shipped
component then read back from the DOM as: cards 2 and 3 at `z 0 / 0deg` — two
flat on the face — card 4 mid-fold at `y 30.3 / z -2.6 / -45deg` at the frame's
edge, and 5–7 at a clean `-90deg` receding (`z` -25.9, -49.9, -73.9). Position
and facing agree exactly (`24 + 9 sin45 = 30.36`, `-9(1 - cos45) = -2.64`).
`yarn lint`, `yarn build`, `verify.sh` clean (0 FAIL).

---

## 2026-09-06 (48) — the fold is convex, and now completes in view

Reported: the outer cards are still flat; their own plane should turn ninety
degrees. Both true, and for one reason. Reasoning in [[decisions-log]] ADR-0068.

The box was concave — reader inside, kept from the cylinder. Round a corner that
way a card travels *towards* the camera, so cards past the corner had to be
hidden before they reached it, and the hiding landed exactly where the fold
completed. What showed was 0 to about 60 degrees, then nothing.

It is **convex** now: front face at z = 0 on the perspective plane, every corner
carrying cards backwards. Nothing approaches the camera, so nothing is clipped,
clamped or hidden, and a card holds a full ninety degrees in view before
receding. The facing flips sign with the side (top edge away above the middle,
bottom edge away below). `box.corner` 16 → 12 so the fold completes 25rem from
the middle, inside a viewport about 32rem from middle to edge.

**Changed**: `curved-gallery.tsx` (`seatAt`, no parent `translateZ`, no
visibility gate), `gallery.config.ts`.

**Verified numerically**, read back from the DOM: the centred card at `z = 0`,
`rotateX(0)`; its upper neighbour at `y -24.87 / z -10.22 / 81.5deg` — nearly the
full angle and still drawn; the one past it at a clean `90deg`, receding
(`z -34`, then -46, -70, -94). Position and facing agree exactly at every point
(`13 + 12 sin 81.5 = 24.87`, `-12(1 - cos 81.5) = -10.22`). `yarn lint`,
`yarn build`, `verify.sh` clean (0 FAIL).

**Not verified visually** — the preview pane composites black. How long the fold
should take (`corner`) is still a judgement that wants eyes.

---

## 2026-09-06 (47) — the gallery wraps a box, not a cylinder

Asked for: the cards should go round a square rather than a circle, with the
outer ones folding at ninety degrees. Reasoning in [[decisions-log]] ADR-0067.

`gallery.config.ts`: `ring` (angleStep, radius) → `box` (`faceHalf` 13,
`corner` 16, `step` 24, `perspective` 60) — all arc lengths in rem along the
path rather than angles on a circle. `curved-gallery.tsx`: new `seatAt`, which
maps a travel distance to a position and a facing across three cases (flat face,
corner, side face) that agree at their joins in both.

The strip can no longer be moved by turning one parent — a square has no
rotational symmetry — so each card is placed individually every frame. Eight
style writes instead of one. Cards past the corner are parked and hidden rather
than left running towards the camera plane, where they would blow up rather than
disappear.

**Verified numerically**, which is the check that mattered here: read back from
the DOM, a card on the face sits at `z = -29rem` (the half-extent) with
`rotateX(0)`; the next along is at `y 17.86 / z -28.24 / 17.7deg`, the one before
at `y -27.0 / z -20.7 / -61.1deg`, and each of those positions is exactly what
its angle implies — the joins are continuous in position *and* facing. Spacing
is 24rem along the path throughout. `yarn lint`, `yarn build`, `verify.sh` clean
(0 FAIL).

**Not verified visually.** The preview pane is hidden and composites black, so
there is no screenshot behind this. The numbers are exact, but how the fold
*looks* — whether `corner` should be longer or shorter — is a judgement that
wants eyes.

---

## 2026-09-06 (46) — the line's bow is scroll-driven

The bow belongs to the stage line (entry 45) but was still driven by pointer
speed. It is the **scroll** that bends it: bowed while scrolling, straight when
still. Reasoning in [[decisions-log]] ADR-0066.

`trackArc` → `trackLineBow`, measuring the change in scroll progress per second
instead of the pointer's velocity. New `stages.bowSpeed` (0.4 of the runway per
second — the runway is seven viewports, so a brisk flick) and
`stages.bowResponse` (0.16s, longer than the pointer's 0.11 because a wheel
arrives in steps). `brush.arcSpeed` and `arcResponse` deleted along with the
last of the pointer-driven bow.

Side effect worth having: the bow now exists on touch, where there is no hover
and scrolling is the only input.

**Changed**: `model-scene.ts`, `scene.config.ts`.

**Partly verified.** The bow's rendering — the arch across the viewport and its
flattening — was verified on a production build last round. The driver swap
itself was not: the preview pane went hidden again (animation frames at zero)
before it could be driven. `yarn lint`, `yarn build`, `verify.sh` clean
(0 FAIL).

---

## 2026-09-06 (45) — the bow moves to the line it was meant for

The bow was built on the pointer's mark. It was asked for on the **stage
line** — the boundary where the white ground gives way to the tide. Reasoning
in [[decisions-log]] ADR-0065.

`lineMask` now lifts the line by half a sine across the viewport, pinned at the
screen's edges and rising in the middle, with the amplitude driven by pointer
speed and flat at a full stop. New uniform `uLineBow`, new
`stages.bowHeight` (0.055 of the viewport height). Both stage lines take it from
the one uniform, so the model and the background quad agree.

The mark's lift is removed and `brush.arcHeight` deleted. `trackArc` is
unchanged — still speed, not acceleration.

**Changed**: `scene-shader.ts` (`lineBow`, `lineMask`), `model-scene.ts`,
`scene.config.ts`.

**Verified** on a production build at the tide line: a fast drag arches the
boundary clearly, it is straight again about a second after the pointer stops,
and a slow drag across the same path barely bends it. `yarn lint`, `yarn build`,
`verify.sh` clean (0 FAIL). `MOBILE_MAX_WIDTH` lowered for the scratch build and
back at 768.

---

## 2026-09-06 (44) — the bow was there and too small to see

Reported: the mark still does not curve upward under movement. The machinery
was intact and doing exactly what it was written to do; it was **swamped by its
own ribbon**.

Entry 38 introduced the bow at `arcHeight` 0.42 against a `radiusRatio` of 0.21
— an arch twice the ribbon's half-width, and plainly visible when it was
verified. Two rounds later the ribbon was thickened to 0.42 and the arch was
cut to 0.3 for an unrelated reason, so the lift ended up **shorter than the
shape it was lifting**. There was a bow in the arithmetic and none on the
screen. `arcHeight` 0.8, and the config note now says to read it against
`radiusRatio` rather than on its own.

**Worth knowing when testing this:** the mark exists on the **first, white**
screen only. Entry 38 removed it from the tide block on request, so dragging
over the wireframe there shows nothing at all — which is what a screenshot of
the second block will show however the bow is tuned.

**Changed**: `scene.config.ts`.

**Not verified visually — fifth round running.** The preview pane is hidden or
frozen again (animation frames at zero), so the scene could not be driven.
`yarn lint`, `yarn build`, `verify.sh` clean (0 FAIL).

---

## 2026-09-06 (43) — reverting three rounds of the outline

Reported: worse again. Correct — the last three rounds each made it worse than
the one before, so they are reverted rather than patched a fourth time.
Reasoning in [[decisions-log]] ADR-0064.

The outline's noise is sampled in **screen space** again (the last state called
smooth). Everything ADR-0061 through ADR-0063 added is gone: the stroke-local
frame, the arc-only coordinate, the weighted mean, `uMarkSpacing`. Kept from the
rounds before them: capsules, the taper, the bow, the continuous decay, the
first stage owning the mark, the thickness.

`wobble` back to 0.3, `taper` 0.18 — thin enough to read as a tail, not so thin
that the noise chops it.

Why all three failed is recorded in the shader itself as well as in the ADR: the
stroke is a polyline of heavily overlapping capsules, so **no** coordinate can be
inferred from which capsule a pixel is nearest — it either jumps at bends, jumps
between far-apart winners, or smears when averaged. The real fix, if the
orientation is wanted, is a CPU-accumulated **arc length carried per point**, a
change to what the ring stores rather than to how the mask reads it.

**Changed**: `scene-shader.ts` (`brushMask`), `scene.config.ts`.

**Not verified visually — fourth round running.** The preview pane is hidden or
frozen again (animation frames at zero), so the scene could not be driven. This
is a revert to a known-good state rather than another addition, which is the
only reason it is going out unseen. `yarn lint`, `yarn build`, `verify.sh` clean
(0 FAIL).

---

## 2026-09-06 (42) — the outline's coordinate is averaged, not argmaxed

Reported: the shape is ragged, was much smoother before, and the tail moves
badly. Reasoning in [[decisions-log]] ADR-0063.

**The steps came from reading the arc coordinate off the winning capsule.** With
a radius many times the spacing, about fifteen capsules cover any pixel, and
which one holds the maximum flips between far-apart segments on the smallest
change of position — so the noise coordinate jumped and the boundary stepped.
Worse since the ribbon was thickened, which is the tell.

The arc position and the side are a **weighted mean** over every covering
segment now (weight = the segment's field value cubed), which is continuous by
construction. `field` stays a maximum, because the mark's extent genuinely is a
union. `wobble` 0.22 → 0.18.

**Changed**: `scene-shader.ts` (`brushMask`), `scene.config.ts`.

**Not verified visually — third round running.** The preview pane has been
hidden for this and the two rounds before it (`document.hidden` true, animation
frames frozen), so the scene cannot be driven at all. Every defect in this mask
so far has been invisible in a still frame and obvious in motion, so this is a
real gap, not a formality. `yarn lint`, `yarn build`, `verify.sh` clean
(0 FAIL).

---

## 2026-09-06 (41) — the outline is a width along the arc

Reported: the shape went ragged, and it still does not turn — worst on a fast
drag. Both were caused by the previous round. Reasoning in [[decisions-log]]
ADR-0062.

**The tearing was the lateral axis.** Sampling the noise against each segment's
own perpendicular means the coordinate jumps wherever the winning segment
changes and the stroke has bent — a seam at every bend, worst on a fast drag
where the path is recorded in longer, more sharply turning steps.

The noise is sampled at the **arc position alone** now: one coordinate, running
tail to head, nothing in it that can jump. It describes the ribbon's width along
its length, which turns with the stroke by construction. The two edges are kept
apart by one noise row per **side** — the sign of the lateral offset, never its
magnitude; a sign flips only on the centreline, deep inside the mark.
`uMarkSpacing` removed with the lateral axis.

**The taper was the other half**: at 0.08 the tail was a twelfth of the head's
width, so a ±0.3 wobble tore it apart rather than shaping it. `taper` 0.3,
`wobble` 0.22.

**Changed**: `scene-shader.ts` (`brushMask`), `model-scene.ts`
(`uMarkSpacing` gone), `scene.config.ts`.

**Not verified visually.** The preview pane was hidden again for this round
(`document.hidden` true, animation frames frozen), so the scene could not be
driven — no screenshots back this entry. `yarn lint`, `yarn build`,
`verify.sh` clean (0 FAIL).

---

## 2026-09-06 (40) — the outline turns with the stroke, and is thicker

Reported: the mark does not rotate, it only translates. Correct, and structural.
Reasoning in [[decisions-log]] ADR-0061.

**The noise was sampled in screen space.** The stroke moves and the noise does
not, so the undulations stayed nailed to the display while the ribbon slid
through them — re-carved every frame by a stationary pattern. A shape with no
fixed features of its own cannot read as turning; it has a position and nothing
else.

The mask now builds a **stroke-local frame** from the winning segment — along
the ribbon and across it — and samples the noise there, so the bumps belong to
the ribbon and go round with it. New `uMarkSpacing` (the projected distance
between consecutive points, one number per frame) keeps both axes of that frame
in pixels.

**Thicker**: `brush.radiusRatio` 0.3 → 0.42.

**Changed**: `scene-shader.ts` (`brushMask`), `model-scene.ts`
(`uMarkSpacing`), `scene.config.ts`.

**Verified** on a production build: a horizontal drag and a vertical one give
the same ribbon rotated rather than two differently-carved holes, and an arc
across the torso bends the outline with the path. `yarn lint`, `yarn build`,
`verify.sh` clean (0 FAIL). `MOBILE_MAX_WIDTH` lowered for the scratch build and
back at 768.

---

## 2026-09-06 (39) — the stroke stops changing character, and lets go smoothly

Reported: the shape moves strangely behind the cursor, and it freezes for a
second before disappearing. Both were real. Reasoning in [[decisions-log]]
ADR-0060.

**The strange movement** was measuring along the stroke as `k / (size - 1)` —
over the whole ring, when the live points occupy only its tail end until the
ring fills. A short stroke had almost no taper and almost no bow, and both grew
in as more points were laid, so the mark behaved differently depending on how
long it had been drawn. `projectBrush` now finds the first live entry and
normalises the taper and the bow over the **live span**.

**The freeze** was `tailFade` 0.3: the weight is `smoothstep(0, tailFade, life)`,
which is 1 for any life above 0.3 — full strength for 70% of the lifetime, then
out. `tailFade` is 1 now, so it decays across the whole life, and the projected
width carries a life term as well, so the mark narrows as it goes.

`arcHeight` 0.42 → 0.3, since the bow now applies at its stated strength instead
of being attenuated by the bug.

**Changed**: `model-scene.ts` (`projectBrush`), `scene.config.ts`.

**Not verified visually.** The preview pane was hidden for this round
(`document.hidden` true, animation frames frozen), so the scene could not be
driven at all — no screenshots back this entry. `yarn lint`, `yarn build`,
`verify.sh` clean (0 FAIL), and the reasoning above is arithmetic rather than
judgement, but the look of it has not been seen.

---

## 2026-09-06 (38) — the stroke bows, and leaves the second block alone

Asked for: a bigger mark that goes sooner, a stroke that curves upward under
acceleration and straightens at a stop, and no hover at all on the second block.
Reasoning in [[decisions-log]] ADR-0059.

**Bigger, shorter**: `brush.radiusRatio` 0.21 → 0.3, `lifetimeSeconds` 1.1 →
0.7.

**The bow**: new `brush.arcHeight` (0.42 of the model's radius at full tilt),
`arcSpeed` (2.5 NDC/s) and `arcResponse` (0.11s). Driven by pointer **speed**,
not acceleration — acceleration is zero through the middle of a fast swipe,
which is where the curve should be deepest — and applied in `projectBrush`
rather than baked into the recorded points, which is what lets an existing
stroke straighten as the hand settles.

**No mark below the tide line**: `stageOpen` opens the tide zone outright, and
`stageColor` weights the ground's shading by the white zone so the mark leaves
no shadow on the field either.

**Changed**: `scene-shader.ts` (`stageOpen`, `stageColor`), `model-scene.ts`
(`trackArc`, the lift in `projectBrush`), `scene.config.ts`.

**Verified** on a production build, three ways: a fast drag arches clearly, the
same mark flattens within about half a second of the pointer stopping, and the
same path dragged slowly comes out straight. On the tide, dragging across the
wireframe leaves nothing at all — no texture patches, no darkened field. `yarn
lint`, `yarn build`, `verify.sh` clean (0 FAIL). `MOBILE_MAX_WIDTH` lowered for
the scratch build and back at 768.

---

## 2026-09-06 (37) — the ribbon is continuous again, and shorter-lived

Reported: the circles are back, the movement was better before, and the shape
hangs around too long. Reasoning in [[decisions-log]] ADR-0058.

**The circles were the taper meeting a field of discs.** Continuity depended on
consecutive discs overlapping; the taper drives the radius down along the
stroke, and by the tail it was about a fifth of the spacing between points. The
mask walks **capsules** now — the segment between consecutive points, radius and
weight interpolated along it — so the ribbon is continuous by construction at
any spacing and any taper.

That needs the ring in **stroke order** (`projectBrush` writes it oldest-first)
and needs to know where a stroke ended, or a gap would be bridged by a bar
across the model: `brush.ends`, carried on the wire as the sign of the radius.

**Livelier**: `wobble` 0.2 → 0.3, `noiseScale` 4 → 5.5, `noiseDrift` 0.02 →
0.07 — the last round turned the outline down too far chasing "simpler".

**Shorter-lived**: `lifetimeSeconds` 2.2 → 1.1, `tailFade` 0.22 → 0.3.

**Changed**: `scene-shader.ts` (capsules), `brush.ts` (`ends`),
`model-scene.ts` (stroke-order projection), `scene.config.ts`.

**Verified** on a production build: one continuous ribbon, wide at the pointer,
narrowing to a tip, no beads anywhere along the tail; the same on the tide with
the texture restored inside it and the field darkened along it; gone about a
second after the pointer stops. `yarn lint`, `yarn build`, `verify.sh` clean
(0 FAIL). `MOBILE_MAX_WIDTH` lowered for the scratch build and back at 768.

---

## 2026-09-06 (36) — the mark is a tapered ribbon

Asked for: a simpler shape, a thinner tail, and more length. Reasoning in
[[decisions-log]] ADR-0057.

**Simpler**: `brush.wobble` 0.42 → 0.2, `noiseScale` 7 → 4 — fewer and larger
undulations in the outline.

**Longer**: `points` 24 → 32, `minStepRatio` 0.022 → 0.055, `radiusRatio` 0.32
→ 0.21. The span the ring can cover is spacing times count; narrowing it at the
same time is what turns a patch into a ribbon.

**Tapered**: a point's radius now runs down to `brush.taper` (0.08) of the
head's — driven by its **place in the ring**, not its remaining life. Life does
not work: mid-drag every point is young, so the tail came out at 60% of the head
and the mark read as a tube. New `brush.head` on the ring buffer, which is the
only record of stroke order. Life still drives the weight (`tailFade` 0.22), so
the mark thins as it is drawn and dissolves as it dies.

**Changed**: `brush.ts` (`head`), `model-scene.ts` (the taper in
`projectBrush`), `scene-shader.ts` (`uMarkTailFade`), `scene.config.ts`.

**Verified** on a production build: a long ribbon, wide at the pointer and
narrowing to a tip behind it, smooth simple outline with a hard edge; the same
on the tide, restoring the texture inside it; the ground darkened along it.
`yarn lint`, `yarn build`, `verify.sh` clean (0 FAIL). `MOBILE_MAX_WIDTH` was
lowered for the scratch build again and is back at 768.

**Note**: a backtick inside a GLSL comment broke the parse for the fifth time
this project. They are template literals; comments in them cannot carry code
spans.

---

## 2026-09-06 (35) — a smooth outline, still hard-edged, and a deeper ground

Reported: the shape came out chopped, and the ground's tint should go darker.
Reasoning in [[decisions-log]] ADR-0056.

**The outline is a contour now, not a tessellation.** The mask is a smooth
scalar field — the strongest stroke point covering the pixel, plus a slowly
drifting noise — cut by a hard `step`. Smooth field, smooth contour; step, hard
edge. That is both properties at once, which no version so far had: the disc was
smooth and soft, the Voronoi hard and angular.

The disintegration survives it without extra machinery: the noise offset means
different parts of the patch cross the level at different moments, so it opens
holes and sheds islands as the stroke decays instead of fading.

`brush.cells`/`release` gone; `threshold` 0.34, `wobble` 0.42, `noiseScale` 7,
`noiseDrift` 0.02, `radiusRatio` 0.22 → 0.32 (the cut eats part of the radius).
New `uMarkTime`, driven from the scene clock.

**The ground goes deeper**: `brush.shade` 0.07 → 0.17.

**Changed**: `scene-shader.ts` (the mask, and the noise moved ahead of it in the
background quad's prefix), `scene.config.ts`, `model-scene.ts` (the drift).

**Verified** on a production build: a smooth curved outline with a hard edge on
the white stage; the same inverted over the tide; the mark carrying onto the
ground as a clearly darker patch with the same outline; a hole opening inside
the patch as it decays; nothing left a few seconds after the pointer stops.
`yarn lint`, `yarn build`, `verify.sh` clean (0 FAIL). `MOBILE_MAX_WIDTH` was
lowered for the scratch build to get a pointer in the preview pane, and is back
at 768.

---

## 2026-09-06 (34) — the mark is cells, and the ground notices it

Reported: the reference's shape is far more dynamic than a row of circles, it
does not disappear by plain transparency, and moving over the white background
darkens it inside the shape. All three correct. Reasoning in [[decisions-log]]
ADR-0055.

**The boundary is polygonal, not scalloped.** Driven again, the reference's mark
is bounded by straight segments meeting at corners and comes apart into separate
shards — which a union of discs cannot do. The mask is a screen-space Voronoi
now: a cell is wholly in the mark or wholly out, lit by its own feature point,
so the edge always lands on the tessellation. `brush.cells` 14.

**It lets go a piece at a time.** Every cell has a hashed threshold
(`brush.release` 0.85) and drops when the stroke's life falls under it, so the
patch loses shards rather than dimming. `lifetimeSeconds` 1.4 → 2.2, or the
whole disintegration was over before the eye found it.

**The ground takes the mark.** `stageColor` darkens by `brush.shade` (0.07)
inside it — one function, called by both the model and the background quad, so
the shape does not break at the silhouette. The background quad gains
`brushDefines()` for the ring size. And a raycast miss no longer ends the
stroke: it falls back to the plane the subject stands in, so the mark carries on
across the ground.

**Changed**: `scene-shader.ts` (Voronoi mask, `resolutionUniform` split out of
the stage chunk, `stageColor` takes the mark), `brush.ts` (owns its own
object-space ring; the uniform is now the projected one), `model-scene.ts`
(`projectBrush`, plane fallback), `scene.config.ts`.

**Verified** on a production build: polygonal shards with straight edges on the
white stage, the same inverted over the tide (texture back inside the cells),
the mark continuing onto the white ground as a grey polygonal patch, and the
patch gone a second after the pointer stopped. `yarn lint`, `yarn build`,
`verify.sh` clean (0 FAIL).

**Not visually re-checked**: `lifetimeSeconds` 1.4 → 2.2 went in after the
preview pane stopped running animation frames, so the per-cell disintegration
was confirmed at 1.4s and not at 2.2s. It is a timing constant with no
structural effect.

> [!note] Driving the scene in the preview pane
> Animation frames run at full speed **only** with viewport emulation cleared;
> any emulated size throttles the pane to about 1 fps, and a hidden pane freezes
> rAF outright. The pane's own width is 749px, under the 768px mobile
> threshold, so the scene attaches no pointer there at all. Testing hover meant
> lowering `MOBILE_MAX_WIDTH` for a scratch build and putting it back after —
> it is back at 768.

---

## 2026-09-06 (33) — the mark is hard-edged again

Reported: the drawn shape is completely different from the reference, and at
minimum there is no blur there. Correct on both counts. Reasoning in
[[decisions-log]] ADR-0054, which reverses ADR-0053.

**What the reference does, driven rather than recalled**: a drag opens the union
of overlapping circles along the path — a lobed patch with scalloped edges — the
boundary is hard everywhere, and holding still closes it over a second or two.
That is a decaying stroke, which is what this scene had before yesterday's
refactor replaced it with a soft lens.

`lens.ts` → `brush.ts` again, with the numbers taken from the reference:
`radiusRatio` 0.17 → **0.26** (a window torn in the surface, not a pen nib),
`edgeSoftness` → **0.03** — an antialiasing hairline and nothing more — and
`lifetimeSeconds` 1.4. The decay now counts elapsed seconds rather than frames,
which is the one thing worth keeping from the lens.

**Changed**: `brush.ts` (restored, rewritten), `lens.ts` (deleted),
`scene-shader.ts` and `model-scene.ts` (back to the stroke), `scene.config.ts`.

**Verified.** `yarn lint`, `yarn build`, `verify.sh` clean (0 FAIL). Checked on a
production build at 900px with a scripted 45-step drag: the lobed hard-edged
patch on the white stage, the same shape inverted over the tide (texture back,
mesh gone inside it), and the mark closed after ~3s of stillness.

**Not done**: the reference also reveals patches on its own with the pointer
parked away, some with straight edges — an idle dissolve, separate from the
hover. Not built.

---

## 2026-09-06 (32) — the hover is a lens now

Asked for: the hover on the first two screens should work like the one on
landonorris.com. Reasoning in [[decisions-log]] ADR-0053.

**What that effect actually is**, watched closely: the cursor is a soft circular
window, and inside it the subject shows its other state — solid where the rest
is a ghost. Our scene already had the two states and the inversion between
stages; what it had was a **brush**, painting a decaying stroke, where the
reference has a **lens**.

`brush.ts` → `lens.ts`. One eased point instead of a 24-point ageing ring; a
mask that is one distance instead of a loop per fragment; and the edge inverted
— `lens.softness` 0.88, where the stroke's rim was 0.07, because a mark needs an
edge and a lens must not have one. Position and fade both ease frame-rate
independently (`followSeconds` 0.085, `fadeSeconds` 0.22), so the weight behind
the glass is the same on every tier.

Behaviour by stage is unchanged and still inverted: on the white stage the lens
takes the texture away and the topology shows through; on the tide it puts the
texture back over the mesh; past the third line the pointer has no say.

**Changed**: `lens.ts` (new, replaces `brush.ts`), `scene-shader.ts`
(`lensMaskFunction`, `uLens*` uniforms, `brushDefines` gone), `model-scene.ts`,
`scene.config.ts` (`brush` → `lens`).

**Verified.** `yarn lint`, `yarn build`, `verify.sh` clean (0 FAIL). Checked on a
production build at 1280px — note the scene tiers to *mobile* under 768px and
attaches no pointer listeners at all, which is why a narrow preview shows
nothing. Face and shoulder on the white stage, the inverse on the tide, the fade
on leave, and the third stage correctly indifferent to the pointer.

---

## 2026-09-05 (31) — the mark: smaller, centred, matte gone, real bloom

Asked for: shrink AI and centre it, drop the normal map, add bloom, and fix the
material doubling. Reasoning in [[decisions-log]] ADR-0052.

**The doubling was the glow shell.** `scale.setScalar()` scales about the
object's own origin, which for every part of the word is the middle of the
mark — so on the accent, floating above it, an 11% scale was an 11% *shift* and
drew a second star. The shell is gone entirely, replaced by a real
`UnrealBloomPass` (`EffectComposer` → `RenderPass` → bloom → `OutputPass`) with
the bloom pass enabled only while the chrome is poured.

**The chain broke the colour pipeline, and that is the lesson.** Three turns a
material's tone mapping off when it renders into a target; half this scene's
colour is written past `<colorspace_fragment>` and was pre-encoded to sRGB for
exactly that reason. `OutputPass` then encoded it again and the whole field went
pale. `toDisplay` no longer converts — one encode, at the end, for everything.
Also: `samples = 4` on the composer's targets, because rendering into a target
bypasses the canvas's MSAA.

**Centred and smaller.** The word used to hang off the bust's *mesh*, whose
local origin and scale are the asset author's business — so it arrived
off-centre at a size `widthRatio` did not describe. It now hangs off the group
the scroll turn rotates: `text.widthRatio` 1.55 → 1.12, `maxHeightRatio` 1.5 →
1.12, and one radius means one radius.

**No normal map.** `chrome.facet` / `facetScale` deleted. The faces went dark
without it — the room they mirror is dark — so `envMapIntensity` 11 → 17 buys
the brightness back through the reflection, which is where a metal's brightness
actually lives. Token `--scene-chrome-glow` removed with the shell.

**Changed**: `scene-shader.ts`, `model-scene.ts`, `scene.config.ts`,
`globals.css`.

**Verified.** `yarn lint`, `yarn build`, `verify.sh` clean (0 FAIL). Checked on a
production build at the hero, mid-tide, the pour and the end: one star, light
chrome with a halo, the field back to full saturation, the mark centred.

---

## 2026-09-05 (30) — the new AI.glb, and its pivots

A re-authored `public/assets/hero/AI.glb` (2 parts, `Letters` + `Star`, Draco,
20k vertices) with pivots set deliberately. Reasoning in [[decisions-log]]
ADR-0051.

**The scene reads the pivot now.** `word-model.ts` captures each node's origin
before baking the node matrix into the positions, carries it through the same
centring and fit, and returns it as `WordPart.pivot` (replacing `centre`).
`model-scene.ts` turns the accent about that instead of a bounding-box centre —
`accentCentre` → `accentPivot`. Falls back to the box centre when the origin is
not inside the part, which is what a pivot nobody moved looks like.

On this asset the two agree to 0.1% of the star's width, so the frame does not
change; the axis is now the authored one rather than a coincidence.

**Changed**: `word-model.ts`, `model-scene.ts`, `public/assets/hero/AI.glb`.

**Verified.** `yarn lint`, `yarn build`, `verify.sh` clean (0 FAIL). Checked at
five scroll positions — the bust's bottom dissolve, the morph assembling, the
letters, the chrome pour, and three frames of the star turning: it spins in
place above the `i` with no orbit.

---

## 2026-09-05 (29) — the bottom mask, actually visible this time

The mesh over the field still ended on a hard cut. Reasoning in
[[decisions-log]] ADR-0050.

**Nothing was wrong with the fade.** The mesh draws twice — crisp lines, plus a
scaled copy as the halo — and the halo is screen-blended, where the contribution
is `rgb * (1 - dst)` and **alpha is never read**. Both passes wrote their weight
to `gl_FragColor.a`, so on the halo the bottom fade, the stage mask and the
brush were all no-ops and it drew at full strength through every one of them.
The halo now multiplies `wireAlpha` into the colour and writes `a = 1.0`.

**Changed**: `scene-shader.ts` — `patchWireframeMaterial` branches its final
write on `WIRE_HALO`.

**Verified.** `yarn lint`, `yarn build`, `verify.sh` clean (0 FAIL). Checked at
five scroll positions: the bust now dissolves into the field at the bottom with
no cut at the line or below it, and the morph, the letters and the chrome pour
are unchanged.

---

## 2026-09-05 (28) — no gap under the line, and a hem that hides the cut

Reported: there should be no emptiness immediately below the tide line — the
mesh belongs there — and the bottom needs a semi-transparent hem so the model
does not read as cut off. Reasoning in [[decisions-log]] ADR-0049.

**The gap was the mesh's own soft band** (`stages.meshEdge`, added in entry 22 so
the mesh would not flick on at the line). It holds the mesh at nothing for its
whole depth, so the shoulders showed field instead of net. Removed — the mesh
reads the crisp `stageZones()` again. It can go because the flare it was
covering was really the depth-write release, fixed at source in entry 25.

**The hem was measured to the wrong landmark.** The fade runs to the geometry's
lowest point, which on this asset is the ends of the hair — well below the flat
cut across the chest. The mesh now has its own end as well as its own start
(`fade.meshEndRatio` −0.8, `meshStartRatio` −0.42), so it dissolves through the
cut and is gone before it.

**Method note.** Three passes were spent guessing from screenshots. Two shader
diagnostics settled it: a **constant** return from `meshBottomFade` proved the
value reached the alpha, and painting `vScenePosition.y` into `gl_FragColor`
proved the input varied. Nothing was broken — the landmark was wrong.

**Changed**: `scene-shader.ts` (mesh band removed, `uFadeMeshEndY` added),
`scene.config.ts` (`stages.meshEdge` deleted, `fade.meshEndRatio` added),
`model-scene.ts` (`setFadeRange` now derives the thresholds from the model
geometry's own bounding box rather than the world box — same result on this
asset, but it is the space the shader actually reads).

**Verified.** `yarn lint`, `yarn build` clean. Checked at the line and deep in
the field: the net meets the texture with no gap, and the bottom dissolves with
no visible cut.

---

## 2026-09-05 (27) — four corrections to the ending

Asked for: the transition into the blue block shows the mask on the wrong side,
the morph looks ugly, the chrome should be light with a bloom, and the star
should turn. Reasoning in [[decisions-log]] ADR-0048.

**The hem moved to the bottom.** `stages.meshEdge` 0.24 → 0.05 (the band across
the top of the mesh was reading as a mask over the model), and the mesh gained
its own much longer bottom dissolve — `fade.meshStartRatio` with
`meshBottomFade`. The lit model fades towards the ground colour, so a short fade
loses it; the mesh fades towards transparency over a live field, where the same
fade reads as a cut rather than a dissolve.

**The morph assembles.** Nodes now carry `aDelay` and cross their own window
inside the morph (`text.morphStagger` 0.55), ordered mostly left to right — the
`A` stands while the rest is still in flight. And the edges wait:
`latticeFadeFrom` 0.58 → 0.82, because a lattice drawn between points still in
transit was burying the travelling sparks under a net of lines going nowhere.

**The chrome is light, with a halo.** `--raw-color-chrome-deep` #2f6fd0 →
#c9dcff and `sheen` → #ffffff: a metal *is* its albedo, so a deep blue one reads
as dark glass however bright the reflection is made. New
`patchWordGlowMaterial` draws a back-face copy of the word scaled 11%,
screen-blended with a fresnel width — a bloom's read for one draw instead of an
`EffectComposer` and a full-screen chain. New token `--scene-chrome-glow`.

**The mark above the `i` turns on Y.** `word-model.ts` returns the asset's
**parts** instead of one merged geometry, finding the accent by geometry (the
part standing entirely above the others). Its geometry stays in the word's
space — the fill level and the morph sources are measured there — and the group
carries a compensating translation so `rotation.y` turns it in place. The spin
is held until the morph completes, or it would drag the nodes' sources round
with it.

**Verified.** `yarn lint`, `yarn build` clean; `gl.getError()` 0. Checked across
the scroll: the hem, the left-to-right assembly, the light chrome with its halo,
and the star turning over three frames. Draws: 5 through the bust, 6 assembling,
6 poured.

---

## 2026-09-05 (26) — the ending's word is an authored model, not rasterised type

Asked for: a new model was dropped in to replace the "AI" letters — swap it in
and keep the effect. Reasoning in [[decisions-log]] ADR-0047.

**New** — `public/assets/hero/AI.glb` (Draco, 2 primitives, 40,036 triangles,
positions + normals) and `src/lib/scene/word-model.ts`, which fetches it,
flattens its parts into one indexed geometry and **bakes** the centring and the
fit into the positions — so object space is the space the chrome's fill level is
measured in, and the shader needs no extra matrix.

**Deleted** — `src/lib/scene/text-cloud.ts`. It rasterised a glyph into a
canvas, sampled a coverage grid, snapped the outline to an isoline, extruded a
slab and rolled a bevel: all of it to manufacture a 3D object out of a font, and
none of it needed once the object arrives as one. `sourceFromJunctions` moved
across unchanged. The `document.fonts.ready` gate in `load()` went with it — it
existed only because the letters were cut from the document's own face.

**The effect is untouched because it never depended on the source.** The lattice
is welded by `buildCoarseWireframe` — the same pass that builds the bust's own
net — so both ends of the morph are junctions of the same kind and map like onto
like. Lattice, junction sparks, the journey out of the bust, the revolution and
the chrome fill all carry over with no changes at all.

**Changed** — `scene.config.ts`: `text` now names `modelUrl`, `widthRatio` and a
`maxHeightRatio` (the fit takes whichever binds — this asset has a mark above the
`i`, so height binds and width alone would have scaled it off the stage);
`content`, `fontWeight`, `depthRatio` and `bevelRatio` are gone.
`model-scene.ts`: `buildWord` is async and welds the loaded asset.

**Measured.** The word's lattice: 5,608 edges / 1,880 junctions, against the old
5,766 / 2,022 — near enough identical, which is why the look carries over. The
finished word draws 3 passes; the bust stage is unchanged at 5. `gl.getError()`
0, no console errors, `AI.glb` fetched once.

**Verified.** `yarn lint`, `yarn build` clean. Checked on the running dev build:
the mark forms as a spark lattice, turns through its revolution, and fills with
chrome bottom-to-top; earlier stages unaffected.

---

## 2026-09-02 (25) — the extra bright state before the morph is gone

Reported precisely: the model is dim with a mask from below, then abruptly very
bright with the mask gone, and only then morphs to the letters — remove the
middle state. Reasoning in [[decisions-log]] ADR-0046.

**Measured, at a ladder of scroll positions**, reading the framebuffer:

| progress | model luminance |
|---|---|
| 0.42 | 140.6 |
| 0.45 | 151.7 |
| **0.485** | **208.7** |
| 0.51 | 204.3 |

A 1.37x step beginning between 0.45 and 0.485, and `stages.morph.from` is 0.48.
Two plausible causes fit that same position — the bust turning edge-on at 273
degrees, and the bottom fade being released — and only reading the buffer
separated them.

**The cause was entry 18's own fix.** The word's solid is depth-tested, and it
forms inside the volume the invisible bust occupies, so the bust was told to stop
writing depth at the morph's start. But the bust's **wireframe** is depth-tested
against that same buffer: the moment the depth went, the back half of the net
stopped being occluded, the lines on screen doubled, and the model flared.

**Changed** — `model-scene.ts`: the release is keyed to `uWordFill` instead of
the morph. The chrome starts at `text.fill.from` (0.7), long after the bust's net
has faded (around 0.53), so the two never overlap. After: 150 at 0.42, 138.9 at
0.485 — no step anywhere in the window.

Also, `scene-shader.ts`: the bottom fade is released only under `MORPH_FROM` now,
i.e. for the word. That was tried first on a wrong hypothesis, but it is right on
its own terms — a bust has a bottom to dissolve and should keep doing so until it
goes; only a word needs out of it, or the fade shaves its descenders.

**The lesson**: the depth buffer is shared state. Turning off a write to serve
one object changes what every other depth-tested object can see, and the cost can
surface changes later looking like a lighting bug.

**Verified.** `yarn lint`, `yarn build` clean. Checked on a production-equivalent
dev build: the mesh at 0.485 is even and un-doubled, the chrome fill still runs
through a clean silhouette, and the finished word is intact.

---

## 2026-09-02 (24) — the scene stops breathing; the cause was the field, not the mesh

Reported: everything got brighter but the brightness jump is still there.
Reasoning in [[decisions-log]] ADR-0045, which corrects entry 23's diagnosis.

**Entry 23 fixed something real and it was not the main cause.** Screen blending
on the glow passes was right and stays; it just was not where the swing lived.

**Measured instead of eyeballed.** `readPixels` over a 9x7 grid of the whole
drawing buffer, after the frame's last pass, at a **fixed scroll**, 26 seconds:

| | whole frame | model's third |
|---|---|---|
| `glow: 1.0` (as specified) | 66 → 113.7 = **1.72x** | 1.94x |
| shipped, `glow: 0.3` | 86.7 → 103.3 = **1.19x** | 1.32x |

The scroll never moved: the entire picture was breathing by 72%. The mesh took
the blame because it is the subject.

**Changed** — `scene.config.ts`: `tideField.glow` **1.0 → 0.3**. The term is
`col += light * glow * pow(f, 4.0)`, a quartic amplifier on the field's own
variation; nothing else in the field has that gain. `particles.gain` 2.4 → 1.9
and `wireframe.haloOpacity` 0.22 → 0.16, since with the field settled the
compensation added in entry 23 is no longer needed.

**A mandated value was overridden, deliberately and only one.** `glow: 1.0` came
from the Kindle specification's "use exactly these values". Keeping it and
removing the pulse are mutually exclusive — the number is the pulse — so it is
changed, named here, and reversible in one edit. Palette, contrast, threshold,
speed, spread and the front's shape are untouched.

**Method note.** Two rounds went by arguing from screenshots. A screenshot shows
a brightness, not what varies with what. Holding the scroll still and reading the
framebuffer found it in one pass.

**Verified.** `yarn lint`, `yarn build` clean. Two frames 11s apart at a fixed
scroll: the field keeps its structure and motion, the overall level holds. The
chrome word is unaffected.

---

## 2026-09-02 (23) — the model stops flashing as the field drifts behind it

Reported: across a sequence of screenshots the model goes normal, bright, normal.
Reasoning in [[decisions-log]] ADR-0044.

**Not the scroll.** Checked first, and ruled out: a draw census at three scroll
positions showed the same five passes throughout, and stepping the scroll showed
no jump. Holding the scroll **still** and taking three frames nine seconds apart
reproduced it exactly — the field drifts behind the model and the mesh brightens
and settles with it.

**It was the blend mode.** The halo and both spark clouds were
`AdditiveBlending` — `dst + src`, no ceiling — so how bright the glow looked
depended entirely on what was behind it. A bright ridge of the tide field
passing behind the model pushed the mesh into saturation and back out: the
background was modulating its own subject.

**Changed** — `model-scene.ts`: a shared `applyScreenBlending` puts all three
glow passes on `CustomBlending` / `OneMinusDstColorFactor` / `OneFactor`, i.e.
`src * (1 - dst) + dst`. Over a dark ground that is indistinguishable from
additive; over a bright one the contribution is scaled by how bright the ground
already is.

**Paid for with gain.** Screen also means a pale source over a blue field barely
registers, and the sparks went nearly invisible. New `particles.gain` (2.4)
multiplies the spark colour and `wireframe.haloOpacity` went 0.10 → 0.22. A gain
above 1 does not bring the flashing back — it lets the sprite's core reach white
while `1 - dst` still governs how much the ground can be lifted.

**Verified.** `yarn lint`, `yarn build` clean. Three frames at a fixed scroll,
nine seconds apart: the background changes, the mesh does not. White stage and
the chrome word unaffected — neither is a glow pass.

---

## 2026-09-02 (22) — the mesh stops being flicked on at the tide line

Reported: the model lights up abruptly; make it smoother. Reasoning in
[[decisions-log]] ADR-0043.

**Found by stepping the scroll**, not by guessing: at 16% of the runway the tide
line sits mid-screen with the textured bust above it and the glowing net at full
strength one pixel below. The net was switching on along the ground's razor
edge.

**The line stays razor-sharp; the mesh gets its own band.** New `meshZones()`
reads the same two lines through a band ~300x wider than `edgePixels`
(`stages.meshEdge` 0.24) and feeds the wireframe, its halo and the junction
sparks. The background quad and the model's surface keep `stageZones()`, so the
ground arrives on a hard line and the texture still gives way on one.

**The band is below the line, never above** — a correctness constraint, not a
preference. The lines park just off the bottom of the screen between sweeps, so
an upward band would light the base of the model while the white stage is still
on. Downward it is identically zero until the line is actually travelling, and
it reads better anyway: the surface gives way at the line, the net materialises
a beat behind it.

**Changed**: `scene-shader.ts` (`meshLineMask` / `meshZones`, `uMeshEdge`; the
wireframe and spark patches switched to the soft zones), `scene.config.ts`
(`stages.meshEdge`).

**Verified.** `yarn lint`, `yarn build` clean. Stepped through the sweep on the
running dev server: the net now ramps in under the line instead of appearing at
it, the white stage shows no mesh leaking up from the bottom, and past the third
line the net is still uniform.

---

## 2026-09-02 (21) — no more "second mesh" climbing the model

Reported: while the model turns, a second white mesh appears bottom-to-top.
Reasoning in [[decisions-log]] ADR-0042.

**There was no second mesh.** A draw census mid-sweep shows one line geometry
(`A31616`) and one spark cloud (`A4961`) — the same ones drawn everywhere else.

**It was the weight blended across the stage mask.** Entry 16 gave the wireframe
two immersed weights, 0.85 past the third line and 0.42 on the tide, blended by
`zones.y`. That line is a hard edge sweeping up the screen, so the blend drew the
heavier net *arriving bottom-to-top through the model*. The halo made it
unmistakable — 0.10 above the line against 0.32 below, a 3x step in the glow.

**Changed** — `scene.config.ts`: `wireframe.immersedOpacity` 0.85 → **0.42** and
`haloOpacity` 0.32 → **0.10**; `tideOpacity` and `haloTideOpacity` deleted.
`scene-shader.ts`: the two `zones.y` blends and `uWireTideOpacity` go with them,
so the seam cannot come back by retuning.

**The rule this leaves behind**: the stage masks are screen-space fields with
hard edges, so anything they scale sweeps across the picture. That is right for
a ground colour or a surface giving way, and wrong for a property of the subject
— use them to decide *what is drawn*, not *how heavy the same thing looks*.

**Verified.** `yarn lint`, `yarn build` clean. Checked at three points across the
third line's sweep on the running dev server: the net is uniform head to toe,
with no band and no seam.

---

## 2026-09-02 (20) — the hero stops loading wrong every few reloads

Reported: the model in the hero comes up broken several reloads in a row, then
comes good. Root cause found and measured; reasoning in [[decisions-log]]
ADR-0041.

**Two scenes were being built on one canvas.** A canvas has exactly one WebGL
context for its life, so that is two `WebGLRenderer`s over one context — and
disposing either clears that context's program cache, after which the survivor
draws some materials and not others. The screenshot showed the coarse wireframe
with no lit surface, which is that failure exactly.

The mount effect kept its instance only in `sceneRef`, assigned **after**
`load()` resolved, so a teardown during the load found it null and disposed
nothing. The half-built scene kept the context, the next mount built a second on
top, and the first disposed itself later into the second's context. React's
development double-mount does this on every load.

**Measured.** One page load fetched `model.glb` **twice**, 72 ms apart. After the
fix: **one** fetch per document across three consecutive reloads, `gl.getError()`
0, context alive, model correct each time.

**Changed** — `src/components/common/scene/model-viewer.tsx`: the instance is
held in a local as well as the ref, and construction is chained onto a
`teardownRef` promise that resolves only once the previous scene has released
the canvas. The discarded mount now cancels before the constructor is reached,
so it builds nothing at all.

Not a dev-only issue to wave away: development mode makes the overlap reliable,
but any remount reproduces it in production.

---

## 2026-09-02 (19) — rolled edges on the letters, and the staircase undone

Asked for: the letter edges are jagged again, and they should be embossed —
slightly rounded. Reasoning in [[decisions-log]] ADR-0040.

**The jaggedness was my regression from entry 18.** `NODE_THRESHOLD` was lowered
0.5 → 0.32 there to close notches in the solid. That admits nodes whose cells lie
*outside* the 0.5 contour, and only nodes with an absent neighbour get projected
— so a ring of unprojected nodes sat outside the letter at raw grid positions and
became the silhouette. Back to 0.5.

The notches it was meant to fix were never the threshold's doing: they were the
depth-buffer bug fixed in the same pass. Two candidate causes were changed
together and the wrong one took the credit.

**The rolled edge.** The corner between a letter's face and its side now turns
over a quarter circle in two flat-shaded segments (`text.bevelRatio`). A hard
90-degree corner on a metal is a single hairline highlight — the letters read as
cut from sheet; rolling it gives the highlight somewhere to travel, and that
travelling band is what reads as rounded. The cap is inset by the bevel and the
corner rebuilt outwards, so the silhouette does not move. 6,056 triangles.

**The outline is smoothed along itself.** Snapping each node to the isoline
independently leaves it very slightly ragged — invisible on a flat lattice, one
nick per node on a bevelled edge. Two passes of averaging along the outline
settle them onto a common curve, by a fraction of a cell. The bevel's inward
direction now comes from the outline's tangent rather than the coverage
gradient, which is far steadier once the outline is smooth; the gradient still
decides which perpendicular points inwards.

**Changed**: `text-cloud.ts` (threshold, outline smoothing, tangent normals,
bevel construction; the triangulation moved ahead of the node positions it now
informs), `scene.config.ts` (`text.bevelRatio`), `model-scene.ts` (passes it
through).

**Verified.** `yarn lint`, `yarn build`, `verify.sh` clean; `gl.getError()` 0.
Checked on a production build: the filled end, mid-fill with the scaffold still
above the level, and the tide stage. No timings — the pane is still backgrounded
and rAF throttled.

---

## 2026-09-02 (18) — the word turns a second time and fills with chrome

Asked for: extend the scroll on "AI" so it turns a full 360 degrees and fills
with chrome from the bottom up over that time. Reasoning in [[decisions-log]]
ADR-0039.

**The runway is 7 viewports, not 5.** The two extra are the word's own stretch.
Every earlier window was rescaled by 4/6 (the pinned length before and after),
so the first three stages take exactly as much actual scrolling as before —
`tide` 0.1/0.42 → 0.067/0.28, `deep` 0.58/0.78 → 0.387/0.52, `morph`
0.72/0.96 → 0.48/0.64.

**Two rotation spans.** `rotation` now ends at `stages.morph.to`; a new `spin`
picks the axis up there for one more turn. The bust's revolution is paced
against its stage lines, and stretching it to cover the ending would have slowed
that. They abut exactly, so the motion neither stalls nor jumps.

**The word became a solid.** A level rising through a wireframe is a level
rising through nothing, so `buildTextLattice` also triangulates its nodes into a
mesh — front and back faces plus a side wall along every edge used by one
triangle. It shares the lattice's nodes, so the wireframe sits *on* the surface
rather than near it. 4,312 triangles.

**Chipped letters, fixed at the source.** The node threshold dropped to 0.32
while the contour stayed at 0.5: a node is snapped to the isoline whatever its
own coverage, so admitting thinly-covered cells adds nodes along the silhouette
without moving it. At 0.5 the cells the contour clipped a corner from had no
node and the solid had nothing to build there.

**The chrome is revived and now readable as metal.**

- `chrome.envBoost` → `chrome.envMapIntensity` (11). The old one multiplied the
  albedo, pushing F0 above 1 — a surface reflecting more than it receives — and
  could not brighten an environment that was not bright. `envMapIntensity` is
  per-material, so the word is a mirror without touching the light the bust was
  calibrated under.
- New `chrome.facet` / `facetScale`. A slab's front faces are coplanar and all
  reflect the same direction, so a soft room comes back as one flat tone —
  paint. Perturbing the normal is what makes neighbouring facets catch different
  parts of the environment.

**The depth bug again, one layer down.** The lattice got `depthTest: false` in
entry 16 because the invisible bust still writes depth. The solid cannot do that
— it must depth-test to occlude its own back faces — so it was getting bites
taken out of the letters along the bust's silhouette. Fixed at the source: the
**bust stops writing depth** once the morph begins. The stage quad covers those
pixels with the field either way, so the image is unchanged.

**Also**: the fill is a `discard` with a brightened band at the level (a
half-transparent metal is a ghost, not a half-filled solid), and the scaffold is
switched off outright once the chrome covers the word.

**Verified.** `yarn lint`, `yarn build`, `verify.sh` clean; `gl.getError()` 0.
White, tide, mid-spin and the filled end all checked on a production build; the
word lands facing forward, so the second revolution completes. Six draw calls at
the end.

**Not done / not measured.** The bust is still drawn twice a frame through the
whole ending while contributing nothing (carried since entry 15). No GPU
timings: the browser pane backgrounds itself, `document.hidden` stays true and
rAF is throttled to about one tick per 800 ms, so every check used long settles.

---

## 2026-09-02 (17) — the word is smooth, solid, and turns; the hero sizes itself

Asked for: "AI" not stepped, given volume, turning with the scroll like the
model — and the hero sometimes loading incorrectly. Reasoning in
[[decisions-log]] ADR-0038.

**Not stepped.** The staircase was in the *test*, not the grid: a node was in or
out by one raster pixel, and a boundary decided a pixel at a time can only fall
on a grid line. Each node now measures the fraction of its cell the glyph covers
(7x7 samples), which makes the mask a smooth field, and boundary nodes are
projected onto its 0.5 isoline along the local gradient — capped at 0.85 of a
cell so the triangles cannot fold. A finer grid would only have made the steps
smaller.

**Solid.** The lattice is duplicated at ±`text.depthRatio` and joined along the
outline only, so each letter gets a side wall instead of an interior full of
struts. 1,011 nodes / 2,757 edges become 2,022 / 5,766 — still well under the
bust's 4,961 / 15,808.

**Turning.** The unwind that landed the word square to camera is removed, along
with the sway damping: those existed because a *flat* word caught mid-turn is
edge-on and unreadable, and with thickness that is no longer true. The word now
rides the same single revolution as the bust it came from.

**The hero loading incorrectly.** Two nondeterminisms, both hardened; I could
not reproduce the symptom, so this is the plausible-cause list rather than a
confirmed fix.

- `model-scene.ts` — a **`ResizeObserver` on the container**. The renderer only
  re-sized on `window` resize, but a scrollbar arriving as the page grows, a
  devtools dock or a zoom change all move the container silently and leave the
  drawing buffer stale for the session. Verified by shrinking the container from
  script with no resize event in flight: the buffer followed, 1106 → 750 → 1106.
- `model-scene.ts` — `resizeSurface` no longer clamps a **zero** measurement to
  1x1 and records it. A container measured before layout used to lock the scene
  to a single pixel with nothing ever coming to correct it.
- `model-scene.ts` — the word is cut after `document.fonts.ready`. Before this
  it was sometimes cut from a fallback system face: same word, different shapes,
  nothing in the code to say which one you got.

**Changed**: `text-cloud.ts` (coverage field, isoline snap, slab),
`scene.config.ts` (`text.depthRatio`, `settleTurn` removed), `model-scene.ts`
(rotation, sway, sizing, font gate).

**Verified.** `yarn lint`, `yarn build`, `verify.sh` clean; `gl.getError()` 0.
All stages looked at on a production build; the word draws 5 passes.

**Environment note.** The browser pane backgrounded itself for this session, so
`document.hidden` was true and the scene correctly stopped rendering — the
canvas held its last frame and looked frozen. rAF was throttled to roughly one
tick per 800 ms, so every check here used long settles. Nothing was timed.

---

## 2026-09-02 (16) — the word is "AI", built as its own regular lattice

Asked for: drop "model", make "AI" bigger, put a real gap between the letters
(broken edges are fine), straight letters with the same junction sparks as the
bust, an even mesh, and no intermediate state showing two meshes. Reasoning in
[[decisions-log]] ADR-0037.

**The morph mechanism is replaced, not tuned.** Dragging the bust's own
junctions into letter shapes drags its connections with them, so edges spanned
between letters and no gap could ever open. The word is now its **own** mesh —
a square grid sampled against the glyph raster, a node wherever the grid lands
inside a glyph, an edge only where both endpoints are nodes. 1,011 nodes and
2,757 edges, against the bust's 4,961 and 15,808. The bust's mesh no longer
travels at all; it stays and fades, and only the lattice moves, contracting
inward from sources on the bust.

**Changed**

- `text-cloud.ts` — rewritten: `buildTextLattice` (grid + edges) and
  `sourceFromJunctions` replace the point-sampling and one-to-one matching.
  `assignTargets` and the sub-pixel jitter are gone with them.
- `scene-shader.ts` — `MORPH_FROM` define selects the direction of `morphed()`
  and which fade a material reads; `morphFadeFunctions` is split out so the
  fragment shader can use it without an `attribute`. The per-edge stretch fade
  (`aStretch`) is deleted — the lattice's edges are local by construction.
- `scene-shader.ts` — the junction sparks were gated on the tide zone alone,
  which put the letters' sparks at exactly zero. Both immersed zones now count.
- `model-scene.ts` — `buildWord` creates the lattice's own `LineSegments` and
  `Points`; `syncHandover` schedules the fades and switches each pass off
  outside its own window. `syncMorphDepth` is gone: the lattice's materials
  carry `depthTest: false` from construction instead.
- `scene.config.ts` — `text.content` "AI", `widthRatio` 1.9 → 1.55, new
  `cellRatio` and the four hand-over stops. `wireframe.haloScale` **1.007 → 1**.

**The offset halo was the "two meshes".** A copy scaled 0.7% larger puts its
spill *beside* each strand, and at hero size that is several pixels — it drew a
second net over the first. Coincident now; the sparks carry the glow.

**Verified.** `yarn lint`, `yarn build`, `verify.sh` clean; `gl.getError()` 0.
Draw counts confirm the hand-over has no two-mesh frame: **6** passes in the
tide stage, **4** at mid-morph (model, shadow, quad and the lattice's nodes
alone), **5** at the word, **3** on the opening screen. All four states looked
at on a production build.

**Not done.** The bust still draws twice a frame through the third stage while
contributing nothing (carried over from entry 15). No GPU timings — the
measuring machine has been drifting since entry 14, and the counted quantities
above are what transfers.

---

## 2026-09-02 (15) — bigger spark bloom; the third stage becomes a word

Three asks: more bloom on the particles, no black background on the transition
out of the hero, and the particle-and-edge model morphing into a 3D "AI model".
Reasoning in [[decisions-log]] ADR-0036.

**Bloom.** `particles.falloff` 2.6 → 1.5 with `sizeRatio` 0.05 → 0.075 and full
opacity. The exponent is the dial and it works backwards — brightness is
`(1 - r)^falloff`, so a *lower* number holds light further from the centre and
the halo grows. Below about 1.2 the skirt reaches the edge of the quad and the
sprites turn into visible squares.

**The third stage no longer brings a colour.** The tide field runs through it,
`--scene-deep` and `uDeepDisplay` are deleted, and what the third line sweeps is
the model opening for good — `stageOpen` returns 1 past it, brush or no brush.
The chrome is kept but **dormant**: nothing it computes can now reach the
screen. Say the word and it goes, or comes back.

**New — `src/lib/scene/text-cloud.ts`.** Rasterises the word into a 2D canvas in
the document's own face and samples it to exactly the mesh's junction count, so
every junction has somewhere to go. No typeface JSON, no `three/examples`
loader. Falls back to leaving every vertex where it is, so a font that fails to
load costs the morph and not the hero.

**Changed**

- `coarse-wireframe.ts` — also returns `junctions` and `lineJunction`, so an
  edge's two ends look up the destination of the junction they were copied from
  and the lattice stays attached across the morph.
- `scene-shader.ts` — `aMorph` / `uMorph` on the edges and the sparks; the field
  covers both lower zones; edges fade by a per-edge **stretch ratio** computed
  at build time (a vertex shader only ever sees one end).
- `model-scene.ts` — builds the targets, drives `uMorph`, unwinds the scroll
  turn to the nearest whole revolution so the word lands square to camera, and
  fades the idle sway out with it.
- `scene.config.ts` — `stages.morph`, a `text` block, and the density
  compensations (`particles.morphFade` / `morphShrink`,
  `wireframe.morphOpacity` / `morphStretchKeep` / `morphStretchDrop`).

**The bug that ate the middle of the word.** An invisible mesh still writes
depth. The bust is not drawn in the third stage, but its geometry still filled
the depth buffer, and the word forms as a thin slab near z = 0 — inside that
volume. Four letters were being cut out along the silhouette of a body nobody
could see, while the raster was provably correct. Fixed by turning `depthTest`
off for the three mesh passes once the morph starts.

**Verified.** `yarn lint`, `yarn build`, `verify.sh` clean; `gl.getError()` 0.
Checked on a production build at all three stages: white unchanged, tide showing
the larger bloom, and "AI model" legible over the field at the end. Draw calls
unchanged — 3 on the opening screen, 6 in the tide and word stages.

**Not done.** The bust still draws twice a frame through the third stage while
contributing nothing; hiding it would hide the wireframe and sparks parented to
it, so it needs a reparent and was not worth risking here. The mid-morph frame
(around 85% of the runway) is a dense undefined blob — inherent to a bust→word
morph, but if it wants shaping, that is where. No timings this turn: the
measuring machine had drifted badly by the end of the previous one.

---

## 2026-09-02 (14) — hairline net with lit junctions, second stage only

Asked for directly: thinner mesh lines in the second section, and glowing
particles where those edges meet. Reasoning in [[decisions-log]] ADR-0035.

**Changed**

- `src/lib/scene/coarse-wireframe.ts` — `buildCoarseWireframe` now returns
  `{ lines, points }` instead of one geometry. The junction cloud is the same
  welded vertices the line buffer copies its endpoints from, deduplicated and
  filtered to cells that actually carry an edge — **4,961 junctions** against
  15,808 edges on this asset. Sharing the source is what keeps a spark on a
  junction rather than near one.
- `src/lib/scene/scene-shader.ts` — new `patchParticleMaterial`, a patched stock
  `PointsMaterial` (never a `ShaderMaterial` — the shadow-sampler trap). The
  sprite is a radial falloff off `gl_PointCoord`, no texture. `brushMask`,
  `bottomFade` and `wireGlow` are evaluated **per vertex**: they are constant
  across a point sprite, so this is identical output for a third less cost.
  `points.glsl.js` has no `<dithering_fragment>`; the write anchors on
  `<premultiplied_alpha_fragment>`, its actual last chunk.
- `src/lib/scene/scene-shader.ts` — the wireframe's weight is now blended by
  `zones.y`, so the thinning lands on the tide stage and nowhere else.
- `src/lib/scene/scene.config.ts` — `wireframe.tideOpacity` 0.42 and
  `wireframe.haloTideOpacity` 0.10 (from 0.85 / 0.32); new `particles` block.
- `src/lib/scene/model-scene.ts` — builds, gates and disposes the spark cloud.
  It is hidden by the same `syncWireframeVisibility` as the lines, so the
  opening screen still issues **3 draw calls**; the tide stage goes 5 → 6.
- `src/app/globals.css` — new `--scene-wire-spark`, bound to the field's own top
  stop rather than given a colour of its own: the sparks are embers on the
  subject and have to belong to the fire behind it.

**A GL line cannot be made narrower.** `linewidth` is ignored in WebGL — a line
is one device pixel, always. What reads as thickness is the additive halo, so
that is what came down, and it is the number to reach for if it is still too
heavy.

**Verified.** `yarn lint`, `yarn build`, `verify.sh` clean. Checked on a
production build: sparks and hairlines in the tide stage, third stage untouched
(chrome, no mesh without a stroke), and the cloud stops exactly on the stage
line rather than bleeding past it. `gl.getError()` 0 — an earlier console error
about `uWireTideOpacity` was a stale buffer from the pre-fix load, and the fix
(declaring the uniform in the wireframe's fragment block) is in.

**Not trustworthy.** GPU timings taken late in the session drifted upward across
identical runs — 2.12 → 3.10 → 3.82 ms on the same white stage — so the only
figure quoted is the back-to-back pair that measured the vertex-shader hoist
(~1.33 → ~0.91 ms over the white stage, 0.83 Mpx). The sparks' absolute cost on
a full-size display is not measured, and nothing here was seen on a phone.

---

## 2026-09-02 (13) — the second stage burns instead of combing

The hero's second stage swaps its field: **Kindle**, a fire front creeping
across a fuel field, replaces the line-integral-convolution field that drew
combed strands. Palette goes from warm ember to blue. Reasoning and the two
forced deviations from the specification are [[decisions-log]] ADR-0034; the
*integration* (field inside the scene's own shaders) is unchanged from ADR-0031.

**Changed**

- `src/lib/scene/scene-shader.ts` — `tideFieldFunction` rewritten. `sceneNoise`
  and `sceneDither` were already byte-identical to the specification's `snoise`
  and `triDither`, so both are reused rather than duplicated.
- `src/lib/scene/scene.config.ts` — `tideField` replaced with the mandated
  values. Seven settings the old field needed (`flow`, `warpScale`,
  `fieldScale`, `twist`, `stride`, `hairScale`, `sheen`, `pointerLift`) are
  gone; `spread`, `rise`, `threshold`, `ember`, `lick`, `sink`, `wake`,
  `pointerLead` and `pointerBody` are new.
- `src/lib/scene/model-scene.ts` — a **second, dedicated pointer follower** for
  the field: a fast lead pole chased by a slower body, kept separate from the
  pointer that tilts the model. The gap between the poles is uploaded as
  `uTideVelocity` and is what the wake reads — verified live, two uniforms
  updating per frame, magnitude reaching ~0.2 on a fast sweep and decaying at
  rest.
- `src/app/globals.css` — Tier-1 primitives `--raw-color-tress-*` →
  `--raw-color-kindle-*` (ground / char / body / ember / lick, named for what
  each stop does in the field's own vocabulary). The semantic `--scene-tide-*`
  names are unchanged: they name the role, and the role did not change.

**Faster, as a side effect.** 6 noise evaluations per pixel against ~22. At a
0.83 Mpx buffer: tide stage **3.47 → 2.22 ms** GPU median, **5.75 → 2.32 ms**
p90; its marginal cost over the white stage fell 1.95 → 0.47 ms. The white stage
read 1.52 → 1.75 ms across the two runs — a small rise I cannot attribute, and
within the run-to-run spread this machine has been showing.

**Verified.** `yarn lint` and `yarn build` clean. All three stages re-checked on
a production build, including that the tide stage's *inverted* brush still puts
the texture back rather than removing it.

**Not verified.** The pointer's wake and the front's bulge are subtle enough that
a still frame does not show them; the uniform feeding both was checked
numerically instead. Not looked at on a phone.

---

## 2026-09-02 (12) — performance pass on the scene; the chrome goes matte

Prompted by the site starting to feel heavy. Run through [[optimize-3d-scene]]
rather than improvised; the reasoning and the trade-offs are [[decisions-log]]
ADR-0033.

**Measured first** (production build, `EXT_disjoint_timer_query_webgl2`, 2.13 Mpx
buffer): white stage 2.58 ms GPU median / 3.71 p90 · tide sweeping 3.43 / **15.84**
· tide full-screen 3.49 / 11.89 · chrome 2.80 / 3.83. The field is about a third
of the frame while it is on screen and its tail is 3-4x worse than any other
stage's.

**Changed**

- `src/lib/scene/model-scene.ts` — the stage quad now draws **after** the model
  at the far plane with `depthTest: true`, instead of first with the test off.
  The tide walk was being evaluated twice on every pixel the bust covers: once
  by the quad, once by the model's own shader, with the first one hidden.
- `src/lib/scene/model-scene.ts` — the wireframe and its glow copy are hidden
  while the first stage line is off-screen and no stroke is alive. The opening
  screen goes **5 draw calls -> 3** and sheds 63,232 vertices per frame:
  **2.34 ms -> 1.52 ms median, 6.78 ms -> 1.92 ms p90** at 0.83 Mpx. The gate
  runs only after `prewarm()`, or `compileAsync` would skip the program.
- `src/lib/scene/device.ts` — desktop DPR cap **1.5 -> 1.25** (−31% fill above
  that ratio; no change at DPR 1).
- `src/lib/scene/scene.config.ts` — `shadow.mapSize` **2048 -> 1024**.
- `src/lib/scene/scene.config.ts` — `chrome.roughness` **0.05 -> 0.3**, asked
  for directly: the near-mirror read as glass with two hotspots, and a broader
  sweep across the form is what makes a metal look solid. Free — a rougher metal
  samples a coarser mip of the prefiltered environment.

**Verified.** `yarn lint` and `yarn build` clean; all three stages and the brush
re-checked on a production build.

**Not verified, and worth saying.** The after-numbers come from a smaller
drawing buffer than the baseline — the measuring browser degraded mid-session
(screenshots capturing a partly-composited canvas, DPR fluctuating, rAF stopping
whenever the pane was hidden). Two long detours came out of trusting it: a
"black stage 3" that was a screenshot artefact, and a scroll-progress mapping
taken as `scrollY / runway` when the canvas is only pinned for `runway − 1vh`.
Nothing here was measured on the machine that reported the problem, and no
profiling was done on a real phone.

**Still open.** The renderer only re-sizes on `window` resize, so a container
that changes size without one leaves the drawing buffer stale — seen when the
browser pane was resized. A desktop-only `ResizeObserver` on the container would
close it; not done, because [[optimize-3d-scene]] §13 wants resize handling kept
off touch and the change was outside this pass.

---

## 2026-09-02 (11) — the field moves into the scene; chrome rebuilt

- **The Tress field is now the hero's second stage**, evaluated inside the
  scene's own shaders where the flat orange used to be. The standalone canvas
  behind the accent section is deleted (`src/lib/gradient/`,
  `components/common/gradient/`), and that section is flat `--surface-accent`
  again — which also closes the orange/dark seam the previous entry warned about.
  It could not stay a layer underneath: the background quad, the dissolving model
  and the bottom fog all have to agree on the field's colour at the same pixel.
  ADR-0031.
- **The chrome is a metal, not iridescence.** The rainbow cosine palette is gone;
  the albedo is now a two-stop blue-silver ramp driven by fresnel — deep on the
  faces, bright sheen at grazing angles where a mirror reflects most — lifted by
  `chrome.envBoost` so a dim IBL still reads as polished. ADR-0032.
- **The brush on the white stage opens the model** instead of bleaching its
  albedo, so the section's white shows *through* rather than leaving a lit grey
  patch. `stageMerge` and `stageReveal` collapsed into one `stageOpen`;
  `brush.textureRemoval` is gone.
- **The mesh has an uneven bloom** — a second, slightly larger, additively
  blended copy of the lines, modulated by a noise in object space so the bright
  patches belong to the model and turn with it. A GL line cannot be widened, so a
  second copy is the only honest bloom for 1px geometry.
- **Tokens:** `--gradient-tress-*` became `--scene-tide-*` (the ramp moved into
  the scene); new `--scene-chrome-sheen` / `--scene-chrome-deep`. `--scene-tide`,
  the old flat orange, is gone.

Measured on a production build: 60fps (16.7ms median, 16.8ms max) **with the
field on screen**, which is where it costs — the walk is ~22 noise evaluations
per pixel and is skipped everywhere the stage has no weight.

## 2026-09-02 (10) — the accent section gets an animated ground

The flat orange behind the closing section is now **Tress** — an animated WebGL2
gradient: noise combed along a flow field, so the strands curve. Reasoning in
[[decisions-log]] ADR-0031.

- **Raw WebGL2, not `three`.** One fullscreen triangle, one fragment shader, no
  library and no new dependency. Reusing `three` would drag a 628 KB chunk into
  this section to draw two triangles.
- **On the shared ticker**, like everything else that needs a frame (ADR-0009).
  The reference's pacing is kept exactly — clamped interval, accumulated clock,
  two-pole pointer follow — only the tick's source changed.
- **New tokens:** five Tier-1 primitives (`--raw-color-tress-*`) and the five
  Tier-2 ramp stops the shader walks. They are a calibrated set, not five
  independent colours.
- **New modules:** `src/lib/gradient/` (shader, config, engine) and
  `src/components/common/gradient/` (a `dynamic(ssr: false)` client leaf). Bots
  and browsers without WebGL2 get the section's flat ground token, which is the
  same colour the shader clears to — so there is no flash either way.
- Device pixel ratio capped at 1, and the canvas only renders while its section
  is on screen and the tab is foregrounded.

> [!warning] The gallery's handover no longer matches
> The gallery raises a flat `--surface-accent` panel that was meant to *become*
> this section; it now lands on a hard orange/dark seam. Left as-is on purpose —
> see ADR-0031 for the two ways to close it, both of which are design calls.

Measured on a production build: 60fps (16.7ms median, 16.9ms max) with the
pointer being driven across the field.

## 2026-09-02 (9) — gallery timing: later start, no stop, earlier panel

Three timing dials, one of which changed the shape of the choreography.

- **The strip starts later.** The turn's trigger moved from `top bottom` to
  `top center`, so it begins once the section has risen half a viewport instead
  of the instant it peeks in. The cards are on screen before that — they simply
  hold still.
- **The strip no longer stops.** The turn's marker is now the **whole** section
  rather than its first 3.2 viewports, so the two phases **overlap**: the ring
  keeps turning while the panel climbs over it. It also turns *past* the last
  card — the new `overshoot` (1.5 card steps) carries the strip on up and out of
  frame, because ending on the final card parked dead centre is exactly the stop
  this was meant to remove.
- **The panel launches earlier**, at 1.6 viewports into the section instead of
  2.2. `scroll.turnViewports` is gone; `scroll.riseStartViewports` replaces it,
  and it now names where the *panel* begins rather than where the turn ends.

Measured on a production build: the ring holds at -20° while the section rises,
picks up at the halfway mark, and runs unbroken to -170° at the handover; the
panel starts at 1.6vh and lands exactly as the stage unpins. 60fps throughout
(16.7ms median, 17.0ms max).

## 2026-09-02 (8) — the gallery arc turns concave

- **Concave, not convex.** The reader is now *inside* the cylinder: the centred
  card sits furthest away and its neighbours wrap forward, which is the curve in
  the reference. Mechanically it is `translateZ(-radius)` on each card against
  `translateZ(+radius)` on the ring's parent. Verified by measuring the projected
  corners rather than by eye — the centred card reads 243px on both edges while
  its neighbours reach 271px on the edge *away* from centre.
- **Going concave reverses the direction of travel**, so the seat angles are now
  positive and the ring turns negative. With the old signs the column ran
  top-to-bottom.
- **Radius raised 53 → 69rem.** On a concave arc a card gets *closer* as it
  leaves the centre, and a tight radius would let one balloon over the viewport
  on its way past. Anything still in frame now stays within ~6% of its centred
  size.
- **Cards 14x16 → 19x21rem**, and their shadows are gone.
- **Both phases start at `top bottom`, not `top top`.** The strip is already
  moving as the section rises into view rather than standing still until it
  pins, and the orange panel begins its climb a viewport earlier.

## 2026-09-02 (7) — the gallery turns vertical; the hero turns from the start

Reasoning in [[decisions-log]] ADR-0030.

- **The gallery's cylinder lies on its side.** Cards are stacked vertically and
  the ring turns about the X axis, so the strip travels bottom-to-top. On a
  vertical arc the card's **height** is what has to clear the chord between two
  seats, so the geometry changed with it: 20° steps, 14x16rem cards.
- **The closing panel left the carousel.** It is a full-width plane rising from
  below, tilted away so its top edge is foreshortened, unwinding to flat as it
  lands. Its own perspective context, so it tilts independently of the arc.
- **All visible UI is gone** from the section — no heading, no card numbers or
  titles, no label on the panel. The heading survives as `sr-only` so the
  document outline stays intact; card titles survive as `alt` text for when
  artwork arrives.
- **The model turns from the first frame of scroll** (`rotation.from` 0.32 → 0).
  What keeps its untextured back out of sight was never the delay — it is the
  rate; ADR-0030 has the arithmetic, and ADR-0028's rationale is marked reversed.
- **Pointer tilt raised** 0.13 → 0.32 rad (~18°), so moving the cursor swings the
  subject rather than nudging it.

Verified on a production build: 60fps (16.7ms median, 16.8ms max) scrubbing the
whole page, and each phase checked at its own hold.

## 2026-09-02 (6) — work gallery, and a broken engine primitive

A white section after the hero: eight portrait cards on a turning arc, closing on
an orange card that grows into the section below it.

- **The cards sit on a cylinder, not a path.** Each is placed once at a fixed
  angle and the *ring* turns, so a scroll frame animates one transform rather
  than nine. New `src/lib/gallery/gallery.config.ts` holds the geometry.
- **The closing card is the transition.** It takes the last seat on the arc, so
  the turn ends with it centred and facing the camera — which is what lets it
  simply scale up and un-round into a full-bleed orange section. Its label
  counter-scales and fades, or one word would fill the screen sixteen times over.
- **Two phases, two markers.** A `TriggerPos` names element and viewport *edges*
  only, so "turn, then grow" is two `<ProgressTrigger>` elements measuring their
  own spans, with a viewport of hold between them.
- **New components:** `src/components/common/gallery/`. Cards render a labelled
  placeholder until artwork exists — drop files in `public/assets/gallery/` and
  add a `src` per item in `src/data/mocks/home.ts`; nothing else changes.
- **New tokens:** `--raw-color-neutral-100`-backed `--surface-raised`,
  `--surface-accent` / `--surface-accent-foreground` for the orange section, the
  Tier-3 `--radius-card`, and `--scene-surface-foreground`.

> [!warning] `--foreground` inverts with the OS theme; the stage does not
> The gallery sits on the permanently-white `--scene-surface`, so `text-foreground`
> rendered near-white on white in dark mode. Anything on that stage uses
> `--scene-surface-foreground`, which is deliberately not overridden.

**`<SpringTrigger>` turned out not to work** — its values never reach the DOM.
That is [[decisions-log]] ADR-0029, and it is the reason this section drives its
transforms by hand from `<ProgressTrigger>`.

## 2026-09-02 (5) — hero scene: three stages, inverting hover, chrome

The scroll now moves through three stages instead of two, and the hover means
something different in each. Reasoning in [[decisions-log]] ADR-0028.

| Stage | Ground | Model | Hover |
|-------|--------|-------|-------|
| 1 | `--scene-surface` white | textured, lit | brush takes the texture off, shows the mesh |
| 2 | `--scene-tide` orange | dissolved into the ground, mesh only | **inverted** — brush puts the texture back |
| 3 | `--scene-deep` black | chrome with iridescent highlights | brush dissolves it, shows the mesh |

- **The blue is now orange.** `--raw-color-sky-500` (`#30a0cc`) is gone,
  replaced by `--raw-color-orange-500` (`#f05a22`). New `--scene-deep`, bound to
  the existing `--raw-color-neutral-950` — no new primitive needed for black.
- **The line between blocks is crisp.** Its antialiasing rim is now specified in
  **device pixels** (`stages.edgePixels`, 0.75) rather than as a fraction of the
  viewport, which was ~2.5px on a short screen and read as soft.
- **The model turns on scroll**, a full revolution — but only from
  `rotation.from` (32%), after the first line has covered it. Earlier than that
  it would swing this front-only capture's untextured back into view while the
  textured stage is still on screen.
- **Chrome is per-fragment, not a second material.** Metalness, roughness and
  albedo are local variables by the time `lights_physical_fragment` runs, so
  stage 3 overrides them in place — one program, one draw, no mid-scroll compile.
- **Runway lengthened** to 5 viewports to give three stages room to be read.
- `sceneConfig.tide` became `sceneConfig.stages` (+ `rotation`, `chrome`);
  `wireframe.opacity` split into `opacity` and `immersedOpacity`.

Verified on a production build: 60fps (16.7ms median, 16.8ms max) across the
whole scroll with all three stages and the turn, and every stage checked at its
own hold.

## 2026-09-02 (4) — hero scene: the scroll wave

Scrolling the hero now sweeps a horizontal line up the screen. Above it: white
stage, textured model. Below it: `--scene-tide` field, and the model dissolved
into it so only its wireframe remains, in white. At mid-scroll both states are on
screen at once. Reasoning in [[decisions-log]] ADR-0027.

- **The page has a scroll runway.** It was exactly one viewport tall, so there
  was nothing to scroll. The stage is now `position: sticky` inside a box
  `tide.runwayViewports` (2.6) screens tall — the canvas stays put while the
  scroll drives the tide. The runway is rendered by the viewer, not the view.
- **The stage is painted by a fullscreen quad**, because `setClearColor` takes
  one colour and the stage now has two at once.
- **The wireframe is built on every tier now**, not just where there is a
  pointer: the tide reveals it too, and below the line it is the only thing
  drawing the subject. The raycast — the expensive half — stays desktop-only.
- **New tokens:** `--raw-color-sky-500` (`#30a0cc`, sampled from the model's own
  shirt in the render, so the field belongs to the subject), plus `--scene-tide`
  and `--scene-wire-immersed`.
- **Scroll comes from the starter's `<ProgressTrigger>`** on the shared ticker,
  so the scene still adds no scroll listener of its own.
- The reduced-motion path no longer draws one frame and stops — the scene is
  scroll-reactive now, so it runs the loop and skips the *draw* while nothing has
  changed.

Verified on a production build across all three tiers: 60fps (16.7ms median,
17.2ms max) while scrolling the line across the screen, and the `three` chunk
still absent from the bot path.

## 2026-09-02 (3) — hero scene: crisp stroke, closer framing, stronger grain

Three dials, plus one fix the first of them exposed.

- **The stroke has an edge now.** The brush mask faded over a wide gradient
  (a `smoothstep` from 0.35 of the radius outwards), which read as a *blur*
  following the cursor rather than as a mark. It is now a hard disc with only a
  thin antialiasing rim — `brush.edgeSoftness`, 0.07 of the radius.
- **Strokes are interpolated along the segment.** Losing the soft edge exposed
  something the blur had been hiding: the surface is only raycast once per frame,
  so a fast drag left gaps between recorded points, and an un-blurred gap reads
  as a row of separate dots rather than a stroke. `Brush.add()` now walks the
  segment at `minStep` intervals instead of recording only the endpoint.
- **Camera moved in:** `camera.fitMargin` 1.18 -> 1.02, so the subject fills the
  stage instead of floating in the middle of it.
- **Grain strengthened:** `grain.intensity` 0.075 -> 0.17.
- Poster regenerated to match the new framing and grain.

Verified on a production build (`yarn build` + `yarn start`) per the caveat in
the entry below — never on `yarn dev`.

## 2026-09-02 (2) — hero scene: brush reveal, self-shadowing, no floor

Second pass on the home hero. Reasoning for each decision is in
[[decisions-log]] ADR-0025 and ADR-0026.

- **Brush reveal (new interaction).** Moving the pointer over the model paints a
  trail in **object space**; inside it the albedo washes out and the topology is
  drawn. Object space, not screen or UV, so the stroke sticks to the surface as
  the model sways — and so it needs neither a render target nor this asset's
  fragmented UV atlas. New modules `brush.ts`, `scene-shader.ts`,
  `coarse-wireframe.ts`. Desktop and tablet only: no hover on a phone.
- **The wireframe is grid-welded, not the real one.** 102k triangles renders as a
  smudge at hero size; welding keeps the model's own topology at a readable
  density (ADR-0026).
- **Grain moved into the model's shader.** It was a fullscreen quad, so it
  grained the empty stage as well. `grain-overlay.ts` deleted.
- **Bottom fade ("fog").** The bust ends on a flat cut; the last stretch now
  dissolves into the stage colour.
- **Floor removed.** The `ShadowMaterial` ground plane and its contact shadow are
  gone. The key light casts the model onto **itself** instead, which is where the
  contact information now comes from.
- **Lighting reworked for contrast.** Was IBL-dominant (environment 1.45 against
  a key of 1.15) — an omnidirectional soft box is definitionally flat. Now a key
  (3.9) and a rim (3.0) over a low environment floor (0.32).
- **Normal map restored via computed tangents.** ADR-0024 dropped it because
  derivative-based tangents shred this UV layout. `geometry.computeTangents()`
  fixes that at the source, and the micro-relief is the rest of the "plasticine"
  fix. **Note:** with a real TANGENT attribute the loader's `normalScale` of
  (1, -1) is wrong twice over — the bitangent sign comes from `tangent.w` — and
  the doubly-flipped frame renders the model as a black silhouette. The sign is
  `+1` here (`material.normalTangentSign`).
- **Roughness 0.95 → 0.58.** 0.95 was the opposite error to the file's 0.5: a
  perfectly matte surface has no specular direction at all.
- **Token renamed: `--scene-shadow` -> `--scene-wire`.** It was named for the
  contact shadow the removed ground plane used to catch; its only consumer now is
  the wireframe's line colour, so the old name no longer described its purpose
  ([[design-system]] Tier 2 rule 2). Same `--raw-color-black` primitive behind it.
- Poster regenerated to match. Measured 60fps (16.7ms median, 16.8ms max) with
  the pointer moving continuously over the model, so the per-frame raycast against
  102k triangles is within budget.

> [!warning] Two failures here present as a blank canvas or a black model, not as
> an error — a raw `ShaderMaterial` in a shadowed scene, and a shadow camera whose
> depth range is too wide. Both are written up in ADR-0025 before re-deriving them.

> [!important] Verify this scene on `yarn build` + `yarn start`, never on `yarn dev`
> The scene is constructed in a `useEffect`, so Fast Refresh re-runs it against a
> WebGL context and module state that may be half-replaced. During this work the
> dev server showed the model **black**, then **chrome**, then a **blank canvas** —
> three different wrong pictures, all from code that rendered correctly on a
> production build seconds later. [[optimize-3d-scene]] already says dev-mode
> *numbers* are invalid; dev-mode *pixels* are too. Hard-reload after editing
> anything under `src/lib/scene/`, and confirm on a production build.

## 2026-09-02

**Home hero is a 3D model on a white stage.** `src/views/home.tsx` was empty;
it now renders a full-viewport WebGL scene of `public/assets/hero/model.glb`.

- **Dependency:** `three` `^0.185.1` + `@types/three` (dev). Used directly, not
  via `@react-three/fiber` — [[decisions-log]] ADR-0023. [[tech-stack]] updated.
- **New modules:** `src/lib/scene/{device,scene.config,model-scene,grain-overlay}.ts`
  and `src/components/common/scene/` — see [[utils]] and [[components/common]].
- **Vendored:** the Draco decoder into `public/draco/` (the GLB requires
  `KHR_draco_mesh_compression`). Kept local, never a CDN — it is on the critical
  path. The model moved to `public/assets/hero/` per the section-folder rule.
- **Tokens:** `--raw-color-black`; `--scene-surface` / `--scene-shadow`, both
  deliberately **not** overridden in the dark-mode block — the lighting and the
  contact shadow are calibrated against a white ground. Bound as
  `--color-scene-surface` (`bg-scene-surface`).
- **Route `/` is no longer statically prerendered.** It is now `ƒ` (dynamic,
  server-rendered on demand), because `isBot()` reads headers — the trade
  [[seo-metadata]] already warns about, taken deliberately here so the `three`
  chunk stays out of the graph crawlers download. Verified against the
  production build: the 628 KB `three` chunk is fetched on the user path only.
- **ESLint now ignores `public/**`.** `eslint.config.mjs` was linting the
  vendored, minified Draco decoder and failing the run on `no-this-alias` /
  `no-require-imports`. Static assets are served verbatim and never bundled, so
  no house rule applies to them.
- **`body` sizing changed.** The starter centred an empty page on a fixed
  `100vh`/`100vw` flex box. That cross-axis centring shrink-wraps `main`, so a
  full-bleed section could not fill the width, and `100vw` would add a horizontal
  scrollbar once the page grows past one screen. Now `min-height: 100lvh` and
  `width: 100%`; sections declare their own height.

**Three things about the asset that cost the most time, recorded so nobody
re-derives them** (full reasoning in [[decisions-log]] ADR-0024):

1. The GLB sets no `metallicFactor`, and glTF's default is **1.0 — fully
   metallic**, which discards the photographic albedo and renders it as chrome.
2. It ships **no `TANGENT` attribute** while using a normal map over an atlas of
   thousands of tiny UV islands — derivative-based tangents flip at every seam
   and shred the surface. The map is dropped; the geometry already has the
   detail.
3. It is a **front-only capture** — the back is untextured black, which is why
   the idle motion is a bounded sway and not a rotation.

Also: `NeutralToneMapping`, not ACES — ACES's filmic toe crushes this asset's
range to a silhouette. `PCFShadowMap`, since `PCFSoftShadowMap` is deprecated in
three 0.185.
