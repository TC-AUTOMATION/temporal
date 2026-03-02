'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Sparkles, Gift } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import TemporalLogoStatic from './TemporalLogoStatic';

export default function NewsletterPopup() {
  const { language, darkMode } = useStore();
  const t = translations[language];
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if popup was already shown this session
    const popupShown = sessionStorage.getItem('temporal-newsletter-popup-shown');
    if (popupShown) return;

    // Show popup after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      // Mark as shown for this session only
      sessionStorage.setItem('temporal-newsletter-popup-shown', 'true');
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // TODO: Implement actual newsletter subscription API
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsSuccess(true);
      localStorage.setItem('temporal-newsletter-popup-shown', 'true');

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-md transition-all duration-300 ${
          isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div
          className={`relative overflow-hidden ${
            darkMode ? 'bg-black border border-white/20' : 'bg-white border border-black/10'
          }`}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute -top-1/2 -right-1/4 w-[80%] h-[200%] opacity-20 blur-3xl"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.6) 0%, transparent 70%)',
              }}
            />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center z-10 transition-all hover:scale-110 ${
              darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
            }`}
          >
            <X size={16} />
          </button>

          {/* Content */}
          <div className="relative p-8 text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <TemporalLogoStatic size={60} />
            </div>

            {isSuccess ? (
              <>
                {/* Success state */}
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                  <Sparkles size={32} className="text-primary" />
                </div>
                <h2
                  className="text-2xl mb-2"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {t.newsletterSuccessTitle}
                </h2>
                <p className={`${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                  {t.newsletterSuccessMessage}
                </p>
              </>
            ) : (
              <>
                {/* Form state */}
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                  <Gift size={32} className="text-primary" />
                </div>

                <h2
                  className="text-2xl md:text-3xl mb-2"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {t.newsletterTitle}
                </h2>

                <p className={`mb-6 ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                  {t.newsletterSubtitle}
                </p>

                {/* Perks */}
                <div className="flex justify-center gap-6 mb-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-primary" />
                    <span className={darkMode ? 'text-white/70' : 'text-black/70'}>
                      {t.newsletterExclusiveDrops}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift size={14} className="text-primary" />
                    <span className={darkMode ? 'text-white/70' : 'text-black/70'}>
                      {t.newsletterFirstOrderDiscount}
                    </span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.newsletterEmailPlaceholder}
                      required
                      className={`w-full pl-12 pr-4 py-3 border-2 transition-all ${
                        darkMode
                          ? 'bg-white/5 border-white/20 focus:border-primary text-white'
                          : 'bg-black/5 border-black/10 focus:border-primary'
                      }`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-primary text-white font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}
                  >
                    {isSubmitting ? t.newsletterSubscribing : t.newsletterSubscribe}
                  </button>
                </form>

                <p className={`mt-4 text-xs ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                  {t.newsletterDisclaimer}
                </p>
              </>
            )}
          </div>

          {/* Bottom accent */}
          <div className="h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
        </div>
      </div>
    </>
  );
}
