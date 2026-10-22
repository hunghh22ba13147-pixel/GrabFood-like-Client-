import { create } from 'zustand';
import { User } from '../models/types';

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => void;
  updateAddress: (address: string) => void;
  logout: () => void;
}

// Auth giả lập (đủ cho demo). Có thể thay bằng Firebase Auth sau.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (email, password) => {
    if (!email.includes('@') || password.length < 6) return false;
    set({ user: { id: 'u1', name: email.split('@')[0], email, phone: '0900000000', address: '1 Lê Lợi, Quận 1, TP.HCM' } });
    return true;
  },
  register: (name, email) => set({ user: { id: 'u1', name, email, phone: '0900000000', address: '1 Lê Lợi, Quận 1, TP.HCM' } }),
  updateAddress: (address) => set((s) => (s.user ? { user: { ...s.user, address } } : s)),
  logout: () => set({ user: null }),
}));
