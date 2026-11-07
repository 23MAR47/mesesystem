/**
 * Site-wide configuration — the single source of truth for SEO.
 *
 * Consumed by the metadata generator, `robots.ts`, `sitemap.ts`, and the
 * JSON-LD structured-data helper. Update the placeholder values per project.
 */
import { publicEnv } from "@/env";

export const siteConfig = {
  name: "Halden",
  description:
    "Halden makes furniture for considered living — oak, ash and walnut pieces built to belong in your everyday and stay with you for years. See the 2026 collection.",
  /**
   * Public origin, no trailing slash. Drives canonical URLs, OG tags, the
   * sitemap, and JSON-LD. Set `NEXT_PUBLIC_SITE_URL` in production.
   */
  url: publicEnv.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Default Open Graph / Twitter share image (path under `public/`). */
  ogImage: "/open-graph.png",
  /**
   * Blank until the brand actually holds a handle — an invented one would tag
   * whoever owns it. The metadata generator drops the Twitter site/creator
   * fields while this is empty.
   */
  twitterHandle: "",
  author: "Halden Møbler ApS",
  /** Browser theme-color (address bar / PWA) — the brand red, --raw-color-red-600. */
  themeColor: "#de0419",
} as const;
