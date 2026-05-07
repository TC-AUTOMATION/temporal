/**
 * Applique la migration 002 : `images String[]` sur Pack et Popup.
 *
 * SÉCURITÉ :
 *   - Mode dry-run par défaut (lecture seule)
 *   - --confirm pour appliquer
 *   - Instructions idempotentes (IF NOT EXISTS)
 *   - prisma.$transaction : atomique (tout ou rien)
 *
 * Usage :
 *   npx tsx scripts/apply-pack-popup-images.ts            # dry-run
 *   npx tsx scripts/apply-pack-popup-images.ts --confirm  # exécution
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STATEMENTS: { label: string; sql: string }[] = [
  {
    label: 'packs.images',
    sql: `ALTER TABLE "packs"
          ADD COLUMN IF NOT EXISTS "images" TEXT[] NOT NULL DEFAULT '{}'`,
  },
  {
    label: 'popups.images',
    sql: `ALTER TABLE "popups"
          ADD COLUMN IF NOT EXISTS "images" TEXT[] NOT NULL DEFAULT '{}'`,
  },
];

async function showState() {
  console.log('\n┌─────────────────────────────────────────────┐');
  console.log('│  État actuel (lecture seule)                │');
  console.log('└─────────────────────────────────────────────┘');

  const checks = [
    { t: 'packs', c: 'images' },
    { t: 'popups', c: 'images' },
  ];

  for (const { t, c } of checks) {
    const rows = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
      t,
      c
    );
    console.log(
      `  ${(t + '.' + c).padEnd(30)} ${rows.length > 0 ? 'PRÉSENT' : 'MANQUANT'}`
    );
  }
}

async function main() {
  const confirm = process.argv.includes('--confirm');

  await showState();

  if (!confirm) {
    console.log('\n┌─────────────────────────────────────────────┐');
    console.log('│  DRY-RUN : aucune modification appliquée    │');
    console.log('└─────────────────────────────────────────────┘');
    console.log('\nInstructions qui seraient exécutées :');
    for (const s of STATEMENTS) console.log(`  • ${s.label}`);
    console.log('\nPour appliquer :\n  npx tsx scripts/apply-pack-popup-images.ts --confirm\n');
    await prisma.$disconnect();
    return;
  }

  console.log('\n⚠  Mode --confirm activé. Application en cours...\n');

  const queries = STATEMENTS.map((s) => prisma.$executeRawUnsafe(s.sql));

  try {
    await prisma.$transaction(queries);
    console.log('Chaque instruction exécutée :');
    for (const s of STATEMENTS) console.log(`  ✓ ${s.label}`);
  } catch (e) {
    console.error('\n✗ ROLLBACK automatique, aucune modif appliquée.');
    console.error(e);
    throw e;
  }

  await showState();
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
