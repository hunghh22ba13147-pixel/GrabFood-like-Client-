# Báo cáo tái kiểm tra nhánh `fix/audit-fixes`

Ngày kiểm tra: **26/10/2026, UTC+07**. Tôi là **thành viên 3**; lượt này kiểm tra **toàn dự án**, theo yêu cầu của nhóm.

**Kết luận: mức 3 — Chưa nên demo vì còn lỗi chặn và thiếu kiểm chứng quan trọng.** Bản sửa đã cải thiện nhiều phần, nhưng đơn của A vẫn hiện khi đăng nhập B; đăng ký thất bại có thể ghi đè hồ sơ đã lưu; luồng đặt lại chưa kiểm tra giá hiện tại. Typecheck và bộ test đầy đủ cũng chưa đạt trên máy kiểm tra. Chi tiết và mức độ bằng chứng ở dưới; không đồng nhất kiểm tra logic với nghiệm thu trên app thật.

## A. Phiên bản và môi trường

| Nội dung | Kết quả xác minh |
| --- | --- |
| Repository | `D:\USTH\Final_Project\GrabFood-like-Client-` |
| Branch thực sự kiểm tra | `fix/audit-fixes` |
| HEAD | `d1b58c345b5e5136f6ae81126e43f7c5d1ce10d9` |
| Remote | Đã chạy `git fetch origin fix/audit-fixes`; `origin/fix/audit-fixes` trùng HEAD. `git rev-list --left-right --count HEAD...origin/fix/audit-fixes` trả `0 0` tại thời điểm đối chiếu |
| Commit nền của báo cáo cũ | `cfdbc96b2adfe31b8305ec3647ce386d355105f3`; có trong repository, dùng trực tiếp để so sánh |
| Diff nền → HEAD | 13 file, 998 dòng thêm / 216 dòng xóa; không có thay đổi file test |
| Working tree ban đầu | Không có thay đổi tracked. Có sẵn 4 file untracked: báo cáo cũ, `CODEX_TV3_CART_CHECKOUT.md`, kế hoạch `.docx` và `.md`; được giữ nguyên |
| Môi trường thực thi kiểm tra | Windows / PowerShell, Node `v22.21.0`; dùng công cụ có sẵn, không cài dependency |
| Auth | Không có `.env.local` trên máy kiểm tra. Kiểm tra auth dùng implementation thật với AsyncStorage trong bộ nhớ và Firebase SDK/config giả lập tại ranh giới; không kết nối Firebase thật |
| Nền tảng demo | Chưa có nền tảng được nghiệm thu trong lượt này. SSR dùng React/RN Web local; không phải thao tác browser/device |

Đã đọc báo cáo cũ, README, kế hoạch dự án, tài liệu TV2/TV3, ghi chú bàn giao và cấu hình Firebase; tìm `AGENTS.md` trong repository và các thư mục cha áp dụng nhưng không thấy. Lượt review toàn dự án này theo yêu cầu mới, không chỉ giới hạn TV3. Tài liệu kế hoạch mô tả ý tưởng schema; contract thực tế được đối chiếu với `src/models/types.ts`, API, store và caller.

Đã kiểm tra implementation và các điểm nối auth/Splash/Profile, Home/Search/API, menu/tùy chọn món, cart/voucher/checkout, Order/Tracking/History, navigation và cấu hình. Đây là review source kết hợp kiểm tra thực thi có giới hạn, không phải xác nhận đã thao tác toàn bộ màn hình.

**Giới hạn môi trường còn nguyên:** có 15 dependency thiếu hoặc không thỏa khai báo. Ví dụ:

| Dependency | Local | Khai báo của repository |
| --- | --- | --- |
| Expo | `53.0.27` | `~58.0.17` |
| React | `19.0.0` | `19.3.0` |
| React Native | `0.79.6` | `0.88.0` |
| TypeScript | `5.8.3` | `~6.0.3` |
| Firebase, react-native-maps, expo-asset | Thiếu | Có khai báo |

Không suy ra rằng các version khai báo không tồn tại hoặc máy các bạn chắc chắn không build được. Cần đồng bộ đúng lockfile trên môi trường được phép rồi kiểm tra lại. Không dùng Expo CLI 53 đang cài để tuyên bố đã kiểm tra build mục tiêu SDK 58.

**Bảo toàn repository:** không pull/merge/reset/chuyển nhánh, không commit/push, không sửa source/test/dependency/config hay ghi đè báo cáo cũ. Diagnostic bổ sung nằm ngoài source, trong thư mục tạm. File bàn giao mới duy nhất của lượt này là báo cáo này.

## B. Đối chiếu từng vấn đề cũ

ID và tên trong bảng dưới giữ theo bảng giao việc của `BAO_CAO_REVIEW_GUI_TRUONG_NHOM.md`. “Đã sửa” chỉ áp dụng ở lớp bằng chứng được ghi, không có nghĩa E2E đã pass.

