# Báo cáo kiểm tra dự án GrabFood-like Client trước demo

> Người gửi: **TV3 — Cart, Voucher & Checkout**.
> Ngày: **26/10/2026**, múi giờ Asia/Bangkok.
> Phiên bản kiểm tra: **`develop@cfdbc96b2adfe31b8305ec3647ce386d355105f3`**.
> Kết luận: **chưa đủ điều kiện chốt dự án sẵn sàng demo; cần sửa các lỗi ưu tiên và kiểm tra lại trên môi trường chạy app thực tế**.

## 1. Tôi gửi báo cáo này để nhóm xử lý những gì?

Tôi đã cùng Codex review toàn dự án, bao gồm module của cả năm thành viên. Các màn chính đã có implementation, không còn là toàn bộ placeholder như thời điểm TV3 bàn giao ngày 23/10. Phần tính tiền và bàn giao Order có kết quả kiểm tra tốt, nhưng vẫn còn lỗi dữ liệu tài khoản, địa chỉ, ID đơn và một số điểm nối chưa hoàn chỉnh.

Đề nghị trưởng nhóm đọc bảng ưu tiên, giao đúng module cho từng thành viên, cho phép các thay đổi dùng chung nếu cần và kiểm tra lại trước khi ghép bản demo. Đây là báo cáo phát hiện và hướng xử lý; **chưa có bản sửa lỗi nào được thực hiện trong lượt review/lập báo cáo này**.

### Phạm vi và phiên bản

- Đang ở nhánh `develop`. Đã fetch riêng `origin/develop` và xác nhận HEAD local trùng remote, số commit lệch hai phía là `0 / 0`.
- Không pull/merge/reset, không sửa source/test/config, không cài dependency trong lượt review. Lượt lập tài liệu chỉ thêm file báo cáo này.
- Trước khi thêm báo cáo, 74 file trong snapshot vẫn có cùng hash với lần review ngay trước đó; chưa có thay đổi source để coi các lỗi đã được sửa.
- Working tree source sạch. Ba tài liệu untracked có sẵn vẫn giữ nguyên: `CODEX_TV3_CART_CHECKOUT.md`, `Ke_Hoach_Du_An_Mobile_App_GrabFood_Client.docx`, `Ke_Hoach_Du_An_Mobile_App_GrabFood_Client.md`.
- Các kết quả kiểm thử bên dưới thuộc lượt review cùng commit này. Khi lập file, tôi đối chiếu lại Git/source; không coi việc tạo tài liệu là một lượt chạy test mới.
- Nội dung dựa trên [README](README.md), [kế hoạch dự án](Ke_Hoach_Du_An_Mobile_App_GrabFood_Client.md), hướng dẫn/bàn giao và implementation thực tế. Nếu tài liệu khác source, báo cáo ghi rõ thay vì mặc định tài liệu đúng hoặc code đúng.

### Cách đọc mức độ và bằng chứng

| Nhãn | Ý nghĩa |
| --- | --- |
| P0 | Ưu tiên cao nhất: có mất dữ liệu đã lưu hoặc chặn luồng chính nghiêm trọng |
| P1 | Cần xử lý trước demo hoặc trước khi kết luận nghiệm thu |
| P2 | Có thể cải thiện sau khi luồng chính ổn, hoặc cần chốt lại mục tiêu tài liệu |
| Đã tái hiện | Đã chạy kiểm tra và quan sát hiện tượng; phần mock/giới hạn được nêu rõ |
| Qua code | Xác định từ implementation và nơi gọi; chưa chạy đầy đủ tình huống trên app |
| BLOCKED / NOT_RUN | Bị chặn/chưa chạy; không được tính là PASS |

## 2. Bảng ưu tiên giao việc

