require('./register.cjs');
const assert = require('node:assert/strict');
const { test, beforeEach } = require('node:test');
const { fixtures } = require('./fixtures.ts');
const { useCartStore: store, calcPricing, calcUnitPrice, createCartItem, CartValidationError, voucherIssue } = require('../../../store/cartStore.ts');

let f;
beforeEach(() => {
  store.setState({ items: [], restaurant: null, voucher: null, checkoutLocked: false });
  f = fixtures();
});
const state = () => store.getState();
const price = () => calcPricing(state().items, state().restaurant, state().voucher);
function seed() { state().addToCart(f.RA, f.D1, 2, f.selected, f.N1); state().addToCart(f.RA, f.D2, 1, []); }

test('C01/U: empty cart has zero items, fee, discount and total', () => {
  assert.equal(state().totalCount(), 0);
  assert.deepEqual(price(), { subtotal: 0, deliveryFee: 0, discount: 0, total: 0 });
});
test('C02/U: basic item and restaurant', () => {
  state().addToCart(f.RA, f.D1, 1, []);
  assert.equal(state().restaurant.id, f.RA.id);
  assert.equal(state().items.length, 1);
  assert.equal(state().items[0].unitPrice, 30000);
  assert.equal(state().items[0].quantity, 1);
});
test('C03/U: toppings multiply with quantity exactly once', () => {
  state().addToCart(f.RA, f.D1, 2, f.selected);
  assert.equal(state().items[0].unitPrice * state().items[0].quantity, 84000);
  assert.deepEqual(state().items[0].selectedOptions, f.selected);
});
test('C04/V01/U: two dishes, one delivery fee, independent oracle', () => {
  seed();
  assert.equal(state().items.length, 2);
  assert.deepEqual(price(), { subtotal: 104000, deliveryFee: 15000, discount: 0, total: 119000 });
});
test('C05/C06/C07/U: increase, decrease and existing quantity-one deletion rule', () => {
  state().addToCart(f.RA, f.D1, 1, [{ optionId: 'topping', choiceIds: ['O1'] }]);
  const key = state().items[0].key;
  state().updateQuantity(key, 2);
  assert.deepEqual(price(), { subtotal: 70000, deliveryFee: 15000, discount: 0, total: 85000 });
  state().updateQuantity(key, 1);
  assert.equal(price().subtotal, 35000);
  state().updateQuantity(key, 0);
  assert.deepEqual(state().items, []);
  assert.equal(price().total, 0);
});
test('C08/Q03/U: delete each line and reset all cart metadata on last removal', () => {
  seed(); state().applyVoucher(f.V25);
  state().removeItem(state().items[1].key);
  assert.equal(price().subtotal, 84000);
  state().removeItem(state().items[0].key);
  assert.equal(state().restaurant, null);
  assert.equal(state().voucher, null);
  assert.deepEqual(price(), { subtotal: 0, deliveryFee: 0, discount: 0, total: 0 });
});
test('C09/U: identical configuration and note merge quantities', () => {
  state().addToCart(f.RA, f.D1, 1, f.selected, f.N1);
  state().addToCart(f.RA, f.D1, 2, f.selected, f.N1);
  assert.equal(state().items.length, 1);
  assert.equal(state().items[0].quantity, 3);
  assert.equal(price().subtotal, 126000);
});
test('C10/U: different toppings remain separate', () => {
  state().addToCart(f.RA, f.D1, 1, [{ optionId: 'topping', choiceIds: ['O1'] }]);
  state().addToCart(f.RA, f.D1, 1, [{ optionId: 'topping', choiceIds: ['O2'] }]);
  assert.deepEqual(state().items.map((item) => item.unitPrice), [35000, 37000]);
});
test('C11/U: different notes survive as separate lines', () => {
  state().addToCart(f.RA, f.D1, 1, f.selected, f.N1);
  state().addToCart(f.RA, f.D1, 1, f.selected, f.N2);
  assert.deepEqual(state().items.map((item) => item.note), [f.N1, f.N2]);
  assert.equal(price().subtotal, 84000);
});
test('C12/U: reversed choice/group order has the same key and price', () => {
  const a = [{ optionId: 'size', choiceIds: ['M'] }, ...f.selected];
  const b = [{ optionId: 'topping', choiceIds: ['O2', 'O1'] }, { optionId: 'size', choiceIds: ['M'] }];
  state().addToCart(f.RA, f.D1, 1, a);
  state().addToCart(f.RA, f.D1, 1, b);
  assert.equal(state().items.length, 1);
  assert.equal(price().subtotal, 84000);
});
test('C13/U: confirm only for nonempty different restaurant', () => {
  assert.equal(state().needsConfirmSwitch(f.RB.id), false);
  state().addToCart(f.RA, f.D1, 1, []);
  assert.equal(state().needsConfirmSwitch(f.RA.id), false);
  assert.equal(state().needsConfirmSwitch(f.RB.id), true);
});
test('C15/U: explicit replacement is atomic and clears old voucher', () => {
  seed(); state().applyVoucher(f.V25);
  state().replaceCart(f.RB, f.D3, 1, []);
  assert.equal(state().items.length, 1);
  assert.equal(state().items[0].dish.id, f.D3.id);
  assert.equal(state().voucher, null);
  assert.deepEqual(price(), { subtotal: 40000, deliveryFee: 20000, discount: 0, total: 60000 });
});
test('C15/U: invalid replacement never destroys previous cart', () => {
  seed(); state().applyVoucher(f.V25);
  const previous = state();
  assert.throws(() => state().replaceCart(f.RB, f.D3, 0, []), CartValidationError);
  assert.equal(state(), previous);
});
test('C16/U: direct cross-restaurant call cannot erase or mix cart', () => {
  seed(); const previous = state();
  assert.throws(() => state().addToCart(f.RB, f.D3, 1, []), /xác nhận/);
  assert.equal(state(), previous);
});
for (const invalid of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
  test(`C17/U: reject add quantity ${invalid} without changing cart`, () => {
    seed(); const previous = state();
    assert.throws(() => state().addToCart(f.RA, f.D1, invalid, []), CartValidationError);
    assert.equal(state(), previous);
  });
}
test('C18/U: reject dish/restaurant ID mismatch', () => {
  assert.throws(() => state().addToCart(f.RA, f.D3, 1, []), /không thuộc/);
  assert.equal(state().items.length, 0);
});
test('C19/U: deeply detached inputs and immutable quantity updates', () => {
  const original = structuredClone(f);
  state().addToCart(f.RA, f.D1, 1, f.selected);
  const oldItems = state().items;
  state().updateQuantity(oldItems[0].key, 2);
  assert.notEqual(state().items, oldItems);
  assert.equal(oldItems[0].quantity, 1);
  assert.deepEqual(f, original);
  f.selected[0].choiceIds.push('X');
  f.D1.options[0].choices[0].price = 999;
  f.RA.deliveryFee = 1;
  assert.equal(state().items[0].dish.options[0].choices[0].price, 5000);
  assert.equal(state().items[0].selectedOptions[0].choiceIds.length, 2);
  assert.equal(price().total, 99000);
});
test('C20/U: ten increments and three decrements do not lose updates', () => {
  state().addToCart(f.RA, f.D1, 1, []);
  const key = state().items[0].key;
  for (let i = 0; i < 10; i++) state().updateQuantity(key, state().items[0].quantity + 1);
  for (let i = 0; i < 3; i++) state().updateQuantity(key, state().items[0].quantity - 1);
  assert.equal(state().totalCount(), 8);
  assert.equal(price().total, 255000);
});
test('V02/U: GRAB50 fixture means 25000 amount, not 50 percent', () => {
  seed(); state().applyVoucher(f.V25);
  assert.deepEqual(price(), { subtotal: 104000, deliveryFee: 15000, discount: 25000, total: 94000 });
});
test('V03/U: exact minimum uses subtotal', () => {
  state().addToCart(f.RA, f.D1, 2, []); state().applyVoucher(f.V25);
  assert.equal(price().total, 50000);
});
test('V04/U: ship does not qualify subtotal 59999 for minimum 60000', () => {
  state().addToCart(f.RA, { ...f.D1, price: 59999 }, 1, []);
  assert.throws(() => state().applyVoucher(f.V25), /tối thiểu/);
  assert.equal(state().voucher, null);
  assert.deepEqual(calcPricing(state().items, f.RA, f.V25), { subtotal: 59999, deliveryFee: 15000, discount: 0, total: 74999 });
});
test('V10/U: changing quantity revalidates selected voucher', () => {
  state().addToCart(f.RA, f.D1, 2, []); state().applyVoucher(f.V25);
  state().updateQuantity(state().items[0].key, 1);
  assert.equal(price().total, 45000);
  assert.equal(price().discount, 0);
  assert.match(voucherIssue(state().voucher, price().subtotal), /tối thiểu/);
});
test('V11/U: removing voucher restores total without changing items', () => {
  seed(); state().applyVoucher(f.V25); const items = state().items;
  state().applyVoucher(null);
  assert.equal(price().total, 119000);
  assert.equal(state().items, items);
});
test('V12/U: one voucher replaces the earlier selection', () => {
  seed(); state().applyVoucher(f.V25); state().applyVoucher({ ...f.V25, code: 'SECOND', value: 10000 });
  assert.equal(price().discount, 10000);
  assert.equal(price().total, 109000);
});
for (const [id, fee, discount] of [['V13', 15000, 15000], ['V14', 10000, 10000], ['V15', 0, 0]]) {
  test(`${id}/U: actual freeship contract waives fee ${fee}`, () => {
    const restaurant = { ...f.RA, deliveryFee: fee };
    const items = [createCartItem(restaurant, f.D1, 2, f.selected), createCartItem(restaurant, f.D2, 1, [])];
    assert.deepEqual(calcPricing(items, restaurant, f.VS), { subtotal: 104000, deliveryFee: fee, discount, total: 104000 });
  });
}
test('V16/U: amount discount capped at subtotal, never consumes delivery fee', () => {
  state().addToCart(f.RA, f.D2, 1, []);
  state().applyVoucher({ ...f.V25, minOrder: 0 });
  assert.deepEqual(price(), { subtotal: 20000, deliveryFee: 15000, discount: 20000, total: 15000 });
});
test('V18/U: pricing is deterministic and does not mutate input', () => {
  seed(); state().applyVoucher(f.V25);
  const before = JSON.stringify(state());
  assert.deepEqual(price(), price());
  assert.equal(JSON.stringify(state()), before);
});
for (const invalid of [NaN, Infinity, -1, undefined]) {
  test(`V19/U: invalid money ${invalid} cannot enter cart or pricing`, () => {
    seed(); const previous = state();
    assert.throws(() => state().addToCart(f.RA, { ...f.D1, price: invalid }, 1, []), CartValidationError);
    assert.throws(() => calcPricing(previous.items, { ...f.RA, deliveryFee: invalid }, null), CartValidationError);
    assert.throws(() => state().applyVoucher({ ...f.V25, value: invalid }), CartValidationError);
    const dish = { ...f.D1, options: [{ ...f.D1.options[0], choices: [{ id: 'O1', name: 'X', price: invalid }] }] };
    assert.throws(() => calcUnitPrice(dish, [{ optionId: 'topping', choiceIds: ['O1'] }]), CartValidationError);
    assert.equal(state(), previous);
  });
}
test('V19/U: tampered stored unit price is rejected instead of silently billed', () => {
  seed();
  assert.throws(() => calcPricing([{ ...state().items[0], unitPrice: 1 }], f.RA, null), /Giá món/);
});
test('V20/U: rejected voucher replacement keeps valid old selection', () => {
  seed(); state().applyVoucher(f.V25); const previous = state();
  assert.throws(() => state().applyVoucher({ ...f.V25, code: 'BAD', minOrder: 999999 }), /tối thiểu/);
  assert.equal(state(), previous);
  assert.equal(price().total, 94000);
});
test('V19/U: invalid update quantity and unsafe money total are rejected', () => {
  seed(); const previous = state();
  for (const quantity of [NaN, Infinity, 1.5]) assert.throws(() => state().updateQuantity(state().items[0].key, quantity), CartValidationError);
  assert.throws(() => state().updateQuantity(state().items[0].key, Number.MAX_SAFE_INTEGER), CartValidationError);
  assert.equal(state(), previous);
});
test('Option validation: required size, single-choice, unknown and duplicate choices', () => {
  const required = { ...f.D1, options: f.D1.options.map((option) => option.id === 'size' ? { ...option, required: true } : option) };
  assert.throws(() => calcUnitPrice(required, []), /Size/);
  assert.throws(() => calcUnitPrice(f.D1, [{ optionId: 'size', choiceIds: ['M', 'L'] }]), /một mục/);
  assert.throws(() => calcUnitPrice(f.D1, [{ optionId: 'unknown', choiceIds: ['O1'] }]), CartValidationError);
  assert.throws(() => calcUnitPrice(f.D1, [{ optionId: 'topping', choiceIds: ['O1', 'O1'] }]), CartValidationError);
  assert.throws(() => calcUnitPrice(f.D1, [...f.selected, ...f.selected]), CartValidationError);
});
test('Percent regression: rounding and maxDiscount follow existing contract', () => {
  state().addToCart(f.RA, { ...f.D1, price: 100005 }, 1, []);
  state().applyVoucher({ ...f.V25, type: 'percent', value: 10, minOrder: 0, maxDiscount: 30000 });
  assert.equal(price().discount, 10001);
  state().updateQuantity(state().items[0].key, 4);
  assert.equal(price().discount, 30000);
});
