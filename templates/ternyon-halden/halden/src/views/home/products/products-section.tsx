import { PRODUCT_FILTERS, PRODUCTS } from "@/data/mocks/home";

import { Inview } from "@/components/animation/springs/in-view";
import { springWeight, springWeightSoft } from "@/lib/springs/config";
import { LineReveal } from "@/views/home/motion/line-reveal";

import { FilterPill } from "./filter-pill";
import { ProductCard } from "./product-card";

/**
 * Block 4 — in-stock grid. Figma 2431:940 (1440×800).
 *
 * Heading + support copy over a hairline, a filter pill row, and four 326px
 * cards spanning the 1376px content width (4 × 326 + 3 × 24).
 */
export const ProductsSection = () => {
  return (
    <section className="relative h-[50rem] w-full overflow-hidden bg-background at1024:h-[43.125rem] at768:h-[87.6875rem] at390:h-[147.875rem]">
      <span className="absolute left-[2rem] top-[2rem] at768:left-[1.5rem] at768:top-[1.5rem] at768:w-[19.0625rem] at390:left-[1rem] at390:w-[22.375rem]">
        <LineReveal
          tag="h2"
          from="left"
          /* Unclipped: with the mask on, a line that travels further than its
             own box is wide never intersects anything, and at 390 the whole
             heading sat at opacity 0 for good. Without it the line simply
             slides and fades, and the tighter 768 leading stops shaving the
             descenders as well. */
          clip={false}
          className="whitespace-nowrap font-serif text-section font-normal leading-[1.0968] text-foreground at1024:text-[3.25rem] at768:whitespace-normal at768:text-[2.25rem] at768:leading-[1] at390:text-[1.75rem] at390:leading-[1.0968] [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]"
        >
          Finished, boxed, waiting by the door
        </LineReveal>
      </span>

      <Inview
        tag="p"
        mode="once"
        delayIn={160}
        from={{ opacity: 0, y: 22 }}
        to={{ opacity: 1, y: 0 }}
        config={springWeightSoft}
        className="absolute left-[59.8125rem] top-[3.125rem] w-[12.8125rem] font-serif text-body leading-[1.3] text-foreground [text-box-edge:cap_alphabetic] [text-box-trim:trim-both] at1024:bottom-[calc(100%-4.9rem)] at1024:left-[47rem] at1024:top-auto at1024:w-[13rem] at768:bottom-auto at768:left-[32rem] at768:top-[3.8125rem] at768:w-[13rem] at768:text-[0.875rem] at390:left-[1rem] at390:top-[4.5rem] at390:w-[22.375rem] at390:text-caption"
      >
        Our current collection - ready to ship. Pieces in stock ship within
        days.
      </Inview>

      <Inview
        tag="div"
        aria-hidden
        mode="once"
        from={{ scaleX: 0 }}
        to={{ scaleX: 1 }}
        config={springWeight}
        className="absolute left-[2rem] top-[7.75rem] h-px w-[86rem] origin-left bg-rule at1024:w-[60rem] at768:left-[1.5rem] at768:top-[7.5rem] at768:w-[45rem] at390:left-[1rem] at390:top-[6.75rem] at390:w-[22.375rem]"
      />

      <ul className="absolute left-[2rem] top-[10.3125rem] flex items-start gap-[0.5rem] overflow-hidden at768:left-[1.5rem] at768:top-[9.0625rem] at390:left-[1rem] at390:top-[8.0625rem] at390:w-[22.375rem] at390:flex-wrap at390:gap-[0.5rem] at390:overflow-visible">
        {PRODUCT_FILTERS.map((filter, index) => (
          <FilterPill key={filter.label} filter={filter} index={index} />
        ))}
      </ul>

      <Inview
        tag="p"
        mode="once"
        delayIn={420}
        from={{ opacity: 0, y: 14 }}
        to={{ opacity: 1, y: 0 }}
        config={springWeightSoft}
        className="absolute left-[80.8125rem] top-[11.6875rem] whitespace-pre font-serif text-label leading-normal tracking-[0.04em] text-foreground at1024:left-[54.8125rem] at1024:top-[11rem] at768:left-[39.8125rem] at768:top-[9.8125rem] at768:text-[0.8125rem] at390:left-[9.125rem] at390:top-[14.0625rem] at390:text-caption"
      >
        {"Sorted by lead time  "}
        {/* Drawn rather than set: Instrument Serif's ↓ hangs well below the
            baseline, and no box trim moves the glyph itself. Two lines sitting
            on the baseline by construction. */}
        <svg
          aria-hidden
          viewBox="0 0 8 10"
          className="inline-block h-[0.62em] w-[0.5em] align-baseline"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M4 0v9M0.6 5.6L4 9.2 7.4 5.6" />
        </svg>
      </Inview>

      <ul className="absolute left-[2rem] top-[13.5625rem] flex w-[86rem] items-start gap-[1.5rem] overflow-hidden at1024:w-[60rem] at768:left-[1.5rem] at768:top-[12.5625rem] at768:grid at768:w-[45rem] at768:grid-cols-2 at768:gap-[1rem] at390:grid-cols-1 at390:gap-[2.5rem] at390:left-[1rem] at390:top-[15.625rem] at390:w-[22.375rem]">
        {PRODUCTS.map((product, index) => (
          <ProductCard key={product.name} product={product} index={index} />
        ))}
      </ul>
    </section>
  );
};
