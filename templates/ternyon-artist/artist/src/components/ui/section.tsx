/**
 * Section — standard page section: background tone (light / grey / dark), a
 * dashed top divider (matching the reference), reference padding scale, and a
 * centred max-width container. Server component.
 */
import type { ReactNode } from "react";

type Tone = "light" | "grey" | "dark";

interface SectionProps {
  id?: string;
  tone?: Tone;
  divider?: boolean;
  className?: string;
  children: ReactNode;
}

const tones: Record<Tone, string> = {
  light: "bg-canvas text-ink",
  grey: "bg-surface-grey text-ink",
  dark: "bg-surface-dark text-on-dark",
};

export const Section = ({
  id,
  tone = "light",
  divider = true,
  className = "",
  children,
}: SectionProps) => {
  return (
    <section
      id={id}
      className={`${tones[tone]} ${divider ? "rule-dashed border-t" : ""} px-6 py-24 lg:px-12 lg:py-32 ${id ? "scroll-mt-24" : ""} ${className}`}
    >
      <div className="mx-auto max-w-[120rem]">{children}</div>
    </section>
  );
};
