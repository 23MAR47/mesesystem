// 📖 Docs: obsidian/frontend/components/common.md
"use client";

/**
 * Client leaf that owns the WebGL canvas and the scroll runway it is pinned to.
 *
 * Four things live here and nowhere else:
 *   1. **The runway.** The stage is `position: sticky` inside a taller box, so
 *      scrolling past it drives the tide without the canvas moving. The runway
 *      is rendered here rather than in the view because its length and the
 *      scene's stages are one setting (`sceneConfig.stages.runwayViewports`).
 *   2. **Scroll progress** — read through the starter's `<ProgressTrigger>`,
 *      which runs on the shared ticker, so the scene adds no scroll listener.
 *   3. **Visibility gating** — the scene only renders while it is on (or near)
 *      screen and the tab is foregrounded.
 *   4. **Handoff** — the canvas is transparent until `load()` resolves, which is
 *      after every program is compiled and every texture uploaded. Revealing on
 *      scene-ready rather than on a timer is what keeps the first frame clean.
 *   5. **One scene at a time on the canvas.** A canvas element has exactly one
 *      WebGL context for its whole life, so overlapping `ModelScene`s are two
 *      renderers fighting over one context — see `teardownRef`.
 */

import { SpringValue } from "@react-spring/web";
import type { AnimationResult } from "@react-spring/web";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

import { ProgressTrigger } from "@/components/animation/springs/progress-trigger";
import { Spring } from "@/components/animation/springs/spring";
import { StillStage } from "@/components/common/hero/still-stage";
import type { StillImage } from "@/components/common/hero/still-stage";
import { usePreloader } from "@/hooks/preloader/use-preloader";
import { wantsLiteScene } from "@/lib/scene/device";
import { ModelScene } from "@/lib/scene/model-scene";
import { sceneConfig } from "@/lib/scene/scene.config";

import { ModelPoster } from "./model-poster";

/** The runway's height. Exported so the lazy wrapper's placeholder reserves the
 *  same space during SSR and the page height does not jump on hydration. */
export const runwayHeight = `${sceneConfig.stages.runwayViewports * 100}lvh`;
/** The lite path's runway — the pinned screen and a little more. The SSR
 *  placeholder keeps the full height; the swap happens under the curtain. */
const liteRunwayHeight = `${sceneConfig.lite.runwayViewports * 100}lvh`;

/** A screen of the narrative as a still, for the lite path. */
export interface StillScreen {
  image: StillImage;
  /** The screen's copy, in its DOM-revealing form. */
  children: ReactNode;
}

export interface ModelViewerProps {
  /**
   * Painted **behind** the canvas, inside the pinned stage.
   *
   * The first screen's title sits here: the scene's white stage is transparent
   * (see `patchBackgroundMaterial`), so the page's ground and anything on it
   * show through, and the model itself covers whatever it overlaps — which is
   * the whole point of the composition.
   */
  behind?: ReactNode;
  /** Painted **over** the canvas, inside the same pinned stage. */
  front?: ReactNode;
  /**
   * The second screen, over the canvas — shown while the reader is on the tide.
   *
   * It has its own window rather than sharing the first screen's, because the
   * two belong to different stages of one scroll: the title leaves as the model
   * dissolves, and this arrives with the field.
   */
  immersed?: ReactNode;
  /** The third screen, over the canvas — shown while the mark stands. */
  delivery?: ReactNode;
  /**
   * The second and third screens as stills, for the lite path.
   *
   * A phone gets the model alone on a short runway and these two sections
   * after it, each a captured frame of the stage with the screen's own copy
   * revealing over it — see `wantsLiteScene`. ADR-0126.
   */
  stills?: { immersed: StillScreen; delivery: StillScreen };
  /** Draw the first screen's rule in the scene, under the model and over the
   *  pointer's mark. Only the hero has one. */
  stageRule?: boolean;
  /** Shown if WebGL is unavailable — the same framing as the live scene. */
  posterSrc: string;
}

