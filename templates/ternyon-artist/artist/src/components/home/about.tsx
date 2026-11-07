/**
 * About — the artist's story and personality, paired with the reused photo grid
 * (hover-scale, mirroring the reference) and a short facts ledger. Client leaf.
 */
"use client";

import { useRef } from "react";
import TextEngine from "spring-text-engine";
import { Inview } from "@/components/animation/springs/in-view";
import { Hover } from "@/components/animation/springs/hover";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Media } from "@/components/ui/media";
import { reveal, textLine, textWord } from "@/lib/motion";
import { about } from "@/data/mocks/home";

const PhotoCard = ({
  src,
  alt,
  ratio,
}: {
  src: string;
  alt: string;
  ratio: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="overflow-hidden">
      <Hover
        tag="div"
        trigger={ref as React.RefObject<HTMLElement>}
        from={{ scale: 1 }}
        to={{ scale: 1.06 }}
        config={{ tension: 180, friction: 24 }}
      >
        <Media src={src} alt={alt} ratio={ratio} sizes="(max-width: 768px) 100vw, 33vw" />
      </Hover>
    </div>
  );
};

export const About = () => {
  return (
    <section
      id="about"
      className="rule-dashed scroll-mt-24 border-t bg-canvas px-6 py-24 lg:px-12 lg:py-32"
    >
      <div className="mx-auto max-w-[120rem]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Inview
              from={reveal.fade.from}
              to={reveal.fade.to}
              config={reveal.fade.config}
              mode="once"
              className="mb-8"
            >
              <Eyebrow>{about.eyebrow}</Eyebrow>
            </Inview>

            <TextEngine
              tag="h2"
              mode="once"
              overflow
              lineIn={textLine.lineIn}
              lineOut={textLine.lineOut}
              lineConfig={textLine.lineConfig}
              lineStagger={textLine.lineStagger}
              className="max-w-[20ch] text-4xl leading-[1.1] text-ink sm:text-5xl lg:text-6xl"
            >
              {about.title}
            </TextEngine>
          </div>

          <div className="lg:col-span-5">
            <div className="space-y-6">
              {about.paragraphs.map((para, i) => (
                <TextEngine
                  key={i}
                  tag="p"
                  mode="once"
                  wordIn={textWord.wordIn}
                  wordOut={textWord.wordOut}
                  wordConfig={textWord.wordConfig}
                  wordStagger={10}
                  className="max-w-[52ch] text-base leading-relaxed text-ink-muted"
                >
                  {para}
                </TextEngine>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:mt-20">
          {about.images.map((img, i) => (
            <Inview
              key={img.src + i}
              from={reveal.plate.from}
              to={reveal.plate.to}
              config={reveal.plate.config}
              mode="once"
              delayIn={i * 100}
            >
              <PhotoCard src={img.src} alt={img.alt} ratio={img.ratio} />
            </Inview>
          ))}
        </div>

        <Inview
          from={reveal.fadeUp.from}
          to={reveal.fadeUp.to}
          config={reveal.fadeUp.config}
          mode="once"
          className="rule-dashed mt-16 grid grid-cols-2 gap-x-8 gap-y-6 border-t pt-10 sm:grid-cols-4"
        >
          {about.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs uppercase tracking-[0.18em] text-ink-faint">
                {fact.label}
              </dt>
              <dd className="mt-2 text-base text-ink">{fact.value}</dd>
            </div>
          ))}
        </Inview>
      </div>
    </section>
  );
};
