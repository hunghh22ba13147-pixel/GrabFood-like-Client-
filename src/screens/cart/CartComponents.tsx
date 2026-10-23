import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { CartItem } from '../../models/types';
import { calcPricing, CartPricing, cartErrorMessage, useCartStore, voucherIssue } from '../../store/cartStore';
import { colors, formatVND, radius, spacing } from '../../theme';

export function displayMoney(value: number): string {
  return Number.isSafeInteger(value) && value >= 0 ? formatVND(value) : 'Giá không hợp lệ';
}

export function readCartPricing(cart: Pick<ReturnType<typeof useCartStore.getState>, 'items' | 'restaurant' | 'voucher'>) {
  try {
    const pricing = calcPricing(cart.items, cart.restaurant, cart.voucher);
    return { pricing, error: null, voucherError: cart.items.length ? voucherIssue(cart.voucher, pricing.subtotal) : null };
  } catch (error) {
    return { pricing: null, error: cartErrorMessage(error), voucherError: null };
  }
}

export function ActionButton({ label, onPress, disabled = false, loading = false, secondary = false }: {
  label: string; onPress: () => void; disabled?: boolean; loading?: boolean; secondary?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label}
    accessibilityState={{ disabled: disabled || loading, busy: loading }} aria-busy={loading} disabled={disabled || loading} onPress={onPress}
    style={({ pressed }) => [styles.button, secondary && styles.secondaryButton, (disabled || loading) && styles.disabled, pressed && styles.pressed]}>
    {loading && <ActivityIndicator color={secondary ? colors.primary : colors.card} />}
    <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{label}</Text>
  </Pressable>;
}

export function ErrorMessage({ message }: { message: string | null }) {
  return message ? <Text accessibilityRole="alert" style={styles.error}>{message}</Text> : null;
}

export function EmptyCart({ onBrowse }: { onBrowse: () => void }) {
  return <View style={styles.empty}>
    <Text style={styles.emptyIcon} accessibilityElementsHidden>🛍️</Text>
    <Text style={styles.heading}>Giỏ hàng đang trống</Text>
    <Text style={styles.muted}>Chọn món yêu thích để bắt đầu đơn hàng của bạn.</Text>
    <Text style={styles.total}>{formatVND(0)}</Text>
    <ActionButton label="Khám phá món ăn" onPress={onBrowse} />
  </View>;
}

export function PricingBreakdown({ pricing }: { pricing: CartPricing }) {
  return <View style={styles.card}>
    <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
    {([
      ['Tạm tính (gồm lựa chọn)', pricing.subtotal],
      ['Phí giao hàng', pricing.deliveryFee],
      ['Giảm giá', pricing.discount],
    ] as const).map(([label, value]) => <View key={label} style={styles.row}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.body}>{label === 'Giảm giá' && value > 0 ? '−' : ''}{displayMoney(value)}</Text>
    </View>)}
    <View style={[styles.row, styles.totalRow]}><Text style={styles.sectionTitle}>Tổng thanh toán</Text><Text style={styles.total}>{displayMoney(pricing.total)}</Text></View>
  </View>;
}

export function CartItemCard({ item, disabled, onQuantity, onRemove }: {
  item: CartItem; disabled: boolean; onQuantity: (quantity: number) => void; onRemove: () => void;
}) {
  const selections = item.selectedOptions.map((selection) => {
    const option = item.dish.options.find((entry) => entry.id === selection.optionId);
    const names = selection.choiceIds.map((id) => option?.choices.find((choice) => choice.id === id)?.name ?? id);
    return `${option?.name ?? selection.optionId}: ${names.join(', ')}`;
  });
  return <View style={styles.card}>
    <View style={styles.itemHeader}>
      <Image source={{ uri: item.dish.image }} style={styles.foodImage} accessibilityLabel={item.dish.name} />
      <View style={styles.flex}>
        <Text style={styles.sectionTitle}>{item.dish.name}</Text>
        {selections.map((selection) => <Text key={selection} style={styles.muted}>{selection}</Text>)}
        {!!item.note && <Text style={styles.muted}>Ghi chú: {item.note}</Text>}
        <Text style={styles.unitPrice}>{displayMoney(item.unitPrice)} / phần</Text>
      </View>
    </View>
    <View style={styles.row}>
      <View style={styles.quantity}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Giảm số lượng ${item.dish.name}`} accessibilityState={{ disabled }} disabled={disabled}
          hitSlop={8} onPress={() => onQuantity(item.quantity - 1)} style={[styles.quantityButton, disabled && styles.disabled]}><Text style={styles.quantityText}>−</Text></Pressable>
        <Text accessibilityLabel={`Số lượng ${item.quantity}`} style={styles.quantityText}>{item.quantity}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`Tăng số lượng ${item.dish.name}`} accessibilityState={{ disabled }} disabled={disabled}
          hitSlop={8} onPress={() => onQuantity(item.quantity + 1)} style={[styles.quantityButton, disabled && styles.disabled]}><Text style={styles.quantityText}>+</Text></Pressable>
      </View>
      <Text style={styles.sectionTitle}>{displayMoney(item.unitPrice * item.quantity)}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Xóa ${item.dish.name}`} accessibilityState={{ disabled }} disabled={disabled} onPress={onRemove} hitSlop={8}>
        <Text style={[styles.removeText, disabled && styles.disabled]}>Xóa</Text>
      </Pressable>
    </View>
  </View>;
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: colors.border },
  heading: { fontSize: 23, fontWeight: '700', color: colors.text },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, flexShrink: 1 },
  body: { fontSize: 15, color: colors.text, flexShrink: 1 },
  muted: { fontSize: 14, lineHeight: 21, color: colors.muted, flexShrink: 1 },
  total: { fontSize: 21, fontWeight: '700', color: colors.primary, flexShrink: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, flexWrap: 'wrap' },
  totalRow: { borderTopWidth: 1, borderColor: colors.border, paddingTop: spacing.md },
  flex: { flex: 1, gap: spacing.xs, minWidth: 0 },
  button: { minHeight: 50, borderRadius: radius.md, backgroundColor: colors.primary, padding: spacing.md, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  buttonText: { color: colors.card, fontWeight: '700', fontSize: 16, textAlign: 'center', flexShrink: 1 },
  secondaryButton: { backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primary },
  secondaryButtonText: { color: colors.primaryDark },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.75 },
  footer: { padding: spacing.lg, gap: spacing.sm, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  empty: { flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.lg, alignItems: 'stretch' },
  emptyIcon: { fontSize: 48, textAlign: 'center' },
  error: { color: colors.danger, fontSize: 14, lineHeight: 21, backgroundColor: '#FFF0F0', padding: spacing.md, borderRadius: radius.sm },
  itemHeader: { flexDirection: 'row', gap: spacing.md },
  foodImage: { width: 64, height: 64, borderRadius: radius.sm, backgroundColor: colors.bg },
  unitPrice: { color: colors.primaryDark, fontWeight: '500', fontSize: 14 },
  quantity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  quantityButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight, borderRadius: radius.sm },
  quantityText: { color: colors.primaryDark, fontWeight: '600', fontSize: 18 },
  removeText: { color: colors.danger, fontSize: 14, fontWeight: '500', paddingVertical: spacing.sm },
});
