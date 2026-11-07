import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

import {
  generateMetadata,
  generateViewport,
} from "@/utils/seo/generate-page-metadata";
import { getSiteStructuredData } from "@/utils/seo/structured-data";

import { AfterPreload } from "@/components/common/after-preload";
import { LazyCookie } from "@/components/common/Cookie";
import { AdaptiveGrid } from "@/components/common/grid";
import { ReducedMotion } from "@/components/common/reduced-motion";
import { ScrollLayout } from "@/layouts/scroll-layout";

import "@/app/globals.css";

/** Body copy, captions, product meta — the workhorse face across every block. */
const instrumentSerif = localFont({
  variable: "--font-instrument-serif",
  display: "swap",
  src: [
    {
      path: "../fonts/InstrumentSerif-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/InstrumentSerif-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
});

/** Display face — hero headline, nav, catalogue counts. */
const bebasNeue = localFont({
  variable: "--font-bebas-neue",
  display: "swap",
  src: [
    { path: "../fonts/BebasNeue Regular.otf", weight: "400", style: "normal" },
    { path: "../fonts/BebasNeue Bold.otf", weight: "700", style: "normal" },
  ],
});

/** Used only by the HALDEN wordmark lockup in the nav (Figma 2412:216). */
const inter = Inter({
  variable: "--font-inter",
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
      <head>
        {/* The preloader ships opaque in the SSR markup so there is no flash of
            an unstyled page; without JS it would never lift, so hide it. */}
        <noscript>
          <style>{`#preloader{display:none}`}</style>
        </noscript>
      </head>
      <body
        className={`${instrumentSerif.variable} ${bebasNeue.variable} ${inter.variable}`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getSiteStructuredData()),
          }}
        />
        <ScrollLayout>
          <AdaptiveGrid coef={1} />
          <ReducedMotion />
          <AfterPreload>
            <LazyCookie />
          </AfterPreload>
          {children}
        </ScrollLayout>
      </body>
    </html>
  );
}
