import * as THREE from "three";

import type { PartGroup } from "@/lib/state";
import type { GlassOpts, Pattern } from "./glass";
import { PRESETS } from "./glass";
import * as G from "./geometry";

/**
 * The bill of materials.
 *
 * Local space for the whole camera: **optical axis is +Z**, the lens
 * points at +Z, up is +Y, and the sensor plane sits near z = 0.1. The
 * body occupies roughly x ±0.70, y ±0.51, z −0.30…+0.28; the lens runs
 * from the mount at z = 0.28 out to the front element at z = 1.16.
 *
 * Every part declares where it lives when assembled and where it goes
 * when the camera comes apart. The default explosion is a scale of the
 * part's own z — so the stack fans out along the axis it was built on,
 * which is what an exploded view is — and anything that should peel off
 * sideways (grip, top plate, battery, a dropped filter) overrides it.
 */

type V3 = [number, number, number];

export interface PartSpec {
  id: string;
  group: PartGroup;
  build: () => THREE.BufferGeometry;
  pos: V3;
  rot?: V3;
  /** offset at full explode; defaults to a fan along the optical axis */
  ex?: V3;
  /** extra rotation at full explode, radians */
  exRot?: V3;
  preset: keyof typeof PRESETS;
  extra?: GlassOpts;
  pattern?: Pattern;
  uvScale?: [number, number];
  /** 0..1 — staggers this part inside its group's window */
  delay?: number;
}

/** How far the axial fan throws a part, per unit of its own z. */
const FAN = 1.24;
const FAN_PIVOT = 0.06;

export function explodeOf(p: PartSpec): V3 {
  if (p.ex) return p.ex;
  return [0, 0, (p.pos[2] - FAN_PIVOT) * FAN];
}

const rotX90: V3 = [Math.PI / 2, 0, 0];

/* ------------------------------------------------------------------ *
 * Optics — front element out to the bayonet
 * ------------------------------------------------------------------ */

const OPTICS: PartSpec[] = [
  {
    id: "hood-lip",
    group: "optics",
    build: () => G.ring(0.3, 0.324, 0.05, 0.012),
    pos: [0, 0, 1.2],
    preset: "crystal",
    delay: 0,
  },
  {
    id: "front-element",
    group: "optics",
    build: () =>
      G.lensElement({ radius: 0.262, edge: 0.04, front: 0.5, back: 1.95 }),
    pos: [0, 0, 1.13],
    preset: "optic",
    delay: 0.04,
  },
  {
    id: "front-ring",
    group: "optics",
    build: () => G.knurledRing(0.262, 0.3, 0.078, 72, 0.006),
    pos: [0, 0, 1.13],
    preset: "accent",
    delay: 0.02,
  },
  {
    id: "filter-uv",
    group: "optics",
    build: () => G.mergeAll([G.disc(0.228, 0.009), G.ring(0.226, 0.252, 0.024)]),
    pos: [0, 0, 0.99],
    ex: [0.04, -0.44, 1.02],
    exRot: [0.5, 0.2, 0],
    preset: "flat",
    delay: 0.1,
  },
  {
    id: "filter-nd",
    group: "optics",
    build: () => G.mergeAll([G.disc(0.223, 0.009), G.ring(0.221, 0.247, 0.022)]),
    pos: [0, 0, 0.93],
    ex: [-0.1, -0.76, 0.86],
    exRot: [0.9, -0.3, 0.2],
    preset: "flat",
    delay: 0.14,
  },
  {
    id: "barrel-front",
    group: "optics",
    build: () => G.barrel(0.226, 0.268, 0.15),
    pos: [0, 0, 0.87],
    preset: "crystal",
    delay: 0.08,
  },
  {
    id: "focus-ring",
    group: "optics",
    build: () => G.knurledRing(0.22, 0.272, 0.2, 56, 0.013),
    pos: [0, 0, 0.7],
    preset: "crystal",
    delay: 0.12,
  },
  {
    id: "mid-element",
    group: "optics",
    build: () =>
      G.lensElement({ radius: 0.185, edge: 0.07, front: 0.8, back: -1.0 }),
    pos: [0, 0, 0.66],
    ex: [0, 0.42, 0.74],
    preset: "optic",
    delay: 0.18,
  },
  {
    id: "zoom-ring",
    group: "optics",
    build: () => G.knurledRing(0.218, 0.262, 0.135, 36, 0.017),
    pos: [0, 0, 0.51],
    preset: "crystal",
    delay: 0.16,
  },
  {
    id: "iris",
    group: "optics",
    build: () => G.irisBlades(0.06, 0.178, 9, 0.5),
    pos: [0, 0, 0.46],
    ex: [0, -0.44, 0.5],
    exRot: [0, 0, 0.6],
    preset: "metal",
    extra: { tint: [0.5, 0.55, 0.68], roughness: 0.3 },
    delay: 0.22,
  },
  {
    id: "barrel-rear",
    group: "optics",
    build: () => G.taper(0.216, 0.26, 0.218, 0.244, 0.13),
    pos: [0, 0, 0.39],
    preset: "crystal",
    delay: 0.2,
  },
  {
    id: "rear-element",
    group: "optics",
    build: () =>
      G.lensElement({ radius: 0.152, edge: 0.034, front: -0.64, back: 0.72 }),
    pos: [0, 0, 0.35],
    ex: [0, 0.3, 0.34],
    preset: "optic",
    delay: 0.26,
  },
  {
    id: "lens-mount",
    group: "optics",
    build: () => G.bayonet(0.183, 0.238, 0.03, 3),
    pos: [0, 0, 0.3],
    ex: [0, -0.3, 0.3],
    exRot: [0, 0, 0.4],
    preset: "metal",
    delay: 0.3,
  },
];

