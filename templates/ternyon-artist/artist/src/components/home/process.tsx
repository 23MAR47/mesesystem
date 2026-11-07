/**
 * Process — the studio's four stages. Heading sticks on desktop while the steps
 * scroll past and reveal one by one, each led by an oversized index. Client leaf.
 */
"use client";

import { Inview } from "@/components/animation/springs/in-view";
import { SectionHeading } from "@/components/ui/section-heading";
import { reveal } from "@/lib/motion";
import { process } from "@/data/mocks/home";

export const Process = () => {
  return (
    <section
      id="process"
      className="rule-dashed scroll-mt-24 border-t bg-canvas px-6 py-24 lg:px-12 lg:py-32"
    >
      <div className="mx-auto grid max-w-[120rem] grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionHeading
              eyebrow={process.eyebrow}
              title={process.title}
            />
          </div>
        </div>

        <ol className="lg:col-span-7">
          {process.steps.map((step) => (
            <Inview
              key={step.index}
              from={reveal.fadeUp.from}
              to={reveal.fadeUp.to}
              config={reveal.fadeUp.config}
              mode="once"
              tag="li"
              className="rule-dashed flex flex-col gap-4 border-t py-10 sm:flex-row sm:gap-12 sm:py-12"
            >
              <span className="font-display text-7xl leading-none text-ink-faint sm:text-8xl">
                {step.index}
              </span>
              <div className="sm:pt-3">
                <h3 className="text-2xl font-medium text-ink lg:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-[48ch] text-lg leading-relaxed text-ink-muted">
                  {step.body}
                </p>
              </div>
            </Inview>
          ))}
        </ol>
      </div>
    </section>
  );
};
