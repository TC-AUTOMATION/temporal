'use client';

import Image from 'next/image';

interface TemporalLogoStaticProps {
  className?: string;
  size?: number;
}

export default function TemporalLogoStatic({ className = '', size = 200 }: TemporalLogoStaticProps) {
  return (
    <Image
      src="/logo-3d.png"
      alt="Temporal"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
      priority
    />
  );
}
