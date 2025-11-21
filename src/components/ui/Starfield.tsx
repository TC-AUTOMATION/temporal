'use client';

import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  type: 'small' | 'medium' | 'large';
}

export default function Starfield() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];

      // Small stars
      for (let i = 0; i < 80; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 8 + 4,
          duration: Math.random() * 4 + 2,
          delay: Math.random() * 8,
          type: 'small',
        });
      }

      // Medium stars
      for (let i = 80; i < 110; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 15 + 12,
          duration: Math.random() * 3 + 1.5,
          delay: Math.random() * 6,
          type: 'medium',
        });
      }

      // Large feature stars
      for (let i = 110; i < 125; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 25 + 20,
          duration: Math.random() * 2 + 1,
          delay: Math.random() * 4,
          type: 'large',
        });
      }

      setStars(newStars);
    };
    generateStars();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5B2D8E]/5 via-transparent to-transparent" />

      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            '--twinkle-duration': `${star.duration}s`,
            '--twinkle-delay': `${star.delay}s`,
            filter: star.type === 'large' ? 'blur(0.5px)' : 'none',
          } as React.CSSProperties}
        >
          <svg
            width={star.size}
            height={star.size}
            viewBox="0 0 24 24"
            className={star.type === 'large' ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''}
          >
            <defs>
              <linearGradient id={`starGrad-${star.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={star.type === 'medium' ? '#5B2D8E' : 'white'} />
                <stop offset="100%" stopColor="white" />
              </linearGradient>
            </defs>
            <path
              d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z"
              fill={star.type === 'small' ? 'white' : `url(#starGrad-${star.id})`}
              opacity={star.type === 'small' ? 0.6 : 1}
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
