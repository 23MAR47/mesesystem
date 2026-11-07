/**
 * Principles — the studio's rules as a three-column card grid with dashed
 * dividers (mirrors the reference's rules-section). Client leaf.
 */
"use client";

import { Inview } from "@/components/animation/springs/in-view";
import { SectionHeading } from "@/components/ui/section-heading";
import { reveal } from "@/lib/motion";
import { principles } from "@/data/mocks/home";

export const Principles = () => {
  return (
    <section className="rule-dashed border-t bg-surface-grey px-6 py-24 lg:px-12 lg:py-32">
      <div className="mx-auto max-w-[120rem]">
        <SectionHeading
          eyebrow={principles.eyebrow}
          title={principles.title}
        />

        <div className="mt-16 grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-3">
          {principles.items.map((item, i) => (
            <Inview
              key={item.index}
              from={reveal.fadeUp.from}
              to={reveal.fadeUp.to}
              config={reveal.fadeUp.config}
              mode="once"
              delayIn={i * 90}
              tag="article"
              className="rule-dashed flex flex-col border-t pt-8"
            >
              <span className="font-display text-2xl text-ink">
                {item.index}
              </span>
              <h3 className="mt-6 text-xl font-medium leading-tight text-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-ink-muted">
                {item.body}
              </p>
            </Inview>
          ))}
        </div>
      </div>
    </section>
  );
};
