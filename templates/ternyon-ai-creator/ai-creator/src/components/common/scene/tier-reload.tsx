// 📖 Docs: obsidian/frontend/components/common.md
"use client";

/**
 * Reloads the page when a resize moves the device across a tier boundary.
 *
 * The tier is read **once**, at mount, and everything the scene is built from
 * follows it: which model is decoded, the runway's length and which screens
 * ride it, the pixel ratio, the frame budget, whether the net and the word
 * exist at all (`wantsLiteScene`, ADR-0126). Rebuilding all of that live on
 * resize would mean tearing the scene down under the reader and running the
 * curtain's whole load again in the open — for a case that is, in practice,
 * a desktop window being dragged across 768px or DevTools toggling a device.
 * A reload does the same work honestly, behind the curtain. ADR-0127.
 *
 * Only a **tier** change reloads. A phone's URL bar collapsing, a rotation
 * within the mobile tier, a desktop window resized within its own range — all
 * fire `resize`, none change the tier, none reload. The check is debounced so
 * a drag settles before it is read.
 */

import { useEffect } from "react";

import { deviceTier } from "@/lib/scene/device";
import { sceneConfig } from "@/lib/scene/scene.config";

export const TierReload = (): null => {
  useEffect(() => {
    const mounted = deviceTier();
    let timer: number | null = null;

    const check = (): void => {
      timer = null;
      if (deviceTier() !== mounted) window.location.reload();
    };
    const onResize = (): void => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(check, sceneConfig.tierReloadSettleMs);
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, []);

  return null;
};
