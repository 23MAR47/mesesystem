"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

import { view } from "@/lib/state";
import { BACKGROUND } from "@/lib/theme";

/**
 * Holds the frame while the part geometry is generated, then lifts and
 * hands off to the intro tween that fades the assembled camera up out
 * of the dark.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const finish = () => {
      view.intro = 1;
      document.dispatchEvent(new CustomEvent("aperture:ready"));
      view.ready = true;
      setMounted(false);
      document.documentElement.style.removeProperty("overflow");
    };

    if (reduced) {
      finish();
      return;
    }

    document.documentElement.style.overflow = "hidden";

    const counter = { n: 0 };
    const intro = { v: 0 };

    const tl = gsap.timeline();

    tl.to(counter, {
      n: 100,
      duration: 1.7,
      ease: "power2.inOut",
      onUpdate() {
        const v = Math.round(counter.n);
        if (num.current) num.current.textContent = String(v).padStart(3, "0");
        if (bar.current) bar.current.style.transform = `scaleX(${v / 100})`;
      },
    })
      .to(root.current, { yPercent: -100, duration: 1.15, ease: "expo.inOut" }, "+=0.15")
      // The glass resolves out of the dark as the curtain clears.
      .to(
        intro,
        {
          v: 1,
          duration: 2.1,
          ease: "power2.out",
          onUpdate() {
            view.intro = intro.v;
          },
        },
        "<0.1"
      )
      .add(() => {
        document.documentElement.style.removeProperty("overflow");
        document.dispatchEvent(new CustomEvent("aperture:ready"));
        view.ready = true;
      }, "<0.45")
      .add(() => setMounted(false));

    return () => {
      tl.kill();
      document.documentElement.style.removeProperty("overflow");
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[200] flex flex-col justify-between px-7 py-7"
      style={{ background: BACKGROUND }}
    >
      <div className="flex items-start justify-between">
        <span className="mono-label text-white/70">APERTURE</span>
        <span className="mono-label text-white/40">An instrument of light</span>
      </div>

      <div className="flex items-end justify-between gap-8">
        <span
          ref={num}
          className="font-mono text-[clamp(3.5rem,13vw,10rem)] font-light leading-[0.85] tracking-[-0.05em] tabular-nums"
        >
          000
        </span>
        <span className="mono-label mb-3 hidden text-right text-white/40 sm:block">
          Grinding
          <br />
          the elements
        </span>
      </div>

      <div className="h-px w-full overflow-hidden bg-white/10">
        <div ref={bar} className="h-full w-full origin-left scale-x-0 bg-[#7fd4ff]" />
      </div>
    </div>
  );
}
