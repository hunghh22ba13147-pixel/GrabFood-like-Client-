require('../../cart/__tests__/register.cjs');
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { useCartStore: cart, createCartItem, calcPricing } = require('../../../store/cartStore.ts');
const { useOrderStore: orders, ordersForUser } = require('../../../store/orderStore.ts');
const { reorderOrder } = require('../reorder.ts');
const restaurants = require('../../../data/restaurants.json'), dishes = require('../../../data/dishes.json');
const A = 'uid-A', B = 'uid-B';
let restaurant, menu, old, owner, confirmations;
const selected = [{ optionId: 'size', choiceIds: ['L'] }, { optionId: 'topping', choiceIds: ['pudding'] }];
beforeEach(() => {
  cart.setState({ restaurant: null, items: [], voucher: null, checkoutLocked: false }); orders.setState({ orders: [] });
  restaurant = structuredClone(restaurants[0]); menu = structuredClone(dishes.filter(d => d.restaurantId === restaurant.id));
  const item = createCartItem(restaurant, menu[0], 2, selected, 'OLD NOTE');
  old = orders.getState().placeOrder({ userId: A, restaurant, items: [item], pricing: calcPricing([item], restaurant, null), address: 'OLD ADDRESS', paymentMethod: 'wallet', voucherCode: 'OLD-VOUCHER' });
  for (let i = 0; i < 3; i++) orders.getState().advance(old.id, A);
  old = orders.getState().orders[0]; owner = A; confirmations = 0;
});
function dependencies(overrides = {}) {
  return { getUserId: () => owner, getRestaurant: async () => restaurant, getDishes: async () => menu,
    confirmReplace: async () => { confirmations++; return true; }, ...overrides };
}
function seed(same = false) {
  const r = same ? restaurant : restaurants[1], dish = same ? menu[0] : dishes.find(d => d.restaurantId === r.id);
  cart.getState().addToCart(r, dish, 2, [{ optionId: 'size', choiceIds: ['M'] }], 'EXISTING CART');
  cart.getState().applyVoucher({ id: 'keep', code: 'KEEP', title: 'Keep old voucher', type: 'amount', value: 1000, minOrder: 0 });
  return cart.getState();
}

test('R01: owner-scoped reads hide other and unowned legacy Orders without deleting them', () => {
  const legacy = { ...old, id: 'legacy' }; delete legacy.userId;
  const b = { ...old, id: 'B', userId: B }; orders.setState({ orders: [old, b, legacy] });
  assert.deepEqual(ordersForUser(orders.getState().orders, A).map(o => o.id), [old.id]);
  assert.deepEqual(ordersForUser(orders.getState().orders, B).map(o => o.id), ['B']);
  assert.deepEqual(ordersForUser(orders.getState().orders, null), []); assert.equal(orders.getState().orders.length, 3);
  assert.throws(() => orders.getState().placeOrder({ ...old, pricing: old, userId: '' }), /tài khoản/);
});

test('R03: extra pricing properties cannot overwrite the generated ID or owned Order snapshot', () => {
  const created = orders.getState().placeOrder({ ...old, userId: A, pricing: { ...old, id: 'FORGED', restaurant: restaurants[1], items: [] } });
  assert.notEqual(created.id, 'FORGED'); assert.notEqual(created.id, old.id);
  assert.equal(created.restaurant.id, restaurant.id); assert.equal(created.items.length, 1); assert.equal(created.userId, A);
});

test('R03/R01: 1000 same-clock/fixed-random Orders stay distinct; advance requires matching owner and id', (t) => {
  t.mock.method(Date, 'now', () => 1792897200000); t.mock.method(Math, 'random', () => 0.5);
  orders.setState({ orders: [] }); const created = Array.from({ length: 1000 }, () => orders.getState().placeOrder({ ...old, pricing: old, userId: A }));
  assert.equal(new Set(created.map(o => o.id)).size, 1000);
  orders.getState().advance(created[0].id, B); assert.equal(orders.getState().orders.filter(o => o.status !== 'placed').length, 0);
  orders.getState().advance(created[0].id, A); assert.equal(orders.getState().orders.filter(o => o.status === 'preparing').length, 1);
  assert.equal(orders.getState().orders.find(o => o.id === created[1].id).status, 'placed');
});

