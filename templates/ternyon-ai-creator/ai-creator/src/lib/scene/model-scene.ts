/**
 * The hero model scene — a portrait scan floating on a white stage.
 *
 * Lighting is a key and a rim over a low image-based floor. The IBL is
 * deliberately *not* the main source: an omnidirectional soft box fills every
 * crevice equally, which is definitionally flat, and that flatness is most of
 * why an untextured scan reads as plasticine. The key shapes, the rim puts an
 * edge on the silhouette, and the key also casts the model onto itself — there
 * is no floor, so self-shadowing is where all the contact information comes
 * from.
 *
 * Three effects are injected into the model's shader rather than composited
 * over the frame: the film grain (so the stage stays clean), the bottom fade
 * that dissolves the bust's flat cut, and the brush that washes the texture off
 * and reveals the topology underneath. See `scene-shader.ts`.
 *
 * 📖 Docs: obsidian/workflows/optimize-3d-scene.md
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

import { subscribeToTicker } from "@/lib/animation/ticker";

import { Brush } from "./brush";
import { buildCoarseWireframe, type CoarseWireframe } from "./coarse-wireframe";
import {
  loadWordModel,
  sourceFromJunctions,
  type WordPart,
} from "./word-model";
import {
  clampedPixelRatio,
  deviceTier,
  frameBudgetMs,
  sceneShouldFreeze,
  wantsAntialias,
  wantsLiteScene,
  wantsPointer,
  textureLimit,
  wantsShadows,
  type DeviceTier,
} from "./device";
import {
  createSceneUniforms,
  INK_BOXES,
  INK_UNITS,
  patchBackgroundMaterial,
  patchModelDepthMaterial,
  patchModelMaterial,
  patchParticleMaterial,
  patchWordChromeMaterial,
  patchWireframeMaterial,
  type SceneUniforms,
} from "./scene-shader";
import { sceneConfig } from "./scene.config";

const MILLISECONDS = 1000;

/** Remaps `value` from the span [from, to] onto 0..1, clamped outside it. */
const window01 = (value: number, from: number, to: number): number =>
  THREE.MathUtils.clamp((value - from) / (to - from), 0, 1);

/** The same window, eased at both ends — the hand-over's fades are watched
 *  closely enough that a linear ramp shows its corners. */
const smoothstep01 = (value: number, from: number, to: number): number => {
  const t = window01(value, from, to);
  return t * t * (3 - 2 * t);
};

/**
 * Screen blending, applied to every glow pass in the scene.
 *
 * These passes used to be `AdditiveBlending`, which is `dst + src` — it has no
 * ceiling, so how bright the glow *looks* depends entirely on what is already
 * behind it. The stage's field drifts slowly, so a bright ridge passing behind
 * the model pushed the mesh into saturation and out again: the model appeared
 * to light up and settle on its own, with nothing in the scroll or the geometry
 * changing. That is the flash.
 *
 * Screen is `src * (1 - dst) + dst`. Over a dark ground it is indistinguishable
 * from additive; over a bright one the contribution is scaled down by exactly
 * how bright the ground already is, so it can never blow out. The glow survives
 * and the pumping does not.
 */
const applyScreenBlending = (material: THREE.Material): void => {
  material.blending = THREE.CustomBlending;
  material.blendEquation = THREE.AddEquation;
  material.blendSrc = THREE.OneMinusDstColorFactor;
  material.blendDst = THREE.OneFactor;
};

/** A computed length that may be a percentage of its own box. */
const cssLength = (value: string, basis: number): number => {
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount)) return 0;
  return value.trim().endsWith("%") ? (amount / 100) * basis : amount;
};

/**
 * An element's box in the **layout** space of an ancestor — no transforms.
 *
 * `getBoundingClientRect` reports the box after every ancestor transform, which
 * is the wrong space for this: the closing screen's scene lives inside the
 * gallery's rising panel, and the type was measured while that panel was still
 * tilted and translated under the fold. The reading was internally consistent
 * and completely wrong — the heading came out a tenth too large and a hundred
 * pixels right of its box, and never corrected, because nothing re-measures once
 * the layout stops changing.
 *
 * The offset chain is the same measurement the browser lays the element out
 * with, so it is stable whatever is being done to the panel on screen.
 */
const layoutBox = (
  element: HTMLElement,
  host: HTMLElement,
): {
  left: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
} => {
  let left = 0;
  let top = 0;
  let node: HTMLElement | null = element;
  while (node && node !== host) {
    left += node.offsetLeft;
    top += node.offsetTop;
    // Its **own** shift counts — the first screen's name is centred with
    // `left-1/2 -translate-x-1/2`, and an offset chain alone puts it half its
    // width right of where it is drawn.
    //
    // Both properties, because Tailwind v4 writes the standalone `translate`
    // rather than a `transform`, and a computed `translate` keeps its
    // **percentages** — resolved here against the element's own border box,
    // which is what a percentage there means.
    const style = getComputedStyle(node);
    if (style.transform && style.transform !== "none") {
      const matrix = new DOMMatrixReadOnly(style.transform);
      left += matrix.e;
      top += matrix.f;
    }
    if (style.translate && style.translate !== "none") {
      const [x = "0", y = "0"] = style.translate.split(/\s+/);
      left += cssLength(x, node.offsetWidth);
      top += cssLength(y, node.offsetHeight);
    }
    node = node.offsetParent as HTMLElement | null;
  }
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  return { left, top, bottom: top + height, width, height };
};

/**
 * The units a line is choreographed in, and where each one starts in it.
 *
 * `at` is an index into the original string, so the caller can measure the run
 * up to it with the same context that drew the line — which is what keeps the
 * boundaries the font's own advances rather than an estimate.
 */
const splitInk = (text: string, mode: "letter" | "word"): { at: number }[] => {
  if (mode === "letter") return [...text].map((_, index) => ({ at: index }));
  const units: { at: number }[] = [];
  let at = 0;
  let inWord = false;
  for (let i = 0; i < text.length; i++) {
    const space = /\s/.test(text[i]);
    if (!space && !inWord) {
      at = i;
      units.push({ at });
      inWord = true;
    } else if (space) {
      inWord = false;
    }
  }
  return units.length ? units : [{ at: 0 }];
};

/**
 * One piece of type the scene paints instead of the browser.
 *
 * `units` are the letters or words it is choreographed in: `start` is where the
 * unit begins across the piece, 0-1, and `seed` is where it falls in the
 * scrambled order, also 0-1 — fixed once, so a unit keeps its turn for the life
 * of the scene and the line resolves the same way every time it arrives.
 */
interface InkBox {
  element: HTMLElement;
  /** Which layer's window fades it — read off the nearest `data-scene-layer`. */
  layer: number;
  units: { start: number; seed: number }[];
  /** Bottom-left corner and size on screen, in buffer pixels. */
  screen: THREE.Vector4;
  /** Where its glyphs live in the atlas, normalised. */
  atlas: THREE.Vector4;
  color: THREE.Color;
  /** How much of it its layer is currently showing. */
  fade: number;
}

/**
 * A character's place in the scrambled order, 0-1.
 *
 * Deterministic on purpose. The effect is that the eye cannot predict which
 * letter lands next; it is *not* that the line differs between arrivals, which
 * is what `Math.random` would give — the same heading coming back a second time
 * resolving differently reads as a glitch, not as a flourish.
 *
 * Normalised by the line's length so a short heading spends the same share of
 * its window handing out turns as a long one.
 */
const shuffledSeed = (index: number, length: number): number => {
  // A cheap integer hash — enough to decorrelate neighbours, which is the whole
  // requirement. Nothing here depends on it being a good generator.
  const hash = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return length > 1 ? hash - Math.floor(hash) : 0;
};

/** Design tokens stay the source of truth for colour — read them from CSS
 *  rather than restating a literal here (hard rule #4). */
const readTokenColor = (token: string, fallback: THREE.Color): THREE.Color => {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  if (!raw) return fallback;
  try {
    return new THREE.Color(raw);
  } catch {
    return fallback;
  }
};

/**
 * A token's colour as the injected shaders want it: **linear**, working space.
 *
 * These uniforms are written past `<colorspace_fragment>`, so nothing in the
 * material converts them — which used to mean they had to arrive pre-encoded
 * as sRGB. With the post chain that is exactly backwards: the scene now renders
 * into a linear target and `OutputPass` does the tone mapping and the encoding
 * once, at the end, for everything. Handing it a value that was already encoded
 * encodes it twice, which lifts the midtones hard — measured as the whole field
 * washing out pale while nothing else about the frame had changed.
 *
 * So the conversion is gone and the name is all that remains of it: one
 * pipeline, one encode, the injected colours travelling in the same space as
 * every lit surface beside them.
 */
/**
 * A texture's image, redrawn no larger than `limit` on its longest edge.
 *
 * `null` when it is already small enough, so the caller can skip the upload
 * entirely rather than replacing an image with a copy of itself.
 *
 * A canvas rather than a resized bitmap: `createImageBitmap` with
 * `resizeWidth` is not available everywhere this has to run, and the drawn
 * canvas is what three wants anyway. The texture's colour space and wrapping
 * are properties of the texture, not the image, so swapping the image keeps
 * them.
 */
const downscaled = (
  image: CanvasImageSource & { width: number; height: number },
  limit: number,
): HTMLCanvasElement | null => {
  const longest = Math.max(image.width, image.height);
  if (!Number.isFinite(limit) || longest <= limit) return null;
  const scale = limit / longest;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
};

/**
 * Hand the frame back before doing the next piece of work.
 *
 * Used to break the load's longest stretch into pieces the opening curtain can
 * animate between — see `prewarm`.
 */
const nextFrame = (): Promise<void> =>
  new Promise((resolve) => requestAnimationFrame(() => resolve()));

const toDisplay = (color: THREE.Color): THREE.Vector3 =>
  new THREE.Vector3(color.r, color.g, color.b);

export interface ModelSceneOptions {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  /**
   * The pinned stage: the canvas and every layer around it.
   *
   * The scene paints the screen's display type (`data-scene-ink`), which is a
   * **sibling** of the canvas, not a child of its container — so it needs the
   * box that holds both. Defaults to the container, which is the same rect.
   */
  overlayHost?: HTMLElement;
  /**
   * Whether this instance draws the first screen's rule.
   *
   * Only the hero has one. A second instance standing on another ground would
   * otherwise paint a line across it, since every instance shares the shader.
   */
  stageRule?: boolean;
}

export class ModelScene {
  private readonly canvas: HTMLCanvasElement;
  private readonly container: HTMLElement;
  private readonly tier: DeviceTier;
  /** The lite choreography — see `wantsLiteScene` and `sceneConfig.lite`. */
  private readonly lite: boolean;

  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;

  /** Outer group takes the pointer tilt, inner group takes the idle sway, so
   *  the two never fight over the same euler. */
  private readonly tiltGroup = new THREE.Group();
  private readonly swayGroup = new THREE.Group();

  private readonly uniforms: SceneUniforms;
  private readonly brush: Brush;
  private readonly raycaster = new THREE.Raycaster();
  /** Scratch for `projectBrush` — a per-frame allocation would be a GC stall. */
  private readonly projected = new THREE.Vector3();
  /** Where the mark lands when the pointer is off the subject. */
  private readonly markPlane = new THREE.Plane();
  /** Last frame's scroll progress, for the speed the bow is driven by. */
  private bowProgress = -1;
  /** 0..1, how fast the reader is scrolling — bows the stage lines. */
  private arc = 0;
  private readonly viewDirection = new THREE.Vector3();

