
const HANOI_ADDRESSES = {
  r1: '25 Nhà Thờ, Hàng Trống, Hoàn Kiếm, Hà Nội', // Phúc Long
  r2: '47 Hàng Bài, Tràng Tiền, Hoàn Kiếm, Hà Nội', // The Alley
  r3: '56 Lý Thường Kiệt, Trần Hưng Đạo, Hoàn Kiếm, Hà Nội', // Gong Cha
  r4: '128 Bà Triệu, Hàng Bài, Hai Bà Trưng, Hà Nội', // Cơm Tấm Cali
  r5: '88 Phố Huế, Ngô Thì Nhậm, Hai Bà Trưng, Hà Nội', // Cơm Gà Hải Nam
  r6: '13 Lò Đúc, Phạm Đình Hổ, Hai Bà Trưng, Hà Nội', // Phở Thìn Bờ Hồ
  r7: '24 Lê Văn Hưu, Phan Chu Trinh, Hai Bà Trưng, Hà Nội', // Bún Chả Hương Liên (Obama)
  r8: '292 Tây Sơn, Trung Liệt, Đống Đa, Hà Nội', // KFC Tây Sơn
  r9: '298 Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội', // Lotteria Cầu Giấy
  r10: '11B Tràng Tiền, Hoàn Kiếm, Hà Nội', // Pizza 4P's Tràng Tiền
};
const fs = require('fs');
const path = require('path');

const U = (id, w = 600, h = 400) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;

// 1. Ảnh mặt tiền quán ăn - Riêng biệt cho từng quán
const RESTAURANT_IMG = {
  r1: '1517248135467-4c7edcad34c4', // Trà Sữa Phúc Long (Quán trà xanh hiện đại)
  r2: '1497534446932-c925b458314e', // The Alley (Cốc trà hươu sang trọng)
  r3: '1590846406792-0adc7f938f1d', // Gong Cha (Quán trà Đài Loan)
  r4: '1552566626-52f8b828add9', // Cơm Tấm Cali (Nhà hàng ấm cúng)
  r5: '1555396273-367ea4eb4db5', // Cơm Gà Hải Nam (Quán ăn phong cách Á Đông)
  r6: '1582878826629-29b7ad1cdc43', // Phở Thìn Bờ Hồ (Bát phở truyền thống)
  r7: '1509722747041-616f39b57569', // Bún Chả Hương Liên (Bún chả Hà Nội)
  r8: '1562967914-608f82629710', // KFC (Gà rán)
  r9: '1572802419224-296b0aeee0d9', // Lotteria (Burger)
  r10: '1565299624946-b28f40a0ae38', // Pizza 4P's (Lò nướng pizza Ý)
};

const categories = [
  { id: 'milktea', name: 'Trà sữa', icon: 'cafe' },
  { id: 'rice', name: 'Cơm', icon: 'restaurant' },
  { id: 'noodle', name: 'Bún/Phở', icon: 'fast-food' },
  { id: 'fastfood', name: 'Đồ ăn nhanh', icon: 'pizza' },
];

const R = [
  ['r1', 'Trà Sữa Phúc Long', 'milktea', 4.8, 0.8, 15],
  ['r2', 'The Alley', 'milktea', 4.6, 1.2, 20],
  ['r3', 'Gong Cha', 'milktea', 4.7, 2.1, 20],
  ['r4', 'Cơm Tấm Cali', 'rice', 4.5, 1.5, 25],
  ['r5', 'Cơm Gà Hải Nam', 'rice', 4.4, 2.8, 30],
  ['r6', 'Phở Thìn Bờ Hồ', 'noodle', 4.9, 1.0, 20],
  ['r7', 'Bún Chả Hương Liên', 'noodle', 4.7, 3.2, 30],
  ['r8', 'KFC', 'fastfood', 4.3, 1.9, 25],
  ['r9', 'Lotteria', 'fastfood', 4.2, 2.4, 25],
  ['r10', 'Pizza 4P\'s', 'fastfood', 4.8, 3.5, 35],
];

const restaurants = R.map(([id, name, categoryId, rating, distanceKm, etaMin]) => ({
  id,
  name,
  categoryId,
  rating,
  reviewCount: 100 + Math.round(rating * 97),
  distanceKm,
  etaMin,
  deliveryFee: 5000 + Math.round(distanceKm) * 3000,
  address: HANOI_ADDRESSES[id] || `${Math.round(distanceKm * 18)} Cầu Giấy, Hà Nội`,
  image: U(RESTAURANT_IMG[id]),
  promo: rating >= 4.7 ? 'Giảm 15%' : null,
}));

