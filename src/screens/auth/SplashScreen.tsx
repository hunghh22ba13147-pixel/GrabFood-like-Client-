import React from 'react';
import Placeholder, { useNav } from '../../components/Placeholder';

export default function SplashScreen() {
  const nav = useNav();
  return (
    <Placeholder title="Splash" owner="TV5" links={[{ label: 'Tiếp tục', go: () => nav.replace('Onboarding') }]} />
  );
}
