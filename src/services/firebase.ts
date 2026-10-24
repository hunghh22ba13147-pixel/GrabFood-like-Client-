import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
);

let auth: Auth | null = null;

if (isFirebaseConfigured) {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    try {
      auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
    } catch {
      // Fast refresh can reuse the Auth instance created by an earlier module load.
      auth = getAuth(app);
    }
  }
}

export function requireFirebaseAuth(): Auth {
  if (!auth) throw new Error('firebase/not-configured');
  return auth;
}
