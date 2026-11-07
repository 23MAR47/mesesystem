"use client";

import { BACKGROUND } from "@/lib/theme";
import Arrow from "./Arrow";
import MagneticButton from "./MagneticButton";

/**
 * The footer is where a product page usually gives up and prints four
 * columns of links. This one instead does the thing the rest of the
 * page has been promising: it hands over the numbers.
 *
 * A specification table is the natural close for a page that has spent
 * six sections taking a machine apart — and set in mono, on hairlines,
 * it is also a completely different texture from everything above it,
 * which is what stops the bottom of the page feeling like more of the
 * same. The links survive, but demoted to a single row where they
 * belong.
 */

const SPECS: [string, string][] = [
  ["Sensor", "45.7 MP full-frame BSI CMOS"],
  ["Readout", "8 ms electronic / 1/8000 mechanical"],
  ["Dynamic range", "15 stops at base ISO 64"],
  ["Mount", "A-mount · 20 mm flange · 12 contacts"],
  ["Stabilisation", "5-axis in-body, 8.5 stops"],
  ["Viewfinder", "Pentaprism, 0.78× · 100% coverage"],
  ["Display", '3.2" 2.1 M-dot, two-axis tilt'],
  ["Body", "Machined magnesium, sealed at 12 points"],
  ["Power", "2 300 frames per charge · USB-C PD"],
  ["Mass", "684 g with cell and card"],
];

const LINK_GROUPS: [string, string[]][] = [
  ["Cameras", ["Aperture One", "Compare bodies", "Accessories"]],
  ["Optics", ["Prime series", "Zoom series", "Adapters"]],
  ["Support", ["Firmware", "Manuals", "Repairs"]],
  ["Studio", ["Journal", "Dealers", "Contact"]],
];

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="spec-row" data-hover>
      <span className="spec-row__key">{label}</span>
      <span className="spec-row__dots" aria-hidden />
      <span className="spec-row__val">{value}</span>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative z-10">
      {/* Fades the scene out into solid ground. */}
      <div
        className="pointer-events-none h-[34vh]"
        style={{
          backgroundImage: `linear-gradient(to bottom, transparent, ${BACKGROUND}d9 58%, ${BACKGROUND})`,
        }}
      />

      <div style={{ background: BACKGROUND }}>
        <div className="shell">
          {/* ---- close ------------------------------------------- */}
          <div className="foot-close">
            <div className="foot-close__lead">
              <span className="mono-label">Now taking reservations</span>
              <h2 className="display display-sm">
                Put it in your hands
                <br />
                before you decide
              </h2>
            </div>

            <div className="foot-close__side">
              <p className="lede">
                Bodies are assembled to order in limited runs. Reserve one now,
                or borrow a demo for a weekend from a dealer near you.
              </p>
              <div className="flex flex-wrap gap-3">
                <MagneticButton label="Reserve a body" variant="primary" />
                <MagneticButton label="Find a dealer" variant="ghost" arrow={false} />
              </div>
            </div>
          </div>

          {/* ---- specification ----------------------------------- */}
          <section className="spec-sheet" aria-label="Specification">
            <header className="spec-sheet__head">
              <span className="mono-label">Full specification</span>
              <span className="mono-label">Aperture One — Rev. C</span>
            </header>

            <div className="spec-sheet__body">
              {SPECS.map(([k, v]) => (
                <SpecRow key={k} label={k} value={v} />
              ))}
            </div>

            <a href="#" data-hover className="spec-sheet__more">
              <span>Download the technical sheet</span>
              <span className="btn__arrow">
                <Arrow />
                <Arrow />
              </span>
            </a>
          </section>

          {/* ---- links ------------------------------------------- */}
          <nav className="foot-links" aria-label="Footer">
            {LINK_GROUPS.map(([title, links]) => (
              <div key={title} className="foot-links__col">
                <span className="mono-label">{title}</span>
                <ul>
                  {links.map((l) => (
                    <li key={l}>
                      <a href="#" data-hover>
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* ---- wordmark ------------------------------------------ *
         * Full-bleed and cropped by the bottom of the page, so it
         * reads as the object's own engraving rather than as a logo
         * that happens to be large.                                 */}
        <div className="wordmark" aria-hidden>
          <span>APERTURE</span>
        </div>

        <div className="shell">
          <div className="foot-bottom">
            <span className="mono-label">© 2026 Aperture Optical</span>
            <span className="foot-status">
              <i />
              Assembled in Kyoto · 240 bodies a year
            </span>
            <div className="foot-bottom__links">
              {["Privacy", "Terms", "Colophon"].map((l) => (
                <a key={l} href="#" data-hover className="mono-label">
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
