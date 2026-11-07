/**
 * The one place the page's ground colour is defined. Lives outside the
 * scene so the preloader and footer can match it without pulling
 * three.js into their bundles — the canvas is deliberately code-split
 * and must stay that way.
 */
export const BACKGROUND = "#04050a";

/* ------------------------------------------------------------------ *
 * Backdrop
 *
 * A slow aurora: a near-black field with three large, soft colour
 * fields drifting through a warped domain. Everything here is a
 * *linear* radiance fed to the backdrop shader before ACES and sRGB, so
 * the numbers look far smaller than the colours they resolve to.
 *
 * The ceiling on these is set by the subject, not by taste. The glass
 * is alpha-blended over this, so the backdrop is a floor its dark
 * interior can never go below — every point of brightness added here is
 * a point of contrast taken off the crystal.
 * ------------------------------------------------------------------ */

export const BACKDROP_BASE: [number, number, number] = [0.0035, 0.004, 0.0075];

/** Teal, upper left. */
export const BACKDROP_A: [number, number, number] = [0.012, 0.056, 0.052];
/** Indigo, lower right. */
export const BACKDROP_B: [number, number, number] = [0.014, 0.026, 0.072];
/** Violet, drifting across the middle. */
export const BACKDROP_C: [number, number, number] = [0.036, 0.018, 0.058];
/** Cold pool that follows the object. */
export const BACKDROP_POOL: [number, number, number] = [0.014, 0.021, 0.038];

/* ------------------------------------------------------------------ *
 * The studio the glass is standing in.
 *
 * There is no HDRI and no cube map — the environment is an analytic
 * function of direction (see `envSample` in glass.ts). These are its
 * terms, and the split between them is the single most important set of
 * numbers in the project.
 *
 * The ambient tiers are almost black on purpose. A clear part is drawn
 * twice (front face and back), and a dozen of them overlap through the
 * body — so any ambient the material returns is multiplied by the depth
 * of glass in front of it and comes back as fog. Lift these and the
 * camera turns into a milky white blob no amount of grading recovers.
 *
 * The emitters, by contrast, are hot and tight. They only land where a
 * surface happens to face them, so they cost nothing in the flats and
 * give hard streaks along every bevel and knurl — which is the entire
 * reason the reference photograph reads as crystal.
 * ------------------------------------------------------------------ */

/** Ambient above the horizon. */
export const ENV_SKY: [number, number, number] = [0.011, 0.015, 0.026];
/** Ambient at the horizon line. */
export const ENV_HORIZON: [number, number, number] = [0.006, 0.008, 0.014];
/** Ambient below — the black sweep the camera sits on. */
export const ENV_FLOOR: [number, number, number] = [0.0015, 0.002, 0.0035];

/** Broad key softbox, up and to the front-left. */
export const ENV_KEY: [number, number, number] = [1.05, 1.15, 1.4];
/** Hard vertical strip camera-right — the long streak down the barrels. */
export const ENV_STRIP_A: [number, number, number] = [2.9, 3.05, 3.4];
/** Cool kicker from behind-left, separating the body from the ground. */
export const ENV_STRIP_B: [number, number, number] = [0.4, 0.72, 1.35];
/** Overhead bar. Reads as the highlight running across every knurl. */
export const ENV_STRIP_C: [number, number, number] = [1.7, 1.78, 2.0];

/** Accent used by the lens ring, the live screen and the interface. */
export const ACCENT = "#7fd4ff";
