import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { BACKGROUND } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aperture — Everything you remember arrived through glass",
  description:
    "A camera in optical crystal: it comes apart as you scroll, and every group — optics, chassis, core, controls — reassembles in front of you.",
};

export const viewport: Viewport = {
  themeColor: BACKGROUND,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
