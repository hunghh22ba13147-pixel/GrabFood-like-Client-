import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { colors, radius, shadow, spacing } from '../theme';

interface ToastState { message: string | null; id: number; show: (m: string) => void; hide: () => void }
export const useToastStore = create<ToastState>((set) => ({
  message: null,
  id: 0,
  show: (message) => set((s) => ({ message, id: s.id + 1 })),
  hide: () => set({ message: null }),
}));
/** Dùng ngoài component: showToast('Đã thêm vào giỏ hàng') */
export const showToast = (m: string) => useToastStore.getState().show(m);

/** Render 1 lần ở App.tsx */
export default function ToastHost() {
  const { message, id, hide } = useToastStore();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => hide());
    }, 1800);
    return () => clearTimeout(t);
  }, [id]);

  if (!message) return null;
  return (
    <SafeAreaView pointerEvents="none" edges={['top']} style={s.wrap}>
      <Animated.View style={[s.toast, { opacity }]}>
        <Text style={s.text}>{message}</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', zIndex: 999 },
  toast: { marginTop: spacing.md, backgroundColor: colors.text, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, ...shadow },
  text: { color: '#fff', fontWeight: '600' },
});
