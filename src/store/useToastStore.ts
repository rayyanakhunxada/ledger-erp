import { create } from 'zustand';
import { newId } from '@/lib/utils';
import type { Toast } from '@/types';

interface ToastState {
  toasts: Toast[];
  push: (message: string, type?: Toast['type']) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, type = 'success') => {
    const id = newId();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
