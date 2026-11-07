/**
 * Site-wide configuration — the single source of truth for SEO.
 *
 * Consumed by the metadata generator, `robots.ts`, `sitemap.ts`, the JSON-LD structured-data helper,
 * and the generated share card (`opengraph-image.tsx`) — so the name and positioning line on the card
 * can never drift from the ones in the `<head>`.
 */
import { publicEnv } from "@/env";

export const siteConfig = {
  name: "Auralis",
  /** The studio's positioning line — also the OG/Twitter description and the share card's subtitle. */
  description:
    "Art direction, identity, and interactive web. AI is our instrument — the intent is ours.",
  /**
   * Public origin, no trailing slash. Drives canonical URLs, OG tags, the
   * sitemap, and JSON-LD. Set `NEXT_PUBLIC_SITE_URL` in production.
   */
  url: publicEnv.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  twitterHandle: "@auralis",
  author: "Auralis",
  /** Browser theme-color (address bar / PWA) — the black the scene and the preloader sit on. */
  themeColor: "#000000",
} as const;
