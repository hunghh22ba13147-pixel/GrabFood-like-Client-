# TV3 — Bàn giao Cart, Voucher & Checkout

> Mình là **Thành viên 3**, phụ trách **Cart, Voucher & Checkout**.
> Phần dưới đây được mình triển khai cùng Codex trên nhánh `feat/cart-checkout`.
> Ngày bàn giao: **23/10/2026 — Asia/Bangkok**.
> Trạng thái: **phần TV3 độc lập đã triển khai và kiểm thử; chờ tích hợp, chưa nghiệm thu toàn bộ luồng app**.

## 1. TV3 đã xong chưa? Bây giờ cần làm gì?

Mình đã làm xong phần độc lập có đủ contract hiện tại: logic giỏ hàng, tính tiền, voucher theo schema hiện có, giao diện Cart/Checkout và bàn giao Order qua API của TV4. Phần này sẵn sàng để các bạn tích hợp. Tuy nhiên, chưa thể coi toàn bộ nhiệm vụ TV3 đã nghiệm thu vì còn kiểm tra hạn voucher, thao tác trên app thật và luồng liên thông với TV2/TV4/TV5.

**Mình không cần chờ tất cả thành viên làm xong mới tiếp tục.** Ngay bây giờ có thể bàn giao source và contract; các bạn triển khai phần của mình song song. Khi một điểm nối sẵn sàng, mình phối hợp kiểm tra điểm đó trước, rồi kiểm tra toàn bộ luồng khi các phần còn lại đã đủ.

| Thời điểm | Việc của mình/TV3 | Kết quả cần có |
| --- | --- | --- |
| Ngay sau bàn giao | Review source, chia sẻ đúng nhánh/phần thay đổi và file này cho nhóm; thống nhất các điểm nối bên dưới | Các bạn thực sự có code TV3 và biết API cần gọi |
| TV2 nối chọn món | Kiểm tra món, size/topping, note, đổi quán Hủy/Đồng ý trên Cart thật | Q01, C11/I, C14–C15/I có bằng chứng tích hợp |
| TV5 nối auth/địa chỉ | Kiểm tra Checkout nhận đúng `user.address`, chặn khi thiếu địa chỉ | Không cần địa chỉ giả để đặt đơn |
| TV4 hoàn thiện Order/Tracking/History | Kiểm tra ID, đặt một đơn, mở đúng Tracking, xuất hiện đúng một đơn trong History | O14 và O15 đạt yêu cầu |
| TV1 xử lý hạ tầng chạy app | Kiểm tra màn nhỏ, danh sách dài, bàn phím, nút disabled, thông báo lỗi và retry trên môi trường chạy được | Các case UI/device trước đây NOT_RUN được kiểm tra |
| Nhóm chốt hạn voucher | Bổ sung kiểm tra hạn trong phần TV3 theo contract đã thống nhất, viết/chạy các case còn bị chặn | V08, V09, V17 có kết quả thật |
| Trước nghiệm thu | Chạy lại typecheck/test TV3, kiểm tra luồng đầy đủ và cập nhật kết quả | Đủ bằng chứng để kết luận TV3 hoàn tất |

Khi các bạn chưa sẵn sàng, mình giữ phần đã kiểm thử và ghi nhận blocker. Mình không cần tự viết thay màn chọn món, auth, Tracking/History hoặc tự đổi schema để có một bản demo giả hoàn chỉnh.

## 2. Tình trạng Git và cách nhận bàn giao

