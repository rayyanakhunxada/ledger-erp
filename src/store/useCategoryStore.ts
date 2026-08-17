import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category } from '@/types';
import { newId } from '@/lib/utils';

interface CategoryState {
  categories: Category[];
  add: (c: Omit<Category, 'id'>) => void;
  update: (id: string, patch: Partial<Category>) => void;
  remove: (id: string) => void;
}

const seed: Category[] = [
  { id: 'cat-groceries', name: 'Groceries', businessType: 'general' },
  { id: 'cat-household', name: 'Household Supplies', businessType: 'general' },
  { id: 'cat-stationery', name: 'Stationery', businessType: 'general' },
  { id: 'cat-cosmetics', name: 'Cosmetics & Personal Care', businessType: 'general' },
  { id: 'cat-sneakers', name: "Men's Sneakers", businessType: 'footwear' },
  { id: 'cat-formal', name: 'Formal Shoes', businessType: 'footwear' },
  { id: 'cat-kids-shoes', name: "Kids' Footwear", businessType: 'footwear' },
  { id: 'cat-sandals', name: 'Sandals & Slippers', businessType: 'footwear' },
];

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set) => ({
      categories: seed,
      add: (c) => set((s) => ({ categories: [...s.categories, { ...c, id: newId() }] })),
      update: (id, patch) =>
        set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      remove: (id) => set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),
    }),
    { name: 'erp:categories' }
  )
);
