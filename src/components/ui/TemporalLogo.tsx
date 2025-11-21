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
      {/* Outer ellipse */}
      <ellipse
        cx="100"
        cy="100"
        rx="70"
        ry="90"
        stroke="#5B2D8E"
        strokeWidth="8"
        fill="none"
        transform="rotate(-15 100 100)"
      />
      {/* Inner T shape */}
      <path
        d="M75 50 L125 50 L100 55 L100 150"
        stroke="#5B2D8E"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Stylized script T */}
      <path
        d="M60 60 Q100 30 140 60 M100 60 Q95 100 100 150 Q105 170 85 165"
        stroke="#5B2D8E"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
