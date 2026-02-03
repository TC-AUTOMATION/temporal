'use client';

import { useEffect, useState, useRef } from 'react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import TemporalStar from '@/components/ui/TemporalStar';

const MAX_AMOUNT = 250;
const TIER_1 = 80; // Livraison gratuite
const TIER_2 = 150; // Bonnet
const TIER_3 = 200; // Veste

export default function CartGauge() {
  const { setCartOpen, cartTotal, darkMode, language } = useStore();
  const t = translations[language];
  const [level, setLevel] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCartAmount = useRef(0);

  const totalAmount = cartTotal();

  const scrollToContests = (e: React.MouseEvent) => {
    e.stopPropagation();
    const contestsSection = document.getElementById('contests');
    if (contestsSection) {
      contestsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const newLevel = Math.min((totalAmount / MAX_AMOUNT) * 100, 100);

    if (totalAmount !== prevCartAmount.current) {
      setIsAnimating(true);
    }

    setLevel(newLevel);
    prevCartAmount.current = totalAmount;

    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [totalAmount]);

  const getTierPosition = (threshold: number) => ((threshold / MAX_AMOUNT) * 100);
  const isTierReached = (threshold: number) => totalAmount >= threshold;

  // Calculer combien il reste pour le prochain palier
  const getNextTierInfo = () => {
    if (totalAmount >= TIER_3) {
      return { remaining: 0, nextTier: 'max' };
    } else if (totalAmount >= TIER_2) {
      return { remaining: TIER_3 - totalAmount, nextTier: 'veste' };
    } else if (totalAmount >= TIER_1) {
      return { remaining: TIER_2 - totalAmount, nextTier: 'bonnet' };
    } else {
      return { remaining: TIER_1 - totalAmount, nextTier: 'shipping' };
    }
  };

  const { remaining, nextTier } = getNextTierInfo();

  return (
    <div className="flex items-start gap-3 cursor-pointer" onClick={() => setCartOpen(true)}>
      {/* Paliers avec étoiles à gauche */}
      <div className="relative h-44 md:h-52 flex flex-col justify-end">
        {/* Palier 200€ - Veste */}
        <button
          onClick={scrollToContests}
          className={`absolute right-0 flex items-center justify-center transition-all duration-500 cursor-pointer hover:scale-110 ${
            isTierReached(TIER_3)
              ? 'opacity-100'
              : 'opacity-50 grayscale'
          }`}
          style={{ bottom: `${getTierPosition(TIER_3)}%`, transform: 'translateY(50%)' }}
        >
          <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
            {/* Étoile en fond */}
            <div className="absolute inset-0 flex items-center justify-center">
              <TemporalStar
                size={60}
                className={`transition-all duration-500 ${
                  isTierReached(TIER_3) ? 'drop-shadow-[0_0_15px_rgba(139,92,246,0.9)]' : ''
                }`}
                color={isTierReached(TIER_3) ? '#8b5cf6' : (darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)')}
                strokeWidth={0}
              />
            </div>
            {/* Contenu centré */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <span
                className={`text-sm md:text-base font-bold transition-all duration-500 ${
                  isTierReached(TIER_3)
                    ? 'text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]'
                    : darkMode
                      ? 'text-white/40'
                      : 'text-black/30'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                200€
              </span>
              <span
                className={`text-[8px] md:text-[9px] uppercase tracking-wider transition-all duration-500 ${
                  isTierReached(TIER_3)
                    ? 'text-white/90 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]'
                    : darkMode
                      ? 'text-white/30'
                      : 'text-black/20'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                Veste
              </span>
            </div>
          </div>
        </button>

        {/* Palier 150€ - Bonnet */}
        <button
          onClick={scrollToContests}
          className={`absolute right-0 flex items-center justify-center transition-all duration-500 cursor-pointer hover:scale-110 ${
            isTierReached(TIER_2)
              ? 'opacity-100'
              : 'opacity-50 grayscale'
          }`}
          style={{ bottom: `${getTierPosition(TIER_2)}%`, transform: 'translateY(50%)' }}
        >
          <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
            {/* Étoile en fond */}
            <div className="absolute inset-0 flex items-center justify-center">
              <TemporalStar
                size={60}
                className={`transition-all duration-500 ${
                  isTierReached(TIER_2) ? 'drop-shadow-[0_0_15px_rgba(139,92,246,0.9)]' : ''
                }`}
                color={isTierReached(TIER_2) ? '#8b5cf6' : (darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)')}
                strokeWidth={0}
              />
            </div>
            {/* Contenu centré */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <span
                className={`text-sm md:text-base font-bold transition-all duration-500 ${
                  isTierReached(TIER_2)
                    ? 'text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]'
                    : darkMode
                      ? 'text-white/40'
                      : 'text-black/30'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                150€
              </span>
              <span
                className={`text-[8px] md:text-[9px] uppercase tracking-wider transition-all duration-500 ${
                  isTierReached(TIER_2)
                    ? 'text-white/90 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]'
                    : darkMode
                      ? 'text-white/30'
                      : 'text-black/20'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                Bonnet
              </span>
            </div>
          </div>
        </button>

        {/* Palier 80€ - Livraison gratuite */}
        <button
          onClick={scrollToContests}
          className={`absolute right-0 flex items-center justify-center transition-all duration-500 cursor-pointer hover:scale-110 ${
            isTierReached(TIER_1)
              ? 'opacity-100'
              : 'opacity-50 grayscale'
          }`}
          style={{ bottom: `${getTierPosition(TIER_1)}%`, transform: 'translateY(50%)' }}
        >
          <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
            {/* Étoile en fond */}
            <div className="absolute inset-0 flex items-center justify-center">
              <TemporalStar
                size={60}
                className={`transition-all duration-500 ${
                  isTierReached(TIER_1) ? 'drop-shadow-[0_0_15px_rgba(139,92,246,0.9)]' : ''
                }`}
                color={isTierReached(TIER_1) ? '#8b5cf6' : (darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)')}
                strokeWidth={0}
              />
            </div>
            {/* Contenu centré */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <span
                className={`text-sm md:text-base font-bold transition-all duration-500 ${
                  isTierReached(TIER_1)
                    ? 'text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]'
                    : darkMode
                      ? 'text-white/40'
                      : 'text-black/30'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                80€
              </span>
              <span
                className={`text-[7px] md:text-[8px] uppercase tracking-wider transition-all duration-500 ${
                  isTierReached(TIER_1)
                    ? 'text-white/90 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]'
                    : darkMode
                      ? 'text-white/30'
                      : 'text-black/20'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif' }}
              >
                Free
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Jauge */}
      <div className="relative group">
        {/* Gauge container - thermometer style */}
        <div className="relative w-8 md:w-10 h-44 md:h-52">
          {/* Outer border */}
          <div className={`absolute inset-0 rounded-full border-[3px] border-primary backdrop-blur-sm ${darkMode ? 'bg-black/50' : 'bg-white/80'}`} />

          {/* Inner fill container */}
          <div className="absolute inset-[3px] rounded-full overflow-hidden">
            {/* Fill level - couleur unie violet temporal */}
            <div
              className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out ${
                isAnimating ? 'animate-pulse' : ''
              }`}
              style={{ height: `${level}%`, backgroundColor: '#6D28D9' }}
            >
              {/* Wave effect at top - couleur plus claire */}
              {level < 100 && level > 0 && (
                <div className="absolute -top-1 left-0 w-[200%] animate-wave">
                  <svg
                    viewBox="0 0 120 8"
                    className="w-full h-2"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,4 Q7.5,0 15,4 T30,4 T45,4 T60,4 T75,4 T90,4 T105,4 T120,4 L120,8 L0,8 Z"
                      fill="#6D28D9"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Tier markers */}
          <div
            className={`absolute left-0 right-0 h-[2px] transition-all duration-500 ${
              isTierReached(TIER_1)
                ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                : darkMode
                  ? 'bg-white/70'
                  : 'bg-primary/50'
            }`}
            style={{ bottom: `${getTierPosition(TIER_1)}%` }}
          />
          <div
            className={`absolute left-0 right-0 h-[2px] transition-all duration-500 ${
              isTierReached(TIER_2)
                ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                : darkMode
                  ? 'bg-white/70'
                  : 'bg-primary/50'
            }`}
            style={{ bottom: `${getTierPosition(TIER_2)}%` }}
          />
          <div
            className={`absolute left-0 right-0 h-[2px] transition-all duration-500 ${
              isTierReached(TIER_3)
                ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                : darkMode
                  ? 'bg-white/70'
                  : 'bg-primary/50'
            }`}
            style={{ bottom: `${getTierPosition(TIER_3)}%` }}
          />

          {/* Glass reflection */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 via-transparent to-transparent pointer-events-none" />

          {/* Highlight shine */}
          <div className="absolute top-4 left-2 w-1.5 h-8 bg-white/30 rounded-full blur-[1px]" />
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/20 blur-xl -z-10" />

        {/* Remaining amount indicator */}
        {remaining > 0 && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
            <span
              className={`text-[10px] md:text-xs font-bold ${darkMode ? 'text-white/80' : 'text-foreground/80'}`}
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              {language === 'fr' ? `Il reste ${Math.round(remaining)}€` : `${Math.round(remaining)}€ left`}
            </span>
          </div>
        )}
        {nextTier === 'max' && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
            <span
              className="text-[10px] md:text-xs font-bold text-primary"
              style={{ fontFamily: '"Bebas Neue", sans-serif' }}
            >
              MAX
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
