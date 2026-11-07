// 📖 Docs: obsidian/frontend/components/common.md

/**
 * The gallery's screen — three steps across the travelling strip.
 *
 * A layer over the **gallery's** pinned stage, the way the first three screens
 * are layers over the scene's. Its Figma background is a render of the cards
 * going past, so there is nothing to import: the strip underneath is the live
 * one.
 *
 * The copy is black here, not white — this stage is the porcelain ground, not
 * the tide.
 *
 * The three steps are an ordered list, because that is what they are: brief,
 * then build, then batch. Each `li` spans the frame's full height and holds its
 * own heading at the top and its body at the foot, which is how the design has
 * them — a column, not a card. The two rules are the gaps between the columns,
 * not borders on them, so they are their own elements at the design's own x.
 *
 * **The rules ship separately from the copy** — `ProcessRules`. They were inside
 * this component, and this component lives in the gallery's overlay, which
 * fades out at a third of the way down the strip so the closing panel can climb
 * over clean type. The rules went with it, and the photographs then ran down a
 * frame with no columns in it. They belong to the strip, not to the three
 * steps, so they are mounted where the strip is.
 */

import type { CSSProperties } from "react";

import { galleryConfig } from "@/lib/gallery/gallery.config";

import { StageBottom, StageFrame, stackChild } from "./stage-frame";
import { StageReveal } from "./stage-reveal";
import type { StageNavContent } from "./stage-nav";

export interface ProcessStep {
  /** The step's name — one word, set large. */
  name: string;
  /** What happens in it. */
  body: string;
  /** Left edge of the column, in `vw`. */
  left: number;
  /** How the column sets: the design left-, centre- and right-aligns them. */
  align: "left" | "center" | "right";
}

export interface ProcessStageContent extends StageNavContent {
  steps: readonly ProcessStep[];
  /** Where the rules between the columns fall, in `vw`. */
  rules: readonly number[];
}

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

const { process } = galleryConfig;

/**
 * A step's own share of the strip's travel, as a CSS expression.
 *
 * `--strip-travel` is the raw turn the gallery publishes; each step maps its
 * own window on it to 0-1. The whole progression is therefore three `calc()`s
 * over one custom property — no clock per column, nothing to keep in step, and
 * it survives a re-render because it is only ever CSS. Same bargain as
 * `StageReveal` itself.
 *
 * `offset` is how far into the window this piece starts: the heading takes 0
 * and the body trails it, so the name lands before the sentence behind it
 * darkens.
 */
const stepReveal = (index: number, offset = 0): string => {
  const from = process.arriveAt - process.span + index * process.stagger + offset;
  return `calc((var(--strip-travel, 1) - ${from.toFixed(4)}) / ${process.span.toFixed(4)})`;
};

/**
 * The gaps between the columns, on their own.
 *
 * Mounted beside the strip rather than in the overlay with the copy, so they
 * last as long as the photographs do. See the note at the top of this file.
 */
export const ProcessRules = ({
  rules,
}: Pick<ProcessStageContent, "rules">) => (
  <StageFrame>
    {rules.map((left) => (
      <span
        key={left}
        aria-hidden="true"
        // Gone on a phone: they are the gaps between three columns, and there
        // are no three columns down there — two vertical hairlines across a
        // stack of photographs are a ruled page, not a grid.
        className="absolute inset-y-0 left-[var(--x)] block w-px bg-stage-ink/10 stacked:hidden"
        style={{ "--x": `${left}vw` } as CSSProperties}
      />
    ))}
  </StageFrame>
);

export const ProcessStage = ({ content }: { content: ProcessStageContent }) => (
  <StageFrame>
    {/* On a phone the three steps are a list down the foot of the screen, held
        clear of the floating bar. The strip of photographs runs behind them, so
        they sit on the porcelain the closing panel has not reached yet — the
        same ground they have on a wide screen, just gathered into one column
        instead of spread across three. */}
    <ol className="stacked:absolute stacked:inset-x-0 stacked:bottom-0 stacked:flex stacked:flex-col stacked:gap-5 stacked:bg-stage-ground/85 stacked:p-frame-gutter stacked:pb-[calc(var(--frame-navbar)+var(--frame-gutter)*2)] stacked:backdrop-blur-sm">
      {content.steps.map((step, index) => (
        <li
          key={step.name}
          // A column on a wide screen, a row in a list on a phone: 27.7778vw is
          // 108px there, which is not a column, it is a margin. The alignment
          // goes with it — left, centre and right are how three columns tell
          // themselves apart across a screen, and stacked they would just read
          // as three sentences that cannot decide where they start.
          className={`absolute inset-y-0 left-[var(--x)] w-[27.7778vw] ${alignClass[step.align]} stacked:static stacked:w-full stacked:text-left`}
          // The step's own window **replaces** the overlay's one arrival for
          // everything inside it. The overlay still owns the exit — it fades
          // the whole layer with `opacity` — so a window that only ever rises
          // is the whole of what a column needs.
          style={
            {
              "--x": `${step.left}vw`,
              "--stage-reveal": stepReveal(index),
            } as CSSProperties
          }
        >
          <StageReveal
            tag="h3"
            unit="letter"
            floor={process.floor}
            className="absolute inset-x-0 top-[2.0833vw] font-display text-[8.6111vw] font-light leading-[0.9] text-stage-ink stacked:static stacked:text-[max(36px,8.6111vw)]"
          >
            {step.name}
          </StageReveal>
          <StageBottom className="stacked:static stacked:h-auto">
            {/* The body only **darkens** — no per-word stagger. The heading
                resolving letter by letter and the sentence resolving word by
                word at the same moment is two gestures competing; one of them
                has to be the plain one. */}
            <p
              className={`absolute inset-x-0 top-[45.1389vw] font-sans text-frame-body leading-[1.1] text-stage-ink ${stackChild}`}
              style={{
                opacity: `max(${process.floor}, ${stepReveal(index, process.bodyLag)})`,
              }}
            >
              {step.body}
            </p>
          </StageBottom>
        </li>
      ))}
    </ol>
  </StageFrame>
);
