'use client';

import { useStore } from '@/stores/useStore';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchOverlay from '@/components/layout/SearchOverlay';
import Footer from '@/components/layout/Footer';

export default function LegalPage() {
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
            Mentions Légales
          </h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                1. Éditeur du Site
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Le site www.temporal-clothes.com est édité par :
              </p>
              <div className="mt-4 space-y-1 text-muted-foreground leading-relaxed">
                <p><strong>Raison sociale :</strong> Temporal</p>
                <p><strong>Forme juridique :</strong> Entreprise individuelle</p>
                <p><strong>Siège social :</strong> 22 Rue Pierre Brossolette, 27000 Évreux, France</p>
                <p><strong>SIRET :</strong> 934 932 385 00016</p>
                <p><strong>Email :</strong> <a href="mailto:contact@temporal-clothes.com" className="text-primary hover:underline">contact@temporal-clothes.com</a></p>
                <p><strong>Téléphone :</strong> 07 68 28 13 95</p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                2. Directeur de la Publication
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Le directeur de la publication du site est :
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                <strong>Tom Pradel</strong> - Fondateur de Temporal
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                3. Hébergement du Site
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Le site www.temporal-clothes.com est hébergé par :
              </p>
              <div className="mt-4 space-y-1 text-muted-foreground leading-relaxed">
                <p><strong>Hébergeur :</strong> OVH SAS</p>
                <p><strong>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix, France</p>
                <p><strong>Site web :</strong> <a href="https://www.ovh.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.ovh.com</a></p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                4. Conception et Développement
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Le site a été conçu et développé par :
              </p>
              <div className="mt-4 space-y-1 text-muted-foreground leading-relaxed">
                <p><strong>Entreprise :</strong> TC AUTOMATION</p>
                <p><strong>Responsable :</strong> Philippe BUBERT</p>
                <p><strong>SIRET :</strong> 987 416 898 00011</p>
                <p><strong>Email :</strong> <a href="mailto:contact@tc-automation.fr" className="text-primary hover:underline">contact@tc-automation.fr</a></p>
                <p><strong>Téléphone :</strong> 06 76 90 06 03</p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                5. Propriété Intellectuelle
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                L'ensemble du contenu de ce site (structure, textes, logos, images, vidéos, sons, bases de données,
                logiciels, etc.) est la propriété exclusive de Temporal, sauf mentions particulières.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Toute représentation ou reproduction, totale ou partielle, du site ou de l'un de ses éléments,
                par quelque procédé que ce soit, sans l'autorisation expresse de Temporal, est interdite et
                constituerait une contrefaçon sanctionnée par les articles L335-2 et suivants du Code de la
                propriété intellectuelle.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Les marques et logos Temporal sont des marques déposées. Toute reproduction ou utilisation sans
                autorisation est interdite.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                6. Protection des Données Personnelles
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique
                et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition
                aux données personnelles vous concernant.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Pour exercer ces droits ou pour toute question sur le traitement de vos données, vous pouvez
                nous contacter à l'adresse : <a href="mailto:contact@temporal-clothes.com" className="text-primary hover:underline">contact@temporal-clothes.com</a>
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Pour plus d'informations, consultez notre{' '}
                <a href="/privacy" className="text-primary hover:underline">Politique de Confidentialité</a>.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                7. Cookies
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Le site utilise des cookies pour améliorer votre expérience de navigation et analyser l'utilisation
                du site. Vous pouvez configurer votre navigateur pour refuser les cookies ou être averti de leur
                dépôt.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Pour plus d'informations, consultez notre{' '}
                <a href="/cookies" className="text-primary hover:underline">Politique de Cookies</a>.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                8. Limitation de Responsabilité
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Temporal s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site,
                mais ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Temporal ne pourra être tenu responsable :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Des dommages directs ou indirects causés au matériel de l'utilisateur lors de l'accès au site</li>
                <li>De l'impossibilité temporaire d'accès au site pour des raisons techniques ou de maintenance</li>
                <li>Des dommages résultant de l'utilisation du site ou de l'impossibilité de l'utiliser</li>
                <li>Des virus informatiques qui pourraient infecter le matériel de l'utilisateur</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                9. Liens Hypertextes
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Le site peut contenir des liens hypertextes vers d'autres sites. Temporal n'exerce aucun contrôle
                sur ces sites externes et décline toute responsabilité quant à leur contenu.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                La mise en place de liens hypertextes vers le site www.temporal-clothes.com nécessite une autorisation
                préalable écrite de Temporal.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                10. Droit Applicable
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Les présentes mentions légales sont soumises au droit français. En cas de litige et à défaut
                d'accord amiable, le litige sera porté devant les tribunaux français conformément aux règles
                de compétence en vigueur.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                11. Crédits
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Fondateur :</strong> Tom Pradel<br />
                <strong>Conception et développement :</strong> TC AUTOMATION (Philippe BUBERT)<br />
                <strong>Technologies utilisées :</strong> Next.js, React, TypeScript, Tailwind CSS
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                12. Contact
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant ces mentions légales ou le site en général :
              </p>
              <div className="mt-4 space-y-1 text-muted-foreground leading-relaxed">
                <p><strong>Email :</strong> <a href="mailto:contact@temporal-clothes.com" className="text-primary hover:underline">contact@temporal-clothes.com</a></p>
                <p><strong>Téléphone :</strong> 07 68 28 13 95</p>
                <p><strong>Adresse postale :</strong> 22 Rue Pierre Brossolette, 27000 Évreux, France</p>
                <p><strong>Horaires :</strong> Du lundi au vendredi, 9h-18h</p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                13. Médiation
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Conformément à l'article L612-1 du Code de la consommation, le consommateur a le droit de
                recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable du
                litige qui l'oppose au professionnel.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>Médiateur de la consommation :</strong><br />
                FEVAD (Fédération du e-commerce et de la vente à distance)<br />
                60 rue La Boétie, 75008 Paris<br />
                Site web : <a href="https://www.mediateurfevad.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.mediateurfevad.fr</a>
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
