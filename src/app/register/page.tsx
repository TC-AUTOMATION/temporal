'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/stores/useStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { translations } from '@/lib/translations';
import TemporalLogo from '@/components/ui/TemporalLogo';
import Starfield from '@/components/ui/Starfield';
import { Mail, Lock, User, Zap, Loader2, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

type Step = 'register' | 'verify' | 'success';

export default function RegisterPage() {
  const router = useRouter();
  const { language, darkMode } = useStore();
  const { isAuthenticated, register, verifyEmail, sendVerificationCode, isLoading, error, clearError } = useAuthStore();
  const t = translations[language];

  const [step, setStep] = useState<Step>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    newsletter: true,
  });
  const [code, setCode] = useState('');
  const [formError, setFormError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/profile');
    }
  }, [isAuthenticated, router]);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return t.passwordMinChars;
    }
    return null;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();

    // Validate passwords
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setFormError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError(t.passwordMismatch);
      return;
    }

    const success = await register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      newsletter: formData.newsletter,
    });

    if (success) {
      // Send verification code
      const codeResult = await sendVerificationCode(formData.email);
      if (codeResult?.demoCode) {
        setDemoCode(codeResult.demoCode);
      }
      setStep('verify');
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await verifyEmail(formData.email, code);
    if (success) {
      setStep('success');
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    }
  };

  const handleResendCode = async () => {
    clearError();
    const result = await sendVerificationCode(formData.email);
    if (result?.demoCode) {
      setDemoCode(result.demoCode);
    }
  };

  return (
    <div className={`min-h-screen relative ${darkMode ? 'bg-black' : 'bg-white'}`}>
      <Starfield />

      {/* Header */}
      <div className="relative z-10 p-4 flex items-center justify-between">
        <Link href="/">
          <button
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
              darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
            }`}
          >
            <ArrowLeft size={18} className={darkMode ? 'text-white' : 'text-black'} />
          </button>
        </Link>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md">
          {/* Logo and title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <TemporalLogo size={80} />
            </div>
            {step === 'register' && (
              <>
                <h1
                  className={`text-3xl mb-2 ${darkMode ? 'text-white' : 'text-black'}`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {t.createAccount}
                </h1>
                <p className="text-muted-foreground">
                  {t.joinCommunity}
                </p>
              </>
            )}
            {step === 'verify' && (
              <>
                <h1
                  className={`text-3xl mb-2 ${darkMode ? 'text-white' : 'text-black'}`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {t.verificationCode}
                </h1>
                <p className="text-muted-foreground">
                  {t.sentTo} {formData.email}
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
                  {t.accountCreated}
                </h1>
                <p className="text-muted-foreground">
                  {t.redirectingProfile}
                </p>
              </>
            )}
          </div>

          {/* Error message */}
          {(error || formError) && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm text-center">
              {error || formError}
            </div>
          )}

          {/* Demo code display */}
          {demoCode && step === 'verify' && (
            <div className="mb-4 p-3 rounded-lg bg-primary/20 border border-primary/30 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t.demoCodeNotice}</p>
              <p className="text-2xl text-primary font-bold tracking-widest">{demoCode}</p>
            </div>
          )}

          {/* Registration form */}
          {step === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder={t.firstName}
                    required
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
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder={t.lastName}
                    required
                    disabled={isLoading}
                    className={`w-full px-4 py-4 rounded-full border-2 transition-all focus:outline-none focus:border-primary disabled:opacity-50 ${
                      darkMode
                        ? 'bg-white/5 border-white/20 text-white placeholder:text-white/40'
                        : 'bg-black/5 border-black/10 text-black placeholder:text-black/40'
                    }`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t.email}
                  required
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-4 rounded-full border-2 transition-all focus:outline-none focus:border-primary disabled:opacity-50 ${
                    darkMode
                      ? 'bg-white/5 border-white/20 text-white placeholder:text-white/40'
                      : 'bg-black/5 border-black/10 text-black placeholder:text-black/40'
                  }`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t.passwordPlaceholder}
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

              {/* Confirm Password */}
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder={t.confirmPasswordPlaceholder}
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Newsletter */}
              <label className={`flex items-center gap-3 cursor-pointer ${darkMode ? 'text-white/70' : 'text-black/70'}`}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  formData.newsletter
                    ? 'bg-primary border-primary'
                    : darkMode ? 'border-white/30' : 'border-black/30'
                }`}>
                  {formData.newsletter && <CheckCircle size={12} className="text-white" />}
                </div>
                <input
                  type="checkbox"
                  checked={formData.newsletter}
                  onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
                  className="sr-only"
                />
                <span className="text-sm">
                  {t.receiveNewsletter}
                </span>
              </label>

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
                {isLoading ? t.creating : t.createMyAccount}
              </button>

              {/* Login link */}
              <p className={`text-center text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                {t.alreadyHaveAccount}{' '}
                <Link href="/login" className="text-primary hover:underline">
                  {t.signIn}
                </Link>
              </p>
            </form>
          )}

          {/* Verification form */}
          {step === 'verify' && (
            <>
              <form onSubmit={handleVerifySubmit} className="space-y-4">
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
                    setStep('register');
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
  );
}