/* ------------------------------------------------------------------ *
 * Chassis — shells, plates and everything bolted to the outside
 * ------------------------------------------------------------------ */

const CHASSIS: PartSpec[] = [
  {
    id: "seal",
    group: "chassis",
    build: () => G.ring(0.24, 0.259, 0.013, 0.004),
    pos: [0, 0, 0.285],
    preset: "frosted",
    delay: 0.06,
  },
  {
    id: "body-flange",
    group: "chassis",
    build: () => G.bayonet(0.187, 0.25, 0.028, 3),
    pos: [0, 0, 0.27],
    preset: "metal",
    delay: 0.04,
  },
  {
    id: "body-front",
    group: "chassis",
    build: () => G.slabBore(1.36, 1.0, 0.15, 0.194, 0.1, 0.022),
    pos: [0, 0, 0.19],
    preset: "crystal",
    delay: 0,
  },
  {
    id: "body-core",
    group: "chassis",
    build: () => G.slabBore(1.28, 0.93, 0.24, 0.225, 0.085, 0.02),
    pos: [0, 0, 0.0],
    preset: "crystal",
    extra: { opacity: 0.022, thickness: 0.5 },
    delay: 0.02,
  },
  {
    id: "body-rear",
    group: "chassis",
    build: () => G.slab(1.36, 1.0, 0.11, 0.1, 0.02),
    pos: [0, 0, -0.19],
    ex: [0, 0, -0.5],
    preset: "crystal",
    delay: 0.08,
  },
  {
    id: "top-plate",
    group: "chassis",
    build: () => G.slab(1.38, 0.46, 0.085, 0.05, 0.016),
    rot: rotX90,
    pos: [0, 0.52, -0.02],
    ex: [0, 0.95, -0.1],
    preset: "crystal",
    delay: 0.14,
  },
  {
    id: "prism",
    group: "chassis",
    build: () => G.pentaprism(0.42, 0.28, 0.4),
    pos: [0.02, 0.555, 0.0],
    ex: [0.05, 1.42, -0.05],
    exRot: [0, 0.4, 0],
    preset: "optic",
    extra: { edge: 0.7, opacity: 0.035, lustre: 1.0 },
    delay: 0.2,
  },
  {
    id: "hot-shoe",
    group: "chassis",
    build: () => G.hotShoe(0.2, 0.16, 0.06),
    pos: [0.02, 0.85, 0.0],
    ex: [0.05, 1.95, -0.05],
    preset: "metal",
    delay: 0.26,
  },
  {
    id: "grip",
    group: "chassis",
    build: () => G.grip(0.52, 0.88, 0.2),
    // Half turn so the belly swells away from the body to the left.
    rot: [0, Math.PI, 0],
    pos: [-0.68, -0.02, 0.04],
    ex: [-1.05, -0.12, 0.1],
    exRot: [0, -0.3, 0],
    preset: "frosted",
    delay: 0.1,
  },
  {
    id: "thumb-rest",
    group: "chassis",
    build: () => G.slab(0.16, 0.3, 0.07, 0.04, 0.012),
    pos: [0.6, 0.16, -0.26],
    ex: [1.0, 0.3, -0.5],
    preset: "frosted",
    delay: 0.16,
  },
  {
    id: "base-plate",
    group: "chassis",
    build: () => G.slab(1.36, 0.44, 0.06, 0.05, 0.014),
    rot: rotX90,
    pos: [0, -0.51, -0.03],
    ex: [0, -0.88, -0.06],
    preset: "crystal",
    delay: 0.12,
  },
  {
    id: "tripod-boss",
    group: "chassis",
    build: () => G.mergeAll([G.post(0.055, 0.05, 24), G.ring(0.03, 0.05, 0.03)]),
    rot: rotX90,
    pos: [0, -0.55, -0.02],
    ex: [0, -1.22, -0.06],
    preset: "metal",
    delay: 0.22,
  },
  {
    id: "lug-left",
    group: "chassis",
    build: () => G.ring(0.028, 0.05, 0.022),
    rot: [0, Math.PI / 2, 0],
    pos: [-0.69, 0.34, -0.02],
    ex: [-1.28, 0.62, -0.02],
    preset: "metal",
    delay: 0.3,
  },
  {
    id: "lug-right",
    group: "chassis",
    build: () => G.ring(0.028, 0.05, 0.022),
    rot: [0, Math.PI / 2, 0],
    pos: [0.69, 0.34, -0.02],
    ex: [1.28, 0.62, -0.02],
    preset: "metal",
    delay: 0.32,
  },
  {
    id: "port-door",
    group: "chassis",
    build: () => G.slab(0.06, 0.34, 0.16, 0.03, 0.008),
    pos: [-0.7, -0.06, -0.12],
    ex: [-1.5, -0.5, -0.3],
    exRot: [0, 0.6, 0],
    preset: "frosted",
    delay: 0.24,
  },
];

