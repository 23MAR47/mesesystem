"use client";

import { easings } from "@react-spring/web";
import { ReactNode } from "react";
import TextEngine from "spring-text-engine";

import { Inview } from "@/components/animation/springs/in-view";
import type { Tags } from "@/types/springs";

import { ScrollFade } from "./scroll-fade";

interface SectionProps {
  id: string;
  /** Roman numeral rendered inside round brackets — e.g. `II`. */
  index: string;
  /** Meta line for the bracketed eyebrow — e.g. `SEC.002 — ENTROPY`. */
  meta: string;
  heading: string;
  body: string;
  headingTag?: Extract<Tags, "h1" | "h2">;
  /**
   * When true (and `centered` is false), swap the headline and meta
   * cluster across the grid so the title sits on the right and the
   * meta cluster on the left.
   */
  flip?: boolean;
  /**
   * Centred manifesto layout — everything stacks vertically in the
   * middle of the viewport. Used on §VI.
   */
  centered?: boolean;
  /** Slot rendered under the heading. */
  children?: ReactNode;
}

const eyebrowSpringConfig = {
  duration: 700,
  easing: easings.easeOutQuart,
};

const bodySpringConfig = {
  duration: 700,
  easing: easings.easeOutQuart,
};

const headingSpringConfig = {
  duration: 620,
  easing: easings.easeOutQuart,
};

/**
 * Corner-loaded section shell for §II–§VI. Mirrors the §I `Hero` grid
 * vocabulary; reveals are right→left X-slide (per-letter on heading,
 * per-word on body, block on eyebrow / slot). All content is wrapped
 * in `<ScrollFade>` so it smoothly fades out as it scrolls into the
 * top chrome zone and fades back in as it re-enters from below.
 *
 * Grid layout (default, non-centred):
 *   - Outer grid uses `md:items-stretch`, so both columns inherit the
 *     row height set by the tallest content.
 *   - **Heading column** uses `md:justify-end` — heading sits at the
 *     bottom of its column (= section bottom, the corner-loaded
 *     anchor).
 *   - **Meta column** uses `md:justify-start` — eyebrow + body start
 *     at the **top of the row**, which equals the **top of the
 *     heading**. So the smaller right-column content always begins
 *     on the same line as the title's first row.
 *
 * `flip` swaps columns; `centered` overrides the grid entirely.
 */
