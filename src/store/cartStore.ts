import { create } from 'zustand';
import { CartItem, Dish, Restaurant, Voucher } from '../models/types';

export interface CartPricing { subtotal: number; deliveryFee: number; discount: number; total: number }

export class CartValidationError extends Error {
  constructor(message: string) { super(message); this.name = 'CartValidationError'; }
}

export function cartErrorMessage(error: unknown): string {
  return error instanceof CartValidationError ? error.message : 'Không thể xử lý giỏ hàng. Vui lòng thử lại.';
}

function requireValue(condition: boolean, message: string): asserts condition {
  if (!condition) throw new CartValidationError(message);
}

function money(value: number, label: string): number {
  requireValue(Number.isSafeInteger(value) && value >= 0, `${label} không hợp lệ.`);
  return value;
}

function validQuantity(quantity: number): void {
  requireValue(Number.isSafeInteger(quantity) && quantity > 0, 'Số lượng phải là số nguyên dương.');
}

function validateRestaurant(restaurant: Restaurant): void {
  requireValue(!!restaurant && typeof restaurant.id === 'string' && restaurant.id.length > 0, 'Thiếu thông tin quán.');
  requireValue(typeof restaurant.name === 'string' && restaurant.name.trim().length > 0, 'Thiếu tên quán.');
  money(restaurant.deliveryFee, 'Phí giao hàng');
}

export function calcUnitPrice(dish: Dish, selected: CartItem['selectedOptions']): number {
  requireValue(!!dish && typeof dish.id === 'string' && dish.id.length > 0, 'Món ăn không hợp lệ.');
  let price = money(dish.price, 'Giá món');
  requireValue(Array.isArray(dish.options) && Array.isArray(selected), 'Lựa chọn món không hợp lệ.');
  const seen = new Set<string>();
  for (const selection of selected) {
    requireValue(!!selection && !seen.has(selection.optionId), 'Nhóm lựa chọn bị lặp.');
    seen.add(selection.optionId);
    const option = dish.options.find((entry) => entry.id === selection.optionId);
    requireValue(!!option && Array.isArray(option.choices), 'Không tìm thấy nhóm lựa chọn.');
    requireValue(Array.isArray(selection.choiceIds), 'Lựa chọn món không hợp lệ.');
    requireValue(new Set(selection.choiceIds).size === selection.choiceIds.length, 'Lựa chọn bị lặp.');
    requireValue(option.multiple || selection.choiceIds.length <= 1, `${option.name} chỉ được chọn một mục.`);
    requireValue(!option.required || selection.choiceIds.length > 0, `Vui lòng chọn ${option.name}.`);
    for (const choiceId of selection.choiceIds) {
      const choice = option.choices.find((entry) => entry.id === choiceId);
      requireValue(!!choice, 'Lựa chọn không còn trong thực đơn.');
      price = money(price + money(choice.price, 'Giá lựa chọn'), 'Giá món gồm lựa chọn');
    }
  }
  for (const option of dish.options) {
    requireValue(!option.required || seen.has(option.id), `Vui lòng chọn ${option.name}.`);
  }
  return price;
}

export function cloneCartItem(item: CartItem): CartItem {
  return {
    ...item,
    dish: { ...item.dish, options: item.dish.options.map((option) => ({ ...option, choices: option.choices.map((choice) => ({ ...choice })) })) },
    selectedOptions: item.selectedOptions.map((selection) => ({ ...selection, choiceIds: [...selection.choiceIds] })),
  };
}

/** Validate before showing a switch confirmation or changing the existing cart. */
export function createCartItem(restaurant: Restaurant, dish: Dish, quantity: number, selected: CartItem['selectedOptions'], note?: string): CartItem {
  validateRestaurant(restaurant);
  requireValue(!!dish && dish.restaurantId === restaurant.id, 'Món ăn không thuộc quán đã chọn.');
  validQuantity(quantity);
  requireValue(note === undefined || typeof note === 'string', 'Ghi chú món không hợp lệ.');
  const unitPrice = calcUnitPrice(dish, selected);
  money(unitPrice * quantity, 'Thành tiền món');
  const canonical = selected.filter((selection) => selection.choiceIds.length > 0)
    .map((selection) => ({ optionId: selection.optionId, choiceIds: [...selection.choiceIds].sort() }))
    .sort((left, right) => left.optionId.localeCompare(right.optionId));
  const key = JSON.stringify([restaurant.id, dish.id, canonical, note ?? '']);
  return cloneCartItem({ key, dish, quantity, selectedOptions: canonical, unitPrice, note });
}

export function validateVoucher(voucher: Voucher): void {
  requireValue(!!voucher && typeof voucher.code === 'string' && voucher.code.trim().length > 0, 'Mã giảm giá không hợp lệ.');
  requireValue(typeof voucher.id === 'string' && voucher.id.length > 0 && typeof voucher.title === 'string', 'Thông tin mã giảm giá không hợp lệ.');
  requireValue(['amount', 'percent', 'freeship'].includes(voucher.type), 'Loại mã giảm giá không được hỗ trợ.');
  money(voucher.minOrder, 'Điều kiện đơn tối thiểu');
  if (voucher.type === 'percent') {
    requireValue(Number.isFinite(voucher.value) && voucher.value >= 0 && voucher.value <= 100, 'Phần trăm giảm giá không hợp lệ.');
  } else {
    money(voucher.value, 'Giá trị giảm giá');
  }
  if (voucher.maxDiscount !== undefined) money(voucher.maxDiscount, 'Trần giảm giá');
}

export function voucherIssue(voucher: Voucher | null, subtotal: number): string | null {
  if (!voucher) return null;
  validateVoucher(voucher);
  return subtotal < voucher.minOrder ? 'Giỏ hàng chưa đạt giá trị tối thiểu của mã. Hãy thêm món hoặc bỏ mã.' : null;
}

