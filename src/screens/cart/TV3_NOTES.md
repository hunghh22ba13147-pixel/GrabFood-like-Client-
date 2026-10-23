# TV3 — Cart, Voucher & Checkout: ghi chú bàn giao

## Trạng thái

- Người dùng là **Thành viên 3**. Cập nhật 23/10/2026, khoảng 19:43 (Asia/Bangkok).
- Branch: `feat/cart-checkout`, tạo từ `main` tại `c2a49be`. Worktree chưa commit; không commit/push/merge.
- Mức hoàn thành: **phần độc lập đã triển khai và kiểm thử, chờ tích hợp**; không tuyên bố nghiệm thu toàn bộ P0/E2E.
- Đầu phiên không có staged/source diff. Ba file untracked có sẵn được giữ nguyên: `CODEX_TV3_CART_CHECKOUT.md`, `Ke_Hoach_Du_An_Mobile_App_GrabFood_Client.docx`, `Ke_Hoach_Du_An_Mobile_App_GrabFood_Client.md`.
- Không tìm thấy `AGENTS.md` trong repo hoặc các thư mục cha đã kiểm tra. Đã đọc toàn bộ hướng dẫn TV3, README, kế hoạch Markdown chuyển từ DOCX trong phiên trước và source liên quan.
- Ban đầu Cart/Checkout là placeholder; Checkout điều hướng với ID `demo`. Cart store có tính giá nền nhưng thiếu validation, bảo vệ khác quán, phân biệt note và snapshot.
- Baseline typecheck trước cài dependency: BLOCKED vì không tìm thấy `tsc`. Cài đúng lockfile bằng `npm ci --ignore-scripts --no-audit --no-fund`: exit 0, 695 packages; không sửa package/lock/config. Typecheck sau cài và sau triển khai đều exit 0.

## File thay đổi và lý do

| File | Thay đổi |
| --- | --- |
| `src/store/cartStore.ts` | Giữ API cũ; thêm validation, canonical key xét note/options, cập nhật immutable, snapshot dữ liệu đầu vào, bảo vệ một quán, khóa khi đặt đơn, thay giỏ atomic sau xác nhận, kiểm tra tiền/voucher |
| `src/screens/cart/CartScreen.tsx` | Thay placeholder bằng danh sách món, lựa chọn/note, tăng/giảm/xóa, voucher, breakdown, lỗi và empty state |
| `src/screens/cart/CheckoutScreen.tsx` | Địa chỉ thật từ auth, chọn cash/wallet giả lập, review tiền, gọi controller, loading/error, mở lại Tracking sau lỗi điều hướng |
| `src/screens/cart/CartComponents.tsx` | Component riêng TV3; formatter/theme chung được import; hiển thị lỗi tiền thay vì NaN; accessible controls |
| `src/screens/cart/VoucherPicker.tsx` | Đọc `api.getVouchers`, loading/error/retry, lookup mã chuẩn hóa, một mã, bỏ/thay mã, giải thích khi không đủ ngưỡng |
| `src/screens/cart/checkout.ts` | Handler độc lập dùng contract đồng bộ thật, khóa submit tức thì, kiểm tra review mới nhất, snapshot, clear sau thành công, recovery navigation |
| `src/screens/cart/addToCartWithConfirmation.ts` | Helper TV2 có thể import: validate trước dialog; Hủy/dismiss giữ giỏ; Đồng ý thay atomic; chặn dialog cũ xóa nhầm giỏ đã thay đổi |
| `src/screens/cart/__tests__/fixtures.ts`, `register.cjs` | Fixture đúng schema thật và loader TypeScript trong bộ test TV3, không có cấu hình chung mới |
| `src/screens/cart/__tests__/cart.test.cjs` | 43 test store/giá/validation với oracle tính tay |
| `src/screens/cart/__tests__/checkout.test.cjs` | 17 test controller với order API/navigation mock; sync throw, retry, reentrant submit, snapshot và stale review |
| `src/screens/cart/__tests__/confirmation.test.cjs` | 6 test helper với native Alert mock |
| `src/screens/cart/__tests__/components.test.cjs` | 10 test SSR component + 1 test lookup; React/RN Web thật, mock navigation/safe-area/hook đọc state |
| `src/screens/cart/__tests__/integration.test.cjs` | 2 test service/auth/cart/order store thật; navigation mock, không chứng minh Tracking/History |
| `src/screens/cart/__tests__/diagnose-order-id.cjs` | Diagnostic độc lập, tái hiện lỗi ID của TV4; exit 1 khi trùng, không tính là test pass |
| `src/screens/cart/__tests__/last-run.tap` | Log thật của lượt cuối, timestamp, lệnh, exit code và từng test |
| `src/screens/cart/TV3_NOTES.md` | Contract, quyết định, blocker, mapping 63 scenario và bàn giao |

