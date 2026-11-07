/**
 * SectionHeading — eyebrow + line-revealed heading, shared by most sections.
 * Satoshi-uppercase display language; pass an `<Accent>` span inside `title` for
 * a Playfair italic emphasis word. `tone="dark"` for dark sections.
 * Client leaf (drives `TextEngine` + `<Inview>`).
 */
"use client";

import type { ReactNode } from "react";
import TextEngine from "spring-text-engine";
import { Inview } from "@/components/animation/springs/in-view";
import { Eyebrow } from "@/components/ui/eyebrow";
import { reveal, textLine } from "@/lib/motion";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  tag?: "h2" | "h3";
  tone?: "light" | "dark";
  className?: string;
  titleClassName?: string;
}

export const SectionHeading = ({
  eyebrow,
  title,
  tag = "h2",
  tone = "light",
  className = "",
  titleClassName = "",
}: SectionHeadingProps) => {
  const titleColor = tone === "dark" ? "text-on-dark" : "text-ink";

  return (
    <div className={className}>
      {eyebrow ? (
        <Inview
          from={reveal.fade.from}
          to={reveal.fade.to}
          config={reveal.fade.config}
          mode="once"
          className="mb-6"
        >
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        </Inview>
      ) : null}
      <TextEngine
        tag={tag}
        mode="once"
        overflow
        lineIn={textLine.lineIn}
        lineOut={textLine.lineOut}
        lineConfig={textLine.lineConfig}
        lineStagger={textLine.lineStagger}
        className={`max-w-[18ch] text-4xl sm:text-5xl lg:text-7xl ${titleColor} ${titleClassName}`}
      >
        {title}
      </TextEngine>
    </div>
  );
};
