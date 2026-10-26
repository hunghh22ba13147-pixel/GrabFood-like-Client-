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
import { useCartStore } from './cartStore';

const STORAGE_KEY = 'grabfood-auth-v1';
const USERS_DB_KEY = 'grabfood-users-db-v1';
const DEFAULT_ADDRESS = '18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội';

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
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<SavedAuth>) : {};
  } catch {
    return {};
  }
}

async function loadUsersDb(): Promise<Record<string, User>> {
  try {
    const raw = await AsyncStorage.getItem(USERS_DB_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveUserToDb(user: User) {
  if (!user.email) return;
  try {
    const db = await loadUsersDb();
    db[user.email.trim().toLowerCase()] = user;
    await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
  } catch {
    // ignore
  }
}

async function save(state: SavedAuth) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
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
      let currentUser: User | null = null;

      if (saved.user?.email) {
        const db = await loadUsersDb();
        currentUser = db[saved.user.email.trim().toLowerCase()] ?? saved.user;
      }

      set({ onboardingComplete: saved.onboardingComplete ?? false, user: currentUser });

      if (isFirebaseConfigured) {
        const auth = requireFirebaseAuth();
        const current = auth.currentUser;
        if (current) {
          await reload(current);
          if (current.emailVerified) {
            const user = makeUser(current, currentUser);
            set({ user });
            await save({ user, onboardingComplete: saved.onboardingComplete ?? true });
            await saveUserToDb(user);
          } else {
            await signOut(auth);
            set({ user: null });
          }
        }
      }
    } catch {
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
    const normalizedEmail = email.trim().toLowerCase();
    const db = await loadUsersDb();
    const savedProfile = db[normalizedEmail];

    if (!isFirebaseConfigured) {
      // Chế độ demo (chưa cấu hình Firebase): chấp nhận mọi email hợp lệ + mật khẩu >= 6 ký tự.
      if (!email.includes('@') || password.length < 6) throw new Error('auth/invalid-credential');

      const user: User = savedProfile ?? {
        id: `demo-${normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: email.split('@')[0],
        email: normalizedEmail,
        phone: '0900000000',
        address: DEFAULT_ADDRESS,
        addresses: [
          {
            id: 'addr-default',
            label: 'Nhà riêng',
            address: DEFAULT_ADDRESS,
          },
        ],
      };

      const next = { user, onboardingComplete: true };
      set(next);
      await save(next);
      await saveUserToDb(user);
      return 'signed-in';
    }

    try {
      const auth = requireFirebaseAuth();
      const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      await reload(credential.user);
      if (!credential.user.emailVerified) {
        await signOut(auth);
        set({ user: null });
        return 'verification-required';
      }
      const user = makeUser(credential.user, savedProfile ?? null);
      const next = { user, onboardingComplete: true };
      set(next);
      await save(next);
      await saveUserToDb(user);
      return 'signed-in';
    } catch (error) {
      throw asAuthError(error);
    }
  },
  register: async (name, email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      phone: '',
      address: DEFAULT_ADDRESS,
      addresses: [
        {
          id: 'addr-default',
          label: 'Nhà riêng',
          address: DEFAULT_ADDRESS,
        },
      ],
    };

    await saveUserToDb(newUser);

    if (!isFirebaseConfigured) {
      // Chế độ demo: lưu tài khoản vào cơ sở dữ liệu cục bộ, chuyển sang màn đăng nhập.
      await save({ user: null, onboardingComplete: true });
      set({ user: null, onboardingComplete: true });
      return;
    }

    const auth = requireFirebaseAuth();
    try {
      auth.languageCode = 'vi';
      const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      await updateFirebaseProfile(credential.user, { displayName: name.trim() });
      await sendEmailVerification(credential.user);
      await signOut(auth);
      set({ user: null, onboardingComplete: true });
      await save({ user: null, onboardingComplete: true });
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
    const baseUser: User = current.user ?? {
      id: 'demo-user',
      name: 'Khách hàng',
      email: 'demo@grabfood.vn',
      phone: '0900000000',
      address: DEFAULT_ADDRESS,
      addresses: [],
    };
    const firebaseUser = isFirebaseConfigured ? requireFirebaseAuth().currentUser : null;
    if (firebaseUser && changes.name) await updateFirebaseProfile(firebaseUser, { displayName: changes.name });
    const nextUser = { ...baseUser, ...changes };
    const next = { user: nextUser, onboardingComplete: current.onboardingComplete };
    set(next);
    await save(next);
    await saveUserToDb(nextUser);
  },
  logout: async () => {
    const current = get().user;
    if (current) {
      await saveUserToDb(current);
    }
    if (isFirebaseConfigured) await signOut(requireFirebaseAuth());

    // Xóa giỏ hàng phiên cũ để không bị lẫn giỏ hàng sang tài khoản khác
    useCartStore.getState().clearCart();

    const next = { user: null, onboardingComplete: true };
    set(next);
    await save(next);
  },
}));
