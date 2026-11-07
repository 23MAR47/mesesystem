---
tags: [meta, decision]
updated: 2026-09-02
---

# Decisions Log (ADRs)

Why this project's conventions are what they are. Each entry records a decision,
the reasoning behind it, and what it constrains when you build.

These are **inherited from the starter** — they explain the rules in `AGENTS.md`
and across the vault, and notes link to them by number. Add your project's own
decisions on top, continuing the numbering. Amending an inherited decision is
fine; write a new ADR that says so rather than editing the old one.

Template: [[templates/adr-note]].

---

## ADR-0079 — Tone mapping moves into the materials, so a token lands as itself

**Status:** Accepted · 2026-09-06 · amends ADR-0078

The mark was set to white and rendered **241,241,241**; the mesh was set to the
button's `#0051ff` and rendered **34,146,242**. Neither was a tuning error, and
no amount of adjusting the tokens could have fixed either.

**Why.** Three compiles a material's tone mapping in only when the render target
is the canvas — `WebGLPrograms.getParameters`: `if (material.toneMapped) { if
(currentRenderTarget === null || isXRRenderTarget) toneMapping =
renderer.toneMapping; }`. With a composer, every material renders into a target,
so the single tone map is `OutputPass`, at the very end, over everything the
scene wrote. That includes the flat colours the design injects after
`<dithering_fragment>` — and the Khronos PBR Neutral curve compresses everything
above 0.76 and **approaches 1.0 asymptotically without reaching it**. Pure white
is not in its range. Pre-compensating is impossible for the same reason: the
inverse diverges.

**The fix is to apply the curve where it belongs.** `renderer.toneMapping` is
`NoToneMapping`, so `OutputPass` does the sRGB encode alone; `neutralToneMap()`
is injected into the shaders and called by hand on:

- the model's lit colour, after the grain and **before** the stage and the mark
  are mixed in;
- the word chrome's lit colour, before its sheen;
- the tide field inside `stageColor` — its glow term runs past 1 and always
  relied on the roll-off.

Everything else the scene draws — the wireframe, the sparks, the word's
lattices, the stage grounds, the mark — is a design token, and tokens now travel
to the screen unchanged. Measured after: the mark is **255,255,255** exactly.

The curve is three's own, transcribed, with `uToneExposure` carrying the same
`lighting.toneMappingExposure` the renderer used to be given. Lit surfaces get
the identical curve at the identical exposure; what changed is only *when*.

**A knock-on worth knowing.** Bloom reads the linear target, so the model's lit
colour now reaches it already compressed and blooms a little less. The flat
colours reach it exactly as before.

**And the mesh needed weight, not colour.** At `wireframe.opacity: 0.5` a GL
line — always one device pixel, `linewidth` being ignored in WebGL — blended
with the white behind it and read as a pale periwinkle: measured 185,192,255
against the button's 0,81,255. Full opacity is what makes the accent read as the
accent.

---

## ADR-0082 — The screen is two anchored groups, not one scaled frame

**Status:** Accepted · 2026-09-06 · amends ADR-0072

`StageFrame` was a `55.5556vw` box — the design's 800/1440 — centred in the
pinned stage. Width scaling was right and stays; the centring was wrong. A window
taller than the design's aspect pushed the whole composition into the middle and
opened dead bands above and below it, so the copy floated well clear of the
bottom edge it is drawn sitting on.

The screen is now read as **two groups**. `StageFrame` is the top-anchored one
— full height, children measuring from the top of the screen. `StageBottom` is a
box of the design's own height with its bottom on the screen's bottom, so a
child keeps the `top-[…vw]` Figma gives it and lands the same distance up from
the bottom edge. At the design's own aspect the two coincide and nothing has
moved; taller than that, the gap opens in the middle — which is where the design
has its space anyway, because that is where the subject stands.

The split point is the rule: everything above it belongs to the top group,
everything from it down to the bottom one. Every screen divides there already.

The scene's own rule follows the same anchoring — a fixed distance up from the
bottom edge rather than a fraction of the height.

---

## ADR-0085 — Two reveal mechanisms, and the line between them

**Status:** Accepted · 2026-09-06 · extends ADR-0084

Every heading now resolves unit by unit in a scrambled order. Two mechanisms do
it, and which one a piece of text uses is decided by one question: **does it have
to sit behind the model?**

**Painted by the scene** — the display headings. `data-scene-ink` on the element;
the browser still lays it out, styles it and rasterises it, and the scene reads
its box, font and colour and draws the glyphs into a shared atlas. Drawn by the
background quad, which depth-tests against the subject, so the model occludes
them. That is the only way to get them behind it: on the immersed and delivery
stages the quad *is* the tide field, so a DOM layer behind the canvas would be
covered by it entirely, and one in front cannot be occluded by anything.

The atlas replaces the single texture of ADR-0083. Pieces are stacked in one
canvas; `uInkScreen`/`uInkAtlas`/`uInkColor`/`uInkRange` carry one entry each and
`uInkUnit` holds every unit's start and current alpha. Only the pieces actually
showing are packed into those arrays — the shader walks them for every fragment
of a full-screen quad, so the cost is what is on screen, not what the page has.
Which layer fades a piece is read off the nearest `data-scene-layer`.

**Revealed in the DOM** — everything else: the second-level serif copy, and the
process screen's names, which have no scene behind them at all. `<StageReveal>`
splits the text and gives each unit an `opacity: calc()` over **one** custom
property, `--stage-reveal`, which the layer above already writes as it fades. It
animates nothing itself: one number in, each unit takes its own share. No second
clock, no per-frame work per word, and it survives re-render because it is only
CSS. `opacity` clamps to 0-1 by itself, which is exactly the "not yet / fully
here" the stagger needs.

The scene mechanism cannot take the serif copy anyway: those blocks **wrap**, and
the painter draws one line with one `fillText`.

**Both are the documented exception to the text-engine rule** (ADR-0084), for the
same two reasons: the stage is pinned, so the engine's scroll modes have no
movement to measure, and the only mode that takes an external value is `manual`.

---

## ADR-0087 — Painted type is measured in layout space, never from a rect

**Status:** Accepted · 2026-09-06 · amends ADR-0085

`getBoundingClientRect` was the wrong instrument for placing painted type, and it
took three separate symptoms to see them as one cause.

The closing screen's scene lives **inside the gallery's rising panel**, which is
tilted and translated under the fold for the whole of its climb. Everything
measured through it was measured through that transform:

- `resizeSurface` sized the drawing buffer from the panel's projected box, so the
  buffer came out in the wrong proportion to the element it is stretched over —
  measured 2356x1347 for an 1885x980 box. The camera was stretched with it.
- the ink's own measurements inherited the same distortion, and never corrected,
  because nothing re-measures once the layout stops changing.

So both now read the **layout**: `clientWidth`/`clientHeight` for the surface, and
an `offsetParent` walk for each piece of type. Neither is touched by a transform,
which is the point — the panel can do what it likes on screen and the type stays
where the document put it.

Two details the walk has to get right, each of which cost a build:

- **It stops at the stage, not at the canvas's wrapper.** The layers holding the
  type are *siblings* of that wrapper, so a walk aiming at it never arrives and
  every offset up the document is added instead. The heading left the screen.
- **An element's own shift counts, and Tailwind v4 writes `translate`, not
  `transform`.** The first screen's name is centred with `-translate-x-1/2`;
  reading only `transform` returned identity and put the name half its width
  right of where it is drawn. A computed `translate` also keeps its
  **percentages**, resolved against the element's own border box.

---

## ADR-0088 — Painted type and bloom cannot share a stage

**Status:** Accepted · 2026-09-06

Bloom is a full-screen pass and the painted type is written into the frame before
it, so anything painted while bloom is on comes out glowing. There is no mask:
excluding the type would mean compositing it *after* the bloom pass, and there it
would have no depth to be occluded by — which is the entire reason it is painted
rather than left in the DOM.

The two requirements are therefore settled per screen, not globally:

| screen | bloom | painted? |
|---|---|---|
| first, immersed, closing | off | **yes** — needs to sit behind the model |
| delivery | on (the chrome pour) | **no** — nothing there needs occluding |

So the delivery screen's headings went back to the DOM with `<StageReveal>`. The
rule to carry forward: **paint only what has to be behind the model, and check
whether bloom is on for that stretch of scroll before doing it.**

---

## ADR-0090 — A screen may play on its own clock once the scroll has delivered it

**Status:** Accepted · 2026-09-06 · amends ADR-0085

Every overlay was scrubbed by scroll: its opacity, and through `--stage-reveal`
every letter and word inside it, was a direct function of progress. That is right
for a screen *arriving* — the field climbing, the strip travelling — and wrong for
one that has already arrived.

The second screen is the case. `stages.tide` finishes at 0.28: by then the field
has filled the frame and the screen is simply *there*. Tying its type to the next
few pixels of scroll made the reveal something the reader operates, a slider they
drag rather than an event that happens to them — and it ran at whatever speed
they happened to be scrolling.

`LAYER_WINDOWS` entries may now carry **`auto`**. The window's edges become
thresholds rather than ramps: crossing `in` starts a spring to 1, crossing `end`
starts one back to 0, and the spring owns everything between. Scroll still
decides *when*; it no longer decides *how*.

The first screen keeps its scrubbed window and simply leaves more slowly (`end`
0.18 → 0.26): it is going out under a field that is climbing over it, and that is
a handover, not an event.

---

## ADR-0092 — A scroll trigger sized to its band goes quiet outside it

**Status:** Accepted · 2026-09-06 · amends ADR-0086

`<StageNavBar>` measured its band with a `<ProgressTrigger>` shaped exactly like
it — from one viewport down to where the closing plane starts to climb. Elegant,
and wrong: the trigger is gated on an `IntersectionObserver` over its own
element, so once that element leaves the viewport it stops reporting and the
last value it saw stands. Scrolling back to the top therefore never told the bar
to leave. It froze half-open — a white disc and a blue one over the first screen,
which is what the report showed.

The marker now covers the **document** (`absolute inset-0` of `main`), so it is
always intersecting and always reporting, and the band is two numbers compared
against the scroll it hands over. Geometry that used to be expressed as the
element's shape is expressed as arithmetic instead, which is the part that
survives being off-screen.

> [!warning] The general rule
> A `<ProgressTrigger>` reports only while its element is on screen. Anything
> that must be *turned off* when the reader is far away from it cannot take that
> element as its span — give the trigger something that is always in view and do
> the comparison yourself.

The bar also fades as it closes. The clip's floor is a **disc** the height of the
bar, so a value near zero still draws two circles; opacity is what makes the end
of the animation actually empty.

---

## ADR-0094 — The chrome gets a studio of its own to reflect

**Status:** Accepted · 2026-09-06 · amends ADR-0028

A mirror has no shading of its own. Every value on the word was something in the
room, and the room was `RoomEnvironment` — a diffuse box with no structure in it
— so the word came out as flat blue-grey whatever was done to roughness or
intensity. Those were the wrong knobs: the subject of a mirror is the
environment.

`chrome.environment` paints an equirectangular strip to a canvas — a sky, a hard
horizon, a key softbox, a floor bounce and four vertical strips — and prefilters
it into its own PMREM. It is hung on the **word's material alone**:
`scene.environment` still lights the skin on the first screen and that is
calibrated (ADR-0027).

What follows from having something worth reflecting:

- **Roughness drops from 0.3 to 0.12.** The old value existed to smear two
  hotspots on flat grey into something that followed the form. With bands to
  reflect, blur only throws them away.
- **The sky is not white.** It is the largest area in the strip, so it is what
  the broad faces return; at 1.0 they all cleared the bloom threshold together
  and the word became a glowing slab with no form. 0.5 at the top, with the
  bands and strips left hot — those are small, and a highlight is what should
  bloom.
- **Bloom moves with it**: threshold 0.82 → 0.95, strength 0.62 → 0.42. Still
  clear of the tide's own brightest (~0.72), which is the number that keeps the
  background from lifting as one.
- **Everything in the studio is greyscale.** The colour is the fresnel ramp's
  (`--scene-chrome-sheen` / `--scene-chrome-deep`), so the room can be retuned
  for contrast without touching the palette.

---

## ADR-0096 — Anything gated on a scroll-driven value must be integrated, not read off the clock

**Status:** Accepted · 2026-09-06

The accent's turn was `elapsed * accentSpin * 2π` behind a `morph === 1` gate.
Both halves of that are fine on their own and wrong together: by the time the
gate opens, the product has grown to a large angle, so the star snapped from
zero to wherever the clock happened to be — and snapped back the moment the
morph dipped under 1 again, which it does constantly while the reader scrolls
around the end of it. That is the jitter.

The angle is **accumulated** now, and the gate became a ramp: `accentSpinFrom`
fades the *speed* in over the last of the morph. Crossing the threshold in
either direction only changes how fast the star is turning, which is
unobservable; there is no value to jump to any more.

> [!warning] The general shape of this bug
> A quantity read from a monotonic clock (`elapsed * k`) and revealed by a
> **scroll-driven** condition will always snap, because the reader can arrive at
> that condition at any time. Integrate the rate instead and let the condition
> scale it. The same fix, for the same reason, as the scroll turn in ADR-0089.

---

## ADR-0098 — The last screen of a runway has no exit of its own

**Status:** Accepted · 2026-09-06 · amends ADR-0075

The delivery screen faded out at 0.86–0.99, which left the reader watching an
empty field for the last stretch of a seven-viewport pin — the copy gone, the
word still turning, nothing to read.

It is the **last** screen of the runway, and the thing that takes it away is the
pinned stage scrolling off into the next section. That is a handover, and the
section boundary already performs it; a fade on top of it is a second, earlier
disappearance with nothing to hand over to.

Its window now says so: `out` and `end` are both 1, and `end > out` being false
is how `fadeLayers` expresses "no exit". Every screen *before* the last still
needs one, because what follows them is another screen on the same pin.

---

## ADR-0099 — The field's reading of the scroll is eased, not raw

**Status:** Accepted · 2026-09-06 · amends ADR-0097

Feeding progress straight into the field's drift made the ground snap: a flick
of the wheel or a jump to an anchor moves progress instantly, and a texture that
tracks it exactly is being dragged rather than travelled over.

`tideField.scrollResponse` (0.4s) puts a framerate-independent follower between
them, and the drift itself came down from 1.6 to 0.45 with the surge halved. The
motion is meant to be felt rather than watched: at the amounts it started with,
the field read as a second animation competing with the model.

---

## ADR-0119 — The scale is a function of the angle, and the curtain hides the arrival rather than delaying it

**Status:** Accepted · 2026-09-06 · completes ADR-0117, amends ADR-0114

**The beat has no clock at all now.** ADR-0117 made the turn and the scale two
readings of one integrated `phase`, which stopped them drifting. The reference
sequence went further: the square is **largest when it is square to the frame
and smallest when it stands on a corner** — so the scale is not a companion
motion at all, it is a function of the angle.

`scaleAt(phase)` is a raised cosine, one full cycle per quarter turn: `from` at
every whole quarter, `to` at every half-quarter between. Measured off the
transform: 1.00 at 1.1°, 90.2° and 270°; 0.78 at 44.7°, 135.8° and 225.4°.

This also removes the one exception ADR-0117 had to allow. The ending settles
the phase to the next whole quarter, and a whole quarter **is** `rest` — so the
scale arrives at its resting size without being told to, and the separate spring
that used to carry it is gone. There is no longer any moment in the whole run
where the two are on different clocks.

**And the curtain hides the model's arrival rather than postponing it.**
ADR-0114 gated the canvas's fade on `released` alongside the ink's entrance,
reasoning that a performance behind a curtain is wasted. That is true of the
*ink* — letters resolving where nobody can see them — and false of the model,
which is not a performance but a thing that should already be there. Measured,
the canvas now reaches full opacity at **1629ms** against a curtain that lifts at
**4900ms**: the reader gets a finished screen the instant the blue goes.

> [!note] The rule this splits on
> Gate on `released` what the reader is meant to *watch*; gate on `ready` what
> they are meant to *find already there*. The two are not the same question and
> ADR-0114 answered them with one flag.

---

## ADR-0127 — A tier change on resize reloads rather than rebuilds

**Status:** Accepted · 2026-09-07 · extends ADR-0126

Since the lite path, the tier decides the shape of the page, not just its
budget: which model is decoded, how long the runway is, whether the second
and third screens are layers on it or sections below it. All of that is
chosen once, at mount, because a device does not change tier mid-session —
except when the "device" is a desktop window being dragged, or DevTools.

Making that live would mean disposing the scene, unmounting layers, mounting
sections, decoding the other model and re-running the whole prewarm — in the
open, under the reader, for the one case where a person is resizing a window
to see what happens. A reload does exactly the same work behind the curtain,
lands at the top of the page, and costs one line. The owner offered the
trade explicitly; it is taken.

**What reloads is a tier change, nothing less.** `resize` is noisy: iOS fires
it as the URL bar collapses, rotation fires it, and a window drag fires it
every frame. The guard debounces and compares tiers, so only a crossing of
768px / 1180px (or of the coarse-pointer clause) reloads.

---

## ADR-0126 — A phone gets the lite path: one model, one motion, and the later screens as stills

**Status:** Accepted · 2026-09-07 · extends ADR-0125; amends the mobile tier of ADR-0028-era `device.ts`

The scroll narrative was designed as one seven-viewport runway with three
stages drawn live. A phone ran all of it — at a frame cap of 30 (26 measured)
under a 120Hz scroll, which is what "lag" was. Raising the cap alone would
have been enough for an iPhone and wrong for a cheap Android; the owner asked
for the simpler thing, and it is the better thing: on the mobile tier the
scene draws **one model with one motion**, and the two later screens are
**stills of the scene itself**.

**Why stills rather than a lighter live version.** The second stage is a
full-screen field with two noise walks per pixel plus a net of 31k vertices
drawn twice; the third is a morph, a chrome pour and a bloom chain. Each can be
tiered, and each tiering is a lesser version of the same look. A captured frame
is the *same* look, costs one texture, and leaves the GPU asleep. The copy over
it still moves — the page's DOM reveal is the same one every screen uses — so
the narrative reads as motion where the reader looks, and holds still where
they don't.

**Why the model still lives.** The first screen is the site: the arrival, the
name behind the subject, the turn as you leave. That is kept whole, at 60fps
and one pixel per CSS pixel, on a model with 40% of the vertices — none of
which shows at phone size.

**Why the tier decides, not the layout.** `wantsLiteScene` is the mobile tier
("what can this GPU do"), not the `stacked:` query ("does the band fit"); a
landscape phone gets the lite path with the band. The choice is made once at
mount, and the SSR placeholder keeps the full runway height — the document
shortens under the curtain, where nobody sees it.

**What was not done, and why.** Capability-measured tiering (benchmark a few
frames after prewarm and lift the cap) would have kept the full choreography
on strong phones; it was set aside because the owner asked for less motion on
mobile as a design, not only as a budget. And touch scrolling still runs
through Lenis — the profile shows it as the largest non-idle item, and changing
it changes the feel of the whole page, which is a separate decision.

---

## ADR-0125 — One WebGL scene on the page; the closing screen is a still

**Status:** Accepted · 2026-09-07 · supersedes the still-instance parts of ADR-0115, 0123, 0124

The owner's call, on a phone that lagged: 3D in the hero only, UI motion for
the rest. The closing screen was the only other scene, and three ADRs had been
spent making a second renderer coexist with the first — when it built, what it
built, what it allocated. The right amount of a second renderer on a phone
turned out to be none.

**The subject stays; the renderer goes.** The screen keeps the same bust,
captured *from the scene* as a cutout with the foot already dissolved into the
accent — the one thing the scene did there that a photograph could not. A
static image on the accent is what the crawler was already getting; now it is
what everyone gets, and the two paths are one.

**The reveal uses the mechanisms the page already had.** `--stage-reveal`,
`<StageReveal>` and `stageRise` were built for DOM copy over the scene
(ADR-0085, 0122); here `<Inview>` writes the property from a spring instead of
`<ModelViewer>`, and nothing else changes. `mode="once"`: a screen that
un-resolved on the way back up would read as a glitch, not a flourish.

**And the depth cue moved into CSS.** The heading's lag against the rising
panel was computed by the scene as an ink shift; it is the same `1 - travel`
expression the copy already used, on the element itself.

**Deleted, not disabled.** `still`, `surfaceToken`, `arrive`, the panel
lookup, `closingReady` — a flag whose only consumer is gone is a branch nobody
will ever test again.

> [!note] What this does not settle
> Whether the hero alone is light enough for the phone. That is measured on the
> device, not here; the tiering knobs are all in `sceneConfig` and `device.ts`.

---

## ADR-0124 — A still instance is built as a still, and no canvas is multisampled

**Status:** Accepted · 2026-09-07 · extends ADR-0115/0123

The closing screen's scene is the same class as the hero's with two flags, and
it inherited everything the hero needs: a post chain with a bloom mip chain
(allocated at construction whether or not the pass is enabled), the word asset
and its lattices, sparks and solids, five prewarm stops, and a multisampled
canvas. It shows a textured bust at progress 0 and the pointer's mark. Measured
at a Retina window, bringing that second renderer on screen cost the GPU
process a 74ms surface allocation and two frames of waiting; on a machine short
of GPU memory that is seconds.

**What a still needs is decided by what it shows.** No morph means no word; no
chrome means no bloom; one stop means one prewarm. `still` on the scene now
switches those off, and every guard was already in place — the class had been
written to tolerate their absence, it had just never been asked to.

**And the canvas is never multisampled, on any tier.** The scene always renders
through the composer (ADR on the constant post chain), so nothing but the final
full-screen quad ever reaches the canvas — MSAA there was four colour and four
depth samples per pixel for edges that are resolved in the composer's own
target. `wantsAntialias` keeps deciding *that* target's samples, which is where
antialiasing actually happens. Same image, roughly 150MB less per instance at
2592×1675.

> [!note] The remaining cost is the rise itself
> The panel is a perspective-tilted, clipped layer with a WebGL canvas inside,
> so the compositor draws it through an offscreen surface every frame it moves.
> That is by design (the closing screen *rides* the plane) and is per-frame
> GPU work, not a stall. A 30fps cap on the still or a flat rise would reduce
> it; both change what the reader sees, and neither was taken here.

---

## ADR-0123 — Whatever the page will ever build is built under the curtain, in sequence

**Status:** Accepted · 2026-09-07 · amends ADR-0115, completes ADR-0122

ADR-0115 deferred the closing screen's scene to `released`: two scenes building
at once put six main-thread blocks under a curtain trying to animate, and the
second scene was for a screen minutes away. That held while the hero was found
finished under the curtain (ADR-0119). ADR-0122 made the hero's arrival a
performance on `released` — and the deferred build landed in the middle of it,
measured as four long tasks of 51–76ms (up to 237ms at 4× CPU) in the first
second of the reveal.

**The principle from ADR-0115 was right and its conclusion was wrong.**
"Whatever is not being waited for must not build under the thing that is doing
the waiting" — the fix was never *deferring* the work but *sequencing* it. The
still instance now builds under the curtain **after** the hero's scene has
reported ready, so the two never interleave, and the curtain waits for both.
The reveal then runs on an idle thread: measured, no long task and no frame gap
over 50ms from the curtain's first moving frame to rest, at either CPU speed.

**What it costs** is the curtain: about a second longer, spent on the second
scene's chunked decode and prewarm. That is the trade the request asked for —
a loader that takes a moment longer against a reveal that never stutters — and
the right side of optimize-3d-scene §3, which this project had half of.

**And a failed scene reports as settled.** With two scenes gating the curtain,
one that throws would hold it for ever; it now reports on `failed` as well as
`ready`, which also fixes the no-WebGL path the single-scene gate had left
behind a curtain.

---

## ADR-0122 — The model arrives rather than waits, and the curtain owns where the page is

**Status:** Accepted · 2026-09-07 · amends ADR-0119, extends ADR-0114/0115

ADR-0119 split the opening on one rule: gate on `released` what the reader is
meant to *watch*, on `ready` what they are meant to *find already there* — and
put the model in the second group, finished under the curtain. That is reversed
here, on request: the model is the performance. What survives from ADR-0119 is
the mechanism — the scene is still warm under the curtain, every program
compiled, every texture uploaded — and what changes is only that the model is
**held back** (a level of 0, every fragment discarded) until `released`, and
then walked in.

**The arrival is one value, read twice.** A single spring drives both the
approach (nearer the camera, higher, settling down and back) and the burn-in
(a per-fragment threshold from three octaves of drifting noise, discarded until
the level passes it, with an ember band just inside each front). Two springs
would have needed keeping in step; one cannot come apart. The offset sits on
the tilt group, above the sway, because the approach is the subject coming *to*
the place where those idle motions happen.

**The burn discards; it does not fade.** A fade would show the whole silhouette
faintly from the first frame, and the point is that the shape is *found* patch
by patch. Discard writes no depth either, so the stage behind — name and rule
included — shows through every gap, and the shadow map is given the same
discard so a head not yet drawn cannot throw a shadow onto a shoulder that is.

**The thresholds are spread, not raw.** Averaged octaves crowd 0.4–0.6, and a
first cut with the raw sum did the whole burn in the middle third of the spring
with nothing before and nothing after. `smoothstep(-0.55, 0.55, n)` spreads
them over 0–1.

**The copy joins the same clock.** The layer's `--stage-reveal` is now
`window × entrance` for the DOM as it already was for the painted type, so
`<StageReveal>` and the new `stageRise` divide one number. The name and copy
start a beat after the model (`inkDelay`), because the two on one frame read as
one event with two parts.

**The page is released while the curtain is still leaving.** ADR-0114 released
on the exit's rest so that nothing played behind a curtain still on screen.
With the model now arriving on that signal, rest was too late: the reader got
an uncovered, empty screen with a few ember marks on it while the burn got
going. `release()` now fires from the exit's `onChange` at `releaseAt` (half
the travel), and the curtain finishes its climb over a screen that is already
happening. The store's `released` and the element's own `gone` are therefore
two states, not one.

