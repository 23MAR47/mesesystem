"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import type {
  CursorActivityRef,
  CursorRef,
  ScrollProgressRef,
} from "./use-scroll-progress";

interface RedStormProps {
  progressRef: ScrollProgressRef;
  cursorRef: CursorRef;
  activityRef: CursorActivityRef;
  count?: number;
  radius?: number;
  /** Multiplier on the particle count (e.g. 0.7 on mobile). */
  densityScale?: number;
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uBlowUp;
  uniform vec3 uCursor;
  uniform float uRepelRadius;
  uniform float uRepelStrength;
  uniform float uActivity;

  attribute float aScale;
  attribute float aNoise;
  attribute float aRadialPush;

  varying vec3 vColor;
  varying float vBlowUp;

  void main() {
    vec3 pos = position;

    // Each particle wobbles independently outward/inward — controlled
    // sine wave keyed by a per-particle phase, scaled by an aRadialPush
    // factor so the storm reads as a turbulent body, not a uniform shell.
    float t = uTime * 1.4 + aNoise * 6.2831;
    float wobble = sin(t) * 0.25 * aRadialPush;
    pos *= 1.0 + wobble;

    // A slow secondary swirl to keep silhouettes alive even at rest.
    float swirlAngle = uTime * 0.08 + aNoise * 6.2831;
    mat2 swirl = mat2(cos(swirlAngle), -sin(swirlAngle), sin(swirlAngle), cos(swirlAngle));
    pos.xz = swirl * pos.xz;

    // **Blow-up** — at the §V→§VI transition every particle is shoved
    // outward along its own radial direction. Per-particle aRadialPush
    // + aNoise gives an uneven explosion (some particles streak fast,
    // others lag). Squared falloff so the explosion accelerates.
    vec3 outward = normalize(pos + vec3(0.0001));
    float blow = uBlowUp * uBlowUp;
    pos += outward * blow * (10.0 + aNoise * 18.0) * aRadialPush;

    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);

    // Liquid-void repulsion — push particles away from the world-space
    // cursor with a smooth falloff. Zero past uRepelRadius. Scaled by
    // uActivity (0 idle → 1 moving) for the smooth fade in/out.
    vec3 toParticle = modelPosition.xyz - uCursor;
    float dist = length(toParticle);
    float falloff = smoothstep(uRepelRadius, 0.0, dist);
    modelPosition.xyz += normalize(toParticle + vec3(0.0001)) * falloff * uRepelStrength * uActivity;

    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    gl_PointSize = uSize * aScale;
    gl_PointSize *= (1.0 / -viewPosition.z);

    vColor = color;
    vBlowUp = uBlowUp;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vBlowUp;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    // Discard corners of the point-sprite quad — see the matching note
    // on molecule.tsx. Bloom otherwise reveals visible black squares.
    float d = length(uv);
    if (d > 0.5) discard;
    float strength = pow(1.0 - d * 2.0, 4.5);
    vec3 color = mix(vec3(0.0), vColor, strength);
    // Particles fade as they scatter — slow at first (so the explosion
    // reads as bright) then sharper toward the end of the window.
    float blowFade = 1.0 - smoothstep(0.15, 1.0, vBlowUp);
    // **4× brightness multiplier** — double the house-style 2× pass so
    // the storm reads as a hot pumping mass under bloom.
    gl_FragColor = vec4(color * 4.0, strength * uOpacity * blowFade);
    #include <colorspace_fragment>
  }
