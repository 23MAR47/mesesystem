"use client";

import TextEngine from "spring-text-engine";

import { springWeight } from "@/lib/springs/config";
import type { Tags } from "@/types/springs";

export interface LetterRevealProps {
  children: React.ReactNode;
  tag?: Tags;
  className?: string;
  stagger?: number;
  delay?: number;
  columnGap?: number;
}

/**
 * Letters rise from behind a clip, one after the next — variant W2.
 *
 * Reserved for the footer wordmark, where the letters are already held apart by
 * 0.85em of tracking: they read as six separate marks, so lifting them in turn
 * is the natural gesture. Placement belongs on a wrapper — `TextEngine` writes
 * its own inline `position`.
 */
export const LetterReveal = ({
  children,
  tag = "p",
  className = "",
  stagger = 90,
  delay = 0,
  columnGap = 0.17,
}: LetterRevealProps) => (
  <TextEngine
    tag={tag}
    mode="once"
    className={className}
    letterIn={{ y: "0%", opacity: 1 }}
    letterOut={{ y: "110%", opacity: 1 }}
    letterStagger={stagger}
    letterConfig={springWeight}
    delayIn={delay}
    columnGap={columnGap}
    overflow
  >
    {children}
  </TextEngine>
);
