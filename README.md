# GrabFood Client – Hướng dẫn nhóm

**Công nghệ:** React Native (Expo, TypeScript) · React Navigation · Zustand · dữ liệu mock JSON (`src/data`).

## Chạy
```
npm install
npx expo start      # quét QR bằng Expo Go, hoặc nhấn a (Android emulator) / w (web)
npm run typecheck
npm test           # Node tests; SDK/storage mocks and component SSR are identified in tests
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
- TV2 gọi `addToCartWithConfirmation` trong `screens/cart/` để xác nhận đổi quán. Helper validate trước rồi thay giỏ; không `clear()` trước validation.
- `calcPricing(items, restaurant, voucher)` – tổng tiền/ship/giảm giá.
- `useOrderStore().placeOrder({ userId, ... })` – Checkout truyền `User.id` ổn định, nhận Order thật rồi mở `OrderTracking` bằng `orderId`. Review checkout gồm cả ID tài khoản.
- `ordersForUser(orders, userId)` dùng chung cho History/Tracking/badge; `advance(id, userId)` chỉ cập nhật đơn đúng chủ. Đơn cũ thiếu owner được giữ nguyên, không hiển thị hay tự gán cho tài khoản đăng nhập.
- `AUTO_ADVANCE_SECONDS` (orderStore) – timer tự chuyển trạng thái. Đặt lại đơn dùng `screens/orders/reorder.ts`, đọc menu/giá hiện tại, validate toàn bộ rồi thay giỏ; luôn hỏi xác nhận nếu giỏ đã có món.
- Param điều hướng: xem `src/navigation/types.ts`.

Auth local lưu session và hồ sơ theo ID trong một record `grabfood-auth-v2`; giữ nguyên các key v1 để migration/bảo toàn dữ liệu. Firebase dùng UID đã xác minh sau `authStateReady()`; demo dùng `demo:<email chuẩn hóa>`. Không dùng cache để cấp phiên Firebase. Cart và Order hiện trong bộ nhớ, chưa cam kết tồn tại qua restart; hồ sơ/session có persistence. Checkout mặc định tiền mặt; ví là mô phỏng. Hạn voucher V08/V09/V17 vẫn BLOCKED theo quyết định đã có, chờ contract của nhóm.

## Quy ước Git
`main` ← `develop` ← `feat/*`. Commit nhỏ, message dạng `feat(cart): ...`. Pull `develop` mỗi sáng. Code freeze: 27/10.

## Họp: 21:30 mỗi tối – 3 ý: xong gì / làm gì tiếp / đang kẹt gì.
