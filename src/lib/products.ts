/**
 * @deprecated This file is deprecated and kept only for backward compatibility.
 * All product data should now be fetched from the database via /api/products endpoints.
 *
 * MIGRATION PATH:
 * - Shop page: Use /api/products with category filter
 * - Home page: Use /api/products?featured=true
 * - Product detail: Use /api/products/[id]
 *
 * This file will be removed in a future version.
 */

import { Product } from '@/stores/useStore';

/**
 * @deprecated Use API endpoint /api/products instead
 */
export const products: Product[] = [
  {
    id: 'veste-tpl-noir',
    name: 'Veste Temporal - Noire',
    nameFr: 'Veste Temporal - Noire',
    nameEn: 'Temporal Jacket - Black',
    price: 89.98,
    images: [
      '/clothes/veste-face-noire.png',
      '/clothes/veste-side-noire.png',
      '/clothes/veste-dos-noire.png',
    ],
    modelImages: ['/clothes/veste-face-noire.png'],
    colors: [
      { name: 'Noir', hex: '#000000', available: true },
      { name: 'Blanc', hex: '#FFFFFF', available: true },
    ],
    sizes: [
      { name: 'S', available: false },
      { name: 'M', available: true },
      { name: 'L', available: true },
      { name: 'XL', available: false },
    ],
    category: 'vestes',
    categoryFr: 'Vestes',
    categoryEn: 'Jackets',
    description: 'Veste signature Temporal avec broderie logo. Coupe oversized, tissu premium.',
    descriptionFr: 'Veste signature Temporal avec broderie logo. Coupe oversized, tissu premium.',
    descriptionEn: 'Temporal signature jacket with embroidered logo. Oversized fit, premium fabric.',
    modelInfo: 'Noé mesure 174cm et porte du L',
    modelInfoFr: 'Noé mesure 174cm et porte du L',
    modelInfoEn: 'Noé is 174cm tall and wears size L',
  },
  {
    id: 'veste-tpl-blanc',
    name: 'Veste Temporal - Blanche',
    nameFr: 'Veste Temporal - Blanche',
    nameEn: 'Temporal Jacket - White',
    price: 89.98,
    images: [
      '/clothes/veste-face-blanche.png',
      '/clothes/veste-side-blanche.png',
      '/clothes/veste-dos-blanche.png',
    ],
    modelImages: ['/clothes/veste-face-blanche.png'],
    colors: [
      { name: 'Noir', hex: '#000000', available: true },
      { name: 'Blanc', hex: '#FFFFFF', available: true },
    ],
    sizes: [
      { name: 'S', available: true },
      { name: 'M', available: true },
      { name: 'L', available: true },
      { name: 'XL', available: true },
    ],
    category: 'vestes',
    categoryFr: 'Vestes',
    categoryEn: 'Jackets',
    description: 'Veste signature Temporal avec broderie logo. Coupe oversized, tissu premium.',
    descriptionFr: 'Veste signature Temporal avec broderie logo. Coupe oversized, tissu premium.',
    descriptionEn: 'Temporal signature jacket with embroidered logo. Oversized fit, premium fabric.',
    modelInfo: 'Noé mesure 174cm et porte du L',
    modelInfoFr: 'Noé mesure 174cm et porte du L',
    modelInfoEn: 'Noé is 174cm tall and wears size L',
  },
  {
    id: 'jogging-tpl-noir',
    name: 'Jogging Temporal - Noir',
    nameFr: 'Jogging Temporal - Noir',
    nameEn: 'Temporal Joggers - Black',
    price: 59.98,
    images: [
      '/clothes/jogging-avant-noir.png',
      '/clothes/jogging-dos-noir.png',
    ],
    modelImages: ['/clothes/jogging-avant-noir.png'],
    colors: [
      { name: 'Noir', hex: '#000000', available: true },
      { name: 'Blanc', hex: '#FFFFFF', available: true },
    ],
    sizes: [
      { name: 'S', available: true },
      { name: 'M', available: true },
      { name: 'L', available: true },
      { name: 'XL', available: true },
    ],
    category: 'pantalons',
    categoryFr: 'Pantalons',
    categoryEn: 'Pants',
    description: 'Jogging Temporal confort premium. Broderie logo discret.',
    descriptionFr: 'Jogging Temporal confort premium. Broderie logo discret.',
    descriptionEn: 'Temporal premium comfort joggers. Discreet embroidered logo.',
    modelInfo: 'Noé mesure 174cm et porte du L',
    modelInfoFr: 'Noé mesure 174cm et porte du L',
    modelInfoEn: 'Noé is 174cm tall and wears size L',
  },
  {
    id: 'jogging-tpl-blanc',
    name: 'Jogging Temporal - Blanc',
    nameFr: 'Jogging Temporal - Blanc',
    nameEn: 'Temporal Joggers - White',
    price: 59.98,
    images: [
      '/clothes/jogging-avant-blanc.png',
      '/clothes/jogging-dos-blanc.png',
    ],
    modelImages: ['/clothes/jogging-avant-blanc.png'],
    colors: [
      { name: 'Noir', hex: '#000000', available: true },
      { name: 'Blanc', hex: '#FFFFFF', available: true },
    ],
    sizes: [
      { name: 'S', available: true },
      { name: 'M', available: true },
      { name: 'L', available: true },
      { name: 'XL', available: true },
    ],
    category: 'pantalons',
    categoryFr: 'Pantalons',
    categoryEn: 'Pants',
    description: 'Jogging Temporal confort premium. Broderie logo discret.',
    descriptionFr: 'Jogging Temporal confort premium. Broderie logo discret.',
    descriptionEn: 'Temporal premium comfort joggers. Discreet embroidered logo.',
    modelInfo: 'Noé mesure 174cm et porte du L',
    modelInfoFr: 'Noé mesure 174cm et porte du L',
    modelInfoEn: 'Noé is 174cm tall and wears size L',
  },
  {
    id: 'tshirt-tpl-noir',
    name: 'T-shirt Temporal - Noir',
    nameFr: 'T-shirt Temporal - Noir',
    nameEn: 'Temporal T-shirt - Black',
    price: 42.98,
    images: [
      '/clothes/t-shirt-face-noir.png',
      '/clothes/t-shirt-side-noir.png',
      '/clothes/t-shirt-dos-noir.png',
    ],
    modelImages: ['/clothes/t-shirt-face-noir.png'],
    colors: [
      { name: 'Noir', hex: '#000000', available: true },
      { name: 'Blanc', hex: '#FFFFFF', available: true },
    ],
    sizes: [
      { name: 'S', available: true },
      { name: 'M', available: true },
      { name: 'L', available: true },
      { name: 'XL', available: true },
    ],
    category: 'tshirts',
    categoryFr: 'T-shirts',
    categoryEn: 'T-shirts',
    description: 'T-shirt Temporal 100% coton. Logo brodé sur la poitrine.',
    descriptionFr: 'T-shirt Temporal 100% coton. Logo brodé sur la poitrine.',
    descriptionEn: 'Temporal T-shirt 100% cotton. Embroidered logo on chest.',
    modelInfo: 'Noé mesure 174cm et porte du L',
    modelInfoFr: 'Noé mesure 174cm et porte du L',
    modelInfoEn: 'Noé is 174cm tall and wears size L',
  },
  {
    id: 'tshirt-tpl-blanc',
    name: 'T-shirt Temporal - Blanc',
    nameFr: 'T-shirt Temporal - Blanc',
    nameEn: 'Temporal T-shirt - White',
    price: 42.98,
    images: [
      '/clothes/t-shirt-face-blanc.png',
      '/clothes/t-shirt-side-blanc.png',
      '/clothes/t-shirt-dos-blanc.png',
    ],
    modelImages: ['/clothes/t-shirt-face-blanc.png'],
    colors: [
      { name: 'Noir', hex: '#000000', available: true },
      { name: 'Blanc', hex: '#FFFFFF', available: true },
    ],
    sizes: [
      { name: 'S', available: true },
      { name: 'M', available: true },
      { name: 'L', available: true },
      { name: 'XL', available: true },
    ],
    category: 'tshirts',
    categoryFr: 'T-shirts',
    categoryEn: 'T-shirts',
    description: 'T-shirt Temporal 100% coton. Logo brodé sur la poitrine.',
    descriptionFr: 'T-shirt Temporal 100% coton. Logo brodé sur la poitrine.',
    descriptionEn: 'Temporal T-shirt 100% cotton. Embroidered logo on chest.',
    modelInfo: 'Noé mesure 174cm et porte du L',
    modelInfoFr: 'Noé mesure 174cm et porte du L',
    modelInfoEn: 'Noé is 174cm tall and wears size L',
  },
  {
    id: 'bonnet-tpl-noir',
    name: 'Bonnet Temporal - Noir',
    nameFr: 'Bonnet Temporal - Noir',
    nameEn: 'Temporal Beanie - Black',
    price: 32.98,
    images: [
      '/clothes/bonnet-face-noir.png',
      '/clothes/bonnet-dos-noir.png',
    ],
    modelImages: ['/clothes/bonnet-face-noir.png'],
    colors: [
      { name: 'Noir', hex: '#000000', available: true },
      { name: 'Blanc', hex: '#FFFFFF', available: true },
    ],
    sizes: [
      { name: 'Unique', available: true },
    ],
    category: 'accessoires',
    categoryFr: 'Accessoires',
    categoryEn: 'Accessories',
    description: 'Bonnet Temporal brodé. Taille unique.',
    descriptionFr: 'Bonnet Temporal brodé. Taille unique.',
    descriptionEn: 'Temporal embroidered beanie. One size fits all.',
  },
  {
    id: 'bonnet-tpl-blanc',
    name: 'Bonnet Temporal - Blanc',
    nameFr: 'Bonnet Temporal - Blanc',
    nameEn: 'Temporal Beanie - White',
    price: 32.98,
    images: [
      '/clothes/bonnet-face-blanc.png',
      '/clothes/bonnet-dos-blanc.png',
    ],
    modelImages: ['/clothes/bonnet-face-blanc.png'],
    colors: [
      { name: 'Noir', hex: '#000000', available: true },
      { name: 'Blanc', hex: '#FFFFFF', available: true },
    ],
    sizes: [
      { name: 'Unique', available: true },
    ],
    category: 'accessoires',
    categoryFr: 'Accessoires',
    categoryEn: 'Accessories',
    description: 'Bonnet Temporal brodé. Taille unique.',
    descriptionFr: 'Bonnet Temporal brodé. Taille unique.',
    descriptionEn: 'Temporal embroidered beanie. One size fits all.',
  },
  {
    id: 'sticker-black-purple',
    name: 'Sticker Temporal - Noir/Violet',
    nameFr: 'Sticker Temporal - Noir/Violet',
    nameEn: 'Temporal Sticker - Black/Purple',
    price: 2.50,
    images: ['/stickers/black-purple.png'],
    modelImages: ['/stickers/black-purple.png'],
    colors: [
      { name: 'Noir/Violet', hex: '#5B2D8E', available: true },
      { name: 'Noir/Blanc', hex: '#000000', available: true },
      { name: 'Violet/Noir', hex: '#7B4DB0', available: true },
      { name: 'Violet/Blanc', hex: '#9333ea', available: true },
      { name: 'Blanc/Noir', hex: '#FFFFFF', available: true },
      { name: 'Blanc/Violet', hex: '#f5f5f5', available: true },
    ],
    sizes: [{ name: 'Unique', available: true }],
    category: 'accessoires',
    categoryFr: 'Accessoires',
    categoryEn: 'Accessories',
    description: 'Sticker Temporal logo étoile. Vinyle haute qualité résistant aux intempéries.',
    descriptionFr: 'Sticker Temporal logo étoile. Vinyle haute qualité résistant aux intempéries.',
    descriptionEn: 'Temporal star logo sticker. High-quality weatherproof vinyl.',
  },
  {
    id: 'sticker-black-white',
    name: 'Sticker Temporal - Noir/Blanc',
    nameFr: 'Sticker Temporal - Noir/Blanc',
    nameEn: 'Temporal Sticker - Black/White',
    price: 2.50,
    images: ['/stickers/black-white.png'],
    modelImages: ['/stickers/black-white.png'],
    colors: [
      { name: 'Noir/Violet', hex: '#5B2D8E', available: true },
      { name: 'Noir/Blanc', hex: '#000000', available: true },
      { name: 'Violet/Noir', hex: '#7B4DB0', available: true },
      { name: 'Violet/Blanc', hex: '#9333ea', available: true },
      { name: 'Blanc/Noir', hex: '#FFFFFF', available: true },
      { name: 'Blanc/Violet', hex: '#f5f5f5', available: true },
    ],
    sizes: [{ name: 'Unique', available: true }],
    category: 'accessoires',
    categoryFr: 'Accessoires',
    categoryEn: 'Accessories',
    description: 'Sticker Temporal logo étoile. Vinyle haute qualité résistant aux intempéries.',
    descriptionFr: 'Sticker Temporal logo étoile. Vinyle haute qualité résistant aux intempéries.',
    descriptionEn: 'Temporal star logo sticker. High-quality weatherproof vinyl.',
  },
  {
    id: 'sticker-purple-black',
    name: 'Sticker Temporal - Violet/Noir',
    nameFr: 'Sticker Temporal - Violet/Noir',
    nameEn: 'Temporal Sticker - Purple/Black',
    price: 2.50,
    images: ['/stickers/purple-black.png'],
    modelImages: ['/stickers/purple-black.png'],
    colors: [
      { name: 'Noir/Violet', hex: '#5B2D8E', available: true },
      { name: 'Noir/Blanc', hex: '#000000', available: true },
      { name: 'Violet/Noir', hex: '#7B4DB0', available: true },
      { name: 'Violet/Blanc', hex: '#9333ea', available: true },
      { name: 'Blanc/Noir', hex: '#FFFFFF', available: true },
      { name: 'Blanc/Violet', hex: '#f5f5f5', available: true },
    ],
    sizes: [{ name: 'Unique', available: true }],
    category: 'accessoires',
    categoryFr: 'Accessoires',
    categoryEn: 'Accessories',
    description: 'Sticker Temporal logo étoile. Vinyle haute qualité résistant aux intempéries.',
    descriptionFr: 'Sticker Temporal logo étoile. Vinyle haute qualité résistant aux intempéries.',
    descriptionEn: 'Temporal star logo sticker. High-quality weatherproof vinyl.',
  },
  {
    id: 'sticker-purple-white',
    name: 'Sticker Temporal - Violet/Blanc',
    nameFr: 'Sticker Temporal - Violet/Blanc',
    nameEn: 'Temporal Sticker - Purple/White',
    price: 2.50,
    images: ['/stickers/purple-white.png'],
    modelImages: ['/stickers/purple-white.png'],
    colors: [
      { name: 'Noir/Violet', hex: '#5B2D8E', available: true },
      { name: 'Noir/Blanc', hex: '#000000', available: true },
      { name: 'Violet/Noir', hex: '#7B4DB0', available: true },
      { name: 'Violet/Blanc', hex: '#9333ea', available: true },
      { name: 'Blanc/Noir', hex: '#FFFFFF', available: true },
      { name: 'Blanc/Violet', hex: '#f5f5f5', available: true },
    ],
    sizes: [{ name: 'Unique', available: true }],
    category: 'accessoires',
    categoryFr: 'Accessoires',
    categoryEn: 'Accessories',
    description: 'Sticker Temporal logo étoile. Vinyle haute qualité résistant aux intempéries.',
    descriptionFr: 'Sticker Temporal logo étoile. Vinyle haute qualité résistant aux intempéries.',
    descriptionEn: 'Temporal star logo sticker. High-quality weatherproof vinyl.',
  },
  {
    id: 'sticker-white-black',
    name: 'Sticker Temporal - Blanc/Noir',
    nameFr: 'Sticker Temporal - Blanc/Noir',
    nameEn: 'Temporal Sticker - White/Black',
    price: 2.50,
    images: ['/stickers/white-black.png'],
    modelImages: ['/stickers/white-black.png'],
    colors: [
      { name: 'Noir/Violet', hex: '#5B2D8E', available: true },
      { name: 'Noir/Blanc', hex: '#000000', available: true },
      { name: 'Violet/Noir', hex: '#7B4DB0', available: true },
      { name: 'Violet/Blanc', hex: '#9333ea', available: true },
      { name: 'Blanc/Noir', hex: '#FFFFFF', available: true },
      { name: 'Blanc/Violet', hex: '#f5f5f5', available: true },
    ],
    sizes: [{ name: 'Unique', available: true }],
    category: 'accessoires',
    categoryFr: 'Accessoires',
    categoryEn: 'Accessories',
    description: 'Sticker Temporal logo étoile. Vinyle haute qualité résistant aux intempéries.',
    descriptionFr: 'Sticker Temporal logo étoile. Vinyle haute qualité résistant aux intempéries.',
    descriptionEn: 'Temporal star logo sticker. High-quality weatherproof vinyl.',
  },
  {
    id: 'sticker-white-purple',
    name: 'Sticker Temporal - Blanc/Violet',
    nameFr: 'Sticker Temporal - Blanc/Violet',
    nameEn: 'Temporal Sticker - White/Purple',
    price: 2.50,
    images: ['/stickers/white-purple.png'],
    modelImages: ['/stickers/white-purple.png'],
    colors: [
      { name: 'Noir/Violet', hex: '#5B2D8E', available: true },
      { name: 'Noir/Blanc', hex: '#000000', available: true },
      { name: 'Violet/Noir', hex: '#7B4DB0', available: true },
      { name: 'Violet/Blanc', hex: '#9333ea', available: true },
      { name: 'Blanc/Noir', hex: '#FFFFFF', available: true },
      { name: 'Blanc/Violet', hex: '#f5f5f5', available: true },
    ],
    sizes: [{ name: 'Unique', available: true }],
    category: 'accessoires',
    categoryFr: 'Accessoires',
    categoryEn: 'Accessories',
    description: 'Sticker Temporal logo étoile. Vinyle haute qualité résistant aux intempéries.',
    descriptionFr: 'Sticker Temporal logo étoile. Vinyle haute qualité résistant aux intempéries.',
    descriptionEn: 'Temporal star logo sticker. High-quality weatherproof vinyl.',
  },
];

