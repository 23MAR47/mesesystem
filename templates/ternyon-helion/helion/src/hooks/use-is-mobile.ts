"use client";

import { useWindowWidth } from "@/hooks/use-window-size";

/**
 * Below this width the sections stop scaling their 1440×800 desktop composition
 * and reflow into their native mobile layout instead (stacked, readable copy,
 * a burger nav). It sits one pixel above the `hero-md` design breakpoint so the
 * scaled composition is only ever used on genuinely wide viewports.
 */
export const MOBILE_MAX = 856;

/**
 * Are we rendering the mobile reflow rather than the scaled desktop composition?
 *
 * SSR and the first pre-measure frame report width 0, which resolves to `false`
 * (desktop) so server and client markup match; the real width lands on mount via
 * the shared `useWindowWidth` store, flipping narrow viewports to mobile. The
 * sections are hidden behind the preloader until then, so the swap is never seen.
 */
export const useIsMobile = (): boolean => {
  const width = useWindowWidth();
  return width > 0 && width < MOBILE_MAX;
};
