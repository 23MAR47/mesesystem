import { ManifestoStatement } from "./manifesto-statement";

/**
 * Block 2 — manifesto. Figma 2428:599 (1440×800).
 *
 * Four centred lines of Instrument Serif on the brand red, with two chair
 * cut-outs sitting in gaps reserved inside lines two and three. The statement
 * itself is a client leaf because it writes itself out on entry.
 */
export const ManifestoSection = () => {
  return (
    <section
      className="relative h-[50rem] w-full overflow-hidden bg-surface-accent at1024:h-[34.5rem] at768:h-[25rem] at390:h-[13.5rem]"
      data-header-accent
    >
      <ManifestoStatement />
    </section>
  );
};
