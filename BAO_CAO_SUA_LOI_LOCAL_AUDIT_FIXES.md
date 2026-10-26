# Báo cáo sửa lỗi local — `fix/audit-fixes`

Ngày: **26/10/2026, UTC+07**. Tôi là **thành viên 3**; lượt này được cho phép sửa các module liên quan của toàn dự án.

**Kết quả:** đã xử lý bảy tình huống thất bại trong báo cáo tái kiểm tra, bổ sung test hồi quy và chạy được luồng chính trên Chrome với bản web cuối. Bộ test repository hiện có **135/135 test pass, 0 fail, 0 skip, không lỗi nạp file**; typecheck và Expo export web/Android/iOS đều thành công.

**Đánh giá: mức 2 — Có thể demo web trong chế độ Demo với các giới hạn ở mục 5.** Chưa nghiệm thu Firebase thật hoặc app chạy trên Android/iOS; hạn voucher vẫn BLOCKED theo quyết định trước. Bản sửa chỉ ở local, **chưa commit, không push, không PR, không merge hay xuất bản lên remote**.

## 1. Phiên bản nền và trạng thái local

| Nội dung | Kết quả |
| --- | --- |
| Repository | `D:\USTH\Final_Project\GrabFood-like-Client-` |
| Branch làm việc | `fix/audit-fixes`; không tạo/chuyển nhánh hoặc worktree |
| HEAD/commit nền | `d1b58c345b5e5136f6ae81126e43f7c5d1ce10d9` |
| Căn cứ | [Báo cáo tái kiểm tra](BAO_CAO_TAI_KIEM_TRA_AUDIT_FIXES.md), [báo cáo cũ](BAO_CAO_REVIEW_GUI_TRUONG_NHOM.md), README, kế hoạch và tài liệu bàn giao |
| Trước sửa | Tracked working tree sạch; có sẵn 5 tài liệu untracked: hai báo cáo, hướng dẫn TV3, kế hoạch `.docx` và `.md` |
| Quyền áp dụng | Yêu cầu mới cho phép sửa source/test/schema/navigation/dependency cần thiết của toàn dự án; các giới hạn TV3/chỉ review trước đây không còn chặn lượt sửa này |
| Bảo toàn | Không reset/clean/stash/hoàn tác. Không sửa hai báo cáo cũ hay tài liệu cá nhân có sẵn. Không fetch/pull/merge/commit/push trong lượt sửa này |
| Môi trường | Windows, Node `22.21.0`, npm `10.9.4`; package manager npm, lockfile v3 |

Không thấy `AGENTS.md` áp dụng trong repository/các thư mục cha đã kiểm tra. Đã đối chiếu implementation với caller và state thực tế; không chỉ dựa vào mô tả trong báo cáo.

### Baseline đã chạy trước khi sửa

- Diagnostic tái kiểm tra cũ: **34 test, 27 pass / 7 fail**, child exit 1. Đúng bảy lỗi R01, hai nhánh R06 và N01–N04 đã được tái hiện lại.
- Bộ TV3 gốc: **66 test pass, hai file component/integration lỗi nạp** vì thiếu `firebase/auth`, child exit 1. Con số 68 của Node gồm hai lỗi file, không phải 68 test nghiệp vụ đã nạp.
- `node node_modules/typescript/bin/tsc --noEmit`: **exit 2**, năm diagnostic về Firebase/maps và callback `event`. Đây là exit của lệnh `tsc` trực tiếp trong lượt này.
- Artifact baseline ở thư mục tạm ghi tại mục 3; wrapper thu log có thể exit 0 dù child test exit 1. Không dùng exit của wrapper để báo pass.

