"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

import { view } from "@/lib/state";
import Arrow from "./Arrow";

interface Props {
  label: string;
  variant?: "primary" | "ghost";
  arrow?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

/**
 * Button that leans toward the cursor while it's nearby and tracks the
 * pointer for its radial hover glow.
 */
export default function MagneticButton({
  label,
  variant = "ghost",
  arrow = true,
  compact = false,
  onClick,
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || view.reduced) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const reach = Math.max(r.width, r.height) * 1.05;

      if (Math.hypot(dx, dy) < reach) {
        xTo(dx * 0.3);
        yTo(dy * 0.42);
        el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      } else {
        xTo(0);
        yTo(0);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      gsap.killTweensOf(el);
    };
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      data-hover
      className={`btn ${variant === "primary" ? "btn--primary" : ""}`}
      style={compact ? { padding: "0.55rem 0.6rem 0.55rem 0.95rem" } : undefined}
    >
      <span>{label}</span>
      {arrow && (
        <span className="btn__arrow">
          <Arrow />
          <Arrow />
        </span>
      )}
    </button>
  );
}
