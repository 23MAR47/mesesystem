/**
 * Colour lives here, outside the scene, so the preloader, the nav and the
 * DOM sections can agree with the canvas without pulling three.js into
 * their bundles — the canvas stays code-split.
 *
 * Values under `RADIANCE` are linear, pre-tone-map. They look implausibly
 * small next to the hex values; that is expected.
 */

export const GROUND = "#e9e9ee";
export const INK = "#0a0a0d";

export const VIOLET_DEEP = "#1b0736";
export const VIOLET = "#7c3aed";
export const VIOLET_LIGHT = "#c084fc";
export const MAGENTA = "#d946ef";
export const ACID = "#c6f24e";
export const BLACK = "#050507";

/** Per-stage page ground, written to the backdrop element by ScrollEngine. */
export const STAGE_GROUND: Record<string, string> = {
  hero: GROUND,
  reel: "#f6f6f8",
  neural: BLACK,
  work: BLACK,
  mosaic: BLACK,
  cta: GROUND,
};

/** Grain colour ends for the particle field, linear-ish sRGB triples. */
export const GRAIN_COOL: [number, number, number] = [0.86, 0.84, 0.95];
export const GRAIN_HOT: [number, number, number] = [0.72, 0.16, 0.86];
export const GRAIN_EMBER: [number, number, number] = [0.36, 0.1, 0.52];
