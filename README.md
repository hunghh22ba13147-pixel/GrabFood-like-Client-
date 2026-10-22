# GrabFood Client – Hướng dẫn nhóm

**Công nghệ:** React Native (Expo, TypeScript) · React Navigation · Zustand · dữ liệu mock JSON (`src/data`).

## Chạy
```
npm install
npx expo start      # quét QR bằng Expo Go, hoặc nhấn a (Android emulator) / w (web)
npm run typecheck
```

## Cấu trúc
```
src/models/       types.ts – schema chốt cứng (Restaurant, Dish, CartItem, Order...)
src/data/         *.json – mock data (TV5 chỉnh; sinh lại bằng scripts/gen-data.js)
src/services/     api.ts – lớp truy cập dữ liệu (đổi sang Firebase chỉ sửa file này)
src/store/        cartStore (TV3), orderStore (TV4), authStore (TV5)
src/navigation/   RootNavigator + types route params
src/screens/      auth (TV5) · home (TV1) · restaurant (TV2) · cart (TV3) · orders (TV4)
src/theme/        màu, spacing, formatVND
```

## Phân công & nhánh
| TV | Nhánh | Thư mục sở hữu |
|---|---|---|
| 1 | `feat/core-and-home` | `navigation/`, `theme/`, `screens/home/` |
| 2 | `feat/restaurant-menu` | `screens/restaurant/` |
| 3 | `feat/cart-checkout` | `store/cartStore.ts`, `screens/cart/` |
| 4 | `feat/order-tracking` | `store/orderStore.ts`, `screens/orders/` |
| 5 | `feat/auth-profile` | `screens/auth/`, `data/`, `store/authStore.ts` |

Mỗi người chỉ sửa thư mục của mình → hạn chế conflict. Muốn đổi `models/types.ts` phải báo cả nhóm.

## API dùng chung giữa các màn hình
- `useCartStore().addToCart(restaurant, dish, qty, selectedOptions)` – TV2 gọi.
- `needsConfirmSwitch(restaurantId)` → nếu `true` hiện Alert *"Bạn có muốn xóa giỏ hàng hiện tại để tạo đơn mới tại quán này không?"* rồi `clear()`.
- `calcPricing(items, restaurant, voucher)` – tổng tiền/ship/giảm giá.
- `useOrderStore().placeOrder(...)` – TV3 gọi ở Checkout, rồi `navigate('OrderTracking',{orderId})`.
- `AUTO_ADVANCE_SECONDS` (orderStore) – timer tự chuyển trạng thái; `advance(id)` cho nút ẩn.
- Param điều hướng: xem `src/navigation/types.ts`.

## Quy ước Git
`main` ← `develop` ← `feat/*`. Commit nhỏ, message dạng `feat(cart): ...`. Pull `develop` mỗi sáng. Code freeze: 27/10.

## Họp: 21:30 mỗi tối – 3 ý: xong gì / làm gì tiếp / đang kẹt gì.
