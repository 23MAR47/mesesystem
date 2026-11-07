// 📖 Docs: obsidian/frontend/components/common.md

/**
 * The second screen — the copy that rides the tide.
 *
 * Like the title stage, this is **not a section**: it is a layer over the
 * scene's own pinned stage, shown while the reader is on the tide. The blue
 * field and the wireframe behind it are the live scene, not an image — the
 * Figma's background is a render of exactly this, so there is nothing to
 * import.
 *
 * **Every length is a Figma pixel over 1440, in `vw`**, and the frame is
 * `55.5556vw` tall and centred, for the reasons set out in `hero-stage.tsx`:
 * one drawing at one width, held in proportion at every width, fitting one
 * screen at any window shape.
 *
 * The heading is two lines that are *not* a paragraph — the second is indented
 * to a third of the stage and set on its own baseline, so they are two blocks
 * placed by the design rather than a wrapped run of text.
 */

import type { CSSProperties } from "react";

import { StageBottom, StageFrame, stackChild } from "./stage-frame";
import { StageReveal } from "./stage-reveal";
import type { StageNavContent } from "./stage-nav";

export interface ImmersedStat {
  /** The figure — set large, in the text serif. */
  value: string;
  /** What it counts. */
  body: string;
}

export interface ImmersedStageContent extends StageNavContent {
  /** The two lines of the heading, placed independently. */
  headingTop: string;
  headingBottom: string;
  /** Two claims down the left edge. */
  claims: readonly [string, string];
  /** Three ruled rows down the right edge. */
  stats: readonly ImmersedStat[];
}

/**
 * Rule, figure and body — one row of the right-hand column.
 *
 * The design's three parts are placed independently down a column; a phone has
 * no column to place them in, so below `md` the row becomes what it always
 * was underneath — a rule with a figure and its sentence beside it.
 *
 * The three `top`s arrive as **custom properties** rather than as inline
 * `top`. An inline style cannot be undone by a class, so a position written
 * that way survives into the phone layout and pins the part where the column no
 * longer is. Handed over as a variable, the class decides whether to use it.
 */
const StatRow = ({ stat, top }: { stat: ImmersedStat; top: number }) => (
  <div
    className={`contents stacked:flex stacked:w-full stacked:flex-col stacked:gap-1 ${stackChild}`}
  >
    <span
      aria-hidden="true"
      className="absolute left-[75.1389vw] top-[var(--row)] block h-px w-[22.7778vw] bg-stage-immersed-ink/30 stacked:static stacked:w-full"
      style={{ "--row": `${top}vw` } as CSSProperties}
    />
    <div className="contents stacked:flex stacked:w-full stacked:items-baseline stacked:gap-3">
      <p
        className="absolute left-[75.1389vw] top-[var(--row)] whitespace-nowrap font-serif text-frame-figure leading-none text-stage-immersed-ink stacked:static"
        style={{ "--row": `${top + 1.1111}vw` } as CSSProperties}
      >
        {stat.value}
      </p>
      <p
        className="absolute left-[82.6389vw] top-[var(--row)] w-[15.2778vw] font-sans text-frame-body leading-[1.1] text-stage-immersed-ink stacked:static stacked:w-auto stacked:flex-1"
        style={{ "--row": `${top + 3.4722}vw` } as CSSProperties}
      >
        {stat.body}
      </p>
    </div>
  </div>
);

const headingTopClass =
  "absolute left-[2.0833vw] top-[2.0833vw] w-[79.3056vw] font-display text-[max(46px,8.6111vw)] font-light leading-[0.9] text-stage-immersed-ink stacked:left-frame-gutter stacked:top-[var(--frame-heading-top)] stacked:w-[calc(100%-var(--frame-gutter)*2)] stacked:text-[max(40px,8.6111vw)]";
const headingBottomClass =
  "absolute left-[30vw] top-[max(52px,9.8611vw)] whitespace-nowrap font-display text-[max(46px,8.6111vw)] font-light leading-[0.9] text-stage-immersed-ink stacked:left-[calc(var(--frame-gutter)+16px)] stacked:top-[calc(var(--frame-heading-top)+36px)] stacked:text-[max(40px,8.6111vw)]";

export const ImmersedStage = ({
  content,
  painted = true,
}: {
  content: ImmersedStageContent;
  /**
   * Whether the heading is painted by the scene (`data-scene-ink`) — which is
   * what puts it **behind the model**: the background quad depth-tests
   * against the subject, and on this stage the quad is the tide field, so a
   * DOM layer behind the canvas would be covered by it entirely.
   *
   * `false` on the lite path, where this screen is a still with no scene to
   * paint it: the heading then resolves letter by letter in the DOM, like the
   * delivery screen's always has. ADR-0126.
   */
  painted?: boolean;
}) => (
  <StageFrame>
    {painted ? (
      <>
        <h2 data-scene-ink className={headingTopClass}>
          {content.headingTop}
        </h2>
        {/* Its own block, indented and on its own baseline. */}
        <p aria-hidden="true" data-scene-ink className={headingBottomClass}>
          {content.headingBottom}
        </p>
      </>
    ) : (
      <>
        <StageReveal tag="h2" unit="letter" className={headingTopClass}>
          {content.headingTop}
        </StageReveal>
        <StageReveal tag="p" unit="letter" className={headingBottomClass}>
          {content.headingBottom}
        </StageReveal>
      </>
    )}

    <StageBottom stack underBar>
      <StageReveal
        tag="p"
        className={`absolute left-[2.0833vw] top-[30.2778vw] w-[20.0694vw] font-serif text-frame-lead leading-none text-stage-immersed-ink ${stackChild}`}
      >
        {content.claims[0]}
      </StageReveal>
      <StageReveal
        tag="p"
        className={`absolute left-[2.0833vw] top-[47.9167vw] w-[27.2222vw] font-serif text-frame-lead leading-none text-stage-immersed-ink ${stackChild}`}
      >
        {content.claims[1]}
      </StageReveal>

      {content.stats.map((stat, index) => (
        <StatRow key={stat.value} stat={stat} top={30.2778 + index * 8.4722} />
      ))}
    </StageBottom>
  </StageFrame>
);
