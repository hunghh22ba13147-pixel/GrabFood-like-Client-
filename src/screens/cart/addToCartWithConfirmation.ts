import { Alert, Platform } from 'react-native';
import type { CartItem, Dish, Restaurant } from '../../models/types';
import { createCartItem, useCartStore } from '../../store/cartStore';

function confirmSwitch(): Promise<boolean> {
  const message = 'Bạn có muốn xóa giỏ hàng hiện tại để tạo đơn mới tại quán này không?';
  if (Platform.OS === 'web') return Promise.resolve(globalThis.confirm(message));
  return new Promise((resolve) => Alert.alert('Đổi quán?', message, [
    { text: 'Hủy', style: 'cancel', onPress: () => resolve(false) },
    { text: 'Đổi quán', style: 'destructive', onPress: () => resolve(true) },
  ], { cancelable: true, onDismiss: () => resolve(false) }));
}

/** TV2 can import this helper instead of clear()+addToCart(); do not show a second Alert. */
export async function addToCartWithConfirmation(
  restaurant: Restaurant, dish: Dish, quantity: number, selected: CartItem['selectedOptions'], note?: string,
  confirm: () => Promise<boolean> = confirmSwitch,
): Promise<boolean> {
  const item = createCartItem(restaurant, dish, quantity, selected, note);
  const target = { ...restaurant };
  const previous = useCartStore.getState();
  if (!previous.needsConfirmSwitch(target.id)) {
    previous.addToCart(target, item.dish, item.quantity, item.selectedOptions, item.note);
    return true;
  }
  if (!await confirm()) return false;
  const current = useCartStore.getState();
  // Do not erase a different cart that changed while the dialog was open.
  if (current.items !== previous.items || current.restaurant !== previous.restaurant || current.voucher !== previous.voucher) return false;
  current.replaceCart(target, item.dish, item.quantity, item.selectedOptions, item.note);
  return true;
}
