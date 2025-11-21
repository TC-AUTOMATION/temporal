'use client';

import { useState } from 'react';
import Link from 'next/link';
import TemporalLogo from '@/components/ui/TemporalLogo';
import { useStore } from '@/stores/useStore';

export default function ProfilePage() {
  const [email, setEmail] = useState('');
  const { darkMode } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-black' : 'bg-gray-100'}`}>
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-lg p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <TemporalLogo size={60} className="text-primary" />
          </div>

          {/* Title */}
          <h1
            className="text-2xl text-black mb-2"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
          >
            Se connecter
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Choisir votre méthode de connexion
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Adresse e-mail"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-primary"
              required
            />

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-lg transition-opacity hover:opacity-90"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em', fontSize: '1rem' }}
            >
              Continuer
            </button>
          </form>
        </div>
      </div>

      {/* Footer links */}
      <div className={`py-6 flex justify-center gap-6 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
        <Link href="/privacy" className={`transition-colors ${darkMode ? 'hover:text-white' : 'hover:text-black'}`}>
          Politique de confidentialité
        </Link>
        <Link href="/terms" className={`transition-colors ${darkMode ? 'hover:text-white' : 'hover:text-black'}`}>
          Conditions d'utilisation
        </Link>
      </div>
    </div>
  );
}
