# HƯỚNG DẪN CODEX — CHỈ LÀM PHẦN THÀNH VIÊN 3

> Dự án: GrabFood-like Client — đồ án nhóm môn Mobile Application Development.
> Người dùng là **Thành viên 3 (TV3): Cart, Voucher & Checkout Dev**.
> Nhánh được phân công: **`feat/cart-checkout`**.
> Nguyên tắc: đúng phạm vi, đúng dữ liệu, có bằng chứng kiểm thử; không tự làm thay thành viên khác.

## 0. Cách dùng và giới hạn của tài liệu

Đặt file này trong thư mục gốc của bản clone cá nhân và gửi Codex:

```text
Đọc CODEX_TV3_CART_CHECKOUT.md, README và file kế hoạch dự án trước khi sửa code.
Tôi là thành viên 3. Hãy thực hiện phần Cart, Voucher & Checkout theo các giới hạn
trong tài liệu. Trước tiên kiểm tra repository thật, báo phạm vi file sẽ sửa,
các contract đã xác minh và những điểm còn thiếu. Sau đó chủ động triển khai
phần trong phạm vi đã rõ, viết và chạy test phù hợp, cập nhật ghi chú bàn giao.
Không sửa phần của thành viên khác, không tự đổi schema/API dùng chung,
không tuyên bố kiểm thử hoặc tích hợp thành công khi chưa có bằng chứng.
```

File này là hướng dẫn làm việc, **không phải bằng chứng app đã chạy hoặc test đã pass**. Khi soạn tài liệu, chỉ có hai file Markdown nguồn; chưa có source code, package.json, schema thực tế hay kết quả chạy app.

Không coi việc đặt file vào repo là đã bảo đảm Codex đọc nó. Hãy yêu cầu đọc rõ như prompt trên. Không ghi đè `AGENTS.md` có sẵn của nhóm. Nếu repo có hướng dẫn khác, đọc và đối chiếu; xung đột về quyền sửa file phải được làm rõ trước khi sửa phần liên quan.

### Nguồn đối chiếu

- **[KH]** `Ke_Hoach_Du_An_Mobile_App_GrabFood_Client(1).md`: đặc biệt Phần 1.1, Phần 2/TV3, Phần 3.2, Phần 3.3 và checklist Phần 6.
- **[RD]** `README(1).md`: công nghệ, cấu trúc, quyền sở hữu, API chung và Git.
- Trong repo, tên có thể là `README.md` hoặc `Ke_Hoach.md`. Tìm file thật và kiểm tra nội dung; không tự khẳng định tên hay đường dẫn tồn tại.
- [KH] là căn cứ phân công/nghiệp vụ. [RD] cụ thể hóa stack và đường dẫn của repo. Code thật là bằng chứng triển khai hiện có, **không tự động là nghiệp vụ đúng**. Nếu code lệch yêu cầu, ghi rõ sự lệch và chỉ sửa trong quyền của TV3.

## 1. Những gì đã được giao và những gì chưa biết

### 1.1. Phần việc đã xác nhận

| Hạng mục | Trách nhiệm TV3 | Căn cứ |
| --- | --- | --- |
| Cart store | Quản lý thêm, tăng, giảm, xóa món và trạng thái giỏ | [KH] Phần 2; [RD] |
| Một giỏ, một quán | Kiểm tra khác quán; phối hợp luồng cảnh báo/xác nhận trước khi xóa giỏ cũ | [KH] 1.1; [RD] API chung |
| Giỏ hàng | Hiển thị món, lựa chọn, số lượng, ghi chú được truyền vào, giá tiền và empty state | [KH] 2, 3.2, 4 |
| Voucher | Áp mã và tính giảm giá theo dữ liệu/contract đã xác minh | [KH] 2, 3.2 |
| Checkout | Hiển thị tiền, chọn tiền mặt hoặc ví giả lập, đặt đơn | [KH] 1.1, 2 |
| Tạo đơn | Chuẩn bị dữ liệu Order hợp lệ, gọi `useOrderStore().placeOrder(...)`, lấy ID thật theo contract và điều hướng | [KH] 2; [RD] API chung |
| Sau thành công | Làm rỗng giỏ; đơn đã bàn giao phải giữ nguyên dữ liệu | [KH] checklist Phần 6 |
| Kiểm thử/bàn giao | Test logic và UI của TV3; kiểm tra ranh giới tích hợp; ghi rõ phần chưa kiểm thử | Yêu cầu của người dùng trong tài liệu này |

**Stack đã chốt trong [RD]: React Native + Expo + TypeScript + React Navigation + Zustand + mock JSON tại `src/data`.** Không lựa chọn lại Flutter/Kotlin chỉ vì [KH] có ví dụ kiến trúc chung. Firebase chỉ được nhắc như khả năng thay đổi lớp dữ liệu; không phải nhiệm vụ tích hợp Firebase của TV3.

### 1.2. Kiểm tra bắt buộc trước khi quyết định nghiệp vụ

