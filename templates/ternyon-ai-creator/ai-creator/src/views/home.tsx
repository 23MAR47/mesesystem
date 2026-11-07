/**
 * Home view — a Server Component.
 *
 * It stays a Server Component so the bot / real-user split happens before any
 * JavaScript is chosen: crawlers and audit tools get the static poster and never
 * enter the `three` chunk's graph, everyone else gets the lazy WebGL leaf.
 *
 * The scroll runways that drive each section belong to the sections themselves,
 * not to this view — a runway's length and the animation it paces are one
 * setting. The bot path has no scroll choreography and so needs no runway; a
 * single screen is the whole of the hero for it.
 *
 * 📖 Docs: obsidian/workflows/new-page.md · obsidian/workflows/optimize-3d-scene.md
 */

import { CurvedGallery } from "@/components/common/gallery";
import {
  ClosingStage,
  DeliveryStage,
  HeroStageCopy,
  HeroStageTitle,
  ImmersedStage,
  ProcessRules,
  ProcessStage,
  StageNavBar,
} from "@/components/common/hero";
import { Preloader } from "@/components/common/preloader";
import {
  LazyModelViewer,
  ModelPoster,
  TierReload,
} from "@/components/common/scene";
import { homeMocks } from "@/data/mocks/home";
import { isBot } from "@/utils/is-bot";

export const HomeView = async () => {
  const bot = await isBot();
  const { hero, immersed, delivery, process, stage, gallery, contact } =
    homeMocks;

  return (
    <main className="relative bg-stage-ground">
      {/* The opening curtain, and only for a reader: a crawler is served the
          static poster and never enters the `three` chunk, so nothing would
          ever tell a curtain it could leave. */}
      {bot ? null : <Preloader />}
      {/* The scene is built for the tier read at mount; a resize that changes
          the tier reloads rather than rebuilding under the reader. */}
      {bot ? null : <TierReload />}

      {/* One bar for the middle of the page, over every section it crosses. */}
      <StageNavBar content={immersed} />
      <section className="relative w-full">
        {/* The page's one h1 is the name over the scene, so this heading is a
            level down — it names the section, it does not open the document. */}
        <h2 className="sr-only">{stage.label}</h2>
        {bot ? (
          /* `lvh`, not `dvh`: a collapsing iOS URL bar must not resize the box
             the canvas is sized from. Content sections belong in `dvh`. */
          <div className="relative h-lvh w-full overflow-hidden">
            <ModelPoster src={stage.posterSrc} />
            <HeroStageTitle name={hero.name} />
            <HeroStageCopy content={hero} />
          </div>
        ) : (
          /* One screen, three layers: the title behind the canvas, the model in
             it, the copy over it. The scene's white stage paints nothing, so
             the title shows through and only the model covers it. */
          <LazyModelViewer
            stageRule
            posterSrc={stage.posterSrc}
            behind={<HeroStageTitle name={hero.name} />}
            front={<HeroStageCopy content={hero} />}
            immersed={<ImmersedStage content={immersed} />}
            delivery={<DeliveryStage content={delivery} />}
            /* The same two screens as stills, for a phone — the lite path
               decides at mount which of the two forms it renders. The
               immersed heading is painted by the scene on the full path and
               resolves in the DOM here, where there is no scene to paint it. */
            stills={{
              immersed: {
                image: stage.stills.immersed,
                children: <ImmersedStage content={immersed} painted={false} />,
              },
              delivery: {
                image: stage.stills.delivery,
                children: <DeliveryStage content={delivery} />,
              },
            }}
          />
        )}
      </section>

      {/* The closing screen rides **on** the gallery's rising plane rather than
          waiting in a section behind it. Both were the accent, so the old shape
          cost a screen of scroll through blank blue before any of the
          invitation showed — the plane arrived, then the block it handed over
          to arrived after it. On the plane, the screen is whole the moment it
          appears: one screen, and the transition *is* it arriving.

          **The page's one scene is the hero's.** This screen is the same bust
          as a still image, cut out on the accent, with the type resolving in
          the DOM — the same for a reader and a crawler. ADR-0125. */}
      <CurvedGallery
        heading={gallery.heading}
        items={[...gallery.items]}
        frame={<ProcessRules rules={process.rules} />}
        overlay={<ProcessStage content={process} />}
        closing={
          <ClosingStage
            content={contact}
            figureSrc={stage.cutoutSrc}
            figureSize={stage.cutoutSize}
          />
        }
      />
    </main>
  );
};
