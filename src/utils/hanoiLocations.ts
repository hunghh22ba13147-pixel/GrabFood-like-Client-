export type HanoiPlace = {
  id: string;
  name: string;
  fullAddress: string;
  district: string;
  category: 'Đại học' | 'TTTM & Tòa nhà' | 'Khu đô thị' | 'Bệnh viện' | 'Danh thắng & Bến xe' | 'Đường phố';
  latitude: number;
  longitude: number;
  keywords?: string[];
};

export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  let result = str.toLowerCase();
  result = result.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  result = result.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  result = result.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  result = result.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  result = result.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  result = result.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  result = result.replace(/đ/g, 'd');
  return result.trim();
}

// Bảng dữ liệu địa điểm trọng điểm phủ khắp Hà Nội
export const HANOI_DATABASE: HanoiPlace[] = [
  // --- ĐẠI HỌC & HỌC VIỆN ---
  {
    id: 'uni-1',
    name: 'Đại học Bách Khoa Hà Nội',
    fullAddress: 'Số 1 Đại Cồ Việt, Bách Khoa, Hai Bà Trưng, Hà Nội',
    district: 'Hai Bà Trưng',
    category: 'Đại học',
    latitude: 21.0049,
    longitude: 105.8431,
    keywords: ['bach khoa', 'hust', 'dai co viet', 'giai phong'],
  },
  {
    id: 'uni-2',
    name: 'Đại học Quốc Gia Hà Nội',
    fullAddress: '144 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    category: 'Đại học',
    latitude: 21.0372,
    longitude: 105.7818,
    keywords: ['vnu', 'quoc gia', 'xuan thuy', 'cau giay'],
  },
  {
    id: 'uni-3',
    name: 'Đại học Ngoại Thương',
    fullAddress: '91 Phố Chùa Láng, Láng Thượng, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    category: 'Đại học',
    latitude: 21.0232,
    longitude: 105.8055,
    keywords: ['ftu', 'ngoai thuong', 'chua lang', 'dong da'],
  },
  {
    id: 'uni-4',
    name: 'Đại học Kinh Tế Quốc Dân',
    fullAddress: '207 Giải Phóng, Đồng Tâm, Hai Bà Trưng, Hà Nội',
    district: 'Hai Bà Trưng',
    category: 'Đại học',
    latitude: 21.0006,
    longitude: 105.8427,
    keywords: ['neu', 'kinh te quoc dan', 'tran dai nghia', 'giai phong'],
  },
  {
    id: 'uni-5',
    name: 'Đại học Sư Phạm Hà Nội',
    fullAddress: '136 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    category: 'Đại học',
    latitude: 21.0375,
    longitude: 105.7842,
    keywords: ['hnue', 'su pham', 'xuan thuy'],
  },
  {
    id: 'uni-6',
    name: 'Học viện Ngân Hàng',
    fullAddress: '12 Chùa Bộc, Quang Trung, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    category: 'Đại học',
    latitude: 21.0084,
    longitude: 105.8288,
    keywords: ['ba', 'ngan hang', 'chua boc'],
  },
  {
    id: 'uni-7',
    name: 'Học viện Bưu Chính Viễn Thông',
    fullAddress: 'Km10 Đường Trần Phú, Mộ Lao, Hà Đông, Hà Nội',
    district: 'Hà Đông',
    category: 'Đại học',
    latitude: 20.9806,
    longitude: 105.7875,
    keywords: ['ptit', 'buu chinh vien thong', 'tran phu', 'ha dong'],
  },
  {
    id: 'uni-8',
    name: 'Học viện Báo Chí và Tuyên Truyền',
    fullAddress: '36 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    category: 'Đại học',
    latitude: 21.0360,
    longitude: 105.7876,
    keywords: ['ajc', 'bao chi', 'xuan thuy'],
  },
  {
    id: 'uni-9',
    name: 'Đại học Y Hà Nội',
    fullAddress: 'Số 1 Tôn Thất Tùng, Kim Liên, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    category: 'Đại học',
    latitude: 21.0031,
    longitude: 105.8315,
    keywords: ['hmu', 'y ha noi', 'ton that tung'],
  },
  {
    id: 'uni-10',
    name: 'Đại học Giao Thông Vận Tải',
    fullAddress: 'Số 3 Cầu Giấy, Láng Thượng, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    category: 'Đại học',
    latitude: 21.0287,
    longitude: 105.8033,
    keywords: ['utt', 'giao thong van tai', 'cau giay'],
  },
  {
    id: 'uni-11',
    name: 'Đại học Thủy Lợi',
    fullAddress: '175 Tây Sơn, Trung Liệt, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    category: 'Đại học',
    latitude: 21.0089,
    longitude: 105.8236,
    keywords: ['tlu', 'thuy loi', 'tay son'],
  },
  {
    id: 'uni-12',
    name: 'Đại học Xây Dựng Hà Nội',
    fullAddress: '55 Giải Phóng, Đồng Tâm, Hai Bà Trưng, Hà Nội',
    district: 'Hai Bà Trưng',
    category: 'Đại học',
    latitude: 21.0035,
    longitude: 105.8429,
    keywords: ['huce', 'xay dung', 'giai phong'],
  },
  {
    id: 'uni-13',
    name: 'Đại học Thương Mại',
    fullAddress: '79 Hồ Tùng Mậu, Mai Dịch, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    category: 'Đại học',
    latitude: 21.0379,
    longitude: 105.7745,
    keywords: ['tmu', 'thuong mai', 'ho tung mau'],
  },
  {
    id: 'uni-14',
    name: 'Đại học Hà Nội',
    fullAddress: 'Km9 Nguyễn Trãi, Trung Văn, Nam Từ Liêm, Hà Nội',
    district: 'Nam Từ Liêm',
    category: 'Đại học',
    latitude: 20.9918,
    longitude: 105.7958,
    keywords: ['hanu', 'dai hoc ha noi', 'nguyen trai'],
  },
  {
    id: 'uni-15',
    name: 'Học viện Ngoại Giao',
    fullAddress: '69 Chùa Láng, Láng Thượng, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    category: 'Đại học',
    latitude: 21.0245,
    longitude: 105.8068,
    keywords: ['dav', 'ngoai giao', 'chua lang'],
  },
  {
    id: 'uni-16',
    name: 'Học viện Kỹ Thuật Quân Sự',
    fullAddress: '236 Hoàng Quốc Việt, Cổ Nhuế 1, Bắc Từ Liêm, Hà Nội',
    district: 'Bắc Từ Liêm',
    category: 'Đại học',
    latitude: 21.0478,
    longitude: 105.7847,
    keywords: ['mta', 'ky thuat quan su', 'hoang quoc viet'],
  },
  {
    id: 'uni-17',
    name: '18 Hoàng Quốc Việt (Viện KH&CN Việt Nam)',
    fullAddress: '18 Hoàng Quốc Việt, Nghĩa Đô, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    category: 'Đại học',
    latitude: 21.0465,
    longitude: 105.7958,
    keywords: ['18 hoang quoc viet', 'vien han lam', 'nghia do'],
  },

  // --- TTTM & TÒA NHÀ LANDMARK ---
  {
    id: 'bld-1',
    name: 'Keangnam Landmark 72',
    fullAddress: 'Khu E6 Đô thị Cầu Giấy, Phạm Hùng, Mễ Trì, Nam Từ Liêm, Hà Nội',
    district: 'Nam Từ Liêm',
    category: 'TTTM & Tòa nhà',
    latitude: 21.0169,
    longitude: 105.7839,
    keywords: ['keangnam', 'landmark 72', 'pham hung', 'me tri'],
  },
  {
    id: 'bld-2',
    name: 'Lotte Center Hà Nội',
    fullAddress: '54 Liễu Giai, Cống Vị, Ba Đình, Hà Nội',
    district: 'Ba Đình',
    category: 'TTTM & Tòa nhà',
    latitude: 21.0326,
    longitude: 105.8122,
    keywords: ['lotte', 'lotte lieu giai', 'dao tan', 'ba dinh'],
  },
  {
    id: 'bld-3',
    name: 'Lotte Mall Tây Hồ',
    fullAddress: '272 Võ Chí Công, Phú Thượng, Tây Hồ, Hà Nội',
    district: 'Tây Hồ',
    category: 'TTTM & Tòa nhà',
    latitude: 21.0725,
    longitude: 105.8086,
    keywords: ['lotte mall', 'lotte tay ho', 'vo chi cong', 'lac long quan'],
  },
  {
    id: 'bld-4',
    name: 'Vincom Mega Mall Times City',
    fullAddress: '458 Minh Khai, Vĩnh Tuy, Hai Bà Trưng, Hà Nội',
    district: 'Hai Bà Trưng',
    category: 'TTTM & Tòa nhà',
    latitude: 20.9953,
    longitude: 105.8675,
    keywords: ['times city', 'vincom times city', 'minh khai', 'hai ba trung'],
  },
  {
    id: 'bld-5',
    name: 'Vincom Mega Mall Royal City',
    fullAddress: '72A Nguyễn Trãi, Thượng Đình, Thanh Xuân, Hà Nội',
    district: 'Thanh Xuân',
    category: 'TTTM & Tòa nhà',
    latitude: 21.0028,
    longitude: 105.8166,
    keywords: ['royal city', 'vincom royal city', 'nguyen trai', 'thanh xuan'],
  },
  {
    id: 'bld-6',
    name: 'Vincom Center Bà Triệu',
    fullAddress: '191 Bà Triệu, Lê Đại Hành, Hai Bà Trưng, Hà Nội',
    district: 'Hai Bà Trưng',
    category: 'TTTM & Tòa nhà',
    latitude: 21.0116,
    longitude: 105.8499,
    keywords: ['vincom ba trieu', 'ba trieu', 'doan tran nghiep'],
  },
  {
    id: 'bld-7',
    name: 'Vincom Center Trần Duy Hưng',
    fullAddress: 'Đường Trần Duy Hưng, Trung Hòa, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    category: 'TTTM & Tòa nhà',
    latitude: 21.0076,
    longitude: 105.7963,
    keywords: ['vincom tran duy hung', 'tran duy hung', 'hoang minh giam'],
  },
  {
    id: 'bld-8',
    name: 'Vincom Center Metropolis Liễu Giai',
    fullAddress: '29 Liễu Giai, Ngọc Khánh, Ba Đình, Hà Nội',
    district: 'Ba Đình',
    category: 'TTTM & Tòa nhà',
    latitude: 21.0315,
    longitude: 105.8145,
    keywords: ['vincom metropolis', 'lieu giai', 'kim ma'],
  },
  {
    id: 'bld-9',
    name: 'Aeon Mall Hà Đông',
    fullAddress: 'Khu Đô thị Dương Nội, Hà Đông, Hà Nội',
    district: 'Hà Đông',
    category: 'TTTM & Tòa nhà',
    latitude: 20.9802,
    longitude: 105.7538,
    keywords: ['aeon mall ha dong', 'aeon ha dong', 'duong noi'],
  },
  {
    id: 'bld-10',
    name: 'Aeon Mall Long Biên',
    fullAddress: '27 Cổ Linh, Long Biên, Hà Nội',
    district: 'Long Biên',
    category: 'TTTM & Tòa nhà',
    latitude: 21.0253,
    longitude: 105.8988,
    keywords: ['aeon mall long bien', 'aeon long bien', 'co linh'],
  },
  {
    id: 'bld-11',
    name: 'Indochina Plaza Hanoi (IPH Cầu Giấy)',
    fullAddress: '241 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    category: 'TTTM & Tòa nhà',
    latitude: 21.0366,
    longitude: 105.7828,
    keywords: ['iph', 'indochina plaza', 'xuan thuy'],
  },
  {
    id: 'bld-12',
    name: 'Discovery Complex Cầu Giấy',
    fullAddress: '302 Cầu Giấy, Dịch Vọng, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    category: 'TTTM & Tòa nhà',
    latitude: 21.0345,
    longitude: 105.7942,
    keywords: ['discovery complex', '302 cau giay'],
  },
  {
    id: 'bld-13',
    name: 'Tràng Tiền Plaza',
    fullAddress: '24 Hai Bà Trưng, Tràng Tiền, Hoàn Kiếm, Hà Nội',
    district: 'Hoàn Kiếm',
    category: 'TTTM & Tòa nhà',
    latitude: 21.0255,
    longitude: 105.8548,
    keywords: ['trang tien plaza', 'ho hoan kiem', 'hang bai'],
  },
  {
    id: 'bld-14',
    name: 'Big C Thăng Long (GO! Thăng Long)',
    fullAddress: '222 Trần Duy Hưng, Trung Hòa, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    category: 'TTTM & Tòa nhà',
    latitude: 21.0068,
    longitude: 105.7925,
    keywords: ['big c thang long', 'go thang long', 'tran duy hung'],
  },

  // --- KHU ĐÔ THỊ & CHUNG CƯ ---
  {
    id: 'urb-1',
    name: 'Vinhomes Smart City Tây Mỗ',
    fullAddress: 'Đại lộ Thăng Long, Tây Mỗ - Đại Mỗ, Nam Từ Liêm, Hà Nội',
    district: 'Nam Từ Liêm',
    category: 'Khu đô thị',
    latitude: 20.9961,
    longitude: 105.7482,
    keywords: ['vinhomes smart city', 'smart city', 'tay mo', 'dai mo'],
  },
  {
    id: 'urb-2',
    name: 'Vinhomes Ocean Park Gia Lâm',
    fullAddress: 'Khu đô thị Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội',
    district: 'Gia Lâm',
    category: 'Khu đô thị',
    latitude: 20.9897,
    longitude: 105.9405,
    keywords: ['vinhomes ocean park', 'ocean park', 'gia lam'],
  },
  {
    id: 'urb-3',
    name: 'Khu đô thị Trung Hòa - Nhân Chính',
    fullAddress: 'Hoàng Đạo Thúy, Trung Hòa, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    category: 'Khu đô thị',
    latitude: 21.0089,
    longitude: 105.8015,
    keywords: ['trung hoa nhan chinh', 'hoang dao thuy', 'le van luong'],
  },
  {
    id: 'urb-4',
    name: 'Khu đô thị Mỹ Đình Sông Đà (The Manor)',
    fullAddress: 'Mễ Trì, Mỹ Đình 1, Nam Từ Liêm, Hà Nội',
    district: 'Nam Từ Liêm',
    category: 'Khu đô thị',
    latitude: 21.0142,
    longitude: 105.7779,
    keywords: ['the manor', 'my dinh song da', 'me tri'],
  },
  {
    id: 'urb-5',
    name: 'Khu đô thị Văn Quán Hà Đông',
    fullAddress: 'Đường Nguyễn Khuyến, Văn Quán, Hà Đông, Hà Nội',
    district: 'Hà Đông',
    category: 'Khu đô thị',
    latitude: 20.9768,
    longitude: 105.7905,
    keywords: ['van quan', 'nguyen khuyen', 'ha dong'],
  },
  {
    id: 'urb-6',
    name: 'Khu đô thị Mỗ Lao',
    fullAddress: 'Mộ Lao, Hà Đông, Hà Nội',
    district: 'Hà Đông',
    category: 'Khu đô thị',
    latitude: 20.9835,
    longitude: 105.7852,
    keywords: ['mo lao', 'mulberry lane', 'seasons avenue'],
  },
  {
    id: 'urb-7',
    name: 'Khu đô thị Bán Đảo Linh Đàm',
    fullAddress: 'Bán đảo Linh Đàm, Hoàng Liệt, Hoàng Mai, Hà Nội',
    district: 'Hoàng Mai',
    category: 'Khu đô thị',
    latitude: 20.9658,
    longitude: 105.8285,
    keywords: ['linh dam', 'ho linh dam', 'hoang mai'],
  },
  {
    id: 'urb-8',
    name: 'Khu đô thị Ciputra Nam Thăng Long',
    fullAddress: 'Xuân Đỉnh, Bắc Từ Liêm, Hà Nội',
    district: 'Bắc Từ Liêm',
    category: 'Khu đô thị',
    latitude: 21.0775,
    longitude: 105.7981,
    keywords: ['ciputra', 'nam thang long', 'xuan dinh'],
  },
  {
    id: 'urb-9',
    name: 'Khu Ngoại Giao Đoàn',
    fullAddress: 'Xuân Tảo, Bắc Từ Liêm, Hà Nội',
    district: 'Bắc Từ Liêm',
    category: 'Khu đô thị',
    latitude: 21.0658,
    longitude: 105.7968,
    keywords: ['ngoai giao doan', 'xuan tao', 'vo chi cong'],
  },
  {
    id: 'urb-10',
    name: 'Chung cư Goldmark City',
    fullAddress: '136 Hồ Tùng Mậu, Phú Diễn, Bắc Từ Liêm, Hà Nội',
    district: 'Bắc Từ Liêm',
    category: 'Khu đô thị',
    latitude: 21.0422,
    longitude: 105.7658,
    keywords: ['goldmark city', '136 ho tung mau'],
  },

  // --- BỆNH VIỆN LỚN ---
  {
    id: 'hos-1',
    name: 'Bệnh viện Bạch Mai',
    fullAddress: '78 Giải Phóng, Phương Mai, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    category: 'Bệnh viện',
    latitude: 21.0019,
    longitude: 105.8402,
    keywords: ['bach mai', 'benh vien bach mai', 'giai phong', 'phuong mai'],
  },
  {
    id: 'hos-2',
    name: 'Bệnh viện Hữu Nghị Việt Đức',
    fullAddress: '40 Tràng Thi, Hàng Bông, Hoàn Kiếm, Hà Nội',
    district: 'Hoàn Kiếm',
    category: 'Bệnh viện',
    latitude: 21.0289,
    longitude: 105.8478,
    keywords: ['viet duc', 'trang thi', 'quan su', 'hoan kiem'],
  },
  {
    id: 'hos-3',
    name: 'Bệnh viện Trung Ương Quân Đội 108',
    fullAddress: 'Số 1 Trần Hưng Đạo, Bạch Đằng, Hai Bà Trưng, Hà Nội',
    district: 'Hai Bà Trưng',
    category: 'Bệnh viện',
    latitude: 21.0185,
    longitude: 105.8605,
    keywords: ['vien 108', '108', 'tran hung dao'],
  },
  {
    id: 'hos-4',
    name: 'Bệnh viện Nhi Trung Ương',
    fullAddress: '18/879 Đê La Thành, Láng Thượng, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    category: 'Bệnh viện',
    latitude: 21.0268,
    longitude: 105.8105,
    keywords: ['nhi trung uong', 'de la thanh', 'chua lang'],
  },
  {
    id: 'hos-5',
    name: 'Bệnh viện Phụ Sản Hà Nội',
    fullAddress: '929 Đê La Thành, Ngọc Khánh, Ba Đình, Hà Nội',
    district: 'Ba Đình',
    category: 'Bệnh viện',
    latitude: 21.0279,
    longitude: 105.8092,
    keywords: ['phu san ha noi', 'de la thanh'],
  },
  {
    id: 'hos-6',
    name: 'Bệnh viện E Hà Nội',
    fullAddress: '89 Trần Cung, Nghĩa Tân, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    category: 'Bệnh viện',
    latitude: 21.0498,
    longitude: 105.7915,
    keywords: ['benh vien e', 'tran cung', 'nghia tan'],
  },
  {
    id: 'hos-7',
    name: 'Bệnh viện 19-8 Bộ Công An',
    fullAddress: 'Số 9 Trần Bình, Mai Dịch, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    category: 'Bệnh viện',
    latitude: 21.0372,
    longitude: 105.7768,
    keywords: ['vien 198', 'tran binh', 'mai dich'],
  },

  // --- DANH THẮNG & BẾN XE ---
  {
    id: 'lan-1',
    name: 'Hồ Hoàn Kiếm (Phố Đi Bộ)',
    fullAddress: 'Đinh Tiên Hoàng, Hàng Trống, Hoàn Kiếm, Hà Nội',
    district: 'Hoàn Kiếm',
    category: 'Danh thắng & Bến xe',
    latitude: 21.0287,
    longitude: 105.8523,
    keywords: ['ho hoan kiem', 'ho guom', 'pho di bo', 'dinh tien hoang'],
  },
  {
    id: 'lan-2',
    name: 'Hồ Tây (Đường Thanh Niên)',
    fullAddress: 'Đường Thanh Niên, Yên Phụ, Tây Hồ, Hà Nội',
    district: 'Tây Hồ',
    category: 'Danh thắng & Bến xe',
    latitude: 21.0458,
    longitude: 105.8365,
    keywords: ['ho tay', 'duong thanh nien', 'chua tran quoc'],
  },
  {
    id: 'lan-3',
    name: 'Nhà Hát Lớn Hà Nội',
    fullAddress: 'Số 1 Tràng Tiền, Phan Chu Trinh, Hoàn Kiếm, Hà Nội',
    district: 'Hoàn Kiếm',
    category: 'Danh thắng & Bến xe',
    latitude: 21.0242,
    longitude: 105.8576,
    keywords: ['nha hat lon', 'trang tien', 'phan chu trinh'],
  },
  {
    id: 'lan-4',
    name: 'Văn Miếu Quốc Tử Giám',
    fullAddress: '58 Quốc Tử Giám, Văn Miếu, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    category: 'Danh thắng & Bến xe',
    latitude: 21.0274,
    longitude: 105.8355,
    keywords: ['van mieu', 'quoc tu giam', 'ton duc thang'],
  },
  {
    id: 'lan-5',
    name: 'Chợ Đồng Xuân',
    fullAddress: 'Đồng Xuân, Hoàn Kiếm, Hà Nội',
    district: 'Hoàn Kiếm',
    category: 'Danh thắng & Bến xe',
    latitude: 21.0375,
    longitude: 105.8498,
    keywords: ['cho dong xuan', 'dong xuan', 'pho co'],
  },
  {
    id: 'lan-6',
    name: 'Bến xe Mỹ Đình',
    fullAddress: 'Số 20 Phạm Hùng, Mỹ Đình 2, Nam Từ Liêm, Hà Nội',
    district: 'Nam Từ Liêm',
    category: 'Danh thắng & Bến xe',
    latitude: 21.0282,
    longitude: 105.7782,
    keywords: ['ben xe my dinh', 'my dinh', 'pham hung'],
  },
  {
    id: 'lan-7',
    name: 'Bến xe Giáp Bát',
    fullAddress: 'Km6 Đường Giải Phóng, Giáp Bát, Hoàng Mai, Hà Nội',
    district: 'Hoàng Mai',
    category: 'Danh thắng & Bến xe',
    latitude: 20.9808,
    longitude: 105.8415,
    keywords: ['ben xe giap bat', 'giap bat', 'giai phong'],
  },
  {
    id: 'lan-8',
    name: 'Bến xe Nước Ngầm',
    fullAddress: 'Số 1 Ngọc Hồi, Hoàng Liệt, Hoàng Mai, Hà Nội',
    district: 'Hoàng Mai',
    category: 'Danh thắng & Bến xe',
    latitude: 20.9635,
    longitude: 105.8398,
    keywords: ['ben xe nuoc ngam', 'nuoc ngam', 'ngoc hoi'],
  },
  {
    id: 'lan-9',
    name: 'Sân Vận Động Quốc Gia Mỹ Đình',
    fullAddress: 'Lê Đức Thọ, Mỹ Đình 1, Nam Từ Liêm, Hà Nội',
    district: 'Nam Từ Liêm',
    category: 'Danh thắng & Bến xe',
    latitude: 21.0205,
    longitude: 105.7638,
    keywords: ['svd my dinh', 'san van dong my dinh', 'le duc tho'],
  },
  {
    id: 'lan-10',
    name: 'Trung Tâm Hội Nghị Quốc Gia',
    fullAddress: '57 Phạm Hùng, Mễ Trì, Nam Từ Liêm, Hà Nội',
    district: 'Nam Từ Liêm',
    category: 'Danh thắng & Bến xe',
    latitude: 21.0065,
    longitude: 105.7872,
    keywords: ['hoi nghi quoc gia', 'ncc', 'dai lo thang long'],
  },

  // --- CÁC TUYẾN PHỐ CHÍNH TẠI HÀ NỘI ---
  {
    id: 'str-1',
    name: 'Đường Cầu Giấy',
    fullAddress: 'Đường Cầu Giấy, Dịch Vọng, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    category: 'Đường phố',
    latitude: 21.0335,
    longitude: 105.7972,
    keywords: ['cau giay', 'duong cau giay'],
  },
  {
    id: 'str-2',
    name: 'Đường Xuân Thủy',
    fullAddress: 'Đường Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    category: 'Đường phố',
    latitude: 21.0368,
    longitude: 105.7845,
    keywords: ['xuan thuy', 'ngo 175 xuan thuy'],
  },
  {
    id: 'str-3',
    name: 'Đường Hoàng Quốc Việt',
    fullAddress: 'Đường Hoàng Quốc Việt, Nghĩa Tân, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    category: 'Đường phố',
    latitude: 21.0468,
    longitude: 105.7925,
    keywords: ['hoang quoc viet', 'nghia do', 'nghia tan'],
  },
  {
    id: 'str-4',
    name: 'Phố Duy Tân',
    fullAddress: 'Phố Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    category: 'Đường phố',
    latitude: 21.0312,
    longitude: 105.7835,
    keywords: ['duy tan', 'pho duy tan', 'khu cong nghe'],
  },
  {
    id: 'str-5',
    name: 'Đường Trần Duy Hưng',
    fullAddress: 'Đường Trần Duy Hưng, Trung Hòa, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    category: 'Đường phố',
    latitude: 21.0089,
    longitude: 105.7985,
    keywords: ['tran duy hung', 'trung hoa'],
  },
  {
    id: 'str-6',
    name: 'Phố Chùa Láng',
    fullAddress: 'Phố Chùa Láng, Láng Thượng, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    category: 'Đường phố',
    latitude: 21.0245,
    longitude: 105.8055,
    keywords: ['chua lang', 'lang thuong', 'ho chua lang'],
  },
  {
    id: 'str-7',
    name: 'Phố Tây Sơn',
    fullAddress: 'Phố Tây Sơn, Ngã Tư Sở, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    category: 'Đường phố',
    latitude: 21.0092,
    longitude: 105.8235,
    keywords: ['tay son', 'nga tu so'],
  },
  {
    id: 'str-8',
    name: 'Phố Chùa Bộc',
    fullAddress: 'Phố Chùa Bộc, Quang Trung, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    category: 'Đường phố',
    latitude: 21.0075,
    longitude: 105.8292,
    keywords: ['chua boc', 'quang trung'],
  },
  {
    id: 'str-9',
    name: 'Đường Nguyễn Trãi',
    fullAddress: 'Đường Nguyễn Trãi, Thanh Xuân Trung, Thanh Xuân, Hà Nội',
    district: 'Thanh Xuân',
    category: 'Đường phố',
    latitude: 20.9985,
    longitude: 105.8075,
    keywords: ['nguyen trai', 'thanh xuan'],
  },
  {
    id: 'str-10',
    name: 'Đường Lê Văn Lương',
    fullAddress: 'Đường Lê Văn Lương, Nhân Chính, Thanh Xuân, Hà Nội',
    district: 'Thanh Xuân',
    category: 'Đường phố',
    latitude: 21.0062,
    longitude: 105.8045,
    keywords: ['le van luong', 'nhan chinh'],
  },
  {
    id: 'str-11',
    name: 'Đường Kim Mã',
    fullAddress: 'Đường Kim Mã, Giảng Võ, Ba Đình, Hà Nội',
    district: 'Ba Đình',
    category: 'Đường phố',
    latitude: 21.0315,
    longitude: 105.8225,
    keywords: ['kim ma', 'giang vo', 'ba dinh'],
  },
  {
    id: 'str-12',
    name: 'Đường Liễu Giai',
    fullAddress: 'Đường Liễu Giai, Cống Vị, Ba Đình, Hà Nội',
    district: 'Ba Đình',
    category: 'Đường phố',
    latitude: 21.0335,
    longitude: 105.8135,
    keywords: ['lieu giai', 'cong vi'],
  },
  {
    id: 'str-13',
    name: 'Phố Huế',
    fullAddress: 'Phố Huế, Hàng Bài, Hai Bà Trưng, Hà Nội',
    district: 'Hai Bà Trưng',
    category: 'Đường phố',
    latitude: 21.0145,
    longitude: 105.8525,
    keywords: ['pho hue', 'hang bai', 'cho hom'],
  },
  {
    id: 'str-14',
    name: 'Đường Minh Khai',
    fullAddress: 'Đường Minh Khai, Vĩnh Tuy, Hai Bà Trưng, Hà Nội',
    district: 'Hai Bà Trưng',
    category: 'Đường phố',
    latitude: 20.9982,
    longitude: 105.8645,
    keywords: ['minh khai', 'vinh tuy', 'ngo hoa binh 7'],
  },
  {
    id: 'str-15',
    name: 'Đường Trần Phú Hà Đông',
    fullAddress: 'Đường Trần Phú, Văn Quán, Hà Đông, Hà Nội',
    district: 'Hà Đông',
    category: 'Đường phố',
    latitude: 20.9785,
    longitude: 105.7835,
    keywords: ['tran phu', 'ha dong', 'quang trung'],
  },
  {
    id: 'str-16',
    name: 'Đường Nguyễn Văn Cừ',
    fullAddress: 'Đường Nguyễn Văn Cừ, Bồ Đề, Long Biên, Hà Nội',
    district: 'Long Biên',
    category: 'Đường phố',
    latitude: 21.0425,
    longitude: 105.8735,
    keywords: ['nguyen van cu', 'bo de', 'long bien', 'cau chuong duong'],
  },
  {
    id: 'str-17',
    name: 'Phố Hàng Bài',
    fullAddress: 'Phố Hàng Bài, Tràng Tiền, Hoàn Kiếm, Hà Nội',
    district: 'Hoàn Kiếm',
    category: 'Đường phố',
    latitude: 21.0225,
    longitude: 105.8535,
    keywords: ['hang bai', 'trang tien', 'hoan kiem'],
  },
  {
    id: 'str-18',
    name: 'Phố Nhà Thờ',
    fullAddress: 'Phố Nhà Thờ, Hàng Trống, Hoàn Kiếm, Hà Nội',
    district: 'Hoàn Kiếm',
    category: 'Đường phố',
    latitude: 21.0292,
    longitude: 105.8495,
    keywords: ['nha tho', 'nha tho lon', 'hang trong'],
  },
  {
    id: 'str-19',
    name: 'Đường Lạc Long Quân',
    fullAddress: 'Đường Lạc Long Quân, Nhật Tân, Tây Hồ, Hà Nội',
    district: 'Tây Hồ',
    category: 'Đường phố',
    latitude: 21.0625,
    longitude: 105.8115,
    keywords: ['lac long quan', 'nhat tan', 'tay ho'],
  },
  {
    id: 'str-20',
    name: 'Đường Phạm Hùng',
    fullAddress: 'Đường Phạm Hùng, Mỹ Đình, Nam Từ Liêm, Hà Nội',
    district: 'Nam Từ Liêm',
    category: 'Đường phố',
    latitude: 21.0215,
    longitude: 105.7815,
    keywords: ['pham hung', 'my dinh', 'nam tu liem'],
  },
];

