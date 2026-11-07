import type { RefObject } from "react";
import type * as THREE from "three";

/**
 * Shape of the scroll progress prop shared between the scroll driver
 * (ProgressTrigger callback) and the Three.js components.
 * Mutated by the driver and read every frame inside `useFrame`, so the
 * R3F components never re-render to follow scroll.
 *
 * Always pass the ref *object* through props (not `ref.current`) so the
 * React Compiler purity rules are satisfied — `.current` is only read
 * inside `useFrame` callbacks.
 */
export type ScrollProgressRef = RefObject<number>;

/**
 * World-space cursor position shared between the scene's `MouseTracker`
 * (writer — projects 2D mouse onto the z = 0 scene plane and lerps each
 * frame for damping) and every particle component (reader — uploads
 * `.current` to a `uCursor` shader uniform so vertex shaders can push
 * particles away from the cursor). Same prop-the-object pattern as
 * `ScrollProgressRef` — read `.current` only inside `useFrame`.
 */
export type CursorRef = RefObject<THREE.Vector3>;

/**
 * 0–1 cursor *activity*. Written by `MouseTracker` based on time since
 * the last `mousemove` and lerped each frame so the avoidance void
 * fades **in** when the user moves and **out** after a few seconds of
 * stillness. Read by every particle scene and multiplied into the
 * repel strength so the effect smoothly attenuates.
 */
export type CursorActivityRef = RefObject<number>;
