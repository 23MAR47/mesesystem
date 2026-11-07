"use client";

import { useState } from "react";

import { Hover } from "@/components/animation/springs/hover";
import type { RefObject } from "react";

export interface SaveChipProps {
  /** The card — pointing anywhere on it turns the chip. */
  trigger: RefObject<HTMLElement | null>;
  /** Named in the label, so the control says which piece it saves. */
  label: string;
}

/**
 * The save control on a product card — variant K3.
 *
 * Pointing at the card turns the "+" a quarter turn about the chip's own centre
 * — the glyph is centred by layout rather than by offsets, so the rotation axis
 * is the circle's middle — and floods the chip with
 * brand red, so the whole card reads as one target while the affordance itself
 * is what answers.
 *
 * A tablet has no pointing to answer with, so the chip also holds a pressed
 * state: tapping it floods the same red and turns the same quarter, and tapping
 * again lets it go. Over a mouse the two states simply agree.
 */
export const SaveChip = ({ trigger, label }: SaveChipProps) => {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={`Save ${label}`}
      onClick={() => setSaved((current) => !current)}
      className={`absolute right-[1rem] top-[1rem] size-[1.75rem] cursor-none overflow-hidden rounded-pill transition-[background-color,rotate] duration-[var(--duration-fast)] ease-entrance group-hover/card:bg-surface-accent ${
        saved ? "rotate-90 bg-surface-accent" : "bg-surface-subtle"
      }`}
    >
      <Hover
        tag="span"
        trigger={trigger}
        from={{ rotate: 0 }}
        to={{ rotate: 90 }}
        config={{ tension: 200, friction: 14 }}
        aria-hidden
        className={`absolute inset-0 block text-body transition-colors duration-[var(--duration-fast)] ease-entrance group-hover/card:text-foreground-on-accent ${
          saved ? "text-foreground-on-accent" : "text-foreground"
        }`}
      >
        <span className="absolute left-1/2 top-1/2 h-[0.045em] w-[0.43em] -translate-x-1/2 -translate-y-1/2 rounded-[0.5px] bg-current" />
        <span className="absolute left-1/2 top-1/2 h-[0.43em] w-[0.045em] -translate-x-1/2 -translate-y-1/2 rounded-[0.5px] bg-current" />
      </Hover>
    </button>
  );
};
