import React from 'react';

export function XerefLogo({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C5D9B5" />
            <stop offset="50%" stopColor="#F5D4C1" />
            <stop offset="100%" stopColor="#B8DFE6" />
          </linearGradient>
        </defs>
        <path
          d="M20 20L80 80M80 20L20 80"
          stroke="url(#logo-gradient)"
          strokeWidth="16"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
