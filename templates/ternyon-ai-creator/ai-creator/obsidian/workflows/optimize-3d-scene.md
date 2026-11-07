---
tags: [workflow, skill, performance, 3d, stable]
updated: 2026-09-02
---

# Workflow — Optimise a 3D Scene (skill)

Registers the **`optimize-3d-scene`** Claude Code skill
(`.claude/skills/optimize-3d-scene/`) as part of this project's workflow set, and
maps its canonical patterns onto the primitives this starter already ships.

> [!important] Routing rule
> **When a performance request lands on a project that carries a three.js /
> WebGL scene, invoke the `optimize-3d-scene` skill before doing anything else.**
> It is the source of truth for that work — do not improvise a different order
> of fixes. This is codified as AGENTS.md hard rule #11.

## When it triggers

Invoke the skill when **both** are true:

1. The request is about performance, jank, or shipping readiness — *"optimise the
   3D"*, *"the scene lags on mobile"*, *"micro freezes / jank on scroll"*,
   *"make the scene mobile-friendly"*, *"reduce the WebGL cost"*, *"why is
   Lighthouse red"*, or a pre-ship pass on a project that carries a scene.
2. The project actually renders WebGL — `three` (or `@react-three/fiber`) is in
   `package.json`, **or** there is a `<canvas>` driven by a hand-written
   `getContext("webgl")` render loop. Raw WebGL is fully in scope; only §0's
   measurement primitives change.

If the project has **no** scene, this note does not apply — performance work then
belongs to [[animation-system]] (spring/ticker cost) and [[seo-metadata]] (bot
path, metadata, bundle).

> [!note] The starter itself ships no 3D
> `next16-claude-starter` has **no `three` dependency** — see [[tech-stack]]. This
> workflow exists for projects *built from* the starter that add one. Adding
> `three` is a dependency change: update [[tech-stack]] and [[changelog]] in the
> same turn.

## What the skill does

Fourteen steps, applied **in order** — cheapest and highest-impact first. Full
text in `.claude/skills/optimize-3d-scene/SKILL.md`; reference code in
`references/patterns.md`.

| § | Step | The point |
|---|------|-----------|
| 0 | Audit first, on a valid footing | Baseline `renderer.info.render` / `.programs` / `.memory` — or, on a **raw WebGL** scene, the `getContext` hook you install first. Plus the environment rules: production build, fresh server, `waitUntil: "load"`, counted quantities only. |
| 1 | Never ship the scene to a bot | Crawlers get a static poster, and the `three` chunk is never fetched or evaluated. The poster is for screenshots and the no-WebGL fallback — *not* layout stability. |
| 2 | Tier the device once | One module owns what "mobile" means; DPR, counts, bloom and frame budget all read from it. |
| 3 | Prewarm **everything** in the loader | Compile, link, upload, allocate *and decode* before handoff — the rule that kills micro-freezes. Also where §1's code-split fights §3, and where the preload-credentials trap bites. **Yield a frame between the steps**, and let nothing the loader is not waiting for build underneath it: this project had the closing screen's scene constructing beside the hero's, which put two of every block under an animating curtain (ADR-0115). And **warm the whole timeline, not its first frame**: `compileAsync` walks `traverseVisible`, so anything belonging to a screen the reader has not reached is invisible and does not compile — 18 programs after the loader here, 26 after scrolling. ADR-0118. |
| 4 | Render only when visible | Gate on `document.hidden` + in-view + canvas actually visible. Biggest saving on a scroll site. |
| 5 | Frame budget per tier | 30 fps mobile / 45 tablet / uncapped desktop — measuring ~26 fps, because of how the ticker throttles. |
| 6 | Clamp pixel ratio — **and the composer** | A 3× phone renders 9× the fragments. Clamping the renderer but not `EffectComposer` throws the saving away. **Not below 1.0 when the scene draws hard edges** — and if it paints *type* into the framebuffer, the framebuffer is that type's resolution and no atlas can reach past it. This project learned that one twice; see [[decisions-log]] ADR-0112. |
| 7 | Cut fill, not detail | Particle counts, bloom, additive overdraw, renderer flags, shadows. On a *baked* point buffer, check ordering before truncating. |
| 8 | Fewest lights the look survives | One key + IBL; a light-count change recompiles every program. |
| 9 | Transforms on the GPU | Scroll drives a uniform, never a per-object JS loop. |
| 10 | Smooth scroll progress on touch | Low-pass once upstream (`k ≈ 0.22–0.3`), snap on page jumps. |
| 11 | No cursor interactivity on mobile | Don't attach the listener; gate on "pointer has actually moved". |
| 12 | Compress assets | Draco geometry (local decoder), KTX2/Basis textures, per-tier size caps. **A texture costs its decoded size in VRAM whatever it weighed on the wire** — this project's 818KB Draco'd GLB arrived as 67.8MB of maps, and `textureLimit(tier)` measured that to 20 on mobile. ADR-0118. |
| 13 | The iOS flicker details | No `resize` on touch, **canvas `lvh` / content `dvh`**, promoted compositor layer, clamped `dt`, dispose on unmount. |
| 14 | Verify, then write it down | Re-measure §0 on the same footing; program count must be **stable after the loader**. |

