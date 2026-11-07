// 📖 Docs: obsidian/frontend/components/common.md
"use client";

/**
 * The pill and its call to action, for the whole middle of the page.
 *
 * **One of them, not one per screen.** It used to be rendered inside the
 * immersed, delivery and process overlays, so it inherited each of their
 * windows: it faded out and back in at every screen change, three times over,
 * which read as flicker rather than as navigation. It is one object in the
 * design and it is one object here — fixed to the viewport, arriving once when
 * the reader leaves the first screen and leaving once before the closing block.
 *
 * The band it lives over is measured, not guessed: from one viewport down (the
 * end of the first screen) to the point where the gallery's closing plane
 * begins to climb, which is `runwayViewports - riseStartViewports` from the
 * bottom of that section.
 *
 * **The trigger spans the whole page, not that band.** A trigger sized to the
 * band stops reporting the moment it leaves the viewport, so scrolling back to
 * the top left the last value it had ever seen standing — the bar froze
 * half-open, a white disc and a blue one sitting over the first screen. A
 * marker that covers the document is always intersecting, always reporting, and
 * the band becomes two numbers compared against the scroll it hands over.
 *
 * The arrival is deliberately not a fade. Each plate opens **out of a circle**
 * from the centre of the screen — the pill leftwards, the call to action
 * rightwards — with the labels resolving behind them. Done with `clip-path`
 * rather than a scale so the rounded ends stay round and the type is never
 * stretched: the plate is revealed at its final size, not grown into it.
 */

import { SpringValue } from "@react-spring/web";
import type { AnimationResult } from "@react-spring/web";
import { useCallback, useEffect, useRef } from "react";

import { ProgressTrigger } from "@/components/animation/springs/progress-trigger";
import { galleryConfig } from "@/lib/gallery/gallery.config";
import { sceneConfig } from "@/lib/scene/scene.config";

import { StageNav, type StageNavContent } from "./stage-nav";

const { scroll } = galleryConfig;
/** Where the closing plane starts to climb, counted from the page's end. */
const CLOSING_VIEWPORTS = scroll.runwayViewports - scroll.riseStartViewports;

export const StageNavBar = ({ content }: { content: StageNavContent }) => {
  const barRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const shown = useRef<SpringValue<number> | null>(null);
  shown.current ??= new SpringValue(0);
  /** Whether the bar is currently asked to be up, so the spring is not restarted. */
  const up = useRef(false);

  const paint = useCallback((value: number) => {
    const bar = barRef.current;
    if (!bar) return;
    const { itemStagger } = sceneConfig.stageNav;

    // Opacity as well as the clip: the clip's floor is a **disc** the height of
    // the bar, so a value near zero still draws two circles. They fade with it.
    bar.style.opacity = String(value);
    bar.style.visibility = value <= 0.001 ? "hidden" : "visible";

    // Each plate is clipped back to a circle at its anchored end and opened
    // from there. `round` keeps the clip's own corners round, so what the
    // reader sees at the start is a disc the height of the bar, not a sliver.
    const shells = bar.querySelectorAll<HTMLElement>("[data-nav-shell]");
    shells.forEach((shell) => {
      const width = shell.offsetWidth;
      const height = shell.offsetHeight;
      if (!width || !height) return;
      const hidden = Math.max(0, (1 - value) * (width - height));
      const radius = height / 2;
      // The action opens the other way, so the two grow apart from the middle
      // of the screen rather than both travelling the same direction.
      shell.style.clipPath =
        shell.dataset.navFromLeft === undefined
          ? `inset(0 0 0 ${hidden}px round ${radius}px)`
          : `inset(0 ${hidden}px 0 0 round ${radius}px)`;
    });

    // The labels resolve behind the opening, in order, so the pill fills rather
    // than arriving complete.
    const items = bar.querySelectorAll<HTMLElement>("[data-nav-item]");
    items.forEach((item, index) => {
      const offset = index * itemStagger;
      const own = Math.max(0.0001, 1 - offset);
      const t = Math.min(1, Math.max(0, (value - offset) / own));
      item.style.opacity = String(t * t * (3 - 2 * t));
    });
  }, []);

  useEffect(() => {
    paint(0);
  }, [paint]);

  const onProgress = useCallback(
    ({ progress }: { progress: number }) => {
      const marker = markerRef.current;
      if (!marker) return;
      // The trigger runs `top top` to `bottom bottom` over the whole document,
      // so its progress is the page's own scroll expressed as a fraction.
      const viewport = window.innerHeight;
      const travel = Math.max(1, marker.offsetHeight - viewport);
      const scrolled = progress * travel;
      // Up once the first screen is behind, down once the closing plane starts
      // to climb — both measured off the layout, not guessed at.
      const wanted =
        scrolled >= viewport &&
        scrolled < travel - CLOSING_VIEWPORTS * viewport;
      if (wanted === up.current) return;
      up.current = wanted;
      void shown.current?.start({
        to: wanted ? 1 : 0,
        config: wanted
          ? sceneConfig.stageNav.enter
          : sceneConfig.stageNav.leave,
        onChange: (result: AnimationResult<SpringValue<number>>) => {
          paint(result.value);
        },
      });
    },
    [paint],
  );

  return (
    <>
      {/* Geometry only — it draws nothing and takes no pointer. Full height on
          purpose: see the note above on why a band-sized marker goes quiet. */}
      <ProgressTrigger
        ref={markerRef}
        tag="div"
        start="top top"
        end="bottom bottom"
        onChange={onProgress}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      />

      <div
        ref={barRef}
        // The design's own margin from the bottom edge: the bar sat at
        // `top-[50vw]` in a `55.5556vw` frame anchored to the bottom, which puts
        // its **bottom** 2.0833vw up — the same gutter everything else on the
        // screen uses.
        className="pointer-events-none fixed inset-x-0 bottom-frame-gutter z-10 flex justify-center"
      >
        <StageNav content={content} />
      </div>
    </>
  );
};
