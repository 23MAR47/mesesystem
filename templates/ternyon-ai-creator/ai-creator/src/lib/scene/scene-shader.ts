/**
 * Shared GLSL for the model scene.
 *
 * Everything here is injected into stock three materials via `onBeforeCompile`,
 * never written as a raw `ShaderMaterial` — see `patchWireframeMaterial` for the
 * failure that rules out.
 *
 * The three materials (model, wireframe, background) must agree exactly on where
 * the stage lines are, where the brush has been, and — since the second stage
 * became a live field rather than a flat colour — what colour that field is at
 * this pixel. So the chunks live here and the three share **one uniforms object
 * by reference**.
 *
 * 📖 Docs: obsidian/frontend/components/common.md
 */

import * as THREE from "three";

import { sceneConfig } from "./scene.config";

const { tideField, stageRule } = sceneConfig;

/** Object-space position, shared by the brush mask, the bottom fade and the
 *  wireframe's glow. */
const varyingDeclaration = /* glsl */ `
  varying vec3 vScenePosition;
`;

/**
 * The hand-over into the word.
 *
 * Two meshes are involved and they travel in opposite directions, which is what
 * `MORPH_FROM` selects. The **bust's** mesh sits still and fades out; the
 * **word's** lattice starts at `aMorph` — a point on the bust — and arrives at
 * its own vertex position. So `uMorph` reads as "how far the letters have come"
 * for one and "how far the bust has gone" for the other, from one uniform.
 *
 * Their fades do not overlap. `uBustFade` is out before `uLatticeFade` is in, so
 * the middle of the transition shows travelling particles and no complete net
 * at all — a frame with two full meshes in it was the thing to avoid.
 */
/**
 * The chrome rising through the word.
 *
 * Object space, not screen space: the word turns a full revolution while this
 * sweeps, and a screen-space line would slide across the letters as they came
 * round. Anchored to the word's own vertical extent, the level stays where it
 * was poured.
 */
const wordFillFunction = /* glsl */ `
  uniform float uWordFill;
  uniform float uWordFillFrom;
  uniform float uWordFillTo;
  uniform float uWordFillEdge;

  /** 1 below the level, 0 above it. */
  float wordFill(vec3 p) {
    float height =
      (p.y - uWordFillFrom) / max(1e-4, uWordFillTo - uWordFillFrom);
    return 1.0 - smoothstep(
      uWordFill - uWordFillEdge,
      uWordFill + uWordFillEdge,
      height
    );
  }
`;

/**
 * The uniform half — safe in a fragment shader, which an `attribute` is not.
 * `MORPH_FROM` is what tells a material which side of the hand-over it is on.
 */
const morphFadeFunctions = /* glsl */ `
  uniform float uMorph;
  uniform float uBustFade;
  uniform float uLatticeFade;
  uniform float uLatticeSparkFade;

  #ifdef MORPH_FROM
    float morphFade() { return uLatticeFade; }
    float morphSparkFade() { return uLatticeSparkFade; }
  #else
    float morphFade() { return uBustFade; }
    float morphSparkFade() { return uBustFade; }
  #endif
`;

/** The vertex half. Only the word's lattice actually travels — the bust's mesh
 *  stays where it is and leaves by fading, so its `morphed` is the identity and
 *  it carries no `aMorph` data at all. */
const morphFunctions = /* glsl */ `
  ${morphFadeFunctions}

  #ifdef MORPH_FROM
    attribute vec3 aMorph;
    attribute float aDelay;
    uniform float uMorphStagger;

    /**
     * Every node used to travel on the same clock, and a cloud that leaves and
     * arrives all at once is a cloud with no shape at any moment in between —
     * which is exactly what the middle of the transition looked like. Each node
     * now has its own window inside the morph: it waits aDelay of the way in,
     * then eases across what is left. The windows all close at 1, so the word is
     * whole on time; what changes is that it *assembles* rather than appearing.
     */
    vec3 morphed(vec3 p) {
      float span = max(0.001, 1.0 - uMorphStagger);
      float t = clamp((uMorph - aDelay * uMorphStagger) / span, 0.0, 1.0);
      return mix(aMorph, p, t * t * (3.0 - 2.0 * t));
    }
  #else
    vec3 morphed(vec3 p) { return p; }
  #endif
`;

/** Everything a junction spark needs that is constant across its own quad. */
const sparkVaryings = /* glsl */ `
  varying float vSparkBrush;
  varying float vSparkBody;
`;

const vertexAssignment = /* glsl */ `
  vScenePosition = position;
`;

/** Simplex noise, shared by the tide field and the wireframe's glow. */
const noiseFunctions = /* glsl */ `
  vec2 sceneHash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float sceneNoise(vec2 p) {
    const float K1 = 0.366025404, K2 = 0.211324865;
    vec2 i = floor(p + (p.x + p.y) * K1);
    vec2 a = p - i + (i.x + i.y) * K2;
    float m = step(a.y, a.x);
    vec2 o = vec2(m, 1.0 - m);
    vec2 b = a - o + K2;
    vec2 c = a - 1.0 + 2.0 * K2;
    vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
    vec3 n = h * h * h * h * vec3(
      dot(a, sceneHash2(i)), dot(b, sceneHash2(i + o)), dot(c, sceneHash2(i + 1.0))
    );
    return dot(n, vec3(70.0));
  }
`;

/** The drawing-buffer size in device pixels. Declared on its own because three
 *  chunks want it — the stage lines, the tide and the mark — and a uniform may
 *  be declared only once per shader stage. */
const resolutionUniform = /* glsl */ `
  uniform vec2 uResolution;
`;

/**
 * The mark the pointer leaves — a smooth field cut at a hard level.
 *
 * **Two properties, and they pull against each other.** The boundary has to be
 * *hard* — no gradient anywhere across it — and it has to be *smooth*, a curve
 * rather than a chain of segments. A blurred disc gets the second and loses the
 * first; a tessellation (what this was, ADR-0055) gets the first and loses the
 * second, and reads as chopped. Both at once needs a **height field cut by a
 * step**: the field is smooth, so its contours are smooth, and the step makes
 * the contour an edge.
 *
 * The field is the stroke: the strongest point covering this pixel, falling off
 * to its own radius. A smooth, slowly drifting noise is added to it, and the
 * whole thing is thresholded. The noise is what stops the outline being a
 * circle — it pushes the contour in and out organically — and it is also what
 * makes the mark **come apart** rather than dim: as the stroke's strength
 * decays the field sinks under the level, and the places where the noise sits
 * high stay above it longest, so the patch breaks into islands and loses them
 * one at a time. Nothing about it fades.
 *
 * **Screen space, but the stroke is not.** The mark has to be the same field on
 * the model, its wireframe and the ground behind it, or it would break at the
 * silhouette — and a good part of it falls on the ground. The stroke's points
 * stay in **object space**, so the mark still sticks to the surface it was
 * painted on; the scene projects them to pixels each frame (`projectBrush`).
 *
 * Needs `uResolution` and `sceneNoise`, which the including shader declares.
 */
const brushMaskFunction = /* glsl */ `
  uniform vec4 uBrush[BRUSH_POINTS];  // xy = device px, z = radius px, w = life
  uniform float uMarkThreshold;
  uniform float uMarkWobble;
  uniform float uMarkScale;
  uniform float uMarkTime;
  uniform float uMarkTailFade;

  float brushMask(vec2 px) {
    // The ring arrives in **stroke order**, oldest first, and each entry is
    // joined to the next unless its radius is negative — see projectBrush.
    //
    // Segments, not points, and that is not a detail. A tapered stroke made of
    // discs comes apart into beads the moment the tail's radius drops under the
    // spacing between them, which is exactly what a taper does. A capsule is
    // continuous by construction whatever the spacing, and its radius can run
    // from one end to the other, which is what a tapering ribbon *is*.
    float field = 0.0;
    for (int i = 0; i < BRUSH_POINTS; i++) {
      vec4 a = uBrush[i];
      if (a.w <= 0.0) continue;

      vec2 near = a.xy;
      float radius = abs(a.z);
      float strength = a.w;

      if (a.z > 0.0 && i + 1 < BRUSH_POINTS) {
        vec4 b = uBrush[i + 1];
        if (b.w > 0.0) {
          vec2 span = b.xy - a.xy;
          float len2 = max(dot(span, span), 0.0001);
          float t = clamp(dot(px - a.xy, span) / len2, 0.0, 1.0);
          near = a.xy + span * t;
          radius = mix(abs(a.z), abs(b.z), t);
          strength = mix(a.w, b.w, t);
        }
      }

      float reach = 1.0 - distance(px, near) / max(radius, 1.0);
      // Weight holds until the very end of a point's life: the taper is what
      // thins the tail, and fading it as well would eat the mark from the
      // inside and take its length with it.
      float weight = smoothstep(0.0, uMarkTailFade, strength);
      field = max(field, weight * clamp(reach, 0.0, 1.0));
    }
    // Nothing here at all: skip the noise, which is most of the screen for most
    // of the time.
    if (field <= 0.0) return 0.0;

    // Sampled in **screen space**, deliberately, and three attempts at
    // something cleverer are the argument for it.
    //
    // The complaint that started them was that the mark reads as travelling
    // rather than turning, which is true of a screen-fixed pattern: the ribbon
    // slides through undulations that stay where they are. Every alternative
    // was worse, and all for the same underlying reason — the stroke is a
    // polyline of heavily overlapping capsules, so any coordinate derived from
    // *which* capsule a pixel belongs to is unstable. Measured against a
    // segment's own axis it jumps at every bend (ADR-0062); read off the
    // capsule holding the maximum it jumps between far-apart segments on the
    // smallest move, because a dozen capsules cover each pixel (ADR-0063);
    // averaged over them it goes soft and smears. A screen-fixed field has none
    // of those failure modes: it is continuous everywhere, by construction.
    //
    // So the mark trades an orientation it cannot hold for an outline that
    // never tears. If this is revisited, the fix is not another coordinate — it
    // is giving the stroke a real arc-length, accumulated on the CPU and
    // carried per point, so the shader never has to infer position along a
    // curve from the geometry it happens to be nearest.
    vec2 uv = px / uResolution.y * uMarkScale;
    float wobble = sceneNoise(uv + vec2(uMarkTime, -uMarkTime)) * uMarkWobble;
    return step(uMarkThreshold, field + wobble);
  }
`;

