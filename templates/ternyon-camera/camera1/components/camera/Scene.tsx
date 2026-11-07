"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
  Noise,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { useEffect, useState } from "react";

import { damp, view } from "@/lib/state";
import { BACKGROUND } from "@/lib/theme";
import AnnotationRig from "./AnnotationRig";
import Backdrop from "./Backdrop";
import CameraRig from "./CameraRig";
import Motes from "./Motes";

/** Eases the raw pointer into the value the scene actually follows. */
function PointerRig() {
  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30);
    view.smoothX = damp(view.smoothX, view.pointerX, 4.2, dt);
    view.smoothY = damp(view.smoothY, view.pointerY, 4.2, dt);
    view.velocity = damp(view.velocity, 0, 3.5, dt);
  });
  return null;
}

export default function Scene() {
  const [dpr, setDpr] = useState<[number, number]>([1, 1.6]);
  const [heavy, setHeavy] = useState(true);

  useEffect(() => {
    view.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* Every glass pixel does four environment evaluations and, near a
       silhouette, a fourteen-sample spectral integral — all of it
       double-sided and alpha-blended, so overdraw is the cost driver
       rather than triangles. Capping resolution is the only lever that
       actually moves, and it moves a lot. */
    setDpr(window.devicePixelRatio > 2 ? [1, 1.35] : [1, 1.6]);
    setHeavy(window.innerWidth >= 820);
  }, []);

  return (
    <Canvas
      className="webgl"
      dpr={dpr}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
      }}
      camera={{ fov: 40, near: 0.1, far: 60, position: [0, 0, 4.6] }}
      flat
    >
      <color attach="background" args={[BACKGROUND]} />
      <PointerRig />
      <Backdrop />
      {heavy && <Motes />}
      <CameraRig />
      <AnnotationRig />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.72}
          /* Well clear of both the aurora and the body of the glass, so
             only the specular streaks and the hot spots inside the lens
             elements bloom. Set any lower and the whole object grows a
             halo, which is exactly the haze that made the first pass
             read as milky plastic. */
          luminanceThreshold={0.22}
          luminanceSmoothing={0.3}
          mipmapBlur
          radius={0.7}
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette eskil={false} offset={0.26} darkness={0.78} />
        <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.1} />
      </EffectComposer>
    </Canvas>
  );
}
