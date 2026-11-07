import CardFace from "./CardFace";

/**
 * The hero's card, hoisted out of the hero.
 *
 * It is a fixed layer rather than a child of the hero panel, because it
 * has to survive the section boundary: ScrollEngine flies it from the
 * hero's slot onto the ring's front slot, where the reel's own first card
 * — the same face, rendered inside the ring — takes over and carries it
 * into the rotation. A child of the panel would be clipped at the edge.
 */
export default function FlyCard() {
  return (
    <figure className="flycard" data-fly-card aria-hidden="true">
      <CardFace />
    </figure>
  );
}
