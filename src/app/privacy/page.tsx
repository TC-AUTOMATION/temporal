'use client';

import { useStore } from '@/stores/useStore';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchOverlay from '@/components/layout/SearchOverlay';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
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
            Politique de Confidentialité
          </h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                1. Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Temporal s'engage à protéger votre vie privée. Cette politique de confidentialité explique
                comment nous collectons, utilisons et protégeons vos données personnelles conformément au
                Règlement Général sur la Protection des Données (RGPD).
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                2. Responsable du Traitement
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Temporal<br />
                22 Rue Pierre Brossolette, 27000 Évreux, France<br />
                Email : contact@temporal-clothes.com<br />
                Téléphone : 07 68 28 13 95
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                3. Données Collectées
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nous collectons les données suivantes :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Données d'identification :</strong> nom, prénom, adresse email</li>
                <li><strong>Données de livraison :</strong> adresse postale, numéro de téléphone</li>
                <li><strong>Données de paiement :</strong> traitées de manière sécurisée par Stripe</li>
                <li><strong>Données de navigation :</strong> adresse IP, cookies, pages visitées</li>
                <li><strong>Données de commande :</strong> historique d'achats, préférences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                4. Finalités du Traitement
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Vos données sont utilisées pour :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Traiter et gérer vos commandes</li>
                <li>Assurer la livraison de vos produits</li>
                <li>Gérer le service client et répondre à vos demandes</li>
                <li>Améliorer notre site et nos services</li>
                <li>Vous envoyer des communications marketing (avec votre consentement)</li>
                <li>Respecter nos obligations légales et fiscales</li>
                <li>Prévenir la fraude et assurer la sécurité</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                5. Base Légale du Traitement
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Le traitement de vos données repose sur :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>L'exécution du contrat :</strong> pour traiter vos commandes</li>
                <li><strong>Votre consentement :</strong> pour les cookies non essentiels et le marketing</li>
                <li><strong>L'obligation légale :</strong> pour la comptabilité et la fiscalité</li>
                <li><strong>L'intérêt légitime :</strong> pour améliorer nos services et prévenir la fraude</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                6. Cookies
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Notre site utilise des cookies pour améliorer votre expérience. Pour plus d'informations,
                consultez notre <a href="/cookies" className="text-primary hover:underline">Politique de Cookies</a>.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                7. Durée de Conservation
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous conservons vos données :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Données de compte :</strong> jusqu'à la suppression de votre compte ou 3 ans d'inactivité</li>
                <li><strong>Données de commande :</strong> 10 ans pour les obligations comptables</li>
                <li><strong>Cookies :</strong> 13 mois maximum</li>
                <li><strong>Données marketing :</strong> 3 ans après le dernier contact</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                8. Partage des Données
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Vos données peuvent être partagées avec :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Prestataires de services :</strong> hébergement, paiement (Stripe), livraison</li>
                <li><strong>Autorités compétentes :</strong> si requis par la loi</li>
                <li><strong>Partenaires marketing :</strong> uniquement avec votre consentement</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Nous ne vendons jamais vos données personnelles à des tiers.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                9. Vos Droits
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                <li><strong>Droit à l'effacement :</strong> supprimer vos données (droit à l'oubli)</li>
                <li><strong>Droit à la limitation :</strong> restreindre le traitement de vos données</li>
                <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> refuser certains traitements</li>
                <li><strong>Droit de retrait du consentement :</strong> à tout moment</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Pour exercer vos droits, contactez-nous à : <a href="mailto:contact@temporal-clothes.com" className="text-primary hover:underline">contact@temporal-clothes.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                10. Sécurité
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger
                vos données contre tout accès non autorisé, perte ou destruction. Le paiement est sécurisé
                via Stripe avec chiffrement SSL/TLS.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                11. Transferts Internationaux
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Vos données sont hébergées dans l'Union Européenne. Si un transfert hors UE est nécessaire,
                nous nous assurons que des garanties appropriées sont en place (clauses contractuelles types,
                Privacy Shield, etc.).
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                12. Réclamation
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation
                auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) :
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                CNIL - 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07<br />
                Téléphone : 01 53 73 22 22<br />
                Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a>
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                13. Modifications
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
                Toute modification sera publiée sur cette page avec une date de mise à jour.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                14. Contact
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Email : <a href="mailto:contact@temporal-clothes.com" className="text-primary hover:underline">contact@temporal-clothes.com</a><br />
                Adresse : 22 Rue Pierre Brossolette, 27000 Évreux, France
              </p>
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
