"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Holds its children back until the preloader has finished.
 *
 * The cookie banner otherwise animates in over the loading screen and competes
 * with it for the visitor's first look. Anything mounted through here waits for
 * `halden:ready`, and renders immediately if the preloader already finished
 * (reduced motion, or a client that mounts late).
 */
export const AfterPreload = ({ children }: { children: ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.__haldenReady) {
      setReady(true);
      return;
    }
    const onReady = () => setReady(true);
    window.addEventListener("halden:ready", onReady, { once: true });
    return () => window.removeEventListener("halden:ready", onReady);
  }, []);

  if (!ready) return null;
  return <>{children}</>;
};
