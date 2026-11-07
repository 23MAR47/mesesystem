import type * as THREE from "three";

/**
 * The camera model's inner group, published out of the render tree.
 *
 * The annotation layer lives in the DOM, not in the canvas, so it needs
 * the same matrix the parts were drawn with in order to put a label on
 * a part. Passing it down through React would mean a state update on
 * mount and a prop on a component that re-renders never — a module-level
 * handle is the honest version of what is actually happening.
 */
export const modelRef: { current: THREE.Group | null } = { current: null };