export const Section = ({
  id,
  index,
  meta,
  heading,
  body,
  headingTag = "h2",
  flip = false,
  centered = false,
  children,
}: SectionProps) => {
  if (centered) {
    return (
      <section
        id={id}
        className="relative z-20 flex min-h-screen w-full flex-col items-center justify-center gap-6 px-8 py-24 text-center sm:px-16 sm:py-32"
      >
        <ScrollFade className="flex w-full flex-col items-center gap-6 text-center">
          <Inview
            tag="div"
            mode="once"
            from={{ opacity: 0, x: 12 }}
            to={{ opacity: 1, x: 0 }}
            delayIn={100}
            config={eyebrowSpringConfig}
            className="flex items-center gap-3 whitespace-nowrap text-sm uppercase tracking-[0.32em] text-negentropy-bone-muted max-sm:text-[0.625rem] max-sm:tracking-[0.18em]"
          >
            <span className="text-negentropy-bone">( {index} )</span>
            <span className="h-px w-6 bg-negentropy-bone/30" />
            <span>{meta}</span>
          </Inview>

          {/* Heading wrapper: `w-fit` shrinks the box to the heading's
              own content width and `whitespace-nowrap` keeps it on a
              single line — `max-w` was occasionally tight enough that
              TextEngine's letter-span layout wrapped "Begin today."
              onto two rows. `mx-auto` centres the (now content-sized)
              box. */}
          <div className="mx-auto w-fit whitespace-nowrap">
            <TextEngine
              tag={headingTag}
              mode="once"
              letterIn={{ x: 0, opacity: 1 }}
              letterOut={{ x: 16, opacity: 0 }}
              letterStagger={22}
              letterDelayIn={200}
              letterConfig={headingSpringConfig}
              className="text-center text-[clamp(2.25rem,5.6vw,5.25rem)] font-medium leading-[1.02] tracking-[-0.02em] text-negentropy-bone"
            >
              {heading}
            </TextEngine>
          </div>

          <div className="mx-auto w-full max-w-[44ch] text-center">
            <TextEngine
              tag="p"
              mode="once"
              wordIn={{ x: 0, opacity: 1 }}
              wordOut={{ x: 14, opacity: 0 }}
              wordStagger={45}
              wordDelayIn={500}
              wordConfig={bodySpringConfig}
              className="flex flex-wrap justify-center text-center text-base leading-[1.55] text-negentropy-bone-muted"
            >
              {body}
            </TextEngine>
          </div>

          {children}
        </ScrollFade>
      </section>
    );
  }

  // `md:self-end` / `md:self-start` use **grid align-self** to anchor
  // each column to its row's bottom / top (instead of `flex
  // justify-end / justify-start` on the inner flex, which was being
  // overridden by the grid's default `align-items: stretch` and
  // collapsing the columns to the same height — leaving the meta
  // cluster floating at the row bottom). Row height = the heading
  // column's content height; the meta column sits at the top of that
  // row so its first line lands on the heading's first line.
  const headingColumnClass = flip
    ? "md:col-span-7 md:col-start-6 md:items-end md:text-right md:self-end"
    : "md:col-span-7 md:col-start-1 md:items-start md:text-left md:self-end";

  const metaColumnClass = flip
    ? "md:col-span-4 md:col-start-1 md:items-start md:text-left md:self-start"
    : "md:col-span-4 md:col-start-9 md:items-end md:text-right md:self-start";

  const headingTextAlignClass = flip ? "md:text-right" : "md:text-left";

  return (
    <section
      id={id}
      className="relative z-20 flex min-h-screen w-full flex-col justify-end px-8 pb-8 pt-24 sm:px-16 sm:pb-16 sm:pt-32 md:pb-20 md:pt-40"
    >
      <ScrollFade className="grid w-full grid-cols-1 gap-12 md:grid-cols-12 md:gap-6">
        <div className={`flex flex-col gap-6 ${headingColumnClass}`}>
          <TextEngine
            tag={headingTag}
            mode="once"
            letterIn={{ x: 0, opacity: 1 }}
            letterOut={{ x: 16, opacity: 0 }}
            letterStagger={22}
            letterDelayIn={200}
            letterConfig={headingSpringConfig}
            className={`max-w-[20ch] text-[clamp(2.25rem,5.6vw,5.25rem)] font-medium leading-[1.02] tracking-[-0.02em] text-negentropy-bone ${headingTextAlignClass}`}
          >
            {heading}
          </TextEngine>

          {children}
        </div>

        <div className={`flex flex-col gap-5 ${metaColumnClass}`}>
          <Inview
            tag="div"
            mode="once"
            from={{ opacity: 0, x: 12 }}
            to={{ opacity: 1, x: 0 }}
            delayIn={100}
            config={eyebrowSpringConfig}
            className="flex items-center gap-3 whitespace-nowrap text-sm uppercase tracking-[0.32em] text-negentropy-bone-muted max-sm:text-[0.625rem] max-sm:tracking-[0.18em]"
          >
            <span className="text-negentropy-bone">( {index} )</span>
            <span className="h-px w-6 bg-negentropy-bone/30" />
            <span>{meta}</span>
          </Inview>

          <TextEngine
            tag="p"
            mode="once"
            wordIn={{ x: 0, opacity: 1 }}
            wordOut={{ x: 14, opacity: 0 }}
            wordStagger={45}
            wordDelayIn={500}
            wordConfig={bodySpringConfig}
            className="max-w-[36ch] text-base leading-[1.55] text-negentropy-bone-muted"
          >
            {body}
          </TextEngine>
        </div>
      </ScrollFade>
    </section>
  );
};
