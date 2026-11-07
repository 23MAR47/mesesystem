"use client";

import { easings } from "@react-spring/web";

import { Inview } from "@/components/animation/springs/in-view";

/**
 * Viewport frame — a thin 1 px rounded rectangle inset from each
 * viewport edge: 1 rem (`inset-4`) on mobile, 2 rem (`inset-8`) from
 * the `sm` breakpoint up. The "contrast carrier" from the IRIS_AI
 * reference. Sits above the scene canvas (`z-31`) and is
 * `pointer-events-none` so it never intercepts clicks.
 *
 * The earlier knockout matte that masked UI at the perimeter has
 * been removed — the visual goal is now just the decorative border
 * line with content allowed to scroll past it. Scroll-time overlap
 * with the pinned chrome is handled by `<ScrollFade>` on the
 * `Section` / `Hero` content instead of a hard clip.
 */
export const Frame = () => {
  return (
    <Inview
      tag="div"
      mode="once"
      from={{ opacity: 0 }}
      to={{ opacity: 1 }}
      delayIn={100}
      config={{ duration: 1200, easing: easings.easeOutQuart }}
      className="pointer-events-none fixed inset-4 z-31 rounded-[5px] border border-negentropy-bone/40 sm:inset-8"
    />
  );
};
