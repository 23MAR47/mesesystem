"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { clamp, groupReveal, lerp, smoothstep, view } from "@/lib/state";
import { makeGlass, PRESETS } from "./glass";
import { explodeOf, PARTS, type PartSpec } from "./parts";
import { modelRef } from "./modelRef";

/* ------------------------------------------------------------------ *
 * Framing
 *
 * One keyframe per section. `focus` is the point in the model's own
 * space that gets brought to `pos` — so "look at the lens" is a focus
 * of z = 0.74 rather than a hand-solved position, and the rotation
 * always happens about the thing being discussed instead of about the
 * body's centre.
 *
 * `rotY` is where the drama is. Rotating +Z by θ about Y sends the lens
 * to (sin θ, 0, cos θ), so −0.6 is a three-quarter view with the lens
 * angled toward the copy, −1.15 turns the optical axis across the frame
 * so the exploded fan reads as a line rather than a pile, and 2.62
 * swings the whole camera round to face away — which is the only way to
 * be looking at the screen when it lights up.
 * ------------------------------------------------------------------ */

interface Frame {
  pos: [number, number, number];
  scale: number;
  rotY: number;
  rotX: number;
  focus: [number, number, number];
}

const FRAMES: Frame[] = [
  // Hero. Grown and pulled inboard so the object reaches back across the
  // dead middle of the frame instead of hugging the right edge.
  { pos: [1.28, -0.03, 0.0], scale: 1.5, rotY: -0.95, rotX: 0.1, focus: [0, 0, 0.32] },
  { pos: [0.0, 0.03, -0.35], scale: 0.81, rotY: -1.28, rotX: 0.17, focus: [0, 0, 0.6] },
  { pos: [1.3, -0.02, 0.0], scale: 1.12, rotY: -1.16, rotX: 0.07, focus: [0, 0, 0.72] },
  { pos: [0.02, 0.0, 0.0], scale: 0.96, rotY: -0.62, rotX: 0.13, focus: [0, 0, 0.08] },
  // §05 sits on the left, so the copy claims the right half — the only
  // section that runs that way, which is what keeps the sequence from
  // settling into a rhythm you stop noticing.
  { pos: [-1.32, -0.02, 0.0], scale: 1.12, rotY: -0.62, rotX: 0.07, focus: [0, 0, 0.02] },
  { pos: [0.05, 0.0, 0.1], scale: 1.0, rotY: 2.55, rotX: 0.06, focus: [0, 0, -0.12] },
];

/** Each part's own share of its group's window, so a stack peels apart
 *  instead of every piece leaving at once. */
const TRAVEL = 0.62;

function partProgress(spec: PartSpec, groupValue: number) {
  const d = clamp((spec.delay ?? 0) / 0.4, 0, 1);
  const start = d * (1 - TRAVEL);
  return smoothstep(start, start + TRAVEL, groupValue);
}

