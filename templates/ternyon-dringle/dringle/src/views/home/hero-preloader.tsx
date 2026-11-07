"use client";

import { useEffect, useState } from "react";
import { animated, easings, to, useSpring } from "@react-spring/web";

import { usePreloader } from "./preloader-store";

/** Panel inset (stage rem) — the curtain sits inside the same inset as the panel. */
const PANEL_INSET = 0.625;
/** Phase durations (ms). Timers drive the phase changes; springs the visuals. */
const LOAD_MS = 2200;
const COLLAPSE_MS = 850;
/** Progress at which the counter stops rising and begins fading (0–1). */
const COUNTER_FADE_START = 0.9;

/** Counter opacity for a given load progress: full until 90%, then eased to 0
 *  by 100% — so the number fades out in place instead of riding off the panel. */
const counterFade = (p: number): number =>
  p < COUNTER_FADE_START
    ? 1
    : Math.max(0, 1 - (p - COUNTER_FADE_START) / (1 - COUNTER_FADE_START));

/**
 * Intro preloader: a percentage counter on the left rises together with a
 * gradient curtain that fills the panel from the bottom. At 100% the curtain
 * collapses upward to reveal the media panel, and `reveal()` fires so the rest
 * of the hero animates in at the same moment. See preloader-store.
 *
 * Phase transitions are timer-driven (reliable regardless of the spring clock);
 * the counter and curtain geometry are interpolated by react-spring.
 */
export const HeroPreloader = () => {
  const reveal = usePreloader((state) => state.reveal);
  // The intro plays once per session. `isRevealed` lives in a module-level store,
  // so on a layout remount (e.g. resizing across the mobile breakpoint) it is
  // already true — start `gone` so the curtain never replays. See ADR-0017.
  const [gone, setGone] = useState(() => usePreloader.getState().isRevealed);
  const [collapsing, setCollapsing] = useState(false);

  useEffect(() => {
    if (gone) return;
    const timer = setTimeout(() => {
      reveal();
      setCollapsing(true);
    }, LOAD_MS);
    return () => clearTimeout(timer);
  }, [reveal, gone]);

  useEffect(() => {
    if (!collapsing) return;
    const timer = setTimeout(() => setGone(true), COLLAPSE_MS);
    return () => clearTimeout(timer);
  }, [collapsing]);

  const load = useSpring({
    from: { p: 0 },
    to: { p: 1 },
    config: { duration: LOAD_MS, easing: easings.easeInOutCubic },
  });

  const collapse = useSpring({
    p: collapsing ? 1 : 0,
    config: { duration: COLLAPSE_MS, easing: easings.easeInOutCubic },
  });

  if (gone) return null;

  return (
    <div className="absolute inset-0 z-50" aria-hidden>
      {/* Curtain lives inside the media panel's box (which now fills the stage
          height), so its geometry is a percentage of that box — no fixed rem
          height to keep in sync with the fluid panel. */}
      <div className="absolute bottom-[0.625rem] left-[45rem] top-[0.625rem] w-[44.375rem] overflow-hidden rounded-panel">
        <animated.div
          className="absolute inset-x-0 bg-[image:var(--gradient-preloader)]"
          style={
            collapsing
              ? { top: 0, height: collapse.p.to((c) => `${(1 - c) * 100}%`) }
              : { bottom: 0, height: load.p.to((p) => `${p * 100}%`) }
          }
        />
      </div>

      {/* Counter: rises alongside the curtain over the full stage height, holds
          at 90% and fades out in place so it never rides off the top. */}
      <animated.div
        className="absolute left-[0.5rem] text-[4rem] font-light leading-none text-ink"
        style={{
          bottom: load.p.to(
            (p) =>
              `calc(${Math.min(p, COUNTER_FADE_START)} * (100dvh - ${PANEL_INSET * 2}rem - 4rem) + ${PANEL_INSET}rem)`,
          ),
          opacity: to([load.p, collapse.p], (p, c) => counterFade(p) * (1 - c)),
        }}
      >
        {load.p.to((p) => `${Math.round(p * 100)}%`)}
      </animated.div>
    </div>
  );
};
