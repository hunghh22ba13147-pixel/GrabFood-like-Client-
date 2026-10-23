import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { User } from '../models/types';

const STORAGE_KEY = 'grabfood-auth-v1';
const DEFAULT_ADDRESS = 'Chưa thêm địa chỉ giao hàng';

type SavedAuth = { user: User | null; onboardingComplete: boolean };

interface AuthState extends SavedAuth {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  finishOnboarding: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  updateProfile: (changes: Partial<Pick<User, 'name' | 'phone' | 'address' | 'addresses'>>) => Promise<void>;
  logout: () => Promise<void>;
}

async function save(state: SavedAuth) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function makeUser(name: string, email: string): User {
  return {
    id: `u-${Date.now()}`,
    name,
    email,
    phone: '',
    address: DEFAULT_ADDRESS,
    addresses: [],
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  onboardingComplete: false,
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SavedAuth>;
        set({
          user: saved.user ?? null,
          onboardingComplete: saved.onboardingComplete ?? false,
        });
      }
    } catch {
      // A damaged local session should not prevent the app from opening.
      set({ user: null, onboardingComplete: false });
    } finally {
      set({ hydrated: true });
    }
  },
  finishOnboarding: async () => {
    const next = { user: get().user, onboardingComplete: true };
    set(next);
    await save(next);
  },
  login: async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || password.length < 6) return false;
    const user = get().user?.email === normalizedEmail
      ? get().user!
      : makeUser(normalizedEmail.split('@')[0], normalizedEmail);
    const next = { user, onboardingComplete: true };
    set(next);
    await save(next);
    return true;
  },
  register: async (name, email, password) => {
    const cleanName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (cleanName.length < 2 || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || password.length < 6) return false;
    const next = { user: makeUser(cleanName, normalizedEmail), onboardingComplete: true };
    set(next);
    await save(next);
    return true;
  },
  updateProfile: async (changes) => {
    const current = get();
    if (!current.user) return;
    const next = { user: { ...current.user, ...changes }, onboardingComplete: current.onboardingComplete };
    set(next);
    await save(next);
  },
  logout: async () => {
    const next = { user: null, onboardingComplete: true };
    set(next);
    await save(next);
  },
}));
