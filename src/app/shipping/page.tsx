'use client';

import { useStore } from '@/stores/useStore';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchOverlay from '@/components/layout/SearchOverlay';
import Footer from '@/components/layout/Footer';

export default function ShippingPage() {
  const { darkMode } = useStore();

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground">
        <MarqueeBanner />
        <Header showLogo />
        <Sidebar />
        <CartDrawer />
        <SearchOverlay />

        <main className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-5xl font-bold mb-8 text-center" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            Livraison et Expédition
          </h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                1. Zones de Livraison
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nous livrons dans les zones suivantes :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>France métropolitaine</strong></li>
                <li><strong>Corse</strong> (délais légèrement prolongés)</li>
                <li><strong>DROM-COM</strong> (Guadeloupe, Martinique, Guyane, Réunion, Mayotte)</li>
                <li><strong>Union Européenne</strong> (tous les pays membres)</li>
                <li><strong>Suisse et Monaco</strong></li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Pour les livraisons hors de ces zones, contactez-nous à{' '}
                <a href="mailto:contact@temporal-clothes.com" className="text-primary hover:underline">contact@temporal-clothes.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                2. Modes de Livraison
              </h2>

              <div className="space-y-6">
                <div className="border border-primary/20 rounded-lg p-6 bg-primary/5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                      Livraison Standard
                    </h3>
                    <span className="text-2xl font-bold text-primary">4,90€</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    <strong>Délai :</strong> 3-5 jours ouvrés<br />
                    <strong>Transporteur :</strong> Colissimo<br />
                    <strong>Suivi :</strong> Oui, numéro de suivi fourni
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Livraison à votre domicile ou en point relais. Choix disponible lors du paiement.
                  </p>
                </div>

                <div className="border border-primary/20 rounded-lg p-6 bg-primary/5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                      Livraison Express
                    </h3>
                    <span className="text-2xl font-bold text-primary">9,90€</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    <strong>Délai :</strong> 24-48h<br />
                    <strong>Transporteur :</strong> Chronopost<br />
                    <strong>Suivi :</strong> Oui, suivi en temps réel
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Commande avant 14h = expédition le jour même. Livraison prioritaire à domicile avec signature.
                  </p>
                </div>

                <div className="border border-primary/20 rounded-lg p-6 bg-primary/5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                      Point Relais
                    </h3>
                    <span className="text-2xl font-bold text-primary">3,90€</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    <strong>Délai :</strong> 3-4 jours ouvrés<br />
                    <strong>Réseau :</strong> Mondial Relay + Colissimo<br />
                    <strong>Suivi :</strong> Oui, notification SMS/email
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Plus de 10 000 points relais disponibles en France. Retirez votre colis à votre convenance.
                    Le colis reste disponible 14 jours.
                  </p>
                </div>

                <div className="border border-primary rounded-lg p-6 bg-primary/10">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                      Livraison Main Propre - Lyon
                    </h3>
                    <span className="text-2xl font-bold text-primary">GRATUIT</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    <strong>Délai :</strong> 24-48h après commande<br />
                    <strong>Zone :</strong> Lyon et région lyonnaise (dans un rayon de 30km)<br />
                    <strong>Contact :</strong> Prise de rendez-vous par téléphone ou email
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Rencontrez notre équipe ! Nous livrons vos commandes personnellement, gratuitement.
                    Parfait pour essayer, échanger et découvrir nos nouveautés en avant-première.
                  </p>
                  <div className="mt-4 p-3 bg-background border border-border rounded">
                    <p className="text-sm font-bold text-foreground mb-1">Comment ça marche ?</p>
                    <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
                      <li>Passez votre commande et sélectionnez "Main propre Lyon"</li>
                      <li>Nous vous contactons pour fixer un rendez-vous</li>
                      <li>Nous vous livrons à l'adresse de votre choix dans Lyon</li>
                      <li>Vous réglez à la livraison (carte bancaire acceptée)</li>
                    </ol>
                  </div>
                </div>

                <div className="border border-green-500/20 rounded-lg p-6 bg-green-500/5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                      Livraison Gratuite
                    </h3>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">0€</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Condition :</strong> À partir de 100€ d'achat en France métropolitaine<br />
                    <strong>Mode :</strong> Livraison standard (3-5 jours ouvrés)
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                3. Tarifs Internationaux
              </h2>

              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-bold text-foreground mb-2">Union Européenne</h4>
                  <p className="text-muted-foreground">
                    <strong>Standard :</strong> 9,90€ (5-7 jours ouvrés)<br />
                    <strong>Express :</strong> 19,90€ (2-4 jours ouvrés)
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-bold text-foreground mb-2">Suisse et Monaco</h4>
                  <p className="text-muted-foreground">
                    <strong>Standard :</strong> 14,90€ (5-8 jours ouvrés)<br />
                    <strong>Express :</strong> 24,90€ (3-5 jours ouvrés)
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Important :</strong> Frais de douane et taxes éventuelles à votre charge.
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-bold text-foreground mb-2">DOM-TOM</h4>
                  <p className="text-muted-foreground">
                    <strong>Standard :</strong> 12,90€ (7-10 jours ouvrés)<br />
                    <strong>Express :</strong> 29,90€ (4-6 jours ouvrés)
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                4. Délais de Préparation et Expédition
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>Préparation :</strong> Toutes les commandes passées avant 14h en semaine sont préparées
                et expédiées le jour même (hors week-end et jours fériés).
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>Expédition :</strong> Vous recevrez un email de confirmation avec votre numéro de suivi
                dès que votre colis est expédié.
              </p>
              <div className="p-4 bg-muted/30 border border-border rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Attention :</strong> Pendant les périodes de forte activité (soldes, Black Friday, Noël),
                  les délais peuvent être légèrement prolongés. Nous vous tiendrons informés par email.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                5. Suivi de Commande
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Suivez votre commande facilement :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Par email :</strong> Numéro de suivi envoyé automatiquement</li>
                <li><strong>Compte client :</strong> Section "Mes commandes" avec suivi en temps réel</li>
                <li><strong>SMS :</strong> Notifications à chaque étape de livraison (si activé)</li>
                <li><strong>Transporteur :</strong> Suivi directement sur le site du transporteur</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Statuts de commande :
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                <li><strong>Commande confirmée :</strong> Paiement accepté</li>
                <li><strong>En préparation :</strong> Votre commande est en cours de préparation</li>
                <li><strong>Expédiée :</strong> Votre colis est en route</li>
                <li><strong>En cours de livraison :</strong> Le livreur a votre colis</li>
                <li><strong>Livrée :</strong> Commande réceptionnée</li>
              </ol>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                6. Réception de votre Commande
              </h2>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                6.1 Vérification du Colis
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                À la réception de votre colis, vérifiez :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>L'état extérieur du colis (pas de déchirure, choc, ouverture)</li>
                <li>Le contenu : nombre d'articles, taille, couleur</li>
                <li>La présence de la facture et du bon de livraison</li>
              </ul>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                6.2 Colis Endommagé
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Si le colis est endommagé :
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                <li><strong>Refusez le colis</strong> ou <strong>émettez des réserves écrites</strong> sur le bon de livraison</li>
                <li>Prenez des photos du colis endommagé</li>
                <li>Contactez-nous immédiatement à <a href="mailto:contact@temporal-clothes.com" className="text-primary hover:underline">contact@temporal-clothes.com</a></li>
                <li>Nous vous renverrons un nouveau colis gratuitement</li>
              </ol>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                6.3 Absence lors de la Livraison
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Si vous êtes absent lors de la livraison :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Avis de passage :</strong> Le livreur laisse un avis dans votre boîte aux lettres</li>
                <li><strong>Point relais :</strong> Le colis est déposé au point relais le plus proche</li>
                <li><strong>Nouvelle tentative :</strong> Le livreur repassera le lendemain (selon transporteur)</li>
                <li><strong>Retrait :</strong> Vous avez 14 jours pour récupérer votre colis</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>Important :</strong> Si le colis n'est pas réclamé dans les 14 jours, il nous sera retourné
                et vous serez remboursé (frais de livraison déduits).
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                7. Retard de Livraison
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Les délais de livraison sont donnés à titre indicatif. En cas de retard :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Moins de 7 jours :</strong> Patience, le colis est probablement en transit</li>
                <li><strong>7-30 jours :</strong> Contactez-nous pour faire une recherche auprès du transporteur</li>
                <li><strong>Plus de 30 jours :</strong> Vous pouvez demander l'annulation et le remboursement</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Contactez notre service client : <a href="mailto:contact@temporal-clothes.com" className="text-primary hover:underline">contact@temporal-clothes.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                8. Colis Perdu
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Si votre colis est déclaré perdu par le transporteur :
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                <li>Nous effectuons une recherche auprès du transporteur (5-10 jours)</li>
                <li>Si le colis n'est pas retrouvé, vous avez le choix :
                  <ul className="list-disc pl-6 mt-2">
                    <li><strong>Renvoi :</strong> Nous vous renvoyons les articles gratuitement</li>
                    <li><strong>Remboursement :</strong> Remboursement intégral de votre commande</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                9. Douanes et Taxes (International)
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Pour les livraisons hors Union Européenne :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Droits de douane :</strong> Possibles selon le pays de destination</li>
                <li><strong>TVA locale :</strong> Peut s'appliquer selon la législation locale</li>
                <li><strong>Frais de dédouanement :</strong> Facturés par certains transporteurs</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>Important :</strong> Ces frais sont à votre charge. Nous ne pouvons pas les estimer à l'avance.
                Contactez les autorités douanières de votre pays pour plus d'informations.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                10. Questions Fréquentes
              </h2>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-foreground mb-2">Puis-je changer l'adresse de livraison après commande ?</h4>
                  <p className="text-muted-foreground">
                    Oui, si le colis n'a pas encore été expédié. Contactez-nous rapidement à{' '}
                    <a href="mailto:contact@temporal-clothes.com" className="text-primary hover:underline">contact@temporal-clothes.com</a>
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-foreground mb-2">Livrez-vous en dehors de la France ?</h4>
                  <p className="text-muted-foreground">
                    Oui, nous livrons dans toute l'Union Européenne, en Suisse, à Monaco et dans les DOM-TOM.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-foreground mb-2">Comment fonctionne la livraison main propre ?</h4>
                  <p className="text-muted-foreground">
                    Disponible uniquement sur Lyon et région lyonnaise. Après votre commande, nous vous contactons
                    pour fixer un rendez-vous et vous livrer personnellement, gratuitement.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-foreground mb-2">Puis-je me faire livrer en point relais ?</h4>
                  <p className="text-muted-foreground">
                    Oui, sélectionnez "Point Relais" lors du paiement. Vous pourrez choisir le point le plus proche
                    parmi plus de 10 000 disponibles.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-foreground mb-2">Que faire si je n'ai pas reçu mon numéro de suivi ?</h4>
                  <p className="text-muted-foreground">
                    Vérifiez vos spams. Si vous ne le trouvez pas, contactez-nous avec votre numéro de commande.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                11. Contact Service Livraison
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant la livraison :
              </p>
              <div className="mt-4 space-y-1 text-muted-foreground">
                <p><strong>Email :</strong> <a href="mailto:contact@temporal-clothes.com" className="text-primary hover:underline">contact@temporal-clothes.com</a></p>
                <p><strong>Téléphone :</strong> 07 68 28 13 95</p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                Dernière mise à jour : 7 janvier 2026
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
