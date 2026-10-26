**TÀI LIỆU KẾ HOẠCH & PHÂN CÔNG DỰ ÁN MÔN MOBILE APP**

# XÂY DỰNG ỨNG DỤNG ĐẶT ĐỒ ĂN GRABFOOD-LIKE CLIENT

Lộ trình Tốc chiến 7 Ngày (22/10/2026 – 29/10/2026)  |  Quy mô: 5 Thành viên  |  Mục tiêu: Sản phẩm MVP & Thuyết trình

> **Ghi chú cá nhân:** Tôi là **Thành viên 3**, phụ trách **Giỏ hàng, Voucher và Thanh toán (Cart, Voucher & Checkout Dev)**, làm việc trên nhánh `feat/cart-checkout`.

| Thông tin | Chi tiết |
| --- | --- |
| Đề tài dự án: | GrabFood-like Client (Mobile App) |
| Số lượng thành viên: | 05 Sinh viên |
| Ngày bắt đầu: | Thứ Năm, 22/10/2026 |
| Hạn thuyết trình: | Thứ Năm, 29/10/2026 |
| Kiến trúc dữ liệu: | Mock JSON / Firebase + Local State |
| Sản phẩm bàn giao: | Source Code + App Demo + Slide |

## PHẦN 1: ĐỊNH HƯỚNG CHIẾN LƯỢC & PHẠM VI SẢN PHẨM (MVP)

Với quỹ thời gian 7 ngày cho 5 thành viên, rủi ro lớn nhất của đồ án Mobile App là sa đà vào việc xây dựng Backend phức tạp, tích hợp bản đồ GPS thời gian thực hoặc làm thêm phân hệ cho Chủ quán/Tài xế dẫn đến không kịp ghép code. Do đó, nguyên tắc cốt lõi của nhóm là: Tập trung 100% vào giao diện mượt mà và luồng đặt món khép kín (End-to-End Customer Flow) của phân hệ Khách hàng (Client App).

### 1.1. Bảng phân định Phạm vi Tính năng (In-Scope vs. Out-of-Scope)

| Phân hệ (Module) | Tính năng BẮT BUỘC hoàn thành (MVP In-Scope) | Tính năng LƯỢC BỎ / GIẢ LẬP (Out-of-Scope) |
| --- | --- | --- |
| 1. Khám phá & Tìm kiếm<br>(Home & Discovery) | • Banner quảng cáo, danh mục món ăn (Trà sữa, Cơm, Bún/Phở, Fastfood).<br>• Danh sách quán ăn nổi bật (ảnh, sao, khoảng cách, thời gian giao).<br>• Tìm kiếm theo tên quán/món ăn và lọc theo danh mục. | • Không dùng GPS thực tế lấy vị trí động (chỉ hiển thị địa chỉ giao hàng mặc định có thể đổi bằng text).<br>• Không dùng thuật toán gợi ý AI. |
| 2. Cửa hàng & Thực đơn<br>(Restaurant & Menu) | • Trang thông tin quán ăn (Ảnh bìa, tên quán, đánh giá, phí ship dự kiến).<br>• Danh sách món ăn chia theo nhóm thực đơn.<br>• Bottom Sheet chọn Size (S/M/L), Topping và Ghi chú món ăn. | • Không làm hệ thống bình luận/đánh giá tải ảnh phức tạp (chỉ hiển thị danh sách review mẫu). |
| 3. Giỏ hàng & Thanh toán<br>(Cart & Checkout) | • Thêm/tăng/giảm/xóa món trong giỏ hàng; tự động cập nhật tổng tiền.<br>• Kiểm tra ràng buộc: 1 giỏ hàng chỉ chứa món của 1 quán.<br>• Áp mã giảm giá (Voucher) và chọn phương thức thanh toán. | • Không tích hợp cổng thanh toán ngân hàng/MoMo thật (chỉ chọn Tiền mặt hoặc Ví điện tử giả lập). |
| 4. Theo dõi Đơn hàng<br>(Order Tracking) | • Màn hình trạng thái đơn hàng trực quan 4 bước: Đã nhận đơn -> Quán đang chuẩn bị -> Tài xế đang giao -> Đã giao thành công.<br>• Lưu đơn vào mục Lịch sử đơn hàng (Đang giao / Đã hoàn thành). | • Không làm bản đồ di chuyển xe máy thời gian thực (dùng ảnh bản đồ minh họa tĩnh + bộ đếm Timer 5s tự chuyển trạng thái để Demo). |
| 5. Tài khoản & Dữ liệu<br>(Auth & Profile) | • Màn hình Splash, Đăng nhập / Đăng ký cơ bản.<br>• Trang thông tin cá nhân, Sổ địa chỉ đã lưu và nút Đăng xuất. | • Không cần xác thực OTP qua SMS thật (dùng Firebase Auth cơ bản hoặc tài khoản mẫu có sẵn). |