/**
 * Bottom fade — the "fog" that keeps the bust from ending on a hard cut.
 * Returns 1 where the model draws normally, 0 where it has dissolved.
 */
const bottomFadeFunction = /* glsl */ `
  uniform float uFadeStartY;
  uniform float uFadeEndY;
  uniform float uFadeMeshStartY;
  uniform float uFadeMeshEndY;

  float bottomFade(vec3 p) {
    return smoothstep(uFadeEndY, uFadeStartY, p.y);
  }

  /**
   * The mesh's own, much longer version of the same dissolve.
   *
   * Two things make it different from the lit model's, and the second is the
   * one that actually mattered.
   *
   * It is **longer**, because the mesh fades towards transparency over a live
   * field rather than towards a ground colour, and a short fade there does not
   * read as a dissolve at all.
   *
   * And it **finishes higher**. The lit model's fade is calibrated to the
   * geometry's lowest point — which on this asset is the ends of the hair, well
   * below the flat cut across the chest that is the thing actually needing
   * hiding. Fading out at the hair leaves the cut at nearly half strength and
   * perfectly visible; the mesh has to be gone before it.
   */
  float meshBottomFade(vec3 p) {
    return smoothstep(uFadeMeshEndY, uFadeMeshStartY, p.y);
  }
`;

/**
 * The first screen's display type, rasterised by the browser and handed to the
 * scene as coverage.
 *
 * The name has to be **inside** the canvas, and the reason is that everything
 * else on this screen already is. As a DOM layer behind the canvas it was at the
 * mercy of every opaque pixel the scene draws over it — the pointer's mark wiped
 * the letters as it passed. In front of the canvas it would stop the model
 * covering the middle of the word, which is the composition.
 *
 * So the browser still lays it out and still rasterises it — the element keeps
 * its `vw` type and its place in the document, and the scene reads its box, its
 * font and its colour and paints the same glyphs into a texture. Nothing about
 * the design is restated here; if the CSS moves, the texture moves with it.
 *
 * Drawn by the background quad, so the model's depth occludes it and the mark
 * passes underneath it.
 */
/**
 * How many pieces of type the scene can paint at once, and how many units —
 * letters or words — those pieces can be choreographed in between them.
 *
 * Hard ceilings, because both are uniform arrays and the loops over them have to
 * be bounded at compile time. Only the pieces currently showing are packed into
 * the arrays, so the ceiling is on what is on screen together, not on what the
 * page contains.
 */
export const INK_BOXES = 6;
export const INK_UNITS = 96;

const inkFunction = /* glsl */ `
  #define INK_BOXES ${INK_BOXES}
  #define INK_UNITS ${INK_UNITS}

  /** Every painted piece of type, packed into one atlas. */
  uniform sampler2D uInkTex;
  uniform int uInkBoxCount;
  /** Where the piece sits on screen: bottom-left corner, then size, buffer px. */
  uniform vec4 uInkScreen[INK_BOXES];
  /** Where its glyphs live in the atlas, normalised. */
  uniform vec4 uInkAtlas[INK_BOXES];
  /** The element's own colour, read back off it. */
  uniform vec3 uInkColor[INK_BOXES];
  /** Where this piece's units begin in uInkUnit, and how many it has. */
  uniform vec2 uInkRange[INK_BOXES];
  /**
   * One entry per unit: **x** is where it starts across its piece, 0–1, and
   * **y** is how much of it is showing.
   *
   * The choreography cannot be baked into the atlas — that would mean redrawing
   * and re-uploading the type every frame of a transition. So the atlas holds
   * the glyphs once and this holds the timing, and the two meet here.
   */
  uniform vec2 uInkUnit[INK_UNITS];
  /**
   * A shift for every painted piece, in buffer pixels.
   *
   * The closing screen's name is the deepest plane in a block that otherwise
   * moves as one, and it is a texture rather than an element — so its share of
   * the parallax has to be applied where it is drawn.
   */
  uniform vec2 uInkShift;

  /**
   * The painted type at this fragment: its colour, and how much of it is here.
   *
   * The pieces do not overlap on screen, so the first one containing the
   * fragment is the answer and the loop can stop there.
   */
  vec4 stageInk() {
    for (int i = 0; i < INK_BOXES; i++) {
      if (i >= uInkBoxCount) break;

      vec4 screen = uInkScreen[i];
      vec2 place = (gl_FragCoord.xy - screen.xy - uInkShift) / screen.zw;
      if (place.x < 0.0 || place.x > 1.0 || place.y < 0.0 || place.y > 1.0) {
        continue;
      }

      vec4 atlas = uInkAtlas[i];
      float cover = texture2D(uInkTex, atlas.xy + place * atlas.zw).a;
      if (cover < 0.002) continue;

      // Which unit this fragment falls in. The entries are in reading order and
      // their starts increase, so it is the last one that begins behind the
      // fragment — folded rather than searched, which keeps it branchless.
      int base = int(uInkRange[i].x);
      int count = int(uInkRange[i].y);
      float shown = uInkUnit[base].y;
      for (int u = 1; u < INK_UNITS; u++) {
        if (u >= count) break;
        vec2 unit = uInkUnit[base + u];
        shown = mix(shown, unit.y, step(unit.x, place.x));
      }

      return vec4(uInkColor[i], cover * shown);
    }
    return vec4(0.0);
  }
`;

/**
 * The pointer's lamp, in screen space.
 *
 * Screen space and not the surface, unlike the brush: this is a light being
 * held up to the model, not a mark left on it, so it must not travel with the
 * geometry as the model turns.
 */
const glowFunction = /* glsl */ `
  /** x, y in buffer pixels, z: how much of a pointer there is at all, 0–1. */
  uniform vec3 uGlow;
  uniform float uGlowRadius;
  uniform float uGlowDim;
  uniform float uGlowLift;
  uniform float uGlowHalo;

  /**
   * What this fragment's weight should be multiplied by.
   *
   * 1.0 wherever there is no pointer — a device that cannot hover gets the model
   * it always had, not a permanently dimmed one.
   */
  float glowNear(vec2 px) {
    float near = 1.0 - smoothstep(0.0, uGlowRadius, distance(px, uGlow.xy));
    // Eased twice: the lamp should have a soft core and no visible rim.
    return near * near;
  }

  float glowWeight(vec2 px) {
    return mix(1.0, mix(uGlowDim, uGlowLift, glowNear(px)), uGlow.z);
  }

  /** The halo's own, stronger lift — this is where the lamp gets its bloom. */
  float glowHalo(vec2 px) {
    return mix(1.0, mix(uGlowDim, uGlowHalo, glowNear(px)), uGlow.z);
  }
`;

/**
 * The stage lines, and the three zones they cut the screen into.
 *
 * Screen-space on purpose: these are fields arriving over the whole stage, so
 * they must not tilt or drift when the model turns. `gl_FragCoord` is in device
 * pixels, so the resolution uniform carries the **drawing buffer** size.
 */
