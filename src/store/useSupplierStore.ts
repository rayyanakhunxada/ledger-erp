import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Supplier } from '@/types';
import { newId, nowISO } from '@/lib/utils';

interface SupplierState {
  suppliers: Supplier[];
  add: (s: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'totalOrders'>) => string;
  update: (id: string, patch: Partial<Supplier>) => void;
  remove: (id: string) => void;
  incrementOrders: (id: string) => void;
}

const now = nowISO();

const seed: Supplier[] = [
  { id: 's1', name: 'Falak Foods Distribution', contactPerson: 'Tariq Javed', phone: '+92 42 3567 1200', email: 'sales@falakfoods.com', rating: 4, totalOrders: 18, createdAt: now, updatedAt: now, address: 'Industrial Area, Lahore' },
  { id: 's2', name: 'Nike Regional Distributor', contactPerson: 'Omar Sheikh', phone: '+92 21 3445 8890', email: 'orders@nike-dist.pk', rating: 5, totalOrders: 9, createdAt: now, updatedAt: now },
  { id: 's3', name: 'Bata Pakistan Wholesale', contactPerson: 'Kiran Iqbal', phone: '+92 51 2287 3311', email: 'wholesale@bata.pk', rating: 4, totalOrders: 14, createdAt: now, updatedAt: now },
  { id: 's4', name: 'PaperCo Stationers', contactPerson: 'Adeel Rana', phone: '+92 42 3778 4521', rating: 3, totalOrders: 6, createdAt: now, updatedAt: now },
];

export const useSupplierStore = create<SupplierState>()(
  persist(
    (set) => ({
      suppliers: seed,
      add: (s) => {
        const id = newId();
        const ts = nowISO();
        set((st) => ({ suppliers: [{ ...s, id, totalOrders: 0, createdAt: ts, updatedAt: ts }, ...st.suppliers] }));
        return id;
      },
      update: (id, patch) =>
        set((s) => ({ suppliers: s.suppliers.map((x) => (x.id === id ? { ...x, ...patch, updatedAt: nowISO() } : x)) })),
      remove: (id) => set((s) => ({ suppliers: s.suppliers.filter((x) => x.id !== id) })),
      incrementOrders: (id) =>
        set((s) => ({
          suppliers: s.suppliers.map((x) => (x.id === id ? { ...x, totalOrders: x.totalOrders + 1 } : x)),
        })),
    }),
    { name: 'erp:suppliers' }
  )
);