### 💡 MẸO ĂN ĐIỂM KHI DEMO TRƯỚC GIẢNG VIÊN:

1. Tại màn hình Theo dõi đơn hàng (Order Tracking), hãy gắn một bộ đếm (Timer tự động chuyển trạng thái sau mỗi 5 giây) HOẶC một nút bấm nhỏ 'Chuyển trạng thái tiếp theo (Demo Mode)' để ngay trên bục giảng, giảng viên thấy được đơn hàng chạy từ lúc Đặt đơn -> Đang giao -> Hoàn tất và nhảy sang tab Lịch sử.

2. Đầu tư bộ ảnh món ăn và quán ăn thật bắt mắt (lấy từ Unsplash hoặc dữ liệu GrabFood thực tế) lưu vào file JSON mẫu. Giao diện đẹp quyết định 50% ấn tượng ban đầu.

## PHẦN 2: PHÂN CÔNG NHÂN SỰ & TRÁCH NHIỆM (5 THÀNH VIÊN)

Để 5 người có thể lập trình song song mà không bị chờ đợi nhau hay xung đột code (Git Conflict), dự án được chia theo mô hình Vertical Slices (mỗi người phụ trách trọn vẹn một cụm màn hình độc lập) kết hợp với 1 bộ khung dữ liệu chung:

| Mã TV & Họ Tên | Vai trò | Màn hình & Chức năng phụ trách | Nhánh Git | Đầu ra nghiệm thu (Deliverables) |
| --- | --- | --- | --- | --- |
| Thành viên 1<br>(Team Lead)<br>[Điền tên: ............] | Core Architect &<br>Home Screen | • Khởi tạo Base Project, cấu hình Router/Navigation, Theme (màu sắc, font).<br>• Xây dựng các class Data Model chung.<br>• Code màn hình Trang chủ (Home), Tìm kiếm (Search) và Lọc danh mục (Category Filter). | `feat/core-home` | • Base code chạy ổn định.<br>• Màn hình Home hiển thị danh sách quán, tìm kiếm & lọc mượt mà. |
| Thành viên 2<br>[Điền tên: ............] | Restaurant &<br>Menu Developer | • Màn hình Chi tiết quán ăn (Header ảnh quán, thông tin, tab danh mục món).<br>• Danh sách món ăn trong quán.<br>• Màn hình / Bottom Sheet chọn chi tiết món (Size, Topping, Số lượng, Ghi chú). | `feat/store-menu` | • Xem được chi tiết quán.<br>• Chọn được món + topping và truyền đúng dữ liệu vào Giỏ hàng. |
| Thành viên 3<br>[Điền tên: ............] | Cart, Voucher &<br>Checkout Dev | • Xây dựng State Management cho Giỏ hàng (Cart Provider/Store).<br>• Màn hình Giỏ hàng (tăng/giảm/xóa món) & cảnh báo khi thêm món khác quán.<br>• Màn hình Thanh toán (Checkout) & Áp mã giảm giá (Voucher). | `feat/cart-checkout` | • Tính đúng: Tạm tính + Phí ship - Giảm giá = Tổng thanh toán.<br>• Tạo được đối tượng Order khi bấm Đặt đơn. |
| Thành viên 4<br>[Điền tên: ............] | Order Tracking &<br>History Dev | • Màn hình Theo dõi đơn hàng trực tiếp (Stepper 4 bước trạng thái + thông tin tài xế giả lập).<br>• Cơ chế tự động chuyển trạng thái đơn hàng khi Demo.<br>• Màn hình Lịch sử đơn hàng (Đang đến / Đã hoàn tất) & Đặt lại đơn. | `feat/order-tracking` | • Hiệu ứng chuyển trạng thái đơn hàng trực quan.<br>• Lưu và xem lại được các đơn vừa đặt. |
| Thành viên 5<br>[Điền tên: ............] | Auth, Profile,<br>Mock Data & Slide | • Màn hình Splash, Onboarding, Đăng nhập / Đăng ký & Trang cá nhân (Profile).<br>• Chuẩn bị toàn bộ file JSON dữ liệu mẫu (10 quán, 40 món ăn, 5 mã giảm giá).<br>• Thiết kế Slide thuyết trình & quay video Demo dự phòng. | `feat/auth-profile` | • Luồng đăng nhập hoàn chỉnh.<br>• Bộ dữ liệu JSON giàu hình ảnh.<br>• Slide báo cáo & Video Demo. |

