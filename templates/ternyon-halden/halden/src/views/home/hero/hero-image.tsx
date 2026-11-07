"use client";

import { useRef } from "react";
import Image from "next/image";

import { Hover } from "@/components/animation/springs/hover";
import { Inview } from "@/components/animation/springs/in-view";
import { springWeight } from "@/lib/springs/config";

export interface HeroImageProps {
  src: string;
  alt: string;
  /** Intrinsic size of the exported asset. */
  width: number;
  height: number;
  sizes: string;
  /** Absolute geometry of the plate in the comp, plus any mirroring. */
  className: string;
  /** Crop applied to the image inside the plate. */
  imageClassName?: string;
  /** Delay before the plate uncovers itself, in ms. */
  revealDelay?: number;
}

/**
 * Hero image plate with the on-hover tint — Figma "Concept 9. Image 1–5. On
 * hover" (2428:636, 2446:1692, 2446:1737, 2446:1782, 2446:1827).
 *
 * Hovering the plate springs a brand-red overlay in at `mix-blend-mode:
 * color-burn`. The plate is `isolate`d so the blend resolves against the
 * photograph only and never against the cream page behind it.
 *
 * The overlay is the `<Hover>` element itself, driven from the plate via
 * `trigger`, so the whole plate is the hot zone. `<Hover>` disables itself
 * below `springsConfig.mobileWidth`, so touch devices never get a stuck tint.
 *
 * On entry the plate uncovers itself from the bottom edge upward — the same
 * masked arrival the type uses, so photographs and text share one language.
 */
export const HeroImage = ({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  imageClassName = "h-full w-full object-cover",
  revealDelay = 0,
}: HeroImageProps) => {
  const plateRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={plateRef}
      data-frame-cursor="light"
      className={`isolate cursor-none overflow-hidden ${className}`}
    >
      <Inview
        tag="span"
        mode="once"
        delayIn={revealDelay}
        from={{ clipPath: "inset(100% 0 0 0)" }}
        to={{ clipPath: "inset(0% 0 0 0)" }}
        config={springWeight}
        className="block h-full w-full"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className={imageClassName}
        />
        {/* P2 — the tint rides up from the bottom edge like a fabric swatch
            held against the piece, rather than fading in on the spot.
            It must sit inside the same wrapper as the photograph: the reveal
            span is its own stacking context, so an overlay left outside it
            would blend `color-burn` against the page instead of the image and
            flood the plate with flat red. */}
        <Hover
          tag="span"
          trigger={plateRef}
          from={{ clipPath: "inset(100% 0 0 0)" }}
          to={{ clipPath: "inset(0% 0 0 0)" }}
          config={{ tension: 240, friction: 30 }}
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-surface-accent mix-blend-color-burn"
        />
      </Inview>
    </div>
  );
};