> [!warning] The three traps that cost the most time in the field
> 1. **§0 assumes three.js.** A raw WebGL scene has no `renderer.info` — you must
>    build the instrumentation before you can measure anything, and the skill now
>    ships the `getContext` hook that does it.
> 2. **Dev-mode numbers are invalid.** Eager chunk serving fakes a §1 failure;
>    Strict Mode's double-mount fakes doubled listeners and a halved frame rate.
>    Always `build` + `start`, and kill the old server first.
> 3. **§1 breaks §3 by construction.** `dynamic(ssr: false)` means the scene
>    can't compile until after hydration — measured at 5.0 s against a loader
>    that lifted at 2.36 s. Gate the loader on scene-ready, not on a duration.

## Mapping onto this starter

The skill's canonical implementations live in a separate workspace
(`ternyon-projects/` — `helion`, `mycelia`, `stride`, `clarix`) and are **not
part of this repo**. Several of them already have an equivalent here — use the
local one rather than porting a second copy:

| Skill pattern | Use in this project |
|---|---|
| one shared rAF for the whole page (§4) | `subscribeToTicker` — `src/lib/animation/ticker.ts`, per-subscriber throttling built in ([[decisions-log]] ADR-0009). Also serves §5's frame budget. |
| bot detection (§1) | `isBot()` — `src/utils/is-bot.ts`, already used for the SEO path ([[seo-metadata]], ADR-0010). |
| scroll progress source (§9, §10) | The Lenis scroll store — [[smooth-scroll]]. Read it once per frame inside the ticker; never in a scroll handler that also writes styles. |
| in-view gating (§4) | `useDynamicInView` / `useInViewRef` — [[hooks]]. Give the observer a ~1 viewport `rootMargin` so the scene is warm on arrival. |
| viewport sizing (§13) | `heightLvh` / `minHeightLvh` — `src/utils/lvh.ts` — for the **canvas**, so a collapsing URL bar never re-allocates the framebuffer. Lay the **content** out in `dvh` instead, or the bottom of the page hides behind that same URL bar. Canvas `lvh`, content `dvh`. |
| device tiering (§2) | **Not in the starter.** Add `src/lib/scene/device.ts` when a project needs it, and document it in [[utils]]. |

> [!important] The hero's fragment cost is not all lighting
> One WebGL surface (`src/lib/scene/`, three.js), but its second stage runs a
> field costing 6 noise evaluations per pixel over the full viewport (ADR-0031,
> ADR-0034). It is affordable only because the shader skips
> it wherever that stage has no weight, so a §0 measurement taken outside the
> stage will read low. Measure inside it.

## How it sits with the hard rules

- **Rule 1 (all motion is spring-based)** is about DOM/React motion. A WebGL
  render loop is not DOM motion and is not governed by it — but everything
  *around* the canvas (reveals, overlays, loader UI, section transitions) still
  is: springs from [[animation-system]], text from [[text-engine]], no CSS
  keyframes.
- **Rule 2 (`#do-not-modify` engine)** stands. The scene subscribes to the
  ticker; it never edits `src/hooks/animation/` or the spring components.
- **Rule 4 (no hardcoded values)** applies to tier constants too — DPR clamps,
  particle counts and frame budgets belong in the scene's device module as named
  constants, not sprinkled through the render code.
