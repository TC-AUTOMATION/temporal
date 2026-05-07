/**
 * Applique la migration additive non-destructive.
 *
 * ÉTAPES DE SÉCURITÉ :
 *   1. Mode dry-run par défaut : affiche ce qui va être fait sans rien modifier
 *   2. Utiliser --confirm pour réellement appliquer
 *   3. Toutes les instructions sont idempotentes (IF NOT EXISTS, DROP NOT NULL)
 *   4. Le tout est exécuté dans prisma.$transaction([...]) :
 *      si une seule instruction échoue, toutes sont rollback automatiquement.
 *
 * Usage :
 *   npx tsx scripts/apply-migration.ts            # dry-run
 *   npx tsx scripts/apply-migration.ts --confirm  # applique réellement
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Liste explicite des instructions SQL, une par entrée.
 * Chacune est idempotente : relancer le script ne casse rien.
 * Exécutées dans un prisma.$transaction : atomique (tout ou rien).
 */
const STATEMENTS: { label: string; sql: string }[] = [
  {
    label: '1.  upsells.freeRequiredProductIds',
    sql: `ALTER TABLE "upsells"
          ADD COLUMN IF NOT EXISTS "freeRequiredProductIds" TEXT[] NOT NULL DEFAULT '{}'`,
  },
  {
    label: '2.  product_variants.isBundle',
    sql: `ALTER TABLE "product_variants"
          ADD COLUMN IF NOT EXISTS "isBundle" BOOLEAN NOT NULL DEFAULT FALSE`,
  },
  {
    label: '3a. CREATE TABLE product_bundle_components',
    sql: `CREATE TABLE IF NOT EXISTS "product_bundle_components" (
            "id"                 TEXT PRIMARY KEY,
            "bundleVariantId"    TEXT NOT NULL,
            "componentVariantId" TEXT NOT NULL,
            "quantity"           INTEGER NOT NULL DEFAULT 1
          )`,
  },
  {
    label: '3b. UNIQUE(bundleVariantId, componentVariantId)',
    sql: `DO $do$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint
              WHERE conname = 'product_bundle_components_bundleVariantId_componentVariantId_key'
            ) THEN
              ALTER TABLE "product_bundle_components"
                ADD CONSTRAINT "product_bundle_components_bundleVariantId_componentVariantId_key"
                UNIQUE ("bundleVariantId", "componentVariantId");
            END IF;
          END $do$`,
  },
  {
    label: '3c. FK bundleVariantId → product_variants(id)',
    sql: `DO $do$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint
              WHERE conname = 'product_bundle_components_bundleVariantId_fkey'
            ) THEN
              ALTER TABLE "product_bundle_components"
                ADD CONSTRAINT "product_bundle_components_bundleVariantId_fkey"
                FOREIGN KEY ("bundleVariantId") REFERENCES "product_variants"("id")
                ON DELETE CASCADE ON UPDATE CASCADE;
            END IF;
          END $do$`,
  },
  {
    label: '3d. FK componentVariantId → product_variants(id)',
    sql: `DO $do$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint
              WHERE conname = 'product_bundle_components_componentVariantId_fkey'
            ) THEN
              ALTER TABLE "product_bundle_components"
                ADD CONSTRAINT "product_bundle_components_componentVariantId_fkey"
                FOREIGN KEY ("componentVariantId") REFERENCES "product_variants"("id")
                ON DELETE CASCADE ON UPDATE CASCADE;
            END IF;
          END $do$`,
  },
  {
    label: '3e. INDEX bundleVariantId',
    sql: `CREATE INDEX IF NOT EXISTS "product_bundle_components_bundleVariantId_idx"
          ON "product_bundle_components"("bundleVariantId")`,
  },
  {
    label: '3f. INDEX componentVariantId',
    sql: `CREATE INDEX IF NOT EXISTS "product_bundle_components_componentVariantId_idx"
          ON "product_bundle_components"("componentVariantId")`,
  },
  {
    label: '4.  popups.image',
    sql: `ALTER TABLE "popups" ADD COLUMN IF NOT EXISTS "image" TEXT`,
  },
  {
    label: '5a. contest_entries.userId → NULLABLE',
    sql: `ALTER TABLE "contest_entries" ALTER COLUMN "userId" DROP NOT NULL`,
  },
  {
    label: '5b. contest_entries.orderId → NULLABLE',
    sql: `ALTER TABLE "contest_entries" ALTER COLUMN "orderId" DROP NOT NULL`,
  },
  {
    label: '5c. contest_entries.orderTotal → NULLABLE',
    sql: `ALTER TABLE "contest_entries" ALTER COLUMN "orderTotal" DROP NOT NULL`,
  },
  {
    label: '6a. contest_entries.manualName',
    sql: `ALTER TABLE "contest_entries" ADD COLUMN IF NOT EXISTS "manualName" TEXT`,
  },
  {
    label: '6b. contest_entries.manualEmail',
    sql: `ALTER TABLE "contest_entries" ADD COLUMN IF NOT EXISTS "manualEmail" TEXT`,
  },
  {
    label: '6c. contest_entries.manualNote',
    sql: `ALTER TABLE "contest_entries" ADD COLUMN IF NOT EXISTS "manualNote" TEXT`,
  },
  {
    label: '6d. contest_entries.addedByAdminId',
    sql: `ALTER TABLE "contest_entries" ADD COLUMN IF NOT EXISTS "addedByAdminId" TEXT`,
  },
];

