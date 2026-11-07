/**
 * Shared motion presets for the home page.
 *
 * Centralises the spring `from`/`to`/`config` objects and `TextEngine` reveal
 * targets so every section animates with one consistent vocabulary. These are
 * animation parameters (not design tokens) — distances use `rem` strings so
 * they scale with the adaptive root font-size.
 */
import { easings } from "@react-spring/web";

/** Generic element reveals for the <Inview> / <Spring> components. */
export const reveal = {
  /** Soft fade + rise — the default section entrance. */
  fadeUp: {
    from: { opacity: 0, y: "2.5rem" },
    to: { opacity: 1, y: "0rem" },
    config: { tension: 110, friction: 26 },
  },
  /** Quieter fade for secondary copy and meta rows. */
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 90, friction: 24 },
  },
  /** Plate/image reveal — rises with a faint scale settle. */
  plate: {
    from: { opacity: 0, y: "3.5rem", scale: 1.04 },
    to: { opacity: 1, y: "0rem", scale: 1 },
    config: { tension: 90, friction: 24 },
  },
} as const;

/** Line-by-line heading reveal (clipped slide). Use with `overflow`. */
export const textLine = {
  lineIn: { y: "0%", opacity: 1 },
  lineOut: { y: "110%", opacity: 0 },
  lineConfig: { duration: 1000, easing: easings.easeOutExpo },
  lineStagger: 90,
} as const;

/** Word-by-word fade-up for body copy and leads. */
export const textWord = {
  wordIn: { y: "0rem", opacity: 1 },
  wordOut: { y: "0.8rem", opacity: 0 },
  wordConfig: { duration: 720, easing: easings.easeOutQuart },
  wordStagger: 26,
} as const;

/** Scrub parallax range for plates that drift as they pass the viewport. */
export const parallax = {
  from: { y: "3rem" },
  to: { y: "-3rem" },
} as const;
