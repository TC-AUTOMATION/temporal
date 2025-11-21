'use client';

import Image from 'next/image';

interface TemporalLogoProps {
  className?: string;
  animate?: boolean;
  size?: number;
}

export default function TemporalLogo({ className = '', size = 200 }: TemporalLogoProps) {
  return (
    <Image
      src="/temporal-logo.svg"
      alt="Temporal Logo"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
