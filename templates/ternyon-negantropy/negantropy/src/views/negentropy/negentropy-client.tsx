"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";

import { ProgressTrigger } from "@/components/animation/springs/progress-trigger";
import type { NegentropyContent } from "@/data/mocks/negentropy";

import { BiomarkerGrid } from "./biomarker-grid";
import { BrandMark } from "./brand-mark";
import { ChoiceCta } from "./choice-cta";
import { Frame } from "./frame";
import { Hero } from "./hero";
import { LoaderFlowField } from "./loader-flow-field";
import { NavJumplinks } from "./nav-jumplinks";
import { Section } from "./section";

// Three.js / R3F is client-only — defer to the browser to avoid SSR window
// access and to keep the initial HTML payload light.
const Scene = dynamic(() => import("./scene").then((m) => m.Scene), {
  ssr: false,
});

interface NegentropyClientProps {
  content: NegentropyContent;
}

type Phase = "loading" | "scene-revealed" | "ui-revealed";

/**
 * Top-level client wrapper for the NEGENTROPY view. Three lifecycle phases
 * that thread carefully through the loader hand-off:
 *
 *   - **loading**: only the loader is mounted; nothing else is in the DOM.
 *   - **scene-revealed**: fires the **instant** the last loader sentence
 *     finishes exiting. The R3F `Scene` (nebula hero) mounts so the user
 *     watches it materialise *through* the loader's 1.5 s background fade.
 *     UI chrome stays unmounted so its own entrance animations don't burn
 *     behind the still-visible loader.
 *   - **ui-revealed**: fires when the loader's bg fade lands (≈1.5 s
 *     later). Frame, BrandMark, NavJumplinks, the section content, and
 *     the loader itself unmount — each UI element then runs its own
 *     Inview/Spring intro on mount.
 *
 * Holds the shared scroll-progress ref the WebGL scene reads each frame.
 */
export const NegentropyClient = ({ content }: NegentropyClientProps) => {
  const [phase, setPhase] = useState<Phase>("loading");
  const progressRef = useRef<number>(0);

  const handleScroll = useCallback(
    ({ progress }: { progress: number; interpolatedProgress: number }) => {
      progressRef.current = progress;
    },
    [],
  );

  const handleSceneReveal = useCallback(() => setPhase("scene-revealed"), []);
  const handleUiReveal = useCallback(() => setPhase("ui-revealed"), []);

  const isLoaderMounted = phase !== "ui-revealed";
  const isSceneMounted = phase !== "loading";
  const isUiMounted = phase === "ui-revealed";
  const { sections } = content;

  return (
    <>
      {isSceneMounted ? <Scene progressRef={progressRef} /> : null}

      {isUiMounted ? (
        <>
          <Frame />
          <BrandMark name={content.brand.name} badge={content.brand.badge} />
          <NavJumplinks items={content.nav} />

          <ProgressTrigger
            tag="div"
            start="top top"
            end="bottom bottom"
            frameInterval={1}
            onChange={handleScroll}
          >
            <Hero id="void" content={sections.void} nextHref="#entropy" />
            <Section
              id="entropy"
              index={sections.entropy.index}
              meta={sections.entropy.meta}
              heading={sections.entropy.heading}
              body={sections.entropy.body}
            />
            <Section
              id="refusal"
              index={sections.refusal.index}
              meta={sections.refusal.meta}
              heading={sections.refusal.heading}
              body={sections.refusal.body}
              flip
            >
              <BiomarkerGrid stats={sections.refusal.biomarkers} />
            </Section>
            <Section
              id="universe"
              index={sections.universe.index}
              meta={sections.universe.meta}
              heading={sections.universe.heading}
              body={sections.universe.body}
            />
            <Section
              id="choice"
              index={sections.choice.index}
              meta={sections.choice.meta}
              heading={sections.choice.heading}
              body={sections.choice.body}
              flip
            />
            <Section
              id="persist"
              index={sections.persist.index}
              meta={sections.persist.meta}
              heading={sections.persist.heading}
              body={sections.persist.body}
              centered
            >
              <ChoiceCta
                label={sections.persist.cta.label}
                href={sections.persist.cta.href}
              />
            </Section>
          </ProgressTrigger>
        </>
      ) : null}

      {isLoaderMounted ? (
        <LoaderFlowField
          beats={content.loaderBeats}
          onReveal={handleSceneReveal}
          onComplete={handleUiReveal}
        />
      ) : null}
    </>
  );
};
