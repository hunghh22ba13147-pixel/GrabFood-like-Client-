require('./register.cjs');
const assert = require('node:assert/strict');
const { test, beforeEach } = require('node:test');
const Module = require('node:module');
const { fixtures } = require('./fixtures.ts');
const { useCartStore: store, CartValidationError } = require('../../../store/cartStore.ts');
let alertArguments;
const native = { Alert: { alert: (...args) => { alertArguments = args; } }, Platform: { OS: 'android' } };
const load = Module._load;
Module._load = function(request, parent, isMain) {
  return request === 'react-native' ? native : load.call(this, request, parent, isMain);
};
const { addToCartWithConfirmation } = require('../addToCartWithConfirmation.ts');
Module._load = load;
let f;
beforeEach(() => {
  store.setState({ items: [], restaurant: null, voucher: null, checkoutLocked: false });
  f = fixtures(); alertArguments = undefined;
});
function seed() { store.getState().addToCart(f.RA, f.D1, 2, []); store.getState().applyVoucher(f.V25); }
test('C14/U + mocked native Alert: cancel preserves cart and voucher', async () => {
  seed(); const previous = store.getState();
  const pending = addToCartWithConfirmation(f.RB, f.D3, 1, []);
  alertArguments[2][0].onPress();
  assert.equal(await pending, false);
  assert.equal(store.getState(), previous);
});
test('C14/U + mocked native Alert: dismiss preserves cart', async () => {
  seed(); const previous = store.getState();
  const pending = addToCartWithConfirmation(f.RB, f.D3, 1, []);
  alertArguments[3].onDismiss();
  assert.equal(await pending, false);
  assert.equal(store.getState(), previous);
});
test('C15/U + mocked native Alert: confirm replaces once, after validation', async () => {
  seed(); const pending = addToCartWithConfirmation(f.RB, f.D3, 1, []);
  assert.equal(store.getState().restaurant.id, f.RA.id);
  alertArguments[2][1].onPress();
  assert.equal(await pending, true);
  assert.equal(store.getState().restaurant.id, f.RB.id);
  assert.equal(store.getState().items.length, 1);
  assert.equal(store.getState().voucher, null);
});
test('C15/U: invalid replacement is rejected before any dialog or clearing', async () => {
  seed(); const previous = store.getState();
  await assert.rejects(addToCartWithConfirmation(f.RB, f.D3, NaN, []), CartValidationError);
  assert.equal(alertArguments, undefined);
  assert.equal(store.getState(), previous);
});
test('C13/U: same restaurant never opens confirmation', async () => {
  seed();
  assert.equal(await addToCartWithConfirmation(f.RA, f.D2, 1, []), true);
  assert.equal(alertArguments, undefined);
  assert.equal(store.getState().items.length, 2);
});
test('C15/O12/U: changing cart while dialog is open invalidates its confirmation', async () => {
  seed(); const pending = addToCartWithConfirmation(f.RB, f.D3, 1, []);
  store.getState().updateQuantity(store.getState().items[0].key, 3);
  const updated = store.getState();
  alertArguments[2][1].onPress();
  assert.equal(await pending, false);
  assert.equal(store.getState(), updated);
});
