"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { SCROLL_PRIORITY, subscribeToTicker } from "@/lib/animation/ticker";
import { useScroll } from "@/hooks/smooth-scroll/use-scroll";
import { scrollTo } from "@/utils/scroll-to";
import { useShallow } from "zustand/react/shallow";

export const scrollSpeed = { current: 1 };

export function ScrollLayout({ children }: { children: React.ReactNode }) {
  // Server-safe rendering
  return (
    <div className="scroll-layout">
      {/* Static content that can be rendered on server */}
      <div className="scroll-layout-content">{children}</div>

      {/* Client-only functionality */}
      <ScrollController />
    </div>
  );
}

function ScrollController() {
  const isEnableScroll = useScroll((state) => state.isEnableScroll);
  const [hash, setHash] = useState<string>("");
  const [lenis, setLenis] = useScroll(
    useShallow((state) => [state.lenis, state.setLenis]),
  );
  const pathname = usePathname();
  const savedPathname = useRef("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
    const lenis = new Lenis({
      smoothWheel: true,
      // **Touch is smoothed too, and on this site it has to be.** The OS owns
      // momentum scrolling, so `scrollY` arrives in discrete steps — fine for a
      // page of text, visible stepping for a scene whose every value is derived
      // from that number, and compounded by the tier's 30fps budget. `syncTouch`
      // puts the finger on the same low-passed position the wheel already used.
      syncTouch: true,
    });
    (window as typeof window & { lenis: Lenis }).lenis = lenis;
    setLenis(lenis);

    // **The app's one rAF, not a second one of our own.**
    //
    // Lenis writes `window.scrollY`; every scroll-driven thing on the page
    // reads it back through `getBoundingClientRect`. Two independent loops
    // leave that order to whichever registered first — and it registered
    // wrong: measured, a frame where the page had moved 64px still drew the
    // gallery at the previous frame's position, so the strip trailed the scroll
    // by a frame the whole way down. On one loop with `SCROLL_PRIORITY`, every
    // frame is scroll-then-readers, by construction.
    const unsubscribe = subscribeToTicker(
      (time) => lenis.raf(time),
      // Never throttled: this is the clock the rest of the page is read
      // against, and a skipped tick here is a skipped tick for all of them.
      () => 0,
      SCROLL_PRIORITY,
    );

    return () => {
      // Leave the loop before destroying Lenis — otherwise it keeps calling
      // `raf` on a destroyed instance after unmount/HMR.
      unsubscribe();
      lenis.destroy();
      setLenis(null);
    };
  }, [setLenis]);

  useEffect(() => {
    if (isEnableScroll) {
      lenis?.start();
      enableNativeScroll(true);
    } else {
      lenis?.stop();
      enableNativeScroll(false);
    }
  }, [isEnableScroll, lenis]);

  useEffect(() => {
    if (lenis && hash) {
      setTimeout(() => {
        scrollTo(hash, true);
      }, 300);
    }
  }, [lenis, hash]);

  useEffect(() => {
    if (savedPathname.current !== pathname) {
      savedPathname.current = pathname;
      if (pathname.includes("#")) {
        const hash = pathname.split("#").pop();
        if (hash) {
          setHash(hash);
        }
      }
    }
  }, [pathname, setHash]);

  return null; // This component doesn't render anything visible
}

const enableNativeScroll = (value: boolean) => {
  if (typeof document === "undefined") return;
  if (!document) return;
  const html = document.querySelector("html");
  if (!html) return;
  if (!value) {
    html.style.position = "relative";
    html.style.overflow = "hidden";
    html.style.height = "100%";
  } else {
    html.style.removeProperty("position");
    html.style.removeProperty("overflow");
    html.style.removeProperty("height");
  }
};
