import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lead, LeadStage } from '@/types';
import { newId, nowISO } from '@/lib/utils';

interface LeadState {
  leads: Lead[];
  add: (l: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  update: (id: string, patch: Partial<Lead>) => void;
  setStage: (id: string, stage: LeadStage) => void;
  remove: (id: string) => void;
}

const now = nowISO();

const seed: Lead[] = [
  { id: 'l1', name: 'Imran Traders', company: 'Imran Traders', phone: '+92 301 9982211', stage: 'new', value: 1800, source: 'Referral', owner: 'Sara Malik', createdAt: now, updatedAt: now },
  { id: 'l2', name: 'City Mart Chain', company: 'City Mart', phone: '+92 322 1187654', stage: 'contacted', value: 6200, source: 'Cold Call', owner: 'Bilal Ahmed', createdAt: now, updatedAt: now },
  { id: 'l3', name: 'Rahim Footwear Dist.', company: 'Rahim & Sons', phone: '+92 345 7789021', stage: 'qualified', value: 3400, source: 'Trade Show', owner: 'Sara Malik', createdAt: now, updatedAt: now },
  { id: 'l4', name: 'Noor Bros General Store', company: 'Noor Bros', phone: '+92 312 4456780', stage: 'proposal', value: 2100, source: 'Website', owner: 'Ayesha Khan', createdAt: now, updatedAt: now },
  { id: 'l5', name: 'Askari Wholesale', company: 'Askari Wholesale', phone: '+92 333 2245511', stage: 'won', value: 8900, source: 'Referral', owner: 'Bilal Ahmed', createdAt: now, updatedAt: now },
  { id: 'l6', name: 'Metro Kids Store', company: 'Metro Kids', phone: '+92 300 7712245', stage: 'lost', value: 1500, source: 'Website', owner: 'Sara Malik', createdAt: now, updatedAt: now },
];

export const useLeadStore = create<LeadState>()(
  persist(
    (set) => ({
      leads: seed,
      add: (l) => {
        const ts = nowISO();
        set((s) => ({ leads: [{ ...l, id: newId(), createdAt: ts, updatedAt: ts }, ...s.leads] }));
      },
      update: (id, patch) =>
        set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch, updatedAt: nowISO() } : l)) })),
      setStage: (id, stage) =>
        set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, stage, updatedAt: nowISO() } : l)) })),
      remove: (id) => set((s) => ({ leads: s.leads.filter((l) => l.id !== id) })),
    }),
    { name: 'erp:leads' }
  )
);
