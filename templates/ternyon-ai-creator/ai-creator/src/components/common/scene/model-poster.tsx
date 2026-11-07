// 📖 Docs: obsidian/frontend/components/common.md

/**
 * Static first frame of the scene.
 *
 * Serves two audiences, neither of which should ever download `three`: crawlers
 * and audit tools (gated server-side by `isBot()`), and browsers where WebGL is
 * unavailable or blocked. It is deliberately the same framing as the live scene
 * so the two paths look alike — it is not a layout-stability device, since the
 * stage section reserves its own height either way.
 *
 * `alt=""` on purpose: the section heading already names what this depicts, so
 * announcing it twice is noise.
 */

import Image from "next/image";

export interface ModelPosterProps {
  src: string;
}

export const ModelPoster = ({ src }: ModelPosterProps) => (
  <Image
    src={src}
    alt=""
    fill
    priority
    sizes="100vw"
    className="object-contain"
  />
);
