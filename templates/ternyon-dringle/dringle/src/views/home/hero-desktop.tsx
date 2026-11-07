import Link from "next/link";

import type { HeroContent } from "@/data/mocks/home";
import { Hover } from "@/components/animation/springs/hover";

import { AvatarStack } from "./avatar-stack";
import { HeroNav } from "./hero-nav";
import { HeroPanel } from "./hero-panel";
import { HeroPreloader } from "./hero-preloader";
import { HeroHeading, HeroSubheading } from "./hero-text";
import { hoverLift, HOVER, riseIn, SOFT } from "./hero-motion";
import { Reveal } from "./reveal";

interface HeroDesktopProps {
  content: HeroContent;
}

/** Desktop hero — a full-viewport stage. Horizontal metrics track the Figma
 *  1440 frame (`1rem` = viewport width / 90, see globals.css), so the layout
 *  stays mockup-accurate across widths. Vertically it is **fluid**: the nav pins
 *  to the top, the CTA + social proof to the bottom, the headline centres, and
 *  the media panel fills the full height — so the hero always fills the screen
 *  with no letterbox gaps, whatever the viewport aspect. See ADR-0017. */
export const HeroDesktop = ({ content }: HeroDesktopProps) => {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background text-ink">
      <div className="relative h-full w-[90rem]">
        <HeroNav nav={content.nav} />

        <main className="absolute inset-0">
          {/* Left column — headline block, vertically centred */}
          <div className="absolute left-[4rem] top-1/2 flex w-[37rem] -translate-y-1/2 flex-col items-center gap-[2rem]">
            <div className="flex flex-col items-center gap-[1rem]">
              <Reveal
                tag="p"
                mode="once"
                from={riseIn.from}
                to={riseIn.to}
                config={SOFT}
                delayIn={220}
                className="flex items-center gap-[0.5rem] rounded-full border border-hairline px-[1.5rem] py-[0.5rem] text-[1rem] leading-[1.2] text-ink"
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
                className="w-[37rem] text-center text-[3.5rem] leading-none text-ink"
              />
            </div>

            <HeroSubheading
              text={content.subheading}
              delayIn={660}
              className="w-[30.375rem] justify-center text-center text-[1rem] leading-[1.2] text-ink"
            />
          </div>

          {/* Primary CTA — bottom-left */}
          <Reveal
            tag="div"
            mode="once"
            from={riseIn.from}
            to={riseIn.to}
            config={SOFT}
            delayIn={780}
            className="absolute bottom-[1.25rem] left-[1.25rem]"
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
                className="flex items-center gap-[1rem] rounded-full bg-[image:var(--gradient-cta)] py-[0.125rem] pl-[0.125rem] pr-[2rem] text-[1rem] leading-[1.2] text-white"
              >
                <span className="flex size-[2.9375rem] items-center justify-center rounded-full bg-white text-ink">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-[1.4375rem]"
                    aria-hidden
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </span>
                {content.cta.label}
              </Link>
            </Hover>
          </Reveal>

          {/* Social proof — bottom-centre */}
          <Reveal
            tag="div"
            mode="once"
            from={riseIn.from}
            to={riseIn.to}
            config={SOFT}
            delayIn={840}
            className="absolute bottom-[1.25rem] left-[22.125rem] flex h-[3.1875rem] w-[21.625rem] items-center gap-[0.75rem] rounded-full border border-hairline pl-[1.5rem] pr-[0.5rem]"
          >
            <p className="whitespace-nowrap text-[1rem] leading-[1.2] text-ink">
              {content.socialProof.label}
            </p>
            <AvatarStack avatars={content.socialProof.avatars} delayIn={980} />
          </Reveal>

          <HeroPanel panel={content.panel} />
        </main>

        <HeroPreloader />
      </div>
    </div>
  );
};
