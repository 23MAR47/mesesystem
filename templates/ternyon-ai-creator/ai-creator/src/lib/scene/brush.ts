/**
 * The brush — where the pointer has been on the model's surface.
 *
 * A fixed ring of object-space points, newest overwriting oldest, each decaying
 * to nothing over `lifetimeSeconds`. The shader turns that ring into the mark:
 * see `brushMaskFunction`, which lights whole **cells** of a screen-space
 * tessellation rather than drawing discs, so the shape has straight edges and
 * comes apart a piece at a time as the ring ages.
 *
 * **The points stay in object space** even though the mark is evaluated in
 * screen space, and that is the whole reason this class still exists: object
 * space is what makes the mark stick to the surface it was painted on while the
 * model sways and turns. The scene projects the ring to pixels once a frame
 * (`projectBrush`) — 24 points on the CPU, against a per-fragment matrix
 * multiply if the shader did it.
 *
 * The decay counts elapsed seconds rather than frames, so the mark closes at
 * the same speed on a phone's 30 fps budget as on a desktop's every-tick one.
 *
 * 📖 Docs: obsidian/frontend/components/common.md
 */

import * as THREE from "three";

import { sceneConfig } from "./scene.config";

export class Brush {
  /** Object-space positions, parallel to `life`. */
  readonly points: THREE.Vector3[];
  /** 0..1, how much of each point's lifetime is left. */
  readonly life: number[];
  /**
   * True where a point is the **last** of its stroke — the pointer left the
   * model there, or has not moved past it yet.
   *
   * The mark is drawn as segments between consecutive points, so it has to know
   * where one stroke stops and the next begins; without it a gap would be
   * bridged by a straight bar across the model.
   */
  readonly ends: boolean[];

  private cursor = 0;
  /**
   * Whether the slot at `cursor` holds a **live** head rather than being empty.
   *
   * The head follows the pointer every frame; only when it has travelled a
   * whole `minStep` from the last committed point does it stop being live and
   * the cursor move on. So the ring is "committed points, plus at most one that
   * is still moving".
   */
  private live = false;
  private lastPoint: THREE.Vector3 | null = null;
  private readonly scratch = new THREE.Vector3();
  private minStep = 0;

  constructor(size: number) {
    this.points = Array.from({ length: size }, () => new THREE.Vector3());
    this.life = new Array<number>(size).fill(0);
    this.ends = new Array<boolean>(size).fill(true);
  }

  /** Brush radius and stroke spacing scale with the model, not with the world. */
  configure(modelRadius: number): void {
    this.minStep = modelRadius * sceneConfig.brush.minStepRatio;
  }

  /**
   * Where the next point will go — which is also the newest point's successor,
   * and therefore the key to how far back in the stroke any slot is.
   *
   * The taper needs *stroke order*, not remaining life: during a drag every
   * point is young, so a width driven by life barely narrows at all and the
   * mark comes out a tube. Order says which end is the tail whatever the clock
   * is doing.
   */
  get head(): number {
    // Past the live head when there is one: the slot at `cursor` is then the
    // newest point, not the oldest, and stroke order has to start after it.
    return this.live ? (this.cursor + 1) % this.points.length : this.cursor;
  }

  /** True while any part of a stroke is still alive. */
  get active(): boolean {
    return this.life.some((life) => life > 0);
  }

  /**
   * Record where the brush passed, filling in the gap since the last point.
   *
   * Two things make that gap real: the surface is only raycast once per frame,
   * and a fast drag covers a lot of ground between frames. Cells only light
   * where a point reaches them, so an un-filled gap is a hole in the mark — the
   * segment is walked at `minStep` intervals rather than recording only the
   * endpoint.
   *
   * Points closer together than `minStep` are still not **committed**: without
   * that, a slow drag burns the whole ring on one spot and the trail loses its
   * tail. But they are not thrown away either — the head keeps following the
   * pointer inside that step, in place.
   *
   * That distinction is the whole of how the mark feels. Dropping the movement
   * outright left the leading end parked while the tail went on decaying, and
   * then jumping a full `minStep` the instant the threshold was crossed: at
   * walking pace it is invisible, but move the pointer slowly and the mark
   * advances in visible ticks. Holding the head live makes the shape follow the
   * pointer continuously at *any* speed, while the points behind it are still
   * laid down at an even spacing.
   */
  add(objectPoint: THREE.Vector3): void {
    if (!this.lastPoint) {
      this.lastPoint = new THREE.Vector3().copy(objectPoint);
      this.write(objectPoint);
      this.commit();
      return;
    }

    const distance = this.lastPoint.distanceTo(objectPoint);
    if (distance < this.minStep) {
      // Still within the step: the head moves, the ring does not grow.
      this.write(objectPoint);
      this.live = true;
      return;
    }

    // Capped at the ring size: a longer jump than that would overwrite its own
    // tail anyway, so there is nothing to gain by interpolating further.
    const steps = Math.min(
      Math.ceil(distance / this.minStep),
      this.points.length,
    );
    for (let step = 1; step <= steps; step++) {
      this.scratch.lerpVectors(this.lastPoint, objectPoint, step / steps);
      this.write(this.scratch);
      this.commit();
    }
    // The newest committed point *is* the pointer, so nothing is live until it
    // moves again.
    this.live = false;
    this.lastPoint.copy(objectPoint);
  }

  /**
   * The pointer left the model or the page.
   *
   * The stroke is not cleared — it comes apart where it stands, which is what
   * makes leaving read as the mark letting go rather than being switched off.
   * All that is forgotten is where the pointer was, so the next stroke does not
   * draw a line across the model from the old position to the new one.
   */
  break(): void {
    this.lastPoint = null;
    // A live head stops being live and stands as a point of its own — the mark
    // is left exactly where the pointer was seen last, not a step behind it.
    if (this.live) {
      this.live = false;
      this.commit();
    }
    // Close the stroke where it stands, so the next one is not joined to it.
    const last = (this.cursor - 1 + this.ends.length) % this.ends.length;
    this.ends[last] = true;
  }

  /** Age the ring by `delta` seconds. */
  update(delta: number): void {
    const { lifetimeSeconds } = sceneConfig.brush;
    const step = delta / lifetimeSeconds;
    for (let i = 0; i < this.life.length; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] = Math.max(0, this.life[i] - step);
    }
  }

  /**
   * Put a point in the head slot, without deciding whether it stays there.
   *
   * Called every time the pointer is seen, so a live head is simply this slot
   * being rewritten in place until it has earned its own.
   */
  private write(point: THREE.Vector3): void {
    // The point before this one now has a successor to be joined to.
    const previous =
      (this.cursor - 1 + this.points.length) % this.points.length;
    if (this.life[previous] > 0) this.ends[previous] = false;

    this.points[this.cursor].copy(point);
    this.life[this.cursor] = 1;
    this.ends[this.cursor] = true;
  }

  /** The head slot keeps what it holds; the next point gets a new one. */
  private commit(): void {
    this.cursor = (this.cursor + 1) % this.points.length;
  }
}
