/**
 * Content data for the NEGENTROPY tribute site. Brief: a particle-driven
 * scroll narrative around Bryan Johnson's Blueprint protocol.
 * See obsidian/projects/negentropy/concept.md for the storytelling arc.
 */

export interface BiomarkerStat {
  label: string;
  value: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface HeroSectionContent {
  index: string;
  meta: string;
  headlineLines: readonly string[];
  italicWord?: string;
  body: string;
  cta: { label: string; href: string };
}

/**
 * Sections (other than the hero) share a common header vocabulary
 * with the hero: a roman numeral `index` rendered inside round
 * brackets and a `meta` line like `SEC.002 — ENTROPY`. Mirrors
 * `HeroSectionContent` so every section uses the same corner-loaded
 * `( II ) — SEC.002 — ENTROPY` eyebrow.
 */
export interface SectionContent {
  index: string;
  meta: string;
  heading: string;
  body: string;
}

export interface NegentropyContent {
  brand: {
    name: string;
    badge: string;
    tagline: string;
  };
  nav: readonly NavItem[];
  loaderBeats: readonly string[];
  sections: {
    void: HeroSectionContent;
    entropy: SectionContent;
    refusal: SectionContent & { biomarkers: readonly BiomarkerStat[] };
    universe: SectionContent;
    choice: SectionContent;
    persist: SectionContent & { cta: { label: string; href: string } };
  };
}

export const negentropy: NegentropyContent = {
  brand: {
    name: "NEGENTROPY",
    badge: "DON'T DIE",
    tagline: "The science of refusing to fall apart.",
  },
  nav: [
    { label: "VOID", href: "#void" },
    { label: "ENTROPY", href: "#entropy" },
    { label: "REFUSAL", href: "#refusal" },
    { label: "UNIVERSE", href: "#universe" },
    { label: "CHOICE", href: "#choice" },
    { label: "PERSIST", href: "#persist" },
  ],
  loaderBeats: [
    "Every cell is falling apart.",
    "Until one refused.",
    "Don't die.",
  ],
  sections: {
    void: {
      index: "I",
      meta: "SEC.001 — THE VOID",
      headlineLines: ["EVERY CELL", "is FALLING", "APART."],
      italicWord: "is",
      body: "This is not a metaphor. It is thermodynamics. Every second your body trends toward the same equilibrium as the cold space between stars.",
      cta: {
        label: "Read full blueprint",
        href: "https://blueprint.bryanjohnson.com",
      },
    },
    entropy: {
      index: "II",
      meta: "SEC.002 — ENTROPY",
      heading: "One percent lost each year after thirty.",
      body: "The body's default is decay. Decay's default is acceptance.",
    },
    refusal: {
      index: "III",
      meta: "SEC.003 — THE REFUSAL",
      heading: "Bryan Johnson refused.",
      body: "The most measured human in history.",
      biomarkers: [
        { label: "biomarkers tracked daily", value: "1,977" },
        { label: "years biological age reversed", value: "-5.1" },
        { label: "percentile VO₂ max", value: "99th" },
      ],
    },
    universe: {
      index: "IV",
      meta: "SEC.004 — THE BODY AS UNIVERSE",
      heading: "You are a measurable universe.",
      body: "Atoms become cells. Cells become time. Time becomes a choice.",
    },
    choice: {
      index: "V",
      meta: "SEC.005 — THE CHOICE",
      heading: "The first generation that doesn't die has to choose to.",
      body: "Choose.",
    },
    persist: {
      index: "VI",
      meta: "SEC.006 — PERSIST",
      heading: "Begin today.",
      body: "The protocol is open. The science is published. The decision is yours.",
      cta: {
        label: "Read the Blueprint",
        href: "https://blueprint.bryanjohnson.com",
      },
    },
  },
};
