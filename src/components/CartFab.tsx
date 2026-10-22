import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../store/cartStore';
import { colors, formatVND, radius, shadow, spacing } from '../theme';

/** Nút giỏ hàng nổi kèm badge số lượng; tự ẩn khi giỏ trống. */
export default function CartFab() {
  const nav = useNavigation<any>();
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const total = useCartStore((s) => s.items.reduce((n, i) => n + i.unitPrice * i.quantity, 0));
  if (!count) return null;
  return (
    <Pressable style={s.fab} onPress={() => nav.navigate('Cart')}>
      <View>
        <Ionicons name="cart" size={24} color="#fff" />
        <View style={s.badge}><Text style={s.badgeText}>{count}</Text></View>
      </View>
      <Text style={s.text}>Xem giỏ hàng</Text>
      <Text style={s.text}>{formatVND(total)}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  fab: {
    position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg,
    backgroundColor: colors.primary, borderRadius: radius.pill, padding: spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...shadow,
  },
  badge: { position: 'absolute', top: -6, right: -10, backgroundColor: colors.danger, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  text: { color: '#fff', fontWeight: '700' },
});
