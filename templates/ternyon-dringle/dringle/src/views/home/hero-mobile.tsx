import Link from "next/link";

import type { HeroContent } from "@/data/mocks/home";

import { AvatarStack } from "./avatar-stack";
import { HeroMobileNav } from "./hero-mobile-nav";
import { HeroMobilePreloader } from "./hero-mobile-preloader";
import { Hover } from "@/components/animation/springs/hover";

import { HeroModel } from "./hero-model";
import { HeroHeading, HeroOverline, HeroSubheading } from "./hero-text";
import { hoverLift, HOVER, riseIn, scaleIn, SOFT } from "./hero-motion";
import { Reveal } from "./reveal";

interface HeroMobileProps {
  content: HeroContent;
}

/** Mobile hero — stacked: headline block on top, media panel below. Scrolls. */
export const HeroMobile = ({ content }: HeroMobileProps) => {
  const [brands, awards, rating] = content.panel.stats;

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-background text-ink">
      <HeroMobileNav nav={content.nav} />

      {/* Headline block (top). Centred in a max-width column so it reads well on
          wider tablets instead of stretching edge-to-edge. */}
      <section className="mx-auto flex max-w-[42rem] flex-col items-center gap-[1.5rem] px-[1.5rem] pb-[2.5rem] pt-[2.5rem] text-center md:gap-[1.75rem] md:pb-[3rem] md:pt-[3.5rem]">
        <Reveal
          tag="p"
          mode="once"
          from={riseIn.from}
          to={riseIn.to}
          config={SOFT}
          delayIn={220}
          className="flex items-center gap-[0.5rem] rounded-full border border-hairline px-[1.25rem] py-[0.5rem] text-[0.875rem] leading-[1.2] text-ink"
        >
          <span
            className="size-[0.375rem] rounded-full border border-ink/40"
            aria-hidden
          />
          {content.badge}
        </Reveal>

        <HeroHeading
          lines={content.headingLines}
          delayIn={340}
          className="text-center text-[clamp(1.5rem,5vw,2rem)] leading-[1.08] text-ink"
        />

        <HeroSubheading
          text={content.subheading}
          delayIn={660}
          className="max-w-[22rem] justify-center text-center text-[0.9375rem] leading-[1.4] text-ink"
        />

        <Reveal
          tag="div"
          mode="once"
          from={riseIn.from}
          to={riseIn.to}
          config={SOFT}
          delayIn={780}
          className="mt-[0.5rem]"
        >
          <Hover
            tag="div"
            from={hoverLift.from}
            to={hoverLift.to}
            config={HOVER}
            className="inline-flex"
          >
            <Link
              href={content.cta.href}
              className="flex items-center gap-[0.875rem] rounded-full bg-[image:var(--gradient-cta)] py-[0.125rem] pl-[0.125rem] pr-[1.75rem] text-[1rem] leading-[1.2] text-white"
            >
              <span className="flex size-[2.75rem] items-center justify-center rounded-full bg-white text-ink">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-[1.375rem]"
                  aria-hidden
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </span>
              {content.cta.label}
            </Link>
          </Hover>
        </Reveal>

        <Reveal
          tag="div"
          mode="once"
          from={riseIn.from}
          to={riseIn.to}
          config={SOFT}
          delayIn={840}
          className="flex h-[3rem] items-center gap-[0.75rem] rounded-full border border-hairline pl-[1.25rem] pr-[0.5rem]"
        >
          <p className="whitespace-nowrap text-[0.875rem] leading-[1.2] text-ink">
            {content.socialProof.label}
          </p>
          <AvatarStack avatars={content.socialProof.avatars} delayIn={980} />
        </Reveal>
      </section>

      {/* Media panel (bottom) */}
      <Reveal
        tag="section"
        mode="once"
        from={scaleIn.from}
        to={scaleIn.to}
        config={SOFT}
        delayIn={140}
        aria-label="Studio in numbers"
        className="relative mx-[0.75rem] mb-[0.75rem] aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-panel sm:mx-auto sm:mb-[1rem] sm:max-w-[34rem]"
      >
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src={content.panel.videoSrc}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        >
          <track kind="captions" />
        </video>

        <HeroModel className="pointer-events-none absolute inset-0 z-10" />

        <HeroOverline
          text={content.panel.overline}
          delayIn={540}
          className="absolute left-[1.25rem] top-[1.25rem] z-20 w-[65%] text-[0.8125rem] uppercase leading-[1.2] text-white"
        />

        <div className="absolute inset-x-[0.75rem] bottom-[0.75rem] z-20 flex gap-[0.5rem]">
          {[brands, awards, rating].map((stat, index) => (
            <Reveal
              key={stat.value}
              tag="div"
              mode="once"
              from={riseIn.from}
              to={riseIn.to}
              config={SOFT}
              delayIn={780 + index * 90}
              className="flex flex-1 flex-col justify-between rounded-[1rem] border border-card-hairline bg-card-fill p-[0.75rem] text-white backdrop-blur-[7.1px]"
            >
              <p className="text-[1.5rem] leading-none">{stat.value}</p>
              <p className="mt-[1rem] text-[0.75rem] leading-[1.15]">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </Reveal>

      <HeroMobilePreloader />
    </div>
  );
};