| Điểm chưa đủ rõ trong hai tài liệu | Phải kiểm tra | Khi vẫn chưa rõ |
| --- | --- | --- |
| Size S/M/L | Schema `OptionItem`, dữ liệu và cách TV2 biểu diễn size/giá cộng thêm | Không tự thêm trường `size` hay cộng giá hai lần; báo TV1/TV2 |
| Ghi chú món | [KH] có `note`, nhưng ví dụ `addToCart` trong [RD] chỉ có 4 tham số | Kiểm tra toàn bộ call site; nếu cần đổi contract, đề xuất TV1/TV2, không âm thầm thêm tham số |
| Nhận diện dòng để gộp món | Có xét dish, size, options, note không; quy tắc đã có | Ghi đề xuất, chốt trước khi gộp; tuyệt đối không làm mất cấu hình khác nhau |
| Giảm quantity từ 1 | Xóa dòng, hỏi xác nhận hay khóa nút giảm | Dùng quy tắc đã có; nếu chưa có, đề xuất khóa giảm tại 1 và dùng nút xóa riêng |
| Voucher phí ship | Schema [KH] chưa có trường phân biệt giảm món/giảm ship | Không suy ra từ `title`, tên mã hay riêng chữ `FREESHIP`; yêu cầu contract rõ |
| Ngưỡng voucher | `minOrderValue` tính trên subtotal hay tổng có ship | Đề xuất subtotal trước giảm; chờ chốt nếu repo chưa quy định |
| Hạn voucher | `expiryDate` là timestamp hay ngày; múi giờ; đúng thời điểm hết hạn có hợp lệ không | Không tự chọn mốc cuối ngày; ghi blocker cho kiểm tra hạn |
| Trần giảm và số mã | Có clamp theo tiền món/ship không; một hay nhiều voucher | Đề xuất 1 mã, giảm món tối đa subtotal, giảm ship tối đa deliveryFee; không coi là quy tắc đã được nhóm chốt |
| Mã có khoảng trắng/chữ thường | Có trim/không phân biệt hoa thường không | Giữ contract đã có hoặc chốt trước khi chuẩn hóa |
| `placeOrder` | Kiểu đầu vào, đồng bộ/bất đồng bộ, kiểu trả về, tín hiệu thành công/thất bại | Không giả định trả `orderId` hay Promise; không tự viết thay orderStore |
| ID/thời điểm/trạng thái đơn | TV3 hay orderStore tạo `orderId`, `createdAt`, `status` | Tạo đúng một nơi theo contract; không tạo ID thứ hai để điều hướng |
| Thanh toán/địa chỉ | Giá trị enum thật, dữ liệu địa chỉ mặc định và trường Order liên quan | Không tự thêm enum, trường model hay form sổ địa chỉ |
| Hạ tầng test | Runner, dependency, scripts và cách đặt test thực tế | Không tự thêm cấu hình/dependency chung; ghi đề xuất nếu chưa có |

Các đề xuất trong bảng **chưa phải sự phê duyệt nghiệp vụ**. Tự tìm bằng chứng trong repo trước khi hỏi. Chỉ hỏi những quyết định còn thiếu ảnh hưởng kết quả, API hoặc quyền sửa; vẫn tiếp tục các phần độc lập đã rõ. Không hỏi lại những gì đã được xác nhận trong phiên làm việc.

## 2. Quyền đọc và quyền sửa file

### 2.1. Danh sách được sửa mặc định

| Đường dẫn | Cho phép |
| --- | --- |
| `src/store/cartStore.ts` | Logic và state giỏ hàng thuộc TV3 |
| `src/screens/cart/**` | Cart, Checkout, voucher UI, helper/component riêng của TV3 |
| `src/screens/cart/__tests__/**` | Test/fixture riêng TV3, kể cả test import cartStore, nếu phù hợp test runner hiện có |
| `src/screens/cart/TV3_NOTES.md` | Nhật ký quyết định, blocker, test và bàn giao TV3 |

Các đường dẫn test/notes ở trên là vị trí **đề xuất mới trong phạm vi TV3**, không phải khẳng định chúng đã tồn tại. Nếu cấu trúc thực tế hoặc runner không hỗ trợ, đề xuất vị trí khác và xin xác nhận phạm vi trước khi tạo ngoài danh sách. Không coi toàn bộ `src/store/` là của TV3.

Được đọc code liên quan trong repo để hiểu contract, caller và lỗi. Quyền đọc/import/gọi API **không đồng nghĩa quyền sửa file**. Không đọc/in giá trị bí mật không cần thiết.

### 2.2. Ngoài phạm vi: chỉ đọc, báo lỗi hoặc đề xuất

| File/module | Người/phần chịu trách nhiệm | TV3 được làm gì |
| --- | --- | --- |
| `src/models/types.ts` | Model chung, TV1 điều phối | Import và sử dụng; mọi thay đổi phải báo nhóm và được cho phép |
| `src/navigation/**`, `src/theme/**`, `src/screens/home/**` | TV1 | Dùng route/theme/helper hiện có; không tự đăng ký/sửa route |
| `src/screens/restaurant/**` | TV2 | Đọc call site; ghi hướng dẫn tích hợp giỏ và xác nhận đổi quán |
| `src/store/orderStore.ts`, `src/screens/orders/**` | TV4 | Gọi API đã có; kiểm thử bàn giao; không sửa tracking/history/timer/reorder |
| `src/screens/auth/**`, `src/store/authStore.ts`, `src/data/**` | TV5 | Đọc dữ liệu cần thiết; không sửa auth, địa chỉ lưu hay mock sản phẩm |
| `scripts/gen-data.js` | Bộ sinh mock của TV5 | Không chạy sinh lại dữ liệu chung, không chỉnh script |
| `src/services/api.ts` | Dịch vụ dùng chung | Dùng API đã có; báo TV1 điều phối nếu cần sửa |
| `App.*`, entry point, component dùng chung ngoài cart | Hạ tầng chung | Không sửa để lách lỗi tích hợp |
| `package.json`, lockfile, `tsconfig*`, Babel, Metro, Expo config, CI, test config | Hạ tầng chung | Không thêm dependency, scripts hoặc nới kiểm tra nếu chưa được phép |
| README, kế hoạch, AGENTS, source của người khác | Tài liệu/phạm vi chung | Không tự sửa hoặc đổi phân công |

**Đường dẫn không nằm trong danh sách được sửa thì mặc định không được sửa.** Trước khi sửa file mới, kiểm tra đường dẫn thực và chủ sở hữu. Không di chuyển file của người khác vào thư mục cart để hợp thức hóa quyền sửa.

Nếu cần ngoại lệ, nêu cụ thể: đường dẫn, thay đổi tối thiểu, lý do, chủ sở hữu, tác động và phương án không sửa. Chờ người dùng cho phép rõ phạm vi mới. Không coi câu “hoàn thiện app”, lỗi build hoặc deadline là quyền sửa mọi nơi. Không tự thay đổi file hướng dẫn này để mở rộng quyền.

## 3. Trung thực, bảo toàn công việc và Git

