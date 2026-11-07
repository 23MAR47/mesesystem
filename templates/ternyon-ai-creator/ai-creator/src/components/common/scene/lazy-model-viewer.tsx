// 📖 Docs: obsidian/frontend/components/common.md
"use client";

/**
 * Lazy client wrapper for the WebGL model viewer.
 *
 * `dynamic({ ssr: false })` is what keeps `three` — by far the heaviest thing in
 * this project — in its own chunk, fetched only when a real user mounts the
 * scene. The bot path renders `<ModelPoster>` instead and never references this
 * module, so the `three` chunk is not in the graph it downloads at all: no
 * fetch, no parse, no script evaluation time, which is exactly what a Lighthouse
 * run measures.
 *
 * The loading placeholder is the scroll runway at full height. Because the
 * viewer is `ssr: false`, that placeholder is what the server renders — without
 * it the document would be one screen tall until hydration and then grow by two
 * more, moving the scrollbar under the reader.
 */

import dynamic from "next/dynamic";

import { sceneConfig } from "@/lib/scene/scene.config";

import type { ModelViewerProps } from "./model-viewer";

const runwayHeight = `${sceneConfig.stages.runwayViewports * 100}lvh`;

const ModelViewer = dynamic(
  () => import("./model-viewer").then((m) => ({ default: m.ModelViewer })),
  {
    ssr: false,
    loading: () => <div style={{ height: runwayHeight }} />,
  },
);

export const LazyModelViewer = (props: ModelViewerProps) => (
  <ModelViewer {...props} />
);
