import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';

export default function SplashScreen() {
  const navigation = useNavigation<any>();
  const hydrate = useAuthStore((state) => state.hydrate);
  useEffect(() => {
    let active = true;
    Promise.all([hydrate(), useOrderStore.getState().hydrateOrders()]).finally(async () => {
      if (!active) return;
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const { user, onboardingComplete } = useAuthStore.getState();
      navigation.reset({ index: 0, routes: [{ name: user ? 'Tabs' : onboardingComplete ? 'Login' : 'Onboarding' }] });
    });
    return () => { active = false; };
  }, [hydrate, navigation]);
  return <View style={styles.container}><View style={styles.logo}><Text style={styles.logoText}>G</Text></View><Text style={styles.title}>GrabFood</Text><Text style={styles.subtitle}>Món ngon đến tận cửa</Text><ActivityIndicator color={colors.primary} style={styles.loading} /></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 82, height: 82, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontSize: 48, fontWeight: '900' }, title: { color: colors.text, fontSize: 30, fontWeight: '900', marginTop: 18 },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: 6 }, loading: { marginTop: 34 },
});
