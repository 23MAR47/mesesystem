"use client";

import { animated, useSpring } from "@react-spring/web";

import { easeReveal } from "@/utils/animation/easing";

/**
 * Per-letter reveal for the masthead lines: each letter flies up from below with
 * a blur and opacity ramp. Because the line's gradient (`background-clip: text`)
 * cannot survive splitting into per-letter spans, each letter instead takes a
 * SOLID colour sampled from that gradient — white at the opaque end, the pale haze
 * at the transparent end — which reads as the same ramp. The cascade starts at the
 * OPAQUE end of each line and travels toward the transparent one, so the two
 * mirrored lines animate inward from their two bright corners.
 *
 * react-spring drives every letter (hard rule #1 — spring motion). `spring-text-
 * engine` is used for plain-colour copy (`AnimatedText`); it is skipped here only
 * because of the gradient + directional-cascade requirement.
 */

const START = { opacity: 0, y: 34, filter: "blur(12px)" } as const;
const END = { opacity: 1, y: 0, filter: "blur(0px)" } as const;
const CONFIG = { duration: 1100, easing: easeReveal } as const;

/** Gradient endpoints: opaque white → the haze (`#c8d6ff` at 0.2), as in the CSS. */
const OPAQUE = [255, 255, 255, 1] as const;
const HAZE = [200, 214, 255, 0.2] as const;

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const sampleColor = (t: number): string =>
  `rgba(${Math.round(lerp(OPAQUE[0], HAZE[0], t))}, ${Math.round(
    lerp(OPAQUE[1], HAZE[1], t),
  )}, ${Math.round(lerp(OPAQUE[2], HAZE[2], t))}, ${lerp(
    OPAQUE[3],
    HAZE[3],
    t,
  ).toFixed(3)})`;

export interface HeadingLine {
  text: string;
  /** The opaque (bright) end of this line's gradient — the cascade starts here. */
  opaque: "left" | "right";
}

const Letter = ({
  char,
  color,
  delay,
  enabled,
}: {
  char: string;
  color: string;
  delay: number;
  enabled: boolean;
}) => {
  const style = useSpring({
    from: START,
    to: enabled ? END : START,
    delay: enabled ? delay : 0,
    config: CONFIG,
  });
  return (
    <animated.span
      style={{
        ...style,
        display: "inline-block",
        whiteSpace: "pre",
        color,
        willChange: "transform, filter, opacity",
      }}
    >
      {char}
    </animated.span>
  );
};

export interface AnimatedHeadingProps {
  lines: HeadingLine[];
  enabled: boolean;
  className?: string;
  id?: string;
  tag?: "h1" | "h2";
  baseDelay?: number;
  stagger?: number;
}

export const AnimatedHeading = ({
  lines,
  enabled,
  className,
  id,
  tag = "h2",
  baseDelay = 150,
  stagger = 42,
}: AnimatedHeadingProps) => {
  const Tag = tag;
  return (
    <Tag
      id={id}
      className={className}
      aria-label={lines.map((l) => l.text).join(" ")}
    >
      {lines.map((line, li) => {
        const chars = [...line.text];
        const n = Math.max(1, chars.length - 1);
        return (
          <span
            key={li}
            aria-hidden="true"
            style={{ display: "block", whiteSpace: "nowrap" }}
          >
            {chars.map((ch, i) => {
              const along = i / n;
              const t = line.opaque === "left" ? along : 1 - along;
              const order = line.opaque === "left" ? i : chars.length - 1 - i;
              return (
                <Letter
                  key={i}
                  char={ch === " " ? " " : ch}
                  color={sampleColor(t)}
                  delay={baseDelay + order * stagger}
                  enabled={enabled}
                />
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
};
