"use client";

import { easings } from "@react-spring/web";
import TextEngine from "spring-text-engine";

import { Inview } from "@/components/animation/springs/in-view";

interface BrandMarkProps {
  name: string;
  badge: string;
}

/**
 * Fixed top-left wordmark in the IRIS_AI-style corner-label vocabulary —
 * `(NEGENTROPY)` plus a smaller `[DON'T DIE]` badge underneath. Holds the
 * page's single `<h1>` so the rest of the layout can use `<h2>` and the
 * SEO outline stays clean (hard rule #10).
 */
export const BrandMark = ({ name, badge }: BrandMarkProps) => {
  return (
    <header className="pointer-events-none fixed left-8 top-8 z-40 flex flex-col gap-2 sm:left-16 sm:top-16">
      <TextEngine
        tag="h1"
        mode="once"
        letterIn={{ y: 0, opacity: 1 }}
        letterOut={{ y: 12, opacity: 0 }}
        letterStagger={28}
        letterDelayIn={200}
        letterConfig={{ duration: 600, easing: easings.easeOutQuart }}
        className="text-base font-medium uppercase tracking-[0.18em] text-negentropy-bone"
      >
        ({name})
      </TextEngine>
      <Inview
        tag="span"
        mode="once"
        from={{ opacity: 0, y: 8 }}
        to={{ opacity: 1, y: 0 }}
        delayIn={600}
        config={{ duration: 600, easing: easings.easeOutQuart }}
        className="text-sm uppercase tracking-[0.24em] text-negentropy-bone-muted"
      >
        [ {badge} ]
      </Inview>
    </header>
  );
};
