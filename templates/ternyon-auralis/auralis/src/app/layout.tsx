import type { Metadata, Viewport } from "next";
import { Onest } from "next/font/google";
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

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  display: "swap",
});

// Google Sans Flex (9pt optical) — the hero overlay's display typeface. Three static instances
// exported from the variable font; bound to `--font-google-sans` → `--font-display` (globals.css).
const googleSans = localFont({
  variable: "--font-google-sans",
  display: "swap",
  src: [
    { path: "./fonts/GoogleSansFlex_9pt-ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "./fonts/GoogleSansFlex_9pt-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/GoogleSansFlex_9pt-Regular.ttf", weight: "400", style: "normal" },
  ],
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
      <body className={`${onest.variable} ${googleSans.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getSiteStructuredData()),
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
