// 📖 Docs: obsidian/frontend/components/common.md

/**
 * One card on the gallery's path — cut into horizontal **bands**.
 *
 * A card is not a rigid plane here. It has to *bend*: where the path turns a
 * corner, the top of a card can already be lying flat on the box's top face
 * while the rest of it is still standing square to the camera, and the image
 * has to fold with it. A single element cannot do that — rotating one plane
 * only ever flips the whole card, which reads as cards tumbling rather than as
 * a strip wrapping something.
 *
 * So the card is a stack of bands, each seated on the path at its **own** arc
 * length by the gallery. On the flat they line up into an ordinary card; across
 * a corner they hinge, band by band, and the picture folds.
 *
 * Each band shows its own slice of the same image: a full-card-sized wrapper,
 * shifted up by the bands above it, inside a clipped box. That keeps
 * `next/image` — one optimised request for the whole card, however many bands
 * it is cut into — where a CSS background would have given up the optimiser.
 *
 * The bands are `aria-hidden`; the card carries the alt text as an
 * `aria-label` on its own element, because what a reader should hear is one
 * picture, not fourteen strips of one.
 *
 * Carries no visible text. Renders a bare placeholder surface when an item has
 * no artwork, so the section is complete before any exists: drop files into
 * `public/assets/gallery/` and add their paths to `src/data/mocks/home.ts`.
 */

import Image from "next/image";

import { galleryConfig } from "@/lib/gallery/gallery.config";

const { card } = galleryConfig;

export interface GalleryCardItem {
  id: string;
  /** Alt text once the item has artwork. Never rendered as visible copy. */
  title: string;
  /** Absolute path under `public/assets/gallery/`. Omit for a placeholder. */
  src?: string;
}

export interface GalleryCardProps {
  item: GalleryCardItem;
  /** Hands each band back so the gallery can seat it on the path. */
  bandRef: (band: number, element: HTMLDivElement | null) => void;
}

/** Height of one band, before the overlap that closes the hinges. */
const bandHeight = card.height / card.bands;

/** The design's width, or the screen's, whichever is smaller — see the config. */
const cardWidth = `min(${card.width}rem, ${card.maxWidthVw}vw)`;

export const GalleryCard = ({ item, bandRef }: GalleryCardProps) => (
  <>
    {Array.from({ length: card.bands }, (_, band) => (
      <div
        key={band}
        ref={(element) => bandRef(band, element)}
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 overflow-hidden"
        style={{
          width: cardWidth,
          // A hair taller than its share at **both** ends, so eighteen boxes
          // stacked edge to edge cannot round apart into hairlines — and so the
          // seam is covered whichever side of it the fold opens. Bleeding only
          // downward left the crease bare: there the two bands meet at ninety
          // degrees, and the one that reaches is reaching the wrong way.
          height: `${bandHeight + card.bandBleed * 2}rem`,
          marginLeft: `calc(${cardWidth} / -2)`,
          marginTop: `-${bandHeight / 2 + card.bandBleed}rem`,
          // Only the ends of the stack are the card's own corners.
          borderTopLeftRadius: band === 0 ? "var(--radius-card)" : undefined,
          borderTopRightRadius: band === 0 ? "var(--radius-card)" : undefined,
          borderBottomLeftRadius:
            band === card.bands - 1 ? "var(--radius-card)" : undefined,
          borderBottomRightRadius:
            band === card.bands - 1 ? "var(--radius-card)" : undefined,
        }}
      >
        {/* The whole card, shifted up so this band's slice lands in the box —
            past the top bleed, so the slice still starts where it should. */}
        <div
          className="absolute left-0"
          style={{
            top: `${card.bandBleed - band * bandHeight}rem`,
            width: cardWidth,
            height: `${card.height}rem`,
          }}
        >
          {item.src ? (
            <Image
              src={item.src}
              alt=""
              fill
              sizes={cardWidth}
              className="object-cover"
            />
          ) : (
            <span className="block h-full w-full bg-surface-raised" />
          )}
        </div>
      </div>
    ))}
  </>
);
