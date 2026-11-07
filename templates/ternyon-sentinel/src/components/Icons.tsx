import React from 'react';

export function BirdLogo({ className = "w-10 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 54 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M2 14C8 14 14 13 18 10C24 6 30 2 38 3C44 4 48 7 52 10C46 11 40 13 34 14C40 15 46 17 50 19C42 20 34 19 28 17C20 18 12 18 2 14Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M6 14C12 13.5 16 12 22 9C28 6 34 3.5 42 4.5C40 5.5 36 7 30 9C36 9.5 42 11 48 13.5C40 14.5 32 14 26 13C18 14.5 12 14.5 6 14Z"
        fill="white"
        fillOpacity="0.85"
      />
      <path
        d="M10 18C16 17.5 22 17 28 15.5C22 16.5 16 17 10 18Z"
        stroke="white"
        strokeWidth="0.8"
        strokeOpacity="0.5"
      />
    </svg>
  );
}

export function CrystalLockIcon({ className = "w-12 h-14" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 64 76"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,100,200,0.35)]"
      >
        <defs>
          <linearGradient id="shackleGrad" x1="16" y1="6" x2="48" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#93c5fd" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="bodyGrad" x1="12" y1="28" x2="52" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="30%" stopColor="#bfdbfe" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="innerGlow" x1="32" y1="36" x2="32" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Shackle */}
        <path
          d="M20 30V18C20 11.3726 25.3726 6 32 6C38.6274 6 44 11.3726 44 18V30"
          stroke="url(#shackleGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M23 28V18C23 13.0294 27.0294 9 32 9C36.9706 9 41 13.0294 41 18V28"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />

        {/* Lock Body - Crystal faceted look */}
        <path
          d="M14 30C12.8954 30 12 30.8954 12 32V64C12 67.3137 14.6863 70 18 70H46C49.3137 70 52 67.3137 52 64V32C52 30.8954 51.1046 30 50 30H14Z"
          fill="url(#bodyGrad)"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.5"
        />

        {/* Crystal Facets */}
        <path
          d="M12 32L32 46L52 32"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1"
        />
        <path
          d="M14 68L32 46L50 68"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1"
        />
        <path
          d="M32 6L32 24"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1"
        />
        <path
          d="M32 46V68"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1.2"
        />

        {/* Keyhole / Core light */}
        <circle cx="32" cy="48" r="3.5" fill="url(#innerGlow)" />
        <path d="M30.5 49L29 57H35L33.5 49H30.5Z" fill="url(#innerGlow)" />
        <circle cx="32" cy="48" r="1.5" fill="#1e3a8a" />
      </svg>
    </div>
  );
}

export function AiOrbGraphic({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* 3D swirl marble sphere matching the screenshot */}
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id="sphereBase" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#60a5fa" />
            <stop offset="60%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
          <radialGradient id="swirlLight" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#93c5fd" stopOpacity="0.7" />
            <stop offset="80%" stopColor="#1d4ed8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="glossHighlight" x1="20" y1="15" x2="60" y2="65">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer Sphere Drop Shadow & Base */}
        <circle cx="40" cy="40" r="36" fill="url(#sphereBase)" className="filter drop-shadow-[0_10px_20px_rgba(37,99,235,0.45)]" />

        {/* Swirl 1 */}
        <path
          d="M20 30C28 18 52 16 62 28C72 40 58 60 44 64C30 68 18 54 22 40C26 26 48 26 56 36C64 46 48 58 38 54C28 50 32 38 40 36C48 34 50 42 46 46"
          stroke="url(#swirlLight)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Swirl 2 inner ribbon */}
        <path
          d="M28 24C38 16 56 22 58 34C60 46 46 54 36 50C26 46 30 32 42 30C54 28 54 44 42 46"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeOpacity="0.85"
          fill="none"
        />

        {/* Surface Gloss Reflex */}
        <ellipse cx="32" cy="24" rx="14" ry="7" fill="url(#glossHighlight)" transform="rotate(-25 32 24)" />
      </svg>
    </div>
  );
}
