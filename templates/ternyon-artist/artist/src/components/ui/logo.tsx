/**
 * Logo — the Kai Nomura wordmark with a small diamond mark. Inherits the current
 * text colour so it adapts to light / dark / mix-blend contexts. Server component.
 */
import Link from "next/link";

interface LogoProps {
  label: string;
  href?: string;
  className?: string;
}

export const Logo = ({ label, href = "#top", className = "" }: LogoProps) => {
  return (
    <Link
      href={href}
      aria-label={`${label} — home`}
      className={`inline-flex items-center gap-3 ${className}`}
    >
      <span
        className="block h-2.5 w-2.5 rotate-45 border border-current"
        aria-hidden="true"
      />
      <span className="font-display text-lg lowercase italic tracking-[0.04em]">
        {label}
      </span>
    </Link>
  );
};