// 2. Thực đơn chuyên biệt theo bản sắc từng nhà hàng (Không còn bị bê nguyên xi 1 menu cho nhiều quán)
// Cấu trúc: [Tên món, Giá, Nhóm, Mô tả, PhotoUnsplashID, CóOption]
const RESTAURANT_MENUS = {
  // Trà Sữa Phúc Long
  r1: [
    ['Trà sữa Phúc Long', 45000, 'Best seller', 'Trà đen đậm vị truyền thống kết hợp sữa béo thơm', '1558857563-b371033873b8', true],
    ['Trà đào cam sả Phúc Long', 52000, 'Best seller', 'Đào ngâm giòn ngọt thanh kết hợp hương sả nồng nàn', '1541544741938-0af808871cc0', true],
    ['Trà vải sen', 49000, 'Trà trái cây', 'Hương sen thanh tao hòa cùng trái vải mọng nước', '1556679343-c7306c1976bc', true],
    ['Bánh croissant bơ tỏi', 28000, 'Bánh ngọt', 'Bánh sừng bò nướng bơ tỏi giòn tan nóng hổi', '1555507036-ab1f4038808a', false],
  ],

  // The Alley
  r2: [
    ['Sữa tươi trân châu đường đen', 65000, 'Món đặc trưng', 'Đường đen Okinawa nấu dẻo kết hợp sữa tươi thanh trùng', '1576092768241-dec231879fc3', true],
    ['Lục trà sữa trân châu', 55000, 'Trà sữa', 'Lục trà lài thơm ngát quyện trân châu đường đen', '1517256064527-09c73fc73e38', true],
    ['Trà xoài kem tuyết', 60000, 'Đá xay', 'Xoài cát tươi xay nhuyễn phủ lớp kem cheese mặn', '1546173159-315724a31696', true],
  ],

  // Gong Cha
  r3: [
    ['Alisan Gong Cha Macchiato', 55000, 'Best seller', 'Trà Alisan thượng hạng phủ lớp váng sữa sánh mịn', '1556679343-c7306c1976bc', true],
    ['Trà sữa ô long', 48000, 'Trà sữa', 'Trà ô long nướng Đài Loan hương vị đậm đà', '1558857563-b371033873b8', true],
    ['Trà chanh vàng bưởi đỏ', 50000, 'Trà trái cây', 'Vị chua ngọt sảng khoái vitamin C dồi dào', '1513558161293-cdaf765ed2fd', true],
  ],

  // Cơm Tấm Cali
  r4: [
    ['Cơm tấm sườn nướng Cali', 65000, 'Món chính', 'Sườn nướng than hoa mềm đẫm sốt bí truyền', '1544025162-d76694265947', false],
    ['Cơm tấm sườn bì chả đặc biệt', 75000, 'Món chính', 'Đầy đủ sườn cây, bì thính, chả trứng hấp và trứng ốp la', '1569058242253-92a9c755a0ec', false],
    ['Canh chua tôm lá giang', 30000, 'Canh phụ', 'Canh chua tôm tươi nấu lá giang chua dịu thanh mát', '1548946526-f69e2424cf45', false],
    ['Chả giò tôm thịt (3 cuốn)', 35000, 'Món ăn kèm', 'Chả giò chiên vàng rụm chấm nước mắm chua ngọt', '1606491956689-2ea866880c84', false],
  ],

  // Cơm Gà Hải Nam
  r5: [
    ['Cơm gà luộc Hải Nam', 58000, 'Món đặc trưng', 'Thịt gà luộc da vàng mọng nước, hạt cơm nấu nước luộc gà béo ngậy', '1589302168068-964664d93dc0', false],
    ['Cơm gà xối mỡ đùi góc tư', 62000, 'Món chính', 'Đùi gà xối mỡ da giòn rụm chấm sốt gừng ớt', '1626645738196-c2a7c87a8f58', false],
    ['Canh gà hầm nấm đông cô', 25000, 'Canh phụ', 'Canh gà thanh ngọt bổ dưỡng hầm cùng nấm tươi', '1547592180-85f173990554', false],
  ],

  // Phở Thìn Bờ Hồ
  r6: [
    ['Phở bò tái lăn truyền thống', 65000, 'Món chính', 'Thịt bò xào lăn lửa lớn ngập hành hoa thơm nức mũi', '1582878826629-29b7ad1cdc43', false],
    ['Phở nạm gầu giòn', 65000, 'Món chính', 'Gầu bò giòn sần sật, nước dùng ninh xương ngọt tự nhiên', '1569718212165-3a8278d5f624', false],
    ['Quẩy giòn giòn ăn phở', 10000, 'Món ăn kèm', 'Quẩy vàng giòn rụm nhúng cùng nước dùng nóng hổi', '1573080496219-bb080dd4f877', false],
    ['Trứng gà chần', 12000, 'Món ăn kèm', 'Trứng gà ta chần lòng đào bổ dưỡng', '1525351484163-7529414344d8', false],
  ],

  // Bún Chả Hương Liên (Bún chả Obama)
  r7: [
    ['Bún chả đặc biệt (Chả miếng + Chả băm)', 60000, 'Món chính', 'Chả nướng than hoa đượm khói, nước chấm đu đủ tỏi ớt ấm nóng', '1509722747041-616f39b57569', false],
    ['Nem cua bể hải sản', 40000, 'Món ăn kèm', 'Nem vuông giòn tan đẫm thịt cua bể tươi và tôm sú', '1606491956689-2ea866880c84', false],
    ['Bún thêm / Rau sống', 10000, 'Món phụ', 'Phần bún sợi nhỏ thanh mát và đĩa rau kinh giới thơm', '1540420773420-3366772f4999', false],
  ],

  // KFC
  r8: [
    ['Combo Gà Rán Giòn Cay (2 Miếng)', 79000, 'Combo Hot', '2 miếng gà rán giòn rụm phủ gia vị cay đậm đà KFC', '1562967914-608f82629710', false],
    ['Burger Zinger Tôm giòn', 59000, 'Burger', 'Nhân tôm chiên xù giòn tan kèm sốt mayonnaise cay', '1572802419224-296b0aeee0d9', false],
    ['Khoai tây chiên cỡ vừa', 29000, 'Món phụ', 'Khoai tây cọng chiên vàng giòn rắc muối ớt', '1573080496219-bb080dd4f877', false],
  ],

  // Lotteria
  r9: [
    ['Gà rán sốt đậu ngọt', 75000, 'Gà sốt', 'Gà rán phủ nước sốt đậu ngọt bùi đặc trưng Lotteria', '1561758033-d89a9ad46330', false],
    ['Burger Bò Bulgogi Hàn Quốc', 55000, 'Burger', 'Bò nướng sốt Bulgogi trứ danh thơm ngọt đậm vị', '1568901346375-23c9450c58cd', false],
    ['Khoai tây lắc phô mai', 35000, 'Món phụ', 'Khoai tây chiên lắc cùng bột phô mai béo ngậy', '1550547660-d9450f859349', false],
  ],

  // Pizza 4P's
  r10: [
    ['Pizza 4 Loại Phô Mai (4 Cheese)', 175000, 'Pizza', 'Phô mai Camembert, Mozzarella, Gorgonzola kèm mật ong hữu cơ', '1513104890138-7c749659a591', false],
    ['Pizza Phô Mai Burrata Thịt Nguội', 195000, 'Pizza Signature', 'Trái phô mai Burrata tươi béo ngậy kèm dăm bông Parma Ham', '1565299624946-b28f40a0ae38', false],
    ['Mì Ý sốt kem cua biển', 160000, 'Mì Ý Pasta', 'Mì Ý sốt kem cà chua thơm nức quyện thịt cua xé tay', '1551183053-bf91a1d81141', false],
  ],
};

