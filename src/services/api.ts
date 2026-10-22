import categories from '../data/categories.json';
import restaurants from '../data/restaurants.json';
import dishes from '../data/dishes.json';
import vouchers from '../data/vouchers.json';
import { Category, Dish, Restaurant, Voucher } from '../models/types';

// Giả lập độ trễ mạng để có chỗ hiển thị skeleton/loading.
// Sau này đổi sang Firestore/MockAPI chỉ cần sửa file này.
const delay = <T,>(v: T, ms = 400) => new Promise<T>((r) => setTimeout(() => r(v), ms));

export const api = {
  getCategories: () => delay(categories as Category[], 100),
  getRestaurants: (opts: { categoryId?: string; query?: string } = {}) => {
    const q = opts.query?.trim().toLowerCase();
    let list = restaurants as Restaurant[];
    if (opts.categoryId) list = list.filter((r) => r.categoryId === opts.categoryId);
    if (q) {
      const dishHit = new Set((dishes as Dish[]).filter((d) => d.name.toLowerCase().includes(q)).map((d) => d.restaurantId));
      list = list.filter((r) => r.name.toLowerCase().includes(q) || dishHit.has(r.id));
    }
    return delay(list);
  },
  getRestaurant: (id: string) => delay((restaurants as Restaurant[]).find((r) => r.id === id)),
  getDishes: (restaurantId: string) => delay((dishes as Dish[]).filter((d) => d.restaurantId === restaurantId)),
  getVouchers: () => delay(vouchers as Voucher[], 100),
};
