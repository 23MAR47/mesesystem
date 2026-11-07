"use client";

import { easings } from "@react-spring/web";

import { Inview } from "@/components/animation/springs/in-view";
import type { HeroSectionContent } from "@/data/mocks/negentropy";

import { HeadlineLines } from "./headline-lines";
import { ScrollFade } from "./scroll-fade";

interface HeroProps {
  id: string;
  content: HeroSectionContent;
  nextHref: string;
}

/**
 * Section §I "The Void" — the corner-loaded hero. Headline anchored
 * bottom-left, meta + body + CTA bottom-right, scroll arrow
 * bottom-center. Brand mark + nav-jumplinks live above as fixed
 * chrome.
 *
 * The whole bottom cluster is wrapped in `<ScrollFade>` so the
 * headline smoothly fades out as it scrolls into the top chrome
 * zone — matches the behaviour applied to every `Section` below.
 *
 * The CTA points at the Blueprint outbound URL (mock field
 * `content.cta.href`) rather than the in-page anchor. `nextHref` is
 * still used by the small `↓` scroll cue.
 */
export const Hero = ({ id, content, nextHref }: HeroProps) => {
  return (
    <section
      id={id}
      className="relative z-20 flex min-h-screen w-full flex-col justify-end px-8 pb-8 pt-24 sm:px-16 sm:pb-16 sm:pt-32 md:pb-20 md:pt-40"
    >
      <ScrollFade className="grid w-full grid-cols-1 items-end gap-12 md:grid-cols-12 md:gap-6">
        <div className="flex flex-col gap-6 md:col-span-7">
          <HeadlineLines
            lines={content.headlineLines}
            italicWord={content.italicWord}
            className="max-w-[14ch] text-[clamp(2.75rem,7.4vw,7.5rem)] font-medium uppercase leading-[0.95] tracking-[-0.02em] text-negentropy-bone"
          />
          <Inview
            tag="div"
            mode="once"
            from={{ opacity: 0, y: 8 }}
            to={{ opacity: 1, y: 0 }}
            delayIn={1700}
            config={{ duration: 700, easing: easings.easeOutQuart }}
            className="flex items-center gap-3 whitespace-nowrap text-sm uppercase tracking-[0.32em] text-negentropy-bone-muted max-sm:text-[0.625rem] max-sm:tracking-[0.18em]"
          >
            <span className="h-px w-6 bg-negentropy-bone/30" />
            <span>[ ENTROPY × 1%/YR ]</span>
          </Inview>
        </div>

        <Inview
          tag="div"
          mode="once"
          from={{ opacity: 0, y: 12 }}
          to={{ opacity: 1, y: 0 }}
          delayIn={1600}
          config={{ duration: 700, easing: easings.easeOutQuart }}
          className="hidden flex-col items-center gap-3 md:col-span-2 md:flex"
        >
          <span className="block h-12 w-px bg-gradient-to-b from-transparent to-negentropy-bone/50" />
          <a
            href={nextHref}
            aria-label="Scroll to next section"
            className="text-base text-negentropy-bone/60 transition-colors hover:text-negentropy-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-negentropy-amber"
          >
            ↓
          </a>
        </Inview>

        <div className="flex flex-col items-start gap-5 md:col-span-3 md:items-end md:text-right">
          <Inview
            tag="div"
            mode="once"
            from={{ opacity: 0, y: 12 }}
            to={{ opacity: 1, y: 0 }}
            delayIn={1100}
            config={{ duration: 700, easing: easings.easeOutQuart }}
            className="flex items-center gap-3 whitespace-nowrap text-sm uppercase tracking-[0.32em] text-negentropy-bone-muted max-sm:text-[0.625rem] max-sm:tracking-[0.18em]"
          >
            <span className="text-negentropy-bone">( {content.index} )</span>
            <span className="h-px w-6 bg-negentropy-bone/30" />
            <span>{content.meta}</span>
          </Inview>

          <Inview
            tag="p"
            mode="once"
            from={{ opacity: 0, y: 12 }}
            to={{ opacity: 1, y: 0 }}
            delayIn={1300}
            config={{ duration: 800, easing: easings.easeOutQuart }}
            className="max-w-[36ch] text-base leading-[1.55] text-negentropy-bone-muted md:text-right"
          >
            {content.body}
          </Inview>

          <Inview
            tag="div"
            mode="once"
            from={{ opacity: 0, y: 12 }}
            to={{ opacity: 1, y: 0 }}
            delayIn={1500}
            config={{ duration: 700, easing: easings.easeOutQuart }}
          >
            <a
              href={content.cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 whitespace-nowrap rounded-full border border-negentropy-bone/30 px-6 py-3 text-sm uppercase tracking-[0.28em] text-negentropy-bone transition-colors hover:border-negentropy-amber hover:text-negentropy-amber focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-negentropy-amber max-sm:border-negentropy-amber max-sm:bg-negentropy-amber max-sm:px-5 max-sm:text-xs max-sm:tracking-[0.16em] max-sm:text-negentropy-void"
            >
              <span>{content.cta.label}</span>
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </a>
          </Inview>
        </div>
      </ScrollFade>
    </section>
  );
};
