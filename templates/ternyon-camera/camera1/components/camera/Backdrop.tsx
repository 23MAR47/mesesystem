"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { damp, view } from "@/lib/state";
import {
  BACKDROP_A,
  BACKDROP_B,
  BACKDROP_BASE,
  BACKDROP_C,
  BACKDROP_POOL,
} from "@/lib/theme";

/**
 * A slow aurora behind everything.
 *
 * Three large colour fields — teal, indigo, violet — drifting through a
 * domain warped by two octaves of value noise, over a near-black base.
 * The warp is what stops it reading as three lamps: it bends the
 * boundaries between the fields so they fold into each other instead of
 * crossfading, which is the difference between a mesh gradient and a
 * blurred radial.
 *
 * It has to stay dark. The subject is clear glass alpha-blended on top,
 * so every point of brightness here is contrast taken off the crystal —
 * the fields peak around 0.07 linear, which is bright enough to read as
 * colour after ACES and nowhere near bright enough to fog the object.
 *
 * Drawn as a clip-space quad with depth testing off, so it is always
 * behind the model no matter where the model has been pushed in z.
 */

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  // Straight to the far plane; no view or projection involved.
  gl_Position = vec4(position.xy, 0.9999, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2  uRes;
uniform float uFocus;     // where the object is, -1..1 across the frame
uniform vec3  uBase;
uniform vec3  uColA;
uniform vec3  uColB;
uniform vec3  uColC;
uniform vec3  uPool;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float e = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, e, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, amp = 0.55;
  for (int i = 0; i < 3; i++) {
    v += amp * vnoise(p);
    p *= 2.03;   // slightly off 2.0 so the octaves don't align to a grid
    amp *= 0.5;
  }
  return v;
}

/** Soft elliptical field. Squared falloff, so it has no visible rim. */
float field(vec2 p, vec2 c, vec2 r) {
  vec2 d = (p - c) / r;
  return exp(-dot(d, d));
}

void main() {
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  float t = uTime * 0.035;

  // Domain warp. Two independent noise fields displace the sample point
  // before any colour is looked up, which folds the boundaries between
  // the fields instead of simply sliding them past each other.
  vec2 w = vec2(
    fbm(p * 1.15 + vec2(t, -t * 0.72)),
    fbm(p * 1.15 + vec2(4.7 - t * 0.61, 2.3 + t * 0.88))
  );
  vec2 q = p + (w - 0.5) * 0.62;

  // Field centres orbit on long, non-harmonic periods so the
  // composition never returns to a pose the eye recognises.
  vec2 ca = vec2(-0.72 + sin(t * 1.7) * 0.16, 0.34 + cos(t * 1.3) * 0.12);
  vec2 cb = vec2(0.66 + cos(t * 1.1) * 0.18, -0.36 + sin(t * 1.9) * 0.13);
  vec2 cc = vec2(0.06 + sin(t * 0.8) * 0.34, 0.02 + cos(t * 1.5) * 0.2);

  vec3 col = uBase;
  col += uColA * field(q, ca, vec2(0.66, 0.52));
  col += uColB * field(q, cb, vec2(0.72, 0.5));
  col += uColC * field(q, cc, vec2(0.5, 0.38)) * 0.85;

  // A cold pool that tracks the object, so the subject always has
  // something behind it to separate from.
  vec2 pool = vec2(uFocus * aspect * 0.5, 0.02);
  col += uPool * field(p, pool, vec2(0.62, 0.5));

  // Vignette, applied last so it darkens the fields too.
  float vig = 1.0 - smoothstep(0.34, 1.02, length(p * vec2(0.84, 1.0)));
  col *= mix(0.2, 1.0, vig);

  // Dither, so these very dark gradients don't band on an 8-bit display.
  col += (hash21(vUv * uRes + fract(uTime)) - 0.5) * 0.0025;

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function Backdrop() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const focus = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uFocus: { value: 0 },
      uBase: { value: new THREE.Vector3(...BACKDROP_BASE) },
      uColA: { value: new THREE.Vector3(...BACKDROP_A) },
      uColB: { value: new THREE.Vector3(...BACKDROP_B) },
      uColC: { value: new THREE.Vector3(...BACKDROP_C) },
      uPool: { value: new THREE.Vector3(...BACKDROP_POOL) },
    }),
    []
  );

  useFrame(({ clock, size }, rawDelta) => {
    const m = mat.current;
    if (!m) return;
    const dt = Math.min(rawDelta, 1 / 30);
    // Trails the object rather than snapping with it — a pool of light
    // that tracks a moving subject exactly reads as a following spot.
    focus.current = damp(focus.current, view.objectX, 2.2, dt);
    m.uniforms.uTime.value = clock.elapsedTime;
    m.uniforms.uFocus.value = focus.current;
    m.uniforms.uRes.value.set(size.width, size.height);
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1000}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
