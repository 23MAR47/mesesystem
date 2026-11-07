"use client";

import { animated, useSpring } from "@react-spring/web";

/**
 * The twin-triangle mark at the centre of the hero (Figma node 669:2033).
 *
 * The design is two interlocking triangular outlines. Here each is its own
 * layer and spins clockwise about the shared centre at its own rate — the outer
 * triangle slow, the inner one faster — so the mark reads as a live emblem
 * rather than a static logo. Motion is a `@react-spring/web` loop (hard rule #1:
 * no CSS keyframes); a linear easing keeps each revolution perfectly steady, and
 * `<ReducedMotion>` freezes both via react-spring's global skip flag.
 *
 * Both triangles keep their exact Figma geometry and blue→lilac gradient stroke;
 * only their independent rotation is added.
 */

/** Outer triangle — the broad one rising from the base (Figma paint0). */
const TRIANGLE_OUTER =
  "M59.3499 3.76608C62.2192 -1.2554 69.4601 -1.25532 72.3294 3.76608L122.864 92.2182C125.666 97.1231 122.223 103.207 116.641 103.396L116.373 103.401H15.306L15.0384 103.396C9.45641 103.207 6.01354 97.1231 8.81577 92.2182L59.3499 3.76608ZM71.4613 4.26217C68.9758 -0.0874103 62.7035 -0.0874914 60.2181 4.26217L9.68393 92.7143C7.2181 97.0304 10.3352 102.401 15.306 102.401H116.373C121.344 102.401 124.461 97.0305 121.995 92.7143L71.4613 4.26217Z";
/** Inner triangle — the one leaning off the left edge (Figma paint1). */
const TRIANGLE_INNER =
  "M91.4983 8.69709C96.3418 6.08663 102.228 9.49301 102.413 15.0145L102.418 15.283V117.42C102.418 123.211 96.1849 126.848 91.2219 123.953L3.69262 72.8846C-1.17336 70.0452 -1.22541 63.0161 3.50805 60.035L3.73657 59.8963L91.2649 8.82697L91.4983 8.69709ZM101.422 15.2879C101.422 10.291 96.0601 7.18778 91.761 9.69611L4.23266 60.7645C-0.0659065 63.273 -0.0872374 69.517 4.19458 72.0154L91.7239 123.083C96.0229 125.591 101.422 122.441 101.422 117.425V15.2879Z";

/** Seconds-scaled: the outer ring's full revolution, in ms. */
const OUTER_PERIOD = 16000;
/** The inner ring runs faster, so the two are visibly out of sync. */
const INNER_PERIOD = 9000;

/** Linear, looping 0 → 360° — a steady clockwise spin. */
const spin = (duration: number) => ({
  from: { rotate: 0 },
  to: { rotate: 360 },
  loop: true,
  config: { duration, easing: (t: number) => t },
});

export interface HeroIconProps {
  className?: string;
}

export const HeroIcon = ({ className }: HeroIconProps) => {
  const outer = useSpring(spin(OUTER_PERIOD));
  const inner = useSpring(spin(INNER_PERIOD));

  return (
    <div className={className}>
      <animated.svg
        viewBox="0 0 124 125"
        fill="none"
        aria-hidden="true"
        className="absolute inset-0 size-full"
        style={{
          transformOrigin: "center",
          transform: outer.rotate.to((r) => `rotate(${r}deg)`),
        }}
      >
        <path d={TRIANGLE_OUTER} fill="black" />
        <path d={TRIANGLE_OUTER} fill="url(#hero-icon-outer)" />
        <defs>
          <linearGradient
            id="hero-icon-outer"
            x1="7.82031"
            y1="0"
            x2="131.918"
            y2="10.8003"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4977FF" />
            <stop offset="1" stopColor="#D2BDFF" />
          </linearGradient>
        </defs>
      </animated.svg>

      <animated.svg
        viewBox="0 0 124 125"
        fill="none"
        aria-hidden="true"
        className="absolute inset-0 size-full"
        style={{
          transformOrigin: "center",
          transform: inner.rotate.to((r) => `rotate(${r}deg)`),
        }}
      >
        <path d={TRIANGLE_INNER} fill="black" />
        <path d={TRIANGLE_INNER} fill="url(#hero-icon-inner)" />
        <defs>
          <linearGradient
            id="hero-icon-inner"
            x1="0"
            y1="7.80292"
            x2="109.856"
            y2="15.2501"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4977FF" />
            <stop offset="1" stopColor="#D2BDFF" />
          </linearGradient>
        </defs>
      </animated.svg>
    </div>
  );
};
