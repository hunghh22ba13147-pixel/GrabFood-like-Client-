import React from 'react';
import Placeholder, { useNav } from '../../components/Placeholder';

export default function RestaurantDetailScreen() {
  const nav = useNav();
  return (
    <Placeholder title="Chi tiết quán" owner="TV2" links={[{ label: 'Chọn món', go: () => nav.navigate('DishOptions',{restaurantId:'r1',dishId:'r1-d1'}) }, { label: 'Giỏ hàng', go: () => nav.navigate('Cart') }]} />
  );
}
