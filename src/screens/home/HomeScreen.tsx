import React from 'react';
import Placeholder, { useNav } from '../../components/Placeholder';

export default function HomeScreen() {
  const nav = useNav();
  return (
    <Placeholder title="Trang chủ" owner="TV1" links={[{ label: 'Tìm kiếm', go: () => nav.navigate('Search') }, { label: 'Quán demo', go: () => nav.navigate('RestaurantDetail',{restaurantId:'r1'}) }, { label: 'Giỏ hàng', go: () => nav.navigate('Cart') }]} />
  );
}
