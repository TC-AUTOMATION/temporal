'use client';

import { useState } from 'react';
import { useStore } from '@/stores/useStore';
import { ChevronDown, Package, Truck, RotateCcw, CreditCard, Ruler, Mail, ShieldCheck } from 'lucide-react';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchOverlay from '@/components/layout/SearchOverlay';
import Footer from '@/components/layout/Footer';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  icon: React.ReactNode;
  title: string;
  items: FAQItem[];
}

export default function FAQPage() {
  const { darkMode } = useStore();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const faqCategories: FAQCategory[] = [
    {
      icon: <Package size={24} />,
      title: 'Commandes',
      items: [
        {
          question: 'Comment passer une commande ?',
          answer: 'Parcourez notre boutique, sélectionnez vos articles, choisissez la taille et la couleur, puis ajoutez-les au panier. Une fois prêt, cliquez sur le panier et suivez les étapes de paiement. Vous recevrez un email de confirmation dès que votre commande sera validée.'
        },
        {
          question: 'Puis-je modifier ou annuler ma commande ?',
          answer: 'Vous pouvez modifier ou annuler votre commande tant qu\'elle n\'a pas été expédiée. Contactez-nous rapidement à contact@temporal-clothes.com avec votre numéro de commande. Une fois le colis expédié, vous devrez attendre de le recevoir pour effectuer un retour.'
        },
        {
          question: 'Comment suivre ma commande ?',
          answer: 'Dès l\'expédition de votre commande, vous recevrez un email avec un numéro de suivi. Vous pouvez également suivre votre commande depuis votre compte client dans la section "Mes commandes" ou sur notre page de suivi.'
        },
        {
          question: 'Je n\'ai pas reçu d\'email de confirmation, que faire ?',
          answer: 'Vérifiez d\'abord vos spams. Si vous ne trouvez toujours pas l\'email, connectez-vous à votre compte pour vérifier le statut de votre commande ou contactez-nous avec les détails de votre achat.'
        }
      ]
    },
    {
      icon: <Truck size={24} />,
      title: 'Livraison',
      items: [
        {
          question: 'Quels sont les délais de livraison ?',
          answer: 'Livraison Standard : 3-5 jours ouvrés (4,90€). Livraison Express : 24-48h (9,90€). Point Relais : 3-4 jours ouvrés (3,90€). La livraison est gratuite à partir de 100€ d\'achat en France métropolitaine.'
        },
        {
          question: 'Livrez-vous à l\'international ?',
          answer: 'Oui, nous livrons dans toute l\'Union Européenne, en Suisse, à Monaco et dans les DOM-TOM. Les frais et délais varient selon la destination. Pour les autres pays, contactez-nous.'
        },
        {
          question: 'Que faire si mon colis est en retard ?',
          answer: 'Les délais sont donnés à titre indicatif. Si votre colis a plus de 7 jours de retard, contactez-nous pour que nous fassions une recherche auprès du transporteur. Au-delà de 30 jours, vous pouvez demander l\'annulation et le remboursement.'
        },
        {
          question: 'Puis-je changer l\'adresse de livraison après commande ?',
          answer: 'Oui, si le colis n\'a pas encore été expédié. Contactez-nous rapidement à contact@temporal-clothes.com avec votre numéro de commande et la nouvelle adresse.'
        }
      ]
    },
    {
      icon: <RotateCcw size={24} />,
      title: 'Retours & Échanges',
      items: [
        {
          question: 'Quel est le délai pour retourner un article ?',
          answer: 'Vous disposez de 14 jours à compter de la réception de votre commande pour nous retourner un article, conformément à la loi.'
        },
        {
          question: 'Comment effectuer un retour ?',
          answer: 'Contactez-nous à contact@temporal-clothes.com en indiquant votre numéro de commande et les articles à retourner. Nous vous donnerons les instructions pour renvoyer le colis. Les articles doivent être dans leur état d\'origine, non portés, avec les étiquettes.'
        },
        {
          question: 'Les frais de retour sont-ils à ma charge ?',
          answer: 'Oui, sauf en cas d\'article défectueux ou d\'erreur de notre part. Dans ce cas, nous prenons en charge les frais de retour.'
        },
        {
          question: 'Combien de temps pour être remboursé ?',
          answer: 'Le remboursement est effectué dans les 14 jours suivant la réception de votre retour. Il apparaîtra sur votre compte sous 3-5 jours ouvrés selon votre banque.'
        },
        {
          question: 'Puis-je échanger un article ?',
          answer: 'Pour un échange (changement de taille ou couleur), nous vous conseillons de retourner l\'article et de passer une nouvelle commande pour garantir la disponibilité. Nous vous rembourserons l\'article retourné.'
        }
      ]
    },
    {
      icon: <CreditCard size={24} />,
      title: 'Paiement',
      items: [
        {
          question: 'Quels moyens de paiement acceptez-vous ?',
          answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard, American Express) via notre plateforme sécurisée Stripe. Le paiement PayPal est également disponible.'
        },
        {
          question: 'Le paiement est-il sécurisé ?',
          answer: 'Absolument. Tous les paiements sont traités via Stripe, une plateforme certifiée PCI-DSS. Vos données bancaires sont cryptées et ne sont jamais stockées sur nos serveurs.'
        },
        {
          question: 'Puis-je payer en plusieurs fois ?',
          answer: 'Pour le moment, nous ne proposons pas de paiement en plusieurs fois. Nous travaillons à intégrer cette option prochainement.'
        },
        {
          question: 'Comment utiliser un code promo ?',
          answer: 'Lors du paiement, vous trouverez un champ "Code promo" où vous pourrez saisir votre code. La réduction sera automatiquement appliquée à votre panier.'
        }
      ]
    },
    {
      icon: <Ruler size={24} />,
      title: 'Tailles & Produits',
      items: [
        {
          question: 'Comment choisir ma taille ?',
          answer: 'Consultez notre guide des tailles disponible sur chaque page produit. Nous indiquons les mesures exactes (poitrine, longueur, épaules) pour chaque taille. En cas de doute, n\'hésitez pas à nous contacter.'
        },
        {
          question: 'Les tailles sont-elles standard ?',
          answer: 'Nos vêtements ont une coupe streetwear légèrement oversized. Si vous préférez un fit plus ajusté, nous vous conseillons de prendre une taille en dessous de votre taille habituelle.'
        },
        {
          question: 'Comment entretenir mes vêtements Temporal ?',
          answer: 'Les instructions d\'entretien sont indiquées sur l\'étiquette de chaque vêtement. En général, nous recommandons un lavage à 30°C, pas de sèche-linge et un repassage à basse température pour préserver les impressions.'
        },
        {
          question: 'Les couleurs sont-elles fidèles aux photos ?',
          answer: 'Nous faisons notre maximum pour que les photos reflètent les couleurs réelles. Cependant, de légères variations peuvent exister selon les écrans. N\'hésitez pas à nous contacter si vous avez un doute.'
        }
      ]
    },
    {
      icon: <ShieldCheck size={24} />,
      title: 'Compte & Confidentialité',
      items: [
        {
          question: 'Dois-je créer un compte pour commander ?',
          answer: 'Non, vous pouvez commander en tant qu\'invité. Cependant, créer un compte vous permet de suivre vos commandes, enregistrer vos adresses et accéder à des offres exclusives.'
        },
        {
          question: 'Comment supprimer mon compte ?',
          answer: 'Vous pouvez demander la suppression de votre compte en nous contactant à contact@temporal-clothes.com. Conformément au RGPD, nous traiterons votre demande sous 30 jours.'
        },
        {
          question: 'Mes données sont-elles protégées ?',
          answer: 'Oui, nous respectons le RGPD et ne partageons jamais vos données avec des tiers à des fins commerciales. Consultez notre Politique de Confidentialité pour plus de détails.'
        },
        {
          question: 'Comment me désabonner de la newsletter ?',
          answer: 'Cliquez sur le lien "Se désabonner" en bas de n\'importe quel email que vous avez reçu de notre part, ou contactez-nous directement.'
        }
      ]
    }
  ];

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground">
        <MarqueeBanner />
        <Header showLogo />
        <Sidebar />
        <CartDrawer />
        <SearchOverlay />

        <main className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-5xl font-bold mb-4 text-center" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            Questions Fréquentes
          </h1>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Retrouvez les réponses aux questions les plus courantes. Si vous ne trouvez pas ce que vous cherchez,
            n'hésitez pas à nous contacter.
          </p>

          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/30 px-6 py-4 flex items-center gap-3">
                  <span className="text-primary">{category.icon}</span>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    {category.title}
                  </h2>
                </div>

                <div className="divide-y divide-border">
                  {category.items.map((item, itemIndex) => {
                    const itemId = `${categoryIndex}-${itemIndex}`;
                    const isOpen = openItems.includes(itemId);

                    return (
                      <div key={itemIndex}>
                        <button
                          onClick={() => toggleItem(itemId)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/20 transition-colors"
                        >
                          <span className="font-medium pr-4">{item.question}</span>
                          <ChevronDown
                            size={20}
                            className={`flex-shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {isOpen && (
                          <div className="px-6 pb-4">
                            <p className="text-muted-foreground leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-16 text-center p-8 border border-border rounded-lg bg-muted/20">
            <Mail size={40} className="mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              Vous n'avez pas trouvé votre réponse ?
            </h3>
            <p className="text-muted-foreground mb-6">
              Notre équipe est là pour vous aider. Contactez-nous et nous vous répondrons dans les plus brefs délais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:contact@temporal-clothes.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}
              >
                <Mail size={18} />
                Nous contacter
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}
              >
                Ouvrir un ticket
              </a>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Dernière mise à jour : 7 janvier 2026
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
