import type { Metadata } from "next";

import { NegentropyView } from "@/views/negentropy";

export const metadata: Metadata = {
  title: "NEGENTROPY — The science of refusing to fall apart.",
  description:
    "A particle-driven tribute to Bryan Johnson's Blueprint protocol. Scroll through the science of refusing to die.",
};

export default function HomePage() {
  return <NegentropyView />;
}