Sau đó chạy `npm ci --ignore-scripts --no-audit --no-fund`: **exit 0, cài 575 package theo lockfile**. Local đã có đúng Expo `58.0.17`, React `19.3.0`, RN `0.88.0`, TypeScript `6.0.3`, Firebase `12.19.0`, maps `1.29.11`. Không nâng/hạ SDK, không dùng force, không xóa hoặc thay lockfile. `package.json` chỉ thêm script `test`; dependency khai báo giữ nguyên. Không cần thêm `@expo/metro-runtime` vì export trên SDK mục tiêu đã chạy thành công.

## 2. Từng ID: nguyên nhân, cách sửa và test hồi quy

### Đối chiếu R01–R10

| ID | Vấn đề / kết quả sửa | File và bằng chứng hồi quy |
| --- | --- | --- |
| **R01** | **Đã sửa phần lẫn tài khoản.** Checkout truyền `User.id`; tạo đơn bắt buộc owner; History, Tracking và badge dùng cùng bộ lọc owner. `advance` yêu cầu đúng ID đơn và owner. Logout không xóa lịch sử/hồ sơ; đổi tài khoản xóa giỏ phiên cũ. | `types.ts`, `authStore`, `orderStore`, checkout, Tracking/History, RootNavigator. Test actual Checkout → logout → B History 0 → A History 1; legacy order giữ nguyên nhưng không hiện. Browser A → B → A: B không thấy hai đơn A; A vẫn thấy cả hai đơn và hồ sơ. |
| **R02** | **Giữ bản sửa địa chỉ đã đúng**, không viết lại validator. Thêm chặn thiếu account ở controller vì R01; bổ sung hồi quy các sentinel/địa chỉ rỗng. | `checkout.test.cjs`: 7 đầu vào không hợp lệ giữ giỏ và không gọi API. SSR thiếu address vẫn disabled. Chrome: xóa địa chỉ cuối, Checkout disabled, bấm không tạo đơn và giữ giỏ. |
| **R03** | **Giữ thuật toán ID đã sửa ở nhánh nền.** Bổ sung bảo vệ: chỉ lấy bốn field tiền từ `pricing`, tránh field thừa ghi đè ID/snapshot. Store tự clone dữ liệu đơn thay vì phụ thuộc mọi caller tự clone. | `orderStore.ts`, `reorder.test.cjs`, diagnostic ID gốc. 1.000 đơn cùng clock và random có ID riêng; sai owner không advance; đúng owner chỉ đổi một đơn. Test thêm `pricing` có field thừa không được thay ID/quán/items. |
| **R04** | **Giữ nhánh dialog web đã đúng**, bổ sung xử lý lỗi async ở các caller liên quan để không có rejection bỏ quên. | Profile, test callback UI; Chrome ghi nhận confirm Hủy/Đồng ý cho logout và đặt lại cùng quán, xác nhận xóa địa chỉ và thông báo lỗi đăng ký. Native dialog chỉ kiểm tra logic/callback, chưa thao tác thiết bị. |
| **R05** | **Giữ helper/caller TV2 đã được sửa đúng**; không đổi sang clear trước validation. | Bộ cart/confirmation hiện có tiếp tục pass: Hủy, Đồng ý, món mới lỗi, dialog cũ không xóa giỏ đã đổi. E2E chọn món thật qua DishOptions vào Cart thành công. |
| **R06** | **Đã sửa giá cũ và mất giỏ khi lỗi.** Resolve quán/món/options từ API hiện tại, dựng và validate toàn bộ trước khi thay giỏ một lần. Không sửa snapshot cũ, không tạo Order tại thao tác đặt lại, không phục hồi voucher cũ. Luôn xác nhận nếu giỏ có món theo lựa chọn của người dùng. | Helper mới `screens/orders/reorder.ts`, `cartStore.replaceItems`, History. Test giá/ship/topping thay đổi, món/quán/choice mất, giá/quantity sai, API reject, Hủy, đổi giỏ/account khi chờ, khóa checkout. Chrome đặt lại giữ options/note/quantity; giỏ từ 133.000đ của đơn cũ thành **148.000đ** do không phục hồi voucher. |
| **R07** | **Đã đồng bộ nhãn ví Tracking** với chế độ mô phỏng; giữ nhãn auth theo config. Checkout thêm chú thích không thu tiền thật và trạng thái radio rõ ràng. | Tracking/Checkout; SSR và callback test. Chrome dùng wallet có đúng nhãn mô phỏng, cash có nhãn tiền mặt; không có luồng thu tiền thật. |
| **R08** | **Đã sửa setup và expected lỗi thời**, cả hai file trước đây lỗi nạp hiện chạy được. `register` được await và cần login riêng; ID không còn bị ép đúng sáu chữ số; kiểm tra đủ năm voucher. | `components.test.cjs`, `integration.test.cjs`, fixture auth mới. Giữ assertion nghiệp vụ về tiền, snapshot, địa chỉ, enum và nhãn mô phỏng. Test integration dùng API JSON/store thật, SDK/storage auth được mock và ghi rõ. |
| **R09** | **Đã giải quyết blocker môi trường local** bằng cài đúng lockfile. Lỗi style cũ vốn đã được sửa ở baseline, không sửa lại. Typecheck hiện exit 0; export ba nền tảng exit 0. | Không sửa version dependency, lockfile hay tsconfig để làm xanh. Export là bundle, chưa phải APK hay chạy app native. |
| **R10** | **Giữ dữ liệu đã đủ số lượng** ở nhánh nền; không sửa JSON/generator. | Giữ 10 quán / 40 món / 5 voucher. Test integration kiểm tra năm voucher thật; diagnostic giá chạy lại **1.143 tổ hợp hợp lệ** trên menu hiện tại, không phát hiện sai lệch TV2/TV3/oracle. Chưa xác minh mọi URL ảnh. |

