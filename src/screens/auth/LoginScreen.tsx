import React from 'react';
import Placeholder, { useNav } from '../../components/Placeholder';

export default function LoginScreen() {
  const nav = useNav();
  return (
    <Placeholder title="Đăng nhập" owner="TV5" links={[{ label: 'Đăng nhập (demo)', go: () => nav.replace('Tabs') }, { label: 'Đăng ký', go: () => nav.navigate('Register') }]} />
  );
}
