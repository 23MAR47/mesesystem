"use client";

import { useEffect } from "react";
import Lenis from "lenis";

import { STAGE_GROUND } from "@/lib/theme";
import { STAGES, StageId, clamp, damp, safe, smoothstep, view } from "@/lib/state";
import { STAR_PATH } from "./ui/Marks";

/** The same star the section draws, as a mask layer. Encoded once. */
const STAR_MASK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${STAR_PATH}" fill="#fff"/></svg>`,
  );

/** Mask properties still need the -webkit- pair to cover Safari, and the
 *  DOM typings do not carry the prefixed names. */
type MaskStyle = CSSStyleDeclaration & {
  webkitMaskImage: string;
  webkitMaskRepeat: string;
  webkitMaskPosition: string;
  webkitMaskSize: string;
  webkitMaskComposite: string;
};

/**
 * Owns scroll. Renders null.
 *
 * Everything the DOM layer animates is written from here, as inline styles,
 * once per frame — no React state is touched, so nothing re-renders while
 * the page moves. The 3D scene reads the same `view` object.
 */

interface StageBox {
  id: StageId;
  el: HTMLElement;
  top: number;
  height: number;
}

/** Matches the `perspective` on .reel-viewport — the flying card has to be
 *  projected the same way as the ring it is aiming at. */
const REEL_PERSPECTIVE = 1500;

const DARK_STAGES = new Set<StageId>(["hero", "neural", "work", "mosaic", "cta"]);

