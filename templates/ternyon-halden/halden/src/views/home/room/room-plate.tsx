"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

import { Inview } from "@/components/animation/springs/in-view";
import { springWeight, springWeightSoft } from "@/lib/springs/config";
import { ROOM_CAPTION, ROOM_COUNTER, ROOM_HOTSPOTS } from "@/data/mocks/home";

/**
 * Which comp's hotspot coordinates apply. The thresholds are the grid's own
 * bands — see `grid.config.ts`; 390 carries its own, where the tag is the mark
 * alone and the name is set under the photograph.
 */
const useRoomBand = () => {
  const [band, setBand] = useState<"1440" | "1024" | "768" | "390">("1440");
  useEffect(() => {
    const read = () =>
      setBand(
        window.innerWidth <= 548
          ? "390"
          : window.innerWidth <= 768
            ? "768"
            : window.innerWidth <= 1024
              ? "1024"
              : "1440",
      );
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  return band;
};

import { RoomHotspot } from "./room-hotspot";

interface Spot {
  x: number;
  y: number;
}

/**
 * Block 5 — the room photograph and its shoppable tags.
 *
 * Pointing at a tag throws a spotlight: the photograph dims everywhere except a
 * circle around that piece, and the other four tags step out of the way so the
 * focused one reads alone. The tags themselves are untouched from the comp —
 * only what surrounds them changes.
 *
 * The scrim is a two-state fade, so it is a token-timed CSS transition rather
 * than a spring (ADR-0014); only the circle's centre is state, measured from
 * the tag itself so it needs no per-item coordinates in the data.
 */
export const RoomPlate = () => {
  const plateRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const band = useRoomBand();
  const [active, setActive] = useState<number | null>(null);
  const [spot, setSpot] = useState<Spot>({ x: 0, y: 0 });

  /**
   * Aim: the light is placed from the piece's own spot in the photograph, not
   * from the tag that names it. `object-fit: cover` paints a rectangle larger
   * than the box it sits in, so the share has to be read against the painted
   * photograph rather than against the plate.
   */
  const focusItem = useCallback((index: number) => {
    const plate = plateRef.current;
    const photo = imageRef.current;
    if (plate && photo) {
      const p = plate.getBoundingClientRect();
      const b = photo.getBoundingClientRect();
      const nw = photo.naturalWidth || 1;
      const nh = photo.naturalHeight || 1;
      const scale = Math.max(b.width / nw, b.height / nh);
      const painted = { w: nw * scale, h: nh * scale };
      const origin = {
        x: b.left - p.left + (b.width - painted.w) / 2,
        y: b.top - p.top + (b.height - painted.h) / 2,
      };
      const { focus } = ROOM_HOTSPOTS[index];
      setSpot({
        x: origin.x + focus.x * painted.w,
        y: origin.y + focus.y * painted.h,
      });
    }
    setActive(index);
  }, []);

  const releaseItem = useCallback(() => setActive(null), []);

  /** 390 has no pointing, so the mark is a switch: tap opens, tap again closes. */
  const toggleItem = useCallback(
    (index: number) => {
      if (active === index) {
        setActive(null);
        return;
      }
      focusItem(index);
    },
    [active, focusItem],
  );

  const picked = active === null ? null : ROOM_HOTSPOTS[active];
  /**
   * The pool has to be smaller than the photograph or nothing reads as picked
   * out. On a 358px plate the wide figures cover the whole picture, so 390
   * carries its own — the same shape, a quarter of the reach.
   */
  const light =
    band === "390"
      ? { clear: "2.5rem", fade: "6rem" }
      : { clear: "5.5rem", fade: "14rem" };

  return (
    <>
      {/* The reveal is a clip-path, and a clip-path bites descendants whatever
          `overflow` says — so only the photograph and its marks live inside it.
          The caption sits over the picture at every width but 390, where the
          comp drops it underneath; keeping it out here lets both work. */}
      <Inview
        tag="div"
        ref={plateRef}
        mode="once"
        delayIn={220}
        from={{ clipPath: "inset(0 0 100% 0)" }}
        to={{ clipPath: "inset(0 0 0% 0)" }}
        config={springWeight}
        data-frame-cursor="light"
        className="absolute left-[2rem] top-[10.3125rem] h-[37.6875rem] w-[86rem] cursor-none overflow-hidden rounded-image at1024:top-[10.3125rem] at1024:h-[30rem] at1024:w-[60rem] at768:left-[1.5rem] at768:top-[7.0625rem] at768:h-[22.5rem] at768:w-[45rem] at390:left-[1rem] at390:top-[9.0625rem] at390:h-[12.5rem] at390:w-[22.375rem]"
      >
        <Image
          ref={imageRef}
          src="/assets/room/christianshavn.png"
          alt="Apartment interior in Christianshavn with a dining table, sideboard and red sofa"
          width={1376}
          height={603}
          sizes="(max-width: 548px) 115vw, 96vw"
          className="absolute inset-0 size-full object-cover at390:left-[-13.13%] at390:top-[-22.75%] at390:h-[123.48%] at390:w-[122.7%] at390:max-w-none at390:size-auto"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-[var(--duration-normal)] ease-entrance"
          style={{
            opacity: active === null ? 0 : 1,
            background: `radial-gradient(circle at ${spot.x}px ${spot.y}px, transparent ${light.clear}, color-mix(in srgb, var(--scrim) 66%, transparent) ${light.fade})`,
          }}
        />

        <ul className="relative z-[2]">
          {ROOM_HOTSPOTS.map((hotspot, index) => (
            <RoomHotspot
              key={`${hotspot.name}-${hotspot.spec}`}
              band={band}
              hotspot={hotspot}
              index={index}
              dimmed={band !== "390" && active !== null && active !== index}
              selected={active === index}
              onFocusItem={focusItem}
              onReleaseItem={releaseItem}
              onToggleItem={toggleItem}
            />
          ))}
        </ul>
      </Inview>

      <Inview
        tag="p"
        mode="once"
        delayIn={420}
        from={{ opacity: 0 }}
        to={{ opacity: 1 }}
        config={springWeightSoft}
        className={`absolute left-[4rem] top-[44.875rem] whitespace-nowrap font-serif text-label leading-normal tracking-[0.04em] text-foreground-on-band at1024:left-[3.5rem] at1024:top-[37.6875rem] at768:left-[2.5rem] at768:top-[27.5625rem] at768:text-caption at390:left-[1rem] at390:top-[22.0625rem] at390:w-[8.1875rem] at390:whitespace-normal at390:text-caption at390:leading-[1.2] at390:text-foreground ${
          picked ? "at390:hidden" : ""
        }`}
      >
        {ROOM_CAPTION}
      </Inview>
      <Inview
        tag="p"
        mode="once"
        delayIn={460}
        from={{ opacity: 0 }}
        to={{ opacity: 1 }}
        config={springWeightSoft}
        className={`absolute left-[81.3125rem] top-[44.9375rem] whitespace-pre font-serif text-label leading-normal tracking-[0.04em] text-foreground-on-band at1024:left-[55.8125rem] at1024:top-[37.6875rem] at768:left-[45.5rem] at768:top-[27.5625rem] at768:-translate-x-full at768:text-caption at390:left-[23.375rem] at390:top-[22.0625rem] at390:-translate-x-full at390:text-caption at390:text-foreground ${
          picked ? "at390:hidden" : ""
        }`}
      >
        {ROOM_COUNTER}
      </Inview>

      {/* The chosen piece takes the caption's line, so tapping a mark never
          changes the height of the block. */}
      {picked ? (
        <p className="absolute left-[1rem] top-[22.0625rem] hidden w-[22.375rem] items-baseline justify-between gap-[0.75rem] font-serif text-caption leading-normal tracking-[0.04em] at390:flex">
          <span className="shrink-0 text-foreground-accent">{picked.name}</span>
          <span className="text-right text-foreground/50">{picked.spec}</span>
        </p>
      ) : null}
    </>
  );
};