const stageFunctions = /* glsl */ `
  uniform float uTideY;
  uniform float uDeepY;
  uniform float uLineEdge;
  uniform float uLineBow;

  /**
   * How far the line is lifted at this column.
   *
   * Half a sine across the viewport, so the line stays where it was at both
   * edges of the screen and only its middle rises. The amplitude is driven by
   * how fast the pointer is moving, and it is zero at a full stop, which is the
   * whole read: the line is a taut thing that bends when the hand throws it
   * about and settles straight when the hand stops.
   */
  float lineBow() {
    if (uLineBow == 0.0) return 0.0;
    return uLineBow * sin(3.14159265 * (gl_FragCoord.x / uResolution.x));
  }

  float lineMask(float lineY) {
    float y = gl_FragCoord.y / uResolution.y;
    float at = lineY + lineBow();
    return 1.0 - smoothstep(at - uLineEdge, at + uLineEdge, y);
  }

  // x = surface (white), y = tide (the live field), z = deep
  vec3 stageZones() {
    float t = lineMask(uTideY);
    float d = lineMask(uDeepY);
    return vec3(1.0 - t, clamp(t - d, 0.0, 1.0), d);
  }

`;

/**
 * The tide — a fire front creeping across a field, the scene's second stage.
 *
 * A fuel field is thresholded, and the **level set** of that threshold is the
 * front: char smoothsteps in behind it, an ember band sits on it, and licks
 * ride above. What makes the front advance is that the *fuel scrolls past a
 * fixed threshold*, not that the threshold ramps — a ramping threshold has to
 * wrap eventually, and a wrap in a fire is a visible seam. Scrolling the field
 * gives an edge that advances forever and never repeats.
 *
 * The pointer enters in two places, and neither is a highlight pasted on top.
 * Its *position* lowers the threshold nearby, so the front bulges toward the
 * hand the way fire leans into a draught; its *velocity* — the gap between the
 * two pointer poles, see `sceneConfig.tideField.pointerLead` — biases the
 * threshold along x, which smears the front into a wake that dissolves on its
 * own once the hand stops.
 *
 * The palette arrives as uniforms (design tokens); everything else is a constant
 * baked at module load. Grain is absent on purpose: the specification sets it to
 * 0, which makes the term identically zero, and the integer hash it is built on
 * does not exist in the GLSL dialect three compiles patched materials in.
 */
const tideFieldFunction = /* glsl */ `
  uniform vec3 uTideBg, uTideA, uTideB, uTideC, uTideD;
  uniform float uTideTime;
  uniform vec2 uTidePointer;
  uniform vec2 uTideVelocity;
  /** How far down the runway the reader is, and how fast they are travelling. */
  uniform float uTideScroll;
  uniform float uTideSurge;

  const int TIDE_OCTAVES = 3;
  const float TIDE_SCALE = float(${tideField.scale});
  const float TIDE_SPEED = float(${tideField.speed});
  const float TIDE_SPREAD = float(${tideField.spread});
  const float TIDE_RISE = float(${tideField.rise});
  const float TIDE_THRESHOLD = float(${tideField.threshold});
  const float TIDE_EMBER = float(${tideField.ember});
  const float TIDE_LICK = float(${tideField.lick});
  const float TIDE_ROUGH = float(${tideField.roughness});
  const float TIDE_LACUNARITY = float(${tideField.lacunarity});
  const float TIDE_CONTRAST = float(${tideField.contrast});
  const float TIDE_MIDPOINT = float(${tideField.midpoint});
  const float TIDE_SINK = float(${tideField.sink});
  const float TIDE_GLOW = float(${tideField.glow});
  const float TIDE_VIGNETTE = float(${tideField.vignette});
  const float TIDE_POINTER_RADIUS = float(${tideField.pointerRadius});
  const float TIDE_POINTER_STRENGTH = float(${tideField.pointerStrength});
  const float TIDE_WAKE = float(${tideField.wake});
  const float TIDE_PARALLAX = float(${tideField.parallax});
  const float TIDE_SCROLL_DRIFT = float(${tideField.scrollDrift});
  const float TIDE_SCROLL_SURGE = float(${tideField.scrollSurge});

  float tideFbm(vec2 p) {
    float v = 0.0, amp = 0.5;
    for (int i = 0; i < TIDE_OCTAVES; i++) {
      v += amp * sceneNoise(p);
      p *= TIDE_LACUNARITY;
      amp *= TIDE_ROUGH;
    }
    return v;
  }

  vec3 tideRamp(float t) {
    vec3 c = mix(uTideA, uTideB, smoothstep(0.00, 0.36, t));
    c = mix(c, uTideC, smoothstep(0.32, 0.70, t));
    c = mix(c, uTideD, smoothstep(0.66, 1.00, t));
    return c;
  }

  vec3 tideColor() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
    float t = uTideTime * TIDE_SPEED;

    vec2 d = uv - uTidePointer;
    float near = exp(-dot(d, d)
      / max(1e-4, TIDE_POINTER_RADIUS * TIDE_POINTER_RADIUS));

    // The fuel scrolls; the threshold does not. See the note above.
    // The clock slides the field sideways; the **scroll** slides it up and
    // across, so the ground reads as something being travelled over rather than
    // a loop playing behind the page.
    vec2 p = (uv - uTidePointer * TIDE_PARALLAX) * TIDE_SCALE
      + vec2(t * TIDE_SPREAD, 0.0)
      + vec2(uTideScroll * TIDE_SCROLL_DRIFT * 0.6,
             -uTideScroll * TIDE_SCROLL_DRIFT);
    float fuel = tideFbm(p * 1.5) * 0.5 + 0.5;

    // Fire leans toward a draught: the threshold drops where the hand is, and
    // tilts along the direction it is heading.
    float thr = TIDE_THRESHOLD
      - near * TIDE_POINTER_STRENGTH * 0.12
      - uTideVelocity.x * TIDE_WAKE * 0.05
      // Travelling fast opens the front up; standing still leaves it alone.
      - uTideSurge * TIDE_SCROLL_SURGE;
    float e0 = fuel - thr;

    float charred = smoothstep(0.02, -0.14, e0);
    float ember = exp(-e0 * e0 / max(1e-5, TIDE_EMBER * TIDE_EMBER));
    float lick = (tideFbm(vec2(p.x * 2.4, p.y * 1.2 - t * TIDE_RISE)) * 0.5 + 0.5)
      * ember * TIDE_LICK;

    float f = clamp(0.08 + charred * 0.10 + ember * 0.50 + lick * 0.34, 0.0, 1.0);
    f = clamp((f - TIDE_MIDPOINT) * TIDE_CONTRAST + 0.5, 0.0, 1.0);

    vec3 col = tideRamp(f);
    col += uTideD * TIDE_GLOW * pow(f, 4.0);
    col = mix(uTideBg, col, smoothstep(0.0, max(0.01, TIDE_SINK), f) * 0.9 + 0.1);
    col *= 1.0 - TIDE_VIGNETTE * dot(uv, uv);
    return col;
  }

  /**
   * The stage's colour at this pixel. The front costs two fbm walks — six noise
   * evaluations — so it is skipped outright where the tide has no weight; for
   * most of the scroll that is the whole screen, and a horizontal band is
   * exactly the shape a GPU can branch on coherently.
   */
  /**
   * Source-over, in **unpremultiplied** space.
   *
   * The quad's colour and alpha are carried separately right up to the write,
   * so anything painted onto a still-transparent quad has to replace the colour
   * rather than blend with it — mixing towards a ground that is not actually
   * being drawn tints the result by whatever the ground would have been.
   */
  void paintOver(inout vec3 dstRgb, inout float dstA, vec3 srcRgb, float srcA) {
    float a = srcA + dstA * (1.0 - srcA);
    if (a > 0.0001) {
      dstRgb = (srcRgb * srcA + dstRgb * dstA * (1.0 - srcA)) / a;
    }
    dstA = a;
  }

  /**
   * One rule, at a given row.
   *
   * Screen-space, like the stage lines it sits among — it is a rule on the page,
   * not a thing in the scene, so it must not move when the model turns.
   *
   * The row arrives already snapped to a fragment centre (see rowAt), so d
   * lands on whole numbers: 0, 1, 2 … The ramp is therefore written to reach
   * zero at exactly one row out, which makes a thickness of 1 light one row and
   * nothing else. The old ramp ran to uRuleHalf + 1.0 and, on an unsnapped row,
   * lit two rows at half weight — a grey two-pixel line whose weight changed
   * with the window height.
   */
  float ruleAt(float y) {
    float d = abs(gl_FragCoord.y - y);
    return uRuleOn * (1.0 - smoothstep(uRuleHalf - 0.5, uRuleHalf + 0.5, d));
  }

  const float IMMERSED_RULE_ALPHA = float(${stageRule.immersedOpacity});

  /**
   * The delivery screen's rule: how much of it to lay down, for a given set of
   * zone weights and row.
   *
   * One expression, called from two places on purpose — the background quad and
   * the model's own handover — so the line cannot come out as two different
   * greys either side of the word it crosses.
   *
   * uRuleImmersedFade is the delivery layer's window, the same number that
   * fades the copy hanging from this rule. The zone is still in the product,
   * but only to say which screen the line belongs to; **when** it arrives is
   * the layer's business.
   */
  float immersedRuleWeight(vec3 zones, float row) {
    return ruleAt(row) * zones.z * uRuleImmersedFade * IMMERSED_RULE_ALPHA;
  }

  vec3 stageColor(vec3 zones, float mark) {
    // The field runs under BOTH lower stages. The third line no longer brings a
    // colour of its own — what it changes is the model, not the ground — so the
    // early-out has to cover the pair or the field would blink off at it.
    float lit = zones.y + zones.z;
    vec3 field = vec3(0.0);
    if (lit > 0.001) field = tideColor();
    // The field keeps the curve — its glow term runs past 1 and relied on the
    // roll-off. The flat ground and the mark below do not: they are tokens, and
    // a token has to land as itself.
    vec3 ground = zones.x * uStageDisplay + lit * neutralToneMap(field);
    // The mark falls on the ground as well as on the model, and it carries what
    // it covers all the way to the mark's own token. Without it the shape stops dead
    // at the silhouette and reads as a hole cut in the subject; with it, it
    // reads as something passing over the whole stage. One place, so the model
    // and the background quad — which both call this — cannot disagree across
    // that silhouette, which is the only reason the mark looks like one shape
    // rather than two meeting at an edge.
    //
    // Weighted by the white zone for the same reason stageOpen is: the mark
    // does not exist below the tide line, and a ghost of it on the field would
    // be the only thing left of it there.
    // No rule here, deliberately. This is what the **model** dissolves into,
    // and a rule mixed in at this point showed straight through the subject:
    // the dissolve starts well above the waist, so by the rule's own height the
    // model was already handing over 20-30% of every fragment to the stage, and
    // the line came through the shirt. It is drawn by the background quad
    // instead, which the model depth-rejects — so the silhouette occludes it the
    // way anything behind the subject should be occluded.
    return mix(ground, uMarkDisplay, uMarkWash * mark * zones.x);
  }
`;

