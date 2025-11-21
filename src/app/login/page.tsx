'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TemporalLogo from '@/components/ui/TemporalLogo';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import Link from 'next/link';
import { Mail, ArrowLeft, Zap, Lock } from 'lucide-react';
import Starfield from '@/components/ui/Starfield';

export default function LoginPage() {
  const router = useRouter();
  const { language, darkMode } = useStore();
  const t = translations[language];

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStep('code');
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      router.push('/');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden ${darkMode ? 'dark bg-black' : 'bg-white'}`}>
      {/* Starfield background */}
      <div className="absolute inset-0 z-0">
        <Starfield />
      </div>

      {/* Back button */}
      <div className="relative z-10 p-4">
        <Link href="/">
          <button
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
              darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-black'
            }`}
          >
            <ArrowLeft size={20} />
          </button>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Card */}
          <div
            className={`rounded-[2rem] p-8 ${
              darkMode
                ? 'bg-black/80 border border-white/10 backdrop-blur-xl'
                : 'bg-white/80 border border-black/10 backdrop-blur-xl'
            }`}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <TemporalLogo size={80} />
              </div>
              {step === 'email' ? (
                <>
                  <h1
                    className={`text-3xl mb-2 ${darkMode ? 'text-white' : 'text-black'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    SE CONNECTER
                  </h1>
                  <p className="text-muted-foreground">
                    Entre dans l'univers Temporal
                  </p>
                </>
              ) : (
                <>
                  <h1
                    className={`text-3xl mb-2 ${darkMode ? 'text-white' : 'text-black'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    CODE DE VÉRIFICATION
                  </h1>
                  <p className="text-muted-foreground">
                    Envoyé à {email}
                  </p>
                </>
              )}
            </div>

            {/* Form */}
            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="TON@EMAIL.COM"
                    required
                    autoFocus
                    className={`w-full pl-12 pr-4 py-4 rounded-full border-2 transition-all focus:outline-none focus:border-primary ${
                      darkMode
                        ? 'bg-white/5 border-white/20 text-white placeholder:text-white/40'
                        : 'bg-black/5 border-black/10 text-black placeholder:text-black/40'
                    }`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-primary text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em', fontSize: '1.1rem' }}
                >
                  <Zap size={18} />
                  CONTINUER
                </button>
              </form>
            ) : (
              <>
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      required
                      autoFocus
                      maxLength={6}
                      className={`w-full pl-12 pr-4 py-4 rounded-full border-2 text-center transition-all focus:outline-none focus:border-primary ${
                        darkMode
                          ? 'bg-white/5 border-white/20 text-white placeholder:text-white/40'
                          : 'bg-black/5 border-black/10 text-black placeholder:text-black/40'
                      }`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.5em', fontSize: '1.5rem' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={code.length !== 6}
                    className="w-full py-4 rounded-full bg-primary text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em', fontSize: '1.1rem' }}
                  >
                    <Zap size={18} />
                    VALIDER
                  </button>
                </form>
                <button
                  onClick={() => setStep('email')}
                  className={`w-full mt-4 py-3 rounded-full transition-all ${
                    darkMode ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'
                  }`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  MODIFIER L'ADRESSE EMAIL
                </button>
              </>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className={`flex-1 h-[1px] ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />
              <span
                className="text-muted-foreground text-xs"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                OU
              </span>
              <div className={`flex-1 h-[1px] ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />
            </div>

            {/* Social login */}
            <div className="space-y-3">
              <button
                className={`w-full py-4 rounded-full flex items-center justify-center gap-3 transition-all hover:scale-[1.02] ${
                  darkMode
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-black/5 hover:bg-black/10 text-black'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                CONTINUER AVEC GOOGLE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-6 text-center">
        <div
          className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground"
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
        >
          <Link href="/privacy" className="hover:text-primary transition-colors">
            CONFIDENTIALITÉ
          </Link>
          <Link href="/terms" className="hover:text-primary transition-colors">
            CONDITIONS D'UTILISATION
          </Link>
        </div>
      </div>
    </div>
  );
}