**And the curtain owns the scroll position.** The bug this began with was the
browser restoring a reload's scroll position *after* the layout's scroll-to-top
and under the curtain, which then lifted onto the middle of the page.
`history.scrollRestoration = "manual"` is set inline at the top of `<body>` —
the restore happens while the document streams, long before any effect — and
the curtain scrolls to the top itself both on locking and on leaving, telling
Lenis as well, since a stopped Lenis keeps a target of its own.

**A second cause was found on the way.** The scene effect depended on
`released` (ADR-0115 added it for the closing instance), so the hero's own scene
was torn down and rebuilt the moment the curtain left, and the rebuild's
prewarm walked every scroll stop on a visible canvas. The effect now depends on
a derived `buildable` that, for the hero, never changes. **A dependency that is
only meaningful to one instance must be derived per instance, not shared.**

---

## ADR-0121 — The brand assets are generated from one mark, and the metadata says only what the page says

**Status:** Accepted · 2026-09-06

The site shipped with the starter's placeholder identity: "New Project", a black
theme colour, a `@newproject` handle, and an icon set nobody had looked at.

**There is no logo file in this repository**, so the mark is *derived* rather
than invented: the accent field with a squared frame and a dot at each corner —
the design's own geometry, the figure the opening curtain carried. It is also
the only figure here that survives sixteen pixels; the wordmark is a light
display serif, which at that size is a smudge.

`scripts/generate-brand-assets.mjs` writes every size from one SVG function, so
replacing the brand later is one edit and one command rather than a hunt through
`public/`. It also writes the `.ico` by hand — sharp has no ICO encoder, and the
format does not need one: an icon directory is a 6-byte header, a 16-byte entry
and a PNG payload.

**The share card carries no type**, and that is a decision rather than an
omission. Burning the wordmark in would mean resolving Melodrama at build time,
and it exists here only as `woff2` — which no SVG renderer reads and no toolchain
in this repo converts. A card whose typeface silently falls back to whatever the
build machine happens to have installed is worse than one carrying none: the
title and description are OG *tags*, and every platform renders them beside the
image. So the card is the site's own composition instead — the accent, the mark,
and the porcelain panel with the subject on it.

**Icons come from `src/app/`, not from a hand-written list.** Next's file
conventions emit the `<link>` tags for `favicon.ico`, `icon.svg` and
`apple-icon.png`, including the SVG that every current browser prefers. The
generator's `icons` block was removed rather than kept alongside: two sources
for one set of tags is two sources to drift. `public/favicon.ico` went with it —
it claimed the same `/favicon.ico` URL as the app file, and which one wins is a
detail of the framework rather than a decision anyone made.

**And the structured data is `Person`, not `Organization`.** The site sells one
named creator's work and the whole first screen is her name; an `Organization`
would describe a company that does not exist and would compete with the person
for the same query. A `Service` node carries the offer, with `lowPrice` rather
than `price` because the page says "from".

> [!warning] Everything asserted is on the page
> The name, the promise, the batch and the entry price are all stated in the
> hero and the process screens. No address, no rating, no `sameAs` to accounts
> nobody has confirmed, and `twitterHandle` is **empty** rather than guessed — a
> wrong handle attributes the work to whoever does own it. Structured data that
> outruns its page is how a site loses its rich results.

---

## ADR-0120 — A magnetic control, and why both of its springs repaint

**Status:** Accepted · 2026-09-06

`<Magnetic>` leans a control's **label** toward the pointer and eases it home
when the pointer leaves. The pull is a **fraction of the offset from the
control's centre**, so the reach scales with the control rather than being a
fixed distance: the wide address pill leans further than a small button would,
and the gesture reads as the same gesture on both.

**Two elements, two jobs, and that separation is the component.** The element it
wraps is what *moves*; the element containing it is the area that is *felt* — so
the listeners go on the parent and the transform on the child. Moving the plate
as well was the first shape and it was wrong twice over: a button that slides
comes loose from the layout, and it drags its own hover area out from under the
cursor, so the pointer can leave a control that moved away from it.

**No clip keeping the label in.** The lean is bounded at `pull` of the
half-width — measured 69px at full reach, against 172 of lead-in and 103 still
spare on the right — so it cannot reach an edge. An `overflow-hidden` here would
also have to fight the plate's `leading-none` for its glyphs, which hard rule #3
forbids and `verify.sh` caught.

Two bare `SpringValue`s writing the transform from `onChange`, the bargain the
nav bar, the scene's entrance and the opening curtain already make — a pointer
crossing a control is a hundred updates a second and not one of them is a reason
to re-render React. The lag is the effect: a control that arrives with the cursor
is just a control that moved.

The box is measured **per move**, not cached. This one sits on the closing
screen, which is carried up by a rising panel, so its rect is somewhere
different on every frame of the climb and a remembered one would aim at where
the control used to be.

Nothing is attached without a pointer (`wantsPointer`): on touch there is no
hover to answer, and an unmoved cursor resolves to the element's own centre
anyway.

> [!danger] Both springs must repaint, not one
> This shipped with `onChange` on the y spring alone. A pointer moving along the
> element's vertical centre then leaves x travelling with nothing to write it
> out — the control does not move, and **only for pointer paths that cross the
> middle**, which is exactly the path a test aimed at the centre takes. It was
> found by measuring a horizontal move, not by waving a cursor at it.

---

## ADR-0118 — The loader walks the whole timeline, and the tier caps the textures

**Status:** Accepted · 2026-09-06 · extends ADR-0115

Two findings from running the `optimize-3d-scene` audit properly, both caught by
its own §14 check rather than by looking.

**Eight shaders were compiling mid-scroll.** `compileAsync` walks
`traverseVisible`, and at progress 0 the word's scaffold, its sparks and its
poured solids are all `visible = false` — they belong to a screen the reader has
not reached. So the loader compiled what the *first* screen needed and nothing
else. Measured: **18 programs after the loader, 26 after scrolling to 45%**.
Every one of those eight is a compile stall in the middle of the morph, which is
precisely the micro-freeze §3 exists to prevent.

The loader now stands the scroll at each of `prewarmStops` (0, 0.25, 0.5, 0.75,
1), syncs the handover, compiles and renders a frame at each. Driving the real
progress rather than forcing `visible` by hand is what makes it complete: every
branch reaches its natural state, including the **bloom pass**, which is gated on
the pour and would otherwise not have allocated its chain until the chrome
arrived.

It is also *cheaper*, which was not the intent: spreading the compile across five
yielded frames broke up the composer's single 182ms first-frame block. Blocked
time under the curtain went **307ms across 3 tasks to 209ms across 3, worst 182
to 99**.

**And 67.8MB of video memory for a 818KB file.** The GLB is Draco'd with WebP
textures and weighs almost nothing on the wire — but a texture costs its
*decoded* size in VRAM, and three 2048² maps with mip chains come to 67.8MB. On
a phone that is the difference between a smooth pan and a texture-thrash
stutter.

`textureLimit(tier)` caps the longest edge — 1024 mobile, 1536 tablet, the
author's own resolution on desktop — and the maps are redrawn through a canvas
before anything uploads them. Mobile measured **67.8MB → 20MB**.

> [!note] KTX2 would be better, and was not done
> A GPU-compressed texture stays compressed in VRAM; this only makes a smaller
> uncompressed one. The conversion is an offline asset change
> (`@gltf-transform/cli --texture-compress ktx2` plus a `KTX2Loader`), not a
> code change, and pulling that toolchain in unasked is a bigger decision than
> this audit was given. The runtime cap is the part that could be done from
> here, and it takes most of the win.

---

## ADR-0117 — The turn and the beat are one number, not two motions kept in step

**Status:** Accepted · 2026-09-06 · supersedes the two-clock design of ADR-0114 and ADR-0116

Three rounds went into making the curtain's square turn and breathe together,
and the first two both tried to *coordinate* two motions — first by deriving the
turn from load progress, then by giving each an even clock of its own. Neither
reads as one gesture, because neither is one.

There is only one number now. `phase` counts **quarter turns**, integrated from
each frame's own elapsed time:

- the angle is `phase * 90`;
- the scale is the fractional part of the same value, eased — even legs draw the
  square in, odd legs open it back out.

So a change of scale direction can only ever land on a whole quarter turn. The
square cannot shrink except while turning, or grow except while turning, and no
amount of tuning is required to keep it that way: it is not a property of the
configuration, it is a property of there being one variable.

Measured, from the transform itself:

| angle | scale |
|---|---|
| 0° → 90° | 1.16 → 0.74 |
| 90° → 180° | 0.74 → 1.16 |
| 180° → 270° | 1.16 → settle |

**The one place they part is the ending**, and deliberately. The phase springs
to the next whole quarter so the square lands square to the frame; the scale
leaves it and springs to `rest` on the same config, so the two arrive together.
An ending is a settle, not a beat.

> [!note] What each attempt got wrong
> ADR-0114 mapped the turn onto load progress, so it inherited progress's crawl,
> plateau and jump. ADR-0116 gave the turn an even clock of its own, which fixed
> the *smoothness* and left the *coupling* — the two were even but unrelated, so
> a shrink could begin anywhere in a turn. The lesson is the same one twice: if
> two things must be simultaneous, derive them from one value rather than
> running two.

---

## ADR-0116 — One writer per frame, and a turn is a rate rather than a mapping

**Status:** Accepted · 2026-09-06 · corrects ADR-0114

The curtain's square turned and breathed on two different clocks, and it looked
like it. Two faults, one cause each.

**The turn was mapped onto load progress.** Progress creeps under `fill`,
plateaus at `hold`, and jumps when the scene reports in — so a rotation derived
from it inherited all three. The square crawled, stopped dead, then snapped
round, while the beat carried on evenly beside it. Two motions whose speeds are
unrelated is exactly what "asynchronous" looks like.

The turn is a **rate** now, integrated against each frame's own elapsed time.
That is the idiom this project's motion rules already name for anything
clock-driven — *integrate the rate and let the condition scale it* — and it was
written there because of two earlier bugs of the same shape. Measured: 97% of
frames advance 2.46–3.5° against a 2.50° ideal at 60fps.

> [!warning] This fixed the smoothness and left the coupling — ADR-0117
> An even turn beside an even beat is still two motions, so a shrink could begin
> anywhere in a turn. The rate survives; what changed is that the scale is now
> read from the **same** integrated number rather than from a spring of its own.

**And there were two writers on one transform.** Each spring repainted from its
own `onChange`, so the element was written twice a frame, each write composing
with wherever it had *last seen* the other value. One ticker subscriber paints
now, sampling every value live, so the transform is always one consistent
moment — and the write happens once.

> [!note] The integrator is capped at 64ms
> The load still blocks the main thread for a frame or two. Uncapped, the turn
> takes the whole stall's worth of ground in the first frame after it — a skip.
> Capped, a 180ms stall costs a moment of stillness and a 9.6° step, which reads
> as the page being busy rather than as the animation being broken.

**It still lands square.** The ending takes the turn off the integrator and onto
a spring aimed at the **next quarter turn** — a square is itself every 90°, so
the settle is never more than a quarter away and the ending is a slowing rather
than a long slide back to a mark. Measured, it comes to rest at exactly 270°.

---

## ADR-0115 — A loader may have a floor on its showing, and nothing else may build under it

**Status:** Accepted · 2026-09-06 · extends ADR-0114

The curtain shipped with a pulse that never pulsed and a stutter, and the two
had different causes.

**It only ever shrank.** The beat's first leg takes about 0.63s and the scene
reported ready at ~1.2s, so what a reader actually saw was one shrink and then
the settle. The loop was working — measured with the ready signal held back, it
ping-pongs 0.74 ↔ 1.16 indefinitely — it simply never got a second leg.

So the curtain has `minShow`, a **floor** on how long it stays. This is not the
thing ADR-0114 warned against. **Ending** on a timer is a promise about the
network that cannot be kept; a floor is the opposite problem — without one, a
fast connection gets a flash of blue and a shape that shrank. The end is still
`sceneReady && waited`, and `sceneReady` is the one that cannot be predicted.

**It stuttered because a second scene was building underneath it.** The closing
screen's `still` instance was constructing at page load, alongside the hero's —
measured, every step ran **twice**, back to back: model decode, framing,
environment, word, prewarm. Six main-thread blocks of 82–199ms in the one second
the curtain has to animate through.

A still instance now waits for `released`. It is a screen the reader reaches
minutes later or never, it keeps its own in-view gate, and nothing about it
needed to be ready at the opening. **Whatever is not being waited for must not
build under the thing that is doing the waiting.**

**And the load hands frames back.** `frameModel`/`buildBackground`/
`buildEnvironment`/`buildLighting` ran as one task; the texture uploads ran as
one loop; `compileAsync` and the composer's first frame ran together. Each is
now separated by a yielded frame. The total work is identical — only its shape
changes, from a stall the reader sees into several they do not.

| under the curtain | before | after |
|---|---|---|
| long tasks | 6 | 3 |
| blocked total | ~773ms | 307ms |
| worst single | 199ms | 182ms |

> [!note] What is left is one indivisible draw
> The 182ms is the composer's first frame — allocating its targets and
> compiling its passes in a single call chain that cannot be split. Cutting it
> means restructuring the warmup, which is its own piece of work.

---

## ADR-0114 — The curtain is two signals, and what ends it is the scene

**Status:** Accepted · 2026-09-06

The page opens on a curtain: a square with a dot on each corner, turning and
growing while a counter fills, leaving upward when what it covers is ready.

**Two booleans, travelling opposite ways.** `usePreloader` holds `sceneReady`
(the page telling the curtain it may finish) and `released` (the curtain telling
the page it may begin). Collapsing them into one flag would start the hero's
entrance *behind* a curtain still on screen — the letters resolving where nobody
can see them, the reader arriving at a screen that has already happened. The
whole point of a curtain is that what it covers happens after it goes. Measured:
the canvas holds opacity 0.00 for the full 4.2s the curtain is up, then travels
0.31 → 1.00 in the 600ms after it leaves.

A store rather than props because the ends are in different subtrees — the
curtain is a sibling of the page, the scene is a leaf three levels inside it.
Same reason the scroll store exists.

**What ends it is the scene, never a clock.** The counter creeps toward `hold`
(0.9) on its own and would sit there; the last stretch and the exit wait for
`sceneReady`. A preloader timed to a guess is a promise about the network that
cannot be kept — [[optimize-3d-scene]] §3. The 0.9 is a guess and is allowed to
be, because it is only ever a *floor* on the wait, never the end of it.

**Two springs, and they are about different things.** One is the **load**: it
fills the counter and only ever moves forward. The other is the **beat**: a
ping-pong loop between two sizes, on its own clock, that knows nothing about
progress.

> [!warning] The beat's spring is gone — ADR-0117
> What survives from this ADR is only that the beat must not come from load
> progress. It is no longer a spring or a loop: the turn and the scale are two
> readings of one integrated `phase`, which is the only way to make them
> genuinely simultaneous. Read ADR-0117 for the shape that shipped.

> [!warning] The turn was on the load spring here, and ADR-0116 took it off
> Mapping a rotation onto progress gives it progress's own shape — crawl,
> plateau, jump. It is an integrated rate now, and the painting moved onto the
> ticker so one writer composes the pair.

That split is the point. A pulse written as a function of progress stops beating
exactly when the wait is longest — a stalled download would hold the square
still, which is the opposite of what a loading indicator is for. Measured with
the ready signal held back six seconds: turning points alternate 0.74 ↔ 1.16
every ~630ms and keep going.

`reverse` on the loop rather than a plain repeat: it plays out **and back**, so
the square draws in and opens again instead of snapping to full size to start
over.

Both write through one `paint()` that reads the pair, because neither owns the
element's transform alone — the turn comes from the load, the scale from the
beat, and whichever moved last has to compose with wherever the other stands.
That shared reading is also what makes the dots exact: a second spring aimed at
`1 / s` would be its inverse only at the ends of its travel and about 1% out in
the middle; `s` and `1 / s` read from the same sample cannot disagree.

**It comes to rest square to the frame.** A whole number of turns, and the beat
settles to its own size rather than wherever the loop had got to. The turn is
what marks time passing; where the shape stops is a composition, and a diamond
at rest reads as a shape that was interrupted.

> [!danger] Returning `null` is not unmounting
> The curtain hid itself with `if (released) return null` and left the page
> locked for good: the element goes, the **effects stay**, so the cleanup that
> released the scroll lock never ran on the one path that always happens. Unlock
> on the state change as well as in the cleanup.

---

## ADR-0113 — A floor cannot be written in the unit the system scales, and the band needs a landscape window

**Status:** Accepted · 2026-09-06 · corrects ADR-0109

Two mistakes in ADR-0109's tablet answer, and the second was hidden behind the
first.

**The floors were in `rem`, and this app re-bases the root font-size.**
`GRID_BREAKPOINTS` scales `html`'s font-size per breakpoint — measured, the root
is **13.03px** at 834px wide, not 16. So `--frame-body: max(0.8125rem, 1.1111vw)`,
written to mean "never below 13px", delivered **10.6px**; the 44px control came
out at 35.8; nav labels at 12.2. Every floor was 81% of its promise, and it was
worst exactly where floors are the whole point.

A floor's one job is to stop scaling. Writing it in the unit the system scales
by is self-defeating, and `px` is the only unit in this file that means what it
says. ADR-0109's claim that "the tablet range needs no separate layout, only
this" was never actually tested — the floors it rested on were not in force.

**And with the floors working, the band does not fit.** The design's bottom
group is two, three or four things **side by side**, which is a shape a
landscape window has. At 834x1112 the type is now 51% larger than the layout was
drawn for and it collides: the summary runs into the button, the claims into the
statistics. So the stacking rule is no longer a width — it is
`(max-width: 1179px) and (max-aspect-ratio: 1/1)`, a `stacked:` custom variant.

That is the honest question. A 834x1112 tablet is far closer to a phone than to
the design; a **landscape phone** at 844x390 is almost exactly the design's own
1.8 aspect and should keep the band, which a width rule could never give it.
1179 is the ceiling because past it the design's `vw` type has caught up with
the floors and nothing is being stretched.

> [!warning] This no longer matches `deviceTier()`'s 768, and that is correct
> ADR-0109 called it a virtue that the layout breakpoint and the scene tier were
> one number. They ask different questions — "does the bottom band fit across
> this window" and "how much can this GPU do" — and they were the same number by
> coincidence. Do not re-align them.

---

## ADR-0112 — A scene that draws letterforms cannot take the usual pixel-ratio clamp

**Status:** Accepted · 2026-09-06 · corrects ADR-0110, amends the tiering of ADR-0072's era

ADR-0110 raised the ink atlas because the painted headings were stepped on a
phone. The atlas *was* too small, and raising it changed nothing visible — which
should have been the tell. The atlas was never the limit.

**The framebuffer is the type's resolution.** The screens' display type is
painted into the scene (ADR-0083), so whatever the canvas renders at is what the
letters are. `clampedPixelRatio` put the mobile tier at **0.85**: measured, a
430x932 canvas on a 2x screen was a **331x717** buffer, every glyph upscaled 2.6x
on its way to the panel. No atlas resolution reaches past that, because the atlas
is sampled *into* that buffer.

The 0.85 came from sound reasoning about the wrong scene: soft-lit model, grain
hiding the upscale, a third of the fragments saved invisibly. All true of soft
shapes. This scene draws **letterforms**, a one-device-pixel rule, and a
wireframe of thin lines — and the project's own 3D guidance already says not to
go below 1.0 when a scene has hard edges or crisp text in the shader. That rule
was there and was not applied.

Mobile is now clamped at **1.25**, the same ceiling the desktop tier uses. It
costs 2.2x the fill of 0.85; the tier's 30fps budget is unchanged and is what
pays for it.

> [!note] ADR-0110's atlas boost stays, and is now doing something
> At 1.25 the framebuffer would be the limit again if the atlas were still
> rasterised at the framebuffer's scale. The two together — atlas at 2x CSS,
> buffer at 1.25x — mean neither is the one throwing detail away.

> [!warning] The general lesson
> A pixel-ratio clamp is a fill-rate decision, and it is safe exactly to the
> extent that nothing in the scene has an edge that has to land on a pixel.
> Check what the scene actually draws before reusing a number from one that
> drew something else.

---

## ADR-0110 — Glyph coverage is not fill, and a measured row beats a computed one

**Status:** Accepted · 2026-09-06 · extends ADR-0083, ADR-0081, ADR-0109

Two of the phone's faults turned out to be the same mistake made twice: a number
that is right for one situation being reused in another where it means something
else.

**The painted headings were stepped, and the pixel ratio was to blame for the
wrong reason.** The ink atlas was rasterised at the *framebuffer's* scale — the
device pixel ratio after `clampedPixelRatio` has had it, which on a phone is
**0.85**. That clamp is a good decision and stays: it is a fill-rate decision,
and this scene's field costs ~22 noise evaluations a pixel. But glyph coverage
is not fill. The letters are drawn **once** into a canvas and sampled forever
after, so their cost does not scale with the frame rate at all — painting them
at 0.85 and showing them on a 3x screen was throwing away detail for a saving
that was never being made.

So the atlas has a scale of its own (`sceneConfig.stageInk`): at least 2 device
pixels per CSS pixel, capped so neither dimension passes 4096. The boost lifts
the raster and nothing else — the atlas UVs are ratios of boosted quantities so
it cancels there, and the `screen` rect stays in buffer space where it belongs.

**The first screen's rule sat in the middle of the copy.** Its row is a fixed
distance up from the bottom edge, in `vw`. That is exactly right while the
bottom group is a band of the design's own height — and meaningless once
ADR-0109's column makes that height the copy's own. The line landed wherever the
old proportion said, which on a phone was through the middle of the paragraph.

Below `md` the scene therefore **measures** `[data-stage-rule]` — the row of
actions the line belongs above — instead of computing a ratio. The element knows
where it is; the ratio only knows where it used to be. Same instinct as
ADR-0083: when the browser has already laid something out, read it rather than
predict it.

> [!note] The phone has one rule row, not two
> The measured row drives both `uRuleY` and `uRuleImmersedY`. On a wide window
> the two screens put their lines at different heights because their bottom
> groups differ; stacked, every screen's group ends at the same place — above
> the bar — so one row is the honest answer and two would be a difference with
> nothing behind it.

---

## ADR-0111 — Four links become a disc, and that is the one piece of state in the bar

**Status:** Accepted · 2026-09-06 · amends ADR-0109

ADR-0109 stacked the links pill above the call to action because side by side
they want ~420px. Stacking works but spends two rows of a phone screen on
navigation, and it reads as two bars rather than one.

The four links fold into a disc instead: a white circle with three lines, in a
row with the blue action, and the links come out of it when it is asked. They are
still the only navigation the page has, so they are still all reachable — what
changes is that they are not all *shown*.

**This makes `StageNav` a client component, and that is the whole reason.** It
had no state; a disclosure has exactly one boolean. Everything else in the file
is still markup, and the four links are still rendered on the server in both
forms, so a crawler and a reader without JavaScript see them.

The disc carries `data-nav-shell` like the plates it stands among, so it arrives
with them — and being round, the clip animation's floor *is* its shape, so it
simply fades where the plates open. Nothing in `stage-nav-bar.tsx` had to learn
about it.

---

## ADR-0109 — The frame keeps scaling; type and controls get a floor, and the bottom groups stack

**Status:** Accepted · 2026-09-06 · extends ADR-0072

Every screen over the scene is one 1440x800 Figma frame held in proportion by
`vw`. ADR-0072 chose that over the app's adaptive rem grid and it was the right
call — but it was a decision taken about one width, and it turned out to be two
decisions wearing one hat.

**The composition scales; the type cannot.** `vw` is exactly right for where
things sit and how big the display type is: the name, the headings and the
subject read well at 390px because they are enormous. It is exactly wrong for
body copy, small print, nav labels and touch targets, which have floors the
design never had to think about. At 390 a `1.1111vw` sentence is **4px** and a
`3.4722vw` control is 14 — not small, unusable.

So the frame gained a scale: `--frame-body`, `--frame-lead`, `--frame-nav`,
`--frame-control` and friends, each `max(floor, design)`. At 1440 every one of
them evaluates to the design's own number to the pixel — measured 16 / 40 / 18 /
50 against 16 / 40 / 18 / 50 — so the composition it was drawn for is untouched
by construction and not merely by eye. The floors take over one at a time on the
way down, body copy at about 1170px and the control at about 1267.

**That alone is the whole tablet answer.** A tablet is the same composition with
smaller numbers; nothing about it needs a second layout, only type that stops
shrinking.

**The phone needs a second shape.** Its bottom group is laid out *across* the
screen — two, three, four things side by side in a band — and that is a shape
only a landscape window has. Below `md` `StageBottom` gives up its design height
and becomes a padded column in normal flow, and its children drop their
`absolute` and their `vw` widths at the same breakpoint. It is **opt-in**
(`stack`), because a stage whose children have not been through that pass would
have them pinned where the column no longer is.

**`md` is 768, which is what `deviceTier()` already calls a phone.** One number,
so the layout that reflows and the scene that drops a tier never disagree about
where the phone starts.

> [!warning] Both halves of this ADR were corrected by ADR-0113
> The floors were written in `rem`, which this app re-bases per breakpoint, so
> they delivered 81% of their promise at 834px and the tablet claim above was
> never actually in force. And with them working, the band does not fit a
> portrait tablet at all — the rule is `stacked:`, an **aspect**, and it
> deliberately no longer matches 768. Read ADR-0113 with this one.

**Two things the phone changes beyond stacking.** The camera pulls back and
looks below centre (`camera.mobile`), because `fitCamera` fills the tighter axis
and on a portrait window that is the vertical one — the bust ran the full height
and the copy landed on it. And the card is capped at `min(25rem, 84vw)`: the rem
grid re-bases the root font-size per breakpoint, which lands 25rem at about
433px on a 390px screen, so the picture bled off both edges. Width only — the
fold is a vertical mechanism and `seatAt` works in the same rem the band heights
are written in.