1. Không bịa file, hàm, tên field, import path, enum, route, API, package, phiên bản hoặc dữ liệu. Xác minh từ repo trước khi sử dụng.
2. Phân biệt **đã xác minh**, **đề xuất**, **chưa rõ**, **bị chặn**. Trích đường dẫn/symbol làm căn cứ trong notes.
3. Không dùng `any`, `as unknown as ...`, `@ts-ignore`, tắt lint hoặc catch rỗng để che lỗi contract. Dùng narrowing/validation phù hợp; nếu thật sự cần ngoại lệ phải giải thích, không làm mất an toàn kiểu.
4. Không hardcode “đặt đơn thành công”, orderId giả, tiền mặc định hoặc fallback dữ liệu để che thiếu tích hợp. Mock chỉ nằm trong test hoặc demo mode đã được đồng ý, phải gắn nhãn rõ.
5. Không tự triển khai thanh toán thật, backend, GPS, notification, AI, tài xế/chủ quán, persistence giỏ hàng hay tính năng ngoài MVP.
6. Không sửa test để hợp thức hóa code sai; không xóa/skip test lỗi để báo xanh. Mock `orderStore` không chứng minh Order Tracking hoặc History thật hoạt động.
7. Không tự sửa lỗi ngoài TV3 dù lỗi đó chặn build. Báo lỗi với bằng chứng, tiếp tục test phần độc lập nếu có thể.
8. Không in/commit token, khóa, `.env` hay thông tin tài khoản. Không mở kết nối Firebase/cổng thanh toán thật để thử cho MVP này.
9. Trước sửa: kiểm tra branch, status, diff, file untracked liên quan. Không đụng thay đổi sẵn có của người dùng. Phân biệt diff đã có từ trước với diff do phiên này tạo.
10. Chỉ làm code TV3 trên `feat/cart-checkout`. Nếu đang ở main/develop hoặc branch khác, không sửa ở đó. Chỉ chuyển/tạo nhánh khi đã rõ trạng thái và không mang nhầm thay đổi người khác; nếu mơ hồ thì báo trước.
11. Không tự `reset --hard`, `clean -fd`, force push, xóa nhánh, stash, revert hoặc checkout ghi đè công việc. Không dùng `git add .`; nếu được yêu cầu commit, chỉ stage đúng file/hunk của mình.
12. Không tự commit/push/mở PR/merge khi chưa được yêu cầu. Khi được giao mở PR, target là `develop`; TV1 duyệt merge theo kế hoạch. Không tự merge vào main/develop.
13. [RD] nói pull develop mỗi sáng; chỉ cập nhật khi được giao và worktree an toàn, không merge mù. Conflict vào module người khác phải phối hợp, không chọn toàn bộ ours/theirs.
14. Sau sửa, kiểm tra cả diff và file mới, không chỉ `git diff --stat`. Format/lint chỉ đúng phạm vi; không chạy auto-fix toàn repo. Lệnh cài/build có thể sinh file: xem trước tác động và kiểm tra lại sau chạy.

## 4. Quy trình thực hiện mỗi phiên

### Bước A — Khảo sát, chưa sửa code

- Đọc hướng dẫn repo hiện có, README, kế hoạch và tài liệu này.
- Kiểm tra branch/worktree; dùng `rg --files` và tìm symbol để xác định file thực, không đoán tên.
- Đọc `package.json`, lockfile liên quan, TypeScript/test config để biết lệnh và công cụ hiện có. Không chạy cài đặt chỉ vì README có `npm install`; kiểm tra trước việc đổi lockfile/chạy install script.
- Đọc model, cartStore, cart screens, service, theme formatter, route types, `placeOrder`, và caller `addToCart` của TV2.
- Chạy kiểm tra baseline phù hợp nếu môi trường cho phép. `npm run typecheck` được README nêu, nhưng vẫn kiểm tra script thật trước khi chạy.
- Báo ngắn: những gì đã có, những gì thiếu, file dự kiến sửa, contract đã xác nhận và blocker. Không gọi code đã tồn tại là code mình vừa làm.

### Bước B — Chốt contract, tạo ghi chú

- Ghi đường dẫn/symbol thật, kiểu input/output, success/failure semantics.
- Lập danh sách quyết định nghiệp vụ còn thiếu ở mục 1.2; không viết implementation phụ thuộc quyết định chưa chốt.
- Ghi snapshot trạng thái ban đầu và kế hoạch test trong `TV3_NOTES.md` nếu được cấu trúc thực tế cho phép.
- Những việc trong phạm vi và đủ thông tin: tự triển khai, không xin phép lặp lại.

### Bước C — Làm từng cụm có kiểm chứng

1. Cart state và hàm tính tiền thuần.
2. Quy tắc một quán và giao tiếp với caller của TV2.
3. Cart UI, thay đổi số lượng, xóa, empty state.
4. Voucher đã xác minh quy tắc.
5. Checkout, thanh toán giả lập, bàn giao Order, xử lý lỗi và chống bấm lặp.
6. Test, kiểm tra type, kiểm tra UI trên môi trường thực có sẵn và notes bàn giao.

Ưu tiên MVP và code dễ giải thích trong bảo vệ đồ án. Không dựng framework, service tầng tầng hoặc kiến trúc mới chỉ để xử lý vài màn hình.

### Bước D — Kết thúc bằng kết quả thật

- Review toàn bộ diff/file mới và quyền sở hữu.
- Ghi lệnh đã chạy, thời điểm, exit code, số test pass/fail/skipped, môi trường và phần mock.
- Nếu không có emulator/device/runner, ghi `NOT_RUN` hoặc `BLOCKED` kèm lý do và cách tái hiện; không chuyển thành PASS.
- Bàn giao phần cần TV1/TV2/TV4/TV5 tiếp nhận. Chỉ soạn nội dung bàn giao, không tự gửi tin nhắn cho người khác.

## 5. Contract và quy tắc xử lý của TV3

### 5.1. Cart và tiền

Các công thức được [KH] xác nhận:

```text
unitPrice      = dish.price + tổng extraPrice của lựa chọn được chọn
itemTotalPrice = unitPrice × quantity
subtotal      = tổng itemTotalPrice
finalTotal    = subtotal + deliveryFee − discount
```

