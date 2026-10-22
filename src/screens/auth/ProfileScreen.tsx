import React from 'react';
import Placeholder, { useNav } from '../../components/Placeholder';

export default function ProfileScreen() {
  const nav = useNav();
  return (
    <Placeholder title="Tài khoản" owner="TV5" links={[{ label: 'Đăng xuất', go: () => nav.replace('Login') }]} />
  );
}
