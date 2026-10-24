require('./register.cjs');
const assert = require('node:assert/strict');
const { test, beforeEach } = require('node:test');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const native = require('react-native-web');
const Module = require('node:module');
const cart = require('../../../store/cartStore.ts');
const auth = require('../../../store/authStore.ts');
const { fixtures } = require('./fixtures.ts');

// SSR component tests: real React + RN Web, mocked navigation/safe-area/store hooks.
// Hooks read the real test store's current snapshot (Zustand SSR normally reads initial state).
const load = Module._load;
const navigation = { navigate() {}, replace() {} };
const snapshotHook = (store) => (selector) => selector ? selector(store.getState()) : store.getState();
Module._load = function(request, parent, isMain) {
  if (request === 'react-native') return native;
  if (request === '@react-navigation/native') return { useNavigation: () => navigation };
  if (request === 'react-native-safe-area-context') return {
    SafeAreaView: ({ edges, ...props }) => React.createElement(native.View, props),
  };
  if (request === '../../store/cartStore') return { ...cart, useCartStore: snapshotHook(cart.useCartStore) };
  if (request === '../../store/authStore') return { ...auth, useAuthStore: snapshotHook(auth.useAuthStore) };
  return load.call(this, request, parent, isMain);
};
const CartScreen = require('../CartScreen.tsx').default;
const CheckoutScreen = require('../CheckoutScreen.tsx').default;
const { ActionButton, PricingBreakdown, displayMoney } = require('../CartComponents.tsx');
const { findVoucher } = require('../VoucherPicker.tsx');
Module._load = load;
let f;
beforeEach(() => {
  cart.useCartStore.setState({ items: [], restaurant: null, voucher: null, checkoutLocked: false });
  auth.useAuthStore.setState({ user: null });
  f = fixtures();
});
function seed() {
  cart.useCartStore.getState().addToCart(f.RA, f.D1, 2, f.selected, f.N1);
  cart.useCartStore.getState().addToCart(f.RA, f.D2, 1, []);
}
const render = (component, props = {}) => renderToStaticMarkup(React.createElement(component, props));
const text = (markup) => markup.replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/&amp;/g, '&');

test('C01/O01/Q03/C SSR: both empty screens show zero, browse action and no checkout action', () => {
  for (const component of [CartScreen, CheckoutScreen]) {
    const html = render(component);
    assert.match(text(html), /Giỏ hàng đang trống/);
    assert.match(text(html), /0đ/);
    assert.match(html, /Khám phá món ăn/);
    assert.doesNotMatch(html, /Tiếp tục thanh toán|Đặt đơn ·/);
  }
});
test('C03/C04/C11/C SSR: cart renders selections, note, amounts and quantity controls', () => {
  seed();
  const html = render(CartScreen), body = text(html);
  assert.match(body, /Topping 1, Topping 2/);
  assert.match(body, /Ít đá/);
  assert.match(body, /104\.000đ/);
  assert.match(body, /119\.000đ/);
  assert.match(html, /Tăng số lượng/);
  assert.match(html, /Giảm số lượng/);
  assert.match(html, /Xóa Món test 1/);
});
test('V01/V02/C SSR: Cart and Checkout render same actual pricing result', () => {
  seed(); cart.useCartStore.getState().applyVoucher(f.V25);
  for (const component of [CartScreen, CheckoutScreen]) {
    const body = text(render(component));
    assert.match(body, /104\.000đ/);
    assert.match(body, /15\.000đ/);
    assert.match(body, /25\.000đ/);
    assert.match(body, /94\.000đ/);
  }
});
test('V10/C SSR: selected voucher below threshold explains invalidation', () => {
  seed(); cart.useCartStore.getState().applyVoucher(f.V25);
  cart.useCartStore.getState().removeItem(cart.useCartStore.getState().items[1].key);
  cart.useCartStore.getState().updateQuantity(cart.useCartStore.getState().items[0].key, 1);
  const html = render(CartScreen);
  assert.match(text(html), /chưa đạt giá trị tối thiểu/);
  assert.match(text(html), /57\.000đ/);
});
test('V05/V06/V07/U lookup: unknown, whitespace and normalized code', () => {
  seed(); const before = cart.useCartStore.getState();
  assert.equal(findVoucher([f.V25], 'UNKNOWN'), undefined);
  assert.equal(findVoucher([f.V25], '  '), undefined);
  assert.equal(findVoucher([f.V25], '  grab50  '), f.V25);
  assert.equal(cart.useCartStore.getState(), before);
});
test('O02/O03/O04/C SSR: real payment enums rendered, wallet labelled simulation, no payment defaults', () => {
  seed(); auth.useAuthStore.getState().register('TV3 test', 'tv3@example.test', 'test-password');
  const html = render(CheckoutScreen), body = text(html);
  assert.match(body, /Tiền mặt/);
  assert.match(body, /Ví điện tử \(giả lập\)/);
  assert.match(body, /không thu tiền thật/);
  assert.equal((html.match(/aria-checked="false"/g) || []).length, 2);
  assert.match(html, /aria-disabled="true"/);
});
test('Address/C SSR: missing auth address is explicit, no fallback silently permits checkout', () => {
  seed();
  const html = render(CheckoutScreen);
  assert.match(text(html), /Chưa có địa chỉ giao hàng/);
  assert.match(text(html), /Cập nhật địa chỉ/);
  assert.match(html, /aria-disabled="true"/);
});
test('Q04/C SSR: voucher initial loading is visible and apply action disabled', () => {
  seed();
  const html = render(CartScreen);
  assert.match(text(html), /Đang tải mã giảm giá/);
  assert.match(html, /aria-disabled="true"/);
});
test('V19/C SSR: invalid stored price shows controlled error, never NaN currency', () => {
  seed(); cart.useCartStore.setState({ items: cart.useCartStore.getState().items.map((item) => ({ ...item, unitPrice: NaN })) });
  const html = render(CartScreen);
  assert.match(text(html), /Giá món đã thay đổi/);
  assert.match(text(html), /Giá không hợp lệ/);
  assert.doesNotMatch(text(html), /NaN|Infinity/);
});
test('Q04/C SSR: loading/disabled buttons expose accessible state', () => {
  const html = render(ActionButton, { label: 'Đang tạo đơn', loading: true, onPress: () => assert.fail('Must not run in SSR') });
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /aria-busy="true"/);
});
test('V01/C SSR: pricing breakdown independently shows all four amounts', () => {
  const body = text(render(PricingBreakdown, { pricing: { subtotal: 104000, deliveryFee: 15000, discount: 25000, total: 94000 } }));
  assert.match(body, /104\.000đ/); assert.match(body, /15\.000đ/); assert.match(body, /25\.000đ/); assert.match(body, /94\.000đ/);
  assert.equal(displayMoney(NaN), 'Giá không hợp lệ');
});