/* ------------------------------------------------------------------ *
 * Core — everything between the mount and the back panel
 * ------------------------------------------------------------------ */

const CORE: PartSpec[] = [
  {
    id: "shutter-curtain",
    group: "core",
    build: () => G.slab(0.68, 0.26, 0.008, 0.008, 0.003),
    pos: [0, 0.13, 0.17],
    ex: [0, 0.66, 0.5],
    preset: "crystal",
    extra: { opacity: 0.08, tint: [0.5, 0.5, 0.54] },
    delay: 0.04,
  },
  {
    id: "shutter-frame",
    group: "core",
    build: () => G.frame(0.74, 0.54, 0.03, 0.04),
    pos: [0, 0, 0.16],
    preset: "metal",
    delay: 0.02,
  },
  {
    id: "cover-glass",
    group: "core",
    build: () => G.slab(0.64, 0.44, 0.008, 0.006, 0.003),
    pos: [0, 0, 0.135],
    ex: [0, 0.34, 0.42],
    preset: "flat",
    delay: 0.1,
  },
  {
    id: "sensor",
    group: "core",
    build: () => G.slab(0.62, 0.42, 0.018, 0.006, 0.004),
    pos: [0, 0, 0.11],
    preset: "flat",
    extra: { opacity: 0.14, tint: [0.8, 0.76, 0.7] },
    pattern: 3,
    uvScale: [0.62, 0.42],
    delay: 0.12,
  },
  {
    id: "sensor-frame",
    group: "core",
    build: () => G.frame(0.7, 0.5, 0.024, 0.032),
    pos: [0, 0, 0.11],
    preset: "metal",
    delay: 0.08,
  },
  {
    id: "ibis-plate",
    group: "core",
    build: () => G.frame(0.9, 0.64, 0.022, 0.05),
    pos: [0, 0, 0.05],
    ex: [0, 0, -0.16],
    preset: "metal",
    extra: { tint: [0.6, 0.64, 0.74] },
    delay: 0.06,
  },
  {
    id: "logic-board",
    group: "core",
    build: () => G.slab(1.06, 0.74, 0.016, 0.03, 0.005),
    pos: [0, 0, -0.09],
    ex: [0, 0, -0.66],
    preset: "crystal",
    extra: { opacity: 0.09, tint: [0.5, 0.56, 0.56] },
    pattern: 1,
    uvScale: [1.06, 0.74],
    delay: 0.16,
  },
  {
    id: "board-shield",
    group: "core",
    build: () => G.frame(0.94, 0.64, 0.02, 0.04),
    pos: [0, 0, -0.13],
    ex: [0, 0, -0.92],
    preset: "metal",
    delay: 0.2,
  },
  {
    id: "battery",
    group: "core",
    build: () => G.slab(0.3, 0.44, 0.16, 0.03, 0.01),
    pos: [-0.46, -0.2, -0.02],
    ex: [-0.66, -1.0, -0.1],
    exRot: [0.3, 0, 0.2],
    preset: "crystal",
    extra: { opacity: 0.1, tint: [0.4, 0.5, 0.6] },
    delay: 0.24,
  },
  {
    id: "card",
    group: "core",
    build: () => G.slab(0.15, 0.21, 0.012, 0.02, 0.004),
    pos: [0.56, -0.24, -0.06],
    ex: [1.14, -0.62, -0.24],
    exRot: [0, 0.5, 0.3],
    preset: "crystal",
    extra: { opacity: 0.12, tint: [0.46, 0.56, 0.66] },
    delay: 0.28,
  },
  {
    id: "ribbon",
    group: "core",
    build: () => G.slab(0.36, 0.09, 0.005, 0.02, 0.002),
    pos: [0.0, -0.34, -0.05],
    ex: [0.1, -0.72, -0.4],
    exRot: [0.4, 0, 0.15],
    preset: "frosted",
    extra: { opacity: 0.14, tint: [0.8, 0.68, 0.48] },
    delay: 0.3,
  },
];