> [!danger] Never let a template interpolation abut a class in `className`
> This shipped broken once. `absolute inset-x-0 bottom-0 h-[55.5556vw]` written
> immediately before a `${` in a template literal is not a candidate
> Tailwind's scanner recognises, so the rule is **never generated**. Nothing
> warns: the class is on the element, the stylesheet has no rule for it, the box
> collapses to nothing, and the bottom group of every screen falls below the
> fold — which is exactly how it presented, as "the tablet lost all its copy".
> Build a conditional class list from an array of plain string literals and
> `join(" ")`.

---

## ADR-0108 — The three steps are a progression, and each takes its own window on one published number

**Status:** Accepted · 2026-09-06 · extends ADR-0084, ADR-0107

The process screen is an ordered list — brief, then build, then batch — and it
was arriving as a single event: all three columns took the overlay's own fade, so
they resolved together. That is a state change, not a progression, and it threw
away the one thing the screen has plenty of: the scroll that carries the
photographs past behind it.

**The strip publishes, the columns subscribe.** `applyTurn` already runs per
frame and already writes `--stage-reveal`; it now also writes the **raw** turn as
`--strip-travel`. Each step maps its own window on that number in a `calc()`, so
the whole progression is three CSS expressions over one custom property: no clock
per column, nothing to keep in step, and it survives a re-render because it is
only ever CSS. Exactly the bargain `StageReveal` already made for its units
(ADR-0084) — this is the same trade one level up.

**A window that only rises.** The overlay still owns the exit, fading the whole
layer with `opacity`, so a column never needs a falling edge of its own. Two
things fading the same type on two different clocks is how a handover starts
looking broken.

**The floor is the point.** `StageReveal` gained an optional `floor`: what a unit
is worth before the reveal reaches it. At zero — the default, and what every
other heading on the site uses — type is *not there yet*. Here the design wants
all three columns present from the first frame and the later ones merely faint,
so the reader sees the shape of the screen and watches it ink in. Three headings
popping into being one at a time would read as three screens.

**Two gestures, not two of the same.** The heading resolves letter by letter; the
body only darkens, on a plain opacity ramp lagging its heading by `bodyLag`.
Running the letter stagger and a word stagger together at the same moment is two
flourishes competing for the same attention — one of them has to be the plain
one, and it is the sentence.

---

## ADR-0105 — One rAF, and the writer of scroll goes first

**Status:** Accepted · 2026-09-06 · amends ADR-0009's ticker

Lenis ran a `requestAnimationFrame` loop of its own while every scroll-driven
component ran on the shared ticker. Two loops, and the order between them was
mount order — nobody's decision, and it was the wrong one.

Lenis **writes** `window.scrollY`; `useProgressTrigger` and the scene **read** it
back through `getBoundingClientRect`. Reading first means reading the previous
frame's position: measured, a frame in which the page had already moved 64px
still drew the gallery where it had been the frame before, the whole way down
the strip. Not a stutter with a period — a constant one-frame arrears between
what the page does and what the canvas does, which is what "scrolls unevenly"
turns out to mean when you go looking for it.

`subscribeToTicker` takes a **priority** now (lower runs earlier), the subscriber
list is ordered rather than a `Set`, and `ScrollController` drives `lenis.raf`
from the shared loop at `SCROLL_PRIORITY`. Every frame is scroll-then-readers by
construction.

> [!note] This is also the skill's rule, applied to the one loop that escaped it
> `optimize-3d-scene` §4 says one shared rAF for the whole page. The ticker
> already existed; smooth scroll was simply never moved onto it, because it came
> from the starter rather than from the scene work.

> [!warning] The scroll driver is never throttled
> It passes `() => 0`. The per-subscriber framerate budget exists to let a phone
> draw less; skipping the tick that *writes* the position every reader is
> measured against would starve all of them, not save anything.

---

## ADR-0106 — Parallax is a disagreement on the way in, not a new layout

**Status:** Accepted · 2026-09-06 · corrects ADR-0100

ADR-0100 gave the closing screen depth by having its planes disagree about how
far they had travelled: the copy leads, the painted heading lags. The offsets
were multiplied by `--closing-travel` itself — so they were at their **maximum**
when the panel had landed.

That is the one moment they must be zero. The climb is a few seconds; the landed
screen is where the reader stops, reads, and takes the address. In it the heading
sat 3.8vw below its designed 2.0833vw inset and the copy 3.6vw above its foot —
both drifted in toward the middle of the frame, and that displaced frame was the
block's resting state.

Both consumers use `1 - travel` now. The disagreement is greatest while the panel
climbs and gone when it arrives; the reader's resting view is the design.

> [!note] How this was caught
> By making the browser's own copy of the painted heading visible in red beside
> it. The DOM copy does not move, so any gap between the two *is* the shift —
> the same probe that verified ADR-0100, read the other way: what proved the
> parallax worked also showed it never let go.

---

## ADR-0107 — The gallery's frame outlasts its copy

**Status:** Accepted · 2026-09-06 · extends ADR-0075

The two vertical rules between the process columns were part of `ProcessStage`,
which is the gallery's **overlay** — and the overlay has a window: it arrives
with the cards and is gone before the closing panel climbs, because two screens
of type dissolving through each other is the seam ADR-0075 exists to avoid.

The rules inherited that window and vanished a third of the way down the strip,
leaving the photographs running down a frame with no columns in it. They are not
copy: they are the frame the strip runs in, and they should last as long as it
does.

`CurvedGallery` takes a second slot, `frame`, rendered under the cards and
**never faded**, and the rules ship as `ProcessRules`.

> [!important] A window belongs to copy, not to structure
> Anything structural put in a slot that fades inherits the fade. When something
> should outlast the type it sits with, it needs its own mount, not a different
> number.

---

## ADR-0104 — A hairline is a row, not a distance; and it arrives on its layer's clock

**Status:** Accepted · 2026-09-06 · extends ADR-0081, ADR-0102

Three faults in the scene-drawn rules, one root each.

**A one-pixel line was not one pixel.** `rowAt` returned a real number and
`ruleAt` ramped to zero one row past the half-thickness, so a row landing between
two fragment centres lit **both** at half weight: two grey pixels where the design
asks for one solid one — heavier and softer, and it changed whenever the window
height moved the row by half a pixel. The row is now snapped to a fragment centre
(`Math.floor(row) + 0.5`) and the ramp is written against that snap, reaching zero
at exactly one row out. A hairline is a **row index**, not a position; treating it
as a position is what made it wrong.

**It arrived a whole screen early.** The delivery rule was gated on its scroll
zone, and a zone opens as soon as the deep line begins to cross — measured, it
was saturated at scroll 2900, where the copy that hangs from the rule is still at
zero and does not start until 3050. No threshold on that number can be right,
because it is not the number the screen runs on. It now takes
`uRuleImmersedFade`, written from the delivery **layer's** window — the same
value that fades the copy — so the rule and its lines arrive together by
construction rather than by a tuned constant. The zone stays in the product, but
only to say *which* screen the line belongs to.

**It was chopped by something invisible.** The delivery screen's subject is a word
drawn as open lace. Depth-tested against its *solid* silhouette, the rule vanished
across a region that looks empty and reappeared a long way on. It is now mixed
into the model's own handover as well, exactly as the heading is (ADR-0102), so it
reads continuously across the word. One function, `immersedRuleWeight`, is called
from both the background quad and the model, so the line cannot come out as two
different greys either side of the crossing.

> [!note] Both rules now go through one `ruleAt`
> `stageRuleMask()` had become a character-for-character copy of `ruleAt(uRuleY)`.
> Two copies of a hairline's maths is how the two rules drift apart.

---

## ADR-0103 — The crease cannot be square, because a band cannot turn between two frames

**Status:** Accepted · 2026-09-06 · amends `box.corner` of ADR-0069, closes ADR-0101

The photographs were continuous in every screenshot and still flashed white
strips along the fold **while scrolling**. That difference — static clean, moving
broken — is the whole diagnosis: nothing about the geometry at rest was wrong,
so the fault had to be in how it *changes*.

`seatAt` maps a band's travel along the path to a seat. With `box.corner` at zero
`cornerArc` is zero too, so the turn is not interpolated — it is
`Math.PI / 2` the instant `distance` exceeds `faceHalf`. A band is therefore flat
on one frame and perpendicular on the next. Flat, it covered a full-height strip
of the card; perpendicular, it covers a foreshortened ribbon **above** the crease.
The strip below the crease it used to fill is now covered by nothing: its
neighbour is still flat and starts lower down.

Standing still, whichever gap the scroll happened to leave was usually inside
`bandBleed`, which is why every static check said the tear was fixed. Scrolling,
**every band crosses in turn**, and the gap opens and closes once per crossing —
white strips flashing along the fold, at the rate the reader scrolls.

`corner` is now 1.5rem, about one band against a 28rem card. That is small enough
that the fold still reads as a right angle and large enough that the turn takes
several frames: a band is only ever a few degrees away from its neighbour, so
whatever it stops covering, the neighbour has already tilted to cover.

> [!important] A crease made of discrete bands has a minimum radius
> It is roughly one band. Below that the geometry is not "sharp" — it is
> *discontinuous in time*, and no amount of bleed fixes a discontinuity, because
> the bleed would have to be half a band wide and would then be visible on the
> flat. `corner`, `bands` and `bandBleed` are one system; ADR-0101 has the other
> two.

**How this was settled.** The section behind the cards painted red again — but
this time stepping the scroll in 9px increments across a band boundary and
screenshotting each step, rather than looking at one position. A fault that only
exists between two frames is invisible to any check that samples one.

---

## ADR-0101 — The band bleed is a length, and it reaches both ways

**Status:** Accepted · 2026-09-06 · **supersedes the first draft of this ADR**

> [!warning] This ADR was written once with the wrong diagnosis, and shipped a
> regression. The first draft blamed `bandOverlap: 1.06` for the tear at a card's
> fold and cut it to 1.004. That was wrong twice over: the overlap was not what
> tore the picture, and cutting it *created* a second fault — a hairline at every
> one of the eighteen band seams, right across the photograph. What follows is
> the diagnosis that survived being tested against a coloured background.

A card is eighteen boxes stacked edge to edge, each clipping its slice of the
same picture. Two different seams can open in that, and they need different
cures:

**Rounding, everywhere.** Eighteen boxes do not tile cleanly — each position and
height lands on a fraction of a device pixel and the compositor rounds them
apart. The cure is a bleed, and it must be a **length**: as a multiplier it
scales with the band, so raising `bands` quietly shrinks it toward nothing. At 18
bands, `1.004` came to **0.12 of a device pixel**, which closes nothing at all.

**The crease.** Where the strip turns, the fold quantises to a band boundary, and
the band straddling the crease is snapped whole to one side of it — leaving a
wedge of card missing. A bleed closes this too, but only from the **flat** side:
the folded band's own bleed extends in *depth*, because it has been rotated
ninety degrees, so it adds nothing on screen. That is why the bleed reaches both
ways now, and why it is 0.2rem rather than the one device pixel rounding alone
would need.

**How this was actually settled.** By painting the section behind the cards red
and looking: the seams turned red, which proved they were gaps showing the stage
rather than a discontinuity in the picture, and each change could be judged
against a background that could not be confused with the photograph. Reasoning
about projection had produced two plausible and wrong answers before that.

> [!note] `bandBleed` and `box.corner` still interact
> A rounded corner puts consecutive bands on chords of an arc and opens a wedge
> on the outside of the bend that scales with the corner. If `corner` goes back
> above zero, this number is the first to re-check.
>
> It has: `corner` is 1.5 as of ADR-0103, because a *square* crease turned out to
> be unbuildable from bands at all. 0.2rem still covers the arc at that radius —
> re-checked against a red ground, stepping the scroll a third of a band at a
> time.

---

## ADR-0102 — The delivery screen's rule is drawn by the scene, and the heading shows through the subject

**Status:** Accepted · 2026-09-06 · extends ADR-0081, ADR-0085

Two corrections to the same screen, both about what the depth buffer is for.

**The rule goes under the model.** The **delivery** screen's rule was a DOM span
in the layer *in front* of the canvas, so it ran straight across the chrome word.
It is drawn by the background quad now — the same move the first screen's rule
made in ADR-0081, and for the same reason: the quad depth-tests against the
subject, so anything it draws passes underneath. `ruleAt(y)` takes the row, and
the two rules differ only in which zone weights them and which token colours
them.

> [!warning] One zone, not two — corrected 2026-09-06
> This shipped weighted by `bgZones.y + bgZones.z`, which drew the rule across
> the **wireframe** screen as well. That screen never had a full-width rule: the
> only rules in it are the three short DOM ones down the right column, each
> heading a statistic. The gate is `bgZones.z` alone. Moving a DOM element into
> the scene means inheriting its *scope* as well as its position, and a zone sum
> is the easy place to widen it by accident.

**The heading shows through the subject.** Below the tide line the model's
surface has already been handed to the stage — what the reader sees of it is the
mesh, not a skin — but it still *writes depth*, so the quad was rejected behind
it and the painted heading came out cut in the shape of a body that is not
itself visible. The model's own shader now mixes `stageInk()` into the stage it
dissolves towards, weighted by `sceneZones.y + sceneZones.z`.

The gate matters: on the **first** screen the model is a lit surface and the name
belongs behind it, so the ink is excluded there. This is the same expression as
the rule's, read the other way round — ADR-0081 kept the rule *out* of
`stageColor` because it showed through a model that was still visible; the
heading is put *into* the model's handover because down there the model is not.

---

## ADR-0100 — Depth on the closing screen is parallax, published by the panel

**Status:** Accepted · 2026-09-06

The closing block is four planes stacked flat — ground, name, subject, copy —
carried up by one rising panel. A panel that moves as one piece cannot tell the
reader which of them is nearest, so the block read as a picture rather than as a
space. There is no perspective to lean on here and none is wanted: the only cue
available is the planes **disagreeing about how far they have come**.

So the name lags and the copy leads, with the subject as the anchor between
them — the same order they are stacked in, so the disagreement reinforces the
layering instead of fighting it.

**The panel publishes, the planes subscribe.** `applyRise` already runs per
frame, so it writes its phase to an inline `--closing-travel` on the panel. The
copy is DOM and takes it in a `calc()` transform; nothing new drives it. The name
is **not** DOM — it is a texture the scene paints (ADR-0083) — so its share is a
uniform, `uInkShift`, applied where the ink is sampled.

The scene reads that property back off the panel's **inline** style each frame.
Inline is the whole point: `getComputedStyle` every frame would force a style
recalculation for one number, and the value is written by JavaScript anyway, so
it is there to be read directly. The panel is found once at construction with
`closest("[data-closing-panel]")`, and is null for every other instance.

> [!warning] Corrected by ADR-0106: the offsets are `1 - travel`, not `travel`
> As shipped here they peaked when the panel had **landed**, so the block's
> resting frame — the one the reader stops and reads — was the displaced one.

**The raw phase, not the clamped rise.** The panel lands at `panel.landAt` and
rests for the remainder; using the clamped value would freeze the parallax
exactly where the reader has the most time to look at it.

---

## ADR-0097 — The field moves with the reader, not only with the clock

**Status:** Accepted · 2026-09-06

The tide already drifted on its own clock and leaned to the pointer, but it was
identical at two different points of the runway: a loop playing behind the page
rather than ground being travelled over.

Two scroll-driven terms, kept deliberately different in kind:

- **`uTideScroll` is position.** It slides the noise domain up and across as the
  reader descends. It moves because they move and stops when they stop, which is
  what makes it read as travel rather than as more animation.
- **`uTideSurge` is speed** — the same eased `arc` the stage lines already bow
  on, one reading of "how fast is the reader going" used twice. It opens the
  fire front while they are moving and leaves it alone when they are still.

Adding more *clock* would only have made the field busier; the dynamic asked for
is the reader's own movement, so it is their movement that drives it.

---

## ADR-0095 — The morph's length is three numbers, not one

**Status:** Accepted · 2026-09-06

`stages.morph.to`, `rotation.to` and `spin.from` are **the same instant**: the
bust's revolution hands the axis to the word's exactly when the morph finishes,
or the turn stalls or jumps. Lengthening the morph (0.48–0.64 → 0.44–0.74, from
16% of the runway to 30%) means moving all three, and pushing `text.fill` after
them so the chrome does not begin pouring into a word that is still arriving.

Everything inside the morph — the bust's fade, the sparks, the lattice's late
arrival — is expressed in **morph-local** units and stretched for free. That is
the reason the change is four numbers and not fourteen, and it is worth keeping
that way.

ADR-0030's alignment survives: one revolution across `rotation` still puts the
untextured back at half a turn, now at 0.37, which is below the tide line and
drawn as wireframe.

---

## ADR-0093 — The seam is a handover, so the two screens must not overlap on it

**Status:** Accepted · 2026-09-06

The first screen's two layers left on one window, and the tide climbs from the
**bottom** — so the copy along the bottom edge was still at half opacity when the
blue had already covered it, and being DOM in front of the canvas it drew *over*
the field. Two screens visible at once, which is what made the seam look broken.

The halves now leave at different times, each ahead of the line that is coming
for it: the copy by 0.12, the name at the top by 0.26. The name keeps the slow
exit it was given for a reason — it is being covered rather than replaced — and
nothing is ever drawn over the blue.

---

## ADR-0091 — The pointer is a lamp on the immersed stages, not a mark

**Status:** Accepted · 2026-09-06

Below the tide line the model is a mesh and a cloud of points, and it read as one
even sheet of light — nothing to look *into*. The mesh and the sparks are now
held back to `pointerGlow.dim` and lifted to `lift` (over 1, so it reads as a
highlight) within a radius of the cursor.

**Screen space, unlike the brush.** The mark on the first stage is painted *onto*
the surface and travels with it; this is a light being held up to the model and
must not turn with it. Hence `gl_FragCoord` and a screen-space radius rather than
object-space points.

**The dim holds when the cursor leaves; only the lit patch goes.** Fading the
whole effect out on leave restored the model to full weight, which made leaving
the canvas look like turning a light on. The lamp's *position* travels off-frame
instead, so the model stays quiet and the patch simply departs.

**And it is gated on `(hover: hover)`, not on the tier.** Holding a model back
only makes sense where there is a cursor to lift it with; without one the model
would be dark for good, which is a worse picture than the one this replaced.

---

## ADR-0089 — The scroll-driven turn is a follower, not a mapping

**Status:** Accepted · 2026-09-06

`scrollTurn` was progress mapped straight onto an angle, so the model stopped
dead in the same frame the reader did — a heavy object with no mass. It is now a
critically-damped follower (`motion.turn`): progress sets a target, and the angle
integrates towards it, carrying a little past where the scroll left it and
settling. The target stays absolute and only the velocity is integrated, so
dropped frames cost speed and never position.

---

## ADR-0086 — One navigation bar for the middle of the page

**Status:** Accepted · 2026-09-06

The pill and its call to action were rendered inside the immersed, delivery and
process overlays, so each copy inherited that overlay's window: the bar faded out
and back in at every screen change, three times over. It is one object in the
design; three of them cross-fading reads as flicker, not as navigation.

`<StageNavBar>` renders it once, fixed to the viewport, over a band measured from
the layout rather than guessed: from one viewport down — the end of the first
screen — to where the gallery's closing plane begins to climb, which is
`runwayViewports - riseStartViewports` up from that section's bottom. A
`<ProgressTrigger>` over exactly that band reads 0 until its top reaches the top
of the screen and 1 once its bottom reaches the bottom, so "strictly between 0
and 1" *is* "after the first screen and before the closing one".

The arrival is a rise, not a fade: the bar comes up from under the fold with its
links filling in behind it, so it reads as coming to meet the reader rather than
as something that was always there. Springy going up, flat coming down — leaving
should not draw attention to itself.

---

## ADR-0084 — The painted type resolves letter by letter, in the scene

**Status:** Accepted · 2026-09-06 · builds on ADR-0083

The name arrives and leaves one character at a time, in a scrambled order, on
opacity alone. Measured off the reference rather than guessed: twenty-four
characters, a **730ms** spread of start times, about **500ms** each, and no
translate or scale at any point — sampled per character through the entrance.
What makes it read as type *resolving* rather than sliding in is that the eye
cannot predict which letter lands next.

**Why it is not `spring-text-engine`.** The project's rule is that text animation
goes through the engine, and here it cannot, for two independent reasons. The
name is not DOM any more — it is a texture the scene paints (ADR-0083), so there
are no letter elements to animate. And the engine's two scroll-driven modes
measure their own element against the viewport, which does not move while the
stage is pinned; the only mode that takes an external value is `manual`, which
is a hard rule against. The engine's stagger is also strictly sequential, and
this effect is not.

So it lives where the type lives. The texture holds the line drawn once; a
`uInkChar` array holds one entry per character — where it starts across the
texture, and how much of it is showing — and the shader folds over it to find
which letter a fragment belongs to. Baking the fade into the texture instead
would mean redrawing and re-uploading it every frame of the transition.

**The order is a hash of the index, not `Math.random`.** The effect wanted is
unpredictability *within* one arrival, not a different line on each. A heading
that resolved differently the second time would read as a glitch.

**Two drivers, multiplied.** `entrance` is a one-off `SpringValue` that runs when
the scene is ready; `window` is the layer's own place on the runway. Neither
knows about the other, and the scene turns whichever product it is handed into
the per-letter stagger — so the arrival on load and the departure on scroll are
both lettered, from one piece of code. Measured at **1300ms** for the entrance
against the reference's ~1400ms.

> [!warning] `onChange` is handed the animation **result**, not the number
> `(result) => result.value`. Read as though it were the number it yields `NaN`,
> which clamps to nothing — the symptom is type that never arrives at all, with
> no error anywhere. Cost two builds to find; the compiler names it if you let it.

---

## ADR-0083 — The display type is rasterised by the browser and painted by the scene

**Status:** Accepted · 2026-09-06 · completes ADR-0081

ADR-0081 moved the rule into the scene and left the name exposed: as a DOM layer
behind the canvas, the pointer's mark wiped the letters as it passed. The layering
this screen needs is **mark → name → model**, and one canvas over one DOM layer
can only express two of those three.

So the name goes into the canvas too — but *not* by restating it there. The
element keeps its place in the document, its `vw` type and its colour; the
browser lays it out and rasterises it as it always did. The scene then reads the
element's box, font and colour, draws the same glyphs into a canvas texture, and
hides the original. One attribute is the whole contract: `data-scene-ink`.

Painted by the background quad, the order falls out for free: the quad is
depth-rejected by the model, so the subject occludes the name; and the quad draws
the ink after the mark, so the mark passes underneath it.

**Why not the obvious alternatives.** Moving the name in front of the canvas
protects it from the mark and stops the model covering the middle of the word,
which is the composition. Compositing the canvas with a blend mode cannot
distinguish the name from the subject. A keep-out mask instead of ink leaves a
fringe wherever the texture and the DOM's own antialiasing disagree.

**Three things this has to get right, each of which cost a round.**

- **The font must have loaded.** `resizeSurface` paints, so `document.fonts.ready`
  is awaited ahead of it in `load()` — otherwise the fallback face is baked in.
- **The element is a sibling of the canvas, not a child of its container.** The
  scene is given the pinned stage as `overlayHost` to look in.
- **The layer's window has to reach it.** The painted copy is not inside the
  element being faded, so `fadeLayers` pushes the value through
  `setInkOpacity`. Left to the stage zones alone the name hung at the top of the
  screen until the tide line finally climbed over it — long after the screen it
  belongs to had gone.

The DOM element is only hidden once a texture exists, and gets its opacity back
on dispose: whatever fails, the browser's own copy is what the reader is left
with.

---

## ADR-0081 — The first screen's rule is drawn by the scene, not the DOM

**Status:** Accepted · 2026-09-06 · supersedes ADR-0080

ADR-0080 said the mark could not paint the page's ground because it would wipe
the UI behind the canvas, and left the mark inside the silhouette. That was the
right call about the *name* and the wrong one about the **rule**, which is not
text and does not need to be DOM at all.

Three requirements meet on this screen, and only one arrangement satisfies all
three:

1. the rule runs **behind** the model, so the model interrupts it;
2. the pointer's mark paints the ground, not just the subject;
3. the model's dissolve at the foot reads as **transparency**.

As a DOM layer behind the canvas the rule satisfies (1) and defeats (2) and (3),
because both of those are opaque canvas pixels over it: the mark wiped the line
as it passed, and the model's dissolved footprint — opaque ground colour all the
way down, alpha 255 measured — wiped it across the subject's whole width.

**So `stageColor` draws it**, after the mark and weighted to the first stage.
Then all three hold at once, and (3) comes for free: an opaque model mixing
towards a stage that *contains* the line is pixel-for-pixel what a transparent
model over that line would look like. No material had to become transparent —
which matters, because that would put the model in the transparent pass, stop
the background quad being depth-rejected behind it, and pay for the tide field
over the subject's whole footprint every frame.

`ModelSceneOptions.stageRule` gates it: every instance shares the shader, and
the closing screen's still instance would otherwise paint a line across the
accent block.

**Two details that cost a round each.** `vw` is the viewport *including the
scrollbar*, and the canvas is narrower by exactly that — measuring the frame off
the drawing buffer put the line two pixels above the row the copy is laid out
from. And a 1px line centred between two rows must be solid to its
half-thickness and feathered only past it, or it resolves as two grey rows
instead of one black one.

**The name stays DOM and stays exposed.** The mark still wipes the letters where
it crosses them. The only fix is to draw the name in the scene too, which costs
the crisp type and the `vw` scaling the whole screen is built on — not worth it
until it is actually seen to be a problem.

---

## ADR-0080 — The mark stays inside the silhouette, because the UI is behind the canvas

**Status:** Accepted · 2026-09-06 · supersedes part of ADR-0078

