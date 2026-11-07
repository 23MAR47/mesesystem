/**
 * Every image on this page is drawn with gradients rather than loaded.
 * Hand-authored recipes, not random ones — a seeded generator produces
 * mush at this size, and each card needs to read as a distinct piece.
 *
 * `background` is a CSS background stack (topmost layer first);
 * `tone` tells overlaid copy which way to contrast.
 */

export interface Art {
  id: string;
  background: string;
  tone: "dark" | "light";
  /** small colour chip used by labels and rules drawn over the art */
  accent: string;
}

export const ART: Record<string, Art> = {
  bloom: {
    id: "bloom",
    tone: "dark",
    accent: "#e9d5ff",
    background: [
      "radial-gradient(55% 42% at 62% 28%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 62%)",
      "radial-gradient(85% 70% at 30% 78%, rgba(217,70,239,0.75) 0%, rgba(217,70,239,0) 64%)",
      "radial-gradient(120% 95% at 78% 8%, rgba(124,58,237,0.9) 0%, rgba(124,58,237,0) 58%)",
      "linear-gradient(155deg, #2b0b52 0%, #10032a 52%, #05010d 100%)",
    ].join(","),
  },
  acid: {
    id: "acid",
    tone: "dark",
    accent: "#c6f24e",
    background: [
      "radial-gradient(38% 30% at 22% 72%, rgba(198,242,78,0.92) 0%, rgba(198,242,78,0) 70%)",
      "radial-gradient(70% 55% at 82% 22%, rgba(90,255,160,0.25) 0%, rgba(0,0,0,0) 62%)",
      "linear-gradient(200deg, #101408 0%, #07080a 55%, #020203 100%)",
    ].join(","),
  },
  moon: {
    id: "moon",
    tone: "dark",
    accent: "#cfe0ff",
    background: [
      "radial-gradient(26% 34% at 50% 42%, rgba(255,255,255,0.95) 0%, rgba(214,232,255,0.35) 45%, rgba(255,255,255,0) 72%)",
      "repeating-radial-gradient(60% 70% at 50% 46%, rgba(255,255,255,0.09) 0px, rgba(255,255,255,0.09) 2px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 13px)",
      "linear-gradient(180deg, #0b1424 0%, #16243c 48%, #060a13 100%)",
    ].join(","),
  },
  dune: {
    id: "dune",
    tone: "dark",
    accent: "#d8b4fe",
    background: [
      "radial-gradient(70% 30% at 72% 58%, rgba(192,132,252,0.5) 0%, rgba(192,132,252,0) 66%)",
      "linear-gradient(180deg, #0a0718 0%, #1d1140 38%, #2a1140 52%, #0b0716 78%, #06040e 100%)",
    ].join(","),
  },
  stream: {
    id: "stream",
    tone: "dark",
    accent: "#93c5fd",
    background: [
      "repeating-linear-gradient(74deg, rgba(255,255,255,0.16) 0px, rgba(255,255,255,0.16) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 9px)",
      "radial-gradient(48% 60% at 74% 46%, rgba(147,197,253,0.85) 0%, rgba(30,64,175,0) 70%)",
      "linear-gradient(120deg, #f4f8ff 0%, #cfe0ff 32%, #1e3a8a 78%, #0b1225 100%)",
    ].join(","),
  },
  crimson: {
    id: "crimson",
    tone: "dark",
    accent: "#fda4af",
    background: [
      "radial-gradient(46% 38% at 34% 30%, rgba(255,120,120,0.7) 0%, rgba(190,18,60,0) 68%)",
      "linear-gradient(165deg, #45060f 0%, #1b0209 58%, #070103 100%)",
    ].join(","),
  },
  chrome: {
    id: "chrome",
    tone: "dark",
    accent: "#f5f3ff",
    background: [
      "conic-gradient(from 210deg at 62% 46%, #ffffff 0deg, #b9bec9 58deg, #5c6070 120deg, #eef0f6 190deg, #7c8090 268deg, #ffffff 340deg)",
      "linear-gradient(140deg, #7c3aed 0%, #2a0d55 60%, #120327 100%)",
    ].join(","),
  },
  teal: {
    id: "teal",
    tone: "dark",
    accent: "#5eead4",
    background: [
      "radial-gradient(52% 44% at 44% 36%, rgba(94,234,212,0.55) 0%, rgba(13,148,136,0) 70%)",
      "linear-gradient(190deg, #06282b 0%, #04171c 55%, #010708 100%)",
    ].join(","),
  },
  paper: {
    id: "paper",
    tone: "light",
    accent: "#7c3aed",
    background: [
      "radial-gradient(60% 50% at 24% 22%, rgba(124,58,237,0.16) 0%, rgba(124,58,237,0) 68%)",
      "linear-gradient(160deg, #ffffff 0%, #eceaf6 100%)",
    ].join(","),
  },
  ember: {
    id: "ember",
    tone: "dark",
    accent: "#fdba74",
    background: [
      "radial-gradient(44% 40% at 68% 66%, rgba(253,186,116,0.6) 0%, rgba(234,88,12,0) 70%)",
      "linear-gradient(150deg, #2a1206 0%, #150802 60%, #050201 100%)",
    ].join(","),
  },
};

export function art(id: keyof typeof ART) {
  return ART[id];
}