- Nhánh local hiện tại: `feat/cart-checkout`, tạo từ `main` tại commit `c2a49be`.
- **Source TV3 vẫn ở working tree, chưa stage/commit/push/merge.** Chưa có commit/PR chứa phần triển khai này để các máy khác lấy về.
- Việc tạo `TV3.md` không đồng nghĩa nhóm đã nhận được source. Mình cần review và đưa phần việc lên nhánh chia sẻ theo quy trình nhóm, hoặc bàn giao đầy đủ các file thay đổi qua cách nhóm thống nhất.
- Theo README, PR tính năng hướng vào `develop`, TV1 duyệt ghép. Không tự merge vào `main` hoặc ghi đè nhánh của bạn khác. Đây là bước tiếp theo cần thực hiện riêng; Codex chưa thực hiện bước Git đó.
- Ba file tài liệu untracked có sẵn được giữ nguyên: `CODEX_TV3_CART_CHECKOUT.md`, `Ke_Hoach_Du_An_Mobile_App_GrabFood_Client.docx`, `Ke_Hoach_Du_An_Mobile_App_GrabFood_Client.md`.
- File `TV3.md` ở gốc repo được tạo theo yêu cầu bàn giao riêng của mình. Trong lượt tạo tài liệu này, source và các thay đổi trước đó được giữ nguyên.

## 3. Mình và Codex đã làm những gì?

| Hạng mục | Phần đã triển khai | Giới hạn cần biết |
| --- | --- | --- |
| Quản lý giỏ | Thêm, gộp dòng cùng cấu hình, tăng/giảm/xóa món, đếm số lượng | Giảm từ 1 xuống 0 xóa dòng theo contract có sẵn; có nút xóa riêng |
| Dữ liệu đầu vào | Chặn quantity sai, món khác restaurantId, lựa chọn không tồn tại/bị lặp, thiếu lựa chọn bắt buộc, giá/ship/discount lỗi | Lỗi được trả bằng exception có thông báo; caller cần xử lý |
| Gộp món | Xét quán, món, tập options và note; không mất topping hoặc note khác nhau | Thứ tự tick option/choice không làm tạo cấu hình khác |
| Một giỏ một quán | Direct add khác quán bị từ chối; helper có xác nhận Hủy/Đồng ý; thay giỏ sau validation bằng một update | TV2 chưa gọi helper trong UI thật |
| Tính tiền | Topping/size cộng vào giá một phần, nhân quantity một lần; ship cộng một lần; breakdown dùng chung | Dùng field thật `unitPrice` và `total`, không thêm `itemTotalPrice`/`finalTotal` vào schema |
| Voucher | Tải qua service thật; chọn/nhập/bỏ/thay mã; trim và không phân biệt hoa thường; ngưỡng theo subtotal; tính lại khi giỏ thay đổi | Chưa kiểm tra hết hạn vì schema chưa có trường hạn |
| Cart UI | Hiển thị quán, món, lựa chọn, note, quantity, tiền, voucher, empty state và lỗi | Chưa kiểm tra thao tác/layout trên thiết bị thật |
| Checkout UI | Địa chỉ từ auth, danh sách món, voucher, breakdown, chọn tiền mặt/ví giả lập, trạng thái xử lý/lỗi | Thiếu địa chỉ hoặc payment thì không đặt được; auth UI hiện chưa nối store |
| Tạo đơn | Gọi `placeOrder` thật, payload snapshot độc lập, lấy ID trả về, clear sau thành công | API thật hiện đồng bộ; không có contract backend/Promise |
| Chống đặt trùng/lỗi | Khóa ngay trong handler; chặn public mutations khi đang tạo đơn; giữ giỏ khi sync throw; navigation lỗi chỉ mở lại đơn cũ | Không tuyên bố xử lý idempotency/partial-save của API mạng chưa tồn tại |
| Kiểm thử/bàn giao | Test logic, controller, helper, render SSR, service/store thật; log; mapping 63 scenario; diagnostic lỗi ID | Mock, integration, BLOCKED và NOT_RUN được báo tách riêng |

Phần trước đây là placeholder ở Cart/Checkout đã được thay bằng chức năng TV3. Không còn điều hướng từ Checkout của TV3 với ID `demo`.

## 4. Danh sách file thuộc phần bàn giao