`;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ramp = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

const buildGeometry = (count: number, radius: number): THREE.BufferGeometry => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const noises = new Float32Array(count);
  const radialPush = new Float32Array(count);

  // Bright green / teal / bone palette — replaces the earlier
  // red→hot-red→ember run. The variable names stay the same so the
  // gradient logic below still reads as "deepest tone at the core".
  const deepRed = new THREE.Color("#0aff7f");
  const hotRed = new THREE.Color("#3affd0");
  const ember = new THREE.Color("#caffff");

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Uniform sphere distribution (Marsaglia method), then bias the radius
    // outward so most particles sit near the shell — gives the silhouette
    // a clear edge while the wobble keeps it organic.
    let u: number;
    let v: number;
    let s: number;
    do {
      u = Math.random() * 2 - 1;
      v = Math.random() * 2 - 1;
      s = u * u + v * v;
    } while (s >= 1 || s === 0);

    const factor = 2 * Math.sqrt(1 - s);
    const dx = u * factor;
    const dy = v * factor;
    const dz = 1 - 2 * s;

    const rN = Math.pow(Math.random(), 0.4); // bias outward
    const r = radius * (0.55 + rN * 0.45);

    positions[i3] = dx * r;
    positions[i3 + 1] = dy * r;
    positions[i3 + 2] = dz * r;

    // Three-stop gradient with a longer, smoother **deep-green core**
    // (variable named `deepRed` for historical reasons — the palette
    // was originally red/hot/ember; now it carries green/teal/bone).
    // `smoothstep(0.25, 0.85, rN)` keeps the inner ~25 % purely on
    // `deepRed`, then S-curves into `hotRed` toward the shell. The
    // ember bias is pushed later (`rN = 0.7`, ×3 ramp) so the bright
    // bone rim sits at the very outer crust only.
    const t1 = THREE.MathUtils.smoothstep(rN, 0.25, 0.85);
    const mix1 = deepRed.clone().lerp(hotRed, t1);
    const t2 = Math.min(1, Math.max(0, (rN - 0.7) * 3));
    const mixed = mix1.lerp(ember, t2);
    colors[i3] = mixed.r;
    colors[i3 + 1] = mixed.g;
    colors[i3 + 2] = mixed.b;

    scales[i] = 0.45 + Math.random() * 0.8;
    noises[i] = Math.random();
    // Outer particles wobble more dramatically than inner ones.
    radialPush[i] = 0.4 + rN * 1.1;
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  g.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  g.setAttribute("aNoise", new THREE.BufferAttribute(noises, 1));
  g.setAttribute(
    "aRadialPush",
    new THREE.BufferAttribute(radialPush, 1),
  );
  return g;
};

/**
 * Red Storm — §III's centerpiece. Replaces the hourglass-reversal beat
 * with a denser, hotter visual: an organic red mass that wobbles in
 * and out, swirls slowly around itself, and reads as the body in
 * crisis — pumping, alive, refusing to settle into entropy.
 *
 * Particles ride a per-particle sine wobble keyed by `aNoise`; outer
 * particles wobble more (`aRadialPush`) so the silhouette breathes.
 * Group also rotates slowly.
 */
export const RedStorm = ({
  progressRef,
  cursorRef,
  activityRef,
  count = 50000,
  radius = 2.5,
  densityScale = 1,
}: RedStormProps) => {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 38 },
      uOpacity: { value: 0 },
      uBlowUp: { value: 0 },
      uCursor: { value: new THREE.Vector3() },
      uRepelRadius: { value: 1.4 },
      uRepelStrength: { value: 1.0 },
      uActivity: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    const g = buildGeometry(Math.round(count * densityScale), radius);
    setGeometry(g);
    return () => g.dispose();
  }, [count, densityScale, radius]);

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;

    const p = progressRef.current ?? 0;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    // **Six-section page** — timings scaled by 5/6 vs. the original
    // five-section build so each beat hits the same scroll-vh moment.
    // Storm fades in across §IV→§V (0.52 → 0.71) and reaches the
    // world-origin centre by 0.83 (the §V→§VI boundary), then blows
    // outward across 0.83 → 0.95 as the close starfield takes over.
    mat.uniforms.uOpacity.value = clamp01(ramp(p, 0.52, 0.71));
    mat.uniforms.uBlowUp.value = clamp01(ramp(p, 0.83, 0.95));

    if (cursorRef.current) {
      mat.uniforms.uCursor.value.copy(cursorRef.current);
    }
    mat.uniforms.uActivity.value = activityRef.current ?? 0;

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
      groupRef.current.rotation.x += delta * 0.04;

      // **Flyby trajectory** — storm enters from middle-bottom of
      // the camera view and arcs to world origin (0, 0, 0) by p=0.83
      // (the §V→§VI boundary). The §V camera anchor at (0, 0, 7)
      // looking at the same origin lands it dead-centre on screen.
      const stormProgress = clamp01(ramp(p, 0.52, 0.83));
      const startX = 0;
      const startY = -2;
      const startZ = 4;
      const endX = 0;
      const endY = 0;
      const endZ = 0;
      groupRef.current.position.set(
        startX + (endX - startX) * stormProgress,
        startY + (endY - startY) * stormProgress,
        startZ + (endZ - startZ) * stormProgress,
      );
    }
  });

  if (!geometry) return null;

  // Initial position (0, -2, 4) — middle-bottom of the camera
  // view at the moment the storm starts fading in (p=0.62). The
  // `useFrame` above lifts it to world origin (0, 0, 0) by p=1.0.
  // The §V camera anchor at (0, 0, 7) looks straight along -Z at
  // the same point — storm lands dead centre on screen.
  return (
    <group ref={groupRef} position={[0, -2, 4]}>
      <points geometry={geometry}>
        <shaderMaterial
          ref={matRef}
          transparent
          depthWrite={false}
          vertexColors
          blending={THREE.AdditiveBlending}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </points>
    </group>
  );
};
