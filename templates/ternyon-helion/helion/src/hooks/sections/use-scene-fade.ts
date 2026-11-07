"use client";

import { useEffect } from "react";
import { useSpring } from "@react-spring/web";
import { subscribeToTicker } from "@/lib/animation/ticker";
import { screens } from "@/lib/scene/screens";
import { scrollState } from "@/lib/scene/scroll-state";

/**
 * Fades and drifts a section's content as its slide leaves frame.
 *
 * The original wrote `--scene-progress` onto each slide every frame and mapped
 * it in SCSS:
 *
 *   --content-fade:  clamp(0, (var(--scene-progress) - 0.55) * 3.2, 1)
 *   --content-drift: (1 - var(--content-fade)) * -32px
 *   transition: opacity .25s linear, transform .25s linear
 *
 * Here the same ramp feeds a spring instead of a CSS transition (hard rule #1).
 * `scrollState.sceneProgress` is not React state, so this reads it on the shared
 * ticker rather than re-rendering: only the spring's animated style changes.
 */

/** Progress below which content is fully faded out. */
const FADE_THRESHOLD = 0.55;
/** Slope of the fade ramp above the threshold. */
const FADE_SLOPE = 3.2;
/** Upward drift, in px, at full fade-out. */
const DRIFT = -32;

/** Approximates the original's `.25s linear` crossfade. */
const FADE_CONFIG = { tension: 210, friction: 30 } as const;

export const useSceneFade = (id: string) => {
  const [styles, api] = useSpring(() => ({
    opacity: 1,
    y: 0,
    config: FADE_CONFIG,
  }));

  useEffect(() => {
    const unsubscribe = subscribeToTicker(() => {
      /* Before the controller's first frame nothing has been measured, so the
       * scene progress is still 0 for every slide. The original relied on the
       * CSS `var(--scene-progress, 1)` fallback to keep content visible until
       * then; this is the same guard. */
      const progress =
        scrollState.activeScreen === screens.NONE
          ? 1
          : (scrollState.sceneProgress[id] ?? 1);

      const fade = Math.min(
        1,
        Math.max(0, (progress - FADE_THRESHOLD) * FADE_SLOPE),
      );

      api.start({ opacity: fade, y: (1 - fade) * DRIFT });
    }, () => 0);

    return unsubscribe;
  }, [id, api]);

  return styles;
};
