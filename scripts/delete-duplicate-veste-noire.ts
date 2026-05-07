/**
 * Supprime les doublons "veste noire" en base.
 *
 * SÉCURITÉ :
 *   1. Mode dry-run par défaut : affiche ce qui va être supprimé sans rien modifier
 *   2. Utiliser --confirm pour réellement supprimer
 *   3. Refuse de supprimer un produit qui a des orderItems liés (FK historique)
 *   4. Suppression dans une transaction : tout ou rien
 *
 * Usage :
 *   npx tsx scripts/delete-duplicate-veste-noire.ts            # dry-run
 *   npx tsx scripts/delete-duplicate-veste-noire.ts --confirm  # exécution
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const confirm = process.argv.includes('--confirm');

  console.log('\n┌─────────────────────────────────────────────┐');
  console.log('│  Recherche des doublons "veste noire"       │');
  console.log('└─────────────────────────────────────────────┘\n');

  // Find candidates: name ILIKE 'veste noire' OR slug containing 'veste-noire'
  const candidates = await prisma.product.findMany({
    where: {
      OR: [
        { name: { equals: 'veste noire', mode: 'insensitive' } },
        { slug: { contains: 'veste-noire' } },
      ],
    },
    include: {
      _count: {
        select: {
          orderItems: true,
          packItems: true,
        },
      },
      variants: {
        select: {
          id: true,
          sku: true,
          color: true,
          size: true,
          stock: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (candidates.length === 0) {
    console.log('Aucun produit "veste noire" trouvé. Rien à faire.');
    await prisma.$disconnect();
    return;
  }

  console.log(`${candidates.length} candidat(s) trouvé(s) :\n`);

  for (const c of candidates) {
    // Get bundle component count for the product's variants (both directions)
    const variantIds = c.variants.map((v) => v.id);
    const bundleAsBundle = variantIds.length
      ? await prisma.productBundleComponent.count({
          where: { bundleVariantId: { in: variantIds } },
        })
      : 0;
    const bundleAsComponent = variantIds.length
      ? await prisma.productBundleComponent.count({
          where: { componentVariantId: { in: variantIds } },
        })
      : 0;

    console.log(`  • ${c.name} (slug: ${c.slug})`);
    console.log(`    id           : ${c.id}`);
    console.log(`    sku          : ${c.sku}`);
    console.log(`    createdAt    : ${c.createdAt.toISOString()}`);
    console.log(`    variants     : ${c.variants.length}`);
    console.log(`    orderItems   : ${c._count.orderItems}`);
    console.log(`    packItems    : ${c._count.packItems}`);
    console.log(`    bundleParts  : ${bundleAsBundle + bundleAsComponent}`);
    console.log('');
  }

  if (candidates.length === 1) {
    console.log(
      'Un seul candidat — pas de doublon à supprimer. Si c\'est volontaire, supprime-le manuellement via l\'admin.'
    );
    await prisma.$disconnect();
    return;
  }

  // Identify the keeper (oldest, with most orderItems) and the duplicates
  // Strategy: keep the one with the most orderItems (or oldest if tie).
  const sorted = [...candidates].sort((a, b) => {
    const oA = a._count.orderItems;
    const oB = b._count.orderItems;
    if (oA !== oB) return oB - oA; // most orders first
    return a.createdAt.getTime() - b.createdAt.getTime(); // oldest first
  });

  const keeper = sorted[0];
  const duplicates = sorted.slice(1);

  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  Décision                                   │');
  console.log('└─────────────────────────────────────────────┘');
  console.log(`  GARDER     : ${keeper.name} — ${keeper.id} (${keeper._count.orderItems} orderItems)`);
  for (const d of duplicates) {
    console.log(`  SUPPRIMER  : ${d.name} — ${d.id} (${d._count.orderItems} orderItems)`);
  }
  console.log('');

  // Block deletion if any duplicate has orderItems
  const blocked = duplicates.filter((d) => d._count.orderItems > 0);
  if (blocked.length > 0) {
    console.log('⚠  IMPOSSIBLE de supprimer : certains doublons ont des orderItems liés (historique de commandes).');
    console.log('    Pour ces produits, mets-les en isActive=false depuis l\'admin à la place.');
    for (const b of blocked) {
      console.log(`      - ${b.name} (${b.id}) : ${b._count.orderItems} orderItems`);
    }
    await prisma.$disconnect();
    return;
  }

  if (!confirm) {
    console.log('┌─────────────────────────────────────────────┐');
    console.log('│  DRY-RUN : aucune suppression appliquée     │');
    console.log('└─────────────────────────────────────────────┘');
    console.log('\nPour supprimer réellement :\n  npx tsx scripts/delete-duplicate-veste-noire.ts --confirm\n');
    await prisma.$disconnect();
    return;
  }

  console.log('⚠  Mode --confirm activé. Suppression en cours...\n');

  for (const d of duplicates) {
    const variantIds = d.variants.map((v) => v.id);

    try {
      await prisma.$transaction(async (tx) => {
        // Remove bundle components (both directions)
        if (variantIds.length > 0) {
          await tx.productBundleComponent.deleteMany({
            where: { bundleVariantId: { in: variantIds } },
          });
          await tx.productBundleComponent.deleteMany({
            where: { componentVariantId: { in: variantIds } },
          });
        }

        // Remove pack items pointing to this product
        await tx.packItem.deleteMany({ where: { productId: d.id } });

        // Delete the product (cascade on variants/wishlist)
        await tx.product.delete({ where: { id: d.id } });
      });
      console.log(`  ✓ Supprimé : ${d.name} (${d.id})`);
    } catch (e) {
      console.error(`  ✗ Échec sur ${d.name} (${d.id}) :`, e);
    }
  }

  console.log('\n✓ Terminé.');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