## PHẦN 3: KIẾN TRÚC KỸ THUẬT, DATA SCHEMA & QUY TRÌNH GIT

### 3.1. Cấu trúc Thư mục Chuẩn (Folder Structure)

Tất cả thành viên tuân thủ đúng cấu trúc thư mục dưới đây (áp dụng tương đương cho Flutter, React Native hoặc Android Kotlin) để dễ dàng ghép code vào ngày Thứ Hai:

- **models/:** Chứa định nghĩa cấu trúc dữ liệu (restaurant, dish, option_item, cart_item, order, voucher, user).

- **data/ hoặc assets/mock/:** Chứa file JSON dữ liệu mẫu (restaurants.json, vouchers.json) và dữ liệu khởi tạo ban đầu.

- **providers/ hoặc store/ (State Management):** Chứa bộ quản lý trạng thái toàn cục: AuthProvider, CartProvider, OrderProvider.

- **screens/ (Views):** Chia làm 5 thư mục con tương ứng với 5 thành viên (home/, restaurant/, cart/, order/, auth/) để không ai sửa nhầm vào file của người khác.

- **widgets/ hoặc components/:** Chứa các thành phần giao diện dùng chung (Button, FoodCard, PriceTag, LoadingShimmer).

### 3.2. Thống nhất Cấu trúc Dữ liệu (Data Schema) — Chốt ngay Ngày 1

Để tránh tình trạng người dùng biến 'price', người dùng biến 'cost' gây lỗi khi ghép code, cả nhóm thống nhất các trường dữ liệu cốt lõi sau:

| Đối tượng (Model) | Các trường dữ liệu chính (Fields) | Ghi chú nghiệp vụ cho các thành viên |
| --- | --- | --- |
| Restaurant<br>(Quán ăn) | `id, name, imageUrl, address, rating, reviewCount, deliveryTime (phút), distance (km), deliveryFee, categoryId, isPromo` | TV1 hiển thị ngoài trang Home; TV2 nhận đối tượng này (hoặc id) để mở trang Chi tiết quán. |
| Dish & Option<br>(Món ăn & Topping) | `id, restaurantId, categoryName, name, description, price, imageUrl, options: [{id, name, extraPrice}]` | TV5 chuẩn bị ít nhất 4–6 món cho mỗi quán. TV2 hiển thị danh sách món và các lựa chọn Topping. |
| CartItem<br>(Món trong giỏ) | `id, dish, restaurantId, restaurantName, quantity, selectedOptions[], note, itemTotalPrice` | Công thức: itemTotalPrice = (dish.price + tổng extraPrice của options) \* quantity. |
| Voucher<br>(Mã giảm giá) | `code, title, discountAmount, minOrderValue, expiryDate` | Ví dụ: 'GRAB50' giảm 25.000đ cho đơn từ 60.000đ; 'FREESHIP' giảm 15.000đ phí giao hàng. |
| Order<br>(Đơn hàng) | `orderId, createdAt, restaurantName, items[], subtotal, deliveryFee, discount, finalTotal, paymentMethod, status` | status gồm 4 giá trị: 'PLACED' -> 'PREPARING' -> 'DELIVERING' -> 'COMPLETED'. |

### 3.3. Quy tắc Git Workflow để Không Xung đột Code