## Contract đã xác minh

| API/type | File/symbol thật | Input/output và semantics | Owner |
| --- | --- | --- | --- |
| Cart | `src/store/cartStore.ts` | `addToCart(restaurant,dish,quantity,selectedOptions,note?): void`; `needsConfirmSwitch`; quantity <= 0 xóa; giữ API cũ | TV3 |
| Thay giỏ | `cartStore.replaceCart` (bổ sung trong phiên này) | Cùng input addToCart; chỉ caller đã được xác nhận gọi; validate xong rồi thay items/restaurant và bỏ voucher cùng một update | TV3/TV2 gọi |
| Options | `src/models/types.ts` | `optionId`, `choiceIds`; giá cộng thêm là `OptionChoice.price`; `required`/`multiple`; size là nhóm option, không thêm field size | TV1/TV2 |
| Pricing | `calcUnitPrice`, `calcPricing`, `CartPricing` | Số VND; `{subtotal,deliveryFee,discount,total}`; không có field itemTotalPrice/finalTotal trong schema thật | TV3 |
| Voucher | `src/models/types.ts`, `src/services/api.ts` | `api.getVouchers(): Promise<Voucher[]>`; `amount\|percent\|freeship`, `value`, `minOrder`, `maxDiscount?`; không có hạn dùng | TV1/TV5 |
| Dữ liệu mã thật | `src/data/vouchers.json` | GIAM15K: amount 15k/min50k; FREESHIP: freeship toàn phí/min40k; SALE10: percent10/min100k/max30k. Không tự thêm GRAB50 vào app | TV5 |
| Order | `src/store/orderStore.ts: placeOrder` | `({restaurant,items,pricing,voucherCode?,paymentMethod,address}) => Order` đồng bộ; store tạo id/createdAt/status `placed`, giữ reference đầu vào; return Order là tín hiệu thành công | TV4 |
| Payment/address | `PaymentMethod`, `src/store/authStore.ts` | `cash\|wallet`; địa chỉ từ `user.address`; thiếu địa chỉ thì chặn, không bịa fallback | TV5 |
| Navigation | `src/navigation/types.ts`, `RootNavigator.tsx` | Cart/Checkout đã đăng ký; `replace('OrderTracking',{orderId:order.id})`; Home là tab trong Tabs | TV1 |

## Quyết định nghiệp vụ và giải thích

