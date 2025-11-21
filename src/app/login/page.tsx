'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TemporalLogo from '@/components/ui/TemporalLogo';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const { language } = useStore();
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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="rounded-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <TemporalLogo size={60} />
              </div>
              {step === 'email' ? (
                <>
                  <CardTitle className="text-2xl">Se connecter</CardTitle>
                  <CardDescription>Choisir votre méthode de connexion</CardDescription>
                </>
              ) : (
                <>
                  <CardTitle className="text-2xl">Saisissez le code</CardTitle>
                  <CardDescription>Envoyé à {email}</CardDescription>
                </>
              )}
            </CardHeader>

            <CardContent>
              {step === 'email' ? (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Adresse e-mail"
                    required
                    autoFocus
                  />
                  <Button type="submit" className="w-full">
                    Continuer
                  </Button>
                </form>
              ) : (
                <>
                  <form onSubmit={handleCodeSubmit} className="space-y-4">
                    <Input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Code à six chiffres"
                      required
                      autoFocus
                      maxLength={6}
                      className="text-center tracking-widest text-lg"
                    />
                    <Button type="submit" disabled={code.length !== 6} className="w-full">
                      Soumettre
                    </Button>
                  </form>
                  <Button
                    variant="ghost"
                    onClick={() => setStep('email')}
                    className="w-full mt-4 text-muted-foreground"
                  >
                    Modifier l'adresse e-mail
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="py-6 text-center">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors underline">
            Politique de confidentialité
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors underline">
            Conditions d'utilisation
          </Link>
        </div>
      </div>
    </div>
  );
}
