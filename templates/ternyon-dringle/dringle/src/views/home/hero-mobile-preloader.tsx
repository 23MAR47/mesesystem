"use client";

import { useEffect, useState } from "react";
import { animated, easings, to, useSpring } from "@react-spring/web";

import { usePreloader } from "./preloader-store";

const LOAD_MS = 2200;
const COLLAPSE_MS = 850;
/** Progress at which the counter stops rising and begins fading (0–1). */
const COUNTER_FADE_START = 0.9;

/** Counter opacity for a given load progress: full until 90%, then eased to 0
 *  by 100% — so the number fades out in place instead of riding off-screen. */
const counterFade = (p: number): number =>
  p < COUNTER_FADE_START
    ? 1
    : Math.max(0, 1 - (p - COUNTER_FADE_START) / (1 - COUNTER_FADE_START));

/**
 * Mobile intro preloader — a full-screen gradient curtain rises from the bottom
 * with a percentage counter, then collapses upward to reveal the hero and fire
 * `reveal()`. Same phase/visual split as the desktop preloader (see ADR-0015).
 */
export const HeroMobilePreloader = () => {
  const reveal = usePreloader((state) => state.reveal);
  // Play once per session — skip the replay when a layout remount (e.g. a
  // breakpoint-crossing resize) mounts a fresh preloader. See ADR-0017.
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
    <div className="fixed inset-0 z-50" aria-hidden>
      <animated.div
        className="absolute inset-x-0 bg-[image:var(--gradient-preloader)]"
        style={
          collapsing
            ? {
                top: 0,
                height: collapse.p.to((c) => `${(1 - c) * 100}dvh`),
              }
            : {
                bottom: 0,
                height: load.p.to((p) => `${p * 100}dvh`),
              }
        }
      />

      <animated.div
        className="absolute left-[1.5rem] text-[3rem] font-light leading-none text-white mix-blend-difference"
        style={{
          bottom: load.p.to(
            (p) => `${Math.min(p, COUNTER_FADE_START) * 100}dvh`,
          ),
          opacity: to([load.p, collapse.p], (p, c) => counterFade(p) * (1 - c)),
        }}
      >
        {load.p.to((p) => `${Math.round(p * 100)}%`)}
      </animated.div>
    </div>
  );
};
