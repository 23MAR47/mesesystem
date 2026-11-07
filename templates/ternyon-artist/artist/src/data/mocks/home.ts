/**
 * Home-page content for the Kai Nomura artist site.
 *
 * The page layout clones the reference site 1:1 (grid, palette, type scale,
 * image placement, pinned CTAs); the copy here is original (hard rule #4 — no
 * hardcoded content in components). Imagery reuses the reference photography
 * under `public/assets/site/`.
 */

const IMG = "/assets/site";

export interface NavLink {
  label: string;
  href: string;
}

export interface Work {
  id: string;
  index: string;
  title: string;
  year: string;
  medium: string;
  image: string;
  ratio: string;
}

export interface ForSaleWork {
  id: string;
  title: string;
  edition: string;
  medium: string;
  price: string;
  image: string;
  ratio: string;
}

export interface Principle {
  index: string;
  title: string;
  body: string;
}

export interface ProcessStep {
  index: string;
  title: string;
  body: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const artist = {
  name: "Kai Nomura",
  wordmark: "kai nomura",
  discipline: "Digital & generative artist",
  based: "Kyoto · Berlin",
  email: "studio@kainomura.art",
} as const;

export const nav: NavLink[] = [
  { label: "Works", href: "#works" },
  { label: "About", href: "#about" },
  { label: "Process", href: "#process" },
  { label: "Acquire", href: "#acquire" },
  { label: "Contact", href: "#contact" },
];

/** Header left block — value proposition (reference: text-22 + text-14). */
export const brandline = {
  lead: "Digital & Generative Artist",
  sub: "Light · Code · Memory",
} as const;

export const hero = {
  eyebrow: "Digital & generative artist",
  title: "Light, written in code.",
  lead: "Kai Nomura builds immersive works where light, memory, and machine become one material — generative installations and editioned prints, exhibited worldwide and held in private collections.",
  cta: { label: "View the work", href: "#works" },
  secondaryCta: { label: "Acquire a piece", href: "#acquire" },
  scrollCue: "Scroll to enter",
  image: `${IMG}/art-p1.webp`,
  imageRatio: "3 / 4",
} as const;

export const statement = {
  eyebrow: "The practice",
  body: "For two decades I have treated code as a material — as physical as clay, as fleeting as light. My work is not made by the machine; it is made with it. Each system is tuned until it breathes, then released to find its own form.",
  signature: "— K.N.",
} as const;

export const works = {
  eyebrow: "Selected works",
  title: "A field of light, never the same twice.",
  items: [
    {
      id: "ma",
      index: "01",
      title: "Ma (間)",
      year: "2024",
      medium: "Generative light installation",
      image: `${IMG}/art-l1.webp`,
      ratio: "3 / 2",
    },
    {
      id: "tidal-memory",
      index: "02",
      title: "Tidal Memory",
      year: "2023",
      medium: "Real-time projection, sound",
      image: `${IMG}/art-l2.webp`,
      ratio: "3 / 2",
    },
    {
      id: "hanabi-engine",
      index: "03",
      title: "Hanabi Engine",
      year: "2024",
      medium: "Generative print series",
      image: `${IMG}/art-p3.webp`,
      ratio: "3 / 4",
    },
    {
      id: "silent-architecture",
      index: "04",
      title: "Silent Architecture",
      year: "2022",
      medium: "LED matrix, custom code",
      image: `${IMG}/art-l4.webp`,
      ratio: "3 / 2",
    },
    {
      id: "after-image",
      index: "05",
      title: "After Image",
      year: "2025",
      medium: "Archival pigment print",
      image: `${IMG}/art-l3.webp`,
      ratio: "3 / 2",
    },
    {
      id: "static-garden",
      index: "06",
      title: "Static Garden",
      year: "2023",
      medium: "Interactive installation",
      image: `${IMG}/art-l5.webp`,
      ratio: "3 / 2",
    },
  ] satisfies Work[],
} as const;

/** Pinned full-viewport CTA — the reference's "do-it" sticky block. */
export const pinnedOne = {
  eyebrow: "Acquire",
  title: "Some works only exist once.",
  body: "Each edition is signed, certified, and released in a strictly limited run. When it is gone, it is gone.",
  action: { label: "See what's available", href: "#acquire" },
  image: `${IMG}/art-p2.webp`,
  imageRatio: "3 / 4",
} as const;

export const principles = {
  eyebrow: "Studio principles",
  title: "Four rules the studio runs on.",
  items: [
    {
      index: "01",
      title: "The code is the brush.",
      body: "Tools should vanish. What remains on the wall is feeling, not technique.",
    },
    {
      index: "02",
      title: "Impermanence is the medium.",
      body: "A work that can change is more alive than one fixed forever in glass.",
    },
    {
      index: "03",
      title: "Light belongs to no one.",
      body: "I borrow it, shape it, and give it back. The viewer completes the piece.",
    },
  ] satisfies Principle[],
} as const;

export const about = {
  eyebrow: "About",
  title: "I make work that disappears the moment you understand it.",
  paragraphs: [
    "I grew up between two cities and two alphabets, and I think that is why impermanence never frightened me. My earliest pieces were small programs that drew with light and then forgot what they had drawn.",
    "Today my studio sits somewhere between an observatory and a workshop. I write the systems, tune them by hand, and let them run until something honest appears. Then I step back.",
    "When a work leaves the studio, it keeps changing. That is the point. I am not selling an object so much as a way of paying attention.",
  ],
  facts: [
    { label: "Based", value: "Kyoto · Berlin" },
    { label: "Working since", value: "2004" },
    { label: "Mediums", value: "Code, light, print" },
    { label: "Represented by", value: "Meridian Gallery" },
  ],
  images: [
    { src: `${IMG}/art-l1.webp`, alt: "Studio light study", ratio: "3 / 2" },
    { src: `${IMG}/art-l2.webp`, alt: "Installation detail", ratio: "3 / 2" },
    { src: `${IMG}/art-l3.webp`, alt: "Work in progress", ratio: "3 / 2" },
  ],
} as const;

export const process = {
  eyebrow: "The studio process",
  title: "From observation to exhibition.",
  steps: [
    {
      index: "01",
      title: "Observe",
      body: "Months of looking — at tides, crowds, signal noise, the way a room holds dusk. Nothing is sketched yet.",
    },
    {
      index: "02",
      title: "Compose",
      body: "I write the rules of the system: how light is born, how it decays, what it remembers. The score before the symphony.",
    },
    {
      index: "03",
      title: "Generate",
      body: "The system runs for days. I sit with it, tune it by hand, and wait for the moment it stops being mine.",
    },
    {
      index: "04",
      title: "Exhibit",
      body: "Each work is editioned, certified, and installed — in a gallery, a private collection, or a screen in your home.",
    },
  ] satisfies ProcessStep[],
} as const;

export const acquire = {
  eyebrow: "Acquire",
  title: "Own a piece of the field.",
  lead: "Limited editions, each signed and accompanied by a certificate of authenticity and a lifetime conservation guarantee. Worldwide shipping, fully insured.",
  items: [
    {
      id: "after-image-print",
      title: "After Image — Plate I",
      edition: "Edition of 12",
      medium: "Archival pigment print, 90 × 112 cm",
      price: "€4,800",
      image: `${IMG}/art-l4.webp`,
      ratio: "3 / 2",
    },
    {
      id: "hanabi-03",
      title: "Hanabi Engine — 03",
      edition: "Edition of 25",
      medium: "Generative print, 70 × 93 cm",
      price: "€2,400",
      image: `${IMG}/art-p2.webp`,
      ratio: "3 / 4",
    },
    {
      id: "ma-still",
      title: "Ma (間) — Still",
      edition: "Edition of 8",
      medium: "Editioned digital work, 4K, with display",
      price: "€6,200",
      image: `${IMG}/art-l5.webp`,
      ratio: "3 / 2",
    },
    {
      id: "tidal-still",
      title: "Tidal Memory — Frame 41",
      edition: "Edition of 30",
      medium: "Archival pigment print, 100 × 69 cm",
      price: "€1,950",
      image: `${IMG}/art-p3.webp`,
      ratio: "3 / 4",
    },
  ] satisfies ForSaleWork[],
  cta: { label: "Enquire about a work", href: "#contact" },
} as const;

/** Second pinned CTA — the reference repeats the "do-it" block for emphasis. */
export const pinnedTwo = {
  eyebrow: "Begin",
  title: "Start with a single conversation.",
  body: "Acquiring an edition, planning a commission, or simply curious — write to the studio. No pressure, just a real reply.",
  action: { label: "Write to the studio", href: "#contact" },
} as const;

export const testimonials = {
  eyebrow: "In their words",
  title: "What collectors and curators say.",
  items: [
    {
      quote:
        "Standing inside one of Nomura's installations, you stop checking your phone. Time slows down. That is the rarest thing an artwork can do now.",
      author: "Elena Vossberg",
      role: "Curator, Kunsthalle Nord",
    },
    {
      quote:
        "We bought a print and ended up rearranging the whole room around it. It changes with the daylight — it is never the same painting twice.",
      author: "Marcus & Lia Hartmann",
      role: "Private collectors, Zürich",
    },
    {
      quote:
        "Kai is one of the few artists working with code who never lets the technology become the subject. The work is always, quietly, about us.",
      author: "Daniel Asante",
      role: "Director, Lumen Festival",
    },
  ] satisfies Testimonial[],
} as const;

export const exhibitions = {
  eyebrow: "Exhibited & collected",
  title: "Shown in good company.",
  venues: [
    "Meridian Gallery",
    "Aurora Biennale",
    "Lumen Festival",
    "Kunsthalle Nord",
    "Pavilion 9",
    "Nocturne Foundation",
    "Verso Institute",
    "Halcyon Trust",
    "Field Museum of Light",
    "Serra Collection",
  ],
} as const;

export const faq = {
  eyebrow: "Questions",
  title: "Before you acquire.",
  items: [
    {
      question: "How are the editions authenticated?",
      answer:
        "Every work ships with a signed certificate of authenticity, an embedded edition number, and a registry entry held by the studio. Digital works include a verifiable provenance record.",
    },
    {
      question: "Do you ship worldwide?",
      answer:
        "Yes. All works are shipped fully insured, in archival packaging, by specialist art couriers. Lead time is typically two to four weeks depending on framing and destination.",
    },
    {
      question: "Can I commission an original work?",
      answer:
        "Selectively. The studio takes on a small number of commissions each year — site-specific installations and bespoke generative works for collectors and institutions.",
    },
    {
      question: "How do I care for a generative or screen-based piece?",
      answer:
        "Editioned digital works arrive with a calibrated display and a lifetime conservation guarantee. The studio handles updates, replacements, and migration so the work outlives the hardware.",
    },
  ] satisfies FaqItem[],
} as const;

export const footer = {
  tagline: "Light, written in code.",
  copyright: "© 2026 Kai Nomura Studio. All rights reserved.",
  columns: [
    {
      title: "Explore",
      links: [
        { label: "Works", href: "#works" },
        { label: "About", href: "#about" },
        { label: "Process", href: "#process" },
        { label: "Acquire", href: "#acquire" },
      ],
    },
    {
      title: "Studio",
      links: [
        { label: "Contact", href: "#contact" },
        { label: "Commissions", href: "#contact" },
        { label: "Press kit", href: "#contact" },
        { label: "Newsletter", href: "#contact" },
      ],
    },
  ],
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Behance", href: "https://behance.net" },
    { label: "Vimeo", href: "https://vimeo.com" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
} as const;