- **Rule 6 (Server Components by default)** — the scene is a `"use client"` leaf
  loaded with `dynamic(..., { ssr: false })`, which is also what keeps `three` in
  its own chunk for §1.

## What this project's scene settled on

Run on 2026-09-02 against the hero scene; numbers and reasoning in
[[decisions-log]] ADR-0033, before/after in [[changelog]].

| § | Setting here | Why it deviates from the skill's default |
|---|---|---|
| 6 | desktop DPR caps at **1.25**, not 1.5 | The stage runs a per-pixel noise field over the whole viewport (ADR-0031/0034) — and its own specification asks for a DPR cap of 1, which does not apply here because it shares a renderer with hard-edged geometry. Fill goes with the square of the ratio; 1.25 is the floor before the 1px wireframe and the stage line start to alias. |
| 7 | the stage quad draws **last**, depth-tested | Drawn first with the test off, it evaluated the tide field on pixels the opaque bust then covered — the same walk the model's own shader was already doing there. |
| 7 | the wireframe, its glow and the junction sparks are `visible = false` while they can draw nothing | Their fragments are discarded above the first stage line, but the vertices are not, and the glow pays them a second time. Opening screen: 3 draw calls against the tide stage's 6. |
| 7 | the sparks do `brushMask` / `bottomFade` / `wireGlow` in the **vertex** shader | All three are constant across a point sprite, so per-fragment was identical output at a third more cost — `brushMask` alone walks 24 brush points (ADR-0035). |
| 7 | the word is its own small lattice (1,011 nodes / 2,757 edges), not a deformation of the bust's 4,961 / 15,808 | Correctness first — the bust's topology cannot open a gap between letters — but it also makes the closing frames the cheapest in the scene (ADR-0037). |
| 4 | the hand-over switches each pass off outside its own window | Mid-morph the frame issues **4** draw calls against the tide stage's 6: the bust's three passes are already off and the lattice's edges are not yet on (ADR-0037). |
| 13 | a **`ResizeObserver`** on the container, not just `window` resize | A scrollbar, a devtools dock or a zoom change moves the container without firing `resize`, and the renderer then holds a stale drawing buffer for the session. `resizeSurface` also refuses to record a zero measurement (ADR-0038). |
| 4 | the word's scaffold is switched off once the chrome covers it | Its fragments were being discarded anyway; its vertices were not (ADR-0039). |
| — | **open:** the bust still draws twice a frame through the third stage while contributing nothing | Hiding it would hide the wireframe and sparks parented to it; the fix is a reparent (ADR-0036). |
| 7 | `shadow.mapSize` **1024** | The shadow camera wraps the bust tightly, so 1024 already over-resolves a soft self-shadow. |

> [!warning] Two traps this scene walked into, both in the measuring, not the code
> - **A screenshot can lie about the canvas.** A pane under load composites the
>   WebGL surface partially and captures black, or content in a corner. Check
>   `gl.getParameter(gl.VIEWPORT)` and the scissor box before believing a frame
>   is broken — the GL state is the truth, the capture is not.
> - **Scroll position is not scene progress.** The hero's runway is
>   `runwayViewports` tall but the canvas is only pinned for
>   `runway − 1vh`, so `scrollY / (runway × vh)` walks off the end of the scene
>   and lands you in the next section. Derive the denominator from the pinned
>   range, or read the trigger.

## After running it

Per §14 and the [[ai-agent-guide]] rules, in the same turn:

- Behaviour or measurable performance change → [[changelog]], with the
  before/after numbers.
- A trade-off chosen (a look sacrificed for a tier, a pass dropped) → an ADR in
  [[decisions-log]] **with the reasoning**.
- A new module (`device.ts`, a scene util, a hook) → [[utils]] or [[hooks]].
- `three` and any loaders/compressors added → [[tech-stack]].

## Related

- [[ai-agent-guide]] — rules of engagement; lists the skill routing rule
- [[animation-system]] — the ticker and spring primitives the scene shares
- [[smooth-scroll]] — the scroll source a scroll-driven scene reads
- [[seo-metadata]] — the bot path §1 hangs off
- [[decisions-log]] ADR-0009 (shared ticker), ADR-0010 (SEO/perf hardening),
  ADR-0016 (this registration)
