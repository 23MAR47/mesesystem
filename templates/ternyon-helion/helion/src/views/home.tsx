import { Scene } from "@/components/common/scene/scene";
import { SectionController } from "@/components/common/sections/section-controller";
import { SectionDeepLink } from "@/components/common/sections/section-deep-link";
import { Slide } from "@/components/common/sections/slide";
import { HeroNav } from "@/components/common/chrome/hero-nav";

import { Hero } from "@/views/home/sections/hero";
import { Services } from "@/views/home/sections/services";
import { Timeline } from "@/views/home/sections/timeline";
import { LogoParticles } from "@/views/home/sections/logo-particles";

import { screens } from "@/lib/scene/screens";
import * as content from "@/data/mocks/home";

/**
 * Home view — the whole case study: one scrolling page over a single WebGL
 * scene. A Server Component; every animated piece below is a client leaf.
 *
 * The scene runs across every slide — a vortex (hero), the services burst, the
 * roadmap maelstrom, then the camera dives through its hole and the particle mark
 * assembles on the same starfield for the closing logo scene. The final slide
 * reuses the hero composition (masthead + subtitle, no form) to frame that mark.
 *
 * The roadmap slide is 2.5 viewports tall to give its morph scroll length. The
 * Sitemap opts out of sticky pinning and scrolls with the page.
 */
export interface HomeViewProps {
  /** Set on the deep-link routes (`/roadmap`, `/product`, …) to scroll there. */
  section?: string;
}

export const HomeView = ({ section }: HomeViewProps) => {
  return (
    <>
      <Scene />
      <SectionController />
      {section && <SectionDeepLink target={section} />}

      <HeroNav content={content.heroNav} />

      <main className="relative w-full">
        {/* Each slide's height in viewports is the scroll length its scene morph
            is mapped across, so the vh values are also the transition pacing: the
            galaxy→burst morph runs over the hero's scroll, burst→maelstrom over the
            sitemap's, and the dive-through over the roadmap→impact run. They are
            kept a touch long so every scene switch reads as a stretched, gradual
            transition rather than a quick cut. */}
        <Slide id={screens.HERO} vh={1.4}>
          <Hero content={content.hero} />
        </Slide>

        <Slide id={screens.SITEMAP} vh={1.4} sticky={false}>
          <Services content={content.services} />
        </Slide>

        {/* Inter-slide gaps. The roadmap keeps a generous run-in — the terrain
            needs empty scroll to rise into. Impact's gap is small: the canvas is
            already dissolving there, so a long empty band just reads as dead
            space between the last scene and the outcome board. */}
        <Slide
          id={screens.ROADMAP}
          vh={3.2}
          sticky={false}
          className="mt-75 max-hero-md:mt-50 max-hero-xs:mt-35"
        >
          <Timeline content={content.timeline} />
        </Slide>

        <Slide
          id={screens.IMPACT}
          vh={2.4}
          className="mt-24 max-hero-md:mt-16 max-hero-xs:mt-12"
        >
          <LogoParticles content={content.logoScene} />
        </Slide>
      </main>
    </>
  );
};
