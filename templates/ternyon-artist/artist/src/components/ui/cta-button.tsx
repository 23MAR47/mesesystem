/**
 * CtaButton — primary call-to-action link, monochrome (matching the reference):
 * a dark `solid` fill or a dashed `ghost` outline. The arrow slides on hover via
 * the spring `<Hover>` primitive (no CSS transitions, hard rule #1). Pass
 * `tone="dark"` when placed on a dark section. Client leaf.
 */
"use client";

import Link from "next/link";
import { useRef } from "react";
import { Hover } from "@/components/animation/springs/hover";

interface CtaButtonProps {
  href: string;
  label: string;
  variant?: "solid" | "ghost";
  tone?: "light" | "dark";
  className?: string;
}

export const CtaButton = ({
  href,
  label,
  variant = "solid",
  tone = "light",
  className = "",
}: CtaButtonProps) => {
  const ref = useRef<HTMLAnchorElement>(null);

  const base =
    "group inline-flex items-center gap-3 px-8 py-4 text-sm uppercase tracking-[0.14em]";

  const skins = {
    light: {
      solid: "bg-ink text-canvas hover:bg-ink/90",
      ghost: "rule-dashed border text-ink hover:bg-ink hover:text-canvas",
    },
    dark: {
      solid: "bg-canvas text-ink hover:bg-canvas/90",
      ghost:
        "rule-dashed-dark border text-on-dark hover:bg-canvas hover:text-ink",
    },
  } as const;

  return (
    <Link
      ref={ref}
      href={href}
      className={`${base} ${skins[tone][variant]} ${className}`}
    >
      <span>{label}</span>
      <Hover
        tag="span"
        trigger={ref as React.RefObject<HTMLElement>}
        from={{ x: "0rem" }}
        to={{ x: "0.4rem" }}
        config={{ tension: 320, friction: 22 }}
        className="inline-block"
        aria-hidden="true"
      >
        →
      </Hover>
    </Link>
  );
};
