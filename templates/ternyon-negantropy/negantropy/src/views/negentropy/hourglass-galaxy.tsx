"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import type {
  CursorActivityRef,
  CursorRef,
  ScrollProgressRef,
} from "./use-scroll-progress";

interface HourglassGalaxyProps {
  progressRef: ScrollProgressRef;
  cursorRef: CursorRef;
  activityRef: CursorActivityRef;
  /** Particles **per funnel** — top and bottom share the same count. */
  count?: number;
  /** Radius of each galaxy disc (== half-height of the figure). */
  radius?: number;
  /** Number of spiral arms per funnel. */
  branches?: number;
  /** Multiplier on the particle count (e.g. 0.7 on mobile). */
  densityScale?: number;
}

// Vortex math ported from
// `obsidian/projects/negentropy/source/hourglass-galaxy.reference.js`.
// Each funnel pulls its particles along Y by
// `clamp(0.5 / distanceToCenter, 0, uYOffset)` so particles near the
// waist rise (or fall) the farthest — the sand-timer pinch.
// `uVortexDirection` is +1 for the top funnel and -1 for the bottom;
// it flips both the spin and the Y pull in one uniform so the two
// halves counter-rotate like sand pouring through.
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uVortexDirection;
  uniform float uYOffset;
  uniform vec3 uCursor;
  uniform float uRepelRadius;
  uniform float uRepelStrength;
  uniform float uActivity;

  attribute float aScale;
  attribute vec3 aRandomness;

  varying vec3 vColor;

  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angleOffset = (1.0 / max(distanceToCenter, 0.0001)) * uTime * 0.2 * uVortexDirection;
    angle += angleOffset;
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;

    // Top funnel: pull = -clamp(...) + uYOffset, range ≈ [0, uYOffset].
    // Bottom funnel (uVortexDirection = -1): pull = +clamp(...) - uYOffset,
    // range ≈ [-uYOffset, 0]. The two halves meet at y=0.
    float pull = clamp(0.5 / max(distanceToCenter, 0.0001), 0.0, uYOffset);
    modelPosition.y = -pull * uVortexDirection + uYOffset * uVortexDirection;

    modelPosition.xyz += aRandomness;

    // Cursor-void repulsion — gentler than the storm so the figure
    // stays legible as an emblem.
    vec3 toParticle = modelPosition.xyz - uCursor;
    float dist = length(toParticle);
    float falloff = smoothstep(uRepelRadius, 0.0, dist);
    modelPosition.xyz += normalize(toParticle + vec3(0.0001)) * falloff * uRepelStrength * uActivity;

    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    gl_PointSize = uSize * aScale;
    gl_PointSize *= (1.0 / -viewPosition.z);

    vColor = color;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;

  void main() {
    vec2 newUv = gl_PointCoord - 0.5;
    // Discard corners of the point-sprite quad — keeps the soft disc
    // shape clean once bloom is composited on top.
    float d = length(newUv);
    if (d > 0.5) discard;
    float strength = 1.0 - d;
    strength = pow(strength, 10.0);
    vec3 color = mix(vec3(0.0), vColor, strength);
    // 2× brightness multiplier — see [[components/negentropy]] note.
    gl_FragColor = vec4(color * 2.0, strength * uOpacity);
    #include <colorspace_fragment>
  }
