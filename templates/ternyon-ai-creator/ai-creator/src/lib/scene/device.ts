/**
 * Device tiering — the single source of truth for "what does this machine get".
 *
 * DPR clamps, frame budgets, shadow and pointer decisions all read from here so
 * no tier constant is ever sprinkled through render code (hard rule #4).
 *
 * Read **once** at scene construction: a device does not change tier mid-session,
 * and rebuilding buffers on a resize costs more than the mismatch is worth.
 *
 * 📖 Docs: obsidian/workflows/optimize-3d-scene.md (§2)
 */

export type DeviceTier = "mobile" | "tablet" | "desktop";

const TABLET_MAX_WIDTH = 1180;
const MOBILE_MAX_WIDTH = 768;

/**
 * **1.25, not the 0.85 this shipped with.**
 *
 * The old value came from the usual reasoning: the model is soft-lit, the grain
 * hides the upscale, and rendering at 0.85x cuts about a third of the fragments
 * invisibly. All true — for a scene made of soft shapes.
 *
 * This scene draws **letterforms**. The screens' display type is painted into
 * the framebuffer (ADR-0083), so the framebuffer *is* the type's resolution:
 * measured, a 430x932 canvas on a 2x screen was a 331x717 buffer, every glyph
 * upscaled 2.6x on its way to the panel. That is not softness, it is stepping,
 * and no amount of atlas resolution can reach past it — ADR-0110 raised the
 * atlas and the letters stayed stepped, because the atlas was never the limit.
 *
 * The project's own guidance already said so and it was not followed: go to 1.0
 * and no lower when the scene has hard-edged geometry — thin lines, crisp text
 * in the shader. This scene has both, plus a one-device-pixel rule.
 *
 * 1.25 costs 2.2x the fill of 0.85. The 30fps budget on this tier is unchanged
 * and is what pays for it.
 */
const MOBILE_MAX_DPR = 1;
const DESKTOP_MIN_DPR = 0.75;
/**
 * 1.25, below the 1.5 this starter's other scenes use.
 *
 * The difference is what this scene draws: a line-integral-convolution field
 * costing ~22 noise evaluations per pixel, over the whole viewport, for a third
 * of the scroll. That is a fill cost and fill scales with the square of the
 * pixel ratio, so 1.5 renders 2.25x the CSS pixels and 1.25 renders 1.56x —
 * a 31% cut for every display above 1.25, and no change at all for the DPR-1
 * displays most desktops are. (The reference implementation of the field caps
 * at 1.0 outright; the floor here is 1.25 because the scene also draws 1px
 * wireframe lines and a hard stage line, and those alias visibly below it.)
 */
const DESKTOP_MAX_DPR = 1.25;

const MOBILE_FPS = 60;
const TABLET_FPS = 45;

const matches = (query: string): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(query).matches;

export const deviceTier = (): DeviceTier => {
  if (typeof window === "undefined") return "desktop";
  const coarse = matches("(hover: none) and (pointer: coarse)");
  if (window.innerWidth < MOBILE_MAX_WIDTH || coarse) return "mobile";
  if (window.innerWidth < TABLET_MAX_WIDTH) return "tablet";
  return "desktop";
};

/** A 3x phone renders 9x the fragments of a 1x screen for no visible gain. */
export const clampedPixelRatio = (tier: DeviceTier = deviceTier()): number => {
  if (typeof window === "undefined") return 1;
  const dpr = window.devicePixelRatio || 1;
  if (tier === "mobile") return Math.min(dpr, MOBILE_MAX_DPR);
  return Math.min(Math.max(dpr, DESKTOP_MIN_DPR), DESKTOP_MAX_DPR);
};

/**
 * Minimum ms between scene frames, handed to the shared ticker as its
 * per-subscriber throttle — so capping the scene never slows the springs
 * sharing the same loop.
 */
/**
 * A millisecond under the stated frame, not the frame itself.
 *
 * The ticker skips a subscriber while `time - last <= budget`, so on a 120Hz
 * panel a budget of exactly 1000/60 lets the first tick past it land at 25ms
 * — 40fps, not 60. A millisecond of slack makes the number mean what it says.
 */
const budget = (fps: number): number => 1000 / fps - 1;

export const frameBudgetMs = (tier: DeviceTier = deviceTier()): number => {
  if (tier === "mobile") return budget(MOBILE_FPS);
  if (tier === "tablet") return budget(TABLET_FPS);
  return 0; // desktop: every rAF tick
};

/**
 * Whether the scene runs its **lite** choreography: the model alone, turning
 * on a short runway, with the tide and chrome screens as stills below it.
 *
 * A phone, measured, was never short of GPU for the full timeline — it was
 * short of *steadiness*: three full-screen passes, two nets and a bloom chain
 * competing with a 120Hz scroll. The lite path draws one model at one pixel
 * per CSS pixel at 60fps and nothing else. ADR-0126.
 */
export const wantsLiteScene = (tier: DeviceTier = deviceTier()): boolean =>
  tier === "mobile";

export const prefersReducedMotion = (): boolean =>
  matches("(prefers-reduced-motion: reduce)");

/** Data Saver / low device memory is the nearest web-exposed proxy for iOS Low
 *  Power Mode, which has no API. Absent on most desktops, so this only ever
 *  trips on a genuinely constrained client. */
export const isEnergySaver = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  if (nav.connection?.saveData === true) return true;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory > 0) {
    return nav.deviceMemory <= 2;
  }
  return false;
};

/**
 * The longest edge a model texture may have, per tier.
 *
 * A texture costs its **decoded** size in VRAM whatever it weighed on the wire:
 * this model ships three 2048² maps in a Draco'd, WebP-textured GLB of 818KB,
 * and they arrive as **67.8MB** of video memory with their mip chains. Halving
 * the edge quarters that. On a phone it is the difference between a smooth pan
 * and a texture-thrash stutter (optimize-3d-scene §12).
 *
 * Desktop keeps the author's resolution — the model is the product, and the
 * budget is not the constraint there.
 */
export const textureLimit = (tier: DeviceTier = deviceTier()): number => {
  if (tier === "mobile") return 1024;
  if (tier === "tablet") return 1536;
  return Infinity;
};

/**
 * Draw one settled frame, then stop. WebGL keeps the last frame on the canvas,
 * so a frozen scene costs nothing — the model simply stops turning.
 */
export const sceneShouldFreeze = (tier: DeviceTier = deviceTier()): boolean =>
  prefersReducedMotion() || (tier === "mobile" && isEnergySaver());

/** Real-time shadows are the most expensive option on a phone. */
export const wantsShadows = (tier: DeviceTier = deviceTier()): boolean =>
  tier !== "mobile";

/** Whether to attach pointer listeners at all. */
export const wantsPointer = (tier: DeviceTier = deviceTier()): boolean =>
  tier !== "mobile";

/** MSAA is expensive on a phone; the DPR clamp hides its absence. */
export const wantsAntialias = (tier: DeviceTier = deviceTier()): boolean =>
  tier === "desktop";
