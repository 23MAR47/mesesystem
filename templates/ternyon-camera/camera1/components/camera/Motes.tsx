"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { view } from "@/lib/state";

/**
 * Dust in the light.
 *
 * Nothing about the camera needs these, but a perfectly clean void has
 * no scale — the model could be a metre across or a centimetre. A
 * couple of hundred motes drifting at a believable speed fix the size
 * of the thing.
 *
 * They have to stay under the threshold of being *counted*, though. Too
 * many, or too bright, and the frame stops being a studio with dust in
 * it and becomes a starfield — which drags the whole page toward space
 * and away from a product on a sweep.
 */

const COUNT = 240;

const VERT = /* glsl */ `
attribute float aSeed;
attribute float aSize;
uniform float uTime;
uniform float uPixelRatio;
uniform float uReveal;
varying float vFade;

void main() {
  vec3 p = position;

  // Slow, uncorrelated drift. The three frequencies are deliberately
  // non-harmonic so the field never resolves into a pulse.
  p.x += sin(uTime * 0.11 + aSeed * 6.28) * 0.42;
  p.y += cos(uTime * 0.087 + aSeed * 4.11) * 0.34 + mod(uTime * 0.012 + aSeed, 1.0) * 0.6 - 0.3;
  p.z += sin(uTime * 0.063 + aSeed * 9.7) * 0.5;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uPixelRatio * (7.0 / max(-mv.z, 0.1));

  // Fade out anything too close to the camera, which would otherwise
  // sweep across the frame as a distracting soft blob.
  float near = smoothstep(0.4, 2.0, -mv.z);
  float far = 1.0 - smoothstep(8.0, 14.0, -mv.z);
  vFade = near * far * uReveal;
}
`;

const FRAG = /* glsl */ `
precision mediump float;
varying float vFade;
uniform vec3 uColor;

void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = dot(d, d);
  if (r > 0.25) discard;
  float a = exp(-r * 16.0);
  gl_FragColor = vec4(uColor * a * vFade, 1.0);
}
`;

export default function Motes() {
  const mat = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const seed = new Float32Array(COUNT);
    const size = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 7 - 1;
      seed[i] = Math.random();
      // Mostly small with a long tail, so a handful read as near-field.
      size[i] = 0.7 + Math.pow(Math.random(), 3) * 2.2;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uReveal: { value: 0 },
      uColor: { value: new THREE.Vector3(0.12, 0.16, 0.24) },
    }),
    []
  );

  useFrame(({ clock, gl }) => {
    const m = mat.current;
    if (!m) return;
    m.uniforms.uTime.value = clock.elapsedTime;
    m.uniforms.uPixelRatio.value = gl.getPixelRatio();
    m.uniforms.uReveal.value = view.intro;
  });

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={-500}>
      <shaderMaterial
        ref={mat}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
