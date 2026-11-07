/**
 * @fileoverview Configuration file for Spring animation components
 *
 * Global configuration for all Spring components.
 * Controls behavior and features across the entire application.
 *
 * disableOnMobile: Controls which spring animations are disabled on mobile devices
 * - hover: Disable hover animations on mobile (default: true since no hover on mobile)
 * - inview: Disable in-view animations on mobile
 * - spring: Disable basic spring animations on mobile
 * - springtrigger: Disable scroll-triggered animations on mobile
 */
interface SpringsConfig {
  mobileWidth: number;
  disableOnMobile: {
    hover: boolean;
    inview: boolean;
    spring: boolean;
    springtrigger: boolean;
  };
}

export const springsConfig: SpringsConfig = {
  mobileWidth: 768,
  disableOnMobile: {
    hover: true,
    inview: false,
    spring: false,
    springtrigger: false,
  },
} as const;

/**
 * @param value - whether the animation opts into mobile-disabling
 * @param viewportWidth - optional explicit width (px); pass a React-tracked
 *   value here so callers re-evaluate on resize. Falls back to `window.innerWidth`.
 */
export const isMobileDisabled = (value: boolean, viewportWidth?: number) => {
  if (typeof window === "undefined") return false;
  if (!value) return false;
  const width =
    viewportWidth && viewportWidth > 0 ? viewportWidth : window.innerWidth;
  return width <= springsConfig.mobileWidth;
};

/**
 * Shared spring presets for the Halden page.
 *
 * `weight` is the page's motion law: a heavy, high-friction spring so type and
 * plates *settle* like solid oak rather than popping like a notification. One
 * soft overshoot, long landing. Use it for anything that arrives on the page.
 * `weightSoft` is the same character with less mass, for small type and rules
 * that would feel sluggish at full weight.
 */
export const springWeight = { mass: 2.4, tension: 120, friction: 34 } as const;
export const springWeightSoft = {
  mass: 1.4,
  tension: 170,
  friction: 30,
} as const;

/** Per-letter spring for the handwritten statement — snappy, no overshoot. */
export const springInk = { mass: 1, tension: 420, friction: 34 } as const;
