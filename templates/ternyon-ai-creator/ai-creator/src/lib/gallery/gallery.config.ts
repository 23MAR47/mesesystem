/**
 * Geometry for the curved work gallery.
 *
 * The cards sit on a **cylinder lying on its side**: they are stacked
 * vertically and the ring turns about the X axis, so scrolling carries them up
 * the screen and away over the top. Each is placed once at a fixed angle and
 * the *ring* turns, which is why a scroll frame animates one transform rather
 * than eight.
 *
 * Lengths are in `rem` because the root font-size tracks the viewport (the
 * adaptive grid in `globals.css`), so the whole arrangement scales with the
 * screen without a single media query.
 *
 * 📖 Docs: obsidian/frontend/components/common.md
 */

export const galleryConfig = {
  card: {
    width: 25,
    /**
     * A ceiling on the card's width, in `vw`.
     *
     * The card is sized in `rem` and the app's grid re-bases the root font-size
     * per breakpoint — which on a phone lands 25rem at about 433px, wider than
     * the screen it is standing on. The picture then bleeds off both edges and
     * the strip stops reading as a strip.
     *
     * `min()` of the two, so the design's own width holds wherever there is
     * room for it and the screen wins where there is not. **Width only**: the
     * fold is a vertical mechanism, and `seatAt` works in the same `rem` the
     * band heights are written in, so capping the height here would put the
     * bands and the maths that seats them on two different scales.
     */
    maxWidthVw: 84,
    height: 28,
    /**
     * How many horizontal bands a card is cut into so it can **bend**.
     *
     * A card is not a rigid plane: across a corner its top can be lying flat on
     * the box's top face while the rest of it still stands square to the
     * camera, and the picture has to fold with it. One element can only be
     * rotated, which reads as the card tumbling — see `gallery-card.tsx`.
     *
     * With `corner` at zero the crease is instantaneous, so bands are never
     * *inside* a bend — each one is either flat or fully perpendicular, and what
     * the count buys is how finely the fold can land: a band is the quantum the
     * crease snaps to. 18 against a 28rem card is about 1.5rem, the same
     * granularity the shorter card had.
     *
     * Every band is a style write per frame, so this is also the strip's whole
     * per-frame cost — bands times cards.
     */
    bands: 18,
    /**
     * How much each band reaches into the next, **in rem** — an absolute bleed,
     * not a share of the band.
     *
     * Eighteen boxes stacked edge to edge do not tile cleanly: each one's
     * position and height land on a fraction of a device pixel, and the
     * compositor rounds them apart. What shows through the seam is the stage
     * behind the card — a light hairline across the picture at every band, which
     * is what "the photos are torn" actually meant.
     *
     * It has to be a **length**, and that is the part worth keeping. As a
     * multiplier it scaled with the band, so raising `bands` quietly shrank the
     * bleed toward nothing: at 18 bands a ratio of 1.004 came to 0.12 of a
     * device pixel, which closes nothing. This is a little over one device
     * pixel at the sizes this runs at, whatever the band count.
     *
     * The cost is a sliver of each band drawn past the crease at the wrong
     * angle. At this size that is under a pixel; it is the reason not to solve
     * the hairlines by simply making it large.
     */
    bandBleed: 0.2,
  },

  /**
   * The cards travel round a **box**, not a cylinder.
   *
   * The path is a square seen edge-on: a flat front face, a rounded corner at
   * each end of it, and a side face running away from the reader. A card on the
   * front face is square to the camera; one crossing a corner turns with the
   * path and is edge-on by the end of it. That is the read the arc could not
   * give — an arc bends every card a little and none of them squarely, where a
   * box holds one card flat and folds its neighbours away at a right angle.
   *
   * The box is **convex** — the reader is outside it. The front face sits at
   * z = 0, on the perspective plane, and everything else falls back behind it,
   * so a card only ever recedes. Built concave, the corners carry cards
   * *towards* the camera and they have to be cut away before they arrive, which
   * costs the end of the fold — the part worth seeing.
   *
   * Everything here is an **arc length in rem along that path**, measured from
   * the middle of the front face. Positive is down the screen — a later card
   * starts lower and rises into place as the strip travels.
   */
  box: {
    /**
     * Half the flat front face, in rem — and therefore where the crease falls.
     *
     * It decides both how many cards stay square to the camera and whether
     * there is dead ground between the strip and the edge of the frame. The
     * viewport is about 32rem from middle to edge, so at 28 the face runs
     * almost to the edge and the crease lands just inside it: no gap, and the
     * fold still in view. Smaller leaves a band of empty stage at the top and
     * bottom; larger pushes the crease off-screen and the cards look as though
     * they never turned.
     */
    faceHalf: 28,
    /**
     * Corner radius, in rem — about **one band**, and it must not be zero.
     *
     * The crease still reads as a right angle: 1.5rem against a 28rem card is
     * one band's worth of turn, which at this size is a corner you cannot see
     * as a curve. What it buys is that the turn is *continuous*.
     *
     * At zero, `seatAt` snaps a band from 0° to 90° the instant it passes
     * `faceHalf` — between one frame and the next. The band was covering a
     * full-height strip and now covers a foreshortened ribbon above the crease,
     * so the half-band below it is suddenly covered by nothing: its neighbour is
     * still flat and starts lower down. Standing still that gap is whatever the
     * scroll happened to leave and the bleed usually hides it, which is why it
     * looked fixed. **Scrolling, every band crosses in turn**, and the gap opens
     * and closes with each one — white strips flashing along the fold.
     *
     * A turn spread over even one band never leaves the surface uncovered,
     * because no band is ever more than a fraction of a right angle away from
     * its neighbour.
     */
    corner: 1.5,
    /**
     * How far forward a side face runs before a band stops travelling, in rem.
     *
     * Bands on a side face are edge-on and draw almost nothing, but z climbing
     * without limit takes them through the camera plane — and a plane that
     * reaches the camera does not disappear, it smears across the viewport.
     * Comfortably under `perspective`.
     */
    reach: 26,
    /**
     * Distance between neighbouring cards along the path, in rem.
     *
     * Against a 28rem card that leaves the same 3rem gap on the flat the
     * shorter card had, so the strip reads at the same density with bigger
     * pictures in it.
     */
    step: 31,
    /** Viewing distance from the front face. Near enough that the fold reads as
     *  depth rather than as a card being squashed flat. */
    perspective: 60,
    /** Which card is centred when the section arrives, so the column reads as a
     *  strip continuing past both edges rather than starting at its own end. */
    startIndex: 1,
  },

  /**
   * The accent block that closes the section.
   *
   * It is no longer a card on the arc. It rises from below as a plane tilted
   * away from the viewer — wider at the bottom edge than the top — and
   * flattens as it arrives, so the section it becomes is met head-on.
   */
  panel: {
    perspective: 70,
    /** Degrees of tilt at the start; unwinds to 0 as the panel lands. */
    tilt: 36,
    /** Where it starts, as a percentage of its own height below the fold.
     *  Over 100 so the tilt cannot swing a corner into view early. */
    startOffset: 116,
    /**
     * Where in its own phase the climb finishes, 0–1.
     *
     * Short of 1 on purpose: the remainder of the runway is a rest on the
     * landed screen. Set to 1 and the plane only ever squares up on the last
     * pixel of the page, so a reader who stops just short of the bottom never
     * sees the closing screen straight.
     */
    landAt: 0.82,
  },

  /**
   * How the three steps arrive, as windows on the strip's own turn progress.
   *
   * The overlay is fully in from about 0.18 to 0.56, and before this the three
   * columns all resolved on that one number — which made them a single state
   * change rather than a progression. They are an ordered list ("brief, then
   * build, then batch"), so the reader should meet them in that order, paced by
   * the scroll that carries the photographs past.
   */
  process: {
    /**
     * What a step is worth before its own window opens, 0–1.
     *
     * **Not zero.** A step that is invisible until its turn reads as three
     * separate screens; the design is one screen whose later columns are still
     * faint. So they are present from the start, in outline, and the scroll
     * brings them up to full ink.
     */
    floor: 0.16,
    /** Where the first step is fully resolved — the overlay's own arrival. */
    arriveAt: 0.16,
    /**
     * How far behind the step before it each one starts.
     *
     * Three steps at this spacing put the last one's body at full black around
     * 0.43, which leaves it most of the screen's remaining scroll to be read in
     * before the overlay begins to leave at 0.66.
     */
    stagger: 0.11,
    /** How long a step takes to come up from `floor` to full. */
    span: 0.16,
    /**
     * The body copy trails its heading by this much.
     *
     * The heading resolves letter by letter and the body only darkens — two
     * different gestures, so running them together reads as one muddled event.
     * A short lag lets the name land first and the sentence follow it.
     */
    bodyLag: 0.05,
  },

  scroll: {
    /** Total runway, in viewport heights. */
    runwayViewports: 5.2,
    /**
     * Where the panel's marker begins, in viewport heights down the section.
     * Smaller means the panel starts climbing earlier.
     *
     * The two phases are separate elements measured independently, because a
     * `TriggerPos` can only name element and viewport *edges* — there is no way
     * to say "from 40% to 80%" with one trigger. They deliberately **overlap**:
     * the ring keeps turning the whole way down, so the strip is still flowing
     * while the panel climbs over it rather than parking to wait.
     */
    riseStartViewports: 2.6,
  },

  /**
   * Extra travel past the last card, in card steps.
   *
   * Without it the turn ends with the final card parked dead centre and the
   * strip visibly stops. The overshoot carries it on up and out of frame — by
   * which point the panel has covered most of the screen anyway, so what the
   * reader sees is motion right up to the handover.
   */
  overshoot: 1.5,
} as const;
