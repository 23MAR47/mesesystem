"use client";

import { useState } from "react";
import Image from "next/image";
import { animated, useSpring } from "@react-spring/web";

import { Spring } from "@/components/animation/springs/spring";
import { Hover } from "@/components/animation/springs/hover";
import { useSections } from "@/hooks/sections/use-sections";
import { useHeroLayout } from "@/hooks/use-hero-scale";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { scrollToSection } from "@/utils/scroll-to-section";
import { screens } from "@/lib/scene/screens";
import { easeReveal } from "@/utils/animation/easing";
import type { HeroNavContent } from "@/data/mocks/home";

/**
 * Fixed top navigation for the Ternyon hero redesign (Figma node 666:1817).
 *
 * Two layouts share one component:
 *  - **Desktop** (`≥ hero-md`): three frosted pills — logo, link row, gradient
 *    CTA — laid out at their literal design pixels and scaled as one by the
 *    shared `useHeroLayout` factor, so the bar keeps the mockup's proportions.
 *    Each pill gets a spring hover (`<Hover>`, auto-off on touch).
 *  - **Mobile** (`< hero-md`): the pills don't scale down to nothing — the bar
 *    reflows to a logo + a burger that opens a frosted sheet of stacked links
 *    and the CTA.
 *
 * The scaling wrapper and the fixed/centring wrapper are separate elements: a
 * transform on the scaling node would otherwise become the containing block for
 * the fixed one and break the pin.
 */

const NAV_REVEAL = { duration: 1000, easing: easeReveal } as const;
const HOVER = { tension: 320, friction: 22 } as const;

const PILL =
  "rounded-[32px] border border-[color:var(--hero-glass-border)] bg-[var(--hero-glass)] backdrop-blur-[8px]";

export interface HeroNavProps {
  content: HeroNavContent;
}

export const HeroNav = ({ content }: HeroNavProps) => {
  const isMobile = useIsMobile();
  return isMobile ? (
    <HeroNavMobile content={content} />
  ) : (
    <HeroNavDesktop content={content} />
  );
};

/* ------------------------------------------------------------------ desktop */

