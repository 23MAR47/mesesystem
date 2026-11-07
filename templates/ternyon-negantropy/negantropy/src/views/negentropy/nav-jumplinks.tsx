"use client";

import { easings } from "@react-spring/web";
import { useState } from "react";

import { Inview } from "@/components/animation/springs/in-view";
import { Spring } from "@/components/animation/springs/spring";
import type { NavItem } from "@/data/mocks/negentropy";

interface NavJumplinksProps {
  items: readonly NavItem[];
}

const linkClass =
  "group inline-flex items-center gap-2 uppercase tracking-[0.22em] text-negentropy-bone-muted transition-colors hover:text-negentropy-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-negentropy-amber";

const arrowClass =
  "text-negentropy-bone/50 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-negentropy-amber";

const burgerLineConfig = { duration: 320, easing: easings.easeOutQuart };

/**
 * Section navigation. Two presentations sharing one item list:
 *
 *   - **≥ sm**: a fixed top-right jumplink stack — small uppercase
 *     labels with an arrow glyph, in the IRIS_AI corner-meta
 *     vocabulary.
 *   - **< sm**: a burger toggle (top-right, mirroring the brand mark's
 *     offset) that springs a full-screen overlay menu open. The
 *     burger lines and the overlay both animate via `<Spring>` driven
 *     by `open` state — no CSS keyframes (hard rule #1). Hover-colour
 *     transitions match the existing jumplink styling.
 *
 * Each link is a real `<a href="#section-id">` so smooth scroll picks
 * them up (handled by the project's Lenis layout). Tapping a link in
 * the overlay also closes it.
 */
export const NavJumplinks = ({ items }: NavJumplinksProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ≥ sm — fixed jumplink stack */}
      <nav
        aria-label="Section navigation"
        className="fixed right-16 top-16 z-40 hidden flex-col items-end gap-2 sm:flex"
      >
        {items.map((item, index) => (
          <Inview
            key={item.href}
            tag="div"
            mode="once"
            from={{ opacity: 0, y: 8 }}
            to={{ opacity: 1, y: 0 }}
            delayIn={300 + index * 80}
            config={{ duration: 600, easing: easings.easeOutQuart }}
          >
            <a href={item.href} className={`${linkClass} text-sm`}>
              <span>{item.label}</span>
              <span aria-hidden="true" className={arrowClass}>
                ↗
              </span>
            </a>
          </Inview>
        ))}
      </nav>

      {/* < sm — burger toggle + overlay menu */}
      <div className="sm:hidden">
        <button
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="fixed right-8 top-8 z-50 h-6 w-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-negentropy-amber"
        >
          <Spring
            tag="span"
            mode="always"
            enabled={open}
            from={{ y: -4, rotate: 0 }}
            to={{ y: 0, rotate: 45 }}
            config={burgerLineConfig}
            className="absolute left-0 top-1/2 h-px w-6 bg-negentropy-bone"
          />
          <Spring
            tag="span"
            mode="always"
            enabled={open}
            from={{ y: 4, rotate: 0 }}
            to={{ y: 0, rotate: -45 }}
            config={burgerLineConfig}
            className="absolute left-0 top-1/2 h-px w-6 bg-negentropy-bone"
          />
        </button>

        <Spring
          tag="nav"
          aria-label="Section navigation"
          mode="always"
          enabled={open}
          from={{ opacity: 0 }}
          to={{ opacity: 1 }}
          config={{ duration: 400, easing: easings.easeOutQuart }}
          style={{ pointerEvents: open ? "auto" : "none" }}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-negentropy-void/95"
        >
          {items.map((item, index) => (
            <Spring
              key={item.href}
              tag="div"
              mode="always"
              enabled={open}
              from={{ opacity: 0, y: 12 }}
              to={{ opacity: 1, y: 0 }}
              delayIn={120 + index * 60}
              config={{ duration: 500, easing: easings.easeOutQuart }}
            >
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className={`${linkClass} text-lg`}
              >
                <span>{item.label}</span>
                <span aria-hidden="true" className={arrowClass}>
                  ↗
                </span>
              </a>
            </Spring>
          ))}
        </Spring>
      </div>
    </>
  );
};
