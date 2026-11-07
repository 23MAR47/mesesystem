import localFont from "next/font/local";
import { Mulish } from "next/font/google";

/**
 * Gilroy + Lato, self-hosted from `public/fonts` — the original helios pairing.
 * Gilroy sets headings and body copy; Lato sets button labels.
 *
 * Only woff2/woff are shipped. The original also served ttf/eot for IE and
 * ancient Android; neither is a target for a Next 16 build.
 */

/**
 * Mulish — the Ternyon hero redesign's single typeface (Figma node 665:1694).
 * The masthead is set in Light (300); the nav, subtitle, and contact form in
 * Regular (400). Loaded and self-hosted at build via `next/font/google`, so it
 * ships with the same zero-layout-shift guarantees as the local faces above.
 */
export const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
});

export const gilroy = localFont({
  variable: "--font-gilroy",
  display: "swap",
  src: [
    {
      path: "../../public/fonts/Gilroy-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Gilroy-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Gilroy-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Gilroy-Medium.woff",
      weight: "500",
      style: "normal",
    },
  ],
});

export const lato = localFont({
  variable: "--font-lato",
  display: "swap",
  src: [
    {
      path: "../../public/fonts/Lato-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lato-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lato-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    { path: "../../public/fonts/Lato-Bold.woff", weight: "700", style: "normal" },
    {
      path: "../../public/fonts/Lato-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lato-ExtraBold.woff",
      weight: "800",
      style: "normal",
    },
  ],
});
