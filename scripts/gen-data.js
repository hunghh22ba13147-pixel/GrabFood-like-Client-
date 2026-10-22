// Sinh dữ liệu mẫu: node scripts/gen-data.js  (TV5 có thể sửa trực tiếp file JSON sau khi sinh)
const fs = require('fs');
const path = require('path');
const img = (s, w = 600, h = 400) => `https://picsum.photos/seed/${s}/${w}/${h}`;

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
  id, name, categoryId, rating, reviewCount: 100 + Math.round(rating * 97),
  distanceKm, etaMin, deliveryFee: 5000 + Math.round(distanceKm) * 3000,
  address: `${Math.round(distanceKm * 37)} Nguyễn Huệ, Quận 1, TP.HCM`,
  image: img(id), promo: rating >= 4.7 ? 'Giảm 15%' : null,
}));

// [name, price, group, desc]
const MENU = {
  milktea: [
    ['Trà sữa trân châu', 45000, 'Best seller', 'Trà sữa truyền thống'],
    ['Trà đào cam sả', 49000, 'Best seller', 'Thanh mát, giải nhiệt'],
    ['Hồng trà macchiato', 52000, 'Trà', 'Lớp kem béo mịn'],
    ['Matcha latte', 55000, 'Trà', 'Matcha Nhật Bản'],
  ],
  rice: [
    ['Cơm sườn bì chả', 55000, 'Món chính', 'Sườn nướng than'],
    ['Cơm gà xối mỡ', 50000, 'Món chính', 'Da giòn thịt mềm'],
    ['Canh chua', 25000, 'Món phụ', 'Canh chua cá'],
  ],
  noodle: [
    ['Phở bò tái', 60000, 'Món chính', 'Nước dùng 12 tiếng'],
    ['Bún chả', 55000, 'Món chính', 'Chả nướng than hoa'],
    ['Nem rán', 30000, 'Món phụ', '4 cái / phần'],
  ],
  fastfood: [
    ['Gà rán 2 miếng', 69000, 'Combo', 'Gà giòn cay'],
    ['Burger bò phô mai', 59000, 'Combo', 'Bò Úc'],
    ['Khoai tây chiên', 25000, 'Món phụ', 'Size vừa'],
  ],
};
const sizeOpt = {
  id: 'size', name: 'Size', required: true, multiple: false,
  choices: [{ id: 'M', name: 'M', price: 0 }, { id: 'L', name: 'L', price: 7000 }],
};
const topping = {
  id: 'topping', name: 'Topping', required: false, multiple: true,
  choices: [
    { id: 'pearl-white', name: 'Trân châu trắng', price: 8000 },
    { id: 'pearl-black', name: 'Trân châu đen', price: 8000 },
    { id: 'pudding', name: 'Pudding', price: 10000 },
  ],
};

const dishes = [];
restaurants.forEach((r) => {
  MENU[r.categoryId].forEach(([name, price, group, description], i) => {
    dishes.push({
      id: `${r.id}-d${i + 1}`, restaurantId: r.id, name, description, price, group,
      image: img(`${r.id}-d${i + 1}`, 400, 400),
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
const w = (n, d) => fs.writeFileSync(path.join(out, n + '.json'), JSON.stringify(d, null, 2));
w('categories', categories); w('restaurants', restaurants); w('dishes', dishes); w('vouchers', vouchers);
console.log(restaurants.length, 'restaurants,', dishes.length, 'dishes');
