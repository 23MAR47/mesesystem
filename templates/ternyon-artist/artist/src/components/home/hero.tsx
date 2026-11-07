/**
 * Hero — full-viewport opening (reference layout): value text on the left, the
 * tall portrait on the right. The page's single <h1>, line-revealed with a
 * Playfair accent. Client leaf.
 */
"use client";

import TextEngine from "spring-text-engine";
import { Inview } from "@/components/animation/springs/in-view";
import { Spring } from "@/components/animation/springs/spring";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Accent } from "@/components/ui/accent";
import { Media } from "@/components/ui/media";
import { CtaButton } from "@/components/ui/cta-button";
import { reveal, textLine, textWord } from "@/lib/motion";
import { hero, about } from "@/data/mocks/home";

export const Hero = () => {
  return (
    <section className="relative min-h-svh px-6 pb-16 pt-32 lg:px-12 lg:pt-40">
      <div className="mx-auto grid max-w-[120rem] grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <Inview
            from={reveal.fade.from}
            to={reveal.fade.to}
            config={reveal.fade.config}
            className="mb-8"
          >
            <Eyebrow>{hero.eyebrow}</Eyebrow>
          </Inview>

          <TextEngine
            tag="h1"
            mode="once"
            overflow
            lineIn={textLine.lineIn}
            lineOut={textLine.lineOut}
            lineConfig={textLine.lineConfig}
            lineStagger={140}
            className="max-w-[14ch] text-6xl leading-[1.04] text-ink sm:text-7xl lg:text-8xl"
          >
            Light, <Accent>written</Accent> in code.
          </TextEngine>

          <TextEngine
            tag="p"
            mode="once"
            wordIn={textWord.wordIn}
            wordOut={textWord.wordOut}
            wordConfig={textWord.wordConfig}
            wordStagger={18}
            delayIn={500}
            className="mt-10 max-w-[46ch] text-lg leading-relaxed text-ink-muted"
          >
            {hero.lead}
          </TextEngine>

          <Inview
            from={reveal.fadeUp.from}
            to={reveal.fadeUp.to}
            config={reveal.fadeUp.config}
            mode="once"
            delayIn={800}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <CtaButton href={hero.cta.href} label={hero.cta.label} />
            <CtaButton
              href={hero.secondaryCta.href}
              label={hero.secondaryCta.label}
              variant="ghost"
            />
          </Inview>

          <Inview
            from={reveal.fade.from}
            to={reveal.fade.to}
            config={reveal.fade.config}
            mode="once"
            delayIn={1000}
            className="mt-12 hidden border-t border-line pt-8 lg:block"
          >
            <dl className="grid grid-cols-3 gap-6">
              {about.facts.slice(0, 3).map((fact) => (
                <div key={fact.label}>
                  <dt className="text-xs uppercase tracking-[0.18em] text-ink-faint">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-sm text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Inview>
        </div>

        <Inview
          from={reveal.plate.from}
          to={reveal.plate.to}
          config={reveal.plate.config}
          mode="once"
          delayIn={200}
          className="lg:col-span-6 lg:col-start-7"
        >
          <Media
            src={hero.image}
            alt="Kai Nomura — portrait"
            ratio={hero.imageRatio}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="w-full"
          />
        </Inview>
      </div>

      <Spring
        tag="div"
        from={{ opacity: 0 }}
        to={{ opacity: 1 }}
        delayIn={1400}
        config={{ tension: 80, friction: 20 }}
        className="mt-12 flex items-center gap-3 lg:hidden"
      >
        <span className="text-[0.6rem] uppercase tracking-[0.3em] text-ink-faint">
          {hero.scrollCue}
        </span>
        <span className="h-px w-10 bg-line-strong" aria-hidden="true" />
      </Spring>
    </section>
  );
};
