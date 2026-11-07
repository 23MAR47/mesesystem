// 📖 Docs: obsidian/frontend/components/common.md
"use client";

/**
 * The work gallery: cards travelling round a box, closed by the accent plane
 * rising from below — which carries the closing screen up with it, rather than
 * arriving blank ahead of a section of its own.
 *
 * Three things are worth knowing before editing this.
 *
 * **The path is a square seen edge-on, not a circle.** A flat front face, a
 * rounded corner at each end of it, and a side face running back away from the
 * reader. One card sits square to the camera and its neighbours fold away
 * through a right angle — which is the point, and the thing an arc cannot do:
 * an arc bends every card a little and none of them squarely.
 *
 * The box **opens towards the reader**: the front face is the far wall and the
 * top and bottom faces run forward, out of the screen. So a card that has
 * creased is coming *at* you rather than retreating, and what shows at the top
 * and bottom of the frame is the underside of a face passing overhead. Sent the
 * other way the strip drains away into the distance, which is the same geometry
 * read backwards and reads as the gallery running in reverse.
 *
 * That costs the one trick the cylinder had. A circle is the same shape from
 * every angle, so the strip could be moved by turning a single parent; a square
 * is not, so everything is placed individually every frame from its own arc
 * length along the path.
 *
 * **And a card is not a rigid plane.** It is cut into horizontal bands, each
 * seated at its *own* arc length, so a card straddling a corner **bends**: its
 * top can be lying flat on the box's top face while the rest of it still stands
 * square to the camera. Rotating one element per card only ever flips the card,
 * which reads as tumbling, not as a strip wrapping something — that was the
 * whole complaint, and no amount of tuning the fold's direction or length could
 * have answered it. See `gallery-card.tsx`.
 *
 * The reader is *inside* the box, at its centre: the front face sits a
 * half-extent away against a matching pull on the parent, so the centred card
 * lands on the perspective plane at its true size. Positive travel is **down**
 * the screen, so a later card starts lower and rises into place.
 *
 * **The two phases are two elements, and they overlap.** A `TriggerPos` can only
 * name element and viewport *edges* — there is no way to express "from 40% to
 * 80% of this section" with one trigger. So the runway carries two markers, one
 * per phase, each its own `<ProgressTrigger>`.
 *
 * The turn's marker is the **whole** section (`top center` → `bottom bottom`):
 * it begins once the section has risen half a viewport, and keeps going right up
 * to the handover, so the strip never parks and waits. The panel's marker starts
 * partway down (`riseStartViewports`) and climbs over the still-moving strip.
 * Both span the full width on purpose: the engine gates each trigger's loop on
 * an `IntersectionObserver` over that element, and a zero-width box never
 * reports as intersecting, which silently freezes the animation.
 *
 * **`<SpringTrigger>` cannot drive this**, which is why the transforms are
 * written by hand from a progress value — its `api.start()` never applies. See
 * [[decisions-log]] ADR-0029, including why the writes have to be re-applied
 * after every render.
 */

