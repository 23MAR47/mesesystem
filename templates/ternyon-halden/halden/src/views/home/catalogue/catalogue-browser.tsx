"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { animated, useSpring } from "@react-spring/web";

import { Handle } from "@/components/animation/springs/handle";
import { Inview } from "@/components/animation/springs/in-view";
import { useWindowWidth } from "@/hooks/use-window-size";
import { springWeight } from "@/lib/springs/config";
import { CATALOGUE_CATEGORIES, type CategoryPreview } from "@/data/mocks/home";

/** Row the band rests on when nothing is hovered — the comp's "Chairs" state. */
const RESTING_ROW = Math.max(
  CATALOGUE_CATEGORIES.findIndex((category) => category.active),
  0,
);

/**
 * Each plate keeps the *area* of its counterpart in Figma (2419:554 is 196×148,
 * 2419:555 is 172×210) and takes its photograph's own aspect ratio. Matching the
 * aspect means `object-cover` has nothing to cut, so the piece is always whole;
 * holding the area steady stops a wide shot from ballooning next to a tall one.
 */
/**
 * Plate area in rem², per comp. The 768 frame draws the previews markedly
 * smaller than a straight scale-down would give, so that band carries its own
 * figures rather than inheriting the wide one.
 */
const PLATE_AREA_REM = {
  wide: { left: 12.25 * 9.25, right: 10.75 * 13.125 },
  at768: { left: 7.75 * 5.875, right: 6.5 * 8 },
  at390: { left: 6 * 4.625, right: 5 * 6 },
} as const;

const BAND_SPRING = { tension: 210, friction: 30 };

/** Tablet cadence: one category per beat, slow enough to read each one. */
const STEP_MS = 2400;

/** L2 — rows wait for the band, then peel away from it, nearest row first. */
const ROW_LEAD = 260;
const ROW_STEP = 70;
const FADE_SPRING = { tension: 200, friction: 26 };

interface PlateProps {
  preview?: CategoryPreview;
  side: "left" | "right";
}

/**
 * One preview plate. The box takes the photograph's own aspect ratio at a fixed
 * height, so `object-cover` has nothing to cut — the piece is always shown whole.
 */
const Plate = ({ preview, side }: PlateProps) => {
  // The 768 band draws these smaller than a proportional scale-down; the
  // browser already tracks the width for the band logic below.
  const viewport = useWindowWidth();
  const band =
    viewport <= 0
      ? "wide"
      : viewport <= 548
        ? "at390"
        : viewport <= 768
          ? "at768"
          : "wide";
  const area = PLATE_AREA_REM[band][side];

  const child = useMemo(() => {
    if (!preview) return null;
    const aspect = preview.width / preview.height;
    const height = Math.sqrt(area / aspect);
    return (
      <span
        key={preview.src}
        data-frame-cursor
        className="block cursor-none overflow-hidden rounded-image"
        style={{
          height: `${height.toFixed(4)}rem`,
          width: `${(height * aspect).toFixed(4)}rem`,
        }}
      >
        <Image
          src={preview.src}
          alt={preview.alt}
          width={preview.width}
          height={preview.height}
          // Plates top out around 232px at the 1440 base, i.e. ~16vw.
          sizes="(max-width: 548px) 27vw, 18vw"
          className="h-full w-full object-cover"
        />
      </span>
    );
  }, [preview, area]);

  return (
    <div
      className={`-translate-y-1/2 ${side === "left" ? "-rotate-2" : "rotate-2"}`}
    >
      <Handle from={{ opacity: 0 }} to={{ opacity: 1 }} config={FADE_SPRING}>
        {child}
      </Handle>
    </div>
  );
};

/**
 * Block 3 — the interactive catalogue index.
 *
 * Hovering a row slides the full-bleed red band onto it and turns that row's
 * type to paper white; both preview plates travel the same distance so they
 * always sit opposite the hovered row, and their photographs cross-fade to the
 * hovered category. With no pointer the whole thing rests on "Chairs", which is
 * the state drawn in Figma 2384:156.
 *
 * The band and the plates move physically, so they are springs (hard rule #1).
 * The row colour is a discrete swap and stays a token-timed CSS transition
 * (ADR-0014).
 */