- Dùng một nguồn tính tiền thống nhất cho Cart, Checkout và Order. `calcPricing(items, restaurant, voucher)` là tên được [RD] nêu; xác minh nơi định nghĩa, signature và kiểu trả về thật.
- Không dùng chuỗi đã format như `"25.000 ₫"` để tính. Dùng kiểu tiền đúng contract; fixture bên dưới dùng số nguyên VND. Không tự đổi đơn vị sang nghìn đồng/xu.
- Không cộng topping hai lần, không cộng phí ship theo từng dòng hoặc từng quantity.
- `quantity` hợp lệ là số nguyên dương. Không chấp nhận NaN, Infinity, số âm, số thập phân hay 0 qua thao tác thêm; thao tác xóa phải rõ ràng. Không tự đặt giới hạn tối đa khi nhóm chưa quy định.
- ID quán của món phải khớp quán nhận vào. Không để direct call store bỏ qua ràng buộc một quán.
- Không tin mù `itemTotalPrice` được truyền/saved sẵn; giữ nhất quán với giá, lựa chọn và quantity theo model thật.
- Không sửa object dish/options thuộc dữ liệu chung. Dùng cập nhật immutable phù hợp Zustand và kiểm tra React render nhận thay đổi.
- Các lựa chọn/note khác nhau phải được bảo toàn. Không gộp chỉ theo dish ID nếu làm mất topping, size hoặc ghi chú.
- Giỏ trống: không đặt đơn được, không còn phí/voucher/quán cũ làm tổng hiển thị sai; tổng hiển thị 0.
- Giá/ship/option lỗi phải có trạng thái lỗi có kiểm soát, không để NaN/âm vào đơn, không âm thầm thay bằng 0 để đặt thành công.
- Cách clamp discount và tính ngưỡng chỉ áp dụng khi đã xác nhận ở mục 1.2. Kiểm tra tổng không âm; dữ liệu sai phải được xử lý rõ, không che lỗi bằng clamp vô điều kiện.

### 5.2. Một giỏ chỉ thuộc một quán

[RD] nêu `needsConfirmSwitch(restaurantId)`, Alert rồi `clear()`. Phải xác minh method nằm ở đâu và ai gọi; không đoán đây là export riêng hay method trong store.

- Giỏ trống hoặc cùng quán: không cần cảnh báo đổi quán.
- Khác quán: không được tự xóa/ghi đè/trộn món trước khi người dùng xác nhận.
- Bấm Hủy/đóng hộp thoại: giỏ, quán, voucher cũ giữ nguyên.
- Bấm Đồng ý: chỉ sau khi dữ liệu món mới hợp lệ mới thay giỏ; không giữ voucher cũ không còn hợp lệ.
- Nếu Alert nằm trong màn TV2, TV3 cung cấp hành vi store và hướng dẫn contract; không sửa file TV2. Thiếu caller tích hợp thì báo **chưa hoàn tất luồng đổi quán trên UI** dù store test pass.
- Tránh hiện hai hộp thoại hoặc clear hai lần vì cả store và màn hình cùng xử lý. Không tự tạo API thay thế phá caller cũ.

### 5.3. Voucher

- Đọc voucher qua service/data flow thật. Không tự sửa `vouchers.json`, không tự thêm GRAB50 vào dữ liệu sản phẩm để demo.
- Tên `GRAB50` **không có nghĩa giảm 50%**. [KH] chỉ đưa ví dụ giảm cố định 25.000đ cho đơn từ 60.000đ; giá trị thực phải lấy từ dữ liệu/contract đã xác minh.
- `FREESHIP` trong ví dụ là giảm 15.000đ phí ship, không mặc nhiên miễn mọi phí ship. Schema [KH] thiếu discriminator; nếu repo cũng thiếu, báo blocker cho cách phân loại, không dò chuỗi code/title.
- Kiểm tra tồn tại, ngưỡng, hạn và phạm vi giảm theo quy tắc được chốt. Lỗi mã phải hiển thị có lý do, không làm mất giỏ.
- Khi quantity, items, quán hoặc thời gian thay đổi, phải tính/kiểm tra lại. Kiểm tra lại ngay trước đặt đơn, không chỉ lúc bấm Áp dụng.
- Nếu không còn đủ điều kiện, discount không được giữ số cũ; UI phải giải thích rõ mã không còn áp dụng.
- Số voucher đồng thời, việc thay mã, bỏ mã và chuẩn hóa input theo quyết định đã ghi nhận. Không tự thêm stacking, voucher phần trăm hay voucher theo user/quán nếu không được giao.

### 5.4. Checkout và Order

- Dùng enum và route thật. Tên route `OrderTracking` cùng param `{orderId}` được [RD] nêu nhưng phải đối chiếu `src/navigation/types.ts` trước khi gọi.
- Phương thức ví điện tử chỉ là giả lập: UI nói rõ, không mở cổng thanh toán thật hoặc tuyên bố tiền đã được thu thật.
- Hiển thị breakdown tiền khớp Cart. Không tự xây sổ địa chỉ; dùng dữ liệu có sẵn và báo nếu contract địa chỉ chưa đủ.
- Trước submit: kiểm tra giỏ không rỗng, cùng quán, quantity/giá hợp lệ, voucher còn hợp lệ, payment hợp lệ và các trường bắt buộc thật.
- Chặn submit lặp ngay từ lần gọi đầu, kể cả hai lần tap trước lần render kế tiếp. Với async, giữ khóa đến khi có kết quả; với sync, không dùng timeout giả để mô phỏng thành công.
- Snapshot items/options/note/pricing tại thời điểm submit; Order không được đổi theo giỏ sau đó. Khi đang submit, khóa thao tác làm thay đổi nội dung hoặc có cơ chế rõ để không clear nhầm giỏ mới.
- Gọi `placeOrder` đúng một lần cho một lần submit hợp lệ. Không viết thêm cơ chế lưu đơn riêng bên TV3.
- Chỉ clear cart sau tín hiệu tạo đơn thành công theo contract. Nếu API có thể throw/reject/trả lỗi, giữ giỏ/voucher/payment để sửa hoặc thử lại và mở khóa submit.
- Nếu đơn đã được tạo nhưng điều hướng lỗi, ghi nhận trạng thái đã tạo và không tự submit lại. Không tạo đơn thứ hai chỉ vì màn tracking chưa mở.
- Không giả định retry an toàn nếu API có thể lưu đơn rồi báo lỗi. Ghi blocker về semantics/idempotency cho TV4; không khẳng định xử lý được mọi lỗi mạng bằng một biến loading.
- ID, createdAt và status `PLACED` phải đúng nguồn chịu trách nhiệm theo contract. TV3 không chạy timer hay chuyển `PREPARING/DELIVERING/COMPLETED`.
- History/Tracking/reorder thuộc TV4. TV3 kiểm tra tích hợp, báo lỗi, không nhận làm hoặc sửa thay.

