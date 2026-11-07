/** All page copy in one place — sections read from here, never inline. */

export const BRAND = "Synapse";

export const NAV = [
  { label: "Surfaces", href: "#reel" },
  { label: "Neural", href: "#neural" },
  { label: "Studio", href: "#work" },
  { label: "Changelog", href: "#mosaic" },
];

export const HERO = {
  titleTop: "Systems that",
  titleBottom: "answer first",
  body:
    "Turn intent into motion and attention into outcome. One ambient layer that reads context across every surface you already own.",
  primary: "Start building",
  secondary: "See pricing",
  trust: "Trusted by 4,000+ product teams",
  note:
    "From ambient sensing to on-device inference — Synapse keeps the whole loop under sixty milliseconds.",
  card: {
    art: "bloom" as const,
    kicker: "Live session",
    caption: "Context assembled in 42 ms",
  },
};

export const REEL = {
  marquee: ["Design that ships", "Speed without compromise"],
  cta: "Explore the collection",
  cards: [
    {
      art: "chrome" as const,
      chip: "Neural core",
      domain: "synapse.ai",
      title: "Intelligence,\nbeyond limits",
      body: "",
    },
    {
      art: "bloom" as const,
      chip: "Assistant",
      domain: "atlas.finance",
      title: "The ultimate\nengine for\nlending",
      body: "Ask once. It gathers the file, the risk model and the paperwork.",
    },
    {
      art: "acid" as const,
      chip: "Templates",
      domain: "synapse.studio",
      title: "Browse our\ntemplates",
      body: "Sixty starting points, each one already wired to your data.",
    },
    {
      art: "dune" as const,
      chip: "Wearable",
      domain: "halo.device",
      title: "One model,\nevery surface",
      body: "Wrist, desk, room. The same context follows you across all three.",
    },
    {
      art: "stream" as const,
      chip: "Vision",
      domain: "nano.vision",
      title: "See what the\nmodel sees",
      body: "Frame-level explanations for every inference it makes.",
    },
    {
      art: "teal" as const,
      chip: "Ops",
      domain: "synapse.ops",
      title: "Ship it on\na Tuesday",
      body: "Rollouts, evals and rollbacks from one panel.",
    },
  ],
};

export const NEURAL = {
  titleTop: "Beyond",
  titleBottom: "every limit",
  paragraphs: [
    "Synapse is a neural engine that turns intent into action — anticipating the next move before it is asked for, across every device already in the room.",
    "One model, every surface: wearable, ambient and edge. No ceilings, no limits — just intelligence that keeps pace with the way you think.",
  ],
  stats: [
    { value: "42ms", label: "Median loop" },
    { value: "160k", label: "Points on screen" },
    { value: "1", label: "Model, every surface" },
  ],
};

export const WORK = {
  eyebrow: "Selected work",
  projects: [
    { art: "bloom" as const, client: "logan cee", year: "2023", disciplines: "Architecture · Website", name: "Logan" },
    { art: "moon" as const, client: "zumar", year: "2024", disciplines: "Web Design · Development", name: "Zumar" },
    { art: "dune" as const, client: "nova", year: "2024", disciplines: "Brand · Motion · Web", name: "Nova" },
    { art: "ember" as const, client: "kiln", year: "2025", disciplines: "Product · Interface", name: "Kiln" },
    { art: "teal" as const, client: "meridian", year: "2025", disciplines: "Systems · Identity", name: "Meridian" },
  ],
};

export const MOSAIC = {
  title: "A library that keeps growing",
  body: "Prompts, templates and scenes contributed by the studio and the community.",
  tiles: [
    { art: "stream" as const, label: "Nano Vision", w: 30, x: 46, y: 6, depth: 0.18, tone: "wide" },
    { art: "crimson" as const, label: "Midjourney", w: 13, x: 14, y: 34, depth: 0.55, tone: "tall" },
    { art: "teal" as const, label: "Portrait", w: 6, x: 33, y: 18, depth: 0.9, tone: "tall" },
    { art: "bloom" as const, label: "Bloom", w: 8, x: 4, y: 4, depth: 0.72, tone: "tall" },
    { art: "acid" as const, label: "Signal", w: 17, x: 78, y: 26, depth: 0.3, tone: "wide" },
    { art: "chrome" as const, label: "Chrome study", w: 27, x: 26, y: 58, depth: 0.12, tone: "wide" },
    { art: "moon" as const, label: "Halo", w: 11, x: 66, y: 74, depth: 0.6, tone: "wide" },
    { art: "ember" as const, label: "Ember", w: 9, x: 6, y: 78, depth: 0.44, tone: "tall" },
    { art: "dune" as const, label: "Nova dunes", w: 14, x: 84, y: 56, depth: 0.66, tone: "wide" },
    { art: "paper" as const, label: "Docs", w: 7, x: 55, y: 92, depth: 0.85, tone: "wide" },
    { art: "bloom" as const, label: "Field", w: 10, x: 90, y: 4, depth: 0.5, tone: "tall" },
  ],
};

export const CTA = {
  titleTop: "Build beyond",
  titleBottom: "every limit",
  body: "Templates, prompts and tooling that think ahead — start shipping faster today.",
  button: "Get started",
  footNote: "No card required · Free while you evaluate",
};

export const FOOTER = {
  columns: [
    { title: "Product", links: ["Surfaces", "Neural core", "Pricing", "Changelog"] },
    { title: "Studio", links: ["Work", "Process", "Careers", "Contact"] },
    { title: "Resources", links: ["Docs", "Templates", "Status", "Privacy"] },
  ],
  note: "© " + new Date().getFullYear() + " Synapse Labs",
};
