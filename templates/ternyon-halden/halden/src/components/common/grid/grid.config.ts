// 📖 Docs: obsidian/frontend/components/common.md

/**
 * Adaptive scaling grid configuration.
 *
 * The grid keeps a rem-based design proportional across viewports by scaling
 * the root (`<html>`) font-size. Each breakpoint maps a viewport `maxWidth` to
 * the design `baseWidth` it was laid out at — at `baseWidth` the root
 * font-size equals `FONT_BASE` and rem values match the design 1:1.
 *
 * - Scaling DOWN (viewport at or below `GRID_BASE_WIDTH`) is driven by the
 *   `vw` media queries in `src/app/globals.css`.
 * - Scaling UP (viewport above `GRID_BASE_WIDTH`) is driven at runtime by the
 *   `AdaptiveGrid` component / `useAdaptiveGrid` hook.
 *
 * Changing these values means updating the `html` media queries in
 * `globals.css` to match — the formula is:
 *   font-size: FONT_BASE * 100 / baseWidth  (vw)
 */

/** Root font-size (px) the design is measured against. */
export const FONT_BASE = 16;

export interface GridBreakpoint {
  /** Media-query `max-width` threshold (px). */
  maxWidth: number;
  /** Design base width (px) the range was laid out at. */
  baseWidth: number;
}

/**
 * Breakpoints, largest first.
 *
 * The Halden design (Figma "Ternyon") is drawn at four widths, and they are
 * re-compositions rather than one layout scaled — the hero rearranges, the
 * grids change column count, the primary menu leaves the bar on a phone. So
 * each band scales from the comp it was drawn at:
 *
 *   1441+      AdaptiveGrid scales the 1440 comp up
 *   1025–1440  1440 comp  (2412:210 and siblings)
 *   769–1024   1024 comp  (2512:2)
 *   549–768    768 comp   (2512:245)
 *   ≤548       390 comp   (2512:488)
 *
 * Inside a band everything stays proportional, so a rem value taken off that
 * comp lands exactly. The differences between bands are expressed in the
 * components with the `at1024` / `at768` / `at390` variants from globals.css.
 *
 * The three upper bounds are the comp widths themselves. The fourth — 548 — is
 * a judgement call, because there is no comp between 390 and 768 and something
 * has to cover the 391–767 gap. It sits at the geometric mean of the two
 * (√(390×768) ≈ 547), which is the one split where both neighbours are equally
 * far from their comp: the 768 layout never renders below 71%, and the 390
 * layout never above 141%. Letting either comp cover the whole gap alone would
 * mean the 768 layout at 51% — a 14px caption rendered at 7px.
 */
export const GRID_BREAKPOINTS: readonly GridBreakpoint[] = [
  { maxWidth: 1440, baseWidth: 1440 },
  { maxWidth: 1024, baseWidth: 1024 },
  { maxWidth: 768, baseWidth: 768 },
  { maxWidth: 548, baseWidth: 390 },
];

/** Largest breakpoint width — above it the root font-size scales up. */
export const GRID_BASE_WIDTH = Math.max(
  ...GRID_BREAKPOINTS.map((bp) => bp.maxWidth),
);
