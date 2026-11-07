import * as THREE from "three";

import Canvas3d from "@/lib/scene/canvas3d";
import Camera from "./extensions/Camera";
import Controller from "./Controller";
import Composer from "./Composer";

class Canvas extends Canvas3d {
  private readonly camera: Camera;
  private readonly controller: Controller;
  private readonly composer: Composer;

  constructor(parent: HTMLElement, canvas: HTMLCanvasElement) {
    super(parent, canvas);

    this.camera = new Camera(this.scene);
    this.controller = new Controller(this.scene, this.camera.instance);

    this.scene.background = new THREE.Color(0x000000);

    /* No fog. It used to be `Fog(0x000000, 0, 15)`, "matching the original
     * scene" — but nothing here has ever consumed it: fog only reaches materials
     * that declare it, and every object in this scene is a raw `ShaderMaterial`.
     * Now that the camera flies out to z = 56 and the starfield sits 230 units
     * away, a far plane of 15 is not merely inert but wrong, so it is gone rather
     * than left as a trap for the next person who turns fog support on.
     *
     * `OrbitControls` is gone for a related reason: it was constructed with every
     * interaction disabled and `update()` never called, so it wrote to the camera
     * exactly never. `Controller` now flies the camera itself. */

    this.composer = new Composer(this.renderer, this.scene, this.camera.instance);

    this.toRender(() => {
      this.controller.render();
      this.composer.render();
    });

    this.toResize(() => {
      this.camera.resize();
      this.controller.resize();
      this.composer.resize();
    });
  }

  unmount() {
    this.controller.dispose();
    this.dispose();
  }
}

export default Canvas;
