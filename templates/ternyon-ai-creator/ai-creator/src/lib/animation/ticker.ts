/**
 * Shared animation ticker.
 *
 * A single, app-wide `requestAnimationFrame` loop. Every animation hook that
 * needs per-frame work subscribes here instead of starting its own rAF — so a
 * page with N scroll-driven components runs **one** loop, not N.
 *
 * The loop is reference-counted: it starts on the first subscriber and stops
 * (`cancelAnimationFrame`) when the last one leaves, so an idle page costs
 * nothing. Each subscriber is throttled independently by its own framerate.
 *
 * 📖 Docs: obsidian/frontend/animation-system.md
 */

export type TickerCallback = (time: number) => void;

/**
 * The smooth-scroll driver's slot: before every reader, every frame.
 *
 * Not a magic number at the call site — the whole reason the ordering exists is
 * that one subscriber writes what the rest read, and that fact belongs next to
 * the mechanism enforcing it.
 */
export const SCROLL_PRIORITY = -100;

interface Subscriber {
  callback: TickerCallback;
  /** Read live each frame so framerate prop changes take effect. */
  getFramerate: () => number;
  /** Timestamp of this subscriber's last invocation. */
  last: number;
  /** Lower runs earlier in the frame. See `subscribeToTicker`. */
  priority: number;
}

/**
 * Ordered by priority, because **within one frame the order is the point**.
 *
 * Smooth scrolling writes the scroll position; everything scroll-driven reads
 * it back with `getBoundingClientRect`. If a reader runs before the writer it
 * sees the *previous* frame's position, so the page scrolls and the scene
 * follows one frame behind — measured, and it reads as the canvas swimming
 * against the content rather than as lag.
 *
 * A `Set` gave insertion order, which is mount order, which is nobody's
 * decision. This is.
 */
const subscribers: Subscriber[] = [];
let rafId: number | null = null;

const frame = (time: number): void => {
  // Snapshot first: a callback may subscribe/unsubscribe during iteration.
  for (const sub of [...subscribers]) {
    if (!subscribers.includes(sub)) continue;
    if (time - sub.last <= sub.getFramerate()) continue;
    sub.last = time;
    try {
      sub.callback(time);
    } catch (error) {
      // Isolate failures — one bad subscriber must not kill the shared loop.
      console.error("[ticker] subscriber threw:", error);
    }
  }
  rafId = requestAnimationFrame(frame);
};

const start = (): void => {
  if (rafId === null) rafId = requestAnimationFrame(frame);
};

const stop = (): void => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
};

/**
 * Subscribe a callback to the shared rAF loop.
 *
    * @param callback - invoked with the rAF timestamp, no more often than `getFramerate()` ms apart.
 * @param getFramerate - returns the current minimum gap (ms) between invocations; read live every frame.
 * @param priority - lower runs earlier within the frame; default 0. Reserve
 *   negatives for whoever *writes* the state others read — smooth scroll is
 *   the only one today, at `SCROLL_PRIORITY`.
 * @returns an unsubscribe function.
 */
export const subscribeToTicker = (
  callback: TickerCallback,
  getFramerate: () => number,
  priority = 0,
): (() => void) => {
  const subscriber: Subscriber = {
    callback,
    getFramerate,
    last: performance.now(),
    priority,
  };
  // Insert in priority order rather than sorting every frame.
  const at = subscribers.findIndex((other) => other.priority > priority);
  subscribers.splice(at === -1 ? subscribers.length : at, 0, subscriber);
  start();

  return () => {
    const index = subscribers.indexOf(subscriber);
    if (index !== -1) subscribers.splice(index, 1);
    if (subscribers.length === 0) stop();
  };
};
