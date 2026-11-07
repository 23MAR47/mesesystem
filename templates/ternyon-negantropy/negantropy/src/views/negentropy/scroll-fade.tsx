"use client";

import { ReactNode, useEffect, useRef } from "react";

interface ScrollFadeProps {
  children: ReactNode;
  className?: string;
  /**
   * Distance from viewport top (px) where the content is fully faded
   * out. Default `120` lands well clear of the chrome at `top-16`
   * (64 px) so text doesn't visibly cross BrandMark / NavJumplinks.
   */
  topZone?: number;
  /** Length of the top fade ramp (px). */
  topFade?: number;
  /**
   * Distance from viewport bottom (px) where the content is fully
   * faded in (its bottom edge at `viewport_height - bottomZone`).
   */
  bottomZone?: number;
  /** Length of the bottom fade ramp (px). */
  bottomFade?: number;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Smooth scroll-progress opacity fade. The wrapper element's
 * `getBoundingClientRect()` is read every frame and its opacity is
 * computed as `min(fadeOutAtTop, fadeInFromBottom)`:
 *
 *   - As the wrapper's **top** approaches `topZone` (just below the
 *     pinned chrome), opacity ramps 1 → 0.
 *   - As the wrapper's **bottom** rises into the viewport, opacity
 *     ramps 0 → 1 over `bottomFade` px.
 *
 * Independent of the per-letter / per-word reveal animations that
 * `TextEngine` plays once — those handle initial entrance; this layer
 * handles the smooth fade-out and fade-back-in as the user scrolls
 * past or back into the section. Driven by `requestAnimationFrame`
 * because the project's `ProgressTrigger` is per-element progress
 * and doesn't expose viewport-relative position cheaply.
 */
export const ScrollFade = ({
  children,
  className,
  topZone = 120,
  topFade = 140,
  bottomZone = 80,
  bottomFade = 140,
}: ScrollFadeProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const node = ref.current;
      if (node) {
        const rect = node.getBoundingClientRect();
        const vh = window.innerHeight;

        // On mobile the pinned chrome is smaller and the brief asks the
        // content to linger longer before fading. Derive the top zone from
        // the viewport height instead of the desktop px props: content stays
        // fully visible until its top edge reaches 20 % of the viewport, then
        // fades out by the time it hits 5 % (just under the mobile chrome).
        const isMobile = window.innerWidth <= 640;
        const effTopZone = isMobile ? vh * 0.05 : topZone;
        const effTopFade = isMobile ? vh * 0.15 : topFade;

        // Fade out as the top edge crosses the chrome zone.
        const fadeOut = clamp01((rect.top - effTopZone) / effTopFade);

        // Fade in as the bottom edge rises from below the viewport toward
        // the bottom zone. On mobile this is skipped (held at 1) so content
        // is already fully opaque the moment it enters from below — its
        // per-letter Inview/TextEngine reveals handle the entrance instead.
        const fadeIn = isMobile
          ? 1
          : clamp01((vh + bottomFade - rect.bottom - bottomZone) / bottomFade);

        node.style.opacity = String(Math.min(fadeOut, fadeIn));
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [topZone, topFade, bottomZone, bottomFade]);

  return (
    <div ref={ref} className={className} style={{ willChange: "opacity" }}>
      {children}
    </div>
  );
};
