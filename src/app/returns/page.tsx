'use client';

import { useStore } from '@/stores/useStore';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchOverlay from '@/components/layout/SearchOverlay';
import Footer from '@/components/layout/Footer';

export default function ReturnsPage() {
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
            Politique de Retour
          </h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                1. Délai de Rétractation
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Conformément à l'article L221-18 du Code de la consommation, vous disposez d'un délai de
                <strong> 14 jours calendaires</strong> à compter de la réception de votre commande pour exercer
                votre droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Ce délai expire 14 jours après le jour où vous-même, ou un tiers autre que le transporteur
                et désigné par vous, prend physiquement possession du dernier bien commandé.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                2. Conditions de Retour
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Pour être accepté, votre retour doit respecter les conditions suivantes :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Les articles doivent être <strong>dans leur état d'origine</strong>, non portés, non lavés et non modifiés</li>
                <li>Les <strong>étiquettes</strong> doivent être toujours attachées</li>
                <li>Les articles doivent être retournés dans leur <strong>emballage d'origine</strong> ou équivalent</li>
                <li>Le retour doit être accompagné du <strong>bon de livraison</strong> ou de la <strong>facture</strong></li>
                <li>Les articles soldés ou en promotion sont également éligibles au retour</li>
              </ul>
              <div className="mt-4 p-4 bg-muted/30 border border-border rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Important :</strong> Les articles portés, lavés, endommagés ou sans étiquette ne pourront
                  pas être acceptés et vous seront renvoyés à vos frais.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                3. Articles Non Retournables
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Certains articles ne peuvent pas être retournés pour des raisons d'hygiène :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Sous-vêtements et maillots de bain (sauf défaut)</li>
                <li>Articles personnalisés ou sur-mesure</li>
                <li>Accessoires d'hygiène (casquettes, bonnets si portés)</li>
                <li>Articles marqués comme "non retournables" au moment de l'achat</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                4. Procédure de Retour
              </h2>

              <div className="space-y-6">
                <div className="border border-primary/20 rounded-lg p-6 bg-primary/5">
                  <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    Étape 1 : Nous Informer
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Contactez notre service client pour nous informer de votre souhait de retour :
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                    <li><strong>Email :</strong> <a href="mailto:contact@temporal-clothes.com" className="text-primary hover:underline">contact@temporal-clothes.com</a></li>
                    <li><strong>Formulaire :</strong> Via votre compte client dans la section "Mes commandes"</li>
                    <li><strong>Téléphone :</strong> 07 68 28 13 95 (du lundi au vendredi, 9h-18h)</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-3">
                    Indiquez votre <strong>numéro de commande</strong>, les <strong>articles à retourner</strong> et
                    la <strong>raison du retour</strong>.
                  </p>
                </div>

                <div className="border border-primary/20 rounded-lg p-6 bg-primary/5">
                  <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    Étape 2 : Préparer le Colis
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Préparez votre colis de retour :
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                    <li>Emballez soigneusement les articles dans leur emballage d'origine</li>
                    <li>Incluez le bon de livraison ou la facture</li>
                    <li>Indiquez le numéro de commande sur un papier à l'intérieur</li>
                    <li>Fermez solidement le colis</li>
                  </ul>
                </div>

                <div className="border border-primary/20 rounded-lg p-6 bg-primary/5">
                  <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    Étape 3 : Expédier le Colis
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Vous avez deux options pour retourner votre commande :
                  </p>

                  <div className="mb-4">
                    <h4 className="font-bold text-foreground mb-2">Option 1 : Retour par La Poste</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Envoyez votre colis à l'adresse suivante :
                    </p>
                    <div className="mt-2 p-3 bg-background border border-border rounded">
                      <p className="text-foreground">
                        <strong>Temporal - Service Retours</strong><br />
                        22 Rue Pierre Brossolette<br />
                        27000 Évreux<br />
                        France
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Important :</strong> Conservez la preuve de dépôt jusqu'au remboursement complet.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-foreground mb-2">Option 2 : Retour en Point Relais</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Déposez votre colis dans un point relais Mondial Relay ou Colissimo.
                      Une étiquette de retour prépayée vous sera fournie sur demande.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                5. Frais de Retour
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Les frais de retour sont à votre charge, sauf dans les cas suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Article défectueux :</strong> Nous prenons en charge les frais de retour et d'échange</li>
                <li><strong>Erreur de notre part :</strong> Article incorrect, mauvaise taille/couleur expédiée</li>
                <li><strong>Livraison endommagée :</strong> Colis abîmé à la réception</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>Astuce :</strong> Pour un retour économique, utilisez un service de livraison économique
                (Mondial Relay, Colissimo, etc.). Les frais varient généralement entre 4 et 8 euros.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                6. Remboursement
              </h2>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                6.1 Délai de Remboursement
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Nous nous engageons à vous rembourser dans un délai de <strong>14 jours</strong> à compter de la
                date à laquelle nous récupérons les biens retournés ou de la date à laquelle vous nous fournissez
                une preuve d'expédition, selon la date la plus proche.
              </p>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                6.2 Mode de Remboursement
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Le remboursement s'effectue par le même moyen de paiement que celui utilisé pour la commande :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Carte bancaire :</strong> Remboursement sous 3-5 jours ouvrés après traitement</li>
                <li><strong>PayPal :</strong> Remboursement immédiat sur votre compte PayPal</li>
                <li><strong>Autre moyen :</strong> Selon les conditions du prestataire</li>
              </ul>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                6.3 Montant Remboursé
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Le remboursement inclut :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Le prix des articles retournés</li>
                <li>Les frais de livraison initiaux (seulement si vous retournez l'intégralité de la commande)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Les frais de retour restent à votre charge (sauf cas exceptionnels mentionnés ci-dessus).
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                7. Échange
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Si vous souhaitez échanger un article (changement de taille ou de couleur) :
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                <li>Suivez la procédure de retour ci-dessus</li>
                <li>Passez une nouvelle commande avec l'article souhaité</li>
                <li>Nous vous remboursons l'article retourné une fois réceptionné</li>
              </ol>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>Astuce :</strong> Pour éviter toute rupture de stock, nous vous conseillons de passer
                votre nouvelle commande avant de retourner l'article initial.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                8. Article Défectueux ou Endommagé
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Si vous recevez un article défectueux ou endommagé :
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                <li>Contactez-nous immédiatement à <a href="mailto:contact@temporal-clothes.com" className="text-primary hover:underline">contact@temporal-clothes.com</a></li>
                <li>Fournissez des photos claires du défaut ou dommage</li>
                <li>Indiquez votre numéro de commande</li>
                <li>Nous vous proposons un échange ou un remboursement intégral (y compris les frais de retour)</li>
              </ol>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Vous bénéficiez d'une garantie de 2 ans contre tout défaut de fabrication.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                9. Suivi de votre Retour
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Vous pouvez suivre l'état de votre retour :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Via votre compte client dans la section "Mes retours"</li>
                <li>Par email : vous recevrez des notifications à chaque étape</li>
                <li>En nous contactant au 07 68 28 13 95</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Étapes du retour :
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                <li><strong>Demande enregistrée :</strong> Nous avons reçu votre demande de retour</li>
                <li><strong>Colis en transit :</strong> Votre colis est en cours d'acheminement</li>
                <li><strong>Colis réceptionné :</strong> Nous avons reçu votre retour</li>
                <li><strong>Contrôle qualité :</strong> Vérification de l'état des articles</li>
                <li><strong>Remboursement effectué :</strong> Le remboursement a été traité</li>
              </ol>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                10. Questions Fréquentes
              </h2>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-foreground mb-2">Puis-je retourner un article acheté en soldes ?</h4>
                  <p className="text-muted-foreground">
                    Oui, les articles en soldes ou en promotion sont retournables dans les mêmes conditions.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-foreground mb-2">J'ai perdu l'étiquette, puis-je quand même retourner ?</h4>
                  <p className="text-muted-foreground">
                    Non, les articles sans étiquette ne peuvent pas être acceptés. Veillez à conserver les étiquettes
                    jusqu'à ce que vous soyez certain de garder l'article.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-foreground mb-2">Combien de temps prend le remboursement ?</h4>
                  <p className="text-muted-foreground">
                    Une fois votre retour réceptionné et validé (2-3 jours), le remboursement prend 3-5 jours ouvrés
                    pour apparaître sur votre compte.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-foreground mb-2">Que faire si mon colis de retour est perdu ?</h4>
                  <p className="text-muted-foreground">
                    Contactez-nous avec votre preuve de dépôt. Nous ferons le nécessaire pour traiter votre demande.
                    C'est pourquoi nous recommandons d'utiliser un envoi suivi.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                11. Contact Service Retours
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant les retours :
              </p>
              <div className="mt-4 space-y-1 text-muted-foreground">
                <p><strong>Email :</strong> <a href="mailto:contact@temporal-clothes.com" className="text-primary hover:underline">contact@temporal-clothes.com</a></p>
                <p><strong>Téléphone :</strong> 07 68 28 13 95</p>
                <p><strong>Adresse :</strong> 22 Rue Pierre Brossolette, 27000 Évreux, France</p>
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
