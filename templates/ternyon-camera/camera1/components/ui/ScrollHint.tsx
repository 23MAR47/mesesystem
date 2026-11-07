"use client";

import { useEffect, useState } from "react";

/** Bottom-left cue on the hero; retires once the user starts scrolling. */
export default function ScrollHint() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const onSection = (e: Event) => {
      if ((e as CustomEvent<number>).detail > 0) setGone(true);
    };
    const onScroll = () => {
      if (window.scrollY > 80) setGone(true);
    };
    document.addEventListener("aperture:section", onSection);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("aperture:section", onSection);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-7 left-7 z-40 hidden items-center gap-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:flex"
      style={{
        opacity: gone ? 0 : 1,
        transform: gone ? "translateY(10px)" : "none",
      }}
    >
      <span className="relative block h-9 w-px overflow-hidden bg-white/15">
        <span className="absolute inset-x-0 top-0 h-3 animate-[railDrop_2.2s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-[#7fd4ff]" />
      </span>
      <span className="mono-label">Scroll to disassemble</span>
    </div>
  );
}