| Vấn đề | Quyết định | Căn cứ | Case |
| --- | --- | --- | --- |
| Gộp dòng | Gộp cùng quán/món/tập options và cùng note; khác note hoặc lựa chọn giữ dòng riêng. Sắp thứ tự option/choice để không phụ thuộc thứ tự tick | Comment CartItem.key và logic gộp có sẵn; yêu cầu bảo toàn lựa chọn/note | C09–C12 |
| Giảm từ 1 | Xóa dòng khi quantity <= 0; có nút xóa riêng. Add luôn yêu cầu số nguyên dương hữu hạn/an toàn | Contract `updateQuantity` đã có, giữ hành vi | C07/C17 |
| Một quán | Direct add khác quán báo lỗi và không sửa state. Helper xác nhận chỉ thay sau validation, không clear trước | Kế hoạch, README, hướng dẫn TV3 | C13–C18 |
| Tính giá | Giá một phần = dish.price + các choice.price đã chọn; nhân quantity một lần; cộng ship một lần; subtotal + ship − discount | Kế hoạch; field thật OptionChoice.price | C03–C06/V01 |
| Ngưỡng | Subtotal trước giảm, chưa gồm ship | Logic `calcPricing` có sẵn | V03/V04 |
| Trần giảm món | amount/percent tối đa subtotal; không giảm vào ship | Người dùng xác nhận qua câu trả lời ngày 23/10/2026 | V16 |
| Số mã/lookup | Một mã; trim đầu/cuối, không phân biệt hoa thường; thử mã sai giữ mã cũ | Người dùng xác nhận ngày 23/10/2026; state một voucher đã có | V05–V07/V12/V20 |
| Freeship/percent | Freeship miễn toàn phí, không suy từ tên/title/value. Percent làm tròn và áp maxDiscount như code cũ | Type discriminator, dữ liệu thật và code có sẵn | V13–V15/percent regression |
| Mã không còn đủ ngưỡng | Giữ mã đã chọn để giải thích, discount về 0; chặn submit đến khi thêm món hoặc bỏ mã, không đặt âm thầm với tiền khác | Hướng dẫn chống stale voucher/review | V10/O13 |
| Hạn dùng | BLOCKED, chưa có field/semantics; không tự thêm schema hay giả định cuối ngày | Người dùng xác nhận chờ TV1/TV5 ngày 23/10/2026 | V08/V09/V17 |
| Review/submit | So sánh fingerprint toàn bộ món/options/note/quán/voucher/địa chỉ/giá với state hiện tại trước submit; khác thì yêu cầu review lại | Hướng dẫn O13 | O13 |
| Khóa/snapshot | Khóa ngay trong handler trước render; store chặn public mutations trong API sync; deep clone trước bàn giao vì TV4 giữ references | Contract thật + hướng dẫn snapshot/chống bấm lặp | O07/O09/O12 |
| Clear/retry | Chỉ clear khi API trả Order; sync throw giữ giỏ/mã/payment. Nếu navigation lỗi sau tạo đơn, chỉ mở lại Tracking của ID cũ, không đặt lại | Hướng dẫn và API đồng bộ thật | O06/O08/O10/O11 |

Không có persistence, backend, thanh toán thật, timer Tracking, reorder hoặc địa chỉ giả mới. Không tự thêm API vào module khác.

## Blocker và việc cần phối hợp

| Vấn đề | Bằng chứng/ảnh hưởng | Điều kiện kiểm tra tiếp | Owner |
| --- | --- | --- | --- |
| Hạn voucher | Model/data không có expiry; V08/V09/V17 BLOCKED | Nhóm chốt field, timestamp/date, timezone và biên hết hạn; TV1/TV5 thực hiện ở module của họ | TV1/TV5 |
| TV2 chưa tích hợp | DishOptionsScreen chỉ goBack, chưa gọi addToCart/hiện dialog/truyền note; Q01, C11/I, C14–15/I BLOCKED | TV2 chọn đúng optionId/choiceIds và gọi helper được cung cấp; không gọi thêm Alert hoặc clear() trước helper | TV2 |
| Auth UI chưa tích hợp | Login/Register/Profile đều placeholder; đăng nhập demo không gọi authStore, user vẫn null | TV5 nối login/register/address vào authStore. Checkout hiện chặn đúng khi chưa có address | TV5 |
| Tracking/History | Hai screen vẫn placeholder, History dùng ID demo; O15/I/M BLOCKED | TV4 đọc Order thật theo ID, hiển thị tracking/history; chạy lại Q01/O15 trên app | TV4 |
| ID không duy nhất | Diagnostic hai đơn hợp lệ cùng clock trả GF200000/GF200000, 2 đơn được lưu; O14/I uniqueness FAIL | TV4 sửa nguồn sinh ID ở orderStore, không đổi ID trong TV3; chạy lại diagnostic | TV4 |
| Web build | Expo export web exit 1: thiếu `@expo/metro-runtime@~5.0.5` | TV1 bổ sung dependency tương thích SDK53 khi được phép; export lại và kiểm tra trình duyệt | TV1 |
| Android build | Metro xử lý 916 modules rồi exit 1: expo-font không resolve `expo-asset` | TV1 xử lý dependency chung expo-asset; export lại và có emulator/device | TV1 |
| Async/idempotency | placeOrder chỉ sync; chưa có reject/result-error/partial-save semantics | TV4 cung cấp contract mới trước khi kiểm thử async/retry mạng. Không tuyên bố khóa local giải quyết partial-save rồi throw | TV4 |
| Layout/keyboard/device | Chưa có app build chạy được; không tìm thấy adb/emulator trên PATH | Sau sửa hạ tầng, chạy Q02 và thao tác C/M trên Android/iOS/web thực | TV1/TV3 |

