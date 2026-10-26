import type { Order, Restaurant } from '../../models/types';
import { api } from '../../services/api';
import { calcPricing, CartValidationError, createCartItem, useCartStore } from '../../store/cartStore';

/** Rebuild from the current menu; the historical Order is never changed. */
export async function reorderOrder(order: Order, dependencies: {
  getUserId: () => string | null;
  confirmReplace: (restaurant: Restaurant) => Promise<boolean>;
  getRestaurant?: typeof api.getRestaurant;
  getDishes?: typeof api.getDishes;
}): Promise<boolean> {
  const userId = dependencies.getUserId();
  if (!userId || order.userId !== userId) throw new CartValidationError('Không thể đặt lại đơn của tài khoản khác.');
  if (order.status !== 'completed' || !order.restaurant?.id || !Array.isArray(order.items) || !order.items.length) {
    throw new CartValidationError('Đơn hàng không hợp lệ để đặt lại.');
  }
  const previous = useCartStore.getState();
  function checkCurrent() {
    const current = useCartStore.getState();
    if (dependencies.getUserId() !== userId) throw new CartValidationError('Tài khoản đã thay đổi. Vui lòng mở lại đơn.');
    if (current.checkoutLocked) throw new CartValidationError('Đang tạo đơn. Vui lòng chờ.');
    if (current.items !== previous.items || current.restaurant !== previous.restaurant || current.voucher !== previous.voucher) {
      throw new CartValidationError('Giỏ hàng đã thay đổi. Vui lòng kiểm tra lại trước khi đặt lại.');
    }
  }
  checkCurrent();
  const [restaurant, dishes] = await Promise.all([
    (dependencies.getRestaurant ?? api.getRestaurant)(order.restaurant.id),
    (dependencies.getDishes ?? api.getDishes)(order.restaurant.id),
  ]);
  if (!restaurant || restaurant.id !== order.restaurant.id) throw new CartValidationError('Quán không còn trong danh sách.');
  const items = order.items.map((item) => {
    const dish = dishes.find((entry) => entry.id === item.dish?.id && entry.restaurantId === restaurant.id);
    if (!dish) throw new CartValidationError('Một món trong đơn không còn trong thực đơn. Vui lòng chọn lại món.');
    return createCartItem(restaurant, dish, item.quantity, item.selectedOptions, item.note);
  });
  calcPricing(items, restaurant, null);
  checkCurrent();
  // The agreed policy is replacement with confirmation, for both same and different restaurants.
  if (previous.items.length && !await dependencies.confirmReplace(restaurant)) return false;
  checkCurrent();
  useCartStore.getState().replaceItems(restaurant, items);
  return true;
}
