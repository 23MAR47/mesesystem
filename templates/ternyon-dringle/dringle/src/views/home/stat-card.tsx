import type { HeroStat } from "@/data/mocks/home";

import { riseIn, SOFT } from "./hero-motion";
import { Reveal } from "./reveal";

interface StatCardProps {
  stat: HeroStat;
  /** Absolute-position utilities placing the card within the panel. */
  className?: string;
  delayIn?: number;
}

/** Frosted-glass metric card floating over the media panel. Rises + fades in. */
export const StatCard = ({ stat, className = "", delayIn = 0 }: StatCardProps) => {
  return (
    <Reveal
      tag="div"
      mode="once"
      from={riseIn.from}
      to={riseIn.to}
      config={SOFT}
      delayIn={delayIn}
      className={`absolute flex h-[10.625rem] w-[9.875rem] flex-col justify-between rounded-card border border-card-hairline bg-card-fill p-[1.25rem] text-white backdrop-blur-[7.1px] ${className}`}
    >
      <p className="text-[3rem] leading-none">{stat.value}</p>
      <p className="text-[1rem] leading-[1.2]">{stat.label}</p>
    </Reveal>
  );
};
