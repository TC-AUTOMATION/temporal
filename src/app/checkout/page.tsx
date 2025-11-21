'use client';

import { useState } from 'react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import TemporalLogo from '@/components/ui/TemporalLogo';
import { Truck, Package, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

type DeliveryMethod = null | 'delivery' | 'handDelivery';

export default function CheckoutPage() {
  const { language, cart, cartTotal, clearCart } = useStore();
  const t = translations[language];
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(null);
  const [step, setStep] = useState<'delivery' | 'payment' | 'confirmed'>('delivery');
  const [promoCode, setPromoCode] = useState('');
  const [newsletter, setNewsletter] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
  });

  const total = cartTotal();
  const shippingCost = deliveryMethod === 'handDelivery' ? 0 : 5.9;
  const finalTotal = total + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirmed');
    clearCart();
  };

  if (step === 'confirmed') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <Check size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4">{t.orderConfirmed}</h1>
          <p className="text-center text-muted-foreground max-w-md mb-4">{t.preparingOrder}</p>
          <Button asChild variant="link">
            <Link href="/">Retour à la boutique</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'delivery') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Header with logo */}
        <div className="border-b border-border py-4">
          <div className="max-w-6xl mx-auto px-4 flex justify-center">
            <Link href="/">
              <TemporalLogo size={40} />
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left - Delivery options */}
            <div>
              <div className="space-y-4">
                <Card
                  className={`cursor-pointer transition-all ${
                    deliveryMethod === 'delivery' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'
                  }`}
                  onClick={() => setDeliveryMethod('delivery')}
                >
                  <CardContent className="flex items-center gap-4 p-6">
                    <Truck size={40} className="text-primary" />
                    <h3 className="font-bold text-lg">Livraison</h3>
                  </CardContent>
                </Card>

                <div className="text-center text-muted-foreground text-sm">OU</div>

                <Card
                  className={`cursor-pointer transition-all ${
                    deliveryMethod === 'handDelivery' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'
                  }`}
                  onClick={() => setDeliveryMethod('handDelivery')}
                >
                  <CardContent className="flex items-center gap-4 p-6">
                    <Package size={40} className="text-primary" />
                    <h3 className="font-bold text-lg">En main propre</h3>
                  </CardContent>
                </Card>
              </div>

              {/* Footer links */}
              <Separator className="my-8" />
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <Link href="/refund" className="underline hover:text-foreground">Politique de remboursement</Link>
                <Link href="/shipping" className="underline hover:text-foreground">Expédition</Link>
                <Link href="/privacy" className="underline hover:text-foreground">Politique de confidentialité</Link>
                <Link href="/terms" className="underline hover:text-foreground">Conditions d'utilisation</Link>
              </div>
            </div>

            {/* Right - Order summary */}
            <Card>
              <CardContent className="p-6">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4 mb-4">
                    <div className="w-16 h-16 bg-secondary rounded relative overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{item.name}</h3>
                      <Badge variant="secondary">Taille : {item.size}</Badge>
                    </div>
                  </div>
                ))}

                {/* Promo code */}
                <div className="flex gap-2 mb-6">
                  <Input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Code de réduction"
                  />
                  <Button variant="secondary">Valider</Button>
                </div>

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="text-primary font-medium">{total.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expédition</span>
                    <span className="text-muted-foreground">
                      {deliveryMethod ? (shippingCost === 0 ? 'Gratuit' : `${shippingCost.toFixed(2)} €`) : 'Sélectionnez une méthode'}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total</span>
                    <span>{finalTotal.toFixed(2)} €</span>
                  </div>
                </div>

                <Button
                  onClick={() => deliveryMethod && setStep('payment')}
                  disabled={!deliveryMethod}
                  className="w-full mt-6"
                  size="lg"
                >
                  Continuer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Payment step
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with logo */}
      <div className="border-b border-border py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-center">
          <Link href="/">
            <TemporalLogo size={40} />
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Form */}
          <div>
            {/* Express payment */}
            <div className="mb-8">
              <p className="text-center text-muted-foreground mb-4">Paiement express</p>
              <div className="grid grid-cols-2 gap-4">
                <Button className="py-6">shop</Button>
                <Button variant="secondary" className="py-6"> Pay</Button>
              </div>
            </div>

            <div className="text-center text-muted-foreground text-sm mb-8">OU</div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">Contact</h3>
                  <Button variant="link" asChild className="p-0 h-auto">
                    <Link href="/login">Se connecter</Link>
                  </Button>
                </div>
                <Input
                  type="email"
                  placeholder="Adresse e-mail"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <label className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  Envoyez-moi des nouvelles et des offres par e-mail
                </label>
              </div>

              {/* Livraison */}
              <div>
                <h3 className="font-bold mb-2">Livraison</h3>
                <div className="space-y-3">
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-md bg-background"
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="text"
                      placeholder="Prénom"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                    <Input
                      type="text"
                      placeholder="Nom"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                  {deliveryMethod === 'delivery' && (
                    <>
                      <Input
                        type="text"
                        placeholder="Adresse"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="text"
                          placeholder="Ville"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          required
                        />
                        <Input
                          type="text"
                          placeholder="Code postal"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          required
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Payer {finalTotal.toFixed(2)} €
              </Button>
            </form>

            {/* Footer links */}
            <Separator className="my-8" />
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <Link href="/refund" className="underline hover:text-foreground">Politique de remboursement</Link>
              <Link href="/shipping" className="underline hover:text-foreground">Expédition</Link>
              <Link href="/privacy" className="underline hover:text-foreground">Politique de confidentialité</Link>
              <Link href="/terms" className="underline hover:text-foreground">Conditions d'utilisation</Link>
            </div>
          </div>

          {/* Right - Order summary */}
          <Card className="h-fit">
            <CardContent className="p-6">
              {cart.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-4 mb-4">
                  <div className="w-16 h-16 bg-secondary rounded relative overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{item.name}</h3>
                    <Badge variant="secondary">Taille : {item.size}</Badge>
                  </div>
                </div>
              ))}

              {/* Promo code */}
              <div className="flex gap-2 mb-6">
                <Input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Code de réduction"
                />
                <Button variant="secondary">Valider</Button>
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="text-primary font-medium">{total.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expédition</span>
                  <span className="text-muted-foreground">
                    {shippingCost === 0 ? 'Gratuit' : `${shippingCost.toFixed(2)} €`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span>{finalTotal.toFixed(2)} €</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
