"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { animated, useSpring } from "@react-spring/web";

/** The frame at the 1440 design base, and the ratio it keeps everywhere else. */
const FRAME_W = 460;
const FRAME_RATIO = 288 / 460;
/** Never wider than the comp, never so narrow the photograph stops reading. */
const FRAME_MIN = 240;
const FRAME_SHARE = 0.32;
const TICK = 15;

/** The frame follows the viewport instead of sitting at a fixed 460px, so it
 *  keeps the same presence at 1024, 768 and on a phone. */
const frameFor = (width: number) => {
  const w = Math.round(
    Math.max(FRAME_MIN, Math.min(width * FRAME_SHARE, FRAME_W)),
  );
  return { w, h: Math.round(w * FRAME_RATIO) };
};
/** One arrival at a time reads as loading; a warm cache would otherwise blink. */
const STEP_MS = 150;
const MIN_MS = 900;
const MAX_MS = 7000;

/** The first screen's own photographs — exactly what the visitor is waiting for. */
const SHOTS = [
  { src: "/assets/hero/modular-sofa.png", alt: "Modular sofa" },
  { src: "/assets/hero/collection-chair.png", alt: "Lounge chair" },
  { src: "/assets/hero/new-arrival-1.png", alt: "Sideboard" },
  { src: "/assets/hero/dining-chair.png", alt: "Dining chair" },
  { src: "/assets/hero/new-arrival-2.png", alt: "Dining table" },
] as const;

const CORNERS = [
  { key: "tl", edges: "border-l border-t", pos: "left-0 top-0" },
  { key: "tr", edges: "border-r border-t", pos: "right-0 top-0" },
  { key: "bl", edges: "border-l border-b", pos: "bottom-0 left-0" },
  { key: "br", edges: "border-r border-b", pos: "bottom-0 right-0" },
] as const;

/**
 * Preloader — the viewfinder, variant P4.
 *
 * The frame is the progress bar. Its four corner ticks extend along the edges
 * as the first screen's photographs decode, and at 100% they meet and close the
 * rectangle: the frame completing *is* the loading finishing. Under it the plain
 * percentage, so there is never any doubt about what the screen is doing.
 *
 * What it frames is the site's own content. Each photograph drops in as it
 * actually finishes decoding, one at a time, so the visitor spends the wait
 * looking at the furniture instead of at a spinner. Nothing here runs on a
 * timer pretending to be a loader.
 *
 * Then it opens. The rails retract back into corner ticks, the ticks travel
 * outward past the edges and the veil goes with them — a shutter opening onto
 * the page rather than a frame that darts off somewhere. An earlier cut flew
 * the frame to the pointer to become the cursor; on screen that read as
 * something leaving, not something arriving, so it went.
 *
 * Reduced motion skips the whole thing.
 */
