import React from 'react';

const navLinks = [
  { label: 'Platform', href: '#platform' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Customers', href: '#customers' },
  { label: 'Resources', href: '#resources' },
];

export const Navbar: React.FC = () => {
  return (
    <header className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 md:px-16 py-6 md:py-8 flex items-center justify-between z-20 relative">
      {/* Brand: keel mark + wordmark */}
      <div className="flex items-center">
        <a
          href="#"
          className="flex items-center gap-2.5 select-none hover:opacity-95 transition-opacity"
          aria-label="Keelway Home"
        >
          <svg
            viewBox="0 0 28 28"
            className="w-7 h-7 md:w-[30px] md:h-[30px] shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Keelway"
          >
            {/* Keel / sail cutting upward — steady forward motion */}
            <rect width="28" height="28" rx="8" fill="#1D68FF" />
            <path
              d="M 14 6.2 L 21.6 21.8 L 14 18 L 6.4 21.8 Z"
              fill="#FFFFFF"
            />
          </svg>
          <span className="text-[#0A0D14] text-2xl md:text-[25px] font-extrabold tracking-[-0.02em]">
            Keelway
          </span>
        </a>
      </div>

      {/* Center Nav Links */}
      <nav className="hidden md:flex items-center gap-9 lg:gap-11">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-[#1E293B] text-[15px] font-[500] hover:text-[#1D68FF] transition-colors duration-150"
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Right CTA Button */}
      <div className="flex items-center">
        <button
          type="button"
          className="bg-[#0A0D14] hover:bg-[#1E293B] active:scale-[0.98] text-white text-[14px] md:text-[15px] font-[500] px-5 sm:px-6 py-2.5 rounded-[10px] transition-all duration-200 shadow-sm cursor-pointer"
        >
          Book a demo
        </button>
      </div>
    </header>
  );
};
