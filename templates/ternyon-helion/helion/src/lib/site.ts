/**
 * Site-wide configuration — the single source of truth for SEO.
 *
 * Consumed by the metadata generator, `robots.ts`, `sitemap.ts`, and the
 * JSON-LD structured-data helper. Update the placeholder values per project.
 */
import { publicEnv } from "@/env";

export const siteConfig = {
  name: "HELION",
  /**
   * The default `<title>` — the studio line, not just the name. Pages set their
   * own title and it slots into the `%s — HELION` template (see the metadata
   * generator); this is what shows on the home route and as the OG title.
   */
  title: "HELION — We give them gravity",
  description:
    "A design studio for identity, art direction, and web — engineered to attract, not to be scrolled past. We don't design brands; we give them gravity.",
  /**
   * Public origin, no trailing slash. Drives canonical URLs, OG tags, the
   * sitemap, and JSON-LD. Set `NEXT_PUBLIC_SITE_URL` in production.
   */
  url: publicEnv.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Default Open Graph / Twitter share image (path under `public/`). */
  ogImage: "/open-graph.png",
  twitterHandle: "@helionstudio",
  author: "Helion Studio",
  /**
   * Copyright, in one place. Read by the JSON-LD `WebSite` node and by the
   * footer's baseline line — they used to state it independently, and an
   * independently-stated year is a year that goes stale in exactly one of them.
   */
  copyrightYear: 2026,
  copyrightHolder: "Helion Studio",
  /**
   * Browser theme-color. It must actually be `--background`: it paints the iOS
   * status bar and the Android toolbar, and a neutral near-black beside a
   * blue-black page reads as a seam at the top of the screen. It was `#010101`,
   * left behind when the palette moved to deep blue.
   */
  themeColor: "#02040d",
} as const;