/**
 * The Khronos PBR Neutral curve, applied **here** rather than at the end of the
 * chain — which is the only way a design token can survive the pipeline.
 *
 * Three disables a material's tone mapping whenever it renders into a render
 * target (`WebGLPrograms`: the curve is only compiled in when the target is the
 * canvas), so with a composer the single tone map is `OutputPass`, at the very
 * end, over everything. That is right for lit surfaces and wrong for the flat
 * colours the design injects: the neutral curve compresses everything above
 * 0.76 and **never reaches 1.0**, so pure white came out 241 and the accent
 * blue came out 34,146,242 against the button beside it at 0,81,255. Not a
 * tuning error — no input reaches the curve's asymptote, so no amount of
 * pre-compensation could have fixed it.
 *
 * So the renderer is set to `NoToneMapping`, `OutputPass` does the sRGB encode
 * alone, and the curve is called by hand on the lit colour before the flat
 * colours are mixed in. Lit surfaces get exactly the same curve they always
 * had; a token lands on screen as the value it was authored as.
 */
const toneMapFunction = /* glsl */ `
  uniform float uToneExposure;

  vec3 neutralToneMap(vec3 color) {
    const float startCompression = 0.8 - 0.04;
    const float desaturation = 0.15;

    color *= uToneExposure;

    float x = min(color.r, min(color.g, color.b));
    float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
    color -= offset;

    float peak = max(color.r, max(color.g, color.b));
    if (peak < startCompression) return color;

    float d = 1.0 - startCompression;
    float newPeak = 1.0 - d * d / (peak + d - startCompression);
    color *= newPeak / peak;

    float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0);
    return mix(color, vec3(newPeak), g);
  }
`;

/**
 * How much of the model gives way to its stage, and how much of the mesh shows.
 *
 * They are the **same quantity**: wherever the mesh is revealed, the lit surface
 * is gone. On white the brush opens the model up so the stage shows through it;
 * on the tide the model is open by default and the brush closes it, restoring
 * the texture. Past the third line it is open for good and the brush has no say
 * — the mesh is leaving to become the word, and putting a bust texture back onto
 * geometry that is halfway to a letter would be nonsense.
 */
const revealFunction = /* glsl */ `
  /**
   * The mark is the **first stage's** alone.
   *
   * On white it opens the model, so the stage shows through where the pointer
   * has been. Below the tide line the model is open already and the mesh is
   * carrying the subject on its own; a mark there was putting the texture back
   * in patches over a wireframe that had just been established, and it read as
   * damage rather than as a reveal. So the tide is open outright, mark or no
   * mark, and so is everything past the third line.
   */
  float stageOpen(vec3 zones, float brush) {
    return zones.x * brush + zones.y + zones.z;
  }
`;

/**
 * The model burning in on arrival.
 *
 * Every fragment has a threshold of its own — three octaves of the scene's
 * noise over the raw object position, each drifting its own way — and is
 * discarded until the level has risen past it. So the surface appears in
 * scattered patches whose fronts move, rather than as a fixed stencil being
 * uncovered; the drift is what makes it read as liquid. The band just inside a
 * front is drawn as the ember, hottest at the edge that has just opened.
 *
 * At a level of 1 every threshold is under it by at least the edge, so the
 * function is a no-op: nothing is discarded and nothing is tinted. Object
 * space, so the pattern rides the model through its approach and its sway.
 */
const arrivalFunction = /* glsl */ `
  uniform float uArrive;
  uniform float uArriveEdge;
  uniform float uArriveScale;
  uniform float uArriveTime;
  uniform vec3 uArriveEmber;
  uniform vec3 uArriveLick;

  /** How far above this fragment's own threshold the level is. Negative is
   *  not yet arrived; within the edge of zero is the burning front. */
  float arriveLevel(vec3 p) {
    vec3 q = p * uArriveScale;
    float n = sceneNoise(q.xy + vec2(uArriveTime, 0.0)) * 0.55
            + sceneNoise(q.yz * 2.1 + vec2(0.0, -uArriveTime * 0.7)) * 0.3
            + sceneNoise(q.zx * 4.3 + vec2(uArriveTime * 0.5)) * 0.15;
    // Three octaves averaged crowd the middle of the range, and a threshold
    // that is nearly always 0.4–0.6 makes the whole burn happen in the middle
    // of the spring. Spread over the full 0–1 instead, so the first patches
    // open as soon as the level moves and the last close only at the end.
    // …and leaning low, so most of the surface has opened by the half: the
    // burn is a reveal, and a reveal that spends its first second on a few
    // scattered marks reads as nothing happening.
    float threshold = pow(smoothstep(-0.55, 0.55, n), 1.6);
    return uArrive * (1.0 + uArriveEdge) - threshold;
  }
`;

/**
 * Film grain, per-fragment, on the model only. Multiplicative and
 * darkening-only — grain is emulsion density, not added light, which is what
 * stops a white ground going grey.
 */
const grainFunction = /* glsl */ `
  uniform float uGrainIntensity;
  uniform float uGrainSeed;

  float grainHash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }

  float grainFactor() {
    float noise = grainHash(vec3(gl_FragCoord.xy, uGrainSeed));
    return 1.0 - noise * uGrainIntensity;
  }
`;

/** A triangular dither. Not decoration: a field this smooth bands visibly on an
 *  8-bit display without it. */
const ditherFunction = /* glsl */ `
  float sceneDither(vec2 fc) {
    float a = fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453);
    float b = fract(sin(dot(fc + 17.0, vec2(12.9898, 78.233))) * 43758.5453);
    return (a + b - 1.0) / 255.0;
  }
`;

/**
 * The mesh's glow, in object space so the bright patches belong to the model and
 * travel with it as it turns. A uniform bloom flattens the net back into a
 * decal; unevenness is what gives it volume.
 */
const wireGlowFunction = /* glsl */ `
  uniform float uWireGlowScale;
  uniform float uWireGlowFloor;
  uniform float uWireGlowRange;

  float wireGlow(vec3 p) {
    float n = sceneNoise(p.xy * uWireGlowScale) * 0.6
            + sceneNoise(p.zy * uWireGlowScale * 1.3) * 0.4;
    return uWireGlowFloor + uWireGlowRange * (0.5 + 0.5 * n);
  }
`;

