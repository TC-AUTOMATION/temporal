# Audit des 10 soucis — Temporal / Espace Admin

> Date : 2026-04-18
> Périmètre : front + espace admin + API + base Prisma
> Objectif : pour chaque soucis, expliquer **ce qui se passe** et **comment le corriger**.

---

## 1. La description ne s'enregistre pas

### Ce qui se passe
Le formulaire d'édition produit dans l'admin stocke la description dans un champ `descriptionFr`, mais :
- Le modèle Prisma `Product` n'a **que** `description` et `descriptionEn` (`prisma/schema.prisma:111-112`).
- Le schéma de validation Zod accepte `description` et `descriptionEn` (`src/lib/validations/index.ts:46-47`).
- Le textarea français est lié à `formData.descriptionFr` (`src/app/admin/products/page.tsx:1141-1142`).

Résultat : quand l'admin tape dans le champ « Description (FR) », c'est `descriptionFr` qui bouge en état local. À la sauvegarde, le payload contient `descriptionFr` (rejeté par Zod en `.safeParse`) et la vraie valeur `description` reste vide ou inchangée.

### Fichiers concernés
- `src/app/admin/products/page.tsx` (lignes 651-653, 698-700, 740-742, 1141-1153)
- `src/app/api/products/[id]/route.ts` (ligne 169)
- `src/lib/validations/index.ts` (lignes 46-47)

### Correction
Dans `src/app/admin/products/page.tsx` :
1. Supprimer le champ `descriptionFr` de `formData` (initial state, reset, et remplissage depuis `product`).
2. Lier le textarea FR à `formData.description` au lieu de `formData.descriptionFr`.
3. Lors du remplissage, faire `description: product.description || ''` (sans passer par `descriptionFr`).

---

## 2. Sac de lavage gratuit sur commandes hors ensemble

### Ce qui se passe
Dans `src/app/api/upsells/route.ts`, la logique qui passe un upsell en « gratuit » regarde seulement :
- le `triggerType` (`product_in_cart` / `order_amount` / `category_in_cart`)
- le `freeThreshold` (montant du panier)

Elle **n'exige pas** que le panier contienne réellement le produit déclencheur. Si le seuil est atteint (panier ≥ X€), l'upsell devient gratuit, même si l'ensemble n'est pas dans le panier. C'est pour ça que le sac de lavage devient gratuit alors qu'il n'y a pas d'ensemble blanc/noir.

