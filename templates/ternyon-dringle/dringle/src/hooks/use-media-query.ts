/**
 * @fileoverview `useMediaQuery` — subscribe to a CSS media query from React.
 *
 * Event-driven (via `MediaQueryList`'s `change` event), so it flips the instant
 * the query crosses its breakpoint — no polling, no debounce lag. Delivered
 * through `useSyncExternalStore`, so it is SSR-safe and tear-free.
 *
 * Use this for **layout-switching breakpoints** (which must react immediately and
 * stay in lockstep with the CSS `@media` rules). For a continuous pixel width,
 * use the debounced `useWindowWidth` instead.
 */

"use client";

import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  // The server (and the hydration render) can't measure the viewport; report
  // `false` so SSR + first client render agree, then the real value settles in.
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
