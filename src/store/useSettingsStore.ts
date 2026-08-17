import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreSettings } from '@/types';

interface SettingsState {
  settings: StoreSettings;
  update: (patch: Partial<StoreSettings>) => void;
}

const defaultSettings: StoreSettings = {
  storeName: 'Northgate Trading Co.',
  businessType: 'Mixed Retail',
  currencySymbol: '$',
  address: '221 Market Street, Islamabad',
  phone: '+92 300 1234567',
  taxRate: 5,
  lowStockThreshold: 10,
  theme: 'light',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      update: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    { name: 'erp:settings' }
  )
);
