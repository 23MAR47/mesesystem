// 📖 Docs: obsidian/frontend/components/common.md

/**
 * The third screen — the copy that rides the letters.
 *
 * Another layer over the scene's pinned stage, shown while the mark the bust
 * became is standing in the field. The Figma's background is a render of
 * exactly that, so there is nothing to import.
 *
 * The heading is **two blocks on one baseline**, not a centred line with a gap:
 * one is hung on the left margin and the other picked up again past the middle,
 * so the mark stands in the space between them. Setting it as a single string
 * with padding would put that gap wherever the text happened to wrap.
 *
 * The list of deliverables is a real `ul` — it is a list, whatever its stepped
 * indents look like. The indents are the design's, held per item.
 */

import type { CSSProperties } from "react";

import { StageBottom, StageFrame, stackChild } from "./stage-frame";
import { StageReveal } from "./stage-reveal";
import type { StageNavContent } from "./stage-nav";

export interface DeliveryLine {
  label: string;
  /** Left offset in `vw` — the design steps the last two in. */
  left: number;
  /** Top offset in `vw`. */
  top: number;
}

export interface DeliveryStageContent extends StageNavContent {
  /** The heading, split at the gap the mark stands in. */
  headingLeft: string;
  headingRight: string;
  /** What arrives, down the bottom left. */
  lines: readonly DeliveryLine[];
  /** The licence note, set right. */
  note: string;
}

export const DeliveryStage = ({
  content,
}: {
  content: DeliveryStageContent;
}) => (
  <StageFrame>
    {/* **Not** painted by the scene, unlike the immersed screen's headings.
        Bloom is a full-screen pass and it is switched on for exactly this
        stretch — the chrome pour — so type painted into the frame here comes out
        glowing. Nothing on this screen has to sit behind the model, so it stays
        in the DOM and reveals from the layer's own `--stage-reveal`. */}
    <StageReveal
      tag="h2"
      unit="letter"
      className="absolute left-[2.0833vw] top-[2.0833vw] whitespace-nowrap font-display text-[max(46px,8.6111vw)] font-light leading-[0.9] text-stage-immersed-ink stacked:left-frame-gutter stacked:top-[var(--frame-heading-top)]"
    >
      {content.headingLeft}
    </StageReveal>
    <StageReveal
      tag="p"
      unit="letter"
      className="absolute left-[55.0694vw] top-[2.0833vw] whitespace-nowrap font-display text-[max(46px,8.6111vw)] font-light leading-[0.9] text-stage-immersed-ink stacked:left-[calc(var(--frame-gutter)+16px)] stacked:top-[calc(var(--frame-heading-top)+36px)]"
    >
      {content.headingRight}
    </StageReveal>

    <StageBottom stack underBar>
      {/* The rule is **not** here: the scene draws it, from `stageRule` in the
          scene config. In front of the canvas it ran straight across the model
          and the word; drawn by the background quad it depth-tests against them
          and passes underneath. Same reason as the first screen's. */}

      {/* The design steps these four down and to the right, which is a
          gesture a wide screen has room for and a phone does not — there it is
          a plain list. Their places are handed over as custom properties for
          the same reason the stats' are: an inline `left`/`top` cannot be
          dropped by a class, so it would survive into the column. */}
      <ul className={`contents stacked:block stacked:w-full ${stackChild}`}>
        {content.lines.map((line) => (
          <li
            key={line.label}
            className="absolute left-[var(--x)] top-[var(--y)] w-[13.8889vw] font-sans text-frame-body leading-[1.1] text-stage-immersed-ink stacked:static stacked:w-full"
            style={
              {
                "--x": `${line.left}vw`,
                "--y": `${line.top}vw`,
              } as CSSProperties
            }
          >
            {line.label}
          </li>
        ))}
      </ul>

      <StageReveal
        tag="p"
        className={`absolute right-[2.0833vw] top-[45.1389vw] w-[27.2222vw] text-right font-serif text-frame-lead leading-none text-stage-immersed-ink ${stackChild} stacked:text-left`}
      >
        {content.note}
      </StageReveal>
    </StageBottom>
  </StageFrame>
);
