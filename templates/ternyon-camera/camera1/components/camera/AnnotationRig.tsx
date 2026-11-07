"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

import { ANNOTATIONS } from "@/lib/content";
import { clamp, smoothstep, view } from "@/lib/state";
import { modelRef } from "./modelRef";

/**
 * Welds the DOM callouts to their parts.
 *
 * The labels are real HTML — they have to be, to get the typography and
 * to stay selectable — but their anchors are points on a model that is
 * being rotated through nearly two hundred degrees. So every frame each
 * anchor is pushed through the model's world matrix and projected, and
 * the result is written straight to the element's transform. No React
 * state is involved; this runs sixty times a second.
 */
export default function AnnotationRig() {
  const { camera, size } = useThree();
  const world = useMemo(() => new THREE.Vector3(), []);

  const nodes = useMemo(
    () =>
      ANNOTATIONS.map((a) => ({
        spec: a,
        el: null as HTMLElement | null,
      })),
    []
  );

  useFrame(() => {
    const model = modelRef.current;
    if (!model) return;

    // Callouts need room to sit beside the object; below this the copy
    // has already collapsed on top of it and there is none.
    const enabled = size.width >= 1100;

    for (const node of nodes) {
      if (!node.el) {
        node.el = document.querySelector<HTMLElement>(
          `[data-anno="${node.spec.id}"]`
        );
        if (!node.el) continue;
      }

      const s = node.spec.section;
      const vis = enabled
        ? smoothstep(s + 0.16, s + 0.36, view.raw) -
          smoothstep(s + 0.7, s + 0.92, view.raw)
        : 0;

      if (vis < 0.004) {
        if (node.el.style.opacity !== "0") {
          node.el.style.opacity = "0";
          node.el.style.visibility = "hidden";
        }
        continue;
      }

      world.set(...node.spec.anchor).applyMatrix4(model.matrixWorld);
      world.project(camera);

      // Behind the camera, or off the frame entirely.
      if (world.z > 1) {
        node.el.style.opacity = "0";
        node.el.style.visibility = "hidden";
        continue;
      }

      const x = (world.x * 0.5 + 0.5) * size.width;
      const y = (-world.y * 0.5 + 0.5) * size.height;

      node.el.style.visibility = "visible";
      node.el.style.opacity = clamp(vis, 0, 1).toFixed(3);
      node.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
  });

  return null;
}
