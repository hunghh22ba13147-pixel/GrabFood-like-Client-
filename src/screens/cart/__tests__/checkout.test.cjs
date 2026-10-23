require('./register.cjs');
const assert = require('node:assert/strict');
const { test, beforeEach } = require('node:test');
const { fixtures } = require('./fixtures.ts');
const { useCartStore: store, CartValidationError } = require('../../../store/cartStore.ts');
const { checkoutReview, createCheckoutController } = require('../checkout.ts');
let f;
beforeEach(() => {
  store.setState({ items: [], restaurant: null, voucher: null, checkoutLocked: false });
  f = fixtures();
});
const state = () => store.getState();
function seed() {
  state().addToCart(f.RA, f.D1, 2, f.selected, f.N1);
  state().addToCart(f.RA, f.D2, 1, []);
  state().applyVoucher(f.V25);
}
function harness(overrides = {}) {
  const calls = [], routes = [];
  const address = 'Địa chỉ fixture checkout';
  const controller = createCheckoutController({
    getAddress: () => address,
    placeOrder: (payload) => {
      calls.push(payload);
      return { id: 'TEST-ORDER', ...payload, ...payload.pricing, status: 'placed', createdAt: 1792897200000 };
    },
    openTracking: (id) => routes.push(id),
    ...overrides,
  });
  return { controller, calls, routes, address, review: () => checkoutReview(state(), address) };
}
test('O01/U controller: empty submit cannot create or navigate', () => {
  const h = harness();
  assert.equal(h.controller.submit(h.review(), 'cash'), null);
  assert.equal(h.calls.length, 0);
  assert.equal(h.routes.length, 0);
  assert.match(h.controller.getState().error, /trống/);
});
for (const payment of ['cash', 'wallet']) {
  test(`O02/O03/O05/U controller: ${payment} payload uses actual enum, snapshot and money`, () => {
    seed(); const h = harness(); const original = structuredClone(state().items);
    const order = h.controller.submit(h.review(), payment);
    assert.equal(h.calls.length, 1);
    const payload = h.calls[0];
    assert.equal(payload.paymentMethod, payment);
    assert.equal(payload.address, h.address);
    assert.equal(payload.voucherCode, 'GRAB50');
    assert.deepEqual(payload.pricing, { subtotal: 104000, deliveryFee: 15000, discount: 25000, total: 94000 });
    assert.deepEqual(payload.items, original);
    assert.equal(payload.items[0].note, 'Ít đá');
    assert.equal(order.total, 94000);
  });
}
for (const payment of [null, undefined, 'card']) {
  test(`O04/U controller: reject invalid payment ${payment}`, () => {
    seed(); const h = harness(); const before = state();
    assert.equal(h.controller.submit(h.review(), payment), null);
    assert.equal(h.calls.length, 0);
    assert.deepEqual(state().items, before.items);
    assert.match(h.controller.getState().error, /phương thức/);
  });
}
test('Address contract: no fabricated fallback address or order', () => {
  seed(); const h = harness({ getAddress: () => '  ' });
  assert.equal(h.controller.submit(h.review(), 'cash'), null);
  assert.equal(h.calls.length, 0);
  assert.match(h.controller.getState().error, /địa chỉ/);
});
test('O06/U controller: retain cart during API, then clear and use returned ID', () => {
  seed(); let h;
  h = harness({ placeOrder: (payload) => {
    assert.equal(state().items.length, 2);
    assert.equal(state().checkoutLocked, true);
    return { id: 'ACTUAL-RETURNED-ID', restaurant: payload.restaurant, items: payload.items, ...payload.pricing,
      paymentMethod: payload.paymentMethod, address: payload.address, status: 'placed', createdAt: 1792897200000 };
  } });
  h.controller.submit(h.review(), 'cash');
  assert.equal(state().items.length, 0);
  assert.equal(state().restaurant, null);
  assert.equal(state().voucher, null);
  assert.equal(state().checkoutLocked, false);
  assert.deepEqual(h.routes, ['ACTUAL-RETURNED-ID']);
  assert.equal(h.controller.getState().phase, 'created');
});
test('O07/U controller: later cart or source changes cannot mutate handed-over Order', () => {
  seed(); const h = harness(); const oldItems = state().items;
  const order = h.controller.submit(h.review(), 'cash');
  const before = structuredClone(order);
  oldItems[0].dish.options[0].choices[0].price = 1;
  oldItems[0].selectedOptions[0].choiceIds.push('new');
  f.D1.options[0].choices[0].price = 2;
  state().addToCart(f.RB, f.D3, 1, []);
  state().updateQuantity(state().items[0].key, 4);
  assert.deepEqual(order, before);
  assert.notEqual(order.items, oldItems);
});
test('O08/O10/U controller: synchronous failure preserves all inputs, unlocks and allows retry', () => {
  seed(); let attempts = 0;
  const h = harness({ placeOrder: (payload) => {
    attempts++;
    if (attempts === 1) throw new Error('Injected synchronous failure before save');
    return { id: 'RETRY-ID', restaurant: payload.restaurant, items: payload.items, ...payload.pricing,
      paymentMethod: payload.paymentMethod, address: payload.address, status: 'placed', createdAt: 1792897200000 };
  } });
  const before = structuredClone({ items: state().items, restaurant: state().restaurant, voucher: state().voucher });
  assert.equal(h.controller.submit(h.review(), 'wallet'), null);
  assert.deepEqual({ items: state().items, restaurant: state().restaurant, voucher: state().voucher }, before);
  assert.equal(state().checkoutLocked, false);
  assert.equal(h.routes.length, 0);
  assert.equal(h.controller.getState().phase, 'idle');
  assert.match(h.controller.getState().error, /giữ lại/);
  assert.equal(h.controller.submit(h.review(), 'wallet').id, 'RETRY-ID');
  assert.equal(attempts, 2);
  assert.deepEqual(h.routes, ['RETRY-ID']);
});
test('O09/U controller: reentrant submit before rerender and repeated tap after success create once', () => {
  seed(); let calls = 0, h, reviewed;
  h = harness({ placeOrder: (payload) => {
    calls++;
    assert.equal(h.controller.getState().phase, 'submitting');
    assert.equal(h.controller.submit(reviewed, 'cash'), null);
    return { id: 'ONCE', restaurant: payload.restaurant, items: payload.items, ...payload.pricing,
      paymentMethod: payload.paymentMethod, address: payload.address, status: 'placed', createdAt: 1792897200000 };
  } });
  reviewed = h.review();
  h.controller.submit(reviewed, 'cash');
  assert.equal(h.controller.submit(reviewed, 'cash'), null);
  assert.equal(calls, 1);
});
test('O11/U controller: navigation failure offers tracking retry without resubmission', () => {
  seed(); let routeAttempts = 0;
  const h = harness({ openTracking: (id) => {
    assert.equal(id, 'TEST-ORDER');
    routeAttempts++;
    if (routeAttempts === 1) throw new Error('Injected navigation failure');
  } });
  const reviewed = h.review();
  h.controller.submit(reviewed, 'cash');
  assert.equal(h.controller.getState().phase, 'created');
  assert.match(h.controller.getState().error, /Đơn đã được tạo/);
  assert.equal(h.controller.submit(reviewed, 'cash'), null);
  h.controller.openTracking();
  assert.equal(h.controller.getState().error, null);
  assert.equal(h.calls.length, 1);
  assert.equal(routeAttempts, 2);
});
test('O12/U controller: every public cart mutation is blocked during synchronous create', () => {
  seed(); let lockedState;
  const h = harness({ placeOrder: (payload) => {
    const key = state().items[0].key;
    lockedState = state();
    for (const action of [
      () => state().addToCart(f.RA, f.D2, 1, []), () => state().updateQuantity(key, 3),
      () => state().removeItem(key), () => state().clear(), () => state().applyVoucher(null),
      () => state().replaceCart(f.RB, f.D3, 1, []),
    ]) assert.throws(action, CartValidationError);
    assert.equal(state(), lockedState);
    return { id: 'LOCKED', restaurant: payload.restaurant, items: payload.items, ...payload.pricing,
      paymentMethod: payload.paymentMethod, address: payload.address, status: 'placed', createdAt: 1792897200000 };
  } });
  h.controller.submit(h.review(), 'cash');
  assert.equal(h.controller.getState().phase, 'created');
});
test('O13/U controller: stale cart review blocks submit until new total is reviewed', () => {
  seed(); const h = harness(); const reviewed = h.review();
  state().updateQuantity(state().items[0].key, 3);
  assert.equal(h.controller.submit(reviewed, 'cash'), null);
  assert.equal(h.calls.length, 0);
  assert.match(h.controller.getState().error, /thay đổi/);
  h.controller.submit(h.review(), 'cash');
  assert.deepEqual(h.calls[0].pricing, { subtotal: 146000, deliveryFee: 15000, discount: 25000, total: 136000 });
});
test('O13/U controller: stale address blocks submit even if total is unchanged', () => {
  seed(); let address = 'A';
  const h = harness({ getAddress: () => address });
  const reviewed = checkoutReview(state(), address);
  address = 'B';
  assert.equal(h.controller.submit(reviewed, 'cash'), null);
  assert.equal(h.calls.length, 0);
});
test('V10/O13/U controller: selected voucher below minimum cannot reach order API', () => {
  seed(); state().removeItem(state().items[1].key); state().updateQuantity(state().items[0].key, 1);
  const h = harness();
  assert.equal(h.controller.submit(h.review(), 'cash'), null);
  assert.match(h.controller.getState().error, /tối thiểu/);
  assert.equal(h.calls.length, 0);
  state().applyVoucher(null);
  assert.equal(h.controller.submit(h.review(), 'cash').total, 57000);
});
test('V19/O13/U controller: direct malformed store state cannot create an Order', () => {
  seed(); store.setState({ items: state().items.map((item) => ({ ...item, unitPrice: NaN })) });
  const h = harness();
  assert.equal(h.controller.submit(null, 'cash'), null);
  assert.equal(h.calls.length, 0);
  assert.equal(state().items.length, 2);
  assert.equal(state().checkoutLocked, false);
});
