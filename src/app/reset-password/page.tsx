'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TemporalLogoStatic from '@/components/ui/TemporalLogoStatic';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import Starfield from '@/components/ui/Starfield';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { language, darkMode } = useStore();
  const t = translations[language];

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [devCode, setDevCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        if (data.devCode) {
          setDevCode(data.devCode);
        }
        // Redirect to confirmation page after 2 seconds
        setTimeout(() => {
          router.push(`/reset-password/${email}`);
        }, 2000);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
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
        <Link href="/login">
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
                <TemporalLogoStatic size={80} />
              </div>
              {!success ? (
                <>
                  <h1
                    className={`text-3xl mb-2 ${darkMode ? 'text-white' : 'text-black'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {language === 'fr' ? 'MOT DE PASSE OUBLIÉ' : 'FORGOT PASSWORD'}
                  </h1>
                  <p className="text-muted-foreground">
                    {language === 'fr'
                      ? 'Entrez votre email pour recevoir un code de réinitialisation'
                      : 'Enter your email to receive a reset code'}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <CheckCircle size={60} className="text-green-500" />
                  </div>
                  <h1
                    className={`text-3xl mb-2 ${darkMode ? 'text-white' : 'text-black'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {language === 'fr' ? 'CODE ENVOYÉ' : 'CODE SENT'}
                  </h1>
                  <p className="text-muted-foreground">
                    {language === 'fr' ? 'Vérifiez votre email' : 'Check your email'}
                  </p>
                </>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Dev code display (remove in production) */}
            {devCode && (
              <div className="mb-4 p-3 rounded-lg bg-primary/20 border border-primary/30 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {language === 'fr' ? 'Code de développement' : 'Development code'}
                </p>
                <p className="text-2xl text-primary font-bold tracking-widest">{devCode}</p>
              </div>
            )}

            {/* Form */}
            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={(language === 'fr' ? 'VOTRE EMAIL' : 'YOUR EMAIL')}
                    required
                    autoFocus
                    disabled={isLoading}
                    className={`w-full pl-12 pr-4 py-4 rounded-full border-2 transition-all focus:outline-none focus:border-primary disabled:opacity-50 ${
                      darkMode
                        ? 'bg-white/5 border-white/20 text-white placeholder:text-white/40'
                        : 'bg-black/5 border-black/10 text-black placeholder:text-black/40'
                    }`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-full bg-primary text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em', fontSize: '1.1rem' }}
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Mail size={18} />
                  )}
                  {isLoading
                    ? (language === 'fr' ? 'ENVOI...' : 'SENDING...')
                    : (language === 'fr' ? 'ENVOYER LE CODE' : 'SEND CODE')}
                </button>

                {/* Back to login */}
                <p className={`text-center text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                  {language === 'fr' ? 'Vous vous souvenez ?' : 'Remember your password?'}{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    {language === 'fr' ? 'Se connecter' : 'Sign in'}
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