export const Preloader = () => {
  const [done, setDone] = useState(false);
  const [shown, setShown] = useState(0);

  const [style, api] = useSpring(() => ({
    pct: 0,
    w: FRAME_W,
    h: Math.round(FRAME_W * FRAME_RATIO),
    armX: TICK,
    armY: TICK,
    content: 0,
    veil: 1,
    frame: 1,
    config: { mass: 1.6, tension: 150, friction: 26 },
  }));

  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const release = () => {
      window.__haldenReady = true;
      dispatchEvent(new Event("halden:ready"));
    };
    /** The shutter starting to lift — what the first screen arrives with. */
    const open = () => {
      window.__haldenOpening = true;
      dispatchEvent(new Event("halden:opening"));
    };

    if (calm) {
      release();
      setDone(true);
      return;
    }

    document.body.style.overflow = "hidden";
    api.start({ content: 1 });

    // Size to this viewport, and keep following it if the window changes while
    // the page is still loading.
    let frame = frameFor(window.innerWidth);
    api.set({ w: frame.w, h: frame.h });
    const onResize = () => {
      frame = frameFor(window.innerWidth);
      if (!finished) api.start({ w: frame.w, h: frame.h });
    };
    window.addEventListener("resize", onResize);

    // Real readiness: the five photographs plus the font faces, counted as one
    // unit each, so the percentage is the share of the work actually finished.
    const UNITS = SHOTS.length + 1;
    let fontsReady = false;
    void document.fonts.ready.then(() => {
      fontsReady = true;
    });

    let arrived = 0;
    let released = 0;
    let last = 0;
    SHOTS.forEach((shot) => {
      const img = new window.Image();
      img.src = shot.src;
      const mark = () => {
        arrived += 1;
      };
      void img.decode().then(mark, mark);
    });

    const started = performance.now();
    const timers: number[] = [];
    let finished = false;

    const finish = () => {
      finished = true;
      // The closed frame snaps once — a tighter target on a loose spring.
      api.start({ pct: 100, config: { tension: 320, friction: 34 } });
      const snapW = frame.w - Math.round(frame.w * 0.048);
      const snapH = frame.h - Math.round(frame.h * 0.049);
      api.start({
        w: snapW,
        h: snapH,
        armX: snapW / 2,
        armY: snapH / 2,
        config: { mass: 1, tension: 320, friction: 15 },
      });
      timers.push(
        window.setTimeout(() => {
          // Unlock: the rails run back into ticks and the picture lets go.
          api.start({ content: 0, config: { tension: 200, friction: 30 } });
          api.start({
            armX: TICK,
            armY: TICK,
            config: { mass: 1, tension: 220, friction: 30 },
          });
        }, 300),
      );
      timers.push(
        window.setTimeout(() => {
          // Open: the ticks carry past the edges and take the veil with them.
          api.start({
            w: innerWidth * 1.6,
            h: innerHeight * 1.6,
            config: { mass: 1.4, tension: 130, friction: 30 },
          });
          api.start({ veil: 0, config: { tension: 120, friction: 28 } });
          api.start({
            frame: 0,
            delay: 420,
            config: { tension: 170, friction: 30 },
          });
        }, 520),
      );
      timers.push(
        // The first screen is let go while the veil is on its way out, so its
        // arrival lands just as the page is uncovered — measured, not guessed:
        // the veil is half gone by ~730ms and clear by ~1080ms. Earlier and the
        // arrival plays out behind a curtain; later and the page sits empty.
        window.setTimeout(open, 620),
      );
      timers.push(
        window.setTimeout(() => {
          release();
          setDone(true);
        }, 1420),
      );
    };

    const tick = window.setInterval(() => {
      const now = performance.now();
      if (!finished && released < arrived && now - last >= STEP_MS) {
        released += 1;
        last = now;
        setShown(released);
      }
      const p = (released + (fontsReady ? 1 : 0)) / UNITS;
      // The number rides a tighter spring than the rails: on the page's own
      // weighted config it still read 99% at the moment the frame closed.
      api.start({ pct: p * 100, config: { tension: 260, friction: 34 } });
      // Ticks grow along the edges until the four corners meet and close it.
      api.start({
        armX: TICK + (frame.w / 2 - TICK) * p,
        armY: TICK + (frame.h / 2 - TICK) * p,
      });
      const elapsed = now - started;
      const ready =
        released === SHOTS.length && fontsReady && elapsed >= MIN_MS;
      if (!finished && (ready || elapsed >= MAX_MS)) {
        window.clearInterval(tick);
        finish();
      }
    }, 40);

    return () => {
      window.clearInterval(tick);
      timers.forEach(window.clearTimeout);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "";
    };
  }, [api]);

  useEffect(() => {
    if (done) document.body.style.overflow = "";
  }, [done]);

  if (done) return null;

  return (
    <div
      id="preloader"
      role="status"
      aria-live="polite"
      aria-label="Loading Halden"
      className="pointer-events-none fixed inset-0 z-[100]"
    >
      <animated.div
        aria-hidden
        className="absolute inset-0 bg-background"
        style={{ opacity: style.veil }}
      />
      <animated.div
        aria-hidden
        className="absolute left-1/2 top-1/2"
        style={{
          width: style.w,
          height: style.h,
          opacity: style.frame,
          // Centred by CSS, nudged by the springs — so the server-rendered frame
          // is already in the middle instead of flashing in the top-left corner.
          transform: "translate(-50%, -50%)",
        }}
      >
        <animated.div
          className="absolute inset-[0.3125rem] overflow-hidden"
          style={{ opacity: style.content }}
        >
          {SHOTS.map((shot, index) => (
            <Image
              key={shot.src}
              src={shot.src}
              alt={shot.alt}
              fill
              sizes="32vw"
              priority={index === 0}
              className={`object-cover transition-opacity duration-[var(--duration-normal)] ease-entrance ${
                index === shown - 1 ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </animated.div>

        {CORNERS.map((corner) => (
          <animated.span
            key={corner.key}
            className={`absolute block border-foreground-accent ${corner.pos} ${corner.edges}`}
            style={{
              width: style.armX,
              height: style.armY,
              borderWidth: 0,
              borderLeftWidth: corner.edges.includes("border-l") ? 1.4 : 0,
              borderRightWidth: corner.edges.includes("border-r") ? 1.4 : 0,
              borderTopWidth: corner.edges.includes("border-t") ? 1.4 : 0,
              borderBottomWidth: corner.edges.includes("border-b") ? 1.4 : 0,
            }}
          />
        ))}

        <animated.div
          aria-hidden
          className="absolute -bottom-[2.125rem] left-0 flex w-full items-baseline justify-between text-foreground-accent"
          style={{ opacity: style.content }}
        >
          <span className="font-display text-[1.125rem] font-bold uppercase leading-none tracking-[0.16em] [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]">
            Halden
          </span>
          <animated.span className="font-serif text-body uppercase leading-none tracking-[0.08em] [font-variant-numeric:tabular-nums] [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]">
            {style.pct.to(
              (v) => `${Math.min(100, Math.max(0, Math.round(v)))}%`,
            )}
          </animated.span>
        </animated.div>
      </animated.div>
    </div>
  );
};