async function showCurrentState() {
  console.log('\n┌─────────────────────────────────────────────┐');
  console.log('│  État de la base (lecture seule)            │');
  console.log('└─────────────────────────────────────────────┘');

  const checks = [
    { t: 'upsells', c: 'freeRequiredProductIds' },
    { t: 'product_variants', c: 'isBundle' },
    { t: 'popups', c: 'image' },
    { t: 'contest_entries', c: 'manualName' },
    { t: 'contest_entries', c: 'manualEmail' },
    { t: 'contest_entries', c: 'manualNote' },
    { t: 'contest_entries', c: 'addedByAdminId' },
  ];

  for (const { t, c } of checks) {
    const rows = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
      t,
      c
    );
    console.log(
      `  ${(t + '.' + c).padEnd(42)} ${rows.length > 0 ? 'PRÉSENT' : 'MANQUANT'}`
    );
  }

  const tbl = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='product_bundle_components'`
  );
  console.log(
    `  Table product_bundle_components           ${tbl.length > 0 ? 'PRÉSENTE' : 'MANQUANTE'}`
  );

  const nullableChecks = ['userId', 'orderId', 'orderTotal'];
  for (const col of nullableChecks) {
    const rows = await prisma.$queryRawUnsafe<{ is_nullable: string }[]>(
      `SELECT is_nullable FROM information_schema.columns WHERE table_name='contest_entries' AND column_name=$1`,
      col
    );
    const nullable = rows[0]?.is_nullable === 'YES';
    console.log(
      `  contest_entries.${col.padEnd(26)} ${nullable ? 'NULLABLE' : 'NOT NULL'}`
    );
  }

  const counts = await prisma.$queryRawUnsafe<{ n: string; c: bigint }[]>(`
    SELECT 'orders' AS n, COUNT(*)::bigint AS c FROM orders UNION ALL
    SELECT 'contest_entries', COUNT(*)::bigint FROM contest_entries UNION ALL
    SELECT 'upsells', COUNT(*)::bigint FROM upsells UNION ALL
    SELECT 'product_variants', COUNT(*)::bigint FROM product_variants UNION ALL
    SELECT 'popups', COUNT(*)::bigint FROM popups
  `);
  console.log('\n  Données (inchangées par la migration) :');
  for (const r of counts) {
    console.log(`    ${r.n.padEnd(20)} ${r.c} lignes`);
  }
}

async function apply() {
  console.log('\n┌─────────────────────────────────────────────┐');
  console.log('│  APPLICATION atomique ($transaction)        │');
  console.log('└─────────────────────────────────────────────┘\n');

  // prisma.$transaction accepte un tableau de promesses. Si une échoue,
  // toutes sont rollback automatiquement.
  const queries = STATEMENTS.map((s) => prisma.$executeRawUnsafe(s.sql));

  try {
    await prisma.$transaction(queries);
    console.log('Chaque instruction a été exécutée avec succès :');
    for (const s of STATEMENTS) {
      console.log(`  ✓ ${s.label}`);
    }
    console.log('\n✓ Migration appliquée intégralement.');
  } catch (e) {
    console.error('\n✗ Erreur — ROLLBACK automatique, aucune modif appliquée.');
    console.error(e);
    throw e;
  }
}

async function main() {
  const confirm = process.argv.includes('--confirm');

  await showCurrentState();

  if (!confirm) {
    console.log('\n┌─────────────────────────────────────────────┐');
    console.log('│  DRY-RUN : aucune modification appliquée    │');
    console.log('└─────────────────────────────────────────────┘');
    console.log('\nInstructions qui seraient exécutées :');
    for (const s of STATEMENTS) {
      console.log(`  • ${s.label}`);
    }
    console.log(
      '\nPour appliquer réellement :\n  npx tsx scripts/apply-migration.ts --confirm\n'
    );
  } else {
    console.log('\n⚠  Mode --confirm activé. Application en cours...');
    await apply();

    console.log('\n┌─────────────────────────────────────────────┐');
    console.log('│  État APRÈS migration                       │');
    console.log('└─────────────────────────────────────────────┘');
    await showCurrentState();
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
