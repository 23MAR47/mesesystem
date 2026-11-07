"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import type {
  CursorActivityRef,
  CursorRef,
  ScrollProgressRef,
} from "./use-scroll-progress";

interface MoleculeProps {
  progressRef: ScrollProgressRef;
  cursorRef: CursorRef;
  activityRef: CursorActivityRef;
  /** Overall molecule size (atom-cage radius in world units). */
  radius?: number;
  /** Multiplier on the particle count (e.g. 0.7 on mobile). */
  densityScale?: number;
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uAssembly;
  uniform vec3 uCursor;
  uniform float uRepelRadius;
  uniform float uRepelStrength;
  uniform float uActivity;

  attribute float aScale;
  attribute vec3 aStartPos;
  attribute float aDelay;

  varying vec3 vColor;
  varying float vT;

  void main() {
    // Each particle waits until uAssembly passes its aDelay, then
    // interpolates from a scattered far-away origin to its molecule
    // position over a short window — *unbelievable construction effect*.
    float raw = clamp((uAssembly - aDelay) * 2.8, 0.0, 1.0);
    float t = smoothstep(0.0, 1.0, raw);

    vec3 base = mix(aStartPos, position, t);

    // Internal motion — each particle wobbles slightly around its rest
    // position once assembled, so each atom / bond reads as a living
    // cluster rather than a static spray of dots. Phase is keyed off
    // aScale so neighbours drift out of sync.
    float wt = uTime + aScale * 12.566;
    vec3 wobble = vec3(
      sin(wt * 1.4),
      cos(wt * 1.6),
      sin(wt * 1.2 + 1.57)
    ) * 0.06;
    base += wobble * t;

    vec4 modelPosition = modelMatrix * vec4(base, 1.0);

    // Cursor void repulsion, scaled by uActivity for the fade in/out.
    vec3 toParticle = modelPosition.xyz - uCursor;
    float dist = length(toParticle);
    float falloff = smoothstep(uRepelRadius, 0.0, dist);
    modelPosition.xyz += normalize(toParticle + vec3(0.0001)) * falloff * uRepelStrength * uActivity;

    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    // Particle size grows with assembly progress so the silhouette
    // sharpens as the molecule lands.
    gl_PointSize = uSize * aScale * mix(0.4, 1.0, t);
    gl_PointSize *= (1.0 / -viewPosition.z);

    vColor = color;
    vT = t;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;

  varying vec3 vColor;
  varying float vT;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    // Discard the corners of the point-sprite quad first — pow(neg, 4.5)
    // is undefined/positive on some GPUs, so the previous strength<=0
    // check failed to fire outside the inscribed circle. Bloom amplifies
    // that fringe into visible square artefacts.
    float d = length(uv);
    if (d > 0.5) discard;
    float strength = pow(1.0 - d * 2.0, 4.5);
    vec3 color = mix(vec3(0.0), vColor, strength);
    // Particles fade in with their construction progress so scattered
    // pre-assembly particles aren't visible cluttering the frame.
    // **4× brightness multiplier** — double the house-style 2× pass so
    // the cyan/blue atom palette reads as luminous under bloom.
    // Bonds compensate via a halved source colour (see bondColor)
    // so they keep their previous pure-white look.
    gl_FragColor = vec4(color * 4.0, strength * uOpacity * vT);
    #include <colorspace_fragment>
  }
`;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ramp = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

// Icosahedral atom cage — 12 atoms equally spaced on a sphere, connected
// by 30 edges. Reads as a "molecule" without being any specific real
// compound, and gives us enough internal geometry that the construction
// effect feels rich.
const PHI = (1 + Math.sqrt(5)) / 2;
const RAW_ATOMS: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, PHI],
  [0, -1, PHI],
  [0, 1, -PHI],
  [0, -1, -PHI],
  [1, PHI, 0],
  [-1, PHI, 0],
  [1, -PHI, 0],
  [-1, -PHI, 0],
  [PHI, 0, 1],
  [-PHI, 0, 1],
  [PHI, 0, -1],
  [-PHI, 0, -1],
];

const distance = (a: readonly [number, number, number], b: readonly [number, number, number]) => {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

const buildAtomsAndBonds = (radius: number) => {
  // Normalise + scale to the requested radius.
  const atoms: Array<[number, number, number]> = RAW_ATOMS.map(([x, y, z]) => {
    const len = Math.sqrt(x * x + y * y + z * z);
    return [(x / len) * radius, (y / len) * radius, (z / len) * radius];
  });

  // The icosahedron's edge length is the smallest pairwise vertex
  // distance. Find it, then pick every pair within an epsilon of it.
  let minEdge = Infinity;
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const d = distance(atoms[i], atoms[j]);
      if (d < minEdge) minEdge = d;
    }
  }
  const bonds: Array<[number, number]> = [];
  const epsilon = minEdge * 0.05;
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      if (distance(atoms[i], atoms[j]) <= minEdge + epsilon) {
        bonds.push([i, j]);
      }
    }
  }
  return { atoms, bonds };
};

const ATOM_PARTICLES = 600; // per atom — dense, alive
const ATOM_CLUSTER_RADIUS = 0.32; // particle scatter inside each atom
// Bonds are intentionally thin/sparse so they read as wire-like
// connectors between the dense atom-balls instead of fat tubes that
// compete with the atoms for visual weight.
const BOND_PARTICLES = 60;
const BOND_TUBE_RADIUS = 0.025;
const SCATTER_DISTANCE = 22; // how far particles start before assembly

const buildGeometry = (
  radius: number,
  densityScale: number,
): THREE.BufferGeometry => {
  const { atoms, bonds } = buildAtomsAndBonds(radius);
  // Scale the per-element particle counts (e.g. ×0.7 on mobile). Floored at
  // 1 so a tiny scale never drops an atom/bond to zero particles.
  const atomParticles = Math.max(1, Math.round(ATOM_PARTICLES * densityScale));
  const bondParticles = Math.max(1, Math.round(BOND_PARTICLES * densityScale));
  const total = atoms.length * atomParticles + bonds.length * bondParticles;

  const positions = new Float32Array(total * 3);
  const startPositions = new Float32Array(total * 3);
  const colors = new Float32Array(total * 3);
  const scales = new Float32Array(total);
  const delays = new Float32Array(total);

  // Cool bright atom palette — cyan core fading to a vivid blue rim.
  // Replaces the earlier amber/orange so the molecule reads as a
  // crystalline blue cage instead of a hot organic one.
  const atomInner = new THREE.Color("#dcf7ff");
  const atomOuter = new THREE.Color("#4cb8ff");
  // Bond colour stored at half-brightness so the 4× fragment
  // multiplier lands them at the same on-screen white as before
  // (without blooming into a fat halo that competes with the atoms).
  const bondColor = new THREE.Color("#808080");

  const TAU = Math.PI * 2;
  let cursor = 0;

  const writeParticle = (
    x: number,
    y: number,
    z: number,
    color: THREE.Color,
    scale: number,
    delay: number,
  ) => {
    const i3 = cursor * 3;
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    // **Radial blow-up scatter** — `aStartPos` is the particle's home
    // position extended *outward* from the origin (with a little jitter
    // so the explosion isn't perfectly spherical). On dissolve the
    // shader interpolates `position → aStartPos`, so every particle
    // flies straight out from the molecule's centre — reads as an
    // explosion rather than a random-direction scatter.
    const len = Math.hypot(x, y, z) || 1;
    const outX = x / len;
    const outY = y / len;
    const outZ = z / len;
    const jitter = 3.5;
    startPositions[i3] =
      outX * SCATTER_DISTANCE + (Math.random() - 0.5) * jitter;
    startPositions[i3 + 1] =
      outY * SCATTER_DISTANCE + (Math.random() - 0.5) * jitter;
    startPositions[i3 + 2] =
      outZ * SCATTER_DISTANCE + (Math.random() - 0.5) * jitter;

    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
    scales[cursor] = scale;
    delays[cursor] = delay;
    cursor++;
  };

  // Atoms first — they assemble in the first half of the construction
  // window. Each atom gets a small cluster of particles around its
  // centre with a colour gradient from core to rim.
  for (let a = 0; a < atoms.length; a++) {
    const [ax, ay, az] = atoms[a];
    // Stagger atoms slightly so they don't all snap at once.
    const atomDelay = (a / atoms.length) * 0.28;

    for (let i = 0; i < atomParticles; i++) {
      // Random point in unit sphere, biased toward the surface so the
      // atom reads as a thick shell with a soft glow.
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
      const localR = ATOM_CLUSTER_RADIUS * (0.55 + Math.pow(Math.random(), 0.7) * 0.45);

      const mixed = atomInner.clone().lerp(atomOuter, localR / ATOM_CLUSTER_RADIUS);

      writeParticle(
        ax + dx * localR,
        ay + dy * localR,
        az + dz * localR,
        mixed,
        0.55 + Math.random() * 0.8,
        atomDelay + Math.random() * 0.05,
      );
    }
  }

  // Bonds — assemble *after* atoms so the molecule reads as
  // "atoms first, bonds form between them". Each bond is a tube of
  // particles along the line between two atom centres.
  for (let b = 0; b < bonds.length; b++) {
    const [iA, iB] = bonds[b];
    const a = atoms[iA];
    const c = atoms[iB];
    const bondDelay = 0.35 + (b / bonds.length) * 0.3;

    for (let i = 0; i < bondParticles; i++) {
      // Avoid both endpoints (already covered by atom clusters) by
      // biasing the parameter toward the centre of the bond.
      const t = 0.1 + Math.random() * 0.8;
      const cx = a[0] + (c[0] - a[0]) * t;
      const cy = a[1] + (c[1] - a[1]) * t;
      const cz = a[2] + (c[2] - a[2]) * t;

      // Random offset perpendicular to the bond direction — small,
      // gives the bond visible thickness.
      const phi = Math.random() * TAU;
      const r = Math.random() * BOND_TUBE_RADIUS;

      writeParticle(
        cx + Math.cos(phi) * r,
        cy + Math.sin(phi) * r * 0.4,
        cz + Math.sin(phi) * r,
        bondColor,
        // Small per-particle scale — bond particles read as thin glints
        // along the wire rather than chunky beads.
        0.28 + Math.random() * 0.2,
        bondDelay + Math.random() * 0.08,
      );
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  g.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  g.setAttribute("aStartPos", new THREE.BufferAttribute(startPositions, 3));
  g.setAttribute("aDelay", new THREE.BufferAttribute(delays, 1));
  return g;
};

/**
 * Molecule — §II's centerpiece. An icosahedral atom cage: 12 atoms (each
 * a dense particle cluster) connected by 30 bonds (each a thin tube of
 * particles). Reads instantly as a molecule rather than a fuzzy shape.
 *
 * As the scroll progress enters §II, the molecule **assembles** —
 * particles fly in from random far-away starting positions, atoms snap
 * into formation first, then bonds materialise between them. Reverses
 * (dissolves outward) as the red storm takes over for §III.
 */
export const Molecule = ({
  progressRef,
  cursorRef,
  activityRef,
  radius = 3.0,
  densityScale = 1,
}: MoleculeProps) => {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 34 },
      uOpacity: { value: 0 },
      uAssembly: { value: 0 },
      uCursor: { value: new THREE.Vector3() },
      uRepelRadius: { value: 1.9 },
      uRepelStrength: { value: 1.2 },
      uActivity: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    const g = buildGeometry(radius, densityScale);
    setGeometry(g);
    return () => g.dispose();
  }, [radius, densityScale]);

  useFrame((state) => {
    const mat = matRef.current;
    if (!mat) return;

    const p = progressRef.current ?? 0;
    mat.uniforms.uTime.value = state.clock.elapsedTime;

    // Master assembly envelope: builds across §I → §II
    // (0.18 → 0.35), holds, dissolves across §III → §IV (0.52 → 0.65).
    // Timings scaled by 5/6 to map the original five-section storyboard
    // onto the six-section page (§VI is the new starfield-close beat).
    const assemble = clamp01(ramp(p, 0.18, 0.35));
    const dissolve = clamp01(ramp(p, 0.52, 0.65));
    const assembly = assemble * (1 - dissolve);
    mat.uniforms.uAssembly.value = assembly;
    // Opacity follows the assembly envelope (the per-particle vT in the
    // fragment shader does the rest — scattered particles are invisible
    // anyway because they never reach `position`).
    mat.uniforms.uOpacity.value = assembly;

    if (cursorRef.current) {
      mat.uniforms.uCursor.value.copy(cursorRef.current);
    }
    mat.uniforms.uActivity.value = activityRef.current ?? 0;

    if (groupRef.current) {
      // **Scroll-driven Y rotation** (not time-driven). Same scroll
      // position always produces the same orientation, so a
      // down → up → down sequence leaves the cage exactly where it
      // was. Slowed from `-p × 4π` (2 turns over the page) to
      // `-p × π` (half a turn) because faster rotation made the
      // perspective-induced visual centroid shift more obvious —
      // particles closer to the camera dominate, so as the cage
      // rotates the apparent centre wobbles slightly left/right.
      // Slower rotation = less wobble.
      groupRef.current.rotation.y = -p * Math.PI;
      groupRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.45) * 0.06;

      // Two-stage forward drift with the moving camera (timings scaled
      // by 5/6 for the six-section page):
      //   Stage 1 — zoom 0 → 4 across p=0.18…0.52.
      //   Stage 2 — continues 4 → 18 across p=0.52…0.71 so the cage
      //             flies past the camera while it explodes outward.
      const zoomIn = ramp(p, 0.18, 0.52) * 4.0;
      const flyPast = ramp(p, 0.52, 0.71) * 14.0;
      groupRef.current.position.z = zoomIn + flyPast;
    }
  });

  if (!geometry) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
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
