import { create } from 'zustand';
import {
  createUserWithEmailAndPassword, reload, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword,
  signOut, updateProfile as updateFirebaseProfile, type User as FirebaseUser,
} from 'firebase/auth';
import type { User } from '../models/types';
import { isFirebaseConfigured, requireFirebaseAuth } from '../services/firebase';
import { useCartStore } from './cartStore';
import { emptyAuthRecord, readAuthRecord, readLegacyProfile, readLegacySession, writeAuthRecord, type AuthRecord } from './authPersistence';

const DEFAULT_ADDRESS = '18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội';
export type LoginResult = 'signed-in' | 'verification-required';
interface AuthState {
  user: User | null;
  onboardingComplete: boolean;
  hydrated: boolean;
  hydrationError: string | null;
  hydrate: () => Promise<void>;
  finishOnboarding: () => Promise<void>;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (name: string, email: string, password: string) => Promise<void>;
  resendVerification: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (changes: Partial<Pick<User, 'name' | 'phone' | 'address' | 'addresses'>>) => Promise<void>;
  logout: () => Promise<void>;
}

const demoId = (email: string) => 'demo:' + email.trim().toLowerCase();
function copyUser(user: User): User {
  return { ...user, addresses: user.addresses?.map((address) => ({ ...address })) };
}
function newDemoUser(email: string, name = email.split('@')[0]): User {
  return { id: demoId(email), name, email, phone: '0900000000', address: DEFAULT_ADDRESS,
    addresses: [{ id: 'addr-default', label: 'Nhà riêng', address: DEFAULT_ADDRESS }] };
}
function makeUser(firebaseUser: FirebaseUser, previous: User | null): User {
  const profile = previous?.id === firebaseUser.uid ? previous : null;
  return { id: firebaseUser.uid, email: firebaseUser.email ?? '',
    name: firebaseUser.displayName || profile?.name || firebaseUser.email?.split('@')[0] || 'Người dùng',
    phone: profile?.phone ?? '', address: profile?.address ?? DEFAULT_ADDRESS,
    addresses: profile?.addresses?.map((address) => ({ ...address })) ?? [] };
}
function authError(error: unknown): Error {
  const details = error as { code?: string; message?: string } | null;
  return new Error(details?.code ?? details?.message ?? 'auth/unknown');
}