ADR-0078 gave the background quad the mark's alpha on the white stage, so the
shape carried on past the model onto the page's ground. It was asked for, it
worked, and it had to be undone.

The name and the rule are **DOM layers behind the canvas** — that is what lets
the model cover the middle of the word, which is the composition of the first
screen (ADR-0072). An opaque mark painted by the canvas therefore wipes them as
it passes: the reader drags the pointer across the name and the letters go.

There is no layering that gives both. Putting the title in front of the canvas
protects it from the mark and loses the model covering it. Recovering it above
the canvas needs the model's silhouette as a CSS mask, which WebGL cannot hand
to the compositor per frame. Drawing the title inside the scene would make the
ordering free — mark, title, model, all in one canvas — at the cost of the
crisp DOM type and the `vw` scaling the whole screen is built on.

So the quad is transparent on the white stage again and the mark is what it was:
the model's alone. The alternative that *would* let it cover the block is a mark
that **darkens** rather than lifts — dark type stays legible through a multiply
— which is where this started before white was asked for.

---

## ADR-0078 — The mark holds a live head, and lifts instead of shading

**Status:** Accepted · 2026-09-06

Four changes to the pointer's mark, one of which is a real bug fix.

**The head follows the pointer at every speed.** `Brush.add` dropped any
movement shorter than `minStep` outright. That threshold exists for a good
reason — without it a slow drag burns the whole ring on one spot and the trail
loses its tail — but dropping the movement froze the *leading end* of the mark
while the tail went on decaying, and then advanced it a whole step the instant
the threshold was crossed. At speed it is invisible; move the pointer slowly and
the mark walks forward in ticks.

The ring now holds **committed points plus at most one live head**. Every
sighting of the pointer rewrites the head slot in place; only a full `minStep`
of travel commits it and starts a new one. So the shape follows the pointer
continuously while the points behind it are still laid down at even spacing —
the two things the old code had to choose between. `head` steps past the live
slot so stroke order, and with it the taper, still starts at the true tail.

Measured against the old code, 60 frames of a drag at a twentieth of a step per
frame: **57 stalled frames and 2 jumps of a full step** before, **0 stalls, 0
jumps, and 60 frames of exact tracking** after — with the ring still growing to
only 6 points, which is the spacing `minStep` was protecting.

**The mark lifts what it covers to white, rather than shading it.** New
`--scene-mark` token, read into `uMarkDisplay`, and `stageColor` mixes towards
it instead of scaling the ground down. One token for the model's shader and the
background quad both, because a mark that changed colour at the silhouette would
read as two shapes meeting at an edge rather than one passing over.

**And it no longer stops at the silhouette.** The background quad was fully
transparent on the white stage — deliberately, so the title behind the canvas
shows through — which also meant the mark could not paint the ground at all: it
was clipped to the model. The quad now carries the mark's own alpha there.

> The consequence is deliberate and worth stating: the mark paints over
> **everything** behind the canvas, the `<h1>` included, so passing the pointer
> across the name wipes the letters under the shape. That is what "white on the
> whole block" means when the title is a layer behind the canvas — the only
> alternative is putting the title in front, which would stop the model covering
> the middle of the word, which is the composition.

**The mesh is the accent blue.** `--scene-wire` moves from black to
`--raw-color-electric-500`, the button's colour — the topology under the mark
now reads as the same system as the call to action rather than as a print
artefact.

---

## ADR-0077 — The closing screen rides on the plane that announces it

**Status:** Accepted · 2026-09-06 · amends ADR-0076

Two decisions collapsed into one here, a colour and a structure, because they
turned out to be the same decision.

**The accent is the electric blue, everywhere.** The closing block was rebuilt
from Figma as blue while the gallery's rising plane was still orange, which
broke the handover outright: the plane's whole job is that the ground the reader
watches arrive *is* the ground they land on. `--surface-accent` now shares
`--raw-color-electric-500` with `--stage-accent`, and `--raw-color-orange-500`
is deleted. Two roles, one primitive, and the block can never drift from the
plane again.

**Then the plane and the block should not have been two things.** Once they were
the same colour, the cost of keeping them separate showed: the plane climbed for
a full phase showing nothing, the runway ended, and only then did the block
carrying the invitation scroll up underneath — **two screens of scroll to arrive
at one screen of content, the first of them empty blue**. The reader pays for a
transition and gets a blank.

So `<CurvedGallery closing>` renders the closing screen **inside** the rising
panel. It tilts and climbs with it, complete from the moment it appears, and the
section below is gone — the page is two sections now, not three. The transition
did not need to be preserved separately; the transition *is* the screen
arriving.

Three details make it work:

- **`panel.landAt` (0.82) ends the climb before the runway does.** Otherwise the
  screen only squares up on the final pixel of the page, and anyone who stops
  just short of the bottom never sees it straight. The remainder is a rest.
- **Landed, the transform is dropped, not written as an identity.** A
  `rotateX(0deg)` still puts the element in a 3D rendering context, where the
  browser rasterises it as a texture — the display type and the WebGL canvas on
  it both go soft. `transform: none` is what makes it crisp.
- **The panel loses `aria-hidden`.** It was decoration; it is now the block that
  carries the invitation, the heading and the address link.

**What this costs.** The scene now mounts inside a transformed ancestor. Sizing
is safe — `ResizeObserver` reports the layout box, which a transform does not
touch — but pointer mapping reads `getBoundingClientRect()`, which during the
climb is the *projected* box, so the hover mark sits slightly off until the
plane lands. Accepted: at rest, where the pointer actually is, the transform is
gone and the mapping is exact.

---

## ADR-0076 — A second scene, standing still, on its own ground

**Status:** Accepted · 2026-09-06

The closing block wants the subject and the pointer's mark and **none** of the
choreography: one screen, the textured model, the hover live, nothing
advancing. Two things had to give for that.

**`ModelViewer` can stand still.** With `still`, it drops the
`<ProgressTrigger>` and the seven-viewport runway and renders one `h-lvh`
stage. Nothing then advances the scene, so the progress it is handed on load —
0 — is the progress it keeps, and the first stage is all it ever shows. The
render loop needed no change: it runs off the shared ticker, not off the scroll
trigger, which is what made this a prop rather than a second component.

**A scene has to be told its ground.** The model dissolves *towards* the stage's
colour at its foot and hands itself over to it under the mark, so an instance
standing on the accent blue and reading `--scene-surface` would smear porcelain
across the block on the way out — the same defect as ADR-0074, arriving by a
different road. `ModelSceneOptions.surfaceToken` names the token; the closing
block passes `--stage-accent`.

**The cost is a second WebGL context**, and it is worth naming. Two contexts,
two copies of the scene's buffers; the GLB and the decoder are HTTP-cached, so
what is paid twice is GPU memory and one more program compile, not the network.
Both are gated the same way — in-view plus tab-visible — so only one is ever
drawing. If a third is ever wanted, that is the point to stop and share one
canvas between blocks instead.

---

## ADR-0075 — Screens are layers on one runway, each with its own window

**Status:** Accepted · 2026-09-06 · generalises ADR-0073

The second screen is the tide stage, and its Figma background is a render of
exactly what the scene already draws there. So it is not a section either — it
is another layer over the same pinned stage, and the pattern is now the page's
shape rather than a one-off:

**one runway, one canvas, N layers, each with a window on the scroll.** The
title's two layers simply leave (out by 0.1 of the runway); the second screen
arrives with the field and goes before the letters (in 0.16–0.24, out
0.34–0.42). Those numbers are read off `stages.tide` and `stages.deep` in the
scene's config — if the stages move, the windows follow, and there is one place
each.

Two things this buys that stacked sections would not:

- **The copy is composited with the scene, not after it.** The title sits behind
  the canvas and the model covers it; the tide's copy sits over the field the
  same shader painted. Neither is possible if each screen owns its own scroll.
- **Nothing is duplicated.** The Figma frames both contain renders of the model
  because that is the subject of both screens; importing those stills would have
  put the same subject on the page twice, which is what the first attempt did.

Every layer is `pointer-events-none` with only its links taking the pointer
back, and every layer is taken out of the flow with `visibility` at zero
opacity — otherwise a screen the reader has scrolled past still eats their
clicks.

---

## ADR-0074 — Only the ground goes transparent, and it goes premultiplied

**Status:** Accepted · 2026-09-06 · corrects ADR-0073

Three defects, all mine, all from making the canvas transparent too broadly.

**The model must stay opaque.** ADR-0073 also turned the *model's* hand-over to
the stage into transparency on the white stage. The pointer's mark and the
bottom fade are both built on that hand-over: under the mark and at the foot,
the model gives itself up to the stage's colour and the wireframe is drawn over
what is left — screen-blended, against it. Hand it over to nothing and there is
nothing to blend with, so both broke at once. The model is opaque again and its
dissolve is a colour again; since the scene surface already equals the page's
ground, that is indistinguishable from dissolving into the page — and being
opaque is what lets the model cover the title behind the canvas.

**The ground must be written premultiplied.** The first attempt at fixing the
above wrote the background quad with straight alpha, and the title behind the
canvas washed out. The context is `premultipliedAlpha: true` and the background
material has **no blending** (`transparent` is false), so what the shader writes
lands in the buffer verbatim: a full-strength colour at alpha 0 still
contributes its colour to the page. `vec4(colour * alpha, alpha)`. This is a
property of the context and the material, not a matter of taste — measured with
`getContextAttributes()`, not guessed.

**The overlay belongs to the first screen, not to the runway.** The layers live
inside a stage pinned for seven viewports, so they sat over the tide and the
letters for the whole scroll. Their opacity is now driven by the same scroll
progress the scene reads, gone by a tenth of the runway and taken out of the
flow with `visibility`.

**The lesson is scope.** "Make the canvas transparent" sounds like one change.
It is three surfaces — the ground, the model, and how the result is composited —
and only the first of them was wanted.

---

## ADR-0073 — The white stage paints nothing, so the title can sit behind the model

**Status:** Accepted · 2026-09-06 · completes ADR-0072

The title screen shipped as a section of its own, above the scene — which gave
the page the same subject twice: a title card with a still of the model, then a
second screen with the live one. It is **one** screen. The design is laid over
and under the scene's own pinned stage.

That needs the name **behind** the canvas, and an opaque canvas cannot have
anything behind it. So the scene's first stage stops painting a ground:

- the renderer takes `alpha: true` and clears to alpha 0;
- the background quad's alpha is `zones.y + zones.z` — opaque under the tide and
  past the third line, **transparent on the white stage**;
- the model's own hand-over to the stage becomes transparency there rather than
  a colour: `gl_FragColor.a = 1 - sceneToStage * zones.x`. Below the tide line
  the field is real and opaque, and the colour mix is still the whole story.

**`--scene-surface` is porcelain now, and must stay equal to `--stage-ground`.**
The model dissolves *towards* that colour at its foot while its alpha drops, so
two different grounds paint a pale smear over the page on the way out. One
ground, two things reading it.

**The overlay must not eat the pointer.** The scene's mark is drawn by hovering
the model, and the copy layer covers the canvas; its frame is
`pointer-events-none` and only the two links take it back. Forget that and the
hover dies silently — nothing errors, the mark simply never appears.

---

## ADR-0072 — The title stage measures itself in `vw`, not in the rem grid

**Status:** Accepted · 2026-09-06

The first screen is one Figma frame, 1440x800, and it was asked to hold its
proportions at any width. The obvious tool was the app's adaptive rem grid,
which pins the root font-size to the viewport — and it was tried first, and it
is wrong for this screen.

**The grid re-bases per breakpoint.** It divides 16px by the *design width of
that range*: 1440 above 1024, then 1024, then 360. That is right for a layout
redrawn at each of those widths, and it is exactly wrong for a layout drawn once
at 1440: below 1024 the same rem value is multiplied against a 1024 base, so the
composition inflates against its own design width. Measured in the preview, the
name overran the stage by a third and clipped at both edges — not a rounding
error, a different scale.

So the stage is measured in **`vw`**: every length is its Figma pixel over 1440,
times 100. One base, the frame's own, at every width. The name spans the screen
by construction, the copy keeps its distance from the edges, and there is not a
media query in the file.

Two consequences worth stating:

- **The stage's height is `55.5556vw`**, the design's 800/1440, not `100lvh`.
  Stretching it to the viewport would stretch the composition inside it. On a
  taller screen it is centred and the ground fills what is left.
- **This is not a licence to abandon the grid.** Everything else on the page is
  laid out at several widths and should keep using it. The exception is for a
  composition that exists at exactly one width and must scale as a whole — and
  when this screen gets a mobile drawing, it should go back to the grid.

**Fonts.** Instrument Serif and Mulish come from Google via `next/font`;
Melodrama is Fontshare, which `next/font/google` cannot reach, so the woff2 is
committed under `src/assets/fonts/` and loaded with `next/font/local`. Same
benefit either way: no third-party request on the critical path, no swap flash.
`--font-sans` is now Mulish rather than the starter's Onest — the design names
Mulish, and the design is the source of truth.

---

## ADR-0071 — The box opens towards the reader, and the crease is square

**Status:** Accepted · 2026-09-06 · amends ADR-0068 and ADR-0070

Three corrections to the strip, each a single decision.

**The box opens towards the reader.** The front face is the far wall, at z = 0
on the perspective plane, and the top and bottom faces run *forward*, out of the
screen. A creased card therefore comes at you, and what shows at the top and
bottom of the frame is the underside of a face passing overhead. Sent the other
way — which is what ADR-0068 built — the strip drains into the distance. That is
the same geometry read backwards, and it reads as the gallery running in
reverse.

The forward run is capped (`box.reach`, 26rem against a 60rem perspective).
Bands on a side face are edge-on and draw almost nothing, but z climbing without
limit takes them through the camera plane, and a plane that reaches the camera
does not disappear — it smears across the viewport. That cap is the price of
opening the box this way, and it is a cheap one: what it clips was invisible.

**The crease is a right angle** (`box.corner` 3 → 0). A rigid card needed a long
corner or it snapped from square-on to edge-on between one seat and the next.
Bands hinge one after another, so the corner can be square — and square is what
the reference shows: a picture that is flat and then abruptly perpendicular, not
one bent round a curve. The arc is still implemented, so a rounded corner is one
number away, but nothing needs it now.

**The face reaches the frame** (`faceHalf` 24 → 28). This one number decides two
things at once, which is why it kept being wrong: how many cards stay square to
the camera, *and* whether there is dead stage between the strip and the edge of
the screen. The viewport is about 32rem from middle to edge, so at 28 the face
runs almost to the edge and the crease lands just inside it — no gap, and the
fold still in view. Smaller leaves an empty band top and bottom; larger pushes
the crease off-screen and the cards look as though they never turned at all.

---

## ADR-0070 — A card is a stack of bands, because a plane cannot bend

**Status:** Accepted · 2026-09-06 · completes ADR-0067 → ADR-0069

Five rounds went into the path the cards travel — circle to box, concave to
convex, the sign of the fold, the length of the corner, the size of the face —
and the complaint never moved: *you are just turning the cards*. It was right,
and every one of those rounds was answering a question nobody had asked.

**A card was one element, and one element can only be rotated.** Whatever the
path, a rigid plane meets a corner and tips over as a whole. What the reference
shows is different in kind: a *single picture* whose surface breaks partway
through — its top band already lying flat on the box's top face while the rest
of it still stands square to the camera. That is not a rotation. That is a
**bend**, and no element that stays flat can do it.

So a card is now a stack of horizontal **bands** (`card.bands`, 14), each seated
on the path at its *own* arc length. On the flat they line up into an ordinary
card; across a corner they hinge one after another and the picture folds. The
bend lives inside the card, which is what was being asked for all along.

Three things that fall out of it:

- **`corner` inverts its meaning.** A rigid card needed a *long* corner or it
  snapped from square-on to edge-on between one seat and the next. Bands hinge
  continuously, so a tight crease costs nothing — and a long one spreads the
  fold over two thirds of a card and reads as a bulge. 9 → 3.
- **Bands must overlap.** Consecutive bands are chords of the corner's arc, so
  they leave hairline gaps on the *outside* of the bend. `card.bandOverlap`
  (1.06) reaches each into the next; the duplicated sliver hides behind it.
- **The image survives the slicing.** Each band clips a full-card-sized wrapper
  shifted up by the bands above it, so `next/image` still serves one optimised
  request per card however many bands it is cut into. The bands are
  `aria-hidden` and the card carries its alt text as an `aria-label`: a reader
  should hear one picture, not fourteen strips of one.

**Cost.** Bands times cards style writes per frame — 112 here. Cheap writes, and
the alternative is an effect that cannot exist.

**What should have happened sooner.** The word in the request was
"загибалась" — *bend* — and later, explicitly, "their own plane". A plane
that bends is not a plane that turns, and that distinction was in the first
description of the problem. Four rounds were spent adjusting a rotation because
the reference *also* showed rotation, and the rotation was easy to measure.

---

## ADR-0069 — The face has to hold three cards, and a static probe to see it

**Status:** Accepted · 2026-09-06 · finishes ADR-0067 and ADR-0068

**The fold was built right and scaled wrong.** With `faceHalf` at 13 the flat
front face was 26rem against a 21rem card, so exactly **one** card was ever
square to the camera and both its neighbours were already deep in a corner. The
strip was therefore always turning and almost never standing — which does not
read as cards wrapping a box, it reads as cards flipping. Every round spent on
signs and convexity was aimed at the wrong thing: the direction was correct from
ADR-0068 onwards, the *proportion* was not.

`faceHalf` 13 → 24: the face now carries the centred card **and both its
neighbours**, three flat, which is the arrangement in the reference. `corner`
12 → 9, so the fold completes 33rem from the middle, just past a viewport that
is about 32rem from middle to edge. That last part is deliberate: a card
finishes turning exactly as it leaves the frame, so what shows at the top and
bottom is a folded card seen almost edge-on — a shallow trapezoid, which is what
the reference shows there. Complete the fold much earlier and a fully edge-on
card sits in open screen drawing nothing.

**The method matters more than the numbers.** Four rounds went by arguing about
a shape nobody could look at: the preview pane composites the running app black.
What broke it open was a **static probe** — a standalone HTML page in `public/`
carrying the same CSS structure and the same seat maths, with the parameters on
the query string. The pane renders static HTML perfectly; it was only the app's
animated canvas that was frozen. Two screenshots showed at once that the fold
worked and that only one card was ever flat.

Reach for that whenever a geometry cannot be seen in the app: a page with no
framework, no animation loop and no scroll engine reproduces the *arithmetic*
faithfully, and arithmetic is what these bugs are made of. The probe was deleted
once it had answered; it is three minutes to write again.

---

## ADR-0068 — The box is convex, or the fold cannot be seen

**Status:** Accepted · 2026-09-06 · corrects ADR-0067

The box was built **concave**, keeping the cylinder's arrangement: reader at the
centre, front face pushed a half-extent away, parent pulling it back. Round a
corner that way, a card travels *towards* the camera — and a card that reaches
the camera plane does not disappear, it blows up across the viewport. So cards
past the corner had to be parked and hidden, and the hiding landed exactly where
the fold completed. The outer cards read as flat because **the part of the fold
worth seeing was cut away**: the strip showed 0 to about 60 degrees and then a
card vanished.

Convex fixes it at the root rather than by moving the cut. The reader is outside
the box, the front face sits at z = 0 on the perspective plane, and every corner
carries a card **backwards**. Nothing approaches the camera, so nothing needs
clipping, clamping or hiding, and a card holds the full ninety degrees in view
before receding along the side face.

Two details that come with the flip:

- **The facing is the negative of the side.** A card above the middle folds its
  top edge away (`rotateX` positive); one below folds its bottom edge away. With
  that sign the other way the strip reads as a tube seen from inside, which is
  what it was.
- **`corner` has to finish on screen.** It sets how long the ninety degrees
  take, and if the fold runs past the top of the viewport before it completes,
  the outer cards look as though they never turned — the same symptom as the
  clipping, from the opposite cause. 16 → 12, so the fold completes 25rem from
  the middle against a viewport about 32rem from middle to edge.

**Method note.** This was caught by reading the transforms back out of the DOM,
not by looking — the preview pane composites black. The numbers said a card was
at 90 degrees and hidden, which is the whole bug in one line, and no amount of
staring at a screenshot would have said it more clearly.

---

## ADR-0067 — The gallery's path is a box, and that costs the single transform

**Status:** Accepted · 2026-09-06 · supersedes the cylinder of ADR-0028

The work strip travelled on a concave cylinder. It now travels round a **box**:
a flat front face, a rounded corner at each end of it, and a side face running
away from the reader. One card sits square to the camera and its neighbours fold
away at a right angle.

**Why an arc could not do it.** A circle bends every card by the same small
amount and none of them squarely — there is no flat run and no corner, so
"square-on in the middle, folded at the ends" is not a shape it can make. The
box has both by construction, and `corner` decides how long the ninety degrees
take.

**What it costs, and why that is fine.** A circle is the same shape from every
angle, which is what let the whole strip move by turning one parent: eight cards
animated by a single `rotateX`. A square has no such symmetry, so each card is
now placed individually every frame from its own **arc length along the path**.
Eight style writes per frame instead of one — nothing next to what it buys, and
the alternative is not having corners at all.

**The path is open, not a loop.** Past the corner a card is edge-on and draws
nothing, but its z would keep climbing towards the camera, and a card that
reaches the camera plane does not vanish — it blows up across the viewport. So
cards past the corner are parked at its end and hidden. Nothing is lost: they
were invisible from the moment they turned.

`faceHalf` and `corner` are the two numbers that matter. The face decides how
much of a card stays square to the camera (26rem against a 21rem card, so one
sits flat with a little room); the corner decides whether the fold reads as a
fold at all — too small and a card snaps from square-on to edge-on between one
seat and the next, so the strip reads as cards vanishing rather than turning.

---

## ADR-0066 — The line bends with the scroll, not with the pointer

**Status:** Accepted · 2026-09-06 · corrects the driver of ADR-0065

The bow reached the right object last round and still had the wrong cause. It is
the **scroll** that bends the stage line: bowed while the reader is travelling
through the section, dead straight the moment they stop. The pointer has nothing
to do with it — it grazes the model, while the line is the ground arriving, and
the ground arrives because the reader is moving through the page.

`trackLineBow` measures the change in scroll progress per second and eases it,
where it used to measure the pointer's velocity in NDC. `stages.bowSpeed` (0.4
of the whole runway per second) sets what counts as fast; the runway is seven
viewports, so that is a brisk flick of about three screens a second, and an
ordinary wheel notch bends the line a little rather than throwing it.
`bowResponse` is 0.16s rather than the pointer's 0.11 — a wheel arrives in steps,
and a shorter constant lets that stepping show as flutter.

Still **speed, not acceleration**, for the reason ADR-0059 gave and which
survives the change of driver intact: acceleration is zero through the middle of
a long steady scroll, which is exactly where the line should be deepest.

A side effect worth having: the bow no longer needs a pointer, so it exists on
touch as well, where there is no hover at all and the reader's only input *is*
scrolling.

---

## ADR-0065 — The bow belongs to the stage line, not to the pointer's mark

**Status:** Accepted · 2026-09-06 · corrects ADR-0059

"Make it not just a straight line — have it bow upward under acceleration and go
straight at a full stop." The straight line in question is the **stage line**:
the horizontal boundary where the white ground gives way to the tide field. It
was read as the pointer's mark, and the bow was built there — wrongly, and then
tuned, re-normalised and amplified across five further rounds, all of it on the
wrong object.

The bow is now where it was asked for. `lineMask` lifts the line by half a sine
across the viewport — pinned at both edges of the screen, rising in the middle —
with the amplitude driven by pointer speed and zero at rest. Both stage lines
take it, from one uniform, so the model and the background quad cannot disagree
about where the ground changes. The mark's own lift is gone; `brush.arcHeight`
is deleted and the amplitude lives at `stages.bowHeight`.

`trackArc` survives unchanged and still measures **speed** rather than
acceleration, for the reason ADR-0059 gave: acceleration is zero through the
middle of a fast constant swipe, which is exactly where the curve should be
deepest.

**What is worth keeping from this.** The request named its object plainly — "a
straight line" — and the mark was never straight; it is a tapered ribbon that
follows a hand. There was a clear signal that the reading was wrong, available
before a line was written, and five rounds of tuning a bow nobody could see went
past it. When a description does not fit the thing it is supposedly about, that
mismatch is the message.

---

## ADR-0064 — Back to the screen-space outline, and what three failures taught

**Status:** Accepted · 2026-09-06 · reverts ADR-0061, ADR-0062 and ADR-0063

Three rounds tried to give the mark an **orientation** — to make it read as
turning with the hand rather than sliding — and each one made the outline worse
than the round before. All three are reverted. The noise that shapes the
boundary is sampled in **screen space** again, which is the last state anyone
called smooth.

They failed for one shared reason, and it is worth writing down because the
instinct that produced them was not wrong.

**The stroke is a polyline of heavily overlapping capsules, so no coordinate can
be inferred from which capsule a pixel is nearest.** The radius is many times
the spacing; a dozen or more capsules cover every pixel.

- Measured against a segment's own axis, a lateral coordinate jumps wherever the
  stroke bends, because the axis it is measured against has rotated — a seam at
  every bend, worst on a fast drag where the path is recorded in longer, sharper
  steps (ADR-0062).
- Read off the capsule holding the maximum, an arc coordinate jumps between
  segments far apart in the stroke on the smallest movement of the pixel, since
  which of a dozen near-equal candidates wins is not a stable function of
  position (ADR-0063).
- Averaged over the candidates it stops jumping and starts smearing, which
  trades a hard defect for a soft one.

A screen-fixed field has none of those failure modes: it is continuous
everywhere by construction. What it cannot do is turn. **That is the trade this
mark now makes** — an orientation it cannot hold, for an outline that never
tears — and it is the right way round, because a tear is a defect and a missing
rotation is only a missing flourish.

