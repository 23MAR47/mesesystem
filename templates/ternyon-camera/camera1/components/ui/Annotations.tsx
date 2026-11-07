"use client";

import { ANNOTATIONS } from "@/lib/content";

/**
 * The DOM half of the callout system. Every label is rendered once and
 * then never re-rendered — `AnnotationRig` inside the canvas owns their
 * transforms and opacity from the render loop, so React does not see
 * any of the sixty updates a second that put them on their parts.
 *
 * The layer sits above the canvas but below the section copy, so a
 * callout can never cover a headline.
 */
export default function Annotations() {
  return (
    <div aria-hidden className="anno-layer">
      {ANNOTATIONS.map((a) => (
        <div
          key={a.id}
          data-anno={a.id}
          className={`anno anno--${a.side}`}
          style={{ opacity: 0, visibility: "hidden" }}
        >
          <span className="anno__dot" />
          <span className="anno__leader" />
          <span className="anno__text">
            <b>{a.label}</b>
            <i>{a.value}</i>
          </span>
        </div>
      ))}
    </div>
  );
}