export const useAuthStore = create<AuthState>((set, get) => {
  let generation = 0;
  let writes: Promise<unknown> = Promise.resolve();
  let identities: Promise<unknown> = Promise.resolve();
  let hydration: Promise<void> | null = null;
  const check = (token: number) => {
    if (token !== generation) throw new Error('auth/session-changed');
  };
  function identity<T>(operation: () => Promise<T>): Promise<T> {
    const pending = identities.then(operation);
    // Keep the queue usable after failure; the original promise still rejects to its caller.
    identities = pending.then(() => undefined, () => undefined);
    return pending;
  }
  function commit(token: number, update: (record: AuthRecord) => AuthRecord): Promise<AuthRecord> {
    const pending = writes.then(async () => {
      check(token);
      const record = await readAuthRecord() ?? emptyAuthRecord();
      check(token);
      const next = update(record);
      await writeAuthRecord(next);
      check(token);
      return next;
    });
    writes = pending.then(() => undefined, () => undefined);
    return pending;
  }
  async function saveSession(token: number, user: User | null, onboardingComplete: boolean) {
    const record = await commit(token, (current) => ({ ...current,
      profiles: user ? { ...current.profiles, [user.id]: copyUser(user) } : current.profiles,
      session: { userId: user?.id ?? null, onboardingComplete },
    }));
    check(token);
    if (get().user?.id !== user?.id) useCartStore.getState().clearCart();
    set({ user: user ? copyUser(record.profiles[user.id]) : null, onboardingComplete, hydrationError: null });
  }
  function startIdentity() {
    if (useCartStore.getState().checkoutLocked) throw new Error('auth/checkout-in-progress');
    return ++generation;
  }
  return {
    user: null, onboardingComplete: false, hydrated: false, hydrationError: null,
    hydrate: () => {
      if (get().hydrated) return Promise.resolve();
      if (hydration) return hydration;
      const token = generation;
      hydration = identity(async () => {
        try {
          const record = await readAuthRecord();
          const legacy = record ? null : await readLegacySession();
          const onboarded = record?.session.onboardingComplete ?? legacy?.onboardingComplete ?? false;
          let user: User | null = null;
          if (isFirebaseConfigured) {
            const auth = requireFirebaseAuth();
            await auth.authStateReady();
            check(token);
            const current = auth.currentUser;
            if (current) {
              await reload(current);
              check(token);
              if (current.emailVerified) {
                const previous = record?.profiles[current.uid] ?? await readLegacyProfile(current.email ?? '');
                user = makeUser(current, previous);
              } else {
                await signOut(auth);
              }
            }
          } else if (record?.session.userId) {
            user = record.profiles[record.session.userId] ?? null;
          } else if (!record && legacy?.user) {
            const previous = await readLegacyProfile(legacy.user.email) ?? legacy.user;
            user = { ...previous, id: demoId(previous.email) };
          }
          check(token);
          // Only a verified SDK user can restore a Firebase session; cached profiles are data, not authorization.
          await saveSession(token, user, onboarded);
        } catch (error) {
          if (token === generation) set({ user: null, hydrationError: authError(error).message });
        } finally {
          if (token === generation) set({ hydrated: true });
        }
      }).finally(() => { hydration = null; });
      return hydration;
    },
    finishOnboarding: async () => {
      await saveSession(generation, get().user, true);
    },
    login: async (email, password) => {
      const normalized = email.trim().toLowerCase();
      const token = startIdentity();
      return identity(async () => {
        check(token);
        if (!isFirebaseConfigured) {
          if (!normalized.includes('@') || password.length < 6) throw new Error('auth/invalid-credential');
          const record = await readAuthRecord();
          const previous = record?.profiles[demoId(normalized)] ?? await readLegacyProfile(normalized);
          const user = previous ? { ...previous, id: demoId(normalized), email: normalized } : newDemoUser(normalized);
          await saveSession(token, user, true);
          return 'signed-in';
        }
        const auth = requireFirebaseAuth();
        try {
          const credential = await signInWithEmailAndPassword(auth, normalized, password);
          check(token);
          await reload(credential.user);
          check(token);
          if (!credential.user.emailVerified) {
            await signOut(auth);
            await saveSession(token, null, true);
            return 'verification-required';
          }
          const record = await readAuthRecord();
          const previous = record?.profiles[credential.user.uid] ?? await readLegacyProfile(normalized);
          await saveSession(token, makeUser(credential.user, previous), true);
          return 'signed-in';
        } catch (error) {
          // Identity SDK operations are serialized, so a newer login cannot be signed out here.
          try { if (auth.currentUser) await signOut(auth); }
          finally {
            if (token === generation) { useCartStore.getState().clearCart(); set({ user: null }); }
          }
          throw authError(error);
        }
      });
    },
    register: async (name, email, password) => {
      if (get().user) throw new Error('auth/already-signed-in');
      const normalized = email.trim().toLowerCase();
      const token = startIdentity();
      await identity(async () => {
        check(token);
        if (!isFirebaseConfigured) {
          const record = await readAuthRecord();
          if (record?.profiles[demoId(normalized)] || await readLegacyProfile(normalized)) {
            throw new Error('auth/email-already-in-use');
          }
          if (name.trim().length < 2 || !normalized.includes('@') || password.length < 6) {
            throw new Error('auth/invalid-credential');
          }
          const user = { ...newDemoUser(normalized, name.trim()), phone: '' };
          await commit(token, (current) => ({ ...current, profiles: { ...current.profiles, [user.id]: user },
            session: { userId: null, onboardingComplete: true } }));
          set({ user: null, onboardingComplete: true });
          return;
        }
        const auth = requireFirebaseAuth();
        try {
          auth.languageCode = 'vi';
          const credential = await createUserWithEmailAndPassword(auth, normalized, password);
          check(token);
          await updateFirebaseProfile(credential.user, { displayName: name.trim() });
          check(token);
          await sendEmailVerification(credential.user);
          check(token);
          await signOut(auth);
          const user = makeUser(credential.user, null);
          await commit(token, (current) => ({ ...current,
            profiles: current.profiles[user.id] ? current.profiles : { ...current.profiles, [user.id]: user },
            session: { userId: null, onboardingComplete: true } }));
          set({ user: null, onboardingComplete: true });
        } catch (error) {
          if (auth.currentUser) await signOut(auth);
          throw authError(error);
        }
      });
    },
    resendVerification: async (email, password) => {
      if (get().user) throw new Error('auth/already-signed-in');
      const token = generation;
      await identity(async () => {
        check(token);
        const auth = requireFirebaseAuth();
        try {
          const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
          check(token);
          await reload(credential.user);
          check(token);
          if (credential.user.emailVerified) throw new Error('auth/email-already-verified');
          auth.languageCode = 'vi';
          await sendEmailVerification(credential.user);
          check(token);
          await signOut(auth);
        } catch (error) {
          if (auth.currentUser) await signOut(auth);
          throw authError(error);
        }
      });
    },
    updateProfile: async (changes) => {
      const token = generation, user = get().user;
      if (!user) throw new Error('auth/not-signed-in');
      const patch = { ...changes, ...(changes.addresses ? { addresses: changes.addresses.map((address) => ({ ...address })) } : {}) };
      const firebaseUser = isFirebaseConfigured ? requireFirebaseAuth().currentUser : null;
      if (isFirebaseConfigured && firebaseUser?.uid !== user.id) throw new Error('auth/session-changed');
      if (firebaseUser && patch.name) await updateFirebaseProfile(firebaseUser, { displayName: patch.name });
      check(token);
      const record = await commit(token, (current) => {
        if (get().user?.id !== user.id) throw new Error('auth/session-changed');
        const nextUser = { ...(current.profiles[user.id] ?? user), ...patch };
        return { ...current, profiles: { ...current.profiles, [user.id]: nextUser } };
      });
      check(token);
      set({ user: copyUser(record.profiles[user.id]) });
    },
    resetPassword: async (email) => {
      const normalized = email.trim().toLowerCase();
      if (!normalized || !normalized.includes('@')) throw new Error('auth/invalid-email');
      if (!isFirebaseConfigured) return;
      const auth = requireFirebaseAuth();
      auth.languageCode = 'vi';
      try {
        await sendPasswordResetEmail(auth, normalized);
      } catch (error) {
        throw authError(error);
      }
    },
    logout: async () => {
      const token = startIdentity();
      await identity(async () => {
        check(token);
        if (isFirebaseConfigured) await signOut(requireFirebaseAuth());
        try { await saveSession(token, null, true); }
        catch (error) {
          // Once SDK signOut succeeded, never leave an authorized client user after a local write failure.
          if (isFirebaseConfigured && token === generation) {
            useCartStore.getState().clearCart(); set({ user: null });
          }
          throw error;
        }
      });
    },
  };
});