// Tìm kiếm cục bộ tức thì trong danh bạ Hà Nội (hỗ trợ cả có dấu và không dấu)
export function searchHanoiDatabase(query: string, district?: string, category?: string): HanoiPlace[] {
  const normQuery = removeVietnameseTones(query);
  if (!normQuery && !district && !category) return HANOI_DATABASE.slice(0, 10);

  return HANOI_DATABASE.filter((item) => {
    if (district && district !== 'Tất cả' && item.district !== district) return false;
    if (category && category !== 'Tất cả' && item.category !== category) return false;
    if (!normQuery) return true;

    const normName = removeVietnameseTones(item.name);
    const normAddress = removeVietnameseTones(item.fullAddress);
    const normDistrict = removeVietnameseTones(item.district);
    const normCategory = removeVietnameseTones(item.category);
    const kwMatch = (item.keywords || []).some((kw) => removeVietnameseTones(kw).includes(normQuery));

    return (
      normName.includes(normQuery) ||
      normAddress.includes(normQuery) ||
      normDistrict.includes(normQuery) ||
      normCategory.includes(normQuery) ||
      kwMatch
    );
  });
}

// Tìm kiếm trực tuyến qua OpenStreetMap Nominatim
export async function searchOnlineNominatim(rawQuery: string, signal?: AbortSignal): Promise<HanoiPlace[]> {
  const trimmed = rawQuery.trim();
  if (trimmed.length < 2) return [];

  const searchQuery = trimmed.toLowerCase().includes('hà nội') || trimmed.toLowerCase().includes('ha noi')
    ? trimmed
    : `${trimmed}, Hà Nội`;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    searchQuery
  )}&countrycodes=vn&addressdetails=1&limit=8`;

  try {
    const res = await fetch(url, {
      signal,
      headers: {
        'User-Agent': 'GrabFoodHanoiClient/2.0 (student@grabfoodclient.vn)',
        'Accept-Language': 'vi',
      },
    });

    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    const list: HanoiPlace[] = [];
    for (const item of data) {
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);

      // Đảm bảo kết quả nằm trong ranh giới Hà Nội (20.7 -> 21.4 vĩ độ Bắc, 105.4 -> 106.2 kinh độ Đông)
      if (lat >= 20.7 && lat <= 21.4 && lon >= 105.4 && lon <= 106.2) {
        const rawDisplay = item.display_name || '';
        const cleanDisplay = rawDisplay
          .replace(/,\s*\d{5}/g, '')
          .replace(/,\s*Việt Nam/gi, '')
          .trim();

        const districtMatch = cleanDisplay.match(/(Quận|Huyện|Thị xã)\s+([^,]+)/i);
        const district = districtMatch ? districtMatch[0] : 'Hà Nội';

        list.push({
          id: `osm-${item.place_id}`,
          name: item.name || cleanDisplay.split(',')[0],
          fullAddress: cleanDisplay,
          district,
          category: 'Đường phố',
          latitude: lat,
          longitude: lon,
        });
      }
    }
    return list;
  } catch {
    return [];
  }
}

// Tra cứu ngược địa chỉ khi người dùng chạm ghim trên bản đồ (Reverse Geocoding)
export async function reverseGeocodeHanoi(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<{ name: string; fullAddress: string; district: string }> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
    const res = await fetch(url, {
      signal,
      headers: {
        'User-Agent': 'GrabFoodHanoiClient/2.0 (student@grabfoodclient.vn)',
        'Accept-Language': 'vi',
      },
    });
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();

    const rawDisplay = data.display_name || '';
    const cleanDisplay = rawDisplay
      .replace(/,\s*\d{5}/g, '')
      .replace(/,\s*Việt Nam/gi, '')
      .trim();

    const name = data.name || cleanDisplay.split(',')[0] || 'Vị trí đã ghim';
    const districtMatch = cleanDisplay.match(/(Quận|Huyện|Thị xã)\s+([^,]+)/i);
    const district = districtMatch ? districtMatch[0] : 'Hà Nội';

    return {
      name,
      fullAddress: cleanDisplay || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}, Hà Nội`,
      district,
    };
  } catch {
    return {
      name: 'Vị trí trên bản đồ',
      fullAddress: `Tọa độ: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}, Hà Nội`,
      district: 'Hà Nội',
    };
  }
}