**If it is revisited, the fix is not another coordinate.** It is to give the
stroke a real **arc length**, accumulated on the CPU as points are recorded and
carried per point into the uniform, so the shader never has to infer a position
along a curve from whichever piece of geometry it happens to be nearest. That is
a change to what the ring stores, not to how the mask reads it, which is exactly
why none of the three shader-side attempts could have worked.

**The other lesson is about the loop.** All three were written and shipped
without once seeing them move: the preview pane was hidden for every round. Each
defect in this mask has been invisible in a still frame and obvious in motion.
Three blind rounds in a row on a perceptual quality is not iteration — it is
guessing, and it produced three regressions.

---

## ADR-0063 — An argmax cannot carry a coordinate through overlapping capsules

**Status:** Accepted · 2026-09-06 · fixes ADR-0062

The outline was still tearing, in hard steps, and worse than before the previous
fix. The arithmetic says why, and it is a nastier version of the same class of
mistake.

The radius is many times the spacing — 0.42 of the model's radius against 0.055
between points — so **every pixel is covered by roughly fifteen capsules at
once**. The arc coordinate that the noise is sampled at was read off the single
capsule holding the maximum. Among fifteen heavily overlapping capsules of
different radii, which one holds the maximum flips between segments that are
*far apart in the stroke* on the smallest change of pixel position. So the
coordinate jumps by whole segments across an invisible boundary, and the outline
steps.

It got worse in exactly the round that made the ribbon thicker, which is the
tell: more overlap, more capsules in contention, more switching.

**An argmax is not a coordinate.** It is stable only where one candidate clearly
dominates, which is the opposite of the situation here. The arc position and the
side are now a **weighted mean** over every covering segment, the weight being
the segment's own field value cubed — the nearest ones carry the answer, the far
ones only keep it from stepping as they hand over. The mean is continuous by
construction; nothing switches.

`field` itself stays a plain maximum, which is correct: the mark's *extent* is a
union, and a union is a maximum. Only the coordinate needed averaging.

---

## ADR-0062 — The outline varies along the arc, and nowhere else

**Status:** Accepted · 2026-09-06 · fixes ADR-0061

ADR-0061 moved the outline's noise into the stroke's frame, which was the right
direction and the wrong construction. The frame had two axes: **along** the
ribbon, and **across** it, the lateral coordinate measured against the winning
segment's own axis. That axis rotates from one segment to the next, so wherever
the winning segment changes on a bend, the lateral coordinate **jumps** — and
the outline tears along the seam. It was worst on a fast drag for a reason that
is not a coincidence: the path is recorded in longer, more sharply turning steps
there, so the seams are both bigger and more frequent.

**The lateral axis is gone.** The noise is sampled at the **arc position alone**
— one coordinate, running monotonically from tail to head, with nothing in it
that can jump. What the noise describes is now the ribbon's **width at each
point of its length**, which is the one thing a drawn stroke actually varies,
and it rotates with the stroke by construction because arc length is a property
of the stroke and of nothing else.

The two edges are kept from swelling together by sampling one noise row per
**side** — the sign of the lateral offset, never its magnitude. A sign flips
only on the ribbon's centreline, which is deep inside the mark where the field
is far above the threshold and nothing can show.

`uMarkSpacing` goes with the lateral axis: the arc coordinate is normalised by
the ring size rather than converted to pixels, so a stroke carries the same
number of undulations along its length however fast it was drawn.

**The taper was the second half of the tearing.** At `taper` 0.08 the tail's
radius is a twelfth of the head's, so the field there falls from 1 to 0 across a
handful of pixels and a wobble of ±0.3 chops it into pieces. `taper` 0.3,
`wobble` 0.22: the noise now perturbs a boundary rather than obliterating one.

---

## ADR-0061 — The outline is sampled in the stroke's frame, not the screen's

**Status:** Accepted · 2026-09-06 · fixes ADR-0056

"It does not turn, it only moves." Exactly right, and it was structural.

The noise that shapes the outline was sampled at `px / uResolution.y` — **screen
space**. The field the noise carves is the stroke, and the stroke moves; the
noise does not. So the undulations were nailed to the display and the ribbon
slid *through* them, re-carved every frame by a pattern that never moved. A
shape with no fixed features cannot read as rotating, because there is nothing
about it that could have rotated. It has a position and nothing else, which is
precisely the complaint.

The mask now builds a **stroke-local frame** from whichever segment claimed the
pixel — longitudinal along the ribbon (segment index plus the parameter along
it, in pixels via `uMarkSpacing`), lateral as the perpendicular offset from that
segment's axis — and samples the noise there. The bumps belong to the ribbon.
Turn the stroke and they go round with it; the mark now has a front, a back and
an orientation.

`uMarkSpacing` is the projected distance between consecutive stroke points, one
number per frame from the CPU. It exists so the two axes of that frame are in
the same units: a longitudinal coordinate counted in segments and a lateral one
counted in pixels would have made the noise stretch along the stroke by whatever
ratio happened to hold that frame.

**Also**: thicker, `radiusRatio` 0.3 → 0.42.

**The pattern across ADR-0057, 0060 and this one** is one mistake wearing three
coats: a quantity measured against the wrong frame of reference. Life instead of
stroke order; ring index instead of live index; screen space instead of stroke
space. None of them is visible in a still frame. All of them are obvious the
moment the thing moves — which is the argument for driving an interaction rather
than screenshotting it.

---

## ADR-0060 — Measure the stroke over the live span, and let go continuously

**Status:** Accepted · 2026-09-06 · fixes ADR-0057 and ADR-0059

Two complaints, one root each, and both were arithmetic rather than taste.

**"It moves strangely behind the cursor."** Everything measured along the
stroke — the taper and the bow — was normalised as `k / (size - 1)`, over the
**whole ring**. But the ordered array is mostly empty until the ring fills, and
the live points sit at its *end*. A six-point stroke therefore occupied only the
last fifth of that range: its taper was flat (the whole thing sampled near 1),
and its bow was half a sine sampled near pi — almost nothing, and lopsided. Both
then changed character as the ring filled, so the mark behaved differently
depending on how long it had been drawn. That is the strangeness: not a wrong
shape, a shape that kept changing what it was.

Both are normalised over the **live span** now, so a short stroke and a long one
are the same shape. It is the sort of bug that only shows as "feels off",
because nothing about any single frame is visibly wrong.

**"It freezes for a second and then disappears."** Literally true. A point's
weight was `smoothstep(0, tailFade, life)` with `tailFade` 0.3 — which is 1 for
every life above 0.3, so the mark stood at **full strength for 70% of its
lifetime** and then went out inside the remaining 30%. `tailFade` is 1 now:
the weight decays across the whole life, with no plateau to freeze on. The width
also carries a life term, so the mark narrows as it goes instead of standing at
full size until it vanishes.

**The lesson is about which quantity a shape is measured against.** Twice now
this mask has been driven by a number that was *nearly* the right one — life
where stroke order was meant (ADR-0057), ring index where live index was meant
here. Neither is visible in a still frame; both are obvious the moment the thing
moves.

---

## ADR-0059 — The stroke bows with the hand, and the mark is the first stage's alone

**Status:** Accepted · 2026-09-06

**The bow.** A stroke that follows the pointer exactly is a rendering of the
path, not of the gesture. It now arches upward while the pointer is moving and
settles flat when it stops — half a sine along the stroke, so both ends stay
pinned (the head under the cursor, the tail where it was laid) and only the
middle lifts.

Two decisions inside that, and both are the reason it works:

- **Speed, not acceleration**, despite the ask being phrased as acceleration.
  Acceleration is *zero* through the middle of a fast constant swipe, which is
  exactly where the curve should be deepest; it is non-zero at the moment you
  stop, where the curve should be gone. What reads as accelerating to the eye is
  simply a stroke that is moving against one that is not.
- **Applied at projection, never baked into the recorded points.** If the bow
  were part of the position, a stroke would keep whatever curve it was drawn
  with, and "straight at a full stop" would be impossible without rewriting the
  ring. Displacing at projection time means the same stroke straightens as the
  hand settles — the curve belongs to *now*, not to when the point was laid.

**The mark is the white stage's alone.** Below the tide line the model is
already open and the mesh is carrying the subject on its own; putting the
texture back there in patches read as damage to something that had just been
established, rather than as a reveal. `stageOpen` returns the tide zone
outright now, and `stageColor` weights the ground's shading by the white zone,
so nothing of the mark survives past the first line — not even its shadow on
the field, which would otherwise have been the only trace left of it.

**Also**: bigger and shorter-lived — `radiusRatio` 0.21 → 0.3,
`lifetimeSeconds` 1.1 → 0.7. The mark was reading as slow because it outstayed
the gesture that made it.

---

## ADR-0058 — Segments, not points: a taper and a disc field cannot coexist

**Status:** Accepted · 2026-09-06 · fixes ADR-0057

The tapered ribbon came apart into a **row of separate circles** along its tail,
and the arithmetic says it had to. The mark was a field of discs, one per
recorded point, and continuity depended on consecutive discs overlapping — the
radius had to stay above the spacing. Then ADR-0057 added a taper, which does
exactly one thing: it drives the radius *down* along the stroke. At the tail the
radius reached 0.08 of the head's, about a fifth of the spacing between points,
and the ribbon stopped being a ribbon.

Turning the spacing down to suit the tail is not a fix either: continuity would
then cost enough points to make the shader loop absurd, and the mark's length is
spacing times count, so it would come back short.

**A stroke is made of segments.** The mask now walks capsules — the distance to
the segment between consecutive points, with the radius, the weight and
therefore the whole profile interpolated from one end to the other. Continuity
is a property of the construction rather than of the numbers, so the taper can
go as thin as it likes and the spacing can go as wide as the length needs.

Two things fell out of that:

- The ring has to reach the shader in **stroke order**, oldest first, or
  "consecutive" means nothing. `projectBrush` writes it that way; the ring's
  cursor stays a private detail of the buffer.
- A stroke that ended has to be marked, or the gap between the pointer leaving
  and coming back would be bridged by a bar straight across the model. Points
  carry an `ends` flag; on the wire it is the **sign of the radius**, which
  costs nothing since a radius is never negative.

**Also**: the mark was outstaying its welcome (`lifetimeSeconds` 2.2 → 1.1) and
had gone sleepy — the outline's noise was turned down too far in ADR-0057 while
chasing "simpler". `wobble` 0.2 → 0.3, `noiseScale` 4 → 5.5, `noiseDrift` 0.02
→ 0.07. Simpler was the right instruction; that far was too far.

---

## ADR-0057 — The mark is a tapered ribbon, and the taper comes from order

**Status:** Accepted · 2026-09-06 · extends ADR-0056

The contour was right and the *body* was not: a blob rather than a stroke, the
same width end to end. Three changes, and only the last one is interesting.

**Simpler.** `wobble` 0.42 → 0.2 and `noiseScale` 7 → 4. Fewer, larger
undulations — the outline reads as one shape instead of a coastline.

**Longer.** `points` 24 → 32 and `minStepRatio` 0.022 → 0.055. The ring holds a
fixed number of points, so the span it can cover is spacing times count, and
both were tuned for a mark that was never meant to be long.

**Thinner at the tail, and this is the part worth remembering.** A point's
radius now tapers to `brush.taper` of the head's — but driven by the point's
**place in the ring**, not by its remaining life. The first attempt used life
and barely narrowed at all, for a reason that is obvious once seen: during a
drag every point is young. A stroke a second long spans lives from 1.0 to about
0.55, so the tail came out 60% of the head's width and read as a tube with two
round ends. Order says which end is the tail whatever the clock is doing; life
only says how close the whole thing is to being over.

That is also why `brush.head` exists on the ring buffer. It is not a debugging
detail — the cursor is the only record of stroke order, and the shape depends
on it.

The field's weight still comes from life (`tailFade`, held low), so the mark
thins as it is drawn and dissolves as it dies. Two different jobs, two different
quantities.

---

## ADR-0056 — A smooth field cut by a step: hard edge, curved outline

**Status:** Accepted · 2026-09-06 · supersedes the tessellation of ADR-0055

The mark has to satisfy two things that pull against each other, and the last
three attempts each got one of them:

- The boundary must be **hard** — no gradient across it anywhere. A soft disc
  (ADR-0053) fails this: it is a blur with no shape at all.
- The boundary must be **smooth** — a curve, not a chain of segments. The
  Voronoi tessellation (ADR-0055) fails this: whatever else it is, it reads as
  chopped.

Both at once is not a shape problem, it is a **representation** problem, and the
answer is a scalar field cut by a step. The field is smooth, so its contours are
smooth; the step turns a contour into an edge. Nothing about the boundary is
drawn — it falls out of where the field crosses the level.

The field is the stroke itself: the strongest point covering this pixel, falling
off to its own radius. A slowly drifting smooth noise (`brush.wobble`) is added
before the cut, and that is what stops the outline being a circle.

**The coming-apart survives the change, and for free.** As the stroke's strength
decays the field sinks under the level everywhere at once — but the noise offset
means different places cross it at different moments, so the patch opens holes
and sheds islands rather than dimming. The property ADR-0055 bought with
per-cell thresholds is a consequence of the noise here, with nothing extra to
carry.

**The ground's share of the mark is deeper**: `brush.shade` 0.07 → 0.17. At the
first value it was arguable whether it was there at all on the white stage.

**What the sequence of these entries is really about.** Four attempts, and the
thing that finally settled it was naming the two constraints separately instead
of hunting for a shape that looked right. A boundary is not an object to be
drawn; it is where something crosses a level, and both of its properties are
properties of *what* is crossing and *how sharply*.

---

## ADR-0055 — The mark is a field of cells, and it lets go a piece at a time

**Status:** Accepted · 2026-09-06 · supersedes the disc union of ADR-0054

ADR-0054 got the edge right — hard — and the construction wrong. A union of
discs gives a **scalloped** boundary: every part of it is an arc. Driven again,
the reference's boundary is nothing of the kind. It is made of **straight
segments meeting at corners**, the mark comes apart into separate shards, and
pieces of it vanish while their neighbours stay. Those are not properties a
circle can have.

**So the mark is a tessellation.** Screen space is cut into irregular cells
(one hashed feature point per grid square, nearest wins — a Voronoi), and a cell
is wholly in the mark or wholly out of it. The boundary is therefore always a
cell boundary: straight, angular, and different everywhere. The stroke lights a
cell **by the cell's feature point**, not per fragment, which is what makes the
answer constant across a cell instead of cutting one in half.

**How it lets go is the other half.** Each cell carries its own hashed
threshold, and drops the instant the stroke's remaining life falls below it. The
patch does not dim — it loses pieces, each one hard-edged in the last frame it
exists. That is the difference between this and lowering a mark's opacity, and
it is what "it does not just disappear through transparency" means.

**Screen space, but the stroke is not.** The cells have to be the *same* cells
on the model, on its wireframe and on the ground, or the mark would break at the
silhouette — and a good part of it falls on the ground. So the tessellation is
screen-fixed while the stroke's points stay in **object space**, projected to
pixels once a frame (`projectBrush`, 24 points on the CPU). The mark still
sticks to the surface it was painted on; only the gravel it is cut into is
fixed to the screen.

**The ground takes the mark too.** Inside it the stage sits `brush.shade` down
— a couple of shades, no more. Without it the shape stopped dead at the
silhouette and read as a hole cut in the subject rather than as something
passing over the whole stage. It is applied inside `stageColor`, the one
function both the model and the background quad call, so the two cannot
disagree across that silhouette. Which also means the background quad now needs
`brushDefines()` — it reads the ring like every other material.

**Off the subject the stroke keeps going.** A raycast miss used to end the
stroke. It now falls back to the plane the subject stands in, facing the
camera, so one continuous mark crosses from the model to the ground and back.

---

## ADR-0054 — The mark is a stroke with a hard edge, and ADR-0053 was wrong

**Status:** Accepted · 2026-09-06 · reverses ADR-0053

ADR-0053 replaced the brush with a soft lens and argued that a lens says the
more useful thing. Held against the reference the effect is measured on, that
was simply wrong on the observable facts, and the shape it produced was a blur.

**What the reference actually does**, established by driving it rather than
recalling it:

- Dragging opens a **lobed patch** — the union of overlapping circles along the
  path — not a single disc. The scallops where consecutive circles meet are
  plainly visible along its boundary.
- The boundary is **hard**. There is no gradient across it at any point.
- Holding the pointer still **closes** the patch over a second or two. It is a
  trail, not a state.

All three are properties of a decaying stroke, which is what was there before
ADR-0053 removed it. So it is back: the ring of ageing object-space points, the
union of hard discs, the decay — with the numbers taken from the reference
rather than from the old defaults. The radius is much larger (`radiusRatio`
0.17 → 0.26): what a drag opens should read as a window torn in the surface,
and at the old size the lobes were too fine to see. The rim is a hairline
(`edgeSoftness` 0.03), and it is worth naming what that number controls,
because it has now been got wrong in both directions — 0.35 once, 0.88 under
ADR-0053. **Wide, the disc has no boundary at all: it reads as a blur chasing
the cursor, and the shape, which is what the effect actually is, disappears.**

**The method failure is the point of this entry.** ADR-0053 was written from a
handful of screenshots and an idea about what the interaction meant. One
controlled drag — five pointer positions along a line, screenshot immediately,
no waiting — shows the scalloped hard boundary at once, and would have settled
it before a line of code was written. Reference behaviour is measured the same
way scene brightness is: by driving the thing and looking, not by remembering
it.

**Not reproduced, deliberately.** With the pointer parked in a corner, the
reference's subject still reveals patches of itself on its own, some bounded by
straight lines rather than arcs — an idle dissolve that is a separate effect
from the hover, and probably reads a texture-space mask. Nothing here does that
yet.

---

## ADR-0053 — The pointer carries a lens, not a brush

**Status:** Accepted · 2026-09-06 · replaces the stroke of ADR-0021

The reveal on the first two stages was a **brush**: a ring of two dozen
object-space points, newest overwriting oldest, each decaying over a second and
a half, read by every fragment as a distance field. Moving the pointer left a
stroke behind it.

It is a **lens** now — one soft disc, centred where the pointer is, easing
after it. Same mechanism underneath (`stageOpen` still means "the model shows
its other state here", still inverted on the tide), different statement.

**A stroke says where the pointer has been; a lens says where it is.** That is
the whole argument. The mark a brush leaves is a record: it outlives the
gesture, it accumulates, and the reader ends up looking at their own handwriting
rather than at the model. A disc that follows the hand puts the model back at
the centre of the interaction — you move the glass over the bust and see
through it, and when you take the pointer away there is nothing left to look at
but the bust.

**The edge inverts with it.** The brush's rim was deliberately hard
(`edgeSoftness` 0.07) because a drawn mark without an edge reads as a smudge.
A lens wants the opposite: at `softness` 0.88 almost the whole radius is
falloff, or the circle's rim becomes the subject and the reader watches a shape
instead of what is inside it.

**It is also cheaper, which is a consequence rather than a reason.** The mask is
one distance instead of a loop over `BRUSH_POINTS` per fragment — in the model,
the wireframe, its halo and, per vertex, the sparks — and there is no ageing
array to advance each frame. The `BRUSH_POINTS` define goes with it, so every
patched material now compiles from one fewer piece of configuration.

**The lag is the character, and it is frame-rate independent.** Position and
strength both ease on `1 - exp(-dt / tau)`, not on a fixed fraction per frame,
or the weight behind the glass would change between a desktop's every-tick
budget and a phone's — which is exactly the kind of thing that gets tuned on one
machine and shipped wrong to another.

---

## ADR-0052 — A real bloom, and the colour-space bill that came with it

**Status:** Accepted · 2026-09-05 · retires the glow shell of ADR-0048

**The shell was doubling, and it was always going to.** `glow.scale.setScalar()`
scales about the object's **own origin**, and the word's parts share one origin
at the middle of the mark. For the letters, which sit on it, an 11% scale is a
shell. For the accent, which floats well above it, the same scale is a *shift*
of 11% of its distance from that origin — a second star, displaced up and out.
That is the ghost. A back-face shell can only ever be a shell for geometry
centred on the thing it is scaled about.

**So the halo is a pass now.** `EffectComposer` → `RenderPass` →
`UnrealBloomPass` → `OutputPass`, with the bloom **enabled only while the chrome
is poured** — everywhere else in the scroll it is skipped and the chain is a
render and one blit. The threshold (0.82) is what keeps it off the field: the
tide's brightest colour sits well under it, the chrome's highlights well over.

**The chain cost the whole colour pipeline, and this is the part to remember.**
Three switches a material's tone mapping **off** when the target is a render
target rather than the canvas, because the chain's last pass is supposed to do
it. Half this scene's colour is written past `<colorspace_fragment>` by injected
code — the tide, the wireframe, the sparks, the stage — and those uniforms were
pre-encoded to sRGB precisely because nothing in the material would convert
them. Put a chain in front and `OutputPass` encodes them a **second** time: the
midtones lift and the whole field goes pale, with nothing else in the frame
changed. The fix is to stop pre-encoding (`toDisplay` no longer converts): one
pipeline, one encode, at the end, for injected colour and lit surface alike.

Two smaller bills from the same change. The canvas's MSAA is bypassed the moment
the scene renders into a target, so the composer's own targets ask for
`samples = 4` on the tiers that had antialiasing — the letters are long straight
diagonals and go hard without it. And the chain is **constant**: switching
between a direct render and a composed one mid-scroll would recompile every
program (the tone-mapping define changes) and step the frame's brightness at the
moment it happened, so only the bloom pass is gated.

**The normal perturbation is gone** (`chrome.facet`). It was there because a
slab's coplanar faces reflect one direction and come back as one flat tone, but
it read as dirt on the metal. Without it the faces went dark instead — the room
they mirror is dark — so the reflection carries it now:
`envMapIntensity` 11 → 17. Brightness through the *reflection*, which is what a
metal's brightness is, rather than through a fake surface.

---

## ADR-0051 — The spin axis comes from the asset, not from a bounding box

**Status:** Accepted · 2026-09-05 · amends ADR-0048

`AI.glb` was re-authored with its pivots set deliberately, so the scene now
reads them instead of inferring one. `word-model.ts` captures each node's
**origin** before the node matrix is baked into the positions — which is the
last moment it exists, since a baked transform makes an origin and a centre of
mass indistinguishable — carries it through the same centre-and-fit as the
geometry, and returns it as `WordPart.pivot`. The accent group turns about that.

**Why a bounding-box centre was never the right answer, even when it agrees.**
A pivot is placed; a box centre is where the extremes happen to average out. On
anything not symmetric about the axis — a five-pointed star has one point up and
two down — the two differ and the spin wobbles. On this particular asset they
agree to within 0.1% of the star's width, so the picture does not change today;
what changes is that the axis is now the one the artist chose, and it stays
right if the mark is ever redrawn asymmetric.

**The fallback is the untouched-pivot case.** If the origin does not lie inside
the part's own box, it was never placed — geometry baked out at the world origin
looks exactly like this — and rotating about it would swing the mark around the
whole word. The box centre is the better guess there, so that is what is used.

---

## ADR-0050 — Screen blending never reads alpha, so the halo ignored every mask

**Status:** Accepted · 2026-09-05 · finishes what ADR-0049 could not

**The bottom fade was correct and had no effect.** The mesh over the field kept
ending on a hard cut through four passes of work on the *numbers* — the range,
the landmark, the plumbing — and every one of those was already right. The mesh
is drawn twice: crisp lines in normal blending, and a second copy scaled a hair
larger as the halo. The halo is **screen-blended**
(`OneMinusDstColorFactor` / `OneFactor`), and that equation is

    result = rgb * (1 - dst) + dst

— `gl_FragColor.a` appears nowhere in it. Both passes wrote their weight to
alpha, so on the halo the stage mask, the brush and the bottom fade were all
no-ops: it drew at full strength wherever the `discard` did not fire, and it is
bright enough to be the whole read. The dissolve was happening on the crisp
lines the entire time, underneath a halo that refused to join in.

The halo now folds `wireAlpha` into the **colour** and writes `a = 1.0`. The
sparks had this right already, with the comment to prove it — "additive: the
colour *is* the contribution, so it carries the alpha" — and so does the word's
glow shell. The halo was the one pass that was ported to screen blending
(ADR-0041) without its weight being moved with it.

**The lesson is about which diagnostic to reach for.** Two earlier probes both
came back clean and both were misleading: a **constant** return from
`meshBottomFade` did dim the mesh — because a constant zero trips the
`discard`, not because alpha works — and painting the mask into `gl_FragColor`
showed a perfect gradient, because rgb is exactly the channel this pass *does*
read. A value can reach the shader, be correct in the shader, and still be
discarded by the blend equation. **When a mask has no effect, check the blend
function before checking the mask** — the blend function decides which channel
is even listened to.

---

## ADR-0049 — The mesh starts at the line, and its hem ends above the cut

**Status:** Accepted · 2026-09-05 · retires the mesh band of ADR-0043

**The void under the line was mine.** ADR-0043 gave the mesh its own soft band
across the stage lines so it would not flick on at a razor edge. The band leaves
the mesh at nothing for its whole depth, so immediately below the line — where
the body should simply continue as a net — there was field showing through the
shoulders. The band is **gone**; the mesh reads the crisp `stageZones()` again,
and the texture above the line meets the net below it with no gap.

That it can go is a consequence of ADR-0046: the flare the band was papering
over turned out to be the depth-write release, fixed at its source. A workaround
outlived the symptom it was written for.

**The hem was calibrated against the wrong landmark.** `bottomFade` runs to
`endRatio` of the geometry's half-height — and this asset's lowest point is the
ends of the hair, well below the flat cut across the chest that is the thing
actually needing hiding. Fading out at the hair leaves the cut at nearly half
strength and perfectly visible the moment there is a field behind it instead of
a white ground. The mesh now has **its own end** (`fade.meshEndRatio`, −0.8) as
well as its own start, so it is gone *before* the cut rather than with it.

**How long this took, and why.** Three passes went by arguing from screenshots —
"the fade is not applied", then "the range is wrong", then "the plumbing is
broken". Two cheap shader diagnostics settled it in one step each: returning a
**constant** from `meshBottomFade` proved the value was reaching the alpha, and
painting `vScenePosition.y` straight into `gl_FragColor` proved the input varied
correctly. Both were fine; the numbers were fine; the *landmark* was wrong. When
a value looks like it is not being applied, prove that it is before touching it.

---

## ADR-0048 — Four corrections to the ending, and what each one was really about

**Status:** Accepted · 2026-09-05

**1. The transition's hem was in the wrong place.** Below the tide line the mesh
had a soft band across its *top* — 0.24 of the screen, added in ADR-0043 to stop
it flicking on at the line — and a hard edge at its bottom. That is upside down
against the hero, where the model is solid at the top and dissolves at the
bottom. Two changes: the band drops to 0.05, enough to take the razor off the
line and no more; and the mesh gets **its own, much longer bottom fade**
(`fade.meshStartRatio`, `meshBottomFade`).

The second one is the part worth remembering. The lit model fades towards the
*ground colour*, so a short fade loses it cleanly. The mesh fades towards
*transparency* over a live field, where the same short fade does not read as a
dissolve at all — it reads as the model being cut off. Fading to nothing and
fading to a colour are not the same distance.

**2. The morph assembles now instead of appearing.** Two causes, both fixed:

- Every node travelled on **one clock**, so the cloud left and arrived together
  and had no shape at any moment in between. Each node now has its own window
  (`aDelay`, `text.morphStagger`), ordered mostly left to right with a little
  jitter. The mark builds itself across the frame — the `A` stands while the
  rest is still in flight — which is legible in a way a uniform cloud never is.
- The **edges arrived far too early** (`latticeFadeFrom` 0.58 → 0.82). A lattice
  drawn while its nodes are still travelling is a net of lines between points
  that have not got anywhere, and it buries the one legible thing in the middle
  of the transition: the travelling sparks.

**3. The chrome is a light metal, and the bloom is a shell.** The albedo was a
deep blue (`#2f6fd0`), and **a metal is its albedo** — no amount of reflection
was going to stop it reading as dark glass. It is near-white now.

The halo is a **back-face copy of the word, scaled 11%**, screen-blended, with a
fresnel term for its width. A real `UnrealBloomPass` would mean an
`EffectComposer` and a full-screen chain every frame for a glow around one
object at the very end of the scroll; this is one extra draw. It reads as light
spilling off a solid rather than an outline traced round one because the band is
widest where the surface turns away from the eye.

**4. The mark above the `i` turns on its own axis**, which meant it could not be
merged into the rest — merged, there is no axis to turn it about. `word-model.ts`
returns the asset's **parts**, and the accent is found by geometry (the part
standing entirely above the others) rather than by trusting an exporter's mesh
names.

