import { create } from "zustand";

/**
 * Gates the hero's entrance animations behind the preloader. Everything stays in
 * its hidden `from` state until the preloader finishes and calls `reveal()`,
 * at which point all reveals (Spring + TextEngine) play together.
 */
interface PreloaderState {
  isRevealed: boolean;
  reveal: () => void;
}

export const usePreloader = create<PreloaderState>((set) => ({
  isRevealed: false,
  reveal: () => set({ isRevealed: true }),
}));