export default function CameraRig() {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const { size } = useThree();

  /* Geometry and materials are built once and never rebuilt — the
     scroll only ever writes transforms and uniforms. */
  const built = useMemo(
    () =>
      PARTS.map((spec) => {
        const preset = PRESETS[spec.preset];
        const material = makeGlass({
          ...preset,
          ...spec.extra,
          pattern: spec.pattern,
          uvScale: spec.uvScale,
        });
        return { spec, geometry: spec.build(), material, ex: explodeOf(spec) };
      }),
    []
  );

  useLayoutEffect(() => {
    return () => {
      for (const b of built) {
        b.geometry.dispose();
        b.material.dispose();
      }
    };
  }, [built]);

  /* Draw order is left to three's own back-to-front sort rather than
     pinned per part. The model turns through nearly two hundred degrees
     between the hero and the finale, so any hand-authored order would
     be correct at one end of the scroll and inverted at the other. */

  const vec = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const g = outer.current;
    const inr = inner.current;
    if (!g || !inr) return;

    const t = clock.elapsedTime;
    const raw = view.raw;

    /* ---- framing ------------------------------------------------- */
    const i = clamp(Math.floor(raw), 0, FRAMES.length - 1);
    const a = FRAMES[i];
    const b = FRAMES[Math.min(i + 1, FRAMES.length - 1)];
    // Held at the start of a section so the copy lands before the
    // object starts moving, then eased across the rest of it.
    const k = smoothstep(0.16, 0.94, raw - i);

    // Below the layout's breakpoint the copy stacks over the object, so
    // the object gives up its offset and shrinks to sit behind it.
    const narrow = size.width < 900;
    const spread = clamp(size.width / 1440, 0.6, 1.12);
    const fit = narrow ? 0.58 : clamp(size.width / 1500, 0.72, 1.1);

    const px = lerp(a.pos[0], b.pos[0], k) * (narrow ? 0.1 : spread);
    const py = lerp(a.pos[1], b.pos[1], k);
    const pz = lerp(a.pos[2], b.pos[2], k);
    g.position.set(px, py + Math.sin(t * 0.42) * 0.012, pz);
    // Roughly where the object is across the frame, for the backdrop.
    view.objectX = clamp(px / 2.9, -1, 1);

    const s = lerp(a.scale, b.scale, k) * fit;
    g.scale.setScalar(s);

    // Pointer parallax is deliberately small; the model is the subject
    // and a large lean reads as a toy.
    g.rotation.set(
      lerp(a.rotX, b.rotX, k) - view.smoothY * 0.075,
      lerp(a.rotY, b.rotY, k) + view.smoothX * 0.11 + Math.sin(t * 0.23) * 0.014,
      0
    );

    inr.position.set(
      -lerp(a.focus[0], b.focus[0], k),
      -lerp(a.focus[1], b.focus[1], k),
      -lerp(a.focus[2], b.focus[2], k)
    );

    /* ---- parts --------------------------------------------------- */
    const reveal = {
      optics: groupReveal("optics", raw),
      chassis: groupReveal("chassis", raw),
      core: groupReveal("core", raw),
      controls: groupReveal("controls", raw),
    };

    for (let n = 0; n < built.length; n++) {
      const mesh = meshes.current[n];
      if (!mesh) continue;
      const { spec, ex, material } = built[n];

      const e = partProgress(spec, view[spec.group]);

      // Adrift parts breathe. Amplitude is tied to how far out they are,
      // so a seated part is perfectly still — nothing shivers in the
      // assembled hero, which is what sells the assembled state.
      const drift = e * 0.014;
      const ph = n * 1.7;

      vec.set(
        spec.pos[0] + ex[0] * e,
        spec.pos[1] + ex[1] * e + Math.sin(t * 0.55 + ph) * drift,
        spec.pos[2] + ex[2] * e + Math.cos(t * 0.41 + ph) * drift
      );
      mesh.position.copy(vec);

      const rot = spec.rot ?? [0, 0, 0];
      const exRot = spec.exRot ?? [0, 0, 0];
      mesh.rotation.set(
        rot[0] + exRot[0] * e + Math.sin(t * 0.33 + ph) * e * 0.02,
        rot[1] + exRot[1] * e + Math.cos(t * 0.29 + ph) * e * 0.02,
        rot[2] + exRot[2] * e
      );

      const u = material.uniforms;
      u.uTime.value = t;
      u.uReveal.value = reveal[spec.group] * view.intro;
      if (spec.pattern === 2) u.uScreen.value = view.screen;
    }
  });

  return (
    <group ref={outer}>
      <group
        ref={(g) => {
          inner.current = g;
          // Published so the annotation layer can put a label in the
          // same place the part ended up, through every transform.
          modelRef.current = g;
        }}
      >
        {built.map((b, n) => (
          <mesh
            key={b.spec.id}
            ref={(m) => {
              meshes.current[n] = m;
            }}
            geometry={b.geometry}
            material={b.material}
          />
        ))}
      </group>
    </group>
  );
}
