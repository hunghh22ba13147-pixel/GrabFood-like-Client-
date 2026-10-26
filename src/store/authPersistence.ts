import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../models/types';

// One record commits the session and profiles together. Legacy records remain untouched.
export const AUTH_STORAGE_KEY = 'grabfood-auth-v2';
const LEGACY_SESSION_KEY = 'grabfood-auth-v1';
const LEGACY_PROFILES_KEY = 'grabfood-users-db-v1';

export interface AuthRecord {
  version: 2;
  profiles: Record<string, User>;
  session: { userId: string | null; onboardingComplete: boolean };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function isUser(value: unknown): value is User {
  return isObject(value) && ['id', 'name', 'email', 'phone', 'address'].every((key) => typeof value[key] === 'string')
    && (value.addresses === undefined || (Array.isArray(value.addresses) && value.addresses.every((address: unknown) =>
      isObject(address) && ['id', 'label', 'address'].every((key) => typeof address[key] === 'string'))));
}

async function read(key: string): Promise<unknown> {
  let raw: string | null;
  try { raw = await AsyncStorage.getItem(key); }
  catch (cause) { throw new Error('auth/storage-read-failed', { cause }); }
  if (raw === null) return null;
  try { return JSON.parse(raw); }
  catch { throw new Error('auth/storage-invalid'); }
}

export async function readAuthRecord(): Promise<AuthRecord | null> {
  const value = await read(AUTH_STORAGE_KEY);
  if (value === null) return null;
  if (!isObject(value) || value.version !== 2 || !isObject(value.profiles) || !isObject(value.session)
    || (value.session.userId !== null && typeof value.session.userId !== 'string')
    || typeof value.session.onboardingComplete !== 'boolean'
    || !Object.values(value.profiles).every(isUser)) throw new Error('auth/storage-invalid');
  const profiles: Record<string, User> = {};
  for (const [id, profile] of Object.entries(value.profiles)) {
    if (!isUser(profile) || profile.id !== id) throw new Error('auth/storage-invalid');
    profiles[id] = profile;
  }
  return { version: 2, profiles, session: {
    userId: value.session.userId, onboardingComplete: value.session.onboardingComplete,
  } };
}

export async function readLegacySession(): Promise<{ user: User | null; onboardingComplete: boolean }> {
  const value = await read(LEGACY_SESSION_KEY);
  if (value === null) return { user: null, onboardingComplete: false };
  if (!isObject(value) || (value.user !== null && value.user !== undefined && !isUser(value.user))) {
    throw new Error('auth/storage-invalid');
  }
  return { user: isUser(value.user) ? value.user : null, onboardingComplete: value.onboardingComplete === true };
}

export async function readLegacyProfile(email: string): Promise<User | null> {
  const value = await read(LEGACY_PROFILES_KEY);
  if (value !== null && !isObject(value)) throw new Error('auth/storage-invalid');
  const profile = isObject(value) ? value[email.trim().toLowerCase()] : null;
  if (isUser(profile) && profile.email.trim().toLowerCase() === email.trim().toLowerCase()) return profile;
  const saved = await readLegacySession();
  return saved.user?.email.trim().toLowerCase() === email.trim().toLowerCase() ? saved.user : null;
}

export function emptyAuthRecord(): AuthRecord {
  return { version: 2, profiles: {}, session: { userId: null, onboardingComplete: false } };
}

export async function writeAuthRecord(record: AuthRecord): Promise<void> {
  try { await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(record)); }
  catch (cause) { throw new Error('auth/storage-write-failed', { cause }); }
}