/**
 * Each layer's own window on the runway, as fractions of it.
 *
 * The first screen's two layers simply leave; the second arrives with the tide
 * and goes before the letters do. Keyed to `stages.tide` and `stages.deep` in
 * the scene's config — if those move, these follow.
 *
 * Module scope, not the component: it is invariant, and holding it inside meant
 * either re-creating every callback that reads it on each render or silencing
 * the dependency rule.
 */
const LAYER_WINDOWS: readonly {
  in: number;
  hold: number;
  out: number;
  end: number;
  /**
   * Play on a clock of its own once the scroll crosses `in`, rather than being
   * scrubbed by it.
   *
   * The screen it belongs to has already arrived by then — the field has filled
   * the frame — so tying the type to the next few pixels of scroll makes it a
   * thing the reader operates rather than a thing that happens to them. The
   * scroll still decides *when*; the spring decides how it goes.
   */
  auto?: boolean;
}[] = [
  // **The two halves of the first screen leave at different times, and that is
  // the point.** The tide climbs from the bottom (`stages.tide`, 0.067 to
  // 0.28), so it reaches the copy long before the name — and anything still
  // drawn when it arrives is drawn *over* the blue, which is the overlap that
  // made the seam look broken.
  //
  // So each half is gone by the time the line gets to it: the name at the top
  // keeps its slow exit, the copy along the bottom goes early.
  { in: 0, hold: 0, out: 0, end: 0.26 },
  { in: 0, hold: 0, out: 0, end: 0.12 },
  // Not until the field has **filled the frame** — `stages.tide` finishes at
  // 0.28 — and then on its own clock.
  { in: 0.28, hold: 0.28, out: 0.44, end: 0.48, auto: true },
  // The mark: formed by the end of `stages.morph`, poured with chrome from
  // `text.fill`, and gone with the runway.
  // Starts **after** the second screen's window has closed, not across it: two
  // screens dissolving through each other is the same fault as the first seam.
  //
  // And it does **not** fade out again: it is the last screen of the runway, so
  // the thing that takes it away is the pinned stage scrolling off at the end,
  // which is a handover to the next section rather than a disappearance. Fading
  // it early left the reader watching an empty field. `end` is not past `out`,
  // which is how a window says "no exit".
  { in: 0.56, hold: 0.72, out: 1, end: 1 },
];

/**
 * The lite runway's windows: the first screen's two layers, and they **stay**.
 *
 * `end` not past `out` is how a window says "no exit" (see the delivery
 * window above). The screen leaves as a whole when the pinned stage scrolls
 * off — the model turning under type that holds still — rather than the type
 * dissolving out from under the reader first, which on a phone read as the
 * page emptying. There is no second or third layer here; those screens are
 * sections of their own below the runway.
 */
const LITE_WINDOWS: typeof LAYER_WINDOWS = [
  { in: 0, hold: 0, out: 1, end: 1 },
  { in: 0, hold: 0, out: 1, end: 1 },
];

