import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Voucher } from '../../models/types';
import { api } from '../../services/api';
import { cartErrorMessage, useCartStore, validateVoucher } from '../../store/cartStore';
import { colors, formatVND, radius, spacing } from '../../theme';
import { ActionButton, ErrorMessage, readCartPricing, styles } from './CartComponents';

export function findVoucher(vouchers: Voucher[], code: string): Voucher | undefined {
  const normalized = code.trim().toUpperCase();
  return normalized ? vouchers.find((voucher) => voucher.code.trim().toUpperCase() === normalized) : undefined;
}

export default function VoucherPicker({ disabled = false }: { disabled?: boolean }) {
  const cart = useCartStore();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const pricingState = readCartPricing(cart);
  const busy = disabled || cart.checkoutLocked;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);
    api.getVouchers().then((result) => {
      result.forEach(validateVoucher);
      if (active) setVouchers(result);
    })
      .catch(() => { if (active) setLoadError('Không tải được mã giảm giá. Bạn có thể thử lại.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  function apply(voucher?: Voucher) {
    try {
      const selected = voucher ?? findVoucher(vouchers, code);
      if (!selected) {
        setInputError(code.trim() ? 'Không tìm thấy mã giảm giá này.' : 'Vui lòng nhập mã giảm giá.');
        return;
      }
      cart.applyVoucher(selected);
      setCode(selected.code);
      setInputError(null);
    } catch (error) { setInputError(cartErrorMessage(error)); }
  }

  return <View style={styles.card}>
    <Text style={styles.sectionTitle}>Mã giảm giá</Text>
    {cart.voucher && <View style={styles.flex}>
      <Text style={voucherStyles.applied}>Đã chọn: {cart.voucher.code} · {cart.voucher.title}</Text>
      <ActionButton secondary label="Bỏ mã giảm giá" disabled={busy} onPress={() => {
        try { cart.applyVoucher(null); setInputError(null); setCode(''); }
        catch (error) { setInputError(cartErrorMessage(error)); }
      }} />
    </View>}
    <ErrorMessage message={pricingState.voucherError} />
    <TextInput accessibilityLabel="Nhập mã giảm giá" placeholder="Nhập mã giảm giá" placeholderTextColor={colors.muted}
      value={code} onChangeText={(value) => { setCode(value); setInputError(null); }} editable={!busy}
      autoCapitalize="characters" autoCorrect={false} returnKeyType="done"
      onSubmitEditing={() => { if (!busy && !loading && !loadError) apply(); }} style={voucherStyles.input} />
    <ActionButton secondary label="Áp dụng mã" disabled={busy || loading || !!loadError || !code.trim()} onPress={() => apply()} />
    <ErrorMessage message={inputError} />
    {loading && <View style={styles.row}><ActivityIndicator color={colors.primary} /><Text style={styles.muted}>Đang tải mã giảm giá…</Text></View>}
    <ErrorMessage message={loadError} />
    {loadError && <ActionButton secondary label="Tải lại mã giảm giá" disabled={busy} onPress={() => setAttempt((value) => value + 1)} />}
    {!loading && !loadError && vouchers.length === 0 && <Text style={styles.muted}>Hiện chưa có mã giảm giá.</Text>}
    {!loading && !loadError && vouchers.map((voucher) => <View key={voucher.id} style={voucherStyles.voucher}>
      <Text style={styles.sectionTitle}>{voucher.code}</Text>
      <Text style={styles.body}>{voucher.title}</Text>
      <Text style={styles.muted}>Đơn từ {formatVND(voucher.minOrder)} (chưa gồm phí giao hàng)</Text>
      <ActionButton secondary label={`Dùng ${voucher.code}`} disabled={busy || !pricingState.pricing || pricingState.pricing.subtotal < voucher.minOrder || cart.voucher?.id === voucher.id}
        onPress={() => apply(voucher)} />
    </View>)}
  </View>;
}

const voucherStyles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.md, fontSize: 16, color: colors.text, backgroundColor: colors.bg },
  applied: { color: colors.primaryDark, fontWeight: '600', fontSize: 14, lineHeight: 21 },
  voucher: { borderTopWidth: 1, borderColor: colors.border, paddingTop: spacing.md, gap: spacing.sm },
});
