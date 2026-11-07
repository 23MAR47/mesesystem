/**
 * Home page content — placeholder copy & media for the hero section.
 *
 * Per component-conventions: no hardcoded content inside components. Every
 * string, number and asset path lives here and is passed down via props.
 * Values transcribed 1:1 from the Figma "Ternyon" hero (node 610:557).
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface Avatar {
  src: string;
  alt: string;
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface HeroContent {
  nav: {
    logo: { src: string; alt: string; href: string };
    links: NavLink[];
    contact: NavLink;
  };
  badge: string;
  /** Heading rendered as two fixed lines to match the Figma line breaks. */
  headingLines: [string, string];
  subheading: string;
  cta: NavLink;
  socialProof: {
    label: string;
    avatars: Avatar[];
  };
  panel: {
    videoSrc: string;
    modelSrc: string;
    overline: string;
    stats: HeroStat[];
  };
}

export const homeHero: HeroContent = {
  nav: {
    logo: { src: "/assets/logo.svg", alt: "Dringle", href: "#home" },
    links: [
      { label: "Home", href: "#home" },
      { label: "Services", href: "#services" },
      { label: "Works", href: "#works" },
      { label: "About", href: "#about" },
    ],
    contact: { label: "Contact", href: "#contact" },
  },
  badge: "Crafted to stand out",
  headingLines: ["Turn Your Brand Into the", "One They Reach For"],
  subheading:
    "We shape identity, art direction, and web into something people can't look away from — polished until it shines.",
  cta: { label: "Start a Project", href: "#contact" },
  socialProof: {
    label: "Chosen by ambitious founders",
    avatars: [
      { src: "/assets/1.png", alt: "Founder portrait" },
      { src: "/assets/2.png", alt: "Founder portrait" },
      { src: "/assets/3.png", alt: "Founder portrait" },
    ],
  },
  panel: {
    videoSrc: "/assets/purple-glass.mp4",
    modelSrc: "/assets/hands.glb",
    overline:
      "Identity, art direction, and web — shaped end to end until your brand is the one people can't ignore",
    stats: [
      { value: "120+", label: "Brands crafted ·" },
      { value: "40+", label: "Awards & features" },
      { value: "5.0", label: "Client rating" },
    ],
  },
};
