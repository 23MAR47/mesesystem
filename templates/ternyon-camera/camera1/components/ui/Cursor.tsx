"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

import { view } from "@/lib/state";

/**
 * Two-part cursor: a hard dot and a ring that trails and swells. The
 * ring carries four corner ticks, so it reads as a focus reticle rather
 * than a generic bubble — on a page about a camera that is the whole
 * point of having a custom cursor at all.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine || view.reduced) return;

    const d = dot.current;
    const r = ring.current;
    if (!d || !r) return;

    document.body.dataset.cursor = "on";

    const dx = gsap.quickTo(d, "x", { duration: 0.12, ease: "power2.out" });
    const dy = gsap.quickTo(d, "y", { duration: 0.12, ease: "power2.out" });
    const rx = gsap.quickTo(r, "x", { duration: 0.55, ease: "power3.out" });
    const ry = gsap.quickTo(r, "y", { duration: 0.55, ease: "power3.out" });

    // Both parts start hidden at the origin; reveal on the first move so
    // there is no stray reticle parked in the top-left corner.
    let revealed = false;

    const onMove = (e: PointerEvent) => {
      if (!revealed) {
        revealed = true;
        gsap.set([d, r], { x: e.clientX, y: e.clientY });
        gsap.to([d, r], { opacity: 1, duration: 0.35, ease: "power2.out" });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };

    const onOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const hot = !!t?.closest?.("[data-hover]");
      gsap.to(r, {
        scale: hot ? 1.7 : 1,
        rotate: hot ? 45 : 0,
        borderColor: hot ? "rgba(127,212,255,0.85)" : "rgba(180,214,255,0.3)",
        duration: 0.45,
        ease: "power3.out",
      });
      gsap.to(d, { scale: hot ? 0 : 1, duration: 0.35, ease: "power3.out" });
    };

    const onLeave = () => {
      gsap.to([d, r], { opacity: 0, duration: 0.3 });
    };
    const onEnter = () => {
      gsap.to([d, r], { opacity: 1, duration: 0.3 });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      delete document.body.dataset.cursor;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  return (
    <>
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[120] h-[5px] w-[5px] rounded-full bg-white opacity-0 mix-blend-difference"
        style={{ marginLeft: -2.5, marginTop: -2.5 }}
      />
      <div ref={ring} aria-hidden className="cursor-reticle">
        <i />
        <i />
        <i />
        <i />
      </div>
    </>
  );
}
