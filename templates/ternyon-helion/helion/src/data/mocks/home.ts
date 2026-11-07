import { screens } from "@/lib/scene/screens";
import { siteConfig } from "@/lib/site";

/**
 * Placeholder content for the home view, ported from the original helios
 * components. Components take this via props — never by importing it directly.
 */

export interface HeroFormContent {
  name: string;
  email: string;
  submit: string;
}

export interface HeroContent {
  /** Masthead top line — the white → haze half of the mirrored gradient. */
  titleTop: string;
  /** Masthead bottom line — the haze → white half. */
  titleBottom: string;
  subtitle: string;
  form: HeroFormContent;
}

export const hero: HeroContent = {
  titleTop: "We don't design brands.",
  titleBottom: "We give them gravity.",
  subtitle:
    "Identity, art direction, and web — engineered to attract, not to be scrolled past.",
  form: {
    name: "Name",
    email: "Email",
    submit: "Send Request",
  },
};

export interface HeroNavContent {
  /** Accessible name for the logo home control. */
  wordmark: string;
  links: NavItem[];
  ctaLabel: string;
}

/**
 * Top navigation for the Ternyon hero redesign (Figma 665:1694). Replaces the
 * original fixed `Header` on the home view. The link labels are the design's;
 * their targets map onto the existing case-study sections.
 */
export const heroNav: HeroNavContent = {
  wordmark: "Helion",
  links: [
    { label: "Home", target: screens.HERO },
    { label: "Services", target: screens.SITEMAP },
    { label: "Works", target: screens.ROADMAP },
    { label: "About", target: screens.IMPACT },
  ],
  ctaLabel: "Send Request",
};

export interface ServiceItem {
  title: string;
  caption: string;
}

export interface ServicesContent {
  /** Masthead top line — white → haze half of the mirrored gradient. */
  titleTop: string;
  /** Masthead bottom line — haze → white half. */
  titleBottom: string;
  /** Left-hand feature column (left-aligned). */
  left: ServiceItem[];
  /** Right-hand feature column (right-aligned). */
  right: ServiceItem[];
  footnote: string;
}

/**
 * Services section — the Ternyon redesign of the second slide (Figma
 * 668:1825). A two-line masthead over a four-cell feature grid (two columns of
 * two), footed by a centred line of copy.
 */
export const services: ServicesContent = {
  titleTop: "Brand Identity.",
  titleBottom: "Systems that hold.",
  left: [
    { title: "Identity", caption: "Built to hold" },
    { title: "Motion", caption: "Built to move" },
  ],
  right: [
    { title: "Art Direction", caption: "Built to lead" },
    { title: "Web", caption: "Built to last" },
  ],
  footnote:
    "We shape identity, art direction, and web into something people can't look away from — polished until it shines.",
};

export interface TimelineStep {
  /** Two-digit index shown in the gradient numeral, e.g. "01". */
  index: string;
  title: string;
  body: string;
}

export interface TimelineContent {
  /** Masthead top line — white → haze half of the mirrored gradient. */
  titleTop: string;
  /** Masthead bottom line — haze → white half. */
  titleBottom: string;
  steps: TimelineStep[];
}

/**
 * Timeline section — the Ternyon redesign of the third slide (Figma 669:1927):
 * the studio's engagement as a horizontal rail that scrolls right-to-left across
 * the whole scene. The copy is written to follow on from the hero ("give brands
 * gravity") and services (Identity / Motion / Art Direction / Web).
 */
export const timeline: TimelineContent = {
  titleTop: "From signal",
  titleBottom: "to system.",
  steps: [
    {
      index: "01",
      title: "Discovery",
      body: "We map the field — audience, market, and the pull your brand needs to exert.",
    },
    {
      index: "02",
      title: "Identity",
      body: "The core system: marks, type, and rules, engineered to hold under load.",
    },
    {
      index: "03",
      title: "Art Direction",
      body: "A visual language with a point of view — directed to lead, never to follow.",
    },
    {
      index: "04",
      title: "Motion",
      body: "Every transition is spring-built, so the brand moves the way it means to.",
    },
    {
      index: "05",
      title: "Web",
      body: "The experience, engineered to last — fast, precise, impossible to scroll past.",
    },
  ],
};

export interface SitemapChapter {
  number: string;
  title: string;
  subtitle: string;
  target: string;
}

export interface SitemapContent {
  eyebrow: string;
  heading: string;
  ctaLabel: string;
  /** Grouped exactly as the original: one, then two, then two. */
  rows: SitemapChapter[][];
}

export const sitemap: SitemapContent = {
  eyebrow: "Chapters",
  heading: "The HELION case study, in five steps.",
  ctaLabel: "View live demo →",
  rows: [
    [
      {
        number: "01",
        title: "Roadmap",
        subtitle: "Three phases of the engagement",
        target: screens.ROADMAP,
      },
    ],
    [
      {
        number: "02",
        title: "Discovery",
        subtitle: "Field research with plasma physicists",
        target: screens.PARTNERS,
      },
      {
        number: "03",
        title: "System",
        subtitle: "Control architecture",
        target: screens.PRODUCT,
      },
    ],
    [
      {
        number: "04",
        title: "Console",
        subtitle: "Operator UI build",
        target: screens.INVESTORS,
      },
      {
        number: "05",
        title: "Outcome",
        subtitle: "What shipped, what we learned",
        target: screens.SOCIAL,
      },
    ],
  ],
};

