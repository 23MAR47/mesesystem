"use client";

import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";

import StarBody from "./StarBody";

/**
 * One fixed, transparent canvas for the whole page, holding the chrome
 * star in the closing panel. It gates itself on its own scroll window, so
 * it never paints over a neighbouring section.
 *
 * R3F writes position and size as inline styles on its container div, so
 * the layout has to be set through the `style` prop — a class loses to it,
 * the container lands in normal flow, and the page gets pushed down a
 * whole viewport.
 */
export default function Scene() {
  const dpr = useMemo<[number, number]>(() => {
    if (typeof window === "undefined") return [1, 1.5];
    return window.devicePixelRatio > 2 ? [1, 1.35] : [1, 1.75];
  }, []);

  return (
    <Canvas
      className="webgl"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100svh",
        zIndex: 3,
        pointerEvents: "none",
      }}
      dpr={dpr}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      camera={{ fov: 45, near: 0.1, far: 200, position: [0, 0, 9] }}
      flat
    >
      <StarBody />
    </Canvas>
  );
}
