import React from 'react';
import { BirdLogo } from './Icons';

interface NavbarProps {
  activeTab?: string;
  onTabClick?: (tab: string) => void;
}

export function Navbar({ activeTab = 'home', onTabClick }: NavbarProps) {
  const navItems = [
    { id: 'home', label: 'home' },
    { id: 'about', label: 'about' },
    { id: 'services', label: 'services' },
    { id: 'industries', label: 'industries' },
    { id: 'threat intelligence', label: 'threat intelligence' },
    { id: 'contact', label: 'contact' },
  ];

  return (
    <header className="w-full flex items-center justify-between px-6 sm:px-10 md:px-14 py-4 sm:py-6 z-30 select-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 cursor-pointer group">
        <BirdLogo className="w-9 h-6 sm:w-11 sm:h-7 transition-transform duration-300 group-hover:scale-105" />
      </div>

      {/* Center Nav Links */}
      <nav className="flex items-center space-x-1 sm:space-x-3 md:space-x-5 lg:space-x-7">
        {navItems.map((item) => {
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              onClick={() => onTabClick?.(item.id)}
              className={`transition-all duration-200 text-xs sm:text-[13px] md:text-sm tracking-wide lowercase ${
                isActive
                  ? 'px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full border border-white/40 bg-white/15 text-slate-800 font-medium backdrop-blur-md shadow-xs'
                  : 'px-2 py-1 text-slate-700/80 hover:text-slate-900 font-normal hover:opacity-100'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Right Action Button */}
      <div className="flex items-center">
        <button
          className="bg-white/90 hover:bg-white text-slate-800 text-xs sm:text-[13px] md:text-sm font-medium px-4 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-white/80 backdrop-blur-md transition-all duration-200 hover:shadow-md cursor-pointer"
        >
          Resources
        </button>
      </div>
    </header>
  );
}
