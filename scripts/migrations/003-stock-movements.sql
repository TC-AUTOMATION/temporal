-- Migration 003 : historique des mouvements de stock (table stock_movements).
-- 100 % additive et idempotente : aucune table existante n'est modifiée.

DO $$ BEGIN
  CREATE TYPE "StockMovementSource" AS ENUM ('AUTO', 'MANUAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "StockMovementReason" AS ENUM ('ORDER', 'ORDER_CANCELLED', 'ORDER_REFUNDED', 'MANUAL_ADJUSTMENT', 'PRODUCT_EDIT', 'INITIAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "stock_movements" (
  "id"          TEXT NOT NULL,
  "variantId"   TEXT,
  "productId"   TEXT,
  "productName" TEXT NOT NULL,
  "sku"         TEXT,
  "color"       TEXT,
  "size"        TEXT,
  "delta"       INTEGER NOT NULL,
  "stockBefore" INTEGER,
  "stockAfter"  INTEGER,
  "source"      "StockMovementSource" NOT NULL,
  "reason"      "StockMovementReason" NOT NULL,
  "orderId"     TEXT,
  "orderNumber" TEXT,
  "userId"      TEXT,
  "userName"    TEXT,
  "note"        TEXT,
  "isBackfill"  BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "stock_movements_variantId_createdAt_idx" ON "stock_movements"("variantId", "createdAt");
CREATE INDEX IF NOT EXISTS "stock_movements_productId_createdAt_idx" ON "stock_movements"("productId", "createdAt");
CREATE INDEX IF NOT EXISTS "stock_movements_orderId_idx" ON "stock_movements"("orderId");
CREATE INDEX IF NOT EXISTS "stock_movements_source_idx" ON "stock_movements"("source");
CREATE INDEX IF NOT EXISTS "stock_movements_createdAt_idx" ON "stock_movements"("createdAt");

DO $$ BEGIN
  ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
