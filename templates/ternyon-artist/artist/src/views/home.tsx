/**
 * Home view — the Kai Nomura artist site. A long-scroll, animation-driven page
 * whose layout clones the reference site 1:1 (sections, grid, palette, pinned
 * CTAs, image placement), with original copy.
 *
 * Server Component: it only composes the section client-leaves (hard rule #6).
 * Each section owns its own `"use client"` boundary and reads content from
 * `src/data/mocks/home.ts`.
 */
import { Header } from "@/components/home/header";
import { Hero } from "@/components/home/hero";
import { Statement } from "@/components/home/statement";
import { FeaturedWorks } from "@/components/home/featured-works";
import { PinnedCta } from "@/components/home/pinned-cta";
import { Principles } from "@/components/home/principles";
import { About } from "@/components/home/about";
import { Process } from "@/components/home/process";
import { Acquire } from "@/components/home/acquire";
import { Testimonials } from "@/components/home/testimonials";
import { Exhibitions } from "@/components/home/exhibitions";
import { Faq } from "@/components/home/faq";
import { Footer } from "@/components/home/footer";
import { pinnedOne, pinnedTwo } from "@/data/mocks/home";

export const HomeView = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Statement />
        <FeaturedWorks />
        <PinnedCta
          eyebrow={pinnedOne.eyebrow}
          title={pinnedOne.title}
          body={pinnedOne.body}
          action={pinnedOne.action}
          image={pinnedOne.image}
          imageRatio={pinnedOne.imageRatio}
        />
        <Principles />
        <About />
        <Process />
        <Acquire />
        <PinnedCta
          id="contact"
          eyebrow={pinnedTwo.eyebrow}
          title={pinnedTwo.title}
          body={pinnedTwo.body}
          action={pinnedTwo.action}
          center
        />
        <Testimonials />
        <Exhibitions />
        <Faq />
      </main>
      <Footer />
    </>
  );
};
