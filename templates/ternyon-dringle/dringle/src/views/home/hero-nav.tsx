import Image from "next/image";
import Link from "next/link";

import type { HeroContent } from "@/data/mocks/home";
import { Hover } from "@/components/animation/springs/hover";

import { dropIn, hoverDim, hoverLift, HOVER, SOFT } from "./hero-motion";
import { Reveal } from "./reveal";

interface HeroNavProps {
  nav: HeroContent["nav"];
}

/** Floating top navigation pill — logo, centred links, Contact button. Drops
 *  in from above on load. */
export const HeroNav = ({ nav }: HeroNavProps) => {
  return (
    <Reveal
      tag="header"
      mode="once"
      from={dropIn.from}
      to={dropIn.to}
      config={SOFT}
      delayIn={80}
      className="absolute left-[0.625rem] top-[0.625rem] z-20 h-[3.1875rem] w-[43.75rem] rounded-full bg-white"
    >
      <Link
        href={nav.logo.href}
        aria-label={nav.logo.alt}
        className="absolute left-[1.03125rem] top-1/2 -translate-y-1/2"
      >
        <Image
          src={nav.logo.src}
          alt={nav.logo.alt}
          width={87}
          height={26}
          priority
          unoptimized
          className="h-[1.625rem] w-[5.4375rem]"
        />
      </Link>

      <nav
        aria-label="Primary"
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-[2rem] text-[1rem] leading-[1.2] text-ink-strong"
      >
        {nav.links.map((link) => (
          <Hover
            key={link.href}
            tag="span"
            from={hoverDim.from}
            to={hoverDim.to}
            config={HOVER}
          >
            <Link href={link.href}>{link.label}</Link>
          </Hover>
        ))}
      </nav>

      {/* Positioning stays on this static wrapper; the Hover owns the transform
          so its lift/scale never fights the vertical-centring translate. */}
      <div className="absolute right-[0.5625rem] top-1/2 -translate-y-1/2">
        <Hover
          tag="div"
          from={hoverLift.from}
          to={hoverLift.to}
          config={HOVER}
          className="inline-flex"
        >
          <Link
            href={nav.contact.href}
            className="block rounded-full border border-hairline bg-white px-[1.5rem] py-[0.625rem] text-[1rem] leading-[1.2] text-ink-strong"
          >
            {nav.contact.label}
          </Link>
        </Hover>
      </div>
    </Reveal>
  );
};
