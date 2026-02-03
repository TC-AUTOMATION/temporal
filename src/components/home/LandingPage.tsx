'use client';

import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import TemporalLogo from '@/components/ui/TemporalLogo';
import TemporalStar from '@/components/ui/TemporalStar';
import Starfield from '@/components/ui/Starfield';
import { useStore } from '@/stores/useStore';
import { useAdminStore } from '@/stores/useAdminStore';
import { translations } from '@/lib/translations';

interface LandingPageProps {
  onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { language } = useStore();
  const { countdownDate } = useAdminStore();
  const t = translations[language];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const targetDate = new Date(countdownDate).getTime();
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [countdownDate]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'temporal') {
      onEnter();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      <Starfield />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        {/* Logo */}
        <div className={`mb-12 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          <TemporalLogo size={120} />
        </div>

        {/* Star decoration */}
        <div className={`mb-6 transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <TemporalStar size={24} />
        </div>

        {/* Title */}
        <div className={`text-center mb-10 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <h1
            className="text-4xl md:text-6xl text-white uppercase leading-none mb-4"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            {t.firstDrop}
          </h1>
          <p className="text-white/40 text-sm tracking-widest">
            {t.discoverCollection}
          </p>
        </div>

        {/* Countdown */}
        <div className={`mb-12 transition-all duration-1000 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="flex items-center gap-4 md:gap-8">
            {[
              { value: countdown.days, label: language === 'fr' ? 'J' : 'D' },
              { value: countdown.hours, label: 'H' },
              { value: countdown.minutes, label: 'M' },
              { value: countdown.seconds, label: 'S' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div
                  className="text-5xl md:text-7xl text-white"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {String(item.value).padStart(2, '0')}
                </div>
                <div
                  className="text-white/30 text-xs tracking-widest mt-1"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Password form */}
        <div className={`w-full max-w-md transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.password}
                className={`w-full px-12 py-4 bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors text-center tracking-widest`}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-red-500 text-xs text-center tracking-widest">
                {language === 'fr' ? 'Mot de passe incorrect' : 'Incorrect password'}
              </p>
            )}
            <button
              type="submit"
              className="w-full py-4 bg-primary text-white uppercase tracking-widest hover:bg-primary/90 transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.2em' }}
            >
              {t.enter}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className={`relative z-10 pb-8 flex justify-center transition-all duration-1000 delay-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-px bg-white/10" />
          <span
            className="text-white/20 text-[10px] tracking-widest"
            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
          >
            TEMPORAL 2026
          </span>
          <div className="w-8 h-px bg-white/10" />
        </div>
      </div>
    </div>
  );
}
