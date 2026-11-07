"use client";

import { easings } from "@react-spring/web";
import { useMemo } from "react";

import { Spring } from "@/components/animation/springs/spring";

interface HeadlineLinesProps {
  lines: readonly string[];
  /** Word inside `lines` to render italic. Case-insensitive match. */
  italicWord?: string;
  /** Optional emphasis-only word — rendered with `text-negentropy-amber`. */
  accentWord?: string;
  /** Per-letter delay within a line. */
  letterStaggerMs?: number;
  /** Extra gap between lines. */
  lineGapMs?: number;
  /** Per-letter spring duration. */
  letterDurationMs?: number;
  /** Wait before the cascade starts (let parent fade-in complete). */
  initialDelayMs?: number;
  className?: string;
}

interface LetterToken {
  char: string;
  italic: boolean;
  accent: boolean;
}

/**
 * Multi-line headline that animates letter-by-letter from a small right
 * offset (right → left), with extra delay between lines. Optionally
 * italicises one word in the headline ("is" in the §I hero) and accents
 * one word with the brand amber.
 *
 * Implemented as one project-vetted `<Spring mode="once">` per letter so
 * the in-cascade runs exactly once on mount and the letters stay at
 * their `to` state forever after. (An earlier custom `useSprings`
 * implementation appeared to occasionally settle back toward `from` in
 * dev — switched to the engine's `Spring` primitive which has
 * deterministic mode-once behaviour.)
 */
export const HeadlineLines = ({
  lines,
  italicWord,
  accentWord,
  letterStaggerMs = 22,
  lineGapMs = 220,
  letterDurationMs = 620,
  initialDelayMs = 350,
  className,
}: HeadlineLinesProps) => {
  const linesTokens = useMemo<LetterToken[][]>(() => {
    return lines.map((line) => {
      const chars = Array.from(line);
      const lower = line.toLowerCase();

      const italicStart = italicWord
        ? lower.indexOf(italicWord.toLowerCase())
        : -1;
      const italicEnd =
        italicStart >= 0 ? italicStart + (italicWord?.length ?? 0) : -1;

      const accentStart = accentWord
        ? lower.indexOf(accentWord.toLowerCase())
        : -1;
      const accentEnd =
        accentStart >= 0 ? accentStart + (accentWord?.length ?? 0) : -1;

      return chars.map((char, i) => ({
        char,
        italic: italicStart >= 0 && i >= italicStart && i < italicEnd,
        accent: accentStart >= 0 && i >= accentStart && i < accentEnd,
      }));
    });
  }, [lines, italicWord, accentWord]);

  return (
    <h2 className={className}>
      {linesTokens.map((line, lineIdx) => (
        <span key={lineIdx} className="block">
          {line.map((token, i) => {
            const delay = initialDelayMs + lineIdx * lineGapMs + i * letterStaggerMs;
            const isSpace = token.char === " ";
            return (
              <Spring
                key={i}
                tag="span"
                mode="once"
                from={{ x: "1rem", opacity: 0 }}
                to={{ x: "0rem", opacity: 1 }}
                delayIn={delay}
                config={{
                  duration: letterDurationMs,
                  easing: easings.easeOutQuart,
                }}
                style={{
                  display: "inline-block",
                  whiteSpace: "pre",
                  fontStyle: token.italic ? "italic" : "normal",
                }}
                className={token.accent ? "text-negentropy-amber" : undefined}
              >
                {isSpace ? " " : token.char}
              </Spring>
            );
          })}
        </span>
      ))}
    </h2>
  );
};
