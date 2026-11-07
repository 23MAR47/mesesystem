"use client";

import TextEngine from "spring-text-engine";

import { SOFT, SOFT_SNAPPY } from "./hero-motion";
import { usePreloader } from "./preloader-store";

interface HeroHeadingProps {
  lines: readonly [string, string];
  className?: string;
  delayIn?: number;
  /** Letter tracking (em). Tightened on mobile so each line fits one row. */
  columnGap?: number;
}

const HEADING_LETTER_IN = { y: 0, opacity: 1, filter: "blur(0px)" };
const HEADING_LETTER_OUT = { y: 26, opacity: 0, filter: "blur(8px)" };

/**
 * The hero <h1>. Until the preloader reveals, it renders as plain hidden text
 * (`opacity: 0`) so it stays in the DOM for SEO and reserves layout. On reveal
 * it mounts the animated TextEngine, which plays its letter-by-letter entrance
 * (rise + blur + opacity). Each line is its own block so the two-line break and
 * the Light / Regular weights are guaranteed. (TextEngine's `enabled` shows the
 * end state rather than hiding, so a mount swap is used instead.)
 */
export const HeroHeading = ({
  lines,
  className,
  delayIn = 0,
  columnGap = 0.15,
}: HeroHeadingProps) => {
  const isRevealed = usePreloader((state) => state.isRevealed);

  if (!isRevealed) {
    return (
      <h1 className={className} style={{ opacity: 0 }}>
        <span className="block whitespace-nowrap font-light">{lines[0]}</span>
        <span className="block whitespace-nowrap font-normal">{lines[1]}</span>
      </h1>
    );
  }

  return (
    <h1 className={className}>
      <TextEngine
        tag="span"
        mode="once"
        className="flex justify-center font-light"
        letterOut={HEADING_LETTER_OUT}
        letterIn={HEADING_LETTER_IN}
        letterStagger={16}
        letterConfig={SOFT}
        columnGap={columnGap}
        delayIn={delayIn}
      >
        {lines[0]}
      </TextEngine>
      <TextEngine
        tag="span"
        mode="once"
        className="flex justify-center font-normal"
        letterOut={HEADING_LETTER_OUT}
        letterIn={HEADING_LETTER_IN}
        letterStagger={16}
        letterConfig={SOFT}
        columnGap={columnGap}
        delayIn={delayIn + 260}
      >
        {lines[1]}
      </TextEngine>
    </h1>
  );
};

interface HeroTextProps {
  text: string;
  className?: string;
  delayIn?: number;
}

/** Body copy — hidden plain text until reveal, then word-by-word fade-up. */
export const HeroSubheading = ({
  text,
  className,
  delayIn = 0,
}: HeroTextProps) => {
  const isRevealed = usePreloader((state) => state.isRevealed);

  if (!isRevealed) {
    return (
      <p className={className} style={{ opacity: 0 }}>
        {text}
      </p>
    );
  }

  return (
    <TextEngine
      tag="p"
      mode="once"
      className={className}
      wordOut={{ y: 14, opacity: 0, filter: "blur(5px)" }}
      wordIn={{ y: 0, opacity: 1, filter: "blur(0px)" }}
      wordStagger={22}
      wordConfig={SOFT_SNAPPY}
      columnGap={0.19}
      delayIn={delayIn}
    >
      {text}
    </TextEngine>
  );
};

/** Panel overline — hidden plain text until reveal, then word-by-word fade. */
export const HeroOverline = ({
  text,
  className,
  delayIn = 0,
}: HeroTextProps) => {
  const isRevealed = usePreloader((state) => state.isRevealed);

  if (!isRevealed) {
    return (
      <p className={className} style={{ opacity: 0 }}>
        {text}
      </p>
    );
  }

  return (
    <TextEngine
      tag="p"
      mode="once"
      className={className}
      wordOut={{ y: 10, opacity: 0, filter: "blur(4px)" }}
      wordIn={{ y: 0, opacity: 1, filter: "blur(0px)" }}
      wordStagger={16}
      wordConfig={SOFT}
      columnGap={0.19}
      delayIn={delayIn}
    >
      {text}
    </TextEngine>
  );
};
