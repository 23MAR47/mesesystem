/**
 * A single mutable object shared between the DOM scroll layer and the
 * WebGL render loop. Deliberately not React state — this updates every
 * frame and must never trigger a re-render.
 */
export const view = {
  /** scroll expressed in section-heights: 0..SECTION_COUNT */
  raw: 0,
  /** 0..1 across the whole scrollable page */
  progress: 0,
  /** index of the section currently on screen */
  sectionIndex: 0,
  /** 0..1 raw progress through the active section */
  local: 0,

  /** 0 = fully assembled, 1 = fully exploded, per assembly group */
  optics: 0,
  chassis: 0,
  core: 0,
  controls: 0,
  /** 0..1 the rear screen powering on */
  screen: 0,

  /** pointer in normalised device coords, -1..1 */
  pointerX: 0,
  pointerY: 0,
  /** eased pointer, what the scene actually follows */
  smoothX: 0,
  smoothY: 0,
  /** how hard the user is scrolling right now, 0..1-ish */
  velocity: 0,

  /** where the object currently sits, in NDC-ish x — the backdrop puts
   *  its pool of light and its floor caustic under whatever the object
   *  is doing rather than under the middle of the screen */
  objectX: 0,

  /** set once the preloader has lifted */
  ready: false,
  /** honours prefers-reduced-motion */
  reduced: false,
  /** 0..1 intro assembly */
  intro: 0,
};

export const SECTION_COUNT = 6;

export function clamp(v: number, a: number, b: number) {
  return v < a ? a : v > b ? b : v;
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

/* ------------------------------------------------------------------ *
 * The assembly timeline
 *
 * Every window below is stated in section-heights, so it is readable
 * against the copy: 0.55–1.85 means "starts a little over half way
 * through the hero and finishes most of the way through section two".
 *
 * A group's *disassembly* is shared — the whole camera comes apart at
 * once — but each group comes back independently, which is what lets
 * the optics settle while the chassis is still hanging in the air.
 * ------------------------------------------------------------------ */

/** The camera comes apart. Begins under the hero copy, ends in §02. */
const APART = [0.55, 1.8] as const;

/** Per-group reassembly windows. */
const REJOIN = {
  optics: [2.04, 2.74],
  chassis: [3.04, 3.74],
  core: [4.02, 4.66],
  controls: [5.0, 5.62],
} as const;

/** In §06 anything still adrift is pulled home with the controls. */
const FINALE = [4.98, 5.66] as const;

export type PartGroup = keyof typeof REJOIN;

/**
 * `raw` is scroll position expressed in section-heights: its integer
 * part is the active section, its fraction is progress through it.
 */
export function applySectionScroll(raw: number) {
  const r = clamp(raw, 0, SECTION_COUNT);
  view.raw = r;
  view.sectionIndex = clamp(Math.floor(r), 0, SECTION_COUNT - 1);
  view.local = clamp(r - view.sectionIndex, 0, 1);
  view.progress = clamp(r / SECTION_COUNT, 0, 1);

  const apart = smoothstep(APART[0], APART[1], r);
  const finale = smoothstep(FINALE[0], FINALE[1], r);

  // A group is exploded by `apart`, then pulled back by whichever of its
  // own window or the finale has progressed further.
  const home = (w: readonly [number, number]) =>
    Math.max(smoothstep(w[0], w[1], r), finale);

  view.optics = apart * (1 - home(REJOIN.optics));
  view.chassis = apart * (1 - home(REJOIN.chassis));
  view.core = apart * (1 - home(REJOIN.core));
  view.controls = apart * (1 - home(REJOIN.controls));

  view.screen = smoothstep(5.3, 5.78, r);
}

/** Rectangular window with eased shoulders: up over a→b, down over c→d. */
function band(x: number, a: number, b: number, c: number, d: number) {
  return smoothstep(a, b, x) - smoothstep(c, d, x);
}

/**
 * How brightly a group renders, 0..1.
 *
 * Sections three to five each interrogate one group, and the others
 * have to get out of the way — but deleting them would break the
 * illusion that we are looking at one object. So they drop to a tenth
 * and stay there: the chassis becomes a glass cage you can see the
 * sensor sitting inside, which is a better picture than either the
 * chassis alone or the sensor alone. Everything returns to full for the
 * finale.
 */
const SUBJECT: Record<PartGroup, [number, number, number, number]> = {
  optics: [1.86, 2.2, 2.9, 3.2],
  chassis: [2.9, 3.2, 3.9, 4.2],
  core: [3.9, 4.2, 4.82, 5.06],
  // The controls are never the lone subject; they arrive with the whole
  // camera in §06, so they simply follow the dimming phase.
  controls: [9, 9, 9, 9],
};

const DIM = 0.1;

export function groupReveal(group: PartGroup, raw: number) {
  // The phase during which anything is dimmed at all.
  const phase = band(raw, 1.86, 2.24, 4.82, 5.12);
  const subject = band(raw, ...SUBJECT[group]);
  return 1 - phase * (1 - DIM) * (1 - subject);
}

/**
 * Visibility curve for a section's content, given its local progress.
 * There is deliberately no fade-*in* here: a section's entrance is the
 * GSAP word reveal, and a fade-in would leave the hero invisible at
 * scroll position zero. Only the exit is scroll-driven.
 */
export function contentVisibility(local: number) {
  return 1 - smoothstep(0.46, 0.7, local);
}
