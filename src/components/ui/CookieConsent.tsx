'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';

export default function CookieConsent() {
  const { language } = useStore();
  const t = translations[language];
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('temporal-cookie-consent');
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('temporal-cookie-consent', 'accepted');
    handleClose();
  };

  const handleReject = () => {
    localStorage.setItem('temporal-cookie-consent', 'rejected');
    handleClose();
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] transition-all duration-300 ${
        isClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="bg-background border-t-2 border-primary shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Content */}
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                {t.cookieTitle}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t.cookieDescription}{' '}
                <Link href="/cookies" className="text-primary hover:underline font-medium">
                  {t.cookiePolicyLink}
                </Link>
                .
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {t.cookiePreferencesNote}{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  {t.learnMore}
                </Link>
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleReject}
                className="px-6 py-3 border-2 border-border hover:border-primary bg-background text-foreground font-bold transition-all duration-200 hover:scale-105"
                style={{ fontFamily: 'Bebas Neue, sans-serif' }}
              >
                {t.decline}
              </button>
              <button
                onClick={handleAccept}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold transition-all duration-200 hover:scale-105 shadow-lg"
                style={{ fontFamily: 'Bebas Neue, sans-serif' }}
              >
                {t.accept}
              </button>
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 p-2 hover:bg-muted rounded-full transition-colors"
                aria-label={t.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Additional Links */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <Link href="/cookies" className="hover:text-primary transition-colors">
                {t.cookiePolicyLink}
              </Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">
                {t.privacyPolicy}
              </Link>
              <Link href="/legal" className="hover:text-primary transition-colors">
                {t.legalNotices}
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                {t.termsAndConditions}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
