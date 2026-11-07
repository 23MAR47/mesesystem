import { create } from "zustand";

/**
 * The handover between the preloader and the page underneath it.
 *
 * Two booleans travelling in opposite directions, and they are deliberately
 * **not** one:
 *
 * - `sceneReady` is the page telling the preloader it may finish. The scene
 *   sets it when its model has loaded and its first frame is warm.
 * - `released` is the preloader telling the page it may begin. It is set once
 *   the curtain has actually left, not when the counter reached a hundred.
 *
 * Collapsing them into one flag would start the hero's entrance behind a
 * curtain that is still on screen — the letters would resolve where nobody can
 * see them and the reader would arrive at a finished screen. The whole point of
 * a preloader is that what it was covering happens *after* it goes.
 *
 * A store rather than props because the two ends are in different subtrees: the
 * curtain is a sibling of the whole page, and the thing it waits for is a leaf
 * three levels inside it. Same reason the scroll store exists.
 *
 * **One scene reports.** The page has one WebGL scene, the hero's (ADR-0125);
 * everything it will ever compile, decode or upload is built under the
 * curtain (ADR-0123), and the closing screen is a still image with its own
 * reveal, which has nothing to wait for.
 */
export interface UsePreloader {
  /** The scene has loaded and warmed — or failed; the curtain may finish. */
  sceneReady: boolean;
  markSceneReady: () => void;
  /** The curtain has left; entrances may play. */
  released: boolean;
  release: () => void;
}

export const usePreloader = create<UsePreloader>((set) => ({
  sceneReady: false,
  markSceneReady: () => set({ sceneReady: true }),
  released: false,
  release: () => set({ released: true }),
}));