export const CatalogueBrowser = () => {
  const listRef = useRef<HTMLUListElement>(null);
  const [activeRow, setActiveRow] = useState(RESTING_ROW);
  const width = useWindowWidth();
  /**
   * Everything below the desktop frame reads itself out: while the block is on
   * screen the band steps from one category to the next on a beat, which is the
   * same gesture the cursor makes, just kept by the page. A tablet has no hover
   * to make it with, and a narrow desktop window is close enough to a tablet
   * that the page should behave the same way. Pointing at the list holds the
   * beat where it is, so a mouse still wins while it is over the rows; tapping
   * a row selects it and the beat carries on from there. Anyone who has asked
   * for less motion gets the resting state and nothing else.
   */
  const byTimer = width > 0 && width <= 1024;
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (!byTimer || held) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = listRef.current?.closest("section");
    if (!section) return;

    let beat: number | undefined;
    const stop = () => {
      if (beat === undefined) return;
      window.clearInterval(beat);
      beat = undefined;
    };
    const start = () => {
      if (beat !== undefined) return;
      beat = window.setInterval(
        () => setActiveRow((row) => (row + 1) % CATALOGUE_CATEGORIES.length),
        STEP_MS,
      );
    };
    // Only while the block is actually being looked at — off screen the beat
    // would just burn frames and land the reader on an arbitrary row.
    const watcher = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.4 },
    );
    watcher.observe(section);
    return () => {
      watcher.disconnect();
      stop();
    };
  }, [byTimer, held]);

  const [offset, setOffset] = useState(0);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Measured rather than computed from rem: the adaptive grid rescales the root
  // font-size with the viewport, so row height in px changes with `width`.
  useLayoutEffect(() => {
    const active = rowRefs.current[activeRow];
    const resting = rowRefs.current[RESTING_ROW];
    if (!active || !resting) return;
    setOffset(active.offsetTop - resting.offsetTop);
  }, [activeRow, width]);

  const travel = useSpring({ y: offset, config: BAND_SPRING });
  const category = CATALOGUE_CATEGORIES[activeRow];

  return (
    <>
      <animated.div
        aria-hidden
        style={travel}
        className="absolute left-0 top-[17.4375rem] w-[90rem] at1024:top-[16.3125rem] at1024:w-[64rem] at768:top-[13.875rem] at768:w-[48rem] at390:top-[10.75rem] at390:w-[24.375rem]"
      >
        <Inview
          tag="span"
          mode="once"
          from={{ scaleX: 0 }}
          to={{ scaleX: 1 }}
          config={springWeight}
          className="block h-[4.125rem] w-full origin-center bg-surface-accent at1024:h-[3.4375rem] at768:h-[3.0625rem] at390:h-[1.6875rem]"
        />
      </animated.div>

      <animated.div
        style={travel}
        /* 18.96875rem = the comp's left-plate centre (2419:554). */
        className="absolute left-[9.375rem] top-[18.96875rem] at1024:left-[6.875rem] at1024:top-[18.84375rem] at768:left-[1.5rem] at768:top-[15.0417rem] at390:left-[1rem] at390:top-[11.375rem]"
      >
        <Plate preview={category.previewLeft} side="left" />
      </animated.div>

      <animated.div
        style={travel}
        /* 19.30875rem = the comp's right-plate centre (2419:555). */
        className="absolute right-[9.375rem] top-[19.30875rem] at1024:left-auto at1024:right-[2.25rem] at1024:top-[19.3125rem] at768:left-auto at768:right-[1.6875rem] at768:top-[14.84375rem] at390:right-[1rem] at390:top-[11.25rem]"
      >
        <Plate preview={category.previewRight} side="right" />
      </animated.div>

      <ul
        ref={listRef}
        onPointerEnter={(event) =>
          event.pointerType === "mouse" && setHeld(true)
        }
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return;
          setHeld(false);
          if (!byTimer) setActiveRow(RESTING_ROW);
        }}
        className="absolute left-[calc(50%+0.03125rem)] top-[9.1875rem] flex -translate-x-1/2 flex-col items-center overflow-hidden whitespace-nowrap at1024:left-[25.8125rem] at1024:top-[9.5rem] at1024:translate-x-0 at768:left-1/2 at768:top-[8rem] at768:-translate-x-1/2 at390:top-[7.375rem]"
      >
        {CATALOGUE_CATEGORIES.map((item, index) => {
          const on = index === activeRow;
          return (
            <li
              key={item.label}
              ref={(node) => {
                rowRefs.current[index] = node;
              }}
              onMouseEnter={() => setActiveRow(index)}
              onPointerDown={() => setActiveRow(index)}
              /* The row must not clip its own contents: at 390 a row is shorter
                 than the 26px the label travels, so a clip here hides the label
                 from the in-view observer entirely and it never arrives. The
                 list above still holds the outer mask. */
              className="flex shrink-0 items-start gap-[0.5rem] py-[0.25rem] at1024:gap-[0.40625rem] at1024:py-[0.203125rem] at768:gap-[0.3125rem] at768:py-[0.390625rem] at390:gap-[0.203125rem] at390:py-[0.101563rem]"
            >
              <Inview
                tag="span"
                mode="once"
                delayIn={ROW_LEAD + Math.abs(index - RESTING_ROW) * ROW_STEP}
                from={{
                  opacity: 0,
                  y: index === RESTING_ROW ? 0 : index < RESTING_ROW ? 26 : -26,
                }}
                to={{ opacity: 1, y: 0 }}
                config={springWeight}
                className={`block font-serif text-category leading-[1.0741] at1024:text-[2.75rem] at768:text-[2.125rem] at390:text-[1.375rem] transition-colors duration-[var(--duration-fast)] ease-entrance ${
                  on ? "text-foreground-on-band" : "text-foreground-strong"
                }`}
              >
                {item.label}
              </Inview>
              <Inview
                tag="span"
                mode="once"
                delayIn={
                  ROW_LEAD + Math.abs(index - RESTING_ROW) * ROW_STEP + 60
                }
                from={{ opacity: 0 }}
                to={{ opacity: 1 }}
                config={springWeight}
                className={`block font-display text-caption font-bold leading-normal tracking-[0.04em] at1024:text-[0.611rem] at768:text-[0.4722rem] at390:text-caption transition-colors duration-[var(--duration-fast)] ease-entrance ${
                  on ? "text-foreground-on-band" : "text-foreground-muted"
                }`}
              >
                {item.count}
              </Inview>
            </li>
          );
        })}
      </ul>
    </>
  );
};
