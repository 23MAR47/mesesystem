/**
 * Home view — a Server Component composing the six Halden blocks.
 *
 * Ported from Figma "Ternyon":
 *   Block 1 hero      2412:210   Block 4 products  2431:940
 *   Block 2 manifesto 2428:599   Block 5 room      2384:190
 *   Block 3 catalogue 2384:156   Block 6 footer    2384:202
 */
import { CatalogueSection } from "@/views/home/catalogue/catalogue-section";
import { FooterSection } from "@/views/home/footer/footer-section";
import { HeroSection } from "@/views/home/hero/hero-section";
import { ManifestoSection } from "@/views/home/manifesto/manifesto-section";
import { FrameCursor } from "@/views/home/motion/frame-cursor";
import { Preloader } from "@/views/home/motion/preloader";
import { SiteHeader } from "@/views/home/site-header";
import { ProductsSection } from "@/views/home/products/products-section";
import { RoomSection } from "@/views/home/room/room-section";

export const HomeView = () => {
  return (
    <>
      <Preloader />
      <SiteHeader />
      <main>
        <HeroSection />
        <ManifestoSection />
        <CatalogueSection />
        <ProductsSection />
        <RoomSection />
      </main>
      <FooterSection />
      <FrameCursor />
    </>
  );
};
