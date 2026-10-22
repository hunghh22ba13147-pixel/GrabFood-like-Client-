import React from 'react';
import Placeholder, { useNav } from '../../components/Placeholder';

export default function RegisterScreen() {
  const nav = useNav();
  return (
    <Placeholder title="Đăng ký" owner="TV5" links={[{ label: 'Đăng ký (demo)', go: () => nav.replace('Tabs') }]} />
  );
}
