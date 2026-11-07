// 📖 Docs: obsidian/frontend/components/common.md

/**
 * The pill of section links and the call to action beside it.
 *
 * Shared by every screen that rides the field — it is the same object in the
 * design each time, in the same place, and duplicating it once per screen is
 * how the four copies drift apart.
 *
 * `pointer-events-auto` on both children: the layer that holds them is
 * `pointer-events-none` so the canvas keeps the pointer for the scene's own
 * mark, and only what is clickable takes it back.
 *
 * **On a phone the four links fold into a disc.** Side by side the pill and the
 * action want about 420px of the design's own proportions, which is wider than
 * the screen — and these four are the only navigation the page has, so dropping
 * them was never on offer. The disc and the action sit in a row, and the links
 * come out of the disc when it is asked.
 *
 * A client component for exactly one reason: that disc has state. Everything
 * else here is still markup.
 */

"use client";

import { useEffect, useId, useState } from "react";

import { Spring } from "@/components/animation/springs/spring";

export interface StageNavContent {
  /** The pill of section links. */
  links: readonly string[];
  /** The call to action beside them. */
  action: { label: string; href: string };
}

const linkHref = (label: string) => `#${label.toLowerCase()}`;

/** The three lines. Spans rather than an SVG: it is three rectangles. */
const BurgerLines = () => (
  <span aria-hidden="true" className="flex w-1/3 flex-col gap-[0.22rem]">
    <span className="block h-px w-full bg-stage-pill-ink" />
    <span className="block h-px w-full bg-stage-pill-ink" />
    <span className="block h-px w-full bg-stage-pill-ink" />
  </span>
);

export const StageNav = ({ content }: { content: StageNavContent }) => {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  // Escape closes it, the way every other disclosure on the web does. Bound
  // only while it is open, so the page carries no listener the rest of the time.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    // No placement of its own. It used to carry `absolute left-1/2 top-[50vw]`
    // from the days when it lived inside a stage frame; kept after the move into
    // `<StageNavBar>` it pushed the bar a half-viewport-width **below** the fixed
    // wrapper holding it — harmless at 900px wide, entirely off-screen at 1900.
    <div className="relative flex items-center gap-[0.1389vw] stacked:gap-3">
      {/* The wide window's pill: all four, in a row, always open. */}
      <nav
        data-nav-shell
        className="pointer-events-auto flex h-frame-control items-center gap-[max(12px,2.2222vw)] rounded-full border border-stage-pill-ink/10 bg-stage-pill px-[max(16px,3.3333vw)] font-serif text-frame-nav leading-none text-stage-pill-ink stacked:hidden"
      >
        {content.links.map((label) => (
          <a key={label} data-nav-item href={linkHref(label)}>
            {label}
          </a>
        ))}
      </nav>

      {/* The phone's disc. `data-nav-shell` like the plates it stands in for, so
          it arrives with them — and being round, the clip's floor *is* its
          shape, so it simply fades where they open. */}
      <button
        type="button"
        data-nav-shell
        data-nav-item
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="pointer-events-auto hidden size-frame-control shrink-0 items-center justify-center rounded-full border border-stage-pill-ink/10 bg-stage-pill stacked:flex"
      >
        <BurgerLines />
      </button>

      {open ? (
        <Spring
          tag="div"
          mode="once"
          from={{ opacity: 0, transform: "translate3d(0, 0.75rem, 0)" }}
          to={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
          className="pointer-events-auto absolute bottom-[calc(100%+0.75rem)] left-0 z-10 hidden stacked:block"
        >
          <nav
            id={menuId}
            className="flex flex-col gap-1 rounded-3xl border border-stage-pill-ink/10 bg-stage-pill px-6 py-4 font-serif text-frame-nav leading-none text-stage-pill-ink"
          >
            {content.links.map((label) => (
              <a
                key={label}
                href={linkHref(label)}
                onClick={() => setOpen(false)}
                className="py-2"
              >
                {label}
              </a>
            ))}
          </nav>
        </Spring>
      ) : null}

      <a
        data-nav-item
        data-nav-shell
        data-nav-from-left
        href={content.action.href}
        className="pointer-events-auto flex h-frame-control items-center justify-center rounded-full bg-stage-accent px-[max(24px,3.3333vw)] font-serif text-frame-nav leading-none text-stage-accent-foreground transition-opacity duration-[var(--duration-fast)] ease-entrance hover:opacity-90 stacked:flex-1"
      >
        {content.action.label}
      </a>
    </div>
  );
};
