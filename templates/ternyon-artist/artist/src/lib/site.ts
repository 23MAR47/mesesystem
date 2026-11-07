/**
 * Site-wide configuration — the single source of truth for SEO.
 *
 * Consumed by the metadata generator, `robots.ts`, `sitemap.ts`, and the
 * JSON-LD structured-data helper. Update the placeholder values per project.
 */
import { publicEnv } from "@/env";

export const siteConfig = {
  name: "Kai Nomura — Digital & Generative Artist",
  description:
    "Kai Nomura builds immersive works where light, memory, and machine become one material — generative installations and editioned prints, exhibited worldwide and held in private collections.",
  /**
   * Public origin, no trailing slash. Drives canonical URLs, OG tags, the
   * sitemap, and JSON-LD. Set `NEXT_PUBLIC_SITE_URL` in production.
   */
  url: publicEnv.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Default Open Graph / Twitter share image (path under `public/`). */
  ogImage: "/open-graph.png",
  twitterHandle: "@kainomura",
  author: "Kai Nomura",
  /** Browser theme-color (address bar / PWA) — matches the --canvas token. */
  themeColor: "#0b0a09",
} as const;
