// Separate integration diagnostic for the TV4 contract. A nonzero exit reports the real issue.
require('./register.cjs');
const { fixtures } = require('./fixtures.ts');
const { createCartItem, calcPricing } = require('../../../store/cartStore.ts');
const { useOrderStore } = require('../../../store/orderStore.ts');
const f = fixtures();
const items = [createCartItem(f.RA, f.D1, 1, [])];
const payload = { restaurant: f.RA, items, pricing: calcPricing(items, f.RA, null), paymentMethod: 'cash', address: 'Địa chỉ fixture diagnostic' };
const previousNow = Date.now;
try {
  Date.now = () => Date.parse('2026-10-25T10:00:00+07:00');
  const first = useOrderStore.getState().placeOrder(payload);
  const second = useOrderStore.getState().placeOrder(payload);
  const collision = first.id === second.id;
  console.log(JSON.stringify({ case: 'O14/I uniqueness', status: collision ? 'FAIL' : 'PASS',
    firstId: first.id, secondId: second.id, orders: useOrderStore.getState().orders.length,
    owner: 'TV4 src/store/orderStore.ts', clock: 'fixed test clock; separate legitimate API calls' }));
  process.exitCode = collision ? 1 : 0;
} finally {
  Date.now = previousNow;
  useOrderStore.setState({ orders: [] });
}
