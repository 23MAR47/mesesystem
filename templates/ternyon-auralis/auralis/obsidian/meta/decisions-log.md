---
tags: [meta, decision]
updated: 2026-07-28
---

# Decisions Log (ADRs)

Architecture Decision Records. Each entry captures a choice, its context, and its
consequences. Use [[templates/adr-note]] for new entries. Newest first.

---

## ADR-0039 — Lattices build per segment in-shader; figures rock as whole-mesh transforms about their own axis

- **Status:** Accepted
- **Date:** 2026-07-28

**Context.** The hero net's exit was a `scale.y` collapse — cheap, but a squashing cylinder under
a fixed camera reads as a *skew*, and the nets otherwise popped in fully formed (the hand's and
tree's just sat in the fog). Separately, the figures needed a visible "floating, rotating" idle
that per-particle shimmer can't provide — that motion has to move the *form*, not the beads.

**Decision.**
1. **Net build/dissolve is a shader state, not a transform.** `createContainmentField` returns
   `{ lines, uBuild }`; each wireframe segment carries a random, bottom-biased threshold plus an
   end-param attribute, and as `uBuild` passes the threshold the line draws from one end with an
   accent pulse. One uniform drives build *and* dissolve (run it backwards), so the hero exit is
   the weave in reverse — no geometry transform, no skew, and the same effect serves all three
   acts on their own scroll windows. A transform-based alternative can only move the cage as a
   rigid object; only a per-segment state can make "different lines" arrive at different times.
2. **Figure float is a whole-mesh yaw+bob about the figure's own axis.** Instance positions bake
   the world centre in, so `mesh.rotation.y` alone would swing the far acts around the world
   origin; `rockMesh` pairs the rotation with `position = c − R·c`, keeping the pivot at the
   figure for two matrix writes per frame. Gated per act (hero out by `seqP 0.08`, hand only
   between scan and morph) because the scroll choreography — flight corridor, wave curtain —
   writes **world-space** targets into the same instance buffers and must not be re-rotated.

**Consequences.** All three cages animate for the cost of one uniform each, and the figures read
alive at the form level. Trades: pointer-repulsion math and the tree's relax simulation still
measure from *unrotated* rest positions, so at the chosen amplitudes (≤ 0.12 rad) the cursor
interaction is offset by under a unit — imperceptible, but raising `rock` much further would
make the hover visibly miss. The hero X also grew ×1.2 with its net (`field.heroScale`); its
~19.6-unit crown sits just inside the 20-unit shadow-frustum top — grow it again and the shadow
camera must grow with it.

---

## ADR-0038 — Ambient life runs on the GPU off one clock uniform; per-bead geometry cut 4×

- **Status:** Accepted
- **Date:** 2026-07-28

**Context.** Two complaints pulled in opposite directions: the page lagged, *and* every act read
too static at rest — the hero X, the wave "terrain", and above all the baked tree (which, per
ADR-0025/0031, never sees a per-frame `updateCloud` at all, so it had literally zero motion).
Adding life through the CPU path would mean per-frame loops over 30k–150k instances plus matrix
re-uploads — paying the lag complaint to fix the static one.

**Decision.** All new ambient motion is **vertex-shader work driven by uniforms**, so its
per-frame CPU cost is a handful of uniform writes:
- **Idle life** in the shared particle shader (`life`: `uTime` / `uFlowTint` / `uFlowAmp`) — a
  tinted band (the shared violet accent, strength far below the bloom threshold so it tints
  rather than glows) drifting through each cloud, plus a small whole-form sway. Per-cloud
  strengths in `sceneConfig.life`; the tree leans on it hardest. Defaults are no-ops, so the
  patch is free for anything that doesn't opt in.
- **Rising accent motes** (`rising-motes.ts`) — sparse additive sparks over the wave terrain and
  around the tree whose entire climb/sway/fade-in/dissolve cycle is computed in the vertex
  shader from a per-mote seed attribute; the CPU writes one `uTime` per system per frame.
- The finale additionally gets a **slow tree-camera drift** (sub-unit sine orbit around the
  static pose) — parallax against motes and dust; two vector writes per frame.

**Paired perf cut.** Bead geometry dropped from `SphereGeometry(0.5, 16, 12)` (384 tris) to
`(0.5, 8, 6)` (96 tris). The beads render at a few px, so silhouettes are indistinguishable, and
this is ~4× off the frame's dominant vertex load — every cloud pass *and* the 4096² shadow pass
run these instances. Verified visually at every act via `?debug` scrubs; no console errors, and
the program count stays stable after warm-up.

**Consequences.** The scene gains motion in every resting state while its per-frame JS gets
*cheaper*, not heavier. The trade: the flow band and sway are world-space functions, not
simulated state — they repeat on a long period and can't react to interaction (that stays the
pointer paths' job). The dust motes also shrank (`size 0.5 → 0.3`) — at 0.5 they read as white
blobs "covering" empty space rather than fine air.

---

## ADR-0037 — The set is reduced to the lattice; the intro assembles out of the camera; the roll becomes a bank

- **Status:** Accepted
- **Date:** 2026-07-28

**Context.** Three look-level complaints: the studio set (metal podium discs, floor, overhead
ring fixture) read heavy and dated against the weightless particle forms; the load opened on a
bottom-up scan of an already-placed X — correct but not arresting; and the full 2π camera roll
between the first and second acts read as a gimmick ("tacky").

**Decision.**
1. **Only the lattice remains.** All three podium groups, the infinite floor discs, and both
   ring fixtures (torus + glow skirt + desktop `PointLight`) are deleted; `podium.ts` and
   `ring-light.ts` are gone. Each act is its containment net floating in the gradient haze, and
   the net now fades at **both ends** (`sin(π·t)` opacity) — with no ground to pool light on, an
   unfaded base read as a hard floating rim. The removed point light's fill is compensated by
   raising the hemisphere (0.14 → 0.3) and ambient (0.05 → 0.12) lights — which also unifies
   tiers, since the point light was desktop-only. `podium2`/`podium3` survive as
   `handAnchor`/`treeAnchor` (the nets still need world positions).
2. **The intro is an assemble, not a scan.** `updateCloud` gained an `assemble` path: every
   glyph particle launches from a scattered point around the camera's opening pose (its flow
   vector doubles as the launch direction, so neighbours stream in as loose currents), staggered
   per particle, carrying a pink comet trail through the shared scan-tint path. Driven by the
   scene clock from the preloader hand-off (`sequence.intro`, ~1.8 s). The hero copy's reveal
   delays were re-paced to land with it, and `HeroLights` fires a staged entrance (rays swing
   into place, glint rises from its corner) off the same `isPageRevealed()` signal — the whole
   first frame *arrives* instead of being pre-assembled.
3. **The roll is a bank.** `rollAngle = roll · sin(π·ep)` with `roll` 2π → 0.26 rad: the camera
   leans ~15° mid-flight and settles back upright by `arrive`. `HeroLights.rollDegAt` mirrors
   the same formula, so the flares stay frame-locked to the camera.

**Consequences.** The scene is lighter (fewer draws, one shader variant fewer per fixture, no
`PointLight` term on every lit fragment of a 150k cloud) and the acts read as pure holograms.
Costs: the reflective-metal look and its PMREM rationale are history (the environment survives
at `envMapIntensity 0.08` on the particles); the glyph's `scanGlow` config died with the scan
intro; anything that mirrored the old linear roll must mirror the sin envelope instead — the
flares already do, and that coupling remains the fragile point to check when retuning the fly.

---

## ADR-0036 — Heavy-cloud hover is a GPU simulation (ping-pong texture), not a shader formula

- **Status:** Accepted
- **Date:** 2026-07-27

**Context.** ADR-0035 got the tree's hover onto the glyph's *force law*, and it still didn't read like
the glyph. The reason is that `updateCloud`'s hover is not a formula at all — it is a **simulation**.
Each bead eases toward `rest + push(cursor)` at `relax` (0.22) while the cursor is on it and drifts
back at `returnRelax` (0.035) once it leaves, so beads flow out of the way and then *ooze* back over
roughly half a second. A stateless shader evaluates the push fresh every frame and therefore has a
rigid hole welded to the cursor. That difference — not the force law — is the whole feel of the
effect, and it is why "make it like the hero" kept failing.

**Decision.** Give the shader the memory it was missing: `pointer-relax.ts` keeps a **ping-pong
half-float texture**, one texel per bead (`xyz` = current world displacement, `w` = current heat),
advanced by one fullscreen pass per frame whose fragment shader is `updateCloud`'s hover line for
line, easing included. The cloud's vertex shader samples it through a per-instance `aRelaxUv`
attribute and adds the displacement, taking the tint from the same eased heat. Enabled per cloud via
`CloudOptions.pointerRelax` (only the tree), and only on pointer devices.

**Why not the CPU.** The obvious alternative is to run the easing in JS and upload it. At the tree's
~150k that is a full `updateCloud` (a ~90 ms block — ADR-0025) or, at best, a per-frame 1.8 MB
attribute upload. The GPU pass is a 388×388 draw: no JS, no upload, and it scales.

**Consequences.** The tree's hover is now the glyph's hover in feel as well as in law, and the violet
bloom fades up and down with the displacement instead of snapping. Costs: a second shader variant of
the particle material (the analytic push stays for clouds whose positions are simulated on the CPU),
two render targets plus a float position texture, and state that is invisible from the DOM — which is
why `?debug` gained `__scene.relax()`, a readback of the simulation's max displacement and heat.
Half float is deliberate: full float render targets are an extension, half float is guaranteed
renderable in WebGL2, and the values here (displacement ≤ 6 units, heat ≤ 1) are far inside its range.

