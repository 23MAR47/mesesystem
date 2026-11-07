import React from 'react';

// Overlapping customer avatars for the social-proof badge
const avatars = [
  {
    name: "Keelway customer 1",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
  },
  {
    name: "Keelway customer 2",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
  },
  {
    name: "Keelway customer 3",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
  }
];

export const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8 pt-3 sm:pt-6 md:pt-8 pb-12 md:pb-24 z-10 select-none">

      {/* 1. Social Proof Badge */}
      <div className="mb-6 sm:mb-8 inline-flex items-center gap-2.5 bg-[#EEF2F6] hover:bg-[#E4E9F0] transition-colors px-3 py-1.5 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-[#E2E8F0]/80 cursor-default">
        {/* Overlapping Micro-Avatars */}
        <div className="flex items-center -space-x-2 pl-0.5">
          {avatars.map((avatar, index) => (
            <img
              key={index}
              src={avatar.image}
              alt={avatar.name}
              className="w-6 h-6 rounded-full object-cover border-2 border-white ring-0 shadow-xs"
              loading="lazy"
            />
          ))}
        </div>
        {/* Badge Text */}
        <span className="text-[13.5px] sm:text-[14px] font-[500] text-[#334155] tracking-tight pr-1.5">
          Loved by 1,200+ agency teams
        </span>
      </div>

      {/* 2. Main Hero Headline */}
      <h1 className="max-w-[1050px] mx-auto text-[44px] sm:text-[58px] md:text-[70px] lg:text-[78px] font-[800] tracking-[-0.035em] leading-[1.08] sm:leading-[1.05] mb-5 sm:mb-6">
        <span className="text-[#1E2433] block">
          Stop Running Your Agency
        </span>
        <span className="text-[#1D68FF] block mt-1 sm:mt-1.5">
          On Twelve Browser Tabs
        </span>
      </h1>

      {/* 3. Subheading Description */}
      <p className="max-w-[680px] mx-auto text-[#4B5563] text-base sm:text-lg md:text-[19px] font-[400] leading-[1.55] sm:leading-[1.6] tracking-[-0.01em] mb-8 sm:mb-10 px-4">
        Invoicing, onboarding, client CRM, team ops and commission tracking,
        <span className="block sm:inline"> finally under one roof — and finally talking to each other.</span>
      </p>

      {/* 4. Primary CTA Button */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          className="bg-[#0A0D14] hover:bg-[#1E293B] active:scale-[0.98] text-white text-[15px] sm:text-[16px] font-[500] px-7 sm:px-8 py-3.5 sm:py-4 rounded-[12px] shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          Start free — no card needed
        </button>
      </div>

    </section>
  );
};
