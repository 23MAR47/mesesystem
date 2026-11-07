import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  /**
   * `next build` and `next dev` share .next by default, so building
   * while the dev server is up overwrites the files it is serving and
   * the next request dies with a minified TypeError. Set NEXT_BUILD_DIR
   * to give a verification build its own directory.
   */
  distDir: process.env.NEXT_BUILD_DIR || ".next",
  // A stray lockfile in the home directory makes Next guess the wrong
  // workspace root; pin it to this project.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
