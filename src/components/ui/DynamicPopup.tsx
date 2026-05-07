'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Sparkles, Gift, Bell, AlertTriangle, ShoppingBag, Loader2 } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import TemporalLogoStatic from './TemporalLogoStatic';
import Link from 'next/link';

interface Popup {
  id: string;
  type: 'NEWSLETTER' | 'DELIVERY_ISSUE' | 'NEW_DROP';
  isActive: boolean;
  titleFr: string;
  titleEn: string;
  subtitleFr: string | null;
  subtitleEn: string | null;
  buttonTextFr: string | null;
  buttonTextEn: string | null;
  contentFr: string | null;
  contentEn: string | null;
  linkUrl: string | null;
  image: string | null;
  images: string[] | null;
  showDelay: number;
  showOnce: boolean;
}

export default function DynamicPopup() {
  const { language, darkMode } = useStore();
  const t = translations[language];
  const [popup, setPopup] = useState<Popup | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    fetchActivePopup();
  }, []);

  const fetchActivePopup = async () => {
    try {
      const response = await fetch('/api/popups?active=true');
      const data = await response.json();

      if (response.ok && data.data) {
        const activePopup = data.data;

        // Check if this popup was already shown (based on popup id and showOnce setting)
        const shownKey = `temporal-popup-${activePopup.id}-shown`;
        const wasShown = activePopup.showOnce
          ? sessionStorage.getItem(shownKey)
          : false;

        if (wasShown) return;

        setPopup(activePopup);

        // Show popup after delay
        setTimeout(() => {
          setIsVisible(true);
        }, activePopup.showDelay || 5000);
      }
    } catch (err) {
      console.error('Error fetching popup:', err);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      if (popup) {
        sessionStorage.setItem(`temporal-popup-${popup.id}-shown`, 'true');
      }
    }, 300);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'popup' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      setIsSuccess(true);
      localStorage.setItem('temporal-newsletter-subscribed', 'true');

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build gallery: prefer images array, fallback to legacy single image
  const gallery: string[] = popup
    ? popup.images && popup.images.length > 0
      ? popup.images
      : popup.image
        ? [popup.image]
        : []
    : [];

  // Auto-rotate gallery if more than one image
  useEffect(() => {
    if (!isVisible || gallery.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % gallery.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isVisible, gallery.length]);

  if (!isVisible || !popup) return null;

  const title = language === 'fr' ? popup.titleFr : popup.titleEn;
  const subtitle = language === 'fr' ? popup.subtitleFr : popup.subtitleEn;
  const content = language === 'fr' ? popup.contentFr : popup.contentEn;
  const buttonText = language === 'fr' ? popup.buttonTextFr : popup.buttonTextEn;

  const getIcon = () => {
    switch (popup.type) {
      case 'NEWSLETTER':
        return <Gift size={32} className="text-primary" />;
      case 'DELIVERY_ISSUE':
        return <AlertTriangle size={32} className="text-orange-500" />;
      case 'NEW_DROP':
        return <Sparkles size={32} className="text-green-500" />;
      default:
        return <Bell size={32} className="text-primary" />;
    }
  };

  const getIconBg = () => {
    switch (popup.type) {
      case 'NEWSLETTER':
        return 'bg-primary/20';
      case 'DELIVERY_ISSUE':
        return 'bg-orange-500/20';
      case 'NEW_DROP':
        return 'bg-green-500/20';
      default:
        return 'bg-primary/20';
    }
  };

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
                background: popup.type === 'DELIVERY_ISSUE'
                  ? 'radial-gradient(ellipse at center, rgba(249, 115, 22, 0.6) 0%, transparent 70%)'
                  : popup.type === 'NEW_DROP'
                    ? 'radial-gradient(ellipse at center, rgba(34, 197, 94, 0.6) 0%, transparent 70%)'
                    : 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.6) 0%, transparent 70%)',
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
              <TemporalLogoStatic size={50} />
            </div>

            {/* Image / Carousel (optional) */}
            {gallery.length > 0 && (
              <div className="mb-6 -mx-8 -mt-4 relative">
                {gallery.length === 1 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={gallery[0]}
                    alt={title}
                    className="w-full h-48 md:h-56 object-cover"
                  />
                ) : (
                  <>
                    <div className="relative w-full h-48 md:h-56 overflow-hidden">
                      {gallery.map((src, idx) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={`${src}-${idx}`}
                          src={src}
                          alt={title}
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                            idx === currentImageIdx ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      ))}
                    </div>
                    {/* Dots */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {gallery.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentImageIdx(idx)}
                          aria-label={`Image ${idx + 1}`}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentImageIdx
                              ? 'bg-white scale-125'
                              : 'bg-white/50 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Newsletter Success State */}
            {popup.type === 'NEWSLETTER' && isSuccess ? (
              <>
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
                {/* Icon */}
                <div className={`w-16 h-16 mx-auto mb-4 ${getIconBg()} rounded-full flex items-center justify-center`}>
                  {getIcon()}
                </div>

                {/* Title */}
                <h2
                  className="text-2xl md:text-3xl mb-2"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {title}
                </h2>

                {/* Subtitle */}
                {subtitle && (
                  <p className={`mb-4 ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                    {subtitle}
                  </p>
                )}

                {/* Content */}
                {content && (
                  <p className={`mb-6 text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                    {content}
                  </p>
                )}

                {/* Newsletter Form */}
                {popup.type === 'NEWSLETTER' && (
                  <>
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

                    {/* Error message */}
                    {error && (
                      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                        {error}
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleNewsletterSubmit} className="space-y-4">
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
                        className="w-full py-3 bg-primary text-white font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}
                      >
                        {isSubmitting ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          buttonText || t.newsletterSubscribe
                        )}
                      </button>
                    </form>

                    <p className={`mt-4 text-xs ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                      {t.newsletterDisclaimer}
                    </p>
                  </>
                )}

                {/* Button for other types */}
                {popup.type !== 'NEWSLETTER' && buttonText && (
                  <div className="mt-6">
                    {popup.linkUrl ? (
                      <Link
                        href={popup.linkUrl}
                        onClick={handleClose}
                        className={`inline-block w-full py-3 text-center font-bold transition-all hover:scale-[1.02] ${
                          popup.type === 'NEW_DROP'
                            ? 'bg-green-500 text-white'
                            : popup.type === 'DELIVERY_ISSUE'
                              ? 'bg-orange-500 text-white'
                              : 'bg-primary text-white'
                        }`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}
                      >
                        {buttonText}
                      </Link>
                    ) : (
                      <button
                        onClick={handleClose}
                        className={`w-full py-3 font-bold transition-all hover:scale-[1.02] ${
                          popup.type === 'NEW_DROP'
                            ? 'bg-green-500 text-white'
                            : popup.type === 'DELIVERY_ISSUE'
                              ? 'bg-orange-500 text-white'
                              : 'bg-primary text-white'
                        }`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}
                      >
                        {buttonText}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom accent */}
          <div
            className={`h-1 ${
              popup.type === 'NEW_DROP'
                ? 'bg-gradient-to-r from-green-500 via-green-500/50 to-transparent'
                : popup.type === 'DELIVERY_ISSUE'
                  ? 'bg-gradient-to-r from-orange-500 via-orange-500/50 to-transparent'
                  : 'bg-gradient-to-r from-primary via-primary/50 to-transparent'
            }`}
          />
        </div>
      </div>
    </>
  );
}
