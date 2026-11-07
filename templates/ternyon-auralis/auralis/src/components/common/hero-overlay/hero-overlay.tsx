// 📖 Docs: obsidian/frontend/components/common.md

import { RevealItem, RevealText } from "@/components/common/reveal";

/**
 * Hero (X-scene) overlay body — recreated from the Figma frame "Ternyon" 767:162 (styles/spacing
 * preserved, copy rewritten). The shared header lives in `SiteHeader`; this is the section content,
 * cross-faded in by `ScrollFade` while the glyph is on screen:
 *  - the two **hero words** kept at the exact vertical centre of the screen (one pinned to each edge),
 *  - a **footer** pinned to the bottom (capability tags, a hairline, tagline + CTAs).
 *
 * Server component (the reveal wrappers are the client leaves). `pointer-events-none` so the scene
 * keeps its cursor interaction; only the CTA buttons re-enable `pointer-events-auto`. Colours are
 * `overlay-*` tokens; type is `font-display`.
 *
 * **Reveal:** driven by the `"hero"` act window — hero words letter-by-letter, the tagline
 * word-by-word, pills and CTAs as staggered blocks. It's on screen at progress 0, so the intro plays
 * on mount, and it **reverses out** as the X bursts (ahead of the `ScrollFade` block fade).
 *
 * The delays are paced against the glyph's ~1.8 s fly-in (`sequence.intro`): first word as the
 * particle streams arrive, second as the X takes shape, pills → tagline → CTAs landing as it
 * settles — the page *tells* its arrival instead of appearing at once.
 */

const TAGS = ["Generative AI", "Motion Systems", "Realtime 3D", "Brand Identity"];

export const HeroOverlay = () => {
  return (
    <div className="pointer-events-none absolute inset-0 select-none font-display text-overlay-ink">
      {/* Hero words. Desktop pins one to each edge at the exact vertical centre; on a phone that
          composition has no width to work with, so they stack centred above the glyph instead.
          `TextEngine` forces `position: relative; display: flex` on its own tag, so layout/position
          classes live on a wrapper and the engine only carries typography. */}
      <div className="absolute inset-x-[1.25rem] top-[22%] flex flex-col items-center gap-[0.25rem] md:inset-x-auto md:left-[1.875rem] md:top-1/2 md:block md:-translate-y-1/2">
        <RevealText
          act="hero"
          tag="p"
          variant="heading"
          delayIn={200}
          className="whitespace-nowrap text-[2.5rem] font-extralight uppercase leading-[1.1] md:text-[4rem]"
        >
          Imagine
        </RevealText>
        {/* On mobile the second word follows in the same stack; on desktop it moves to its own
            right-pinned block below and this copy is dropped.
            ⚠️ The `md:hidden` must live on this **wrapper**, not on the `RevealText`: `TextEngine`
            forces `display: flex` as an *inline style* on its own tag, which beats any `display`
            utility in `className` — with the class on the engine this word stayed visible on desktop
            and the site showed two MANIFESTs. */}
        <div className="md:hidden">
          <RevealText
            act="hero"
            tag="p"
            variant="heading"
            delayIn={520}
            className="whitespace-nowrap text-[2.5rem] font-extralight uppercase leading-[1.1]"
          >
            Manifest
          </RevealText>
        </div>
      </div>
      <div className="absolute right-[1.875rem] top-1/2 hidden -translate-y-1/2 md:block">
        <RevealText
          act="hero"
          tag="p"
          variant="heading"
          delayIn={520}
          className="whitespace-nowrap text-[4rem] font-extralight uppercase leading-[1.1]"
        >
          Manifest
        </RevealText>
      </div>

      {/* Footer — pinned to the bottom. */}
      <footer className="absolute inset-x-0 bottom-0 px-[1.25rem] pb-[1.25rem] md:px-[1.875rem] md:pb-[1.875rem]">
        {/* Pills: full-width halves on a phone so the row can't overflow; fixed-width on desktop. */}
        <ul className="grid grid-cols-2 gap-[0.5rem] md:w-fit">
          {TAGS.map((tag, i) => (
            <RevealItem
              key={`${tag}-${i}`}
              act="hero"
              tag="li"
              index={i}
              count={TAGS.length}
              delay={950}
              className="flex items-center justify-center whitespace-nowrap bg-overlay-glass px-[0.5rem] py-[0.5rem] text-[0.8125rem] font-light leading-[1.1] backdrop-blur-overlay-glass md:w-[9.5rem] md:px-[1rem] md:text-[1rem]"
            >
              {tag}
            </RevealItem>
          ))}
        </ul>

        <div className="my-[1.25rem] h-px bg-overlay-line md:my-[1.875rem]" />

        {/* Stacked on mobile (copy over full-width CTAs), one row on desktop. */}
        <div className="flex flex-col gap-[1rem] md:flex-row md:items-end md:justify-between md:gap-[1.5rem]">
          {/* 34rem, not 27.5: the line is ~93 uppercase characters, and uppercase runs ~0.6em per
              character, so 27.5rem gave ~46 per line and tipped it into a **third** line. */}
          <div className="md:w-[34rem] md:max-w-[45vw]">
            <RevealText
              act="hero"
              tag="p"
              variant="copy"
              delayIn={1300}
              className="text-[0.8125rem] font-normal uppercase leading-[1.2] md:text-[1rem]"
            >
              Design, systems, and living interfaces. The machine is our medium — the vision stays human.
            </RevealText>
          </div>

          <div className="pointer-events-auto flex shrink-0 items-center gap-[0.5rem] md:gap-[0.75rem]">
            <RevealItem act="hero" index={0} count={2} delay={1600} className="flex-1 md:flex-none">
              <button
                type="button"
                className="flex w-full items-center justify-center whitespace-nowrap bg-overlay-solid px-[1rem] py-[0.75rem] text-[0.8125rem] font-normal leading-[1.1] transition-opacity hover:opacity-90 md:w-[11.1875rem] md:px-[2.9375rem] md:text-[1rem]"
              >
                Begin a Project
              </button>
            </RevealItem>
            <RevealItem act="hero" index={1} count={2} delay={1600} className="flex-1 md:flex-none">
              <button
                type="button"
                className="flex w-full items-center justify-center whitespace-nowrap border border-overlay-edge bg-overlay-glass px-[1rem] py-[0.75rem] text-[0.8125rem] font-normal leading-[1.1] backdrop-blur-overlay-glass transition-colors hover:bg-overlay-line md:w-[11.1875rem] md:px-[2.9375rem] md:text-[1rem]"
              >
                Explore the Work
              </button>
            </RevealItem>
          </div>
        </div>
      </footer>
    </div>
  );
};