### 5.5. UI tối thiểu

- Dùng theme, formatter và component chung hiện có bằng import; không sửa chúng.
- Cart có thông tin món/lựa chọn/note, quantity, giá dòng, nút xóa, breakdown và hành động sang Checkout.
- Checkout có phương thức thanh toán, voucher, breakdown, trạng thái đang xử lý/lỗi và nút đặt đơn.
- Empty state, loading dữ liệu nếu có, lỗi voucher và lỗi đặt đơn phải rõ; không tạo cảm giác app treo.
- Màn nhỏ, chữ dài, bàn phím voucher và danh sách dài không che mất nút chính hoặc tràn màn hình.
- Gắn nhãn truy cập cho nút chỉ có biểu tượng khi phù hợp; bảo đảm nút disabled thật sự không kích hoạt.
- Không tuyên bố đã kiểm tra Android/iOS/web nếu chỉ chạy một môi trường.

## 6. Bộ dữ liệu test độc lập

**Đây là fixture kiểm thử đề xuất, không phải dữ liệu đang có trong repo.** Tạo trong vùng test TV3 theo schema thật, bổ sung các field bắt buộc từ type thực tế. Không đưa fixture vào dữ liệu sản phẩm hoặc build runtime. Không dùng ép kiểu để che thiếu field.

| Ký hiệu | Dữ liệu cho test |
| --- | --- |
| RA | Quán A, ID test riêng, deliveryFee = 15.000 |
| RB | Quán B, ID khác RA, deliveryFee = 20.000 |
| D1 | Món của RA, price = 30.000 |
| D2 | Món khác của RA, price = 20.000 |
| D3 | Món của RB, price = 40.000 |
| O1, O2 | Hai option hợp lệ của D1, extraPrice lần lượt 5.000 và 7.000 |
| N1, N2 | Ghi chú khác nhau: `Ít đá` và `Không đường` |
| V25 | Voucher test giảm cố định 25.000, minOrderValue = 60.000 |
| VS15 | Voucher test giảm ship 15.000; chỉ tạo khi contract có cách biểu diễn được xác nhận |
| T0 | Đồng hồ test cố định tại `2026-10-25T10:00:00+07:00` |
| Hạn còn hiệu lực | `2026-10-26T00:00:00+07:00` cho test timestamp, nếu schema hỗ trợ |
| Hạn đã qua | `2026-10-24T00:00:00+07:00` cho test timestamp, nếu schema hỗ trợ |

Nếu schema chỉ nhận ngày, chuyển fixture sang định dạng thật sau khi chốt múi giờ và quy tắc biên. Không phụ thuộc ngày chạy test hoặc ngày hệ thống; cố định clock bằng công cụ runner sẵn có và khôi phục sau test.

Giá trị tính tay dùng làm oracle độc lập:

```text
D1 + O1 + O2, quantity 2: (30.000 + 5.000 + 7.000) × 2 = 84.000
Thêm D2, quantity 1: subtotal = 84.000 + 20.000 = 104.000
Quán RA, không voucher: finalTotal = 104.000 + 15.000 = 119.000
Có V25 hợp lệ: finalTotal = 104.000 + 15.000 − 25.000 = 94.000
D1 không option, quantity 2: subtotal = 60.000
Giảm V25 ở đúng ngưỡng: finalTotal = 60.000 + 15.000 − 25.000 = 50.000
```

## 7. Test case và tiêu chí mong đợi

### 7.1. Cách dùng ma trận

- **P0:** bắt buộc để nhận phần lõi TV3 hoàn tất. **P1:** hồi quy, edge case và UI cần kiểm tra trước bàn giao.
- **U:** unit/store; **C:** component với mock ở ranh giới; **I:** tích hợp với module thật; **M:** thao tác trên app/device/emulator.
- Mỗi case reset store, mock, clock và dữ liệu; không phụ thuộc thứ tự chạy.
- `CHỜ CHỐT` nghĩa là expected phụ thuộc mục 1.2. Ghi quyết định trước khi viết assertion; chưa có quyết định thì đánh dấu `BLOCKED`, không tự chọn để pass.
- Case ghi nhiều lớp phải báo kết quả từng lớp riêng. Ví dụ U pass không đồng nghĩa I pass.
- So sánh số tiền thực, object payload và trạng thái trước/sau; không chỉ snapshot hoặc kiểm tra hàm “đã được gọi”. Expected không được tính bằng chính hàm đang test.

### 7.2. Cart và ràng buộc một quán