| File/nhóm file | Mục đích |
| --- | --- |
| [src/store/cartStore.ts](src/store/cartStore.ts) | State, validation, một quán, tính giá/voucher, snapshot dữ liệu và khóa giỏ |
| [CartScreen.tsx](src/screens/cart/CartScreen.tsx) | Màn giỏ hàng |
| [CheckoutScreen.tsx](src/screens/cart/CheckoutScreen.tsx) | Màn thanh toán và kết nối Order |
| [CartComponents.tsx](src/screens/cart/CartComponents.tsx) | Component giao diện riêng TV3, breakdown và hiển thị lỗi tiền |
| [VoucherPicker.tsx](src/screens/cart/VoucherPicker.tsx) | Tải và chọn/áp/bỏ voucher |
| [checkout.ts](src/screens/cart/checkout.ts) | Controller submit, snapshot, review mới nhất, xử lý lỗi và chống bấm lặp |
| [addToCartWithConfirmation.ts](src/screens/cart/addToCartWithConfirmation.ts) | Helper TV2 cần dùng để thêm món và xác nhận đổi quán |
| `src/screens/cart/__tests__/{cart,checkout,confirmation,components,integration}.test.cjs` | Năm file test tự động |
| `src/screens/cart/__tests__/fixtures.ts`, `register.cjs` | Fixture riêng và loader TypeScript trong bộ test TV3 |
| [diagnose-order-id.cjs](src/screens/cart/__tests__/diagnose-order-id.cjs) | Tái hiện lỗi ID thuộc orderStore/TV4 |
| [last-run.tap](src/screens/cart/__tests__/last-run.tap) | Log kiểm thử thật đã lưu |
| [TV3_NOTES.md](src/screens/cart/TV3_NOTES.md) | Ghi chú kỹ thuật chi tiết, contract và mapping đủ 63 scenario |
| [TV3.md](TV3.md) | Tài liệu bàn giao chung cho nhóm và AI của từng thành viên |

Phần triển khai chỉ sửa `src/store/cartStore.ts` và `src/screens/cart/**`. Không sửa model, navigation, theme, service, auth/order store, màn thành viên khác, mock chung, README, dependency hoặc cấu hình chung.

## 5. Contract TV2 cần dùng — chọn món vào Cart

### 5.1. Đầu vào và hành vi

Store giữ API `addToCart(restaurant, dish, quantity, selectedOptions, note?): void`. Tham số `note?` đã có trong source trước phiên triển khai; không phải một field mới tự thêm vào model.

Helper đề nghị TV2 dùng:

```ts
addToCartWithConfirmation(
  restaurant: Restaurant,
  dish: Dish,
  quantity: number,
  selected: CartItem['selectedOptions'],
  note?: string,
): Promise<boolean>
```

- `true`: món đã được thêm hoặc giỏ đã được thay sau xác nhận.
- `false`: người dùng Hủy/dismiss, hoặc giỏ đã đổi trong lúc dialog mở nên xác nhận cũ không còn được thực hiện. Không thông báo thêm thành công trong trường hợp này.
- Exception: dữ liệu không hợp lệ hoặc đang khóa giỏ; TV2 cần catch và hiển thị lý do.
- Helper tự xử lý xác nhận khác quán. **Không thêm Alert thứ hai và không gọi `clear()` trước helper.** Helper dùng `replaceCart` đã validate để tránh mất giỏ cũ khi món mới không hợp lệ.
- Giỏ/cùng quán không cần dialog. Direct `addToCart` với quán khác không được tự clear hoặc trộn món.

Ví dụ dưới đây là **mẫu TV2 sẽ đưa vào handler của mình**, chưa phải code đã tồn tại trong màn TV2. Import path áp dụng khi đặt trong `src/screens/restaurant/`:

