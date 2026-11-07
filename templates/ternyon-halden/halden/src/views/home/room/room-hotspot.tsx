"use client";

import { useRef } from "react";

import { Hover } from "@/components/animation/springs/hover";
import { Inview } from "@/components/animation/springs/in-view";
import { springWeight } from "@/lib/springs/config";
import type { RoomHotspotData } from "@/data/mocks/home";

export interface RoomHotspotProps {
  hotspot: RoomHotspotData;
  /** Which comp's coordinates to use — the tags are re-placed at every width. */
  band?: "1440" | "1024" | "768" | "390";
  /** Order on the photograph — drives the entrance stagger. */
  index?: number;
  /** True while another hotspot holds the spotlight. */
  dimmed?: boolean;
  /** True while this one is the chosen piece — the tap state at 390. */
  selected?: boolean;
  onFocusItem?: (index: number) => void;
  onReleaseItem?: () => void;
  onToggleItem?: (index: number) => void;
}

/**
 * Shoppable tag pinned over the room photograph — Figma 2435:1375 and siblings.
 * Position comes from the comp as per-item data, so it is applied inline.
 *
 * The pill itself is unchanged from the design. What is new is the control it
 * sits in: a real button, so the tag can carry an add-to-bag action later, and
 * a `dimmed` state that fades it out while a neighbour is spotlit.
 *
 * Pointing at the tag floods its "+" chip with brand red and turns the plus a
 * quarter. The plus is drawn as two bars rather than set as a "+": Instrument
 * Serif places that glyph off-centre inside its own advance width, by 1.2px
 * here, and the offset changes shape as the mark turns — so no static nudge
 * centres it at every angle. Two bars are symmetric by construction and sit in
 * the middle of the circle at rest and at ninety degrees alike. The same answer
 * the save chip gives on a product card, so the
 * affordance reads the same way in both blocks. Keyboard focus gets the colour
 * too. The turn is physical, so it is a spring; the colour swap and the fade
 * are discrete two-state changes on token-backed timing (ADR-0014).
 */
export const RoomHotspot = ({
  hotspot,
  band = "1440",
  index = 0,
  dimmed = false,
  selected = false,
  onFocusItem,
  onReleaseItem,
  onToggleItem,
}: RoomHotspotProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  // Inline, because the coordinates are per-item data and cannot be expressed
  // as utility classes; the band picks which comp's numbers apply.
  const spot =
    band === "390"
      ? { left: hotspot.at390.left, top: hotspot.at390.top }
      : band === "1024"
        ? { left: hotspot.at1024.left, top: hotspot.at1024.top }
        : band === "768"
          ? { left: hotspot.at768.left, top: hotspot.at768.top }
          : { left: hotspot.left, top: hotspot.top };

  return (
    <Inview
      tag="li"
      mode="once"
      delayIn={520 + index * 90}
      from={{ opacity: 0, scale: 0.82 }}
      to={{ opacity: 1, scale: 1 }}
      config={springWeight}
      className="absolute"
      style={spot}
    >
      <button
        ref={ref}
        type="button"
        aria-label={`${hotspot.name} — ${hotspot.spec}. Add to bag`}
        /* A tap fires `pointerenter` too, so pointing is left to real mice —
           otherwise the tap would open and immediately close the piece. */
        onPointerEnter={(event) =>
          event.pointerType === "mouse" && onFocusItem?.(index)
        }
        onPointerLeave={(event) =>
          event.pointerType === "mouse" && onReleaseItem?.()
        }
        /* A mouse click pins the piece it is already pointing at; a finger has
           nothing pointed, so its tap is a switch. Either way the mark answers
           on the first press. */
        onClick={(event) =>
          (event.nativeEvent as PointerEvent).pointerType === "mouse"
            ? onFocusItem?.(index)
            : onToggleItem?.(index)
        }
        onFocus={() => onFocusItem?.(index)}
        onBlur={() => onReleaseItem?.()}
        /* At 390 the pill sheds everything but its mark — the name and price
           are set under the photograph instead, so five tags fit a phone. The
           `after` ring is the finger's target, well past the 24px circle. */
        className={`group/hotspot relative flex items-center gap-[0.75rem] overflow-hidden rounded-pill bg-surface-overlay/92 py-[0.375rem] pl-[0.375rem] pr-[1.25rem] text-left transition-opacity duration-[var(--duration-normal)] ease-entrance at390:gap-0 at390:overflow-visible at390:bg-transparent at390:p-0 at390:after:absolute at390:after:-inset-[0.625rem] at390:after:content-[''] ${
          dimmed ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <span
          className={`relative size-[1.875rem] shrink-0 overflow-hidden rounded-pill transition-[background-color,transform] duration-[var(--duration-fast)] ease-entrance at390:size-[1.375rem] group-hover/hotspot:bg-surface-accent group-focus-visible/hotspot:bg-surface-accent ${
            selected ? "rotate-45 bg-surface-accent" : "bg-surface-subtle"
          }`}
        >
          <Hover
            tag="span"
            trigger={ref}
            from={{ rotate: 0 }}
            to={{ rotate: 90 }}
            config={{ tension: 200, friction: 14 }}
            aria-hidden
            className={`absolute inset-0 block text-plus at390:text-[0.825rem] transition-colors duration-[var(--duration-fast)] ease-entrance group-hover/hotspot:text-foreground-on-accent group-focus-visible/hotspot:text-foreground-on-accent ${
              selected ? "text-foreground-on-accent" : "text-foreground"
            }`}
          >
            <span className="absolute left-1/2 top-1/2 h-[0.045em] w-[0.43em] -translate-x-1/2 -translate-y-1/2 rounded-[0.5px] bg-current" />
            <span className="absolute left-1/2 top-1/2 h-[0.43em] w-[0.045em] -translate-x-1/2 -translate-y-1/2 rounded-[0.5px] bg-current" />
          </Hover>
        </span>
        <span className="flex shrink-0 flex-col items-start gap-[0.5rem] overflow-hidden whitespace-nowrap font-serif leading-normal at390:hidden">
          <span className="shrink-0 text-caption tracking-[0.01em] text-foreground-strong [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]">
            {hotspot.name}
          </span>
          <span className="shrink-0 text-micro tracking-[0.02em] text-foreground/40 [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]">
            {hotspot.spec}
          </span>
        </span>
      </button>
    </Inview>
  );
};