  private environmentTexture: THREE.Texture | null = null;
  /** The chrome's own studio — see `buildChromeEnvironment`. */
  private chromeEnvironment: THREE.Texture | null = null;
  private readonly lights: THREE.DirectionalLight[] = [];
  private modelMesh: THREE.Mesh | null = null;
  private wireframeMesh: THREE.LineSegments | null = null;
  private wireframeHalo: THREE.LineSegments | null = null;
  /** Additive sprites on the welded mesh's junctions. */
  private wireframeSparks: THREE.Points | null = null;
  /** Junction positions of the welded mesh, kept for the word's sources. */
  private junctions: Float32Array | null = null;
  /** How far the mesh has travelled towards the word, 0..1. */
  private morph = 0;
  /** False once the bust's net has faded out entirely — see `syncHandover`. */
  private bustMeshVisible = true;
  /**
   * Everything the word is made of, in build order — for each of the asset's
   * parts: the lattice, its junction sparks, the solid and the glow shell.
   *
   * A flat list rather than named slots because the asset decides how many
   * parts there are, and the scene has no business caring.
   */
  private wordLattices: THREE.LineSegments[] = [];
  private wordSparks: THREE.Points[] = [];
  private wordSolids: THREE.Mesh[] = [];
  /**
   * The word's own root, hung off the group the scroll turn rotates.
   *
   * Not off the bust's mesh, which is where it used to live. That mesh's local
   * origin is wherever the asset's author left it and its matrix carries the
   * asset's own scale, so a word centred on the origin arrived off-centre and
   * at a size `widthRatio` did not actually describe. Here the origin is the
   * axis the scene turns about, and one radius means one radius.
   */
  private wordRoot: THREE.Group | null = null;
  /** The mark above the letters, in a group of its own so it can turn. */
  private accentGroup: THREE.Group | null = null;
  private readonly accentPivot = new THREE.Vector3();
  private composer: EffectComposer | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private backgroundMesh: THREE.Mesh | null = null;
  /** Every piece of type the scene paints, and the atlas they share. */
  private inkBoxes: InkBox[] = [];
  private inkTexture: THREE.CanvasTexture | null = null;
  private inkCanvas: HTMLCanvasElement | null = null;
  /** Last window value per layer, so the per-unit maths is skipped when idle. */
  private readonly inkFades: number[] = [];
  /** Set whenever something changed that the last frame does not show. */
  private dirty = true;
  private scrollProgress = -1;
  /** Scroll-driven Y rotation, in radians, added on top of the idle sway. */
  private scrollTurn = 0;
  /** The accent's own turn, accumulated — see `spinAccent`. */
  private accentAngle = 0;
  /** Where the scroll says the field should be, and where it actually is. */
  private tideScrollTarget = 0;
  private tideScroll = 0;
  /** Where the scroll says the turn should be; `scrollTurn` chases it. */
  private turnTarget = 0;
  private turnVelocity = 0;

  private radius = 1;
  private readonly halfExtents = new THREE.Vector3(1, 1, 1);
  /** The arrival's level, 0..1 — see `setArrival`. 1 is a model at rest. */
  private arrival = 1;
  private width = 0;
  private height = 0;

  private unsubscribe: (() => void) | null = null;
  private resizeRafId: number | null = null;
  private containerObserver: ResizeObserver | null = null;
  private lastTime = 0;
  private elapsed = 0;

