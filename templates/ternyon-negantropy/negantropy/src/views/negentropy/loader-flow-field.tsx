"use client";

import {
  animated,
  easings,
  useSpring,
  useSprings,
} from "@react-spring/web";
import { useEffect, useMemo, useRef, useState } from "react";

import { subscribeToTicker } from "@/lib/animation/ticker";

interface LoaderFlowFieldProps {
  beats: readonly string[];
  /** Time between letters during the in-cascade (out has no stagger). */
  letterStaggerMs?: number;
  /** Per-letter spring duration. */
  letterDurationMs?: number;
  /** Hold time after the sentence is fully visible, before its exit fires. */
  holdMs?: number;
  /** Duration of every-letter slide-further-left-and-fade exit. */
  exitMs?: number;
  /** Delay after the last sentence exits before signalling the reveal. */
  contentRevealDelayMs?: number;
  /** Duration of the canvas background fade. */
  bgFadeMs?: number;
  /** Fires when the page content should begin appearing
   *  (`contentRevealDelayMs` after the last sentence's exit). */
  onReveal?: () => void;
  /** Fires once the background fade lands — loader can be unmounted. */
  onComplete?: () => void;
}

interface FlowParticle {
  x: number;
  y: number;
  px: number;
  py: number;
}

interface BeatLettersProps {
  text: string;
  letterStaggerMs: number;
  letterDurationMs: number;
  holdMs: number;
  exitMs: number;
  onExitComplete: () => void;
}

/**
 * Per-beat letter animator. Mounted with `key={beatIdx}` so each beat gets
 * a fresh `useSprings` with a stable letter count for its lifetime.
 *
 * Cadence per beat:
 *   1. In — letters slide from `x: 1rem → 0` with stagger, fading 0 → 1.
 *   2. Hold — `holdMs`.
 *   3. Out — every letter simultaneously (no stagger) slides further left
 *      to `x: -2.25rem` and fades to 0.
 *   4. `onExitComplete` fires **once** when the out animation lands.
 *
 * Movement is strictly right → left.
 */
const BeatLetters = ({
  text,
  letterStaggerMs,
  letterDurationMs,
  holdMs,
  exitMs,
  onExitComplete,
}: BeatLettersProps) => {
  const letters = useMemo(() => Array.from(text), [text]);
  const onExitRef = useRef(onExitComplete);
  useEffect(() => {
    onExitRef.current = onExitComplete;
  }, [onExitComplete]);

  const [springs, api] = useSprings(letters.length, () => ({
    x: "1rem",
    opacity: 0,
  }));

  useEffect(() => {
    let cancelled = false;
    let outTimer: ReturnType<typeof setTimeout> | undefined;
    let hasFired = false;

    api.start((i) => ({
      to: { x: "0rem", opacity: 1 },
      delay: i * letterStaggerMs,
      config: { duration: letterDurationMs, easing: easings.easeOutQuart },
    }));

    const inDuration =
      Math.max(0, letters.length - 1) * letterStaggerMs + letterDurationMs;

    outTimer = setTimeout(() => {
      if (cancelled) return;
      api.start({
        to: { x: "-2.25rem", opacity: 0 },
        config: { duration: exitMs, easing: easings.easeInQuart },
        onRest: () => {
          // Each letter resolves independently — guard so the callback only
          // fires once per beat.
          if (cancelled || hasFired) return;
          hasFired = true;
          onExitRef.current();
        },
      });
    }, inDuration + holdMs);

    return () => {
      cancelled = true;
      if (outTimer) clearTimeout(outTimer);
    };
  }, [api, letters.length, letterStaggerMs, letterDurationMs, holdMs, exitMs]);

  return (
    <>
      {springs.map((style, i) => (
        <animated.span
          key={i}
          style={{
            ...style,
            display: "inline-block",
            whiteSpace: "pre",
          }}
        >
          {letters[i] === " " ? " " : letters[i]}
        </animated.span>
      ))}
    </>
  );
};

/**
 * Loader: full-bleed Canvas2D flow-field with a beat-by-beat manifesto on top.
 *
 * Lifecycle:
 *   1. **playing** — beats cascade in/out one at a time. Letters travel
 *      strictly right → left.
 *   2. **fading** — last beat's exit landed; fire `onReveal` so the scene
 *      can start appearing underneath, and run the background `bgFadeMs`
 *      opacity fade in parallel.
 *   3. `onComplete` fires when the fade lands — the loader is safe to
 *      unmount; UI content can begin its own reveal then.
 *
 * Background uses `destination-out` per-frame erase so old strokes never
 * pile into a gray haze. rAF goes through the shared ticker.
 */
