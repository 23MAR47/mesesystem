import * as THREE from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import { clampedPixelRatio, viewScale } from "@/lib/scene/device";
import { useSceneConfig } from "@/lib/scene/scene-config";
import { scrollState } from "@/lib/scene/scroll-state";
import { FinalPass } from "./common/final-pass";
import { layers } from "./constants";

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Post-processing: render the scene, then composite it over the corner wash.
 *
 * This used to be three chained `EffectComposer`s — a torus bloom chain, a scene
 * bloom chain, and a final pass sampling both. All of it was dead:
 *
 * - Every scene object renders on `ENTIRE_SCENE`, so the torus and bloom layers
 *   were empty and both chains rendered nothing.
 * - Neither chain set `renderToScreen = false`, so their last passes drew
 *   straight to the canvas and their render targets went stale.
 * - `FinalPass` then sampled those stale targets plus a `haloTexture` that was
 *   never assigned. An unbound `sampler2D` reads texture unit 0 — whatever was
 *   last bound — so the composite changed frame to frame. That was the flicker.
 *
 * The glow was never coming from `UnrealBloomPass` anyway: the point clouds are
 * additively blended, and the terrain draws its own halo in-shader. Dropping the
 * two chains removes the flicker and two full-screen bloom passes per frame.
 */
class Composer {
  private readonly composer: EffectComposer;
  private readonly finalPass: ShaderPass;
  private readonly bloomPass: UnrealBloomPass;
  private readonly camera: THREE.Camera;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
  ) {
    this.camera = camera;

    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));

    /* Optional dev-tunable bloom. Default strength is 0, so it is inert until the
     * settings panel turns it up — the point clouds fake their own glow in-shader
     * (ADR-0019), and fine points flicker through a real bloom, so it stays off by
     * default and is there only for tuning. */
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0,
      0.4,
      0.6,
    );
    this.composer.addPass(this.bloomPass);

    this.finalPass = new ShaderPass(FinalPass);
    this.composer.addPass(this.finalPass);
  }

  resize() {
    this.composer.setSize(window.innerWidth, window.innerHeight);
    /* Must match `Canvas3d`'s clamp. The composer owns its own render targets,
     * so leaving it at raw `devicePixelRatio` would render the post pass at full
     * resolution and throw away the saving made on the scene pass. */
    this.composer.setPixelRatio(clampedPixelRatio());
  }

  render() {
    /* Bloom is per scene (hero / services / timeline), blended by the same morph
       weights that drive the forms, so each phase glows on its own settings. */
    const { hero, services, timeline } = useSceneConfig.getState().bloom;
    const { morphT1: t1, morphT2: t2 } = scrollState;
    // Scale bloom down on smaller windows so a look tuned on a big screen does
    // not blow out when the viewport shrinks.
    const vs = viewScale();
    this.bloomPass.strength =
      lerp(lerp(hero.strength, services.strength, t1), timeline.strength, t2) *
      vs;
    this.bloomPass.radius = lerp(
      lerp(hero.radius, services.radius, t1),
      timeline.radius,
      t2,
    );
    this.bloomPass.threshold = lerp(
      lerp(hero.threshold, services.threshold, t1),
      timeline.threshold,
      t2,
    );
    /* Skip the pass outright when it contributes nothing. Default strength is 0,
     * so on every unmodified session this elides a full-screen down/up-sample
     * bloom chain each frame — a pure saving, largest on the fill-bound phones.
     * `EffectComposer` honours `pass.enabled`. */
    this.bloomPass.enabled = this.bloomPass.strength > 0.001;

    this.finalPass.uniforms.iTime.value = performance.now() / 1000;
    this.camera.layers.set(layers.ENTIRE_SCENE);
    this.composer.render();
  }
}

export default Composer;
