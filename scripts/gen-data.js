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

const U = (id, w = 600, h = 400) => {
  if (typeof id === 'string' && id.startsWith('http')) return id;
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;
};

// 1. Ảnh mặt tiền quán ăn - Riêng biệt cho từng quán
const RESTAURANT_IMG = {
  r1: '1517248135467-4c7edcad34c4', // Trà Sữa Phúc Long
  r2: '1497534446932-c925b458314e', // The Alley
  r3: '1590846406792-0adc7f938f1d', // Gong Cha
  r4: '1552566626-52f8b828add9', // Cơm Tấm Cali
  r5: '1555396273-367ea4eb4db5', // Cơm Gà Hải Nam
  r6: '1582878826629-29b7ad1cdc43', // Phở Thìn Bờ Hồ
  r7: '1509722747041-616f39b57569', // Bún Chả Hương Liên
  r8: '1562967914-608f82629710', // KFC
  r9: '1572802419224-296b0aeee0d9', // Lotteria
  r10: '1565299624946-b28f40a0ae38', // Pizza 4P's
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

// 2. Thực đơn chuyên biệt theo bản sắc từng nhà hàng (4 món/quán = 40 món hoàn chỉnh)
// Cấu trúc: [Tên món, Giá, Nhóm, Mô tả, PhotoUnsplashID, CóOption]
const RESTAURANT_MENUS = {
  // Trà Sữa Phúc Long
  r1: [
    ['Trà sữa Phúc Long', 45000, 'Best seller', 'Trà đen đậm vị truyền thống kết hợp sữa béo thơm', 'https://images.pexels.com/photos/6412836/pexels-photo-6412836.jpeg?auto=compress&cs=tinysrgb&w=500', true],
    ['Trà đào cam sả Phúc Long', 52000, 'Best seller', 'Đào ngâm giòn ngọt thanh kết hợp hương sả nồng nàn', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&h=400&fit=crop&q=80', true],
    ['Trà vải sen', 49000, 'Trà trái cây', 'Hương sen thanh tao hòa cùng trái vải mọng nước', '1556679343-c7306c1976bc', true],
    ['Bánh croissant bơ tỏi', 28000, 'Bánh ngọt', 'Bánh sừng bò nướng bơ tỏi giòn tan nóng hổi', '1555507036-ab1f4038808a', false],
  ],

  // The Alley
  r2: [
    ['Sữa tươi trân châu đường đen', 65000, 'Món đặc trưng', 'Đường đen Okinawa nấu dẻo kết hợp sữa tươi thanh trùng', '1558857563-b371033873b8', true],
    ['Lục trà sữa trân châu', 55000, 'Trà sữa', 'Lục trà lài thơm ngát quyện trân châu đường đen', '1515823064-d6e0c04616a7', true],
    ['Trà xoài kem tuyết', 60000, 'Đá xay', 'Xoài cát tươi xay nhuyễn phủ lớp kem cheese mặn', '1546173159-315724a31696', true],
    ['Sữa chua trân châu đường đen', 50000, 'Đặc biệt', 'Sữa chua dẻo kết hợp trân châu đường đen ấm nóng', 'https://images.pexels.com/photos/11160112/pexels-photo-11160112.jpeg?auto=compress&cs=tinysrgb&w=500', true],
  ],

  // Gong Cha
  r3: [
    ['Alisan Gong Cha Macchiato', 55000, 'Best seller', 'Trà Alisan thượng hạng phủ lớp váng sữa sánh mịn', 'https://images.pexels.com/photos/11160112/pexels-photo-11160112.jpeg?auto=compress&cs=tinysrgb&w=500', true],
    ['Trà sữa ô long', 48000, 'Trà sữa', 'Trà ô long nướng Đài Loan hương vị đậm đà', '1572490122747-3968b75cc699', true],
    ['Trà chanh vàng bưởi đỏ', 50000, 'Trà trái cây', 'Vị chua ngọt sảng khoái vitamin C dồi dào', '1513558161293-cdaf765ed2fd', true],
    ['Trà xanh Alisan chanh dây', 49000, 'Trà trái cây', 'Trà xanh thanh tao hòa cùng sốt chanh dây tươi mát', '1556679343-c7306c1976bc', true],
  ],

  // Cơm Tấm Cali
  r4: [
    ['Cơm tấm sườn nướng Cali', 65000, 'Món chính', 'Sườn nướng than hoa mềm đẫm sốt bí truyền', '1544025162-d76694265947', false],
    ['Cơm tấm sườn bì chả đặc biệt', 75000, 'Món chính', 'Đầy đủ sườn cây, bì thính, chả trứng hấp và trứng ốp la', '1603133872878-684f208fb84b', false],
    ['Canh chua tôm lá giang', 30000, 'Canh phụ', 'Canh chua tôm tươi nấu lá giang chua dịu thanh mát', '1603105037880-880cd4edfb0d', false],
    ['Chả giò tôm thịt (3 cuốn)', 35000, 'Món ăn kèm', 'Chả giò chiên vàng rụm chấm nước mắm chua ngọt', 'https://images.pexels.com/photos/8178762/pexels-photo-8178762.jpeg?auto=compress&cs=tinysrgb&w=500', false],
  ],

  // Cơm Gà Hải Nam
  r5: [
    ['Cơm gà luộc Hải Nam', 58000, 'Món đặc trưng', 'Thịt gà luộc da vàng mọng nước, hạt cơm nấu nước luộc gà béo ngậy', '1598515214211-89d3c73ae83b', false],
    ['Cơm gà xối mỡ đùi góc tư', 62000, 'Món chính', 'Đùi gà xối mỡ da giòn rụm chấm sốt gừng ớt', '1626645738196-c2a7c87a8f58', false],
    ['Canh gà hầm nấm đông cô', 25000, 'Canh phụ', 'Canh gà thanh ngọt bổ dưỡng hầm cùng nấm tươi', '1547592166-23ac45744acd', false],
    ['Cơm lòng gà trứng non', 55000, 'Món phụ', 'Lòng mề gà xào đậm đà kèm chùm trứng non vàng ươm béo ngậy', '1544025162-d76694265947', false],
  ],

  // Phở Thìn Bờ Hồ
  r6: [
    ['Phở bò tái lăn truyền thống', 65000, 'Món chính', 'Thịt bò xào lăn lửa lớn ngập hành hoa thơm nức mũi', '1582878826629-29b7ad1cdc43', false],
    ['Phở nạm gầu giòn', 65000, 'Món chính', 'Gầu bò giòn sần sật, nước dùng ninh xương ngọt tự nhiên', 'https://images.pexels.com/photos/6646351/pexels-photo-6646351.jpeg?auto=compress&cs=tinysrgb&w=500', false],
    ['Quẩy giòn giòn ăn phở', 10000, 'Món ăn kèm', 'Quẩy vàng giòn rụm nhúng cùng nước dùng nóng hổi', 'https://images.pexels.com/photos/36361401/pexels-photo-36361401/free-photo-of-delicious-churros-with-chocolate-dip-on-plate.jpeg?auto=compress&cs=tinysrgb&w=500', false],
    ['Trứng gà chần', 12000, 'Món ăn kèm', 'Trứng gà ta chần lòng đào bổ dưỡng', '1525351484163-7529414344d8', false],
  ],

  // Bún Chả Hương Liên (Bún chả Obama)
  r7: [
    ['Bún chả đặc biệt (Chả miếng + Chả băm)', 60000, 'Món chính', 'Chả nướng than hoa đượm khói, nước chấm đu đủ tỏi ớt ấm nóng', '1555126634-323283e090fa', false],
    ['Nem cua bể hải sản', 40000, 'Món ăn kèm', 'Nem vuông giòn tan đẫm thịt cua bể tươi và tôm sú', 'https://images.pexels.com/photos/34623149/pexels-photo-34623149/free-photo-of-fresh-vietnamese-spring-rolls-with-dipping-sauce.jpeg?auto=compress&cs=tinysrgb&w=500', false],
    ['Chả que nướng lá lốt', 35000, 'Món ăn kèm', 'Thịt bò băm cuốn lá lốt nướng than hoa thơm lừng', 'https://images.pexels.com/photos/8178762/pexels-photo-8178762.jpeg?auto=compress&cs=tinysrgb&w=500', false],
    ['Bún thêm / Rau sống', 10000, 'Món phụ', 'Phần bún sợi nhỏ thanh mát và đĩa rau kinh giới thơm', '1540420773420-3366772f4999', false],
  ],

  // KFC
  r8: [
    ['Combo Gà Rán Giòn Cay (2 Miếng)', 79000, 'Combo Hot', '2 miếng gà rán giòn rụm phủ gia vị cay đậm đà KFC', '1562967914-608f82629710', false],
    ['Burger Zinger Tôm giòn', 59000, 'Burger', 'Nhân tôm chiên xù giòn tan kèm sốt mayonnaise cay', '1572802419224-296b0aeee0d9', false],
    ['Gà Popcorn vừa giòn cay', 42000, 'Gà viên', 'Gà viên chiên giòn rụm dễ ăn phủ bột gia vị cay', '1562967914-608f82629710', false],
    ['Khoai tây chiên cỡ vừa', 29000, 'Món phụ', 'Khoai tây cọng chiên vàng giòn rắc muối ớt', '1573080496219-bb080dd4f877', false],
  ],

  // Lotteria
  r9: [
    ['Gà rán sốt đậu ngọt', 75000, 'Gà sốt', 'Gà rán phủ nước sốt đậu ngọt bùi đặc trưng Lotteria', '1527477396000-e27163b481c2', false],
    ['Burger Bò Bulgogi Hàn Quốc', 55000, 'Burger', 'Bò nướng sốt Bulgogi trứ danh thơm ngọt đậm vị', '1568901346375-23c9450c58cd', false],
    ['Mực chiên xù giòn tan', 45000, 'Món phụ', 'Mực khoanh tẩm bột chiên xù chấm sốt tương ớt ngọt', 'https://images.pexels.com/photos/8178762/pexels-photo-8178762.jpeg?auto=compress&cs=tinysrgb&w=500', false],
    ['Khoai tây lắc phô mai', 35000, 'Món phụ', 'Khoai tây chiên lắc cùng bột phô mai béo ngậy', '1585109649139-366815a0d713', false],
  ],

  // Pizza 4P's
  r10: [
    ['Pizza 4 Loại Phô Mai (4 Cheese)', 175000, 'Pizza', 'Phô mai Camembert, Mozzarella, Gorgonzola kèm mật ong hữu cơ', '1513104890138-7c749659a591', false],
    ['Pizza Phô Mai Burrata Thịt Nguội', 195000, 'Pizza Signature', 'Trái phô mai Burrata tươi béo ngậy kèm dăm bông Parma Ham', '1565299624946-b28f40a0ae38', false],
    ['Mì Ý sốt kem cua biển', 160000, 'Mì Ý Pasta', 'Mì Ý sốt kem cà chua thơm nức quyện thịt cua xé tay', '1551183053-bf91a1d81141', false],
    ['Salad hoa quả sốt chanh leo', 95000, 'Khai vị', 'Rau rocket, táo, cam kèm phô mai tươi và sốt chanh leo', '1540420773420-3366772f4999', false],
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
  { id: 'v4', code: 'GIAM30K', title: 'Giảm 30.000đ đơn từ 120k', type: 'amount', value: 30000, minOrder: 120000 },
  { id: 'v5', code: 'BANMOI', title: 'Giảm 20.000đ cho bạn mới', type: 'amount', value: 20000, minOrder: 60000 },
];

const out = path.join(__dirname, '..', 'src', 'data');
fs.mkdirSync(out, { recursive: true });
const w = (n, d) => fs.writeFileSync(path.join(out, n + '.json'), JSON.stringify(d, null, 2), 'utf8');
w('categories', categories);
w('restaurants', restaurants);
w('dishes', dishes);
w('vouchers', vouchers);
console.log(restaurants.length, 'restaurants,', dishes.length, 'dishes,', vouchers.length, 'vouchers completely individualized and realistic!');
