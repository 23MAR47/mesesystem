// 📖 Docs: obsidian/frontend/components/common.md
"use client";

/**
 * A screen of the scroll narrative as a still: one full-bleed image captured
 * from the scene, with the screen's own copy revealing over it — and drifting
 * a little against the scroll, so the frame reads as a place rather than a
 * poster.
 *
 * The phone gets these where the desktop gets the live scene's second and
 * third stages. It is not a lesser version of the screen so much as the same
 * frame held: the field, the mesh, the chrome word are the scene's own
 * pixels, captured at the moment each stage is fully arrived (ADR-0126).
 *
 * The reveal is the page's one mechanism for DOM copy — `--stage-reveal`,
 * sprung from 0 to 1 by `<Inview>` as the section arrives, divided up by
 * `<StageReveal>` and `stageRise` inside. `mode="once"`: a screen that
 * un-resolved on the way back up would read as a glitch.
 *
 * **The parallax is a spring chasing the scroll, not the scroll itself.**
 * `<ProgressTrigger>` reports where the section is across the viewport; a
 * bare `SpringValue` follows that number and writes the image's transform on
 * change — the same bargain the scene's turn and the nav bar make. Bound
 * straight to progress the image would step with a thumb's momentum scroll;
 * chased, it carries a little past where the scroll left it and settles. The
 * image is oversized by the travel so its edges never show.
 */

import { SpringValue } from "@react-spring/web";
import type { AnimationResult } from "@react-spring/web";
import Image from "next/image";
import { useCallback, useRef } from "react";
import type { ReactNode } from "react";

import { Inview } from "@/components/animation/springs/in-view";
import { ProgressTrigger } from "@/components/animation/springs/progress-trigger";
import { sceneConfig } from "@/lib/scene/scene.config";

const { travel, spring } = sceneConfig.lite.stillParallax;
/** The image is taller than the section by the travel at each end, and sits
 *  that much above it, so the drift never shows an edge. */
const bleed = `${100 + travel}%`;
const overhang = `-${travel / 2}%`;

export interface StillImage {
  src: string;
  width: number;
  height: number;
}

export const StillStage = ({
  image,
  children,
}: {
  image: StillImage;
  children: ReactNode;
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const drift = useRef<SpringValue<number> | null>(null);
  drift.current ??= new SpringValue(0.5);

  /** Where the section is across the viewport, 0 (entering) to 1 (leaving). */
  const onProgress = useCallback(({ progress }: { progress: number }) => {
    void drift.current?.start({
      to: progress,
      config: spring,
      onChange: (result: AnimationResult<SpringValue<number>>) => {
        const element = imageRef.current;
        if (!element) return;
        // Centred at the section's middle, so the frame is at rest exactly
        // where the reader stops to read it. Percent of the image's own
        // height; half the travel each way is what the overhang allows.
        const shift = (result.value - 0.5) * travel * 0.5;
        element.style.transform = `translate3d(0, ${shift}%, 0)`;
      },
    });
  }, []);

  return (
    <ProgressTrigger
      tag="div"
      start="top bottom"
      end="bottom top"
      onChange={onProgress}
      className="relative w-full"
    >
      <Inview
        tag="section"
        mode="once"
        from={{ "--stage-reveal": 0 }}
        to={{ "--stage-reveal": 1 }}
        config={sceneConfig.inkLetters.entrance}
        className="relative h-lvh w-full overflow-hidden bg-scene-tide"
      >
        {/* The transform is written by the spring alone — no transform class
            here, or the first write would silently replace it. */}
        <Image
          ref={imageRef}
          src={image.src}
          alt=""
          width={image.width}
          height={image.height}
          sizes="100vw"
          className="pointer-events-none absolute inset-x-0 w-full object-cover will-change-transform"
          style={{ height: bleed, top: overhang }}
        />
        {children}
      </Inview>
    </ProgressTrigger>
  );
};
