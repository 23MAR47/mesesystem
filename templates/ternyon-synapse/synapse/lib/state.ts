/**
 * One mutable object shared between the scroll layer and the render loop.
 * Deliberately not React state: every field here changes on every frame,
 * and routing that through `useState` re-renders the tree at 60 Hz.
 *
 * Sections here are not uniform in height (a pinned reel needs more scroll
 * than a parallax gallery), so instead of one global `raw` in section units
 * each stage measures itself and publishes two numbers:
 *
 *   pin    0..1  progress through the stage's own pin window
 *   travel 0..1  progress across the viewport, from "top edge enters" to
 *                "bottom edge leaves" — the one parallax should read
 */

export const STAGES = ["hero", "reel", "neural", "work", "mosaic", "cta"] as const;
export type StageId = (typeof STAGES)[number];

export interface StageState {
  pin: number;
  travel: number;
  /** the stage owns the viewport right now */
  active: boolean;
  /** the pinned panel's top edge in px relative to the viewport top:
   *  positive while it is still rising into place, 0 while pinned,
   *  negative once it has begun scrolling off. Anything drawn on the
   *  canvas for this stage has to carry the same offset, or it hangs in
   *  place while its panel leaves. */
  shift: number;
}

function blankStages() {
  const out = {} as Record<StageId, StageState>;
  for (const id of STAGES) out[id] = { pin: 0, travel: 0, active: false, shift: 0 };
  return out;
}

export const view = {
  /** smoothed scroll position in px */
  scroll: 0,
  /** 0..1 down the whole document */
  progress: 0,
  /** scroll energy, 0..1-ish, decays on its own */
  velocity: 0,
  /** pointer in normalised device coords, -1..1 */
  pointerX: 0,
  pointerY: 0,
  /** eased pointer — what the scene actually follows */
  smoothX: 0,
  smoothY: 0,
  /** 0..1 intro assembly, handed over by the preloader */
  intro: 0,
  ready: false,
  /** honours prefers-reduced-motion */
  reduced: false,
  /** index into STAGES of the stage owning the viewport */
  stage: 0,
  s: blankStages(),
};

export function clamp(v: number, a: number, b: number) {
  return v < a ? a : v > b ? b : v;
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Frame-rate independent approach. A raw lerp(a, b, 0.1) per frame feels
 *  different at 60 and 144 Hz; this does not. */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

/** Last line of defence before a number reaches a uniform or a transform. */
export function safe(v: number, fallback = 0) {
  return Number.isFinite(v) ? v : fallback;
}

/** Rises 0→1 over [a,b] then falls 1→0 over [c,d]. Every stage-scoped
 *  visual uses this so nothing paints outside its own scroll window. */
export function window4(x: number, a: number, b: number, c: number, d: number) {
  return smoothstep(a, b, x) * (1 - smoothstep(c, d, x));
}
