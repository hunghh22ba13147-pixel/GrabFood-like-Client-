import React from 'react';
import Placeholder, { useNav } from '../../components/Placeholder';

export default function SearchScreen() {
  const nav = useNav();
  return (
    <Placeholder title="Tìm kiếm / Lọc" owner="TV1" links={[{ label: 'Quán demo', go: () => nav.navigate('RestaurantDetail',{restaurantId:'r1'}) }]} />
  );
}
