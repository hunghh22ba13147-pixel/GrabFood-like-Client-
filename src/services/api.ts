import categories from '../data/categories.json';
import restaurants from '../data/restaurants.json';
import dishes from '../data/dishes.json';
import vouchers from '../data/vouchers.json';
import { Category, Dish, Restaurant, Voucher } from '../models/types';

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
  getFeaturedDishes: () => {
    // Lấy danh sách các món best-seller đại diện để hiển thị mục Món bán chạy ở Home
    const bestSellerNames = ['Trà sữa trân châu', 'Trà đào cam sả', 'Cơm sườn bì chả', 'Phở bò tái', 'Bún chả', 'Gà rán 2 miếng', 'Burger bò phô mai'];
    const seen = new Set<string>();
    const list: Dish[] = [];
    for (const d of dishes as Dish[]) {
      if (bestSellerNames.includes(d.name) && !seen.has(d.name)) {
        seen.add(d.name);
        list.push(d);
      }
    }
    return delay(list, 150);
  },
  getVouchers: () => delay(vouchers as Voucher[], 100),
};