| Mã | Mức độ | Vấn đề | Đề nghị chủ trì/phối hợp | Điều kiện đóng vấn đề |
| --- | --- | --- | --- | --- |
| R01 | **P0** | Logout mất sổ địa chỉ; đổi tài khoản còn giỏ/đơn của tài khoản trước | TV5 chủ trì; TV3, TV4 phối hợp | Hồ sơ được bảo toàn; giỏ/đơn không lẫn tài khoản |
| R02 | P1 | Chưa có địa chỉ hợp lệ vẫn tạo được Order | TV3 + TV5 | Chặn address rỗng, sentinel và fallback che thiếu user |
| R03 | P1 | ID đơn trùng làm cập nhật nhầm nhiều Order | TV4 | ID duy nhất, Tracking/History định danh đúng từng đơn |
| R04 | P1 nếu demo web | Alert native không thực hiện các xác nhận trên web | TV1 điều phối; TV2, TV5 thực hiện ở màn tương ứng | Đổi quán, logout, xóa địa chỉ và phản hồi auth hoạt động trên web |
| R05 | P1 | TV2 clear giỏ trước validation món mới, không catch lỗi thêm món | TV2; TV3 hỗ trợ contract | Món mới lỗi không mất giỏ cũ; có thông báo lỗi |
| R06 | P1 | Thiếu chức năng đặt lại đơn trong phần đã giao | TV4 + TV3 | Có luồng đặt lại qua Cart, hoặc nhóm chốt thay đổi phạm vi |
| R07 | P1 | Nhãn thanh toán/auth mô tả dịch vụ thật khi đang giả lập | TV3 + TV5 | UI phản ánh đúng chế độ thực tế |
| R08 | P1 | Test tích hợp còn dùng contract auth cũ | TV3 + TV5 | Setup đúng async/login; giữ assertion nghiệp vụ có căn cứ |
| R09 | P1 — chặn xác minh | Dependency local chưa đồng bộ, typecheck chưa pass | TV1 điều phối môi trường; TV2 kiểm tra lỗi style | Cài đúng lockfile trên môi trường được phép, typecheck/build lại |
| R10 | P2 | Khối lượng dữ liệu thấp hơn mục tiêu trong kế hoạch | TV5 + trưởng nhóm | Bổ sung hoặc chốt lại mục tiêu dữ liệu |

Hạn voucher là điểm **đang chờ quyết định**, trình bày riêng ở mục 5. Không tự coi phần đó đã pass hoặc tự sửa schema thay nhóm.

## 3. Chi tiết lỗi và hướng sửa tối thiểu

### R01 — P0: Logout làm mất dữ liệu đã lưu; dữ liệu giao dịch lẫn tài khoản

