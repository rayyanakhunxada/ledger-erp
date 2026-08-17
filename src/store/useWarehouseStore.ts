import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Warehouse } from '@/types';
import { newId } from '@/lib/utils';

interface WarehouseState {
  warehouses: Warehouse[];
  add: (w: Omit<Warehouse, 'id'>) => void;
  update: (id: string, patch: Partial<Warehouse>) => void;
  remove: (id: string) => void;
}

const seed: Warehouse[] = [
  { id: 'wh-main', name: 'Main Store Floor', location: 'Ground Floor, Market Street', isDefault: true },
  { id: 'wh-back', name: 'Back Warehouse', location: 'Storage Annex, Block C', isDefault: false },
  { id: 'wh-shoe', name: 'Footwear Storeroom', location: 'Mezzanine Level', isDefault: false },
];

export const useWarehouseStore = create<WarehouseState>()(
  persist(
    (set) => ({
      warehouses: seed,
      add: (w) => set((s) => ({ warehouses: [...s.warehouses, { ...w, id: newId() }] })),
      update: (id, patch) =>
        set((s) => ({ warehouses: s.warehouses.map((w) => (w.id === id ? { ...w, ...patch } : w)) })),
      remove: (id) => set((s) => ({ warehouses: s.warehouses.filter((w) => w.id !== id) })),
    }),
    { name: 'erp:warehouses' }
  )
);