- **Nhánh chính:** Nhánh 'main' (chỉ chứa code hoàn chỉnh để đi thuyết trình) và nhánh 'develop' (nhánh ghép code chung của 5 người).

- **Nguyên tắc làm việc:** Không ai code trực tiếp trên 'main' hoặc 'develop'. Mỗi thành viên checkout nhánh riêng theo phân công (ví dụ: git checkout -b feat/store-menu).

- **Ghép code (Merge):** Mỗi tối sau buổi họp 21:30, các thành viên tạo Pull Request vào nhánh 'develop'. Thành viên 1 (Team Lead) kiểm tra và duyệt Merge.

## PHẦN 4: LỘ TRÌNH TRIỂN KHAI CHI TIẾT 7 NGÀY (22/10 – 29/10/2026)

Kế hoạch dưới đây chia nhỏ khối lượng công việc theo từng ngày cụ thể. Mốc quan trọng nhất là tối Thứ Hai (26/10) phải ghép xong toàn bộ luồng chạy của ứng dụng:

| Thời gian | Mục tiêu trọng tâm | Chi tiết công việc theo Thành viên | Cột mốc nghiệm thu (Milestone) |
| --- | --- | --- | --- |
| Ngày 1<br>Tối Thứ 5 (22/10)<br>& Thứ 6 (23/10) | Khởi tạo Base Project &<br>Chuẩn bị Dữ liệu mẫu | • Cả nhóm: Họp 45p chốt công nghệ, thống nhất bảng màu & Data Models.<br>• TV1: Tạo Git repo, dựng cấu trúc thư mục, cài Router, tạo sẵn 5 màn hình khung.<br>• TV5: Soạn xong file JSON dữ liệu mẫu (10 quán, 40 món ăn) + thiết kế màn Login.<br>• TV2, TV3, TV4: Clone repo, dựng khung giao diện tĩnh màn hình của mình. | 100% thành viên chạy được Base App trên máy cá nhân; có sẵn file JSON dữ liệu. |
| Ngày 2<br>Thứ 7 (24/10) | Hoàn thiện Giao diện Tĩnh (Static UI) toàn bộ màn hình | • TV1: Code xong giao diện Home (Banner, ô Search, Grid danh mục, Card quán ăn).<br>• TV2: Code xong UI Chi tiết quán và Bottom Sheet chọn Size/Topping.<br>• TV3: Code xong UI Giỏ hàng và màn hình Thanh toán (Checkout).<br>• TV4: Code xong UI Theo dõi đơn hàng (Stepper 4 bước) & Lịch sử đơn.<br>• TV5: Code xong UI Splash, Login, Register và Profile. | Hoàn thành 85% giao diện tĩnh; có thể bấm chuyển qua lại giữa các màn hình. |
| Ngày 3<br>Chủ Nhật (25/10) | Kết nối Dữ liệu thật &<br>Xây dựng State Giỏ hàng | • TV1: Đổ dữ liệu JSON vào màn hình Home, xử lý logic Tìm kiếm & Lọc theo danh mục.<br>• TV2: Đổ danh sách món theo restaurantId, tính giá món khi tick chọn Topping.<br>• TV3: Hoàn thiện CartProvider (thêm, xóa, tăng/giảm số lượng, áp mã Voucher).<br>• TV4: Viết OrderProvider nhận đơn hàng mới từ Checkout và chạy bộ đếm trạng thái.<br>• TV5: Lưu trạng thái Đăng nhập & khởi thảo khung Slide thuyết trình. | Các chức năng tính toán tiền, lọc món, thêm vào giỏ hoạt động đúng logic. |
| Ngày 4<br>Thứ 2 (26/10) | Ghép nối End-to-End<br>(Integration Day) | • Sáng – Chiều: Cả 5 thành viên tạo Pull Request và merge code vào nhánh 'develop'.<br>• Tối (Họp chung): Kết nối luồng xuyên suốt: Login -> Home -> Chọn quán -> Chọn món & Topping -> Vào Giỏ hàng -> Áp Voucher -> Đặt đơn -> Xem Tracking -> Lưu vào Lịch sử.<br>• Xử lý lỗi truyền tham số giữa các màn hình. | Chạy thông suốt luồng đặt đồ ăn từ đầu đến cuối trên 1 bản cài đặt duy nhất. |
| Ngày 5<br>Thứ 3 (27/10) | Đóng băng Tính năng (Code Freeze), Polish UI & Quay Video | • Không thêm tính năng mới. Tập trung bắt lỗi (Bug fixing) và làm đẹp UI.<br>• Bổ sung Empty State (khi giỏ hàng trống), thông báo Toast khi thêm món thành công, hộp thoại xác nhận khi đổi quán.<br>• 21:00 tối: Quay 1 video màn hình (Screen Recording) luồng chạy mượt nhất làm phương án dự phòng. | App không còn lỗi Crash; có sẵn 1 Video Demo Full HD nhúng vào Slide. |
| Ngày 6<br>Thứ 4 (28/10) | Hoàn thiện Slide &<br>Tập dượt Thuyết trình (Dry Run) | • Sáng – Chiều: TV5 hoàn thiện Slide từ ảnh chụp màn hình thật của App và sơ đồ kiến trúc của TV1.<br>• 21:00 tối: Họp toàn nhóm chạy thử thuyết trình bấm giờ (10–15 phút). Phân công người điều khiển máy Demo và người trả lời từng nhóm câu hỏi phản biện. | Slide hoàn chỉnh 100%; 5 thành viên nắm vững phần trình bày và code của mình. |
| Ngày 7<br>Thứ 5 (29/10) | Thuyết trình &<br>Bảo vệ Đồ án trên lớp | • Có mặt trước 30 phút để kiểm tra cáp nối máy chiếu, mạng Wi-Fi/4G và mở sẵn máy ảo (Emulator) / thiết bị thật.<br>• Thực hiện thuyết trình tự tin, Live Demo theo kịch bản đã tập dượt. | Bảo vệ thành công dự án trước giảng viên. |

