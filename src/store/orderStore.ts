import { create } from 'zustand';
import { CartItem, Order, OrderStatus, PaymentMethod, Restaurant } from '../models/types';
import { CartPricing } from './cartStore';

export const STATUS_FLOW: OrderStatus[] = ['placed', 'preparing', 'delivering', 'completed'];
export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'Đã đặt', preparing: 'Quán đang chuẩn bị', delivering: 'Tài xế đang giao', completed: 'Hoàn thành',
};
/** Giây giữa các lần tự chuyển trạng thái (demo). Đặt 0 để tắt, dùng nút ẩn advance(). */
export const AUTO_ADVANCE_SECONDS = 5;

interface OrderState {
  orders: Order[];
  placeOrder: (p: { restaurant: Restaurant; items: CartItem[]; pricing: CartPricing; voucherCode?: string; paymentMethod: PaymentMethod; address: string; userId?: string }) => Order;
  advance: (id: string) => void;
  clearOrders: () => void;
}

let orderCounter = 0;
function generateOrderId(): string {
  orderCounter = (orderCounter + 1) % 10000;
  const now = Date.now();
  const rand = Math.floor(Math.random() * 900 + 100);
  return `GF${now.toString().slice(-6)}${String(orderCounter).padStart(2, '0')}${rand}`;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  placeOrder: ({ restaurant, items, pricing, voucherCode, paymentMethod, address, userId }) => {
    const order: Order = {
      id: generateOrderId(),
      restaurant,
      items,
      ...pricing,
      voucherCode,
      paymentMethod,
      address,
      status: 'placed',
      createdAt: Date.now(),
      ...(userId ? { userId } : {}),
    } as Order;
    set((s) => ({ orders: [order, ...s.orders] }));
    return order;
  },
  advance: (id) =>
    set((s) => ({
      orders: s.orders.map((o) => {
        const i = STATUS_FLOW.indexOf(o.status);
        return o.id === id && i < STATUS_FLOW.length - 1 ? { ...o, status: STATUS_FLOW[i + 1] } : o;
      }),
    })),
  clearOrders: () => set({ orders: [] }),
}));