/* ------------------------------------------------------------------ *
 * Controls — the surfaces a hand actually touches
 * ------------------------------------------------------------------ */

const CONTROLS: PartSpec[] = [
  {
    id: "screen",
    group: "controls",
    build: () => G.slab(0.84, 0.58, 0.02, 0.018, 0.006),
    pos: [0.02, -0.02, -0.28],
    ex: [0.06, -0.16, -1.15],
    preset: "flat",
    extra: { opacity: 0.07, tint: [0.3, 0.34, 0.4] },
    pattern: 2,
    uvScale: [0.84, 0.58],
    delay: 0,
  },
  {
    id: "screen-bezel",
    group: "controls",
    build: () => G.frame(0.9, 0.64, 0.028, 0.03),
    pos: [0.02, -0.02, -0.28],
    ex: [0.06, -0.16, -0.9],
    preset: "crystal",
    delay: 0.04,
  },
  {
    id: "mode-dial",
    group: "controls",
    build: () => G.dial(0.135, 0.07, 30),
    rot: rotX90,
    pos: [0.46, 0.6, -0.04],
    ex: [0.62, 1.34, -0.08],
    preset: "crystal",
    extra: { edge: 0.7 },
    delay: 0.08,
  },
  {
    id: "command-dial",
    group: "controls",
    build: () => G.dial(0.1, 0.055, 24),
    rot: rotX90,
    pos: [-0.44, 0.59, 0.1],
    ex: [-0.6, 1.2, 0.2],
    preset: "crystal",
    extra: { edge: 0.7 },
    delay: 0.12,
  },
  {
    id: "shutter-button",
    group: "controls",
    build: () => G.mergeAll([G.button(0.055, 0.05), G.ring(0.055, 0.08, 0.03)]),
    rot: rotX90,
    pos: [-0.63, 0.6, 0.15],
    ex: [-0.92, 1.05, 0.3],
    preset: "metal",
    delay: 0.16,
  },
  {
    id: "selector",
    group: "controls",
    build: () => G.selector(0.115, 0.032),
    pos: [0.5, -0.16, -0.3],
    ex: [1.0, -0.36, -0.86],
    preset: "crystal",
    extra: { edge: 0.8 },
    delay: 0.2,
  },
  {
    id: "eyecup",
    group: "controls",
    build: () => G.eyecup(0.1, 0.165, 0.1),
    pos: [0.02, 0.4, -0.34],
    ex: [0.06, 0.86, -1.0],
    preset: "frosted",
    delay: 0.24,
  },
  {
    id: "finder-glass",
    group: "controls",
    build: () => G.disc(0.088, 0.016, 40),
    pos: [0.02, 0.4, -0.3],
    ex: [0.06, 0.74, -0.72],
    preset: "flat",
    delay: 0.28,
  },
];

