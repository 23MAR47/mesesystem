import { negentropy } from "@/data/mocks/negentropy";

import { NegentropyClient } from "@/views/negentropy/negentropy-client";

/**
 * Server Component shell for `/`. Renders crawler-visible content
 * (headings, body copy, CTA) and hands the animated layers off to the
 * NegentropyClient leaf — keeps the view server-first per hard rule #6.
 */
export const NegentropyView = () => {
  return (
    <main
      data-scroll-narrative
      className="relative w-screen bg-negentropy-void font-system text-negentropy-bone"
    >
      <NegentropyClient content={negentropy} />
    </main>
  );
};
