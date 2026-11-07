// 📖 Docs: obsidian/frontend/components/common.md
"use client";

/**
 * The closing screen: the subject as a still image on the accent, with the
 * same two layers of type the scene composed around it.
 *
 * **Not a scene.** It was a second `ModelScene` — a full renderer for one
 * screen at progress 0 — and a phone could not carry two. The page keeps its
 * one WebGL scene in the hero; this block is a cutout of the same bust,
 * captured from that scene on this ground (the foot already dissolved into the
 * accent), with the reveal done the way every DOM layer over the scene does it:
 * one custom property, `--stage-reveal`, that `<StageReveal>` and `stageRise`
 * divide up. ADR-0125.
 *
 * `<Inview>` writes that property from a spring as the panel carrying this
 * screen rises into view — `mode="once"`, because a screen that resolved and
 * then un-resolved on the way back up would read as a glitch. The panel's own
 * depth cue (`--closing-travel`) is untouched: the title and copy still lead
 * and lag against it in CSS.
 *
 * The image sits where the scene framed the subject: the head at the top of
 * the stage, the foot dissolving four fifths of the way down. Portrait windows
 * lift it and shrink it the way the scene's mobile framing did, to leave the
 * column of copy its ground.
 */

import Image from "next/image";

import { Inview } from "@/components/animation/springs/in-view";
import { sceneConfig } from "@/lib/scene/scene.config";

import { ContactStageCopy, ContactStageTitle } from "./contact-stage";
import type { ContactStageContent } from "./contact-stage";

export interface ClosingStageProps {
  content: ContactStageContent;
  /** The bust, cut out on transparency — see `stage.cutoutSrc`. */
  figureSrc: string;
  /** The cutout's own pixel size, for the image's aspect. */
  figureSize: { width: number; height: number };
}

export const ClosingStage = ({
  content,
  figureSrc,
  figureSize,
}: ClosingStageProps) => (
  <Inview
    tag="section"
    mode="once"
    from={{ "--stage-reveal": 0 }}
    to={{ "--stage-reveal": 1 }}
    config={sceneConfig.inkLetters.entrance}
    className="relative h-lvh w-full overflow-hidden"
  >
    <ContactStageTitle heading={content.heading} />
    <Image
      src={figureSrc}
      alt=""
      width={figureSize.width}
      height={figureSize.height}
      sizes="(max-width: 1179px) 70vw, 34vw"
      className="pointer-events-none absolute left-1/2 top-0 h-[81%] w-auto -translate-x-1/2 stacked:top-[9lvh] stacked:h-[58%]"
    />
    <ContactStageCopy content={content} />
  </Inview>
);
