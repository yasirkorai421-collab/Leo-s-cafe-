"use client";

import { useState } from "react";

export default function FloatingCallButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href="tel:+923361171626"
      className="fixed bottom-6 left-6 z-50 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full shadow-2xl transition-all duration-300 hover:shadow-green-500/50 hover:scale-110 lg:bottom-8 lg:left-8"
      style={{
        width: '64px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label="Call Leo's Café"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Phone Icon */}
      <svg
        className={`w-7 h-7 transition-transform duration-300 ${
          isHovered ? 'rotate-12 scale-110' : ''
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>

      {/* Ripple effect */}
      <div
        className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"
        style={{ animationDuration: '2s' }}
      />
    </a>
  );
}
