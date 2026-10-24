const fs = require('fs');
const path = require('path');

// Ảnh Unsplash chất lượng cao, độc nhất cho từng quán và từng món riêng biệt
const U = (id, w = 600, h = 400) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;

const RESTAURANT_IMG = {
  r1: '1558857563-b371033873b8', // Trà Sữa Phúc Long
  r2: '1497534446932-c925b458314e', // The Alley (Trà sữa / cốc sang trọng)
  r3: '1556679343-c7306c1976bc', // Gong Cha
  r4: '1544025162-d76694265947', // Cơm Tấm Cali (Sườn nướng)
  r5: '1589302168068-964664d93dc0', // Cơm Gà Hải Nam (Cơm gà hạt vàng)
  r6: '1582878826629-29b7ad1cdc43', // Phở Thìn Bờ Hồ
  r7: '1509722747041-616f39b57569', // Bún Chả Hương Liên
  r8: '1562967914-608f82629710', // KFC (Gà rán giòn rụm)
  r9: '1572802419224-296b0aeee0d9', // Lotteria (Burger)
  r10: '1565299624946-b28f40a0ae38', // Pizza 4P's
};

const DISH_IMG = {
  // Trà sữa
  'Trà sữa trân châu': '1558857563-b371033873b8', // Boba Milk Tea
  'Trà đào cam sả': '1541544741938-0af808871cc0', // Iced peach tea
  'Hồng trà macchiato': '1556679343-c7306c1976bc', // Macchiato tea
  'Matcha latte': '1517256064527-09c73fc73e38', // Matcha latte cốc xanh

  // Cơm
  'Cơm sườn bì chả': '1544025162-d76694265947', // Sườn nướng BBQ thơm lừng
  'Cơm gà xối mỡ': '1589302168068-964664d93dc0', // Cơm gà đùi vàng
  'Canh chua': '1548946526-f69e2424cf45', // Bát súp/canh nóng hổi

  // Bún / Phở
  'Phở bò tái': '1582878826629-29b7ad1cdc43', // Bát phở bò truyền thống
  'Bún chả': '1509722747041-616f39b57569', // Bún chả thịt nướng
  'Nem rán': '1606491956689-2ea866880c84', // Nem rán vàng ươm / Spring rolls

  // Fastfood
  'Gà rán 2 miếng': '1562967914-608f82629710', // 2 miếng gà rán giòn
  'Burger bò phô mai': '1572802419224-296b0aeee0d9', // Burger phô mai ngon mắt
  'Khoai tây chiên': '1573080496219-bb080dd4f877', // Khoai tây chiên giòn
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
  address: `${Math.round(distanceKm * 37)} Nguyễn Huệ, Quận 1, TP.HCM`,
  image: U(RESTAURANT_IMG[id]),
  promo: rating >= 4.7 ? 'Giảm 15%' : null,
}));

const MENU = {
  milktea: [
    ['Trà sữa trân châu', 45000, 'Best seller', 'Trà sữa truyền thống kèm trân châu dẻo dai'],
    ['Trà đào cam sả', 49000, 'Best seller', 'Hương vị đào tươi thanh mát, sả ngát thơm'],
    ['Hồng trà macchiato', 52000, 'Trà', 'Hồng trà thơm đậm kèm lớp kem cheese béo ngậy'],
    ['Matcha latte', 55000, 'Trà', 'Bột matcha Nhật Bản nguyên chất hòa quyện sữa tươi'],
  ],
  rice: [
    ['Cơm sườn bì chả', 55000, 'Món chính', 'Sườn nướng than hoa mềm thơm đậm đà'],
    ['Cơm gà xối mỡ', 50000, 'Món chính', 'Đùi gà giòn rụm bên ngoài mọng nước bên trong'],
    ['Canh chua', 25000, 'Món phụ', 'Canh chua cá bông lau giải nhiệt'],
  ],
  noodle: [
    ['Phở bò tái', 60000, 'Món chính', 'Bò mềm ngọt, nước dùng ninh xương 12 tiếng'],
    ['Bún chả', 55000, 'Món chính', 'Chả nướng than hoa đượm vị truyền thống Hà Nội'],
    ['Nem rán', 30000, 'Món phụ', 'Nem giòn rụm nhân thịt nấm chấm nước mắm tỏi ớt'],
  ],
  fastfood: [
    ['Gà rán 2 miếng', 69000, 'Combo', '2 miếng gà rán giòn cay nóng hổi đậm vị'],
    ['Burger bò phô mai', 59000, 'Combo', 'Thịt bò Úc nướng kèm phô mai Cheddar béo ngậy'],
    ['Khoai tây chiên', 25000, 'Món phụ', 'Khoai tây chiên giòn rắc muối lắc bơ'],
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
    { id: 'pearl-white', name: 'Trân châu trắng', price: 8000 },
    { id: 'pearl-black', name: 'Trân châu đen', price: 8000 },
    { id: 'pudding', name: 'Pudding trứng', price: 10000 },
  ],
};

const dishes = [];
restaurants.forEach((r) => {
  MENU[r.categoryId].forEach(([name, price, group, description], i) => {
    dishes.push({
      id: `${r.id}-d${i + 1}`,
      restaurantId: r.id,
      name,
      description,
      price,
      group,
      image: U(DISH_IMG[name], 400, 400),
      options: r.categoryId === 'milktea' && group !== 'Món phụ' ? [sizeOpt, topping] : [],
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
console.log(restaurants.length, 'restaurants,', dishes.length, 'dishes updated successfully with distinct photos!');
