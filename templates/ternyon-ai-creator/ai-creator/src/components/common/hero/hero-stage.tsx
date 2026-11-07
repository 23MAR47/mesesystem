// 📖 Docs: obsidian/frontend/components/common.md

/**
 * The first screen's typography — two layers around the 3D stage.
 *
 * It is **not a section of its own.** The first screen is the scene's pinned
 * stage; this is the design laid over and under it, so the reader gets one
 * screen with the live model in it rather than a title card followed by a
 * second copy of the same subject.
 *
 * The split is the design: the name goes **behind** the canvas and the copy in
 * front of it, because the model has to cover the middle of the word. That only
 * works because the scene's white stage paints nothing — see
 * `patchBackgroundMaterial` — so the page's ground and the title show through
 * the canvas, and the model itself is the only thing that hides them.
 *
 * **Every length is a Figma pixel over 1440, in `vw`.** The design is one
 * 1440x800 frame asked to hold its proportions at any width, so it is measured
 * against the viewport itself: `302.279px / 1440 * 100` is `20.9916vw`, and the
 * name spans the screen at every size without a media query.
 *
 * It deliberately does **not** use the app's adaptive rem grid, which re-bases
 * the root font-size per breakpoint — right for a layout redrawn at each width,
 * wrong for one drawn once at 1440, where below 1024 it inflates the
 * composition against its own design width and the name clips at both edges.
 *
 * The frame is `55.5556vw` tall — the design's 800/1440 — and centred in the
 * pinned stage, so the whole composition fits one screen at any window shape.
 * Both layers use the same frame, which is what keeps them in register.
 */

import { sceneConfig } from "@/lib/scene/scene.config";

import { StageBottom, StageFrame, stackChild } from "./stage-frame";
import { StageReveal } from "./stage-reveal";
import { stageRise } from "./stage-rise";

/** Where each block of the copy takes its start on the reveal — the stagger,
 *  in reading order: the claim, the summary, the small print, the actions. */
const [claimAt, summaryAt, notesAt, actionsAt] =
  sceneConfig.arrival.copyStagger;

export interface HeroStageContent {
  /** The name, set across the full width of the stage. */
  name: string;
  /** The claim, bottom left. */
  claim: string;
  /** The paragraph in the opposite corner. */
  summary: string;
  /** Two pieces of small print along the bottom left. */
  notes: readonly [string, string];
  /** The primary call to action. */
  action: { label: string; href: string };
  /** The quieter link beside it. */
  aside: { label: string; href: string };
}

/**
 * Behind the canvas: the name the model stands in front of.
 *
 * **The rule is not here, and not in the DOM at all** — the scene draws it, from
 * `stageRule` in the scene config. It has to: it belongs behind the model, and
 * both of the other things on this screen are opaque canvas pixels that would
 * wipe a DOM layer behind them — the pointer's mark as it passes, and the
 * model's own dissolve over the whole width of its footprint. Drawn by the
 * stage, the model's dissolve mixes towards a ground that *contains* the line,
 * which is what a transparent model over it would look like.
 */
export const HeroStageTitle = ({ name }: Pick<HeroStageContent, "name">) => (
  <StageFrame>
    {/* `data-scene-ink`: laid out and rasterised by the browser, then painted
        by the scene from this element's own box, font and colour — so it sits
        above the pointer's mark and below the model. See `inkFunction`. */}
    <h1
      data-scene-ink
      className="absolute left-1/2 top-[1.3889vw] -translate-x-1/2 whitespace-nowrap font-display text-[20.9916vw] font-light leading-none text-stage-ink"
    >
      {name}
    </h1>
  </StageFrame>
);

/**
 * Over the canvas: everything hanging from the rule — the rule itself is
 * behind the model, with the name.
 *
 * Each block rises in on its own beat of the layer's reveal (`stageRise`), in
 * reading order, after the model has led and while the name resolves. The
 * styles go on the blocks themselves rather than on a wrapper: they are
 * positioned absolutely in the frame, and the rows that hold them are
 * `contents`, which can carry no transform.
 */
export const HeroStageCopy = ({
  content,
}: {
  content: Omit<HeroStageContent, "name">;
}) => (
  <StageFrame>
    <StageBottom stack>
      <StageReveal
        tag="p"
        className={`absolute left-[2.0833vw] top-[43.6111vw] w-[27.2222vw] font-serif text-frame-lead leading-none text-stage-ink ${stackChild}`}
        style={stageRise(claimAt)}
      >
        {content.claim}
      </StageReveal>

      <p
        className={`absolute left-[70.6944vw] top-[43.6111vw] w-[27.2222vw] font-sans text-frame-body leading-[1.1] text-stage-ink ${stackChild}`}
        style={stageRise(summaryAt)}
      >
        {content.summary}
      </p>

      {/* The two notes are a **row** on the phone as well — they are one line
          of small print in the design and reading them as two paragraphs would
          give them more weight than they have. The column holds them together
          in a box of their own. */}
      <div
        className={`contents stacked:flex stacked:w-full stacked:flex-wrap stacked:gap-x-6 stacked:gap-y-1 ${stackChild}`}
      >
        <p
          className={`absolute left-[2.0833vw] top-[52.0833vw] whitespace-nowrap font-sans text-frame-body leading-[1.1] text-stage-ink stacked:static stacked:w-auto`}
          style={stageRise(notesAt)}
        >
          {content.notes[0]}
        </p>
        <p
          className={`absolute left-[22.5vw] top-[52.0833vw] whitespace-nowrap font-sans text-frame-body leading-[1.1] text-stage-ink stacked:static stacked:w-auto`}
          style={stageRise(notesAt)}
        >
          {content.notes[1]}
        </p>
      </div>

      {/* The two actions are **one row** on a phone, and the row carries
          `data-stage-rule`: the scene's horizontal line is drawn above it.

          The line's row is a fixed distance up from the bottom edge in the
          design — which is right where the design's bottom group is a band of
          that height, and wrong once the group is a column whose height is the
          copy's own. So down here the scene measures this element instead of
          computing a ratio. See `placeStageRule`. */}
      <div
        data-stage-rule
        className="contents stacked:flex stacked:w-full stacked:items-center stacked:gap-5 stacked:pt-2"
      >
        {/* The frame is `pointer-events-none` so the canvas keeps the pointer —
          the scene's mark is drawn by hovering the model. Only what is actually
          clickable takes it back. */}
        {/* The hover is a colour, not an opacity: the rise owns this
            element's opacity, and an inline value would have silenced the
            hover class outright. Same 90% of the accent, over the ground. */}
        <a
          href={content.action.href}
          className="pointer-events-auto absolute left-[70.6944vw] top-[50vw] flex h-frame-control w-[16.0417vw] items-center justify-center rounded-full bg-stage-accent font-serif text-frame-nav leading-none text-stage-accent-foreground transition-colors duration-[var(--duration-fast)] ease-entrance hover:bg-stage-accent/90 stacked:static stacked:w-auto stacked:flex-1 stacked:px-6"
          style={stageRise(actionsAt)}
        >
          {content.action.label}
        </a>

        <div
          className="absolute right-[2.0833vw] top-[51.1111vw] flex items-center stacked:static stacked:shrink-0"
          style={stageRise(actionsAt)}
        >
          <a
            href={content.aside.href}
            className="pointer-events-auto font-serif text-frame-nav leading-none text-stage-accent underline decoration-solid underline-offset-2"
          >
            {content.aside.label}
          </a>
        </div>
      </div>
    </StageBottom>
  </StageFrame>
);
