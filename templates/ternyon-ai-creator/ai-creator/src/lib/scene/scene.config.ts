/**
 * Tuning constants for the hero model scene.
 *
 * Hard rule #4 applies to scene numbers too: every magic value the renderer
 * reads is named here, not sprinkled through the render code. Colours are the
 * exception — they are design tokens and are read from CSS at runtime
 * (`--scene-surface`, `--scene-wire`), so the theme stays the source of truth.
 *
 * 📖 Docs: obsidian/workflows/optimize-3d-scene.md
 */

export const sceneConfig = {
  /** Site content asset — one folder per section (see folder-structure.md). */
  modelUrl: "/assets/hero/model.glb",
  /** Local Draco decoder. Never a CDN: it sits on the critical path. */
  dracoDecoderPath: "/draco/",

  /**
   * How long a resize has to have settled before the tier is re-read, in ms.
   *
   * A window being dragged fires `resize` on every frame; the reload must
   * wait for the hand to stop, or it fires mid-drag. See `<TierReload>`.
   */
  tierReloadSettleMs: 400,

  /**
   * The lite choreography — what a phone gets. See `wantsLiteScene`.
   *
   * One model, decimated, on a short runway with one motion: it turns as the
   * reader scrolls off it. The tide and chrome screens are stills captured
   * from the full scene (`stage.stills` in the content), each with the same
   * DOM reveal every screen has. ADR-0126.
   */
  lite: {
    /**
     * 42k triangles against the full model's 102k, textures at 1024 — made
     * with gltf-transform `simplify --ratio 0.3 --error 0.0005`, `resize`,
     * `draco`. At one pixel per CSS pixel on a phone the difference is not
     * visible; the vertex work is 40% of what it was.
     */
    modelUrl: "/assets/hero/model-lite.glb",
    /** Runway length in viewport heights — the pinned screen and one more. */
    runwayViewports: 2.2,
    /** How far the model turns over that runway, in turns. */
    turns: 0.22,
    /**
     * The stills' drift against the scroll.
     *
     * `travel` is how much taller than its section the image is, as a
     * percentage — it moves half of that each way across the section's whole
     * pass over the viewport. Small on purpose: the frame should feel like a
     * place the reader moves past, not a layer sliding under them. The spring
     * is what makes it smooth on a thumb's stepped momentum scroll — the image
     * chases the scroll and settles a beat after it.
     */
    stillParallax: {
      travel: 12,
      spring: { tension: 90, friction: 26, clamp: true },
    },
  },

  camera: {
    /** A longer lens than the 50mm default — less perspective distortion,
     *  which is what makes a product render read as photographed. */
    fov: 35,
    near: 0.01,
    far: 100,
    /** Headroom around the model's bounding box. 1.0 would crop to the pixel,
     *  so this sits just clear of it — the subject is meant to fill the stage. */
    fitMargin: 1.02,
    /** Look slightly above centre so the model sits a touch low in frame. */
    targetHeightRatio: 0.06,
    /** Camera lift, in bounding-sphere radii — a mild three-quarter view. */
    elevationRatio: 0.1,

    /**
     * What changes on a phone.
     *
     * `fitCamera` fills the stage on whichever axis is tighter, and on a tall
     * portrait window that is the vertical one — so the bust runs the whole
     * height of the screen and the copy, which on a phone is a column at the
     * foot rather than a band across the side, lands **on** it.
     *
     * Pulling back gives the column clear ground, and looking *below* centre
     * (a negative ratio, where the wide window looks slightly above) lifts the
     * subject into the room that opens up. The wide composition is untouched:
     * these are read only when the tier is mobile.
     */
    mobile: {
      fitMargin: 1.16,
      targetHeightRatio: -0.2,
    },
  },

  lighting: {
    /**
     * A three-point studio rig: key, rim, and a low IBL floor.
     *
     * The previous setup was IBL-dominant (environment 1.45 against a key of
     * 1.15), and an omnidirectional soft box is *definitionally* flat — it fills
     * every crevice equally, which is most of why the model read as plasticine.
     * The environment is now a floor rather than the main source: it keeps the
     * shadows from going black and supplies the reflections that make skin look
     * like skin, and the key does the shaping.
     */
    environmentIntensity: 0.32,
    /** Blur applied when prefiltering the environment into a PMREM. Above
     *  ~0.04 three warns that the kernel clips (it wants more samples than the
     *  generator allows) and the prefilter silently loses accuracy. */
    environmentBlur: 0.02,

    /** Key: high and to camera-left, the classic portrait position. */
    keyIntensity: 3.9,
    keyPosition: [-2.3, 2.9, 2.6] as const,

    /**
     * Rim: behind and opposite the key. On a white stage this is not about
     * separating the subject from the background — it is what puts a bright
     * edge on the shoulder and the hair, and an edge is the single strongest
     * cue that a surface has a direction. Two real-time lights is still within
     * "the fewest the look survives".
     */
    rimIntensity: 3.0,
    rimPosition: [2.7, 1.5, -2.2] as const,

    /** Khronos PBR Neutral, not ACES — see `model-scene.ts`. ACES has a heavy
     *  filmic toe that crushes this asset's range to a black silhouette. */
    toneMappingExposure: 1.04,
  },

  /**
   * Self-shadowing only. There is no floor: the ground plane that used to catch
   * a contact shadow is gone, so the key light now casts the model onto itself —
   * under the chin, beside the nose, where the hair crosses the shoulder. That
   * is contact information a light-only setup cannot produce, and it is a large
   * part of what stops the render reading as flat.
   *
   * The shadow camera is wrapped tightly around the model precisely because
   * there is nothing else in the scene to cover.
   */
  shadow: {
    /**
     * 1024, not 2048. The shadow camera is wrapped tightly around the model
     * (`extentRatio` 1.1), so the map covers the bust and nothing else — 1024
     * still puts ~1000 texels across the subject, which is more than a soft
     * self-shadow under a chin can resolve. At 2048 the pass re-rasterised
     * 102k triangles into 4x the texels every frame for a difference that is
     * not visible at hero scale.
     */
    mapSize: 1024,
    extentRatio: 1.1,
    /**
     * Depth range around the model, in radii — the shadow camera's near and far
     * are derived from the light's actual distance, not from fixed ratios.
     *
     * This matters more than the biases do. A near of 0.06 against a far of 14
     * spreads the depth buffer's precision over a range the model occupies ~15%
     * of, and the resulting quantisation makes every surface shadow *itself*:
     * the model goes black except where a non-shadowing light rims it. Wrapping
     * the range tightly around the subject is what fixes that at the source.
     */
    depthMarginRatio: 1.25,
    /** Scan geometry is dense and smooth, so normalBias does the work and the
     *  depth bias stays small — too much and contact shadows detach. */
    bias: -0.0005,
    normalBias: 0.03,
  },

  /**
   * Surface corrections for the scanned asset. Set `enabled: false` to render
   * exactly what the file specifies.
   *
   * `metalness` — the GLB carries no `metallicFactor`, and glTF's default for
   * that is **1.0, fully metallic**. A metal surface has no diffuse response at
   * all, so the photographic albedo is discarded entirely and the scan renders
   * as bare chrome. (Its metalness *texture* correctly holds 0, but a texture
   * only scales the factor — it cannot rescue a factor the file never set.)
   *
   * `roughness` — the file authors 0.5, which is wet plastic. But the 0.95 this
   * scene used before was the opposite error: a perfectly matte surface has no
   * specular direction at all, and that is the other half of the plasticine
   * look. Skin and hair want a broad, soft highlight, not none.
   *
   * `computeTangents` — the mesh ships **no TANGENT attribute**, so three has to
   * derive the tangent frame from screen-space derivatives. On this UV layout —
   * thousands of tiny islands, so nearly every triangle sits on a seam — the
   * derived frame flips across each seam and shreds the surface, which is why
   * the normal map was dropped entirely at first. Computing real per-vertex
   * tangents fixes it at the source: seam vertices are already split by the
   * exporter, so each side gets its own correct frame, and the map's micro-relief
   * comes back. That relief is the third part of the plasticine fix.
   */
  material: {
    enabled: true,
    metalness: 0,
    roughness: 0.58,
    computeTangents: true,
    /** Under 1 because the scan's map is strong and its albedo already carries
     *  some of the same detail; full strength double-counts the pores. */
    normalScale: 0.7,
    /**
     * Sign applied to the bitangent (normalScale.y).
     *
     * GLTFLoader sets normalScale to (1, -1), which compensates for the
     * handedness of the tangent frame three *derives* from screen-space
     * derivatives. Once a real TANGENT attribute exists that compensation is
     * wrong twice over — the bitangent sign now comes from `tangent.w` — and
     * the doubly-flipped frame tilts every perturbed normal away from the
     * lights, which renders the model as a black silhouette. With computed
     * tangents the sign is +1.
     */
    normalTangentSign: 1,
  },

  /**
   * The bottom "fog".
   *
   * This is a bust: it ends on a flat horizontal cut that reads as damage, not
   * as framing. Fading the last stretch of the model into the stage colour
   * dissolves the cut instead of hiding it behind a band, and because it mixes
   * towards an opaque colour there is no transparency sorting to get wrong.
   *
   * Both values are fractions of the model's half-height, measured from the
   * centre — so -1.0 is exactly the bottom of the bounding box.
   */
  fade: {
    startRatio: -0.42,
    /**
     * Where the lit model has dissolved completely.
     *
     * Short of the geometry's lowest point on purpose. Taken all the way down
     * (-0.94) the last tenth of the dissolve spread across the widest part of
     * the subject — the arms — and sat there as a haze with a silhouette in it,
     * still 30 levels off the ground at 80px from the bottom of the screen.
     * Ending higher costs a little of the hair and buys a bottom edge nobody
     * can find.
     */
    endRatio: -0.82,
    /**
     * Where the **mesh's** dissolve begins — far higher than the lit model's.
     *
     * On the white stage the bust fades towards the ground colour, so a short
     * fade loses it cleanly. Immersed, the mesh fades towards *transparency*
     * over a live field, and the same short fade does not read as a dissolve
     * there at all — it reads as the model being cut off. The hem has to be
     * long enough to be seen as a hem.
     */
    meshStartRatio: -0.42,
    /**
     * And where it finishes — far higher than the lit model's `endRatio`.
     *
     * That one is calibrated to the geometry's lowest point, which on this
     * asset is the ends of the hair. The thing needing hiding is the flat cut
     * across the chest, well above it: fading out at the hair leaves the cut at
     * nearly half strength and perfectly visible. The mesh has to be gone
     * before the cut, not with it.
     */
    meshEndRatio: -0.7,
  },

  /**
   * How the painted display type arrives and leaves: letter by letter, in a
   * scrambled order, on opacity alone.
   *
   * Measured off the reference rather than guessed — twenty-four characters
   * fading in over a 730ms spread, each taking about 500ms, in an order with no
   * relation to how they are read. Nothing moves: no rise, no scale. What makes
   * it feel like the type is *resolving* rather than sliding in is precisely
   * that the eye cannot predict which letter lands next.
   *
   * As fractions of the layer's own window, so it stays in step with the screen
   * it belongs to however long that window is.
   */
  inkLetters: {
    /**
     * How much of the window is spent handing out start times, 0–1.
     *
     * The rest is one letter's own fade. 0.6/0.4 is the reference's 730ms over
     * ~1230ms, held as a ratio.
     */
    spread: 0.6,
    /**
     * Shape of a single letter's fade. 2 is the measured curve — quick to
     * halfway, then easing into place; linear reads mechanical at this scale.
     */
    ease: 2,
    /**
     * The arrival, once the scene is up.
     *
     * Clamped: an overshoot here would push letters past full and back, which
     * on opacity reads as a flicker rather than as spring. The settle is about
     * a second and a quarter, which is the reference's whole line — spread plus
     * one letter's fade — held end to end.
     */
    entrance: { tension: 62, friction: 30, clamp: true },
    /** Leaving is quicker than arriving, and just as unhurried at the end. */
    exit: { tension: 90, friction: 34, clamp: true },
  },

  /**
   * The model's arrival, once the curtain has gone.
   *
   * Two things happen on one value, 0..1, and both read from the same spring
   * so they can never come apart. The model **approaches**: it starts nearer
   * the camera and higher than its rest — larger in frame, above the name —
   * and settles down and back into place, easing out. And it **burns in**:
   * every fragment is discarded until a drifting noise field falls under the
   * level, so the surface appears in scattered, liquid patches with an ember of
   * the accent along each front, rather than fading up as one piece.
   *
   * Lengths are in bounding-sphere radii, like the camera's — swap the asset
   * and nothing here needs retuning. See [[decisions-log]] ADR-0122.
   */
  arrival: {
    /** How much nearer the camera it starts, in radii. */
    approach: 0.7,
    /**
     * How much higher it starts, in radii. Kept short: the approach already
     * lifts the head towards the top of the frame, and at 0.35 the first
     * patches were opening above the screen's edge.
     */
    rise: 0.2,
    /**
     * The width of the burning front, as a fraction of the level's whole
     * travel. Inside it the fragment is drawn in the ember colour, hottest at
     * the edge that has just opened.
     */
    edge: 0.12,
    /** Noise cells per radius. Higher is finer, more granular patches. */
    noiseScale: 2.4,
    /**
     * How fast the field drifts, in noise units per second — what makes the
     * front liquid rather than a fixed stencil being uncovered.
     */
    noiseDrift: 0.35,
    /**
     * The spring both readings run on. Clamped: an overshoot would carry the
     * model past its mark and back, and drive the level past full — which on
     * a discard reads as fragments blinking out. Settles in about two seconds.
     */
    spring: { tension: 58, friction: 22, clamp: true },
    /**
     * How long after the curtain has gone the type begins, in ms.
     *
     * The model leads. Both starting on the same frame read as one event with
     * two parts; a beat between them reads as the name arriving *for* the
     * subject that is already there.
     */
    inkDelay: 120,
    /**
     * Where each block of the first screen's copy takes its start on the
     * layer's reveal, 0..1 — the stagger: claim, summary, notes, actions.
     */
    copyStagger: [0.12, 0.26, 0.38, 0.48] as const,
    /** How much of the reveal one block spends arriving. */
    copySpan: 0.45,
  },

  /**
   * Depth on the closing screen: how far each plane travels against the panel
   * carrying it, in `vw` across the whole of the panel's phase.
   *
   * The block is four planes stacked flat — ground, name, subject, copy — and
   * flat is exactly how it read, because a panel that moves as one piece cannot
   * tell the reader which of them is nearest. Parallax is the only cue
   * available: no perspective is involved, and none is needed. What sells depth
   * is that the planes disagree about how far they have come.
   *
   * The **name lags** (positive, downward) and the **copy leads** (negative,
   * upward), with the subject as the anchor between them — which is the order
   * they are stacked in, so the disagreement matches the layering rather than
   * fighting it. Both are read in CSS by the closing screen's own components,
   * off the panel's `--closing-travel`; the scene reads neither (ADR-0125).
   */
  closingParallax: {
    /** Painted by the scene, so the scene shifts it — see `uInkShift`. */
    heading: 3.8,
    /** DOM, so CSS shifts it, off the same `--closing-travel`. */
    copy: -3.6,
  },

  /**
   * The pointer's lamp on the immersed stages.
   *
   * Below the tide line the model is a mesh and a cloud of points, and it read
   * as one even sheet of light — nothing to look *into*. Held back to `dim` and
   * lifted where the pointer is, the same geometry reads as something being
   * looked over: the edges and the points under the cursor come up, everything
   * else stays quiet.
   *
   * `active` is what keeps this from punishing a device with no pointer at all:
   * it only rises once a pointer has actually been seen, so a phone gets the
   * undimmed model rather than a permanently dark one.
   */
  pointerGlow: {
    /** Radius of the lamp, as a fraction of the drawing buffer's height. */
    radiusRatio: 0.28,
    /** What the mesh and the points are held back to away from the pointer. */
    dim: 0.26,
    /**
     * And what they reach under it. Far over 1: the weight it multiplies is
     * `immersedOpacity`, so anything under 1/0.42 leaves the lit patch short of
     * full strength and the whole effect reads as a slightly less grey area.
     */
    lift: 2.6,
    /**
     * What the **halo** reaches under it — higher again.
     *
     * The halo is the scaled, screen-blended copy of the mesh: it is the scene's
     * own glow, and it is the only one available here. A full-screen bloom pass
     * would light the painted headings on this stage as well (ADR-0088), so the
     * lamp gets its bloom by driving the halo instead, where it can be aimed.
     */
    haloLift: 4.2,
    /** How fast the lamp follows the pointer and fades in and out, per second. */
    follow: 9,
  },

  /**
   * The pill and its call to action, for the middle of the page.
   *
   * It arrives once and leaves once — see `StageNavBar` for why it is not one
   * per screen. Rising is the whole of the entrance: it comes up from under the
   * fold with its links filling in behind it, which is what stops it reading as
   * a thing that was always there and merely faded.
   */
  stageNav: {
    /** Each link's share of the opening handed out in turn, 0–1. */
    itemStagger: 0.08,
    /** Springy on the way up — it is an arrival, and it should feel like one. */
    enter: { tension: 150, friction: 24 },
    /** Flat on the way out: leaving should not draw attention to itself. */
    leave: { tension: 190, friction: 30, clamp: true },
  },

  /**
   * The first screen's rule, drawn **by the scene** rather than by the DOM.
   *
   * It has to be, and the reason is the whole architecture of this screen. The
   * rule belongs behind the model — the model interrupts it, which is what puts
   * the subject in the room. As a DOM layer behind the canvas that worked until
   * two other things were asked for: the mark painting the ground (it is opaque,
   * so it wiped the line) and the model's dissolve reading as transparency (it
   * is opaque too, so its faded footprint wiped the line over a much wider
   * band).
   *
   * Drawn in `stageColor`, all three hold at once. The model's dissolve mixes
   * towards a stage that *contains* the line, which is exactly what a
   * transparent model over that line would look like — with none of the
   * render-order cost of making the model transparent (the background quad
   * would stop being depth-rejected, and the tide field would then be evaluated
   * over the subject's whole footprint every frame).
   *
   * The numbers are the design's, in the same proportion `StageFrame` uses:
   * a frame `frameRatio` of the viewport width, centred, with the rule
   * `topRatio` of the width down it.
   */
  /**
   * The type the scene paints into a texture (`data-scene-ink`).
   *
   * The atlas used to be rasterised at the **framebuffer's** scale, which is
   * the device pixel ratio after `clampedPixelRatio` has had it. That clamp is
   * a fill-rate decision and a good one — on a phone it takes the ratio down to
   * 0.85 — but glyph coverage is not fill: the letters are drawn once into a
   * canvas and sampled thereafter. Painted at 0.85 and shown on a 3x screen,
   * the headings came out visibly stepped.
   *
   * So the atlas has a scale of its own, and the framebuffer keeps its clamp.
   */
  /**
   * Where the loader stands the scroll while it warms the scene.
   *
   * Every one of these is a different set of objects visible, a different
   * branch alive and a different pass enabled — and `compileAsync` only
   * compiles what it can *see*. Warming at progress 0 alone left the word's
   * scaffold, its sparks, its poured chrome and the bloom chain uncompiled,
   * because none of them exist yet at the top of the page.
   *
   * Five stops rather than the morph's own endpoints: the cost is five frames
   * under a curtain that is already there, and the alternative is guessing
   * which branches matter. optimize-3d-scene §3.
   */
  prewarmStops: [0, 0.25, 0.5, 0.75, 1] as const,

  stageInk: {
    /** Device pixels per CSS pixel to rasterise glyphs at, at least. */
    minScale: 2,
    /**
     * Ceiling on either atlas dimension, in pixels.
     *
     * A single texture, and the widest heading is most of the viewport — so
     * without this the boost multiplies a already-wide canvas into something no
     * phone should be asked to hold.
     */
    maxSize: 4096,
  },

  stageRule: {
    frameRatio: 0.555556,
    topRatio: 0.414583,
    /** And the immersed screens' own rule, from the same frame. */
    immersedTopRatio: 0.430556,
    /**
     * How far above `[data-stage-rule]` the line sits on a phone, in `vw`.
     *
     * The design's own gutter: the line is a datum the actions hang from, and
     * the distance between them is the same one everything else on the screen
     * keeps from an edge.
     */
    markerGap: 0.0208,
    /**
     * **Buffer** pixels, not CSS ones — one device pixel is the thinnest a
     * solid black line can be, and on a 1.25x screen a CSS pixel was 1.25 of
     * them: solid in the middle and grey along one edge, which reads as heavier
     * than it is.
     *
     * One device pixel is only *actually* one row if the row is snapped to a
     * fragment centre — see `rowAt`. Landing between two rows lit both of them
     * at half weight, which is a two-pixel line that reads grey: thicker and
     * softer than the design, and it changed with the window height.
     */
    thickness: 1,

    /**
     * The delivery screen's rule, as a share of its token colour.
     *
     * It is a datum the copy hangs from, not a divider demanding attention, and
     * at full white on that blue it was the loudest thing on the screen.
     */
    immersedOpacity: 0.3,

    /**
     * The layer whose window the delivery rule arrives with.
     *
     * Not a zone threshold. The zone starts opening as soon as the deep line
     * begins to cross and is saturated a whole screen early — measured: full at
     * scroll 2900, where the copy hanging from the rule is still at zero and
     * does not start until 3050. Any threshold on it is a guess at a number
     * that is already wrong. The layer's window is the same clock the copy
     * runs on, so the rule and the lines it heads arrive together by
     * construction.
     */
    immersedLayer: 3,
  },

  /**
   * The brush — the pointer's mark on the model.
   *
   * `points` is the ring size, and it is also the inner loop of every fragment
   * the model draws — the shader walks all of them. Keep it small.
   */
  brush: {
    points: 32,
    /**
     * Brush radius as a fraction of the model's bounding-sphere radius.
     *
     * The field falls to nothing at this radius, and the mark ends where the
     * field crosses `threshold`, so what appears is smaller than this and
     * shaped by the noise rather than round.
     */
    radiusRatio: 0.42,
    /**
     * How long a point takes to die, in seconds.
     *
     * Long enough that the coming-apart is legible: the cells leave across this
     * window, not at the end of it, so at 1.4s the whole disintegration was
     * over before the eye had found it.
     */
    lifetimeSeconds: 0.7,
    /**
     * Minimum spacing between recorded points, as a fraction of the model's
     * radius — and, with `points`, what sets how **long** the mark is.
     *
     * The ring holds a fixed number of points, so the span it can cover is
     * spacing times count. Without a minimum, a slow drag spends the whole
     * ring on one spot and there is no trail at all.
     */
    minStepRatio: 0.055,
    /**
     * The radius left at the tail, as a fraction of the head's.
     *
     * This is the taper: a point's radius shrinks with its age, so the mark is
     * widest where the pointer is and narrows to a tip behind it. A stroke with
     * no taper is a tube, and reads as a smear rather than as something drawn.
     */
    taper: 0.18,
    /**
     * Where in a point's life its weight starts falling away, 0..1.
     *
     * At 1 the weight decays across the **whole** life, which is the point.
     * Lower values give a point full weight until its last moments and then
     * drop it: the mark stood at full strength for most of a second and then
     * went out all at once, which reads as freezing and then disappearing
     * rather than as letting go.
     */
    tailFade: 1,
    /**
     * The level the stroke's field is cut at, 0..1.
     *
     * Everything above it is mark, everything below is not, with nothing in
     * between — this is the number that keeps the edge hard. It also sets how
     * much of a point's radius survives the cut, so raising it shrinks the
     * mark and lowering it spreads it.
     */
    threshold: 0.34,
    /**
     * How far the smooth noise pushes that level about, 0..1.
     *
     * This is the shape. At 0 the mark is a capsule with a hard edge; too high
     * and the field is all noise, the outline grows lobes and fingers, and the
     * stroke stops reading as a stroke. It is also what makes the mark come
     * apart as it dies: the places where the noise sits high stay above the
     * level longest, so it loses islands instead of dimming.
     */
    wobble: 0.3,
    /** Noise features across the drawing buffer's height — the size of the
     *  undulations in the outline. Fewer, larger ones read as a simpler shape. */
    noiseScale: 5.5,
    /** How fast the noise drifts, in fields per second. Slow: this is the
     *  outline breathing, not the mark crawling. */
    noiseDrift: 0.07,
    /**
     * How far the stage darkens inside the mark, 0..1.
     *
     * It is what stops the shape ending at the model's silhouette — the mark
     * passes over the ground too, and the ground notices. Deep enough to be
     * unmistakable on the white stage without reading as a shadow with a light
     * source behind it.
     */
    /** How far the mark carries the ground to `--scene-mark`, 0–1. */
    wash: 1,
  },

  /**
   * The tide field — the scene's second stage.
   *
   * A **fire front creeping across a field**: char behind the line, an ember on
   * it, licks above. The front is a level set of a fuel field, and it advances
   * because the *fuel scrolls past a fixed threshold* rather than the threshold
   * ramping — a threshold that ramps has to wrap, and a wrap in a fire reads as
   * a seam. Scrolling the field gives an edge that advances forever and never
   * repeats.
   *
   * (This replaced a line-integral-convolution field — noise combed along flow
   * lines — that drew strands rather than a front. See [[decisions-log]]
   * ADR-0034.)
   *
   * It is evaluated **inside the scene's own shaders**, not composited
   * underneath: the background quad and the dissolving model both have to arrive
   * at the same colour at the same pixel, or the model would melt into a
   * different field than the one behind it.
   *
   * These are baked into the GLSL as constants at module load rather than sent
   * as uniforms — none of them change at runtime, and twenty scalars per frame
   * buys nothing. The palette is the exception: it comes from design tokens.
   *
   * Two values from the field's own specification are deliberately absent.
   * `grain` is 0, so the film-grain term it drives is identically zero and is
   * not emitted at all — it needs integer hashing, which the GLSL dialect three
   * compiles patched materials in does not have. And the spec's `maxDpr: 1` is
   * a standalone-canvas setting; this field shares a renderer with 1px
   * wireframe lines that alias below 1.25, so the scene's own clamp wins
   * (ADR-0033).
   */
  tideField: {
    scale: 0.45,
    speed: 0.33,
    /** How fast the fuel scrolls past the threshold — the front's advance. */
    spread: 0.07,
    /** Upward drift of the licks above the ember line. */
    rise: 0.3,
    /** The level the front sits at. Higher burns less of the field. */
    threshold: 0.63,
    /** Width of the ember band around the level set. */
    ember: 0.15,
    lick: 0.2,
    roughness: 0.5,
    lacunarity: 1.8,
    contrast: 1.5,
    midpoint: 0.5,
    /** How quickly the field lifts off the background as `f` rises. */
    sink: 0.42,
    /**
     * **The one mandated value this scene does not use as given.** The
     * specification says 1.0; it runs at 0.3.
     *
     * The term is `col += light * glow * pow(f, 4.0)` — a quartic amplifier on
     * the field's own variation. As the fuel scrolls, the share of the screen
     * sitting high in `f` changes, and at glow 1.0 that turned into a **1.72x
     * swing in the mean brightness of the entire frame**, measured at a
     * completely fixed scroll over 26 seconds. That is the scene visibly
     * lighting up and settling on its own. At 0.3 the same measurement gives
     * 1.21x — a breath rather than a pulse.
     *
     * Nothing else about the field is altered: palette, contrast, threshold,
     * the front's speed and shape are all as specified. Raise this back to 1.0
     * and the pulse comes back with it.
     */
    glow: 0.3,
    vignette: 0.5,
    pointerRadius: 0.9,
    /** How far the hand pulls the threshold down — the front bulges toward it. */
    pointerStrength: 0.5,
    /** How hard the pointer's *direction* smears the front. Reads `uTideVelocity`. */
    wake: 4,
    parallax: 0.01,
    /**
     * How far the field slides as the reader travels the runway, in field units
     * per unit of progress.
     *
     * Tied to **position**, not to the clock: the field already drifts on its
     * own, and adding more of that would only make it busier. What this adds is
     * the sense that the ground is being travelled *over* — it moves because the
     * reader moves, and stops when they do.
     */
    scrollDrift: 0.45,
    /**
     * And how hard travelling *fast* leans the front, reading the same eased
     * scroll speed the stage lines bow on. A surge while moving, flat at rest.
     */
    scrollSurge: 0.045,
    /**
     * Seconds for the field's own reading of the scroll to catch up.
     *
     * The drift is not fed raw progress: a flick of the wheel, or a jump to an
     * anchor, moves progress instantly and the ground would snap with it. The
     * field lags and settles instead, so the travel reads as something heavy
     * being moved over rather than a texture being dragged.
     */
    scrollResponse: 0.4,
    /**
     * The pointer is *felt*, not tracked: a fast lead node chased by a slower
     * body. One pole can only decelerate into its target, so a direction change
     * hinges on a corner; two poles swing through the turn and coast for a beat
     * after the hand stops. The gap between them **is** the velocity the wake
     * reads — it opens while the hand moves and closes on its own, with no
     * history buffer anywhere.
     *
     * Per-60Hz-frame rates, converted to a framerate-independent alpha in the
     * ticker so the follow-lag is the same at 60, 120 and 144 Hz.
     */
    pointerLead: 0.105,
    pointerBody: 0.043,
    /** Triangular dither on the background. Not decoration: a field this smooth
     *  bands visibly on an 8-bit display without it. */
    ditherAmount: 1.2,
  },

  /**
   * The topology revealed inside a stroke.
   *
   * `cellRatio` sets how coarse the welded grid is, as a fraction of the model's
   * radius — this is the readability dial. The raw mesh is 102k triangles, which
   * at hero size puts several edges in every pixel and reads as a smudge; the
   * weld keeps the real topology but resolves it at a density an eye can follow.
   * Smaller values give a finer, denser mesh.
   */
  wireframe: {
    cellRatio: 0.032,
    /** Lift along the vertex normal, so lines float clear of the surface they
     *  describe rather than being swallowed by it. */
    surfaceOffsetRatio: 0.004,
    /**
     * On the white stage, where the lines sit over a lit surface.
     *
     * Full weight, and it has to be: a GL line is one device pixel, so anything
     * under 1 is blended with the white behind it and the mesh reads as a pale
     * periwinkle rather than as the accent — measured at 0.5 it landed around
     * 185,192,255 against the button's 0,81,255 beside it. The colour was never
     * wrong; the coverage was.
     */
    opacity: 1,
    /**
     * Past the first line — **one** value for both immersed stages, and that is
     * the point.
     *
     * It used to be two, 0.85 here and 0.42 on the tide, blended by the stage
     * mask. But the third line is a hard edge sweeping up the screen, so what
     * that blend actually drew was the heavier net arriving bottom-to-top
     * *through the model*: it read as a second, denser mesh climbing the body,
     * which is not a thing anyone asked for and not a thing the geometry does.
     * A weight that varies across a screen-space line will always look like
     * that. One number, no seam.
     *
     * A GL line is always exactly one device pixel — `linewidth` is ignored in
     * WebGL, so there is no such thing as a thinner one. What makes a net read
     * as finer is its weight: this, and above all the additive halo below.
     */
    immersedOpacity: 0.42,
    /**
     * A halo pass — the same lines again, additively blended, which is the
     * cheapest honest bloom for 1px geometry.
     *
     * 1.0 — coincident, not offset.
     *
     * It was 1.007, a copy scaled a hair larger so the spill fell *beside* each
     * strand. At hero size that offset is several pixels, and what it actually
     * read as was a **second grid** laid over the first. The junction sparks
     * carry the glow now, so the halo only has to add light, and it adds it
     * exactly on top of the line it belongs to.
     */
    haloScale: 1,
    /** The number that actually governs how thick a strand looks. One value for
     *  both immersed stages, for the reason `immersedOpacity` gives. */
    haloOpacity: 0.16,

    /**
     * The glow is deliberately **uneven**. A uniform bloom flattens the mesh
     * back into a decal; modulating it by a noise in *object* space means the
     * bright patches belong to the model and travel with it as it turns, which
     * is what gives the net volume.
     */
    glowNoiseScale: 1.7,
    glowFloor: 0.45,
    glowRange: 0.55,
    /** Pushes the solid model very slightly back in depth, so the lines sit on
     *  top of it instead of z-fighting with the surface they belong to. */
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  },

  /**
   * Sparks on the wireframe's junctions — the second stage only.
   *
   * One additive sprite per welded cell, drawn where the coarse edges actually
   * meet (the cloud comes out of the same weld that builds the lines, so a
   * spark cannot drift off a junction). They are what carries the form once the
   * lines are thinned: a net of hairlines with lit nodes reads as a structure,
   * a net of hairlines alone reads as a smudge.
   *
   * There is no texture. The sprite is a radial falloff computed from
   * `gl_PointCoord`, which costs a dot product and a pow, and saves an upload.
   */
  particles: {
    /**
     * Diameter in world units, as a fraction of the model's radius.
     *
     * A fraction rather than a pixel count because size attenuation divides by
     * view distance, and the camera fits itself to the radius — so a size tied
     * to the radius comes out the same number of pixels at any model scale.
     */
    sizeRatio: 0.075,
    opacity: 1,
    /**
     * Multiplies the spark's colour, and it is above 1 on purpose.
     *
     * Screen blending scales a contribution by how dark the ground already is,
     * which is exactly what stops the field's drift pumping the model's
     * brightness — but it also means a pale source over a blue field barely
     * registers. The gain buys that back. Values over 1 still cannot blow out a
     * bright ground the way additive did; they only let the sprite's *core*
     * reach white, which is what a point of light should do.
     */
    gain: 1.9,
    /**
     * Falloff exponent — this is the bloom dial, and it works backwards.
     *
     * The sprite's brightness is `(1 - r)^falloff`, so a *lower* exponent holds
     * the light further out from the centre and the halo grows; a higher one
     * pulls it into a hard dot. 2.6 read as pinpricks, which is not a bloom.
     * The floor is around 1.2, below which the skirt reaches the edge of the
     * quad and the sprites turn into visible squares.
     */
    falloff: 1.5,
    /** How far the mesh's own uneven glow modulates a spark's brightness, so
     *  the cloud belongs to the surface instead of hovering as a decal. */
    glowInfluence: 0.85,
    /**
     * What a spark on the *letters* is worth against one on the bust.
     *
     * The lattice is denser per screen area than the bust's surface, so its
     * sparks would blow out to a white slab at the same weight. These are not a
     * stylistic dimming — they are what keeps the letters legible.
     */
    latticeScale: 0.85,
    latticeShrink: 0.7,
  },

  grain: {
    /** Multiplicative film grain: it only ever darkens, which is how grain
     *  behaves as density on a bright ground. Applied inside the model's
     *  shader, so the white stage stays clean. */
    intensity: 0.17,
    /** Grain resamples at a film-like cadence rather than every frame —
     *  at 60fps per-frame noise reads as digital shimmer, not emulsion. */
    fps: 24,
  },

  motion: {
    /**
     * How the scroll-driven turn chases the scroll.
     *
     * Bound straight to progress the model stopped dead the moment the reader
     * did, which reads as weightless. These make it a critically-damped
     * follower: `damping` near twice the square root of `stiffness` lets it
     * carry a little past where the scroll left it and settle without bouncing.
     */
    turn: { stiffness: 42, damping: 13 },
    /**
     * The model **sways**; it does not spin.
     *
     * This is a front-only photogrammetry capture — the back of the mesh has no
     * texture data and renders as a flat black silhouette, which is also where
     * the dark half of the albedo atlas comes from. A full turn would park the
     * hero on that black side for half of every cycle. So the idle motion is a
     * slow sine within the captured sector: enough for the light to travel
     * across the surface and read as three-dimensional, never enough to show a
     * face the scan does not have.
     */
    idleSwayAmplitude: 0.14,
    /** Radians/second of sway phase — one full cycle every ~18s. */
    idleSwaySpeed: 0.35,
    /** Peak pointer-driven tilt in radians (desktop only) — about 18°, enough
     *  that moving the cursor visibly swings the subject rather than nudging
     *  it. Beyond roughly a quarter turn the tilt starts fighting the
     *  scroll-driven rotation for the same axis. */
    pointerTilt: 0.32,
    /** Per-second approach rate for pointer easing (framerate-independent). */
    pointerDamping: 4.5,
    /** Guards against a huge dt after a background tab returns. */
    maxDeltaSeconds: 1 / 20,
  },

  /**
   * The scroll narrative: three stages, each arriving as a hard line that sweeps
   * up the screen.
   *
   * | Stage | Ground | Model | Hover |
   * |-------|--------|-------|-------|
   * | 1 | `--scene-surface` (white) | textured, lit | the brush washes the texture off and shows the mesh |
   * | 2 | a live tide field (`--scene-tide-*`) | dissolved into the field, mesh only | **inverted** — the brush puts the texture *back* |
   * | 3 | the same tide field — no colour of its own | the mesh, open for good, morphing into the word | none: the mesh is leaving |
   *
   * The lines are **screen-space**: they are fields arriving over the whole
   * stage, so they must not tilt or drift when the model turns.
   *
   * The chrome (`chrome` below) is **dormant**: the third stage's surface is
   * fully given over to the field, so nothing the chrome computes can reach the
   * screen. It is kept rather than deleted because the look was asked for and
   * may be wanted back — see [[decisions-log]] ADR-0036.
   *
   * `from`/`to` are windows on the overall scroll progress. The gaps between
   * them are deliberate holds — a stage that is only ever mid-transition never
   * gets read.
   */
  stages: {
    /** Runway length in viewport heights. 1.0 is the pinned screen itself. */
    /**
     * 7, not 5. The extra two are the word's own stretch: once it has formed it
     * turns a full revolution while the chrome fills it, and that needs scroll
     * of its own rather than a corner of somebody else's.
     *
     * Every window below is a fraction of the *whole* runway, so lengthening it
     * rescales them all — the numbers were multiplied by 4/6 (the pinned length
     * before and after) to keep the first three stages exactly as long in
     * actual scrolling as they were.
     */
    runwayViewports: 7,
    /** When each line sweeps, as a fraction of the whole scroll. */
    tide: { from: 0.067, to: 0.28 },
    /**
     * The third stage's line. It no longer brings a colour with it — the field
     * carries straight through — so what it sweeps is the model *opening*: past
     * this line the surface is given over to the stage for good and the mesh
     * carries the subject alone, with no brush needed.
     */
    deep: { from: 0.387, to: 0.52 },
    /**
     * The morph into the word, deliberately behind `deep` rather than on top of
     * it. The mesh has to be established as the subject before it starts to
     * leave, or the two events read as one confused motion.
     */
    morph: { from: 0.44, to: 0.74 },
    /** Screen fractions (0 = bottom) a line travels between. Set just outside
     *  0..1 so each sweep starts fully clear and ends fully covered. */
    lineFrom: -0.04,
    lineTo: 1.04,
    /**
     * Half-width of the line's antialiasing rim, in **device pixels**.
     *
     * Expressed in pixels rather than as a fraction of the viewport because
     * that is the only way it stays one pixel at every resolution and tier —
     * as a fraction it was ~2.5px on a short screen and visibly soft.
     */
    /**
     * How far the stage lines bow upward while the reader is **scrolling**, as
     * a fraction of the viewport's height.
     *
     * Half a sine across the screen: pinned at both edges, lifted in the
     * middle, flat the moment scrolling stops. The line is the ground arriving,
     * so what bends it is the reader's travel through the page — not the
     * pointer, which only ever grazes the model.
     */
    bowHeight: 0.055,
    /**
     * Scroll speed at which the bow reaches full height, in fractions of the
     * whole runway per second.
     *
     * The runway is seven viewports, so 0.4 is a brisk flick — roughly three
     * screens a second — and an ordinary wheel notch bends the line a little
     * rather than throwing it.
     */
    bowSpeed: 0.4,
    /** Time constant for the bow rising and falling. Long enough that a wheel's
     *  stepping does not show as a flutter, short enough to follow the hand. */
    bowResponse: 0.16,
    edgePixels: 0.75,
  },

  /**
   * Scroll-driven turn, on top of the idle sway. Starts on the first frame of
   * scroll — the model is turning from the moment the reader moves.
   *
   * One revolution across the whole runway is not an arbitrary number: it is
   * what keeps a front-only capture honest. The model reaches its untextured
   * back at half a turn, which lands at ~50% progress — inside the accent hold,
   * where it is drawn as a wireframe and has no texture to miss. By the time it
   * comes round again it is chrome, whose albedo is replaced outright. Change
   * `turns` and that alignment goes with it.
   */
  rotation: {
    from: 0,
    /**
     * Ends where the word does. Past that the word takes the axis over.
     *
     * **This is `stages.morph.to` and `spin.from`, and all three are one
     * number.** The bust's revolution has to hand the axis to the word's at the
     * instant the morph finishes, or the turn either stalls or jumps. Move the
     * morph and these move with it.
     */
    to: 0.74,
    turns: 1,
  },

  /**
   * The word's own revolution, once it exists.
   *
   * Deliberately a second term rather than a longer `rotation`: the bust's turn
   * is paced against the stage lines it has to stay in step with, and stretching
   * it to cover the ending would have slowed that. Two spans, one axis, and they
   * meet exactly at `stages.morph.to` so the motion never stalls or jumps.
   */
  spin: {
    from: 0.74,
    to: 1,
    turns: 1,
  },

  /**
   * Stage 3's chrome — liquid metal, not iridescence.
   *
   * Metalness is forced to 1 and roughness right down, per fragment, so the
   * surface becomes a mirror of the environment. Metal tints its reflection by
   * its **albedo**, so the albedo is what decides what kind of metal it is: a
   * two-stop blue-silver ramp driven by fresnel, deep on the faces and bright on
   * the grazing edges, because grazing angles are where a real mirror reflects
   * most. That edge-brightening is the cue that reads as chrome rather than as
   * blue paint.
   *
   * (This replaced a rainbow cosine palette. It was iridescent — soap film, not
   * metal — and it is the difference the reference asks for.)
   *
   * Replacing the albedo outright also means the scan's untextured back stops
   * mattering in this stage.
   */
  chrome: {
    metalness: 1,
    /**
     * Near mirror-polished, and it can be **because the environment is worth
     * reflecting now**. It used to sit at 0.3: against `RoomEnvironment` — a
     * soft box with no structure in it — a sharp reflection returned two
     * hotspots on flat grey, which reads as glass, so the roughness was raised
     * to smear them into something that at least followed the form.
     *
     * `chromeEnvironment` gives it bands to reflect instead, and at that point
     * blur is only throwing them away. Raise this again and the streaks go soft
     * and the metal goes back to plastic.
     */
    roughness: 0.12,
    /** How far the albedo is replaced by the ramp. 1 = fully metal. */
    tint: 1,
    /** Shapes the fresnel curve. Above 1 keeps the sheen to the true edges
     *  instead of washing the whole form pale. */
    falloff: 1.4,
    /**
     * Multiplies the environment **this material** reflects, via three's own
     * `envMapIntensity`.
     *
     * It has to be large because the scene's IBL runs at 0.32 — a fill floor
     * under a diffuse skin material, not a light source for a mirror. A metal
     * has no diffuse response at all, so the reflection is the entire image,
     * and at the scene's own intensity the word came out as flat blue-grey
     * plastic. Raising the *reflection* is the right lever; the previous one
     * multiplied the albedo instead, which pushed F0 above 1 — a surface
     * reflecting more than it receives — and still could not brighten an
     * environment that was not bright.
     */
    /**
     * Lower than it was, because the studio is brighter than the room it
     * replaced: at 17 against `chromeEnvironment` the letters blew to flat white
     * at the end of the pour and lost their form exactly where they should be
     * most legible.
     */
    envMapIntensity: 13,

    /**
     * The studio the chrome reflects — and the whole of why it looks like metal.
     *
     * A mirror has no shading of its own: every value on it is something in the
     * room, so a room with nothing in it produces a surface with nothing on it.
     * `RoomEnvironment` is a diffuse box, which is right for the fill floor
     * under a skin material and useless as a subject for a mirror.
     *
     * So the word gets its own: an equirectangular strip painted to a canvas —
     * a bright sky, a hard dark horizon, and a few softboxes and vertical strips
     * — prefiltered into its own PMREM and hung on that material alone. The
     * scene's environment is untouched, which matters: it lights the skin on the
     * first screen and that is calibrated (ADR-0027).
     *
     * Everything is greyscale. The colour comes from the fresnel ramp
     * (`--scene-chrome-sheen` / `--scene-chrome-deep`), so the studio can be
     * retuned for *contrast* without touching the palette.
     */
    environment: {
      /** Equirect canvas, wide and short — it is blurred into mips anyway. */
      width: 1024,
      height: 512,
      /** Top of the sphere down to the horizon, as greyscale stops. */
      // Not 1.0 at the top: the sky is the **largest** area in the strip, so its
      // value is what the broad faces of the letters return. At full white the
      // faces went over the bloom threshold as one and the form disappeared
      // into a glowing blob. The bands and strips below stay hot — those are
      // small, and a highlight is exactly what should bloom.
      sky: [0.5, 0.36, 0.1] as const,
      /**
       * And below it. **Not black**: a metal facing the floor with nothing on it
       * returns nothing, and the letters came out as dark shapes with lit rims
       * — a silhouette, not chrome. This is the bounce that fills their faces.
       */
      ground: [0.08, 0.2] as const,
      /** Where the horizon sits, 0 at the top of the strip. */
      horizon: 0.52,
      /**
       * Horizontal softboxes. The first is the key above the horizon; the second
       * is the floor bounce that keeps the downward faces alive.
       */
      bands: [
        { at: 0.28, half: 0.06, value: 1 },
        { at: 0.74, half: 0.1, value: 0.5 },
      ] as const,
      /**
       * Vertical strips, as fractions across: each is a long highlight that
       * sweeps the form as it turns. Odd spacing on purpose — evenly spaced
       * strips read as a pattern rather than as a room.
       */
      strips: [
        { at: 0.08, half: 0.02, value: 1 },
        { at: 0.34, half: 0.012, value: 0.85 },
        { at: 0.63, half: 0.03, value: 1 },
        { at: 0.86, half: 0.014, value: 0.7 },
      ] as const,
    },
  },

  /**
   * Real bloom — a full-screen chain, not the back-face shell it replaces.
   *
   * `threshold` is what keeps it honest over a live field: the tide's own
   * brightest colour sits around 0.72 luminance, so a threshold above that
   * lets the chrome's highlights bloom without the whole background smearing.
   * Lower it and the field lifts as one; that is the first number to check if
   * the ending ever looks foggy.
   */
  bloom: {
    strength: 0.42,
    radius: 0.5,
    /**
     * Raised for the new studio. The chrome reflects a room with real whites in
     * it now, so at 0.82 the letters' broad faces all cleared the threshold and
     * bloomed as one — the word became a glowing slab with no form in it. At
     * 0.95 only the true highlights carry, which is what bloom is for.
     *
     * Still well above the tide's own brightest (~0.72), which is the number
     * that keeps the background from lifting as one. Check that first if the
     * ending ever looks foggy.
     */
    threshold: 0.95,
  },

  /**
   * The word the mesh becomes.
   *
   * An authored model now, not rasterised type. It used to be built here from a
   * glyph — canvas raster, coverage grid, isoline snap, extrusion, bevel — all
   * to manufacture a 3D object out of a font. None of that is needed once the
   * object arrives as one, and none of the *effect* depended on it: the lattice
   * is welded by `buildCoarseWireframe` exactly as the bust's is, which is what
   * lets the morph map junction to junction.
   */
  text: {
    /** Site content asset — one folder per section (see folder-structure.md). */
    modelUrl: "/assets/hero/AI.glb",
    /** Width of the word, in bounding-sphere radii. */
    widthRatio: 1.12,
    /**
     * Ceiling on its height, also in radii.
     *
     * The fit takes whichever of the two binds first. Width alone would let a
     * tall asset scale itself off the top of a stage that was sized for a bust.
     */
    maxHeightRatio: 1.12,
    /**
     * Weld cell for the word's lattice, as a fraction of its width — the
     * density dial. Smaller is a finer net with more junctions, and the count
     * grows with the square, so it is the first number to look at if the ending
     * ever feels expensive.
     */
    cellRatio: 0.017,
    /**
     * The hand-over, as fractions of the morph window.
     *
     * These do not overlap, and that is the point: the bust's net is gone
     * before the word's net arrives, so there is never a frame showing two
     * complete meshes at once. In between there are only the travelling
     * particles, which is what carries the eye across.
     */
    bustFadeEnd: 0.28,
    sparkFadeFrom: 0.06,
    sparkFadeTo: 0.34,
    /**
     * The edges arrive **late**, and that is the fix for a transition that read
     * as a mess: a lattice drawn while its nodes are still in flight is a net
     * of lines between points that have not got anywhere, and it hides the one
     * legible thing in the middle of the morph — the travelling sparks. They
     * now come in only once the nodes are essentially home.
     */
    latticeFadeFrom: 0.82,
    latticeFadeTo: 0.98,
    /**
     * How much of the morph is spent staggering the nodes' departure.
     *
     * With every node on one clock the cloud leaves and arrives together and
     * has no shape at any moment in between. Ordered mostly left-to-right (see
     * where the delays are built), it assembles instead.
     */
    morphStagger: 0.55,
    /**
     * When the chrome rises, as a fraction of the whole scroll — not of the
     * morph window, because it belongs to the stretch *after* it. It starts
     * just clear of the word settling, so the two are read one after the other.
     */
    fill: { from: 0.76, to: 0.99 },
    /** Half-width of the level's soft edge, in fractions of the word's height.
     *  Small: this is a surface ending, not a gradient. */
    fillEdge: 0.03,
    /** Extra light at the level itself — what makes it read as poured rather
     *  than clipped. */
    fillRim: 0.55,
    /**
     * Turns per second of the mark above the `i`, about its own axis.
     *
     * Only once the word has arrived: while the nodes are still travelling the
     * accent's group must sit unrotated, or it would drag their sources round
     * with it and the journey would curve for no reason.
     */
    accentSpin: 0.16,
    /**
     * Where in the morph the accent starts turning, so it **ramps** rather than
     * switching on.
     *
     * It used to be gated on the morph reaching 1 and driven from the clock:
     * `elapsed * accentSpin`, which by then is a large accumulated angle, so
     * the star snapped from zero to wherever the clock happened to be the frame
     * the gate opened — and snapped back every time the morph dipped under 1
     * again, which it does constantly while the reader scrolls around the end
     * of it. That is the jitter. The angle is integrated now and this is only
     * the speed's fade-in.
     */
    accentSpinFrom: 0.86,
  },

  /** ~1 viewport of warm-up, so the scene is running before it scrolls in. */
  inViewRootMargin: "100% 0px",
} as const;
