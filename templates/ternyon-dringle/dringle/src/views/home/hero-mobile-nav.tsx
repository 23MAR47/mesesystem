"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { HeroContent } from "@/data/mocks/home";

import { dropIn, SOFT } from "./hero-motion";
import { Reveal } from "./reveal";

interface HeroMobileNavProps {
  nav: HeroContent["nav"];
}

/** Mobile navigation — logo + burger that toggles a dropdown of the links. */
export const HeroMobileNav = ({ nav }: HeroMobileNavProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Reveal
      tag="header"
      mode="once"
      from={dropIn.from}
      to={dropIn.to}
      config={SOFT}
      delayIn={80}
      className="relative z-40 mx-[0.75rem] mt-[0.75rem] flex h-[3.25rem] items-center justify-between rounded-full bg-white pl-[1.25rem] pr-[0.75rem]"
    >
      <Link href={nav.logo.href} aria-label={nav.logo.alt}>
        <Image
          src={nav.logo.src}
          alt={nav.logo.alt}
          width={87}
          height={26}
          priority
          unoptimized
          className="h-[1.5rem] w-[5rem]"
        />
      </Link>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex size-[2.5rem] items-center justify-center rounded-full text-ink-strong"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="size-[1.5rem]"
          aria-hidden
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <>
              <path d="M4 8h16" />
              <path d="M4 16h16" />
            </>
          )}
        </svg>
      </button>

      {open ? (
        <nav
          aria-label="Primary"
          className="absolute inset-x-0 top-[4rem] flex flex-col overflow-hidden rounded-[1.5rem] bg-white p-[0.5rem] shadow-[0_0.75rem_2.5rem_rgba(0,1,47,0.12)]"
        >
          {nav.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-[1rem] px-[1.25rem] py-[0.875rem] text-[1rem] text-ink-strong"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={nav.contact.href}
            onClick={() => setOpen(false)}
            className="mt-[0.25rem] rounded-full bg-[image:var(--gradient-cta)] px-[1.25rem] py-[0.875rem] text-center text-[1rem] text-white"
          >
            {nav.contact.label}
          </Link>
        </nav>
      ) : null}
    </Reveal>
  );
};
