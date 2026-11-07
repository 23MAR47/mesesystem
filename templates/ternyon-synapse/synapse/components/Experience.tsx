"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import ScrollEngine from "./ScrollEngine";
import Cta from "./sections/Cta";
import Footer from "./sections/Footer";
import Hero from "./sections/Hero";
import Mosaic from "./sections/Mosaic";
import Neural from "./sections/Neural";
import Reel from "./sections/Reel";
import Work from "./sections/Work";
import FlyCard from "./ui/FlyCard";
import Nav from "./ui/Nav";
import Preloader from "./ui/Preloader";
import Reveals from "./ui/Reveals";

// ssr: false is mandatory — three touches window on import
const Scene = dynamic(() => import("./three/Scene"), { ssr: false });

export default function Experience() {
  const [canvas, setCanvas] = useState(false);

  useEffect(() => {
    // deferred a tick past first paint: building the cloud's buffers is a
    // few hundred ms of synchronous work, and it must not block the
    // preloader from painting
    const id = window.setTimeout(() => setCanvas(true), 80);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      <Preloader />
      <div className="backdrop" data-backdrop />
      {canvas ? <Scene /> : null}
      <Nav />
      <FlyCard />

      <main className="page">
        <Hero />
        <Reel />
        <Neural />
        <Work />
        <Mosaic />
        <Cta />
        <Footer />
      </main>

      <Reveals />
      <ScrollEngine />
    </>
  );
}
