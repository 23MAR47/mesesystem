import { notFound } from "next/navigation";

import { HomeView } from "@/views/home";
import { sectionRoutes, type SectionRoute } from "@/lib/scene/screens";

/**
 * Deep-link routes. The original router mapped `/sitemap`, `/partners`,
 * `/roadmap`, `/product`, `/social` and `/investors` all onto the same `Home`
 * page and scrolled to the matching section — these segments do the same.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(sectionRoutes).map((section) => ({ section }));
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!(section in sectionRoutes)) notFound();

  return <HomeView section={sectionRoutes[section as SectionRoute]} />;
}