import { useCallback, useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { ProgressTrigger } from "@/components/animation/springs/progress-trigger";
import { galleryConfig } from "@/lib/gallery/gallery.config";

import { GalleryCard, type GalleryCardItem } from "./gallery-card";

export interface CurvedGalleryProps {
  /**
   * Painted over the strip, inside the gallery's own pinned stage.
   *
   * The page's screens are layers on a runway rather than sections of their own
   * (ADR-0075); this is the gallery's. It has its own window on the turn, so it
   * arrives with the cards and is gone before the closing panel climbs over
   * them.
   */
  overlay?: ReactNode;
  /**
   * Behind the strip and **never faded** — the frame the photographs run down.
   *
   * `overlay` has a window: it arrives with the cards and is gone before the
   * closing panel climbs, because two screens of type dissolving through each
   * other is the fault ADR-0075 exists to avoid. Anything structural put in
   * there inherits that window and vanishes half way down the strip. This slot
   * is for what should outlast the copy.
   */
  frame?: ReactNode;
  /**
   * The closing screen, carried **on** the rising plane.
   *
   * It is not a section below this one. A blank plane climbing into a separate
   * blue block costs the reader two screens of scroll to arrive at one screen
   * of content, and the first of them is empty. Riding on the plane, the
   * closing screen is complete the moment it appears and finished the moment it
   * lands — one screen, and the transition is the screen arriving.
   */
  closing?: ReactNode;
  /** Not rendered visibly — the strip carries no UI. Names the section for
   *  assistive technology and keeps the heading outline intact. */
  heading: string;
  items: GalleryCardItem[];
}

const { card, box, panel, scroll, overshoot } = galleryConfig;

/** Arc length of one corner — zero when the crease is square, which it is. */
const cornerArc = (Math.PI / 2) * box.corner;

/**
 * Where a band sits, given how far along the path it has travelled.
 *
 * `travel` is an arc length in rem from the middle of the front face; positive
 * is down the screen. The front face is at **z = 0**, on the perspective plane;
 * past the crease a band runs **forward**, towards the reader, along the top or
 * bottom face of the box.
 *
 * `box.corner` is 0, so the crease is a true right angle: a band is either on
 * the face or on a side, with nothing in between. The arc is still written out
 * because a rounded corner is one number away, and because the two cases have
 * to agree at the join whichever it is.
 *
 * The forward run is capped by `box.reach`. A band on a side face is
 * edge-on and draws almost nothing, but z climbing without limit would take it
 * through the camera plane, and a plane that reaches the camera does not
 * disappear — it smears across the whole viewport.
 */
const seatAt = (travel: number) => {
  const side = travel < 0 ? -1 : 1;
  const distance = Math.abs(travel);

  if (distance <= box.faceHalf) {
    return { y: travel, z: 0, deg: 0 };
  }

  const turn =
    cornerArc > 0
      ? Math.min((distance - box.faceHalf) / cornerArc, 1) * (Math.PI / 2)
      : Math.PI / 2;
  const run = Math.max(0, distance - box.faceHalf - cornerArc);

  return {
    y: side * (box.faceHalf + box.corner * Math.sin(turn)),
    z: Math.min(box.corner * (1 - Math.cos(turn)) + run, box.reach),
    // Positive below the middle, negative above: the band's own "down" turns to
    // follow the path, which at the bottom crease points at the reader and at
    // the top crease points away from them.
    deg: (side * turn * 180) / Math.PI,
  };
};

const seatTransform = (travel: number) => {
  const seat = seatAt(travel);
  return `translate3d(0, ${seat.y}rem, ${seat.z}rem) rotateX(${seat.deg}deg)`;
};

/** Height of one band of a card, in rem. */
const bandHeight = card.height / card.bands;

/**
 * The plane's climb, and the last of the runway held as a rest.
 *
 * `landAt` ends the climb before the runway does, so the reader who stops a
 * little short of the very bottom still gets the closing screen square and
 * whole rather than half-arrived — the alternative is a screen that is only
 * ever complete on the final pixel of the page.
 *
 * Landed, the transform is dropped rather than written as an identity: a
 * `rotateX(0deg)` still puts the element in a 3D rendering context, where the
 * browser rasterises it as a texture and the type and the canvas on it go soft.
 */
const panelTransform = (progress: number) => {
  const rise = Math.min(progress / panel.landAt, 1);
  if (rise >= 1) return "none";
  return (
    `translateY(${panel.startOffset * (1 - rise)}%) ` +
    `rotateX(${panel.tilt * (1 - rise)}deg)`
  );
};

export const CurvedGallery = ({
  heading,
  items,
  overlay,
  frame,
  closing,
}: CurvedGalleryProps) => {
  /** Every band of every card, by card index then band index. */
  const bandRefs = useRef<(HTMLDivElement | null)[][]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  /** The copy over the strip — it belongs to the travel, not to the whole
   *  runway, so it fades on the same progress the turn runs on. */
  const overlayRef = useRef<HTMLDivElement>(null);
  /** Last progress each phase reported, so a re-render can be repainted. */
  const turnProgress = useRef(0);
  const riseProgress = useRef(0);

  const fromTravel = -box.startIndex * box.step;
  // Past the last card, not to it — see `overshoot` for why the strip must not
  // arrive anywhere.
  const toTravel = -(items.length - 1 + overshoot) * box.step;

  const applyTurn = useCallback(
    (progress: number) => {
      turnProgress.current = progress;

      // In with the cards, out before the closing panel starts climbing at
      // `scroll.riseStartViewports` — half way down this runway.
      const layer = overlayRef.current;
      if (layer) {
        const rising = Math.min(1, Math.max(0, (progress - 0.02) / 0.16));
        // **Held to 0.66, not 0.56.** The three steps only finish inking in at
        // about 0.43 (see `process` in the gallery config), and leaving at 0.56
        // gave the last of them a tenth of the runway at full black before it
        // started going again — the screen was over before it had happened. The
        // exit still lands well clear of the closing panel's climb.
        const falling = Math.min(1, Math.max(0, (0.66 - progress) / 0.14));
        const opacity = Math.min(rising, falling);
        layer.style.opacity = String(opacity);
        layer.style.visibility = opacity <= 0.001 ? "hidden" : "visible";
        // The same number, handed down for `<StageReveal>` to divide up among
        // its units — this overlay has no scene behind it to paint its type.
        layer.style.setProperty("--stage-reveal", String(opacity));
        // And the **raw** turn, for anything in the overlay that wants its own
        // place on the strip rather than the overlay's one arrival. The three
        // process steps take their windows off this: on the fade above they
        // would all resolve together, which is a state change, not a
        // progression. Published rather than pushed, so a column is a `calc()`
        // and not a per-frame write of its own.
        layer.style.setProperty("--strip-travel", String(progress));
      }

      const travel = fromTravel + (toTravel - fromTravel) * progress;
      bandRefs.current.forEach((bands, index) => {
        if (!bands) return;
        // Where this card's own middle sits on the path.
        const centre = index * box.step + travel;
        bands.forEach((element, band) => {
          if (!element) return;
          // ...and where this band sits, measured from that middle. The bands
          // are what bend: each one asks the path independently.
          element.style.transform = seatTransform(
            centre + (band + 0.5) * bandHeight - card.height / 2,
          );
        });
      });
    },
    [fromTravel, toTravel],
  );

  const applyRise = useCallback((progress: number) => {
    riseProgress.current = progress;
    const element = panelRef.current;
    if (!element) return;
    element.style.transform = panelTransform(progress);
    // Published for the closing screen to build its depth on — the **raw** phase,
    // not the clamped rise, so the planes keep separating through the rest at
    // the end of the climb, which is where the effect is actually read.
    element.style.setProperty("--closing-travel", String(progress));
  }, []);

  const onTurn = useCallback(
    ({ progress }: { progress: number }) => applyTurn(progress),
    [applyTurn],
  );
  const onRise = useCallback(
    ({ progress }: { progress: number }) => applyRise(progress),
    [applyRise],
  );

  // These transforms are written to the DOM, not rendered by React — so any
  // re-render repaints the element from JSX and throws the scroll position
  // away. (It shows up as the arc snapping back to its start angle while the
  // reader is well past it.) Re-applying after every render is what makes the
  // imperative writes survive; no dependency array, on purpose.
  useEffect(() => {
    applyTurn(turnProgress.current);
    applyRise(riseProgress.current);
  });

  return (
    <section
      className="relative w-full bg-scene-surface"
      style={{ height: `${scroll.runwayViewports * 100}lvh` }}
    >
      {/* Scroll geometry only — transparent, so they measure without drawing. */}
      <ProgressTrigger
        tag="div"
        start="top center"
        end="bottom bottom"
        onChange={onTurn}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      />
      <ProgressTrigger
        tag="div"
        start="top bottom"
        end="bottom bottom"
        onChange={onRise}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{
          height: `${(scroll.runwayViewports - scroll.riseStartViewports) * 100}lvh`,
        }}
      />

      <div className="sticky top-0 h-lvh w-full overflow-hidden">
        {/* The strip shows no copy, but the document still needs the outline. */}
        <h2 className="sr-only">{heading}</h2>

        {/* Under the cards and outside the overlay's window — see `frame`. */}
        <div className="pointer-events-none absolute inset-0">{frame}</div>

        <div
          className="absolute inset-0"
          style={{ perspective: `${box.perspective}rem` }}
        >
          {/* No transform of its own: the front face is already at z = 0, on
              the perspective plane, so the centred card is at its true size and
              everything else falls back behind it. */}
          <div className="h-full w-full [transform-style:preserve-3d]">
            <ul className="relative h-full w-full [transform-style:preserve-3d]">
              {items.map((item, index) => (
                // No transform and no `overflow` of its own: the bands carry
                // both, and `overflow` on an ancestor would flatten the 3D they
                // are placed in.
                <li
                  key={item.id}
                  role="img"
                  aria-label={item.title}
                  className="absolute inset-0 [transform-style:preserve-3d]"
                >
                  <GalleryCard
                    item={item}
                    bandRef={(band, element) => {
                      (bandRefs.current[index] ??= [])[band] = element;
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          ref={overlayRef}
          className="pointer-events-none absolute inset-0"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          {overlay}
        </div>

        {/* The closing plane, with the closing screen on it. Its own
            perspective context, so it tilts independently of the arc and paints
            over it — and no `aria-hidden`, because it is no longer decoration:
            the invitation rides up on it. */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ perspective: `${panel.perspective}rem` }}
        >
          <div
            ref={panelRef}
            data-closing-panel
            className="absolute inset-x-0 bottom-0 h-full bg-surface-accent"
            style={{
              transformOrigin: "50% 100%",
              transform: panelTransform(0),
            }}
          >
            {closing}
          </div>
        </div>
      </div>
    </section>
  );
};
