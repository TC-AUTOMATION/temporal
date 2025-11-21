'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/stores/useStore';

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
  const { darkMode } = useStore();

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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            '--twinkle-duration': `${star.duration}s`,
            '--twinkle-delay': `${star.delay}s`,
          } as React.CSSProperties}
        >
          <svg
            width={star.size}
            height={star.size}
            viewBox="0 0 100 100"
            style={{ transform: `rotate(${star.id * 47 % 360}deg)` }}
          >
            {/* Étoile style Temporal - branches épaisses asymétriques */}
            <path
              d="M50 0 L55 40 L50 50 L45 42 Z"
              fill={darkMode ? '#ffffff' : '#0a0a0a'}
              opacity={star.type === 'small' ? 0.6 : star.type === 'medium' ? 0.8 : 1}
            />
            <path
              d="M100 50 L58 55 L50 50 L60 44 Z"
              fill={darkMode ? '#ffffff' : '#0a0a0a'}
              opacity={star.type === 'small' ? 0.6 : star.type === 'medium' ? 0.8 : 1}
            />
            <path
              d="M50 100 L44 60 L50 50 L56 58 Z"
              fill={darkMode ? '#ffffff' : '#0a0a0a'}
              opacity={star.type === 'small' ? 0.6 : star.type === 'medium' ? 0.8 : 1}
            />
            <path
              d="M0 50 L42 44 L50 50 L40 56 Z"
              fill={darkMode ? '#ffffff' : '#0a0a0a'}
              opacity={star.type === 'small' ? 0.6 : star.type === 'medium' ? 0.8 : 1}
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
