import React from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';

export const App: React.FC = () => {
  return (
    // Full-bleed stage: fills the viewport edge to edge with no outer
    // padding or frame, so no background shows through at the sides.
    <div
      className="relative w-full min-h-screen overflow-hidden flex flex-col justify-between font-sans"
      style={{
        background:
          'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 38%, #F2F7FF 65%, #D7E8FC 88%, #BCDDFC 100%)',
      }}
    >
      {/* Background Animated Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
      >
        <source src="/hero-background.mp4" type="video/mp4" />
      </video>

      {/* Soft Radial Ambient Blue Glow Overlay at Bottom */}
      <div
        className="absolute inset-0 pointer-events-none z-0 mix-blend-multiply opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 95% 50% at 50% 102%, rgba(186, 224, 255, 0.8) 0%, rgba(219, 234, 254, 0.35) 50%, rgba(255, 255, 255, 0) 85%)',
        }}
      />

      {/* Top Navbar */}
      <Navbar />

      {/* Hero Content Section */}
      <HeroSection />

      {/* Bottom Ambient Spacing */}
      <div className="w-full h-8 md:h-12 z-10 pointer-events-none" />
    </div>
  );
};

export default App;
