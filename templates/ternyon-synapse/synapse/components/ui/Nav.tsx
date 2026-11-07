import { BRAND, NAV } from "@/lib/content";
import { Star } from "./Marks";

/** The pill floats above every stage. Its tone attribute is written by
 *  ScrollEngine as the stages change, so it inverts over the black run
 *  without a re-render. */
export default function Nav() {
  return (
    <nav className="nav" data-nav data-tone="light" aria-label={BRAND}>
      <a className="nav-mark" href="#top" aria-label={`${BRAND} home`}>
        <Star className="starmark" />
      </a>
      {NAV.map((item) => (
        <a key={item.label} className="nav-link" href={item.href}>
          {item.label}
        </a>
      ))}
      <a className="nav-link" href="#search">
        Search
      </a>
      <a className="nav-cta" href="#cta">
        Get started
      </a>
    </nav>
  );
}