export interface SceneUniforms {
  uBrush: { value: THREE.Vector4[] };
  uMarkThreshold: { value: number };
  uMarkWobble: { value: number };
  uMarkScale: { value: number };
  uMarkTime: { value: number };
  uMarkTailFade: { value: number };
  uMarkWash: { value: number };
  /** The first screen's rule: colour, centre and half-thickness in buffer px,
   *  and whether this instance draws it at all. */
  uRuleDisplay: { value: THREE.Vector3 };
  uRuleY: { value: number };
  uRuleHalf: { value: number };
  uRuleOn: { value: number };
  uRuleImmersedY: { value: number };
  uRuleImmersedDisplay: { value: THREE.Vector3 };
  uRuleImmersedFade: { value: number };
  /** The painted display type — see `inkFunction`. */
  uInkTex: { value: THREE.Texture | null };
  uInkBoxCount: { value: number };
  uInkScreen: { value: THREE.Vector4[] };
  uInkAtlas: { value: THREE.Vector4[] };
  uInkColor: { value: THREE.Vector3[] };
  uInkRange: { value: THREE.Vector2[] };
  uInkUnit: { value: THREE.Vector2[] };
  uInkShift: { value: THREE.Vector2 };
  /** Exposure for the hand-applied tone map — see `toneMapFunction`. */
  uToneExposure: { value: number };
  uMarkDisplay: { value: THREE.Vector3 };
  uFadeStartY: { value: number };
  /** Where the *mesh's* longer dissolve begins and ends — see `meshBottomFade`. */
  uFadeMeshStartY: { value: number };
  uFadeMeshEndY: { value: number };
  uFadeEndY: { value: number };
  /**
   * Display (sRGB-encoded) space — mixed into `gl_FragColor` *after* tone
   * mapping and the colour-space conversion. It has to happen there: tone
   * mapping does not map 1.0 to exactly 1.0, so fading towards a linear colour
   * in working space lands a shade off the background and leaves a seam.
   */
  uStageDisplay: { value: THREE.Vector3 };
  /** The tide's ramp, display space, in the order the field walks it. */
  uTideBg: { value: THREE.Vector3 };
  uTideA: { value: THREE.Vector3 };
  uTideB: { value: THREE.Vector3 };
  uTideC: { value: THREE.Vector3 };
  uTideD: { value: THREE.Vector3 };
  uTideTime: { value: number };
  /** The pointer's slow body pole, in the field's own aspect-corrected units. */
  uTidePointer: { value: THREE.Vector2 };
  /** Lead minus body: where the pointer is heading, and how hard. This *is*
   *  the velocity — it opens while the hand moves and closes a beat after it
   *  stops, which is what lets the wake dissolve with no history buffer. */
  uTideVelocity: { value: THREE.Vector2 };
  uTideScroll: { value: number };
  uTideSurge: { value: number };
  uGrainIntensity: { value: number };
  uGrainSeed: { value: number };
  /** The pointer's lamp — see `glowFunction`. */
  uGlow: { value: THREE.Vector3 };
  uGlowRadius: { value: number };
  uGlowDim: { value: number };
  uGlowLift: { value: number };
  uGlowHalo: { value: number };
  uWireOpacity: { value: number };
  uWireImmersedOpacity: { value: number };
  uWireDisplay: { value: THREE.Vector3 };
  uWireImmersedDisplay: { value: THREE.Vector3 };
  uWireGlowScale: { value: number };
  uWireGlowFloor: { value: number };
  uWireGlowRange: { value: number };
  /** 0 = the bust, 1 = the word. Drives `aMorph` on the lattice. */
  uMorph: { value: number };
  /** How much of the morph is spent staggering — see `morphed`. */
  uMorphStagger: { value: number };
  /** The chrome level rising through the word, 0..1 of its own height. */
  uWordFill: { value: number };
  uWordFillFrom: { value: number };
  uWordFillTo: { value: number };
  uWordFillEdge: { value: number };
  /** The hand-over, scheduled so the two nets are never both complete. */
  uBustFade: { value: number };
  uLatticeFade: { value: number };
  uLatticeSparkFade: { value: number };
  /** What a lattice spark is worth against a bust one — see `particles`. */
  uSparkLatticeScale: { value: number };
  uSparkLatticeShrink: { value: number };
  uSparkDisplay: { value: THREE.Vector3 };
  uSparkOpacity: { value: number };
  uSparkFalloff: { value: number };
  /** Above 1 — compensates for screen blending. See `particles.gain`. */
  uSparkGain: { value: number };
  /** The word's glow shell — display space, like every other written colour. */
  uSparkGlowInfluence: { value: number };
  /** Line positions, 0 (screen bottom) to 1 (top), and the AA rim. */
  uTideY: { value: number };
  uDeepY: { value: number };
  uLineEdge: { value: number };
  uLineBow: { value: number };
  /** Drawing-buffer size, because `gl_FragCoord` is in device pixels. */
  uResolution: { value: THREE.Vector2 };
  uChromeMetalness: { value: number };
  uChromeRoughness: { value: number };
  uChromeTint: { value: number };
  uChromeFalloff: { value: number };
  /** Working (linear) space — these tint `diffuseColor`, which is linear. */
  uChromeSheen: { value: THREE.Color };
  uChromeDeep: { value: THREE.Color };
  /** The arrival's level, 0..1. 1 — the default — is a model fully there. */
  uArrive: { value: number };
  uArriveEdge: { value: number };
  /** Noise cells per unit of object space — set once the geometry is known. */
  uArriveScale: { value: number };
  uArriveTime: { value: number };
  /** Display space, like every other written colour. */
  uArriveEmber: { value: THREE.Vector3 };
  uArriveLick: { value: THREE.Vector3 };
}

/** One uniforms object, shared by reference across the three materials. */
export const createSceneUniforms = (): SceneUniforms => {
  const {
    arrival,
    brush,
    chrome,
    grain,
    lighting,
    particles,
    stages,
    text,
    wireframe,
  } = sceneConfig;
  return {
    uBrush: {
      value: Array.from(
        { length: brush.points },
        () => new THREE.Vector4(0, 0, 0, 0),
      ),
    },
    uMarkThreshold: { value: brush.threshold },
    uMarkWobble: { value: brush.wobble },
    uMarkScale: { value: brush.noiseScale },
    uMarkTime: { value: 0 },
    uMarkTailFade: { value: brush.tailFade },
    uMarkWash: { value: brush.wash },
    uRuleDisplay: { value: new THREE.Vector3(0, 0, 0) },
    uRuleY: { value: -1 },
    uRuleHalf: { value: 0.5 },
    uRuleOn: { value: 0 },
    uRuleImmersedY: { value: -1 },
    uRuleImmersedDisplay: { value: new THREE.Vector3(1, 1, 1) },
    uRuleImmersedFade: { value: 0 },
    uInkTex: { value: null },
    uInkBoxCount: { value: 0 },
    uInkScreen: {
      value: Array.from({ length: INK_BOXES }, () => new THREE.Vector4()),
    },
    uInkAtlas: {
      value: Array.from({ length: INK_BOXES }, () => new THREE.Vector4()),
    },
    uInkColor: {
      value: Array.from({ length: INK_BOXES }, () => new THREE.Vector3()),
    },
    uInkRange: {
      value: Array.from({ length: INK_BOXES }, () => new THREE.Vector2()),
    },
    uInkUnit: {
      value: Array.from({ length: INK_UNITS }, () => new THREE.Vector2(0, 1)),
    },
    uInkShift: { value: new THREE.Vector2() },
    uToneExposure: { value: lighting.toneMappingExposure },
    uMarkDisplay: { value: new THREE.Vector3(1, 1, 1) },
    uFadeStartY: { value: 0 },
    uFadeEndY: { value: 0 },
    uFadeMeshStartY: { value: 0 },
    uFadeMeshEndY: { value: 0 },
    uStageDisplay: { value: new THREE.Vector3(1, 1, 1) },
    uTideBg: { value: new THREE.Vector3(0, 0, 0) },
    uTideA: { value: new THREE.Vector3(0, 0, 0) },
    uTideB: { value: new THREE.Vector3(1, 1, 1) },
    uTideC: { value: new THREE.Vector3(0, 0, 1) },
    uTideD: { value: new THREE.Vector3(1, 1, 1) },
    uTideTime: { value: 0 },
    uTidePointer: { value: new THREE.Vector2(0, 0) },
    uTideVelocity: { value: new THREE.Vector2(0, 0) },
    uTideScroll: { value: 0 },
    uTideSurge: { value: 0 },
    uGrainIntensity: { value: grain.intensity },
    uGrainSeed: { value: 0 },
    uGlow: { value: new THREE.Vector3(0, 0, 0) },
    uGlowRadius: { value: 1 },
    uGlowDim: { value: sceneConfig.pointerGlow.dim },
    uGlowLift: { value: sceneConfig.pointerGlow.lift },
    uGlowHalo: { value: sceneConfig.pointerGlow.haloLift },
    uWireOpacity: { value: wireframe.opacity },
    uWireImmersedOpacity: { value: wireframe.immersedOpacity },
    uWireDisplay: { value: new THREE.Vector3(0, 0, 0) },
    uWireImmersedDisplay: { value: new THREE.Vector3(1, 1, 1) },
    uWireGlowScale: { value: wireframe.glowNoiseScale },
    uWireGlowFloor: { value: wireframe.glowFloor },
    uWireGlowRange: { value: wireframe.glowRange },
    uMorph: { value: 0 },
    uMorphStagger: { value: text.morphStagger },
    uWordFill: { value: 0 },
    uWordFillFrom: { value: -1 },
    uWordFillTo: { value: 1 },
    uWordFillEdge: { value: text.fillEdge },
    uBustFade: { value: 1 },
    uLatticeFade: { value: 0 },
    uLatticeSparkFade: { value: 0 },
    uSparkLatticeScale: { value: particles.latticeScale },
    uSparkLatticeShrink: { value: particles.latticeShrink },
    uSparkDisplay: { value: new THREE.Vector3(1, 1, 1) },
    uSparkOpacity: { value: particles.opacity },
    uSparkFalloff: { value: particles.falloff },
    uSparkGain: { value: particles.gain },
    uSparkGlowInfluence: { value: particles.glowInfluence },
    uTideY: { value: stages.lineFrom },
    uDeepY: { value: stages.lineFrom },
    uLineEdge: { value: 0.001 },
    uLineBow: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uChromeMetalness: { value: chrome.metalness },
    uChromeRoughness: { value: chrome.roughness },
    uChromeTint: { value: chrome.tint },
    uChromeFalloff: { value: chrome.falloff },
    uChromeSheen: { value: new THREE.Color(1, 1, 1) },
    uChromeDeep: { value: new THREE.Color(0, 0, 1) },
    uArrive: { value: 1 },
    uArriveEdge: { value: arrival.edge },
    uArriveScale: { value: 1 },
    uArriveTime: { value: 0 },
    uArriveEmber: { value: new THREE.Vector3(0, 0, 1) },
    uArriveLick: { value: new THREE.Vector3(1, 1, 1) },
  };
};

