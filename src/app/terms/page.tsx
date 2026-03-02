'use client';

import { useStore } from '@/stores/useStore';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchOverlay from '@/components/layout/SearchOverlay';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
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
            Conditions Générales de Vente
          </h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                1. Objet
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Les présentes Conditions Générales de Vente (CGV) régissent les ventes de vêtements streetwear
                et accessoires de la marque Temporal, effectuées sur le site www.temporal-clothes.com.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Toute commande implique l'acceptation sans réserve des présentes CGV.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                2. Identification du Vendeur
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Temporal<br />
                Entreprise individuelle<br />
                Siège social : 22 Rue Pierre Brossolette, 27000 Évreux, France<br />
                SIRET : 934 932 385 00016<br />
                Email : contact@temporal-clothes.com<br />
                Téléphone : 07 68 28 13 95
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                3. Produits et Prix
              </h2>
              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                3.1 Produits
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Les produits proposés sont ceux qui figurent sur le site au jour de la consultation par le Client.
                Chaque produit est présenté avec une description détaillée (taille, couleur, matière, entretien).
                Les photographies sont les plus fidèles possibles mais peuvent présenter des variations dues à
                l'affichage sur différents écrans.
              </p>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                3.2 Prix
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Les prix sont indiqués en euros, toutes taxes comprises (TTC), hors frais de livraison.
                Les frais de livraison sont indiqués avant la validation de la commande.
                Temporal se réserve le droit de modifier ses prix à tout moment, les produits étant facturés
                au tarif en vigueur au moment de la commande.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                4. Commande
              </h2>
              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                4.1 Processus de commande
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Le Client sélectionne les produits, choisit la taille et la couleur, puis les ajoute au panier.
                Avant de valider définitivement sa commande, le Client a la possibilité de vérifier le détail
                de celle-ci et son prix total, et de corriger d'éventuelles erreurs.
              </p>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                4.2 Validation de la commande
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                La validation de la commande par le Client entraîne :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>L'acceptation pleine et entière des présentes CGV</li>
                <li>La reconnaissance d'en avoir parfaite connaissance</li>
                <li>La renonciation à se prévaloir de ses propres conditions d'achat</li>
              </ul>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                4.3 Confirmation de commande
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Un email de confirmation récapitulant les détails de la commande est envoyé au Client.
                La vente est considérée comme définitive après l'encaissement du paiement et l'envoi
                de la confirmation de commande.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                5. Paiement
              </h2>
              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                5.1 Moyens de paiement
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Le paiement s'effectue par carte bancaire via notre prestataire sécurisé Stripe.
                Les cartes acceptées sont : Visa, Mastercard, American Express.
              </p>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                5.2 Sécurité
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Les transactions sont sécurisées par le protocole SSL. Les données bancaires ne sont jamais
                enregistrées sur nos serveurs. Elles sont directement transmises de manière cryptée à Stripe.
              </p>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                5.3 Refus de paiement
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                En cas de refus d'autorisation de paiement par carte bancaire, la commande est automatiquement
                annulée. Temporal se réserve le droit de refuser une commande en cas de litige antérieur avec
                le Client.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                6. Livraison
              </h2>
              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                6.1 Zone de livraison
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Nous livrons en France métropolitaine, Corse et DROM-COM, ainsi que dans l'Union Européenne.
              </p>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                6.2 Modes de livraison
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Livraison standard :</strong> 3-5 jours ouvrés</li>
                <li><strong>Livraison express :</strong> 24-48h</li>
                <li><strong>Point relais :</strong> 3-4 jours ouvrés</li>
                <li><strong>Main propre :</strong> disponible sur Lyon et région lyonnaise</li>
              </ul>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                6.3 Délais de livraison
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Les délais de livraison sont donnés à titre indicatif. En cas de retard de livraison supérieur
                à 30 jours, le Client peut demander l'annulation de la commande et le remboursement.
              </p>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                6.4 Réception de la commande
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Le Client doit vérifier l'état du colis en présence du livreur. En cas de colis endommagé,
                le Client doit refuser la livraison ou émettre des réserves écrites sur le bon de livraison.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                7. Droit de Rétractation
              </h2>
              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                7.1 Délai
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Conformément à l'article L221-18 du Code de la consommation, le Client dispose d'un délai
                de 14 jours à compter de la réception de sa commande pour exercer son droit de rétractation
                sans avoir à justifier de motifs ni à payer de pénalités.
              </p>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                7.2 Procédure
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Pour exercer ce droit, le Client doit nous informer de sa décision par email à
                retours@temporal.fr ou via son compte client. Les produits doivent être retournés
                dans leur état d'origine, non portés, non lavés, avec toutes les étiquettes.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                <strong>Important :</strong> Les articles ne peuvent être remboursés que s'ils sont retournés dans le même état
                qu'à l'envoi. Temporal n'est pas responsable des dégradations faites sur des vêtements mal lavés ou dont
                les instructions de lavage n'ont pas été respectées. Aucun remboursement ne sera accordé pour un article
                endommagé par un entretien inadapté. Consultez notre <a href="/care-guide" className="text-primary hover:underline">Guide de lavage</a> pour
                les instructions d'entretien détaillées.
              </p>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                7.3 Frais de retour
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Les frais de retour sont à la charge du Client, sauf en cas de produit défectueux ou d'erreur
                de notre part.
              </p>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                7.4 Remboursement
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Le remboursement s'effectue dans un délai de 14 jours suivant la réception du retour,
                par le même moyen de paiement que celui utilisé pour la commande.
                Le remboursement est conditionné à la vérification de l'état de l'article retourné :
                celui-ci doit être dans le même état qu'à l'envoi, sans trace d'utilisation abusive,
                de lavage inadapté ou de modification.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                8. Garanties
              </h2>
              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                8.1 Garantie légale de conformité
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Le Client bénéficie de la garantie légale de conformité (articles L217-4 à L217-14 du Code
                de la consommation) et de la garantie des vices cachés (articles 1641 à 1648 et 2232 du
                Code civil).
              </p>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                8.2 Garantie commerciale
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Tous nos produits bénéficient d'une garantie de 2 ans contre tout défaut de fabrication.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                9. Responsabilité
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Temporal ne saurait être tenu responsable :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>De l'inexécution du contrat en cas de force majeure</li>
                <li>Des dommages indirects résultant de l'utilisation des produits</li>
                <li>Des retards ou pertes causés par les transporteurs</li>
                <li>De l'indisponibilité temporaire du site pour maintenance</li>
                <li><strong>Des dégradations survenues sur les vêtements suite à un lavage inadapté ou au non-respect des instructions d'entretien</strong> fournies sur les étiquettes des produits et sur la page <a href="/care-guide" className="text-primary hover:underline">Guide de lavage</a> du site</li>
              </ul>

              <h3 className="text-2xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                9.1 Entretien des produits
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Chaque produit Temporal est accompagné d'instructions d'entretien spécifiques, disponibles sur l'étiquette du produit,
                sur la fiche produit du site, ainsi que sur notre page dédiée <a href="/care-guide" className="text-primary hover:underline">Guide de lavage</a>.
                Le Client s'engage à respecter scrupuleusement ces instructions. Temporal décline toute responsabilité en cas de
                détérioration, décoloration, rétrécissement ou tout autre dommage résultant du non-respect de ces instructions d'entretien.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                En cas de demande de retour ou de remboursement, les articles devront être restitués dans le même état qu'à leur réception.
                <strong> Tout article présentant des signes de détérioration due à un entretien incorrect, d'usure anormale, de lavage
                inadapté ou de modification ne pourra faire l'objet d'un remboursement ou d'un échange.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                10. Propriété Intellectuelle
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Tous les éléments du site (textes, images, logos, vidéos) sont protégés par le droit d'auteur,
                le droit des marques et/ou le droit des brevets. Toute reproduction ou représentation, totale
                ou partielle, est interdite sans autorisation préalable de Temporal.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                11. Données Personnelles
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Les données personnelles collectées font l'objet d'un traitement informatique conforme au RGPD.
                Pour plus d'informations, consultez notre{' '}
                <a href="/privacy" className="text-primary hover:underline">Politique de Confidentialité</a>.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                12. Médiation
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Conformément à l'article L612-1 du Code de la consommation, en cas de litige, le Client peut
                recourir gratuitement à un médiateur de la consommation :
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                FEVAD (Fédération du e-commerce et de la vente à distance)<br />
                60 rue La Boétie, 75008 Paris<br />
                Site web : <a href="https://www.mediateurfevad.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.mediateurfevad.fr</a>
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                13. Droit Applicable et Juridiction
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Les présentes CGV sont soumises au droit français. En cas de litige, les tribunaux français
                seront seuls compétents.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                14. Contact
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant les présentes CGV :
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Email : <a href="mailto:contact@temporal-clothes.com" className="text-primary hover:underline">contact@temporal-clothes.com</a><br />
                Téléphone : 07 68 28 13 95<br />
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