test('R06: empty-cart reorder keeps options/quantity/note, fetches current menu/ship, creates no Order and preserves history snapshot', async () => {
  const snapshot = structuredClone(old); restaurant.deliveryFee += 2000; menu[0].price += 10000;
  menu[0].options.find(o => o.id === 'topping').choices.find(c => c.id === 'pudding').price += 3000;
  assert.equal(await reorderOrder(old, dependencies()), true);
  const state = cart.getState(), item = state.items[0];
  assert.equal(item.unitPrice, 75000); assert.equal(item.quantity, 2); assert.equal(item.note, 'OLD NOTE');
  assert.deepEqual(item.selectedOptions, old.items[0].selectedOptions);
  assert.deepEqual(calcPricing(state.items, state.restaurant, state.voucher), { subtotal: 150000, deliveryFee: 10000, discount: 0, total: 160000 });
  assert.equal(state.voucher, null); assert.equal(orders.getState().orders.length, 1); assert.deepEqual(old, snapshot); assert.equal(confirmations, 0);
});

for (const same of [true, false]) for (const confirm of [true, false]) {
  test('R06: ' + (same ? 'same' : 'different') + ' restaurant replacement, confirmation=' + confirm, async () => {
    const before = seed(same), snapshot = structuredClone(old);
    const result = await reorderOrder(old, dependencies({ confirmReplace: async () => { confirmations++; return confirm; } }));
    assert.equal(result, confirm); assert.equal(confirmations, 1); assert.deepEqual(old, snapshot);
    if (confirm) { assert.equal(cart.getState().items[0].note, 'OLD NOTE'); assert.equal(cart.getState().voucher, null); }
    else { assert.equal(cart.getState().items, before.items); assert.equal(cart.getState().voucher, before.voucher); }
  });
}

for (const issue of ['missing restaurant', 'wrong restaurant', 'removed dish', 'removed choice', 'invalid current price', 'invalid quantity']) {
  test('R06: ' + issue + ' rejects before replacing existing cart or showing confirmation', async () => {
    const before = seed(); let overrides = {};
    if (issue === 'missing restaurant') overrides.getRestaurant = async () => undefined;
    if (issue === 'wrong restaurant') overrides.getRestaurant = async () => restaurants[1];
    if (issue === 'removed dish') menu = [];
    if (issue === 'removed choice') menu[0].options.find(o => o.id === 'topping').choices = [];
    if (issue === 'invalid current price') menu[0].price = NaN;
    if (issue === 'invalid quantity') old = { ...old, items: old.items.map(item => ({ ...item, quantity: 0 })) };
    await assert.rejects(reorderOrder(old, dependencies(overrides)));
    assert.equal(cart.getState().items, before.items); assert.equal(cart.getState().voucher, before.voucher); assert.equal(confirmations, 0);
  });
}

test('R06: stale snapshot price is ignored in favor of the valid current dish price', async () => {
  old = structuredClone(old); old.items[0].dish.price = NaN;
  assert.equal(await reorderOrder(old, dependencies()), true); assert.equal(cart.getState().items[0].unitPrice, 62000);
});

test('R06: API rejection keeps cart, voucher and Order untouched', async () => {
  const before = seed(), snapshot = structuredClone(old);
  await assert.rejects(reorderOrder(old, dependencies({ getDishes: async () => { throw new Error('network failed'); } })), /network failed/);
  assert.equal(cart.getState().items, before.items); assert.equal(cart.getState().voucher, before.voucher); assert.deepEqual(old, snapshot);
});

for (const change of ['account', 'cart', 'checkout lock']) {
  test('R01/R06: ' + change + ' changing while menu loads prevents stale replacement', async () => {
    seed(); let resolve;
    const pending = reorderOrder(old, dependencies({ getDishes: () => new Promise(done => { resolve = done; }) }));
    if (change === 'account') owner = B;
    if (change === 'cart') cart.getState().updateQuantity(cart.getState().items[0].key, 3);
    if (change === 'checkout lock') cart.setState({ checkoutLocked: true });
    const expected = cart.getState(); resolve(menu); await assert.rejects(pending);
    assert.equal(cart.getState().items, expected.items); assert.equal(cart.getState().voucher, expected.voucher);
  });
}

test('R06: an old confirmation cannot replace a cart edited while the dialog was open', async () => {
  seed(); let resolve;
  const pending = reorderOrder(old, dependencies({ confirmReplace: () => new Promise(done => { resolve = done; }) }));
  await new Promise(done => setImmediate(done));
  cart.getState().updateQuantity(cart.getState().items[0].key, 4); const expected = cart.getState();
  resolve(true); await assert.rejects(pending, /thay đổi/); assert.equal(cart.getState().items, expected.items);
});

test('R01/R06: another owner, missing owner and non-completed Orders cannot be reordered', async () => {
  const before = seed();
  for (const changes of [{ userId: B }, { userId: undefined }, { status: 'placed' }]) {
    await assert.rejects(reorderOrder({ ...old, ...changes }, dependencies())); assert.equal(cart.getState().items, before.items);
  }
});