```ts
import { Alert } from 'react-native';
import type { CartItem, Dish, Restaurant } from '../../models/types';
import { cartErrorMessage } from '../../store/cartStore';
import { addToCartWithConfirmation } from '../cart/addToCartWithConfirmation';

async function addSelectedDish(
  restaurant: Restaurant,
  dish: Dish,
  quantity: number,
  selectedOptions: CartItem['selectedOptions'],
  note?: string,
): Promise<boolean> {
  try {
    return await addToCartWithConfirmation(
      restaurant, dish, quantity, selectedOptions, note,
    );
  } catch (error) {
    Alert.alert('Không thể thêm món', cartErrorMessage(error));
    return false;
  }
}
```

TV2 chỉ báo thành công/điều hướng sau khi handler trả `true`, theo luồng màn hình của TV2.

### 5.2. Lựa chọn size/topping và giá

- `selectedOptions` đúng schema: `{ optionId: string; choiceIds: string[] }[]`.
- Dùng ID trong `Dish.options` và `choices`, không truyền tên hiển thị thay ID.
- Nhóm `required: true` phải có lựa chọn. Nhóm `multiple: false` không được chọn nhiều choice.
- Size là một nhóm option; không thêm trường `size` riêng hoặc tự đổi `dish.price` thành giá đã cộng topping.
- Giá cộng thêm nằm ở `OptionChoice.price`. Cart đã cộng lựa chọn, nên TV2 không cộng lần thứ hai trước khi gửi.
- `quantity` khi thêm là số nguyên dương hợp lệ. Ghi chú truyền nguyên văn qua `note`.
- Đọc/chọn dữ liệu quán/món theo API/model thật; không dùng fixture test trong luồng app.

## 6. Contract TV4 cần giữ — Checkout sang Order

Contract hiện đang được Checkout gọi:

```ts
placeOrder({
  restaurant,
  items,
  pricing: { subtotal, deliveryFee, discount, total },
  voucherCode,
  paymentMethod, // 'cash' | 'wallet'
  address,
}): Order // trả đồng bộ theo implementation hiện tại
```

- TV3 tự chuẩn bị snapshot độc lập vì orderStore hiện giữ reference đầu vào. Sửa giỏ sau này không được làm đổi đơn đã tạo.
- TV4 tạo `Order.id`, `createdAt`, `status: 'placed'`; TV3 lấy chính `order.id` trả về để mở `OrderTracking` với `{ orderId }`.
- TV3 chỉ clear sau tín hiệu thành công là API trả `Order`. Khi sync throw trước tạo đơn, giỏ/voucher/payment được giữ để thử lại.
- Nếu tạo đơn đã thành công mà mở Tracking lỗi, Checkout giữ ID và cho mở lại; không submit đơn mới để sửa lỗi điều hướng.
- **Cần TV4 sửa nguồn sinh ID.** Diagnostic hiện tái hiện hai Order có cùng `GF200000` khi tạo trong cùng millisecond. Khóa submit ở TV3 không thay thế yêu cầu ID duy nhất cho các lần tạo đơn hợp lệ khác nhau.
- Tracking/History cần đọc Order theo ID thật, hiển thị đúng tiền/items/note và không dùng ID demo. Timer chuyển trạng thái và reorder thuộc TV4.
- Nếu TV4 muốn đổi `placeOrder` sang Promise hoặc kiểu kết quả khác, cần báo TV3 trước và chốt semantics thành công/thất bại, partial-save và retry. Controller hiện tại không hỗ trợ contract async mới chưa được thống nhất.

## 7. Bàn giao theo từng thành viên

