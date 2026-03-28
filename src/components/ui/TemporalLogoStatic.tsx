'use client';

interface TemporalLogoStaticProps {
  className?: string;
  size?: number;
}

export default function TemporalLogoStatic({ className = '', size = 200 }: TemporalLogoStaticProps) {
  return (
    <img
      src="/logo-3d.png"
      alt="Temporal"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}