| ID | Tên vấn đề cũ | Trạng thái tái kiểm tra |
| --- | --- | --- |
| R01 | Logout mất sổ địa chỉ; đổi tài khoản còn giỏ/đơn của tài khoản trước | **Sửa một phần — còn P0 về đơn lẫn tài khoản** |
| R02 | Chưa có địa chỉ hợp lệ vẫn tạo được Order | **Đã sửa ở logic/controller và render tĩnh** |
| R03 | ID đơn trùng làm cập nhật nhầm nhiều Order | **Đã sửa lỗi tái hiện cũ trong phiên chạy** |
| R04 | Alert native không thực hiện các xác nhận trên web | **Đã sửa các nhánh web được kiểm tra bằng handler; chưa nghiệm thu browser thật** |
| R05 | TV2 clear giỏ trước validation món mới, không catch lỗi thêm món | **Đã sửa ở caller/helper; các kiểm tra logic liên quan pass** |
| R06 | Thiếu chức năng đặt lại đơn trong phần đã giao | **Sửa một phần — đã có chức năng, còn lỗi giá và an toàn giỏ** |
| R07 | Nhãn thanh toán/auth mô tả dịch vụ thật khi đang giả lập | **Đã sửa các vị trí cũ; còn nhãn ví ở Tracking chưa thống nhất** |
| R08 | Test tích hợp còn dùng contract auth cũ | **Còn lỗi — test không được cập nhật** |
| R09 | Dependency local chưa đồng bộ, typecheck chưa pass | **Sửa một phần — lỗi style đã hết; môi trường/typecheck vẫn bị chặn** |
| R10 | Khối lượng dữ liệu thấp hơn mục tiêu trong kế hoạch | **Đã sửa số lượng và kiểm tra dữ liệu logic; ảnh thật chưa nghiệm thu** |

### R01 — Hồ sơ và giỏ được cải thiện, đơn vẫn lẫn tài khoản

**Thay đổi:** `authStore.saveUserToDb/login/hydrate/logout` thêm kho hồ sơ theo email; `logout` gọi `cartStore.clearCart`. `orderStore` nhận `userId?`, `OrderHistoryScreen` thêm lọc theo tài khoản.

**Kết quả:** implementation auth thật với storage giả lập đã pass kịch bản A lưu tên/điện thoại/địa chỉ/sổ địa chỉ → logout → login B → logout → login A. Dữ liệu A được khôi phục; giỏ được xóa khi logout. Khởi tạo lại auth store với cùng storage rồi hydrate ở demo mode cũng khôi phục hồ sơ.

**Còn lỗi P0, đã tái hiện:** A tạo đơn bằng **checkout controller + orderStore thật** → logout → login B → render handler History: danh sách B vẫn có **1 đơn của A**, mong đợi 0.