> [!danger] Two `onBeforeCompile` variants need two **program cache keys**
> three.js keys its program cache on `material.customProgramCacheKey()`, and the default
> implementation returns **`onBeforeCompile.toString()`** — the *source text*. Every cloud here
> shares one `patchParticleShader` closure, so glyph, hand and tree all produced the **same key**
> and three.js handed the tree the glyph's already-compiled program: the analytic branch, with no
> `aRelaxUv` and no `uRelaxMap`. The simulation ran perfectly, `__scene.relax()` reported a healthy
> displacement, and not one bead moved — because a *missing* attribute in GLSL reads zero rather
> than failing. The scan kept working (it's in both variants), which made it read as a
> hover-specific bug. Fixed by giving the material an explicit
> `customProgramCacheKey = () => relax ? "particle-cloud-relax" : "particle-cloud"`.
>
> It looked like "works only after a reload" because reloads restore scroll: land on the finale and
> the **tree** compiles first, so the shared program is the relax variant and everything works —
> including for the glyph, whose null map samples to zero.
>
> The lesson generalises past this file: **any `onBeforeCompile` that branches must also override
> `customProgramCacheKey`.** And verify a shader effect by what the *renderer* draws, not by what
> the CPU-side state says — `__scene.relax()` now reports the program's attribute list for exactly
> this reason.

> [!warning] The attribute and the shader variant must be decided together
> The first cut declared `attribute vec2 aRelaxUv;` from `CloudOptions.pointerRelax` but *created*
> the attribute in the scene's async tree loader, and only when `wantsPointer(tier)` — two different
> conditions, in two different files, one of them async. Whenever they disagreed the vertex shader
> read a **missing attribute, which is not an error in GLSL**: it reads zero, every bead samples
> texel 0, and the hover is silently dead. Both now come off the same flag inside
> `buildParticleCloud`. The simulator is also **primed with one cursor-less step before
> `renderer.compile`**, so the material never links against a null sampler and the first frame that
> needs the hover already has state to read.

---

## ADR-0035 — GPU cloud effects measure from the instance centre (amends ADR-0026)

- **Status:** Accepted
- **Date:** 2026-07-27

**Context.** ADR-0026 gave the 150k tree a GPU cursor push and concluded the force **had** to be
view-plane (screen x/y), because the world-radial first cut ballooned near-camera beads into giant
jittery blobs. That conclusion was wrong about the cause, and the view-plane workaround had its own
failure: a screen-space disc sweeps every particle at **every depth** behind the cursor, so on a tall
volume like the tree the whole column gathered into a smooth ball — rejected outright ("это херня").

**Decision.** The real bug was the *measuring point*, not the axis. Both cuts computed the force from
`wPos` — the **vertex** position, which includes the sphere's own local offset. So each vertex of one
bead got a different direction and magnitude, inflating the sphere itself; that, not the `+z`
component, is what produced the blobs. Measuring from the **instance centre** (`modelMatrix ·
instanceMatrix · origin`) makes every vertex of a bead move as one rigid unit, which frees the shader
to use the hero glyph's law **verbatim**: 3D world-space distance, `influence = 1 − d/radius`,
displacement `influence² · strength` directed radially away, plus the same violet heat tint
(`uPointerTint`, `max`-combined into `aGlow` exactly as `updateCloud` does). Same rule applies to the
**scan-in** added alongside it: it scales `transformed` in local space and derives its height from the
instance centre, so a bead grows in whole rather than being sheared by the reveal line.

**Consequences.** The tree's hover is now the glyph's hover — beads part around the cursor and light
violet — with no per-frame CPU cost, and the same patch drives the tree's bottom-up materialise. It
also means **any** future GPU cloud effect must start from `instCenter`, not `transformed`/`wPos`.
One boundary bug this introduced and its fix are worth keeping: the scan line must run to
`uScan · 1.05`, not `uScan`, or "fully materialised" (`uScan = 1`) leaves the topmost beads *on* the
line and scales them to zero — which silently shaved the crown off **every** cloud, including the
glyph and hand that never scan.

---

## ADR-0034 — The page reveal is gated on scene readiness, not a timer

- **Status:** Accepted
- **Date:** 2026-07-27

**Context.** The site's first paint is a 3D scene whose two point clouds load asynchronously and whose
shaders compile on first use. Revealing the page on a fixed delay would either uncover a frame with no
hand in it, or land exactly on the compile stall the warm-up (ADR-0031 / §3) exists to hide.

**Decision.** `scene-ready.ts` publishes the scene's **three gating steps** — hand cloud, tree cloud,
warm-up pass — through `useSyncExternalStore`, and `Preloader` holds the page until all three land. A
**failed** asset still counts as settled (`.finally`), because the scene is explicitly designed to run
without either cloud, so a missing file must never leave the site behind a permanent loader.

**Consequences.** The reveal is honest — the loader's bar tracks real work and the hand-off is on a
complete frame. Cost: a component now couples to scene internals through a store, and any new gating
step must be added in both places (`TOTAL_STEPS` and the call site). Three implementation traps found
here are recorded in [[frontend/components/common]] (Preloader) because they generalise to every
spring in this project: `useSpring` needs an explicit `from` or it animates *up* from 0; `onRest` runs
the callback captured by the render that *started* the animation, so reading current state inside it
is stale; and a wall-clock `setTimeout` must never gate a spring, because rAF freezes in a background
tab while the timer does not.

---

## ADR-0033 — Overlays get explicit mobile compositions; the adaptive grid is not a responsive strategy

- **Status:** Accepted
- **Date:** 2026-07-27

**Context.** The scene overlays were rebuilt from desktop Figma frames with absolute edge anchors and
fixed `rem` widths. The project's [[frontend/design-system|adaptive grid]] scales the root font-size
with the viewport, which makes a layout *proportional* — it cannot change a **composition**. On a
phone the desktop composition survived arithmetically and failed visually: hero words pinned to
opposite edges collided over the glyph, a right-anchored heading with no left bound grew off-screen,
and the hand act stacked two 4rem headings into each other.

**Decision.** Every overlay carries a **mobile-first layout with `md:` restoring the desktop one** —
real re-composition (stack instead of pin, vertical instead of row, drop the secondary heading, one
tagline instead of two), not just smaller type. The header collapses to brand + burger with a
full-screen panel. The adaptive grid keeps doing what it is for: proportional scaling *within* a
composition.

**Consequences.** Each overlay now states both layouts in one class list, which is more to read but
keeps the two in one place. The rule going forward: **if a breakpoint needs different *placement*,
write it — don't expect the grid to solve it.** One trap worth remembering: `TextEngine`'s tag is a
wrapping flex row, so a right-anchored heading needs an explicit left bound or the engine's own
wrapping pushes it past the screen edge.

---

## ADR-0032 — Icons and the share card are generated from the mark, not committed PNGs

- **Status:** Accepted
- **Date:** 2026-07-27

**Context.** The starter shipped a placeholder icon set (favicons, Android/Apple tiles,
`open-graph.png`, `browserconfig.xml`) plus an `icons` block and an `openGraph.images` entry in
`generateMetadata`. All of it said "New Project", the OG asset was 900×600 rather than 1200×630, and
keeping a dozen binaries in sync with the brand by hand is exactly the kind of drift nobody notices
until a link preview is wrong.

**Decision.** Author the mark once (`public/assets/brand/logo.svg` — the scene's glyph, two crossed
bars, proportioned from `sceneConfig.glyph` so the tab icon and the 3D hero are the same shape) and
**generate** `app/icon.tsx`, `app/apple-icon.tsx` and `app/opengraph-image.tsx` from it with
`ImageResponse` at build time. The card renders in the site's own display face and takes its name and
subtitle from `siteConfig`, so the `<head>` and the preview can't disagree.

**Consequences.** One source for the brand, correct dimensions by construction, and nothing binary to
maintain. Two things this forces, both easy to regress:
- **Nothing may declare `icons` or `openGraph.images`** — paths there *override* the generated routes.
  Both were removed from `generateMetadata`; `ogImage` survives only as an explicit per-page override.
- **`app/favicon.ico` had to go**, because it takes precedence over `app/icon.tsx`. The starter's whole
  placeholder set was deleted with it and `manifest.json` repointed at `/icon` and `/apple-icon`.

The mark is redrawn as two rotated rules inside each generator rather than imported from the SVG:
Satori (what `ImageResponse` renders with) doesn't rasterise external SVG files. So the SVG is the
canonical artwork and the generators are a second expression of it — if the mark changes, both move.

---

## ADR-0031 — One device tier drives the whole scene; the phone gets a smaller scene, not a different one

- **Status:** Accepted
- **Date:** 2026-07-27

**Context.** The scene rendered identically everywhere: raw `min(dpr, 2)`, a 4096² PCF-soft shadow map,
six real-time lights, ~230k instanced spheres across three clouds, a full-screen bloom chain, its own
forever-`rAF`, and pointer listeners on every device. A phone is fill-bound and would render up to 9×
the fragments of a 1× screen through all of that. Measurement also showed `renderer.info.programs`
growing **41 → 42** during a scroll — a shader linking mid-scroll, i.e. a stall exactly at the
wave→tree transition, because `WipePass` compiles on first use and its first use *is* that boundary.

**Decision.** A single `lib/scene/device.ts` decides the tier **once at construction** and everything
reads from it — DPR, particle counts, bloom, light count, shadow map size, frame budget, whether the
pointer is listened to. One source, so the values cannot drift apart; read once, because a device does
not change tier mid-session and rebuilding 150k-instance buffers on a resize costs more than the
mismatch. Alongside it: the scene joined the app-wide ticker (gated on `document.hidden`, throttled per
tier), and the post chain is prewarmed at load so no program links during scroll.

**Consequences.** The phone gets the same scene, smaller: DPR 0.85, no shadows, 3 lights, ~a third of
the particles, half the bloom, 30 fps — 22 shader programs instead of 42. `programs` is now stable
across a full scroll, which is the acceptance test for "no micro-freezes".

Trade-offs taken deliberately, each a look sacrificed for a tier:
- **No shadows on mobile.** The clouds' volume then comes from their baked shade + the ring light
  rather than real self-shadowing (ADR-0022/0023's mechanism, minus the shadow map). They read
  flatter up close; it is the single largest saving available and invisible at the scene's scale.
- **Three lights instead of six on mobile** (no rim fill, no ring `PointLight`s). The ring's *visible*
  part is its emissive core and glow skirt, which are unlit geometry and unchanged; only the light it
  cast on the podium is gone. Light **count** is fixed at construction because changing it recompiles
  every program.
- **`density` is the knob for the loaded clouds**, not the baked point count: dropping it removes the
  jittered infill copies and keeps the original scanned points, so the silhouette survives and only
  the filler thins. Cutting the baked points would punch holes in the form.
- **No resize handling on mobile.** iOS Safari fires a viewport change every time the URL bar collapses
  during scroll; honouring it rebuilds the drawing buffer and both HDR targets mid-scroll and reads as
  a whole-scene flash. The surface is sized once per session — the cost is that a rotation does not
  reflow it.
- **Frame budget forced the clock to change.** `time` was `tick / 60`, a frame counter; at 30 fps that
  would have run every drift, ripple and idle at half speed. It is now real elapsed seconds with `dt`
  clamped to 50 ms so a backgrounded tab doesn't teleport the scene on return.

Not done: the scene is **not** stripped for bots. `isBot()` exists, but this scene *is* the page — there
is no static poster to serve instead, so skipping it would ship an empty document. That needs a poster
frame first. Asset compression (Draco/KTX2) doesn't apply either: the clouds are already a baked
`bin_u16` point buffer, not glTF. See [[frontend/components/common]] (Scene perf note).

**Unverified — the numbers above are all desktop-browser measurements.** The tier switch, DPR, counts,
light and program counts were read from a resized desktop browser reporting `tier: "mobile"`, *not*
from a phone. Fill-rate wins are exactly the kind that are invisible in a profiler and obvious in the
hand, so the actual frame time on a real device is still unknown; so is whether 0.85 DPR reads as soft
on the containment net's thin wireframe, which is the one hard-edged thing in the scene. Both want a
pass on real hardware before this is called finished. Related: the DOM overlays are laid out
desktop-first in fixed `rem` and visibly collide on a narrow viewport — a separate responsive job,
untouched here.

---

## ADR-0030 — Reveal animations trigger off an **act `enabled` flag**, not the viewport (or scroll markers)

- **Status:** Accepted. **Amended same-day** — the first cut used scroll markers + `mode="progress"`;
  that could not animate an exit while scrolling forward, so the trigger is now an `enabled` boolean.
  The marker machinery (`RevealScope`, context, per-act marker blocks) was deleted.
- **Date:** 2026-07-26

**Context.** The scene overlays needed entry animations (headings per letter, copy per word, blocks as
staggered groups — all rising through a blur/opacity dissolve) with the **exit as the entry reversed**.
Every animation primitive available here triggers off an `IntersectionObserver`: `TextEngine`'s
`always`/`once`/`forward`, and `<Inview>`'s default. But **every overlay lives inside the `fixed inset-0`
scene container**, so it is *permanently* in the viewport — those triggers fire once at mount and never
again. The acts aren't sections scrolling past; they're states of a **page-scroll progress** value
driving a pinned canvas. `mode="manual"` would have solved it trivially and is **banned** (hard rule #3).

**Why scroll markers were rejected.** The first cut gave each act a marker block in the scroll spacer
and fed it to `TextEngine`'s `mode="progress"` + `trigger` / `<Inview>`'s `trigger`. It reveals fine and
reverses on scroll-*up*, but it **cannot animate an exit while scrolling forward** — progress only ever
increases, so nothing can walk the animation back — and `TextEngine` freezes its state outright once the
marker leaves the viewport (`useLoopInView` pauses the loop). The exit that was actually visible was
`ScrollFade`'s block opacity, which is precisely the "it's just a fade" complaint.

**Decision.** Trigger off a plain **per-act on-screen boolean** fed to both engines' **`enabled`** prop.
For every mode except `manual` (banned, hard rule #3) they call `playIn`/`playOut` from `enabled`, and
since the overlays are pinned and thus permanently "in view", `enabled` is the *only* gate — so in and
out both animate, in both scroll directions. `act-window.ts` derives the booleans from the shared
frame-memoised scroll progress and publishes them via `useSyncExternalStore`, so **one rAF** serves every
reveal on the page. No markers, no context, no provider: the reveal leaves are the only client parts and
the overlays stay Server Components.

**Both engines default `immediateOut` to `true`**, which makes the exit `immediate` and zeroes its
staggers — reveals must pass **`immediateOut={false}`** or there is no exit animation at all. That
default was the actual bug behind the reported "exits are just opacity".

**Consequences.** Reveal timing stays in the same **progress** units as the rest of the sequence
(`ScrollFade` windows, camera keyframes), tunable in one file; windows end slightly before the matching
`ScrollFade` disappear so the reveal's exit is what reads. The **hero now reverses too** — the marker
version couldn't. Trade-off: the boolean is a hard cut rather than a scrub, so an act's reveal always
plays at full speed regardless of how fast the user scrolls; that's the intended feel here (a reveal,
not a scrub) and it's what makes the exit possible at all. See [[frontend/components/common]] (Reveal
section), which also records the two `TextEngine` layout constraints this forced (`position: relative;
display: flex` on its tag; one engine per line for multi-line headings).

---

## ADR-0029 — No forced layout, `:root` style writes, or no-op effects in per-frame paths

- **Status:** Accepted
- **Date:** 2026-07-26

**Context.** A brief full-screen flicker was reported **periodically, at any scroll position**.
Instrumentation cleared the WebGL loop: a steady 60 fps over 12 s, no long frames, no
`webglcontextlost`, no drawing-buffer resize, no canvas luminance spike. That pointed at the **DOM/
compositor** side, where this page is unusually sensitive — it stacks three `mix-blend-mode` flare
layers, a `mix-blend-mode` grain layer, and `backdrop-filter` UI over a live canvas, so anything that
invalidates style or forces layout mid-frame can surface as a visible repaint flash. Two such things
were running:
1. `applySize()` (which reads `container.clientWidth/Height` → **forced synchronous layout**) was
   called **every 30 frames** from inside `renderFrame` — a forced mid-frame reflow ~2×/second, which
   matches the reported periodicity.
2. `HeroLights` wrote `--wave-clip-l/-r` on **`:root`** every frame (inherited custom properties, so
   this dirties **every element** in the document) and `WaveOverlay` read them back with
   `getComputedStyle` every frame (**forced full style recalc**) — a write→read→write thrash on the
   document root, per frame, for the whole scroll.

**Decision.** Three rules for anything on a per-frame path:
- **Never poll layout, and never measure it per frame.** Size changes come from a **`ResizeObserver`**
  (event-driven, fires only on real changes, covers window *and* container/layout changes). `applySize`
  is no longer called from `renderFrame`, and the `window.resize` listener is gone. Likewise, no rAF
  loop measures scroll geometry itself: `documentElement.scrollHeight` is a forced synchronous layout,
  and **six** loops were each reading it every frame *between* their own spring style writes — textbook
  layout thrashing. `utils/scroll-progress.ts` measures it once (`ResizeObserver`-invalidated) and
  memoises the result per frame via `document.timeline.currentTime`. Measured **6 → 0** reads/frame.
- **Properties that must agree must be written by the same writer, in the same flush.** Anything whose
  correctness depends on two values changing together (a flare's `mask-image` **and** its `opacity`;
  a consumer's clip **and** the line it clips to) must not be split across two loops — react-spring
  flushes its style writes in its own rAF pass, so a value written directly lands a frame before a
  value written through a spring. At a boundary where both flip, that one frame of disagreement is
  visible. Hence: flare masks are carried **in the spring** (`angle`/`edge` + a `to()` interpolation)
  alongside the opacity, and cross-component per-frame values are **pure functions of the shared
  progress** (`wipeLineAt`), not a store one side writes and another reads.
- **Don't change a property's _type_ mid-scroll.** Switching `mask-image` between a gradient and `none`
  forces a compositing-layer rebuild and glitches at the switch point, so the flares always carry a
  gradient (a "no cut" one when nothing is cut). The pinned container is `isolation: isolate` so the
  blend group's backdrop is scoped rather than the whole page.
- **Never touch `:root` style, and never `getComputedStyle`, per frame.** Cross-component per-frame
  values travel through a **shared mutable module** (`scene/wipe-line.ts`, the pattern `scene/tuning.ts`
  already established) — both sides run their own rAF, so no subscription is needed. Where a value
  genuinely must be CSS (the flare `mask-image` gradients), set it on the **component's own root
  element**, so invalidation is scoped to that subtree rather than the whole document.

**Consequences.** The periodic forced reflow, the per-frame document-wide invalidation, the six
forced layout reads per frame, and two always-on full-screen masked blend layers are all gone;
behaviour is unchanged (clip polygons byte-identical to the CSS-var version, wipe masks still resolve
to the same hard counter-cuts). Cost: two small modules and two `ResizeObserver`s. Trade-off of the
shared stores: values are *pulled* each frame rather than pushed, so a consumer not already running a
rAF would need one — fine here, all are.

**Evidence trail** (this took three passes; the first two didn't fix the reported flicker):
`applySize` polling and the `:root` writes were fixed first, then the flash **still reproduced on the
production build**, ruling out dev-mode HMR. A 75 s capture on prod with `?debug=1` (which enables
`preserveDrawingBuffer`, making the canvas reliably samplable) found **zero luminance excursions across
3472 frames**, plus zero layout shifts, long tasks, rAF gaps, or context losses over 90 s — proving the
WebGL output is stable and locating the problem in **DOM compositing**, which is what the layout-thrash
and mask findings came out of. Note this still does **not** claim every flicker source is eliminated —
it removes the measurable ones. See [[frontend/components/common]] (`wipe-line.ts` row, the shared
scroll-progress section, and the Scene perf note).

---

## ADR-0028 — Wipe renders both views live every frame (amends ADR-0025's bake-once)

- **Status:** Accepted (amends [[decisions-log#ADR-0025 — Tree finale a bolt-on act progress remap revealed by a screen-space wipe|ADR-0025]])
- **Date:** 2026-07-26

**Context.** ADR-0025 revealed the tree finale with a screen-space wipe compositing two HDR views
(`rtWave`, `rtTree`). For perf it **baked `rtTree` once** on wipe entry and reused it for the whole
transition (the tree cloud is static, and a fresh render was thought to be a ~74 ms hitch). But the
tree's ambient **`treeDust` drifts continuously** (position is a pure function of absolute `time`).
Baking once froze the dust at the bake instant; it then sat still through the entire wipe and **snapped
to its live position** the moment the post-wipe *direct* render took over — the reported "scene flickers,
pollen jumps" on the way into the tree. (There was also a 1-frame entry flip from the stale load-time
bake.)

**Decision.** During the wipe, **render both views live every frame** — `rtWave` from the held camera
(tree hidden) and `rtTree` from `treeCamera` (wave hidden) — instead of baking `rtTree` once. Removed the
`bakeStep` / `bakedW/H` cache. The tree *cloud* is still `updateCloud`'d only once at load and stays
static, so re-rendering it is a **warm redraw** of an already-resident, already-compiled mesh; the
composited tree is therefore **pixel-identical to the direct render**, and its dust animates continuously
across the `wipeRange[1]` boundary — no freeze, no snap. The finale (post-wipe) still renders the tree
directly, unchanged.

**Consequences.** The flicker/dust-jump is gone and the transition is seamless. Cost: two full scene
renders per wipe frame instead of one — measured at a **steady ~60 fps** (worst frame ~18 ms) on the dev
machine, confirming the old "~74 ms double-render" was the **cold compile** (now amortised by the
load-time `renderer.compile` + pre-bake, which are kept). The load-time pre-bake of `rtTree` is now only
a safety/first-frame fallback + the compile trigger. Keeps ADR-0025's remap, camera split, and HDR-before-bloom
compositing intact — only the caching changes. See [[frontend/components/common]] (Scene perf note).

---

## ADR-0027 — Wave-UI disappear: clip **each element**, not an ancestor (preserve card glass)

- **Status:** **Superseded** — the wave cards were later made **solid white**, so the `backdrop-filter`
  this ADR protected no longer exists, and per-element clipping actively broke once the reveal
  animations landed: it cached each element's `getBoundingClientRect()` (which then included the reveal
  spring's `translateY`, offsetting every local percentage into a wrong per-card mask) and it put
  `clip-path` on the same elements carrying `filter: blur()` (a card clipped to a sliver got blurred
  into a horizontal band that bled over the next scene). The wave overlay is now clipped by **one
  `clip-path` on its root**, which needs no geometry at all (the root is the viewport, so the wipe
  line's viewport-height % *is* its local %), and keeps the clip and the animation on separate
  elements. The **general rule below still stands** for any translucent element that must survive a
  clip. See [[frontend/components/common]] (`wave-overlay.tsx` row).
- **Date:** 2026-07-26

**Context.** The wave UI must disappear by being **clipped along the tree-wipe line** (so the tree
appears to cover it), not by an opacity fade. An earlier fix already swapped a CSS `mask` for a
`clip-path` because a `mask` makes the box a **backdrop-root** and kills the glass cards'
`backdrop-filter`. But `clip-path` does the **same thing** — any *fully-open* or `none` clip is fine,
yet the instant the clip becomes a real `polygon(…)` on the overlay **root**, that root is a
backdrop-root and every descendant card loses its blur. Publishing `none` until the line was on-screen
only hid the bug during the wave; the moment the wipe started clipping, the glass died — exactly what
the user saw.

**Decision.** Move the clip off the ancestor and onto **each clipped element individually** (heading,
tagline, every card). An element's **own** `clip-path` clips its rendered output but does **not**
isolate its **own** `backdrop-filter` (only an *ancestor's* clip/mask/filter/opacity does) — so each
card keeps sampling the scene behind it right up until it clips away. `WaveOverlay` becomes a **client
leaf**: a rAF reads `HeroLights`'s `--wave-clip-l/-r` (the wipe line's viewport-height % at each edge)
and reprojects that single screen-space line into each `[data-wave-clip]` element's local box, setting
its `clip-path` (or `none` while the line is off the bottom). Element geometry is cached (the overlay
is pinned in a `fixed` container, so rects are scroll-stable) and refreshed by a `ResizeObserver`.

**Consequences.** The glass survives the entire wipe — verified: `backdrop-filter: blur(6px)` stays
live while the per-element polygons are actively cutting the cards. Cost: `WaveOverlay` is now a client
component with a small rAF (2 CSS-var reads + a handful of string writes per frame — negligible).
`HeroLights` now publishes raw `--wave-clip-l/-r` numbers instead of assembling the `polygon(…)` /
`none` itself. General rule for this codebase: **to clip something that (or whose descendants) needs
`backdrop-filter`, clip the element itself — never a wrapper.** See [[frontend/components/common]]
(`wave-overlay.tsx` row).

---

## ADR-0026 — Cursor hover on heavy clouds: GPU vertex push, not per-frame `updateCloud`

- **Status:** Accepted, but its force law is **superseded by [[#ADR-0035 — GPU cloud effects measure from the instance centre (amends ADR-0026)|ADR-0035]]** — the
  "must be view-plane" reasoning below is wrong (the blobs came from measuring at the vertex, not from
  the world-space axis) and the view-plane push was itself rejected for gathering the tree into a ball.
  The GPU-not-CPU decision stands.
- **Date:** 2026-07-26

**Context.** The hero glyph and hand get cursor repulsion by `updateCloud` moving each instance's
matrix per frame (CPU). That's fine at ~33k, but the **tree is ~150k** and a full `updateCloud` over
it is a **~90 ms JS block** (see ADR-0025) — which is exactly why the tree is *baked once* and only
rendered thereafter. So the requested "hover like the hero" on the tree couldn't reuse the CPU path
without destroying the finale's framerate.

**Decision.** Do the tree's cursor repulsion on the **GPU**. `buildParticleCloud`'s shader patch adds
uniforms `uPointer` (world), `uPointerR`, `uPointerS` and rewrites `<project_vertex>` to push each
instance **in the view plane** (screen-space x/y only) out of a disc around the cursor
(`pf = uPointerS·(1 − d/uPointerR)²`, `d` measured in view space). The cloud **stays baked** — the
scene just sets the uniforms each frame (cursor projected via `treeCamera`) and re-renders (cheap).
`uPointerS = 0` (the default, and what the glyph/hand leave it at) makes the push a no-op, so the
shared patch is free for the CPU-driven clouds. The **wave** keeps the CPU path (it's already live at
~50k, so passing it the pointer is nearly free).

**The push must be view-plane, not world-radial.** The first cut pushed instances out of a *world-space
sphere* (`wPos += normalize(wPos − uPointer)·pf`). For a deep, camera-facing volume like the tree that
gives near-camera beads a large **+z** component; perspective then magnifies them into **giant blobs**
that jump around with sub-pixel cursor noise (the reported "hover не тот" + end-of-scroll twitching).
Pushing only in view-space x/y parts the beads *around* the cursor on screen — exactly the hero glyph's
feel — and is stable because it never changes a bead's depth.

**Consequences.** Hover works on the 150k tree at full framerate (a uniform + a render, no re-upload).
The trade-off: the GPU push is a simpler force law than `updateCloud`'s (bounded at `uPointerS`, no
easing/return-relax), so it reads slightly firmer than the hero's — acceptable, and tunable via
`pointer.strength/radius`. It only runs in the **direct** tree render (after the wipe); during the
wipe the tree is baked, so hover there would need re-baking `rtTree` (not worth it — the user isn't
interacting mid-transition). See [[frontend/components/common]] (`particle-cloud.ts` row).

---

## ADR-0025 — Tree finale: a bolt-on act (progress remap) revealed by a screen-space wipe

- **Status:** Accepted
- **Date:** 2026-07-26

**Context.** A new final section was requested — a particle tree revealed *over* the wave. The
first cut flew the camera down-range to a third podium and revealed the tree with an in-world
bottom-up scan. That was rejected against a reference: the intent is a **film-style screen-space
wipe** — a tilted edge sweeps across and the **tree scene** appears over the wave, with the
**camera staying put on the wave**. Separately, the X→hand→wave sequence had been tuned over many
iterations, so making room for a new act by re-fitting every boundary was high-risk.

**Decision.**
- **Progress remap, not re-tuning.** The whole X→hand→wave act runs on `seqP = clamp01(progress /
  sequence.treeStart)` and occupies real progress `[0, treeStart]` (0.72); every existing boundary
  reads `seqP`, so **all prior tuning is untouched**. At `treeStart` the wave is fully formed and
  `[treeStart, 1]` is the wipe. `scrollVh` grew 860 → 1180 so both acts keep their scroll.
- **Screen-space wipe of two views, not a camera move.** The tree is rendered as its **own framed
  scene** from a static `treeCamera`; the main camera holds on the wave. Each transition frame both
  views render to **HalfFloat** targets and `WipePass` (`wipe-pass.ts`) composites them by a tilted
  screen mask (`vUv.y + (vUv.x−0.5)·wipeTilt < uWipe`), swept bottom-up over `sequence.wipeRange`, as
  a clean anti-aliased cut (no seam). It sits **before bloom** so both sides bloom (HDR preserved).
  Each layer is sampled with its own vertical offset for a **parallax** (wave drifts down, tree
  descends into place — settling to rest so the direct render after the wipe doesn't jump). After
  the wipe the tree renders directly from `treeCamera`.
- **Bake the tree once; keep the wave live.** The **tree** is static (fully materialised), so it's
  rendered into `rtTree` once on entry (on its own frame → no double-render) and cached. The **wave**
  is *not* frozen: it's only 33k particles, so it's re-rendered into `rtWave` **every frame** with the
  hand updated to the fully-formed, rippling curtain (`wave = 1`, advancing `time`). An earlier cut
  baked the wave too — but a frozen curtain read as a bug ("the wave forms then stops"), and the wave
  was already rendered live all through the wave act, so re-rendering it under the wipe is ~free. The
  wave therefore **stays dynamic** right up until the wipe covers it.
- **Reuse the environment.** The tree is a hand-style loaded `bin_u16` cloud (`createTreeParticles`,
  no wave destinations, no in-world reveal); its podium/net/ring light are the same builders as the
  X. Upsampled ×2 (~100k) so the large bushy volume reads solid without an expensive one-time upload.
- **The tree is static, so touch it once.** It's a **freeze**: `updateCloud` (a ~90 ms JS block at
  100k) runs **once at load**, and the shader compile + GPU upload are moved off the scroll path by
  a load-time `renderer.compile` + a pre-bake to `rtTree`. The finale then only *renders* it. In the
  tree section `rtTree` is re-baked **once on entry, on its own frame** (so it never shares a frame
  with the live wave render → no ~74 ms double-render) and **cached for the session** (re-baked only
  on resize) so scrubbing across the boundary never re-pays it. The wave view (`rtWave`) is rendered
  live each frame (33k, cheap — see the wave bullet). Without these, the finale hitched ~90 ms.

**Consequences.** New act with zero regression to the earlier sequence. Two gotchas for future
edits: every sequence boundary in `particle-scene.tsx` is now expressed in `seqP` (**not** real
progress), and the transition renders the scene to two extra HDR targets — `rtTree` baked once, but
`rtWave` re-rendered live each frame so the curtain keeps rippling (a frozen wave read as a bug). The
whole wave→wipe→tree scroll holds ~60 fps. The earlier in-world reveal + `tree.scanTilt`/
`scanGlow` and the camera's fly-to-tree segment were removed. See the final-section callout in
[[frontend/components/common]] and the [[changelog]].

---

## ADR-0024 — Selective bloom on oversized "hero" beads (re-enables the BloomPass)

- **Status:** Accepted
- **Date:** 2026-07-24

**Context.** Earlier this session bloom was removed entirely because it read as a scene-wide
haze (any tuning still bloomed the whole bright cloud). The new brief wants **some** beads to
be bigger and carry a **saturated white bloom** — i.e. bloom must return, but *only* on those
beads, never the whole cloud.

**Decision.** Make the glowing beads unambiguously brighter than everything else, then key a
re-added bloom pass off that brightness:
- A random `bigFraction` (~4%) of beads are built at `bigScale`× (2×) and flagged
  `bloomMask = 1`; `updateCloud` gives them an always-on white emissive `idle.bigGlow` (**5**)
  via the existing `aGlow` → `totalEmissiveRadiance` patch. So the glow subset is chosen
  per-bead at build time, not by size-ranking the jitter (the old `bloomMask` heuristic).
- The custom **`BloomPass` (ADR-0019) is re-added** to the composer. Its bright-pass threshold
  (**3.5**) sits *above* the lit-white cloud (~2.6 in the composer's HDR **HalfFloat** buffer,
  three r0.180 default) but *below* the hero beads (lit + `bigGlow` ≈ 7) and the scatter/cursor
  emissive — so only those bloom. This is what makes selective bloom possible where the blanket
  bloom failed: an HDR buffer preserves values >1, so a >1 threshold can separate "lit" from
  "emissive".

**Consequences.** Reverses the "bloom removed" change (chain: ADR-0015 UnrealBloom renders
black → ADR-0019 custom BloomPass works → removed as haze → **now back, selective**). Depends
on the composer buffer being HDR; if a future three drops that default, force `HalfFloatType`
on the composer or the threshold logic collapses (everything clamps to 1). Also bumped glyph
`count` 20000 → 32000. Levers: `bigFraction`/`bigScale` (how many, how big), `idle.bigGlow`
(brightness), `bloom.threshold`/`strength`/`radius`.

---

## ADR-0023 — Volume from real self-shadowing, not baked albedo (amends ADR-0022)

- **Status:** Accepted
- **Date:** 2026-07-24

**Context.** ADR-0022 still produced the form's volume by **baking a directional shade into
`instanceColor`** — i.e. *painting* one side of the cloud darker. However well-tuned, that
reads as recolouring, not lighting: the dark side isn't dark because light misses it, it's
dark because we tinted it. The brief is explicit — the volume must come from **lighting**.

**Decision.** Let the particle cloud **cast and receive real shadows** (`mesh.castShadow =
mesh.receiveShadow = true`), so the front/top particles shadow the ones behind, below, and in
the crossing's dense interior. Those go dark because the key light physically doesn't reach
them. The baked directional shade is dialled back to a **faint base** (`shade {floor 0.82,
dir 0.18}`) — nearly flat albedo — so real light + the shadow map carry the form, not paint.
- The key `DirectionalLight` is strengthened (`1.3 → 2.6`) so its shadow reads as deep real
  shadow, and its shadow map is sharpened for the tiny spheres: **4096²**, a **tight frustum**
  around the glyph (±14 / top 20 / bottom −14 → small shadow texels), `bias −0.0003` +
  `normalBias 0.08` to kill acne on the curved sphere receivers.
- This reverses the original "no shadow — 20k spheres speckle and double the draw cost"
  choice. Measured cost is negligible here (~4 ms/frame total with the shadow pass), and soft
  PCF + the biases keep it clean.
- The volume must live **on the X only**, not as a floor shadow: the podium meshes are set
  `receiveShadow = false` (in `podium.ts`), so the glyph's `castShadow` drives its own
  self-shadowing but drops **no** shadow onto the podium. Self-shadowing is entirely within
  the particle mesh (its own `cast` + `receive`), independent of what the podium receives.

**Consequences.** Amends ADR-0022 (keeps its lit `MeshStandardMaterial` + smooth rounded-box
normals + emissive glow; **replaces the baked shade as the volume source** with self-shadow).
The hand sits outside the glyph-centred shadow frustum, so it isn't self-shadowed — fine, it's
transient and morphs to the (white) wave. Levers: key intensity + `shadow.mapSize`/frustum
(shadow depth & sharpness), `shade.floor`/`dir` (residual base only), `shadow.normalBias`
(acne vs. peter-panning).

---

## ADR-0022 — Realistic soft shadows: lit spheres × smooth baked form shade (supersedes ADR-0021)

- **Status:** Accepted, amended by [[decisions-log#ADR-0023 — Volume from real self-shadowing not baked albedo amends ADR-0022|ADR-0023]] (baked shade demoted to a faint base; volume now from self-shadowing)
- **Date:** 2026-07-24

**Context.** ADR-0021 (unlit `MeshBasicMaterial` + baked shade on discrete **box-face**
normals, hard `max(0, n·L)`) read as an **anime/cel shader** — flat, binary, hard-edged
bands of light and shadow. The reference is the opposite: a *matte-gray sculpture* with
**soft, graded** shadows and gentle ambient occlusion — no hard terminator.

**Decision.** Combine **two** shading sources so the form reads soft and realistic:
1. **Lit spheres again** — the material is `MeshStandardMaterial` (chalk-matte: roughness
   0.98, metalness 0). The scene's directional key gives *every* sphere its own soft diffuse
   gradient — the fine, realistic per-ball shading ADR-0021 had thrown away.
2. **A smooth baked form shade** in `instanceColor` for the form-level light/shadow (so it's
   not a chaotic field of identical beads — the failure mode of ADR-0020). Two fixes make it
   *soft* instead of cel:
   - The glyph's form normal is now a **smooth rounded-box normal** — the three box faces are
     blended by proximity (`frac^SHARP`, `SHARP = 3`) and normalised, so the normal rotates
     continuously across edges instead of snapping to one face.
   - The bake uses a **gamma'd half-Lambert wrap** `floor + dir·(0.5 + 0.5·n·L)^1.7` — the
     `^1.7` deepens the mid-tones and shadow side (so the form has real volume) while the
     terminator stays soft, with no hard band.
3. The `aGlow` scatter/cursor glow moved back to **pure emissive** (`totalEmissiveRadiance +=
   vGlow` after `<emissivemap_fragment>`), so it stays bright regardless of lighting.

Tuned so the X reads *gray* with felt volume: `shade {floor: 0.2, dir: 0.76}`, key light
`2.1 → 1.3` (a strong per-ball key washes the form shade out — the baked form shade must
dominate the read, the real lights only add the fine per-sphere gradient).

**Consequences.** Supersedes ADR-0021 (reverts the unlit material; keeps the *form-normal*
idea but smooth, not faceted). Particles again receive the scene's real lights + env map.
Levers: `glyph.lightDirection`, `shade.floor`/`dir` (form contrast), `SHARP` in
`glyph-particles.ts` (edge roundness), the key light intensity (per-ball gradient strength).

---

## ADR-0021 — Volume by lighting the *form* (unlit particles + baked normal shade)

- **Status:** Superseded by [[decisions-log#ADR-0022 — Realistic soft shadows lit spheres × smooth baked form shade supersedes ADR-0021|ADR-0022]] — the unlit/faceted bake read as a cel shader; now lit spheres × a *smooth* baked shade.
- **Date:** 2026-07-23

**Context.** ADR-0020 switched to lighting the *spheres* for volume. Because every particle
is the same sphere, they all got the **same** highlight regardless of where they sit — the
cloud read as a chaotic field of identical bright/dark balls, not a solid lit object. The
brief (and the reference): the X should have a lit **front face** and shadowed sides — form
lighting, not per-ball lighting.

**Decision.** Bake a directional shade against each particle's **form surface normal**, and
render the particles **unlit** so that shade is exactly what shows.
- Each particle carries a form normal — the glyph computes true **box-face normals** (which
  face of which bar), the hand falls back to `normalize(point)`.
- `buildParticleCloud` bakes `shade.floor + shade.dir · max(0, n·lightDir)` into
  `instanceColor`; the material is `MeshBasicMaterial` (unlit). Front-facing particles are
  bright, side/back ones dark → the whole form reads as one lit solid.
- The `aGlow` glow patch moved to add on top of the baked shade (`diffuseColor.rgb += vGlow`
  after `color_fragment`), since there's no emissive channel on a basic material.

**Consequences.** Amends ADR-0020 — this is *not* a return to ADR-0016's crude
position-offset gradient; it's real directional lighting of proper form normals, which is
what reads as "lit sculpture". Trade-offs: (a) the shade is baked, so it doesn't respond to
the moving key light — fine, it's a world-fixed direction; (b) a see-through cloud still
interleaves some lit-front and dark-back particles (speckle), tamed by a higher `shade.floor`;
(c) particles no longer receive the scene's real lights or env map (they're unlit) — the
podium/metal still do. Levers: `glyph.lightDirection` (front-ish), `shade.floor`/`dir`.

---

## ADR-0020 — Particle volume from lighting, not baked shading (amends ADR-0016)

- **Status:** Accepted
- **Date:** 2026-07-23

**Context.** ADR-0016 baked a shading gradient into each instance colour because
"identical spheres can't be told front-from-back by scene lighting", giving the cloud
cheap volume. But it's a *painted* look, and it made every particle bright — so the new
selective bloom (ADR-0019: only big/cursor particles) had nothing to key off (every lit
white particle crossed the threshold). Brief: volume from **lighting**, not painting.

**Decision.** Drop the baked shade (`CloudOptions.shade`/`lightDirection` removed) and
light **smooth spheres** (`SphereGeometry(0.5, 16, 12)`) for real per-ball form (lit side +
shadow side); fog fades far particles for cloud depth. Albedo is a **flat** value kept
*below* white (`~0.6`) so lit particles stay under the bloom threshold; the fill lights are
lowered so the directional key carries the shading. The cloud-level front/back gradient
ADR-0016 worried about is largely replaced by per-ball lighting + fog + the sparse glowing
big particles, which is enough.

**Consequences.** Amends ADR-0016 (its "bake the shading" half; the "write instance
buffers" half stands). The win: (a) particles read as real 3D balls, (b) selective bloom
works because most particles are sub-threshold, (c) one fewer per-particle build cost.
Trade-off: no painted AO, so form depends on the lights being tuned (low fill, a single
strong key) — over-bright fill flattens it back out. Smooth spheres cost more tris (`16×12`
vs `6×4`) but hold ~60 fps easily. Levers: `CloudOptions.albedo`, the key/hemisphere
intensities, `sceneConfig.bloom.threshold`.

---

## ADR-0019 — Particle bloom via a custom pass (amends ADR-0015)

- **Status:** Accepted
- **Date:** 2026-07-23

**Context.** ADR-0015 established that `UnrealBloomPass` renders fully black in this
WebGL environment and concluded glows must be geometric — "no scene-wide bloom". A later
brief needed the white particles to **bloom much more** (volume) plus a slight blur.
Geometric glows can't do that for tens of thousands of instanced spheres.

**Decision.** Add `bloom-pass.ts` (`BloomPass`) — a **custom additive bloom**: bright-pass
threshold → **one half-res render target**, two separable-Gaussian blur iterations →
additively combine over the sharp frame. Wired into the composer as
`RenderPass → BloomPass → Vignette → OutputPass`. It works where `UnrealBloomPass` doesn't
because it avoids that pass's failure mode — no multi-level mip chain, no HalfFloat targets,
just plain `WebGLRenderTarget`s (which the existing composer already proves render fine).
Threshold is tuned to catch the near-white particles; the podium/backdrop stay below it.

**Consequences.** This **amends ADR-0015** — bloom is viable here after all, via a bespoke
pass; UnrealBloomPass specifically is still banned (and still the thing to reach for a
black frame over). The geometric ring-fixture halo stays (the bloom is for the particles,
not the emitter). Bloom is a real post cost (half-res, ~5 draws/frame) but cheap; ~60 fps
holds. Levers live in `sceneConfig.bloom` (`threshold` / `strength` / `radius`). If a scene
ever needs the emitter to bloom too, lower the threshold — but watch the light backdrop,
which sits just under it.

---

## ADR-0018 — Cursor parallax uses `useSpring` directly (no `springs/` component)

- **Status:** Accepted
- **Date:** 2026-07-23

**Context.** The hero gained two light-flare overlays (`HeroLights`) that must
parallax the cursor in opposite phase. Hard rule #1 says motion is `@react-spring/web`
via the `src/components/animation/springs/` components — but those components only
cover **scroll / hover / in-view** triggers. None is a pointer-position parallax.

**Decision.** Use **`useSpring` directly** in the client leaf, driven by a window
`pointermove` listener that sets the spring targets. This is still `@react-spring/web`
spring physics (no CSS transitions/keyframes, no framer-motion), so it honours the
*intent* of rule #1; it just doesn't route through a `springs/` wrapper because none
fits. The `springs/` engine stays `#do-not-modify` and un-extended.

**Consequences.** A sanctioned pattern for future novel triggers (cursor, scroll
velocity, device tilt …): reach for `useSpring`/`useTransition` directly rather than
forcing a scroll/hover component. Keep it in a `"use client"` leaf, `pointer-events-none`
where it overlays interactive canvas, and gate on `matchMedia("(pointer: fine)")` so
touch doesn't trigger it. react-spring batches all springs onto one internal rAF, so
this adds no extra render loop.

---

## ADR-0017 — Scroll-driven scene: pinned canvas, camera path, shared cloud

- **Status:** Accepted
- **Date:** 2026-07-20

**Context.** The scene grew from a static, auto-orbiting hero into a scripted
scroll sequence — camera flight + roll, glyph scatter, net collapse, and a
reveal of a second particle figure (a hand). This needed a scroll source, a
camera fully decoupled from user orbit, a second particle shape sharing the
glyph's exact look, and a scatter that reads as strands.

**Decision.**
- **Scroll plumbing.** The canvas is `position: fixed` (pinned) inside `HomeView`
  over a `sequence.scrollVh`-tall spacer that supplies the scroll length. Progress
  is `scrollY / (scrollHeight − innerHeight)`; Lenis already smooths native
  `scrollY`, so no Lenis subscription is taken. The starter's `body` rule (forced
  `height: 100vh` + flex-centering — unscrollable) was replaced with a plain
  scrolling block. This is a **global CSS change** justified by the home view now
  being a scroll experience.
- **Camera.** `OrbitControls` is removed; the camera is a pure function of scroll
  progress — a **two-segment** path (fly to the hand with a full-turn **roll** via
  a Rodrigues rotation of the up vector; then a final push-in + tilt-up along the
  helix). No drag, no zoom.
- **Final phase: the hand's own particles transform into the wave — a `scatterTarget`
  transform, not a separate system.** The hand's ~4173 particles crumble, rise through a
  vertical vortex/whirlwind (below), and settle into the grid wave. Two earlier attempts were rejected: (a) a
  separate ~40k wave field seeded from the hand and scaled up — it read as *new*,
  differently-shaded particles materialising and looked like grey mush; (b) that whole
  `wave-field.ts` module — **deleted**. The winning approach reuses the cloud machinery:
  `buildWaveDestinations` gives each hand particle a grid cell as its `scatterDest`, and a
  **wave branch in `updateCloud`** lerps rest → cell while routing through the vertical vortex
  and adding the depth ripple. Same particle count, same baked colours ⇒ it reads as the hand
  genuinely coming apart. This is the one thing every prior final-form attempt (tube braids,
  DNA helix, Möbius ribbon, perforated sheet, seeded wave field) got wrong — it must be the
  hand's *actual* particles, not a look-alike.
- **The morph passes through an intermediate attractor (`sin(π·wave)`, strongest mid-transition).**
  _(Superseded seven times — the through-shape kept getting rejected. (1) A **tornado funnel** (many
  strands, density taper, curl turbulence) read as unwanted **rings**. (2) A brief "pink arcs to the
  wave" version lacked the thin-line feel. (3) Vertical **tendrils that fanned out and arced as they
  rose** — the craning-up camera looks *up* the column and foreshortened them into **straight
  vertical sticks**. (4) A **radial burst of thin curves flying off the fingertips** — clean but not
  dramatic enough. (5) A **singularity collapse → supernova** — the blast drifted sideways/off-centre
  and was rejected. (6) A **symmetric swirling vortex tube** — right idea (vertical, centred) but
  the user supplied a reference of a **sinuous bright stream** and wanted that shape. (7) A **single**
  meandering stream — liked (it read like the X→hand flight curves), so it became **several**. Now
  it's **several meandering vertical curves**: each particle belongs to one of `vortex.strands`
  curves whose base is spread across X (`spread`, symmetric about the axis) and whose **spine snakes**
  side-to-side up the height (`spineX = base + sin(hY·meanderFreq·2π + phase)·meander`, own phase per
  curve); it wraps the spine at a **core-biased radius** (`radius·rj^coreBias`) so most pack into a
  tight bright spine with a thinning dust halo, swirling slowly (`hY·twist + time·spin`), glow
  weighted to the centreline (`bloom ∝ 1−rj`). **Seamlessness** was the other ask: the pull is
  `vpk = min(1, sin(π·we)·plateau)·strength` where `we` is a **per-particle staggered** eased
  progress (`ph = hash·stagger`, `we = smootherstep((wave − ph)/(1 − stagger))`, quintic for a gentle
  onset/settle) — particles peel off the hand and rejoin the wave at different times, so the three
  states blend instead of snapping; the plateau is kept modest (~1.3) so particles pass *through* the
  curves rather than freeze on them. The whole thing is deliberately spread over a wide
  `transformRange` (`[0.66, 0.99]`) + wide `stagger` so it plays out gradually.
  **Key lesson (recurring):** the snakes are symmetric about the axis and only Y grows with height, so
  the group never drifts left/right wholesale — the local S-curves are the *shape*, not a net slide
  (sideways drift killed the burst and supernova cuts). Still **pure trig + cheap hashes** (a
  per-particle `sin`/`pow` now that the envelope is per-particle), which — with skipping the dead
  glyph's `updateCloud` and the hand's shadow pass during the morph — keeps the second morph at
  ~7.7 ms/frame (it had been a ~42 ms freeze at 33k particles). The `wave.nova` config was replaced by
  `wave.vortex` (`strength`/`plateau`/`strands`/`spread`/`radius`/`height`/`meander`/`meanderFreq`/
  `coreBias`/`twist`/`spin`/`stagger`/`flash`). See the [[changelog]] and the final-phase callout in
  [[frontend/components/common]].)_ The particles
  are still the hand's own (`scatterTarget` transform); only the intermediate shape/colour and
  the per-frame cost changed.
- **Particle budget forces a small-dot grid wave.** Only 4173 particles exist (the hand's
  count, fixed by the asset). The wave is therefore a **clean grid of small dots** (one
  particle per cell, no jitter) rather than a dense frame-filling wall — the latter needs
  particle duplication, which is exactly what made the scrapped 40k version look fake. If
  the wave ever needs to be denser or larger, the honest lever is a denser hand asset.
- **Compose with the object, not the camera.** The bottom-left diagonal framing is created
  by orienting the **wave plane** (its own `tilt` + `yaw`), not by moving the camera off a
  clean path. An earlier version yawed the *camera* right to place the wave in the corner,
  but that made the final move feel like it "flew up and right" — rejected. Keeping the
  camera to a **pure upward pitch** (x fixed at 0) and instead tilting/yawing the plane
  gives the same composition with a cleaner motion. General lesson for this scroll shot:
  when a framing needs an off-axis look, prefer re-orienting the subject over bending the
  camera path, which the whole sequence reads as one continuous move.
- **A borderless wave = edge fade + tilt-into-fog, not more particles.** To make the wave
  read with "no visible edges" on the light backdrop without a huge particle count: fade
  each particle's scale toward the grid borders (`wave.edgeFade`, so it dissolves rather
  than ending in a line) and **tilt the grid back** (`wave.tilt`) so its far edge recedes
  into the fog. Placement (lower-left) and camera yaw put it in a corner so the two near
  edges bleed off-frame. This is cheaper and more robust than trying to fill past the frame
  with dots. "Full white" is just the albedo lerped to 1 through the transform — the sphere
  lighting still gives the surface its crests/troughs, so no baked shading is needed.
- **The wave field is a vertical curtain and the camera cranes up into it.** Rather than a
  horizontal ground plane viewed at a grazing angle, the field is a **vertical curtain**
  (grid across X, up Y; rippling in Z) and the final camera segment does a real ~45°
  **upward crane** to look into it — the ask was that the camera visibly *turn up* after
  the hand, not just fly forward. Rotating the field 90° to vertical is what makes it face
  the up-craned camera.
- **The wave beads are white — but need an emissive lift, because the curtain is lit obliquely.**
  The beads' albedo lerps to pure white through the transform, and the sphere lighting was meant to
  carry the crests/troughs (`troughShade` 0). In practice the curtain sits far (z ≈ −120), high and
  tilted, and the **static key light is aimed at the glyph** (never re-aimed for the wave), so it
  rakes the curtain at a grazing angle and the white beads read **dark grey** — much darker than the
  well-lit hand/X beads. Fix: a white **emissive lift** (`wave.lift`, HDR, added via the `aGlow`
  emissive path, ramped in over the back half of each particle's journey so the vortex streams keep
  their pink) floors the settled beads back into the bright-white range, kept **below** the bloom
  threshold (3.5) so they brighten without glowing. Density (the compact grid) still helps them read.
  (Earlier notes here leant on `troughShade` darkening + dark-floor shade for contrast; that was
  before the albedo→white lerp, and the real problem turned out to be the oblique key light, so the
  lift is the honest lever — not more darkening.)
- **Camera tilts ~90° up into the overhead sheet — two three.js gotchas.** The sheet is
  positioned overhead and the camera's final segment pitches up to look almost straight
  up. Exactly vertical is avoided: (1) `camera.lookAt` with world-up nearly parallel to
  the view axis is a **gimbal singularity** that degenerates the view matrix to a blank
  frame — `updateCamera` detects `|up·forward| > 0.99` and rebuilds a perpendicular up.
  (2) An `InstancedMesh` is **frustum-culled by its origin-centred geometry sphere**, not
  by its displaced instances; once the moved-overhead cloud's origin left the frustum the
  whole cloud vanished, so `buildParticleCloud` sets `frustumCulled = false`. Both are
  general to "move instances far via matrices + point the camera away from the origin."
- **Idle life is a render-loop effect, not springs.** Every figure shimmers at rest
  and carries sparse always-on white "bloom" particles (`sceneConfig.idle`, applied in
  `updateCloud` to every cloud). This lives in the three.js render loop, **not** the
  `@react-spring` engine — the spring rule governs the DOM/text layer; the WebGL
  particle system is a self-contained per-frame simulation (see ADR-0014) and already
  owns all its motion (camera, scatter, morph). Bloom is faux (emissive + size, no
  `UnrealBloomPass` — it renders black here, see the post-processing note).
- **Shared cloud.** `particle-cloud.ts` owns the InstancedMesh build (shading,
  the emissive patch, curl-flow) and `updateCloud` (cursor + scatter). The glyph
  and the hand are just **samplers** that hand it points, so both share one style
  and one code path.
- **Hand from a loaded point cloud.** Started procedural (an SDF), then replaced
  with a **baked `bin_u16` point cloud** (`public/assets/hand/`) exported from a
  real model — decoded (offset/scale from the manifest, Y-up) and fed to the same
  `buildParticleCloud`. `createHandParticles` is async; the scene adds the mesh on
  resolve. This is exactly the "swap the sampler without touching the cloud"
  path the SDF version anticipated — the shared cloud made the swap a one-file
  change.
- **Twisting ribbons → flight corridor streamers.** _(The corkscrew-ribbon scheme below was
  later removed; see the [[changelog]] and the flight section of [[frontend/components/common]].
  The glyph now reassembles **directly** from its X rest positions into world-space corridor
  streamers the camera flies through — no `scatterTarget`, no `buildStrandDestinations`. The
  scale-fade-to-zero guard and the curl fallback remain.)_ Originally: scattering a dense
  volume by a flow field always reads as a cloud, so the glyph instead morphed onto explicit
  thin curves — ~16 precomputed corkscrew ribbons (`cloud.scatterTarget`) — with shape/fade
  decoupled so they formed and held before dissolving. Curl flow ([[curl-noise]]) plus a
  travel-proportional Y-twist remains the fallback for clouds with no `scatterTarget` (the
  hand). Each particle **fades its scale to zero on the tail of its burst** (a diagonal-matrix
  write), so the scatter never leaves a dense pile in the camera's corridor.

**Consequences.** The whole run is scrubbable and reversible, and holds ~60 fps
(one per-frame pass over the glyph cloud; the hand is static). The scene is now
coupled to page scroll and to the pinned-canvas layout, so embedding it elsewhere
means reproducing that layout. Bloom is still faked (ADR-0015) — the scatter's
purple glow is per-instance emissive, not a post pass. The clean fly-through
depends on three guards staying in agreement: `scatter.towardCamera` (burst dodges
the lens), the scale fade (nothing lingers), and `scatter.distance` < the camera
standoff. See [[components/common]].

---

## ADR-0016 — Interactive particles: write instance buffers, bake the shading

- **Status:** Accepted
- **Date:** 2026-07-20

**Context.** The glyph is an `InstancedMesh` of ~20k spheres that has to do two
things a plain instanced mesh does not: react to the cursor every frame, and read
as a lit, three-dimensional object. Both have an obvious implementation that does
not work.

For interaction, the idiomatic route is a scratch `Object3D` — set position, call
`updateMatrix()`, `setMatrixAt()`. That recomposes a full `Matrix4` per particle
per frame and will not hold 60 fps at this count.

For shading, the assumption is that scene lights will do it. They cannot: every
instance shares one geometry, so a sphere at the front of the cloud and one buried
at the back carry identical normals and receive identical light. The cloud renders
almost uniformly bright no matter how the key light is aimed.

**Decision.**
- **Interaction writes straight into the instance buffers.** The particles are
  spheres, so their matrices hold only a uniform scale and a translation, and
  nothing but the three translation slots (`12`, `13`, `14`) ever changes. The
  update writes three floats per particle, plus three more into `instanceColor`
  for the tint. Everything eases toward its rest value each frame, so the cloud
  reflows on its own when the cursor leaves. This is also why the spheres carry
  **no** random rotation — it would force real matrix composition back in.
- **Shading is baked into `instanceColor`** at build time: a vertical gradient
  plus a directional term (the particle's offset from the glyph centre dotted
  with `glyph.lightDirection`). Scene lights still light the scene; the baked
  terms supply the form the shared normals cannot.
- **Glow is per-instance *emissive*, via a shader patch.** `instanceColor` is
  albedo and is multiplied by incoming light, so a bright colour on a particle in
  shadow still renders dull — no amount of tinting makes it read as a light.
  three exposes no per-instance emissive, so the geometry carries an `aGlow`
  `InstancedBufferAttribute` and `onBeforeCompile` adds it to
  `totalEmissiveRadiance`. This is the one place the scene patches a built-in
  material; the alternative — a second additive `InstancedMesh` shadowing the
  first — doubles the instance count for the same result.
- The cursor is projected onto a plane through the glyph that is re-aimed at the
  camera each frame, so repulsion tracks the pointer at any orbit angle.

**Consequences.** The scene holds ~60 fps with a full per-frame pass over every
particle. The constraint this creates is that particle *orientation* is no longer
free — anything needing per-instance rotation has to pay for matrix composition,
and the geometry would have to stop being a sphere for that to be worth it.
Because the shading is baked, changing the key light's direction means updating
`glyph.lightDirection` too, or the cloud's lit side will disagree with the scene.
The shader patch ties the glyph to three's `MeshStandardMaterial` chunk names
(`<common>`, `<begin_vertex>`, `<emissivemap_fragment>`), so a major three
upgrade should be smoke-tested against this material. See [[components/common]].

---

## ADR-0015 — Scene post-processing: no `UnrealBloomPass`

- **Status:** Accepted
- **Date:** 2026-07-20

**Context.** The particle scene needs the reference's bloom-heavy atmosphere: a
blown-out overhead ring fixture and a soft vignette. The obvious tool is an
`EffectComposer` chain with `UnrealBloomPass`. It renders the canvas **fully
black**, and because a black pass propagates through the rest of the chain, the
symptom is a blank canvas with **no console error, no WebGL warning, and a
correctly sized drawing buffer** — trivially misread as a broken scene graph.
Seeding the pass with `new Vector2(1, 1)` is one cause (its 5-level mip chain
halves down to zero-sized render targets), but supplying the real viewport size
does not fix it either, so the pass is simply not usable in this WebGL
environment. It was isolated by swapping `composer.render()` for
`renderer.render()`, which rendered the scene correctly.

**Decision.**
- The composer chain is `RenderPass → ShaderPass(VignetteShader) → OutputPass`.
  The vignette is worth keeping — it seals the frame edges and is what makes the
  studio read as enclosed.
- Glows are built **geometrically**, with `toneMapped = false` throughout. The
  ring fixture is an emissive torus wearing a **coplanar annulus** textured with
  a radial gradient that peaks at the tube. A couple of extra draw calls, no
  post-processing risk. (An earlier version also added billboarded additive light
  shafts; those were later removed for art direction — see [[changelog]].)
- Two shapes that do **not** work for glow, both tried: nested additive tori
  (each keeps a hard silhouette, so edge-on they stack into horizontal bands) and
  camera-facing sprites (they glow at the ring's centre, where nothing is).
- `sceneConfig.bloom` was replaced by `sceneConfig.glow` (`scale`, `opacity`).

**Consequences.** The atmosphere is achieved without a fragile pass, and the
scene degrades gracefully on weak GPUs. The trade-off is that only the emitters
glow — there is no scene-wide bloom on other highlights; brightness has to be
carried by lighting and tone mapping instead. The cost is that each glow has to
be authored as geometry that survives every camera angle, which is where both
rejected shapes above came from. If a future environment supports it, bloom could
return behind a capability check, but the geometric glows should stay as the
fallback. Documented in [[components/common]] so the pass isn't re-added on sight
of "no glow".

---

## ADR-0014 — 3D via vanilla three.js, not React Three Fiber

- **Status:** Accepted
- **Date:** 2026-07-08

**Context.** The home view needed a real 3D scene (a white terrain with
background mountains and a central plane). The React-idiomatic path is React
Three Fiber (`@react-three/fiber` + `@react-three/drei`), which was installed
first. It broke `yarn build`: R3F's type package unconditionally augments the
**global** JSX `IntrinsicElements` (in `react`, `react/jsx-runtime`, and
`react/jsx-dev-runtime`) with every three.js element. That augmentation is
project-wide once R3F's types are in the program. The animation engine's
`AnimatedVarTextTag` renders a `string`-typed dynamic tag —
`const Tag = animated[tag] as ElementType; <Tag>{children}</Tag>` — and with the
three elements merged in, TypeScript intersects `children` across the whole
intrinsic-element union down to `never`: *"'children' prop expects type 'never'"*.
The offending file lives in `src/components/animation/springs/` — `#do-not-modify`
(ADR-0002) — so it can't be patched to work around the pollution.

**Decision.** Render the scene with **vanilla three.js**, driven imperatively:
- `three` (+ `@types/three`) only; `@react-three/fiber` and `@react-three/drei`
  removed. `@types/three` does **not** touch the JSX namespace, so the engine
  build stays clean.
- The scene component (currently `<ParticleScene>`) is a `"use client"` leaf that
  sets up the renderer, scene, lights, `OrbitControls`, and the render loop in
  one `useEffect`, and disposes everything on unmount. `OrbitControls` and the
  post-processing passes are imported from `three/examples/jsm` (bundled with
  `three` — no extra dependency).
- Geometry lives in pure builders (`createGlyphParticles`, `createPodium`, …);
  scene parameters live in `scene.config.ts` (the token source for the 3D layer,
  since three materials can't read Tailwind tokens).
- Canvas sizing is applied at setup, on `window` `resize`, **and** re-checked
  every 30th frame in the render loop. The container measures 0×0 in the mount
  effect (a one-shot read leaves the canvas at its 300×150 default), and
  `ResizeObserver` can't be trusted to correct it — in the in-app preview browser
  it never fires at all. The per-frame check exits early unless the size changed.
- The idle auto-orbit is the three.js render loop, **not** DOM motion, so it is
  orthogonal to the spring rule (ADR-0002); it is disabled under
  `prefers-reduced-motion`.

**Consequences.** 3D is now a supported, isolated capability with no impact on the
protected animation engine. The trade-off is more imperative setup/teardown than
R3F's declarative components — acceptable for a single self-contained scene. If a
future need is heavily component-driven, revisit R3F **only** if its global JSX
augmentation can be scoped away from the engine (e.g. an isolated tsconfig
project) — otherwise this constraint stands. See [[tech-stack]] and
[[components/common]].

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
