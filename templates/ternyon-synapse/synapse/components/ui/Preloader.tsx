"use client";

import { useEffect, useRef, useState } from "react";

import { BRAND } from "@/lib/content";
import { view } from "@/lib/state";
import { Star } from "./Marks";

/**
 * Holds the page still while the cloud's buffers are generated (a few
 * hundred ms of synchronous work), then hands over to the intro tween:
 * `view.intro` drives the scene's assembly, so loading and the first
 * animation are one continuous motion rather than a spinner then a scene.
 */
export default function Preloader() {
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);
  const bar = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    view.reduced = reduced;

    const root = document.documentElement;
    root.style.overflow = "hidden";

    let raf = 0;
    let done = false;
    const start = performance.now();
    let target = 0.08;

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      view.ready = true;
      root.style.overflow = "";
      document.dispatchEvent(new CustomEvent("synapse:ready"));

      if (reduced) {
        view.intro = 1;
        setGone(true);
        return;
      }

      // the intro is a tween on the shared object, not React state
      const t0 = performance.now();
      const tick = () => {
        const t = Math.min(1, (performance.now() - t0) / 1600);
        view.intro = 1 - Math.pow(1 - t, 3);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      setFading(true);
      window.setTimeout(() => setGone(true), 700);
    };

    const onSceneReady = () => {
      target = 1;
    };
    document.addEventListener("synapse:scene", onSceneReady);

    let shown = 0;
    const loop = () => {
      // creeps toward whatever has actually loaded, never past it
      target = Math.max(target, Math.min(0.92, (performance.now() - start) / 2600));
      shown += (target - shown) * 0.09;
      if (bar.current) bar.current.style.width = `${(shown * 100).toFixed(2)}%`;
      if (shown > 0.995) return finish();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // a WebGL failure must never leave the page locked behind the curtain
    const bail = window.setTimeout(finish, 5200);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(bail);
      document.removeEventListener("synapse:scene", onSceneReady);
      root.style.overflow = "";
    };
  }, []);

  if (gone) return null;

  return (
    <div className="preloader" style={{ opacity: fading ? 0 : 1 }} aria-hidden="true">
      <div className="preloader-inner">
        <Star className="starmark" style={{ fontSize: 22 }} />
        <div className="preloader-bar">
          <i ref={bar} />
        </div>
        <p className="mono" style={{ margin: 0, opacity: 0.5 }}>
          {BRAND}
        </p>
      </div>
    </div>
  );
}
