const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { authFixture, AUTH_KEY, deferred, flush } = require('./authFixture.cjs');
const { useCartStore: cart } = require('../cartStore.ts');
const { fixtures } = require('../../screens/cart/__tests__/fixtures.ts');
const A = 'a@example.test', B = 'b@example.test', PASSWORD = '123456';
const old = { id: 'old-demo-id', email: A, name: 'A profile', phone: '0901234567', address: 'HOME A',
  addresses: [{ id: 'home', label: 'Home', address: 'HOME A' }] };
beforeEach(() => cart.setState({ items: [], restaurant: null, voucher: null, checkoutLocked: false }));

test('R01: migrate legacy profile without deleting old records; A -> B -> A preserves profile and clears cart', async () => {
  const f = authFixture({ legacyProfiles: { [A]: old } });
  await f.auth.getState().login(A, PASSWORD);
  assert.equal(f.auth.getState().user.id, 'demo:' + A);
  const fields = { phone: 'NEW PHONE', address: 'NEW A', addresses: [{ id: 'new', label: 'School', address: 'NEW A' }] };
  await f.auth.getState().updateProfile(fields);
  const data = fixtures(); cart.getState().addToCart(data.RA, data.D1, 1, data.selected);
  await f.auth.getState().logout(); assert.equal(cart.getState().items.length, 0);
  await f.auth.getState().login(B, PASSWORD); assert.notEqual(f.auth.getState().user.id, 'demo:' + A);
  await f.auth.getState().logout(); await f.auth.getState().login(A, PASSWORD);
  for (const [key, value] of Object.entries(fields)) assert.deepEqual(f.auth.getState().user[key], value);
  assert.deepEqual(JSON.parse(f.memory.get('grabfood-users-db-v1'))[A], old);
  assert.equal(Object.keys(f.record().profiles).length, 2);
});

test('R01: direct account switch clears the old cart; demo IDs do not collide after punctuation normalization', async () => {
  const f = authFixture(); await f.auth.getState().login('a+b@example.test', PASSWORD);
  const id = f.auth.getState().user.id, data = fixtures(); cart.getState().addToCart(data.RA, data.D1, 1, data.selected);
  await f.auth.getState().login('a_b@example.test', PASSWORD);
  assert.notEqual(f.auth.getState().user.id, id); assert.equal(cart.getState().items.length, 0);
});

test('R01: demo session/profile survives creating a fresh store; logout does not erase profiles', async () => {
  const f = authFixture(); await f.auth.getState().login(A, PASSWORD); await f.auth.getState().updateProfile({ phone: 'SAVED' });
  const restarted = authFixture({ memory: f.memory }); await restarted.auth.getState().hydrate();
  assert.equal(restarted.auth.getState().user.phone, 'SAVED');
  await restarted.auth.getState().logout();
  const signedOut = authFixture({ memory: f.memory }); await signedOut.auth.getState().hydrate();
  assert.equal(signedOut.auth.getState().user, null); assert.equal(signedOut.record().profiles['demo:' + A].phone, 'SAVED');
});

test('N01: Firebase duplicate-email rejection leaves all existing persisted data untouched', async () => {
  const f = authFixture({ configured: true, legacyProfiles: { [A]: old } });
  const before = [...f.memory];
  f.sdk.createUserWithEmailAndPassword = async () => { throw Object.assign(new Error('duplicate'), { code: 'auth/email-already-in-use' }); };
  await assert.rejects(f.auth.getState().register('Overwrite', A, PASSWORD), /email-already-in-use/);
  assert.deepEqual([...f.memory], before); assert.equal(f.auth.getState().user, null);
});

test('N01: demo duplicate registration does not overwrite the saved profile', async () => {
  const f = authFixture({ legacyProfiles: { [A]: old } }); const before = [...f.memory];
  await assert.rejects(f.auth.getState().register('Overwrite', A, PASSWORD), /email-already-in-use/);
  assert.deepEqual([...f.memory], before);
});

test('N01: verification failure after Firebase create does not save a partial local profile/session', async () => {
  const f = authFixture({ configured: true }); f.sdk.sendEmailVerification = async () => { throw new Error('verification failed'); };
  await assert.rejects(f.auth.getState().register('User A', A, PASSWORD), /verification failed/);
  assert.equal(f.record(), null); assert.equal(f.auth.getState().user, null); assert.equal(f.firebaseAuth.currentUser, null);
});

