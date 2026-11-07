import { HERO_DINING_CHAIR, HERO_MODULAR_SOFA } from "@/data/mocks/home";
import { PreloadReveal } from "@/components/common/preload-reveal";
import { Spring } from "@/components/animation/springs/spring";
import { springWeight } from "@/lib/springs/config";
import { LineReveal } from "@/views/home/motion/line-reveal";

import { ExploreCta } from "./explore-cta";
import { HeroImage } from "./hero-image";

/** Bebas Neue's own space; the comp's 8px gap around the slash is 0.033em at 240px. */
const BEBAS_SPACE = 0.155;
const SLASH_GAP = 0.0333;

/**
 * Block 1 — hero. Figma 2412:210 (1440×800).
 *
 * The comp is an art-directed absolute layout, so every offset and size is
 * transcribed one-to-one in `rem` at the 1440 design base and the adaptive grid
 * scales the whole thing with the viewport.
 *
 * The section itself is `h-lvh` so block 1 fills the screen as requested; the
 * comp's 1440×800 frame sits inside it as a fixed 50rem stage pinned to the
 * top, which keeps the nav on the viewport edge and every internal distance
 * exact. At the design ratio (1.8, i.e. ~16:9) the stage fills the viewport
 * almost exactly; anything left over falls below the last element.
 *
 * Motion: the two headline lines arrive from opposite edges and meet (H2);
 * every caption comes out from under its own clip (B4); the plates uncover
 * bottom-up on the same weighted spring. Placement always lives on a plain
 * wrapper — `TextEngine` sets its own inline `position`, which would beat an
 * `absolute` class and drop the element into normal flow.
 */
