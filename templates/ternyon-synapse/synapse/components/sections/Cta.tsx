import { CTA } from "@/lib/content";
import { Arrow } from "../ui/Marks";

/** The chrome star on the right is the canvas' second subject; the panel
 *  only provides the violet ground it reflects. */
export default function Cta() {
  return (
    <section className="stage cta-stage" data-stage="cta" id="cta">
      <div className="pin">
        <div className="panel cta-panel grain">
          <div className="shell">
            <div className="cta-copy" data-cta-copy>
              <h2>
                {CTA.titleTop}
                <span className="muted">{CTA.titleBottom}</span>
              </h2>
              <p>{CTA.body}</p>
              <a className="btn btn-solid" href="#top">
                {CTA.button}
                <Arrow style={{ width: 15, height: 15 }} />
              </a>
              <p className="cta-foot">{CTA.footNote}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
