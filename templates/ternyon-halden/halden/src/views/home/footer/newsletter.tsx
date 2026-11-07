"use client";

import { useRef, useState } from "react";

import { Hover } from "@/components/animation/springs/hover";
import { Inview } from "@/components/animation/springs/in-view";
import { springWeightSoft } from "@/lib/springs/config";

/**
 * Newsletter row — variants B3 and B2.
 *
 * B3: pointing at the row (or focusing the input) lifts "EMAIL" out as a label
 * and brightens the outline, so the field admits what it wants before you type.
 * B2: the button grows an arrow from under its own right edge — it says send,
 * rather than merely lighting up. The arrow is taken out of flow so the resting
 * button keeps the comp's symmetric padding and never reserves room for it.
 */
export const Newsletter = () => {
  const rowRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [awake, setAwake] = useState(false);

  return (
    <Inview
      tag="div"
      ref={rowRef}
      mode="once"
      delayIn={280}
      from={{ opacity: 0, y: 18 }}
      to={{ opacity: 1, y: 0 }}
      config={springWeightSoft}
      onPointerEnter={() => setAwake(true)}
      onPointerLeave={() => setAwake(false)}
      className={`relative flex h-[3.25rem] w-full items-center justify-between overflow-hidden rounded-pill border border-solid py-[0.375rem] pl-[1.25rem] pr-[0.375rem] transition-colors duration-[var(--duration-normal)] ease-entrance ${
        awake
          ? "border-foreground-on-accent/90"
          : "border-foreground-on-accent/35"
      }`}
    >
      <label
        htmlFor="newsletter-email"
        aria-hidden={!awake}
        className={`pointer-events-none absolute left-[1.25rem] font-display text-nano tracking-[0.14em] text-foreground-on-accent/75 transition-all duration-[var(--duration-normal)] ease-entrance ${
          awake ? "-translate-y-[0.8rem] opacity-100" : "opacity-0"
        }`}
      >
        EMAIL
      </label>
      <input
        id="newsletter-email"
        type="email"
        name="email"
        placeholder="you@somewhere.dk"
        onFocus={() => setAwake(true)}
        onBlur={() => setAwake(false)}
        className={`min-w-0 flex-1 bg-transparent font-serif text-label leading-normal text-foreground-on-accent outline-none transition-transform duration-[var(--duration-normal)] ease-entrance placeholder:text-foreground-on-accent ${
          awake ? "translate-y-[0.32rem]" : ""
        }`}
      />
      <button
        ref={buttonRef}
        type="button"
        className="relative flex h-full shrink-0 items-center overflow-hidden rounded-pill bg-foreground-on-accent/25 px-[1.5rem] py-[0.75rem] font-serif text-body leading-normal text-foreground-on-accent transition-colors duration-[var(--duration-fast)] ease-entrance hover:bg-foreground-on-accent/40"
      >
        <Hover
          tag="span"
          trigger={buttonRef}
          from={{ x: 0 }}
          to={{ x: -4 }}
          config={{ tension: 280, friction: 26 }}
          className="block whitespace-nowrap"
        >
          Sign me up
        </Hover>
        <Hover
          tag="span"
          trigger={buttonRef}
          from={{ x: -8, opacity: 0 }}
          to={{ x: 0, opacity: 1 }}
          config={{ tension: 280, friction: 26 }}
          aria-hidden
          className="absolute inset-y-0 right-[0.5rem] flex items-center"
        >
          →
        </Hover>
      </button>
    </Inview>
  );
};
