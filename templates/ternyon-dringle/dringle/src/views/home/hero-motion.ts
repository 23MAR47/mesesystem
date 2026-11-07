/**
 * Shared hero reveal presets — soft, spring-physics motion (no CSS transitions
 * or keyframes, per the animation system). Plain serializable objects, so a
 * Server Component can hand them to the client `<Spring>` / TextEngine leaves.
 * Motion values are raw CSS (transform / opacity / filter) that react-spring
 * interpolates. See obsidian/frontend/animation-system.
 */

/** Gentle, near-critically-damped spring — the house "super soft" feel. */
export const SOFT = { mass: 1, tension: 130, friction: 30 };
/** A touch snappier, for small elements (words, avatars). */
export const SOFT_SNAPPY = { mass: 1, tension: 175, friction: 26 };

/** Rise up + fade + de-blur. */
export const riseIn = {
  from: { opacity: 0, transform: "translateY(1.5rem)", filter: "blur(8px)" },
  to: { opacity: 1, transform: "translateY(0rem)", filter: "blur(0px)" },
};

/** Drop down from above + fade + de-blur (top nav). */
export const dropIn = {
  from: { opacity: 0, transform: "translateY(-1rem)", filter: "blur(6px)" },
  to: { opacity: 1, transform: "translateY(0rem)", filter: "blur(0px)" },
};

/** Subtle scale-up + fade (the media panel). */
export const scaleIn = {
  from: { opacity: 0, transform: "scale(0.985)" },
  to: { opacity: 1, transform: "scale(1)" },
};

/** Pop in from small (avatars). */
export const popIn = {
  from: { opacity: 0, transform: "scale(0.4)" },
  to: { opacity: 1, transform: "scale(1)" },
};

/** A touch springier feel for pointer feedback — quick to settle. */
export const HOVER = { mass: 1, tension: 320, friction: 22 };

/** Pill / CTA hover: subtle lift + scale. Resting `from` matches layout. */
export const hoverLift = {
  from: { transform: "translateY(0rem) scale(1)" },
  to: { transform: "translateY(-0.125rem) scale(1.035)" },
};

/** Text-link hover: gentle dim (no layout shift). */
export const hoverDim = {
  from: { opacity: 1 },
  to: { opacity: 0.55 },
};
