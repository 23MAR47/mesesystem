import { homeHero } from "@/data/mocks/home";

import { Hero } from "./hero";

/**
 * Home view — route `/`. Server Component: injects the hero content and renders
 * the composition. Client behaviour (the WebGL model) lives in leaf components.
 */
export const HomeView = () => {
  return <Hero content={homeHero} />;
};