export const brushDefines = (): Record<string, string> => ({
  BRUSH_POINTS: String(sceneConfig.brush.points),
});

/** Keeps all of three's PBR lighting and adds the stages on top of it. */
export const patchModelMaterial = (
  material: THREE.MeshStandardMaterial,
  uniforms: SceneUniforms,
): void => {
  material.defines = { ...material.defines, ...brushDefines() };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${varyingDeclaration}`)
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>\n${vertexAssignment}`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         ${resolutionUniform}
         ${varyingDeclaration}
         ${noiseFunctions}
         ${brushMaskFunction}
         ${bottomFadeFunction}
         ${toneMapFunction}
         ${inkFunction}
         uniform vec3 uRuleDisplay;
         uniform float uRuleY;
         uniform float uRuleHalf;
         uniform float uRuleOn;
         uniform float uRuleImmersedY;
         uniform vec3 uRuleImmersedDisplay;
         uniform float uRuleImmersedFade;
         ${stageFunctions}
         ${glowFunction}
         uniform vec3 uStageDisplay;
         uniform vec3 uMarkDisplay;
         uniform float uMarkWash;
         ${tideFieldFunction}
         ${revealFunction}
         ${arrivalFunction}
         ${grainFunction}
         uniform float uChromeMetalness;
         uniform float uChromeRoughness;
         uniform float uChromeTint;
         uniform float uChromeFalloff;
         uniform vec3 uChromeSheen;
         uniform vec3 uChromeDeep;`,
      )
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
         // First, before any lighting is paid for: a fragment the arrival has
         // not reached yet is not drawn at all, and writes no depth — so the
         // stage behind it, name and rule included, shows through the gap.
         float sceneArrive = arriveLevel(vScenePosition);
         if (sceneArrive < 0.0) discard;
         vec3 sceneZones = stageZones();
         float sceneBrush = brushMask(gl_FragCoord.xy);`,
      )
      // Stage 3: liquid chrome. Injected here because `normal` and
      // `vViewPosition` are final by now and `lights_physical_fragment` — which
      // reads roughness, metalness and diffuseColor into the lighting model —
      // has not run yet.
      //
      // Metal tints its reflection by its albedo, so the albedo is what decides
      // which metal this is: deep blue on the faces, bright sheen at grazing
      // angles where a real mirror reflects most, lifted so a dim IBL still
      // reads as polished rather than dark.
      .replace(
        "#include <lights_physical_fragment>",
        `float sceneFresnel =
           1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0);
         vec3 sceneChrome = mix(
           uChromeDeep, uChromeSheen, pow(sceneFresnel, uChromeFalloff)
         );
         diffuseColor.rgb =
           mix(diffuseColor.rgb, sceneChrome, sceneZones.z * uChromeTint);
         roughnessFactor = mix(roughnessFactor, uChromeRoughness, sceneZones.z);
         metalnessFactor = mix(metalnessFactor, uChromeMetalness, sceneZones.z);
         #include <lights_physical_fragment>`,
      )
      // Last chunk in main(): everything below runs in display space.
      .replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
         gl_FragColor.rgb *= grainFactor();
         // The lit colour, and only the lit colour. Everything mixed in below
         // is a design token and must reach the screen unchanged.
         gl_FragColor.rgb = neutralToneMap(gl_FragColor.rgb);

         vec3 sceneStage = stageColor(sceneZones, sceneBrush);
         // **The painted heading shows through the subject below the tide line.**
         // Down there the model's surface has already been given over to the
         // stage — what the reader sees of it is the mesh, not a skin — so the
         // stage it dissolves into should carry the type as well. Without this
         // the model still writes depth, the quad is rejected behind it, and the
         // heading is cut out in the shape of a body that is not itself visible.
         //
         // First stage excluded: there the model is a lit surface and the name
         // belongs behind it.
         vec4 sceneInk = stageInk();
         sceneStage = mix(
           sceneStage,
           sceneInk.rgb,
           sceneInk.a * (sceneZones.y + sceneZones.z)
         );
         // And the rule with it, for the same reason. The delivery screen's
         // subject is a word drawn as open lace: cut by its solid depth
         // silhouette, the line vanished across a region that looks empty, and
         // reappeared a long way on. Carried into the handover it reads
         // continuously across the word, which is what a rule is for.
         sceneStage = mix(
           sceneStage,
           uRuleImmersedDisplay,
           immersedRuleWeight(sceneZones, uRuleImmersedY)
         );

         // Two reasons to hand a fragment over to its stage, and the stronger
         // wins: the bottom fog, or the stage opening the model up. On white the
         // brush opens it so the stage shows *through* the model rather than
         // leaving a lit grey patch where the texture used to be.
         float sceneToStage = max(
           1.0 - bottomFade(vScenePosition),
           stageOpen(sceneZones, sceneBrush)
         );
         // Stays a colour, and the model stays **opaque**.
         //
         // Turning this into transparency on the white stage broke the two
         // things that are built on it: the pointer's mark and the bottom fade
         // both work by handing the model over to the stage, and the wireframe
         // revealed underneath is screen-blended *against* whatever that leaves
         // behind. Hand it over to nothing and there is nothing to blend with.
         //
         // It does not need to be transparent anyway: the scene surface token is
         // page's own ground now, so dissolving towards it is indistinguishable
         // from dissolving into the page — and the model being opaque is what
         // makes it cover the title behind the canvas.
         gl_FragColor.rgb = mix(gl_FragColor.rgb, sceneStage, sceneToStage);

         // The burning front, over everything: the ember where the surface
         // has just opened, the lick at the very edge — the field's own light
         // stop, not white, which on a porcelain ground read as holes — giving
         // way to whatever the fragment was going to be a little way in.
         float sceneEmber = 1.0 - smoothstep(0.0, uArriveEdge, sceneArrive);
         vec3 sceneEmberColor = mix(
           uArriveEmber, uArriveLick, pow(sceneEmber, 3.0)
         );
         gl_FragColor.rgb = mix(gl_FragColor.rgb, sceneEmberColor, sceneEmber);`,
      );
  };
  material.needsUpdate = true;
};

/**
 * The model's shadow, taught the same arrival.
 *
 * The shadow map is drawn with a depth material of its own, so on its own it
 * would carry the whole silhouette from the first frame — a head that is not
 * there yet, thrown onto a shoulder that is. The same discard, in the same
 * space, keeps the shadow to what is actually drawn. RGBA packing because that
 * is what the renderer's PCF shadow expects.
 */
export const patchModelDepthMaterial = (
  uniforms: SceneUniforms,
): THREE.MeshDepthMaterial => {
  const material = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
  });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${varyingDeclaration}`)
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>\n${vertexAssignment}`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         ${varyingDeclaration}
         ${noiseFunctions}
         ${arrivalFunction}`,
      )
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
         if (arriveLevel(vScenePosition) < 0.0) discard;`,
      );
  };
  return material;
};

/**
 * Patches the wireframe overlay's material in place.
 *
 * It is a stock unlit material rather than a raw `ShaderMaterial` on purpose. A
 * hand-written `ShaderMaterial` drawn into a scene that has shadows enabled
 * makes the renderer bind shadow samplers against a program that never declared
 * them — WebGL reports "mismatch between texture format and sampler type" and
 * drops every draw call in the frame, so the whole canvas comes back blank.
 *
 * `halo` builds the second, additively-blended copy: a GL line cannot be
 * widened, so the only honest bloom for 1px geometry is a slightly larger copy
 * drawn underneath. It is held to the stages that asked for it.
 */
export const patchWireframeMaterial = (
  material: THREE.MeshBasicMaterial | THREE.LineBasicMaterial,
  uniforms: SceneUniforms,
  { halo = false, lattice = false } = {},
): void => {
  material.defines = {
    ...material.defines,
    ...brushDefines(),
    ...(halo ? { WIRE_HALO: "" } : {}),
    // Which side of the hand-over this material is on. A define, not a
    // uniform: it never changes for a given material, and flipping one at
    // runtime would recompile every program in the scene.
    ...(lattice ? { MORPH_FROM: "" } : {}),
  };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
         ${varyingDeclaration}
         ${morphFunctions}`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         ${vertexAssignment}
         // The varying stays on the ORIGINAL position on purpose: the brush,
         // the bottom fade and the uneven glow are properties of the point on
         // the bust, and they have to travel with it rather than be resampled
         // wherever it has got to.
         transformed = morphed(position);`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         ${resolutionUniform}
         ${varyingDeclaration}
         ${noiseFunctions}
         ${brushMaskFunction}
         ${bottomFadeFunction}
         ${toneMapFunction}
         uniform vec3 uRuleDisplay;
         uniform float uRuleY;
         uniform float uRuleHalf;
         uniform float uRuleOn;
         uniform float uRuleImmersedY;
         uniform vec3 uRuleImmersedDisplay;
         uniform float uRuleImmersedFade;
         ${stageFunctions}
         ${glowFunction}
         ${revealFunction}
         ${wireGlowFunction}
         uniform float uWireOpacity;
         uniform float uWireImmersedOpacity;
         ${morphFadeFunctions}
         ${wordFillFunction}
         uniform vec3 uWireDisplay;
         uniform vec3 uWireImmersedDisplay;`,
      )
      .replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
         vec3 wireZones = stageZones();
         float wirePast = 1.0 - wireZones.x;
         // One immersed weight, not two blended by the stage mask: a weight
         // that changes across a screen-space line reads as a second, denser
         // mesh sweeping up through the model.
         float wireAlpha = stageOpen(wireZones, brushMask(gl_FragCoord.xy))
           * mix(uWireOpacity, uWireImmersedOpacity, wirePast)
           // Only past the first line: on white the model is a lit surface and
           // the mark is what the pointer does there.
           * mix(1.0, glowWeight(gl_FragCoord.xy), wirePast)
           // The fade dissolves the bottom of a *bust*, and only the word is
           // allowed out of it: a word has no bottom to hide and the fade would
           // shave its descenders.
           //
           // The bust keeps it to the end. Releasing it there — which is what
           // this line used to do for both — let go of the mask exactly as the
           // morph began, so the whole mesh stepped up to full weight and the
           // model flared in the last moment before it faded out. Measured at
           // 1.65x, a state that existed for no reason other than this mix.
           #ifdef MORPH_FROM
             * mix(meshBottomFade(vScenePosition), 1.0, uMorph)
           #else
             * meshBottomFade(vScenePosition)
           #endif
           * morphFade()
           #ifdef MORPH_FROM
             // Below the chrome level there is a surface now; the scaffold that
             // described it has nothing left to describe.
             * (1.0 - wordFill(vScenePosition))
           #endif
           * wireGlow(vScenePosition);
         #ifdef WIRE_HALO
           // The halo is the glow, so it lives only where the mesh carries the
           // subject — on white it would just fog a clean line. One value for
           // both immersed stages, same reason as the line weight above.
           wireAlpha *= ${sceneConfig.wireframe.haloOpacity} * wirePast
             // The lamp's glow, aimed: the crisp line above already took the
             // ordinary lift, and this is the spill around it.
             * mix(1.0, glowHalo(gl_FragCoord.xy) / max(0.0001, glowWeight(gl_FragCoord.xy)), wirePast);
         #endif
         if (wireAlpha <= 0.002) discard;
         gl_FragColor.rgb = mix(uWireDisplay, uWireImmersedDisplay, wirePast);
         #ifdef WIRE_HALO
           // The halo is screen-blended, and screen blending never reads alpha:
           // its contribution is rgb * (1 - dst). Writing the weight to
           // gl_FragColor.a there is a no-op, so every mask this pass computes —
           // the stage, the brush, and above all the bottom fade — has to be
           // carried by the **colour** instead, or the halo draws at full
           // strength through all of them and the dissolve never happens.
           gl_FragColor.rgb *= wireAlpha;
           gl_FragColor.a = 1.0;
         #else
           gl_FragColor.a = wireAlpha;
         #endif`,
      );
  };
  material.needsUpdate = true;
};

