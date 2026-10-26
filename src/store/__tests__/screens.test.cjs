const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { authFixture, AUTH_KEY, flush } = require('./authFixture.cjs');
const { render, text, walk } = require('./uiHarness.cjs');
const { useCartStore: cart, createCartItem, calcPricing } = require('../cartStore.ts');
const { useOrderStore: orders } = require('../orderStore.ts');
const { fixtures } = require('../../screens/cart/__tests__/fixtures.ts');
const button = (tree, label) => {
  const found = walk(tree, n => typeof n.props?.onPress === 'function' && text(n) === label);
  assert.ok(found.length, 'Missing control ' + label); return found[0];
};
beforeEach(() => { cart.setState({ items: [], restaurant: null, voucher: null, checkoutLocked: false }); orders.setState({ orders: [] }); });

for (const confirm of [false, true]) {
  test('R04: web logout confirmation=' + confirm + ' executes the actual callback', async () => {
    const f = authFixture(); await f.auth.getState().login('a@example.test', '123456');
    const frame = render('../../screens/auth/ProfileScreen.tsx', f, { confirm });
    try {
      button(frame.tree, 'Đăng xuất').props.onPress(); await flush();
      assert.equal(frame.dialogs.length, 1); assert.equal(frame.nativeAlerts.length, 0);
      assert.equal(f.auth.getState().user === null, confirm); assert.equal(frame.events.length, confirm ? 1 : 0);
    } finally { frame.restore(); }
  });
}

test('N03/R04: failed delete-address write is caught, preserves address and reports failure', async () => {
  const f = authFixture(); await f.auth.getState().login('a@example.test', '123456');
  const before = structuredClone(f.auth.getState().user); f.failWrites.add(AUTH_KEY);
  const frame = render('../../screens/auth/ProfileScreen.tsx', f, { confirm: true });
  try {
    button(frame.tree, 'Xóa').props.onPress(); await flush();
    assert.deepEqual(f.auth.getState().user, before); assert.ok(frame.notices.some(message => message.includes('Chưa xóa')));
  } finally { frame.restore(); }
});

test('N03: failed profile save reports failure, never a success notice', async () => {
  const f = authFixture(); await f.auth.getState().login('a@example.test', '123456'); f.failWrites.add(AUTH_KEY);
  const originalPhone = f.auth.getState().user.phone;
  const frame = render('../../screens/auth/ProfileScreen.tsx', f, { values: ['New Name', 'NEW PHONE'] });
  try {
    await button(frame.tree, 'Lưu thông tin').props.onPress();
    assert.ok(frame.notices.some(message => message.includes('Chưa lưu')));
    assert.equal(frame.notices.some(message => message.includes('thành công')), false);
    assert.equal(f.auth.getState().user.phone, originalPhone);
  } finally { frame.restore(); }
});

test('R01/R07: Tracking cannot render another or legacy unowned Order; own wallet shows simulation notice', async () => {
  const f = authFixture(); await f.auth.getState().login('a@example.test', '123456'); const data = fixtures();
  const item = createCartItem(data.RA, data.D1, 1, data.selected);
  const own = orders.getState().placeOrder({ userId: f.auth.getState().user.id, restaurant: data.RA, items: [item], pricing: calcPricing([item], data.RA, null), paymentMethod: 'wallet', address: 'PRIVATE ADDRESS' });
  for (const userId of ['other-user', undefined, own.userId]) {
    orders.setState({ orders: [{ ...own, userId }] });
    const frame = render('../../screens/orders/OrderTrackingScreen.tsx', f, { props: { route: { params: { orderId: own.id } } } });
    try {
      const body = text(frame.tree);
      if (userId === own.userId) { assert.match(body, /PRIVATE ADDRESS/); assert.match(body, /Mô phỏng, không thu tiền thật/); }
      else { assert.doesNotMatch(body, /PRIVATE ADDRESS/); assert.match(body, /Chưa có đơn hàng/); }
    } finally { frame.restore(); }
  }
});

test('R01: actual Checkout -> logout -> B History hides A; A returns and sees the same Order', async () => {
  const f = authFixture(); await f.auth.getState().login('a@example.test', '123456'); const data = fixtures();
  cart.getState().addToCart(data.RA, data.D1, 1, data.selected);
  const { checkoutReview, createCheckoutController } = require('../../screens/cart/checkout.ts');
  const user = f.auth.getState().user;
  const controller = createCheckoutController({ placeOrder: orders.getState().placeOrder,
    getUserId: () => f.auth.getState().user?.id ?? null, getAddress: () => f.auth.getState().user?.address ?? '', openTracking() {} });
  const order = controller.submit(checkoutReview(cart.getState(), user.address, user.id), 'cash'); assert.ok(order);
  await f.auth.getState().logout(); await f.auth.getState().login('b@example.test', '123456');
  for (const expected of [0, 1]) {
    if (expected) { await f.auth.getState().logout(); await f.auth.getState().login('a@example.test', '123456'); }
    const frame = render('../../screens/orders/OrderHistoryScreen.tsx', f);
    try { const list = walk(frame.tree, n => n.type === 'FlatList')[0]; assert.equal(list.props.data.length, expected); }
    finally { frame.restore(); }
  }
  assert.equal(orders.getState().orders.length, 1);
});
