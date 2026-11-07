/**
 * Footer — dark section (mirroring the reference): wordmark, nav columns,
 * social, a giant brand wordmark, and the studio copyright. Client leaf (the
 * top block reveals on enter).
 */
"use client";

import Link from "next/link";
import { Inview } from "@/components/animation/springs/in-view";
import { Logo } from "@/components/ui/logo";
import { reveal } from "@/lib/motion";
import { artist, footer } from "@/data/mocks/home";

export const Footer = () => {
  return (
    <footer className="bg-surface-dark px-6 pb-12 pt-24 text-on-dark lg:px-12">
      <div className="mx-auto max-w-[120rem]">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Inview
              from={reveal.fadeUp.from}
              to={reveal.fadeUp.to}
              config={reveal.fadeUp.config}
              mode="once"
            >
              <Logo label={artist.wordmark} />
              <p className="mt-6 max-w-[28ch] font-display text-2xl italic text-on-dark-muted">
                {footer.tagline}
              </p>
              <a
                href={`mailto:${artist.email}`}
                className="mt-8 inline-block text-sm uppercase tracking-[0.16em] text-on-dark hover:text-on-dark-muted"
              >
                {artist.email}
              </a>
            </Inview>
          </div>

          {footer.columns.map((col) => (
            <nav
              key={col.title}
              aria-label={col.title}
              className="lg:col-span-2"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-on-dark-faint">
                {col.title}
              </p>
              <ul className="mt-6 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-base text-on-dark-muted hover:text-on-dark"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="lg:col-span-3">
            <p className="text-xs uppercase tracking-[0.18em] text-on-dark-faint">
              Follow
            </p>
            <ul className="mt-6 space-y-3">
              {footer.social.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-base text-on-dark-muted hover:text-on-dark"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Inview
          from={reveal.fadeUp.from}
          to={reveal.fadeUp.to}
          config={reveal.fadeUp.config}
          mode="once"
          className="mt-24 overflow-hidden"
          aria-hidden="true"
        >
          <span className="block text-center text-[18vw] font-black uppercase leading-[0.8] tracking-[-0.04em] text-white/10">
            Nomura
          </span>
        </Inview>

        <div className="rule-dashed-dark mt-12 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-on-dark-faint">{footer.copyright}</p>
          <ul className="flex gap-6">
            {footer.legal.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-on-dark-faint hover:text-on-dark-muted"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};