export const ModelViewer = ({
  behind,
  front,
  immersed,
  delivery,
  stills,
  stageRule = false,
  posterSrc,
}: ModelViewerProps) => {
  // Decided once, at mount: a device does not change tier mid-session, and
  // the runway's length and the layers it carries follow from it.
  const [lite] = useState(() => wantsLiteScene());
  const windows = lite ? LITE_WINDOWS : LAYER_WINDOWS;
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** The pinned stage — the canvas *and* the layers around it. The scene needs
   *  it to find the type it paints, which is a sibling of the canvas. */
  const stageRef = useRef<HTMLDivElement>(null);
  /** The title and copy belong to the **first screen**, not to the whole
   *  runway: the stage is pinned for seven viewports, so without this they sit
   *  over the tide and the letters for the entire scroll. */
  const layersRef = useRef<(HTMLDivElement | null)[]>([]);
  const sceneRef = useRef<ModelScene | null>(null);
  const progressRef = useRef(0);
  /**
   * Resolves when the previous scene has let go of the canvas.
   *
   * A canvas element has exactly **one** WebGL context for its whole life:
   * `getContext` hands the same one back every time. So two `ModelScene`s on
   * one canvas are not two scenes, they are two renderers fighting over one
   * context — and when the first one is disposed it clears that context's
   * program cache out from under the second, which then draws some materials
   * and not others. React's development double-mount produces exactly that
   * overlap, which is why the hero came back wrong every few reloads and right
   * on the next. Construction waits on this so the two lifetimes never touch.
   */
  const teardownRef = useRef<Promise<void>>(Promise.resolve());
  const [ready, setReady] = useState(false);
  // The curtain's two ends. `markSceneReady` lets it finish; `released` is it
  // telling us it has gone, which is when the entrance may play — see
  // `usePreloader`.
  const markSceneReady = usePreloader((state) => state.markSceneReady);
  const uncovered = usePreloader((state) => state.released);
  const [failed, setFailed] = useState(false);

  /**
   * The painted type's two drivers, kept apart and multiplied.
   *
   * `entrance` is the one-off arrival once the scene is up; `window` is the
   * layer's own place on the runway. Multiplying is what lets the letters
   * resolve on load *and* come apart again on scroll without either driver
   * knowing about the other — and the scene turns whichever value it is handed
   * into a per-letter stagger, so both directions are lettered for free.
   */
  const entranceRef = useRef(0);
  /** Each layer's own window, so the entrance can be folded into all of them. */
  const inkWindowRef = useRef<number[]>([]);
  const pushInk = useCallback((layer: number, window?: number) => {
    if (window !== undefined) inkWindowRef.current[layer] = window;
    sceneRef.current?.setInkOpacity(
      layer,
      entranceRef.current * (inkWindowRef.current[layer] ?? 0),
    );
  }, []);
  /**
   * The layer's reveal for the copy in the DOM: its window on the runway times
   * the one-off entrance — the same product the painted type is given, so a
   * screen's DOM copy and its painted heading arrive on one clock. Written as
   * the custom property `<StageReveal>` and `stageRise` divide up.
   */
  const writeReveal = useCallback((layer: number, window: number) => {
    layersRef.current[layer]?.style.setProperty(
      "--stage-reveal",
      String(entranceRef.current * window),
    );
  }, []);
  /** The entrance is one value over every layer; each keeps its own window. */
  const pushEntrance = useCallback(() => {
    for (let layer = 0; layer < windows.length; layer++) {
      pushInk(layer);
      writeReveal(layer, inkWindowRef.current[layer] ?? 0);
    }
  }, [pushInk, writeReveal, windows]);

  /**
   * A bare `SpringValue` rather than `useSpring`.
   *
   * Nothing here is rendered from it — the value goes straight into the scene,
   * which is not a React tree — so a controller bound to styles would only be
   * ceremony around the one thing actually wanted: a spring whose `onChange`
   * hands over the number.
   */
  const entrance = useRef<SpringValue<number> | null>(null);
  entrance.current ??= new SpringValue(0);
  /**
   * The model's arrival — its approach and its burn-in — on a spring of its
   * own, ahead of the type's. The scene reads the value; the easing is here.
   */
  const arrival = useRef<SpringValue<number> | null>(null);
  arrival.current ??= new SpringValue(0);

  /**
   * One spring per `auto` layer, and the state each is currently asked for.
   *
   * Held here rather than in the window maths because a spring is a thing with
   * memory: the scroll only says which way it should be going.
   */
  const autoSprings = useRef(new Map<number, SpringValue<number>>());
  const autoShown = useRef(new Map<number, boolean>());

  const paintLayer = useCallback(
    (index: number, opacity: number) => {
      const layer = layersRef.current[index];
      if (!layer) return;
      layer.style.opacity = String(opacity);
      layer.style.visibility = opacity <= 0.001 ? "hidden" : "visible";
      // The same number, handed down for the copy to divide up. The layer
      // keeps its own block fade for everything that is not choreographed.
      writeReveal(index, opacity);
      // The scene paints this layer's display type itself (`data-scene-ink`),
      // so the window has to reach it too — the painted copy is not inside the
      // element being faded, and nothing else would ever take it away.
      pushInk(index, opacity);
    },
    [pushInk, writeReveal],
  );

  const fadeLayers = useCallback(
    (progress: number) => {
      layersRef.current.forEach((layer, index) => {
        if (!layer) return;
        const window = windows[index];
        if (!window) return;

        if (window.auto) {
          // A threshold, not a ramp: inside the window it plays in, outside it
          // plays out, and the spring owns everything between.
          const shown = progress >= window.in && progress < window.end;
          if (autoShown.current.get(index) === shown) return;
          autoShown.current.set(index, shown);

          let spring = autoSprings.current.get(index);
          if (!spring) {
            spring = new SpringValue(0);
            autoSprings.current.set(index, spring);
          }
          void spring.start({
            to: shown ? 1 : 0,
            config: shown
              ? sceneConfig.inkLetters.entrance
              : sceneConfig.inkLetters.exit,
            onChange: (result: AnimationResult<SpringValue<number>>) => {
              paintLayer(index, result.value);
            },
          });
          return;
        }

        const rising =
          window.hold > window.in
            ? Math.min(
                1,
                Math.max(0, (progress - window.in) / (window.hold - window.in)),
              )
            : 1;
        const falling =
          window.end > window.out
            ? Math.min(
                1,
                Math.max(
                  0,
                  (window.end - progress) / (window.end - window.out),
                ),
              )
            : 1;
        paintLayer(index, Math.min(rising, falling));
      });
    },
    [paintLayer, windows],
  );

  // Told once, as soon as the model is up — or as soon as it is known it never
  // will be. A scene that fails to build must report too, or a browser without
  // WebGL keeps the curtain for ever, waiting on a canvas that never comes.
  useEffect(() => {
    if (ready || failed) markSceneReady();
  }, [ready, failed, markSceneReady]);

  useEffect(() => {
    if (!ready || !uncovered) return;
    // A still instance has no `<ProgressTrigger>`, so nothing would ever hand it
    // a window and every painted heading would sit at zero. One call settles
    // both cases: the scrolling one is about to be driven anyway.
    fadeLayers(progressRef.current);
    const value = entrance.current;
    const arriving = arrival.current;
    if (!value || !arriving) return;
    // **The model first, and the type a beat behind it.**
    void arriving.start({
      to: 1,
      config: sceneConfig.arrival.spring,
      onChange: (result: AnimationResult<SpringValue<number>>) => {
        sceneRef.current?.setArrival(result.value);
      },
    });
    void value.start({
      to: 1,
      delay: sceneConfig.arrival.inkDelay,
      config: sceneConfig.inkLetters.entrance,
      // The handler is given the animation **result**, not the number — reading
      // it as though it were the number yields `NaN`, which clamps to nothing,
      // and the type simply never arrives.
      onChange: (result: AnimationResult<SpringValue<number>>) => {
        entranceRef.current = result.value;
        pushEntrance();
      },
    });
  }, [ready, uncovered, pushEntrance, fadeLayers]);

  const onProgress = useCallback(
    ({ progress }: { progress: number }) => {
      progressRef.current = progress;
      sceneRef.current?.setScrollProgress(progress);
      fadeLayers(progress);
    },
    [fadeLayers],
  );

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    let observer: IntersectionObserver | null = null;
    let cancelled = false;
    let inView = false;
    let instance: ModelScene | null = null;

    const sync = (): void => {
      const scene = sceneRef.current;
      if (!scene) return;
      if (inView && !document.hidden) scene.start();
      else scene.stop();
    };

    const started = teardownRef.current.then(async () => {
      if (cancelled) return;

      // Held locally as well as in the ref: the ref is only set once `load()`
      // resolves, so a teardown during the load had nothing to dispose and the
      // half-built scene was left holding the context.
      instance = new ModelScene({
        canvas,
        container,
        overlayHost: stageRef.current ?? container,
        stageRule,
      });
      await instance.load();
      if (cancelled) return;

      sceneRef.current = instance;
      instance.attachListeners();
      // Catch up with wherever the page is already scrolled to.
      instance.setScrollProgress(progressRef.current);
      setReady(true);

      observer = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          sync();
        },
        { rootMargin: sceneConfig.inViewRootMargin },
      );
      observer.observe(container);
      document.addEventListener("visibilitychange", sync);
    });

    started.catch(() => {
      if (!cancelled) setFailed(true);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      // Whatever happens, the canvas is only released after the in-flight load
      // has settled — and the next mount waits on exactly this promise.
      teardownRef.current = started
        .catch(() => undefined)
        .then(() => {
          instance?.dispose();
          instance = null;
          sceneRef.current = null;
        });
    };
    // **Nothing in here may change after mount.** The effect used to depend on
    // the curtain's `released`, and the hero's scene was torn down and rebuilt
    // the moment the curtain left — the rebuild's prewarm walking every scroll
    // stop on a canvas the reader could now see. ADR-0122.
  }, [stageRule]);

  if (failed) {
    return (
      <div className="relative h-lvh w-full overflow-hidden">
        <ModelPoster src={posterSrc} />
      </div>
    );
  }

  const stage = (
    <>
      <div ref={stageRef} className="sticky top-0 h-lvh w-full overflow-hidden">
        <div
          data-scene-layer={0}
          ref={(element) => {
            layersRef.current[0] = element;
          }}
          className="absolute inset-0"
        >
          {behind}
        </div>
        {/* **Gated on `ready` alone, not on the curtain.** The canvas fades up
            the moment the scene is warm — which is *behind* the curtain, where
            nobody can see it happen — so the model is already there when the
            curtain lifts rather than arriving after it. Only the painted type's
            entrance waits for `released`: that one is a performance, and a
            performance behind a curtain is wasted. */}
        <Spring
          ref={containerRef}
          tag="div"
          mode="once"
          enabled={ready}
          from={{ opacity: 0 }}
          to={{ opacity: 1 }}
          className="absolute inset-0"
        >
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="block h-full w-full"
          />
        </Spring>
        {/* Its reveal starts at nothing: the copy is choreographed in by the
            entrance, and until that has been written the property's fallback
            of 1 would show every block, finished, under the curtain. */}
        <div
          data-scene-layer={1}
          ref={(element) => {
            layersRef.current[1] = element;
          }}
          className="pointer-events-none absolute inset-0"
          style={{ "--stage-reveal": 0 } as CSSProperties}
        >
          {front}
        </div>
        {/* The second and third screens ride the runway only on the full
            path; the lite path has them as sections of their own below. */}
        {!lite && (
          <>
            <div
              data-scene-layer={2}
              ref={(element) => {
                layersRef.current[2] = element;
              }}
              className="pointer-events-none absolute inset-0"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              {immersed}
            </div>
            <div
              data-scene-layer={3}
              ref={(element) => {
                layersRef.current[3] = element;
              }}
              className="pointer-events-none absolute inset-0"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              {delivery}
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* `div` is deliberate on both wrappers — the runway and the stage carry
          no meaning of their own, and the section's heading already names the
          content. */}
      <ProgressTrigger
        tag="div"
        start="top top"
        end="bottom bottom"
        onChange={onProgress}
        className="relative w-full"
        style={{ height: lite ? liteRunwayHeight : runwayHeight }}
      >
        <div className="sticky top-0 h-lvh w-full overflow-hidden">{stage}</div>
      </ProgressTrigger>
      {lite && stills && (
        <>
          <StillStage image={stills.immersed.image}>
            {stills.immersed.children}
          </StillStage>
          <StillStage image={stills.delivery.image}>
            {stills.delivery.children}
          </StillStage>
        </>
      )}
    </>
  );
};
