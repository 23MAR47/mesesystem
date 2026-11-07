import type { HeroContent } from "@/data/mocks/home";

import { HeroModel } from "./hero-model";
import { HeroOverline } from "./hero-text";
import { scaleIn, SOFT } from "./hero-motion";
import { Reveal } from "./reveal";
import { StatCard } from "./stat-card";

interface HeroPanelProps {
  panel: HeroContent["panel"];
}

/** Right media panel: looping video, the live chrome model, an overline and
 *  three frosted-glass stat cards — all clipped to the rounded panel. Fades and
 *  scales in as a unit; the cards then stagger in. */
export const HeroPanel = ({ panel }: HeroPanelProps) => {
  const [brands, awards, rating] = panel.stats;

  return (
    <Reveal
      tag="section"
      mode="once"
      from={scaleIn.from}
      to={scaleIn.to}
      config={SOFT}
      delayIn={140}
      aria-label="Studio in numbers"
      className="absolute bottom-[0.625rem] left-[45rem] top-[0.625rem] w-[44.375rem] overflow-hidden rounded-panel bg-panel"
    >
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src={panel.videoSrc}
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
        text={panel.overline}
        delayIn={540}
        className="absolute left-[1.875rem] top-[1.875rem] z-20 w-[14.3125rem] text-[1.125rem] uppercase leading-[1.2] text-white"
      />

      <StatCard
        stat={brands}
        delayIn={780}
        className="bottom-[11.875rem] left-[33.9375rem] z-20"
      />
      <StatCard
        stat={awards}
        delayIn={880}
        className="bottom-[0.625rem] left-[23.4375rem] z-20"
      />
      <StatCard
        stat={rating}
        delayIn={980}
        className="bottom-[0.625rem] left-[33.9375rem] z-20"
      />
    </Reveal>
  );
};