/**
 * Patches the junction sparks' material in place.
 *
 * A stock `PointsMaterial`, for the same reason the wireframe is a stock
 * material: a hand-written `ShaderMaterial` in a scene with shadows enabled
 * makes the renderer bind shadow samplers against a program that never declared
 * them, and every draw call in the frame is dropped.
 *
 * Two details worth knowing before editing.
 *
 * **The sprite has no texture.** It is a radial falloff read off
 * `gl_PointCoord` — a dot product, a `pow`, and an early `discard` outside the
 * disc. That discard is not a micro-optimisation: additive sprites are pure
 * overdraw, and throwing away the corners of every quad removes about a fifth
 * of the fragments before they blend.
 *
 * **The uneven glow is evaluated per *vertex*, not per fragment.** It is the
 * same `wireGlow` the mesh uses, so the sparks brighten and dim with the same
 * patches of the surface and read as belonging to it — but a spark is one point
 * covering many fragments, so sampling it once in the vertex shader costs two
 * noise evaluations per *sprite* instead of two per pixel.
 *
 * `points.glsl.js` has no `<dithering_fragment>` — the last chunk in its main()
 * is `<premultiplied_alpha_fragment>`, which is where the write goes so that it
 * lands after tone mapping and the colour-space conversion, in display space.
 */
