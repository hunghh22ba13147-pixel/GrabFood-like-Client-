// Real auth/cart stores, isolated in-memory persistence and Firebase SDK boundary. No network.
require('../../screens/cart/__tests__/register.cjs');
const Module = require('node:module');
const AUTH_KEY = 'grabfood-auth-v2';
function authFixture({ configured = false, legacySession, legacyProfiles, record, memory = new Map() } = {}) {
  if (legacySession) memory.set('grabfood-auth-v1', JSON.stringify(legacySession));
  if (legacyProfiles) memory.set('grabfood-users-db-v1', JSON.stringify(legacyProfiles));
  if (record) memory.set(AUTH_KEY, JSON.stringify(record));
  const failWrites = new Set(), failReads = new Set();
  const storage = {
    getItem: async (key) => { if (failReads.has(key)) throw new Error('Injected read failure'); return memory.get(key) ?? null; },
    setItem: async (key, value) => { if (failWrites.has(key)) throw new Error('Injected write failure'); memory.set(key, value); },
  };
  const firebaseAuth = { currentUser: null, authStateReady: async () => {} };
  const sdk = {
    signInWithEmailAndPassword: async (_auth, email) => {
      const user = { uid: 'uid:' + email, email, emailVerified: true, displayName: null };
      firebaseAuth.currentUser = user; return { user };
    },
    createUserWithEmailAndPassword: async (_auth, email) => {
      const user = { uid: 'uid:' + email, email, emailVerified: false, displayName: null };
      firebaseAuth.currentUser = user; return { user };
    },
    reload: async () => {}, sendEmailVerification: async () => {},
    signOut: async () => { firebaseAuth.currentUser = null; },
    updateProfile: async (user, changes) => { Object.assign(user, changes); },
  };
  const authPath = require.resolve('../authStore.ts');
  delete require.cache[authPath];
  delete require.cache[require.resolve('../authPersistence.ts')];
  const load = Module._load;
  Module._load = function(request, parent, isMain) {
    if (request === '@react-native-async-storage/async-storage') return storage;
    if (request === 'firebase/auth') return sdk;
    if (request === '../services/firebase' && parent?.filename === authPath) {
      return { isFirebaseConfigured: configured, requireFirebaseAuth: () => firebaseAuth };
    }
    return load.call(this, request, parent, isMain);
  };
  let auth;
  try { auth = require('../authStore.ts').useAuthStore; }
  finally { Module._load = load; }
  return { auth, memory, failWrites, failReads, sdk, firebaseAuth, storage, configured,
    record: () => JSON.parse(memory.get(AUTH_KEY) ?? 'null') };
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
module.exports = { authFixture, AUTH_KEY, deferred, flush };
