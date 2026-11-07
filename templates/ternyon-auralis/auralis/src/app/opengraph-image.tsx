import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

/**
 * Open Graph / Twitter share card, generated at build time from the brand mark and the site's own
 * typeface — so the card is the same object as the site rather than a separately-maintained PNG.
 *
 * Composition mirrors the preloader (the site's other full-bleed black moment): the mark, the
 * letter-spaced wordmark, a hairline rule, the positioning line. 1200×630 is the size every scraper
 * crops from.
 *
 * Next serves this at `/opengraph-image` and wires the tags itself; `generateMetadata` therefore
 * declares no `images` and lets file-based metadata win. Twitter reuses it — with no
 * `twitter-image.tsx` present, Next points the Twitter card at this same route.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${siteConfig.name} — ${siteConfig.description}`;

export default async function OpenGraphImage() {
  // The display face the site itself uses. Read from disk at build time; Satori needs the bytes.
  const display = await readFile(
    join(process.cwd(), "src/app/fonts/GoogleSansFlex_9pt-Light.ttf"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 44,
          background: "#000000",
          color: "#ffffff",
          fontFamily: "Display",
        }}
      >
        <div style={{ position: "relative", display: "flex", width: 120, height: 120 }}>
          <div
            style={{
              position: "absolute",
              top: 51,
              left: 0,
              width: 120,
              height: 18,
              background: "#ffffff",
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 51,
              left: 0,
              width: 120,
              height: 18,
              background: "#ffffff",
              transform: "rotate(-45deg)",
            }}
          />
        </div>

        <div style={{ display: "flex", fontSize: 64, letterSpacing: 26, textTransform: "uppercase" }}>
          {siteConfig.name}
        </div>

        <div style={{ display: "flex", width: 360, height: 1, background: "rgba(255,255,255,0.4)" }} />

        <div
          style={{
            display: "flex",
            maxWidth: 780,
            textAlign: "center",
            fontSize: 26,
            letterSpacing: 2,
            color: "rgba(255,255,255,0.8)",
          }}
        >
          {siteConfig.description}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Display", data: display, style: "normal", weight: 300 }],
    },
  );
}
