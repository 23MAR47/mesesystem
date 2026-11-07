import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CrystalLockIcon, AiOrbGraphic } from './Icons';

export function BottomCards() {
  return (
    <div className="w-full flex items-end justify-end gap-2.5 sm:gap-3 md:gap-3.5 z-20 select-none">
      {/* Card 1: Perfect Security */}
      <div className="group relative rounded-2xl p-3 sm:p-3.5 md:p-4 glass-panel transition-all duration-300 hover:bg-white/20 hover:border-white/50 cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center justify-between w-[180px] sm:w-[210px] md:w-[230px] lg:w-[240px] h-[95px] sm:h-[105px] md:h-[115px]">
        {/* Arrow Button Top Right */}
        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white/80 transition-transform duration-200 group-hover:scale-110 group-hover:bg-white/30">
          <ArrowUpRight className="w-3 h-3 stroke-[2]" />
        </div>

        {/* 3D Lock Graphic */}
        <div className="flex-shrink-0 pr-2">
          <CrystalLockIcon className="w-9 h-11 sm:w-10 sm:h-12 md:w-11 md:h-13 transition-transform duration-300 group-hover:scale-105" />
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-start flex-1 min-w-0 pr-4">
          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium text-white/90 border border-white/30 bg-white/10 backdrop-blur-md mb-1 whitespace-nowrap">
            Perfect Security
          </span>
          <h3 className="text-white text-[11px] sm:text-xs md:text-[13px] font-medium leading-tight tracking-tight line-clamp-2">
            AI ensures total protection
          </h3>
        </div>
      </div>

      {/* Card 2: Integrated AI Agent */}
      <div className="group relative rounded-2xl p-3 sm:p-3.5 md:p-4 white-card-glossy transition-all duration-300 hover:shadow-2xl cursor-pointer flex flex-col justify-between w-[170px] sm:w-[195px] md:w-[215px] lg:w-[225px] h-[95px] sm:h-[105px] md:h-[115px]">
        {/* Arrow Button Top Right */}
        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 transition-transform duration-200 group-hover:scale-110 group-hover:bg-slate-200">
          <ArrowUpRight className="w-3 h-3 stroke-[2]" />
        </div>

        {/* 3D Orb Graphic */}
        <div className="mb-1">
          <AiOrbGraphic className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105" />
        </div>

        {/* Content */}
        <div>
          <h3 className="text-slate-900 text-[11px] sm:text-xs md:text-[13px] font-semibold leading-tight tracking-tight">
            Integrated AI Agent
          </h3>
          <p className="text-slate-500 text-[9px] sm:text-[10px] leading-tight mt-0.5 line-clamp-2">
            Integrated AI agent for personalized client experiences.
          </p>
        </div>
      </div>

      {/* Card 3: 42% Metric */}
      <div className="group relative rounded-2xl p-3 sm:p-3.5 md:p-4 glass-panel transition-all duration-300 hover:bg-white/20 hover:border-white/50 cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex flex-col justify-between w-[160px] sm:w-[185px] md:w-[200px] lg:w-[210px] h-[95px] sm:h-[105px] md:h-[115px]">
        {/* Arrow Button Top Right */}
        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white/80 transition-transform duration-200 group-hover:scale-110 group-hover:bg-white/30">
          <ArrowUpRight className="w-3 h-3 stroke-[2]" />
        </div>

        {/* Big 42% Display */}
        <div>
          <span className="text-2xl sm:text-3xl md:text-[34px] font-serif-display font-light text-white tracking-tight leading-none">
            42<span className="text-lg sm:text-xl font-light opacity-90">%</span>
          </span>
        </div>

        {/* Description */}
        <p className="text-white/80 text-[9px] sm:text-[10px] leading-tight mt-1 line-clamp-2">
          Join us in redefining the future of security with innovative solutions
        </p>
      </div>
    </div>
  );
}
