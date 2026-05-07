-- ============================================================================
-- Migration additive NON-DESTRUCTIVE
-- ----------------------------------------------------------------------------
-- Aucune donnée existante n'est supprimée ou modifiée.
-- Toutes les opérations sont idempotentes (IF NOT EXISTS, DROP NOT NULL).
-- Le tout est wrappé dans une transaction : si un seul statement échoue,
-- rien n'est appliqué (ROLLBACK automatique).
--
-- Ce qui est ajouté :
--   1. upsells.freeRequiredProductIds (text[] default '{}')
--   2. product_variants.isBundle (boolean default false)
--   3. Table product_bundle_components (nouvelle table)
--   4. popups.image (text nullable)
--   5. contest_entries : rendre userId, orderId, orderTotal NULLABLE
--   6. contest_entries : ajouter manualName, manualEmail, manualNote, addedByAdminId
-- ============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Upsells : produits requis pour l'offre gratuite (sac de lavage, etc.)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "upsells"
  ADD COLUMN IF NOT EXISTS "freeRequiredProductIds" TEXT[] NOT NULL DEFAULT '{}';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. ProductVariant.isBundle (marque les ensembles)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "product_variants"
  ADD COLUMN IF NOT EXISTS "isBundle" BOOLEAN NOT NULL DEFAULT FALSE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Table product_bundle_components (relation bundle ↔ composants)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "product_bundle_components" (
  "id"                 TEXT PRIMARY KEY,
  "bundleVariantId"    TEXT NOT NULL,
  "componentVariantId" TEXT NOT NULL,
  "quantity"           INTEGER NOT NULL DEFAULT 1
);

-- Contraintes et index (idempotents via DO blocks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_bundle_components_bundleVariantId_componentVariantId_key'
  ) THEN
    ALTER TABLE "product_bundle_components"
      ADD CONSTRAINT "product_bundle_components_bundleVariantId_componentVariantId_key"
      UNIQUE ("bundleVariantId", "componentVariantId");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_bundle_components_bundleVariantId_fkey'
  ) THEN
    ALTER TABLE "product_bundle_components"
      ADD CONSTRAINT "product_bundle_components_bundleVariantId_fkey"
      FOREIGN KEY ("bundleVariantId") REFERENCES "product_variants"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_bundle_components_componentVariantId_fkey'
  ) THEN
    ALTER TABLE "product_bundle_components"
      ADD CONSTRAINT "product_bundle_components_componentVariantId_fkey"
      FOREIGN KEY ("componentVariantId") REFERENCES "product_variants"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "product_bundle_components_bundleVariantId_idx"
  ON "product_bundle_components"("bundleVariantId");
CREATE INDEX IF NOT EXISTS "product_bundle_components_componentVariantId_idx"
  ON "product_bundle_components"("componentVariantId");

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Popups : champ image optionnel
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "popups"
  ADD COLUMN IF NOT EXISTS "image" TEXT;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. ContestEntry : rendre userId, orderId, orderTotal NULLABLE
--    (les participations manuelles n'ont pas de user/order associé)
--    DROP NOT NULL est une opération métadonnée seule, aucune donnée touchée.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "contest_entries" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "contest_entries" ALTER COLUMN "orderId" DROP NOT NULL;
ALTER TABLE "contest_entries" ALTER COLUMN "orderTotal" DROP NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. ContestEntry : nouveaux champs manuels
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "contest_entries"
  ADD COLUMN IF NOT EXISTS "manualName"     TEXT,
  ADD COLUMN IF NOT EXISTS "manualEmail"    TEXT,
  ADD COLUMN IF NOT EXISTS "manualNote"     TEXT,
  ADD COLUMN IF NOT EXISTS "addedByAdminId" TEXT;

COMMIT;
