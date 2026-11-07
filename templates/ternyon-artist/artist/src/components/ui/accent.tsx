/**
 * Accent — a Playfair Display italic span for the one emphasised word inside an
 * otherwise Satoshi-uppercase heading (the reference site's signature contrast).
 * Server component; safe to nest inside `TextEngine` (spans animate per word).
 */
import type { ReactNode } from "react";

interface AccentProps {
  children: ReactNode;
  className?: string;
}

export const Accent = ({ children, className = "" }: AccentProps) => {
  return (
    <span className={`font-display font-normal normal-case italic ${className}`}>
      {children}
    </span>
  );
};
