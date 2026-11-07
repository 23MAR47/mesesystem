import { BRAND, FOOTER } from "@/lib/content";
import { Star } from "../ui/Marks";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <Star style={{ width: 26, height: 26, color: "var(--violet)" }} />
            <div className="footer-brand">{BRAND}</div>
            <p className="footer-line">Systems that answer first.</p>
          </div>
          <div className="footer-cols">
            {FOOTER.columns.map((column) => (
              <div key={column.title}>
                <h3>{column.title}</h3>
                <ul>
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href="#top">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="footer-bar">
          <span>{FOOTER.note}</span>
          <span className="mono">Built with WebGL · No trackers</span>
        </div>
      </div>
    </footer>
  );
}
