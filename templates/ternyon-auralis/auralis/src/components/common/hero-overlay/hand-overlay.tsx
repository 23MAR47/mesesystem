// 📖 Docs: obsidian/frontend/components/common.md

import { RevealItem, RevealText } from "@/components/common/reveal";

/**
 * Hand-scene overlay body — recreated from the Figma frame "Ternyon" 742:290 (styles/spacing
 * preserved, copy rewritten). Shares `SiteHeader`; cross-faded in by `ScrollFade` while the hand is
 * framed. Anchored like the hero: a **top-left heading** pinned below the header, and a **bottom
 * cluster** pinned to the bottom — tagline + stats on the left, a right-aligned heading on the right.
 *
 * Server component (the reveal wrappers are the client leaves). `pointer-events-none` (nothing here is
 * interactive); type is `font-display`.
 *
 * **Reveal:** driven by the `"hand"` scroll marker — headings letter-by-letter, copy word-by-word,
 * stats as a staggered group — and **reversed** when scrolled back up.
 */

const STATS = [
  { value: "4.9", label: "Client Rating" },
  { value: "240+", label: "Projects Shipped" },
  { value: "16yr", label: "In Practice" },
];

export const HandOverlay = () => {
  return (
    <div className="pointer-events-none absolute inset-0 select-none font-display text-overlay-ink">
      {/* Top-left heading — pinned just below the header. */}
      {/* `TextEngine` forces `position: relative; display: flex` on its own tag, so layout/position
          classes live on a wrapper and the engine only carries typography. */}
      <div className="absolute left-[1.25rem] right-[1.25rem] top-[4.5rem] md:left-[1.875rem] md:right-auto md:top-[4.75rem] md:w-[38rem] md:max-w-[70vw]">
        <RevealText
          tag="h2"
          variant="heading"
          act="hand"
          className="text-[2.25rem] font-extralight uppercase leading-[1.1] md:text-[4rem]"
        >
          Where intent takes form
        </RevealText>
      </div>

      {/* Bottom cluster — pinned to the bottom: tagline + stats (left), heading (right). */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-[1.5rem] px-[1.25rem] pb-[1.25rem] md:px-[1.875rem] md:pb-[2.1875rem]">
        <div className="flex w-full flex-col gap-[1rem] md:w-auto md:gap-[1.75rem]">
          <div className="md:w-[27.5rem] md:max-w-[45vw]">
            <RevealText
              tag="p"
              variant="copy"
              act="hand"
              delayIn={160}
              className="text-[0.8125rem] font-normal uppercase leading-[1.2] md:text-[1rem]"
            >
              Concept, motion, and interface — shaped with the machine, kept unmistakably human.
            </RevealText>
          </div>

          <ul className="flex w-full justify-between font-light md:w-[31.25rem] md:max-w-[52vw]">
            {STATS.map((stat, i) => (
              <RevealItem
                key={stat.label}
                tag="li"
                act="hand"
                index={i}
                count={STATS.length}
                delay={280}
                className="flex flex-col gap-[0.25rem] whitespace-nowrap border-l border-overlay-strong pl-[0.625rem] md:gap-[0.5rem] md:pl-[1rem]"
              >
                <span className="text-[1.125rem] leading-none md:text-[1.5rem]">{stat.value}</span>
                <span className="text-[0.75rem] leading-[1.1] md:text-[1rem]">{stat.label}</span>
              </RevealItem>
            ))}
          </ul>
        </div>

        {/* The engine's tag is a **wrapping flex row**, so a two-line heading can't be two `block`
            spans inside one engine — it gets one engine **per line**, stacked by the outer element,
            which also lets the second line trail the first.
            Dropped below `md`: at phone width a second 4rem heading has nowhere to sit without
            colliding with the stats, and the section already carries its title at the top. */}
        <p className="hidden shrink-0 flex-col items-end whitespace-nowrap text-right text-[4rem] font-extralight uppercase leading-[1.1] md:flex">
          <RevealText tag="span" variant="heading" act="hand" delayIn={80}>
            Studio of the
          </RevealText>
          <RevealText tag="span" variant="heading" act="hand" delayIn={170}>
            next generation
          </RevealText>
        </p>
      </div>
    </div>
  );
};
