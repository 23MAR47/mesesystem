"use client";

import type { ComponentProps } from "react";

import { Spring } from "@/components/animation/springs/spring";

import { usePreloader } from "./preloader-store";

/**
 * A `<Spring>` whose entrance is gated by the preloader: it holds its `from`
 * state until `isRevealed` flips true, then plays (respecting its `delayIn`).
 * Drop-in replacement for `<Spring>` on the hero's reveals.
 */
export const Reveal = (props: ComponentProps<typeof Spring>) => {
  const isRevealed = usePreloader((state) => state.isRevealed);
  return <Spring {...props} enabled={isRevealed} />;
};
