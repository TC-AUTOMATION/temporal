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
  const [isMobile, setIsMobile] = useState(false);
  const { darkMode } = useStore();

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];

      // Zone centrale à éviter (logo T et textes) - en pourcentage
      // Sur mobile: contenu centré verticalement, formulaire large (max-w-md ~448px)
      // Sur desktop: colonne centrale plus étroite mais plus haute
      const centerZone = isMobile ? {
        xMin: 10,  // Le formulaire prend presque toute la largeur sur petit écran
        xMax: 90,
        yMin: 20,  // Logo en haut, countdown au milieu, formulaire en bas
        yMax: 85,
      } : {
        xMin: 38,
        xMax: 62,
        yMin: 25,
        yMax: 75,
      };

      // Vérifie si une position est dans la zone centrale à éviter
      const isInCenterZone = (x: number, y: number) => {
        return x >= centerZone.xMin && x <= centerZone.xMax &&
               y >= centerZone.yMin && y <= centerZone.yMax;
      };

      // Vérifie si une position est trop proche d'une étoile existante
      const isTooCloseToOthers = (x: number, y: number, size: number, existingStars: Star[], minDistance: number) => {
        for (const star of existingStars) {
          const dx = x - star.x;
          const dy = y - star.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          // Distance minimale basée sur la taille des deux étoiles
          const requiredDist = minDistance + (size + star.size) / 20;
          if (distance < requiredDist) {
            return true;
          }
        }
        return false;
      };

      // Trouve une position valide (hors zone centrale et pas trop proche des autres)
      const findValidPosition = (size: number, minDistance: number, maxAttempts: number = 100) => {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const x = Math.random() * 96 + 2; // 2% à 98%
          const y = Math.random() * 96 + 2;

          // Vérifier zone centrale
          if (isInCenterZone(x, y)) continue;

          // Vérifier distance avec autres étoiles
          if (isTooCloseToOthers(x, y, size, newStars, minDistance)) continue;

          return { x, y };
        }

        // Fallback: trouver la position la plus éloignée possible
        let bestX = 5;
        let bestY = 5;
        let bestMinDist = 0;

        for (let i = 0; i < 50; i++) {
          const x = Math.random() * 96 + 2;
          const y = Math.random() * 96 + 2;

          if (isInCenterZone(x, y)) continue;

          let minDistToOthers = Infinity;
          for (const star of newStars) {
            const dx = x - star.x;
            const dy = y - star.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            minDistToOthers = Math.min(minDistToOthers, dist);
          }

          if (minDistToOthers > bestMinDist) {
            bestMinDist = minDistToOthers;
            bestX = x;
            bestY = y;
          }
        }

        return { x: bestX, y: bestY };
      };

      // Reduce star count on mobile/tablet
      const multiplier = isMobile ? 0.4 : 1;

      // Grandes étoiles d'abord (plus de distance requise)
      const largeStarsCount = Math.round(12 * multiplier);
      for (let i = 0; i < largeStarsCount; i++) {
        const size = Math.random() * 20 + 22;
        const { x, y } = findValidPosition(size, 6);

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

      // Étoiles moyennes
      const mediumStarsCount = Math.round(25 * multiplier);
      for (let i = 0; i < mediumStarsCount; i++) {
        const size = Math.random() * 12 + 14;
        const { x, y } = findValidPosition(size, 4);

        newStars.push({
          id: largeStarsCount + i,
          x,
          y,
          size,
          duration: Math.random() * 3 + 1.5,
          delay: Math.random() * 6,
          type: 'medium',
        });
      }

      // Petites étoiles (moins de distance requise)
      const smallStarsCount = Math.round(55 * multiplier);
      for (let i = 0; i < smallStarsCount; i++) {
        const size = Math.random() * 6 + 5;
        const { x, y } = findValidPosition(size, 2);

        newStars.push({
          id: largeStarsCount + mediumStarsCount + i,
          x,
          y,
          size,
          duration: Math.random() * 4 + 2,
          delay: Math.random() * 8,
          type: 'small',
        });
      }

      setStars(newStars);
    };
    generateStars();
  }, [isMobile]);

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
                fill={isAlternate ? '#5B2D8E' : (darkMode ? '#ffffff' : '#0a0a0a')}
                opacity={star.type === 'small' ? 0.6 : star.type === 'medium' ? 0.8 : 1}
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
