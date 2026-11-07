"use client";

import Lenis from "lenis";
import { useEffect } from "react";

import {
  applySectionScroll,
  clamp,
  contentVisibility,
  SECTION_COUNT,
  view,
} from "@/lib/state";

/**
 * Owns smooth scrolling and translates raw scroll into:
 *   - the assembly state of every part (via applySectionScroll)
 *   - per-section content visibility, written straight to the DOM
 *
 * Nothing here goes through React state; this runs on every frame.
 */
export default function ScrollEngine() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    view.reduced = reduced;

    let stage: HTMLElement | null = null;
    let panels: HTMLElement[] = [];
    let rail: HTMLElement | null = null;
    let railFill: HTMLElement | null = null;
    let navFill: HTMLElement | null = null;
    let sectionH = 1;
    let stageTop = 0;

    const measure = () => {
      stage = document.getElementById("stage");
      panels = Array.from(document.querySelectorAll<HTMLElement>("[data-panel]"));
      rail = document.querySelector<HTMLElement>("[data-rail]");
      railFill = document.querySelector<HTMLElement>("[data-rail-fill]");
      navFill = document.querySelector<HTMLElement>("[data-nav-fill]");
      if (!stage) return;
      stageTop = stage.getBoundingClientRect().top + window.scrollY;
      sectionH = stage.offsetHeight / SECTION_COUNT;
    };

    let lastActive = -1;

    const apply = (scrollY: number) => {
      if (!stage || sectionH <= 0) return;
      const raw = (scrollY - stageTop) / sectionH;
      applySectionScroll(raw);

      if (view.sectionIndex !== lastActive) {
        lastActive = view.sectionIndex;
        document.dispatchEvent(
          new CustomEvent("aperture:section", { detail: lastActive })
        );
      }

      // Content visibility, one write per panel per frame.
      for (let i = 0; i < panels.length; i++) {
        const local = clamp(raw - i, 0, 1);
        // A panel is live only once its own section starts, otherwise
        // every not-yet-reached panel would sit at local 0 and read as
        // fully visible.
        const inPlay = raw >= i - 0.001 && raw < i + 1;
        const vis = inPlay ? contentVisibility(local) : 0;

        const el = panels[i];
        el.style.opacity = vis.toFixed(3);
        el.style.transform = `translate3d(0, ${((1 - vis) * 26).toFixed(2)}px, 0)`;
        el.style.filter = vis > 0.995 ? "none" : `blur(${((1 - vis) * 7).toFixed(2)}px)`;
        el.style.visibility = vis < 0.004 ? "hidden" : "visible";
      }

      if (railFill) {
        railFill.style.transform = `scaleY(${view.progress.toFixed(4)})`;
      }
      if (navFill) {
        navFill.style.transform = `scaleX(${view.progress.toFixed(4)})`;
      }
      if (rail) {
        rail.dataset.active = String(view.sectionIndex);
      }
    };

    measure();
    apply(window.scrollY);

    // Pointer feed for the WebGL scene. Lives here so it works whether
    // or not the custom cursor is active.
    const onPointer = (e: PointerEvent) => {
      view.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      view.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let lenis: Lenis | null = null;
    let rafId = 0;

    if (reduced) {
      const onScroll = () => apply(window.scrollY);
      window.addEventListener("scroll", onScroll, { passive: true });
      const onResize = () => {
        measure();
        apply(window.scrollY);
      };
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", onPointer);
      };
    }

    lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => 1 - Math.pow(1 - t, 3.2),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      syncTouch: false,
    });

    lenis.on("scroll", (e: { scroll: number; velocity: number }) => {
      apply(e.scroll);
      view.velocity = clamp(Math.abs(e.velocity) / 45, 0, 1);
    });

    const raf = (time: number) => {
      lenis?.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    if (process.env.NODE_ENV !== "production") {
      // Handle for driving the page from automated visual checks.
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    const onResize = () => {
      measure();
      lenis?.resize();
      apply(window.scrollY);
    };
    window.addEventListener("resize", onResize);

    // Fonts landing late can change section offsets.
    document.fonts?.ready.then(onResize).catch(() => {});

    // Once the preloader lifts, replay the reveal for whatever section
    // we're sitting on.
    const onReady = () => {
      document.dispatchEvent(
        new CustomEvent("aperture:section", { detail: view.sectionIndex })
      );
    };
    document.addEventListener("aperture:ready", onReady);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("aperture:ready", onReady);
      lenis?.destroy();
    };
  }, []);

  return null;
}
