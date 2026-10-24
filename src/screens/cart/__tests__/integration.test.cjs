require('./register.cjs');
const assert = require('node:assert/strict');
const { test, beforeEach } = require('node:test');
const { api } = require('../../../services/api.ts');
const { useCartStore: cart, calcPricing } = require('../../../store/cartStore.ts');
const { useOrderStore: orders } = require('../../../store/orderStore.ts');
const { useAuthStore: auth } = require('../../../store/authStore.ts');
const { createCheckoutController, checkoutReview } = require('../checkout.ts');
beforeEach(() => {
  cart.setState({ items: [], restaurant: null, voucher: null, checkoutLocked: false });
  orders.setState({ orders: [] }); auth.setState({ user: null });
});

test('Order handoff/I real service + stores: correct actual menu/voucher, returned Order and detached snapshot (not Tracking/History)', async (t) => {
  const fixed = Date.parse('2026-10-25T10:00:00+07:00');
  t.mock.method(Date, 'now', () => fixed);
  const [restaurant, dishes, vouchers] = await Promise.all([api.getRestaurant('r1'), api.getDishes('r1'), api.getVouchers()]);
  assert.ok(restaurant);
  const dish = dishes.find((entry) => entry.id === 'r1-d1');
  const voucher = vouchers.find((entry) => entry.code === 'GIAM15K');
  assert.ok(dish); assert.ok(voucher);
  auth.getState().register('TV3 test', 'tv3@example.test', 'test-password');
  cart.getState().addToCart(restaurant, dish, 2, [
    { optionId: 'size', choiceIds: ['L'] }, { optionId: 'topping', choiceIds: ['pearl-white', 'pudding'] },
  ], 'Ít đá');
  cart.getState().applyVoucher(voucher);
  const snapshot = cart.getState();
  const pricing = calcPricing(snapshot.items, snapshot.restaurant, snapshot.voucher);
  assert.deepEqual(pricing, { subtotal: 140000, deliveryFee: 8000, discount: 15000, total: 133000 });
  const routes = [];
  const controller = createCheckoutController({ placeOrder: orders.getState().placeOrder,
    getAddress: () => auth.getState().user.address, openTracking: (id) => routes.push(id) });
  const order = controller.submit(checkoutReview(snapshot, auth.getState().user.address), 'wallet');
  assert.ok(order);
  assert.equal(orders.getState().orders.length, 1);
  assert.equal(orders.getState().orders[0], order);
  assert.equal(order.paymentMethod, 'wallet');
  assert.equal(order.voucherCode, 'GIAM15K');
  assert.equal(order.status, 'placed');
  assert.equal(order.createdAt, fixed);
  assert.equal(order.total, 133000);
  assert.equal(order.items[0].note, 'Ít đá');
  assert.deepEqual(routes, [order.id]);
  assert.equal(order.id, 'GF' + String(fixed).slice(-6));
  assert.equal(cart.getState().items.length, 0);
  assert.equal(cart.getState().voucher, null);
  const saved = structuredClone(order);
  snapshot.items[0].selectedOptions[0].choiceIds.push('test-only-mutation');
  snapshot.items[0].dish.options[0].choices[0].price = 1;
  cart.getState().addToCart(restaurant, dish, 1, [{ optionId: 'size', choiceIds: ['M'] }]);
  assert.deepEqual(order, saved);
  assert.equal(controller.submit(checkoutReview(cart.getState(), auth.getState().user.address), 'cash'), null);
  assert.equal(orders.getState().orders.length, 1);
});

test('Voucher data/I real service: all current records validate and use actual discriminator', async () => {
  const { validateVoucher } = require('../../../store/cartStore.ts');
  const vouchers = await api.getVouchers();
  assert.deepEqual(vouchers.map((voucher) => voucher.code), ['GIAM15K', 'FREESHIP', 'SALE10']);
  for (const voucher of vouchers) assert.doesNotThrow(() => validateVoucher(voucher));
  assert.equal(vouchers.find((voucher) => voucher.code === 'FREESHIP').type, 'freeship');
});
