import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /* dev and build share .next by default, so a verification build run while
     the dev server is up wipes the chunks the browser is still requesting.
     Verification builds set NEXT_DIST_DIR to stay out of the way. */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Other lockfiles live further up this tree; without this Next picks one
  // of them as the workspace root and warns on every build.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
