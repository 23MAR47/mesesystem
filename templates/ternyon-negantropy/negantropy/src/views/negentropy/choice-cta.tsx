"use client";

import { easings } from "@react-spring/web";

import { Inview } from "@/components/animation/springs/in-view";

interface ChoiceCtaProps {
  label: string;
  href: string;
}

/**
 * Final beat — outbound link to Bryan Johnson's Blueprint. Treated
 * as a real anchor for SEO + accessibility (project hard rule #10).
 * Outlined-bone pill matching the Hero CTA style — same border /
 * hover / typography vocabulary so the page's two outbound buttons
 * read as a pair.
 */
export const ChoiceCta = ({ label, href }: ChoiceCtaProps) => {
  return (
    <Inview
      tag="div"
      mode="once"
      from={{ opacity: 0, x: 24 }}
      to={{ opacity: 1, x: 0 }}
      delayIn={800}
      config={{ duration: 720, easing: easings.easeOutQuart }}
      className="mt-4"
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-3 whitespace-nowrap rounded-full border border-negentropy-bone/30 px-6 py-3 text-sm uppercase tracking-[0.28em] text-negentropy-bone transition-colors hover:border-negentropy-amber hover:text-negentropy-amber focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-negentropy-amber max-sm:border-negentropy-amber max-sm:bg-negentropy-amber max-sm:px-5 max-sm:text-xs max-sm:tracking-[0.16em] max-sm:text-negentropy-void"
      >
        <span>{label}</span>
        <span
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-1"
        >
          →
        </span>
      </a>
    </Inview>
  );
};