test('N01: successful demo registration persists a profile but requires a separate login', async () => {
  const f = authFixture(); await f.auth.getState().register('User A', A, PASSWORD);
  assert.equal(f.auth.getState().user, null); assert.equal(f.record().session.userId, null);
  await f.auth.getState().login(A, PASSWORD); assert.equal(f.auth.getState().user.name, 'User A');
});

test('N02: cached Firebase profile never authorizes a session when SDK currentUser is null', async () => {
  const f = authFixture({ configured: true, legacySession: { user: old, onboardingComplete: true }, legacyProfiles: { [A]: old } });
  await f.auth.getState().hydrate();
  assert.equal(f.auth.getState().user, null); assert.equal(f.auth.getState().hydrated, true);
  assert.deepEqual(JSON.parse(f.memory.get('grabfood-users-db-v1'))[A], old);
});

test('N02: hydration waits for SDK authStateReady before accepting a verified matching UID', async () => {
  const user = { ...old, id: 'uid:' + A }, ready = deferred();
  const f = authFixture({ configured: true, legacySession: { user, onboardingComplete: true }, legacyProfiles: { [A]: user } });
  f.firebaseAuth.authStateReady = () => ready.promise;
  const pending = f.auth.getState().hydrate(); await flush();
  assert.equal(f.auth.getState().hydrated, false); assert.equal(f.auth.getState().user, null);
  f.firebaseAuth.currentUser = { uid: user.id, email: A, emailVerified: true, displayName: null };
  ready.resolve(); await pending;
  assert.equal(f.auth.getState().user.id, user.id); assert.equal(f.auth.getState().user.phone, user.phone);
});

test('N02: unverified SDK user is signed out; failed reload does not accept cached credentials', async () => {
  for (const unverified of [true, false]) {
    const f = authFixture({ configured: true, legacySession: { user: old, onboardingComplete: true } });
    f.firebaseAuth.currentUser = { uid: old.id, email: A, emailVerified: !unverified };
    if (!unverified) f.sdk.reload = async () => { throw new Error('offline'); };
    await f.auth.getState().hydrate(); assert.equal(f.auth.getState().user, null);
    if (unverified) assert.equal(f.firebaseAuth.currentUser, null);
    else assert.match(f.auth.getState().hydrationError, /offline/);
  }
});

test('R01/N02: legacy Firebase profile from another UID is preserved but not reassigned by matching email', async () => {
  const f = authFixture({ configured: true, legacyProfiles: { [A]: { ...old, id: 'different-firebase-uid' } } });
  await f.auth.getState().login(A, PASSWORD);
  assert.equal(f.auth.getState().user.id, 'uid:' + A); assert.equal(f.auth.getState().user.phone, '');
  assert.equal(JSON.parse(f.memory.get('grabfood-users-db-v1'))[A].phone, old.phone);
});

test('N03: failed atomic profile write rejects, keeps both state and persistent record unchanged, then retries', async () => {
  const f = authFixture(); await f.auth.getState().login(A, PASSWORD);
  const state = structuredClone(f.auth.getState().user), saved = f.memory.get(AUTH_KEY);
  f.failWrites.add(AUTH_KEY);
  await assert.rejects(f.auth.getState().updateProfile({ phone: 'UNSAVED', address: 'UNSAVED' }), /storage-write-failed/);
  assert.deepEqual(f.auth.getState().user, state); assert.equal(f.memory.get(AUTH_KEY), saved);
  f.failWrites.clear(); await f.auth.getState().updateProfile({ phone: 'SAVED' });
  assert.equal(f.auth.getState().user.phone, 'SAVED'); assert.equal(f.record().profiles[state.id].phone, 'SAVED');
});

test('N03: failed demo registration write does not leave a partial profile or authenticated state', async () => {
  const f = authFixture(); f.failWrites.add(AUTH_KEY);
  await assert.rejects(f.auth.getState().register('User A', A, PASSWORD), /storage-write-failed/);
  assert.equal(f.record(), null); assert.equal(f.auth.getState().user, null);
});

test('N03: concurrent profile patches compose without losing phone or addresses', async () => {
  const f = authFixture(); await f.auth.getState().login(A, PASSWORD);
  const addresses = [{ id: 'concurrent', label: 'Home', address: 'HOME' }];
  await Promise.all([f.auth.getState().updateProfile({ phone: 'CONCURRENT' }), f.auth.getState().updateProfile({ addresses })]);
  assert.equal(f.auth.getState().user.phone, 'CONCURRENT'); assert.deepEqual(f.auth.getState().user.addresses, addresses);
});

