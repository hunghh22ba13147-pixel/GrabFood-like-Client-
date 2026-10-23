import type { Order, PaymentMethod } from '../../models/types';
import type { useOrderStore } from '../../store/orderStore';
import { calcPricing, CartPricing, CartValidationError, cartErrorMessage, cloneCartItem, useCartStore, voucherIssue } from '../../store/cartStore';

type CartSnapshot = Pick<ReturnType<typeof useCartStore.getState>, 'items' | 'restaurant' | 'voucher'>;
type PlaceOrder = ReturnType<typeof useOrderStore.getState>['placeOrder'];

export interface CheckoutReview { pricing: CartPricing; fingerprint: string }

/** The fingerprint also covers address/options/note, not only the total. */
export function checkoutReview(cart: CartSnapshot, address: string): CheckoutReview {
  const pricing = calcPricing(cart.items, cart.restaurant, cart.voucher);
  return { pricing, fingerprint: JSON.stringify({ restaurant: cart.restaurant, items: cart.items, voucher: cart.voucher, address, pricing }) };
}

export interface CheckoutState {
  phase: 'idle' | 'submitting' | 'created';
  orderId: string | null;
  error: string | null;
}

/** Uses the current synchronous TV4 contract. No fake latency or parallel order storage. */
export function createCheckoutController(dependencies: {
  placeOrder: PlaceOrder;
  getAddress: () => string;
  openTracking: (orderId: string) => void;
}) {
  let state: CheckoutState = { phase: 'idle', orderId: null, error: null };
  const listeners = new Set<() => void>();
  function publish(next: CheckoutState) {
    state = next;
    listeners.forEach((listener) => listener());
  }
  function openTracking() {
    if (!state.orderId) return;
    try {
      dependencies.openTracking(state.orderId);
      publish({ ...state, error: null });
    } catch {
      publish({ ...state, error: 'Đơn đã được tạo nhưng chưa mở được màn theo dõi. Hãy bấm mở lại; không cần đặt thêm đơn.' });
    }
  }
  function submit(review: CheckoutReview | null, paymentMethod: PaymentMethod | null): Order | null {
    if (state.phase !== 'idle' || useCartStore.getState().checkoutLocked) return null;
    publish({ phase: 'submitting', orderId: null, error: null });
    try {
      const cart = useCartStore.getState();
      if (!cart.items.length || !cart.restaurant) throw new CartValidationError('Giỏ hàng trống. Vui lòng thêm món.');
      if (paymentMethod !== 'cash' && paymentMethod !== 'wallet') throw new CartValidationError('Vui lòng chọn phương thức thanh toán.');
      const address = dependencies.getAddress();
      if (!address.trim()) throw new CartValidationError('Chưa có địa chỉ giao hàng. Vui lòng cập nhật trong Tài khoản.');
      const latest = checkoutReview(cart, address);
      if (!review || latest.fingerprint !== review.fingerprint) {
        throw new CartValidationError('Giỏ hàng hoặc địa chỉ đã thay đổi. Vui lòng kiểm tra lại trước khi đặt đơn.');
      }
      const issue = voucherIssue(cart.voucher, latest.pricing.subtotal);
      if (issue) throw new CartValidationError(issue);
      useCartStore.setState({ checkoutLocked: true });
      // TV4 currently retains references, so hand over a fully detached snapshot.
      const order = dependencies.placeOrder({
        restaurant: { ...cart.restaurant },
        items: cart.items.map(cloneCartItem),
        pricing: { ...latest.pricing },
        voucherCode: cart.voucher?.code,
        paymentMethod,
        address,
      });
      // A returned Order is the success signal of the verified synchronous API.
      useCartStore.setState({ items: [], restaurant: null, voucher: null, checkoutLocked: false });
      publish({ phase: 'created', orderId: order.id, error: null });
      openTracking();
      return order;
    } catch (error) {
      useCartStore.setState({ checkoutLocked: false });
      publish({ phase: 'idle', orderId: null, error: error instanceof CartValidationError
        ? cartErrorMessage(error) : 'Chưa tạo được đơn. Giỏ hàng vẫn được giữ lại. Vui lòng thử lại.' });
      return null;
    }
  }
  return {
    getState: () => state,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    submit,
    openTracking,
  };
}
