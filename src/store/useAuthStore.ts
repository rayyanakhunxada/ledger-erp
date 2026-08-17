import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppUser, Role } from '@/types';
import { colorForString } from '@/lib/utils';

export const DEMO_USERS: AppUser[] = [
  { id: 'u1', name: 'Ayesha Khan', email: 'ayesha@northgate.co', role: 'admin', avatarColor: colorForString('Ayesha Khan') },
  { id: 'u2', name: 'Bilal Ahmed', email: 'bilal@northgate.co', role: 'manager', avatarColor: colorForString('Bilal Ahmed') },
  { id: 'u3', name: 'Sara Malik', email: 'sara@northgate.co', role: 'sales', avatarColor: colorForString('Sara Malik') },
  { id: 'u4', name: 'Usman Tariq', email: 'usman@northgate.co', role: 'warehouse', avatarColor: colorForString('Usman Tariq') },
];

interface AuthState {
  currentUser: AppUser | null;
  login: (userId: string) => void;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      login: (userId) => {
        const user = DEMO_USERS.find((u) => u.id === userId) ?? DEMO_USERS[0];
        set({ currentUser: user });
      },
      logout: () => set({ currentUser: null }),
      hasRole: (...roles) => {
        const user = get().currentUser;
        return !!user && roles.includes(user.role);
      },
    }),
    { name: 'erp:auth' }
  )
);
