# CODEX TV2 — Restaurant & Menu

Thành viên 2 · Nhánh `feat/restaurant-menu` · Chỉ được sửa `src/screens/restaurant/`  
Schema dữ liệu chốt cứng: `src/models/types.ts` (không đổi tên field khi chưa họp nhóm)

---

## 0. Phạm vi công việc (không vi phạm)

| Được làm | Không được làm |
|---|---|
| Code trong `src/screens/restaurant/` | Sửa `navigation/`, `theme/`, `models/`, `store/`, `data/`, `screens/home|cart|orders|auth/` |
| Đọc/gọi `api`, `useCartStore`, `RootStackParamList`, `colors` | Đổi field `Restaurant`, `Dish`, `CartItem` |
| Component PascalCase | Dùng kiểu `any` |

**Gọi giỏ hàng (TV3):** `useCartStore().addToCart(restaurant, dish, qty, selectedOptions, note)`  
Nếu `needsConfirmSwitch(restaurantId) === true` → Alert *"Bạn có muốn xóa giỏ hàng hiện tại để tạo đơn mới tại quán này không?"* rồi `clear()`.

---

## 1. Giao diện tĩnh — Chi tiết quán + Bottom Sheet

**Trạng thái: hoàn thành**

| Component (PascalCase) | File | Vai trò |
|---|---|---|
| `RestaurantDetailScreen` | `src/screens/restaurant/RestaurantDetailScreen.tsx` | Màn chi tiết quán |
| `RestaurantHero` | `src/screens/restaurant/RestaurantHero.tsx` | Ảnh bìa, tên, sao, khoảng cách, ETA, phí ship, promo |
| `DishRow` | `src/screens/restaurant/DishRow.tsx` | 1 dòng món (ảnh, tên, mô tả, giá, nút +) |
| `DishOptionsScreen` | `src/screens/restaurant/DishOptionsScreen.tsx` | Bottom Sheet chọn món (modal `DishOptions`) |
| `OptionGroupSection` | `src/screens/restaurant/OptionGroupSection.tsx` | Size (radio) / Topping (checkbox) |
| `QuantityStepper` | `src/screens/restaurant/QuantityStepper.tsx` | Tăng/giảm số lượng |

Route: `RestaurantDetail { restaurantId }` → `DishOptions { restaurantId, dishId }` (presentation `transparentModal`).

---

## 2. Kết nối dữ liệu JSON theo `restaurantId`

**Trạng thái: hoàn thành**

- `api.getRestaurant(restaurantId)` → header quán.
- `api.getDishes(restaurantId)` → chỉ món của đúng quán.
- Tab nhóm món lấy từ `dish.group` (`Tất cả` + từng nhóm).
- Bottom Sheet tìm món bằng `dishId` trong danh sách đã lọc theo `restaurantId`.
- Empty / loading / không tìm thấy quán đều có UI.

Nguồn JSON mẫu: `src/data/restaurants.json`, `src/data/dishes.json` (qua `src/services/api.ts`).

---

## 3. Logic tính tiền Size / Topping

**Trạng thái: hoàn thành**  
File: `src/screens/restaurant/calcItemTotalPrice.ts`

Công thức (kế hoạch dự án):

```text
itemTotalPrice = (dish.price + tổng extraPrice của options) * quantity
```

Ánh xạ schema nhóm: `extraPrice` (kế hoạch) = `choice.price` (`models/types.ts`).

| Hàm | Ý nghĩa |
|---|---|
| `calcItemTotalPrice(dish, selectedOptions, quantity)` | Tổng dòng món trên Bottom Sheet |
| `calcUnitPrice(dish, selectedOptions)` | Giá 1 phần = `dish.price + tổng extra` → ghi vào `CartItem.unitPrice` |
| `collectExtraPrices` | Lấy `price` từng choice đã chọn |
| `toggleSelectedChoice` | Size: 1 lựa chọn; Topping: tick nhiều |
| `createDefaultSelectedOptions` | Tự chọn choice đầu của option `required` |
| `getMissingRequiredOptionNames` | Chặn thêm giỏ khi thiếu Size bắt buộc |

