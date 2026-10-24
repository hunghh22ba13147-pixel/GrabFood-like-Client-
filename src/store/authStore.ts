import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { User } from '../models/types';
import { isFirebaseConfigured, requireFirebaseAuth } from '../services/firebase';

const STORAGE_KEY = 'grabfood-auth-v1';
const DEFAULT_ADDRESS = 'Chưa thêm địa chỉ giao hàng';

type SavedAuth = { user: User | null; onboardingComplete: boolean };
export type LoginResult = 'signed-in' | 'verification-required';

interface AuthState extends SavedAuth {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  finishOnboarding: () => Promise<void>;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (name: string, email: string, password: string) => Promise<void>;
  resendVerification: (email: string, password: string) => Promise<void>;
  updateProfile: (changes: Partial<Pick<User, 'name' | 'phone' | 'address' | 'addresses'>>) => Promise<void>;
  logout: () => Promise<void>;
}

async function loadSavedAuth(): Promise<Partial<SavedAuth>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Partial<SavedAuth>) : {};
}

async function save(state: SavedAuth) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function makeUser(firebaseUser: FirebaseUser, previous?: User | null): User {
  const sameEmail = previous?.email === firebaseUser.email;
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || (sameEmail ? previous?.name : undefined) || firebaseUser.email?.split('@')[0] || 'Người dùng',
    email: firebaseUser.email ?? '',
    phone: sameEmail ? previous?.phone ?? '' : '',
    address: sameEmail ? previous?.address ?? DEFAULT_ADDRESS : DEFAULT_ADDRESS,
    addresses: sameEmail ? previous?.addresses ?? [] : [],
  };
}

function asAuthError(error: unknown): Error {
  const details = error as { code?: string; message?: string } | null;
  return new Error(details?.code ?? details?.message ?? 'auth/unknown');
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  onboardingComplete: false,
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const saved = await loadSavedAuth();
      set({ onboardingComplete: saved.onboardingComplete ?? false, user: null });
      if (isFirebaseConfigured) {
        const auth = requireFirebaseAuth();
        const current = auth.currentUser;
        if (current) {
          await reload(current);
          if (current.emailVerified) {
            const user = makeUser(current, saved.user ?? null);
            set({ user });
            await save({ user, onboardingComplete: saved.onboardingComplete ?? true });
          } else {
            await signOut(auth);
          }
        }
      }
    } catch {
      // Keep the app open; auth screens can show a useful Firebase setup or network error.
      set({ user: null });
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
    if (!isFirebaseConfigured) {
      // Chế độ demo (chưa cấu hình Firebase): chấp nhận mọi email hợp lệ + mật khẩu >= 6 ký tự.
      if (!email.includes('@') || password.length < 6) throw new Error('auth/invalid-credential');
      const saved = await loadSavedAuth();
      const prev = saved.user?.email === email.trim().toLowerCase() ? saved.user : null;
      const user: User = prev ?? {
        id: 'demo-user', name: email.split('@')[0], email: email.trim().toLowerCase(),
        phone: '0900000000', address: '1 Lê Lợi, Quận 1, TP.HCM', addresses: [],
      };
      const next = { user, onboardingComplete: true };
      set(next);
      await save(next);
      return 'signed-in';
    }
    try {
      const auth = requireFirebaseAuth();
      const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      await reload(credential.user);
      if (!credential.user.emailVerified) {
        await signOut(auth);
        set({ user: null });
        return 'verification-required';
      }
      const saved = await loadSavedAuth();
      const user = makeUser(credential.user, saved.user ?? null);
      const next = { user, onboardingComplete: true };
      set(next);
      await save(next);
      return 'signed-in';
    } catch (error) {
      throw asAuthError(error);
    }
  },
  register: async (name, email, password) => {
    if (!isFirebaseConfigured) {
      // Chế độ demo: tạo tài khoản cục bộ (không gửi email xác minh), rồi cho đăng nhập.
      const user: User = { id: 'demo-user', name: name.trim(), email: email.trim().toLowerCase(), phone: '', address: '1 Lê Lợi, Quận 1, TP.HCM', addresses: [] };
      await save({ user, onboardingComplete: true });
      set({ user: null, onboardingComplete: true });
      return;
    }
    const auth = requireFirebaseAuth();
    try {
      auth.languageCode = 'vi';
      const credential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      await updateFirebaseProfile(credential.user, { displayName: name.trim() });
      await sendEmailVerification(credential.user);
      await signOut(auth);
      set({ user: null, onboardingComplete: true });
      const saved = await loadSavedAuth();
      await save({ user: saved.user ?? null, onboardingComplete: true });
    } catch (error) {
      if (auth.currentUser) await signOut(auth).catch(() => undefined);
      throw asAuthError(error);
    }
  },
  resendVerification: async (email, password) => {
    const auth = requireFirebaseAuth();
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      await reload(credential.user);
      if (credential.user.emailVerified) throw new Error('auth/email-already-verified');
      auth.languageCode = 'vi';
      await sendEmailVerification(credential.user);
      await signOut(auth);
    } catch (error) {
      if (auth.currentUser) await signOut(auth).catch(() => undefined);
      throw asAuthError(error);
    }
  },
  updateProfile: async (changes) => {
    const current = get();
    if (!current.user) return;
    const firebaseUser = isFirebaseConfigured ? requireFirebaseAuth().currentUser : null;
    if (firebaseUser && changes.name) await updateFirebaseProfile(firebaseUser, { displayName: changes.name });
    const next = { user: { ...current.user, ...changes }, onboardingComplete: current.onboardingComplete };
    set(next);
    await save(next);
  },
  logout: async () => {
    if (isFirebaseConfigured) await signOut(requireFirebaseAuth());
    const next = { user: null, onboardingComplete: true };
    set(next);
    await save(next);
  },
}));
