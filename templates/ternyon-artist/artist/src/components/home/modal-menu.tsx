/**
 * ModalMenu — full-screen overlay menu (mirrors the reference's modal-menu): a
 * black panel grows from the top, then oversized nav links stagger in, with
 * social + contact pinned to the bottom. Scroll locks while open. Client leaf.
 */
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Spring } from "@/components/animation/springs/spring";
import { useScroll } from "@/hooks/smooth-scroll/use-scroll";
import { artist, nav, footer } from "@/data/mocks/home";

interface ModalMenuProps {
  open: boolean;
  onClose: () => void;
}

export const ModalMenu = ({ open, onClose }: ModalMenuProps) => {
  const startScroll = useScroll((s) => s.start);
  const stopScroll = useScroll((s) => s.stop);

  useEffect(() => {
    if (open) stopScroll();
    else startScroll();
    return () => startScroll();
  }, [open, startScroll, stopScroll]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] text-on-dark">
      {/* Black panel grows down from the top edge. */}
      <Spring
        tag="div"
        from={{ scaleY: 0 }}
        to={{ scaleY: 1 }}
        config={{ tension: 200, friction: 28 }}
        className="absolute inset-0 origin-top bg-surface-dark"
      />

      <div className="relative flex h-full flex-col px-6 pb-10 pt-6 lg:px-12">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.28em] text-on-dark-faint">
            Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="text-xs uppercase tracking-[0.18em] hover:text-on-dark-muted"
          >
            Close ✕
          </button>
        </div>

        <nav
          aria-label="Overlay"
          className="flex flex-1 flex-col justify-center gap-2"
        >
          {nav.map((item, i) => (
            <Spring
              key={item.href}
              tag="div"
              from={{ opacity: 0, y: "1.5rem" }}
              to={{ opacity: 1, y: "0rem" }}
              delayIn={180 + i * 70}
              config={{ tension: 180, friction: 26 }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className="group flex items-baseline gap-5 py-1"
              >
                <span className="w-8 text-sm text-on-dark-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-5xl hover:italic sm:text-6xl lg:text-7xl">
                  {item.label}
                </span>
              </Link>
            </Spring>
          ))}
        </nav>

        <Spring
          tag="div"
          from={{ opacity: 0 }}
          to={{ opacity: 1 }}
          delayIn={600}
          config={{ tension: 120, friction: 24 }}
          className="rule-dashed-dark flex flex-col gap-6 border-t pt-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="flex flex-col gap-1">
            <a
              href={`mailto:${artist.email}`}
              className="text-lg hover:text-on-dark-muted"
            >
              {artist.email}
            </a>
            <span className="text-sm text-on-dark-muted">{artist.based}</span>
          </div>
          <ul className="flex flex-wrap gap-6">
            {footer.social.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm uppercase tracking-[0.16em] text-on-dark-muted hover:text-on-dark"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </Spring>
      </div>
    </div>
  );
};
