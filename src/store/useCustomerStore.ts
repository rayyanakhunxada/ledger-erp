import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Customer } from '@/types';
import { newId, nowISO } from '@/lib/utils';

interface CustomerState {
  customers: Customer[];
  add: (c: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'totalSpent' | 'totalOrders'>) => string;
  update: (id: string, patch: Partial<Customer>) => void;
  remove: (id: string) => void;
  registerOrder: (id: string, amount: number) => void;
}

const now = nowISO();

const seed: Customer[] = [
  { id: 'c1', name: 'Walk-in Customer', phone: '—', type: 'walk-in', totalSpent: 0, totalOrders: 0, createdAt: now, updatedAt: now },
  { id: 'c2', name: 'Hamza Retail Store', phone: '+92 321 5551212', email: 'hamza.retail@mail.com', type: 'wholesale', totalSpent: 4820, totalOrders: 12, createdAt: now, updatedAt: now, address: 'Blue Area, Islamabad' },
  { id: 'c3', name: 'Fatima Noor', phone: '+92 333 8827761', type: 'regular', totalSpent: 640, totalOrders: 9, createdAt: now, updatedAt: now },
  { id: 'c4', name: 'Zain Sports Corner', phone: '+92 300 4471029', type: 'wholesale', totalSpent: 9120, totalOrders: 21, createdAt: now, updatedAt: now, email: 'zain.sports@mail.com' },
];

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customers: seed,
      add: (c) => {
        const id = newId();
        const ts = nowISO();
        set((s) => ({
          customers: [{ ...c, id, totalSpent: 0, totalOrders: 0, createdAt: ts, updatedAt: ts }, ...s.customers],
        }));
        return id;
      },
      update: (id, patch) =>
        set((s) => ({ customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: nowISO() } : c)) })),
      remove: (id) => set((s) => ({ customers: s.customers.filter((c) => c.id !== id) })),
      registerOrder: (id, amount) => {
        const customer = get().customers.find((c) => c.id === id);
        if (!customer) return;
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === id ? { ...c, totalSpent: c.totalSpent + amount, totalOrders: c.totalOrders + 1, updatedAt: nowISO() } : c
          ),
        }));
      },
    }),
    { name: 'erp:customers' }
  )
);