test('N04: late A profile response after logout/login B rejects without changing B or persistent session', async () => {
  const f = authFixture({ configured: true }); await f.auth.getState().login(A, PASSWORD);
  const wait = deferred(); f.sdk.updateProfile = () => wait.promise;
  const pending = f.auth.getState().updateProfile({ name: 'Late A' });
  const rejected = assert.rejects(pending, /session-changed/);
  await f.auth.getState().logout(); await f.auth.getState().login(B, PASSWORD);
  const before = f.memory.get(AUTH_KEY); wait.resolve(); await rejected;
  assert.equal(f.auth.getState().user.email, B); assert.equal(f.memory.get(AUTH_KEY), before);
  assert.equal(f.record().session.userId, 'uid:' + B);
});

test('N04: superseded Firebase login cannot replace a newer account or sign it out', async () => {
  const f = authFixture({ configured: true }), wait = deferred(), signIn = f.sdk.signInWithEmailAndPassword;
  f.sdk.signInWithEmailAndPassword = async (...args) => { if (args[1] === A) await wait.promise; return signIn(...args); };
  const first = f.auth.getState().login(A, PASSWORD), rejected = assert.rejects(first, /session-changed/);
  await flush(); const second = f.auth.getState().login(B, PASSWORD); wait.resolve(); await Promise.all([rejected, second]);
  assert.equal(f.auth.getState().user.email, B); assert.equal(f.firebaseAuth.currentUser.email, B);
});

test('N03: malformed storage is preserved and reported rather than silently replaced with an empty database', async () => {
  const f = authFixture(); f.memory.set(AUTH_KEY, '{broken');
  await assert.rejects(f.auth.getState().login(A, PASSWORD), /storage-invalid/);
  assert.equal(f.memory.get(AUTH_KEY), '{broken'); assert.equal(f.auth.getState().user, null);
  await f.auth.getState().hydrate(); assert.match(f.auth.getState().hydrationError, /storage-invalid/);
});

test('N03: storage failure after Firebase signOut must not retain an authenticated client user', async () => {
  const f = authFixture({ configured: true }); await f.auth.getState().login(A, PASSWORD);
  const before = f.memory.get(AUTH_KEY); f.failWrites.add(AUTH_KEY);
  await assert.rejects(f.auth.getState().logout());
  assert.equal(f.firebaseAuth.currentUser, null); assert.equal(f.auth.getState().user, null);
  assert.equal(f.memory.get(AUTH_KEY), before); // Failed write preserves recoverable profiles.
});

test('N04: superseded verification resend does not send email or replace the new account', async () => {
  const f = authFixture({ configured: true }), gate = deferred(), signIn = f.sdk.signInWithEmailAndPassword;
  let sent = 0;
  f.sdk.signInWithEmailAndPassword = async (...args) => { const result = await signIn(...args); if (args[1] === A) result.user.emailVerified = false; return result; };
  f.sdk.reload = async user => { if (user.email === A) await gate.promise; };
  f.sdk.sendEmailVerification = async () => { sent++; };
  const oldTask = f.auth.getState().resendVerification(A, PASSWORD), rejected = assert.rejects(oldTask, /session-changed/);
  await flush(); const login = f.auth.getState().login(B, PASSWORD); gate.resolve(); await Promise.all([rejected, login]);
  assert.equal(sent, 0); assert.equal(f.auth.getState().user.email, B); assert.equal(f.firebaseAuth.currentUser.email, B);
});

test('N01/N04: superseded Firebase registration leaves no partial A profile while B signs in', async () => {
  const f = authFixture({ configured: true }), gate = deferred(), create = f.sdk.createUserWithEmailAndPassword;
  f.sdk.createUserWithEmailAndPassword = async (...args) => { await gate.promise; return create(...args); };
  const oldTask = f.auth.getState().register('User A', A, PASSWORD), rejected = assert.rejects(oldTask, /session-changed/);
  await flush(); const login = f.auth.getState().login(B, PASSWORD); gate.resolve(); await Promise.all([rejected, login]);
  assert.equal(f.auth.getState().user.email, B); assert.equal(f.record().profiles['uid:' + A], undefined);
  assert.equal(f.record().session.userId, 'uid:' + B);
});
