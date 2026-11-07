import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Mulish } from "next/font/google";
import localFont from "next/font/local";

import {
  generateMetadata,
  generateViewport,
} from "@/utils/seo/generate-page-metadata";
import { getSiteStructuredData } from "@/utils/seo/structured-data";

import { LazyCookie } from "@/components/common/Cookie";
import { AdaptiveGrid } from "@/components/common/grid";
import { ReducedMotion } from "@/components/common/reduced-motion";
import { ScrollLayout } from "@/layouts/scroll-layout";

import "@/app/globals.css";

/**
 * The display face, from Fontshare — which `next/font/google` cannot reach, so
 * the file is committed and served from our own origin. Same benefit either
 * way: no third-party request on the critical path and no swap flash.
 */
const melodrama = localFont({
  src: "../assets/fonts/melodrama-light.woff2",
  variable: "--font-melodrama",
  weight: "300",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = generateMetadata();
export const viewport: Viewport = generateViewport();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${melodrama.variable} ${instrumentSerif.variable} ${mulish.variable}`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getSiteStructuredData()),
          }}
        />
        {/* Inline and first, before any of the page has parsed: the browser
            restores a reload's scroll position while the document is still
            streaming in, well before hydration can say otherwise. The page
            opens behind a curtain and always starts at its top; a restored
            position only ever put the reader in the middle of it. */}
        <script
          dangerouslySetInnerHTML={{
            __html: 'history.scrollRestoration="manual"',
          }}
        />
        <ScrollLayout>
          <AdaptiveGrid />
          <ReducedMotion />
          <LazyCookie />
          {children}
        </ScrollLayout>
      </body>
    </html>
  );
}
