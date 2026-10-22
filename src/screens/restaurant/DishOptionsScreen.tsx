import React from 'react';
import Placeholder, { useNav } from '../../components/Placeholder';

export default function DishOptionsScreen() {
  const nav = useNav();
  return (
    <Placeholder title="Tuỳ chọn món (Size/Topping)" owner="TV2" links={[{ label: 'Thêm vào giỏ', go: () => nav.goBack() }]} />
  );
}
