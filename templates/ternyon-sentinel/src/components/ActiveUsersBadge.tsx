import React from 'react';

export function ActiveUsersBadge() {
  const avatars = [
    {
      src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      alt: "User 1"
    },
    {
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      alt: "User 2"
    },
    {
      src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      alt: "User 3"
    }
  ];

  return (
    <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-white/40 bg-white/20 backdrop-blur-xl shadow-[0_8px_20px_rgba(0,0,0,0.06)] select-none">
      {/* Avatars stacked */}
      <div className="flex -space-x-2">
        {avatars.map((avatar, idx) => (
          <img
            key={idx}
            src={avatar.src}
            alt={avatar.alt}
            referrerPolicy="no-referrer"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border-[1.5px] border-white shadow-xs"
          />
        ))}
      </div>

      {/* Label and Count */}
      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs pr-1">
        <span className="text-white/80 font-normal">Active Users</span>
        <span className="text-white font-semibold tracking-wide">+323</span>
      </div>
    </div>
  );
}