### Fichiers concernés
- `src/app/api/upsells/route.ts` (logique d'enrichissement)
- `src/app/api/admin/upsells/route.ts`
- `src/app/admin/upsells/page.tsx`

### Correction
1. Ajouter un champ `requiredProductIds: String[]` sur le modèle `Upsell` (Prisma).
2. Dans l'UI admin, permettre de sélectionner les produits qui rendent l'upsell gratuit (multi-select, par ex. « Ensemble blanc », « Ensemble noir »).
3. Dans `src/app/api/upsells/route.ts` : ne marquer l'upsell gratuit **que si** au moins un `requiredProductIds` est présent dans le panier **ET** le seuil `freeThreshold` est atteint.
4. Migration Prisma + backfill (`requiredProductIds: []` par défaut = comportement actuel).

---

## 3. Concours automatique par paliers de montant

### Règles demandées
- Commande ≥ 70€ et < 150€ → entrée automatique **concours bonnet**
- Commande ≥ 150€ → entrée automatique **concours veste**
- **Une commande = une seule entrée** (la plus haute)
- Plusieurs commandes valides = plusieurs entrées (cumul autorisé uniquement par commandes séparées)

### Ce qui se passe aujourd'hui
Dans `src/lib/contests.ts`, `enterOrderInContests()` boucle sur tous les concours actifs et entre la commande dans **tous** ceux dont `purchaseAmount <= orderTotal`. Donc une commande de 200€ entre à la fois dans le concours 70€ et dans celui 150€ — contraire à la règle.

De plus, il faut vérifier que le déclenchement se fait bien dans le webhook Stripe après paiement (`src/app/api/stripe/webhook/route.ts`).

### Fichiers concernés
- `src/lib/contests.ts`
- `src/app/api/stripe/webhook/route.ts`
- `prisma/schema.prisma` (modèles `Contest`, `ContestEntry`)
- `scripts/backfill-contest-entries.ts` (à réaligner après correction)

### Correction
1. Dans `contests.ts`, remplacer la boucle par une logique **tier exclusive** :
   ```
   if (orderTotal >= 150) → entrer dans le concours veste (seuil 150)
   else if (orderTotal >= 70) → entrer dans le concours bonnet (seuil 70)
   else → aucune entrée
   ```
2. Lier un concours à son palier via un champ explicite (`purchaseAmount` = seuil minimum du palier, déjà présent).
3. Empêcher la double entrée pour une même `orderId` via un `@@unique([contestId, orderId])` dans `ContestEntry` (si pas déjà le cas).
4. S'assurer que `enterOrderInContests(orderId)` est appelé **une seule fois** depuis le webhook Stripe quand le paiement passe à `PAID`.
5. Mettre à jour le script de backfill pour appliquer la même règle exclusive.

---

## 4. Stock couplé ensemble ↔ veste + jogging

### Ce qui se passe
Le schéma Prisma `Product` / `ProductVariant` ne décrit pas qu'un « ensemble » se compose d'une veste + un jogging. Quand un ensemble est vendu, seul le stock de la variante ensemble décroît. La veste et le jogging individuels gardent leur stock inchangé → surestimation du stock.

### Fichiers concernés
- `prisma/schema.prisma` (modèle `Product` / `ProductVariant`)
- `src/app/admin/stock/` (UI stock)
- `src/app/api/admin/stock/`
- `src/app/api/orders/route.ts` (création de commande — décrémentation)
- `src/app/api/stripe/webhook/route.ts` (confirmation paiement)

### Correction
Deux options, la plus propre :

**Option A — table de liaison (recommandée)**
1. Nouveau modèle :
   ```prisma
   model ProductBundleComponent {
     id              String         @id @default(cuid())
     bundleVariantId String
     componentVariantId String
     quantity        Int            @default(1)
     bundleVariant   ProductVariant @relation("BundleOf", fields: [bundleVariantId], references: [id])
     componentVariant ProductVariant @relation("ComponentOf", fields: [componentVariantId], references: [id])
     @@unique([bundleVariantId, componentVariantId])
   }
   ```
2. UI admin : sur la fiche d'une variante (ensemble blanc taille M par ex.), une case « Ceci est un ensemble » + un sélecteur multi-variantes pour choisir la veste blanche M et le jogging blanc M associés.
3. Logique de décrément stock (au webhook Stripe `PAID`) : pour chaque `OrderItem`, si la variante a des `ProductBundleComponent`, décrémenter aussi chaque composant par `orderItem.quantity * component.quantity`.
4. Faire pareil pour la ré-incrémentation lors d'un refund/cancel.

**Option B — checkbox simple**
Ajouter sur `Product` un flag `isBundle: Boolean` + un champ `bundleComponentProductIds: String[]` (moins granulaire — pas par variante/taille). À éviter si les ensembles sont déclinés en tailles.

---

## 5. Photos pour les pop-ups

### Ce qui se passe
Le modèle `Popup` (prisma/schema.prisma ~ lignes 528-562) n'a pas de champ image, et `src/app/admin/popups/page.tsx` n'a aucun upload/preview.

### Correction
1. Ajouter à `Popup` :
   ```prisma
   image String?  // URL ou chemin /uploads/...
   ```
2. Dans `src/app/admin/popups/page.tsx`, ajouter un champ upload d'image (réutiliser `ImageBrowserModal` / `POST /api/admin/images/upload` déjà existant pour les produits).
3. Côté front, afficher l'image dans le composant de pop-up (`DynamicPopup` ou équivalent).
4. Migration Prisma.

---

## 6. Ajouter « Nos concours » au-dessus des concours

### Ce qui se passe
Dans `src/app/concours/page.tsx` (autour de la ligne 286), il y a bien un titre dynamique `{t.concoursActiveContests}`, mais le texte demandé « Nos concours » n'est peut-être pas la traduction active ou pas assez mis en avant.

### Correction
Ajouter un titre explicite, visible, au-dessus du grid des concours :
```tsx
<h2 className="text-3xl font-bold text-center mb-8">Nos concours</h2>
```
Placé juste avant le bloc qui `.map()` les concours actifs dans `src/app/concours/page.tsx`.

---

## 7. Tri des tailles S, M, L, XL sur la fiche produit

### Ce qui se passe
D'après l'audit, `src/app/products/[id]/page.tsx` (lignes ~534-557) possède déjà un tri :
```ts
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
```
À vérifier : si ce tri est bien appliqué à l'affichage **et** que les composants `ProductCard` / `ProductGrid` l'appliquent aussi si ces derniers montrent des tailles.

### Correction (si besoin)
1. S'assurer que la liste des tailles est triée via `SIZE_ORDER` avant chaque `.map()` d'affichage.
2. Extraire `SIZE_ORDER` dans un fichier partagé (`src/lib/sizes.ts`) et l'importer partout où des tailles sont listées : fiche produit, carte produit, filtres, back-office.

---

## 8. Jauge cliquable + animation vers le concours correspondant

### Ce qui se passe
`src/lib/gauge.ts` contient juste la configuration des paliers (70€, 150€). La jauge affichée (probablement dans `src/components/cart/CartDrawer.tsx`) n'a ni `onClick`, ni lien, ni animation de mise en avant entre un palier et son concours.

### Correction
1. Sur chaque palier de la jauge, ajouter un handler :
   - Clic sur 70€ → `router.push('/concours?focus=bonnet')` (ou l'id du concours bonnet)
   - Clic sur 150€ → `router.push('/concours?focus=veste')`
2. Sur `/concours`, lire le param `focus` et appliquer une animation (ex. ring pulsant Tailwind `animate-pulse` + scroll-into-view) sur la carte du concours ciblé pendant 2-3 secondes.
3. Optionnel au survol : afficher une mini-preview du concours lié (tooltip avec l'image/nom du lot).
4. Configuration : ajouter sur `GaugeTier` un champ `contestId?: string` pour que la liaison soit paramétrable depuis `src/app/admin/jauge/` plutôt que codée en dur.

---

## 9. Supprimer les commandes test de Chloé Thiel (sauf celle du sticker)

### Ce qui se passe
De nombreuses commandes de test ont été passées au nom de Chloé Thiel. Il faut toutes les supprimer **sauf** la vraie commande du sticker.

### Correction
Créer un script ponctuel `scripts/delete-chloe-test-orders.ts` :
1. Lister : `prisma.order.findMany({ where: { customerFirstName: { equals: 'Chloe', mode: 'insensitive' }, customerLastName: { equals: 'Thiel', mode: 'insensitive' } }, include: { items: { include: { product: true } } } })`.
2. Afficher chaque commande avec ID, total, date, items — pour validation manuelle.
3. Marquer à conserver : la commande qui ne contient **que** des stickers.
4. Pour les autres : supprimer les `ContestEntry`, `OrderItem`, puis l'`Order` (ordre important à cause des FK), ou utiliser `onDelete: Cascade` si déjà configuré.
5. Lancer avec un flag `--dry-run` d'abord pour confirmation.

Alternative plus sûre : passer par l'UI admin `src/app/admin/orders/page.tsx` et supprimer manuellement chaque commande, une fois l'ID de la commande sticker notée.

---

## 10. Ajouter manuellement des participants aux concours

### Ce qui se passe
Le modèle `ContestEntry` (prisma/schema.prisma ~609-623) exige un `orderId`. Aucune UI ni endpoint ne permet d'ajouter à la main une personne qui a acheté hors site.

### Correction
1. Prisma : rendre `orderId` optionnel sur `ContestEntry` et ajouter :
   ```prisma
   manualName  String?
   manualEmail String?
   manualNote  String?
   addedByUserId String?
   ```
2. Nouvel endpoint `POST /api/admin/contests/[id]/entries` :
   - Body : `{ name, email?, note? }`
   - Crée une `ContestEntry` avec `orderId: null`, en associant le user si `email` matche, sinon en stockant `manualName`/`manualEmail`.
3. UI : dans `src/app/admin/contests/page.tsx`, sur la page de gestion d'un concours, ajouter un bouton « Ajouter un participant manuellement » ouvrant une petite modale (nom, email optionnel, note).
4. Affichage de la liste des participants : afficher « Manuel » pour distinguer ces entrées des entrées automatiques liées à une commande.

---

## Ordre de traitement suggéré

| Priorité | Soucis | Raison |
|----------|--------|--------|
| P0 (critique, bugs qui impactent l'usage) | 1, 2, 3 | Données incorrectes / business broken |
| P1 (fonctionnel) | 4, 9 | Stock & ménage data |
| P2 (UX admin) | 5, 10 | Amélioration admin |
| P3 (UX public) | 6, 7, 8 | Polish front |

---

## Migrations Prisma à prévoir

- `Upsell.requiredProductIds String[]` (soucis 2)
- `Popup.image String?` (soucis 5)
- Nouveau modèle `ProductBundleComponent` (soucis 4)
- `ContestEntry.orderId String?` (optional) + `manualName`, `manualEmail`, `manualNote`, `addedByUserId` (soucis 10)
- Éventuel `GaugeTier.contestId String?` (soucis 8)

Toutes à regrouper idéalement en une seule migration pour limiter les redeploys.