## PHẦN 5: CẤU TRÚC SLIDE & KỊCH BẢN LIVE DEMO (THỨ NĂM, 29/10)

### 5.1. Bố cục Slide Báo cáo Tiêu chuẩn (10 – 12 Slides / 10 – 12 Phút)

| Phần / Slide | Nội dung trình bày trên Slide | Người trình bày gợi ý | Thời lượng |
| --- | --- | --- | --- |
| 1. Mở đầu<br>(Slide 1–2) | Tên đề tài, danh sách 5 thành viên, bài toán đặt đồ ăn trực tuyến và phạm vi phân hệ Client App. | Thành viên 5 | 1.5 phút |
| 2. Kiến trúc & Công nghệ<br>(Slide 3–4) | Công nghệ sử dụng, cấu trúc thư mục dự án (Folder Structure), giải pháp Quản lý trạng thái (State Management). | Thành viên 1<br>(Team Lead) | 2.0 phút |
| 3. Thiết kế Dữ liệu & UI<br>(Slide 5–6) | Sơ đồ liên kết các Data Model (User - Restaurant - Dish - Cart - Order) và sơ đồ luồng màn hình (Screen Flow). | Thành viên 2 | 1.5 phút |
| 4. LIVE DEMO SẢN PHẨM<br>(Slide 7) | Trình diễn trực tiếp trên máy ảo/điện thoại thật theo kịch bản người dùng đặt món từ A đến Z (có video dự phòng). | Thành viên 3 &<br>Thành viên 4 | 4.0 phút |
| 5. Điểm nhấn Kỹ thuật<br>(Slide 8–9) | Giải thích thuật toán tính giỏ hàng (Topping + Voucher), kiểm soát giỏ hàng khác quán và cơ chế mô phỏng trạng thái đơn. | Thành viên 3 &<br>Thành viên 4 | 2.0 phút |
| 6. Tổng kết & Đóng góp<br>(Slide 10–11) | Bảng tỷ lệ đóng góp (Commits & Màn hình) của 5 thành viên, hạn chế hiện tại và hướng phát triển tiếp theo. | Thành viên 1 | 1.0 phút |

### 5.2. Kịch bản Live Demo 5 Bước 'Không góc chết'

Khi lên thuyết trình, tuyệt đối không bấm ngẫu nhiên. Người điều khiển máy tính và người thuyết minh phải đi đúng kịch bản câu chuyện sau:

