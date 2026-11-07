"use client";

import Image from "next/image";
import TextEngine from "spring-text-engine";

import { Inview } from "@/components/animation/springs/in-view";

import { ManifestoChair } from "./manifesto-chair";
import { springInk, springWeight } from "@/lib/springs/config";

/** Milliseconds per character — the pace of a hand moving across the line. */
const PACE = 9;

/**
 * Instrument Serif's own space is 0.17em; TextEngine defaults its word gap to
 * 0.3em, which stretched the widest line by ~50px. Splitting into letters costs
 * only ~7px of kerning on a full line, so matching the real space is all it
 * takes to land back on the comp.
 */
const SPACE_EM = 0.17;

/**
 * Fragments in reading order. `at` is the cumulative character count before the
 * fragment starts, so every piece picks up exactly where the previous one
 * stopped and the whole statement writes itself as one continuous hand.
 */
const F = {
  open: { text: "(Halden) is made for", at: 0 },
  italic: { text: "considered living,", at: 21 },
  beautiful: { text: "for beautiful", at: 39 },
  spaces: { text: "spaces, made to last —", at: 52 },
  belongs: { text: "furniture that belongs", at: 74 },
  everyday: { text: "in your everyday,", at: 96 },
  close: { text: "and stays with you for years to come.", at: 113 },
} as const;

const at = (n: number) => n * PACE;

interface WrittenProps {
  children: string;
  start: number;
  className?: string;
}

/** One fragment of the hand — letters land in order, snappy, no overshoot. */
const Written = ({ children, start, className = "" }: WrittenProps) => (
  <TextEngine
    tag="span"
    mode="once"
    className={`flex-nowrap whitespace-nowrap ${className}`}
    letterIn={{ opacity: 1, y: 0 }}
    letterOut={{ opacity: 0, y: 6 }}
    letterStagger={PACE}
    letterConfig={springInk}
    delayIn={at(start)}
    columnGap={SPACE_EM}
  >
    {children}
  </TextEngine>
);

/**
 * Block 2 — the statement, written rather than revealed.
 *
 * Instrument Serif is a display serif, not a script, so a true pen-stroke
 * animation would mean tracing letter outlines — wrong for these shapes and
 * fatal for selectable text. Instead the hand is carried by *cadence*: letters
 * arrive strictly in reading order at a steady 20ms, so the eye follows a
 * moving point across the line exactly as it would follow a nib.
 *
 * The one genuine stroke is the underline under "considered living," — a single
 * line, so it really is drawn, left to right, the moment that phrase finishes.
 */
export const ManifestoStatement = () => {
  return (
    <h2 className="absolute left-[calc(50%+0.03125rem)] top-1/2 flex w-max -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-[0.25rem] font-serif text-manifesto font-normal leading-[1.0769] text-foreground-on-accent at1024:text-[3.5rem] at768:text-[2.5rem] at390:left-[1.6875rem] at390:top-[3.125rem] at390:translate-x-0 at390:translate-y-0 at390:text-[1.375rem]">
      <span className="flex gap-[0.17em] whitespace-nowrap">
        <Written start={F.open.at}>{F.open.text}</Written>
        <em className="relative inline-block italic">
          <Written start={F.italic.at}>{F.italic.text}</Written>
          <Inview
            tag="span"
            mode="once"
            delayIn={at(F.italic.at + F.italic.text.length)}
            from={{ scaleX: 0 }}
            to={{ scaleX: 1 }}
            config={springWeight}
            className="absolute bottom-[0.02em] left-0 right-0 h-[0.045em] origin-left bg-current"
          />
        </em>
      </span>

      <span className="relative flex items-center gap-[1.125rem] at1024:gap-[0.875rem] at768:gap-[0.625rem] at390:gap-[0.375rem]">
        <Written start={F.beautiful.at}>{F.beautiful.text}</Written>
        <span
          aria-hidden
          className="relative h-[3.75rem] w-[6.5rem] shrink-0 rounded-image at1024:h-[2.75rem] at1024:w-[4.75rem] at768:h-[2.125rem] at768:w-[3.625rem] at390:h-[1.1875rem] at390:w-[2rem]"
        >
          {/* Centred on the gap the sentence leaves for it, not at a fixed
              offset from the line: the springs inside the chair write their own
              transform, so the centring has to live on this wrapper. */}
          <span className="absolute left-1/2 top-1/2 block size-[8.125rem] -translate-x-1/2 -translate-y-1/2 at1024:size-[6rem] at768:size-[4.5rem] at390:size-[2.625rem]">
            <ManifestoChair
              src="/assets/manifesto/armchair-blue.png"
              alt="Tufted blue armchair"
              delay={at(F.spaces.at + F.spaces.text.length)}
              className="block size-full"
            />
          </span>
        </span>
        <Written start={F.spaces.at}>{F.spaces.text}</Written>
      </span>

      <span className="relative flex items-center gap-[1.125rem] at1024:gap-[0.875rem] at768:gap-[0.625rem] at390:gap-[0.375rem]">
        <Written start={F.belongs.at}>{F.belongs.text}</Written>
        <span
          aria-hidden
          className="relative h-[3.75rem] w-[6.5rem] shrink-0 rounded-image at1024:h-[2.75rem] at1024:w-[4.75rem] at768:h-[2.125rem] at768:w-[3.625rem] at390:h-[1.1875rem] at390:w-[2rem]"
        >
          {/* Centred on the gap the sentence leaves for it, not at a fixed
              offset from the line: the springs inside the chair write their own
              transform, so the centring has to live on this wrapper. */}
          <span className="absolute left-1/2 top-1/2 block size-[8.125rem] -translate-x-1/2 -translate-y-1/2 at1024:size-[6rem] at768:size-[4.5rem] at390:size-[2.625rem]">
            <ManifestoChair
              src="/assets/manifesto/armchair-orange.png"
              alt="Orange swivel lounge chair"
              delay={at(F.everyday.at + F.everyday.text.length)}
              imageClassName="size-full max-w-none object-cover"
              className="block size-full"
            />
          </span>
        </span>
        <Written start={F.everyday.at}>{F.everyday.text}</Written>
      </span>

      <span className="whitespace-nowrap">
        <Written start={F.close.at}>{F.close.text}</Written>
      </span>
    </h2>
  );
};
