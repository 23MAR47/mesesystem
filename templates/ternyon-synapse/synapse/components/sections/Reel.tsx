import { ART } from "@/lib/art";
import { REEL } from "@/lib/content";
import { Star } from "../ui/Marks";

/**
 * A cylinder of cards. CSS 3D rather than WebGL on purpose: every card is
 * type, a chip and a gradient — putting it in a canvas would cost the text
 * its selectability and hit targets for no visual gain.
 *
 * Ring rotation, the per-card radius and the marquee offset are all
 * written by ScrollEngine; the markup only declares the parts.
 */
export default function Reel() {
  const phrases = [...REEL.marquee, ...REEL.marquee, ...REEL.marquee];

  return (
    <section className="stage reel-stage" data-stage="reel" id="reel">
      <div className="pin">
        <div className="panel reel-panel grain">
          <div className="marquee" aria-hidden="true">
            <div className="marquee-row" data-marquee>
              {phrases.map((phrase, i) => (
                <span key={`${phrase}-${i}`}>
                  {phrase}
                  <i />
                </span>
              ))}
            </div>
          </div>

          <div className="reel-viewport">
            <div className="reel-ring" data-reel-ring>
              {/* Slot zero is left empty on purpose: it is the seat the
                  hero's card lands in. At the end of its flight the flying
                  card is moved into this element — the same node, not a
                  copy — so nothing is ever faded out and swapped. The slot
                  sits at angle 0, the one facing the viewer the instant the
                  reel locks, i.e. exactly where the flight ends. */}
              <article className="reel-card" data-reel-card data-merge-slot data-index="0" />

              {REEL.cards.map((card, i) => {
                const artwork = ART[card.art];
                return (
                  <article className="reel-card" data-reel-card key={card.domain} data-index={i + 1}>
                    <div className="reel-card-art" style={{ background: artwork.background }} />
                    <div className="reel-card-body">
                      <div className="reel-card-top">
                        <span className="reel-chip">{card.chip}</span>
                        <span style={{ opacity: 0.75 }}>{card.domain}</span>
                      </div>
                      <div>
                        {card.chip === "Neural core" ? (
                          <Star
                            style={{
                              width: 54,
                              height: 54,
                              marginBottom: 18,
                              color: "#fff",
                              filter: "drop-shadow(0 6px 22px rgba(0,0,0,0.4))",
                            }}
                          />
                        ) : null}
                        <h3 className="reel-card-title">{card.title}</h3>
                        {card.body ? <p className="reel-card-note">{card.body}</p> : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <a className="reel-cta" href="#work">
            {REEL.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
