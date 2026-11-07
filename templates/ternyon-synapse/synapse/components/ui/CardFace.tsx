import { ART } from "@/lib/art";
import { HERO } from "@/lib/content";
import { Arrow, Star } from "./Marks";

/**
 * The hero card's face, rendered twice: once in the fixed layer that flies
 * down the page, and once as the first card of the reel ring. The handover
 * at the end of the flight is a cross-fade between two identical renders
 * sitting in the same place, which is why this markup has exactly one home.
 */
export default function CardFace() {
  const artwork = ART[HERO.card.art];

  return (
    <>
      <div className="flycard-art" style={{ background: artwork.background }} />
      <div className="flycard-sheen" />

      <div className="flycard-body">
        <header className="flycard-top">
          <span className="flycard-chip">
            <Star style={{ width: 11, height: 11 }} />
            {HERO.card.kicker}
          </span>
          <span className="flycard-live">
            <i />
            live
          </span>
        </header>

        <div className="flycard-mid">
          <div className="flycard-prompt">
            Summarise the thread
            <span className="flycard-send">
              <Arrow style={{ width: 13, height: 13 }} />
            </span>
          </div>
          <div className="flycard-meter" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>

        <footer className="flycard-foot">
          <div>
            <b>Context assembled</b>
            <span>{HERO.card.caption}</span>
          </div>
        </footer>
      </div>

      <div className="flycard-frame" />
    </>
  );
}
