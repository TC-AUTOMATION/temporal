'use client';

interface TemporalLogoProps {
  className?: string;
  animate?: boolean;
  size?: number;
}

export default function TemporalLogo({ className = '', size = 200 }: TemporalLogoProps) {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        background: 'transparent'
      }}
    >
      {/* Safari/iOS: HEVC with alpha (prioritaire) */}
      <source src="/hero-video.mov" type='video/mp4; codecs="hvc1"' />
      {/* Chrome/Firefox: WebM with alpha */}
      <source src="/hero-video.webm" type="video/webm" />
    </video>
  );
}