export default function ScrollEngine() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    view.reduced = reduced;

    const root = document.documentElement;
    const backdrop = document.querySelector<HTMLElement>("[data-backdrop]");
    const nav = document.querySelector<HTMLElement>("[data-nav]");

    const heroPlane = document.querySelector<HTMLElement>("[data-hero-plane]");
    const marquee = document.querySelector<HTMLElement>("[data-marquee]");
    const reelRing = document.querySelector<HTMLElement>("[data-reel-ring]");
    const reelCards = Array.from(document.querySelectorAll<HTMLElement>("[data-reel-card]"));
    const mergeSlot = document.querySelector<HTMLElement>("[data-merge-slot]");
    const neuralTop = document.querySelector<HTMLElement>('[data-neural-word="top"]');
    const neuralBottom = document.querySelector<HTMLElement>('[data-neural-word="bottom"]');
    const heroSlot = document.querySelector<HTMLElement>("[data-hero-slot]");
    const heroPanel = document.querySelector<HTMLElement>(".hero-panel");
    const flyCard = document.querySelector<HTMLElement>("[data-fly-card]");
    const neuralPanel = document.querySelector<HTMLElement>("[data-neural-panel]");
    const neuralStar = document.querySelector<HTMLElement>("[data-neural-star]");
    const starGlow = document.querySelector<HTMLElement>("[data-star-glow]");
    const neuralCopy = document.querySelector<HTMLElement>("[data-neural-copy]");
    const neuralStats = document.querySelector<HTMLElement>("[data-neural-stats]");
    const workRail = document.querySelector<HTMLElement>("[data-work-rail]");
    const mosaicTiles = Array.from(document.querySelectorAll<HTMLElement>("[data-mosaic-tile]"));
    const mosaicCopy = document.querySelector<HTMLElement>("[data-mosaic-copy]");
    const ctaCopy = document.querySelector<HTMLElement>("[data-cta-copy]");

    let boxes: StageBox[] = [];
    const boxById = new Map<StageId, StageBox>();
    let vh = window.innerHeight;
    let vw = window.innerWidth;
    let docHeight = 1;
    let marqueeLoop = 0;
    let railOverflow = 0;
    let reelRadius = 0;
    let activeStage = -1;
    let maskWired = false;
    /* the card's start box, held as an offset INSIDE the hero panel: the
       panel's own viewport box is known whenever it is pinned, so the flight
       still starts in the right place on a page loaded mid-scroll */
    let slot = { dx: 0, dy: 0, w: 0, h: 0 };
    let target = { x: 0, y: 0, w: 0, h: 0 };
    let flightStart = 0;
    let flightEnd = 1;
    let ringSpin = 0;
    let seated = false;

    function measure() {
      vh = window.innerHeight;
      vw = window.innerWidth;
      docHeight = Math.max(1, document.documentElement.scrollHeight - vh);

      boxes = STAGES.map((id) => {
        /* `section[...]`, not `[...]`: the root element carries the active
           stage marker too, and it comes first in document order — an
           unscoped query returned <html> for whichever stage was active,
           and that stage was then measured as the whole document. */
        const el = document.querySelector<HTMLElement>(`section[data-stage="${id}"]`);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          id,
          el,
          top: rect.top + window.scrollY,
          height: el.offsetHeight,
        };
      }).filter(Boolean) as StageBox[];

      boxById.clear();
      for (const box of boxes) boxById.set(box.id, box);

      if (marquee) {
        // three copies of the phrase list are rendered; one loop is a third
        marqueeLoop = marquee.scrollWidth / 3;
      }
      if (workRail) {
        railOverflow = Math.max(0, workRail.scrollWidth - vw);
      }
      if (reelRing) {
        // radius from the card's own width, so the ring opens up on wide
        // screens instead of the cards intersecting each other
        reelRadius = reelRing.offsetWidth * (vw < 820 ? 1.18 : 1.42);
        // the ring is centred in its panel, so the card's landing box is
        // known without the reel ever having been on screen
        // the ring's raw box. The perspective enlargement of whichever slot
        // the card is aiming at is applied per frame, since the slot moves.
        target = {
          w: reelRing.offsetWidth,
          h: reelRing.offsetHeight,
          x: vw / 2 - reelRing.offsetWidth / 2,
          y: vh / 2 - reelRing.offsetHeight / 2,
        };
      }

      if (heroSlot && heroPanel && flyCard) {
        const slotRect = heroSlot.getBoundingClientRect();
        const panelRect = heroPanel.getBoundingClientRect();
        slot = {
          dx: slotRect.left - panelRect.left,
          dy: slotRect.top - panelRect.top,
          w: slotRect.width,
          h: slotRect.height,
        };
        flyCard.style.width = `${slot.w}px`;
        flyCard.style.height = `${slot.h}px`;
      }

    }

    /* Derived per frame rather than cached at measure time. A cached window
       survives a measurement taken mid-layout, and a start that lands past
       its own end silently pins the flight at zero — which reads as the
       card refusing to leave the hero. */
    function flightProgress() {
      const heroBox = boxById.get("hero");
      const reelBox = boxById.get("reel");
      if (!heroBox || !reelBox) return 0;
      // starts once the hero has begun tipping away, and lands exactly as
      // the reel locks: at that instant the ring's spin is still zero, so
      // slot zero is square to the viewer and dead centre
      const start = heroBox.top + Math.max(1, heroBox.height - vh) * 0.34;
      const end = Math.max(start + 1, reelBox.top);
      flightStart = start;
      flightEnd = end;
      return clamp((view.scroll - start) / (end - start), 0, 1);
    }

    // ------------------------------------------------------------ per frame

    function applyStages(scroll: number) {
      view.scroll = scroll;
      view.progress = clamp(scroll / docHeight, 0, 1);

      let active = 0;
      const probe = scroll + vh * 0.5;

      for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i];
        const stage = view.s[box.id];
        const pinRange = Math.max(1, box.height - vh);
        stage.pin = clamp((scroll - box.top) / pinRange, 0, 1);
        stage.travel = clamp((scroll + vh - box.top) / (box.height + vh), 0, 1);
        // where the sticky panel actually is: rising, pinned, or leaving
        const rising = box.top - scroll;
        stage.shift = rising > 0 ? rising : Math.min(0, box.top + pinRange - scroll);
        stage.active = probe >= box.top && probe < box.top + box.height;
        if (stage.active) active = i;
      }
      view.stage = active;

      if (active !== activeStage) {
        activeStage = active;
        const id = STAGES[active];
        if (backdrop) backdrop.style.background = STAGE_GROUND[id];
        if (nav) nav.dataset.tone = DARK_STAGES.has(id) ? "dark" : "light";
        root.dataset.activeStage = id;
        // copy reveals are triggered by this event rather than by React
        // state, so a stage change re-renders nothing
        document.dispatchEvent(new CustomEvent("synapse:stage", { detail: id }));
      }
    }

    function writeHero(t: number, flight: number) {
      const s = view.s.hero;
      if (heroPlane) {
        // tips away from the viewer and recedes — the whole hero is one plane
        const tilt = s.pin * 26;
        const push = s.pin * 620;
        const drop = s.pin * -60;
        const scale = 1 - s.pin * 0.08;
        const sway = view.smoothX * (1 - s.pin) * 4;
        heroPlane.style.transform = `translate3d(0, ${safe(drop).toFixed(2)}px, ${safe(
          -push,
        ).toFixed(2)}px) rotateX(${safe(tilt).toFixed(2)}deg) rotateY(${safe(sway).toFixed(
          2,
        )}deg) scale(${safe(scale, 1).toFixed(4)})`;
        heroPlane.style.opacity = (1 - smoothstep(0.62, 0.98, s.pin)).toFixed(3);
      }

      writeFlyCard(t, flight);
    }

    /* The hero card's journey into the ring.
       There is only ever one card. It is flown in viewport space toward the
       ring's empty seat — whose live box is read from the DOM each frame, so
       every transform the 3D ring applies is accounted for exactly — and at
       the end of the flight the node is moved INTO that seat. Nothing is
       faded out and replaced by a copy; the element that started in the hero
       is the element that ends up rotating with the reel. */
    function writeFlyCard(t: number, flight: number) {
      if (!flyCard || !mergeSlot || slot.w === 0) return;

      const shouldSeat = flight >= 1;
      if (shouldSeat !== seated) {
        seated = shouldSeat;
        if (seated) {
          mergeSlot.appendChild(flyCard);
          flyCard.classList.add("is-seated");
        } else {
          document.body.appendChild(flyCard);
          flyCard.classList.remove("is-seated");
        }
      }
      // seated, the card is laid out by the ring; there is nothing to write
      if (seated) return;

      const e = smoothstep(0, 1, flight);

      // the hero panel's own box while pinned: inset by --gap on every side
      const gap = (vw - (heroPanel?.clientWidth ?? vw)) / 2 || 14;
      const startX = gap + slot.dx;
      const startY = gap + slot.dy;

      // the seat as it actually renders this frame, ring rotation included
      const seat = mergeSlot.getBoundingClientRect();
      const seatW = seat.width || slot.w;

      const float = view.reduced ? 0 : Math.sin(t * 0.7) * 7 * (1 - e);
      const x = startX + (seat.left - startX) * e + view.smoothX * -12 * (1 - e);
      const y = startY + (seat.top - startY) * e + float;
      const scale = 1 + (seatW / slot.w - 1) * e;
      // ends on the seat's own facing, so sitting down has no snap
      const turn = (1 - e) * (view.smoothX * 8 + 7) + e * ringSpin;
      const lift = (1 - e) * -view.smoothY * 6;

      flyCard.style.transform = `translate3d(${safe(x).toFixed(1)}px, ${safe(y).toFixed(
        1,
      )}px, 0) perspective(${REEL_PERSPECTIVE}px) scale(${safe(scale, 1).toFixed(
        4,
      )}) rotateY(${safe(turn).toFixed(2)}deg) rotateX(${safe(lift).toFixed(2)}deg)`;
    }

    function writeReel(t: number, flight: number) {
      const s = view.s.reel;
      if (marquee && marqueeLoop > 0) {
        const drift = view.reduced ? 0 : t * 26;
        const x = -((view.scroll * 0.28 + drift) % marqueeLoop);
        marquee.style.transform = `translate3d(${safe(x).toFixed(1)}px, 0, 0)`;
      }

      if (!reelRing || reelCards.length === 0) return;

      const step = 360 / reelCards.length;
      // one full turn across the pin, less one slot, so the ring ends on a
      // different card than it started
      const spin = (-s.pin * 360 * (reelCards.length - 1)) / reelCards.length;
      const sway = view.smoothX * 5 * (1 - s.pin * 0.4);
      // shared with the flying card, which has to aim at a moving slot
      ringSpin = spin + sway;
      reelRing.style.transform = `rotateY(${safe(spin + sway).toFixed(2)}deg) rotateX(${safe(
        -view.smoothY * 4 + 2,
      ).toFixed(2)}deg)`;

      for (let i = 0; i < reelCards.length; i++) {
        const card = reelCards[i];
        const angle = i * step;
        card.style.transform = `rotateY(${angle}deg) translateZ(${reelRadius.toFixed(1)}px)`;
        // facing: 1 when square to the viewer, 0 when edge-on
        const facing = Math.cos(((angle + spin + sway) * Math.PI) / 180);
        const front = clamp(facing, 0, 1);
        // the seat is invisible until the card is actually sitting in it
        const filled = card === mergeSlot && !seated ? 0 : 1;
        card.style.opacity = ((0.18 + front * 0.82) * filled).toFixed(3);
        card.style.filter = `brightness(${(0.55 + front * 0.45).toFixed(3)})`;
      }
    }

    function writeNeural(t: number) {
      const s = view.s.neural;
      const p = s.pin;

      // ---- the star, and the hole it cuts in the panel --------------------
      // The star grows the whole way down and then opens past the corners of
      // the screen. OPEN must line up with the window where the work section
      // is already pinned underneath (the neural stage's negative bottom
      // margin puts it there), or the hole opens onto nothing.
      const open = smoothstep(0.72, 0.99, p);
      if (neuralStar) {
        const base = Math.min(168, Math.max(96, vw * 0.1));
        // a star's waist is ~0.45 of its bounding radius, so the box has to
        // be roughly 2.3x the screen diagonal before the corners are covered
        const reach = Math.hypot(vw, vh) * 2.45;
        const grown = base * (1 + smoothstep(0, 0.72, p) * 0.85);
        const breath = view.reduced || open > 0 ? 0 : Math.sin(t * 1.15) * 0.035;
        const size = (grown + (reach - grown) * Math.pow(open, 2.1)) * (1 + breath);

        neuralStar.style.width = `${size.toFixed(1)}px`;
        neuralStar.style.height = `${size.toFixed(1)}px`;
        neuralStar.style.opacity = (smoothstep(0.015, 0.1, p) * (1 - smoothstep(0.97, 1, p))).toFixed(
          3,
        );
        neuralStar.style.filter = open > 0.25 ? "none" : "";
        if (starGlow) starGlow.style.opacity = (1 - smoothstep(0.1, 0.45, open)).toFixed(3);

        if (neuralPanel) {
          if (open > 0.0005) {
            if (!maskWired) {
              // full-panel layer minus a star-shaped layer: `exclude` is what
              // turns the star into a hole instead of a window
              const star = `url("${STAR_MASK}")`;
              const style = neuralPanel.style as MaskStyle;
              style.maskImage = `linear-gradient(#000, #000), ${star}`;
              style.webkitMaskImage = `linear-gradient(#000, #000), ${star}`;
              style.maskRepeat = "no-repeat, no-repeat";
              style.webkitMaskRepeat = "no-repeat, no-repeat";
              style.maskPosition = "center, center";
              style.webkitMaskPosition = "center, center";
              style.maskComposite = "exclude";
              style.webkitMaskComposite = "xor";
              maskWired = true;
            }
            const boxes2 = `100% 100%, ${size.toFixed(1)}px ${size.toFixed(1)}px`;
            const style = neuralPanel.style as MaskStyle;
            style.maskSize = boxes2;
            style.webkitMaskSize = boxes2;
          } else if (maskWired) {
            const style = neuralPanel.style as MaskStyle;
            style.maskImage = "";
            style.webkitMaskImage = "";
            style.maskComposite = "";
            style.webkitMaskComposite = "";
            maskWired = false;
          }
        }
      }

      // parallax is deliberately short: the panel clips, and a long throw
      // pushes these words half off their own corner before they fade
      if (neuralTop) {
        neuralTop.style.transform = `translate3d(${safe(-p * 64).toFixed(1)}px, ${safe(
          -p * 46,
        ).toFixed(1)}px, 0)`;
        neuralTop.style.opacity = (1 - smoothstep(0.5, 0.78, p)).toFixed(3);
      }
      if (neuralBottom) {
        neuralBottom.style.transform = `translate3d(${safe(p * 58).toFixed(1)}px, ${safe(
          p * 44,
        ).toFixed(1)}px, 0)`;
        neuralBottom.style.opacity = (1 - smoothstep(0.54, 0.8, p)).toFixed(3);
      }
      if (neuralCopy) {
        const enter = smoothstep(0.04, 0.22, p);
        const leave = 1 - smoothstep(0.52, 0.78, p);
        neuralCopy.style.opacity = (enter * leave).toFixed(3);
        neuralCopy.style.transform = `translate3d(0, ${safe((1 - enter) * 26 - p * 40).toFixed(
          1,
        )}px, 0)`;
      }
      if (neuralStats) {
        const enter = smoothstep(0.42, 0.62, p);
        const leave = 1 - smoothstep(0.8, 0.94, p);
        neuralStats.style.opacity = (enter * leave).toFixed(3);
        // the -50% centring is the element's own CSS `translate`; repeating
        // it here is what was throwing these blocks half their size off axis
        neuralStats.style.transform = `translate3d(${safe((1 - enter) * 30).toFixed(1)}px, 0, 0)`;
      }
    }

    function writeWork() {
      const s = view.s.work;
      if (workRail) {
        // this stage is pinned early — it sits underneath the neural panel
        // while the portal opens — so the rail only starts once the reveal
        // has finished, or the cards slide past behind the hole
        const railT = smoothstep(0.3, 1, s.pin);
        workRail.style.transform = `translate3d(${safe(-railT * railOverflow).toFixed(1)}px, 0, 0)`;
      }
    }

    function writeMosaic(t: number) {
      const s = view.s.mosaic;
      for (let i = 0; i < mosaicTiles.length; i++) {
        const tile = mosaicTiles[i];
        const depth = Number(tile.dataset.depth ?? 0.5);
        // near tiles (low depth) travel further and stay sharp; far tiles
        // drift slowly, sit smaller and lose a little focus
        const speed = 260 + (1 - depth) * 620;
        const y = (0.5 - s.travel) * speed;
        const bob = view.reduced ? 0 : Math.sin(t * 0.5 + i) * (2 + depth * 4);
        const scale = 0.86 + (1 - depth) * 0.3;
        tile.style.transform = `translate3d(0, ${safe(y + bob).toFixed(1)}px, 0) scale(${scale.toFixed(
          3,
        )})`;
        // capped below 1: the light-toned art would otherwise sit at full
        // brightness right under the headline
        tile.style.filter = `brightness(${(0.5 + (1 - depth) * 0.4).toFixed(2)}) blur(${(
          depth * 1.4
        ).toFixed(2)}px)`;
        tile.style.opacity = (0.5 + (1 - depth) * 0.5).toFixed(2);
      }
      if (mosaicCopy) {
        const p = s.pin;
        const on = smoothstep(0.18, 0.4, p) * (1 - smoothstep(0.62, 0.86, p));
        mosaicCopy.style.opacity = on.toFixed(3);
        // centring stays in CSS `translate`; this only carries the drift
        mosaicCopy.style.transform = `translate3d(0, ${safe((1 - on) * 24).toFixed(1)}px, 0)`;
      }
    }

    function writeCta() {
      const s = view.s.cta;
      if (!ctaCopy) return;
      const enter = smoothstep(0.02, 0.34, s.travel);
      ctaCopy.style.opacity = enter.toFixed(3);
      ctaCopy.style.transform = `translate3d(0, ${safe((1 - enter) * 34).toFixed(1)}px, 0)`;
    }

    // ------------------------------------------------------------- the loop

    let last = performance.now();
    let raf = 0;
    let lenis: Lenis | null = null;

    const onNativeScroll = () => applyStages(window.scrollY);

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const t = now / 1000;

      if (lenis) lenis.raf(now);
      else applyStages(window.scrollY);

      view.smoothX = damp(view.smoothX, view.pointerX, 4.5, dt);
      view.smoothY = damp(view.smoothY, view.pointerY, 4.5, dt);
      view.velocity = damp(view.velocity, 0, 2.4, dt);

      const flight = flightProgress();

      writeHero(t, flight);
      writeReel(t, flight);
      writeNeural(t);
      writeWork();
      writeMosaic(t);
      writeCta();

      raf = requestAnimationFrame(frame);
    }

    measure();

    if (!reduced) {
      lenis = new Lenis({
        duration: 1.15,
        easing: (x: number) => 1 - Math.pow(1 - x, 3.2),
        smoothWheel: true,
      });
      // Lenis' own event is the single source of scroll; listening to
      // window.scroll as well double-applies on some browsers
      lenis.on("scroll", (e: Lenis) => {
        applyStages(e.scroll);
        view.velocity = clamp(Math.abs(e.velocity) / 40, 0, 1);
      });
      applyStages(window.scrollY);
      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
      }
    } else {
      applyStages(window.scrollY);
      window.addEventListener("scroll", onNativeScroll, { passive: true });
    }

    if (process.env.NODE_ENV !== "production") {
      // dev-only handle so the page can be measured from a script
      (window as unknown as { __view?: typeof view }).__view = view;
    }

    const onPointer = (e: PointerEvent) => {
      view.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      view.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const remeasure = () => {
      measure();
      applyStages(lenis ? view.scroll : window.scrollY);
    };
    window.addEventListener("resize", remeasure);
    // late fonts change every section offset and silently desync the pins
    document.fonts?.ready.then(remeasure).catch(() => {});
    const onReady = () => remeasure();
    document.addEventListener("synapse:ready", onReady);

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("scroll", onNativeScroll);
      document.removeEventListener("synapse:ready", onReady);
      lenis?.destroy();
      if (seated && flyCard) {
        document.body.appendChild(flyCard);
        flyCard.classList.remove("is-seated");
      }
    };
  }, []);

  return null;
}
