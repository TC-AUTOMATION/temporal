-- Migration 002 : ajout de la colonne `images String[]` aux modèles Pack et Popup.
-- Idempotent : peut être relancé sans casse (IF NOT EXISTS).
-- La colonne legacy `image String?` est conservée pour compatibilité descendante.

ALTER TABLE "packs"
  ADD COLUMN IF NOT EXISTS "images" TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE "popups"
  ADD COLUMN IF NOT EXISTS "images" TEXT[] NOT NULL DEFAULT '{}';
