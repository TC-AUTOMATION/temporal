-- Migration 004 : promos à paliers (TIERED) et promos automatiques.
-- 100 % additive et idempotente.

ALTER TYPE "PromoType" ADD VALUE IF NOT EXISTS 'TIERED';

ALTER TABLE "promo_codes" ADD COLUMN IF NOT EXISTS "isAutomatic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "promo_codes" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "promo_codes" ADD COLUMN IF NOT EXISTS "rules" JSONB;
