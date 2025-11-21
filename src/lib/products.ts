import { Product } from '@/stores/useStore';

export const products: Product[] = [
  {
    id: 'veste-tpl-noir',
    name: 'Veste TPL',
    price: 189,
    images: [
      '/clothes/veste-face-noire.png',
      '/clothes/veste-side-blanche.png',
      '/clothes/veste-dos-noir.png',
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
    description: 'Veste signature Temporal avec broderie logo. Coupe oversized, tissu premium.',
    modelInfo: 'Noé mesure 174cm et porte du L',
  },
  {
    id: 'veste-tpl-blanc',
    name: 'Veste TPL',
    price: 189,
    images: [
      '/clothes/veste-face-blanche.png',
      '/clothes/veste-side-blanche.png',
      '/clothes/veste-dos-blanc.png',
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
    description: 'Veste signature Temporal avec broderie logo. Coupe oversized, tissu premium.',
    modelInfo: 'Noé mesure 174cm et porte du L',
  },
  {
    id: 'jogging-tpl-noir',
    name: 'Jogging TPL',
    price: 129,
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
    description: 'Jogging Temporal confort premium. Broderie logo discret.',
    modelInfo: 'Noé mesure 174cm et porte du L',
  },
  {
    id: 'jogging-tpl-blanc',
    name: 'Jogging TPL',
    price: 129,
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
    description: 'Jogging Temporal confort premium. Broderie logo discret.',
    modelInfo: 'Noé mesure 174cm et porte du L',
  },
  {
    id: 'tshirt-tpl-noir',
    name: 'T-shirt TPL',
    price: 59,
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
    description: 'T-shirt Temporal 100% coton. Logo brodé sur la poitrine.',
    modelInfo: 'Noé mesure 174cm et porte du L',
  },
  {
    id: 'tshirt-tpl-blanc',
    name: 'T-shirt TPL',
    price: 59,
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
    description: 'T-shirt Temporal 100% coton. Logo brodé sur la poitrine.',
    modelInfo: 'Noé mesure 174cm et porte du L',
  },
  {
    id: 'bonnet-tpl-noir',
    name: 'Bonnet TPL',
    price: 39,
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
    description: 'Bonnet Temporal brodé. Taille unique.',
  },
  {
    id: 'bonnet-tpl-blanc',
    name: 'Bonnet TPL',
    price: 39,
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
    description: 'Bonnet Temporal brodé. Taille unique.',
  },
];

export const getProductById = (id: string) => products.find((p) => p.id === id);
export const getProductsByCategory = (category: string) =>
  products.filter((p) => p.category === category);
