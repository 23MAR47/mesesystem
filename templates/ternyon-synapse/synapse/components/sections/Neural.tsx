import { NEURAL } from "@/lib/content";
import { Star } from "../ui/Marks";

/**
 * The section is built around the star, and leaves through it. The star
 * grows the whole way down; over the last quarter of the pin it opens
 * past the corners of the screen and the work section — already pinned
 * underneath — is what you see through the shape.
 *
 * The star figure is a sibling of the panel, not a child, because the
 * panel is what gets masked: a child would be cut by the same hole it is
 * meant to be drawing the edge of.
 */
export default function Neural() {
  return (
    <section className="stage neural-stage" data-stage="neural" id="neural">
      <div className="pin">
        <div className="panel neural-panel" data-neural-panel>
          <div className="shell">
            <div className="neural-word top" data-neural-word="top">
              {NEURAL.titleTop}
            </div>
            <div className="neural-word bottom" data-neural-word="bottom">
              {NEURAL.titleBottom}
            </div>

            <div className="neural-copy" data-neural-copy>
              {NEURAL.paragraphs.map((paragraph) => (
                <p key={paragraph} style={{ margin: 0 }}>
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="neural-stats" data-neural-stats>
              {NEURAL.stats.map((stat) => (
                <div key={stat.label}>
                  <b>{stat.value}</b>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="neural-star" data-neural-star aria-hidden="true">
          <div className="neural-star-glow" data-star-glow />
          <Star className="neural-star-mark" />
        </div>
      </div>
    </section>
  );
}
