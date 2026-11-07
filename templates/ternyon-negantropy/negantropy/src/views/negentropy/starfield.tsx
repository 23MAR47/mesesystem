"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";

interface StarfieldProps {
  count?: number;
  radius?: number;
  /** Multiplier on the particle count (e.g. 0.7 on mobile). */
  densityScale?: number;
}

interface StarfieldAssets {
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
}

const buildAssets = (count: number, radius: number): StarfieldAssets => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const violet = new THREE.Color("#6b4ce0");
  const bone = new THREE.Color("#f5ede0");

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r = radius * (0.6 + Math.random() * 0.4);

    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = r * Math.cos(phi);

    const mixed = bone.clone().lerp(violet, Math.random());
    // 2× brightness pass — RGB doubled with a hard clamp at 1.0 to
    // keep the ambient backdrop in scale with the now-doubled shader
    // scenes.
    colors[i3] = Math.min(1, mixed.r * 2);
    colors[i3 + 1] = Math.min(1, mixed.g * 2);
    colors[i3 + 2] = Math.min(1, mixed.b * 2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    transparent: true,
    opacity: 1.0,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return { geometry, material };
};

/**
 * Static ambient starfield — non-interactive backdrop behind the galaxies.
 * Buffers are constructed in an effect (Math.random can't run during render
 * under the React Compiler purity rules) and disposed on unmount.
 */
export const Starfield = ({
  count = 1200,
  radius = 60,
  densityScale = 1,
}: StarfieldProps) => {
  const [assets, setAssets] = useState<StarfieldAssets | null>(null);

  useEffect(() => {
    const built = buildAssets(Math.round(count * densityScale), radius);
    setAssets(built);
    return () => {
      built.geometry.dispose();
      built.material.dispose();
    };
  }, [count, densityScale, radius]);

  if (!assets) return null;
  return <points geometry={assets.geometry} material={assets.material} />;
};