/**
 * Helper function to get product name based on language
 * Works with both old static format and new API format
 */
export const getProductName = (product: any, language: 'fr' | 'en') => {
  if (language === 'en') {
    return product.nameEn || product.name;
  }
  return product.nameFr || product.name;
};

/**
 * @deprecated Use API response data directly instead
 * Helper function to get product description based on language
 */
export const getProductDescription = (product: Product, language: 'fr' | 'en') => {
  if (language === 'en' && product.descriptionEn) return product.descriptionEn;
  if (language === 'fr' && product.descriptionFr) return product.descriptionFr;
  return product.description;
};

/**
 * Helper function to get product category based on language
 * Works with both old static format and new API format
 */
export const getProductCategory = (product: any, language: 'fr' | 'en') => {
  // Handle API format where category is an object {id, name, nameEn, slug}
  if (typeof product.category === 'object' && product.category !== null) {
    if (language === 'en' && product.category.nameEn) {
      return product.category.nameEn;
    }
    return product.category.name || '';
  }
  // Handle old static format
  if (language === 'en' && product.categoryEn) return product.categoryEn;
  if (language === 'fr' && product.categoryFr) return product.categoryFr;
  return product.category;
};

/**
 * @deprecated Use API response data directly instead
 * Helper function to get model info based on language
 */
export const getModelInfo = (product: Product, language: 'fr' | 'en') => {
  if (language === 'en' && product.modelInfoEn) return product.modelInfoEn;
  if (language === 'fr' && product.modelInfoFr) return product.modelInfoFr;
  return product.modelInfo;
};

/**
 * @deprecated Use fetch('/api/products/:id') instead
 */
export const getProductById = (id: string) => {
  return products.find((p) => p.id === id);
};

/**
 * @deprecated Use fetch('/api/products?category=:slug') instead
 */
export const getProductsByCategory = (category: string) => {
  return products.filter((p) => p.category === category);
};
