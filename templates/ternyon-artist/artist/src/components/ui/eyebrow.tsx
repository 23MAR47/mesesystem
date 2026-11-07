/**
 * Eyebrow — a small uppercase label with a leading dash, used above section
 * headings (monochrome, matching the reference). On dark sections pass
 * `tone="dark"`. Server component.
 */
import type { ReactNode } from "react";

interface EyebrowProps {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}

export const Eyebrow = ({
  children,
  tone = "light",
  className = "",
}: EyebrowProps) => {
  const color = tone === "dark" ? "text-on-dark-muted" : "text-ink-muted";
  const line = tone === "dark" ? "bg-on-dark-muted" : "bg-ink-muted";
  return (
    <p
      className={`flex items-center gap-3 text-xs uppercase tracking-[0.2em] ${color} ${className}`}
    >
      <span className={`h-px w-8 ${line}`} aria-hidden="true" />
      {children}
    </p>
  );
};
