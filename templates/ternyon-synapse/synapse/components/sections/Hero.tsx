import { HERO } from "@/lib/content";
import { Arrow } from "../ui/Marks";

const AVATAR_TINTS = ["#a855f7", "#f472b6", "#38bdf8", "#c6f24e", "#fb923c"];

/**
 * The hero is real DOM the whole way down — headline, buttons and the
 * trust row stay selectable and focusable. ScrollEngine tips the plane
 * away on scroll with a CSS 3D transform; nothing here is a texture.
 *
 * Everything lives inside `.shell` so the copy and the card stay a
 * readable distance apart on very wide displays instead of being thrown
 * into opposite corners of the monitor.
 */
export default function Hero() {
  return (
    <section className="stage hero-stage" data-stage="hero" id="top">
      <div className="pin">
        <div className="panel hero-panel grain">
          <div className="hero-plane" data-hero-plane>
            <div className="shell">
              <div className="hero-grid">
                <h1 className="display hero-title" data-reveal>
                  <span>{HERO.titleTop}</span>
                  <span className="muted">{HERO.titleBottom}</span>
                </h1>

                <div className="hero-foot">
                  <div>
                    <p className="hero-body">{HERO.body}</p>
                    <div className="hero-actions">
                      <a className="btn btn-ghost" href="#pricing">
                        {HERO.secondary}
                      </a>
                      <a className="btn btn-solid" href="#cta">
                        {HERO.primary}
                        <Arrow style={{ width: 15, height: 15 }} />
                      </a>
                    </div>
                    <div className="hero-trust">
                      <div className="avatars" aria-hidden="true">
                        {AVATAR_TINTS.map((tint) => (
                          <i
                            key={tint}
                            style={{
                              background: `radial-gradient(70% 70% at 35% 30%, ${tint} 0%, rgba(10,10,13,0.9) 100%)`,
                            }}
                          />
                        ))}
                      </div>
                      {HERO.trust}
                    </div>
                  </div>
                  <p className="hero-note">{HERO.note}</p>
                </div>
              </div>

              {/* only a measuring target: the card itself is a fixed layer
                  (FlyCard) so it can cross into the next section */}
              <div className="hero-slot" data-hero-slot aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
