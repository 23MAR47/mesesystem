// 📖 Docs: obsidian/frontend/components/common.md

/**
 * The coordinate frame every screen over the scene is drawn in.
 *
 * One 1440x800 Figma frame, held in proportion at any width: every child is
 * placed in `vw` — its Figma pixel over 1440, times 100 — so the composition
 * scales with the window's **width**.
 *
 * **Height is anchored, not scaled.** The frame used to be a `55.5556vw` box
 * centred in the stage, which meant a taller window pushed the whole design into
 * the middle and opened dead bands above and below it. So the screen is read as
 * two groups instead: what belongs at the top of the design stays pinned to the
 * top of the screen, and what belongs at the bottom stays pinned to the bottom.
 * At the design's own 800/1440 aspect the two coincide exactly and nothing has
 * moved; taller than that, the gap opens where the design has its space anyway
 * — the middle, where the subject stands.
 *
 * `StageFrame` is the top-anchored one: children measure from the top of the
 * screen. `StageBottom` is a box of the design's own height with its **bottom**
 * on the screen's bottom — children keep the `top-[…vw]` the design gives them
 * and come out the same distance from the bottom edge as they are in Figma.
 *
 * **All the screens share this frame, and that is the point.** It is what keeps
 * them in register with each other as well as with the design.
 *
 * It deliberately does **not** use the app's adaptive rem grid, which re-bases
 * the root font-size per breakpoint — right for a layout redrawn at each width,
 * wrong for one drawn once at 1440, where below 1024 it inflates against its own
 * design width and the headings clip at both edges. ADR-0072.
 *
 * `pointer-events-none`, always: the canvas underneath needs the pointer for the
 * scene's own mark. Anything clickable takes it back for itself.
 */

import type { ReactNode } from "react";

export const StageFrame = ({ children }: { children: ReactNode }) => (
  <div className="pointer-events-none absolute inset-0">{children}</div>
);

/**
 * The design's own height, hung from the bottom of the screen.
 *
 * `stack` is the phone. The design lays its bottom group out **across** the
 * screen — two, three, four things side by side in a band — which is a shape
 * only a landscape window has. Below `md` the box gives up its design height and
 * becomes a column in normal flow, padded by the frame's own gutter and holding
 * back enough room at the foot for the floating bar.
 *
 * It is opt-in rather than automatic because the children have to agree: each
 * one drops its `absolute` and its `vw` width at the same breakpoint, or it
 * stays pinned where the column no longer is. A stage that has not been through
 * that pass must not silently get a column.
 */
export const StageBottom = ({
  children,
  stack = false,
  underBar = false,
  className,
}: {
  children: ReactNode;
  stack?: boolean;
  /**
   * Hold back room at the foot for the floating bar.
   *
   * Only the screens the bar actually crosses — it is hidden over the first
   * screen and over the last, and reserving space for something that is not
   * there leaves a dead band under the copy.
   */
  underBar?: boolean;
  /** For a stage whose bottom group is nested inside something else. */
  className?: string;
}) => (
  <div
    className={[
      // **Each fragment is a plain string literal, and none of them ends
      // against a `${'$'}{`.** Tailwind finds the classes it must generate by
      // scanning this file as text, and a candidate written
      // `h-[55.5556vw]${'$'}{...}` inside a template is not one it recognises — so
      // the rule is simply never emitted, the box collapses to nothing, and the
      // whole bottom group of every screen falls below the fold. Nothing warns:
      // the class is on the element and the stylesheet has no rule for it.
      "absolute inset-x-0 bottom-0 h-[55.5556vw]",
      stack &&
        "stacked:flex stacked:h-auto stacked:flex-col stacked:items-start stacked:gap-6 stacked:p-frame-gutter",
      stack &&
        underBar &&
        "stacked:pb-[calc(var(--frame-navbar)+var(--frame-gutter)*2)]",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
  >
    {children}
  </div>
);

/**
 * What a child of a stacked `StageBottom` drops when the column takes over.
 *
 * One string, shared, because the moment two stages spell this out differently
 * is the moment one of them keeps a `vw` width inside a column that has none.
 */
export const stackChild =
  "stacked:static stacked:w-full stacked:whitespace-normal";
