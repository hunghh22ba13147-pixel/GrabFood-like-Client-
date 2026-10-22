import React from 'react';
import Placeholder, { useNav } from '../../components/Placeholder';

export default function OrderHistoryScreen() {
  const nav = useNav();
  return (
    <Placeholder title="Lịch sử đơn hàng" owner="TV4" links={[{ label: 'Xem đơn demo', go: () => nav.navigate('OrderTracking',{orderId:'demo'}) }]} />
  );
}