Its geometry deliberately stays in the word's own space. The chrome's fill level
and the morph's sources are both measured there, and moving the mark into a
local space would have put both out by its offset. The group carries the
compensating translation instead, recomputed with the angle each frame, so a
`rotation.y` turns it **in place**. At angle zero that transform is the identity
— which is what the whole journey runs at, because the spin is held until the
morph completes. A rotation before then would drag the nodes' sources round with
it and bend the journey for no reason.

**Cost.** 5 draws through the bust, 6 while the word assembles, 6 once it is
poured; the gating keeps only one of those sets alive at a time.
`gl.getError()` 0.

---

## ADR-0047 — The word is an authored model, welded by the same pass as the bust

**Status:** Accepted · 2026-09-05 · supersedes the construction in ADR-0037 and
ADR-0038 (their *reasoning* stands and is why this shape works)

**Decision.** The ending's subject is a GLB (`text.modelUrl`,
`public/assets/hero/AI.glb`) instead of letters manufactured from a font. The
effect around it is unchanged: the same lattice, the same junction sparks, the
same journey out of the bust, the same revolution, the same chrome rising
through it.

**What was deleted, and why none of it is missed.** `text-cloud.ts` rasterised a
glyph into a 2D canvas, sampled it on a grid, measured each cell's *coverage*,
snapped the boundary nodes onto the 0.5 isoline so the outline would not
staircase, duplicated the result into a slab and rolled its corners into a
bevel. Every one of those steps existed to **manufacture a 3D object out of
type**. Once the object arrives as one, they are answers to a question nobody is
asking. ADR-0038 keeps the record in case type ever comes back.

**The lattice is still welded by `buildCoarseWireframe`** — the very pass that
builds the bust's own net. That is not a convenience, it is what makes the morph
meaningful: both ends are junctions of the same kind, produced by the same
grid weld, so `sourceFromJunctions` maps like onto like rather than points onto
noise. It also means the asset is genuinely swappable — drop in a different GLB
and the whole ending follows, with nothing to rebuild but the file.

**Three details worth keeping.**

- **The transform is baked into the positions**, not left on a node. The chrome's
  fill level is measured in the geometry's own space (`uWordFillFrom/To`), and
  the lattice is welded from that same geometry, so baking keeps one space for
  all three and spares the shader a matrix.
- **The fit takes whichever of width or height binds first.** This asset carries
  a mark above the `i`, so it is taller relative to its width than a line of type
  — fitted on width alone it would have scaled itself off the top of a stage
  sized for a bust.
- **The solid is the asset itself.** The lattice was welded from it, so the two
  silhouettes agree by construction and the wireframe sits *on* the surface
  rather than near it — which is the only way the fill level reads as a surface
  ending rather than a clip.

**Removed with it**: the `document.fonts.ready` gate in `load()`. It existed
solely because the letters were cut from the document's own face; there is no
font in this path now.

**Measured.** The word's lattice comes out at 5,608 edges and 1,880 junctions,
against the deleted rasteriser's 5,766 and 2,022 — near enough identical, which
is why the look carries over untouched. The finished word draws 3 passes
(40,036 triangles for the solid); `gl.getError()` 0.

---

## ADR-0046 — Releasing the bust's depth is a *visible* act, not bookkeeping

**Status:** Accepted · 2026-09-02 · corrects ADR-0039

**The extra state.** Between the masked, dim mesh and the morph there was a beat
where the model went suddenly and much brighter and its bottom mask vanished.
Measured by reading the framebuffer at a ladder of scroll positions:

| progress | model luminance |
|---|---|
| 0.42 | 140.6 |
| 0.45 | 151.7 |
| **0.485** | **208.7** |
| 0.51 | 204.3 |

A step of **1.37x**, starting between 0.45 and 0.485 — and `stages.morph.from`
is **0.48**. Not a coincidence, and not a coincidence twice: the first two
hypotheses (an edge-on silhouette at 273 degrees, and the bottom fade being
released) both fit that scroll position too. The framebuffer ladder is what
separated them; a screenshot could not have.

**The cause was ADR-0039's own fix.** The word's solid must be depth-tested to
occlude its own back faces, and it forms inside the volume the invisible bust
still occupies, so the bust was told to stop writing depth once the morph began.
But **the bust's wireframe is depth-tested against that same buffer**. The
instant the depth went, the back half of the net stopped being occluded, the
lines on screen roughly doubled, and the model flared — in the last beat before
it faded out, for nothing.

**Decision.** The release is keyed to `uWordFill`, not to the morph. The chrome
starts at `text.fill.from` (0.7), by which time the bust's net has been gone for
a long while — `uBustFade` reaches 0 about a third of the way through the morph,
near progress 0.53 — so the two never overlap. Measured after: 150 at 0.42, 138.9
at 0.485, no step anywhere in the window.

**The lesson, and it is not about this scene.** The depth buffer is **shared
state**. Turning off a write to serve one object silently changes what every
other depth-tested object in the frame can see. ADR-0039 reasoned about the
solid it was fixing and not about the wireframe two lines away that was reading
the same buffer, and the cost showed up three changes later looking like a
lighting bug.

**Also changed, on a wrong hypothesis that happens to be right anyway.** The
bust's mesh no longer releases its bottom fade during the morph — that release
now applies only under `MORPH_FROM`, i.e. to the word. It was not the cause of
the flare, but a bust does have a bottom to dissolve and it should keep doing so
until it is gone; only the word needs out of it, or the fade would shave its
descenders.

---

## ADR-0045 — The field's `glow` is the one mandated value this scene overrides

**Status:** Accepted · 2026-09-02 · corrects the diagnosis in ADR-0044

**ADR-0044 fixed something real and it was not the main cause.** The glow passes
were additive and the background *was* modulating them; screen blending was the
right change and stays. But it did not remove the brightness swing, because the
swing was never mainly in the mesh.

**Measured, properly this time.** `readPixels` on a 9x7 grid over the whole
drawing buffer, sampled after the frame's last pass, at a **completely fixed
scroll**, over 26 seconds:

| | mean luminance of the whole frame | of the model's third |
|---|---|---|
| `glow: 1.0` (as specified) | 66 → 113.7, **1.72x** | **1.94x** |
| `glow: 0.3` | 86.2 → 104.5, **1.21x** | 1.32x |
| shipped (glow 0.3, mesh gain pulled back) | 86.7 → 103.3, **1.19x** | 1.32x |

The scroll never moved. The **entire picture** was breathing by 72%, and that is
what reads as the scene lighting up — not the mesh, which the eye simply blames
because it is the subject.

**Why that term.** `col += light * glow * pow(f, 4.0)` is a quartic amplifier on
the field's own variation. As the fuel scrolls past the threshold the share of
the screen sitting high in `f` changes, and a quartic turns that into a large
change in mean brightness. Nothing else in the field has that kind of gain.

**The deviation, stated plainly.** `glow: 1.0` is one of the values the Kindle
specification said to use exactly and not substitute. It runs at **0.3**. There
is no way to keep both that number and a field that does not pulse — the number
*is* the pulse — so the smaller of the two deviations was chosen: one parameter,
named, measured, and reversible in one edit. Palette, contrast, threshold,
speed, spread and the front's shape are all untouched.

**Also pulled back**: `particles.gain` 2.4 → 1.9 and `wireframe.haloOpacity`
0.22 → 0.16. Those were raised in ADR-0044 to compensate for screen blending and
left the scene brighter overall than before; with the field no longer surging,
less compensation is needed.

**The method note worth keeping.** Two rounds were spent on this because both
were argued from screenshots. Screenshots show *a* brightness; they do not show
*what varies with what*. Holding one variable still (the scroll) and reading the
framebuffer numerically found the answer in one pass. When something "flashes",
measure the whole frame before blaming the object in it.

---

## ADR-0044 — Glow passes screen, they do not add

**Status:** Accepted · 2026-09-02

**Reported as** the model going normal, then bright, then normal again over a
sequence of screenshots. The first instinct — and the first thing checked — was
the scroll: a stage line, a fade schedule, an overlap in the hand-over. It was
none of them. Holding the scroll **completely still** and taking three frames
nine seconds apart reproduces it exactly: the field drifts behind the model, and
the mesh brightens and settles with it. A draw census at three scroll positions
also showed the same five passes throughout, so nothing was being added.

**The cause is the blend mode.** The halo and both spark clouds were
`AdditiveBlending` — `dst + src`, which has no ceiling. How bright a glow
*looks* under it depends entirely on what is already behind, so a bright ridge
of the tide field passing behind the model pushed the whole mesh into saturation
and back out. The scene's own background was modulating its subject.

**Decision.** Screen blending on every glow pass:
`CustomBlending` / `OneMinusDstColorFactor` / `OneFactor`, which is
`src * (1 - dst) + dst`. Over a dark ground it is indistinguishable from
additive; over a bright one the contribution is scaled by exactly how bright the
ground already is. The glow survives, the pumping cannot happen.

**It needed paying for.** Screen also means a pale source over a blue field
barely registers, and the junction sparks went nearly invisible. `particles.gain`
(2.4) multiplies the spark's colour and `haloOpacity` went 0.10 → 0.22 to buy
the look back. A gain above 1 does **not** bring the flashing back: it lets the
sprite's *core* reach white, which is what a point of light should do, while the
`1 - dst` term still governs how much the ground can be lifted.

**The rule.** Additive is right for a glow over a **controlled** background —
black, or something that does not move. Over a live field it is a feedback path
from the background into the subject. Anything glowing over the tide field
screens.

---

## ADR-0043 — The ground's line and the mesh's line are not the same line

**Status:** Accepted · 2026-09-02

**Reported as** the model lighting up abruptly. Traced by stepping the scroll:
the tide line sweeps up, and the glowing net switches on along its one-pixel
edge — fully dark above, fully lit a pixel below.

**The line itself is right.** A hard edge is what the stage change was asked to
be and what it should stay. The mistake was letting **two different events**
ride on it: the ground arriving, which wants a razor edge, and the subject
dissolving into a net, which does not. Sharing one mask made the second look
like a switch being flicked.

**Decision.** `meshZones()` — the same two lines read through a band roughly
three hundred times wider than `edgePixels` — feeds the wireframe and the
junction sparks. The background quad and the model's own surface keep
`stageZones()`, so the ground still arrives on a razor and the texture still
gives way on one.

**The band lies below the line, never above it**, and that is a correctness
constraint rather than a preference. The lines park just off the bottom of the
screen between sweeps (`lineFrom` −0.04), so a band reaching upwards would
still be over the bottom of the screen at rest and would light the base of the
model while the white stage is on. Below the line the mask is identically zero
until the line is genuinely travelling. It also reads better: the surface gives
way at the line and the net materialises a beat behind it, which is a
dissolution rather than a substitution.

**The general shape**, which is the same lesson as ADR-0042 from the other
side: a screen-space mask with a hard edge is a *timing* device, and everything
that reads it inherits that timing. Two things that should happen at different
rates need two masks, not one mask and a tuning parameter.

---

## ADR-0042 — The mesh's weight must not depend on the stage mask

**Status:** Accepted · 2026-09-02 · amends ADR-0035

**Reported as** "a second white mesh appearing bottom-to-top while the model
turns". There is no second mesh: a draw census at that moment shows one line
geometry and one spark cloud, the same ones as everywhere else.

**What it actually was.** ADR-0035 gave the wireframe two immersed weights —
0.85 past the third line, 0.42 on the tide — blended by `zones.y`, so that the
second stage could go to hairlines while the third kept the weight it had been
tuned with. But the third line is a **hard edge sweeping up the screen**, and a
weight blended across it is a weight that arrives bottom-to-top *through the
model*. The halo made it unmistakable: 0.10 above the line, 0.32 below, a 3x
step in the glow. Two plaits of the same net, one climbing over the other.

**Decision.** One weight for both immersed stages: `immersedOpacity` 0.42,
`haloOpacity` 0.10. `tideOpacity` and `haloTideOpacity` are deleted along with
the `zones.y` blends that consumed them, so the seam is structurally impossible
rather than tuned away.

**The general rule, which is the part worth keeping.** The stage masks are
screen-space fields with hard edges — that is their whole job. Anything they
scale becomes something that *sweeps across the picture*. That is right for a
ground colour or for a surface giving way, and wrong for a property of the
subject: the model does not get denser because a line passed over it. Use the
masks to decide **what is drawn**, not **how heavy the same thing looks**.

---

## ADR-0041 — One scene at a time on the canvas

**Status:** Accepted · 2026-09-02

**A canvas element has exactly one WebGL context for its whole life.**
`getContext` hands the same one back on every call, so two `ModelScene`s on one
canvas are not two scenes — they are two `WebGLRenderer`s fighting over one
context. When either is disposed it clears that context's program cache, and the
survivor then draws some materials and not others.

**How two of them came to exist.** The mount effect kept its instance only in
`sceneRef`, and only assigned it **after** `load()` resolved. A teardown during
the load therefore found `sceneRef.current` null and disposed nothing; the
half-built scene stayed alive holding the context, the next mount built a second
one on top of it, and the first disposed itself later — into the second's
context. React's development double-mount produces exactly that overlap on every
page load, and whether the damage showed depended on which load finished first.
That is the "hero is wrong every few reloads and right on the next" the user
reported: a textured bust one time, a bare wireframe the next.

**Measured, not guessed.** A single page load fetched `model.glb` **twice**,
72 ms apart — two scenes, concurrently. After the fix: **one** fetch per
document, across three consecutive reloads, `gl.getError()` 0 and no context
loss.

**Decision.** The instance is held in a local as well as the ref, so a teardown
mid-load has something to dispose. And construction is chained onto a
`teardownRef` promise that resolves only when the previous scene has let go of
the canvas, so the two lifetimes can never overlap. A pleasant side effect: the
discarded mount now sets `cancelled` before the chain reaches the constructor,
so it never builds a scene at all — the double-mount costs nothing rather than
costing a whole second load.

**This was not a dev-only problem waiting to be dismissed.** The overlap is what
development mode makes *reliable*; any remount — a route change back to the
page, a fast refresh, a parent re-keying — reproduces it in production. Guarding
the canvas is the fix, not disabling Strict Mode.

---

## ADR-0040 — The letters get a rolled edge, and the outline is smoothed along itself

**Status:** Accepted · 2026-09-02 · corrects the node threshold of ADR-0039

**The staircase came back, and it was my own regression.** ADR-0039 lowered
`NODE_THRESHOLD` from 0.5 to 0.32 to close the notches in the solid. That admits
nodes whose cells are *outside* the 0.5 contour, and the projection only moves
nodes with an absent neighbour — so a ring of unprojected nodes sat outside the
letter at raw grid positions and became the silhouette. The threshold is back at
0.5, where the contour is.

**The notches were never the threshold's fault.** They were the depth-buffer bug
also fixed in ADR-0039 — the invisible bust writing depth and taking bites out
of the letters. The two were changed in the same pass, so the threshold looked
like it had helped. It had not. **Fix one thing at a time when two candidate
causes are in flight**, or a bad fix rides in on a good one's result.

**The edge is rolled, not chamfered.** A slab extruded straight has two hard
90-degree corners, and on a metal a hard corner is a single hairline highlight —
the letters read as cut from sheet. The corner now turns over a quarter circle
in two flat-shaded segments, which gives that highlight somewhere to travel; the
travelling band is what reads as "rounded" far more than the radius does. One
segment reads as a chamfer, three is indistinguishable from two at any size the
word is seen. The cap is inset by the bevel and the corner rebuilt outwards, so
the **silhouette does not move** — at the widest point of the roll the surface is
back on the contour the nodes were snapped to. 6,056 triangles.

**The outline is smoothed along itself, and the bevel's direction comes from
it.** Snapping each node to the isoline independently leaves the outline very
slightly ragged: the coverage gradient is estimated from four neighbours, so a
node whose cell straddles an awkward part of a glyph lands a little off its
neighbours' line. On a flat lattice that is invisible; on a bevelled edge every
one of them is a nick. Two light passes of averaging along the outline settle
them onto a common curve, by a fraction of a cell — well inside what the snap
already moved them.

The bevel's inward direction then comes from the **outline's own tangent**
rather than from the coverage gradient, because a wobbling bevel direction is as
visible as a wobbling outline and the tangent is far steadier once the outline is
smooth. The gradient is still what decides which of the two perpendiculars points
inwards.

---

## ADR-0039 — The word gets its own stretch of scroll, a second revolution, and a chrome level

**Status:** Accepted · 2026-09-02 · revives the chrome ADR-0036 left dormant

**Decision.** The runway grows from 5 viewports to 7. The two extra are the
word's own: once it has formed it turns a **second full revolution** while
chrome rises through it from the bottom. Every earlier window was rescaled by
4/6 — the pinned length before and after — so the first three stages take
exactly as much actual scrolling as they did.

**Two rotation spans, not one longer one.** The bust's revolution is paced
against the stage lines it has to stay in step with; stretching it to cover the
ending would have slowed that. So `rotation` now ends at `stages.morph.to` and
`spin` picks the axis up there for one more turn. They abut exactly, so the
motion neither stalls nor jumps.

**The word needed a surface, so it got one.** A level rising through a wireframe
is a level rising through nothing. The lattice is triangulated into a solid from
the **same nodes** — cells with four corners give two triangles, three corners
give one — plus front and back faces and a side wall along every edge used by
exactly one triangle. Sharing the nodes is what makes the two silhouettes agree,
which is the only way the wireframe reads as sitting *on* the surface.

**The node threshold dropped to 0.32 while the contour stayed at 0.5.** A node is
projected onto the 0.5 isoline whatever its own coverage, so admitting cells that
are only a third covered does not push the silhouette outward — it just puts more
nodes along it. At 0.5, cells the contour merely clipped a corner from got no
node, the solid had nothing to build a triangle from, and the letters came out
chipped.

**The chrome finally has a surface to sit on**, and two things had to change for
it to read as metal rather than paint.

- **Brightness moved to `envMapIntensity`.** `envBoost` multiplied the *albedo*,
  which pushes F0 above 1 — a surface reflecting more than it receives — and
  still could not brighten an environment that was not bright. `envMapIntensity`
  is per-material, so the word can be a mirror without touching the light the
  bust was calibrated under (`environmentIntensity` 0.32, a fill floor for a
  diffuse material, not a light source for a mirror).
- **The facets.** A slab's front faces are coplanar: they all reflect the same
  direction, and a soft room comes back as one flat tone. Perturbing the normal
  per fragment makes neighbouring facets catch different parts of the
  environment, and that variation *is* the read of chrome on a shape with no
  curvature of its own.

**The same depth bug, in a place I had already fixed it once.** The lattice was
given `depthTest: false` in ADR-0037 because the invisible bust still writes
depth and the word forms inside its volume. The solid cannot do that — it has to
depth-test to occlude its own back faces — so it was getting bites taken out of
the letters along the silhouette of a body nobody can see. The fix is at the
source this time: the **bust stops writing depth** once the morph begins. The
stage quad draws the field over those pixels either way, so the image is
unchanged.

**The fill is a `discard`, not a blend.** A partially transparent metal is not a
half-filled one, it is a ghost. A thin band at the level is brightened, which is
what makes it read as poured rather than clipped. And the scaffold is switched
off outright once the chrome covers the word — its fragments were being
discarded anyway, but its vertices were not.

---

## ADR-0038 — Coverage makes the letters smooth, a slab makes them solid

**Status:** Accepted · 2026-09-02 · extends ADR-0037

**The staircase was in the test, not in the grid.** A node was in or out by
sampling one raster pixel, and a boundary decided one pixel at a time can only
ever fall on a grid line. Each node now measures the **fraction of its cell**
the glyph covers (7x7 samples), which turns the mask into a smooth field — and a
field has an isoline. Boundary nodes are projected onto the 0.5 contour by
stepping against the local gradient exactly far enough to reach it, capped at
0.85 of a cell so the triangles they belong to cannot fold over. Interior nodes
do not move: displacing them would ripple the lattice that is meant to read as
regular.

That is the whole fix, and it is worth naming because the instinct is to reach
for a finer grid instead. A finer grid makes the steps smaller; it does not stop
them being steps.

**The slab is what survives the turn.** The lattice is duplicated at ±depth and
the two copies joined **along the outline only** — struts through the interior
would fill each letter with lines going nowhere, while struts on the boundary
draw the extruded side wall. 1,011 nodes and 2,757 edges become 2,022 and 5,766,
still a fraction of the bust's 4,961 and 15,808.

**The word turns with the scroll, and the two decisions depend on each other.**
ADR-0036 unwound the rotation to land the word square to camera, because a flat
plane caught mid-turn is edge-on and unreadable. With thickness that reasoning
is gone: off square the word reads as a solid object rather than as a sheet of
paper, so the unwind is removed and the lattice stays on the same axis as the
bust it came out of, turning through the same single revolution. The idle sway
comes back with it, for the same reason — it is one object, not a headline
pasted on at the end.

**The word waits for the font.** It is rasterised in the document's own face, so
building it before `document.fonts.ready` sometimes cut the letters from a
fallback system face — same word, different shapes, and nothing in the code to
say which one you got. The await is free in practice: fonts resolve long before
the model finishes downloading.

**A `ResizeObserver` on the container, and a zero is not a size.** The renderer
only re-sized on `window` resize, but the window is not the only thing that
resizes a canvas: a scrollbar arriving as the page grows, a devtools dock, a
zoom change all move the container silently, and the renderer then holds a stale
drawing buffer for the rest of the session — the scene draws into a corner of
it, or at the wrong aspect. That is the shape of "the hero sometimes loads
wrong", and only the container can report it. Separately, `resizeSurface` used
to clamp a zero measurement to 1x1 and *record* it, so a container measured
before layout locked the scene to a single pixel with no event ever coming to
correct it; it now leaves the recorded size alone and waits for a real box.

Both are non-mobile only, matching the existing listener policy
([[optimize-3d-scene]] §13) — though an observer would in fact be safe there,
since the container is `lvh` and a collapsing URL bar does not change its box.

Verified by shrinking the container from script with no `resize` event in
flight: the drawing buffer followed, 1106 -> 750 -> 1106.

---

## ADR-0037 — The word is its own mesh, and the hand-over never shows two of them

**Status:** Accepted · 2026-09-02 · supersedes the morph mechanism of ADR-0036
(its staging — field through the third stage, mesh open for good — stands)

**The per-vertex morph was the wrong shape, and no tuning was going to fix it.**
ADR-0036 dragged the bust's own junctions into letter positions. That drags the
bust's *connections* along with them: a scan's topology is irregular and joined
by whatever its triangles happened to span, so edges that linked two points on a
shoulder ended up spanning from one letter to the next. The result was a
scribble in the rough shape of a word, and — decisively — **there was no way to
open a gap between two letters**, because something was always connected across
it. Stretch-fading the strays (ADR-0036) treated the symptom.

**Decision.** The word is built as its **own regular mesh**: a square grid
sampled against the glyph raster, with a node wherever the grid falls inside a
glyph and an edge only where both endpoints are nodes. Every cell is the same
size, every junction is a grid node, and the space between letters simply has no
nodes in it — the edges break there because there is nothing to connect, not
because anything culls them. 1,011 nodes and 2,757 edges here, against the
bust's 4,961 and 15,808.