export const patchParticleMaterial = (
  material: THREE.PointsMaterial,
  uniforms: SceneUniforms,
  { lattice = false } = {},
): void => {
  material.defines = {
    ...material.defines,
    ...brushDefines(),
    ...(lattice ? { MORPH_FROM: "" } : {}),
  };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
         ${resolutionUniform}
         ${varyingDeclaration}
         ${sparkVaryings}
         ${noiseFunctions}
         ${brushMaskFunction}
         ${bottomFadeFunction}
         ${wireGlowFunction}
         ${morphFunctions}
         uniform float uSparkGlowInfluence;
         uniform float uSparkOpacity;
         uniform float uSparkLatticeScale;
         uniform float uSparkLatticeShrink;

         // The letters are meant to read as even, so their sparks skip the
         // uneven surface glow the bust's carry — which also saves the two
         // noise evaluations per node. And the lattice is denser per screen
         // area, so its sparks are worth less light and less size, or they
         // blow out into a solid bar.
         #ifdef MORPH_FROM
           float sparkShape() { return 1.0; }
           float sparkWeight() { return uSparkLatticeScale; }
           float sparkSize() { return uSparkLatticeShrink; }
         #else
           float sparkShape() {
             return mix(1.0, wireGlow(position), uSparkGlowInfluence);
           }
           float sparkWeight() { return 1.0; }
           float sparkSize() { return 1.0; }
         #endif`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         ${vertexAssignment}
         // Everything here is a function of the sprite's single object-space
         // point, so it has exactly one value across the whole quad. Computing
         // it per fragment was not more accurate, only more expensive.
         transformed = morphed(position);
         #ifdef MORPH_FROM
           float sparkFade = mix(meshBottomFade(position), 1.0, uMorph);
         #else
           // The bust keeps its bottom fade to the end — see the wireframe.
           float sparkFade = meshBottomFade(position);
         #endif
         vSparkBody = sparkFade
           * sparkShape()
           * sparkWeight()
           * morphSparkFade()
           * uSparkOpacity;`,
      )
      // The sprite shrinks with the cloud for the same reason it dims: a point
      // that was one of many across a shoulder becomes one of many inside a
      // letter stroke, and at the old size they merge into a solid bar.
      // The mark is a screen-space field, so the sprite can only ask where it
      // has landed once it has been projected.
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
         vSparkBrush = brushMask(
           (gl_Position.xy / gl_Position.w * 0.5 + 0.5) * uResolution
         );`,
      )
      .replace("gl_PointSize = size;", "gl_PointSize = size * sparkSize();");

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         ${resolutionUniform}
         ${varyingDeclaration}
         ${sparkVaryings}
         ${toneMapFunction}
         uniform vec3 uRuleDisplay;
         uniform float uRuleY;
         uniform float uRuleHalf;
         uniform float uRuleOn;
         uniform float uRuleImmersedY;
         uniform vec3 uRuleImmersedDisplay;
         uniform float uRuleImmersedFade;
         ${stageFunctions}
         ${glowFunction}
         ${revealFunction}
         ${wordFillFunction}
         uniform vec3 uSparkDisplay;
         uniform float uSparkFalloff;
         uniform float uSparkGain;`,
      )
      .replace(
        "#include <premultiplied_alpha_fragment>",
        `#include <premultiplied_alpha_fragment>
         // Cheapest test first: a quarter of every sprite quad lies outside the
         // disc, and additive sprites are pure overdraw.
         vec2 sparkCoord = gl_PointCoord - 0.5;
         float sparkR2 = dot(sparkCoord, sparkCoord);
         if (sparkR2 > 0.25) discard;

         // The stage mask stays per-fragment — it is screen-space, and rounding
         // it to the sprite would make the line pop points on and off as it
         // sweeps instead of cutting through them.
         vec3 sparkZones = stageZones();
         // Both immersed stages, not just the tide — the third stage is where
         // the letters live, and gating on zones.y alone put their junction
         // sparks at exactly zero there.
         float sparkLit = sparkZones.y + sparkZones.z;
         float sparkAlpha =
           sparkLit
           * stageOpen(sparkZones, vSparkBrush)
           * vSparkBody
           * mix(1.0, glowWeight(gl_FragCoord.xy), 1.0 - sparkZones.x);
         #ifdef MORPH_FROM
           sparkAlpha *= 1.0 - wordFill(vScenePosition);
         #endif
         if (sparkAlpha <= 0.002) discard;

         float sparkFall = pow(1.0 - sqrt(sparkR2) * 2.0, uSparkFalloff);
         // Additive: the colour *is* the contribution, so it carries the alpha.
         gl_FragColor =
           vec4(uSparkDisplay * uSparkGain * sparkFall * sparkAlpha, 1.0);`,
      );
  };
  material.needsUpdate = true;
};

/**
 * Patches the word's solid in place — the chrome that rises through it.
 *
 * This is where the chrome the third stage used to wear on the bust finally
 * lands. It was dormant from ADR-0036 onwards: the bust's surface is given over
 * to the field, so nothing it computed could reach the screen. Same ramp, same
 * uniforms, applied to a surface that is actually drawn.
 *
 * Metal tints its reflection by its **albedo**, so the albedo is what decides
 * which metal this is: deep on the faces, bright sheen at grazing angles where
 * a real mirror reflects most.
 *
 * The fill is a `discard`, not a blend. A partially transparent metal is not a
 * half-filled one — it is a ghost — and the level has to read as a surface
 * ending, with the wireframe carrying on above it. The thin band at the level
 * itself is brightened, which is what makes it read as poured rather than
 * clipped.
 */
export const patchWordChromeMaterial = (
  material: THREE.MeshStandardMaterial,
  uniforms: SceneUniforms,
): void => {
  const { text } = sceneConfig;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
${varyingDeclaration}`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
${vertexAssignment}`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         ${varyingDeclaration}
         ${noiseFunctions}
         ${wordFillFunction}
         ${toneMapFunction}
         uniform float uChromeMetalness;
         uniform float uChromeRoughness;
         uniform float uChromeFalloff;
         uniform vec3 uChromeSheen;
         uniform vec3 uChromeDeep;`,
      )
      .replace(
        "#include <lights_physical_fragment>",
        `if (wordFill(vScenePosition) < 0.5) discard;
         float wordFresnel =
           1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0);
         // Stays inside [0,1]: this is a reflectance, and the brightness comes
         // from envMapIntensity on the material instead.
         diffuseColor.rgb = mix(
           uChromeDeep, uChromeSheen, pow(wordFresnel, uChromeFalloff)
         );
         roughnessFactor = uChromeRoughness;
         metalnessFactor = uChromeMetalness;
         #include <lights_physical_fragment>`,
      )
      .replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
         // Lit chrome, so it takes the curve; the sheen added below is a token.
         gl_FragColor.rgb = neutralToneMap(gl_FragColor.rgb);
         // The waterline. A hair of extra light exactly where the level is, so
         // the surface reads as ending rather than as cut off.
         float wordLevel = wordFill(vScenePosition);
         gl_FragColor.rgb += uChromeSheen
           * ${text.fillRim}
           * (1.0 - abs(wordLevel * 2.0 - 1.0));`,
      );
  };
  material.needsUpdate = true;
};

/**
 * Patches the background quad's material in place.
 *
 * The renderer's clear colour is a single colour, and the stage is up to three
 * at once — one of them a live field. A fullscreen quad drawn before everything
 * else paints every band in one pass, and the model then draws over it normally.
 *
 * `project_vertex` is left in place and its `gl_Position` overridden afterwards,
 * rather than replaced — later chunks still reference the `mvPosition` it
 * declares, and removing it breaks them under the fog/worldpos ifdefs.
 */
export const patchBackgroundMaterial = (
  material: THREE.MeshBasicMaterial,
  uniforms: SceneUniforms,
): void => {
  // The ground reads the mark now, so it needs the ring's size like every
  // other material that does.
  material.defines = { ...material.defines, ...brushDefines() };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    // Far plane, not near: the quad is depth-tested and drawn *after* the
    // model, so the depth the model already wrote rejects it. That is what
    // stops the tide walk being evaluated a second time behind an opaque
    // subject that covers a third of the stage. Cleared depth is also 1.0, and
    // three's default depthFunc is LessEqual, so the empty stage still passes.
    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      `#include <project_vertex>
       gl_Position = vec4(position.xy, 1.0, 1.0);`,
    );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         ${resolutionUniform}
         ${varyingDeclaration}
         ${noiseFunctions}
         ${brushMaskFunction}
         ${toneMapFunction}
         uniform vec3 uRuleDisplay;
         uniform float uRuleY;
         uniform float uRuleHalf;
         uniform float uRuleOn;
         uniform float uRuleImmersedY;
         uniform vec3 uRuleImmersedDisplay;
         uniform float uRuleImmersedFade;
         ${stageFunctions}
         ${glowFunction}
         uniform vec3 uStageDisplay;
         uniform vec3 uMarkDisplay;
         uniform float uMarkWash;
         ${inkFunction}
         ${tideFieldFunction}
         ${ditherFunction}`,
      )
      .replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
         vec3 bgZones = stageZones();
         float bgMark = brushMask(gl_FragCoord.xy);
         vec3 bgColor = stageColor(bgZones, bgMark);
         bgColor += sceneDither(gl_FragCoord.xy) * ${sceneConfig.tideField.ditherAmount};
         // Opaque under the tide and past the third line. On the white stage
         // the ground is the page's, not the canvas's — so the quad paints only
         // what it has to and stays transparent everywhere else.
         float bgAlpha = clamp(
           bgZones.y + bgZones.z + uMarkWash * bgMark * bgZones.x,
           0.0,
           1.0
         );

         // The first screen's UI, painted **here** and nowhere else. The quad
         // depth-tests against the model, so everything below is occluded by the
         // subject exactly as a thing standing behind it would be — while still
         // landing on top of the mark, which is drawn into bgColor above.
         paintOver(bgColor, bgAlpha, uRuleDisplay, ruleAt(uRuleY) * bgZones.x);
         // The **delivery** screen has a rule of its own, and it is here for the
         // same reason the first screen's is: the quad depth-tests against the
         // subject, so a line drawn by it goes under the chrome word instead of
         // across it. As a DOM layer in front of the canvas it ran straight over
         // the word.
         //
         // Gated on bgZones.z alone. The screen before it, the wireframe one,
         // has no full-width rule — only the three short ones down its right
         // column, which are DOM and belong to the stats they head. Weighting
         // this by y + z put a line across that screen that no design ever
         // asked for.
         paintOver(
           bgColor,
           bgAlpha,
           uRuleImmersedDisplay,
           immersedRuleWeight(bgZones, uRuleImmersedY)
         );
         // No stage gate: each piece of type is faded by the window of the
         // screen it belongs to, and those screens are not all the first one.
         vec4 ink = stageInk();
         paintOver(bgColor, bgAlpha, ink.rgb, ink.a);
         // **Premultiplied**, and it has to be: this material has no blending
         // (transparent is false), so what it writes lands in the buffer
         // verbatim — and the canvas context is premultipliedAlpha. Write the
         // colour straight and an alpha of 0 still contributes its full colour
         // to the page, which shows up as the ground washing over whatever is
         // behind the canvas.
         gl_FragColor = vec4(clamp(bgColor, 0.0, 1.0) * bgAlpha, bgAlpha);`,
      );
  };
  material.needsUpdate = true;
};
