"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import type {
  CursorActivityRef,
  CursorRef,
  ScrollProgressRef,
} from "./use-scroll-progress";

interface SpiralNetworkProps {
  progressRef: ScrollProgressRef;
  cursorRef: CursorRef;
  activityRef: CursorActivityRef;
  count?: number;
  radius?: number;
  branches?: number;
  /** Multiplier on the particle count (e.g. 0.7 on mobile). */
  densityScale?: number;
}

const networkVertex = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCamPos;
  uniform float uOpacity;
  uniform vec3 uCursor;
  uniform float uRepelRadius;
  uniform float uRepelStrength;
  uniform float uActivity;

  attribute vec3 aRandom;
  attribute float aScale;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    float angle = atan(modelPosition.y, modelPosition.x);
    float vecLength = length(modelPosition.xy);
    float angleOffset = (1.0 / vecLength) * uTime;
    angle += angleOffset;

    modelPosition.x = cos(angle) * vecLength;
    modelPosition.z = sin(angle) * vecLength;
    modelPosition.y += tan(angle) * dot(normalize(uCamPos), vec3(0.0, 0.0, 1.0));

    modelPosition.xyz += aRandom;

    // Liquid-void repulsion — push particles away from the world-space
    // cursor with a smooth falloff. Zero past uRepelRadius. The whole
    // displacement is scaled by uActivity (0 idle → 1 moving) so the
    // void fades in/out smoothly.
    vec3 toParticle = modelPosition.xyz - uCursor;
    float dist = length(toParticle);
    float falloff = smoothstep(uRepelRadius, 0.0, dist);
    modelPosition.xyz += normalize(toParticle + vec3(0.0001)) * falloff * uRepelStrength * uActivity;

    vec4 mvPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = 8.0 * aScale;
    gl_PointSize *= (1.0 / -mvPosition.z);

    vColor = color;
    vAlpha = uOpacity;
  }
`;

const networkFragment = /* glsl */ `
  uniform float uTime;
  varying vec3 vColor;
  varying float vAlpha;

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  void main() {
    float strength = 1.0 - distance(gl_PointCoord, vec2(0.5));
    strength = step(0.5, strength);

    // Brighter HSV saturation/value so the spiral reads more vivid.
    vec3 timed = hsv2rgb(vec3(vColor.x + uTime * 0.04, 0.75, 1.0));
    vec3 color = mix(vec3(0.0), timed, strength);

    // 2× brightness boost across all five shader scenes — particles
    // saturate harder under additive blending so the negative space
    // reads as a backdrop, not the foreground.
    gl_FragColor = vec4(color * 2.0, strength * vAlpha);
    #include <colorspace_fragment>
  }
`;

const buildGeometry = (
  count: number,
  radius: number,
  branches: number,
): THREE.BufferGeometry => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const randomness = new Float32Array(count * 3);
  const scales = new Float32Array(count);

  // Brighter inner / outer so the HSV-shifted strands really pop.
  const innerColor = new THREE.Color("#b3ffd6");
  const outerColor = new THREE.Color("#a78cff");
  const randomnessFactor = 0.777;
  const randomnessPower = 2;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const t = ((i % branches) / branches) * Math.PI * 2;
    const r = Math.random() * radius;

    positions[i3] = Math.cos(t + Math.PI * 0.5) * r;
    positions[i3 + 1] = Math.sin(t + Math.PI * 0.5) * r;
    positions[i3 + 2] = 0;

    for (let j = 0; j < 3; j++) {
      randomness[i3 + j] =
        Math.pow(Math.random(), randomnessPower) *
        (Math.random() < 0.5 ? -1 : 1) *
        randomnessFactor *
        r;
    }

    const mixed = innerColor.clone().lerp(outerColor, r / radius);
    colors[i3] = mixed.r;
    colors[i3 + 1] = mixed.g;
    colors[i3 + 2] = mixed.b;

    scales[i] = Math.random();
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  g.setAttribute("aRandom", new THREE.BufferAttribute(randomness, 3));
  g.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

  return g;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ramp = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/**
 * Spiral Network — §I's hero scene. Two-arm spiral of ~80 k particles
 * with camera-relative vertical tilt and HSV colour rotation. From a
 * low angle reads as a diffuse wisp; once the camera is closer it
 * resolves into a web of connected strands — the "many connected"
 * cosmic network. Fades out as the molecule takes over for §II.
 *
 * Was previously named `NebulaGalaxy` — renamed in v0.13 because the
 * visual reads as a connected network, not a diffuse cloud. Same
 * shader internals; only the file + export name changed.
 */
export const SpiralNetwork = ({
  progressRef,
  cursorRef,
  activityRef,
  count = 80000,
  radius = 5,
  branches = 2,
  densityScale = 1,
}: SpiralNetworkProps) => {
  const { camera } = useThree();
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCamPos: { value: new THREE.Vector3() },
      uOpacity: { value: 0 },
      uCursor: { value: new THREE.Vector3() },
      uRepelRadius: { value: 1.6 },
      uRepelStrength: { value: 1.0 },
      uActivity: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    const g = buildGeometry(Math.round(count * densityScale), radius, branches);
    setGeometry(g);
    return () => g.dispose();
  }, [count, densityScale, radius, branches]);

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    const p = progressRef.current ?? 0;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uCamPos.value.copy(camera.position);
    // Spiral Network is the §I hero: fully present from `p === 0` (the
    // visible reveal comes from the loader's 1.5 s bg-fade-out on z-50,
    // which uncovers the scene already at full opacity). Recedes as the
    // molecule (§II) takes over.
    // Timings scaled by 5/6 vs. the original five-section build so each
    // beat still hits the same scroll-vh moment on the six-section page.
    mat.uniforms.uOpacity.value = clamp01(1 - ramp(p, 0.18, 0.32));
    if (cursorRef.current) {
      mat.uniforms.uCursor.value.copy(cursorRef.current);
    }
    mat.uniforms.uActivity.value = activityRef.current ?? 0;

    // Rotation accelerates through the whole §I scroll, peaking right as
    // the network fully disappears (`p=0.38`). Keeps the rotation
    // visible all the way through the fade-out rather than topping out
    // mid-section.
    if (groupRef.current) {
      const baseSpin = 0.08;
      const scrollSpin = ramp(p, 0.0, 0.32) * 1.4;
      groupRef.current.rotation.y += delta * (baseSpin + scrollSpin);
    }
  });

  if (!geometry) return null;

  return (
    <group ref={groupRef} rotation={[-0.35, 0, 0]} position={[0, 2.5, 0]}>
      <points geometry={geometry}>
        <shaderMaterial
          ref={matRef}
          transparent
          depthWrite={false}
          vertexColors
          blending={THREE.AdditiveBlending}
          vertexShader={networkVertex}
          fragmentShader={networkFragment}
          uniforms={uniforms}
        />
      </points>
    </group>
  );
};