### N01–N04 và phần lưu hồ sơ

| ID | Nguyên nhân và bản sửa | Hồi quy đã chạy |
| --- | --- | --- |
| **N01 — Đăng ký thất bại ghi đè hồ sơ** | Bỏ việc ghi profile mặc định trước Firebase create/verification. Chỉ commit dữ liệu local sau khi các bước cần thiết thành công. Demo từ chối đăng ký trùng email; không ghi đè record đang có. | Firebase duplicate-email mock giữ nguyên toàn bộ dữ liệu; verification reject không có partial profile/session; demo duplicate giữ profile. **Browser demo duplicate đăng ký A báo lỗi, record không đổi, phone A vẫn còn.** |
| **N02 — Cached user được coi là phiên Firebase** | Hydrate chờ `auth.authStateReady()`, chỉ lấy user SDK đã verified; cache chỉ chứa hồ sơ. UID legacy khác không được gán lại chỉ vì trùng email. | SDK null, unverified, reload reject, SDK restore đang pending, restore verified đúng UID và legacy UID khác. Các test này dùng SDK mock; chưa gọi Firebase thật. |
| **N03 — Nuốt lỗi persistence, báo lưu thành công** | Session/profile được ghi bằng một record v2. Chỉ cập nhật state hồ sơ sau write thành công; lỗi đọc/ghi/JSON được báo rõ. Hàng đợi write giữ các patch đồng thời không đè mất nhau. Profile/Home/Checkout/Onboarding phản hồi lỗi thay vì catch rỗng hoặc success giả. | Tiêm lỗi write: state và record cũ giữ nguyên, promise reject; retry lưu được. Xóa địa chỉ/lưu Profile lỗi có thông báo, không thông báo thành công. JSON hỏng được giữ nguyên và báo lỗi. Trường hợp Firebase đã signOut nhưng local write fail không giữ user được cấp quyền ở client; UI nêu lỗi lưu trạng thái. |
| **N04 — Kết quả async A về muộn khôi phục A sau login B** | Dùng generation của phiên; kiểm tra trước/sau await và trước commit. Các tác vụ đổi danh tính SDK được xếp hàng để cleanup của A không signOut B. Profile cũ không được ghi session A trở lại. | Deferred updateProfile A → logout → login B → resolve A: reject `session-changed`, B và record không đổi. Có thêm superseded login/register/resend-verification. Khi tự review, nhánh resend thiếu guard sau reload được tái hiện **FAIL trước sửa**, rồi thêm guard và test pass. |

