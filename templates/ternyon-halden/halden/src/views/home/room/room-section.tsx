import { Inview } from "@/components/animation/springs/in-view";
import { springWeight, springWeightSoft } from "@/lib/springs/config";
import { LineReveal } from "@/views/home/motion/line-reveal";

import { RoomPlate } from "./room-plate";

/**
 * Block 5 — room scene. Figma 2384:190 (1440×800).
 *
 * A single 1376×603 photograph carrying five shoppable hotspots, a location
 * caption and a slide counter.
 */
export const RoomSection = () => {
  return (
    <section className="relative h-[50rem] w-full overflow-hidden bg-background at1024:h-[44.0625rem] at768:h-[31.0625rem] at390:h-[25.3125rem]">
      <span className="absolute left-[2rem] top-[2rem] at768:left-[1.5rem] at768:top-[1.5rem] at390:left-[1rem] at390:w-[22.375rem]">
        <LineReveal
          tag="h2"
          from="left"
          className="whitespace-nowrap font-serif text-section font-normal leading-[1.0968] text-foreground at1024:text-[3.25rem] at768:text-[2.25rem] at390:whitespace-normal at390:text-[1.75rem] [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]"
        >
          See it where it actually lives
        </LineReveal>
      </span>

      <Inview
        tag="p"
        mode="once"
        delayIn={160}
        from={{ opacity: 0, y: 22 }}
        to={{ opacity: 1, y: 0 }}
        config={springWeightSoft}
        className="absolute left-[59.8125rem] top-[3.125rem] w-[18.6875rem] font-serif text-body leading-[1.3] text-foreground [text-box-edge:cap_alphabetic] [text-box-trim:trim-both] at1024:bottom-[calc(100%-4.9rem)] at1024:left-[43.25rem] at1024:top-auto at1024:w-[18.75rem] at768:bottom-auto at768:left-[30.875rem] at768:top-[1.75rem] at768:w-[15.625rem] at768:text-label at390:left-[1rem] at390:top-[4.5rem] at390:w-[19.5625rem] at390:text-caption"
      >
        Our furniture in real homes. Explore the pieces in their natural
        surroundings and get inspired.
      </Inview>

      <Inview
        tag="div"
        aria-hidden
        mode="once"
        from={{ scaleX: 0 }}
        to={{ scaleX: 1 }}
        config={springWeight}
        className="absolute left-[2rem] top-[7.75rem] h-px w-[86rem] origin-left bg-rule at1024:w-[60rem] at768:left-[1.5rem] at768:top-[5.5rem] at768:w-[45rem] at390:left-[1rem] at390:top-[7.75rem] at390:w-[22.375rem]"
      />

      <RoomPlate />
    </section>
  );
};
