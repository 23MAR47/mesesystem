"use client";

import { useRef } from "react";
import Image from "next/image";
import { springWeight } from "@/lib/springs/config";
import { Inview } from "@/components/animation/springs/in-view";

import { SaveChip } from "./save-chip";

import type { ProductCardData } from "@/data/mocks/home";

export interface ProductCardProps {
  product: ProductCardData;
  /** Position in the row — drives the stagger. */
  index?: number;
}

/**
 * Product card — Figma 2431:993 and siblings (326×wrap).
 *
 * The image plate is a fixed 326×438 window; each product carries its own crop
 * from the comp, applied inline because the values are per-item data.
 */
export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const cardRef = useRef<HTMLLIElement>(null);

  return (
    <li
      ref={cardRef}
      className="group/card flex w-[20.375rem] shrink-0 flex-col gap-[1.25rem] overflow-hidden at1024:w-[13.875rem] at768:w-full at768:shrink at390:w-[22.375rem]"
    >
      <article className="contents">
        <Inview
          tag="div"
          mode="once"
          delayIn={index * 110}
          from={{ clipPath: "inset(0 0 100% 0)" }}
          to={{ clipPath: "inset(0 0 0% 0)" }}
          config={springWeight}
          data-frame-cursor
          className="relative h-[27.375rem] w-full shrink-0 cursor-none overflow-hidden rounded-image at1024:h-[18.75rem] at768:h-[29.25rem] at390:h-[23.75rem]"
        >
          <Image
            src={product.image}
            alt={product.alt}
            width={326}
            height={438}
            sizes="(max-width: 548px) 155vw, (max-width: 768px) 78vw, (max-width: 1024px) 55vw, 38vw"
            className="absolute max-w-none"
            style={{
              width: product.crop.width,
              height: product.crop.height,
              left: product.crop.left,
              top: product.crop.top,
            }}
          />
          <p className="absolute left-[1rem] top-[1rem] whitespace-nowrap font-serif text-body leading-normal tracking-[0.06em] text-foreground">
            {product.index}
          </p>
          <SaveChip trigger={cardRef} label={product.name} />
        </Inview>

        <div className="flex w-full shrink-0 flex-col gap-[0.5rem] overflow-hidden whitespace-nowrap font-serif">
          <h3 className="text-title font-normal leading-[1.1538] text-foreground at390:text-[1.375rem]">
            {product.name}
          </h3>
          <p className="text-label leading-normal text-foreground/35 [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]">
            {product.spec}
          </p>
        </div>

        <div className="flex w-full shrink-0 items-center justify-between overflow-hidden">
          <p className="shrink-0 whitespace-nowrap rounded-pill border-[0.0375rem] border-solid border-foreground px-[0.75rem] py-[0.5rem] font-serif text-caption leading-normal tracking-[0.04em] text-foreground [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]">
            {product.badge}
          </p>
          <p className="shrink-0 whitespace-nowrap font-serif text-body leading-normal tracking-[0.02em] text-foreground [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]">
            {product.price}
          </p>
        </div>
      </article>
    </li>
  );
};