Theo [tài liệu Firebase Auth](https://firebase.google.com/docs/reference/js/auth.auth#authauthstateready), `authStateReady()` chờ trạng thái auth ban đầu được xác định. Bản sửa sử dụng API có trong SDK đã cài và được typecheck; test mock không thay thế kiểm tra session/verification với SDK thật.

### Contract dữ liệu local mới và bảo toàn dữ liệu cũ

- **Owner đơn:** `Order.userId` là `User.id` ổn định. Field optional trong model chỉ để giữ legacy order thiếu owner; `placeOrder` bắt buộc truyền owner. Firebase dùng UID; demo dùng `demo:<email trim/lowercase>`, tránh collision do thay dấu câu thành `_` như trước.
- **Session/profile:** [authPersistence.ts](src/store/authPersistence.ts) dùng `grabfood-auth-v2`, gồm `version`, `profiles` theo `User.id`, và `session: { userId, onboardingComplete }`. Một lần `setItem` ghi cùng record, tránh tách profile/session thành hai write thành công một nửa.
- **Migration:** giữ nguyên `grabfood-auth-v1` và `grabfood-users-db-v1`. Demo khôi phục hồ sơ legacy đúng email; Firebase chỉ nhận hồ sơ đúng UID đã xác minh. Không xóa record cũ sau migration. Trường hợp không xác định được UID vẫn giữ dữ liệu cũ để nhóm kiểm tra, không tự gán cho một account mới.
- **Legacy order:** vẫn giữ trong mảng Orders; thiếu owner không được hiển thị, mở Tracking hoặc đặt lại. Không tự gán toàn bộ cho account hiện tại và không clear lịch sử khi logout. Nếu cần khôi phục quyền xem legacy order, nhóm phải có bằng chứng chủ sở hữu.
- **State lỗi:** lỗi lưu profile không đổi state UI sang dữ liệu chưa lưu. Firebase và storage là hai hệ thống riêng; lỗi sau một bước SDK có thể cần retry/xác minh trạng thái remote. Không tuyên bố có transaction xuyên Firebase/storage hay tự xóa tài khoản Firebase để rollback. Kiểm tra nhánh SDK thật còn ở mục 4.

### Bảy diagnostic thất bại trước đây được kiểm tra lại thế nào?

Đã chuyển bảy tình huống vào test hồi quy trong repository và chạy riêng **7/7 pass, 33 lời gọi assertion, exit 0**: owner Checkout/History, giá hiện tại, giữ giỏ khi menu lỗi, duplicate registration, cached Firebase session, lỗi write profile, late A profile response.

Fixture được cập nhật theo contract UID/v2/async hiện tại; expected về cách ly và bảo toàn dữ liệu giữ nguyên. Với R06, lỗi giá được tiêm vào **menu hiện tại** để kiểm tra nhánh thất bại. `NaN` chỉ nằm ở giá snapshot cũ nay phải được bỏ qua vì đặt lại dùng menu mới; có test riêng chứng minh điều này. Không bắt code đọc lại giá cũ để làm diagnostic cũ xanh.

## 3. Lệnh, kết quả và lớp bằng chứng

Chạy từ repository hiện tại. Không có lint script trong repo; không tắt typecheck hoặc thêm runner/dependency để bỏ qua lỗi.

| Lệnh / kiểm tra | Exit | Kết quả |
| --- | --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund` | 0 | 575 package theo lockfile; version khai báo không đổi |
| `npm ls --depth=0` | 0 | Các dependency root được cài, không còn mismatch đã báo ở baseline |
| `npm run typecheck` | 0 | TypeScript kiểm tra source hiện tại thành công |
| `npm test` lần cuối | 0 | **135 test pass / 0 fail / 0 skip / 0 lỗi nạp** |
| Cùng bộ test, preload đếm assertion chuyển tiếp nguyên `node:assert/strict` | 0 | **135 pass, 528 lời gọi assertion**, không đổi expected hoặc bỏ assertion |
| Bảy regression của audit, lọc theo tên test và preload đếm assertion | 0 | **7 pass, 33 lời gọi assertion**; là tập con của 135, không cộng dồn |
| `node -r ./src/screens/cart/__tests__/register.cjs src/screens/restaurant/calcItemTotalPrice.test.ts` | 0 | 22 kiểm tra/assertion tự viết PASS; không tính thành 22 test Node trong con số 135 |
| `node src/screens/cart/__tests__/diagnose-order-id.cjs` | 0 | Diagnostic ID gốc PASS; đã cập nhật payload owner bắt buộc |
| Diagnostic tạm `pricing-check.cjs` | 0 | **1.143 tổ hợp**, không lệch giữa TV2, TV3 và công thức độc lập; không tính thành 1.143 Node test |
| `node node_modules/expo/bin/cli export --platform all --output-dir <temp>/export-final` với `CI=1` | 0 | Xuất web JS và Android/iOS Hermes bundle thành công; **chưa phải APK/IPA** |
| `git diff --check` | 0 | Không lỗi whitespace trong tracked diff |
| Chrome qua CDP, app web build thật trên loopback | 0 ở các xác nhận kết quả cuối | Luồng và phạm vi dưới đây; không dùng mock SDK/storage ở luồng browser Demo |

Các lượt test trong quá trình sửa có thất bại và đã được xử lý trước kết quả cuối: lỗi setup seed giỏ trước login mới bị clear đúng contract, trạng thái radio web chưa phát `aria-checked`, và field thừa trong `pricing` ghi đè ID. Hai nhánh lỗi bổ sung về logout sau storage fail và resend sau đổi phiên cũng được tái hiện bằng test đỏ trước sửa. Không đổi assertion thành công giả, không skip hay cập nhật snapshot để che lỗi.

Số assertion là số lần gọi API assert, gồm cả precondition fixture; không phải số tình huống độc lập hay coverage. Phân bổ lần cuối: cart 113, checkout 127, component 51, confirmation 17, integration 30, reorder 91, auth 72, callback UI 27. Hai file từng bị chặn nạp nay có assertion thực thi.

### Phân biệt các lớp kiểm tra

- **Unit/controller:** store cart, tiền/voucher, controller, owner selector, auth và reorder có ranh giới SDK/storage/API được kiểm soát để tiêm lỗi. Không gọi Firebase production để chạy test.
- **Component SSR/callback:** dùng React/RN Web hoặc mock hooks/native primitives/navigation; có mock AddressPicker/icon để test đúng ranh giới. Chứng minh render/callback, không coi là native UI E2E.
- **Integration qua module thật:** API JSON, menu, cart, checkout controller, orderStore và snapshot thật. Auth store thật nhưng SDK/storage của test Node được mock và nêu rõ trong tên test.
- **Browser E2E:** Chrome thật chạy bundle xuất từ app, navigation/React UI, API JSON, demo auth và AsyncStorage web thật. Không thay app bằng fixture thành công; không dùng Firebase mock trong luồng browser này. Chế độ Demo là mode sản phẩm đang hiển thị, không phải Firebase integration.

### Browser đã kiểm tra cụ thể

Windows, **Chrome 155.0.8059.85**, headless, viewport **412 × 915**. Browser profile và server local riêng của lượt test; không dùng profile Chrome cá nhân. Server/browser kiểm thử đã đóng sau kiểm tra.

1. Login → Home → lọc `milktea` có ba quán → tìm Phúc Long còn một quán → menu → chọn L, trân châu trắng, pudding, note → thêm món → Cart tăng quantity lên 2.
2. Nhập ` giam15k ` áp được; nhập sai sau đó không bỏ voucher đang áp dụng. `(45.000 + 7.000 + 8.000 + 10.000) × 2 + 8.000 − 15.000 = 133.000đ` ở Checkout và Order. Cash mặc định; chuyển sang wallet mô phỏng được.
3. Bấm submit liên tiếp không làm History có thêm đơn; cart rỗng sau tạo. Tracking/History dùng đúng ID trả về và giữ note/tiền.
4. Timer thật đã được quan sát qua `placed → preparing → delivering → completed`, khoảng cách ghi nhận **5.014 / 5.012 / 5.016 giây** giữa các bước. Luồng cuối trên bundle mới cũng kiểm tra bốn bước qua nút chuyển trạng thái Demo.
5. Đặt lại vào giỏ rỗng giữ quantity/options/note, bỏ voucher cũ, tổng **148.000đ**. Sửa giỏ lên 218.000đ; Hủy đặt lại cùng quán giữ 218.000đ, Đồng ý thay về 148.000đ bằng dialog Chrome thật.
6. A lưu phone và thêm/chọn địa chỉ; logout Hủy ở lại, Đồng ý về Login. B thấy History 0, không có phone A; A login lại vẫn có hai đơn và hồ sơ/sổ địa chỉ. Không xóa dữ liệu A để đạt kết quả đó.
7. Sau sửa địa chỉ Profile, mở đơn đầu vẫn có địa chỉ/note/tổng tiền cũ. Reload trang khôi phục session A, phone và hai địa chỉ bằng browser storage thật. Cart/Order vẫn là in-memory theo phạm vi hiện có, không cam kết qua reload.
8. Xóa địa chỉ cuối qua confirm thật → Checkout có nút disabled và giữ cart 53.000đ. Đăng ký trùng email A ở mode Demo báo lỗi, không đổi record hồ sơ A và vẫn ở màn Register.

Đã chạy lại happy path trên **bundle cuối `index-a01a15825ad495dd643a7da9eac8bed1.js`**: Order `GF32271501633`, tổng 133.000đ, sau History đặt lại có giỏ 148.000đ. Ở bước cuối, `innerWidth` và `documentElement.scrollWidth` đều 412. Không ghi nhận Runtime exception/console.error trong tập sự kiện browser đã thu; không suy từ đó rằng mọi màn/URL ảnh đều không có lỗi.

Trong điều khiển DOM có các probe ban đầu chọn chưa đúng control hoặc bấm khi voucher còn loading; đã điều chỉnh thao tác/chờ UI rồi kiểm tra lại. Đây là lỗi thiết lập/thao tác của diagnostic, không bỏ qua expected nghiệp vụ hoặc sửa source để che failure.

### Artifact local

Thư mục: **`C:\Users\ASUS\AppData\Local\Temp\grabfood-local-fix-gpwIdo`**.

- Baseline: `baseline-typecheck.log`, `baseline-old-suite.log`, `baseline-old-diagnostics.log`.
- Kết quả cuối: `npm-test-final.log`, `final-instrumented.tap/.json`, `seven-audit-regressions.tap/.json`, `pricing-check.log`.
- Build: `export-all-final.log`, `export-final/index.html`, `export-final/metadata.json`, JS/Hermes bundles.
- Browser: `web-e2e-results.json`, `web-e2e-final-bundle.json`, `browser-events.json`, `browser-events-final.json`, `tracking-mobile.png`, `cart-final.png`; harness CDP tạm chỉ chạy local.

Các artifact này **ngoài Git**, không tự đi theo source khi nhóm nhận code. `npm test` và các regression trong repository có thể chạy lại độc lập; browser checklist ở trên là cách nhóm tái hiện nếu không giữ thư mục tạm. Các log giữa quá trình không được dùng thay kết quả cuối.

## 4. Quyết định nghiệp vụ và blocker còn lại

| Nội dung | Trạng thái / quyết định |
| --- | --- |
| Giỏ đã có món khi đặt lại, kể cả cùng quán | **Đã được người dùng chốt:** hỏi xác nhận rồi thay toàn bộ giỏ; không gộp tự động |
| Payment mặc định | **Đã được người dùng chốt:** chọn sẵn tiền mặt; vẫn có thể chọn ví mô phỏng |
| Voucher | Giữ quyết định trước: amount/percent chỉ giảm tối đa subtotal, không ăn vào ship; một mã; trim/case-insensitive; mã sai giữ mã đang áp dụng |
| Hạn voucher V08/V09/V17 | **BLOCKED**, đúng quyết định trước. Chưa có field/timezone/biên hết hạn/record thiếu hạn. Chờ TV1/TV5 và trưởng nhóm chốt contract hoặc giới hạn MVP; không tự thêm schema hay suy hạn từ tên mã |
| Hồ sơ/session sau restart | Có persistence v2; đã kiểm tra unit với storage mock và reload browser thật. Native restart chưa chạy |
| Cart/Order sau restart | Giữ phạm vi hiện có: trong bộ nhớ. Logout/login trong cùng phiên không xóa Orders; reload app/trang thì không cam kết giữ Cart/Orders. Không tự mở rộng sang persistence đơn hoặc backend |
| Firebase thật | **NOT_RUN**: máy không có `.env.local`/phiên test Firebase thật. SDK config/auth được mock ở Node; không gửi email production để test. Cần môi trường test/emulator hoặc tài khoản được nhóm cho phép |
| Android/iOS trên thiết bị | **NOT_RUN**: đã export bundle, chưa build APK/IPA và chưa chạy emulator/device. Dialog, keyboard, lifecycle/background và storage native cần kiểm tra riêng |
| Layout/ảnh/bàn phím | Đã xem và thao tác một số màn ở Chrome viewport 412; chưa kiểm hết kích thước, danh sách dài, mọi URL ảnh hoặc bàn phím di động thật |
| Lỗi API mạng/partial save | API tạo Order hiện đồng bộ trong store. Sync throw/retry/submit lặp đã test; chưa có contract Promise/backend/idempotency server để kiểm tra và không tự bịa thêm |

Thanh toán ngân hàng thật, bản đồ GPS/tài xế thời gian thực và backend đầy đủ vẫn ngoài MVP. Chưa cần mở rộng để nghiệm thu bản sửa local này.

## 5. App đủ bằng chứng demo trên nền tảng nào?

**Mức 2 — Có thể demo bản web ở chế độ Demo trên Chrome đã kiểm tra**, với đúng kịch bản menu → giỏ → voucher → cash/wallet mô phỏng → Tracking/History → đặt lại. Đã có cả unit, integration các module và thao tác browser thật hỗ trợ kết luận này.

Khi trình bày cần nói rõ auth/payment/delivery đang demo, hạn voucher chưa nghiệm thu và History chỉ cam kết trong cùng phiên. Không đổi sang Firebase hoặc Android/iOS rồi dùng kết quả Chrome để tuyên bố đã đạt trên nền tảng đó. Trước buổi demo thật, nhóm nên chạy lại checklist trên đúng máy/bản build sẽ dùng và chuẩn bị video dự phòng theo kế hoạch.

Đây không phải kết luận “hết bug” hoặc “ổn 100%”. Nếu yêu cầu nghiệm thu bao gồm Firebase thật, lưu đơn qua restart hoặc chạy app native, các phần đó vẫn cần công việc/kiểm chứng tương ứng.

## 6. Thay đổi cần người dùng/trưởng nhóm review

Tổng phạm vi code/tài liệu hướng dẫn: **20 file tracked sửa, 7 file source/test mới**, cộng báo cáo này. Các JSON mock chung, generator, dependency version, lockfile, tsconfig và route params không đổi.

| Nhóm file | Lý do cần review |
| --- | --- |
| [authStore.ts](src/store/authStore.ts), **mới** [authPersistence.ts](src/store/authPersistence.ts) | ID ổn định, migration v1 → v2 không xóa dữ liệu, một record session/profile, write queue, generation và SDK identity queue |
| [types.ts](src/models/types.ts), [orderStore.ts](src/store/orderStore.ts) | Owner mới bắt buộc khi tạo; policy legacy; advance theo owner; snapshot clone và bảo vệ field ID trước pricing có thuộc tính thừa |
| [checkout.ts](src/screens/cart/checkout.ts), [CheckoutScreen.tsx](src/screens/cart/CheckoutScreen.tsx), [cartStore.ts](src/store/cartStore.ts) | Review/payload theo UID; địa chỉ lỗi có phản hồi; radio/payment semantics; `replaceItems` validate trước atomic replacement; `clearCart` cũng tuân thủ checkout lock |
| **Mới** [reorder.ts](src/screens/orders/reorder.ts), [OrderHistoryScreen.tsx](src/screens/orders/OrderHistoryScreen.tsx) | Menu/giá/options hiện tại, xác nhận giỏ, state loading/error, stale account/cart và không tạo Order trực tiếp |
| [OrderTrackingScreen.tsx](src/screens/orders/OrderTrackingScreen.tsx), [RootNavigator.tsx](src/navigation/RootNavigator.tsx) | Tracking/badge không đọc đơn account khác; timer callback kiểm tra account hiện tại; nhãn wallet mô phỏng |
| [ProfileScreen.tsx](src/screens/auth/ProfileScreen.tsx), [LoginScreen.tsx](src/screens/auth/LoginScreen.tsx), [OnboardingScreen.tsx](src/screens/auth/OnboardingScreen.tsx), [HomeScreen.tsx](src/screens/home/HomeScreen.tsx), [authErrorMessage.ts](src/services/authErrorMessage.ts) | Hiển thị/catch lỗi lưu, hydrate, xóa địa chỉ và logout; tránh success giả hoặc rejection không được xử lý sau khi sửa contract lỗi |
| Bốn file sửa trong `screens/cart/__tests__/`: `checkout.test.cjs`, `components.test.cjs`, `integration.test.cjs`, `diagnose-order-id.cjs` | Fixture async/UID đúng, assertion theo quyết định đã chốt, giữ và mở rộng kiểm tra nghiệp vụ |
| **Năm file test/helper mới:** `store/__tests__/authFixture.cjs`, `authStore.test.cjs`, `uiHarness.cjs`, `screens.test.cjs`; `screens/orders/__tests__/reorder.test.cjs` | Hồi quy R01/R03/R06/N01–N04, tiêm lỗi và phân biệt lớp mock; không gọi Firebase production |
| [README.md](README.md), [package.json](package.json) | Contract dùng chung và lệnh `npm test`; không đổi dependency |

Review kỹ ba điểm dùng chung trước khi các thành viên tiếp tục sửa: **`User.id` làm owner**, **record auth v2 và policy legacy**, **đặt lại qua menu hiện tại rồi thay giỏ sau xác nhận**. Các tài liệu TV3 ngày 23/10 vẫn là snapshot bàn giao cũ; không lấy các API/định dạng ID/số pass cũ trong đó thay cho contract và kết quả hiện tại.

**Bàn giao:** toàn bộ thay đổi ở working tree local trên `fix/audit-fixes`; HEAD vẫn là commit nền, chưa có commit mới. Hai báo cáo cũ và các tài liệu cá nhân có sẵn được giữ nguyên. Người dùng/trưởng nhóm có thể review diff và chạy lại kiểm tra trước khi tự quyết định bước Git tiếp theo.