**The bust's mesh no longer travels at all.** It stays where it is and fades.
Only the lattice moves, and it moves *inward*: each of its nodes carries a
source on the bust (`aMorph`), ordered by x and then by y within columns, so the
cloud contracts into the letters instead of shuffling. `MORPH_FROM` — a define,
set once at construction, never flipped — is what tells a material which side of
the hand-over it is on and therefore which direction `morphed()` runs and which
fade it reads.

**The fades do not overlap, and that is the point.** The bust's net is out
(`bustFadeEnd` 0.28) before the letters' net is in (`latticeFadeFrom` 0.58); in
between there are only the travelling particles. Verified by draw count: 6
passes in the tide stage, **4 at mid-morph** — model, shadow, quad and the
lattice's nodes alone — and 5 at the word. A frame containing two complete
meshes was the specific thing to remove.

**The offset halo was reading as a second grid.** `haloScale` was 1.007, a copy
scaled a hair larger so the spill fell *beside* each strand; at hero size that
offset is several pixels and what it actually drew was a second net over the
first. It is 1.0 now — coincident, adding light exactly on the line it belongs
to. The junction sparks carry the glow, so the offset had nothing left to do.

**Two gates had to widen with the staging.** The junction sparks were masked by
`zones.y` — the tide zone alone — which put the *letters'* sparks at exactly
zero, since the letters live in the third zone. Both immersed zones now count,
the same fix `stageColor` needed in ADR-0036 and for the same reason. The
lattice's materials also carry `depthTest: false` from construction rather than
toggling it: the word forms inside the volume the bust's geometry still fills
(ADR-0036), and a material flag set once is cheaper and safer than one flipped
on a scroll boundary.

**Not adopted:** a slab of two connected layers for thickness. "Even" and
"regular" won over "thick" — the lattice is a single flat plane, which still
turns in 3D with the scene and lands square to camera.

---

## ADR-0036 — The third stage keeps the field, and the mesh leaves to become a word

**Status:** Accepted · 2026-09-02 · supersedes the third stage of ADR-0028 and
ADR-0032

**Decision.** The black ground is gone. The tide field runs straight through the
third stage, so its line brings no colour with it — what it sweeps is the model
**opening for good**, after which the junction cloud and its edges morph into a
3D "AI model". The brush has no say past that line: putting a bust texture back
onto geometry halfway to a letter would be nonsense, so `stageOpen` returns 1
there outright.

**The chrome is now dormant, not deleted.** With the surface given over to the
field entirely, nothing the chrome computes can reach the screen. It is kept
because the look was asked for and may be wanted back; `--scene-deep` and
`uDeepDisplay` *were* deleted, because unlike the chrome they had no possible
future — the stage they coloured no longer has a colour.

**The word is sampled, not tessellated.** `text-cloud.ts` rasterises the string
into a 2D canvas in the document's own face and samples the opaque pixels.
`TextGeometry` would have meant a typeface JSON plus a loader from
`three/examples`; a canvas needs neither, and a morph target wants a fixed point
*count* rather than a tessellation anyway. The cloud is built to exactly the
junction count, so the correspondence is one-to-one with nothing left behind.
A failure — no 2D context, a font that never loaded — falls back to each vertex's
own position, so `uMorph` moves nothing and the scene keeps the bust. That is
the right failure: a missing font should cost the morph, not the hero.

**Only the junctions are matched; the edges follow.** Each of an edge's two
vertices looks up the destination of the junction it was copied from
(`lineJunction`, from the same weld), so the lattice arrives through the word
instead of coming apart on the way.

**Matching on one axis is not enough, and the error is very visible.** Ranking
both sets by x and pairing rank-to-rank maps left-of-bust to left-of-word but
leaves y scrambled — two junctions a pixel apart vertically fly to opposite ends
of a letter, and the edge between them draws a streak across the whole word. The
pairing runs in two passes instead: rank by x into ~70 columns, then sort each
column by y on both sides and pair within it.

**Three things had to be tuned down as the cloud compresses**, and none of them
are taste:

- **Brightness and size.** The same 4,961 points cover a whole bust and then a
  few letter strokes; additive blending turns that density into a white slab.
  `particles.morphFade` and `morphShrink` are what keep the word legible.
- **Edge weight, by stretch.** Even with the two-pass matching, some edges span
  from one letter to another, and at full weight those few draw straight through
  the counters. The stretch ratio is computed per edge at build time — it needs
  *both* endpoints, which a vertex shader never has — and written to both
  vertices, so an edge that arrives near its rest length stays and one pulled
  five times longer goes.
- **The scroll turn, to zero.** The scene turns a full revolution across the
  runway; a word caught mid-turn is edge-on and unreadable. The unwind takes the
  *shortest* way round, to the nearest whole revolution, never back through the
  ones already travelled — rewinding half the runway would read as the scene
  scrubbing backwards. The idle sway fades with it, because a settled headline
  that keeps rocking reads as a bug.

**The bug worth remembering: an invisible mesh still writes depth.** Past the
third line the bust is not drawn — its surface is entirely the field — but its
geometry still filled the depth buffer, and the word forms as a thin slab near
z = 0, *inside* that volume. The middle of the word was being cut out along the
silhouette of a body nobody could see: "AI" and a fragment survived, four
letters vanished, and the raster was provably correct the whole time. The fix is
narrow — `depthTest` off for the three mesh passes once `uMorph` leaves zero,
and on before that, where the test is doing real work hiding the back of the net
behind the front of the bust.

**Still on the table.** The bust is drawn twice a frame (shadow pass and main)
through the whole of the third stage while contributing nothing. Hiding it would
also hide the wireframe and the sparks, which are parented to it — the fix is a
reparent, and it was not worth risking at the end of this change.

---

## ADR-0035 — On the second stage the net goes to hairlines and the junctions light up

**Status:** Accepted · 2026-09-02

**Decision.** In the tide stage only, the wireframe drops to a hairline weight
and every junction of the welded mesh carries an additive spark. The third
stage's brush-revealed mesh is untouched.

**"Thinner" is not a width, it is a weight.** A GL line is always exactly one
device pixel — `LineBasicMaterial.linewidth` is ignored in WebGL, and there is
no such thing as a narrower one. What made each strand *look* thick was the
additive halo copy: a second pass of the same geometry, scaled a hair larger,
which is the only honest bloom available for 1px geometry (ADR-0032). So the
weight comes down in two numbers, `tideOpacity` 0.85 → 0.42 and
`haloTideOpacity` 0.32 → 0.10, and the halo is the one that matters. Both are
blended by `zones.y`, so they apply to the tide stage and nowhere else.

**The sparks come out of the weld, not out of a second pass over the mesh.**
`buildCoarseWireframe` already computes one representative vertex per grid cell
and copies pairs of them into the line buffer; it now also returns those
vertices, deduplicated, as a `Points` geometry. That is what makes a spark sit
*exactly* on a junction rather than near one — same coordinates, same lift along
the averaged normal, one source of truth. Cells whose every edge collapsed
inside them are dropped, or the cloud would carry points with no lines to belong
to. On this asset that is **4,961 junctions** against 15,808 surviving edges.

**Why the pair is a pair.** Thinning the lines alone would have left a smudge —
the net loses its structure as it loses weight. Lit nodes on hairlines read as a
structure, because the eye takes the bright points as the form and the lines as
what connects them. Neither half of this change is worth shipping without the
other.

**A stock `PointsMaterial`, patched — never a `ShaderMaterial`.** Same reason as
the wireframe: a hand-written `ShaderMaterial` in a scene with shadows enabled
makes the renderer bind shadow samplers against a program that never declared
them, and every draw call in the frame is dropped (ADR-0028's blank-canvas
trap). The sprite itself has no texture — it is a radial falloff read off
`gl_PointCoord`.

**Cost, and the one optimisation that mattered.** Additive sprites are pure
overdraw, so the fragment shader is arranged around getting out early: the
radial `discard` runs first and throws away the quarter of every quad that lies
outside the disc. The larger win was moving `brushMask`, `bottomFade` and
`wireGlow` **into the vertex shader**. All three are functions of the sprite's
single object-space point, so they have exactly one value across the whole quad
— computing them per fragment was not more accurate, only more expensive, and
`brushMask` in particular walks all 24 brush points. That hoist cut the tide
stage's cost over the white stage from ~1.33 ms to ~0.91 ms at a 0.83 Mpx
buffer, measured back-to-back. The stage mask stays per-fragment on purpose: it
is screen-space, and rounding it to the sprite would make the stage line pop
points on and off as it sweeps instead of cutting through them.

The opening screen is unaffected — the sparks are gated by the same
`syncWireframeVisibility` as the two line passes (ADR-0033), so it still issues
**3 draw calls**. The tide stage goes from 5 to 6.

**What is not trustworthy here.** Absolute GPU timings taken later in the same
session drifted upward across identical runs (2.12 → 3.10 → 3.82 ms on the same
white stage), so only the back-to-back pair above is quoted. If the sparks ever
need to be cheaper, `particles.sizeRatio` is the lever and the saving is
quadratic in it.

---

## ADR-0034 — The second stage burns rather than combs

**Status:** Accepted · 2026-09-02 · supersedes the field in [[decisions-log]]
ADR-0031 (the *integration*, which ADR-0031 argues for, is unchanged)

**Decision.** The hero's second stage runs **Kindle** — a fire front creeping
across a field — in place of the line-integral-convolution field that drew
combed strands. Same contract: it is evaluated **inside the scene's own
shaders**, because the background quad and the dissolving model have to arrive
at the same colour at the same pixel. Only the field itself changed, plus its
palette, which moved from a warm ember set to a blue one.

**What makes the front move is not what you would guess.** The front is a level
set of a fuel field, and it advances because the *fuel scrolls past a fixed
threshold* — not because the threshold ramps. A ramping threshold has to wrap
eventually, and a wrap in a fire reads as a seam across the whole stage.
Scrolling the field gives an edge that advances forever and never repeats. If
you ever "simplify" this by animating `TIDE_THRESHOLD`, that is the bug you will
have introduced.

**The pointer is felt, not tracked, and that needed a second follower.** The
field reads two things: the pointer's *position*, which lowers the threshold
nearby so the front bulges toward the hand the way fire leans into a draught,
and its *velocity*, which biases the threshold along x into a wake. The velocity
is not measured — it is the **gap between two poles**, a fast lead node chased
by a slower body. That gap opens while the hand moves and closes on its own a
beat after it stops, so the wake dissolves with no history buffer anywhere.

That rig is kept **separate from the pointer that tilts the model**
(`tideLead`/`tideBody` vs `pointer` in `model-scene.ts`). They answer different
questions — the tilt wants one settled position, the field wants a heading — and
routing the tilt through a two-stage chain would have retuned motion that was
already calibrated. Both tide rates are quoted per 60 Hz frame and converted
against the real delta, so the follow-lag is identical at 60, 120 and 144 Hz.

**Two deviations from the specification, both forced.**

- **No grain.** The spec sets `grain: 0`, so its film-grain term is identically
  zero — and the term is built on an integer hash (`uvec2`, `uint`) that does
  not exist in the GLSL dialect three compiles patched stock materials in.
  Emitting it would not have dimmed a pixel; it would have failed to compile.
  The scene has its own grain on the model regardless (`grainFunction`).
- **`maxDpr: 1` does not apply.** That is a setting for a standalone canvas.
  This field shares a renderer with 1px wireframe lines and a hard stage line
  that alias below 1.25, so the scene's own clamp wins — see ADR-0033.

**It is also markedly cheaper, which was not the point but is worth recording.**
Two fbm walks of three octaves is **6 noise evaluations per pixel** against the
old field's ~22. Measured at a 0.83 Mpx buffer, same machine, same build
settings: the tide stage went **3.47 → 2.22 ms** GPU median and **5.75 → 2.32 ms**
p90. Its marginal cost over the white stage fell from 1.95 ms to 0.47 ms. The
`zones.y > 0.001` early-out that ADR-0031 introduced still stands and still
matters — it is just guarding a smaller bill.

---

## ADR-0033 — The scene pays for what it draws, not for what it might draw

**Status:** Accepted · 2026-09-02

**Context.** The scene grew a full-screen line-integral-convolution field
(ADR-0031) and a second wireframe pass for the glow (ADR-0032), and the site
started to feel heavy. Measured with `EXT_disjoint_timer_query_webgl2` on a
production build, at a 2.13 Mpx drawing buffer:

| Stage | GPU median | GPU p90 |
|---|---|---|
| white (no field) | 2.58 ms | 3.71 ms |
| tide sweeping | 3.43 ms | **15.84 ms** |
| tide full-screen | 3.49 ms | 11.89 ms |
| chrome | 2.80 ms | 3.83 ms |

So the field costs about a third of the frame on top of everything else while
it is on screen, and its tail is three to four times worse than any other
stage's. Four changes follow from that, and one from re-reading the draw list.

**1 — The stage quad is drawn last and depth-tested.** It used to be
`depthTest: false, renderOrder: -1`: painted first, over the whole screen, then
the model painted over it. But the model's own shader computes the *same* field
at the *same* pixels — it has to, to dissolve into it — so every pixel of the
subject paid for the ~22-noise walk **twice**, and one of those two was hidden
underneath an opaque bust. The quad now sits at the far plane with
`depthTest: true, depthWrite: false, renderOrder: 1`, so the depth the model
already wrote rejects it. The image is identical by construction.

**2 — Desktop DPR clamps to 1.25, not the starter's 1.5.** Fill scales with the
square of the pixel ratio, and this scene's fill is a per-pixel noise walk. 1.5
renders 2.25x the CSS pixels; 1.25 renders 1.56x. The reference implementation
of the field caps at 1.0 outright — the floor is 1.25 here because the scene
also draws 1px wireframe lines and a hard stage line, and those alias visibly
below it. Displays at DPR 1 (most desktops) are unaffected either way.

**3 — The wireframe passes are skipped while they can draw nothing.** Above the
first stage line the mesh only appears inside a brush stroke, so on the opening
screen — no scroll, no hover, where every reader starts — every one of its
fragments is discarded. The discard is free; the 31,616 vertices behind it are
not, and they were paid **twice**, because the glow is a second copy of the same
geometry. Gating both on `visible` takes the opening screen from 5 draw calls to
3, and measured 2.34 ms -> 1.52 ms median, 6.78 ms -> 1.92 ms p90 at 0.83 Mpx.

`visible` is the right lever precisely because it changes no define and no
material, so nothing recompiles when the mesh returns. The gate is applied
**after** `prewarm()`, never before: `compileAsync` walks `traverseVisible`, and
hiding the mesh any earlier would leave its program uncompiled and pay the
saving back as a stall on the reader's first hover ([[optimize-3d-scene]] §3.2).

**4 — The shadow map is 1024, not 2048.** The shadow camera is wrapped tightly
around the bust, so 1024 still puts ~1000 texels across the subject — more than
a soft self-shadow under a chin resolves. 2048 re-rasterised 102k triangles into
four times the texels every frame for a difference invisible at hero scale.

**What this does not claim.** The after-numbers were taken at a smaller drawing
buffer than the baseline, because the measuring browser degraded mid-session.
The white-stage figures above are a clean before/after at one size; the tide
stage was unchanged within noise at that size, which is expected — at a small
buffer the scene is bound by the 102k-triangle model (drawn twice per frame,
shadow pass and main) rather than by fill, and the fill wins only get large on
a big screen. None of this was measured on the machine that reported the
problem. See [[changelog]].

---

## ADR-0031 — The tide is a field inside the scene, not a canvas beside it

**Status:** Accepted · 2026-09-02 · supersedes the standalone gradient

**Decision.** The hero's second stage is a live **Tress** field — noise combed
along a flow field — evaluated inside the scene's **own** shaders. It replaces
the flat `--scene-tide` orange. The standalone raw-WebGL2 canvas that briefly sat
behind the accent section (`src/lib/gradient/`, `components/common/gradient/`) is
deleted, and that section is flat `--surface-accent` again.

**Why it cannot be a layer underneath.** Three surfaces have to agree on the
field's colour at the same pixel: the background quad paints it, the model
*dissolves into* it, and the bottom fog fades towards it. A canvas behind the
scene would be invisible anyway — the scene's own canvas is opaque — and one in
front would have to be punched through by the model. Evaluating the field in the
scene's shaders is the only arrangement where the model can melt into exactly the
colour behind it.

**Why it stays affordable.** The walk is ~22 noise evaluations per pixel over the
full viewport, which is why the standalone version capped DPR at 1. Here the
shader skips it outright wherever the tide zone has no weight — and that zone is
a horizontal band, which is the shape a GPU branches on coherently. Measured at
60fps with the field on screen at the scene's own DPR.

**When building.** The palette is one calibrated set of design tokens
(`--scene-tide-*`) walked perceptually — moving one stop alone turns the field to
mud. Every other Tress value is baked into the GLSL as a constant from
`sceneConfig.tideField` at module load: uniforms are for what changes at runtime,
and none of those do. A §0 performance measurement taken outside the tide stage
will read low; measure inside it.

---

## ADR-0032 — The chrome is a metal, and the brush opens the model

**Status:** Accepted · 2026-09-02 · amends ADR-0028

**Decision.** Two corrections to how stage 3 and stage 1 read.

**Chrome.** The albedo ramp was a fresnel-driven **cosine palette** — a rainbow.
That is iridescence: soap film, oil, beetle shell. It is not metal. A metal tints
its reflection by its albedo, so the albedo is what decides *which* metal, and a
liquid chrome wants two stops, not a spectrum: a deep blue on the faces and a
bright sheen at grazing angles, where a real mirror reflects most. That
edge-brightening is the cue that reads as chrome rather than as blue paint. The
ramp is now two tokens (`--scene-chrome-sheen`, `--scene-chrome-deep`) with a
falloff exponent, lifted by `chrome.envBoost` because a mirror under this scene's
deliberately dim IBL otherwise just reads dark.

**The brush on white.** It used to wash the *albedo* toward the stage colour
while the surface stayed lit, which leaves a shaded grey patch — not the white
ground the reader expects to see through the hole. `stageMerge` and `stageReveal`
have collapsed into one `stageOpen`: wherever the mesh is revealed, the lit
surface is gone. `brush.textureRemoval` went with them.

**Also here:** the mesh gained an uneven bloom. A GL line cannot be widened, so
the glow is a second copy of the geometry, slightly larger and additively
blended, held to the stages where the mesh carries the subject. Its brightness is
modulated by a noise in *object* space — bright patches that belong to the model
and turn with it. A uniform bloom flattens the net back into a decal, which is
the whole reason it is uneven.

---

## ADR-0030 — The gallery is a vertical arc, and the turn is timed rather than windowed

**Status:** Accepted · 2026-09-02 · reverses part of ADR-0028

**Decision.** Three changes that belong together:

- **The gallery's cylinder lies on its side.** Cards are stacked vertically and
  the ring turns about the **X** axis, so the strip travels up the screen. On a
  vertical arc it is the card's **height** that must clear the chord between two
  seats, not its width: the axis the cards travel along is the one that can
  collide.

  > [!note] Signs reversed by the concave flip
  > This ADR described the arc as **convex** — card `i` at `rotateX(-i·step)`
  > with the ring turning positively. It is concave now, which reverses both:
  > positive seat angles, negative ring rotation. The reasoning above still
  > holds; only the signs moved. See [[components/common]].
- **The closing panel left the carousel.** It is no longer a card on the arc but
  a full-width plane rising from below, tilted away from the viewer so its top
  edge is foreshortened, unwinding to flat as it lands. It gets its own
  perspective context, which is what lets it tilt independently of the arc and
  paint over it. The section carries **no visible UI** at all — no heading, no
  labels — so the heading survives only as `sr-only`, for the document outline.
- **The model's turn is no longer windowed.** It starts on the first frame of
  scroll.

**Why the window was the wrong fix.** ADR-0028 delayed the turn to keep this
front-only capture's untextured back off screen while the textured stage was
still visible. The real protection was never the delay — it is the *rate*. One
revolution across the runway puts the model's back at half a turn, which lands
at ~50% progress: inside the orange hold, where it is drawn as a wireframe and
has no texture to miss. By the time it comes round again it is chrome, whose
albedo is replaced outright. The delay was solving a problem the timing already
solved, at the cost of a hero that sat still while the reader scrolled.

**When building.** That alignment is load-bearing and invisible: change
`rotation.turns`, or move the stage windows, and the untextured back can drift
into a stage that still shows texture. Re-check the two together.

---

## ADR-0029 — `<SpringTrigger>` does not work; drive scroll motion from `<ProgressTrigger>`

**Status:** Accepted · 2026-09-02

**Decision.** Scroll-driven motion in this project is written from a progress
value delivered by `<ProgressTrigger>`, not by `<SpringTrigger>`. Do not reach
for `<SpringTrigger>` until the defect below is fixed.

**Why.** `useSpringTrigger` applies its values through the **imperative**
`api.start(() => ({...}))` form, and `spring.tsx` already carries a comment
saying that exact form "did not reliably drive the values in this project's
react-spring build (the start call was a no-op)" — which is why `<Spring>` was
rewritten declaratively. `<SpringTrigger>` never got the same treatment.

Confirmed rather than assumed: with a `mode="scrub"` trigger wired to a section
runway, the animated element's inline style read `transform: rotateY(-36deg)` —
its `from` value — at 50%, 62% and 75% of the page scroll. The progress
calculation is fine; the values simply never reach the DOM.

