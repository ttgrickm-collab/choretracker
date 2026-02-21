import React from 'react';

export default function CargoIcon({ width = 24, height = 24, className = '' }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Glow effect - brighter */}
      <defs>
        <filter id="cargo-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="cargo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="1"/>
          <stop offset="50%" stopColor="#a78bfa" stopOpacity="1"/>
          <stop offset="100%" stopColor="#f0abfc" stopOpacity="1"/>
        </linearGradient>
      </defs>

      {/* Main cargo container body - lighter */}
      <rect
        x="4"
        y="7"
        width="16"
        height="13"
        rx="1"
        fill="#334155"
        stroke="url(#cargo-gradient)"
        strokeWidth="2"
        filter="url(#cargo-glow)"
      />

      {/* Top lid/seal - closed */}
      <path
        d="M4 7 L12 4 L20 7"
        fill="#475569"
        stroke="url(#cargo-gradient)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Security bands - horizontal stripes - brighter */}
      <line x1="4" y1="11" x2="20" y2="11" stroke="#22d3ee" strokeWidth="0.8" opacity="0.9"/>
      <line x1="4" y1="14" x2="20" y2="14" stroke="#22d3ee" strokeWidth="0.8" opacity="0.9"/>
      <line x1="4" y1="17" x2="20" y2="17" stroke="#22d3ee" strokeWidth="0.8" opacity="0.9"/>

      {/* Vertical locking mechanism - brighter */}
      <line x1="12" y1="7" x2="12" y2="20" stroke="#a78bfa" strokeWidth="1.5" opacity="0.9"/>

      {/* Lock indicator - sealed - brighter glow */}
      <circle cx="12" cy="13.5" r="1.8" fill="#22d3ee" opacity="1">
        <animate
          attributeName="opacity"
          values="0.8;1;0.8"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Side panels - depth - brighter */}
      <path
        d="M4 7 L4 20"
        stroke="url(#cargo-gradient)"
        strokeWidth="2"
        opacity="0.6"
      />
      <path
        d="M20 7 L20 20"
        stroke="url(#cargo-gradient)"
        strokeWidth="2"
        opacity="0.6"
      />
    </svg>
  );
}