const sizeOpt = {
  id: 'size',
  name: 'Size',
  required: true,
  multiple: false,
  choices: [
    { id: 'M', name: 'Size M', price: 0 },
    { id: 'L', name: 'Size L', price: 7000 },
  ],
};

const topping = {
  id: 'topping',
  name: 'Topping',
  required: false,
  multiple: true,
  choices: [
    { id: 'pearl-white', name: 'Trân châu trắng giòn', price: 8000 },
    { id: 'pearl-black', name: 'Trân châu đen dẻo', price: 8000 },
    { id: 'pudding', name: 'Pudding trứng béo', price: 10000 },
    { id: 'cheese-cream', name: 'Kem Cheese Macchiato', price: 12000 },
  ],
};

const dishes = [];
restaurants.forEach((r) => {
  const menuList = RESTAURANT_MENUS[r.id] || [];
  menuList.forEach(([name, price, group, description, photoId, hasOptions], i) => {
    dishes.push({
      id: `${r.id}-d${i + 1}`,
      restaurantId: r.id,
      name,
      description,
      price,
      group,
      image: U(photoId, 400, 400),
      options: hasOptions ? [sizeOpt, topping] : [],
    });
  });
});

const vouchers = [
  { id: 'v1', code: 'GIAM15K', title: 'Giảm 15.000đ', type: 'amount', value: 15000, minOrder: 50000 },
  { id: 'v2', code: 'FREESHIP', title: 'Miễn phí giao hàng', type: 'freeship', value: 0, minOrder: 40000 },
  { id: 'v3', code: 'SALE10', title: 'Giảm 10% (tối đa 30k)', type: 'percent', value: 10, maxDiscount: 30000, minOrder: 100000 },
];

const out = path.join(__dirname, '..', 'src', 'data');
fs.mkdirSync(out, { recursive: true });
const w = (n, d) => fs.writeFileSync(path.join(out, n + '.json'), JSON.stringify(d, null, 2), 'utf8');
w('categories', categories);
w('restaurants', restaurants);
w('dishes', dishes);
w('vouchers', vouchers);
console.log(restaurants.length, 'restaurants,', dishes.length, 'dishes completely individualized and realistic!');