export interface BriefPhase {
  num: string;
  kicker: string;
  heading: string;
  body: string;
}

export interface BriefContent {
  chapter: string;
  phases: BriefPhase[];
}

export const brief: BriefContent = {
  chapter: "01 · Roadmap",
  phases: [
    {
      num: "01",
      kicker: "Calibration",
      heading: "Two weeks in the control room",
      body: "We sat behind operators during 47 plasma runs — watched what mattered, watched what got missed, mapped every keystroke across four legacy screens.",
    },
    {
      num: "02",
      kicker: "Build",
      heading: "Three views. One console. One clock",
      body: "Anomaly response, routine ops, deep-dive postmortem — context-driven views the team could move between in a single keystroke, all tied to a shared timeline.",
    },
    {
      num: "03",
      kicker: "Ship",
      heading: "Live across fourteen reactor cells",
      body: "Operator response time on plasma transients dropped from 14 seconds to under 4. Anomaly classification accuracy is up 34%. Now part of standard onboarding.",
    },
  ],
};

export interface ImpactMetric {
  value: string;
  suffix?: string;
  label: string;
}

export interface ImpactContent {
  chapter: string;
  heading: string;
  metrics: ImpactMetric[];
  foot: string;
}

export const impact: ImpactContent = {
  chapter: "02 · Impact",
  heading: "What the team felt the first week it went live.",
  metrics: [
    {
      value: "−71",
      suffix: "%",
      label: "Median operator response on plasma transients",
    },
    {
      value: "+34",
      suffix: "%",
      label: "Anomaly classification accuracy, day one",
    },
    {
      value: "14",
      suffix: " cells",
      label: "Reactor cells running live on the console",
    },
  ],
  foot: "Measured across fourteen reactor cells over the first ninety days.",
};

/**
 * Logo scene (fourth slide) — the same hero composition, reused as the payoff:
 * a two-line mirrored-gradient masthead and a subtitle framing the particle mark
 * as it assembles. No contact form here — the mark is the closing statement.
 */
export interface LogoSceneContent {
  /** Masthead top line — the white → haze half of the mirrored gradient. */
  titleTop: string;
  /** Masthead bottom line — the haze → white half. */
  titleBottom: string;
  subtitle: string;
  /** The hero's contact form, carried onto the closing scene. */
  form: HeroFormContent;
}

export const logoScene: LogoSceneContent = {
  titleTop: "Thousands of parts.",
  titleBottom: "One point of gravity.",
  subtitle:
    "Every element pulled into a single mark — the whole system, made visible.",
  form: {
    name: "Name",
    email: "Email",
    submit: "Send Request",
  },
};

export interface NavItem {
  label: string;
  target: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface FooterContent {
  wordmark: string;
  tagline: string;
  ctaLabel: string;
  ctaHref: string;
  nav: NavItem[];
  social: SocialLink[];
  copy: string;
}

export const footer: FooterContent = {
  wordmark: "HELION",
  tagline: "Designing the instruments people trust under load.",
  ctaLabel: "Start a project",
  ctaHref: "mailto:studio@helion.studio",
  nav: [
    { label: "The work", target: screens.SITEMAP },
    { label: "Roadmap", target: screens.ROADMAP },
    { label: "Impact", target: screens.IMPACT },
  ],
  social: [
    { label: "Email", href: "mailto:studio@helion.studio" },
    { label: "Twitter", href: "https://twitter.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
  ],
  /* The year and the holder come from `siteConfig`, which is also what the
   * JSON-LD `WebSite` node states — a footer that claims a different year to the
   * structured data is the sort of thing nobody notices for two years. */
  copy: `© ${siteConfig.copyrightYear} ${siteConfig.copyrightHolder} — All rights reserved`,
};

export interface HeaderContent {
  wordmark: string;
  navLabel: string;
  ctaLabel: string;
}

export const header: HeaderContent = {
  wordmark: "HELION",
  navLabel: "Chapters",
  ctaLabel: "View live demo",
};

export interface MenuContent {
  eyebrow: string;
  ctaLabel: string;
  links: NavItem[];
}

/** Chapter labels shown in the mobile menu, from the original `section_links`. */
export const menu: MenuContent = {
  eyebrow: "Chapters",
  ctaLabel: "View live demo",
  links: [
    { label: "Roadmap", target: screens.ROADMAP },
    { label: "Discovery", target: screens.PARTNERS },
    { label: "System", target: screens.PRODUCT },
    { label: "Console", target: screens.INVESTORS },
    { label: "Outcome", target: screens.SOCIAL },
  ],
};
