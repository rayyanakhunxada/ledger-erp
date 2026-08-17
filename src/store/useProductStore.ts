import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';
import { newId, nowISO } from '@/lib/utils';

interface ProductState {
  products: Product[];
  add: (p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => string;
  update: (id: string, patch: Partial<Product>) => void;
  remove: (id: string) => void;
  adjustStock: (id: string, delta: number, variantId?: string) => void;
}

const now = nowISO();

const seed: Product[] = [
  {
    id: 'p1',
    name: 'Basmati Rice 5kg',
    sku: 'GRO-0001',
    categoryId: 'cat-groceries',
    brand: 'Falak',
    unit: 'bag',
    costPrice: 9.5,
    sellPrice: 13.0,
    stock: 84,
    reorderLevel: 20,
    warehouseId: 'wh-main',
    hasVariants: false,
    variants: [],
    status: 'active',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p2',
    name: 'Cooking Oil 1L',
    sku: 'GRO-0002',
    categoryId: 'cat-groceries',
    brand: 'Dalda',
    unit: 'bottle',
    costPrice: 2.4,
    sellPrice: 3.6,
    stock: 6,
    reorderLevel: 15,
    warehouseId: 'wh-main',
    hasVariants: false,
    variants: [],
    status: 'active',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p3',
    name: 'A4 Notebook 200pg',
    sku: 'STA-0001',
    categoryId: 'cat-stationery',
    brand: 'PaperCo',
    unit: 'pcs',
    costPrice: 0.6,
    sellPrice: 1.2,
    stock: 140,
    reorderLevel: 30,
    warehouseId: 'wh-main',
    hasVariants: false,
    variants: [],
    status: 'active',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p4',
    name: 'Dish Wash Liquid 500ml',
    sku: 'HH-0001',
    categoryId: 'cat-household',
    brand: 'Vim',
    unit: 'bottle',
    costPrice: 1.1,
    sellPrice: 1.8,
    stock: 3,
    reorderLevel: 12,
    warehouseId: 'wh-main',
    hasVariants: false,
    variants: [],
    status: 'active',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p5',
    name: 'Air Max Running Sneaker',
    sku: 'SNK-0001',
    categoryId: 'cat-sneakers',
    brand: 'Nike',
    unit: 'pair',
    costPrice: 45,
    sellPrice: 79,
    stock: 0,
    reorderLevel: 5,
    warehouseId: 'wh-shoe',
    hasVariants: true,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    variants: [
      { id: 'v1', size: 'UK 7', sku: 'SNK-0001-7', stock: 8, reorderLevel: 3 },
      { id: 'v2', size: 'UK 8', sku: 'SNK-0001-8', stock: 5, reorderLevel: 3 },
      { id: 'v3', size: 'UK 9', sku: 'SNK-0001-9', stock: 2, reorderLevel: 3 },
      { id: 'v4', size: 'UK 10', sku: 'SNK-0001-10', stock: 0, reorderLevel: 3 },
    ],
  },
  {
    id: 'p6',
    name: 'Classic Oxford Formal Shoe',
    sku: 'FRM-0001',
    categoryId: 'cat-formal',
    brand: 'Clarks',
    unit: 'pair',
    costPrice: 38,
    sellPrice: 65,
    stock: 0,
    reorderLevel: 4,
    warehouseId: 'wh-shoe',
    hasVariants: true,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    variants: [
      { id: 'v5', size: 'UK 8', sku: 'FRM-0001-8', stock: 4, reorderLevel: 2 },
      { id: 'v6', size: 'UK 9', sku: 'FRM-0001-9', stock: 1, reorderLevel: 2 },
      { id: 'v7', size: 'UK 10', sku: 'FRM-0001-10', stock: 3, reorderLevel: 2 },
    ],
  },
  {
    id: 'p7',
    name: 'Kids Velcro Trainer',
    sku: 'KID-0001',
    categoryId: 'cat-kids-shoes',
    brand: 'Bata',
    unit: 'pair',
    costPrice: 8,
    sellPrice: 15,
    stock: 22,
    reorderLevel: 6,
    warehouseId: 'wh-shoe',
    hasVariants: false,
    variants: [],
    status: 'active',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p8',
    name: 'Foam Slide Sandal',
    sku: 'SAN-0001',
    categoryId: 'cat-sandals',
    brand: 'Bata',
    unit: 'pair',
    costPrice: 4,
    sellPrice: 9,
    stock: 5,
    reorderLevel: 10,
    warehouseId: 'wh-shoe',
    hasVariants: false,
    variants: [],
    status: 'active',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p9',
    name: 'Face Cream 100ml',
    sku: 'COS-0001',
    categoryId: 'cat-cosmetics',
    brand: 'Ponds',
    unit: 'jar',
    costPrice: 2.8,
    sellPrice: 4.5,
    stock: 46,
    reorderLevel: 10,
    warehouseId: 'wh-main',
    hasVariants: false,
    variants: [],
    status: 'active',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p10',
    name: 'Ballpoint Pen (Box of 10)',
    sku: 'STA-0002',
    categoryId: 'cat-stationery',
    brand: 'Dollar',
    unit: 'box',
    costPrice: 1.0,
    sellPrice: 1.8,
    stock: 0,
    reorderLevel: 8,
    warehouseId: 'wh-main',
    hasVariants: false,
    variants: [],
    status: 'inactive',
    createdAt: now,
    updatedAt: now,
  },
];

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: seed,
      add: (p) => {
        const id = newId();
        const ts = nowISO();
        set((s) => ({ products: [{ ...p, id, createdAt: ts, updatedAt: ts }, ...s.products] }));
        return id;
      },
      update: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: nowISO() } : p)),
        })),
      remove: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      adjustStock: (id, delta, variantId) => {
        const product = get().products.find((p) => p.id === id);
        if (!product) return;
        if (variantId && product.hasVariants) {
          set((s) => ({
            products: s.products.map((p) =>
              p.id === id
                ? {
                    ...p,
                    updatedAt: nowISO(),
                    variants: p.variants.map((v) =>
                      v.id === variantId ? { ...v, stock: Math.max(0, v.stock + delta) } : v
                    ),
                  }
                : p
            ),
          }));
        } else {
          set((s) => ({
            products: s.products.map((p) =>
              p.id === id ? { ...p, stock: Math.max(0, p.stock + delta), updatedAt: nowISO() } : p
            ),
          }));
        }
      },
    }),
    { name: 'erp:products' }
  )
);
