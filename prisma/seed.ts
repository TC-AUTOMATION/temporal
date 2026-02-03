import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'vestes' },
      update: {},
      create: {
        name: 'Vestes',
        slug: 'vestes',
        description: 'Vestes streetwear premium',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'tshirts' },
      update: {},
      create: {
        name: 'T-Shirts',
        slug: 'tshirts',
        description: 'T-shirts en coton premium',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'pantalons' },
      update: {},
      create: {
        name: 'Pantalons',
        slug: 'pantalons',
        description: 'Joggings et pantalons streetwear',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'accessoires' },
      update: {},
      create: {
        name: 'Accessoires',
        slug: 'accessoires',
        description: 'Bonnets, stickers et plus',
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'ensembles' },
      update: {},
      create: {
        name: 'Ensembles',
        slug: 'ensembles',
        description: 'Looks complets',
        sortOrder: 5,
      },
    }),
  ]);

  console.log(`Created ${categories.length} categories`);

  // Create products with variants
  const vesteNoire = await prisma.product.upsert({
    where: { sku: 'VESTE-TPL-NOIR' },
    update: {},
    create: {
      sku: 'VESTE-TPL-NOIR',
      name: 'Veste Temporal - Noire',
      slug: 'veste-tpl-noir',
      description: 'Veste streetwear premium en noir. Coupe oversize, matériaux de qualité supérieure.',
      modelInfo: 'Le modèle mesure 1m85 et porte une taille L',
      price: 189,
      categoryId: categories[0].id,
      images: [
        '/clothes/veste-face-noire.png',
        '/clothes/veste-dos-noir.png',
      ],
      isFeatured: true,
      variants: {
        create: [
          { sku: 'VESTE-TPL-NOIR-S', color: 'Noir', colorHex: '#000000', size: 'S', stock: 10 },
          { sku: 'VESTE-TPL-NOIR-M', color: 'Noir', colorHex: '#000000', size: 'M', stock: 15 },
          { sku: 'VESTE-TPL-NOIR-L', color: 'Noir', colorHex: '#000000', size: 'L', stock: 12 },
          { sku: 'VESTE-TPL-NOIR-XL', color: 'Noir', colorHex: '#000000', size: 'XL', stock: 8 },
        ],
      },
    },
  });

  const vesteBlanche = await prisma.product.upsert({
    where: { sku: 'VESTE-TPL-BLANC' },
    update: {},
    create: {
      sku: 'VESTE-TPL-BLANC',
      name: 'Veste Temporal - Blanche',
      slug: 'veste-tpl-blanc',
      description: 'Veste streetwear premium en blanc. Coupe oversize, matériaux de qualité supérieure.',
      modelInfo: 'Le modèle mesure 1m85 et porte une taille L',
      price: 189,
      categoryId: categories[0].id,
      images: [
        '/clothes/veste-face-blanche.png',
        '/clothes/veste-dos-blanc.png',
      ],
      isFeatured: true,
      variants: {
        create: [
          { sku: 'VESTE-TPL-BLANC-S', color: 'Blanc', colorHex: '#FFFFFF', size: 'S', stock: 8 },
          { sku: 'VESTE-TPL-BLANC-M', color: 'Blanc', colorHex: '#FFFFFF', size: 'M', stock: 12 },
          { sku: 'VESTE-TPL-BLANC-L', color: 'Blanc', colorHex: '#FFFFFF', size: 'L', stock: 10 },
          { sku: 'VESTE-TPL-BLANC-XL', color: 'Blanc', colorHex: '#FFFFFF', size: 'XL', stock: 6 },
        ],
      },
    },
  });

  const tshirtNoir = await prisma.product.upsert({
    where: { sku: 'TSHIRT-TPL-NOIR' },
    update: {},
    create: {
      sku: 'TSHIRT-TPL-NOIR',
      name: 'T-Shirt Temporal - Noir',
      slug: 'tshirt-tpl-noir',
      description: 'T-shirt en coton bio premium, coupe regular.',
      modelInfo: 'Le modèle mesure 1m80 et porte une taille M',
      price: 45,
      categoryId: categories[1].id,
      images: [
        '/clothes/t-shirt-face-noir.png',
        '/clothes/t-shirt-dos-noir.png',
      ],
      variants: {
        create: [
          { sku: 'TSHIRT-TPL-NOIR-S', color: 'Noir', colorHex: '#000000', size: 'S', stock: 20 },
          { sku: 'TSHIRT-TPL-NOIR-M', color: 'Noir', colorHex: '#000000', size: 'M', stock: 25 },
          { sku: 'TSHIRT-TPL-NOIR-L', color: 'Noir', colorHex: '#000000', size: 'L', stock: 20 },
          { sku: 'TSHIRT-TPL-NOIR-XL', color: 'Noir', colorHex: '#000000', size: 'XL', stock: 15 },
        ],
      },
    },
  });

  const tshirtBlanc = await prisma.product.upsert({
    where: { sku: 'TSHIRT-TPL-BLANC' },
    update: {},
    create: {
      sku: 'TSHIRT-TPL-BLANC',
      name: 'T-Shirt Temporal - Blanc',
      slug: 'tshirt-tpl-blanc',
      description: 'T-shirt en coton bio premium, coupe regular.',
      modelInfo: 'Le modèle mesure 1m80 et porte une taille M',
      price: 45,
      categoryId: categories[1].id,
      images: [
        '/clothes/t-shirt-face-blanc.png',
        '/clothes/t-shirt-dos-blanc.png',
      ],
      variants: {
        create: [
          { sku: 'TSHIRT-TPL-BLANC-S', color: 'Blanc', colorHex: '#FFFFFF', size: 'S', stock: 18 },
          { sku: 'TSHIRT-TPL-BLANC-M', color: 'Blanc', colorHex: '#FFFFFF', size: 'M', stock: 22 },
          { sku: 'TSHIRT-TPL-BLANC-L', color: 'Blanc', colorHex: '#FFFFFF', size: 'L', stock: 18 },
          { sku: 'TSHIRT-TPL-BLANC-XL', color: 'Blanc', colorHex: '#FFFFFF', size: 'XL', stock: 12 },
        ],
      },
    },
  });

  const joggingNoir = await prisma.product.upsert({
    where: { sku: 'JOGGING-TPL-NOIR' },
    update: {},
    create: {
      sku: 'JOGGING-TPL-NOIR',
      name: 'Jogging Temporal - Noir',
      slug: 'jogging-tpl-noir',
      description: 'Jogging streetwear premium, coupe droite avec finitions de qualité.',
      modelInfo: 'Le modèle mesure 1m82 et porte une taille M',
      price: 89,
      categoryId: categories[2].id,
      images: [
        '/clothes/jogging-avant-noir.png',
        '/clothes/jogging-dos-noir.png',
      ],
      variants: {
        create: [
          { sku: 'JOGGING-TPL-NOIR-S', color: 'Noir', colorHex: '#000000', size: 'S', stock: 12 },
          { sku: 'JOGGING-TPL-NOIR-M', color: 'Noir', colorHex: '#000000', size: 'M', stock: 15 },
          { sku: 'JOGGING-TPL-NOIR-L', color: 'Noir', colorHex: '#000000', size: 'L', stock: 12 },
          { sku: 'JOGGING-TPL-NOIR-XL', color: 'Noir', colorHex: '#000000', size: 'XL', stock: 8 },
        ],
      },
    },
  });

  const joggingBlanc = await prisma.product.upsert({
    where: { sku: 'JOGGING-TPL-BLANC' },
    update: {},
    create: {
      sku: 'JOGGING-TPL-BLANC',
      name: 'Jogging Temporal - Blanc',
      slug: 'jogging-tpl-blanc',
      description: 'Jogging streetwear premium, coupe droite avec finitions de qualité.',
      modelInfo: 'Le modèle mesure 1m82 et porte une taille M',
      price: 89,
      categoryId: categories[2].id,
      images: [
        '/clothes/jogging-avant-blanc.png',
        '/clothes/jogging-dos-blanc.png',
      ],
      variants: {
        create: [
          { sku: 'JOGGING-TPL-BLANC-S', color: 'Blanc', colorHex: '#FFFFFF', size: 'S', stock: 10 },
          { sku: 'JOGGING-TPL-BLANC-M', color: 'Blanc', colorHex: '#FFFFFF', size: 'M', stock: 12 },
          { sku: 'JOGGING-TPL-BLANC-L', color: 'Blanc', colorHex: '#FFFFFF', size: 'L', stock: 10 },
          { sku: 'JOGGING-TPL-BLANC-XL', color: 'Blanc', colorHex: '#FFFFFF', size: 'XL', stock: 6 },
        ],
      },
    },
  });

  const bonnetNoir = await prisma.product.upsert({
    where: { sku: 'BONNET-TPL-NOIR' },
    update: {},
    create: {
      sku: 'BONNET-TPL-NOIR',
      name: 'Bonnet Temporal - Noir',
      slug: 'bonnet-tpl-noir',
      description: 'Bonnet en laine mérinos, logo brodé.',
      price: 35,
      categoryId: categories[3].id,
      images: ['/clothes/bonnet-face-noir.png', '/clothes/bonnet-dos-noir.png'],
      variants: {
        create: [
          { sku: 'BONNET-TPL-NOIR-U', color: 'Noir', colorHex: '#000000', size: 'Unique', stock: 30 },
        ],
      },
    },
  });

  const bonnetBlanc = await prisma.product.upsert({
    where: { sku: 'BONNET-TPL-BLANC' },
    update: {},
    create: {
      sku: 'BONNET-TPL-BLANC',
      name: 'Bonnet Temporal - Blanc',
      slug: 'bonnet-tpl-blanc',
      description: 'Bonnet en laine mérinos, logo brodé.',
      price: 35,
      categoryId: categories[3].id,
      images: ['/clothes/bonnet-face-blanc.png', '/clothes/bonnet-dos-blanc.png'],
      variants: {
        create: [
          { sku: 'BONNET-TPL-BLANC-U', color: 'Blanc', colorHex: '#FFFFFF', size: 'Unique', stock: 25 },
        ],
      },
    },
  });

  const stickers = await prisma.product.upsert({
    where: { sku: 'STICKERS-TPL-PACK' },
    update: {},
    create: {
      sku: 'STICKERS-TPL-PACK',
      name: 'Pack Stickers Temporal',
      slug: 'stickers-tpl-pack',
      description: 'Pack de 6 stickers holographiques Temporal. Inclut toutes les variations de couleurs.',
      price: 12,
      categoryId: categories[3].id,
      images: [
        '/stickers/black-purple.png',
        '/stickers/purple-black.png',
        '/stickers/white-black.png',
        '/stickers/black-white.png',
        '/stickers/purple-white.png',
        '/stickers/white-purple.png',
      ],
      variants: {
        create: [
          { sku: 'STICKERS-TPL-PACK-U', color: 'Multicolore', size: 'Unique', stock: 100 },
        ],
      },
    },
  });

  console.log('Created products:', [
    vesteNoire.name,
    vesteBlanche.name,
    tshirtNoir.name,
    tshirtBlanc.name,
    joggingNoir.name,
    joggingBlanc.name,
    bonnetNoir.name,
    bonnetBlanc.name,
    stickers.name,
  ]);

  // Create promo codes
  await prisma.promoCode.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10,
      maxUses: 100,
      isActive: true,
    },
  });

  await prisma.promoCode.upsert({
    where: { code: 'TEMPORAL20' },
    update: {},
    create: {
      code: 'TEMPORAL20',
      type: 'PERCENTAGE',
      value: 20,
      minPurchase: 100,
      maxDiscount: 50,
      maxUses: 50,
      isActive: true,
    },
  });

  await prisma.promoCode.upsert({
    where: { code: 'FREESHIP' },
    update: {},
    create: {
      code: 'FREESHIP',
      type: 'FREE_SHIPPING',
      value: 5.9,
      minPurchase: 80,
      isActive: true,
    },
  });

  console.log('Created promo codes');

  // Create default settings
  await prisma.setting.upsert({
    where: { key: 'shop_name' },
    update: {},
    create: {
      key: 'shop_name',
      value: 'Temporal',
      type: 'string',
    },
  });

  await prisma.setting.upsert({
    where: { key: 'shipping_cost' },
    update: {},
    create: {
      key: 'shipping_cost',
      value: '5.9',
      type: 'number',
    },
  });

  await prisma.setting.upsert({
    where: { key: 'free_shipping_threshold' },
    update: {},
    create: {
      key: 'free_shipping_threshold',
      value: '150',
      type: 'number',
    },
  });

  console.log('Created settings');
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
