"use client";

import TextEngine from "spring-text-engine";

import { springWeight, springWeightSoft } from "@/lib/springs/config";
import type { Tags } from "@/types/springs";

export type RevealFrom = "up" | "left" | "right";

export interface LineRevealProps {
  children: React.ReactNode;
  tag?: Tags;
  className?: string;
  /** Edge the line slides in from, behind its own clip. */
  from?: RevealFrom;
  /** Gap between lines when the block has more than one. */
  stagger?: number;
  delay?: number;
  /** Small type uses the lighter spring so it doesn't feel sluggish. */
  weight?: "full" | "soft";
  /**
   * Word gap in em. TextEngine replaces real spaces with this, and its 0.3em
   * default is wider than either of our faces — Instrument Serif's own space is
   * 0.17em, Bebas Neue's is 0.24em. Pass the face's value or the line grows.
   */
  columnGap?: number;
  /**
   * Classes for the clip layer. Use it when the design needs leading below the
   * 1.1 floor `overflow` requires: give the clip box room and pull the layout
   * back, e.g. `py-[0.12em] -my-[0.12em]`.
   */
  wrapLineClassName?: string;
  /**
   * Clip the line while it travels. Turn it off where the design needs leading
   * below the 1.1 floor `overflow` demands — the clip box comes from
   * line-height, and padding it out changes the block's measured height.
   */
  clip?: boolean;
}

/**
 * `y` takes percentages (that is the engine's clipped-line idiom), but the `x`
 * shorthand does not interpolate them — a percentage there leaves the spring
 * dead and the line stuck at `opacity: 0`. Horizontal reveals therefore travel
 * in pixels.
 */
const OUT: Record<RevealFrom, Record<string, string | number>> = {
  up: { y: "110%", opacity: 1 },
  left: { x: -160, opacity: 0 },
  right: { x: 160, opacity: 0 },
};

const IN: Record<RevealFrom, Record<string, string | number>> = {
  up: { y: "0%", opacity: 1 },
  left: { x: 0, opacity: 1 },
  right: { x: 0, opacity: 1 },
};

/** Unclipped fallback — pixel offsets, so no line-height floor applies. */
const OUT_SOFT: Record<RevealFrom, Record<string, number>> = {
  up: { y: 18, opacity: 0 },
  left: { x: -48, opacity: 0 },
  right: { x: 48, opacity: 0 },
};

const IN_SOFT: Record<RevealFrom, Record<string, number>> = {
  up: { y: 0, opacity: 1 },
  left: { x: 0, opacity: 1 },
  right: { x: 0, opacity: 1 },
};

/**
 * Line reveal from behind a clip — the page's default entrance.
 *
 * `up` is variant B4 (captions, prices, meta); `left` / `right` are variant H2,
 * where the two hero lines arrive from opposite edges and meet. Everything runs
 * on `springWeight`, so the motion law is shared with the plates and the band.
 *
 * `leading-display` is mandatory alongside `overflow` — the clip box comes from
 * line-height, and anything tighter shaves glyphs.
 */
export const LineReveal = ({
  children,
  tag = "p",
  className = "",
  from = "up",
  stagger = 90,
  delay = 0,
  weight = "full",
  columnGap = 0.17,
  wrapLineClassName,
  clip = true,
}: LineRevealProps) => {
  return (
    <TextEngine
      tag={tag}
      mode="once"
      className={className}
      lineIn={clip ? IN[from] : IN_SOFT[from]}
      lineOut={clip ? OUT[from] : OUT_SOFT[from]}
      lineStagger={stagger}
      lineConfig={weight === "full" ? springWeight : springWeightSoft}
      delayIn={delay}
      columnGap={columnGap}
      wrapLineClassName={wrapLineClassName}
      overflow={clip}
    >
      {children}
    </TextEngine>
  );
};
