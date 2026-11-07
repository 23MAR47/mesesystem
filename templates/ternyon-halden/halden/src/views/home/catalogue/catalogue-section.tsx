import { Inview } from "@/components/animation/springs/in-view";
import { springWeight, springWeightSoft } from "@/lib/springs/config";

import { CatalogueBrowser } from "./catalogue-browser";

/**
 * Block 3 — catalogue index. Figma 2384:156 (1440×800).
 *
 * The static frame — eyebrow, support copy and hairline — plus the interactive
 * index (band, list and preview plates), which lives in a client leaf.
 */
export const CatalogueSection = () => {
  return (
    <section className="relative h-[50rem] w-full overflow-hidden bg-background at1024:h-[43.9375rem] at768:h-[36.875rem] at390:h-[24.1875rem]">
      <Inview
        tag="p"
        mode="once"
        delayIn={160}
        from={{ opacity: 0, y: 22 }}
        to={{ opacity: 1, y: 0 }}
        config={springWeightSoft}
        className="absolute left-[59.8125rem] top-[2rem] w-[27.1875rem] font-serif text-body leading-[1.3] text-foreground-strong at1024:left-[35.75rem] at1024:w-[26.25rem] at768:left-[28.125rem] at768:top-[1.5rem] at768:w-[17.875rem] at768:text-[0.8125rem] at390:left-[1.9375rem] at390:top-[3.0625rem] at390:w-[20.5rem] at390:text-center at390:text-caption"
      >
        Nine categories, and that&apos;s the whole company. No outlet line, no
        seasonal drop, no second brand for the cheap version. If it isn&apos;t
        on this list, we don&apos;t make it.
      </Inview>

      <Inview
        tag="div"
        aria-hidden
        mode="once"
        from={{ scaleX: 0 }}
        to={{ scaleX: 1 }}
        config={springWeight}
        className="absolute left-[2rem] top-[6.625rem] h-px w-[86rem] origin-left bg-rule at1024:w-[60rem] at768:left-[1.5rem] at768:top-[6.1875rem] at768:w-[44rem] at390:left-[1rem] at390:top-[6.0625rem] at390:w-[22.375rem]"
      />

      <CatalogueBrowser />

      <Inview
        tag="h2"
        mode="once"
        from={{ opacity: 0, y: 16 }}
        to={{ opacity: 1, y: 0 }}
        config={springWeightSoft}
        className="absolute left-[2rem] top-[2rem] whitespace-nowrap font-serif text-body font-normal uppercase leading-[1.1] text-foreground at768:left-[1.5rem] at768:top-[1.5rem] at768:text-label at390:left-[1rem] at390:top-[1.5rem] at390:w-[22.375rem] at390:whitespace-normal at390:text-center at390:text-caption [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]"
      >
        (02) — Catalogue
      </Inview>
    </section>
  );
};
