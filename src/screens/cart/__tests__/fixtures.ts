import type { Dish, Restaurant, Voucher, CartItem } from '../../../models/types';

export function fixtures() {
  const RA: Restaurant = { id: 'test-RA', name: 'Quán test A', categoryId: 'test', rating: 4,
    reviewCount: 1, distanceKm: 1, etaMin: 20, deliveryFee: 15000, address: 'Địa chỉ test A', image: 'https://example.test/a.png', promo: null };
  const RB: Restaurant = { ...RA, id: 'test-RB', name: 'Quán test B', deliveryFee: 20000 };
  const D1: Dish = { id: 'test-D1', restaurantId: RA.id, name: 'Món test 1', description: 'Fixture riêng TV3',
    price: 30000, group: 'test', image: 'https://example.test/d1.png', options: [
      { id: 'topping', name: 'Topping', required: false, multiple: true,
        choices: [{ id: 'O1', name: 'Topping 1', price: 5000 }, { id: 'O2', name: 'Topping 2', price: 7000 }] },
      { id: 'size', name: 'Size', required: false, multiple: false,
        choices: [{ id: 'M', name: 'M', price: 0 }, { id: 'L', name: 'L', price: 7000 }] },
    ] };
  const D2: Dish = { ...D1, id: 'test-D2', name: 'Món test 2', price: 20000, options: [] };
  const D3: Dish = { ...D2, id: 'test-D3', restaurantId: RB.id, name: 'Món test 3', price: 40000 };
  const V25: Voucher = { id: 'test-V25', code: 'GRAB50', title: 'Fixture giảm 25k', type: 'amount', value: 25000, minOrder: 60000 };
  // Actual freeship contract waives the full fee; value is not an amount cap.
  const VS: Voucher = { id: 'test-VS', code: 'TESTSHIP', title: 'Fixture miễn phí giao hàng', type: 'freeship', value: 0, minOrder: 0 };
  const selected: CartItem['selectedOptions'] = [{ optionId: 'topping', choiceIds: ['O1', 'O2'] }];
  return { RA, RB, D1, D2, D3, V25, VS, selected, N1: 'Ít đá', N2: 'Không đường' };
}