| ID | Ưu tiên/lớp | Tiền đề và thao tác | Kết quả mong đợi |
| --- | --- | --- | --- |
| C01 | P0 U/C | Khởi tạo giỏ rỗng, mở Cart | Không có dòng; tổng 0; không đặt đơn được; empty state đúng |
| C02 | P0 U | Thêm D1 vào RA, qty 1, không option | Một dòng đúng quán, qty 1, itemTotalPrice 30.000 |
| C03 | P0 U | Thêm D1 + O1 + O2, qty 2 | Giá dòng 84.000; giữ đủ 2 option |
| C04 | P0 U | Từ C03 thêm D2 qty 1 | Hai dòng; subtotal 104.000; ship 15.000 một lần |
| C05 | P0 U/C | D1 + O1 qty 1, bấm tăng | Qty 2; giá dòng 70.000; subtotal/total cùng cập nhật |
| C06 | P0 U/C | D1 + O1 qty 2, bấm giảm | Qty 1; giá dòng 35.000 |
| C07 | P1 U/C | Qty 1, bấm giảm | CHỜ CHỐT: xóa/xác nhận/khóa đúng quyết định; không có dòng qty 0 hoặc âm |
| C08 | P0 U/C | C04, xóa D2 rồi xóa dòng cuối | Sau lần 1 subtotal 84.000; sau lần 2 giỏ rỗng, tổng 0, không giữ quán/giảm giá cũ |
| C09 | P1 U | Thêm đúng cùng món/options/note hai lần | CHỜ CHỐT: gộp hoặc tách đúng quy tắc; tổng số lượng và tiền không mất/tăng sai |
| C10 | P0 U | Thêm D1 với O1, rồi D1 với O2 | Bảo toàn cấu hình riêng và giá đúng; không gộp làm mất option |
| C11 | P0 U/I | Thêm cấu hình giống nhau nhưng note N1 và N2 | Giữ nguyên hai ghi chú đúng dòng; nếu API chưa truyền note thì I BLOCKED |
| C12 | P1 U | Cùng tập options nhưng đảo thứ tự | CHỜ CHỐT quy tắc gộp; giá không đổi, không nhân đôi topping |
| C13 | P0 U | Với giỏ RA, gọi needsConfirmSwitch cho RA/RB; thử cả giỏ rỗng | RA không cần; RB cần khi giỏ có món; giỏ rỗng không cần |
| C14 | P0 U/C/I | Giỏ RA có voucher, chọn D3/RB rồi Hủy/đóng Alert | Toàn bộ giỏ/quán/voucher RA không đổi; nếu caller TV2 thiếu thì I BLOCKED |
| C15 | P0 U/C/I | C14 nhưng Đồng ý, dữ liệu D3 hợp lệ | Chỉ còn D3 của RB; ship 20.000; không giữ voucher RA không hợp lệ; không hiện Alert đôi |
| C16 | P0 U | Gọi addToCart trực tiếp với D3 khi đang có RA, không xác nhận | Không trộn quán hoặc tự xóa RA; tín hiệu từ chối/yêu cầu xác nhận đúng contract |
| C17 | P0 U | Thêm với qty lần lượt 0, -1, 1.5, NaN, Infinity | Từng đầu vào bị từ chối có kiểm soát; giỏ trước đó không đổi |
| C18 | P0 U | restaurant RA nhưng dish.restaurantId là RB | Từ chối; không tạo dòng/quán sai |
| C19 | P1 U | Thêm món rồi sửa quantity/options của giỏ | Object dish/options nguồn không bị mutate |
| C20 | P1 U/C | Bấm tăng 10 lần, rồi giảm 3 lần từ qty 1 | Qty cuối 8; tiền đúng; không mất cập nhật, không lỗi render |

### 7.3. Giá và voucher

| ID | Ưu tiên/lớp | Tiền đề và thao tác | Kết quả mong đợi |
| --- | --- | --- | --- |
| V01 | P0 U/C | Fixture subtotal 104.000, RA, không mã | Ship 15.000, discount 0, finalTotal 119.000; Cart/Checkout giống nhau |
| V02 | P0 U/C | V01, áp V25 đang còn hạn và đủ điều kiện | Discount 25.000, finalTotal 94.000; không giảm 50% theo tên mã |
| V03 | P0 U | Subtotal đúng 60.000, RA, áp V25 | Nếu ngưỡng tính subtotal: hợp lệ, total 50.000; CHỜ CHỐT basis trước assertion |
| V04 | P0 U/C | Subtotal 59.999, ship 15.000, áp V25 | Nếu basis subtotal: không hợp lệ, discount 0, total 74.999; không cộng ship để vượt ngưỡng |
| V05 | P0 U/C | Nhập mã không tồn tại | Lỗi rõ, không discount giả, không mất giỏ |
| V06 | P1 C | Nhập mã rỗng/chỉ khoảng trắng | Không áp mã rỗng; giỏ không đổi; UI không báo áp thành công |
| V07 | P1 U/C | Mã có chữ thường/khoảng trắng đầu cuối | CHỜ CHỐT chuẩn hóa; lookup nhất quán theo quyết định |
| V08 | P0 U/C | T0, áp voucher có hạn đã qua | Không hợp lệ; discount 0; thông báo hết hạn |
| V09 | P0 U | Clock ở trước, đúng, sau expiry một đơn vị thời gian được hỗ trợ | CHỜ CHỐT semantics biên/timezone; ba kết quả đúng quyết định, không tùy máy |
| V10 | P0 U/C | D1 qty 2 áp V25, giảm còn qty 1 | Theo basis subtotal: voucher không còn hiệu lực; discount 0; total 45.000, UI giải thích |
| V11 | P0 U/C | Fixture 104.000 đang áp V25, bỏ mã | Discount 0, total 119.000, items không đổi |
| V12 | P1 U/C | Áp V25 rồi áp mã hợp lệ khác | CHỜ CHỐT số mã; nếu một mã thì thay thế, không cộng dồn giảm cũ |
| V13 | P0 U | Subtotal 104.000, ship 15.000, VS15 hợp lệ | CHỜ CHỐT loại voucher; discount 15.000, total 104.000 |
| V14 | P0 U | Như V13 nhưng ship 10.000 | Nếu cap ship đã chốt: discount 10.000, total 104.000; không trừ thêm 5.000 vào món |
| V15 | P1 U | VS15 nhưng ship 0, subtotal 104.000 | Nếu cap ship đã chốt: discount 0, total 104.000 |
| V16 | P0 U | Voucher giảm món 25.000 đủ điều kiện, subtotal 20.000, ship 15.000 | Nếu cap subtotal đã chốt: discount 20.000, total 15.000; không âm |
| V17 | P0 U/C | Áp mã còn hạn, tiến clock qua hạn rồi submit | Revalidate; không tạo Order dùng discount đã hết hạn; UI báo/tính lại trước khi người dùng đặt với tiền mới |
| V18 | P1 U | Gọi calcPricing hai lần cùng input; kiểm tra input trước/sau | Output bằng nhau; không mutate items/options/restaurant/voucher |
| V19 | P0 U/C | Dữ liệu giá/ship/discount NaN, Infinity, âm hoặc thiếu bắt buộc | Báo lỗi có kiểm soát theo contract; không hiển thị NaN hay tạo đơn tiền sai |
| V20 | P1 U/C | Giỏ đang có mã hợp lệ, thử mã sai khác | CHỜ CHỐT giữ mã cũ hay bỏ; UI và discount đồng nhất, không báo mã sai được áp |

### 7.4. Checkout và bàn giao đơn

