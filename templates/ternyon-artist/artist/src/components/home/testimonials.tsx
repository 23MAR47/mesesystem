/**
 * Testimonials — short quotes from collectors and curators, revealed as a
 * staggered grid (Playfair quotes). Social proof ahead of the closing CTA.
 * Client leaf.
 */
"use client";

import { Inview } from "@/components/animation/springs/in-view";
import { SectionHeading } from "@/components/ui/section-heading";
import { reveal } from "@/lib/motion";
import { testimonials } from "@/data/mocks/home";

export const Testimonials = () => {
  return (
    <section className="rule-dashed border-t bg-canvas px-6 py-24 lg:px-12 lg:py-32">
      <div className="mx-auto max-w-[120rem]">
        <SectionHeading
          eyebrow={testimonials.eyebrow}
          title={testimonials.title}
        />

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
          {testimonials.items.map((item, i) => (
            <Inview
              key={item.author}
              from={reveal.fadeUp.from}
              to={reveal.fadeUp.to}
              config={reveal.fadeUp.config}
              mode="once"
              delayIn={i * 110}
              tag="figure"
              className="rule-dashed flex h-full flex-col justify-between border-t pt-8"
            >
              <blockquote className="font-display text-xl leading-relaxed text-ink lg:text-2xl">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-10">
                <p className="text-base text-ink">{item.author}</p>
                <p className="mt-1 text-sm text-ink-muted">{item.role}</p>
              </figcaption>
            </Inview>
          ))}
        </div>
      </div>
    </section>
  );
};
