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

      // Function to check if a position is too close to existing stars
      const isTooClose = (x: number, y: number, size: number, existingStars: Star[]) => {
        for (const star of existingStars) {
          // Skip small stars for collision detection
          if (star.type === 'small') continue;

          const dx = x - star.x;
          const dy = y - star.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = (size + star.size) / 10 + 3;

          if (distance < minDistance) {
            return true;
          }
        }
        return false;
      };

      // Function to find a non-overlapping position
      const findPosition = (size: number, maxAttempts: number = 50) => {
        for (let i = 0; i < maxAttempts; i++) {
          const x = Math.random() * 100;
          const y = Math.random() * 100;

          if (!isTooClose(x, y, size, newStars)) {
            return { x, y };
          }
        }
        // Fallback to random position if no good spot found
        return { x: Math.random() * 100, y: Math.random() * 100 };
      };

      // Small stars (no collision check needed)
      for (let i = 0; i < 50; i++) {
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

      // Medium stars with collision avoidance
      for (let i = 50; i < 70; i++) {
        const size = Math.random() * 15 + 12;
        const { x, y } = findPosition(size);
        newStars.push({
          id: i,
          x,
          y,
          size,
          duration: Math.random() * 3 + 1.5,
          delay: Math.random() * 6,
          type: 'medium',
        });
      }

      // Large feature stars with collision avoidance
      for (let i = 70; i < 80; i++) {
        const size = Math.random() * 25 + 20;
        const { x, y } = findPosition(size, 100);
        newStars.push({
          id: i,
          x,
          y,
          size,
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

      {stars.map((star) => {
        const isAlternate = star.id % 2 === 0;

        return (
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
              viewBox="0 0 245.02 226.8"
              style={{ transform: `rotate(${star.id * 47 % 360}deg)` }}
            >
              <path
                d="M12.61,116.68l-10.85-.87c-2.16-.19-1.72-2.44-1.72-2.44.35-1.44,1.5-1.32,1.5-1.32l12.74-.39h0c7.55-.39,16.6-1.04,25.9-1.86,0,0,16.81-1.34,27.75-3.1h0c13.24-1.94,26.36-4.54,34.28-7.1,6.63-2.14,9.73-3.66,12.45-5.51,7.92-5.39,10.51-8.89,23.39-21.26,7.92-7.61,22.84-24.59,24.8-27.02q12.21-15.05,25.87-33.02c5.62-7.4,8.08-10.63,8.08-10.63,0,0,2.13-2.96,3.66-1.96.92.61,1.65,2.74-.08,4.66-4.18,4.63-45.95,71.13-45.55,81.38.32,8.28,7.52,10.77,7.52,10.77,0,0,6.28,5.45,40.54,9.33,2.12.51,25.7,2.18,25.7,2.18,3.21.2,6.56.38,10.08.55,1.67.08,6.26-.18,6.26,1.59,0,0,1.16,2.58-5.11,2.81-3.18.12-7.74.36-13.22.73,0,0-19.04,1.45-26.4,2.23-28.26,2.86-61.19,7.8-70.52,15.05,0,0-24.79,19.47-45.36,44.33-12.85,15.53-24.85,32.29-36.25,48.59-1.93,2.75-3.24,2.75-4.21,1.85,0,0-.48-.72.21-1.94.86-1.52,3.23-5.36,9.16-15.15,5.4-8.91,12.13-20.63,17.98-32.61,9.75-19.98,19.23-39,18.38-43.76-1.2-6.7-14.98-9.68-20.65-10.63,0,0-.02,0-8.16-.91h0l-25.35-2.81c-2.46-.27,2.46.27,0,0,0,0-13.81-1.09-22.8-1.77"
                fill={isAlternate ? '#8b5cf6' : (darkMode ? '#ffffff' : '#0a0a0a')}
                opacity={star.type === 'small' ? 0.6 : star.type === 'medium' ? 0.8 : 1}
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