export const HeroSection = () => {
  return (
    <section
      aria-label="Halden — timeless furniture"
      className="h-lvh w-full overflow-hidden bg-background text-foreground-accent"
    >
      <div className="relative h-[50rem] w-full at1024:h-[48rem] at768:h-[64rem] at390:h-[52.75rem]">
        <PreloadReveal>
          {/* Headline — two lines, positioned independently in the comp. */}
          {/* The h1 needs a real box: with `display: contents` it generates none, and
              the in-view observer that drives the reveal never intersects. It spans
              the stage and passes pointer events through to the plates below. */}
          <h1 className="pointer-events-none absolute inset-0 font-display text-display font-bold leading-normal text-foreground-accent at1024:text-[12.75rem] at768:text-[9.4375rem] at390:text-[4.875rem]">
            <Spring
              tag="span"
              mode="always"
              from={{ opacity: 0, x: -170 }}
              to={{ opacity: 1, x: 0 }}
              config={{ ...springWeight }}
              className="pointer-events-auto absolute left-[1.5625rem] top-[7.5rem] whitespace-nowrap at1024:left-[1.5rem] at1024:top-[6.125rem] at768:top-[5.5625rem] at390:left-[1rem] at390:top-[4.1875rem] [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]"
            >
              timeless
            </Spring>
            <Spring
              tag="span"
              mode="always"
              delayIn={140}
              from={{ opacity: 0, x: 170 }}
              to={{ opacity: 1, x: 0 }}
              config={{ ...springWeight }}
              className="pointer-events-auto absolute left-[16rem] top-[19.625rem] flex items-center gap-[0.5rem] whitespace-nowrap at1024:left-[15.125rem] at1024:top-[15.8125rem] at768:left-[11.3125rem] at768:top-[13.1875rem] at390:left-[5.3125rem] at390:top-[8.3125rem] at390:gap-[0.1875rem]"
            >
              <span className="[text-box-edge:cap_alphabetic] [text-box-trim:trim-both]">
                furniture
              </span>
              <span
                aria-hidden
                className="[text-box-edge:cap_alphabetic] [text-box-trim:trim-both]"
              >
                /
              </span>
            </Spring>
          </h1>

          {/* A rule the 390 comp draws under the headline; no other comp has it. */}
          <span
            aria-hidden
            className="absolute hidden at390:block at390:left-[1rem] at390:top-[18.375rem] at390:h-px at390:w-[22.375rem] bg-rule"
          />

          {/* Collection marker, top right. */}
          <span className="absolute left-[74.3125rem] top-[7.375rem] w-[4.5625rem] at1024:left-[45.625rem] at1024:top-[5.8125rem] at1024:w-[4rem] at768:left-[32.5625rem] at768:top-[5.375rem] at390:hidden">
            <LineReveal
              delay={320}
              weight="soft"
              className="font-serif text-body uppercase leading-[1.1] at1024:text-label at390:text-caption [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]"
            >
              collection 2026
            </LineReveal>
          </span>
          <span className="absolute left-[74.3125rem] top-[13.125rem] at1024:left-[45.625rem] at1024:top-[14.375rem] at768:left-[32.5625rem] at768:top-[11.5625rem] at390:hidden">
            <LineReveal
              delay={380}
              weight="soft"
              className="whitespace-nowrap font-serif text-body uppercase leading-[1.1] at1024:text-label at390:text-caption [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]"
            >
              01-11
            </LineReveal>
          </span>
          <HeroImage
            src="/assets/hero/collection-chair.png"
            revealDelay={340}
            alt="Red sculptural lounge chair from the 2026 collection"
            width={139}
            height={104}
            sizes="(max-width: 1024px) 20vw, 10vw"
            className="absolute left-[79.3125rem] top-[7.5rem] h-[6.5rem] w-[8.6875rem] at1024:left-[50.125rem] at1024:top-[6rem] at1024:h-[9.1875rem] at1024:w-[12.375rem] at768:left-[37.3125rem] at768:top-[5.5rem] at768:h-[6.8125rem] at768:w-[9.1875rem] at390:hidden"
          />

          {/* Dining chair — left product call-out. */}
          <span className="absolute left-[2rem] top-[23.875rem] w-[5rem] at1024:left-[1.5rem] at1024:top-[23.125rem] at1024:w-[5.375rem] at768:top-[18.1875rem] at768:w-[6rem] at390:hidden">
            <LineReveal
              delay={420}
              weight="soft"
              className="font-serif text-body uppercase leading-[1.1] at1024:text-label at390:text-caption [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]"
            >
              {`${HERO_DINING_CHAIR.name} ${HERO_DINING_CHAIR.size}`}
            </LineReveal>
          </span>
          <HeroImage
            src="/assets/hero/dining-chair.png"
            revealDelay={440}
            alt="Black wooden dining chair"
            width={103}
            height={100}
            sizes="(max-width: 1024px) 16vw, 8vw"
            className="absolute left-[9.25rem] top-[24rem] h-[6.25rem] w-[6.4375rem] at1024:left-[1.5rem] at1024:top-[15.6875rem] at1024:h-[7.125rem] at1024:w-[9.8125rem] at768:top-[13.125rem] at768:h-[4.6875rem] at768:w-[7.5625rem] at390:hidden"
          />
          <span className="absolute left-[2rem] top-[29.25rem] w-[5rem] at1024:left-[11.3125rem] at1024:top-[23.9375rem] at1024:w-auto at1024:-translate-x-full at768:left-[9.0625rem] at768:top-[18.9375rem] at390:hidden">
            <LineReveal
              delay={480}
              weight="soft"
              className="font-serif text-body uppercase leading-normal at1024:text-label at390:text-caption [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]"
            >
              {HERO_DINING_CHAIR.price}
            </LineReveal>
          </span>

          {/* Explore collection CTA — B4. */}
          <ExploreCta />

          {/* Modular sofa — centre product call-out. */}
          <span className="absolute left-[46.0625rem] top-[34.6875rem] w-[5.8125rem] -translate-x-full at1024:left-[16.875rem] at1024:top-[29.6875rem] at1024:w-[5.125rem] at1024:translate-x-0 at768:left-[1.5rem] at768:top-[24.8125rem] at768:w-[10.5rem] at390:left-[1rem] at390:top-[32.75rem] at390:w-[4.5rem]">
            <LineReveal
              delay={500}
              weight="soft"
              className="justify-end text-right font-serif text-body uppercase leading-[1.1] at1024:justify-start at1024:text-left at1024:text-label at390:text-caption [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]"
            >
              {`${HERO_MODULAR_SOFA.name} ${HERO_MODULAR_SOFA.size}`}
            </LineReveal>
          </span>
          <HeroImage
            src="/assets/hero/modular-sofa.png"
            revealDelay={520}
            alt="Modular sofa with a low coffee table in a bright living room"
            width={365}
            height={211}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 40vw, 26vw"
            className="absolute left-[46.5625rem] top-[34.8125rem] h-[13.1875rem] w-[22.8125rem] -scale-x-100 at1024:left-[16.875rem] at1024:top-[31.9375rem] at1024:h-[14.5625rem] at1024:w-[25.1875rem] at768:left-[1.5rem] at768:top-[26.3125rem] at768:h-[21rem] at768:w-[45rem] at390:left-[1rem] at390:top-[19.6875rem] at390:h-[12.5625rem] at390:w-[22.375rem]"
            imageClassName="h-full w-full object-cover at768:absolute at768:left-[-5.2%] at768:top-[-25.65%] at768:h-[136.36%] at768:w-[106.47%] at768:max-w-none at390:left-0 at390:top-[-7.1%] at390:h-[107.34%] at390:w-[100.84%]"
          />
          <span className="absolute left-[46.0625rem] top-[46.9375rem] -translate-x-full at1024:left-[39.4375rem] at1024:top-[30.5rem] at1024:translate-x-0 at768:left-[13.5625rem] at768:top-[24.6875rem] at768:translate-x-0 at390:left-[23.375rem] at390:top-[33.25rem] at390:-translate-x-full">
            <LineReveal
              delay={560}
              weight="soft"
              className="justify-end whitespace-nowrap text-right font-serif text-body uppercase leading-normal at1024:text-label at390:text-caption [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]"
            >
              {HERO_MODULAR_SOFA.price}
            </LineReveal>
          </span>

          {/* New arrivals — right pair. */}
          <span className="absolute left-[69.875rem] top-[37.5625rem] at1024:left-[42.5625rem] at1024:top-[35.1875rem] at768:left-[1.5rem] at768:top-[48.75rem] at390:left-[1rem] at390:top-[51.1875rem]">
            <LineReveal
              delay={600}
              weight="soft"
              className="whitespace-nowrap font-serif text-body uppercase leading-[1.1] at1024:text-label at390:text-caption [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]"
            >
              new arrivals
            </LineReveal>
          </span>
          <p
            aria-hidden
            className="absolute left-[88rem] top-[37.6875rem] -translate-x-full whitespace-nowrap text-right font-serif text-body uppercase leading-normal at1024:left-[62.5rem] at1024:top-[35.25rem] at1024:text-label at390:text-caption at768:left-[46.5rem] at768:top-[48.875rem] at390:left-[23.375rem] at390:top-[51.1875rem] [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]"
          >
            {"//"}
          </p>
          <HeroImage
            src="/assets/hero/new-arrival-1.png"
            revealDelay={620}
            alt="Sideboard with a table lamp and framed print"
            width={141}
            height={145}
            sizes="(max-width: 548px) 47vw, (max-width: 768px) 23vw, (max-width: 1024px) 16vw, 10vw"
            className="absolute left-[69.875rem] top-[38.9375rem] h-[9.0625rem] w-[8.8125rem] -scale-x-100 at390:scale-x-100 at1024:left-[42.5625rem] at1024:top-[36.5rem] at1024:h-[10rem] at1024:w-[9.75rem] at768:left-[1.5rem] at768:top-[50.25rem] at768:h-[12.25rem] at768:w-[10.875rem] at390:left-[1rem] at390:top-[35.125rem] at390:h-[15.5625rem] at390:w-[11.1875rem]"
          />
          <HeroImage
            src="/assets/hero/new-arrival-2.png"
            revealDelay={660}
            alt="Round dining table with four chairs"
            width={141}
            height={145}
            sizes="(max-width: 548px) 47vw, (max-width: 768px) 23vw, (max-width: 1024px) 16vw, 13vw"
            className="absolute left-[79.1875rem] top-[38.9375rem] h-[9.0625rem] w-[8.8125rem] -scale-x-100 at390:scale-x-100 at1024:left-[52.8125rem] at1024:top-[36.5rem] at1024:h-[10rem] at1024:w-[9.6875rem] at768:left-[35.625rem] at768:top-[50.25rem] at768:h-[12.25rem] at768:w-[10.875rem] at390:left-[12.625rem] at390:top-[35.125rem] at390:h-[15.5625rem] at390:w-[10.75rem]"
            imageClassName="absolute left-[-23.81%] top-[-63.24%] h-[170.17%] w-[123.81%] max-w-none at768:left-0 at768:top-0 at768:h-full at768:w-full at768:object-cover"
          />

          {/* Welcome statement, bottom left. */}
          <span className="absolute left-[2rem] top-[43.8125rem] -mt-[0.24375rem] w-[10.6875rem] at1024:left-[1.5rem] at1024:top-[42.6875rem] at1024:w-[9.75rem] at768:left-[17.6875rem] at768:top-[55.5625rem] at768:w-[12.6875rem] at390:left-[1rem] at390:top-[15rem] at390:w-[5.9375rem]">
            <LineReveal
              delay={700}
              columnGap={BEBAS_SPACE}
              clip={false}
              className="font-display text-title font-bold uppercase leading-[1] at1024:text-[1.5rem] at768:text-[1.25rem] at768:text-center at768:justify-center at390:justify-start at390:text-left at390:text-[0.875rem] [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]"
            >
              WELCOME TO HALDEN – tIMELESS DESIGN, MADE TO LAST.
            </LineReveal>
          </span>
        </PreloadReveal>
      </div>
    </section>
  );
};
