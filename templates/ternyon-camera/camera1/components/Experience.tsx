"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { SECTIONS } from "@/lib/content";
import ScrollEngine from "./ScrollEngine";
import SectionBlock from "./SectionBlock";
import Annotations from "./ui/Annotations";
import Cursor from "./ui/Cursor";
import Footer from "./ui/Footer";
import Nav from "./ui/Nav";
import Preloader from "./ui/Preloader";
import ProgressRail from "./ui/ProgressRail";
import Reticle from "./ui/Reticle";
import ScrollHint from "./ui/ScrollHint";

// The canvas is client-only, and lathing fifty-odd parts is a few
// hundred milliseconds of synchronous work — so it is deferred a tick
// to let the preloader paint first.
const Scene = dynamic(() => import("./camera/Scene"), { ssr: false });

export default function Experience() {
  const [showScene, setShowScene] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setShowScene(true), 80);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      <Preloader />
      <Cursor />

      <div className="fixed inset-0 z-0">{showScene && <Scene />}</div>
      <Reticle />
      <Annotations />

      <Nav />
      <ProgressRail />
      <ScrollHint />

      <main id="top" className="relative z-10">
        <div id="stage">
          {SECTIONS.map((section, i) => (
            <SectionBlock key={section.id} section={section} index={i} />
          ))}
        </div>

        <Footer />
      </main>

      <ScrollEngine />
    </>
  );
}
