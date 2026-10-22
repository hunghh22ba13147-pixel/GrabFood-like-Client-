import React from 'react';
import Placeholder, { useNav } from '../../components/Placeholder';

export default function OnboardingScreen() {
  const nav = useNav();
  return (
    <Placeholder title="Onboarding" owner="TV5" links={[{ label: 'Bắt đầu', go: () => nav.replace('Login') }]} />
  );
}
