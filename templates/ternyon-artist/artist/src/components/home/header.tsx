/**
 * Site header — fixed three-column bar (value-proposition · wordmark · nav +
 * menu), blended with `mix-blend-difference` and white elements so it reads as
 * black-on-light and white-on-dark automatically (mirrors the reference). The
 * menu button opens <ModalMenu>. Client leaf.
 */
"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { ModalMenu } from "@/components/home/modal-menu";
import { artist, brandline, nav } from "@/data/mocks/home";

export const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        id="top"
        className="fixed inset-x-0 top-0 z-50 text-white mix-blend-difference"
      >
        <div className="grid grid-cols-2 items-center px-6 py-5 lg:grid-cols-3 lg:px-12">
          <div className="hidden lg:block">
            <p className="text-sm tracking-[-0.02em]">{brandline.lead}</p>
            <p className="text-xs uppercase tracking-[0.16em] text-white/70">
              {brandline.sub}
            </p>
          </div>

          <Logo
            label={artist.wordmark}
            className="justify-self-start lg:justify-self-center"
          />

          <div className="flex items-center justify-end gap-8">
            <nav
              aria-label="Primary"
              className="hidden items-center gap-8 lg:flex"
            >
              {nav.slice(0, 3).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-2 text-sm uppercase tracking-[0.14em]"
                >
                  <span
                    className="h-1 w-1 rounded-full bg-white opacity-0 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                  {item.label}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              aria-expanded={open}
              aria-haspopup="dialog"
              onClick={() => setOpen(true)}
              className="flex items-center gap-3 text-sm uppercase tracking-[0.16em]"
            >
              <span className="hidden sm:inline">Menu</span>
              <span className="flex flex-col gap-1.5" aria-hidden="true">
                <span className="block h-px w-6 bg-white" />
                <span className="block h-px w-6 bg-white" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <ModalMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
};