- [checkout.ts:72](src/screens/cart/checkout.ts#L72) không truyền chủ sở hữu vào `placeOrder`.
- [orderStore.ts:14](src/store/orderStore.ts#L14) chỉ nhận `userId` tùy chọn; [models/types.ts](src/models/types.ts) chưa có field này trong `Order`.
- [OrderHistoryScreen.tsx:22](src/screens/orders/OrderHistoryScreen.tsx#L22) cho mọi tài khoản thấy đơn thiếu `userId`; nhánh còn lại so với **email**, chưa có contract nhất quán về ID chủ đơn.
- Đối chứng: đơn được gắn email A rõ ràng bị ẩn với B. Như vậy chỉ thêm bộ lọc chưa sửa được luồng tạo đơn thực tế.

**Cần sửa:** TV1/TV3/TV4/TV5 thống nhất khóa chủ sở hữu ổn định, truyền và kiểm tra xuyên suốt lúc tạo/đọc/Tracking/History; quy định xử lý đơn cũ thiếu owner. Có thể dùng UID theo contract thống nhất. Không chỉ sửa fixture hoặc ẩn đơn trong một màn. Kiểm tra lại cả badge và đường mở Tracking. Các lỗi auth mới ở C cũng ảnh hưởng tính an toàn khi đổi tài khoản.

### R02 — Chặn địa chỉ thiếu/placeholder

**Thay đổi:** [checkout.ts:10](src/screens/cart/checkout.ts#L10) thêm `isValidAddress`; controller dùng cùng điều kiện trước API. `CheckoutScreen` bỏ fallback địa chỉ khi `user=null`, hiển thị cảnh báo và vô hiệu hóa nút đặt.

**Đã chạy:** 7 đầu vào thiếu/không hợp lệ gồm `null`, `undefined`, rỗng, khoảng trắng, các biến thể placeholder có dấu/không dấu; không tạo Order, giữ giỏ, không điều hướng. Địa chỉ bình thường tạo đúng một đơn. Handler xóa địa chỉ cuối đưa địa chỉ về sentinel và bị validator từ chối.

SSR bổ sung có 3 scenario: thiếu user, sentinel, địa chỉ hợp lệ. Nút đặt lần lượt disabled / disabled / enabled; cùng tổng 133.000đ. **3/3 scenario, 12 assertion pass.** Đây là render tĩnh với auth/navigation/AddressPicker được mock, chưa chứng minh thao tác chọn địa chỉ trên app. Cũng không phải kiểm tra địa chỉ tồn tại ngoài thực tế, điều không bắt buộc trong MVP.

### R03 — ID và cập nhật đúng một đơn

**Thay đổi:** [orderStore.ts:20](src/store/orderStore.ts#L20) thêm bộ đếm trong phiên và phần random vào ID.

**Đã chạy:** diagnostic gốc tạo hai đơn cùng clock đã **PASS, exit 0**. Diagnostic bổ sung tạo **1.000 đơn tại cùng millisecond và cố định cả random**, có 1.000 ID khác nhau; `advance(id)` chỉ đổi một đơn. Luồng Tracking dùng ID do API trả về cũng được smoke ở D.

Đủ bằng chứng lỗi cũ với hai đơn liên tiếp đã được xử lý trong store hiện tại. Chưa có bảo đảm ID toàn cục giữa nhiều thiết bị/phiên hoặc hệ thống backend; MVP hiện là store trong bộ nhớ, không nâng yêu cầu thành backend phân tán.

### R04 — Xác nhận trên web

**Thay đổi:** Login/Register/Profile rẽ nhánh `Platform.OS === 'web'` sang `globalThis.alert/confirm`; DishOptions gọi helper xác nhận đã có nhánh web. Native giữ `Alert.alert`.

**Đã chạy handler thật với UI/hooks/navigation/dialog mock:** logout Hủy/Đồng ý, xóa địa chỉ Hủy/Đồng ý, thông báo đăng ký demo, xác nhận đổi quán Hủy/Đồng ý. Hủy giữ state; Đồng ý thay đổi tương ứng; các handler web đó không gọi native Alert.

**Giới hạn:** chưa có click thực trên browser, chưa kiểm chứng dialog dưới cấu hình trình duyệt demo, chưa thao tác Android/iOS. TV1 cùng TV2/TV5 cần chạy checklist này trên đúng nền tảng; không lấy mock `confirm` làm bằng chứng browser E2E.

### R05 — Thêm món quán mới không phá giỏ khi validation lỗi

**Thay đổi:** `DishOptionsScreen` gọi `addToCartWithConfirmation` trong `try/catch`; chỉ quay lại/toast khi helper trả thành công, không tự clear giỏ trước. Helper validate trước dialog rồi dùng `replaceCart` để cập nhật giỏ hợp lệ trong một lần.

**Đã chạy:** món quán mới có giá `NaN` bị từ chối trước khi hỏi xác nhận, giỏ cũ không đổi; Hủy giữ giỏ; Đồng ý thay quán; dialog mở với giỏ cũ không được xóa giỏ đã thay đổi trong lúc chờ. Bộ confirmation/cart gốc cũng pass. Caller được đọc để xác minh catch và thông báo lỗi; chưa bấm trực tiếp DishOptions trên app.

### R06 — Có đặt lại, nhưng chưa hoàn chỉnh

**Thay đổi:** [OrderHistoryScreen.tsx:31](src/screens/orders/OrderHistoryScreen.tsx#L31) thêm handler/nút “Đặt lại đơn” cho đơn hoàn thành, xác nhận khi quán của giỏ hiện tại khác quán của đơn cũ.

**Pass ở handler + store thật:** đặt lại vào giỏ rỗng giữ quantity/options/note và điều hướng Cart; khác quán Hủy giữ giỏ, Đồng ý thay giỏ.

**Hai diagnostic thất bại, cần TV4 phối hợp TV2/TV3:**

1. **Không lấy giá/menu hiện tại — P1.** Tạo đơn hoàn thành từ món thật giá 45.000đ; đổi giá món trong nguồn menu trong bộ nhớ thành 55.000đ để mô phỏng cập nhật menu; đặt lại vẫn dùng **45.000đ**. Handler truyền `ci.dish` của snapshot cũ ở dòng 40 và không đọc API/menu hiện tại. Mong đợi resolve món và lựa chọn theo ID hiện tại, tính lại giá, báo món/lựa chọn không còn hợp lệ trước khi thay giỏ. Không sửa snapshot lịch sử để đạt mục tiêu đó.
2. **Clear trước validation, không rollback — P2 với đầu vào lỗi được tiêm.** Có giỏ quán B; tiêm giá không hợp lệ vào món của đơn cũ; Đồng ý đặt lại quán A. [Dòng 36–37](src/screens/orders/OrderHistoryScreen.tsx#L36) xóa giỏ rồi mới thêm từng món; validation throw, giỏ B đã mất. Mong đợi dựng/validate toàn bộ giỏ mới trước, chỉ thay sau thành công và hiển thị lỗi có kiểm soát. Chưa thấy Checkout bình thường sinh snapshot lỗi như đầu vào này; đây là kiểm tra nhánh thất bại, không phải lỗi đã quan sát từ dữ liệu mẫu bình thường.

Hai lỗi thuộc chính phần đặt lại mới, được ghi ở R06 để tránh lặp nguyên nhân ở C. Giá/menu thay đổi và dữ liệu lỗi chỉ được tiêm **trong bộ nhớ diagnostic**, không sửa JSON/source.

**Cần chốt thêm:** cùng quán hiện thay toàn bộ giỏ mà không hỏi; nhóm cần xác nhận chính sách thay hay gộp. Chưa gán FAIL nghiệp vụ chỉ vì chưa có quyết định đó.

### R07 — Nhãn mô phỏng/auth

**Đã sửa các vị trí cũ:** Checkout ghi “Ví điện tử GrabPay / Thẻ (Mô phỏng)”; Register demo không còn hứa Firebase gửi thư; Profile hiển thị demo/online theo config. Handler kiểm tra thông báo demo và hai nhãn Profile pass; SSR xác nhận nhãn ví Checkout. Firebase gửi thư thật chưa chạy.

**Còn điểm chưa thống nhất:** [OrderTrackingScreen.tsx:184](src/screens/orders/OrderTrackingScreen.tsx#L184) vẫn ghi “💳 Ví điện tử GrabPay”. Diagnostic render cây component thật với đơn `wallet` cho đúng chuỗi này và không có chú thích mô phỏng/không thu tiền thật trong màn. Đây là điểm phát hiện thêm ở màn liên quan của cùng vấn đề R07, mức **P2 về câu chữ**; TV4 nên đồng bộ nhãn để tránh giải thích sai khi demo. Không cần tích hợp thanh toán thật.

### R08 — Test vẫn chưa theo contract hiện tại

**Diff không có thay đổi test.** Lệnh chạy bộ TV3 gốc dừng nạp ở `components.test.cjs` và `integration.test.cjs` vì thiếu `firebase/auth`; các assertion trong hai file đó không được chạy ở lượt chuẩn.

Để tách lỗi môi trường khỏi lỗi test, đã chạy **bản test gốc không sửa assertion**, dùng preload tạm mock Firebase/AsyncStorage và các ranh giới UI cần thiết:

- Integration nạp được **2 test: 0 pass / 2 fail, 5 lời gọi assertion**. Case bàn giao Order gọi `register` không `await`, không login theo contract mới rồi đọc `user.address`, gây TypeError vì user null. Case voucher vẫn mong **3** trong khi dữ liệu hiện có **5**. Assertion ID theo định dạng `GF` + đúng 6 chữ số cũng còn trong source nhưng case đầu dừng trước khi tới đó.
- Component nạp được **11 test: 9 pass / 2 fail, 45 lời gọi assertion**. Hai điểm dừng là chuỗi ví cũ “Ví điện tử (giả lập)” và nút “Cập nhật địa chỉ”; UI mới dùng “Mô phỏng” và “Chọn địa chỉ”. **Đây là assertion literal lỗi thời, không phải bằng chứng UI vừa mất nhãn mô phỏng hay thiếu chặn địa chỉ.** SSR semantic bổ sung đã kiểm tra hai hành vi đó.

TV3/TV5 cần sửa setup đúng async/register/login, mock auth ở test phù hợp, cập nhật dữ liệu/ID và assertion theo contract đã chốt. Giữ kiểm tra nghiệp vụ; không xóa assertion hoặc coi preload mock là integration Firebase thật. Checkout đang mặc định tiền mặt trong khi test cũ có assertion chưa chọn payment; cần chốt quyết định này trước khi thay expected, không tự báo một phía là đúng.

### R09 — Style đã sửa, chưa xác minh được build mục tiêu

**Thay đổi:** `DishOptionsScreen` bỏ spread `StyleSheet.absoluteFill`, dùng các thuộc tính position/edge trực tiếp. Lỗi **TS2698 cũ không còn** trong lần typecheck mới.

`npm run typecheck` vẫn **exit 1**, có **5 diagnostic**:

- `AddressPicker.tsx`: không tìm thấy `react-native-maps`; callback `event` implicit any.
- `services/firebase.ts`: không tìm thấy `firebase/app` và `firebase/auth`.
- `store/authStore.ts`: không tìm thấy `firebase/auth`.

Dependency/package/lock không được sửa trong diff audit-fixes và không được tôi cài lại. Chưa kết luận implicit any còn tồn tại sau khi có đúng map types. Export/build SDK mục tiêu **BLOCKED/NOT_RUN**; không tái sử dụng log export SDK53 từ bàn giao TV3 làm kết quả lượt này. TV1 cần chạy trên môi trường đồng bộ lockfile, rồi cung cấp typecheck/build mới và kiểm tra app trên nền tảng sẽ demo.

### R10 — Đủ khối lượng dữ liệu theo kế hoạch

**Thay đổi:** `scripts/gen-data.js`, `src/data/dishes.json`, `src/data/vouchers.json`. Hiện có **10 quán / 40 món / 5 voucher**, cùng 4 danh mục. Diagnostic kiểm tra ID quán/món/voucher không trùng, liên kết món → quán hợp lệ, cấu hình mặc định tính được giá và 5 voucher hợp lệ theo validator thật.

Kiểm tra bổ sung **1.143 tổ hợp hợp lệ** của size/topping/quantity 1–3 trên 40 món: TV2 và TV3 khớp công thức độc lập, không phát hiện sai lệch. Không chạy generator vì sẽ ghi lại dữ liệu source. Chưa kiểm tra ảnh tải thật, 404 hay hình ảnh/layout trên thiết bị.

### Hạn voucher — vẫn BLOCKED theo quyết định đã có

`Voucher` và dữ liệu vẫn chưa có field/semantics hạn dùng; diff chưa giải quyết phần này. Quyết định trước của TV3 là để **V08/V09/V17 BLOCKED**, chờ TV1/TV5 chốt. Không suy hạn hoặc điều kiện khách mới từ tên mã.

Cần thống nhất tên field, kiểu/đơn vị timestamp, timezone, biên đúng thời điểm hết hạn, record thiếu hạn và việc kiểm tra lại lúc đặt đơn; hoặc trưởng nhóm chấp nhận rõ giới hạn MVP. Kiểm tra voucher khi subtotal giảm dưới ngưỡng đã có và pass ở logic; không thay thế được kiểm tra hết hạn. Phần hạn dùng chưa được tính PASS và không bị tự mở rộng schema trong review này.

## C. Lỗi mới hoặc hồi quy

Các mục dưới không lặp lại lỗi owner của R01 hay hai lỗi đặt lại của R06. Bằng chứng auth là **store thật với SDK/storage được kiểm soát**, không phải giao dịch Firebase thật.

### N01 — P0: Đăng ký thất bại ghi đè hồ sơ đã lưu

**Vị trí:** [authStore.ts:182](src/store/authStore.ts#L182), đặc biệt `saveUserToDb(newUser)` tại dòng 199, trước `createUserWithEmailAndPassword` tại dòng 211. **Hồi quy mới** do thêm kho hồ sơ và lưu trước kết quả đăng ký.

**Tái hiện:** có hồ sơ A đã lưu số điện thoại và địa chỉ riêng → gọi đăng ký lại email A với tên khác → Firebase SDK mock trả `auth/email-already-in-use` → đọc kho hồ sơ A. Hàm có reject như mong đợi, nhưng hồ sơ cũ đã bị ghi đè: tên mới, phone rỗng, địa chỉ/sổ địa chỉ mặc định. Diagnostic mong giữ nguyên hồ sơ **FAIL**.

**Tác động:** thao tác không thành công vẫn mất dữ liệu local của tài khoản có sẵn; lần login sau đọc hồ sơ đã bị thay. Điểm lưu nằm trước cả nhánh demo/Firebase, nên demo cũng có đường ghi đè khi đăng ký lại email cũ theo source; kịch bản reject được chạy ở nhánh configured với SDK mock.

**Hướng sửa tối thiểu — TV5:** chỉ ghi hồ sơ mới sau khi bước đăng ký cần thiết thành công; không ghi đè hồ sơ email có sẵn khi thất bại. Chốt xử lý trùng email trong demo và các lỗi sau khi Firebase đã tạo user. Bổ sung kiểm tra trước/sau lỗi, không chỉ kiểm tra promise có reject.

### N02 — P1: Firebase hydrate chấp nhận cached user khi SDK không có phiên

**Vị trí:** [authStore.ts:92](src/store/authStore.ts#L92), set cached user tại dòng 103; chỉ xử lý xác minh khi `auth.currentUser` truthy tại dòng 107. [SplashScreen.tsx:16](src/screens/auth/SplashScreen.tsx#L16) chọn Tabs dựa vào user. **Hồi quy mới** so với baseline vốn khởi tạo user null ở hydrate.

**Tái hiện:** bật configured trong mock boundary; storage có user A/onboarding true; SDK `currentUser=null` → `await hydrate()`. State vẫn là A và hydrated true; assertion mong chưa có user đăng nhập **FAIL**. Theo routing source, Splash sẽ chọn Tabs.

**Mong đợi/hướng sửa — TV5:** tách hồ sơ cache khỏi trạng thái đã xác thực; chờ Firebase khôi phục/xác định auth state, chỉ cấp phiên app theo user đã xác minh. Nếu nhóm muốn offline session, phải có chính sách rõ thay vì mặc định xem cache là phiên Firebase hợp lệ. Không kết luận lỗi này vượt được Firebase backend rules; bằng chứng ở state/điều hướng client, chưa chạy SDK thật.

### N03 — P1: Lỗi lưu storage bị nuốt, UI có thể báo lưu thành công

**Vị trí:** `authStore.saveUserToDb` dòng 52 và `save` dòng 63 bắt lỗi rồi bỏ qua; `updateProfile` set state và await các hàm đó. [ProfileScreen.tsx:38](src/screens/auth/ProfileScreen.tsx#L38) báo thành công sau khi hàm resolve. **Hồi quy mới**: lỗi ghi session trước đây được truyền ra caller.

**Tái hiện có tiêm lỗi:** cho cả hai `AsyncStorage.setItem` của session và kho hồ sơ reject → gọi `updateProfile({phone: ...})`. Promise vẫn resolve, assertion yêu cầu phản hồi thất bại **FAIL**; storage không có thay đổi tương ứng. Đây là nhánh lỗi được tiêm, không phải quan sát ổ đĩa máy đang hỏng.

**Tác động/hướng sửa — TV5:** người dùng thấy thông tin đã lưu nhưng mở lại mất thay đổi; lỗi ghi logout cũng bị che. Truyền lỗi hoặc trả trạng thái lưu chưa thành công cho UI; định nghĩa rõ state tạm/rollback hoặc retry. Không bắt mọi lỗi rồi bỏ qua để làm giao diện báo thành công.

### N04 — P1: Kết quả lưu Profile của A về muộn khôi phục A sau khi đã login B

**Vị trí:** [authStore.ts:236](src/store/authStore.ts#L236): chụp `current/baseUser` trước await Firebase ở dòng 247, rồi `set(next)` không kiểm tra phiên ở dòng 250. Profile chỉ disable nút lưu theo `saving`; nút logout vẫn bấm được.

**Tái hiện:** login A → lưu đổi tên, giữ SDK updateProfile ở trạng thái pending → logout A → login B → cho SDK update của A resolve. Trước resolve là B; sau resolve thành A. Diagnostic mong vẫn B **FAIL**.

**Nguồn gốc:** vấn đề mới được phát hiện trong lượt này, nhưng cách chụp state rồi await/set đã tồn tại ở baseline; không quy kết nhánh audit-fixes tạo ra lỗi gốc này. Kho lưu hồ sơ mới làm kết quả cũ tiếp tục được ghi vào storage.

**Hướng sửa tối thiểu — TV5:** dùng định danh/generation của phiên để bỏ kết quả cũ sau logout/đổi tài khoản và không ghi session cũ trở lại; quản lý trạng thái thao tác ở UI. Kiểm tra cùng mẫu cho các tác vụ auth đang chờ. Không chỉ dựa vào disable một nút trong một màn.

## D. Kiểm tra đã chạy và giới hạn bằng chứng

### Lệnh và kết quả

Các lệnh repository chạy từ thư mục gốc. Không có script `test`/`lint` trong package; test dùng Node và loader TypeScript sẵn có. Không cài runner mới.

| Kiểm tra / lệnh | Exit | Kết quả thật / lớp bằng chứng |
| --- | --- | --- |
| `git fetch origin fix/audit-fixes` và đối chiếu HEAD/remote | 0 | HEAD trùng remote tại lúc fetch; không pull/merge |
| `git diff --stat cfdbc96b2adfe31b8305ec3647ce386d355105f3 HEAD` | 0 | 13 file; đã đọc implementation/caller liên quan, không coi commit message là nghiệm thu |
| `npm run typecheck` | **1** | 5 diagnostic, chi tiết R09; chưa pass |
| `node --test --test-reporter=spec src/screens/cart/__tests__/*.test.cjs` | **1** | **66 test pass + 2 lỗi nạp file**; Node tổng hợp 68 mục, không phải 68 test nghiệp vụ đã nạp thành công |
| Chạy lại nguyên bộ test trên qua preload đếm assertion, reporter TAP | **1 (child)** | 218 lời gọi assertion: cart 113, checkout 88, confirmation 17; component/integration 0 vì lỗi nạp; 0 skipped |
| `node -r ./src/screens/cart/__tests__/register.cjs src/screens/restaurant/calcItemTotalPrice.test.ts` | 0 | 22 kiểm tra/assertion tự viết PASS; không phải 22 test của Node test runner |
| `node src/screens/cart/__tests__/diagnose-order-id.cjs` | 0 | PASS diagnostic hai ID khác nhau; kiểm tra bằng điều kiện và exit code, không có số Node assertion để cộng |
| Diagnostic tạm `diagnostics.test.cjs`, implementation thật + boundary mocks | **1 (child)** | **34 test: 27 pass / 7 fail / 0 skip; 203 lời gọi assertion**, không lỗi nạp |
| Test integration gốc với preload auth/storage mock | **1 (child)** | 2 test nạp được: 0 pass / 2 fail, 5 lời gọi assertion; không phải integration Firebase |
| Test component gốc với preload boundary mock bổ sung | **1 (child)** | 11 test nạp được: 9 pass / 2 fail, 45 lời gọi assertion; SSR, không tương tác thật |
| Diagnostic `checkout-ssr.cjs` | 0 | 3 scenario / 12 assertion pass: user thiếu, sentinel, địa chỉ hợp lệ; số tiền và nhãn ví đúng |
| Diagnostic `regression-smoke.cjs` | 0 | 1.143 tổ hợp giá không lệch; một luồng qua API/store/controller thật với hooks/timer/navigation được kiểm soát, chi tiết dưới |
| Diagnostic nhãn Tracking | 0 (lệnh thu thập) | Quan sát component thật trả nhãn GrabPay không kèm mô phỏng; là phát hiện R07, không gọi exit 0 này là nghiệm thu nhãn PASS |
| Export/build mục tiêu và E2E | **BLOCKED / NOT_RUN** | Dependency local không khớp target; chưa có bản app mục tiêu được kiểm tra, không cài/chỉnh môi trường trong lượt review |

**Bảy test diagnostic FAIL** tương ứng: R01 lẫn đơn, R06 giá cũ, R06 mất giỏ khi dữ liệu lỗi, N01 ghi đè hồ sơ khi đăng ký thất bại, N02 cached auth, N03 nuốt lỗi lưu, N04 kết quả Profile cũ. Expected là hành vi an toàn; không đảo assertion để biến lỗi thành pass.

Số “lời gọi assertion” được đếm bằng wrapper chuyển tiếp nguyên `node:assert/strict`, không sửa assertion/expected. Có cả assertion điều kiện chuẩn bị fixture; test thất bại dừng ở assertion đầu tiên. Không coi số này là số tình huống độc lập hoặc tỷ lệ coverage. Các lượt chạy trùng bộ test không cộng lại thành tổng số test duy nhất. Bộ thiết kế 63 case TV3 và log 79 pass ngày 23/10 trong tài liệu bàn giao không phải kết quả của commit đang review.

### Luồng hồi quy thực sự đã chạy

API JSON thật: tìm “Phúc Long” trả `r1`; lọc `milktea` trả 3 quán → đọc món thật `r1-d1` → helper thêm quantity 2, size L, trân châu trắng + pudding, note → áp `GIAM15K` → checkout controller tạo Order qua orderStore thật → mở Tracking bằng ID trả về → History hoàn thành.

Giá kiểm tra: `(45.000 + 7.000 + 8.000 + 10.000) × 2 = 140.000`; ship 8.000, giảm 15.000, **thanh toán 133.000đ**. Note giữ đúng, cart rỗng sau thành công, snapshot không đổi khi sửa giỏ/nguồn món cũ trong bộ nhớ. Luồng này cũng xác nhận đơn tạo ra **thiếu owner**, đúng nguyên nhân R01.

Effect Tracking thật được gọi bằng hooks và timer điều khiển: chu kỳ khai báo 5.000ms; kích callback qua `placed → preparing → delivering → completed`; cleanup khi unmount, mở lại tiếp tục đọc đúng đơn, cleanup ở hoàn thành; History có 1 đơn hoàn thành. Đây là **integration các module trong tiến trình diagnostic**; timer không chờ thời gian thực, navigation được ghi nhận bằng spy, không có thao tác app E2E. Chưa xác minh trường hợp chỉ blur mà vẫn mounted hoặc app chạy nền.

Bộ unit/controller gốc đã chạy các ranh giới gộp/tách options/note, tăng/giảm/xóa dòng cuối, subtotal/ship/voucher, voucher xuống dưới ngưỡng, snapshot, sync throw giữ giỏ và retry, submit lặp/reentrant, review cũ, navigation lỗi rồi mở lại đơn cũ. Những case dùng `placeOrder` mock chỉ chứng minh controller; diagnostic smoke mới dùng orderStore thật. API hiện đồng bộ trả `Order`, không phải API mạng/Promise; không tuyên bố đã kiểm chứng timeout/reject/idempotency backend.

**Khoảng trống của test hiện có:** case O12 mang tên “every public cart mutation” liệt kê API cũ và chưa thử `clearCart` mới; không được suy từ tên case rằng mọi mutation mới đều khóa khi checkout. Hai file không nạp có 0 assertion trong lượt chuẩn. Các probe với preload chỉ làm rõ bất tương thích, không thay thế bộ test sản phẩm được sửa đúng và chạy trên dependency mục tiêu.

### Chưa chạy / cần quyết định

| Nội dung | Trạng thái, lý do và điều kiện kiểm tra tiếp |
| --- | --- |
| Build/export web, Android đúng SDK mục tiêu | **BLOCKED**: đồng bộ dependency/lockfile trên môi trường được phép; chạy typecheck và export/build lại, lưu log mới |
| Luồng đầy đủ bằng thao tác trên browser/device | **NOT_RUN**: cần bản app và nền tảng demo cụ thể; chạy từ Login qua Home/menu/Cart/Voucher/Checkout/Tracking/History/reorder, gồm nhánh Hủy/lỗi |
| Firebase login/register/verification/logout và khôi phục phiên thật | **NOT_RUN**: chưa cấu hình/chạy SDK thật; cần tài khoản test, cấu hình và trạng thái phiên phù hợp. Không dùng kết quả SDK mock làm bằng chứng gửi email |
| Storage trên thiết bị, force-close/reopen thật | **NOT_RUN**: persistence hồ sơ mới kiểm tra bằng storage trong bộ nhớ qua khởi tạo lại store; cần thử app restart thực và lỗi lưu trên nền tảng |
| Cart/Order tồn tại sau restart | Source hiện dùng store trong bộ nhớ, không có persistence; cần nhóm xác nhận mức cam kết. Không tự tính đây là lỗi backend hoặc tự thêm persistence; History trong cùng phiên đã smoke |
| Voucher hết hạn và đổi thời gian giữa xem/đặt | **BLOCKED V08/V09/V17**: thiếu contract đã nêu ở B |
| Màn nhỏ, danh sách dài, bàn phím nhập voucher, scroll/touch, ảnh tải thật | **NOT_RUN trên UI**: SSR không đo layout, keyboard hay mạng ảnh; kiểm tra trên màn/thiết bị demo |
| Chọn mặc định tiền mặt; đặt lại cùng quán thay hay gộp | Cần trưởng nhóm xác nhận nghiệp vụ rồi giữ assertion phù hợp; không dùng test cũ làm quyết định thay nhóm |

### Log và cách chạy lại diagnostic cục bộ

Artifact tạm ở **`C:\Users\ASUS\AppData\Local\Temp\grabfood-audit-d1b58c3-eypQUu`**, ngoài repository. Có script diagnostic/preload, các file `product-tests`, `recheck-diagnostics`, `original-integration-with-mocked-auth`, `original-components-with-extra-boundary-mocks` dạng `.tap`/`.json`; thêm `checkout-ssr.cjs.log`, `regression-smoke.cjs.log`, `tracking-label.json`. Các artifact này không tự đi theo Git; cần gửi riêng nếu nhóm muốn giữ bằng chứng hoặc chuyển các scenario thành test chính thức.

Chạy lại tại repository trên **máy hiện tại**, trước khi thư mục tạm bị dọn:

```powershell
$auditDir = Join-Path $env:TEMP 'grabfood-audit-d1b58c3-eypQUu'
node (Join-Path $auditDir 'run-checks.cjs') product
node (Join-Path $auditDir 'run-checks.cjs') diagnostics
node (Join-Path $auditDir 'run-checks.cjs') probes
node (Join-Path $auditDir 'checkout-ssr.cjs')
node (Join-Path $auditDir 'regression-smoke.cjs')
```

`run-checks.cjs` là wrapper thu stdout/stderr và summary; wrapper có thể exit 0 dù test con exit 1. **Kết quả test là `exitCode` của child trong `.json`/`.tap` và bảng trên**, không lấy exit của wrapper để báo pass. Script tạm không phải test đã được thêm vào repository.

## E. Kết luận và việc giao tiếp

**Chọn mức 3: Chưa nên demo vì còn lỗi chặn hoặc thiếu kiểm chứng quan trọng.** Có bằng chứng tốt về tính tiền và luồng Order trong cùng phiên, nhưng chưa đủ điều kiện nghiệm thu toàn app: lỗi lẫn đơn chưa sửa, có nhánh mất hồ sơ, test sản phẩm chưa theo contract và chưa có build/E2E đúng môi trường.

### Việc bắt buộc trước khi nghiệm thu lại

| Người phối hợp đề xuất | Việc cần hoàn tất | Bằng chứng cần gửi lại |
| --- | --- | --- |
| TV1 + TV3 + TV4 + TV5 | R01: thống nhất owner, truyền từ Checkout và cô lập đơn/Tracking/History đúng tài khoản; xử lý đơn thiếu owner | A đặt đơn, logout/login B không thấy/không mở được đơn A; A đăng nhập lại thấy dữ liệu đúng chính sách |
| TV5 | N01: đăng ký trùng/thất bại không ghi đè hồ sơ | Hồ sơ/điện thoại/sổ địa chỉ giữ nguyên trước và sau lỗi; kiểm tra demo và configured |
| TV5 | N02/N04: xử lý khôi phục Firebase và kết quả auth/Profile cũ sau đổi phiên | Không có phiên SDK không tự cấp phiên bằng cache; kết quả A về muộn không thay B hoặc ghi session A trở lại |
| TV5 | N03: phản hồi đúng khi persistence thất bại | UI không báo đã lưu khi storage lỗi; hành vi retry/giữ state được ghi rõ |
| TV4 + TV2/TV3 | R06: resolve menu/options/giá hiện tại, validate toàn bộ trước khi thay giỏ | Giá mới được tính lại; lỗi/thiếu món giữ giỏ cũ và báo rõ; snapshot lịch sử không bị sửa |
| TV3 + TV5, TV4 nếu đổi contract ID/owner | R08: cập nhật setup và expected có căn cứ, giữ assertion nghiệp vụ | Bộ test nạp đầy đủ; log mới có test/pass/fail/skip/exit, phân biệt mock và integration thật |
| TV1 điều phối cả nhóm | R09 và E2E: đồng bộ môi trường được phép, typecheck/build, chọn nền tảng demo và chạy toàn luồng | Commit/build cụ thể, log typecheck/build mới và checklist thao tác trên app, không chỉ SSR |
| Trưởng nhóm + TV1/TV5 | Chốt hạn voucher hoặc giới hạn MVP; persistence qua restart; mặc định payment; chính sách reorder cùng quán | Quyết định được ghi vào tài liệu/contract; không tự gán PASS cho phần chưa thống nhất |

N02/N04 liên quan nhánh Firebase; nếu nhóm chọn demo mode cho buổi diễn tập, ghi rõ mode và giới hạn, không tuyên bố nhánh Firebase đã đạt. Cần xử lý R01/N01 và có build/thao tác thật trước khi nâng kết luận sẵn sàng demo.

### Việc có thể để sau hoặc giữ đúng giới hạn MVP

- Đồng bộ chú thích mô phỏng tại Tracking (R07/P2), bổ sung kiểm tra an toàn khi snapshot đặt lại bị lỗi (R06/P2), cập nhật README/notes cũ để tránh AI/thành viên khác dùng contract lỗi thời. Các test nhánh lỗi vẫn cần giữ trong đợt sửa tiếp.
- Backend đầy đủ, cổng thanh toán thật, GPS/tài xế thời gian thực không phải điều kiện hoàn thành của MVP này.
- Persistence Cart/Order qua restart hoặc contract hạn voucher chỉ được mở rộng theo quyết định nhóm; hiện ghi đúng giới hạn, không tự triển khai hoặc tự coi đã kiểm chứng.

**Bàn giao lượt review:** báo cáo này ghi nhận kết quả tại HEAD nêu ở A. Source/test/config/dependency không được sửa; báo cáo cũ và các file cá nhân có sẵn được giữ nguyên. Sau khi nhóm sửa tiếp, cần đối chiếu commit mới và chạy lại các case thất bại cùng kiểm tra hồi quy trên app trước khi kết luận.