  private readonly pointer = new THREE.Vector2();
  private readonly pointerTarget = new THREE.Vector2();
  /**
   * The tide field's own pointer, a two-pole follower kept separate from the
   * one above.
   *
   * Separate because they answer different questions. The model's tilt wants a
   * single settled position; the field wants a position *and* the direction it
   * is heading, and it gets the second for free as the gap between a fast lead
   * node and the slower body chasing it. Feeding the tilt through the same
   * two-stage chain would retune motion the tilt was already calibrated for.
   */
  private readonly tideLead = new THREE.Vector2();
  private readonly tideBody = new THREE.Vector2();
  /** Normalised device coordinates for the raycast, or null when off-canvas. */
  private pointerNdc: THREE.Vector2 | null = null;
  /** Where the pointer's lamp is, in buffer pixels, chasing the pointer. */
  private readonly glowAt = new THREE.Vector2(-1e4, -1e4);
  /** Whether it has ever been placed — the first sighting must not slide in. */
  private glowPlaced = false;
  /**
   * Whether this device gets the lamp at all.
   *
   * Hover capability, not the tier: holding the model back only makes sense
   * where there is a cursor to lift it with. Without one it would simply be
   * dark for good, which is a worse picture than the one it replaced.
   */
  private readonly glowEnabled =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover)").matches;
  private pointerMoved = false;
  private readonly hitPoint = new THREE.Vector3();
  private readonly frozen: boolean;
  /** Where `data-scene-ink` is looked for — see `ModelSceneOptions`. */
  private readonly overlayHost: HTMLElement;

  private readonly onResize = (): void => {
    if (this.resizeRafId !== null) return; // coalesce many events into one resize
    this.resizeRafId = requestAnimationFrame(() => {
      this.resizeRafId = null;
      this.resizeSurface();
      this.renderFrame();
    });
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    const rect = this.container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    this.pointerTarget.set(x * 2 - 1, y * 2 - 1);
    // NDC flips Y: the raycaster wants +1 at the top.
    this.pointerNdc = (this.pointerNdc ?? new THREE.Vector2()).set(
      x * 2 - 1,
      -(y * 2 - 1),
    );
    this.pointerMoved = true;
  };

  private readonly onPointerLeave = (): void => {
    this.pointerTarget.set(0, 0);
    this.pointerNdc = null;
    this.brush.break();
  };

  constructor({
    canvas,
    container,
    overlayHost,
    stageRule = false,
  }: ModelSceneOptions) {
    this.canvas = canvas;
    this.container = container;
    this.overlayHost = overlayHost ?? container;
    this.tier = deviceTier();
    this.lite = wantsLiteScene(this.tier);
    this.frozen = sceneShouldFreeze(this.tier);

    const stage = readTokenColor("--scene-surface", new THREE.Color(1, 1, 1));

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      // **Never multisampled, on any tier.** Nothing is drawn to the canvas
      // but the post chain's final full-screen quad — the geometry is
      // rendered into the composer's own target, which carries the tier's
      // MSAA (`buildComposer`). A multisampled canvas on top of that was four
      // colour samples and four depth samples per pixel that no edge ever
      // touched: at a Retina window, ~150MB of GPU memory per instance,
      // twice, for an image identical without it. ADR-0124.
      antialias: false,
      // The canvas has to composite against the page: the first screen's title
      // is a DOM layer *behind* it, and the model has to cover it the way it
      // covers the name in the design. So the white stage paints nothing and
      // the page's own ground shows through — see `patchBackgroundMaterial`.
      alpha: true,
      stencil: false,
      powerPreference: this.tier === "desktop" ? "high-performance" : "default",
    });
    this.renderer.setClearColor(stage, 0);
    // **No tone mapping at the end of the chain.** Khronos PBR Neutral is still
    // the curve — ACES has a filmic toe that crushes exactly the range this
    // asset lives in — but it is applied inside the materials, on the lit
    // colour only, so the flat colours the design injects reach the screen as
    // themselves. `OutputPass` is left with the sRGB encode alone. See
    // `toneMapFunction`; the curve and this exposure are the same pair three
    // would have used.
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.shadowMap.enabled = wantsShadows(this.tier);
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.camera = new THREE.PerspectiveCamera(
      sceneConfig.camera.fov,
      1,
      sceneConfig.camera.near,
      sceneConfig.camera.far,
    );
    // After the camera: the chain's first pass holds a reference to it.
    this.buildComposer();

    this.uniforms = createSceneUniforms();
    this.uniforms.uStageDisplay.value.copy(toDisplay(stage));
    this.uniforms.uMarkDisplay.value.copy(
      toDisplay(readTokenColor("--scene-mark", new THREE.Color(1, 1, 1))),
    );
    this.uniforms.uRuleOn.value = stageRule ? 1 : 0;
    // Held back from the first frame, so nothing of it is ever drawn under the
    // curtain — the prewarm still compiles and draws every program; it simply
    // discards every fragment of the model while it does. `setArrival` walks
    // it in once the curtain has gone.
    this.arrival = 0;
    this.uniforms.uArrive.value = 0;
    // The ember is the accent — the curtain's own colour, burning off the
    // subject it was covering — and the lick at the front is the tide's own
    // light stop, so the fire here is the fire the field draws later.
    this.uniforms.uArriveEmber.value.copy(
      toDisplay(readTokenColor("--stage-accent", new THREE.Color(0, 0, 1))),
    );
    this.uniforms.uArriveLick.value.copy(
      toDisplay(readTokenColor("--scene-tide-d", new THREE.Color(1, 1, 1))),
    );
    this.uniforms.uRuleDisplay.value.copy(
      toDisplay(readTokenColor("--stage-rule", new THREE.Color(0, 0, 0))),
    );
    this.uniforms.uRuleImmersedDisplay.value.copy(
      toDisplay(
        readTokenColor("--stage-immersed-ink", new THREE.Color(1, 1, 1)),
      ),
    );

    // Linear, like every other colour reaching the chain — see `toDisplay`.
    const tideTokens = [
      ["uTideBg", "--scene-tide-bg"],
      ["uTideA", "--scene-tide-a"],
      ["uTideB", "--scene-tide-b"],
      ["uTideC", "--scene-tide-c"],
      ["uTideD", "--scene-tide-d"],
    ] as const;
    for (const [name, token] of tideTokens) {
      this.uniforms[name].value.copy(
        toDisplay(readTokenColor(token, new THREE.Color(0, 0, 0))),
      );
    }

    // The chrome ramp tints `diffuseColor`, which is linear — no conversion.
    this.uniforms.uChromeSheen.value.copy(
      readTokenColor("--scene-chrome-sheen", new THREE.Color(1, 1, 1)),
    );
    this.uniforms.uChromeDeep.value.copy(
      readTokenColor("--scene-chrome-deep", new THREE.Color(0, 0, 1)),
    );
    this.uniforms.uWireDisplay.value.copy(
      toDisplay(readTokenColor("--scene-wire", new THREE.Color(0, 0, 0))),
    );
    this.uniforms.uWireImmersedDisplay.value.copy(
      toDisplay(
        readTokenColor("--scene-wire-immersed", new THREE.Color(1, 1, 1)),
      ),
    );
    this.uniforms.uSparkDisplay.value.copy(
      toDisplay(readTokenColor("--scene-wire-spark", new THREE.Color(1, 1, 1))),
    );
    this.brush = new Brush(sceneConfig.brush.points);

    this.tiltGroup.add(this.swayGroup);
    this.scene.add(this.tiltGroup);
  }

  /**
   * Fetch, decode, light, frame and fully prewarm the scene. Resolves only when
   * the next frame is guaranteed to allocate, compile and upload nothing — the
   * caller reveals the canvas on that promise.
   */
  async load(): Promise<void> {
    // **A frame is handed back between the steps.** Each of these is 45–65ms of
    // pure main-thread work and they used to run as one task, which the opening
    // curtain could only sit through. The total is unchanged; what changes is
    // that the curtain gets to draw between them. See `nextFrame`.
    const model = await this.loadModel();
    await this.capTextures(model);
    this.frameModel(model);
    await nextFrame();
    this.buildBackground();
    this.buildEnvironment();
    await nextFrame();
    this.buildLighting();

    // The word is an authored asset now, so there is no font to wait for — but
    // the *name* is: the scene rasterises the document's own display face into
    // a texture, and painting before the face has loaded bakes the fallback in.
    // `resizeSurface` paints it, so the gate goes ahead of that.
    if (this.junctions) await this.buildWord(this.junctions);

    await document.fonts?.ready;
    this.resizeSurface();
    await this.prewarm();
  }

  /**
   * Redraw the model's maps down to the tier's ceiling before anything uploads
   * them.
   *
   * Before `frameModel`, because that is where `initTexture` and the first
   * compile begin to touch them — replacing an image after the upload would
   * cost the upload twice. A frame is handed back between maps: this is canvas
   * work on the main thread, under a curtain that is animating.
   */
  private async capTextures(model: THREE.Object3D): Promise<void> {
    const limit = textureLimit(this.tier);
    if (!Number.isFinite(limit)) return;

    const seen = new Set<THREE.Texture>();
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      for (const material of materials) {
        for (const value of Object.values(material)) {
          if (value instanceof THREE.Texture) seen.add(value);
        }
      }
    });

    for (const texture of seen) {
      const image = texture.image as
        | (CanvasImageSource & { width: number; height: number })
        | undefined;
      if (!image?.width) continue;
      const smaller = downscaled(image, limit);
      if (!smaller) continue;
      texture.image = smaller;
      texture.needsUpdate = true;
      await nextFrame();
    }
  }

  private async loadModel(): Promise<THREE.Object3D> {
    const draco = new DRACOLoader().setDecoderPath(
      sceneConfig.dracoDecoderPath,
    );
    const loader = new GLTFLoader().setDRACOLoader(draco);

    try {
      const gltf = await loader.loadAsync(
        this.lite ? sceneConfig.lite.modelUrl : sceneConfig.modelUrl,
      );
      return gltf.scene;
    } finally {
      // The decoder worker has done its job; keep it out of memory for the
      // rest of the session.
      draco.dispose();
    }
  }

  /** Centre the model on the origin and place camera and lights in units of its
   *  bounding sphere, so swapping the asset needs no retuning. */
  private frameModel(model: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(model);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const centre = sphere.center.clone();

    this.radius = sphere.radius || 1;
    box.getSize(this.halfExtents).multiplyScalar(0.5);
    model.position.sub(centre);

    this.brush.configure(this.radius);

    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const shadows = wantsShadows(this.tier);

    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      // No floor to catch a shadow — the model is its own receiver.
      child.castShadow = shadows;
      child.receiveShadow = shadows;
      // …and the shadow has to arrive with the surface, or the parts not yet
      // drawn still throw one onto the parts that are.
      if (shadows) child.customDepthMaterial = patchModelDepthMaterial(this.uniforms);
      this.modelMesh ??= child;

      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      for (const material of materials) {
        if (!(material instanceof THREE.MeshStandardMaterial)) continue;
        if (material.map) {
          material.map.anisotropy = this.tier === "mobile" ? 1 : maxAnisotropy;
        }
        this.correctScanMaterial(child.geometry, material);
        patchModelMaterial(material, this.uniforms);
      }
    });

    this.swayGroup.add(model);
    this.setFadeRange();
    this.setArrivalScale();
    this.applyArrival();
    // No net, and therefore no word: the lite path never reaches the stages
    // that draw them, and two passes of 31k vertices each would be paid for
    // an image identical without them.
    if (!this.lite) this.buildWireframe();
  }

  /**
   * The arrival's noise, in cells per radius of the **geometry**.
   *
   * The shader reads the raw `position` attribute — the same space the bottom
   * fade had to be moved into (see `setFadeRange`) — and that space carries the
   * asset's own scale, so a cell count quoted against the world radius would
   * come out a different size on every export. The geometry's own sphere is the
   * radius in the space the noise is actually sampled in.
   */
  private setArrivalScale(): void {
    const geometry = this.modelMesh?.geometry;
    if (!geometry) return;
    geometry.computeBoundingSphere();
    const radius = geometry.boundingSphere?.radius || 1;
    this.uniforms.uArriveScale.value = sceneConfig.arrival.noiseScale / radius;
  }

  /**
   * Walk the model in: 0 is held back — nearer the camera, above its mark,
   * and nothing of it drawn — and 1 is at rest. Both the approach and the
   * burn-in read this one value, so they cannot come apart.
   *
   * Driven from the viewer by a spring, so the easing lives there; this only
   * places things. See `sceneConfig.arrival`.
   */
  setArrival(level: number): void {
    const clamped = Math.min(1, Math.max(0, level));
    if (clamped === this.arrival) return;
    this.arrival = clamped;
    this.uniforms.uArrive.value = clamped;
    this.applyArrival();
    this.dirty = true;
  }

  /**
   * Where the model stands for the current level, in radii off its rest.
   *
   * On the outer group, above the tilt and the sway: the approach is the
   * subject coming *to* its place, and the place is where those two idle
   * motions happen — an offset under them would be tilted along with it.
   * Towards +z, which is where the camera is (`fitCamera`), and up.
   */
  private applyArrival(): void {
    const { approach, rise } = sceneConfig.arrival;
    const away = 1 - this.arrival;
    this.tiltGroup.position.set(
      0,
      this.radius * rise * away,
      this.radius * approach * away,
    );
  }

  /**
   * The bottom dissolve's thresholds, in the space the shader actually reads.
   *
   * This was measured off the model's **world** bounding box while the shaders
   * compare it against the raw `position` attribute — and this asset's geometry
   * is not centred on its own origin, so every threshold sat below everything
   * the mesh contains and `bottomFade` returned 1 for every fragment. The fade
   * has therefore never done anything, on any stage: what looked like the bust
   * dissolving into the white was only its geometry running out. It is why the
   * cut across the chest is visible the moment there is a field behind it
   * instead of a white ground.
   *
   * Reading the geometry's own box fixes both halves of the mismatch — the
   * offset and any scale on the node — and makes the ratios mean what their
   * names have always claimed: a fraction of the half-height, from its centre.
   */
  /**
   * Where the first screen's rule falls, in buffer pixels.
   *
   * The same proportion `StageFrame` lays out with: a frame `frameRatio` of the
   * viewport width, centred in the stage, and the rule `topRatio` of the width
   * down it. Both terms are in buffer pixels, so the device ratio cancels and
   * the line lands on the row the DOM would have put it on.
   */
  private placeStageRule(): void {
    const { stageRule } = sceneConfig;
    const buffer = this.uniforms.uResolution.value;
    // The rule belongs to the screen's **bottom** group, like the copy hanging
    // from it — so it is a fixed distance up from the bottom edge, not a
    // fraction of the height. `StageBottom` anchors the DOM half the same way.
    //
    // `vw` is the viewport, scrollbar included, not the canvas — which is
    // narrower by exactly that scrollbar.
    const cssWidth = window.innerWidth;
    const cssHeight = Math.max(1, this.container.clientHeight);
    // A `vw` length, so it converts with the **horizontal** scale even though it
    // is measured up the screen — the buffer is not always in proportion.
    const scale = buffer.x / Math.max(1, this.container.clientWidth);
    // **On a phone the first screen's rule is measured, not computed.** The
    // design puts it a fixed distance up from the bottom edge, which is right
    // while the bottom group is a band of that height and wrong once the group
    // is a column whose height is the copy's own — there the line landed in the
    // middle of the copy. `[data-stage-rule]` is the row of actions it belongs
    // above, so down here the element says where the line goes.
    const marker =
      this.tier === "mobile"
        ? this.overlayHost.querySelector<HTMLElement>("[data-stage-rule]")
        : null;
    if (marker) {
      const host = this.overlayHost.getBoundingClientRect();
      const row = marker.getBoundingClientRect().top - host.top;
      const gap = stageRule.markerGap * cssWidth;
      this.uniforms.uRuleY.value =
        Math.floor(buffer.y - (row - gap) * (buffer.y / cssHeight)) + 0.5;
      this.uniforms.uRuleImmersedY.value = this.uniforms.uRuleY.value;
      this.uniforms.uRuleHalf.value = stageRule.thickness / 2;
      return;
    }

    const rowAt = (topRatio: number) => {
      const fromBottom = (stageRule.frameRatio - topRatio) * cssWidth;
      const row = buffer.y - (cssHeight - fromBottom) * (buffer.y / cssHeight);
      // **Snapped to a fragment centre.** A rule is a hairline, and a hairline
      // that lands between two rows lights both at half weight: two grey pixels
      // instead of one solid one, heavier and softer than the design asks for
      // — and it changed every time the window height moved the row by half a
      // pixel. Fragment centres are at whole-number + 0.5, so this is where a
      // one-row line can actually be one row. `ruleAt` is written against it.
      return Math.floor(row) + 0.5;
    };
    this.uniforms.uRuleY.value = rowAt(stageRule.topRatio);
    this.uniforms.uRuleImmersedY.value = rowAt(stageRule.immersedTopRatio);
    // Already in buffer pixels — see the config note.
    this.uniforms.uRuleHalf.value = stageRule.thickness / 2;
  }

  /**
   * Paint the marked element's text into a texture, and hide the original.
   *
   * The contract is one attribute: an element carrying `data-scene-ink` inside
   * the viewer is laid out and rasterised by the browser as usual, and then
   * drawn by the scene instead of by the compositor. Nothing about the design is
   * restated here — the box, the font and the colour are all read back off the
   * element, so the CSS stays the only place the type is specified.
   *
   * It exists because the first screen's name is behind the canvas so the model
   * can cover it, and everything the scene paints over it is opaque: the
   * pointer's mark took the letters away as it passed. Painted by the scene it
   * sits above the mark and below the model, which is the order the design has
   * always implied and the DOM could not express.
   */
  private paintStageInk(): void {
    const elements = [
      ...this.overlayHost.querySelectorAll<HTMLElement>("[data-scene-ink]"),
    ].slice(0, INK_BOXES);
    if (!elements.length) {
      this.uniforms.uInkBoxCount.value = 0;
      return;
    }

    const buffer = this.uniforms.uResolution.value;
    // The **stage**, not the canvas's own wrapper: the layers holding the type
    // are siblings of that wrapper, so an offset walk from a heading never
    // reaches it. The stage is the common ancestor and the same box the buffer
    // is stretched over.
    const hostWidth = this.overlayHost.clientWidth;
    const hostHeight = this.overlayHost.clientHeight;
    if (hostWidth < 1 || hostHeight < 1) return;
    const scaleX = buffer.x / hostWidth;
    const scaleY = buffer.y / hostHeight;

    const probe = this.inkContext(1, 1);
    if (!probe) return;

    // Measure everything first: the atlas cannot be sized until every piece
    // knows how much room its glyphs actually need.
    const drafts = elements.map((element) => {
      const text = element.textContent?.trim() ?? "";
      const box = layoutBox(element, this.overlayHost);
      const style = getComputedStyle(element);
      const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      probe.font = font;
      const metrics = probe.measureText(text);

      // Where the browser puts the baseline in the line box: the font's own
      // content height centred in the line, then down to the baseline.
      const baseline =
        (box.height -
          (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent)) /
          2 +
        metrics.fontBoundingBoxAscent;

      // **The glyphs do not fit their own box, and that is normal.**
      // `leading-none` sets the line box to one em while a display face's ink
      // runs taller than that — measured at 238px of ascent and descent inside a
      // 189px line. The DOM does not care, because `overflow` is visible; a
      // texture the size of the box clips it, which showed up as the tops and
      // the descenders being shaved off. Every pad is measured, never guessed.
      const pad = {
        left: Math.max(0, metrics.actualBoundingBoxLeft),
        right: Math.max(0, metrics.actualBoundingBoxRight - box.width),
        top: Math.max(0, metrics.actualBoundingBoxAscent - baseline),
        bottom: Math.max(
          0,
          baseline + metrics.actualBoundingBoxDescent - box.height,
        ),
      };

      return {
        element,
        text,
        box,
        style,
        font,
        baseline,
        pad,
        width: box.width + pad.left + pad.right,
        height: box.height + pad.top + pad.bottom,
      };
    });

    // **The atlas has a scale of its own** — see `sceneConfig.stageInk`. The
    // framebuffer's is clamped for fill rate, and glyph coverage is not fill:
    // these letters are drawn once and sampled forever after, so rasterising
    // them at the phone's 0.85 and showing them on its 3x screen was simply
    // throwing detail away. `boost` lifts the raster and nothing else: the
    // atlas UVs below are ratios of boosted quantities, so it cancels there,
    // and the `screen` rect is left in buffer space where it belongs.
    const { minScale, maxSize } = sceneConfig.stageInk;
    const rawWidth = Math.max(...drafts.map((d) => d.width)) * scaleX;
    const rawHeight = drafts.reduce((sum, d) => sum + d.height, 0) * scaleY;
    const boost = Math.max(
      1,
      Math.min(
        minScale / Math.max(0.0001, Math.min(scaleX, scaleY)),
        maxSize / Math.max(1, rawWidth, rawHeight),
      ),
    );
    const inkX = scaleX * boost;
    const inkY = scaleY * boost;

    // Stacked, not packed. These are single lines of display type: they are wide
    // and few, so a shelf packer would win almost nothing and would have to be
    // read every time this is touched.
    const atlasWidth = Math.max(1, Math.ceil(rawWidth * boost));
    const atlasHeight = Math.max(1, Math.ceil(rawHeight * boost));

    const context = this.inkContext(atlasWidth, atlasHeight);
    if (!context) return;
    context.clearRect(0, 0, atlasWidth, atlasHeight);

    const boxes: InkBox[] = [];
    let shelf = 0;
    for (const draft of drafts) {
      const top = shelf;
      shelf += draft.height * inkY;
      if (!draft.text || draft.box.width < 1) continue;

      context.save();
      context.translate(0, top);
      context.scale(inkX, inkY);
      context.font = draft.font;
      // Coverage is all the shader wants — it tints with the element's own
      // colour, so the glyphs are drawn opaque and only alpha is read.
      context.fillStyle = "#fff";
      context.textBaseline = "alphabetic";
      context.fillText(
        draft.text,
        draft.pad.left,
        draft.pad.top + draft.baseline,
      );

      const mode =
        draft.element.dataset.sceneInk === "word" ? "word" : "letter";
      const pieces = splitInk(draft.text, mode).slice(0, INK_UNITS);
      const units = pieces.map((piece, index) => ({
        start:
          (draft.pad.left +
            context.measureText(draft.text.slice(0, piece.at)).width) /
          draft.width,
        seed: shuffledSeed(index, pieces.length),
      }));
      context.restore();

      const layer = Number(
        draft.element.closest<HTMLElement>("[data-scene-layer]")?.dataset
          .sceneLayer ?? 0,
      );

      boxes.push({
        element: draft.element,
        layer: Number.isFinite(layer) ? layer : 0,
        units,
        // `gl_FragCoord.y` counts from the bottom of the buffer.
        screen: new THREE.Vector4(
          (draft.box.left - draft.pad.left) * scaleX,
          buffer.y - (draft.box.bottom + draft.pad.bottom) * scaleY,
          draft.width * scaleX,
          draft.height * scaleY,
        ),
        atlas: new THREE.Vector4(
          0,
          // The atlas is drawn top-down and sampled bottom-up.
          1 - (top + draft.height * inkY) / atlasHeight,
          (draft.width * inkX) / atlasWidth,
          (draft.height * inkY) / atlasHeight,
        ),
        color: new THREE.Color(draft.style.color),
        fade: 0,
      });
    }

    this.inkBoxes = boxes;
    this.inkFades.length = 0;

    if (!this.inkTexture && this.inkCanvas) {
      this.inkTexture = new THREE.CanvasTexture(this.inkCanvas);
      this.inkTexture.minFilter = THREE.LinearFilter;
      this.inkTexture.magFilter = THREE.LinearFilter;
      this.inkTexture.generateMipmaps = false;
      this.uniforms.uInkTex.value = this.inkTexture;
    }
    if (this.inkTexture) this.inkTexture.needsUpdate = true;

    // Only now: whatever happens above, the browser's own copy is what the
    // reader sees until the scene has one of its own.
    for (const box of boxes) box.element.style.opacity = "0";
    this.packInk();
  }

  /**
   * Pack the pieces that are actually showing into the uniform arrays.
   *
   * Rebuilt whenever a fade changes rather than held as one fixed table: the
   * shader walks every entry for every fragment of a full-screen quad, so what
   * it costs is what is *on screen*, not what the page contains.
   */
  private packInk(): void {
    const screens = this.uniforms.uInkScreen.value;
    const atlases = this.uniforms.uInkAtlas.value;
    const colors = this.uniforms.uInkColor.value;
    const ranges = this.uniforms.uInkRange.value;
    const units = this.uniforms.uInkUnit.value;
    const { spread, ease } = sceneConfig.inkLetters;
    // Each unit gets its own slice of the window, opened at its seed. The
    // slices overlap heavily — `spread` is only the part spent handing out start
    // times, and what is left is one unit's own fade — so a line resolves as a
    // crowd rather than as a queue.
    const own = Math.max(0.0001, 1 - spread);

    let slot = 0;
    let cursor = 0;
    for (const box of this.inkBoxes) {
      if (slot >= INK_BOXES) break;
      if (box.fade <= 0.0001) continue;
      if (cursor + box.units.length > INK_UNITS) break;

      screens[slot].copy(box.screen);
      atlases[slot].copy(box.atlas);
      colors[slot].set(box.color.r, box.color.g, box.color.b);
      ranges[slot].set(cursor, box.units.length);

      for (const unit of box.units) {
        const t = (box.fade - unit.seed * spread) / own;
        const clamped = t <= 0 ? 0 : t >= 1 ? 1 : t;
        // Smooth at both ends rather than only at the top: a unit that starts
        // moving the instant its turn comes reads as a switch, and the whole
        // line reads as a flicker at speed.
        const eased = clamped * clamped * (3 - 2 * clamped);
        units[cursor].set(unit.start, Math.pow(eased, ease));
        cursor += 1;
      }
      slot += 1;
    }

    this.uniforms.uInkBoxCount.value = slot;
    this.dirty = true;
  }

  setInkOpacity(layer: number, opacity: number): void {
    if (this.inkFades[layer] === opacity) return;
    this.inkFades[layer] = opacity;

    // The delivery rule rides its screen's window, not the scroll zone that
    // says which screen is showing — so it arrives with the lines that hang
    // from it instead of a whole screen ahead of them. Written here because
    // this is where that window already lands, once per change.
    if (layer === sceneConfig.stageRule.immersedLayer) {
      this.uniforms.uRuleImmersedFade.value = opacity;
      this.dirty = true;
    }

    let touched = false;
    for (const box of this.inkBoxes) {
      if (box.layer !== layer || box.fade === opacity) continue;
      box.fade = opacity;
      touched = true;
    }
    if (touched) this.packInk();
  }

  /**
   * The 2D context the type is drawn into, sized.
   *
   * One canvas for the life of the scene: it is resized rather than replaced,
   * and the texture keeps pointing at it.
   */
  private inkContext(
    width: number,
    height: number,
  ): CanvasRenderingContext2D | null {
    this.inkCanvas ??= document.createElement("canvas");
    if (this.inkCanvas.width !== width) this.inkCanvas.width = width;
    if (this.inkCanvas.height !== height) this.inkCanvas.height = height;
    return this.inkCanvas.getContext("2d");
  }

  private setFadeRange(): void {
    const geometry = this.modelMesh?.geometry;
    if (!geometry) return;
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box) return;

    const { fade } = sceneConfig;
    const centreY = (box.min.y + box.max.y) / 2;
    const halfY = Math.max(1e-6, (box.max.y - box.min.y) / 2);
    this.uniforms.uFadeStartY.value = centreY + halfY * fade.startRatio;
    this.uniforms.uFadeEndY.value = centreY + halfY * fade.endRatio;
    this.uniforms.uFadeMeshStartY.value = centreY + halfY * fade.meshStartRatio;
    this.uniforms.uFadeMeshEndY.value = centreY + halfY * fade.meshEndRatio;
  }

  /**
   * Undo the export settings that stop a photogrammetry scan reading as one.
   * See `sceneConfig.material` for why each is wrong in this file.
   */
  private correctScanMaterial(
    geometry: THREE.BufferGeometry,
    material: THREE.MeshStandardMaterial,
  ): void {
    const { material: correction, wireframe } = sceneConfig;
    if (!correction.enabled) return;

    material.metalness = correction.metalness;
    material.roughness = correction.roughness;

    if (correction.computeTangents && material.normalMap) {
      // Without real tangents three derives the frame from screen-space
      // derivatives, which flips across every one of this atlas's thousands of
      // island seams and shreds the surface. Seam vertices are already split by
      // the exporter, so each side gets its own correct frame from this.
      if (geometry.getAttribute("tangent") === undefined) {
        geometry.computeTangents();
      }
      material.normalScale.set(
        correction.normalScale,
        correction.normalScale * correction.normalTangentSign,
      );
    }

    // Push the solid surface a hair back so the wireframe drawn over the same
    // triangles wins the depth test instead of z-fighting with them.
    material.polygonOffset = true;
    material.polygonOffsetFactor = wireframe.polygonOffsetFactor;
    material.polygonOffsetUnits = wireframe.polygonOffsetUnits;

    material.needsUpdate = true;
  }

  /**
   * The topology, drawn over the model and revealed two ways: under a brush
   * stroke, and below the tide line.
   *
   * Built once at load and welded onto a grid — see `coarse-wireframe.ts` for
   * why the raw 102k-triangle wireframe cannot be shown directly. Built on
   * **every** tier: the brush is desktop-only, but the tide is not, and below
   * the line the mesh is the only thing drawing the subject.
   */
  private buildWireframe(): void {
    if (!this.modelMesh) return;

    const { wireframe, particles } = sceneConfig;
    const welded = buildCoarseWireframe(this.modelMesh.geometry, {
      cellSize: this.radius * wireframe.cellRatio,
      surfaceOffset: this.radius * wireframe.surfaceOffsetRatio,
    });
    if (!welded) return;
    const geometry = welded.lines;

    // The colour is written by the injected shader (it depends on the tide), so
    // the material's own colour never reaches the screen.
    const material = new THREE.LineBasicMaterial({
      transparent: true,
      depthWrite: false,
    });
    patchWireframeMaterial(material, this.uniforms);

    const lines = new THREE.LineSegments(geometry, material);
    lines.frustumCulled = false;
    this.wireframeMesh = lines;
    // Parented to the model mesh itself, so it inherits exactly the same
    // transform chain — anything else and the lines drift off the surface.
    this.modelMesh.add(lines);

    // The bloom. A GL line cannot be widened, so the glow is a second copy of
    // the same geometry, scaled a hair larger and blended additively — that
    // offset is what reads as a halo around each strand.
    const haloMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      depthWrite: false,
    });
    applyScreenBlending(haloMaterial);
    patchWireframeMaterial(haloMaterial, this.uniforms, { halo: true });

    const halo = new THREE.LineSegments(geometry, haloMaterial);
    halo.frustumCulled = false;
    halo.scale.setScalar(wireframe.haloScale);
    halo.renderOrder = -1; // under the crisp lines, so it reads as spill
    this.wireframeHalo = halo;
    this.modelMesh.add(halo);

    // The sparks. One sprite per junction, from the same weld — so a spark
    // cannot land anywhere but where edges actually meet.
    //
    // `sizeAttenuation` is what keeps them consistent: it divides the size by
    // view distance, and the camera fits itself to the model's radius, so a
    // size expressed as a fraction of that radius comes out the same number of
    // pixels whatever the asset's scale happens to be.
    const sparkMaterial = new THREE.PointsMaterial({
      size: this.radius * particles.sizeRatio,
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
    });
    applyScreenBlending(sparkMaterial);
    patchParticleMaterial(sparkMaterial, this.uniforms);

    const sparks = new THREE.Points(welded.points, sparkMaterial);
    sparks.frustumCulled = false;
    sparks.renderOrder = 1; // over both line passes — they are the highlight
    this.wireframeSparks = sparks;
    this.modelMesh.add(sparks);

    this.junctions = welded.junctions;
  }

  /**
   * Build the word as its own mesh, and give each of its nodes a place on the
   * bust to come from.
   *
   * The bust's wireframe is left alone entirely: it does not travel, it fades.
   * That is the whole point of the rebuild — dragging the scan's irregular
   * topology into letter shapes drags its connections along too, and no amount
   * of tuning opens a clean gap between two letters when something is always
   * joined across it.
   *
   * A failure is not fatal. No lattice means no word, `uMorph` moves nothing
   * that exists, and the scene simply keeps the bust: a font that never loaded
   * should cost the ending, not the hero.
   */
  private async buildWord(junctions: Float32Array): Promise<void> {
    if (!this.modelMesh) return;
    const { text, wireframe, particles } = sceneConfig;

    const word = await loadWordModel(text.modelUrl, {
      dracoDecoderPath: sceneConfig.dracoDecoderPath,
      width: this.radius * text.widthRatio,
      maxHeight: this.radius * text.maxHeightRatio,
    });
    if (!word || !this.modelMesh) return;

    this.uniforms.uWordFillFrom.value = word.minY;
    this.uniforms.uWordFillTo.value = word.maxY;

    // The same weld the bust's own lattice comes from. That is what makes the
    // morph meaningful: both ends are junctions of the same kind, so mapping
    // one set onto the other maps like to like instead of points to noise.
    const welds: { part: WordPart; welded: CoarseWireframe }[] = [];
    for (const part of word.parts) {
      const welded = buildCoarseWireframe(part.geometry, {
        cellSize: this.radius * text.widthRatio * text.cellRatio,
        surfaceOffset: this.radius * wireframe.surfaceOffsetRatio,
      });
      if (welded) welds.push({ part, welded });
    }
    if (welds.length === 0) return;

    // The mapping is made **once, across the whole mark**, then split back out.
    // Per part it would have each piece draw from the whole width of the bust,
    // and the accent — a small thing at the top — would pull its handful of
    // nodes from everywhere at once.
    const total = welds.reduce((n, e) => n + e.welded.junctions.length, 0);
    const all = new Float32Array(total);
    let cursor = 0;
    for (const entry of welds) {
      all.set(entry.welded.junctions, cursor);
      cursor += entry.welded.junctions.length;
    }
    const allSources = sourceFromJunctions(all, junctions);

    // Departure order: mostly left to right, with a little jitter so the front
    // is a scatter rather than a ruled line sweeping across.
    const nodeCount = all.length / 3;
    let minX = Infinity;
    let maxX = -Infinity;
    for (let i = 0; i < nodeCount; i++) {
      minX = Math.min(minX, all[i * 3]);
      maxX = Math.max(maxX, all[i * 3]);
    }
    const spanX = Math.max(1e-6, maxX - minX);
    const allDelays = new Float32Array(nodeCount);
    for (let i = 0; i < nodeCount; i++) {
      const ordered = (all[i * 3] - minX) / spanX;
      const noise = Math.sin(i * 12.9898) * 43758.5453;
      allDelays[i] = THREE.MathUtils.clamp(
        ordered * 0.75 + (noise - Math.floor(noise)) * 0.25,
        0,
        1,
      );
    }

    cursor = 0;
    for (const { part, welded } of welds) {
      const count = welded.junctions.length;
      const sources = allSources.slice(cursor, cursor + count);
      const delays = allDelays.slice(cursor / 3, (cursor + count) / 3);
      cursor += count;

      const edgeSources = new Float32Array(welded.lineJunction.length * 3);
      const edgeDelays = new Float32Array(welded.lineJunction.length);
      for (let i = 0; i < welded.lineJunction.length; i++) {
        const node = welded.lineJunction[i];
        edgeSources[i * 3] = sources[node * 3];
        edgeSources[i * 3 + 1] = sources[node * 3 + 1];
        edgeSources[i * 3 + 2] = sources[node * 3 + 2];
        edgeDelays[i] = delays[node];
      }

      welded.lines.setAttribute(
        "aMorph",
        new THREE.BufferAttribute(edgeSources, 3),
      );
      welded.lines.setAttribute(
        "aDelay",
        new THREE.BufferAttribute(edgeDelays, 1),
      );
      welded.points.setAttribute(
        "aMorph",
        new THREE.BufferAttribute(sources, 3),
      );
      welded.points.setAttribute(
        "aDelay",
        new THREE.BufferAttribute(delays, 1),
      );

      // The solid carries the same two attributes because its glow shell
      // declares them, and an attribute a shader declares must exist on the
      // geometry it is drawn with. A surface vertex has no junction of its own,
      // so it simply starts where it ends: the solid is invisible until the
      // chrome pours anyway, long after the travelling is over.
      const positions = part.geometry.getAttribute("position");
      const solidMorph = new Float32Array(positions.count * 3);
      for (let i = 0; i < positions.count; i++) {
        solidMorph[i * 3] = positions.getX(i);
        solidMorph[i * 3 + 1] = positions.getY(i);
        solidMorph[i * 3 + 2] = positions.getZ(i);
      }
      part.geometry.setAttribute(
        "aMorph",
        new THREE.BufferAttribute(solidMorph, 3),
      );
      part.geometry.setAttribute(
        "aDelay",
        new THREE.BufferAttribute(new Float32Array(positions.count), 1),
      );

      const parent = part.accent
        ? this.ensureAccentGroup(part.pivot)
        : this.ensureWordRoot();

      const lineMaterial = new THREE.LineBasicMaterial({
        transparent: true,
        depthWrite: false,
        // The word forms inside the volume the bust's geometry still fills —
        // depth-tested, its middle would be cut out along the silhouette of a
        // body nobody can see.
        depthTest: false,
      });
      patchWireframeMaterial(lineMaterial, this.uniforms, { lattice: true });
      const lines = new THREE.LineSegments(welded.lines, lineMaterial);
      lines.frustumCulled = false;
      lines.renderOrder = 3;
      parent.add(lines);
      this.wordLattices.push(lines);

      const nodeMaterial = new THREE.PointsMaterial({
        size: this.radius * particles.sizeRatio,
        sizeAttenuation: true,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });
      applyScreenBlending(nodeMaterial);
      patchParticleMaterial(nodeMaterial, this.uniforms, { lattice: true });
      const nodes = new THREE.Points(welded.points, nodeMaterial);
      nodes.frustumCulled = false;
      nodes.renderOrder = 4;
      parent.add(nodes);
      this.wordSparks.push(nodes);

      // The surface the chrome fills is the asset itself, and the lattice was
      // welded from it — so the two silhouettes agree by construction.
      const solidMaterial = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        envMapIntensity: sceneConfig.chrome.envMapIntensity,
        // Its own studio, not the scene's room — a mirror shows what is around
        // it, and the room around everything else is deliberately featureless.
        envMap: this.chromeEnvironment,
      });
      patchWordChromeMaterial(solidMaterial, this.uniforms);
      const solid = new THREE.Mesh(part.geometry, solidMaterial);
      solid.frustumCulled = false;
      solid.renderOrder = 2;
      parent.add(solid);
      this.wordSolids.push(solid);
    }
  }

  /**
   * The accent's own group, positioned so a `rotation.y` turns it **in place**.
   *
   * The geometry is deliberately left in the word's space: the chrome's fill
   * level and the morph's sources are both measured there, and moving the mark
   * into a local space of its own would have put both of them out by its
   * offset. The group carries the compensating translation instead, recomputed
   * with the angle each frame. At angle zero it is the identity, which is what
   * the whole journey runs at.
   *
   * The axis is the **pivot the asset carries**, not the middle of a bounding
   * box — see `WordPart.pivot`. Where the mark turns is a decision made in the
   * modelling package, and the only way to honour it here is to read the node's
   * origin rather than re-derive a centre from the geometry.
   */
  private ensureAccentGroup(pivot: THREE.Vector3): THREE.Object3D {
    if (!this.accentGroup) {
      this.accentGroup = new THREE.Group();
      this.accentPivot.copy(pivot);
      this.ensureWordRoot().add(this.accentGroup);
    }
    return this.accentGroup;
  }

  /** The word's root — on the turning group, at the axis it turns about. */
  private ensureWordRoot(): THREE.Group {
    if (!this.wordRoot) {
      this.wordRoot = new THREE.Group();
      this.swayGroup.add(this.wordRoot);
    }
    return this.wordRoot;
  }

  /**
   * Turn the accent about its own axis as the word arrives.
   *
   * **Integrated, not read off the clock.** The angle used to be
   * `elapsed * accentSpin` behind a `morph === 1` gate: the moment the gate
   * opened the star jumped to whatever that product had grown to, and jumped
   * back whenever the morph dipped under 1 again — which it does constantly
   * while the reader scrolls around the end of it. Accumulating the angle and
   * fading the *speed* in over `accentSpinFrom` removes both jumps: crossing
   * the threshold in either direction now only changes how fast it is turning.
   */
  private spinAccent(delta: number): void {
    const group = this.accentGroup;
    if (!group) return;

    const { accentSpin, accentSpinFrom } = sceneConfig.text;
    // Nothing while the nodes are still travelling: a rotation there would drag
    // their sources round with it and bend the journey for no reason.
    const speed = smoothstep01(this.morph, accentSpinFrom, 1);
    if (speed <= 0 && this.accentAngle === 0) return;
    this.accentAngle += delta * accentSpin * Math.PI * 2 * speed;

    const angle = this.accentAngle;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const { x, z } = this.accentPivot;
    group.rotation.y = angle;
    group.position.x = x - (x * cos + z * sin);
    group.position.z = z - (-x * sin + z * cos);
  }

  /**
   * The stage itself, as a fullscreen quad — drawn **after** the model, not
   * before it.
   *
   * The renderer's clear colour can only be one colour, and the stage is up to
   * three at once — white above the tide line, a live field below it, black
   * below the second. One quad paints every band in one pass.
   *
   * Drawing it last is a fill saving, not a sorting detail. The quad sits at
   * the far plane and depth-tests, so every pixel the opaque model already
   * wrote rejects it — and since the field costs ~22 noise evaluations per
   * pixel and the model's own shader computes the same field for the same
   * pixels (it has to, to dissolve into it), leaving the quad in front meant
   * paying for the walk twice over the subject's whole footprint. Nothing
   * about the image changes: what the quad would have drawn there was hidden.
   */
  private buildBackground(): void {
    const material = new THREE.MeshBasicMaterial({
      depthTest: true,
      depthWrite: false,
    });
    patchBackgroundMaterial(material, this.uniforms);

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    mesh.frustumCulled = false;
    mesh.renderOrder = 1; // after the model, whatever the sort decides
    this.backgroundMesh = mesh;
    this.scene.add(mesh);
  }

  /** A prefiltered room is the fill floor. Generated once, then the generator
   *  and the source scene are thrown away. */
  /**
   * The studio the chrome reflects, as its own prefiltered environment.
   *
   * Painted rather than modelled: an equirectangular strip is exactly what a
   * PMREM wants, and a canvas gives precise control over where the bands fall
   * for the cost of one texture upload during the load.
   *
   * Hung on the word's material alone — `scene.environment` keeps the room that
   * lights the skin.
   */
  private buildChromeEnvironment(pmrem: THREE.PMREMGenerator): void {
    const { environment } = sceneConfig.chrome;
    const canvas = document.createElement("canvas");
    canvas.width = environment.width;
    canvas.height = environment.height;
    const context = canvas.getContext("2d");
    if (!context) return;

    const grey = (value: number) => {
      const level = Math.round(Math.max(0, Math.min(1, value)) * 255);
      return `rgb(${level}, ${level}, ${level})`;
    };

    // Sky down to a hard horizon, then a dark floor. The hardness is the point:
    // a mirror needs an edge to carry across the form, and a smooth gradient
    // gives it nothing to bend.
    const sky = context.createLinearGradient(
      0,
      0,
      0,
      environment.horizon * canvas.height,
    );
    environment.sky.forEach((stop, index) => {
      sky.addColorStop(index / (environment.sky.length - 1), grey(stop));
    });
    context.fillStyle = sky;
    context.fillRect(0, 0, canvas.width, environment.horizon * canvas.height);

    const ground = context.createLinearGradient(
      0,
      environment.horizon * canvas.height,
      0,
      canvas.height,
    );
    environment.ground.forEach((stop, index) => {
      ground.addColorStop(index / (environment.ground.length - 1), grey(stop));
    });
    context.fillStyle = ground;
    context.fillRect(
      0,
      environment.horizon * canvas.height,
      canvas.width,
      canvas.height - environment.horizon * canvas.height,
    );

    // The softboxes, feathered at their edges so each reads as a light and not
    // as a painted stripe.
    for (const band of environment.bands) {
      const gradient = context.createLinearGradient(
        0,
        (band.at - band.half) * canvas.height,
        0,
        (band.at + band.half) * canvas.height,
      );
      gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(0.5, `rgba(255, 255, 255, ${band.value})`);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      context.fillStyle = gradient;
      context.fillRect(
        0,
        (band.at - band.half) * canvas.height,
        canvas.width,
        band.half * 2 * canvas.height,
      );
    }

    for (const strip of environment.strips) {
      const gradient = context.createLinearGradient(
        (strip.at - strip.half) * canvas.width,
        0,
        (strip.at + strip.half) * canvas.width,
        0,
      );
      gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(0.5, `rgba(255, 255, 255, ${strip.value})`);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      context.fillStyle = gradient;
      context.fillRect(
        (strip.at - strip.half) * canvas.width,
        0,
        strip.half * 2 * canvas.width,
        canvas.height,
      );
    }

    const source = new THREE.CanvasTexture(canvas);
    source.mapping = THREE.EquirectangularReflectionMapping;
    source.colorSpace = THREE.SRGBColorSpace;
    this.chromeEnvironment = pmrem.fromEquirectangular(source).texture;
    source.dispose();
  }

  private buildEnvironment(): void {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, sceneConfig.lighting.environmentBlur);

    this.environmentTexture = target.texture;
    this.scene.environment = target.texture;
    this.scene.environmentIntensity = sceneConfig.lighting.environmentIntensity;
    this.scene.background = null; // the stage colour is the renderer clear

    // The chrome's own studio, from the same generator before it is thrown away.
    this.buildChromeEnvironment(pmrem);

    room.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.geometry.dispose();
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      materials.forEach((material) => material.dispose());
    });
    pmrem.dispose();
  }

  private buildLighting(): void {
    const { lighting } = sceneConfig;

    const key = this.addLight(lighting.keyPosition, lighting.keyIntensity);
    this.configureSelfShadow(key);
    this.addLight(lighting.rimPosition, lighting.rimIntensity);
  }

  /** An undefined colour keeps three's white default — no literal to drift. */
  private addLight(
    position: readonly [number, number, number],
    intensity: number,
  ): THREE.DirectionalLight {
    const light = new THREE.DirectionalLight(undefined, intensity);
    light.position.set(
      position[0] * this.radius,
      position[1] * this.radius,
      position[2] * this.radius,
    );
    this.lights.push(light);
    this.scene.add(light);
    return light;
  }

  private configureSelfShadow(light: THREE.DirectionalLight): void {
    if (!wantsShadows(this.tier)) return;
    const { shadow } = sceneConfig;
    const extent = this.radius * shadow.extentRatio;

    // Derived from where the light actually is: the depth range has to hug the
    // model, or precision loss makes every surface shadow itself.
    const distance = light.position.length();
    const margin = this.radius * shadow.depthMarginRatio;

    light.castShadow = true;
    light.shadow.mapSize.set(shadow.mapSize, shadow.mapSize);
    light.shadow.camera.left = -extent;
    light.shadow.camera.right = extent;
    light.shadow.camera.top = extent;
    light.shadow.camera.bottom = -extent;
    light.shadow.camera.near = Math.max(0.01, distance - margin);
    light.shadow.camera.far = distance + margin;
    light.shadow.bias = shadow.bias;
    light.shadow.normalBias = shadow.normalBias;
    light.shadow.camera.updateProjectionMatrix();
  }

  /**
   * Distance that fits the bounding **box** on both axes.
   *
   * Fitting the bounding *sphere* is the usual one-liner, but it frames a flat
   * subject badly: this bust is 1.9 tall and 0.9 deep, so its sphere is far
   * larger than its silhouette and the model ends up marooned in the frame.
   * Fitting width and height separately — and only then adding the depth the
   * near face steals — fills the stage properly. Both axes matter because a
   * portrait phone has a much narrower horizontal field than its fov implies.
   */
  private fitCamera(): void {
    const { camera: config } = sceneConfig;
    // A phone frames the subject higher and smaller — see `camera.mobile`.
    const fitMargin =
      this.tier === "mobile" ? config.mobile.fitMargin : config.fitMargin;
    const heightRatio =
      this.tier === "mobile"
        ? config.mobile.targetHeightRatio
        : config.targetHeightRatio;
    const aspect = this.height === 0 ? 1 : this.width / this.height;
    const vFov = THREE.MathUtils.degToRad(config.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);

    const forVertical = this.halfExtents.y / Math.tan(vFov / 2);
    const forHorizontal = this.halfExtents.x / Math.tan(hFov / 2);
    const distance =
      Math.max(forVertical, forHorizontal) * fitMargin + this.halfExtents.z;

    const targetY = this.radius * heightRatio;
    this.camera.position.set(
      0,
      targetY + this.radius * config.elevationRatio,
      distance,
    );
    this.camera.lookAt(0, targetY, 0);
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  private resizeSurface(): void {
    // **Layout size, not the drawn rect.** `getBoundingClientRect` reports the
    // box *after* every ancestor transform, and the closing screen's scene lives
    // inside the gallery's rising panel — which is tilted for the whole of its
    // climb. Sizing from that gave a buffer in the wrong proportion to the
    // element it is stretched over (measured 2356x1347 for an 1885x980 box), so
    // the camera was stretched and every painted heading landed right of where
    // it belonged. `clientWidth`/`clientHeight` are the layout box and no
    // transform touches them.
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // A container that measures zero is not a size, it is a container that has
    // not been laid out yet — and clamping that to 1x1 and recording it is how
    // the scene ends up permanently rendering into a single pixel with no event
    // ever coming to correct it. Leave `this.width` untouched and wait for the
    // observer below to report a real box.
    if (width <= 0 || height <= 0) return;
    if (width === this.width && height === this.height) return;

    this.width = width;
    this.height = height;
    this.renderer.setPixelRatio(clampedPixelRatio(this.tier));
    this.renderer.setSize(width, height, false); // CSS owns the element size
    // The composer owns its own targets, so the tier's clamp has to be told to
    // it separately or the whole saving is thrown away on the post chain.
    this.composer?.setPixelRatio(clampedPixelRatio(this.tier));
    this.composer?.setSize(width, height);
    // `gl_FragCoord` is in device pixels, so the tide needs the drawing-buffer
    // size — it differs from the CSS size by the tier's pixel-ratio clamp.
    this.renderer.getDrawingBufferSize(this.uniforms.uResolution.value);
    // The rim is specified in device pixels so it stays one pixel wide at every
    // resolution and tier; as a fraction of the viewport it was visibly soft on
    // a short screen and hard on a tall one.
    this.uniforms.uLineEdge.value =
      sceneConfig.stages.edgePixels / this.uniforms.uResolution.value.y;
    this.placeStageRule();
    this.uniforms.uGlowRadius.value =
      sceneConfig.pointerGlow.radiusRatio * this.uniforms.uResolution.value.y;
    this.paintStageInk();
    this.fitCamera();
    this.dirty = true;
  }

  /**
   * Compile every program, upload every texture and draw one complete frame
   * before the caller reveals the canvas. Every mid-scroll hitch is one of
   * those three happening late.
   *
   * It **yields between uploads**. This is the longest single stretch of work
   * in the whole load and it runs while the opening curtain is on screen — a
   * loader that freezes is worse than a loader that takes a moment longer, and
   * the work is the same either way.
   */
  private async prewarm(): Promise<void> {
    const textures = new Set<THREE.Texture>();
    this.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      for (const material of materials) {
        for (const value of Object.values(material)) {
          if (value instanceof THREE.Texture) textures.add(value);
        }
      }
    });
    if (this.environmentTexture) textures.add(this.environmentTexture);

    // **Chunked, not looped.** Uploading every texture in one go was a 217ms
    // block — measured, and landing squarely under the opening curtain, which
    // is animating and cannot animate through it. Yielding a frame between
    // uploads turns one stall the reader sees into several they do not. The
    // total work is identical; only its shape changes.
    for (const texture of textures) {
      this.renderer.initTexture(texture);
      await nextFrame();
    }

    // The wireframe program only compiles once a fragment survives the mask, so
    // warm it with one point covering the whole buffer, cleared before handoff.
    const buffer = this.uniforms.uResolution.value;
    const warm = this.uniforms.uBrush.value[0];
    warm.set(buffer.x * 0.5, buffer.y * 0.5, buffer.y, 1);

    // **The whole timeline is walked, not just its first frame.**
    //
    // `compileAsync` walks `traverseVisible`, and at progress 0 the word's
    // scaffold, its sparks and its poured solids are all `visible = false` —
    // they belong to a screen the reader has not reached. So their programs
    // were not compiled here; they were compiled the first time the reader
    // scrolled to them. Measured: **18 programs after the loader, 26 after
    // scrolling to 45%** — eight compile stalls scattered through the morph,
    // which is exactly the micro-freeze this whole step exists to prevent
    // (optimize-3d-scene §3, and the §14 check that catches it).
    //
    // Driving the real progress rather than forcing `visible` by hand is what
    // makes this complete: every branch reaches its natural state, including
    // the bloom pass, which is gated on the pour and would otherwise never
    // allocate its chain until the chrome arrived.
    //
    // A frame each, with the frame handed back between them so the curtain over
    // this can keep animating.
    const resume = this.scrollProgress;
    // The lite timeline is one stop: nothing past it is ever drawn.
    const stops = this.lite ? [0] : sceneConfig.prewarmStops;
    for (const at of stops) {
      this.setScrollProgress(at);
      this.syncHandover();
      await this.renderer.compileAsync(this.scene, this.camera);
      this.renderFrame();
      await nextFrame();
    }
    this.setScrollProgress(resume);
    this.syncHandover();

    await this.renderer.compileAsync(this.scene, this.camera);
    // The composer's first frame allocates its targets and compiles its passes,
    // and it is the single longest thing left in the load. On its own, so it
    // does not compound with whatever `compileAsync` left on the stack.
    await nextFrame();
    this.renderFrame();
    warm.set(0, 0, 0, 0);

    // Only now. `compileAsync` walks `traverseVisible`, so hiding the wireframe
    // any earlier would leave its program uncompiled — and the saving would be
    // paid back as a compile stall the first time a reader hovers.
    this.syncWireframeVisibility();
  }

  /**
   * The post chain — and the reason it is **always** the render path, even
   * where the bloom itself is switched off.
   *
   * Three disables a material's tone mapping when the target is a render
   * target rather than the canvas, and `OutputPass` applies it at the end
   * instead. That is one program variant per material either way — but two if
   * the scene sometimes renders direct and sometimes through the chain, and
   * switching between them mid-scroll would recompile every program *and* step
   * the whole frame's brightness at the moment it happened. So the chain is
   * constant and only the bloom pass is gated (`syncHandover`), which is the
   * one thing that can be skipped without changing what anything compiles to.
   */
  private buildComposer(): void {
    const { bloom } = sceneConfig;
    const composer = new EffectComposer(this.renderer);
    composer.addPass(new RenderPass(this.scene, this.camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(1, 1), // sized with the surface
      bloom.strength,
      bloom.radius,
      bloom.threshold,
    );
    // Off until there is something worth blooming; `syncHandover` opens it.
    bloomPass.enabled = false;
    composer.addPass(bloomPass);
    this.bloomPass = bloomPass;
    // Tone mapping and the colour-space conversion, once, at the end.
    composer.addPass(new OutputPass());

    // The canvas's own MSAA is bypassed the moment the scene renders into a
    // target instead, so it has to be asked for again here or every edge in the
    // frame goes hard — most visibly on the letters, which are all long
    // straight diagonals.
    // The lite path multisamples too: at one pixel per CSS pixel the model's
    // edges alias visibly, and four samples over a 440×956 target cost less
    // than the lines they clean up.
    if (wantsAntialias(this.tier) || this.lite) {
      composer.renderTarget1.samples = 4;
      composer.renderTarget2.samples = 4;
    }

    this.composer = composer;
  }

  /**
   * Put the stroke on the screen: object-space points to device pixels, plus
   * the radius each one covers at its own distance.
   *
   * On the CPU because there are 24 of them once a frame, against a matrix
   * multiply per point per *fragment* if the shader were asked to do it — and
   * because the mark has to be the same field for the model, its wireframe and
   * the ground quad, which do not share an object space at all.
   */
  /**
   * How fast the reader is travelling through the page, eased — the stage
   * line's bow.
   *
   * **Scroll**, not the pointer. The line is the ground arriving; what should
   * bend it is the reader's own movement through the section, and it must be
   * dead straight whenever they are still. The pointer only grazes the model
   * and has nothing to do with where the ground changes.
   *
   * Speed, not acceleration: acceleration is zero through the middle of a long
   * steady scroll, which is exactly where the line should be deepest.
   */
  private trackLineBow(delta: number): void {
    const { bowHeight, bowSpeed, bowResponse } = sceneConfig.stages;

    let speed = 0;
    // The sentinel start would read as an enormous jump on the first frame.
    if (this.scrollProgress >= 0 && this.bowProgress >= 0) {
      speed = Math.abs(this.scrollProgress - this.bowProgress) / delta;
    }
    if (this.scrollProgress >= 0) this.bowProgress = this.scrollProgress;

    const wanted = THREE.MathUtils.clamp(speed / bowSpeed, 0, 1);
    this.arc += (wanted - this.arc) * (1 - Math.exp(-delta / bowResponse));
    this.uniforms.uLineBow.value = this.arc * bowHeight;
    // The same eased speed the lines bow on drives the field's surge: one
    // reading of "how fast is the reader travelling", used twice.
    this.uniforms.uTideSurge.value = this.arc;
  }

  private projectBrush(): void {
    const { ends, life, points } = this.brush;
    const out = this.uniforms.uBrush.value;
    const buffer = this.uniforms.uResolution.value;
    if (!this.modelMesh) return;

    this.modelMesh.updateWorldMatrix(true, false);
    // Pixels per world unit at unit distance — the perspective divide, done
    // once rather than per point.
    const perUnit =
      (buffer.y * 0.5) /
      Math.tan(THREE.MathUtils.degToRad(this.camera.fov) * 0.5);
    const radius = this.radius * sceneConfig.brush.radiusRatio;
    const { taper } = sceneConfig.brush;
    const size = out.length;
    const { head } = this.brush;

    // Where the live part of the stroke actually starts.
    //
    // The ordered array is mostly empty until the ring fills, and the live
    // points sit at its **end** — so measuring "how far along the stroke" as
    // k / (size - 1) puts a six-point stroke entirely in the last fifth of the
    // range. Its taper vanished, its bow was half a sine sampled near pi, and
    // both changed character as the ring filled: the mark behaved differently
    // depending on how long it had been drawn. Everything below is normalised
    // over the live span instead, so a short stroke and a long one are the same
    // shape.
    let first = -1;
    for (let k = 0; k < size; k++) {
      if (life[(head + k) % size] > 0) {
        first = k;
        break;
      }
    }
    if (first < 0) {
      for (let k = 0; k < size; k++) out[k].w = 0;
      return;
    }
    const span = Math.max(1, size - 1 - first);

    for (let k = 0; k < size; k++) {
      // Written in **stroke order**, oldest first, so the shader can join
      // consecutive entries into segments without knowing anything about the
      // ring. `head` is where the next push goes, which is also the oldest slot
      // once the ring has filled.
      const slot = (head + k) % size;
      if (life[slot] <= 0) {
        out[k].w = 0;
        continue;
      }
      this.projected.copy(points[slot]);
      this.modelMesh.localToWorld(this.projected);
      const distance = Math.max(
        1e-4,
        this.projected.distanceTo(this.camera.position),
      );
      this.projected.project(this.camera);

      // 0 at the tail, 1 at the head — of the live stroke, not of the ring.
      const along = (k - first) / span;
      // The taper is driven by a point's place in the stroke, not by its
      // remaining life: mid-drag every point is young, so a width taken from
      // life hardly narrows and the mark comes out a tube with two round ends.
      //
      // Life still narrows it *overall*, which is how the mark retreats as it
      // dies rather than standing at full size and then vanishing.
      const width =
        radius * (taper + (1 - taper) * along) * (0.3 + 0.7 * life[slot]);
      // A negative radius says "nothing joins this to the next" — the end of a
      // stroke, or the newest point, which has no successor yet.
      const joined = !ends[slot] && k < size - 1;
      const scaled = (width * perUnit) / distance;

      out[k].set(
        (this.projected.x * 0.5 + 0.5) * buffer.x,
        (this.projected.y * 0.5 + 0.5) * buffer.y,
        joined ? scaled : -scaled,
        life[slot],
      );
    }
  }

  private renderFrame(): void {
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  /**
   * Project the pointer onto the model's surface and record a brush point.
   *
   * Raycast against the real mesh, at most once per frame and only when the
   * pointer has actually moved — 102k triangles is too much to test more often
   * than that, and a stationary cursor has nothing new to paint.
   */
  private paint(): void {
    if (!this.pointerMoved || !this.pointerNdc || !this.modelMesh) return;
    this.pointerMoved = false;

    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const [hit] = this.raycaster.intersectObject(this.modelMesh, false);
    if (hit) {
      this.hitPoint.copy(hit.point);
    } else {
      // No surface under the pointer, but the mark does not belong to the
      // model alone — it falls on the ground too, and a stroke that stopped
      // dead at the silhouette would announce exactly where the geometry ends.
      // Off the subject it lands on the plane the subject stands in, facing the
      // camera, so one continuous stroke crosses from one to the other.
      this.camera.getWorldDirection(this.viewDirection);
      this.markPlane.setFromNormalAndCoplanarPoint(
        this.viewDirection,
        this.scene.position,
      );
      if (!this.raycaster.ray.intersectPlane(this.markPlane, this.hitPoint)) {
        this.brush.break();
        return;
      }
    }

    // World -> object space, so the stroke stays put while the model sways.
    this.modelMesh.worldToLocal(this.hitPoint);
    this.brush.add(this.hitPoint);
  }

  private readonly tick = (time: number): void => {
    const delta = Math.min(
      (time - this.lastTime) / MILLISECONDS,
      sceneConfig.motion.maxDeltaSeconds,
    );
    this.lastTime = time;
    if (delta <= 0) return;

    const { motion, grain } = sceneConfig;
    this.elapsed += delta;

    // Absolute, not accumulated: neither the sway nor the scroll turn may drift
    // with dropped frames. The sway is the only part reduced motion removes —
    // the turn is the reader's own scrolling, not something playing at them.

    // The pointer's lamp: it chases the cursor rather than snapping to it, and
    // its presence fades in and out so leaving the canvas does not switch the
    // model's weight back on in one frame.
    const { pointerGlow } = sceneConfig;
    const chase = Math.min(1, pointerGlow.follow * delta);
    const glowBuffer = this.uniforms.uResolution.value;
    const glow = this.uniforms.uGlow.value;
    const glowRadius = this.uniforms.uGlowRadius.value;
    // Where the lamp is going: the pointer, or well clear of the frame when
    // there is none. **Not** the presence value — the model stays held back
    // whether or not the cursor is over it, which is the whole point of holding
    // it back; leaving takes the lit patch away, not the dark.
    const toX = this.pointerNdc
      ? (this.pointerNdc.x * 0.5 + 0.5) * glowBuffer.x
      : -glowRadius * 3;
    const toY = this.pointerNdc
      ? (this.pointerNdc.y * 0.5 + 0.5) * glowBuffer.y
      : -glowRadius * 3;
    if (this.glowPlaced) {
      this.glowAt.x += (toX - this.glowAt.x) * chase;
      this.glowAt.y += (toY - this.glowAt.y) * chase;
    } else {
      this.glowAt.set(toX, toY);
      this.glowPlaced = true;
    }

    const wanted = this.glowEnabled ? 1 : 0;
    const presence = glow.z + (wanted - glow.z) * chase;
    if (
      Math.abs(presence - glow.z) > 1e-4 ||
      Math.abs(toX - this.glowAt.x) > 0.5 ||
      Math.abs(toY - this.glowAt.y) > 0.5
    ) {
      this.dirty = true;
    }
    glow.set(this.glowAt.x, this.glowAt.y, presence);

    // The field's own reading of the scroll, eased. Framerate-independent, so
    // the same lag at 30fps as at 120.
    const { scrollResponse } = sceneConfig.tideField;
    const settle = 1 - Math.exp(-delta / Math.max(1e-3, scrollResponse));
    const before = this.tideScroll;
    this.tideScroll += (this.tideScrollTarget - this.tideScroll) * settle;
    this.uniforms.uTideScroll.value = this.tideScroll;
    if (Math.abs(this.tideScroll - before) > 1e-5) this.dirty = true;

    // **The turn follows the scroll; it does not equal it.** Bound straight to
    // progress, the model stopped dead the instant the reader did — a heavy
    // object with no mass. A critically-damped spring lets it carry on a little
    // past where the scroll left it and settle, which is what reads as weight.
    // Absolute target, integrated follower: dropped frames cost speed, never
    // position.
    const { turn } = sceneConfig.motion;
    const pull = this.turnTarget - this.scrollTurn;
    this.turnVelocity +=
      (pull * turn.stiffness - this.turnVelocity * turn.damping) * delta;
    this.scrollTurn += this.turnVelocity * delta;
    // Still settling is still moving: the frame after the reader stops is not
    // the last one.
    if (Math.abs(pull) > 1e-4 || Math.abs(this.turnVelocity) > 1e-4) {
      this.dirty = true;
    }

    // No idle sway on the lite path either: it is the one thing that would
    // keep the frame dirty, and a phone's GPU should sleep between gestures.
    const sway =
      this.frozen || this.lite
        ? 0
        : Math.sin(this.elapsed * motion.idleSwaySpeed) *
          motion.idleSwayAmplitude;
    this.swayGroup.rotation.y = sway + this.scrollTurn;

    if (wantsPointer(this.tier)) {
      // Framerate-independent approach: the same easing at 30 and at 60fps.
      const alpha = 1 - Math.exp(-motion.pointerDamping * delta);
      this.pointer.lerp(this.pointerTarget, alpha);
      this.tiltGroup.rotation.y = this.pointer.x * motion.pointerTilt;
      this.tiltGroup.rotation.x = this.pointer.y * motion.pointerTilt;

      // The field's poles. Both rates are quoted per 60Hz frame, so they are
      // converted to an alpha for this frame's actual delta — otherwise the
      // chase would run twice as fast on a 120Hz panel as on a 60Hz one.
      const { pointerLead, pointerBody } = sceneConfig.tideField;
      const frames = delta * 60;
      this.tideLead.lerp(this.pointerTarget, 1 - (1 - pointerLead) ** frames);
      this.tideBody.lerp(this.tideLead, 1 - (1 - pointerBody) ** frames);
      this.paint();
      this.brush.update(delta);
      // A stroke laid down on the opening screen fades on its own clock, which
      // no scroll event reports — so the visibility has to be re-evaluated here
      // as well, or the mesh either never appears or never goes away again.
      this.syncWireframeVisibility();
    }

    if ((this.frozen || this.lite) && !this.dirty && !this.brush.active) {
      // Nothing moved and nothing scrolled: the last frame is still correct, and
      // WebGL keeps it on the canvas for free.
      return;
    }
    this.dirty = false;

    this.spinAccent(delta);
    this.trackLineBow(delta);
    this.projectBrush();
    // The outline breathes. Absolute rather than accumulated, like everything
    // else driven by the clock here.
    this.uniforms.uMarkTime.value = this.elapsed * sceneConfig.brush.noiseDrift;
    this.uniforms.uArriveTime.value =
      this.elapsed * sceneConfig.arrival.noiseDrift;
    this.uniforms.uGrainSeed.value = Math.floor(this.elapsed * grain.fps);
    this.uniforms.uTideTime.value = this.elapsed;
    // The field wants aspect-corrected coordinates with +y up; the scene's
    // pointer is a full -1..1 box with +y down. Both poles map the same way, so
    // their difference lands in the field's units too.
    const buffer = this.uniforms.uResolution.value;
    const aspect = buffer.x / Math.max(1, buffer.y);
    this.uniforms.uTidePointer.value.set(
      this.tideBody.x * 0.5 * aspect,
      -this.tideBody.y * 0.5,
    );
    this.uniforms.uTideVelocity.value.set(
      (this.tideLead.x - this.tideBody.x) * 0.5 * aspect,
      -(this.tideLead.y - this.tideBody.y) * 0.5,
    );
    this.renderFrame();
  };

  /**
   * Drives both stage lines and the model's turn from one scroll progress.
   *
   * Called from `<ProgressTrigger>`, which reads scroll through the same shared
   * ticker — so this never adds a scroll listener of its own.
   */
  setScrollProgress(progress: number): void {
    if (progress === this.scrollProgress) return;
    this.scrollProgress = progress;

    // **The lite runway has one motion.** The model turns as the reader
    // leaves it; no line sweeps, no field, no morph — those screens are stills
    // further down the page. The lines stay where they were constructed, off
    // the bottom of the screen.
    if (this.lite) {
      this.turnTarget = progress * sceneConfig.lite.turns * Math.PI * 2;
      this.dirty = true;
      return;
    }

    const { stages, rotation } = sceneConfig;
    this.uniforms.uTideY.value = ModelScene.lineAt(progress, stages.tide);
    this.uniforms.uDeepY.value = ModelScene.lineAt(progress, stages.deep);

    this.morph = window01(progress, stages.morph.from, stages.morph.to);
    this.uniforms.uMorph.value = this.morph;
    // Position, not the clock — the field slides because the reader moves. Held
    // as a target: the field eases onto it in `updateFrame` rather than
    // snapping wherever the scroll lands.
    this.tideScrollTarget = progress;
    this.uniforms.uWordFill.value = smoothstep01(
      progress,
      sceneConfig.text.fill.from,
      sceneConfig.text.fill.to,
    );
    this.syncHandover();

    // Two spans on one axis, meeting where the word finishes forming: the
    // bust's revolution, paced against the stage lines it has to stay in step
    // with, and then the word's own. Continuous because they abut exactly.
    const { spin } = sceneConfig;
    this.turnTarget =
      (window01(progress, rotation.from, rotation.to) * rotation.turns +
        window01(progress, spin.from, spin.to) * spin.turns) *
      Math.PI *
      2;
    this.syncWireframeVisibility();
    this.dirty = true;
  }

  /**
   * Skip the wireframe passes entirely while they can draw nothing.
   *
   * Above the first stage line the mesh only shows inside a brush stroke, so on
   * the opening screen — no scroll, no hover, which is where every reader
   * starts — every one of its fragments is discarded. The discard is free; the
   * 31,616 vertices behind it are not, and they are paid twice, because the
   * glow is a second copy of the same geometry. Two of the frame's five draw
   * calls, for an image that is identical either way.
   *
   * `visible` is safe to toggle: it changes no define and no material, so
   * nothing recompiles when the mesh comes back (see the prewarm contract in
   * optimize-3d-scene §3.2).
   */
  private syncWireframeVisibility(): void {
    // The line is fully off the bottom of the screen — `stageZones` returns
    // pure white everywhere — until it clears its own antialiasing rim.
    const lineIsOffscreen =
      this.uniforms.uTideY.value <= -this.uniforms.uLineEdge.value;
    const visible =
      (!lineIsOffscreen || this.brush.active) && this.bustMeshVisible;
    if (this.wireframeMesh) this.wireframeMesh.visible = visible;
    if (this.wireframeHalo) this.wireframeHalo.visible = visible;
    if (this.wireframeSparks) this.wireframeSparks.visible = visible;
  }

  /**
   * Cross the two meshes over — without ever showing both of them whole.
   *
   * The bust's net is out before the letters' net is in, and in between only
   * the travelling particles are on screen. That gap is deliberate: two
   * complete meshes in one frame is what the old per-vertex morph looked like
   * throughout, and it read as a mistake rather than as a transition.
   *
   * Each pass is also switched off outside its own window, so the frame never
   * pays for geometry that is fully faded.
   */
  private syncHandover(): void {
    const { text } = sceneConfig;
    const m = this.morph;

    const bust = 1 - smoothstep01(m, 0, text.bustFadeEnd);
    const spark = smoothstep01(m, text.sparkFadeFrom, text.sparkFadeTo);
    const line = smoothstep01(m, text.latticeFadeFrom, text.latticeFadeTo);

    this.uniforms.uBustFade.value = bust;
    this.uniforms.uLatticeSparkFade.value = spark;
    this.uniforms.uLatticeFade.value = line;

    // Once the chrome has covered the word the scaffold is discarded fragment by
    // fragment anyway — but the vertices are not, so it is switched off outright.
    const scaffold = this.uniforms.uWordFill.value < 0.999;
    const poured = this.uniforms.uWordFill.value > 0.001;
    for (const sparks of this.wordSparks) {
      sparks.visible = spark > 0.001 && scaffold;
    }
    for (const lattice of this.wordLattices) {
      lattice.visible = line > 0.001 && scaffold;
    }
    // The solid and its halo are the word's final state, so they have no
    // business existing while it is still arriving — and below the level there
    // is nothing for either of them to draw.
    for (const solid of this.wordSolids) solid.visible = poured;
    // Bloom is a full-screen chain, so it runs only while there is something
    // bright enough to bloom — the poured chrome. Everywhere else in the
    // scroll the pass is skipped and costs nothing.
    if (this.bloomPass) this.bloomPass.enabled = poured;

    // The bust stops filling the depth buffer only once the **chrome** needs it
    // to — not when the morph begins.
    //
    // The word's solid is depth-tested (it has to be, to occlude its own back
    // faces), and it forms inside the volume the invisible bust still occupies,
    // so it was getting bites taken out of the letters along the silhouette of
    // a body nobody can see. Releasing the depth fixes that — but releasing it
    // at the *morph's* start was far too early, and cost something much more
    // visible than it bought: the bust's own wireframe is depth-tested against
    // that same buffer, so the moment it went the **back half of the net
    // stopped being occluded**, the lines on screen doubled, and the model
    // flared — measured at 1.37x, in the last beat before it faded out. That
    // was the "suddenly very bright" state, and it was made here.
    //
    // The fill starts at `text.fill.from`, long after the bust's net has gone
    // (`uBustFade` reaches 0 around a third of the way through the morph), so
    // keying on it lets the two never overlap.
    const modelMaterial = this.modelMesh?.material;
    if (modelMaterial && !Array.isArray(modelMaterial)) {
      modelMaterial.depthWrite = this.uniforms.uWordFill.value <= 0.001;
    }
    this.bustMeshVisible = bust > 0.001;
    this.syncWireframeVisibility();
  }

  /** Maps overall scroll progress onto one line's own window of travel. */
  private static lineAt(
    progress: number,
    span: { from: number; to: number },
  ): number {
    const { lineFrom, lineTo } = sceneConfig.stages;
    return (
      lineFrom + (lineTo - lineFrom) * window01(progress, span.from, span.to)
    );
  }

  /** Subscribe to the shared app-wide rAF. Never starts a second loop. */
  start(): void {
    if (this.unsubscribe) return;
    // Even frozen, the loop has to run: the tide is scroll-driven, so a frame
    // can become stale without any animation playing. `tick` skips the draw
    // itself while nothing has changed, which keeps the saving.
    this.lastTime = performance.now();
    this.unsubscribe = subscribeToTicker(this.tick, () =>
      frameBudgetMs(this.tier),
    );
  }

  stop(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  /** Desktop only. iOS Safari fires `resize` when the URL bar collapses during
   *  scroll, which would rebuild the framebuffer mid-scroll and read as a
   *  full-scene flicker; the surface is sized once for the session instead. */
  attachListeners(): void {
    if (this.tier !== "mobile") {
      window.addEventListener("resize", this.onResize, { passive: true });
      window.addEventListener("orientationchange", this.onResize, {
        passive: true,
      });

      // The window is not the only thing that resizes the canvas. A scrollbar
      // arriving as the page grows, a devtools dock, a zoom change — all move
      // the container without firing `resize`, and the renderer then holds a
      // stale drawing buffer: the scene draws into a corner of it, or at the
      // wrong aspect, for the rest of the session. That is the shape of the
      // scene "sometimes loading wrong", and only the container can report it.
      //
      // Safe on the sizing rule for touch as well (optimize-3d-scene §13): the
      // container is `lvh`, so a collapsing URL bar does not change its box.
      // Mobile stays on the size-once path regardless, out of caution.
      this.containerObserver = new ResizeObserver(this.onResize);
      this.containerObserver.observe(this.container);
    }
    if (wantsPointer(this.tier)) {
      this.container.addEventListener("pointermove", this.onPointerMove, {
        passive: true,
      });
      this.container.addEventListener("pointerleave", this.onPointerLeave, {
        passive: true,
      });
    }
  }

  dispose(): void {
    this.stop();
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("orientationchange", this.onResize);
    this.containerObserver?.disconnect();
    this.containerObserver = null;
    this.container.removeEventListener("pointermove", this.onPointerMove);
    this.container.removeEventListener("pointerleave", this.onPointerLeave);
    if (this.resizeRafId !== null) cancelAnimationFrame(this.resizeRafId);

    // The wireframe borrows the model's geometry, so drop it before the
    // traversal below disposes that geometry once.
    const wordObjects: (THREE.LineSegments | THREE.Points | THREE.Mesh)[] = [
      ...this.wordLattices,
      ...this.wordSparks,
      ...this.wordSolids,
    ];
    for (const object of wordObjects) {
      object.geometry.dispose();
      (object.material as THREE.Material).dispose();
      object.removeFromParent();
    }
    this.wordLattices = [];
    this.wordSparks = [];
    this.wordSolids = [];
    this.accentGroup?.removeFromParent();
    this.accentGroup = null;
    this.wordRoot?.removeFromParent();
    this.wordRoot = null;
    this.composer?.dispose();
    this.composer = null;
    this.bloomPass = null;

    if (this.wireframeSparks) {
      this.wireframeSparks.geometry.dispose();
      (this.wireframeSparks.material as THREE.Material).dispose();
      this.wireframeSparks.removeFromParent();
      this.wireframeSparks = null;
    }

    if (this.wireframeHalo) {
      (this.wireframeHalo.material as THREE.Material).dispose();
      this.wireframeHalo.removeFromParent();
      this.wireframeHalo = null;
    }

    if (this.wireframeMesh) {
      this.wireframeMesh.geometry.dispose();
      (this.wireframeMesh.material as THREE.Material).dispose();
      this.wireframeMesh.removeFromParent();
      this.wireframeMesh = null;
    }

    this.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      for (const material of materials) {
        for (const value of Object.values(material)) {
          if (value instanceof THREE.Texture) value.dispose();
        }
        material.dispose();
      }
    });

    // Hand the type back to the browser before anything else: if the scene is
    // going away, the DOM copy is the only one left.
    for (const box of this.inkBoxes) {
      box.element.style.removeProperty("opacity");
    }
    this.inkBoxes = [];
    this.inkTexture?.dispose();
    this.inkTexture = null;
    this.uniforms.uInkTex.value = null;
    this.uniforms.uInkBoxCount.value = 0;

    if (this.backgroundMesh) {
      this.backgroundMesh.geometry.dispose();
      (this.backgroundMesh.material as THREE.Material).dispose();
      this.backgroundMesh.removeFromParent();
      this.backgroundMesh = null;
    }

    this.lights.forEach((light) => light.dispose());
    this.environmentTexture?.dispose();
    this.chromeEnvironment?.dispose();
    this.chromeEnvironment = null;
    this.scene.environment = null;
    this.renderer.dispose();
  }
}
