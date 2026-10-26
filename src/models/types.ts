// Data schema chốt cứng cho cả nhóm - KHÔNG đổi tên field khi chưa họp.
export interface Category { id: string; name: string; icon: string }

export interface Restaurant {
  id: string; name: string; categoryId: string;
  rating: number; reviewCount: number; distanceKm: number; etaMin: number;
  deliveryFee: number; address: string; image: string; promo: string | null;
}

export interface OptionChoice { id: string; name: string; price: number }
export interface DishOption {
  id: string; name: string; required: boolean; multiple: boolean; choices: OptionChoice[];
}
export interface Dish {
  id: string; restaurantId: string; name: string; description: string;
  price: number; group: string; image: string; options: DishOption[];
}

export interface Voucher {
  id: string; code: string; title: string;
  type: 'amount' | 'percent' | 'freeship'; value: number;
  maxDiscount?: number; minOrder: number;
}

export interface CartItem {
  key: string;            // dishId + options đã chọn -> gộp các dòng giống nhau
  dish: Dish;
  quantity: number;
  selectedOptions: { optionId: string; choiceIds: string[] }[];
  unitPrice: number;      // giá 1 phần đã gồm size/topping
  note?: string;
}

export type OrderStatus = 'placed' | 'preparing' | 'delivering' | 'completed';
export type PaymentMethod = 'cash' | 'wallet';

export interface Order {
  /** Stable User.id. Optional only to preserve legacy orders; missing owners are never assigned implicitly. */
  userId?: string;
  id: string; restaurant: Restaurant; items: CartItem[];
  subtotal: number; deliveryFee: number; discount: number; total: number;
  voucherCode?: string; paymentMethod: PaymentMethod; address: string;
  status: OrderStatus; createdAt: number;
}

export interface SavedAddress { id: string; label: string; address: string; latitude?: number; longitude?: number; placeId?: string }
export interface User { id: string; name: string; email: string; phone: string; address: string; addresses?: SavedAddress[] }

