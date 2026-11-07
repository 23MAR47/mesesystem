/**
 * Exhibitions — venues / institutions where the work has shown or is collected,
 * rendered as a clean typographic grid with dashed dividers. Client leaf.
 */
"use client";

import { Inview } from "@/components/animation/springs/in-view";
import { SectionHeading } from "@/components/ui/section-heading";
import { reveal } from "@/lib/motion";
import { exhibitions } from "@/data/mocks/home";

export const Exhibitions = () => {
  return (
    <section className="rule-dashed border-t bg-surface-grey px-6 py-24 lg:px-12 lg:py-32">
      <div className="mx-auto max-w-[120rem]">
        <SectionHeading
          eyebrow={exhibitions.eyebrow}
          title={exhibitions.title}
          className="mb-16"
        />

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {exhibitions.venues.map((venue, i) => (
            <Inview
              key={venue}
              from={reveal.fadeUp.from}
              to={reveal.fadeUp.to}
              config={reveal.fadeUp.config}
              mode="once"
              delayIn={(i % 3) * 80}
              tag="li"
              className="rule-dashed flex items-baseline gap-5 border-t py-6"
            >
              <span className="font-display text-sm text-ink-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-xl text-ink lg:text-2xl">
                {venue}
              </span>
            </Inview>
          ))}
        </ul>
      </div>
    </section>
  );
};
