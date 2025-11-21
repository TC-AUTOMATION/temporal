'use client';

import { useState } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import TemporalLogo from '@/components/ui/TemporalLogo';
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
  const { language } = useStore();
  const t = translations[language];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setShowOptions(true);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check password (for demo, accept "temporal")
    if (password === 'temporal') {
      onEnter();
    }
  };

  if (showPassword) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <TemporalLogo size={60} animate className="mb-12" />
        <form onSubmit={handlePasswordSubmit} className="w-full max-w-md">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full px-4 py-3 bg-transparent border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-[#5B2D8E]"
          />
          <button
            type="submit"
            className="mt-4 w-full py-3 bg-[#5B2D8E] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Entrer
          </button>
        </form>
      </div>
    );
  }

  if (showOptions) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <TemporalLogo size={60} animate className="mb-8" />
        <p className="text-white/60 mb-8 text-center">
          Email enregistré! Choisissez une option:
        </p>
        <div className="w-full max-w-md space-y-4">
          <a
            href="/profile/create"
            className="block w-full py-3 text-center border border-white text-white hover:bg-white hover:text-black transition-colors"
          >
            {t.createAccount}
          </a>
          <button
            onClick={onEnter}
            className="w-full py-3 bg-[#5B2D8E] text-white font-medium hover:opacity-90 transition-opacity"
          >
            {t.enterSite}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top bar with password link */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => setShowPassword(true)}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
        >
          <Lock size={14} />
          <span className="underline">{t.enterPassword}</span>
        </button>
      </div>

      {/* Logo */}
      <div className="flex justify-center pt-4">
        <TemporalLogo size={60} animate />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <h1 className="text-white text-4xl md:text-6xl font-bold text-center mb-6 tracking-tight">
          {t.firstDrop}
        </h1>
        <p className="text-white/60 text-center mb-8 max-w-md">
          {t.signUpEmail}
        </p>

        <form onSubmit={handleEmailSubmit} className="w-full max-w-md">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.email}
              className="w-full px-4 py-3 pr-12 bg-transparent border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-[#5B2D8E]"
              required
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-[#5B2D8E] transition-colors"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
