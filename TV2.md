# TV2 — Restaurant & Menu

Nhánh: `feat/restaurant-menu`  
Quy tắc đầy đủ + kết quả đã làm: xem [CODEX_TV2_RESTAURANT_MENU.md](./CODEX_TV2_RESTAURANT_MENU.md)

## Mục công việc

1. Giao diện tĩnh Chi tiết quán + Bottom Sheet → `screens/restaurant/` (PascalCase).
2. Không sửa thư mục ngoài phạm vi TV2.
3. Kết nối JSON theo `restaurantId`.
4. Tính tiền: `itemTotalPrice = (dish.price + tổng extraPrice) * quantity`.
5. Không dùng `any`; interface TypeScript rõ ràng.
6. Rà soát toàn bộ `screens/restaurant/`.
7. Nút Thêm vào giỏ → đóng gói đủ field `CartItem` (`src/models/types.ts`).
8. Test case hàm tính tiền.

Chi tiết từng mục, đường dẫn file, bảng test: **CODEX_TV2_RESTAURANT_MENU.md**.
