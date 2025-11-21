'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';

export default function ProfilePage() {
  const { language, darkMode } = useStore();
  const t = translations[language];
  const [step, setStep] = useState<'email' | 'code' | 'profile'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setStep('code');
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code) setStep('profile');
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <MarqueeBanner />
        <Header showLogo />
        <Sidebar />
        <CartDrawer />

        <div className="max-w-md mx-auto px-4 py-12">
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <h1 className="text-2xl font-bold text-center mb-8">Connexion</h1>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.email}
                  className={`w-full px-4 py-3 pr-12 border rounded ${
                    darkMode
                      ? 'bg-black border-white/30 text-white'
                      : 'bg-white border-black/30 text-black'
                  }`}
                  required
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B2D8E]"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <h1 className="text-2xl font-bold text-center mb-4">Vérification</h1>
              <p className="text-center opacity-70 mb-8">
                Un code a été envoyé à {email}
              </p>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Code de vérification"
                className={`w-full px-4 py-3 border rounded text-center text-2xl tracking-widest ${
                  darkMode
                    ? 'bg-black border-white/30 text-white'
                    : 'bg-white border-black/30 text-black'
                }`}
                maxLength={6}
                required
              />
              <button
                type="submit"
                className="w-full py-3 bg-[#5B2D8E] text-white font-medium hover:opacity-90"
              >
                Vérifier
              </button>
            </form>
          )}

          {step === 'profile' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-center mb-8">Mon Profil</h1>

              <div className="space-y-4">
                <div className={`p-4 border rounded ${darkMode ? 'border-white/20' : 'border-black/20'}`}>
                  <h3 className="font-medium mb-2">Informations personnelles</h3>
                  <p className="text-sm opacity-70">Gérer vos coordonnées</p>
                </div>

                <div className={`p-4 border rounded ${darkMode ? 'border-white/20' : 'border-black/20'}`}>
                  <h3 className="font-medium mb-2">Mes commandes</h3>
                  <p className="text-sm opacity-70">Voir l'historique des commandes</p>
                </div>

                <div className={`p-4 border rounded ${darkMode ? 'border-white/20' : 'border-black/20'}`}>
                  <h3 className="font-medium mb-2">Favoris</h3>
                  <p className="text-sm opacity-70">Vos articles sauvegardés</p>
                </div>

                <div className={`p-4 border rounded ${darkMode ? 'border-white/20' : 'border-black/20'}`}>
                  <h3 className="font-medium mb-2">Adresses</h3>
                  <p className="text-sm opacity-70">Gérer vos adresses de livraison</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
