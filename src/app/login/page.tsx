'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TemporalLogoStatic from '@/components/ui/TemporalLogoStatic';
import { useStore } from '@/stores/useStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { translations } from '@/lib/translations';
import Link from 'next/link';
import { Mail, ArrowLeft, Zap, Lock, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Starfield from '@/components/ui/Starfield';

type LoginMode = 'password' | 'otp';
type Step = 'login' | 'code' | 'success';

export default function LoginPage() {
  const router = useRouter();
  const { language, darkMode } = useStore();
  const {
    isAuthenticated,
    isLoading,
    pendingEmail,
    demoCode,
    error,
    login,
    sendVerificationCode,
    verifyCode,
    clearError
  } = useAuthStore();
  const t = translations[language];

  const [mode, setMode] = useState<LoginMode>('password');
  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/profile');
    }
  }, [isAuthenticated, router]);

  // Update step based on pendingEmail (for OTP mode)
  useEffect(() => {
    if (pendingEmail && step === 'login' && mode === 'otp') {
      setStep('code');
    }
  }, [pendingEmail, step, mode]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await login(email, password);
    if (success) {
      setStep('success');
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    }
  };

  const handleOTPRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await sendVerificationCode(email);
    if (success) {
      setStep('code');
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await verifyCode(pendingEmail || email, code);
    if (success) {
      setStep('success');
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    }
  };

  const handleResendCode = async () => {
    clearError();
    await sendVerificationCode(pendingEmail || email);
  };

  const switchToOTP = () => {
    setMode('otp');
    setPassword('');
    clearError();
  };

  const switchToPassword = () => {
    setMode('password');
    setCode('');
    setStep('login');
    clearError();
  };

  if (isAuthenticated) {
    return null;
  }

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
                <TemporalLogoStatic size={80} />
              </div>
              {step === 'login' && (
                <>
                  <h1
                    className={`text-3xl mb-2 ${darkMode ? 'text-white' : 'text-black'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {t.signIn}
                  </h1>
                  <p className="text-muted-foreground">
                    {t.enterTemporalUniverse}
                  </p>
                </>
              )}
              {step === 'code' && (
                <>
                  <h1
                    className={`text-3xl mb-2 ${darkMode ? 'text-white' : 'text-black'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {t.verificationCode}
                  </h1>
                  <p className="text-muted-foreground">
                    {t.sentTo} {pendingEmail || email}
                  </p>
                </>
              )}
              {step === 'success' && (
                <>
                  <div className="flex justify-center mb-4">
                    <CheckCircle size={60} className="text-green-500" />
                  </div>
                  <h1
                    className={`text-3xl mb-2 ${darkMode ? 'text-white' : 'text-black'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {t.loginSuccessful}
                  </h1>
                  <p className="text-muted-foreground">
                    {t.redirectingProfile}
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

            {/* Demo code display (remove in production) */}
            {demoCode && step === 'code' && (
              <div className="mb-4 p-3 rounded-lg bg-primary/20 border border-primary/30 text-center">
                <p className="text-xs text-muted-foreground mb-1">{t.demoCodeNotice}</p>
                <p className="text-2xl text-primary font-bold tracking-widest">{demoCode}</p>
              </div>
            )}

            {/* Login Form - Password Mode */}
            {step === 'login' && mode === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.email.toUpperCase()}
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
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.password.toUpperCase()}
                    required
                    disabled={isLoading}
                    className={`w-full pl-12 pr-12 py-4 rounded-full border-2 transition-all focus:outline-none focus:border-primary disabled:opacity-50 ${
                      darkMode
                        ? 'bg-white/5 border-white/20 text-white placeholder:text-white/40'
                        : 'bg-black/5 border-black/10 text-black placeholder:text-black/40'
                    }`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
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
                    <Zap size={18} />
                  )}
                  {isLoading ? t.signingIn : t.signIn}
                </button>

                {/* Forgot password link */}
                <Link href="/reset-password">
                  <button
                    type="button"
                    className={`w-full py-3 rounded-full transition-all text-sm ${
                      darkMode ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-black/60 hover:text-black hover:bg-black/5'
                    }`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {t.forgotPassword}
                  </button>
                </Link>

                {/* Register link */}
                <p className={`text-center text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                  {t.noAccountYet}{' '}
                  <Link href="/register" className="text-primary hover:underline">
                    {t.signUp}
                  </Link>
                </p>
              </form>
            )}

            {/* Login Form - OTP Mode */}
            {step === 'login' && mode === 'otp' && (
              <form onSubmit={handleOTPRequest} className="space-y-4">
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.email.toUpperCase()}
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
                    <Zap size={18} />
                  )}
                  {isLoading ? t.sending : t.getMyCode}
                </button>

                {/* Back to password login */}
                <button
                  type="button"
                  onClick={switchToPassword}
                  className={`w-full py-3 rounded-full transition-all text-sm ${
                    darkMode ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-black/60 hover:text-black hover:bg-black/5'
                  }`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {t.loginWithPassword}
                </button>
              </form>
            )}

            {/* Code verification */}
            {step === 'code' && (
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
                      disabled={isLoading}
                      className={`w-full pl-12 pr-4 py-4 rounded-full border-2 text-center transition-all focus:outline-none focus:border-primary disabled:opacity-50 ${
                        darkMode
                          ? 'bg-white/5 border-white/20 text-white placeholder:text-white/40'
                          : 'bg-black/5 border-black/10 text-black placeholder:text-black/40'
                      }`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.5em', fontSize: '1.5rem' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={code.length !== 6 || isLoading}
                    className="w-full py-4 rounded-full bg-primary text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em', fontSize: '1.1rem' }}
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Zap size={18} />
                    )}
                    {isLoading ? t.verifying : t.validate}
                  </button>
                </form>

                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className={`w-full py-3 rounded-full transition-all ${
                      darkMode ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-black/60 hover:text-black hover:bg-black/5'
                    } disabled:opacity-50`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {t.resendCode}
                  </button>
                  <button
                    onClick={() => {
                      setStep('login');
                      setCode('');
                      clearError();
                    }}
                    disabled={isLoading}
                    className={`w-full py-3 rounded-full transition-all ${
                      darkMode ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-black/60 hover:text-black hover:bg-black/5'
                    } disabled:opacity-50`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    {t.changeEmail}
                  </button>
                </div>
              </>
            )}

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
            {t.privacy}
          </Link>
          <Link href="/terms" className="hover:text-primary transition-colors">
            {t.terms}
          </Link>
        </div>
      </div>
    </div>
  );
}
