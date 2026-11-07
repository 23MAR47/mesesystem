/**
 * Featured works — an asymmetric editorial gallery using the reused photography.
 * Each plate reveals on enter (<Inview>) and drifts with scroll
 * (<SpringTrigger mode="scrub">) for parallax depth. Client leaf.
 */
"use client";

import { Inview } from "@/components/animation/springs/in-view";
import { SpringTrigger } from "@/components/animation/springs/spring-trigger";
import { Media } from "@/components/ui/media";
import { SectionHeading } from "@/components/ui/section-heading";
import { Accent } from "@/components/ui/accent";
import { reveal } from "@/lib/motion";
import { works, type Work } from "@/data/mocks/home";

const WorkItem = ({ work, even }: { work: Work; even: boolean }) => {
  return (
    <article
      className={`lg:col-span-7 ${even ? "lg:col-start-6 lg:mt-24" : "lg:col-start-1"}`}
    >
      <Inview
        from={reveal.plate.from}
        to={reveal.plate.to}
        config={reveal.plate.config}
        mode="once"
      >
        <figure>
          <SpringTrigger
            tag="div"
            mode="scrub"
            start="top bottom"
            end="bottom top"
            from={{ y: "2.5rem" }}
            to={{ y: "-2.5rem" }}
          >
            <Media
              src={work.image}
              alt={`${work.title} — ${work.medium}`}
              ratio={work.ratio}
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="w-full"
            />
          </SpringTrigger>
          <figcaption className="rule-dashed mt-6 flex items-baseline justify-between gap-6 border-t pt-5">
            <div>
              <h3 className="text-xl font-medium text-ink">{work.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{work.medium}</p>
            </div>
            <span className="font-display text-base text-ink">{work.year}</span>
          </figcaption>
        </figure>
      </Inview>
    </article>
  );
};

export const FeaturedWorks = () => {
  return (
    <section
      id="works"
      className="rule-dashed scroll-mt-24 border-t bg-canvas px-6 py-24 lg:px-12 lg:py-32"
    >
      <div className="mx-auto max-w-[120rem]">
        <SectionHeading
          eyebrow={works.eyebrow}
          title={
            <>
              A field of <Accent>light,</Accent> never the same twice.
            </>
          }
        />
        <div className="mt-16 grid grid-cols-1 gap-16 lg:mt-24 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0">
          {works.items.map((work, i) => (
            <WorkItem key={work.id} work={work} even={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
};