export function calcPricing(items: CartItem[], restaurant: Restaurant | null, voucher: Voucher | null): CartPricing {
  if (!items.length) return { subtotal: 0, deliveryFee: 0, discount: 0, total: 0 };
  requireValue(!!restaurant, 'Giỏ hàng thiếu thông tin quán.');
  validateRestaurant(restaurant);
  let subtotal = 0;
  const keys = new Set<string>();
  for (const item of items) {
    requireValue(item.dish.restaurantId === restaurant.id, 'Giỏ hàng chứa món khác quán.');
    requireValue(typeof item.key === 'string' && item.key.length > 0 && !keys.has(item.key), 'Dòng giỏ hàng không hợp lệ hoặc bị lặp.');
    keys.add(item.key);
    validQuantity(item.quantity);
    const unitPrice = calcUnitPrice(item.dish, item.selectedOptions);
    requireValue(item.unitPrice === unitPrice, 'Giá món đã thay đổi. Vui lòng chọn lại món.');
    subtotal = money(subtotal + money(unitPrice * item.quantity, 'Thành tiền món'), 'Tạm tính');
  }
  const deliveryFee = restaurant.deliveryFee;
  money(subtotal + deliveryFee, 'Tổng tiền trước giảm');
  let discount = 0;
  if (voucher && !voucherIssue(voucher, subtotal)) {
    if (voucher.type === 'amount') discount = Math.min(voucher.value, subtotal);
    else if (voucher.type === 'percent') discount = Math.min(Math.round((subtotal * voucher.value) / 100), voucher.maxDiscount ?? Infinity);
    else discount = deliveryFee;
    if (voucher.type !== 'freeship') discount = Math.min(discount, subtotal);
  }
  return { subtotal, deliveryFee, discount, total: subtotal + deliveryFee - discount };
}

interface CartState {
  restaurant: Restaurant | null;
  items: CartItem[];
  voucher: Voucher | null;
  checkoutLocked: boolean;
  /** true nếu có món khác quán; UI xác nhận trước khi replaceCart(), không xóa giỏ trước validation. */
  needsConfirmSwitch: (restaurantId: string) => boolean;
  addToCart: (restaurant: Restaurant, dish: Dish, quantity: number, selected: CartItem['selectedOptions'], note?: string) => void;
  /** Only call after explicit confirmation. Validates first, then replaces atomically. */
  replaceCart: (restaurant: Restaurant, dish: Dish, quantity: number, selected: CartItem['selectedOptions'], note?: string) => void;
  updateQuantity: (key: string, quantity: number) => void; // quantity <= 0 => xóa
  removeItem: (key: string) => void;
  applyVoucher: (v: Voucher | null) => void;
  clear: () => void;
  clearCart: () => void;
  totalCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  restaurant: null,
  items: [],
  voucher: null,
  checkoutLocked: false,
  needsConfirmSwitch: (rid) => get().items.length > 0 && get().restaurant?.id !== rid,
  addToCart: (restaurant, dish, quantity, selected, note) => {
    const item = createCartItem(restaurant, dish, quantity, selected, note);
    set((state) => {
      requireValue(!state.checkoutLocked, 'Đang tạo đơn. Vui lòng chờ.');
      requireValue(!state.items.length || state.restaurant?.id === restaurant.id, 'Vui lòng xác nhận đổi quán trước khi thêm món.');
      const existing = state.items.find((entry) => entry.key === item.key);
      const items = existing
        ? state.items.map((entry) => entry.key === item.key ? { ...entry, quantity: entry.quantity + quantity } : entry)
        : [...state.items, item];
      const nextRestaurant = state.restaurant ?? { ...restaurant };
      calcPricing(items, nextRestaurant, state.voucher);
      return { restaurant: nextRestaurant, items };
    });
  },
  replaceCart: (restaurant, dish, quantity, selected, note) => {
    const item = createCartItem(restaurant, dish, quantity, selected, note);
    calcPricing([item], restaurant, null);
    requireValue(!get().checkoutLocked, 'Đang tạo đơn. Vui lòng chờ.');
    set({ restaurant: { ...restaurant }, items: [item], voucher: null });
  },
  updateQuantity: (key, quantity) => set((state) => {
    requireValue(!state.checkoutLocked, 'Đang tạo đơn. Vui lòng chờ.');
    requireValue(Number.isSafeInteger(quantity), 'Số lượng phải là số nguyên hữu hạn.');
    const items = quantity <= 0 ? state.items.filter((item) => item.key !== key)
      : state.items.map((item) => item.key === key ? { ...item, quantity } : item);
    calcPricing(items, state.restaurant, state.voucher);
    return items.length ? { items } : { items, restaurant: null, voucher: null };
  }),
  removeItem: (key) => get().updateQuantity(key, 0),
  applyVoucher: (voucher) => {
    const state = get();
    requireValue(!state.checkoutLocked, 'Đang tạo đơn. Vui lòng chờ.');
    if (voucher) {
      requireValue(state.items.length > 0, 'Hãy thêm món trước khi áp mã.');
      const pricing = calcPricing(state.items, state.restaurant, voucher);
      const issue = voucherIssue(voucher, pricing.subtotal);
      requireValue(!issue, issue ?? 'Mã không hợp lệ.');
    }
    set({ voucher: voucher ? { ...voucher } : null });
  },
  clearCart: () => {
    set({ items: [], restaurant: null, voucher: null, checkoutLocked: false });
  },
  clear: () => {
    requireValue(!get().checkoutLocked, 'Đang tạo đơn. Vui lòng chờ.');
    set({ items: [], restaurant: null, voucher: null });
  },
  totalCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
}));
