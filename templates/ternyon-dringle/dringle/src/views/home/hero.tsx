"use client";

import type { HeroContent } from "@/data/mocks/home";
import { useMediaQuery } from "@/hooks/use-media-query";

import { HeroDesktop } from "./hero-desktop";
import { HeroMobile } from "./hero-mobile";

interface HeroProps {
  content: HeroContent;
}

/** Below this viewport the hero switches to the stacked mobile layout. Kept in
 *  lockstep with the `@media (max-width: 1023px)` rules in globals.css. */
const MOBILE_QUERY = "(max-width: 1023px)";

/**
 * Picks the hero layout by viewport. Uses `matchMedia` (not a debounced width)
 * so the switch fires the *instant* the 1024px breakpoint is crossed — in lockstep
 * with the CSS media queries, with no lag or reload needed on resize. The query
 * reports `false` (desktop) on the server and during hydration, so SSR and the
 * first client render agree (no hydration mismatch); the real value settles in
 * right after and the preloader covers that first transition.
 */
export const Hero = ({ content }: HeroProps) => {
  const isMobile = useMediaQuery(MOBILE_QUERY);

  return isMobile ? (
    <HeroMobile content={content} />
  ) : (
    <HeroDesktop content={content} />
  );
};
