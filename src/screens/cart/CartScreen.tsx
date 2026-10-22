import React from 'react';
import Placeholder, { useNav } from '../../components/Placeholder';

export default function CartScreen() {
  const nav = useNav();
  return (
    <Placeholder title="Giỏ hàng" owner="TV3" links={[{ label: 'Thanh toán', go: () => nav.navigate('Checkout') }]} />
  );
}