Tổng tiền trên nút **Thêm vào giỏ hàng** tự cập nhật khi đổi Size / topping / số lượng.

---

## 4. Đóng gói `CartItem` khi nhấn «Thêm vào giỏ hàng»

**Trạng thái: hoàn thành**  
File: `src/screens/restaurant/buildCartItem.ts`

Đúng 100% field trong `src/models/types.ts`:

```ts
interface CartItem {
  key: string;            // dishId + options đã chọn (gộp dòng giống nhau)
  dish: Dish;
  quantity: number;
  selectedOptions: { optionId: string; choiceIds: string[] }[];
  unitPrice: number;      // giá 1 phần đã gồm size/topping
  note?: string;
}
```

- `unitPrice = dish.price + tổng extraPrice`
- `itemTotalPrice` (kế hoạch) = `unitPrice * quantity` (hiển thị trên sheet; TV3 dùng `unitPrice * quantity` trong giỏ)
- `note` được trim; chuỗi rỗng không gắn vào object
- Sau khi đóng gói: gọi `addToCart(...)` rồi `navigation.goBack()`

---

## 5. Kiểm tra mã nguồn `screens/restaurant/`

**Trạng thái: đã rà**

- Không có `any`.
- Interface local: `src/screens/restaurant/restaurantMenuTypes.ts` (`SelectedOption`, `CalcItemTotalPriceInput`, `BuildCartItemInput`).
- `tsc --noEmit` pass.
- Không sửa thư mục ngoài TV2.

Danh sách file hiện có:

```
src/screens/restaurant/
  RestaurantDetailScreen.tsx
  RestaurantHero.tsx
  DishRow.tsx
  DishOptionsScreen.tsx
  OptionGroupSection.tsx
  QuantityStepper.tsx
  restaurantMenuTypes.ts
  calcItemTotalPrice.ts
  buildCartItem.ts
  calcItemTotalPrice.test.ts
```

---

## 6. Test case hàm tính tiền

**Trạng thái: hoàn thành — 22 test pass**  
File: `src/screens/restaurant/calcItemTotalPrice.test.ts`  
Chạy: `npx tsx src/screens/restaurant/calcItemTotalPrice.test.ts`

| Case | Kỳ vọng |
|---|---|
| Size M, qty 1 | 45.000 |
| Size L (+7.000) | 52.000 |
| Size L + trân châu trắng + pudding, qty 2 | 140.000 = (45k+7k+8k+10k)×2 |
| quantity 0 | 0 |
| `choiceId` không tồn tại | bỏ qua, giữ giá gốc |
| Món không option, qty 3 | 165.000 |
| `(price + sum extraPrice) * quantity` | 120.000 |
| Default Size bắt buộc | `[{ optionId: 'size', choiceIds: ['M'] }]` |
| `buildCartItem` | đủ `key`, `dish`, `quantity`, `selectedOptions`, `unitPrice`, `note` |
| `unitPrice` vs tổng dòng | 70.000 và 140.000 |
| Note `" Ít đá, 50% đường "` | trim thành `"Ít đá, 50% đường"` |
| Note chỉ khoảng trắng | không gắn `note` |

---

## 7. Checklist nghiệm thu TV2 (kế hoạch dự án)

- [x] Xem được chi tiết quán (ảnh, tên, đánh giá, phí ship).
- [x] Danh sách món chia nhóm / tab.
- [x] Bottom Sheet: Size, Topping, số lượng, ghi chú.
- [x] Đổ món theo `restaurantId`.
- [x] Giá tự nhảy khi tick Size/Topping.
- [x] Truyền đúng `CartItem` vào giỏ (`addToCart`).
- [x] Cảnh báo đổi quán khi giỏ đang thuộc quán khác.
