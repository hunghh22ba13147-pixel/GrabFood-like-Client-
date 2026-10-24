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
    // Lấy đại diện các món best seller đặc sắc nhất từ các quán
    const featuredNames = [
      'Trà sữa Phúc Long',
      'Sữa tươi trân châu đường đen',
      'Cơm tấm sườn nướng Cali',
      'Cơm gà luộc Hải Nam',
      'Phở bò tái lăn truyền thống',
      'Bún chả đặc biệt (Chả miếng + Chả băm)',
      'Combo Gà Rán Giòn Cay (2 Miếng)',
      'Pizza 4 Loại Phô Mai (4 Cheese)',
    ];
    const seen = new Set<string>();
    const list: Dish[] = [];
    for (const d of dishes as Dish[]) {
      if (featuredNames.includes(d.name) && !seen.has(d.name)) {
        seen.add(d.name);
        list.push(d);
      }
    }
    return delay(list, 150);
  },
  getVouchers: () => delay(vouchers as Voucher[], 100),
};
