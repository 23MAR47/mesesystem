"use client";

import { NAV_LINKS } from "@/lib/content";
import Arrow from "./Arrow";

/** An aperture: six blades around an opening. */
function Mark() {
  const blades = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * Math.PI * 2;
    const x = 12 + Math.cos(a) * 7.4;
    const y = 12 + Math.sin(a) * 7.4;
    const x2 = 12 + Math.cos(a + 1.05) * 7.4;
    const y2 = 12 + Math.sin(a + 1.05) * 7.4;
    return (
      <path
        key={i}
        d={`M${x.toFixed(2)} ${y.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)} L12 12 Z`}
      />
    );
  });

  return (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8.4" />
        {blades}
      </g>
    </svg>
  );
}

/**
 * A wide rectangular bar rather than a floating pill.
 *
 * It sits on the same measure as the section panels, so the page has a
 * single vertical edge running from the nav down through every headline
 * — a pill floating on its own centre line breaks that alignment, which
 * is the main reason it reads as a widget stuck on top of the layout
 * instead of part of it. Square corners and a hairline progress fill
 * along the bottom edge put it in the same family as the viewfinder
 * overlay and the specification table.
 */
export default function Nav() {
  return (
    <header className="nav-shell">
      <nav className="nav-bar">
        <a href="#top" data-hover className="nav-brand">
          <span className="nav-brand__mark">
            <Mark />
          </span>
          <span className="nav-brand__name">APERTURE</span>
          <span className="nav-brand__rule" aria-hidden />
          <span className="nav-brand__model">One</span>
        </a>

        <ul className="nav-links">
          {NAV_LINKS.map((l) => (
            <li key={l}>
              <a href="#" data-hover className="nav-link">
                {l}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <a href="#" data-hover className="nav-ghost">
            Dealers
          </a>
          <span className="nav-div" aria-hidden />
          <a href="#" data-hover className="nav-cta">
            <span>Reserve</span>
            <span className="nav-cta__arrow">
              <Arrow />
              <Arrow />
            </span>
          </a>
        </div>

        {/* Scroll position, written by the scroll engine. */}
        <span className="nav-progress" aria-hidden>
          <i data-nav-fill />
        </span>
      </nav>
    </header>
  );
}
