"use client";

import { useEffect } from "react";
import gsap from "gsap";

import { view } from "@/lib/state";

/**
 * Copy reveals. Splitting is to the WORD, not the line: a per-word blur-in
 * survives line wrapping, a per-line clip mask does not.
 *
 * Playback is driven by the `synapse:stage` DOM event that ScrollEngine
 * dispatches — IntersectionObserver fires roughly a screen early on
 * stages this tall, so the copy would finish animating before it is seen.
 */
export default function Reveals() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (targets.length === 0) return;

    const wordsFor = new Map<string, HTMLElement[]>();

    for (const target of targets) {
      const stage = target.closest<HTMLElement>("[data-stage]")?.dataset.stage ?? "";
      const leaves = target.children.length
        ? (Array.from(target.children) as HTMLElement[])
        : [target];

      const words: HTMLElement[] = [];
      for (const leaf of leaves) {
        const text = leaf.textContent ?? "";
        leaf.textContent = "";
        text.split(/\s+/).forEach((word, i) => {
          if (!word) return;
          const span = document.createElement("span");
          span.textContent = i === 0 ? word : ` ${word}`;
          span.style.display = "inline-block";
          span.style.whiteSpace = "pre";
          span.style.willChange = "transform, filter, opacity";
          leaf.appendChild(span);
          words.push(span);
        });
      }

      const bucket = wordsFor.get(stage) ?? [];
      bucket.push(...words);
      wordsFor.set(stage, bucket);
    }

    const all = Array.from(wordsFor.values()).flat();

    if (view.reduced) {
      gsap.set(all, { opacity: 1, filter: "blur(0px)", y: 0 });
      return;
    }

    const reset = (words: HTMLElement[]) => {
      gsap.killTweensOf(words);
      gsap.set(words, { opacity: 0, filter: "blur(13px)", y: 14 });
    };
    const play = (words: HTMLElement[]) => {
      gsap.killTweensOf(words);
      gsap.to(words, {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 0.95,
        ease: "power2.out",
        stagger: 0.048,
      });
    };

    for (const words of wordsFor.values()) reset(words);

    const played = new Set<string>();
    const onStage = (event: Event) => {
      const stage = (event as CustomEvent<string>).detail;
      const words = wordsFor.get(stage);
      if (!words || played.has(stage)) return;
      played.add(stage);
      play(words);
    };
    const onReady = () => {
      const first = wordsFor.get("hero");
      if (first && !played.has("hero")) {
        played.add("hero");
        play(first);
      }
    };

    document.addEventListener("synapse:stage", onStage);
    document.addEventListener("synapse:ready", onReady);
    // if the preloader has already finished (fast reload), don't wait for it
    if (view.ready) onReady();
    // and if the ready event never arrives at all, the hero must not stay
    // parked at opacity 0 — a reveal that fails should fail visible
    const failsafe = window.setTimeout(onReady, 4200);

    return () => {
      window.clearTimeout(failsafe);
      document.removeEventListener("synapse:stage", onStage);
      document.removeEventListener("synapse:ready", onReady);
      gsap.killTweensOf(all);
    };
  }, []);

  return null;
}
