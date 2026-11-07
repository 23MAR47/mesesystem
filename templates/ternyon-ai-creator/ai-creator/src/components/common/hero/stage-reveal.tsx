// 📖 Docs: obsidian/frontend/components/common.md

/**
 * Type that resolves unit by unit, in the DOM, from its layer's own reveal.
 *
 * The counterpart to the scene's painted headings (ADR-0083/0084) for the text
 * that has no reason to be inside the canvas — copy that never has to sit behind
 * the model, and copy the scene cannot paint anyway because it wraps onto more
 * than one line.
 *
 * **It animates nothing itself.** Every unit's opacity is a `calc()` over one
 * custom property, `--stage-reveal`, which the layer above it already writes as
 * it fades: one number in, and each unit works out its own share of it. So there
 * is no second clock to keep in step with the first, no per-frame JavaScript per
 * word, and the whole thing survives a re-render because it is only ever CSS.
 *
 * Out-of-range values need no clamping — `opacity` clamps to 0-1 on its own,
 * which is exactly the "not yet / fully here" the stagger wants.
 *
 * The order is scrambled by the same hash the scene uses, so a line resolves
 * unpredictably but *identically* on every arrival: a heading that came back
 * differently the second time would read as a glitch, not as a flourish.
 *
 * Why this is not `spring-text-engine`: the same two conditions as ADR-0084. The
 * text sits in a **pinned** stage, so the engine's scroll-driven modes have no
 * movement to measure, and the only mode that takes an external value is
 * `manual`, which is a hard rule against.
 */

import type { CSSProperties, ElementType } from "react";

import { sceneConfig } from "@/lib/scene/scene.config";

/**
 * A unit's place in the scrambled order, 0-1 — the same hash the scene paints
 * with, so the two mechanisms stagger alike.
 */
const shuffledSeed = (index: number): number => {
  const hash = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return hash - Math.floor(hash);
};

/** Split into words (keeping their spaces attached) or into letters. */
const splitUnits = (text: string, unit: "word" | "letter"): string[] =>
  unit === "word" ? text.split(/(?<=\s)/) : [...text];

export interface StageRevealProps {
  children: string;
  /** What resolves at a time. Display type takes letters, copy takes words. */
  unit?: "word" | "letter";
  /**
   * What a unit is worth before the reveal reaches it, 0–1.
   *
   * Zero — the default — is type that is not there yet. A floor is type that
   * **is** there and has not been inked in: the process steps use it so the
   * reader sees all three columns from the start and watches the later ones
   * come up, rather than meeting three headings that pop into being one at a
   * time.
   */
  floor?: number;
  tag?: ElementType;
  className?: string;
  /** For the block's own rise — see `stageRise`. */
  style?: CSSProperties;
}

export const StageReveal = ({
  children,
  unit = "word",
  floor = 0,
  tag: Tag = "span",
  className,
  style,
}: StageRevealProps) => {
  const units = splitUnits(children, unit);
  const { spread } = sceneConfig.inkLetters;
  const own = Math.max(0.0001, 1 - spread);

  return (
    <Tag className={className} style={style}>
      {/* The real string, for assistive technology and for a crawler. `aria-label`
          would have been shorter and is not reliable here: ARIA prohibits naming
          a paragraph, so the label can simply be dropped and the text with it. */}
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">
        {units.map((piece, index) => (
          <span
            key={`${index}-${piece}`}
            className="inline-block whitespace-pre"
            style={{
              // `max()` rather than a clamp of our own: opacity already clamps
              // the top of the range, so the floor is the only end that needs
              // saying. At floor 0 this is the expression it always was.
              opacity: `max(${floor}, calc((var(--stage-reveal, 1) - ${(
                shuffledSeed(index) * spread
              ).toFixed(4)}) / ${own.toFixed(4)}))`,
            }}
          >
            {piece}
          </span>
        ))}
      </span>
    </Tag>
  );
};
