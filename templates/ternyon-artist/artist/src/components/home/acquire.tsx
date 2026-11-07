/**
 * Acquire — works available for sale. Each card reveals on enter and the image
 * lifts on hover (spring). The commercial heart of the page. Client leaf.
 */
"use client";

import Link from "next/link";
import { useRef } from "react";
import { Inview } from "@/components/animation/springs/in-view";
import { Hover } from "@/components/animation/springs/hover";
import { Media } from "@/components/ui/media";
import { SectionHeading } from "@/components/ui/section-heading";
import { CtaButton } from "@/components/ui/cta-button";
import { reveal } from "@/lib/motion";
import { acquire, type ForSaleWork } from "@/data/mocks/home";

const ForSaleCard = ({ work, delay }: { work: ForSaleWork; delay: number }) => {
  const ref = useRef<HTMLElement>(null);

  return (
    <Inview
      from={reveal.fadeUp.from}
      to={reveal.fadeUp.to}
      config={reveal.fadeUp.config}
      mode="once"
      delayIn={delay}
      tag="article"
    >
      <Link
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={acquire.cta.href}
        className="group block"
        aria-label={`Enquire about ${work.title}`}
      >
        <Hover
          tag="div"
          trigger={ref as React.RefObject<HTMLElement>}
          from={{ y: "0rem" }}
          to={{ y: "-0.75rem" }}
          config={{ tension: 220, friction: 22 }}
        >
          <Media
            src={work.image}
            alt={work.title}
            ratio={work.ratio}
            sizes="(max-width: 640px) 100vw, 50vw"
            className="w-full"
          />
        </Hover>
        <div className="rule-dashed mt-6 flex items-start justify-between gap-6 border-t pt-5">
          <div>
            <h3 className="text-xl font-medium text-ink">{work.title}</h3>
            <p className="mt-2 text-sm text-ink-muted">{work.medium}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-faint">
              {work.edition}
            </p>
          </div>
          <span className="font-display text-xl text-ink">{work.price}</span>
        </div>
      </Link>
    </Inview>
  );
};

export const Acquire = () => {
  return (
    <section
      id="acquire"
      className="rule-dashed scroll-mt-24 border-t bg-canvas px-6 py-24 lg:px-12 lg:py-32"
    >
      <div className="mx-auto max-w-[120rem]">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={acquire.eyebrow}
            title={acquire.title}
          />
          <Inview
            from={reveal.fade.from}
            to={reveal.fade.to}
            config={reveal.fade.config}
            mode="once"
            tag="p"
            className="max-w-[42ch] text-base leading-relaxed text-ink-muted"
          >
            {acquire.lead}
          </Inview>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2">
          {acquire.items.map((work, i) => (
            <ForSaleCard key={work.id} work={work} delay={(i % 2) * 90} />
          ))}
        </div>

        <Inview
          from={reveal.fadeUp.from}
          to={reveal.fadeUp.to}
          config={reveal.fadeUp.config}
          mode="once"
          className="mt-16 flex justify-center"
        >
          <CtaButton href={acquire.cta.href} label={acquire.cta.label} />
        </Inview>
      </div>
    </section>
  );
};
