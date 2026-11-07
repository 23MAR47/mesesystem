/**
 * PinnedCta — a full-viewport dark CTA block (the reference's "do-it" section,
 * which appears twice). Optional portrait beside the copy. Client leaf.
 */
"use client";

import TextEngine from "spring-text-engine";
import { Inview } from "@/components/animation/springs/in-view";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Media } from "@/components/ui/media";
import { CtaButton } from "@/components/ui/cta-button";
import { reveal, textLine, textWord } from "@/lib/motion";

interface PinnedCtaProps {
  id?: string;
  eyebrow: string;
  title: string;
  body: string;
  action: { label: string; href: string };
  image?: string;
  imageRatio?: string;
  center?: boolean;
}

export const PinnedCta = ({
  id,
  eyebrow,
  title,
  body,
  action,
  image,
  imageRatio = "810 / 975",
  center = false,
}: PinnedCtaProps) => {
  const copy = (
    <div className={center ? "mx-auto max-w-[40rem] text-center" : "max-w-[34rem]"}>
      <Inview
        from={reveal.fade.from}
        to={reveal.fade.to}
        config={reveal.fade.config}
        mode="once"
        className={`mb-6 ${center ? "flex justify-center" : ""}`}
      >
        <Eyebrow tone="dark">{eyebrow}</Eyebrow>
      </Inview>

      <TextEngine
        tag="h2"
        mode="once"
        overflow
        lineIn={textLine.lineIn}
        lineOut={textLine.lineOut}
        lineConfig={textLine.lineConfig}
        lineStagger={textLine.lineStagger}
        className={`text-4xl text-on-dark sm:text-5xl lg:text-6xl ${center ? "justify-center text-center" : ""}`}
      >
        {title}
      </TextEngine>

      <TextEngine
        tag="p"
        mode="once"
        wordIn={textWord.wordIn}
        wordOut={textWord.wordOut}
        wordConfig={textWord.wordConfig}
        wordStagger={16}
        className={`mt-8 text-lg leading-relaxed text-on-dark-muted ${center ? "justify-center text-center" : ""}`}
      >
        {body}
      </TextEngine>

      <Inview
        from={reveal.fadeUp.from}
        to={reveal.fadeUp.to}
        config={reveal.fadeUp.config}
        mode="once"
        delayIn={300}
        className={`mt-10 flex ${center ? "justify-center" : ""}`}
      >
        <CtaButton href={action.href} label={action.label} tone="dark" />
      </Inview>
    </div>
  );

  return (
    <section
      id={id}
      className={`rule-dashed flex min-h-svh items-center border-t bg-surface-dark px-6 py-24 lg:px-12 ${id ? "scroll-mt-24" : ""}`}
    >
      <div className="mx-auto w-full max-w-[120rem]">
        {image ? (
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6">{copy}</div>
            <Inview
              from={reveal.plate.from}
              to={reveal.plate.to}
              config={reveal.plate.config}
              mode="once"
              className="lg:col-span-5 lg:col-start-8"
            >
              <Media
                src={image}
                alt=""
                ratio={imageRatio}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="w-full"
              />
            </Inview>
          </div>
        ) : (
          copy
        )}
      </div>
    </section>
  );
};
