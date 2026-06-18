import { prisma } from '@/lib/db/prisma';

/**
 * Replace every database reference of one image URL with another, across all
 * models that can hold image paths (products, packs, popups, upsells,
 * categories, contests). Returns the number of records updated.
 */
export async function replaceImageReferences(from: string, to: string): Promise<number> {
  if (!from || !to || from === to) return 0;

  let updated = 0;

  // Products (images array)
  const products = await prisma.product.findMany({
    where: { images: { has: from } },
    select: { id: true, images: true },
  });
  for (const p of products) {
    await prisma.product.update({
      where: { id: p.id },
      data: { images: p.images.map((img) => (img === from ? to : img)) },
    });
    updated++;
  }

  // Packs (image + images array)
  const packs = await prisma.pack.findMany({
    where: { OR: [{ image: from }, { images: { has: from } }] },
    select: { id: true, image: true, images: true },
  });
  for (const p of packs) {
    await prisma.pack.update({
      where: { id: p.id },
      data: {
        image: p.image === from ? to : p.image,
        images: p.images.map((img) => (img === from ? to : img)),
      },
    });
    updated++;
  }

  // Popups (image + images array)
  const popups = await prisma.popup.findMany({
    where: { OR: [{ image: from }, { images: { has: from } }] },
    select: { id: true, image: true, images: true },
  });
  for (const p of popups) {
    await prisma.popup.update({
      where: { id: p.id },
      data: {
        image: p.image === from ? to : p.image,
        images: p.images.map((img) => (img === from ? to : img)),
      },
    });
    updated++;
  }

  // Single-image models
  updated += (await prisma.upsell.updateMany({ where: { image: from }, data: { image: to } })).count;
  updated += (await prisma.category.updateMany({ where: { image: from }, data: { image: to } })).count;
  updated += (await prisma.contest.updateMany({ where: { prizeImage: from }, data: { prizeImage: to } })).count;

  return updated;
}