`hooks/animation/` and `components/animation/springs/` are `#do-not-modify`
(hard rule #2), so this is worked around rather than fixed. `<ProgressTrigger>`
is the vault's own sanctioned answer — [[components/animation-springs]] describes
it as emitting progress "to drive custom logic" — and it is proven in this
project: the hero scene's stage lines run off it.

**When building.** Two traps come with writing transforms by hand:

1. **Re-apply after every render.** A transform written to `element.style` is
   not owned by React, so any re-render repaints the element from JSX and throws
   the scroll position away. It surfaces as the animation snapping back to its
   start while the reader is well past it. `curved-gallery.tsx` re-applies from a
   progress ref in an effect with no dependency array.
2. **A trigger element needs area.** The engine gates each trigger's loop on an
   `IntersectionObserver` over that element, and a zero-width box never reports
   as intersecting — the animation freezes with no error. Scroll markers must
   span the full width.

Fixing `useSpringTrigger` properly — declarative `useSpring` values, as
`<Spring>` uses — needs the sign-off that hard rule #2 requires, and would let
this component go back to the documented primitive.

---

## ADR-0028 — Three stages, and the hover inverts between them

**Status:** Accepted · 2026-09-02 · supersedes ADR-0027's two-stage sequence

**Decision.** The scroll moves through three stages, each arriving as a hard line
sweeping up the screen, and the hover means something different in each:

| Stage | Ground | Model | Hover |
|-------|--------|-------|-------|
| 1 | `--scene-surface` white | textured, lit | brush takes the texture off, shows the mesh |
| 2 | `--scene-tide` orange | dissolved into the ground, mesh only | **inverted** — brush puts the texture back |
| 3 | `--scene-deep` black | chrome with iridescent highlights | brush dissolves it, shows the mesh |

**Why the hover inverts.** It is the point of the sequence rather than a
flourish: each stage strips something away, so the gesture that revealed the
mesh on white is the gesture that recovers the subject on orange. One brush, read
three ways. In the shader this is two small functions — `stageMerge` and
`stageReveal` — weighted by the zone, and they differ only on white, where the
brush shows the mesh without dissolving the lit surface beneath it.

**Why the chrome is per-fragment, not a second material.** Metalness, roughness
and albedo are all local variables in three's physical shader by the time
`lights_physical_fragment` runs, so the stage can override them in place. That
keeps one program and one draw — swapping materials mid-scroll would mean a
second compile, a hitch, and two copies of every other stage effect.

**Why the highlights are coloured by replacing the albedo.** Metal tints its
reflection by its albedo, so a fresnel-driven cosine palette written into
`diffuseColor` is what puts colour through the highlights. It has a second
benefit that decided it: this is a front-only capture, and replacing the albedo
outright means the untextured back stops existing as a problem in this stage.

**Why the turn is windowed.** Scroll drives a full Y rotation, but only from
`rotation.from` — after the first line has covered the model. Turning it while
the textured stage is still on screen would swing that untextured black back
into view. By the time it turns, the model is a mesh, and then chrome.

> [!warning] Reversed by ADR-0030
> The turn now starts on the first frame of scroll. The concern above was real
> but the window was the wrong fix — see ADR-0030 for what actually keeps the
> untextured back out of sight.

**When building.** The line's antialiasing rim is specified in **device pixels**
(`stages.edgePixels`), not as a fraction of the viewport: as a fraction it was
~2.5px on a short screen and visibly soft, and the whole point of the line is
that it is a hard edge between blocks. Stage windows have deliberate gaps — a
stage that is only ever mid-transition never gets read.

---

## ADR-0027 — The scroll wave is screen-space, and paints the stage itself

**Status:** Accepted · 2026-09-02 · amends ADR-0025 and ADR-0026 ·
**its two-stage sequence is superseded by ADR-0028** — the four choices below
still stand and ADR-0028 builds on them, but there are three stages now, not two

**Decision.** Scrolling the hero's pinned section sweeps a horizontal line up the
screen. Above it the stage is `--scene-surface` and the model is textured; below
it the stage is `--scene-tide` and the model dissolves into that field, leaving
only its wireframe in `--scene-wire-immersed`. Four choices are worth recording:

- **The line is in screen space**, not object space. It is a field arriving over
  the whole stage, so it must not tilt, drift or scale when the model sways —
  which is exactly what an object-space threshold would do. `gl_FragCoord`
  against the **drawing-buffer** size, not the CSS size: they differ by the
  tier's pixel-ratio clamp.
- **The stage is a fullscreen quad, not the clear colour.** `setClearColor` takes
  one colour and the stage now has two at once. One quad drawn before everything
  else paints both halves; the model draws over it normally. It is a patched
  `MeshBasicMaterial` for the reason in ADR-0025 — a raw `ShaderMaterial` in a
  shadowed scene blanks the canvas.
- **The runway belongs to the client leaf, not the view.** Its length and the
  stages are the same setting (`sceneConfig.stages.runwayViewports`), and splitting
  them across two files would let them drift. The bot path has no tide, so it
  gets no runway — a crawler should not be handed three screens of empty scroll.
- **The wireframe is now built on every tier.** ADR-0026 built it only where
  there was a pointer, because the brush was the only thing that revealed it.
  The tide reveals it too, and the tide is not desktop-only — below the line the
  mesh is the *only* thing drawing the subject. The raycast stays desktop-only;
  it is the expensive half, and the geometry is not.

**Why a pinned runway at all.** The effect needs scroll distance, and the page was
exactly one viewport tall. A `sticky` stage inside a taller box gives the scroll
room without the canvas moving.

**When building.** Scroll progress comes from the starter's `<ProgressTrigger>`
(`start="top top"`, `end="bottom bottom"`), which reads through the shared ticker
— the scene adds no scroll listener of its own, per [[optimize-3d-scene]] §9-10.
Because the scene is now scroll-reactive, the reduced-motion path can no longer
draw one frame and stop; it runs the loop but skips the draw while nothing has
changed.

---

## ADR-0026 — Reveal topology with a grid-welded wireframe, not the real one

**Status:** Accepted · 2026-09-02

**Decision.** The brush-reveal draws a wireframe built by welding the scan's
vertices onto a spatial grid (`src/lib/scene/coarse-wireframe.ts`), not the
mesh's own 306k-segment wireframe.

**Why.** The scan is 101,942 triangles over a subject about 700px tall. Its true
wireframe puts several edges in every pixel: it renders as a dark smudge, and
lowering the opacity only makes it a lighter smudge — the problem is density, not
weight. Welding snaps every vertex to a cell, keeps an edge only where a triangle
spans two cells, and yields the same surface, silhouette and connectivity at a
density an eye can actually read. It is also far cheaper than decimation: one
pass over the index buffer at load, no iterative edge collapse (three's
`SimplifyModifier` on 102k triangles is seconds of main-thread work).

**When building.** `sceneConfig.wireframe.cellRatio` is the readability dial —
smaller is denser. Cell vertices are lifted along their averaged normal
(`surfaceOffsetRatio`) so lines float clear of the surface instead of being
swallowed by it. If a future asset is low-poly enough, drop this and use
`wireframe: true` on the geometry directly.

---

## ADR-0025 — Effects live in the model's shader, not in a fullscreen pass

**Status:** Accepted · 2026-09-02 · amends ADR-0024

**Decision.** Grain, the bottom fade and the brush reveal are injected into the
model's `MeshStandardMaterial` through `onBeforeCompile`
(`src/lib/scene/scene-shader.ts`). The fullscreen grain quad is gone. There is
no ground plane; the key light casts the model onto **itself** instead.

**Why.**

- **Grain** was a fullscreen quad, so it grained the empty stage too. Inside the
  model's shader it costs no extra draw and lands only on the subject, which is
  what keeps the white clean.
- **The bottom fade** dissolves the bust's flat cut by mixing towards the stage
  colour. It has to be applied *after* tone mapping and the colour-space
  conversion: tone mapping does not map 1.0 to exactly 1.0, so fading towards a
  linear white in working space lands a shade off the renderer's clear colour and
  leaves a visible seam. Hence two stage-colour uniforms, linear and display.
- **The brush** needs the albedo wash and the wireframe to agree exactly, so both
  materials share one uniforms object by reference.

**Also reversed here: the normal map is back.** ADR-0024 dropped it because
three derives the tangent frame from screen-space derivatives when a mesh has no
`TANGENT` attribute, and that frame flips across every seam of this atlas.
`geometry.computeTangents()` fixes it at the source, and the micro-relief it
restores is a large part of why the render no longer reads as plasticine — so
`material.dropNormalMap` is gone, replaced by `computeTangents` and
`normalTangentSign`. **The sign matters:** GLTFLoader sets `normalScale` to
(1, -1) to compensate for the *derived* frame. With a real TANGENT attribute the
bitangent sign already comes from `tangent.w`, so that compensation applies
twice, and the doubly-flipped frame tilts every perturbed normal away from the
lights — the model renders as a black silhouette. With computed tangents the
sign is +1.

**When building.** Two traps, both of which produced a *blank canvas* or a black
model rather than an obvious error:

1. A hand-written `ShaderMaterial` drawn into a scene with shadows enabled makes
   the renderer bind shadow samplers against a program that never declared them.
   WebGL reports "mismatch between texture format and sampler type" and drops
   every draw call in the frame. Start from a stock material (`MeshBasicMaterial`
   / `LineBasicMaterial`) and inject, rather than writing a program from scratch.
2. Shadow-camera *range* matters more than the bias values. A near of 0.06
   against a far of 14 spreads depth precision over a range the model occupies
   ~15% of, and every surface then shadows itself: the model goes black except
   where a non-shadowing light rims it. Derive near/far from the light's actual
   distance.

---

## ADR-0024 — Correct the scan's material on load; sway the model, never spin it

**Status:** Accepted · 2026-09-02 · **normal-map decision reversed by ADR-0025**

**Decision.** `src/lib/scene/` normalises the hero GLB's material at load time
(`sceneConfig.material`), and the idle motion is a bounded sine sway rather than
a full rotation.

**Why.** Three properties of the asset make the file-faithful render wrong:

- **`metallicFactor` is absent**, and glTF's default for that is **1.0 — fully
  metallic**. Metal has no diffuse response, so the photographic albedo is
  discarded entirely and the scan renders as bare chrome. Its metalness
  *texture* correctly holds 0, but a texture only scales the factor; it cannot
  rescue a factor the file never set.
- **`roughnessFactor` is 0.5** — wet-plastic territory for skin, hair and cotton.
  The roughness texture measures 245–255 in green (≈1.0), so the factor is what
  does the damage.
- **The mesh ships no `TANGENT` attribute**, so three derives the tangent frame
  from screen-space derivatives. The UV atlas is packed into thousands of tiny
  islands, so nearly every triangle sits on a seam and the derived frame flips
  across each one — a shredded, streaky surface. The geometry already carries the
  detail at 63.5k vertices, so the normal map was buying micro-detail invisible
  at hero size while costing the artefact and ~16 MB of texture memory.

The sway is the same kind of constraint: this is a **front-only capture**. The
back of the mesh has no texture data and renders as a flat black silhouette, so a
full turn would park the hero on that black side for half of every cycle.

**When building.** Corrections live in `sceneConfig.material` behind an `enabled`
flag — set it to `false` to render exactly what the file specifies. A different
asset may need none of this: re-check before assuming. If a future model is a
full 360° capture, raise `idleSwayAmplitude` or restore a continuous turn. See
[[optimize-3d-scene]] and [[components/common]].

---

## ADR-0023 — Vanilla three.js on the shared ticker, not React Three Fiber

**Status:** Accepted · 2026-09-02

**Decision.** The 3D layer is `three` used directly from a plain TypeScript class
in `src/lib/scene/`, driven by the app-wide ticker. `@react-three/fiber` and
`@react-three/drei` are **not** adopted.

**Why.** R3F would bring a second reconciler and its own render loop into a
project that already owns one: ADR-0009's shared `requestAnimationFrame` is the
mechanism that keeps N animated components on **one** rAF, and the
`optimize-3d-scene` skill's frame-budget tiering is implemented as a
per-subscriber throttle on exactly that loop. A scene with its own loop would sit
outside both. The skill's canonical patterns are also all vanilla, so staying
vanilla means the playbook maps onto this code line for line. The cost is writing
the imperative setup by hand — acceptable for a single hero scene, and worth
revisiting if a project grows several interactive scenes.

**When building.** The scene is a `"use client"` leaf behind
`dynamic(..., { ssr: false })` — that boundary is what keeps `three` in its own
chunk so the bot path never fetches it (ADR-0010, hard rule #6). Subscribe to
`subscribeToTicker`; never start a `requestAnimationFrame` loop in scene code.
See [[optimize-3d-scene]] and [[tech-stack]].

---

## ADR-0022 — Track latest within majors; hold TypeScript 7 and ESLint 10

**Status:** Accepted · 2026-08-18

**Decision.** Dependencies track the newest release **within their current
major**. Three majors are deliberately held back.

**Why.** Stale pins hand every new project a migration debt on day one; a broken
toolchain is worse. Each hold was tested, not assumed:

- **TypeScript 5, not 7** — `eslint-config-next` depends on `typescript-eslint@8`,
  whose peer range is `typescript >=4.8.4 <6.1.0`. TS 7 breaks `yarn lint`.
- **ESLint 9, not 10** — ESLint 10 removed `context.getFilename()`;
  `eslint-plugin-react` still calls it, so linting dies on startup.
- **`@types/node` tracks the Node major in use**, not the newest published.

**When building.** The blockers live in someone else's dependency graph, so they
lift without work here — **re-test periodically** rather than treating them as
permanent. [[tech-stack]] carries the table and the reasons. Node ≥ 20.19 is a
hard floor (`engines` + `.nvmrc`): the ESLint toolchain fails to install below it.

---

## ADR-0021 — SEO is a practice with a workflow, not just a metadata helper

**Status:** Accepted · 2026-08-18

**Decision.** SEO and AEO get skills, an audit agent and a documented order of
work ([[seo-aeo]]), not just the metadata utilities.

**Why.** The mechanism existed; the practice did not. Nothing checked whether a
new route reached `sitemap.ts`, whether titles were unique, or whether the site
was legible to answer engines — the fastest-moving part of search and the one
most likely to be skipped.

**When building.** Audit in order: indexability → metadata → content structure →
structured data → performance → AEO. A perfectly optimised page that cannot be
crawled is worth nothing. **AI-crawler policy is the user's decision** — "be
cited by AI" and "don't train on my content" need different bots allowed. Never
cloak, and never emit schema describing content that is not on the page.

---

## ADR-0020 — Payload + Supabase are the CMS and database, added per project

**Status:** Accepted · 2026-08-18

**Decision.** Payload (Postgres adapter) on Supabase are the documented defaults.
**Neither ships in the starter** — the `payload-cms` / `supabase-db` skills
install them when a project needs them.

**Why.** Payload runs *inside* the Next app — admin as a route group, content via
an in-process Local API, types generated from the schema — which matches how this
starter already works (Server Components reading data, passing props down) and
keeps deployment one Vercel project. Supabase covers database, media bucket and
optional auth in one service. Most projects from this starter are marketing sites
that never need either, so an unused install would be a large dependency surface
and a migration story maintained for nothing.

**When building.** [[cms-payload]] and [[database-supabase]] carry the
conventions. Two constraints break installs if ignored: `@payloadcms/next` pins a
minimum Next version (verify before installing), and Supabase's connection
strings are not interchangeable — runtime on the transaction pooler (6543, no
prepared statements), migrations on the direct connection (5432).

---

## ADR-0019 — Hard rules get a mechanical check, not just prose

**Status:** Accepted · 2026-08-18

**Decision.** `.claude/scripts/verify.sh` checks every hard rule that is
objectively decidable from source and exits non-zero on any FAIL. Judgement calls
stay with the `qa-verify` skill.

**Why.** Rules that are never checked decay into suggestions, and silently — a
stray `@keyframes` or hardcoded hex surfaces at review, if at all. `yarn lint`
knows nothing about springs, token tiers or route delegation.

**When building.** Run it after any code change ([[qa-verification]]). It greps
rather than parsing TypeScript, so it is biased toward false positives: a
dismissed warning costs seconds, an unchecked rule costs a review cycle. WARNs
never fail a build, so justify them rather than ignoring them.

---

## ADR-0018 — Split the docs into knowledge (vault) and execution (`.claude/`)

**Status:** Accepted · 2026-08-18

**Decision.** The vault stays the single source of truth for *why* and *what*;
`.claude/` holds *how it runs* — path-scoped rules, skills, agents, commands and
the verify script ([[agent-harness]]). Every skill, agent and command is
registered in the vault.

**Why.** Documentation that cannot be executed gets skipped; execution files
without recorded reasoning drift and duplicate. Keeping each mechanism to one job
avoids both.

**When building.** `.claude/` files stay short and point into the vault rather
than restating it — restated rules drift out of sync. **Path-scoped rules fire
when Claude *reads* a matching file, not when it writes one, and are not
re-injected after `/compact`.** They reinforce; they never guarantee. Anything
that must hold unconditionally belongs in `verify.sh` or a hook.

---

## ADR-0017 — A skill states its preconditions and its own internal conflicts

**Status:** Accepted · 2026-07-24

**Decision.** Every skill must state the environment its measurements assume, and
name explicitly where one of its steps undermines another.

**Why.** `optimize-3d-scene` was run on a real scene and the fix *order* held up
— what cost hours was everything left implicit: a first step that could not be
executed on the stack in front of it, measurements silently invalidated by the
dev server, and two individually correct steps that contradicted each other.

**When building.** When writing or editing a skill: a step names its
preconditions, and a step names where it fights another step. Numbers taken in
the wrong environment are worse than no numbers, because they read as evidence.

---

## ADR-0016 — Skills are registered in the vault, not just dropped in `.claude/`

**Status:** Accepted · 2026-07-24

**Decision.** A skill is only "installed" once it lives in `.claude/skills/<name>/`,
has a vault note under `workflows/`, is linked from [[README]] and
[[ai-agent-guide]], and — if invocation should be non-optional — has a routing
rule in `AGENTS.md`.

**Why.** A skill folder is discoverable to Claude Code at runtime but invisible in
the vault, leaving the invocation decision to model judgement. Where the skill
exists *because the order of operations matters*, that is exactly the wrong thing
to leave to chance.

**When building.** Registration is also when a skill gets checked against reality
— stale paths and references to files that do not exist surface here.

---

## ADR-0015 — Strict three-tier design-token naming convention

**Status:** Accepted · 2026-07-17 · amends ADR-0004

**Decision.** Tokens follow three tiers with an explicit grammar: primitive
`--raw-<category>-<name>[-<shade>]` → semantic `--<role>[-<variant>][-<state>]` →
`@theme inline` binding. Only Tier 1 holds literals; Tier 2 names purpose, never
appearance, and is the themeable layer. No tier may be skipped.

**Why.** ADR-0004 made tokens the styling currency but never said what a token
should be *called*, so every project would invent its own — defeating the point of
a shared starter. The names are predictable across projects by design.

**When building.** Full rules in [[design-system]]. Two Tailwind v4 facts,
verified by compiling a probe stylesheet, that guides commonly get wrong:

1. Naming primitives `--color-*` would **generate a utility for every raw value**
   and let markup bypass the semantic tier — hence the `--raw-*` prefix, kept out
   of `@theme`.
2. **There is no `--duration-*` namespace.** `duration-fast` compiles to nothing.
   Durations stay Tier 2 and are used as `duration-[var(--duration-fast)]`.
   (`--ease-*` *is* real.)

`@theme inline` is load-bearing: `inline` inlines the `var()` into each utility so
Tier 2 overrides cascade. Binding a literal there freezes the value and silently
breaks theming.

---

## ADR-0014 — Narrow CSS-transition exception for trivial state changes

**Status:** Accepted · 2026-07-17 · amends ADR-0002

**Decision.** All real motion stays spring-based, with one exception: CSS
`transition-*` for simple discrete state changes — `hover:` / `focus-visible:` /
`active:` colour, opacity, border, underline, and small decorative nudges.

**Why.** The outright ban cost most where it helped least: a nav link fading its
colour on hover needed a client component and a spring config to animate one
property nobody will interrupt. The rule pushed toward boilerplate or quiet
rule-breaking.

**When building.** Three conditions, all required, or it is a spring:
token-backed timing (`duration-[var(--duration-fast)] ease-entrance`),
`transition-*` only (`@keyframes` stay banned outright), and utilities only —
never a CSS file. Everything scroll-driven, revealing, staggered, orchestrated,
layout-affecting or interruptible remains a spring; text stays [[text-engine]].
The list is enumerated rather than a judgement call ("simple animations") so it
cannot erode into general CSS animation. Past the list, use `<Hover>`.

---

## ADR-0013 — `<Inview>` self-observe fix; spring components honour resize

**Status:** Accepted · 2026-06-07

**Decision.** Second authorised edit to the protected engine: `<Inview>` now
calls its callback ref so it observes itself when no `trigger` is passed, and
`<Inview>` / `<Spring>` / `<Hover>` pass the React-tracked `width` into
`isMobileDisabled(value, width)`.

**Why.** `<Inview>` only animated when given an external `trigger` — the common
case silently did nothing, because a callback ref was being assigned as
`.current` instead of called. Separately the `width` dependency was tracked but
never used, so resize re-evaluation of mobile gating did nothing.

**When building.** The springs folder stays `#do-not-modify` by default — these
were explicitly signed-off bug fixes, not an opening.

---

## ADR-0012 — Styling lives in utilities and components, not `globals.css`

**Status:** Accepted · 2026-05-22 · amends ADR-0004

**Decision.** A strict placement order, first match wins:

| Situation | Goes where |
|-----------|-----------|
| One-off styling | Tailwind utilities in `className` |
| Repeated pattern with markup/structure/props | a **React component** in `components/ui/` |
| Repeated pure-utility combo, no structure | a Tailwind v4 `@utility` |
| Pseudo-elements, 3rd-party overrides, complex selectors | `@layer components` |
| A new colour/spacing/radius value | a token (per ADR-0015) |

**Why.** With tokens in `globals.css` and guidance to extract repeated patterns
into `@layer components`, the path of least resistance made that file a dumping
ground — hundreds of component-specific classes never deleted when their
component was. Splitting the file would only spread the same bloat; the fix is a
placement rule.

**When building.** The default answer to "this looks repeated" is a **React
component**, not a CSS class — an eyebrow label with a `::before` dot is an
`<Eyebrow>`, not a `.label-eyebrow`. `globals.css` holds imports, tokens, base
resets and the narrow `@layer components` exceptions; if it grows past that,
something was misplaced. **CSS Modules were considered and rejected** — a second
styling mechanism is not worth the mental model when motion is spring-based (no
keyframes to co-locate) and utilities plus components cover everything else.

---

## ADR-0011 — API layer: `app/api` route handlers, secrets server-side

**Status:** Accepted · 2026-05-22

**Decision.** External calls go through Next.js Route Handlers at
`src/app/api/<resource>/route.ts`. The handler owns the work — business logic,
upstream calls, filtering, secret env vars. No mandatory passthrough service
layer; extract shared code only when genuinely reused.

**Why.** `route.ts` is never bundled to the browser, so it is the natural place
for secrets, and a single convention keeps every endpoint the same shape.

**When building.** Every endpoint validates input with `zod` and returns the
`{ data }` / `{ error }` envelope via the shared `handle()` wrapper. Secret env
vars are unprefixed and read through `getServerEnv()`; `NEXT_PUBLIC_` is only for
browser-safe values. Client Components fetch same-origin via `apiFetch`;
render-time data is read in Server Components. Full note: [[api-architecture]].
Server Actions were considered for mutations and deferred — revisit with a new
ADR if forms need progressive enhancement.

---

## ADR-0010 — SEO & performance hardening

**Status:** Accepted · 2026-05-21

**Decision.** `src/lib/site.ts` (`siteConfig`) is the single source of truth for
SEO. `metadataBase` is always set; `themeColor` lives on the `viewport` export.
Added `robots.ts`, `sitemap.ts`, JSON-LD, `loading.tsx` / `error.tsx` /
`not-found.tsx`, and `<ReducedMotion>`.

**Why.** Relative OG/canonical URLs never resolved to absolute, so social
previews broke in production; an animation-heavy starter ignored
`prefers-reduced-motion`; and the home view was a top-level `"use client"`,
breaking the server-first rule it should model.

**When building.** Set `NEXT_PUBLIC_SITE_URL` in every deployed environment or
canonical and OG URLs resolve to localhost. `<ReducedMotion>` toggles
react-spring's global `skipAnimation` from one app-root mount, covering every
spring and the text engine at once. **`isBot()` is discouraged** — it opts the
route out of static rendering and edges toward cloaking; reduced motion is the
preferred lever, since springs only animate opacity/transform and content is in
the DOM for crawlers regardless ([[seo-metadata]]).

---

## ADR-0009 — Shared animation ticker; authorised engine performance refactor

**Status:** Accepted · 2026-05-21 · amends ADR-0002

**Decision.** One-time authorised refactor of the protected engine, plus a shared
loop primitive: `src/lib/animation/ticker.ts` — a single app-wide,
reference-counted rAF loop that starts on the first subscriber and stops on the
last. It is **not** `#do-not-modify`; it is the supported extension point.

**Why.** Cost scaled with the number of animated components: a private rAF loop
per `useLoop` instance that never stopped, a debounced `resize` listener per
spring component, and an `IntersectionObserver` re-created on every render.

**When building.** A page with N animated components now runs **one** rAF loop
and **one** resize listener. Subscribe new per-frame work to the ticker rather
than starting a loop. Hard rule #2 was amended here: the engine stays protected
by default and changes need explicit sign-off — this ADR is not a precedent for
editing it.

---

## ADR-0008 — Adaptive scaling grid via root font-size

**Status:** Accepted · 2026-05-21

**Decision.** Keep a rem-based design proportional across viewports by scaling
`html { font-size }`: `vw`-based media queries in `globals.css` for scaling down,
and a `<AdaptiveGrid>` client component for scaling up beyond the largest
breakpoint.

**Why.** The behaviour arrived as a `styled-components` implementation, which is
not a project dependency and conflicts with the CSS-only config rule. Only the
behaviour was kept; the implementation was rebuilt on the project stack.

**When building.** Breakpoints live in `grid.config.ts` **and** are mirrored in
the `globals.css` media queries — duplicated by design, since ADR-0004 forbids
generating CSS config from JS. **Keep the two in sync**; the formula is written
in both files. Design px map cleanly to rem at the design base width.

---

## ADR-0007 — Automate the vault workflow with Claude Code hooks

**Status:** Accepted · 2026-05-21

**Decision.** Encode the "read the vault first, update the docs after" workflow as
hooks in `.claude/settings.json`: `SessionStart` injects a pointer to the vault,
`UserPromptSubmit` reminds the agent to consult the relevant guide,
and `Stop` blocks **once per turn** to confirm docs were updated.

**Why.** Documentation drifts the moment it depends on someone remembering.

**When building.** The `Stop` hook uses a `${TMPDIR}` marker keyed by session id
so it blocks at most once per turn — no infinite loop. Hooks are reviewable and
disableable via `/hooks`, and take effect at the next session start.

---

## ADR-0006 — The vault is the single source of truth

**Status:** Accepted · 2026-05-21 · amends ADR-0001

**Decision.** The vault is the **only** documentation source. The repo root keeps
thin shims: `AGENTS.md` carries the breaking-change warning and hard rules and
points into the vault; `CLAUDE.md` and `.cursorrules` `@`-import it.

**Why.** Dense spec files at the root duplicated the vault's content as terse
specs, and the two would drift.

**When building.** Put documentation in the vault and link to it. Keep the root
shims consistent with it — they are the first thing every agent reads.

---

## ADR-0005 — Use standard `next/link` for navigation

**Status:** Accepted · 2026-05-21

**Decision.** Standard Next.js navigation — `<Link>` from `next/link`,
`useRouter` from `next/navigation`. The custom `<AnimLink>` / `useAnimRouter()`
convention referenced in early drafts is dropped; it was never built.

**Why.** Two conflicting conventions existed in the docs and only one had code.

**When building.** No animated route-transition layer exists. If one is needed,
revisit with a new ADR rather than reviving the old names. See [[routing]].

---

## ADR-0004 — Tailwind v4 with CSS-based config

**Status:** Accepted (starter baseline) · amended by ADR-0012 and ADR-0015

**Decision.** All theme configuration lives in `globals.css` under `:root` and
`@theme inline`. There is no `tailwind.config.js`. Raw values in class names are
banned.

**Why.** Tailwind v4 removes the JS config file in favour of CSS-native config.

**When building.** Design tokens are the only styling currency: a value that does
not exist as a token gets added to `globals.css` first — following the three-tier
grammar (ADR-0015) — and component-specific *classes* do not go there at all
(ADR-0012). See [[design-system]].

---

## ADR-0003 — Routes delegate to Views

**Status:** Accepted (starter baseline)

**Decision.** `app/**/page.tsx` only imports and renders a component from
`src/views/`. All layout and UI logic lives in the view.

**Why.** Mixing routing concerns with page UI makes `app/` files heavy and hard
to test.

**When building.** Every route is a ~3-line file; views are the real page
components. `verify.sh` FAILs on a route importing anything else. See [[routing]].

---

## ADR-0002 — All motion is spring-based (`@react-spring/web`)

**Status:** Accepted (starter baseline) · amended by ADR-0014 and ADR-0009

**Decision.** Every animation uses `@react-spring/web` through the component
layer in `src/components/animation/springs/`. CSS keyframes and `framer-motion`
are **banned**. Text animation goes through `spring-text-engine`.

**Why.** Marketing sites need rich, interruptible, physically natural motion. CSS
transitions and keyframes are rigid; competing libraries add weight.

**When building.** The springs folder and `src/hooks/animation/` are
`#do-not-modify` — consume them, wrap them, never edit them without sign-off.
ADR-0014 narrows the CSS ban to allow `transition-*` for trivial hover/focus
state only. See [[animation-system]] and [[text-engine]].

---

## ADR-0001 — Adopt an Obsidian vault as the project brain

**Status:** Accepted (starter baseline) · amended by ADR-0006

**Decision.** `obsidian/` is a linked, navigable vault documenting how the
project is built and why.

**Why.** Project knowledge scattered across root markdown files gave new
contributors and AI agents no structured map of the system.

**When building.** Docs are maintained alongside code — see [[meta/README]] for
the maintenance rules, and [[agent-harness]] for how the vault and `.claude/`
divide the work.
