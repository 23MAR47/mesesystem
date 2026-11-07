import { ART } from "@/lib/art";
import { WORK } from "@/lib/content";
import { Arrow } from "../ui/Marks";

/** Vertical scroll drives a horizontal rail. The rail's translate is the
 *  only thing that moves; the cards themselves are static DOM, so their
 *  hover states and links behave normally. */
export default function Work() {
  return (
    <section className="stage work-stage" data-stage="work" id="work">
      <div className="pin">
        <div className="panel work-panel">
          <p className="mono work-head" data-work-head data-reveal>
            {WORK.eyebrow}
          </p>

          <div className="work-rail" data-work-rail>
            {WORK.projects.map((project, i) => {
              const artwork = ART[project.art];
              return (
                <article className="work-card" key={project.name}>
                  <a className="work-hit" href="#work" aria-label={`${project.name} — case study`}>
                    <div className="work-art" style={{ background: artwork.background }} />
                    <div className="work-rule" />
                    <div className="work-veil" />

                    <header className="work-top">
                      <span className="work-index mono">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="work-client">{project.client}</span>
                      <span className="work-year mono">{project.year}</span>
                    </header>

                    <footer className="work-bottom">
                      <div>
                        <h3 className="work-name">{project.name}</h3>
                        <p className="work-tags">{project.disciplines}</p>
                      </div>
                      <span className="work-open" style={{ color: artwork.accent }}>
                        View project
                        <Arrow style={{ width: 14, height: 14 }} />
                      </span>
                    </footer>
                  </a>
                </article>
              );
            })}

            <article className="work-card work-end">
              <div className="work-end-inner">
                <p className="mono" style={{ opacity: 0.5 }}>
                  {String(WORK.projects.length).padStart(2, "0")} / {String(WORK.projects.length).padStart(2, "0")}
                </p>
                <h3 className="work-name" style={{ marginTop: 12 }}>
                  See the
                  <br />
                  full archive
                </h3>
                <a className="btn btn-ghost" href="#mosaic" style={{ marginTop: 22 }}>
                  Open archive
                  <Arrow style={{ width: 14, height: 14 }} />
                </a>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
