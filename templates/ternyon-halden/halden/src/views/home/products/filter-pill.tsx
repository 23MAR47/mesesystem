"use client";

import { useRef } from "react";

import { Hover } from "@/components/animation/springs/hover";
import { Inview } from "@/components/animation/springs/in-view";
import { springWeightSoft } from "@/lib/springs/config";
import type { ProductFilter } from "@/data/mocks/home";

export interface FilterPillProps {
  filter: ProductFilter;
  index: number;
}

/**
 * Filter pill — variant B1.
 *
 * Weight climbs with commitment: an outline is merely available, the sand fill
 * that wipes in under the cursor is a preview, and the active filter carries
 * the solid ink. Reading it the other way round — a black hover over a pale
 * active pill — made the pointer look more chosen than the actual choice.
 *
 * The fill wipes from the left edge, the same gesture the catalogue band makes
 * across a category row. Only the outlined pills have somewhere to go; the
 * active one is already at its destination.
 */
export const FilterPill = ({ filter, index }: FilterPillProps) => {
  const ref = useRef<HTMLLIElement>(null);

  return (
    <Inview
      tag="li"
      ref={ref}
      mode="once"
      delayIn={260 + index * 70}
      from={{ opacity: 0, y: 14 }}
      to={{ opacity: 1, y: 0 }}
      config={springWeightSoft}
      className={`group/pill relative isolate flex shrink-0 items-center overflow-hidden rounded-pill px-[1rem] py-[0.6875rem] ${
        filter.active
          ? "bg-foreground"
          : "border-[0.0375rem] border-solid border-foreground"
      }`}
    >
      {!filter.active && (
        <Hover
          tag="span"
          trigger={ref}
          from={{ scaleX: 0 }}
          to={{ scaleX: 1 }}
          config={{ tension: 260, friction: 28 }}
          aria-hidden
          className="absolute inset-0 -z-10 block origin-left bg-surface-subtle"
        />
      )}
      <span
        className={`shrink-0 whitespace-nowrap font-serif text-label leading-normal tracking-[0.04em] [text-box-edge:cap_alphabetic] [text-box-trim:trim-both] ${
          filter.active ? "text-foreground-on-band" : "text-foreground"
        }`}
      >
        {filter.label}
      </span>
    </Inview>
  );
};
