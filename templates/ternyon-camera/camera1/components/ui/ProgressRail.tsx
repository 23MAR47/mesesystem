"use client";

import { useEffect, useState } from "react";

import { SECTIONS } from "@/lib/content";

/** Fixed right-hand rail: fill tracks scroll, label names the section. */
export default function ProgressRail() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onSection = (e: Event) => setActive((e as CustomEvent<number>).detail);
    document.addEventListener("aperture:section", onSection);
    return () => document.removeEventListener("aperture:section", onSection);
  }, []);

  return (
    <div
      data-rail
      className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-4 xl:flex"
    >
      <span className="mono-label tabular-nums text-white/70">
        {SECTIONS[active]?.index ?? "01"}
      </span>

      <div className="rail-track">
        <div data-rail-fill className="rail-fill" />
      </div>

      <span className="mono-label max-w-[9rem] text-right leading-[1.5] text-white/40">
        {SECTIONS[active]?.eyebrow ?? ""}
      </span>
    </div>
  );
}