const HeroNavDesktop = ({ content }: HeroNavProps) => {
  const isLoaded = useSections((state) => state.isLoaded);
  const { scale, navTop } = useHeroLayout();

  return (
    <nav
      aria-label="Primary"
      className="fixed left-1/2 z-[120] -translate-x-1/2"
      style={{ top: navTop }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
        <div className="flex items-center gap-1">
          {/* Logo pill — scrolls back to the top, so a real button. */}
          <Spring
            tag="div"
            enabled={isLoaded}
            from={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            delayIn={120}
            config={NAV_REVEAL}
          >
            <Hover tag="div" from={{ scale: 1 }} to={{ scale: 1.04 }} config={HOVER}>
              <button
                type="button"
                onClick={() => scrollToSection(screens.HERO)}
                aria-label={content.wordmark}
                className={`flex h-[43px] items-center px-[24px] py-[12px] ${PILL}`}
              >
                <Image
                  src="/assets/logo.svg"
                  alt=""
                  width={69}
                  height={19}
                  className="h-[18.972px] w-[69.038px]"
                  priority
                />
              </button>
            </Hover>
          </Spring>

          {/* Link row. */}
          <Spring
            tag="div"
            enabled={isLoaded}
            from={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            delayIn={220}
            config={NAV_REVEAL}
            className={`flex items-center px-[32px] py-[12px] ${PILL}`}
          >
            <ul className="flex items-center gap-[32px] font-mulish text-[16px] leading-[1.2] font-normal text-white">
              {content.links.map((link) => (
                <Hover
                  tag="li"
                  key={link.label}
                  from={{ opacity: 0.68, y: 0 }}
                  to={{ opacity: 1, y: -1 }}
                  config={HOVER}
                >
                  <button
                    type="button"
                    onClick={() => scrollToSection(link.target)}
                    className="whitespace-nowrap"
                  >
                    {link.label}
                  </button>
                </Hover>
              ))}
            </ul>
          </Spring>

          {/* Gradient CTA. */}
          <Spring
            tag="div"
            enabled={isLoaded}
            from={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            delayIn={320}
            config={NAV_REVEAL}
          >
            <Hover tag="div" from={{ scale: 1 }} to={{ scale: 1.04 }} config={HOVER}>
              <button
                type="button"
                onClick={() => scrollToSection(screens.SITEMAP)}
                className="flex items-center gap-[8px] rounded-[50px] px-[28px] py-[12px]"
                style={{ backgroundImage: "var(--gradient-hero-cta)" }}
              >
                <span className="font-mulish text-[16px] leading-[1.2] font-normal whitespace-nowrap text-white">
                  {content.ctaLabel}
                </span>
                <span
                  aria-hidden="true"
                  className="size-[3px] shrink-0 rounded-full bg-white"
                />
              </button>
            </Hover>
          </Spring>
        </div>
      </div>
    </nav>
  );
};

/* ------------------------------------------------------------------- mobile */

const HeroNavMobile = ({ content }: HeroNavProps) => {
  const isLoaded = useSections((state) => state.isLoaded);
  const [open, setOpen] = useState(false);

  /* Burger → X, and the sheet's reveal, both driven by `open`. */
  const t = useSpring({ t: open ? 1 : 0, config: { tension: 320, friction: 26 } });
  const sheet = useSpring({
    opacity: open ? 1 : 0,
    y: open ? 0 : -12,
    config: { tension: 260, friction: 30 },
  });

  const go = (target: string) => {
    setOpen(false);
    scrollToSection(target);
  };

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 top-0 z-[120] px-[16px] pt-[16px]"
    >
      <Spring
        tag="div"
        enabled={isLoaded}
        from={{ opacity: 0, y: -10, filter: "blur(6px)" }}
        to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        delayIn={120}
        config={NAV_REVEAL}
        className="relative flex items-center justify-between"
      >
        {/* Logo pill. */}
        <button
          type="button"
          onClick={() => go(screens.HERO)}
          aria-label={content.wordmark}
          className={`flex h-[44px] items-center px-[20px] ${PILL}`}
        >
          <Image
            src="/assets/logo.svg"
            alt=""
            width={69}
            height={19}
            className="h-[18px] w-[65px]"
            priority
          />
        </button>

        {/* Burger toggle. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className={`relative flex size-[44px] items-center justify-center ${PILL} !rounded-full`}
        >
          <span className="relative block size-[18px]">
            <animated.span
              className="absolute left-0 block h-[1.5px] w-full rounded-full bg-white"
              style={{
                top: 4,
                transformOrigin: "center",
                transform: t.t.to(
                  (v) => `translateY(${v * 4}px) rotate(${v * 45}deg)`,
                ),
              }}
            />
            <animated.span
              className="absolute top-1/2 left-0 block h-[1.5px] w-full -translate-y-1/2 rounded-full bg-white"
              style={{ opacity: t.t.to((v) => 1 - v) }}
            />
            <animated.span
              className="absolute left-0 block h-[1.5px] w-full rounded-full bg-white"
              style={{
                bottom: 4,
                transformOrigin: "center",
                transform: t.t.to(
                  (v) => `translateY(${-v * 4}px) rotate(${-v * 45}deg)`,
                ),
              }}
            />
          </span>
        </button>

        {/* Sheet — stacked links + CTA. */}
        {open && (
          <animated.div
            style={{
              opacity: sheet.opacity,
              transform: sheet.y.to((v) => `translateY(${v}px)`),
            }}
            className={`absolute top-[calc(100%+10px)] right-0 flex w-[220px] flex-col gap-[6px] p-[10px] ${PILL} !rounded-[24px]`}
          >
            {content.links.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => go(link.target)}
                className="rounded-[16px] px-[16px] py-[12px] text-left font-mulish text-[16px] leading-none font-normal text-white active:bg-white/10"
              >
                {link.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => go(screens.SITEMAP)}
              className="mt-[2px] flex items-center justify-center gap-[8px] rounded-[50px] px-[20px] py-[13px]"
              style={{ backgroundImage: "var(--gradient-hero-cta)" }}
            >
              <span className="font-mulish text-[16px] leading-none font-normal whitespace-nowrap text-white">
                {content.ctaLabel}
              </span>
              <span
                aria-hidden="true"
                className="size-[3px] shrink-0 rounded-full bg-white"
              />
            </button>
          </animated.div>
        )}
      </Spring>
    </nav>
  );
};
