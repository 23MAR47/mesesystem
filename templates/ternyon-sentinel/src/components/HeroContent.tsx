import React from 'react';
import { ChevronRight } from 'lucide-react';

export function HeroContent() {
  return (
    <div className="flex flex-col items-start z-20 select-none max-w-[280px] sm:max-w-xs md:max-w-sm lg:max-w-md">
      {/* Title in slate grey matching the navbar */}
      <h1 className="tracking-tight leading-[1.08] mb-2 sm:mb-3">
        <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-semibold tracking-tight text-slate-800 drop-shadow-[0_1px_8px_rgba(255,255,255,0.4)]">
          Innovation
        </span>
        <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-light text-slate-700 drop-shadow-[0_1px_8px_rgba(255,255,255,0.4)]">
          <span className="font-serif italic font-normal mr-1 text-slate-600">&</span>
          <span className="font-semibold tracking-tight text-slate-800">security</span>
        </span>
      </h1>

      {/* Subtitle in grey matching navbar */}
      <p className="text-slate-700/80 text-[11px] sm:text-xs md:text-sm font-normal leading-relaxed mb-3 sm:mb-4 max-w-xs drop-shadow-[0_1px_4px_rgba(255,255,255,0.3)]">
        We are at the forefront of merging cutting-edge technology
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Our Solutions Button */}
        <button
          className="group relative inline-flex items-center justify-between bg-[#0066ee] hover:bg-[#0055d4] active:scale-98 text-white text-xs sm:text-[13px] font-medium pl-3.5 sm:pl-4 pr-1.5 py-1.5 rounded-full shadow-[0_6px_16px_rgba(0,102,238,0.35)] transition-all duration-200 cursor-pointer"
        >
          <span className="mr-2.5 whitespace-nowrap">Our Solutions</span>
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white flex items-center justify-center text-[#0066ee] transition-transform duration-200 group-hover:translate-x-0.5 shadow-xs">
            <ChevronRight className="w-3 h-3 stroke-[2.5]" />
          </span>
        </button>

        {/* Contact us Button */}
        <button
          className="bg-white/95 hover:bg-white text-slate-800 text-xs sm:text-[13px] font-medium px-4 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-[0_3px_10px_rgba(0,0,0,0.06)] border border-white/90 backdrop-blur-md transition-all duration-200 active:scale-98 cursor-pointer"
        >
          Contact us
        </button>
      </div>
    </div>
  );
}
