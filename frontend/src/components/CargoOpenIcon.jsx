import React from 'react';

export default function CargoOpenIcon({ width = 24, height = 24, className = '' }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Glow effect - lighter */}
      <defs>
        <filter id="cargo-open-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="cargo-open-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.7"/>
          <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#f0abfc" stopOpacity="0.7"/>
        </linearGradient>
      </defs>

      {/* Main cargo container body - lighter */}
      <rect
        x="4"
        y="7"
        width="16"
        height="13"
        rx="1"
        fill="#1e293b"
        stroke="url(#cargo-open-gradient)"
        strokeWidth="1.8"
        filter="url(#cargo-open-glow)"
        opacity="0.85"
      />

      {/* Left lid - opened/flipped */}
      <path
        d="M4 7 L3 5.5 L10 4"
        fill="#334155"
        stroke="url(#cargo-open-gradient)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.8"
      />

      {/* Right lid - opened/flipped */}
      <path
        d="M20 7 L21 5.5 L14 4"
        fill="#334155"
        stroke="url(#cargo-open-gradient)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.8"
      />

      {/* Security bands - broken/dimmed but more visible */}
      <line x1="4" y1="11" x2="8" y2="11" stroke="#22d3ee" strokeWidth="0.6" opacity="0.5" strokeDasharray="2,2"/>
      <line x1="16" y1="11" x2="20" y2="11" stroke="#22d3ee" strokeWidth="0.6" opacity="0.5" strokeDasharray="2,2"/>
      
      <line x1="4" y1="14" x2="9" y2="14" stroke="#22d3ee" strokeWidth="0.6" opacity="0.5" strokeDasharray="2,2"/>
      <line x1="15" y1="14" x2="20" y2="14" stroke="#22d3ee" strokeWidth="0.6" opacity="0.5" strokeDasharray="2,2"/>
      
      <line x1="4" y1="17" x2="7" y2="17" stroke="#22d3ee" strokeWidth="0.6" opacity="0.5" strokeDasharray="2,2"/>
      <line x1="17" y1="17" x2="20" y2="17" stroke="#22d3ee" strokeWidth="0.6" opacity="0.5" strokeDasharray="2,2"/>

      {/* Vertical locking mechanism - broken */}
      <line x1="12" y1="12" x2="12" y2="20" stroke="#a78bfa" strokeWidth="1.2" opacity="0.5" strokeDasharray="3,3"/>

      {/* Lock indicator - unlocked */}
      <circle cx="12" cy="13.5" r="1.5" fill="#94a3b8" opacity="0.6"/>
      
      {/* Interior darkness - empty but lighter */}
      <rect
        x="6"
        y="9"
        width="12"
        height="9"
        rx="0.5"
        fill="#0f172a"
        opacity="0.5"
      />

      {/* Sparkles - cargo collected! - BRIGHTER */}
      <g opacity="1">
        {/* Top left sparkle */}
        <path
          d="M7 8 L7.5 9.5 L9 10 L7.5 10.5 L7 12 L6.5 10.5 L5 10 L6.5 9.5 Z"
          fill="#f0abfc"
        >
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </path>

        {/* Top right sparkle */}
        <path
          d="M17 8 L17.5 9.5 L19 10 L17.5 10.5 L17 12 L16.5 10.5 L15 10 L16.5 9.5 Z"
          fill="#22d3ee"
        >
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="1.8s"
            begin="0.3s"
            repeatCount="indefinite"
          />
        </path>

        {/* Bottom sparkle */}
        <path
          d="M12 16 L12.3 17 L13.5 17.3 L12.3 17.6 L12 18.5 L11.7 17.6 L10.5 17.3 L11.7 17 Z"
          fill="#a78bfa"
        >
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="2s"
            begin="0.6s"
            repeatCount="indefinite"
          />
        </path>
      </g>

      {/* Side panels - depth, lighter */}
      <path
        d="M4 7 L4 20"
        stroke="url(#cargo-open-gradient)"
        strokeWidth="1.8"
        opacity="0.4"
      />
      <path
        d="M20 7 L20 20"
        stroke="url(#cargo-open-gradient)"
        strokeWidth="1.8"
        opacity="0.4"
      />
    </svg>
  );
}
