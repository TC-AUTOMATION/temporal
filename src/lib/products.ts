import { Product } from '@/stores/useStore';

export const products: Product[] = [
  {
    id: 'veste-tpl-noir',
    name: 'Veste TPL',
    price: 189,
    images: ['/images/veste-noir-1.jpg', '/images/veste-noir-2.jpg', '/images/veste-noir-3.jpg'],
    modelImages: ['/images/veste-noir-model-1.jpg', '/images/veste-noir-model-2.jpg'],
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
    images: ['/images/veste-blanc-1.jpg', '/images/veste-blanc-2.jpg'],
    modelImages: ['/images/veste-blanc-model-1.jpg'],
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
    images: ['/images/jogging-noir-1.jpg', '/images/jogging-noir-2.jpg'],
    modelImages: ['/images/jogging-noir-model-1.jpg'],
    colors: [
      { name: 'Noir', hex: '#000000', available: true },
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
    images: ['/images/tshirt-noir-1.jpg', '/images/tshirt-noir-2.jpg'],
    modelImages: ['/images/tshirt-noir-model-1.jpg'],
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
    images: ['/images/bonnet-noir-1.jpg', '/images/bonnet-noir-2.jpg'],
    modelImages: ['/images/bonnet-noir-model-1.jpg'],
    colors: [
      { name: 'Noir', hex: '#000000', available: true },
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
