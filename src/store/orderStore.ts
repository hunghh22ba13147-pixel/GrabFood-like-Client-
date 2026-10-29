import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, ChatMessage, Order, OrderRating, OrderStatus, PaymentMethod, Restaurant } from '../models/types';
import { CartPricing, cloneCartItem } from './cartStore';

export const STATUS_FLOW: OrderStatus[] = ['placed', 'preparing', 'delivering', 'completed'];
export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'Đã đặt', preparing: 'Quán đang chuẩn bị', delivering: 'Tài xế đang giao', completed: 'Hoàn thành',
};
/** Giây giữa các lần tự chuyển trạng thái (demo). Đặt 0 để tắt, dùng nút ẩn advance(). */
export const AUTO_ADVANCE_SECONDS = 5;

export const ORDER_STORAGE_KEY = 'grabfood_orders_v2';

async function persistOrders(orders: Order[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // Ignore storage errors in memory/testing environments
  }
}

/** Unknown legacy owners remain stored, but are not exposed to any account. */
export const ordersForUser = (orders: Order[], userId: string | null | undefined): Order[] =>
  userId ? orders.filter((order) => order.userId === userId) : [];

interface OrderState {
  orders: Order[];
  hydrated: boolean;
  hydrateOrders: () => Promise<void>;
  placeOrder: (p: { restaurant: Restaurant; items: CartItem[]; pricing: CartPricing; voucherCode?: string; paymentMethod: PaymentMethod; address: string; userId: string }) => Order;
  advance: (id: string, userId: string) => void;
  rateOrder: (id: string, userId: string, rating: OrderRating) => void;
  addChatMessage: (id: string, userId: string, message: { text: string; sender: 'user' | 'driver' }) => ChatMessage;
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
  hydrated: false,
  hydrateOrders: async () => {
    try {
      const raw = await AsyncStorage.getItem(ORDER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          set((s) => ({
            orders: s.orders.length === 0 ? parsed : s.orders,
            hydrated: true,
          }));
          return;
        }
      }
    } catch {
      // Ignore read errors
    }
    set({ hydrated: true });
  },
  placeOrder: ({ restaurant, items, pricing, voucherCode, paymentMethod, address, userId }) => {
    if (!userId?.trim()) throw new Error('Thiếu tài khoản tạo đơn.');
    const order: Order = {
      id: generateOrderId(),
      restaurant: { ...restaurant },
      items: items.map(cloneCartItem),
      subtotal: pricing.subtotal,
      deliveryFee: pricing.deliveryFee,
      discount: pricing.discount,
      total: pricing.total,
      voucherCode,
      paymentMethod,
      address,
      status: 'placed',
      createdAt: Date.now(),
      userId,
      chatMessages: [
        {
          id: `msg-welcome-${Date.now()}`,
          sender: 'driver',
          text: `Chào bạn, mình là tài xế đã nhận đơn giao từ quán ${restaurant.name}. Bạn có dặn dò gì thêm không ạ?`,
          timestamp: Date.now(),
        },
      ],
    };
    set((s) => {
      const next = [order, ...s.orders];
      persistOrders(next);
      return { orders: next };
    });
    return order;
  },
  advance: (id, userId) =>
    set((s) => {
      const next = s.orders.map((o) => {
        const i = STATUS_FLOW.indexOf(o.status);
        return userId && o.userId === userId && o.id === id && i < STATUS_FLOW.length - 1
          ? { ...o, status: STATUS_FLOW[i + 1] }
          : o;
      });
      persistOrders(next);
      return { orders: next };
    }),
  rateOrder: (id, userId, rating) =>
    set((s) => {
      const next = s.orders.map((o) =>
        userId && o.userId === userId && o.id === id ? { ...o, rating } : o
      );
      persistOrders(next);
      return { orders: next };
    }),
  addChatMessage: (id, userId, message) => {
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sender: message.sender,
      text: message.text,
      timestamp: Date.now(),
    };
    set((s) => {
      const next = s.orders.map((o) => {
        if (userId && o.userId === userId && o.id === id) {
          const prev = o.chatMessages ?? [];
          return { ...o, chatMessages: [...prev, msg] };
        }
        return o;
      });
      persistOrders(next);
      return { orders: next };
    });
    return msg;
  },
  clearOrders: () => {
    persistOrders([]);
    set({ orders: [] });
  },
}));