| Thành viên | Việc cần tiếp nhận/thực hiện | Khi nào báo TV3 kiểm tra |
| --- | --- | --- |
| **TV1 — core/navigation** | Nhận phần TV3 vào quy trình ghép code; xử lý dependency chung thiếu `@expo/metro-runtime` cho web và `expo-asset` cho Android theo Expo SDK đang dùng; giữ route/param đã thống nhất; điều phối thay đổi model | App chạy được trên môi trường kiểm tra, hoặc có thay đổi route/model ảnh hưởng Cart/Checkout |
| **TV2 — restaurant/menu** | Hoàn thiện màn chọn món, map size/topping sang ID thật, truyền note; gọi helper xác nhận ở mục 5; không clear giỏ trước validation | Đã thêm được món vào store thật và đã nối Hủy/Đồng ý đổi quán |
| **TV4 — order/tracking/history** | Sửa ID duy nhất; giữ/thống nhất API `placeOrder`; triển khai Tracking/History từ Order thật, timer theo phần của TV4 | Diagnostic ID không còn FAIL và màn Tracking/History đọc đúng Order |
| **TV5 — auth/profile/data** | Nối Login/Register/Profile với authStore; cung cấp `user.address`; giữ dữ liệu voucher đúng schema; cùng TV1 chốt trường hạn dùng | Checkout có địa chỉ thật; dữ liệu voucher/contract hạn dùng sẵn sàng |
| **TV3 — mình** | Hỗ trợ caller tích hợp, kiểm tra giao diện/điểm nối, sửa lỗi trong phạm vi TV3; bổ sung hạn voucher sau khi contract chốt; cập nhật test và bàn giao | Quay lại từng phần ngay khi có đầu vào cần thiết, không chờ tất cả cùng hoàn thành |

Tại lúc đối chiếu source để lập tài liệu này, màn chọn món TV2, Login/Register/Profile TV5 và Tracking/History TV4 vẫn là placeholder. Đây là trạng thái quan sát trong repository này, không phải khẳng định các bạn chưa có code ở nhánh/máy khác. Cần nhận bản ghép thật rồi kiểm tra lại.

### Quyết định voucher đã chốt với TV3

- Một voucher tại một thời điểm; áp mã mới hợp lệ thay mã cũ.
- Mã được trim đầu/cuối, không phân biệt hoa thường; thử mã sai giữ mã đang áp.
- `minOrder` xét subtotal trước giảm, không gồm ship.
- Giảm tiền món tối đa subtotal, không lấn sang ship. Freeship theo discriminator thật hiện miễn toàn phí ship; percent giữ cách làm tròn/maxDiscount hiện có.
- Khi giỏ giảm dưới ngưỡng, discount về 0, UI giải thích và chặn đặt cho đến khi thêm món hoặc bỏ mã.

### Phần hạn voucher còn chờ chốt

Người dùng đã xác nhận để **BLOCKED** V08/V09/V17, chờ TV1/TV5 bổ sung contract. Cần thống nhất tên field, kiểu/đơn vị thời gian, timezone, thời điểm đúng hạn có còn hợp lệ không, và cách xử lý record thiếu hạn. Chưa có quyết định đó thì không tự thêm field hoặc suy hạn từ tên mã.

## 8. Bằng chứng kiểm thử và giới hạn

Kết quả dưới đây lấy từ phiên triển khai ngày 23/10/2026. Lượt tạo `TV3.md` chỉ đối chiếu source/Git/log và thêm tài liệu, không chạy lại suite hoặc build, nên không tạo kết quả PASS mới.

| Kiểm tra | Kết quả đã chạy | Ý nghĩa |
| --- | --- | --- |
| `npm run typecheck` | **PASS**, exit 0 sau cài dependency và triển khai | TypeScript toàn repo không báo lỗi tại lượt đã kiểm tra |
| Bộ test TV3 | **79 PASS / 0 FAIL / 0 SKIPPED**, exit 0 | 67 unit/store/controller/helper/lookup; 10 SSR component; 2 integration service/store thật |
| Diagnostic ID | **FAIL**, exit 1; hai ID `GF200000`, lưu 2 Order | Lỗi thuộc orderStore/TV4; tách khỏi số pass của bộ TV3 |
| Export web | **BLOCKED**, exit 1, thiếu `@expo/metro-runtime` | Chưa có bản web để kiểm tra tương tác/layout |
| Export Android | **BLOCKED**, exit 1, không resolve `expo-asset` từ expo-font | Chưa xác minh app Android chạy được |
| Hạn voucher | **BLOCKED** | Schema/data chưa có field/semantics |
| Luồng TV2 → Cart → Checkout → Tracking → History | **BLOCKED** ở mức app đầy đủ | Các màn/điểm nối chưa sẵn sàng trong repo này |
| Thiết bị, bàn phím, màn nhỏ, danh sách dài, UI retry | **NOT_RUN** | Cần môi trường chạy app thực để kiểm tra |

