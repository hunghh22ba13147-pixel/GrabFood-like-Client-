import { create } from 'zustand';
import { CartItem, Dish, Restaurant, Voucher } from '../models/types';

export interface CartPricing { subtotal: number; deliveryFee: number; discount: number; total: number }

export function calcUnitPrice(dish: Dish, selected: CartItem['selectedOptions']) {
  let p = dish.price;
  for (const s of selected) {
    const opt = dish.options.find((o) => o.id === s.optionId);
    opt?.choices.filter((c) => s.choiceIds.includes(c.id)).forEach((c) => (p += c.price));
  }
  return p;
}

export function calcPricing(items: CartItem[], restaurant: Restaurant | null, voucher: Voucher | null): CartPricing {
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const deliveryFee = items.length && restaurant ? restaurant.deliveryFee : 0;
  let discount = 0;
  if (voucher && subtotal >= voucher.minOrder) {
    if (voucher.type === 'amount') discount = voucher.value;
    else if (voucher.type === 'percent') discount = Math.min(Math.round((subtotal * voucher.value) / 100), voucher.maxDiscount ?? Infinity);
    else discount = deliveryFee;
  }
  discount = Math.min(discount, subtotal + deliveryFee);
  return { subtotal, deliveryFee, discount, total: subtotal + deliveryFee - discount };
}

interface CartState {
  restaurant: Restaurant | null;
  items: CartItem[];
  voucher: Voucher | null;
  /** true nếu giỏ đang có món của quán khác -> UI phải hỏi xác nhận rồi gọi clear() */
  needsConfirmSwitch: (restaurantId: string) => boolean;
  addToCart: (restaurant: Restaurant, dish: Dish, quantity: number, selected: CartItem['selectedOptions'], note?: string) => void;
  updateQuantity: (key: string, quantity: number) => void; // quantity <= 0 => xóa
  removeItem: (key: string) => void;
  applyVoucher: (v: Voucher | null) => void;
  clear: () => void;
  totalCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  restaurant: null,
  items: [],
  voucher: null,
  needsConfirmSwitch: (rid) => !!get().restaurant && get().items.length > 0 && get().restaurant!.id !== rid,
  addToCart: (restaurant, dish, quantity, selected, note) => {
    const key = dish.id + '|' + JSON.stringify(selected.map((s) => [s.optionId, [...s.choiceIds].sort()]));
    const items = get().items;
    const exist = items.find((i) => i.key === key);
    set({
      restaurant,
      items: exist
        ? items.map((i) => (i.key === key ? { ...i, quantity: i.quantity + quantity } : i))
        : [...items, { key, dish, quantity, selectedOptions: selected, unitPrice: calcUnitPrice(dish, selected), note }],
    });
  },
  updateQuantity: (key, q) =>
    set((s) => {
      const items = q <= 0 ? s.items.filter((i) => i.key !== key) : s.items.map((i) => (i.key === key ? { ...i, quantity: q } : i));
      return items.length ? { items } : { items, restaurant: null, voucher: null };
    }),
  removeItem: (key) => get().updateQuantity(key, 0),
  applyVoucher: (voucher) => set({ voucher }),
  clear: () => set({ items: [], restaurant: null, voucher: null }),
  totalCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
}));