Lỗi build chỉ được ghi nhận; không sửa dependency/config, navigation, auth, orderStore hoặc dữ liệu chung.

## Kiểm thử đã thực hiện

Môi trường: Windows, Node v22.21.0, npm 10.9.4, TypeScript/React19/RN Web lấy đúng lockfile. Không cài Jest/Vitest/RNTL/Playwright. Loader chỉ nằm trong vùng test TV3, transpile TypeScript trong bộ nhớ; kiểm tra type độc lập bằng tsc.

| Lệnh/lượt | Kết quả thật | Thời điểm (23/10/2026 +07) |
| --- | --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund` | exit 0; 695 packages; lockfile không thay đổi | Đầu phiên |
| `npm run typecheck` trước cài | BLOCKED: tsc không tìm thấy | Đầu phiên |
| `npm run typecheck` sau cài/triển khai/sửa accessibility | PASS, exit 0 | Khoảng 19:34–19:39 |
| Lượt đầu 3 test files | 66 PASS / 0 FAIL / 0 SKIPPED | Trước bổ sung component/integration |
| Lượt mở rộng 5 test files | 77 PASS / 2 FAIL / 0 SKIPPED: thiếu aria-checked/aria-busy trên RN Web | Khoảng 19:38 |
| `node --test --test-reporter=spec src/screens/cart/__tests__/components.test.cjs` sau sửa production | 11 PASS / 0 FAIL; giữ nguyên assertions, thêm aria props thật trong component | Khoảng 19:39 |
| `node --test --test-concurrency=1 --test-reporter=tap src/screens/cart/__tests__/*.test.cjs` | **79 PASS / 0 FAIL / 0 SKIPPED**, exit 0; [log thật](./__tests__/last-run.tap) | Bắt đầu 19:41:51, 15.6 giây |
| `node src/screens/cart/__tests__/diagnose-order-id.cjs` | **FAIL**, exit 1; GF200000/GF200000, 2 đơn. Diagnostic riêng, không gộp vào số pass | Khoảng 19:40 |
| `node node_modules/expo/bin/cli export --platform web --output-dir node_modules/.cache/tv3-web` | BLOCKED, exit 1, thiếu @expo/metro-runtime | Khoảng 19:36 |
| `CI=1 node node_modules/expo/bin/cli export --platform android --output-dir node_modules/.cache/tv3-android` (PowerShell đặt $env:CI) | BLOCKED, exit 1, thiếu expo-asset | Khoảng 19:39–19:42 |
| `git diff --check` | PASS, exit 0 | Trong review |

79 test tự động gồm **67 unit/store/controller/helper/lookup**, **10 SSR component**, **2 integration service/store thật**. Không có scenario thao tác app/device hoàn chỉnh được chạy. Hai test integration dùng navigation callback mock, không chạy màn Tracking/History. SSR dùng React + RN Web thật nhưng mock hook đọc snapshot, safe-area, navigation; không chạy effect tải voucher, thao tác DOM hoặc bàn phím. Unit Order dùng Order fixture, native Alert là mock; không phải API/backend thật.

Fixture GRAB50/V25 chỉ ở test, giảm cố định 25.000 cho subtotal từ 60.000; không thay dữ liệu sản phẩm. Clock integration cố định T0 = 2026-10-25T10:00:00+07:00 và tự khôi phục; mọi test reset store/fixture. Lượt cuối chạy lại tuần tự trong process mới, không tuyên bố đã random thứ tự test.

### Mapping đầy đủ 63 scenario

`U`: logic/store/controller; `C SSR`: render tĩnh với các mock đã mô tả; `I-store`: service/store thật; `C thao tác/M`: tương tác app chưa chạy. ID có mặt trong tên test/log; không đồng nhất 79 tests với 63 scenario đã pass toàn bộ.

| ID | Kết quả theo lớp | Minh chứng/giới hạn |
| --- | --- | --- |
| C01 | PASS U, C SSR | cart.test, components.test; zero/empty; thao tác app NOT_RUN |
| C02 | PASS U | cart.test: basic item/restaurant |
| C03 | PASS U, C SSR | cart.test/components.test: 84k và đủ topping |
| C04 | PASS U, C SSR | cart.test/components.test: 104k + ship15k |
| C05 | PASS U; NOT_RUN C thao tác | cart.test: tăng đúng 70k |
| C06 | PASS U; NOT_RUN C thao tác | cart.test: giảm đúng 35k |
| C07 | PASS U; NOT_RUN C thao tác | Contract có sẵn: qty0 xóa |
| C08 | PASS U; NOT_RUN C thao tác | Xóa từng dòng, metadata về null |
| C09 | PASS U | Gộp cấu hình/note giống nhau |
| C10 | PASS U | Topping khác giữ hai dòng |
| C11 | PASS U, C SSR; BLOCKED I | Note N1/N2 riêng; TV2 chưa truyền note |
| C12 | PASS U | Đảo nhóm/options không nhân đôi giá |
| C13 | PASS U | store + helper cùng quán không dialog |
| C14 | PASS U helper; BLOCKED C/I | confirmation.test: Alert mock Hủy/dismiss; caller TV2 chưa có |
| C15 | PASS U helper/store; BLOCKED C/I | Confirm atomic, invalid/changing cart không mất dữ liệu; TV2 chưa tích hợp |
| C16 | PASS U | Direct add khác quán bị từ chối |
| C17 | PASS U | 0/-1/1.5/NaN/Infinity/unsafe bị từ chối |
| C18 | PASS U | Mismatch dish.restaurantId bị từ chối |
| C19 | PASS U | Không mutate source, giữ reference immutable |
| C20 | PASS U; NOT_RUN C render tương tác | 10 tăng/3 giảm = 8 |
| V01 | PASS U, C SSR | 119k; Cart/Checkout cùng breakdown |
| V02 | PASS U, C SSR | 94k; GRAB50 fixture không giảm 50% |
| V03 | PASS U | Đúng ngưỡng subtotal60k => total50k |
| V04 | PASS U; NOT_RUN C thao tác | Subtotal59999 không cộng ship vượt ngưỡng |
| V05 | PASS U lookup; NOT_RUN C thông báo | Lookup UNKNOWN undefined, không đổi state |
| V06 | PASS U lookup; NOT_RUN C thao tác | Whitespace không thành voucher; nút UI disabled theo input |
| V07 | PASS U lookup; NOT_RUN C thao tác | Trim/lowercase đúng quyết định người dùng |
| V08 | BLOCKED U/C | Thiếu expiry contract |
| V09 | BLOCKED U | Thiếu expiry/timezone/boundary contract |
| V10 | PASS U, C SSR | Mã mất ngưỡng discount0, có giải thích; controller chặn submit |
| V11 | PASS U; NOT_RUN C thao tác | Bỏ mã =>119k, giữ items |
| V12 | PASS U; NOT_RUN C thao tác | Mã mới thay mã cũ, không stacking |
| V13 | PASS U | Freeship theo type thật, fee15k => total104k |
| V14 | PASS U | Fee10k chỉ giảm10k; không giảm vào món |
| V15 | PASS U | Fee0 => discount0 |
| V16 | PASS U | Giảm món25k/subtotal20k => total15k |
| V17 | BLOCKED U/C | Chưa có field hạn; không bịa revalidation clock |
| V18 | PASS U | Deterministic, không mutate |
| V19 | PASS U, C SSR | Giá/ship/discount lỗi bị từ chối; UI không NaN |
| V20 | PASS U; NOT_RUN C thao tác | Apply mã không hợp lệ giữ mã/tiền cũ; lookup sai không apply |
| O01 | PASS U controller, C SSR | Empty không gọi API; không có action đặt đơn |
| O02 | PASS U controller, C SSR hiển thị; NOT_RUN C thao tác | cash payload đúng; radio chưa tự chọn |
| O03 | PASS U controller, C SSR hiển thị; NOT_RUN M | wallet đúng enum; nhãn giả lập rõ |
| O04 | PASS U controller, C SSR; NOT_RUN C thao tác | Payment null/undefined/card chặn; radio state đúng |
| O05 | PASS U controller; NOT_RUN C thao tác | Payload đầy đủ 104k/15k/25k/94k |
| O06 | PASS U controller, I-store; NOT_RUN navigation thật | Chỉ clear sau returned Order; callback dùng đúng ID |
| O07 | PASS U, I-store | Đổi giỏ cũ/mới không mutate Order |
| O08 | PASS U sync throw; NOT_RUN C thao tác; BLOCKED async | Giữ giỏ/voucher/payment và mở khóa; API không có Promise/reject |
| O09 | PASS U reentrant/controller; NOT_RUN C/M tap | Chặn trước render và sau success; async pending BLOCKED do contract |
| O10 | PASS U controller; NOT_RUN C thao tác | Lỗi trước save rồi retry chỉ tạo một Order trả thành công |
| O11 | PASS U controller; NOT_RUN C navigation thật | Navigate throw giữ ID, retry chỉ mở Tracking |
| O12 | PASS U controller; NOT_RUN C/M | Mọi public mutation bị khóa trong create sync |
| O13 | PASS U controller; NOT_RUN C thao tác | Fresh review; stale món/địa chỉ, voucher dưới ngưỡng bị chặn |
| O14 | PASS I-store status/createdAt/source ID; FAIL I uniqueness | diagnose-order-id: hai ID GF200000; TV4 cần sửa |
| O15 | BLOCKED I/M | I-store bàn giao pass riêng; Tracking/History và auth/TV2 chưa nối |
| Q01 | BLOCKED I/M | DishOptionsScreen placeholder chưa add size/topping/note |
| Q02 | NOT_RUN M | Chưa có build/device chạy; chưa kiểm chứng màn nhỏ/keyboard/long list |
| Q03 | PASS U, C SSR empty; NOT_RUN M | Reset metadata/empty state; chưa thao tác app qua navigation |
| Q04 | PASS C SSR loading/accessibility, U lỗi Order; NOT_RUN C effect/retry | Chưa chạy effect fetch-error/retry hoặc nút thực; không lấy SSR làm bằng chứng interaction |
| Q05 | PASS kiểm tra type/suite | tsc exit0, suite79/79; build blockers và diagnostic FAIL tách riêng |
| Q06 | PASS kiểm tra phạm vi | Review diff/staged/untracked cuối phiên; chỉ allowlist, tài liệu cũ giữ nguyên |
| Q07 | PASS kiểm tra minh chứng | Log thật, matrix theo lớp; blocked/not-run/fail hiển thị riêng |
| Q08 | PASS phần tự động | Rerun serial/reset state + clock mới; không claim randomized order |

## Cách demo và phối hợp tích hợp

Hiện chưa có demo E2E từ UI vì TV2, TV4, TV5 và dependency chung chưa hoàn chỉnh. Không thêm đường dẫn seed/debug/mock-success vào app thật.

1. TV1 sửa dependency build trong phạm vi của TV1; TV5 nối Login/Register/Profile với authStore và cung cấp user.address thật.
2. TV2 import `addToCartWithConfirmation` từ `src/screens/cart/addToCartWithConfirmation.ts`, truyền đúng restaurant/dish/quantity/selectedOptions/note. Dùng try/catch hiển thị lỗi từ store; không hiển thị Alert lần hai và không clear() trước helper.
3. Sau đó mở Cart: kiểm tra món, size/topping, note, tăng/giảm/xóa và thử đổi quán Hủy/Đồng ý.
4. Dữ liệu thật r1-d1: giá45k + sizeL7k + pearl-white8k + pudding10k =70k/phần. Qty2: subtotal140k; ship8k; GIAM15K giảm15k => **133k**.
5. Chọn tiền mặt hoặc ví giả lập và đặt đơn. Controller lấy ID do orderStore trả, clear giỏ sau success; nếu navigation lỗi dùng mở lại, không submit mới.
6. TV4 sửa ID và triển khai Tracking/History để kiểm tra O14/O15/Q01 thực. TV1/TV5 chốt expiry; TV3 bổ sung kiểm tra hạn sau khi contract sẵn có và được phép.

Oracle test độc lập: (30k+5k+7k)×2 +20k =104k; ship15k =>119k; giảm25k =>94k. Không tính expected bằng chính calcPricing.

## Kiểm soát phạm vi

- Chỉ sửa `src/store/cartStore.ts` và `src/screens/cart/**`; test, fixture, log và notes nằm trong cart.
- Không sửa model, navigation, theme, service, auth/order stores, màn thành viên khác, mock chung, README, kế hoạch, hướng dẫn hoặc dependency/config.
- Build/cache nằm trong `node_modules/.cache`, không là source thay đổi.
- Không stage, commit, push, merge, stash, reset hoặc xóa/hoàn tác thay đổi có sẵn.
