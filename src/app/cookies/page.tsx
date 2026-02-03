'use client';

import { useStore } from '@/stores/useStore';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchOverlay from '@/components/layout/SearchOverlay';
import Footer from '@/components/layout/Footer';

export default function CookiesPage() {
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
            Politique de Cookies
          </h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                1. Qu'est-ce qu'un Cookie ?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, smartphone, tablette)
                lors de la visite d'un site web. Il permet de reconnaître votre navigateur et de conserver certaines
                informations vous concernant pour améliorer votre expérience de navigation.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                2. Pourquoi Utilisons-nous des Cookies ?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous utilisons des cookies pour :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Assurer le bon fonctionnement du site (cookies essentiels)</li>
                <li>Mémoriser vos préférences (langue, mode sombre, etc.)</li>
                <li>Conserver les articles dans votre panier</li>
                <li>Analyser la fréquentation du site et améliorer nos services</li>
                <li>Sécuriser votre connexion et prévenir la fraude</li>
                <li>Personnaliser le contenu et les offres</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                3. Types de Cookies Utilisés
              </h2>

              <div className="space-y-6">
                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    3.1 Cookies Essentiels (Strictement Nécessaires)
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Ces cookies sont indispensables au fonctionnement du site. Ils ne peuvent pas être désactivés.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>temporal-store :</strong> Mémorisation du panier, préférences (langue, mode sombre)</li>
                    <li><strong>temporal-consent :</strong> Enregistrement de vos préférences cookies</li>
                    <li><strong>temporal-entered :</strong> Page d'entrée du site (sessionStorage)</li>
                    <li><strong>Session ID :</strong> Gestion de votre session de navigation</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3">
                    <strong>Durée :</strong> Session ou jusqu'à 13 mois<br />
                    <strong>Base légale :</strong> Intérêt légitime (fonctionnement du site)
                  </p>
                </div>

                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    3.2 Cookies de Performance et Analytiques
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Ces cookies nous permettent de comprendre comment les visiteurs utilisent le site.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Google Analytics :</strong> Analyse du trafic et du comportement des utilisateurs</li>
                    <li><strong>Hotjar :</strong> Cartes de chaleur et enregistrements de sessions (si activé)</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3">
                    <strong>Durée :</strong> 13 mois maximum<br />
                    <strong>Base légale :</strong> Consentement
                  </p>
                </div>

                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    3.3 Cookies de Fonctionnalité
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Ces cookies permettent d'améliorer votre expérience en mémorisant vos préférences.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Préférences utilisateur :</strong> Langue, devise, mode d'affichage</li>
                    <li><strong>Favoris :</strong> Articles ajoutés à votre liste de souhaits</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3">
                    <strong>Durée :</strong> 12 mois<br />
                    <strong>Base légale :</strong> Consentement
                  </p>
                </div>

                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    3.4 Cookies Publicitaires et Marketing
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Ces cookies permettent de personnaliser les publicités et d'évaluer l'efficacité des campagnes.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Meta Pixel :</strong> Suivi des conversions Facebook/Instagram</li>
                    <li><strong>Google Ads :</strong> Publicités ciblées et remarketing</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3">
                    <strong>Durée :</strong> 13 mois maximum<br />
                    <strong>Base légale :</strong> Consentement
                  </p>
                </div>

                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    3.5 Cookies Tiers
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Certains services externes peuvent déposer des cookies :
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Stripe :</strong> Traitement sécurisé des paiements</li>
                    <li><strong>Réseaux sociaux :</strong> Boutons de partage (si intégrés)</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3">
                    <strong>Durée :</strong> Variable selon le service<br />
                    <strong>Base légale :</strong> Consentement
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                4. Durée de Conservation
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Les cookies ont une durée de vie limitée :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Cookies de session :</strong> Supprimés à la fermeture du navigateur</li>
                <li><strong>Cookies persistants :</strong> 13 mois maximum (conformément aux recommandations CNIL)</li>
                <li><strong>Cookies essentiels :</strong> Durée nécessaire au fonctionnement du service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                5. Gestion de vos Préférences
              </h2>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                5.1 Via Notre Bandeau de Consentement
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Lors de votre première visite, un bandeau vous permet d'accepter ou de refuser les cookies
                non essentiels. Vous pouvez modifier vos préférences à tout moment en cliquant sur le lien
                "Préférences cookies" dans le footer du site.
              </p>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                5.2 Via Votre Navigateur
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Vous pouvez configurer votre navigateur pour refuser tous les cookies ou être averti de leur dépôt :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
                <li><strong>Firefox :</strong> Options → Vie privée et sécurité → Cookies et données de sites</li>
                <li><strong>Safari :</strong> Préférences → Confidentialité → Cookies et données de sites web</li>
                <li><strong>Edge :</strong> Paramètres → Cookies et autorisations de site → Cookies</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>Attention :</strong> La désactivation de tous les cookies peut affecter le bon fonctionnement
                du site et limiter certaines fonctionnalités.
              </p>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                5.3 Opposition aux Cookies Publicitaires
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Pour refuser les cookies publicitaires, vous pouvez visiter :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><a href="https://www.youronlinechoices.com/fr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.youronlinechoices.com/fr/</a></li>
                <li><a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">optout.networkadvertising.org</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                6. Cookies et Données Personnelles
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Certains cookies peuvent collecter des données personnelles (adresse IP, identifiant de session,
                comportement de navigation). Ces données sont traitées conformément à notre{' '}
                <a href="/privacy" className="text-primary hover:underline">Politique de Confidentialité</a> et
                au RGPD.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Vous disposez des droits d'accès, rectification, suppression, limitation, portabilité et opposition
                sur ces données. Pour les exercer, contactez-nous à{' '}
                <a href="mailto:contact@temporal-clothes.com" className="text-primary hover:underline">contact@temporal-clothes.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                7. Cookies Flash et Autres Technologies
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                En plus des cookies, nous pouvons utiliser :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Local Storage :</strong> Stockage local dans votre navigateur (préférences, panier)</li>
                <li><strong>Session Storage :</strong> Stockage temporaire pendant votre session</li>
                <li><strong>Web Beacons :</strong> Pixels invisibles pour mesurer l'efficacité des emails</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                8. Mises à Jour
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Cette politique de cookies peut être mise à jour pour refléter les changements dans nos pratiques
                ou la législation. Nous vous recommandons de consulter régulièrement cette page.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                9. Contact
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant l'utilisation des cookies :
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Email : <a href="mailto:contact@temporal-clothes.com" className="text-primary hover:underline">contact@temporal-clothes.com</a><br />
                Adresse : 22 Rue Pierre Brossolette, 27000 Évreux, France
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                10. Liens Utiles
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><a href="https://www.cnil.fr/fr/cookies-et-autres-traceurs" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">CNIL - Guide sur les cookies</a></li>
                <li><a href="/privacy" className="text-primary hover:underline">Notre Politique de Confidentialité</a></li>
                <li><a href="/legal" className="text-primary hover:underline">Mentions Légales</a></li>
              </ul>
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