| ID | Ưu tiên/lớp | Tiền đề và thao tác | Kết quả mong đợi |
| --- | --- | --- | --- |
| O01 | P0 C/U | Giỏ rỗng, thử kích hoạt submit cả qua UI và handler | Không gọi placeOrder, không navigate |
| O02 | P0 C | Giỏ hợp lệ, chọn Tiền mặt | Payload dùng enum thật; tiền khớp UI; không gọi thanh toán ngoài |
| O03 | P0 C/M | Chọn Ví điện tử | UI nói rõ giả lập; payload đúng enum; không phát sinh giao dịch thật |
| O04 | P0 C | Payment thiếu/không hợp lệ theo contract rồi submit | Chặn hoặc yêu cầu chọn; không tự đoán giá trị enum |
| O05 | P0 C | Fixture 104.000/ship 15.000/V25, placeOrder trả thành công | Gọi 1 lần; payload đủ items/options/note, subtotal 104.000, discount 25.000, finalTotal 94.000 |
| O06 | P0 C | Hoàn tất O05 | Chỉ clear sau thành công; navigate đúng route thật với ID do contract cung cấp; không ID giả |
| O07 | P0 U/C | Sau tạo đơn, clear giỏ rồi thêm/sửa món trong giỏ mới | Snapshot Order cũ, giá và note không đổi |
| O08 | P0 C | placeOrder throw/reject/báo thất bại theo từng dạng contract hỗ trợ | Không clear, không navigate, giữ dữ liệu nhập, mở khóa và thông báo lỗi |
| O09 | P0 C | Hai lần tap liên tiếp trước render, hoặc nhiều lần trong lúc async pending | Chỉ một lần gọi placeOrder; không hai Order; nút có trạng thái xử lý đúng |
| O10 | P0 C | API xác nhận thất bại chưa tạo đơn, người dùng thử lại sau khi sửa lỗi | Một lần gọi mới cho lần retry; nếu thành công chỉ một Order thực được tạo |
| O11 | P0 C | API đã tạo đơn thành công nhưng navigate lỗi | Không submit lại để sửa navigation; báo đã tạo đơn và lỗi mở tracking; không tạo trùng |
| O12 | P0 C | Trong lúc submit, thử tăng/xóa món hoặc quay lại sửa giỏ | Snapshot ổn định; thao tác bị khóa hoặc xử lý theo contract không làm mất giỏ mới |
| O13 | P0 C | Voucher/giỏ thay đổi ngay trước submit | Kiểm tra lại state mới nhất; không gửi số tiền stale; không âm thầm đặt với giá mới chưa hiển thị |
| O14 | P1 C/I | Kiểm tra orderId, createdAt, status ở Order mới | Đúng type/nguồn tạo; ID không trùng theo cơ chế thật; trạng thái ban đầu PLACED; TV3 không tự chuyển trạng thái |
| O15 | P0 I/M | Checkout thật → orderStore thật → Tracking → History | Đúng orderId và tổng tiền, xuất hiện một đơn, giỏ rỗng; lỗi TV4/route ghi nhận bàn giao, không sửa ngoài quyền |

### 7.5. UI, tích hợp, phạm vi và minh chứng

| ID | Ưu tiên/lớp | Tiền đề và thao tác | Kết quả mong đợi |
| --- | --- | --- | --- |
| Q01 | P0 I/M | TV2 chọn món/size/topping/note, thêm vào cart thật | Dữ liệu và tiền đúng từ đầu vào đến Cart; phần thiếu contract ghi BLOCKED |
| Q02 | P1 M | Màn nhỏ; tên món/note dài; nhiều dòng; mở bàn phím voucher | Không overflow, đọc được giá, cuộn và thao tác được, nút chính không bị che không thể truy cập |
| Q03 | P1 C/M | Xóa dòng cuối, quay lại Cart và Checkout | Empty state nhất quán; không còn tổng/voucher cũ; không đặt đơn được |
| Q04 | P1 C/M | Đọc voucher lỗi, đặt đơn lỗi, thử lại | Thông báo có lý do, không mất món; nút disabled/loading phản ánh trạng thái thật |
| Q05 | P0 kiểm tra | Chạy typecheck và test TV3 bằng lệnh đã xác minh | Ghi kết quả thật; lỗi baseline/ngoài phạm vi được tách, không che hoặc tự sửa |
| Q06 | P0 kiểm tra | Review diff, staged diff và file mới so với đầu phiên | Mọi thay đổi của Codex trong allowlist hoặc ngoại lệ đã được chấp thuận; không sửa lockfile/mock chung ngoài ý muốn |
| Q07 | P0 kiểm tra | Đối chiếu báo cáo với log từng case | Không có PASS không bằng chứng; mock/component khác integration thật; skipped/not-run hiện rõ |
| Q08 | P1 kiểm tra | Rerun suite với store/clock reset và thứ tự độc lập nếu runner hỗ trợ | Không rò state/mock/timer, không phụ thuộc ngày hiện tại hoặc thứ tự test |

**Tổng cộng: 63 test case thiết kế.** Số này không có nghĩa 63 test đã được viết hoặc đã chạy. Case `CHỜ CHỐT` và integration thiếu dependency phải tiếp tục được ghi rõ trong kết quả.

## 8. Cách triển khai test trong repository

1. Dùng test runner/dependency hiện có, không mặc định repo có Jest, Vitest hoặc React Native Testing Library.
2. Ưu tiên test tự động cho tiền, state, ràng buộc quán, voucher, snapshot và submit lặp. UI layout/keyboard có thể kiểm tra thủ công khi không có công cụ phù hợp.
3. Mock dữ liệu, clock, navigation và ranh giới orderStore trong unit/component test; chạy integration riêng với module thật. Không mock chính `calcPricing` trong test tính tiền của nó.
4. Test lỗi phải chủ động tạo điều kiện lỗi; không chỉ kiểm tra happy path. Với Promise, dùng điều khiển resolve/reject của runner sẵn có; tránh sleep tùy tiện.
5. Fixture không sửa JSON chung, không gọi backend thật. Mỗi test cô lập store và khôi phục mock/clock sau chạy.
6. Nếu chưa có runner, có thể viết test TV3 theo công cụ đã được nhóm xác nhận, nhưng chưa chạy phải ghi NOT_RUN. Không thêm dependency/config chung khi chưa được phép. Ghi đề xuất tối thiểu cho TV1 và thực hiện các kiểm tra thủ công khả dụng.
7. Không bịa lệnh `npm test`, `test:cart`, `lint`, `build`. Chỉ dùng script đã đọc được hoặc executable hiện có với cách gọi được xác minh. Không chạy `npx` để tự tải runner mới ngoài phạm vi.
8. Sau code/test pass, chỉ chạy lại phần liên quan khi có sửa đổi, lỗi hoặc rủi ro chưa giải quyết. Không kéo dài bằng các lượt test trùng lặp không thêm bằng chứng.