- **Bước 1 — Đăng nhập & Khám phá (45 giây):** Mở app từ màn hình Login -> Đăng nhập nhanh -> Lướt màn hình Home giới thiệu Banner, bấm lọc danh mục 'Trà sữa' hoặc gõ tìm kiếm 'Highlands / Tocotoco'.

- **Bước 2 — Xem Quán & Tuỳ chọn Topping (60 giây):** Chọn 1 quán ăn -> Cuộn xem menu -> Bấm vào 1 món mở Bottom Sheet -> Chọn Size L, tick thêm 2 loại Topping, nhập ghi chú 'Ít đá, 50% đường' -> Bấm 'Thêm vào giỏ hàng' (giá tiền tự động nhảy).

- **Bước 3 — Kiểm tra Ràng buộc & Áp Voucher (60 giây):** Mở Giỏ hàng -> Tăng số lượng lên 2 ly -> Bấm chọn mã giảm giá 'GRAB50' (chỉ cho giảng viên thấy tổng tiền giảm xuống ngay lập tức) -> Chọn thanh toán 'Ví điện tử / Tiền mặt' -> Bấm 'Đặt đơn'.

- **Bước 4 — Theo dõi Tiến trình Giao hàng (45 giây):** Màn hình chuyển sang Order Tracking -> Trình chiếu tiến trình chuyển tự động từ 'Đã đặt đơn' -> 'Quán đang chuẩn bị' -> 'Tài xế đang giao' -> 'Hoàn thành'.

- **Bước 5 — Kiểm tra Lịch sử & Hồ sơ (30 giây):** Mở tab 'Đơn hàng' để chứng minh đơn vừa đặt đã được lưu vào Lịch sử kèm đầy đủ chi tiết món và tổng tiền.

## PHẦN 6: QUY TẮC PHỐI HỢP NHÓM & CHECKLIST TRƯỚC GIỜ THUYẾT TRÌNH

### 📌 NỘI QUY HỌP NHANH 15 PHÚT MỖI TỐI (21:30 HÀNG NGÀY TRÊN GOOGLE MEET / DISCORD):

- Mỗi thành viên chỉ cần trả lời ngắn gọn 3 câu hỏi: (1) Hôm nay đã code xong màn hình/chức năng nào? (2) Ngày mai sẽ làm gì? (3) Có đang bị vướng lỗi (bug) nào quá 2 tiếng chưa giải quyết được không?

- Quy tắc cứu viện: Bất kỳ ai bị kẹt lỗi quá 2 giờ phải báo ngay lên nhóm chat để Team Lead (TV1) hoặc các bạn khác hỗ trợ, tuyệt đối không giữ im lặng đến sát ngày ghép code.

- Tôn trọng Deadline nội bộ: Mọi phần giao diện tĩnh phải xong vào tối Thứ Bảy (24/10) và logic phải xong vào tối Chủ Nhật (25/10) để Thứ Hai (26/10) ghép nối toàn bộ.

### Checklist Kiểm tra Lần cuối vào Tối Thứ Tư (28/10/2026)

- [ ] Tất cả hình ảnh quán ăn và món ăn đều hiển thị sắc nét, không có ảnh nào bị lỗi đường dẫn (404 Broken Image).

- [ ] Không còn lỗi tràn giao diện (Overflow) hoặc chữ đè lên nhau trên màn hình điện thoại.

- [ ] Giỏ hàng tính đúng công thức: Tổng thanh toán = Tạm tính (gồm Topping) + Phí giao hàng - Giảm giá Voucher.

- [ ] Khi hoàn tất đặt hàng, giỏ hàng được làm rỗng (Clear Cart) và đơn mới xuất hiện ngay trong tab Lịch sử đơn hàng.

- [ ] Đã xuất sẵn 01 file cài đặt (.apk hoặc bản build chạy ổn định) + 01 Video quay màn hình dự phòng lưu trong USB và Google Drive.

- [ ] Cả 5 thành viên đều đã đọc hiểu toàn bộ luồng code trong nhánh của mình để sẵn sàng trả lời câu hỏi vấn đáp cá nhân từ giảng viên.
