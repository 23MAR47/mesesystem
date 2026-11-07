"use client";

import { animated } from "@react-spring/web";

import { Spring } from "@/components/animation/springs/spring";
import { AnimatedHeading } from "@/components/animation/animated-heading";
import { AnimatedText } from "@/components/animation/animated-text";
import { ContactForm } from "@/views/home/sections/contact-form";
import { HeroIcon } from "@/views/home/sections/hero-icon";
import { useSections } from "@/hooks/sections/use-sections";
import { useSceneFade } from "@/hooks/sections/use-scene-fade";
import { useHeroLayout } from "@/hooks/use-hero-scale";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { screens } from "@/lib/scene/screens";
import { easeReveal } from "@/utils/animation/easing";
import type { HeroContent } from "@/data/mocks/home";

/**
 * Hero — the Ternyon redesign (Figma node 665:1694).
 *
 * Desktop is a single fixed 1440×800 composition rendered at literal design
 * pixels and scaled as one unit by `useHeroLayout`, so the mockup's proportions
 * hold at every wide viewport. Below `hero-md` it reflows (`useIsMobile`) into a
 * centred vertical stack — the same four pieces (masthead, twin-triangle mark,
 * subtitle, contact form) sized for a phone rather than shrunk to nothing.
 *
 * Both layouts fade in on the preloader's `isLoaded` via staggered `<Spring>`s
 * and drift out on `useSceneFade`; the live vortex shows through behind them. The
 * fixed nav is a separate component (`HeroNav`).
 */

/** Matches the preloader's pause before unhiding the hero. */
const REVEAL_BASE_DELAY = 150;
const REVEAL = { duration: 1400, easing: easeReveal } as const;

const delay = (ms: number) => REVEAL_BASE_DELAY + ms;

export interface HeroProps {
  content: HeroContent;
}

export const Hero = ({ content }: HeroProps) => {
  const isMobile = useIsMobile();
  return isMobile ? (
    <HeroMobile content={content} />
  ) : (
    <HeroDesktop content={content} />
  );
};

/* ------------------------------------------------------------------ desktop */

const HeroDesktop = ({ content }: HeroProps) => {
  const isLoaded = useSections((state) => state.isLoaded);
  const active = useSections((state) => state.active);
  const fade = useSceneFade(screens.HERO);
  const { scale } = useHeroLayout();

  return (
    <section
      id="hero"
      aria-label={`${content.titleTop} ${content.titleBottom}`}
      className="relative h-svh w-full"
    >
      {/* Pinned to the viewport: the composition fades in place as the slide
          leaves. `pointer-events` follow the active slide. */}
      <animated.div
        style={{
          opacity: fade.opacity,
          pointerEvents: active === screens.HERO ? "auto" : "none",
        }}
        className="fixed inset-0 overflow-hidden"
      >
        {/* The 1440×800 design frame, centred and uniformly scaled. */}
        <div
          className="absolute top-1/2 left-1/2 h-[800px] w-[1440px]"
          style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
        >
          {/* Masthead — one h1, two lines, per-letter cascade from the bright ends. */}
          <AnimatedHeading
            tag="h1"
            enabled={isLoaded}
            baseDelay={delay(150)}
            className="absolute top-[100px] left-[389px] m-0 w-[663px] text-center font-mulish text-[56px] leading-none font-light"
            lines={[
              { text: content.titleTop, opaque: "left" },
              { text: content.titleBottom, opaque: "right" },
            ]}
          />

          {/* Twin-triangle mark, ringed by a hairline white circle, over a soft
              black disc that lifts it off the bright particle field. */}
          <Spring
            tag="div"
            enabled={isLoaded}
            from={{ opacity: 0, scale: 0.82, filter: "blur(10px)" }}
            to={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            delayIn={delay(300)}
            config={REVEAL}
            className="absolute top-[360px] left-[658.46px] h-[124.97px] w-[123.86px]"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 size-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60 blur-2xl"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 size-[285px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:var(--hero-glass-border)]"
            />
            <HeroIcon className="relative size-full" />
          </Spring>

          {/* Subtitle — word-by-word fly-up. */}
          <AnimatedText
            enabled={isLoaded}
            delayIn={delay(500)}
            className="absolute top-[633px] left-[518px] m-0 w-[405px] font-mulish text-[16px] leading-[1.2] font-normal text-white"
          >
            {content.subtitle}
          </AnimatedText>

          {/* Frosted contact-form pill. */}
          <Spring
            tag="div"
            enabled={isLoaded}
            from={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            delayIn={delay(650)}
            config={REVEAL}
            className="absolute top-[703px] left-[409px] w-[623px]"
          >
            <ContactForm form={content.form} layout="row" />
          </Spring>
        </div>
      </animated.div>
    </section>
  );
};

/* ------------------------------------------------------------------- mobile */

const HeroMobile = ({ content }: HeroProps) => {
  const isLoaded = useSections((state) => state.isLoaded);
  const active = useSections((state) => state.active);
  const fade = useSceneFade(screens.HERO);

  return (
    <section
      id="hero"
      aria-label={`${content.titleTop} ${content.titleBottom}`}
      className="relative h-svh w-full"
    >
      <animated.div
        style={{
          opacity: fade.opacity,
          pointerEvents: active === screens.HERO ? "auto" : "none",
        }}
        className="fixed inset-0 overflow-hidden"
      >
        <div className="flex h-full w-full flex-col items-center justify-center gap-[22px] px-[20px] pt-[92px] pb-[28px]">
          <AnimatedHeading
            tag="h1"
            enabled={isLoaded}
            baseDelay={delay(150)}
            stagger={34}
            className="m-0 w-full text-center font-mulish text-[clamp(24px,6.4vw,44px)] leading-[1.06] font-light"
            lines={[
              { text: content.titleTop, opaque: "left" },
              { text: content.titleBottom, opaque: "right" },
            ]}
          />

          <Spring
            tag="div"
            enabled={isLoaded}
            from={{ opacity: 0, scale: 0.82, filter: "blur(10px)" }}
            to={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            delayIn={delay(300)}
            config={REVEAL}
            className="relative my-[6px] size-[92px]"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 size-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60 blur-xl"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 size-[188px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:var(--hero-glass-border)]"
            />
            <HeroIcon className="relative size-full" />
          </Spring>

          <AnimatedText
            enabled={isLoaded}
            delayIn={delay(500)}
            className="m-0 max-w-[400px] font-mulish text-[15px] leading-[1.35] font-normal text-white"
          >
            {content.subtitle}
          </AnimatedText>

          <Spring
            tag="div"
            enabled={isLoaded}
            from={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            delayIn={delay(650)}
            config={REVEAL}
            className="w-full max-w-[420px]"
          >
            <ContactForm form={content.form} layout="stack" />
          </Spring>
        </div>
      </animated.div>
    </section>
  );
};
