"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Replays its children's arrival once the loading screen opens.
 *
 * The first screen sits under the veil while the page loads, so on its own its
 * entrance is spent behind the veil and is over before the shutter lets anyone
 * see it. The children stay in the document the whole time — the headline has
 * to be in the served HTML — and are simply remounted the moment the frame
 * starts opening, which sends every spring back to its start so the screen
 * arrives in front of the visitor instead of behind them.
 *
 * `halden:opening` is the shutter starting to lift; `halden:ready` is the same
 * moment for a visitor who asked for less motion, where there is no shutter at
 * all. Either one is enough.
 */
export const PreloadReveal = ({ children }: { children: ReactNode }) => {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (window.__haldenOpening || window.__haldenReady) {
      setOpened(true);
      return;
    }
    const open = () => setOpened(true);
    window.addEventListener("halden:opening", open, { once: true });
    window.addEventListener("halden:ready", open, { once: true });
    return () => {
      window.removeEventListener("halden:opening", open);
      window.removeEventListener("halden:ready", open);
    };
  }, []);

  // Held out of sight until then, or the springs would run once behind the
  // veil and again in front of it, and the second run would read as a flash.
  return (
    <div
      key={opened ? "open" : "veiled"}
      className={`contents ${opened ? "" : "invisible"}`}
    >
      {children}
    </div>
  );
};
