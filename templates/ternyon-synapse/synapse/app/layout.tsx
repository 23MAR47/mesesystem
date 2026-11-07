import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { GROUND } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synapse — Systems that answer first",
  description:
    "An ambient intelligence layer that reads context across every surface you already own, and answers before it is asked.",
};

export const viewport: Viewport = {
  themeColor: GROUND,
  colorScheme: "light dark",
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