`;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ramp = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

const buildGeometry = (
  count: number,
  radius: number,
  branches: number,
): THREE.BufferGeometry => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const randomness = new Float32Array(count * 3);

  // Reference palette — brand-anchored. The "lost" scene the user
  // remembers used exactly these two colours.
  const insideColor = new THREE.Color("#ff6030");
  const outsideColor = new THREE.Color("#1b3984");
  const randomnessAmount = 0.5;
  const randomnessPower = 1;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const r = Math.random() * radius;
    const branchAngle = ((i % branches) / branches) * Math.PI * 2;

    positions[i3] = Math.cos(branchAngle) * r;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = Math.sin(branchAngle) * r;

    const radialDensity =
      Math.pow(Math.random(), randomnessPower) * randomnessAmount * r;
    const phi = Math.acos(1 - 2 * Math.random());
    const theta = Math.random() * Math.PI * 2;
    randomness[i3] = Math.sin(phi) * Math.cos(theta) * radialDensity;
    randomness[i3 + 1] = Math.sin(phi) * Math.sin(theta) * radialDensity;
    randomness[i3 + 2] = Math.cos(phi) * radialDensity;

    const mixed = insideColor.clone().lerp(outsideColor, r / radius);
    colors[i3] = mixed.r;
    colors[i3 + 1] = mixed.g;
    colors[i3 + 2] = mixed.b;

    scales[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute("aRandomness", new THREE.BufferAttribute(randomness, 3));
  return geometry;
};

interface FunnelProps {
  geometry: THREE.BufferGeometry;
  vortexDirection: 1 | -1;
  yOffset: number;
  progressRef: ScrollProgressRef;
  cursorRef: CursorRef;
  activityRef: CursorActivityRef;
}

const Funnel = ({
  geometry,
  vortexDirection,
  yOffset,
  progressRef,
  cursorRef,
  activityRef,
}: FunnelProps) => {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 22 },
      uOpacity: { value: 0 },
      uVortexDirection: { value: vortexDirection },
      uYOffset: { value: yOffset },
      uCursor: { value: new THREE.Vector3() },
      uRepelRadius: { value: 1.3 },
      uRepelStrength: { value: 0.7 },
      uActivity: { value: 0 },
    }),
    [vortexDirection, yOffset],
  );

  useFrame((state) => {
    const mat = matRef.current;
    if (!mat) return;
    const p = progressRef.current ?? 0;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    // Fade in across the storm-blow-up window so the hourglass
    // emerges *through* the dispersing storm — closing visual handoff.
    mat.uniforms.uOpacity.value = clamp01(ramp(p, 0.83, 0.95));
    if (cursorRef.current) {
      mat.uniforms.uCursor.value.copy(cursorRef.current);
    }
    mat.uniforms.uActivity.value = activityRef.current ?? 0;
  });

  return (
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
  );
};

/**
 * HourglassGalaxy — §VI emblem. Two counter-rotating spiral funnels
 * stacked on Y form a sand-timer figure; top pulls upward to
 * `+yOffset`, bottom mirrors downward to `-yOffset`, with opposing
 * spin so it reads as sand pouring through the waist.
 *
 * Originally built for §I–§III in v0.1 and retired in v0.10; brought
 * back in v0.17 for §VI per user request — the scene "we had at the
 * beginning but it was lost." Scaled down vs. the reference
 * (radius 2.5, y-offset 2.5) so the full figure frames inside the
 * §VI camera at `pos (0, 0, 5) → look (0, 0, 0)` — the same point
 * where the storm just blew apart, so the hourglass emerges out of
 * the explosion.
 */
export const HourglassGalaxy = ({
  progressRef,
  cursorRef,
  activityRef,
  count = 70000,
  radius = 2.5,
  branches = 3,
  densityScale = 1,
}: HourglassGalaxyProps) => {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    const g = buildGeometry(Math.round(count * densityScale), radius, branches);
    setGeometry(g);
    return () => g.dispose();
  }, [count, densityScale, radius, branches]);

  if (!geometry) return null;

  // Funnel apex height = disc radius — keeps width and height in
  // proportion. Reference uses both at 5; we run at 2.5 to fit §VI.
  const yOffset = radius;

  return (
    <group>
      <Funnel
        geometry={geometry}
        vortexDirection={1}
        yOffset={yOffset}
        progressRef={progressRef}
        cursorRef={cursorRef}
        activityRef={activityRef}
      />
      <Funnel
        geometry={geometry}
        vortexDirection={-1}
        yOffset={yOffset}
        progressRef={progressRef}
        cursorRef={cursorRef}
        activityRef={activityRef}
      />
    </group>
  );
};
