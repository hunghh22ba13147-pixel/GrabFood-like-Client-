import React from 'react';
import Placeholder, { useNav } from '../../components/Placeholder';

export default function CheckoutScreen() {
  const nav = useNav();
  return (
    <Placeholder title="Thanh toán" owner="TV3" links={[{ label: 'Đặt đơn (demo)', go: () => nav.replace('OrderTracking',{orderId:'demo'}) }]} />
  );
}
