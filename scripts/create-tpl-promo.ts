/**
 * Creates the TPL dynamic promo code:
 *  - Type: PER_TRANCHE
 *  - -5€ per 100€ tranche
 *  - Limited to the next 30 orders
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const code = 'TPL';
  const existing = await prisma.promoCode.findUnique({ where: { code } });

  if (existing) {
    const updated = await prisma.promoCode.update({
      where: { code },
      data: {
        type: 'PER_TRANCHE',
        value: 5,
        trancheSize: 100,
        maxUses: 30,
        isActive: true,
        validFrom: new Date(),
        validUntil: null,
        // Reset usedCount only if you really want to restart — comment out otherwise.
        // usedCount: 0,
      },
    });
    console.log('Updated existing promo TPL:', updated);
    return;
  }

  const promo = await prisma.promoCode.create({
    data: {
      code,
      type: 'PER_TRANCHE',
      value: 5,
      trancheSize: 100,
      maxUses: 30,
      isActive: true,
      validFrom: new Date(),
    },
  });

  console.log('Created promo TPL:', promo);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