/* ------------------------------------------------------------------ *
 * Fasteners and small controls, generated
 *
 * Individually these carry no information — collectively they are the
 * difference between a diagram and a machine, because they give the eye
 * something small to measure the big parts against.
 * ------------------------------------------------------------------ */

const REAR_BUTTONS: V3[] = [
  [0.5, 0.24, -0.31],
  [0.5, 0.06, -0.31],
  [-0.5, 0.22, -0.31],
  [-0.5, 0.04, -0.31],
  [-0.5, -0.14, -0.31],
];

const SCREW_POSITIONS: V3[] = [
  [-0.62, 0.44, -0.24],
  [0.62, 0.44, -0.24],
  [-0.62, -0.44, -0.24],
  [0.62, -0.44, -0.24],
  [0.0, 0.46, 0.25],
];

const GENERATED: PartSpec[] = [
  ...REAR_BUTTONS.map<PartSpec>((pos, i) => ({
    id: `button-${i}`,
    group: "controls",
    build: () => G.button(0.036, 0.028),
    pos,
    ex: [pos[0] * 1.7, pos[1] * 1.5 - 0.1, -0.78 - i * 0.05],
    preset: "crystal",
    extra: { edge: 0.6, opacity: 0.06 },
    delay: 0.3 + i * 0.05,
  })),
  ...SCREW_POSITIONS.map<PartSpec>((pos, i) => ({
    id: `screw-${i}`,
    group: "chassis",
    build: () => G.screw(0.026, 0.03),
    pos,
    ex: [pos[0] * 1.9, pos[1] * 1.9, pos[2] - 0.55 - i * 0.08],
    exRot: [0.6, 0.4, 1.2],
    preset: "metal",
    delay: 0.34 + i * 0.04,
  })),
];

export const PARTS: PartSpec[] = [
  ...OPTICS,
  ...CHASSIS,
  ...CORE,
  ...CONTROLS,
  ...GENERATED,
];

export const PART_COUNT = PARTS.length;
