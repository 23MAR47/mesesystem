"use client";

import { useRef } from "react";

import { Hover } from "@/components/animation/springs/hover";
import { LineReveal } from "@/views/home/motion/line-reveal";

/**
 * "[ explore collection ]" — variant B4.
 *
 * The brackets are already the loudest thing about this label, so they are what
 * answers: pointing at it pushes them apart and the words breathe out a little
 * tracking between them. Entrance stays the shared line reveal.
 */
export const ExploreCta = () => {
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <span
      ref={ref}
      className="absolute left-[73.5625rem] top-[28.625rem] flex w-max items-center whitespace-nowrap font-display text-title font-bold leading-normal tracking-[0.08em] at1024:left-[51.3125rem] at1024:top-[30.125rem] at1024:text-[1.25rem] at768:left-[36.4375rem] at768:top-[24.5rem] at768:text-[1.125rem] at390:left-[23.45rem] at390:top-[16.125rem] at390:-translate-x-full at390:text-[1rem] [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]"
    >
      <Hover
        tag="span"
        trigger={ref}
        from={{ x: 0 }}
        to={{ x: -7 }}
        config={{ tension: 240, friction: 24 }}
        aria-hidden
        className="block"
      >
        [
      </Hover>
      <LineReveal
        tag="span"
        delay={560}
        columnGap={0.24}
        className="whitespace-nowrap px-[0.22em] [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]"
      >
        explore collection
      </LineReveal>
      <Hover
        tag="span"
        trigger={ref}
        from={{ x: 0 }}
        to={{ x: 7 }}
        config={{ tension: 240, friction: 24 }}
        aria-hidden
        className="block"
      >
        ]
      </Hover>
    </span>
  );
};
