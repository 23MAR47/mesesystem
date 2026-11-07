// 📖 Docs: obsidian/frontend/components/common.md

import Link from "next/link";

import { MobileMenu } from "./mobile-menu";

/**
 * Persistent site header — the translucent blurred nav bar pinned to the top of the viewport,
 * shared by every scene section (Figma frames 767:162 / 742:290, styles preserved, copy rewritten).
 * Rendered once above the scene so it doesn't flicker as the section overlays cross-fade.
 * Interactive (`pointer-events-auto`); the rest of the overlay stack stays click-through.
 *
 * **Responsive.** The Figma composition — two inline navs flanking a centred, rule-flanked brand —
 * needs the full width, so below `md` it collapses to **brand + burger** (`MobileMenu`, a client leaf;
 * this stays a Server Component). The brand's hairline rules are desktop-only: at phone width they'd
 * squeeze the wordmark to nothing.
 */

const LEFT_NAV = ["Projects", "Studio", "Process"];
const RIGHT_NAV = ["Journal", "About"];

const BRAND = "Auralis";
const CTA = "Say Hello";

export const SiteHeader = () => {
  return (
    <header className="pointer-events-auto fixed inset-x-0 top-0 z-20 flex h-[3.25rem] items-center justify-between border-b border-overlay-line bg-overlay-scrim px-[1.25rem] font-display text-[1rem] leading-[1.1] text-overlay-ink backdrop-blur-overlay-header md:h-[2.625rem] md:px-[1.875rem]">
      <nav aria-label="Primary" className="hidden items-center gap-[2.5rem] md:flex">
        {LEFT_NAV.map((item) => (
          <a key={item} href="#" className="whitespace-nowrap transition-opacity hover:opacity-70">
            {item}
          </a>
        ))}
      </nav>

      {/* Centred on desktop; on mobile it sits at the start of the row, opposite the burger. */}
      <Link
        href="/"
        className="flex items-center gap-[0.5rem] whitespace-nowrap md:absolute md:left-1/2 md:-translate-x-1/2"
      >
        <span
          aria-hidden
          className="hidden h-px w-20 bg-gradient-to-r from-transparent to-overlay-edge md:block"
        />
        {BRAND}
        <span
          aria-hidden
          className="hidden h-px w-20 bg-gradient-to-l from-transparent to-overlay-edge md:block"
        />
      </Link>

      <nav aria-label="Secondary" className="hidden items-center gap-[2.5rem] md:flex">
        {RIGHT_NAV.map((item) => (
          <a key={item} href="#" className="whitespace-nowrap transition-opacity hover:opacity-70">
            {item}
          </a>
        ))}
        <a
          href="#"
          className="whitespace-nowrap underline decoration-from-font underline-offset-2 transition-opacity hover:opacity-70"
        >
          {CTA}
        </a>
      </nav>

      <MobileMenu items={[...LEFT_NAV, ...RIGHT_NAV]} cta={CTA} />
    </header>
  );
};
