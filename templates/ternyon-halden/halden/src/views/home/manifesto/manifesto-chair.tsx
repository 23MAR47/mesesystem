"use client";

import { useRef } from "react";
import Image from "next/image";

import { Hover } from "@/components/animation/springs/hover";
import { Inview } from "@/components/animation/springs/in-view";
import { springWeight } from "@/lib/springs/config";

export interface ManifestoChairProps {
  src: string;
  alt: string;
  /** Placement inside its line, from the comp. */
  className: string;
  /** Delay before the piece settles into the written line, in ms. */
  delay: number;
  imageClassName?: string;
}

/**
 * One cut-out chair sitting inside the statement — block 2, variant CH4.
 *
 * Pointing at a chair rocks it once and lets it settle. The spring does the
 * whole gesture on its own: a low friction against a firm tension overshoots
 * past the five-degree target and swings back, which is exactly what a chair
 * does when someone gets up from it. Nothing scales, nothing lifts — the motion
 * lives entirely in the tilt.
 *
 * It pivots at 50% 92%, down by the feet, so it rocks on its legs instead of
 * spinning about its middle.
 *
 * Each piece listens only on itself: tracking the whole block moved both chairs
 * at once, which read as the page tilting rather than as two separate objects.
 */
export const ManifestoChair = ({
  src,
  alt,
  className,
  delay,
  imageClassName = "size-full max-w-none",
}: ManifestoChairProps) => {
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <Inview
      tag="span"
      mode="once"
      delayIn={delay}
      from={{ opacity: 0, y: -18 }}
      to={{ opacity: 1, y: 0 }}
      config={springWeight}
      className={className}
    >
      <span ref={ref} className="block size-full">
        <Hover
          tag="span"
          trigger={ref}
          from={{ rotate: 0 }}
          to={{ rotate: -5 }}
          config={{ tension: 260, friction: 11 }}
          className="block size-full origin-[50%_92%]"
        >
          <Image
            src={src}
            alt={alt}
            width={130}
            height={130}
            sizes="(max-width: 548px) 13vw, 10vw"
            className={imageClassName}
          />
        </Hover>
      </span>
    </Inview>
  );
};
