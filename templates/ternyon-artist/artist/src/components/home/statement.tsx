/**
 * Statement — a single large editorial passage (Playfair) that fades
 * word-by-word as it enters. The quiet beat after the hero. Client leaf.
 */
"use client";

import TextEngine from "spring-text-engine";
import { Inview } from "@/components/animation/springs/in-view";
import { Eyebrow } from "@/components/ui/eyebrow";
import { reveal, textWord } from "@/lib/motion";
import { statement } from "@/data/mocks/home";

export const Statement = () => {
  return (
    <section className="rule-dashed border-t bg-canvas px-6 py-28 lg:px-12 lg:py-40">
      <div className="mx-auto max-w-[80rem]">
        <Inview
          from={reveal.fade.from}
          to={reveal.fade.to}
          config={reveal.fade.config}
          mode="once"
          className="mb-12"
        >
          <Eyebrow>{statement.eyebrow}</Eyebrow>
        </Inview>

        <TextEngine
          tag="p"
          mode="once"
          wordIn={textWord.wordIn}
          wordOut={textWord.wordOut}
          wordConfig={textWord.wordConfig}
          wordStagger={30}
          className="font-display text-3xl leading-[1.3] text-ink sm:text-4xl lg:text-5xl lg:leading-[1.25]"
        >
          {statement.body}
        </TextEngine>

        <Inview
          from={reveal.fadeUp.from}
          to={reveal.fadeUp.to}
          config={reveal.fadeUp.config}
          mode="once"
          delayIn={400}
          className="mt-12"
        >
          <span className="font-display text-xl italic text-ink-muted">
            {statement.signature}
          </span>
        </Inview>
      </div>
    </section>
  );
};