**Vị trí:** [authStore.ts — logout](src/store/authStore.ts#L180), `loadSavedAuth`, `makeUser`, `login`; [orderStore.ts](src/store/orderStore.ts#L19); [OrderHistoryScreen.tsx](src/screens/orders/OrderHistoryScreen.tsx#L11); `src/store/cartStore.ts`.

**Điều kiện/tái hiện:** dùng native hoặc gọi store để tách khỏi lỗi Alert web. Đăng nhập tài khoản A, lưu điện thoại và một địa chỉ vào sổ, tạo một Order và để lại một giỏ đang có món. Logout A rồi login B; sau đó logout B và login lại A.

**Quan sát đã tái hiện:** auth/cart/order store là source thật; Firebase và AsyncStorage được mock bằng bộ nhớ, không gọi Firebase thật. B vẫn đọc được note của giỏ A và địa chỉ của Order A. Khi A đăng nhập lại, địa chỉ đã lưu không được khôi phục, sổ địa chỉ có 0 mục và điện thoại đã lưu bị mất.

**Nguyên nhân:** logout lưu `user: null` vào cùng bản ghi chứa dữ liệu hồ sơ/sổ địa chỉ. Cart và Order lại là state toàn cục, không được xóa hoặc phân chia theo tài khoản. History đọc toàn bộ `orders`.

**Mong đợi/tác động:** đăng xuất không xóa sổ địa chỉ đã lưu của người dùng; B không nhìn thấy hoặc tiếp tục đặt giỏ của A. Đây là lỗi mất dữ liệu cục bộ đã lưu và lẫn dữ liệu phiên, ảnh hưởng trực tiếp chức năng tài khoản.

**Hướng sửa tối thiểu:** TV5 tách dữ liệu hồ sơ đã lưu khỏi trạng thái đăng nhập. TV5 phối hợp TV3/TV4 để cách ly hoặc clear dữ liệu phiên khi logout/đổi tài khoản theo quyết định chung. Không cần triển khai backend đầy đủ để giải quyết vấn đề vòng đời state này.

**Kiểm tra lại:** A lưu sổ địa chỉ → logout/login A vẫn còn; A tạo giỏ/đơn → login B không thấy dữ liệu A. Kiểm tra cả chế độ demo và Firebase thật nếu nhóm sử dụng.

### R02 — P1: Địa chỉ báo thiếu vẫn được dùng để tạo đơn

**Vị trí:** [CheckoutScreen.tsx:24](src/screens/cart/CheckoutScreen.tsx#L24), `getAddress` tại dòng 32, điều kiện disabled tại dòng 137; [checkout.ts:50](src/screens/cart/checkout.ts#L50); `DEFAULT_ADDRESS` trong authStore và `EMPTY_ADDRESS` trong ProfileScreen.

**Điều kiện/tái hiện:** tài khoản có `address = 'Chưa thêm địa chỉ giao hàng'`, chẳng hạn sau khi xóa địa chỉ cuối. Thêm món, vào Checkout và đặt đơn. Có thể thiết lập trạng thái bằng fixture để kiểm tra độc lập.

**Quan sát đã tái hiện:** controller tạo Order với chính chuỗi báo thiếu địa chỉ rồi clear giỏ. SSR của Checkout cũng cho thấy nút đặt đơn vẫn được bật với sentinel này. Khi `user` null, component dùng địa chỉ hardcode và nút cũng được bật trong kiểm tra SSR.

**Nguyên nhân:** component dùng fallback che trường hợp thiếu user; controller chỉ kiểm tra `address.trim()`, nên sentinel là chuỗi không rỗng và lọt validation.

**Mong đợi/tác động:** không tạo Order khi chưa có địa chỉ giao hàng hợp lệ. Hiện có thể tạo đơn không có địa chỉ thực, khiến người dùng tưởng đã hoàn tất đúng thông tin.

**Hướng sửa tối thiểu:** TV3/TV5 thống nhất cách biểu diễn địa chỉ chưa có và điều kiện hợp lệ dùng chung; loại bỏ fallback che thiếu user; chặn tại cả giao diện và handler. Khi bị chặn phải giữ giỏ và chỉ rõ người dùng cần chọn địa chỉ.

**Mức xác minh:** đã tái hiện controller/SSR với các ranh giới được mock; chưa thao tác E2E trên thiết bị.

### R03 — P1: ID Order không duy nhất

**Vị trí:** [orderStore.ts:22](src/store/orderStore.ts#L22), `advance` tại dòng 28; `keyExtractor` và điều hướng trong OrderHistoryScreen.

**Điều kiện/tái hiện:** hai lần gọi `placeOrder` hợp lệ cùng millisecond. Diagnostic có sẵn cố định clock và thực hiện hai lần gọi riêng biệt:

```powershell
node src/screens/cart/__tests__/diagnose-order-id.cjs
```

**Kết quả đã chạy:** `FAIL`, exit 1; `firstId = GF200000`, `secondId = GF200000`, có 2 Order. Kiểm tra bổ sung xác nhận `advance(id)` chuyển cả hai Order trùng ID sang `preparing`.

**Nguyên nhân/tác động:** ID lấy sáu số cuối `Date.now()`. Tracking tìm theo ID có thể mở nhầm đơn; History dùng ID làm key; cập nhật trạng thái ảnh hưởng nhiều đơn. Khóa tap lặp của TV3 không bảo đảm ID duy nhất cho các lần tạo đơn hợp lệ khác nhau.

**Hướng sửa tối thiểu:** TV4 sửa nguồn sinh ID tại orderStore, giữ một nguồn ID do store trả về. TV3 tiếp tục dùng chính ID đó; không tạo một ID khác ở Checkout để che lỗi.

**Kiểm tra lại:** hai đơn tạo cùng clock vẫn khác ID; advance một đơn không đổi đơn còn lại; diagnostic cần được rà theo contract ID mới, không tiếp tục ép định dạng sáu số cũ.

### R04 — P1 nếu demo web: Xác nhận bằng Alert native không hoạt động

**Vị trí:** [DishOptionsScreen.tsx:113](src/screens/restaurant/DishOptionsScreen.tsx#L113); [ProfileScreen.tsx:56](src/screens/auth/ProfileScreen.tsx#L56) và `signOut`; Alert phản hồi trong LoginScreen/RegisterScreen.

**Điều kiện/tái hiện:** trên web, có giỏ quán A rồi thêm món quán B; hoặc bấm logout/xóa địa chỉ trong Profile. Việc thực hiện đang nằm trong callback của nút Alert.

**Bằng chứng:** diagnostic với RN Web đã cài cho thấy `Alert.alert()` không gọi callback. Đã đối chiếu thêm [source chính thức RN Web 0.21.4](https://raw.githubusercontent.com/necolas/react-native-web/0.21.4/packages/react-native-web/src/exports/Alert/index.js): implementation là `static alert() {}`.

**Hành vi/tác động:** không có hộp thoại và hành động phụ thuộc callback không chạy. Phản hồi lỗi/thành công của auth cũng không hiển thị như dự kiến. Chưa có bản web build hoàn chỉnh để thao tác E2E; kết luận dựa trên source và diagnostic của primitive.

**Hướng sửa tối thiểu:** TV1 điều phối một cách xác nhận/thông báo hỗ trợ web; các màn TV2/TV5 dùng đúng cơ chế. Riêng thêm món, helper TV3 đã có nhánh xử lý web, cần tích hợp thay vì tiếp tục gọi Alert riêng.

**Kiểm tra lại:** thực hiện được cả Hủy/Đồng ý đổi quán, logout, xóa địa chỉ và đọc phản hồi auth trên web; native vẫn hoạt động; không xuất hiện dialog đôi.

### R05 — P1: Đổi quán có thể mất giỏ cũ khi món mới lỗi

**Vị trí:** [DishOptionsScreen.tsx:122](src/screens/restaurant/DishOptionsScreen.tsx#L122), `commitAddToCart`; [helper TV3 đã cung cấp](src/screens/cart/addToCartWithConfirmation.ts).

**Điều kiện/tái hiện:** giỏ A có món; người dùng xác nhận đổi sang B, nhưng món/lựa chọn/giá của B không hợp lệ. Callback hiện gọi `clearCart()` rồi mới gọi `addToCart`, không có catch bao quanh.

**Quan sát đã tái hiện:** replay đúng thứ tự hai thao tác store của callback, inject giá món B là NaN. `addToCart` throw `CartValidationError`, trong khi giỏ A đã bị xóa. Đây là fault injection; kiểm tra JSON hiện tại không phát hiện giá món sai, nên không khẳng định mọi lần đổi quán đều mất giỏ.

**Mong đợi/tác động:** lỗi món mới phải giữ giỏ cũ, có lý do rõ để sửa hoặc thử lại. Tránh mất dữ liệu do xác nhận đổi quán.

**Hướng sửa tối thiểu:** TV2 gọi `addToCartWithConfirmation`, catch và hiển thị `cartErrorMessage`; không clear trước helper, không hiện Alert thứ hai. Helper đã validate và thay giỏ bằng update atomic, có kiểm tra giỏ đổi trong lúc dialog mở.

**Kiểm tra lại:** món B lỗi/thiếu lựa chọn, Hủy/dismiss, giỏ thay đổi khi dialog mở và trường hợp xác nhận hợp lệ. Chỉ trường hợp hợp lệ mới thay giỏ.

### R06 — P1: Thiếu chức năng đặt lại đơn trong phân công TV4

**Căn cứ:** Phần 2/TV4 của [kế hoạch](Ke_Hoach_Du_An_Mobile_App_GrabFood_Client.md) có chức năng Lịch sử đơn và Đặt lại đơn.

**Vị trí:** [OrderHistoryScreen.tsx:60](src/screens/orders/OrderHistoryScreen.tsx#L60), OrderTrackingScreen, orderStore.

**Qua code:** History hiện chỉ mở Tracking. Không tìm thấy handler hoặc nút đặt lại đơn trong các module source; trạng thái này không phải lỗi môi trường local.

**Mong đợi/hướng sửa tối thiểu:** TV4 phối hợp TV3 triển khai luồng đưa món về Cart, kiểm tra dữ liệu món hiện tại và xử lý giỏ đã có món/xác nhận khác quán. Không tạo Order mới trực tiếp chỉ để giả lập đã đặt lại. Nếu nhóm quyết định bỏ tính năng, trưởng nhóm cần chốt lại phạm vi thay vì báo đã hoàn thành.

**Kiểm tra lại:** từ đơn hoàn thành đặt lại → Cart đúng món/options/note/số lượng, kiểm tra giá hiện tại, xử lý đúng giỏ cũ.

### R07 — P1: Nhãn giao diện không phản ánh đúng chế độ mô phỏng

**Vị trí:** [CheckoutScreen.tsx:121](src/screens/cart/CheckoutScreen.tsx#L121), [RegisterScreen.tsx:19](src/screens/auth/RegisterScreen.tsx#L19), [ProfileScreen.tsx:90](src/screens/auth/ProfileScreen.tsx#L90), nhánh demo trong authStore.

**Điều kiện/hành vi hiện tại:** Checkout ghi “Ví điện tử GrabPay / Thẻ” nhưng không ghi giả lập. Register luôn báo Firebase đã gửi email dù nhánh demo không gửi thư. Profile lại luôn ghi tài khoản demo/chưa kết nối trực tuyến, kể cả khi có cấu hình Firebase thật.

**Bằng chứng:** nhãn ví đã kiểm tra bằng SSR; nhánh thông báo auth được đối chiếu qua code. Môi trường review không có `.env.local`; không thực hiện đăng ký/gửi email Firebase thật.

**Tác động:** người dùng có thể chờ thư không tồn tại hoặc hiểu nhầm app đã tích hợp thu tiền/thẻ thật; dễ giải thích sai khi bảo vệ đồ án.

**Hướng sửa tối thiểu:** TV3/TV5 điều chỉnh câu chữ theo mode thực tế, ghi rõ ví giả lập, không hứa gửi thư khi không gửi. Không mở rộng sang thanh toán thật để giải quyết một lỗi thông báo.

### R08 — P1: Test còn setup theo contract auth cũ

**Vị trí:** [integration.test.cjs:22](src/screens/cart/__tests__/integration.test.cjs#L22), phần đọc `auth.user.address` tại dòng 32–33; `components.test.cjs` cũng gọi register theo cách cũ.

**Qua code:** `register` hiện là Promise và đăng ký không tự đăng nhập, nhưng test vẫn gọi như hàm đồng bộ rồi kỳ vọng `user` có sẵn. Chỉ đồng bộ dependency chưa đủ để bảo đảm suite sẽ pass. Một số assertion component cũng cần được đối chiếu với thay đổi UI và quyết định nghiệp vụ hiện tại.

**Kết quả chạy thực tế:** hai file component/integration đang dừng lúc nạp do thiếu `firebase/auth`, chưa chạy tới các assertion này. Không gọi đây là lỗi assertion đã tái hiện sau clean install; đó là bất tương thích setup được xác định qua source.

**Hướng sửa tối thiểu:** TV3/TV5 thống nhất fixture, await và bước login theo contract hiện tại. Unit/component cần mock ranh giới auth phù hợp; integration thật cần môi trường và dữ liệu kiểm tra riêng. Giữ kiểm tra nghiệp vụ như địa chỉ không hợp lệ và nhãn ví giả lập, không xóa assertion để che lỗi app. Nếu nhóm chấp nhận mặc định tiền mặt, ghi quyết định trước khi đổi case liên quan.

**Kiểm tra lại:** suite chạy được đầy đủ và báo kết quả mới, không lấy con số 79 PASS của commit/snapshot ngày 23/10 làm kết quả hiện tại.

### R09 — P1, chặn xác minh: Môi trường local chưa đồng bộ dependency

**Vị trí:** [package.json](package.json), [package-lock.json](package-lock.json), [tsconfig.json](tsconfig.json); [DishOptionsScreen.tsx:193](src/screens/restaurant/DishOptionsScreen.tsx#L193).

**Quan sát:** có 15 dependency thiếu hoặc không thỏa version khai báo. Ví dụ local đang có Expo 53.0.27, React 19.0.0, React Native 0.79.6, TypeScript 5.8.3; repository yêu cầu Expo ~58.0.17, React 19.3.0, React Native 0.88.0, TypeScript ~6.0.3. Firebase, react-native-maps và expo-asset chưa có trong local.

**Typecheck đã chạy:** exit 1, có lỗi không tìm thấy Firebase/maps, implicit any ở callback Map và TS2698 tại spread `StyleSheet.absoluteFill` trong DishOptionsScreen. Do type/dependency local còn cũ, chưa kết luận tất cả lỗi đó sẽ tồn tại sau khi cài đúng lockfile.

**Phân loại:** đây là blocker xác minh trên máy review, không phải bằng chứng rằng version khai báo không tồn tại hoặc app chắc chắn không build trên máy các bạn. Root dependency trong lockfile khớp package.json ở lần đối chiếu.

**Hướng xử lý:** TV1/trưởng nhóm cho phép đồng bộ dependency đúng lockfile trên môi trường kiểm tra rồi chạy lại typecheck/build. TV2 kiểm tra lỗi style nếu còn sau đồng bộ; dùng giá trị style dạng object phù hợp, không tắt typecheck hoặc ép kiểu để che lỗi. Tôi chưa cài hoặc thay dependency trong review.

### R10 — P2: Khối lượng dữ liệu chưa đúng mục tiêu tài liệu

**Vị trí:** `src/data/restaurants.json`, `dishes.json`, `vouchers.json`; phân công TV5 trong kế hoạch.

**Đã kiểm tra:** 10 quán, 33 món, 3 voucher, 4 danh mục. Mục tiêu kế hoạch là 10 quán, 40 món, 5 mã; một số quán hiện có 3 món. Chưa thấy lỗi ID tham chiếu hoặc giá với lựa chọn mặc định.

**Tác động/hướng xử lý:** chưa chặn luồng demo cơ bản, nhưng cần TV5/trưởng nhóm chốt mức dữ liệu để tránh báo sai mức hoàn thành. Có thể bổ sung theo mục tiêu hoặc ghi nhận điều chỉnh, không cần xây thêm backend/tính năng mới.

## 4. Những gì đã kiểm tra và kết quả thật

Môi trường review: Windows, Node v22.21.0; dependency local đang lệch repository như R09. Không cài thêm runner/dependency. Các diagnostic bổ sung chạy trong bộ nhớ, không thêm source/test hoặc ghi dữ liệu tài khoản thật vào dự án.

| Kiểm tra | Kết quả đã quan sát | Giới hạn |
| --- | --- | --- |
| Fetch và so sánh develop | HEAD = origin/develop = cfdbc96, lệch 0/0 | Chỉ fetch, không pull/merge/reset |
| `npm run typecheck` | **FAIL**, exit 1 | Dependency/type local cũ; cần chạy lại sau đồng bộ |
| `node --test --test-reporter=spec src/screens/cart/__tests__/*.test.cjs` | **66 PASS**, 2 file lỗi lúc nạp, exit 1 | Hai file component/integration bị chặn bởi Firebase; không phải 79/79 |
| Test TV2 qua loader TypeScript có sẵn | **22 assertion PASS** | Kiểm tra helper giá/buildCartItem, không phải tương tác màn hình |
| `node src/screens/cart/__tests__/diagnose-order-id.cjs` | **FAIL**, exit 1; hai ID GF200000 | Clock cố định, Order store thật |
| Diagnostic tài khoản | Tái hiện mất hồ sơ/sổ địa chỉ và giỏ/đơn lẫn tài khoản | Auth/cart/order store thật; Firebase và AsyncStorage mock |
| Diagnostic địa chỉ | Tạo được Order với sentinel; SSR vẫn bật nút | Auth/navigation/address picker được mock ở ranh giới; chưa E2E |
| Diagnostic đổi quán | Món mới có giá lỗi làm mất giỏ cũ trong chuỗi clear → add | Fault injection đúng thứ tự callback; không phải dữ liệu JSON hiện tại bị lỗi |
| So sánh giá TV2 → TV3 | **312 cấu hình size/topping**, quantity 3, không sai lệch quan sát | Chỉ cấu hình hợp lệ; không đại diện mọi hành vi UI |
| Smoke luồng dữ liệu qua module thật | 133.000đ; giữ note; clear sau success; dùng đúng ID trả về | Địa chỉ/navigation được cung cấp trong harness |
| Tracking effect/timer điều khiển | placed → preparing → delivering → completed; interval 5000ms, có cleanup | Hook/lịch timer được điều khiển; chưa chạy app/device E2E |
| Rà dữ liệu mẫu | 10 quán/33 món/3 mã/4 danh mục; không lỗi tham chiếu/giá mặc định | Chưa xác minh mọi URL ảnh hoặc chất lượng hình trên thiết bị |
| Build web/Android, Firebase thật, E2E | **BLOCKED / NOT_RUN** trong review hiện tại | Chưa có môi trường dependency đúng và thiết bị kiểm thử |

Số PASS cao của helper không chứng minh toàn app đúng. Tôi chưa khẳng định đã chạy luồng UI đầy đủ, bàn phím, email verification thật hay mọi lỗi mạng.

### Lệnh để trưởng nhóm/AI kiểm tra lại

Chạy từ gốc repository. Nếu đồng ý xử lý R09, TV1/trưởng nhóm có thể cài đúng lockfile bằng `npm ci`; đây là đề xuất, **chưa được tôi chạy** trong review.

```powershell
npm run typecheck
node --test --test-reporter=spec src/screens/cart/__tests__/*.test.cjs
node -r ./src/screens/cart/__tests__/register.cjs src/screens/restaurant/calcItemTotalPrice.test.ts
node src/screens/cart/__tests__/diagnose-order-id.cjs
```

Sau sửa cần lưu commit, lệnh, exit code, số pass/fail/blocked và môi trường mới. Không auto-fix toàn repo hoặc cập nhật snapshot để làm xanh test mà chưa xác nhận hành vi đúng.

## 5. Các điểm cần trưởng nhóm chốt trước khi kết luận

1. **Nền tảng demo chính:** web, Android hay cả hai; sửa và kiểm tra dialog theo nền tảng đó. Nếu chọn Android thì vấn đề web vẫn ghi là giới hạn, không báo đã kiểm tra cả hai.
2. **Hạn voucher:** model chưa có trường hạn. TV3 đã được người dùng chấp thuận để V08/V09/V17 BLOCKED chờ TV1/TV5. Cần chốt tên field, kiểu/đơn vị thời gian, timezone, biên hết hạn và record thiếu hạn; hoặc ghi rõ quyết định giới hạn MVP. Không tự bịa schema/cho PASS.
3. **Chế độ auth khi demo:** demo local hay Firebase thật; UI phải nói đúng mode và cần kiểm tra lại session/restart nếu dùng Firebase.
4. **Đặt lại đơn và dữ liệu mẫu:** thực hiện đúng phân công hiện tại hoặc thống nhất thay đổi phạm vi bằng ghi chú rõ ràng.

## 6. Đối chiếu MVP hiện tại

| Phần việc | Đánh giá |
| --- | --- |
| Splash/onboarding/login/register | Có implementation; còn vấn đề mode thông báo, chưa kiểm chứng Firebase thật/session trên thiết bị |
| Profile/sổ địa chỉ/logout | Có nhưng lỗi R01/R04 |
| Home/banner/search/category filter | Có; service search/filter đã smoke; UI chưa E2E |
| Chi tiết quán/menu/size/topping/note | Có; cần sửa xác nhận đổi quán và xử lý lỗi |
| Cart và tính tiền | Logic lõi tốt trong các kiểm tra đã chạy; còn phụ thuộc vòng đời tài khoản/caller TV2 |
| Voucher | Có amount/percent/freeship; điều kiện ngưỡng và tính lại đã có; hạn dùng đang BLOCKED |
| Checkout/tạo đơn | Đã nối module thật; R02/R07 cần sửa |
| Tracking/History | Có; hiệu ứng timer đã smoke; ID R03 cần sửa |
| Đặt lại đơn | Thiếu trong source tại commit review |
| Layout/keyboard/nút liên tục/retry trên app thật | Chưa đủ kiểm chứng, cần kiểm tra sau đồng bộ môi trường |
| Dữ liệu mẫu | Đã có nhưng khối lượng thấp hơn kế hoạch |
| APK/slide/video dự phòng | Chưa xác minh; không thấy artifact tương ứng trong repository đã khảo sát, có thể nằm ở nơi khác |

## 7. Những phần đang hợp lý, chưa cần mở rộng

- Giữ một nguồn tính tiền, tính topping theo quantity, ship một lần và trần giảm đúng quyết định đã chốt. Chưa thấy sai tiền trên 312 cấu hình hợp lệ đã đối chiếu.
- Giữ cách phân biệt options/note, snapshot Order, clear sau tín hiệu thành công, khóa submit và cơ chế chỉ mở lại Tracking khi navigation lỗi.
- Giữ bốn trạng thái và timer/nút demo; mô phỏng giao hàng phù hợp phạm vi đồ án.
- Bản đồ Hà Nội, online geocoding và email verification là phần có thể giữ tùy chọn; ưu tiên luồng cơ bản ổn trước, không mở rộng chúng để làm checklist dài hơn.
- GPS thời gian thực, thu tiền ngân hàng thật, backend đầy đủ, app tài xế/chủ quán và AI gợi ý vẫn ngoài phạm vi, không cần bổ sung để sửa các vấn đề trong báo cáo.
- `TV3.md`/`TV3_NOTES.md` là snapshot bàn giao ngày 23/10, có nội dung đã cũ so với source hiện tại. Con số 79 PASS và các mô tả placeholder trong đó không được dùng làm kết luận review hiện tại. `last-run.tap` cũ không có trong bản clone này và `*.tap` đang bị ignore.

## 8. Checklist trưởng nhóm nghiệm thu sau khi giao sửa

- [ ] R01: tài khoản A lưu hồ sơ/sổ địa chỉ, logout/login A vẫn còn; login B không thấy giỏ/đơn của A.
- [ ] R02: user/address thiếu hoặc sentinel không tạo Order, giữ nguyên giỏ và có hướng dẫn chọn địa chỉ.
- [ ] R03: hai đơn cùng clock khác ID; advance/Tracking/History chỉ tác động đúng đơn.
- [ ] R04/R05: đổi quán Hủy/Đồng ý đúng trên nền tảng demo; món mới lỗi không xóa giỏ cũ; không dialog đôi.
- [ ] R06: đặt lại đơn hoạt động qua Cart, hoặc phạm vi được chốt lại rõ ràng.
- [ ] R07: ví ghi giả lập; không hứa gửi email nếu không gửi; Profile phản ánh đúng mode.
- [ ] R08/R09: dependency đúng lockfile, typecheck và suite chạy lại; không dùng log cũ thay kết quả mới.
- [ ] Kiểm tra toàn luồng: Login → Home/search/filter → quán → size/topping/note → Cart → voucher → Checkout → Tracking → History.
- [ ] Kiểm tra màn nhỏ, tên/note dài, danh sách dài, bàn phím voucher, lỗi dữ liệu/tạo đơn/navigation và retry trên app thực.
- [ ] Chốt hạn voucher, mode auth, nền tảng demo và khối lượng dữ liệu; ghi rõ phần nào chưa chạy.
- [ ] Cập nhật kết quả theo commit đã sửa; chỉ chốt sẵn sàng demo khi có bằng chứng cho môi trường sẽ trình bày.

**Đề nghị của tôi:** xử lý mất dữ liệu tài khoản và chặn địa chỉ không hợp lệ trước; tiếp theo sửa ID, xác nhận đổi quán/web, chức năng còn thiếu và setup test. Các thành viên có thể làm song song theo bảng phân công, rồi phối hợp nghiệm thu điểm nối.

Phân công trong báo cáo là đề xuất phối hợp để trưởng nhóm quyết định, không tự cấp quyền cho AI sửa module ngoài nhiệm vụ được giao. File này cũng không phải tuyên bố các lỗi đã được sửa hoặc mọi test đã pass.
