"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import type {
  CursorActivityRef,
  CursorRef,
  ScrollProgressRef,
} from "./use-scroll-progress";

interface StarfieldCloseProps {
  progressRef: ScrollProgressRef;
  cursorRef: CursorRef;
  activityRef: CursorActivityRef;
  count?: number;
  /** Multiplier on the particle count (e.g. 0.7 on mobile). */
  densityScale?: number;
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uDrift;
  uniform vec3 uCursor;
  uniform float uRepelRadius;
  uniform float uRepelStrength;
  uniform float uActivity;

  attribute float aScale;
  attribute float aPhase;

  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    vec3 pos = position;

    // **Endless drift** — every particle creeps toward +Z (toward the
    // camera). When it passes the front plane it wraps around to the
    // back, so the field reads as an infinite tunnel of stars streaming
    // past. mod() keeps the work entirely on the GPU. Box depth = 30
    // so every camera anchor (z range 5 → 9) stays well inside the
    // field with margin on both sides.
    float depth = 30.0;
    pos.z = mod(pos.z + uDrift + (depth * 0.5), depth) - (depth * 0.5);

    // Per-particle twinkle phase — alpha-modulated in the fragment.
    float tw = sin(uTime * 1.6 + aPhase * 6.2831);
    vTwinkle = 0.55 + 0.45 * tw;

    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);

    // Light cursor repulsion so the void-blob still reads in the final
    // beat, but gentler than the storm so the field stays immersive.
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
  varying float vTwinkle;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    // Discard corners of the point-sprite quad — pow(neg, 4.0) is
    // *positive* (even integer power) so the previous strength<=0
    // check never fired here, and bloom amplified the corner fringe
    // into the obvious black-square artefact at close range where
    // point sprites are huge.
    float d = length(uv);
    if (d > 0.5) discard;
    float strength = pow(1.0 - d * 2.0, 4.0);
    vec3 color = mix(vec3(0.0), vColor, strength);
    // 2× brightness multiplier — see [[components/negentropy]] note.
    gl_FragColor = vec4(color * 2.0, strength * uOpacity * vTwinkle);
    #include <colorspace_fragment>
  }
`;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ramp = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

interface StarfieldAssets {
  geometry: THREE.BufferGeometry;
}

const buildAssets = (count: number): StarfieldAssets => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const phases = new Float32Array(count);

  // Bright closing palette — cyan, violet, bone — distinct from the
  // amber/red of the storm so the §VI handover reads as a clean tonal
  // reset.
  const cyan = new THREE.Color("#aef6ff");
  const violet = new THREE.Color("#c8a6ff");
  const bone = new THREE.Color("#fff7e6");
  const palette: ReadonlyArray<THREE.Color> = [cyan, violet, bone];

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Box volume around the **entire** camera path (z spans 5 → 9 across
    // §I → §VI). Width wide enough to fill the FOV at the farthest
    // camera distance (z=9, fov 70, 16:9 → ≈ 22 units wide), depth
    // generous so the drift loop never exposes its seams.
    positions[i3] = (Math.random() - 0.5) * 24;
    positions[i3 + 1] = (Math.random() - 0.5) * 16;
    positions[i3 + 2] = (Math.random() - 0.5) * 30;

    const base = palette[Math.floor(Math.random() * palette.length)];
    // Slight brightness jitter so the field has visible tonal variation.
    const brightness = 0.7 + Math.random() * 0.6;
    colors[i3] = Math.min(1, base.r * brightness);
    colors[i3 + 1] = Math.min(1, base.g * brightness);
    colors[i3 + 2] = Math.min(1, base.b * brightness);

    // Wide scale range — bigger headline stars (up to ~3.0) so the
    // field reads as a noticeable foreground layer, not background dust.
    scales[i] = 0.5 + Math.pow(Math.random(), 1.4) * 2.5;
    phases[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  return { geometry };
};

/**
 * StarfieldClose — **always-on travelling backdrop** from §II onward.
 * A dense, immersive volume of bright stars wrapping around the
 * camera. Particles drift toward the viewer (z+) and mod-wrap, so
 * the field reads as an endless tunnel of starlight. Fades in across
 * `ramp(0.16, 0.28)` (the §I→§II handover) and holds at full opacity
 * for the rest of the page, so every section after the hero has the
 * sense of moving through space.
 *
 * **Scroll-driven drift speed** — `1.4 + p × 3` gives a baseline
 * "we're going somewhere" feel that picks up as the user scrolls
 * deeper. A scroll-velocity term piles on top so an active scroll
 * gesture *briefly* whooshes the stars past, then settles back to the
 * progress-based pace when scrolling stops.
 *
 * Distinct from the ambient `Starfield` background (sparse static
 * sphere): this is a foreground, shader-driven field with twinkle +
 * drift + cursor repulsion.
 */
export const StarfieldClose = ({
  progressRef,
  cursorRef,
  activityRef,
  count = 1500,
  densityScale = 1,
}: StarfieldCloseProps) => {
  const [assets, setAssets] = useState<StarfieldAssets | null>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  // Tracks last frame's scroll progress so we can derive a per-frame
  // scroll velocity — adds an instant "whoosh" boost while the user
  // is actively scrolling.
  const prevProgressRef = useRef<number>(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 20 },
      uOpacity: { value: 0 },
      uDrift: { value: 0 },
      uCursor: { value: new THREE.Vector3() },
      uRepelRadius: { value: 1.2 },
      uRepelStrength: { value: 0.6 },
      uActivity: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    const built = buildAssets(Math.round(count * densityScale));
    setAssets(built);
    return () => built.geometry.dispose();
  }, [count, densityScale]);

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;

    const p = progressRef.current ?? 0;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uOpacity.value = clamp01(ramp(p, 0.16, 0.28));

    // Drift speed: progress-based baseline + scroll-velocity kick.
    // Per-frame Δprogress is scaled hard (×80) and clamped so a single
    // strong scroll bursts the stars forward without spiking
    // unboundedly on jumps.
    const scrollVelocity = Math.min(
      Math.abs(p - prevProgressRef.current) * 80,
      6,
    );
    prevProgressRef.current = p;
    const speed = 1.4 + p * 3.0 + scrollVelocity;
    mat.uniforms.uDrift.value += delta * speed;

    if (cursorRef.current) {
      mat.uniforms.uCursor.value.copy(cursorRef.current);
    }
    mat.uniforms.uActivity.value = activityRef.current ?? 0;
  });

  if (!assets) return null;

  return (
    <points geometry={assets.geometry}>
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