Log [last-run.tap](src/screens/cart/__tests__/last-run.tap) ghi lượt bắt đầu **23/10/2026 19:41:51 +07**, lệnh, exit 0 và từng test. [TV3_NOTES.md](src/screens/cart/TV3_NOTES.md) mapping đủ **63 scenario thiết kế** theo từng lớp. **79 test tự động pass không có nghĩa cả 63 scenario đã nghiệm thu toàn bộ.**

Giới hạn cần giữ nguyên khi báo cáo:

- Unit/controller dùng fixture và mock ở ranh giới Order/navigation; Alert native cũng được mock trong test helper.
- SSR dùng React/RN Web thật nhưng mock navigation, safe-area và hook đọc snapshot. SSR không chạy thao tác người dùng, effect tải voucher hoặc bàn phím.
- Integration dùng service/auth/cart/order store thật của repo, nhưng navigation là callback mock; chưa chứng minh màn Tracking/History hoạt động.
- `placeOrder` hiện đồng bộ; chưa test Promise/reject, mạng thật hoặc bảo đảm idempotency backend.
- Bộ test có kiểm tra sync throw giữ giỏ, retry, chặn submit trước render, snapshot Order, stale review và lỗi navigation.

## 9. Lệnh kiểm tra lại sau tích hợp

Chạy từ gốc repository, sau khi đã có dependency theo lockfile. Các lệnh dưới đây dùng công cụ thực tế, không có script `npm test` được tạo thêm:

```powershell
npm run typecheck
node --test --test-concurrency=1 --test-reporter=spec src/screens/cart/__tests__/*.test.cjs
node src/screens/cart/__tests__/diagnose-order-id.cjs
```

Lệnh diagnostic cuối hiện được kỳ vọng báo FAIL cho implementation TV4 đang có; cần kiểm tra lại sau khi TV4 sửa. Không đổi assertion/clock chỉ để mất lỗi tái hiện. Nếu nhóm đổi cơ chế ID có chủ đích, đọc lại diagnostic và test kỳ vọng nguồn ID để cập nhật đúng contract, không giữ test phụ thuộc định dạng ID cũ một cách máy móc.

Không ghi đè log kiểm thử cũ rồi báo lại cùng timestamp. Nếu chạy lại, lưu kết quả/thời điểm mới và cập nhật notes, tách rõ lỗi ngoài phạm vi.

## 10. Checklist nghiệm thu tích hợp cùng TV3

- [ ] Nhóm đã nhận được source TV3 thực tế qua nhánh/bản bàn giao, không chỉ nhận file mô tả.
- [ ] App build/chạy được trên môi trường được ghi rõ.
- [ ] Đăng nhập/cập nhật địa chỉ làm `authStore.user.address` có giá trị đúng.
- [ ] Từ TV2 chọn món, size/topping và note; Cart nhận đủ, giá không bị cộng topping hai lần.
- [ ] Khác quán: Hủy/dismiss giữ giỏ cũ; Đồng ý thay giỏ sau validation, bỏ voucher cũ, không dialog đôi.
- [ ] Cart tăng/giảm/xóa đúng tiền; xóa món cuối reset quán/voucher/ship và không đặt được giỏ rỗng.
- [ ] Voucher đúng/sai/không đủ ngưỡng, thay/bỏ mã và thay quantity cho kết quả/giải thích thống nhất.
- [ ] V08/V09/V17 được triển khai/kiểm tra sau khi contract hạn dùng chốt, hoặc nhóm quyết định đổi phạm vi và ghi rõ quyết định mới.
- [ ] Chọn tiền mặt và ví giả lập đúng enum; UI không tuyên bố thu tiền thật.
- [ ] Đặt một đơn thành công: đúng items/options/note/địa chỉ/tiền, lấy ID thật, giỏ chỉ clear sau thành công.
- [ ] Nhiều tap không tạo trùng; lỗi tạo đơn giữ giỏ; lỗi mở Tracking không tạo thêm đơn.
- [ ] TV4 bảo đảm ID duy nhất; Tracking và History cùng đọc đúng đơn thật, không ID demo.
- [ ] Kiểm tra màn nhỏ, tên/note dài, danh sách dài, bàn phím voucher, loading/error/retry trên môi trường thực.
- [ ] Typecheck/test TV3 chạy lại sau ghép; kết quả và giới hạn được cập nhật.

