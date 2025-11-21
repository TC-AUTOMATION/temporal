'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';
import TemporalLogo from '@/components/ui/TemporalLogo';
import Starfield from '@/components/ui/Starfield';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';

interface LandingPageProps {
  onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { language } = useStore();
  const t = translations[language];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setShowOptions(true);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'temporal') {
      onEnter();
    }
  };

  if (showPassword) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <Starfield />

        <div className="relative z-10 w-full max-w-md">
          <div className="flex justify-center mb-12">
            <TemporalLogo size={80} />
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full px-6 py-4 bg-gray-100 border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-[#5B2D8E] transition-colors text-center tracking-widest rounded-lg"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#5B2D8E] text-white font-bold uppercase tracking-wider hover:bg-[#7B4DB0] transition-colors rounded-lg"
            >
              Entrer
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showOptions) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <Starfield />

        <div className="relative z-10 w-full max-w-md text-center">
          <div className="flex justify-center mb-8">
            <TemporalLogo size={80} />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
            <Sparkles className="w-8 h-8 text-[#5B2D8E] mx-auto mb-4" />
            <p className="text-gray-700 mb-8 text-lg">
              Email enregistré avec succès!
            </p>

            <div className="space-y-4">
              <a
                href="/profile/create"
                className="block w-full py-3 border-2 border-[#5B2D8E] text-[#5B2D8E] font-bold uppercase tracking-wider rounded-lg hover:bg-[#5B2D8E] hover:text-white transition-colors"
              >
                {t.createAccount}
              </a>
              <button
                onClick={onEnter}
                className="w-full py-3 bg-[#5B2D8E] text-white font-bold uppercase tracking-wider hover:bg-[#7B4DB0] transition-colors rounded-lg"
              >
                {t.enterSite}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Starfield background */}
      <Starfield />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white/80 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#5B2D8E]/5 via-transparent to-[#5B2D8E]/5 pointer-events-none" />

      {/* Top bar with password link */}
      <div className={`relative z-20 flex justify-end p-6 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={() => setShowPassword(true)}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-800 text-xs tracking-wider transition-colors group"
        >
          <Lock size={12} className="group-hover:text-[#5B2D8E] transition-colors" />
          <span>{t.enterPassword}</span>
        </button>
      </div>

      {/* Logo */}
      <div className={`relative z-10 flex justify-center pt-4 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
        <TemporalLogo size={60} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        {/* Title */}
        <div className={`text-center mb-12 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#5B2D8E]" />
            <Sparkles className="w-5 h-5 text-[#5B2D8E]" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#5B2D8E]" />
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-black uppercase tracking-tight leading-none mb-6">
            {t.firstDrop}
          </h1>

          <p className="text-gray-500 text-sm md:text-base tracking-widest max-w-md mx-auto">
            {t.signUpEmail}
          </p>
        </div>

        {/* Email form */}
        <form
          onSubmit={handleEmailSubmit}
          className={`w-full max-w-lg transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#5B2D8E]/30 via-[#7B4DB0]/30 to-[#5B2D8E]/30 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.email}
                className="flex-1 px-6 py-4 bg-gray-100 border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-[#5B2D8E] transition-all text-base rounded-l-lg"
                required
              />
              <button
                type="submit"
                className="px-8 bg-[#5B2D8E] text-white font-bold uppercase tracking-wider hover:bg-[#7B4DB0] transition-colors flex items-center gap-2 rounded-r-lg"
              >
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </form>

        {/* Bottom decoration */}
        <div className={`mt-16 flex items-center gap-2 transition-all duration-1000 delay-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <div className="w-1 h-1 bg-[#5B2D8E] rounded-full" />
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>

      {/* Side text */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:block">
        <p
          className="text-gray-200 text-[10px] tracking-[0.5em] uppercase font-light"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Premium Streetwear
        </p>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:block">
        <p
          className="text-gray-200 text-[10px] tracking-[0.5em] uppercase font-light"
          style={{ writingMode: 'vertical-rl' }}
        >
          Limited Edition
        </p>
      </div>
    </div>
  );
}
