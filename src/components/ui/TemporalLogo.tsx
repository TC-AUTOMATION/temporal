'use client';

interface TemporalLogoProps {
  className?: string;
  animate?: boolean;
  size?: number;
}

export default function TemporalLogo({ className = '', animate = false, size = 200 }: TemporalLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={`${animate ? 'animate-rotate' : ''} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradient for the logo */}
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5B2D8E" />
          <stop offset="50%" stopColor="#7B4DB0" />
          <stop offset="100%" stopColor="#5B2D8E" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Drop shadow */}
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#5B2D8E" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Background glow */}
      <ellipse
        cx="100"
        cy="100"
        rx="60"
        ry="75"
        fill="url(#logoGradient)"
        opacity="0.1"
        transform="rotate(-15 100 100)"
      />

      {/* Outer ellipse with glow */}
      <ellipse
        cx="100"
        cy="100"
        rx="70"
        ry="88"
        stroke="url(#logoGradient)"
        strokeWidth="6"
        fill="none"
        transform="rotate(-15 100 100)"
        filter="url(#glow)"
      />

      {/* Stylized script T - main stroke */}
      <path
        d="M55 55 Q100 25 145 55"
        stroke="url(#logoGradient)"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        filter="url(#glow)"
      />

      {/* T vertical with elegant curve */}
      <path
        d="M100 55 Q98 100 100 140 Q102 160 85 158"
        stroke="url(#logoGradient)"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        filter="url(#glow)"
      />

      {/* Small decorative accent */}
      <circle cx="145" cy="55" r="3" fill="#7B4DB0" filter="url(#shadow)" />
    </svg>
  );
}