Mốc kiểm tra toàn luồng trong kế hoạch hiện có là **26/10/2026**, code freeze **27/10**, thuyết trình **29/10**. Các mốc là mục tiêu của kế hoạch, không phải bằng chứng những bước trên đã hoàn tất.

### Ví dụ tiền để đối chiếu khi demo

Theo dữ liệu hiện tại, quán `r1`, món `r1-d1`: giá gốc 45.000 + size L 7.000 + pearl-white 8.000 + pudding 10.000 = **70.000/phần**. Quantity 2: subtotal **140.000**, ship **8.000**, mã thật `GIAM15K` giảm **15.000** → tổng **133.000đ**. Trước demo cần kiểm tra dữ liệu chưa bị thay đổi.

Ví dụ test độc lập: (30.000 + 5.000 + 7.000) × 2 + 20.000 = subtotal **104.000**; ship 15.000 → **119.000**; voucher fixture giảm 25.000 → **94.000đ**. `GRAB50` trong fixture không phải mã đã có trong dữ liệu sản phẩm.

## 11. Ghi chú cho AI của các thành viên

1. Đọc [README](README.md), [hướng dẫn TV3](CODEX_TV3_CART_CHECKOUT.md), [kế hoạch](Ke_Hoach_Du_An_Mobile_App_GrabFood_Client.md), file này và source thực tế; đọc `AGENTS.md` áp dụng nếu có. Trạng thái trong tài liệu là snapshot, phải kiểm tra lại nhánh/code đang làm.
2. Dùng [TV3_NOTES.md](src/screens/cart/TV3_NOTES.md) và log để xem bằng chứng; không coi ví dụ API hoặc số test pass là bằng chứng UI/E2E đã chạy.
3. Các bạn có thể đọc/import/gọi API TV3 từ phần sở hữu của mình. Nếu cần sửa contract hoặc sửa file TV3, báo và thống nhất với TV3/người có quyền trước, không tự viết lại cart store để làm phần mình chạy.
4. Không suy API/field theo tài liệu cũ khi source dùng tên khác: kiểm tra `OptionChoice.price`, `CartItem.key/unitPrice/note`, `Voucher.type/value/minOrder`, `Order.id/total/status` trong model thật.
5. Không thêm mock-success, ID giả, địa chỉ giả hoặc sửa dữ liệu sản phẩm để che điểm nối thiếu. Fixture chỉ ở test; luồng app phải dùng module thật.
6. Không tự mở rộng quyền sửa chỉ vì đọc file này. Không ghi đè working tree, không tự commit/push/merge hoặc đổi schema/dependency nếu chưa được người dùng/chủ repo cho phép trong nhiệm vụ đang làm.
7. Khi bàn giao lại cho TV3, gửi các file/contract đã đổi, lệnh và kết quả thật, môi trường đã chạy, blocker còn lại và case cần TV3 kiểm tra. TV3 sẽ quay lại hoàn thiện phần phụ thuộc và nghiệm thu chung.
