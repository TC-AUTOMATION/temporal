/**
 * Script READ-ONLY : inspecte l'état actuel de la base PostgreSQL
 * pour comparer avec le schéma Prisma attendu.
 *
 * AUCUNE MODIFICATION N'EST FAITE - lecture seule via information_schema.
 *
 * Usage : npx tsx scripts/check-schema-state.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

async function columnExists(
  table: string,
  column: string
): Promise<ColumnInfo | null> {
  const rows = await prisma.$queryRawUnsafe<ColumnInfo[]>(
    `SELECT column_name, data_type, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_name = $1 AND column_name = $2`,
    table,
    column
  );
  return rows.length > 0 ? rows[0] : null;
}

async function tableExists(table: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = $1`,
    table
  );
  return rows.length > 0;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(' ÉTAT ACTUEL DE LA BASE vs SCHÉMA PRISMA (lecture seule)');
  console.log('═══════════════════════════════════════════════════════════\n');

  // 1. Upsell.freeRequiredProductIds
  const c1 = await columnExists('upsells', 'freeRequiredProductIds');
  console.log('Upsell.freeRequiredProductIds :', c1 ? 'PRÉSENT' : 'MANQUANT');
  if (c1) console.log('  →', c1);

  // 2. ProductVariant.isBundle
  const c2 = await columnExists('product_variants', 'isBundle');
  console.log('ProductVariant.isBundle       :', c2 ? 'PRÉSENT' : 'MANQUANT');
  if (c2) console.log('  →', c2);

  // 3. Table ProductBundleComponent
  const t3 = await tableExists('product_bundle_components');
  console.log('Table product_bundle_components:', t3 ? 'PRÉSENTE' : 'MANQUANTE');

  // 4. Popup.image
  const c4 = await columnExists('popups', 'image');
  console.log('Popup.image                   :', c4 ? 'PRÉSENT' : 'MANQUANT');
  if (c4) console.log('  →', c4);

  // 5. ContestEntry fields
  const ce1 = await columnExists('contest_entries', 'userId');
  const ce2 = await columnExists('contest_entries', 'orderId');
  const ce3 = await columnExists('contest_entries', 'orderTotal');
  const ce4 = await columnExists('contest_entries', 'manualName');
  const ce5 = await columnExists('contest_entries', 'manualEmail');
  const ce6 = await columnExists('contest_entries', 'manualNote');
  const ce7 = await columnExists('contest_entries', 'addedByAdminId');

  console.log('\n--- contest_entries ---');
  console.log(
    'userId            :',
    ce1 ? `nullable=${ce1.is_nullable}` : 'MANQUANT'
  );
  console.log(
    'orderId           :',
    ce2 ? `nullable=${ce2.is_nullable}` : 'MANQUANT'
  );
  console.log(
    'orderTotal        :',
    ce3 ? `nullable=${ce3.is_nullable}` : 'MANQUANT'
  );
  console.log('manualName        :', ce4 ? 'PRÉSENT' : 'MANQUANT');
  console.log('manualEmail       :', ce5 ? 'PRÉSENT' : 'MANQUANT');
  console.log('manualNote        :', ce6 ? 'PRÉSENT' : 'MANQUANT');
  console.log('addedByAdminId    :', ce7 ? 'PRÉSENT' : 'MANQUANT');

  // Count real data to know what we're working with
  console.log('\n--- Données existantes (pour info) ---');
  const counts = await prisma.$queryRawUnsafe<
    { table_name: string; row_count: bigint }[]
  >(`
    SELECT 'orders' AS table_name, COUNT(*)::bigint AS row_count FROM orders
    UNION ALL
    SELECT 'contest_entries', COUNT(*)::bigint FROM contest_entries
    UNION ALL
    SELECT 'upsells', COUNT(*)::bigint FROM upsells
    UNION ALL
    SELECT 'product_variants', COUNT(*)::bigint FROM product_variants
    UNION ALL
    SELECT 'popups', COUNT(*)::bigint FROM popups
  `);
  for (const row of counts) {
    console.log(`  ${row.table_name.padEnd(20)} ${row.row_count} lignes`);
  }

  await prisma.$disconnect();
  console.log('\n✓ Vérification terminée. Aucune modification effectuée.');
}

main().catch((e) => {
  console.error('Erreur:', e);
  prisma.$disconnect();
  process.exit(1);
});
