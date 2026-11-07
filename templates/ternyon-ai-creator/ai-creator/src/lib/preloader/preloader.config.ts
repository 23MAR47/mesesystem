/**
 * The opening curtain — a counter on the accent, and when it leaves.
 *
 * 📖 Docs: obsidian/frontend/components/common.md
 */
export const preloaderConfig = {
  /**
   * The least time the curtain stays, in ms.
   *
   * A **floor**, never a ceiling. Ending on a timer is the thing to avoid — it
   * promises something about the network that cannot be kept — but a floor is
   * the opposite problem: on a fast connection the scene reports in before the
   * square has drawn in even once, and what the reader gets is a flash of blue
   * and a shape that shrank. Long enough here for two whole breaths.
   */
  minShow: 1800,

  /**
   * How far the counter creeps before the scene has reported in, 0–1.
   *
   * Short of 1 on purpose. A preloader that reaches a hundred and then waits
   * has told the reader a lie it then has to hold; one that sits at ninety is
   * merely still working. **The number is a guess and the handover is not** —
   * what actually ends this is `sceneReady`, never a clock.
   */
  hold: 0.9,

  /**
   * Filling to `hold`. Deliberately slow, and clamped.
   *
   * Slow because it must not arrive before the thing it is waiting for;
   * clamped because a counter that overshoots reads 91 and then counts back.
   */
  fill: { tension: 26, friction: 34, clamp: true },

  /**
   * …and closing the rest once the scene is ready.
   *
   * Not fast. On a quick connection the scene reports in around a second, with
   * the fill only half way — and a counter that snaps from 50 to 100 reads as a
   * glitch rather than as an ending. This is slow enough that the last stretch
   * is still something the eye follows.
   */
  finish: { tension: 110, friction: 30, clamp: true },

  /** The curtain leaving upward. */
  exit: { tension: 140, friction: 32, clamp: true },

  /**
   * How far up its own height the curtain is when the page may begin, 0–1.
   *
   * Not 1. Released only once the curtain had fully gone, the reader watched
   * an empty screen while the arrival got under way — the first patches are
   * small, so the opening second read as a few marks floating on nothing.
   * Released at the half, the model is already burning in under the curtain's
   * trailing edge, and the screen is never empty. The curtain still finishes
   * its travel; only the signal moves. ADR-0122.
   */
  releaseAt: 0.5,
} as const;
