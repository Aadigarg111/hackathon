import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = () => {
  return (
    <Link to="/" className="group relative">
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 bg-purple-600 rounded-lg animate-pulse group-hover:animate-none shadow-[0_4px_15px_rgba(147,51,234,0.3)]"></div>
          <svg
            className="relative w-8 h-8"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 8L6 16L12 24"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-glow"
            />
            <path
              d="M20 8L26 16L20 24"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-glow"
            />
            <path
              d="M16 6L16 26"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-glow"
            />
          </svg>
        </div>
        <span className="font-bold text-[22.9px] leading-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600 animate-gradient group-hover:from-purple-500 group-hover:to-purple-700">
          CodeStake
        </span>
      </div>
    </Link>
  );
}; 