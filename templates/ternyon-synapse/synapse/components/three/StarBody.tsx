"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { starGeometry } from "@/lib/star";
import { damp, smoothstep, view } from "@/lib/state";
import { starFragment, starVertex } from "./shaders";

/**
 * The chrome star in the closing panel. Metal, so there is no diffuse
 * term at all — everything visible is the analytic environment reflected
 * off the body, tinted by the violet ground it sits on.
 *
 * Ambient tiers stay very dark and the emitters run hot (100x and up).
 * That ratio is what makes it read as polished metal; lifting the ambient
 * to "brighten it" is what turns it into grey plastic.
 */
export default function StarBody() {
  const size = useThree((s) => s.size);
  const mesh = useRef<THREE.Mesh>(null);

  const geometry = useMemo(
    () => starGeometry({ segU: 232, segV: 68, power: 0.55, thickness: 0.32, shoulder: 0.42 }),
    [],
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: starVertex,
        fragmentShader: starFragment,
        transparent: true,
        side: THREE.DoubleSide,
        uniforms: {
          uSky: { value: new THREE.Color(0.05, 0.045, 0.075) },
          uHorizon: { value: new THREE.Color(0.022, 0.018, 0.04) },
          uFloor: { value: new THREE.Color(0.006, 0.004, 0.012) },
          uKey: { value: new THREE.Color(2.6, 2.55, 2.9) },
          uStripA: { value: new THREE.Color(3.4, 3.2, 3.9) },
          uStripB: { value: new THREE.Color(0.9, 0.45, 1.5) },
          uTint: { value: new THREE.Color("#c9b6ff") },
          uRough: { value: 0.06 },
          uTime: { value: 0 },
          uAlpha: { value: 0 },
        },
      }),
    [],
  );

  useEffect(() => {
    // tells the preloader the scene is up; without it the curtain only
    // lifts on its bail timer
    document.dispatchEvent(new CustomEvent("synapse:scene"));
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30);
    const stage = view.s.cta;

    /* Visible for as long as the closing PANEL is on screen — not just for
       as long as it is pinned. The pin ends a third of a section before the
       panel has finished leaving, which is why the star used to vanish with
       the copy still in view. */
    const alpha =
      smoothstep(0.14, 0.3, stage.travel) * (1 - smoothstep(0.93, 0.995, stage.travel));
    material.uniforms.uAlpha.value = alpha;
    if (mesh.current) mesh.current.visible = alpha > 0.003;
    if (alpha <= 0.003 || !mesh.current) return;

    material.uniforms.uTime.value = state.clock.elapsedTime;

    const narrow = size.width < 900;
    const scale = narrow ? 2.1 : 3.05;
    mesh.current.scale.setScalar(scale);

    /* The canvas is fixed, so the star has to be given the panel's own
       motion: it rides up with the panel as it rises into place and as it
       scrolls away, instead of hanging in the middle of the viewport. */
    const worldPerViewport = 2 * Math.tan((45 * Math.PI) / 360) * 9;
    const ride = -(stage.shift / Math.max(1, size.height)) * worldPerViewport;

    mesh.current.position.set(narrow ? 0.15 : 2.15, (narrow ? -1.0 : -0.05) + ride, 0);

    /* Front three-quarter, turned to the left. A positive Y rotation swings
       the body's -X side toward the camera, so a small angle keeps the star
       reading as a star while showing the thickness of its left arm — the
       53 degrees this used to sit at turned it into an unreadable blob. */
    const swayY = view.reduced ? 0 : view.smoothX * 0.09;
    const swayX = view.reduced ? 0 : view.smoothY * 0.07;
    mesh.current.rotation.set(
      damp(mesh.current.rotation.x, -0.1 + swayX, 2.6, dt),
      damp(mesh.current.rotation.y, 0.3 + swayY, 2.6, dt),
      -0.2,
    );
  });

  return <mesh ref={mesh} geometry={geometry} material={material} />;
}
