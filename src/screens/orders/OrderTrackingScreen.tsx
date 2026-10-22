import React from 'react';
import Placeholder, { useNav } from '../../components/Placeholder';

export default function OrderTrackingScreen() {
  const nav = useNav();
  return (
    <Placeholder title="Theo dõi đơn hàng" owner="TV4" links={[{ label: 'Về trang chủ', go: () => nav.navigate('Tabs') }]} />
  );
}
