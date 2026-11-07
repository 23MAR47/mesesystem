/**
 * Shared scroll progress `0 → 1` for the pinned scene sequence — **computed at most once per frame**,
 * no matter how many callers ask for it.
 *
 * **Why this exists.** Six independent rAF loops need the same number every frame (the four
 * `ScrollFade` overlays, `HeroLights`, and `ParticleScene`). Each used to compute it itself as
 * `window.scrollY / (documentElement.scrollHeight - innerHeight)`. `scrollHeight` (and `scrollY` when
 * style is dirty) is a **forced synchronous layout** — and those six reads were interleaved with the
 * spring style writes those same loops perform, i.e. textbook **layout thrashing**
 * (write → read → write → read …) on every frame of every scroll.
 *
 * Two things fix that:
 *  - **`scrollHeight` is measured once**, not per frame. The page's height is fixed by the sequence
 *    spacer, so it only changes on resize/reflow — a `ResizeObserver` invalidates the cache.
 *  - **The result is memoised per frame** using `document.timeline.currentTime`, which is *constant
 *    for the whole frame*. All six callers within one frame share a single `scrollY` read; the rest
 *    are a plain number return.
 *
 * Callers must still run their own rAF — this only dedupes the measurement.
 */

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Scrollable distance in px; `-1` = needs re-measuring. */
let scrollMax = -1;
let observer: ResizeObserver | null = null;

const measure = (): number => {
  scrollMax = document.documentElement.scrollHeight - window.innerHeight;
  return scrollMax;
};

/** Lazily start watching for reflows that change the page height (also covers window resizes). */
const ensureObserver = (): void => {
  if (observer || typeof ResizeObserver === "undefined") return;
  observer = new ResizeObserver(() => {
    scrollMax = -1; // invalidate; re-measured on the next read
  });
  observer.observe(document.documentElement);
};

let cachedProgress = 0;
/** The frame the cached value belongs to (`document.timeline.currentTime` is stable within a frame). */
let cachedAt: number | null = null;

/** Scroll progress `0 → 1` through the pinned sequence. Cheap to call from any number of rAF loops. */
export const getScrollProgress = (): number => {
  ensureObserver();
  const now = document.timeline.currentTime;
  const stamp = typeof now === "number" ? now : null;
  if (stamp !== null && stamp === cachedAt) return cachedProgress;
  const max = scrollMax < 0 ? measure() : scrollMax;
  cachedProgress = max > 0 ? clamp01(window.scrollY / max) : 0;
  cachedAt = stamp;
  return cachedProgress;
};
