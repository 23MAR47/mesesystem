"use client";

import { useEffect, useRef, useState } from "react";
import { animated, useSpring } from "@react-spring/web";

/**
 * Elements that opt in carry this attribute; the corners appear over them.
 * Its value picks the tone: `"light"` for anything the corners would otherwise
 * disappear into — the hero plates flood red under the very hover that shows
 * the corners, and the room photograph is a dark interior.
 */
export const FRAME_CURSOR_ATTR = "data-frame-cursor";

const CORNERS = [
  { x: -1, y: -1, edges: "border-l border-t" },
  { x: 1, y: -1, edges: "border-r border-t" },
  { x: -1, y: 1, edges: "border-l border-b" },
  { x: 1, y: 1, edges: "border-r border-b" },
] as const;

/**
 * Framing corners that follow the pointer — variant CC4.
 *
 * Over anything marked with `data-frame-cursor` (the photographic plates) four
 * corner marks gather around the cursor and spread open, like the framing
 * guides in a viewfinder. It says "look closer" without a word of copy, and it
 * only ever appears over images, so the rest of the page keeps its normal
 * pointer.
 *
 * The marks take their colour from the plate they are over: brand red on the
 * pale studio shots, milk on the hero plates — which turn red under the same
 * hover — and on the dark room photograph.
 *
 * Mounted once near the app root. Mouse only: a coarse pointer never sees it,
 * and it stays out of the way of `prefers-reduced-motion` by springing to the
 * same place with no travel.
 */
export const FrameCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [light, setLight] = useState(false);
  const over = useRef(false);
  const lightRef = useRef(false);

  const [style, api] = useSpring(() => ({
    x: 0,
    y: 0,
    spread: 0,
    config: { mass: 0.8, tension: 380, friction: 30 },
  }));

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const target = event.target as Element | null;
      const hit = target?.closest?.(`[${FRAME_CURSOR_ATTR}]`) ?? null;
      over.current = Boolean(hit);

      // Only touch state when the tone actually flips — pointermove fires far
      // too often to re-render on every frame.
      const wantsLight = hit?.getAttribute(FRAME_CURSOR_ATTR) === "light";
      if (wantsLight !== lightRef.current) {
        lightRef.current = wantsLight;
        setLight(wantsLight);
      }
      api.start({
        x: event.clientX,
        y: event.clientY,
        spread: hit ? 1 : 0,
      });
    };
    const onLeave = () => {
      over.current = false;
      api.start({ spread: 0 });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [api]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      {CORNERS.map((corner) => (
        <animated.span
          key={corner.edges}
          className={`absolute block h-[0.6875rem] w-[0.6875rem] transition-colors duration-[var(--duration-fast)] ease-entrance ${
            light ? "border-foreground-on-band" : "border-foreground-accent"
          } ${corner.edges}`}
          style={{
            borderWidth: 0,
            borderLeftWidth: corner.edges.includes("border-l") ? 1.4 : 0,
            borderRightWidth: corner.edges.includes("border-r") ? 1.4 : 0,
            borderTopWidth: corner.edges.includes("border-t") ? 1.4 : 0,
            borderBottomWidth: corner.edges.includes("border-b") ? 1.4 : 0,
            opacity: style.spread,
            transform: style.spread.to((s) => {
              const gap = 5 + s * 17;
              const dx = corner.x < 0 ? -gap : gap - 11;
              const dy = corner.y < 0 ? -gap : gap - 11;
              return `translate3d(${dx}px, ${dy}px, 0)`;
            }),
            left: style.x,
            top: style.y,
          }}
        />
      ))}
    </div>
  );
};
