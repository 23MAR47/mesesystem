// 📖 Docs: obsidian/frontend/components/common.md

/**
 * The opening curtain: a counter filling on the accent, leaving upward when the
 * scene behind it is warm.
 *
 * **What ends it is the scene, not a clock.** The counter creeps to `hold` on
 * its own and stops there; the rest, and the exit, wait for `sceneReady` — with
 * `minShow` as a **floor** so a fast connection still gets a curtain rather than
 * a flash. A preloader that *ends* on a timer is a promise about the network
 * that cannot be kept; one that starts on a floor is only a promise about
 * itself. See [[optimize-3d-scene]] §3 and [[decisions-log]] ADR-0115.
 *
 * **The number is written to the DOM, not rendered from state.** A bare
 * `SpringValue` whose `onChange` writes `textContent` — the same bargain
 * `<StageNavBar>`, the scene's entrance and `<Magnetic>` make. A hundred counter
 * ticks are a hundred re-renders otherwise, and not one of them would change
 * anything React needs to know about.
 *
 * **The page is at its top when the curtain goes.** A reload restores the
 * browser's last scroll position, and it does so *after* the layout's own
 * scroll-to-top has run — measured, the two fight and the browser wins. The
 * curtain covered that, and then lifted onto the middle of the page: every
 * section, finished, for the second it took the scene to snap back. So the
 * curtain puts the page at the top itself, both when it locks the scroll and
 * again as it leaves — and the layout tells the browser not to restore at all.
 * See [[decisions-log]] ADR-0122.
 */

"use client";

import { SpringValue } from "@react-spring/web";
import type { AnimationResult } from "@react-spring/web";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { usePreloader } from "@/hooks/preloader/use-preloader";
import { useScroll } from "@/hooks/smooth-scroll/use-scroll";
import { preloaderConfig } from "@/lib/preloader/preloader.config";

const { hold, minShow, fill, finish, exit, releaseAt } = preloaderConfig;

export const Preloader = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  const sceneReady = usePreloader((state) => state.sceneReady);
  const release = usePreloader((state) => state.release);
  const released = usePreloader((state) => state.released);
  /**
   * Whether the curtain has finished leaving — its own business, separate
   * from `released`, which now fires part-way through the exit so the page's
   * entrance plays under the trailing edge. The element stays until the travel
   * is done, or it would vanish mid-screen the moment the page was released.
   */
  const [gone, setGone] = useState(false);
  const [startScroll, stopScroll] = useScroll(
    useShallow((state) => [state.start, state.stop]),
  );

  /** The fill, 0–1. Bare, because nothing here is rendered from it. */
  const progress = useRef<SpringValue<number> | null>(null);
  /** The exit, 0–1: how far up its own height the curtain has gone. */
  const leaving = useRef<SpringValue<number> | null>(null);
  progress.current ??= new SpringValue(0);
  leaving.current ??= new SpringValue(0);

  // The reader must not be able to scroll the page they cannot see.
  //
  // **Unlocked on `released`, not only in the cleanup.** Returning `null` from
  // a component does not unmount it — the element goes, the effects stay — so
  // the cleanup below never ran on the one path that always happens, and the
  // page stayed locked for good behind a curtain that had left. The cleanup is
  // still here for the paths that really do unmount.
  useEffect(() => {
    if (released) {
      startScroll();
      return;
    }
    stopScroll();
    window.scrollTo(0, 0);
    return () => startScroll();
  }, [released, startScroll, stopScroll]);

  /** The one place the number reaches the page. */
  const show = (value: number) => {
    const count = countRef.current;
    if (count) count.textContent = String(Math.round(value * 100));
  };

  useEffect(() => {
    const filling = progress.current;
    if (!filling) return;
    void filling.start({
      to: hold,
      config: fill,
      onChange: (result: AnimationResult<SpringValue<number>>) =>
        show(result.value),
    });
  }, []);

  // **The floor on the showing.** `sceneReady` says the curtain *may* finish;
  // this says it may not finish yet. Both have to be true.
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setWaited(true), minShow);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!sceneReady || !waited) return;
    const value = progress.current;
    const away = leaving.current;
    if (!value || !away) return;

    void value.start({
      to: 1,
      config: finish,
      onChange: (result: AnimationResult<SpringValue<number>>) =>
        show(result.value),
      onRest: () => {
        // The first screen is what the curtain lifts onto, whatever the
        // browser remembered. Lenis is told as well as the window: stopped, it
        // keeps a target of its own, and would otherwise scroll the page back
        // to wherever that was the moment it started again.
        window.scrollTo(0, 0);
        useScroll
          .getState()
          .lenis?.scrollTo(0, { immediate: true, force: true });
        void away.start({
          to: 1,
          config: exit,
          onChange: (result: AnimationResult<SpringValue<number>>) => {
            const root = rootRef.current;
            if (!root) return;
            root.style.transform = `translate3d(0, ${-result.value * 100}%, 0)`;
            // **Released part-way through the exit, not on rest.** The
            // hero's entrance plays into the screen as it is uncovered rather
            // than into an empty one afterwards. `release` is idempotent.
            if (result.value >= releaseAt) release();
          },
          onRest: () => {
            release();
            setGone(true);
          },
        });
      },
    });
  }, [sceneReady, waited, release]);

  // Gone, not merely transparent: it covers the whole viewport and would keep
  // the page's pointer for ever.
  if (gone) return null;

  return (
    <div
      ref={rootRef}
      // Above the cookie banner, which is `z-50`: a consent card floating over
      // the curtain is a second thing asking for attention before the page has
      // arrived.
      className="fixed inset-0 z-60 flex items-center justify-center bg-stage-accent will-change-transform"
    >
      <p
        role="status"
        aria-live="polite"
        className="font-serif text-frame-figure leading-none text-stage-accent-foreground"
      >
        <span ref={countRef}>0</span>
        <span className="sr-only"> per cent loaded</span>
      </p>
    </div>
  );
};
