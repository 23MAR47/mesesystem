"use client";

import { easings } from "@react-spring/web";

import { Inview } from "@/components/animation/springs/in-view";
import type { BiomarkerStat } from "@/data/mocks/negentropy";

interface BiomarkerGridProps {
  stats: readonly BiomarkerStat[];
}

/**
 * Numeric receipt for §III "The Refusal" — Bryan Johnson Blueprint
 * stats. **Inline rows**: bracketed amber value next to a small
 * uppercase label, one row per stat. Replaces the earlier stacked
 * `value-above-label` cells, which read as off-balance with a giant
 * number sitting over tiny copy. Inherits the parent section's
 * `text-align`, so the list flows naturally on either side of the
 * `flip`.
 */
export const BiomarkerGrid = ({ stats }: BiomarkerGridProps) => {
  return (
    <ul className="mt-4 flex w-full max-w-[44ch] flex-col gap-2">
      {stats.map((stat, index) => (
        <Inview
          key={stat.label}
          tag="li"
          mode="once"
          from={{ opacity: 0, x: 12 }}
          to={{ opacity: 1, x: 0 }}
          delayIn={500 + index * 120}
          config={{ duration: 700, easing: easings.easeOutQuart }}
          className="flex items-baseline gap-3"
        >
          <span className="min-w-[7ch] shrink-0 text-[clamp(1.125rem,1.6vw,1.4rem)] font-medium tabular-nums tracking-[-0.01em] text-negentropy-amber">
            ({stat.value})
          </span>
          <span className="text-sm uppercase tracking-[0.18em] text-negentropy-bone-muted">
            {stat.label}
          </span>
        </Inview>
      ))}
    </ul>
  );
};