Mẫu ghi kết quả:

| Case/lớp | Trạng thái | Lệnh hoặc bước thật | Môi trường/commit hoặc trạng thái worktree | Bằng chứng và giới hạn |
| --- | --- | --- | --- | --- |
| C03/U | NOT_RUN | Chưa chạy | Chưa có repository trong lúc soạn tài liệu | Chỉ là test case thiết kế |
| O15/I | NOT_RUN | Chưa chạy | Chưa có app/device | Chưa xác minh orderStore/Tracking/History thật |

Trạng thái hợp lệ: `PASS`, `FAIL`, `BLOCKED`, `NOT_RUN`, `SKIPPED`. `SKIPPED` không được tính là pass. Báo riêng số test tự động và số scenario thủ công.

## 9. Những gì bắt buộc phải note kỹ

Ghi trong `src/screens/cart/TV3_NOTES.md` hoặc vị trí tài liệu TV3 đã được đồng ý. Không biến notes thành danh sách “đã làm” không kiểm chứng.

```markdown
# TV3 — Cart, Voucher & Checkout: ghi chú bàn giao

## Trạng thái
- Ngày/giờ và branch:
- Commit nếu có; nếu chưa commit ghi worktree chưa commit:
- Phạm vi file đã thay đổi:
- Baseline lỗi/thay đổi có sẵn trước phiên:
- Mức hoàn thành: đang làm / phần độc lập xong / chờ tích hợp / đủ nghiệm thu.

## Contract đã xác minh
| API/type | File/symbol thật | Input/output và semantics | Caller/owner |
| --- | --- | --- | --- |

## Quyết định nghiệp vụ
| Vấn đề | Quyết định | Căn cứ hoặc ai xác nhận, khi nào | Test liên quan |
| --- | --- | --- | --- |

## Chưa rõ / blocker
| Vấn đề | Bằng chứng | Ảnh hưởng | Đề xuất tối thiểu | Người phụ trách |
| --- | --- | --- | --- | --- |

## Test đã thực hiện
- Lệnh, thời điểm, exit code:
- PASS / FAIL / BLOCKED / NOT_RUN / SKIPPED:
- Case ID → test file/test name hoặc kịch bản thủ công:
- Môi trường thật; phần nào dùng mock:
- Log/ảnh minh chứng nếu có; không tự điền đường dẫn chưa tạo.

## Cách demo phần TV3
- Tiền đề dữ liệu thật:
- Các bước Cart → Voucher → Checkout:
- Số tiền kỳ vọng đã tính độc lập:
- Giới hạn và lỗi chưa xử lý:

## Phối hợp
- TV1: schema/route/hạ tầng còn thiếu:
- TV2: addToCart, size, note, xác nhận khác quán:
- TV4: placeOrder, ID, snapshot, tracking/history:
- TV5: dữ liệu voucher/địa chỉ còn thiếu:

## Kiểm soát phạm vi
- File thay đổi ngoài allowlist: không có / ngoại lệ được xác nhận cụ thể.
- Không tự commit/push/merge nếu chưa được giao.
```

Giải thích đủ để TV3 tự bảo vệ được: công thức giá topping theo quantity; vì sao một giỏ một quán; cách chặn voucher stale; thời điểm clear; snapshot Order; chống submit trùng; giới hạn kiểm thử bằng mock. Không tự viết slide hoặc nhận phần demo/timer của TV4.

## 10. Điều kiện hoàn thành và mẫu báo cáo cuối

Chỉ báo **“hoàn tất phần TV3”** khi:

- [ ] Thay đổi nằm trong phạm vi được phép, branch đúng, công việc có sẵn được bảo toàn.
- [ ] Cart, voucher và checkout làm đúng yêu cầu/contract đã chốt.
- [ ] Các blocker nghiệp vụ ảnh hưởng kết quả đã giải quyết; không còn hardcode che thiếu contract.
- [ ] P0 phần độc lập của TV3 có bằng chứng pass; các P1 lỗi/chưa chạy được báo rõ.
- [ ] Typecheck của thay đổi không tạo lỗi mới; tình trạng check toàn repo được báo chính xác.
- [ ] Tích hợp thật Q01/O15 đã kiểm tra nếu tuyên bố luồng hoàn tất. Nếu mới mock pass, chỉ báo “phần độc lập đã kiểm thử, chờ tích hợp”.
- [ ] Đặt đơn thành công clear đúng lúc; thất bại giữ giỏ; không nhân đôi đơn do tap lặp.
- [ ] Notes, test mapping, quyết định nghiệp vụ và hướng dẫn bàn giao đã cập nhật.
- [ ] Không tự commit/push/merge hoặc sửa module khác.

Mẫu phản hồi cho người dùng:

```text
Đã làm: [chức năng TV3 thực sự hoàn thành].
File sửa: [đường dẫn thực, lý do].
Đã kiểm tra: [lệnh/kịch bản, kết quả thật, môi trường, phần mock].
Chưa kiểm tra/bị chặn: [case, lý do, người phụ trách].
Quyết định cần chốt: [chỉ các điểm còn thiếu, không hỏi lại].
Phạm vi: [xác nhận diff; nêu ngoại lệ nếu có].
Bước tiếp theo: [hành động cụ thể trong TV3 hoặc bàn giao cần thiết].
```

**Không dùng “xong 100%”, “mọi test đều pass”, “không còn bug” hoặc “E2E đã chạy” khi bằng chứng chưa đáp ứng. Hoàn thành một phần đúng phạm vi và báo rõ blocker tốt hơn tự làm thay cả nhóm để tạo cảm giác hoàn chỉnh.**
