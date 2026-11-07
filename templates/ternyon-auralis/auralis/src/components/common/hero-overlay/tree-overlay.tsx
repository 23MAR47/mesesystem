// 📖 Docs: obsidian/frontend/components/common.md

import { LiveDot } from "@/components/common/hero-overlay/live-dot";
import { RevealItem, RevealText } from "@/components/common/reveal";

/**
 * Tree-scene (final) overlay body — recreated from the Figma frame "Ternyon" 808:156
 * (styles/spacing preserved, copy rewritten). Shares `SiteHeader`; cross-faded **in** by `ScrollFade`
 * once the tree has fully wiped in (it's the last act, so it never fades out). A **centred heading**
 * near the top, a **tagline pinned to each edge** at mid-height, and a **bottom-centre glass form
 * bar** (Name / Email inputs + a "Start a Project" CTA with a blinking green "live" square — `LiveDot`).
 *
 * `pointer-events-none` so the scene keeps its cursor interaction; only the form re-enables
 * `pointer-events-auto`. Colours are `overlay-*` tokens; type is `font-display`. The form is a visual
 * mock (no backend) — inputs are usable, the button is decorative like the hero CTAs. The bar and its
 * fields are **glass** (`bg-overlay-glass` + `backdrop-blur`); only the CTA is a solid dark fill.
 */

// Finale / contact copy. **Two different lines**, one per edge — the Figma frame repeats a single
// placeholder on both sides, which on the real page just reads as a duplicated paragraph. The left
// states what the studio does with you; the right is the invitation.
//
// Both are written to wrap to **three lines** in the `20rem` column, so the two blocks balance the
// tree between them instead of one hanging shorter than the other. Re-check the wrap if the column
// width or the type scale changes.
const TAGLINE_LEFT =
  "Have something in mind? We shape brands, products, and interactive worlds — research through launch.";
const TAGLINE_RIGHT =
  "Bring a rough idea or a finished brief. Either way the conversation starts in the same place.";

export const TreeOverlay = () => {
  return (
    <div className="pointer-events-none absolute inset-0 select-none font-display text-overlay-ink">
      {/* Heading — centred, near the top (below the header). */}
      {/* `TextEngine` forces `position: relative; display: flex` on its own tag, so layout/position
          classes live on a wrapper and the engine only carries typography. */}
      <div className="absolute left-1/2 top-[4.75rem] -translate-x-1/2 md:top-[6.0625rem]">
        <RevealText
          tag="h2"
          variant="heading"
          act="tree"
          className="whitespace-nowrap text-[2.5rem] font-extralight uppercase leading-[1.1] md:text-[4rem]"
        >
          Envision
        </RevealText>
      </div>

      {/* Taglines — one pinned to each edge at mid-height on desktop. A phone has no room for two
          columns flanking the tree, so it shows a single centred line under the heading instead. */}
      <div className="absolute inset-x-[1.25rem] top-[8.5rem] text-center md:inset-x-auto md:left-[1.875rem] md:top-[calc(50%-1.125rem)] md:w-[20rem] md:max-w-[24vw] md:text-left">
        <RevealText
          tag="p"
          variant="copy"
          act="tree"
          delayIn={160}
          className="justify-center text-[0.8125rem] font-light leading-[1.15] md:justify-start md:text-[1rem] md:leading-[1.1]"
        >
          {TAGLINE_LEFT}
        </RevealText>
      </div>
      <div className="absolute right-[1.875rem] top-[calc(50%-1.125rem)] hidden w-[20rem] max-w-[24vw] text-right md:block">
        <RevealText
          tag="p"
          variant="copy"
          act="tree"
          delayIn={240}
          className="justify-end text-[1rem] font-light leading-[1.1]"
        >
          {TAGLINE_RIGHT}
        </RevealText>
      </div>

      {/* Bottom-centre glass form bar — Name / Email + CTA. The bar is frosted glass
          (`bg-overlay-glass` + a stronger `backdrop-blur-overlay-form`); the CTA stays a solid dark
          fill (per Figma) with a blinking green live square (`LiveDot`). */}
      {/* One row on desktop; on a phone the fields stack above a full-width CTA so nothing is
          squeezed below a tappable size. */}
      <RevealItem
        act="tree"
        delay={340}
        className="pointer-events-auto absolute inset-x-[1.25rem] bottom-[1.25rem] flex flex-col gap-[0.5rem] border border-overlay-edge bg-overlay-glass p-[0.75rem] backdrop-blur-overlay-form md:inset-x-auto md:bottom-[2.5rem] md:left-1/2 md:w-auto md:-translate-x-1/2 md:flex-row md:items-center md:gap-[2.6875rem] md:p-0 md:py-[0.25rem] md:pl-[2rem] md:pr-[0.25rem]"
      >
        <input
          aria-label="Name"
          placeholder="Name"
          className="w-full bg-transparent text-[0.875rem] font-light leading-[1.1] text-overlay-ink outline-none placeholder:text-overlay-strong md:w-[11.25rem] md:text-[1rem]"
        />
        <input
          aria-label="Email"
          type="email"
          placeholder="Email"
          className="w-full bg-transparent text-[0.875rem] font-light leading-[1.1] text-overlay-ink outline-none placeholder:text-overlay-strong md:w-[11.25rem] md:text-[1rem]"
        />
        <button
          type="button"
          className="flex w-full items-center justify-center gap-[0.625rem] whitespace-nowrap bg-overlay-solid px-[1rem] py-[0.75rem] text-[0.875rem] leading-[1.2] transition-opacity hover:opacity-90 md:w-auto md:px-[2.9375rem] md:text-[1rem]"
        >
          Start a Project
          <LiveDot />
        </button>
      </RevealItem>
    </div>
  );
};
