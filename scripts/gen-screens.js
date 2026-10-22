// node scripts/gen-screens.js — sinh các màn hình placeholder (chỉ tạo file chưa tồn tại)
const fs = require('fs'); const path = require('path');
const S = [
  ['auth', 'SplashScreen', 'Splash', 'TV5', [['Tiếp tục', "replace('Onboarding')"]]],
  ['auth', 'OnboardingScreen', 'Onboarding', 'TV5', [['Bắt đầu', "replace('Login')"]]],
  ['auth', 'LoginScreen', 'Đăng nhập', 'TV5', [['Đăng nhập (demo)', "replace('Tabs')"], ['Đăng ký', "navigate('Register')"]]],
  ['auth', 'RegisterScreen', 'Đăng ký', 'TV5', [['Đăng ký (demo)', "replace('Tabs')"]]],
  ['auth', 'ProfileScreen', 'Tài khoản', 'TV5', [['Đăng xuất', "replace('Login')"]]],
  ['home', 'HomeScreen', 'Trang chủ', 'TV1', [['Tìm kiếm', "navigate('Search')"], ['Quán demo', "navigate('RestaurantDetail',{restaurantId:'r1'})"], ['Giỏ hàng', "navigate('Cart')"]]],
  ['home', 'SearchScreen', 'Tìm kiếm / Lọc', 'TV1', [['Quán demo', "navigate('RestaurantDetail',{restaurantId:'r1'})"]]],
  ['restaurant', 'RestaurantDetailScreen', 'Chi tiết quán', 'TV2', [['Chọn món', "navigate('DishOptions',{restaurantId:'r1',dishId:'r1-d1'})"], ['Giỏ hàng', "navigate('Cart')"]]],
  ['restaurant', 'DishOptionsScreen', 'Tuỳ chọn món (Size/Topping)', 'TV2', [['Thêm vào giỏ', "goBack()"]]],
  ['cart', 'CartScreen', 'Giỏ hàng', 'TV3', [['Thanh toán', "navigate('Checkout')"]]],
  ['cart', 'CheckoutScreen', 'Thanh toán', 'TV3', [['Đặt đơn (demo)', "replace('OrderTracking',{orderId:'demo'})"]]],
  ['orders', 'OrderTrackingScreen', 'Theo dõi đơn hàng', 'TV4', [['Về trang chủ', "navigate('Tabs')"]]],
  ['orders', 'OrderHistoryScreen', 'Lịch sử đơn hàng', 'TV4', [['Xem đơn demo', "navigate('OrderTracking',{orderId:'demo'})"]]],
];
for (const [dir, name, title, owner, links] of S) {
  const d = path.join(__dirname, '..', 'src', 'screens', dir);
  fs.mkdirSync(d, { recursive: true });
  const f = path.join(d, name + '.tsx');
  if (fs.existsSync(f)) continue;
  fs.writeFileSync(f, `import React from 'react';
import Placeholder, { useNav } from '../../components/Placeholder';

export default function ${name}() {
  const nav = useNav();
  return (
    <Placeholder title="${title}" owner="${owner}" links={[${links.map(([l, g]) => `{ label: '${l}', go: () => nav.${g.replace(/\)$/, '')}${g.includes('(') && !g.endsWith('()') ? ')' : ')'} }`).join(', ')}]} />
  );
}
`);
}
