import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroContent } from './components/HeroContent';
import { ActiveUsersBadge } from './components/ActiveUsersBadge';
import { BottomCards } from './components/BottomCards';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay blocked or failed:", err);
      });
    }
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#070e17] flex items-center justify-center select-none">
      {/* 16:9 Aspect Ratio Frame fitting the screen without scrolling */}
      <main
        id="hero-16-9-container"
        className="relative w-full h-full max-w-[calc(100vh*16/9)] max-h-screen aspect-[16/9] overflow-hidden flex flex-col justify-between shadow-2xl bg-[#c5e1f0]"
      >
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <video
            ref={videoRef}
            src="/hero.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle Ambient Color & Vignette Overlays matching the original artwork */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-100/30 via-transparent to-sky-900/25 pointer-events-none" />
          <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#002444]/20 pointer-events-none" />
        </div>

        {/* Top Section: Navigation Bar with adequate spacing */}
        <div className="relative z-30 w-full pt-1 sm:pt-2">
          <Navbar activeTab={activeTab} onTabClick={setActiveTab} />
        </div>

        {/* Bottom Section: Innovation & Security on Left, Active Users + 3 Boxes Stacked on Right */}
        <div className="relative z-20 w-full px-6 sm:px-10 md:px-14 pb-5 sm:pb-6 md:pb-8 flex flex-col md:flex-row items-end justify-between gap-4 md:gap-6 mt-auto">
          {/* Left: Innovation & security headline and CTA buttons */}
          <div className="w-full md:w-auto flex-shrink-0">
            <HeroContent />
          </div>

          {/* Right: Active Users Badge positioned just above the rectangular boxes */}
          <div className="w-full md:w-auto flex-shrink-0 flex flex-col items-end gap-2 sm:gap-2.5">
            <div className="flex justify-end pr-0.5">
              <ActiveUsersBadge />
            </div>
            <div className="flex justify-end">
              <BottomCards />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