export const LoaderFlowField = ({
  beats,
  letterStaggerMs = 22,
  letterDurationMs = 320,
  // No hold between in and out — exit fires the instant the
  // in-cascade lands, so the next sentence begins appearing without
  // a dead beat in the middle.
  holdMs = 0,
  exitMs = 360,
  contentRevealDelayMs = 0,
  bgFadeMs = 1500,
  onReveal,
  onComplete,
}: LoaderFlowFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [beatIdx, setBeatIdx] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Refs so the timer can read the latest callbacks without re-running the
  // post-last-beat scheduler effect.
  const onRevealRef = useRef(onReveal);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onRevealRef.current = onReveal;
  }, [onReveal]);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const bgFade = useSpring({
    opacity: isFading ? 0 : 1,
    config: { duration: bgFadeMs, easing: easings.easeInOutQuad },
    onRest: () => {
      if (isFading) onCompleteRef.current?.();
    },
  });

  // Drive the chained sequence: when a beat finishes its exit, either
  // advance to the next or — if it was the last — schedule the reveal +
  // background fade after `contentRevealDelayMs`.
  const handleBeatExitComplete = () => {
    setBeatIdx((idx) => {
      if (idx < beats.length - 1) return idx + 1;
      // Last beat just finished its exit. Hold one second in silence so the
      // empty flow field reads as a breath, then start the reveal + fade.
      window.setTimeout(() => {
        onRevealRef.current?.();
        setIsFading(true);
      }, contentRevealDelayMs);
      return idx;
    });
  };

  // Canvas flow field — bigger curl features, clean black background (no
  // gray haze) via `destination-out` erase compositing.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: FlowParticle[] = [];
    let hue = 200;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Seed the canvas with the loader's container colour so the very
      // first frames don't flash through to whatever sits behind. The
      // running destination-out erase will steadily reveal the container
      // bg under (`bg-negentropy-void` on the wrapper).
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#050608";
      ctx.fillRect(0, 0, width, height);

      const target = Math.min(2800, Math.floor((width * height) / 760));
      particles = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        px: 0,
        py: 0,
      }));
      particles.forEach((p) => {
        p.px = p.x;
        p.py = p.y;
      });
    };

    resize();
    window.addEventListener("resize", resize);

    const TAU = Math.PI * 2;
    const FX = 0.0028;
    const FY = 0.0034;
    const STEP = 2.4;
    const ERASE_ALPHA = 0.055;

    const tick = (time: number) => {
      const t = time * 0.0005;

      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0, 0, 0, ${ERASE_ALPHA})`;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `hsla(${hue}, 75%, 58%, 0.6)`;
      ctx.lineWidth = 1.15;
      ctx.beginPath();

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.px = p.x;
        p.py = p.y;

        const angle = (Math.sin(p.x * FX + t) + Math.cos(p.y * FY - t * 0.7)) * TAU;
        p.x += Math.cos(angle) * STEP;
        p.y += Math.sin(angle) * STEP;

        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.px = p.x;
          p.py = p.y;
          continue;
        }

        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
      }

      ctx.stroke();
      hue = (hue + 0.4) % 360;
    };

    const unsubscribe = subscribeToTicker(tick, () => 0);

    return () => {
      window.removeEventListener("resize", resize);
      unsubscribe();
    };
  }, []);

  return (
    <animated.div
      aria-hidden="true"
      style={bgFade}
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-negentropy-void"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />
      <p
        className="relative max-w-[80vw] px-6 text-center text-[clamp(1.6rem,2.1vw,1.9rem)] font-normal tracking-[0.01em] text-negentropy-bone max-sm:text-[clamp(1.28rem,1.68vw,1.52rem)]"
        style={{ fontFamily: "var(--font-system)" }}
      >
        {!isFading ? (
          <BeatLetters
            key={beatIdx}
            text={beats[beatIdx] ?? ""}
            letterStaggerMs={letterStaggerMs}
            letterDurationMs={letterDurationMs}
            holdMs={holdMs}
            exitMs={exitMs}
            onExitComplete={handleBeatExitComplete}
          />
        ) : null}
      </p>
    </animated.div>
  );
};
