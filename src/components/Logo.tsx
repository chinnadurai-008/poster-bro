import React, { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const [imageFailed, setImageFailed] = useState(false);

  const dimensionClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  const textClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  }[size];

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`relative ${dimensionClasses} rounded-xl overflow-hidden shadow-sm shrink-0 border border-neutral-700/60 bg-neutral-900 flex items-center justify-center`}>
        {!imageFailed ? (
          <img
            src="/src/assets/images/poster_bro_logo_1790524810760.jpg"
            alt="Poster Bro Logo"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          /* High-res minimalist paintbrush vector with vibrant gradient colors */
          <svg viewBox="0 0 100 100" className="w-full h-full p-1" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="brushGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="35%" stopColor="#f97316" />
                <stop offset="70%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            {/* Dynamic paint stroke splash */}
            <path
              d="M18 78 C28 50, 48 30, 78 22 C64 42, 54 62, 38 78 C30 86, 18 86, 18 78 Z"
              fill="url(#brushGrad)"
            />
            {/* Minimalist paintbrush handle */}
            <path
              d="M74 20 L84 10 C86 8, 90 8, 92 10 L94 12 C96 14, 96 18, 94 20 L84 30 Z"
              fill="#d4d4d8"
            />
            {/* Metal ferrule */}
            <path
              d="M70 24 L82 36 L76 42 L64 30 Z"
              fill="#71717a"
            />
            {/* Bristles tip */}
            <circle cx="28" cy="74" r="5" fill="#f43f5e" />
            <circle cx="42" cy="56" r="3.5" fill="#06b6d4" />
          </svg>
        )}
      </div>

      {showText && (
        <span className={`font-extrabold tracking-tight text-white flex items-center gap-1 ${textClasses}`}>
          <span>Poster</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-500 to-violet-400">
            Bro
          </span>
        </span>
      )}
    </div>
  );
};
