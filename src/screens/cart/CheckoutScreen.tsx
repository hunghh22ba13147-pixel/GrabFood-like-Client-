import React, { useRef, useState, useSyncExternalStore } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { PaymentMethod } from '../../models/types';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useOrderStore } from '../../store/orderStore';
import { colors, radius, spacing } from '../../theme';
import { ActionButton, displayMoney, EmptyCart, ErrorMessage, PricingBreakdown, readCartPricing, styles } from './CartComponents';
import { checkoutReview, createCheckoutController } from './checkout';
import VoucherPicker from './VoucherPicker';

export default function CheckoutScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const cart = useCartStore();
  const user = useAuthStore((state) => state.user);
  const address = user?.address ?? '';
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const controllerRef = useRef<ReturnType<typeof createCheckoutController> | null>(null);
  if (!controllerRef.current) controllerRef.current = createCheckoutController({
    placeOrder: (payload) => useOrderStore.getState().placeOrder(payload),
    getAddress: () => useAuthStore.getState().user?.address ?? '',
    openTracking: (orderId) => nav.replace('OrderTracking', { orderId }),
  });
  const controller = controllerRef.current;
  const state = useSyncExternalStore(controller.subscribe, controller.getState, controller.getState);
  const { pricing, error: pricingError, voucherError } = readCartPricing(cart);
  const review = pricing ? checkoutReview(cart, address) : null;
  const busy = state.phase === 'submitting' || cart.checkoutLocked;

  if (state.phase === 'created') return <SafeAreaView edges={['bottom']} style={styles.screen}>
    <View style={styles.empty}>
      <Text style={styles.heading}>Đơn hàng đã được tạo</Text><Text style={styles.body}>Mã đơn: {state.orderId}</Text>
      <ErrorMessage message={state.error} /><ActionButton label="Mở theo dõi đơn hàng" onPress={controller.openTracking} />
    </View>
  </SafeAreaView>;
  if (!cart.items.length) return <SafeAreaView edges={['bottom']} style={styles.screen}>
    <EmptyCart onBrowse={() => nav.navigate('Tabs', { screen: 'Home' })} />
  </SafeAreaView>;

  return <SafeAreaView edges={['bottom']} style={styles.screen}>
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Kiểm tra đơn hàng</Text>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Giao đến</Text>
          <Text style={styles.body}>{address || 'Chưa có địa chỉ giao hàng'}</Text>
          {!address.trim() && <ErrorMessage message="Cập nhật địa chỉ trong Tài khoản để đặt đơn." />}
          <Text style={styles.muted}>{cart.restaurant?.name}</Text>
          {cart.items.map((item) => <View key={item.key} style={styles.flex}>
            <View style={styles.row}><Text style={styles.body}>{item.quantity} × {item.dish.name}</Text><Text style={styles.body}>{displayMoney(item.unitPrice * item.quantity)}</Text></View>
            {item.selectedOptions.map((selection) => {
              const option = item.dish.options.find((entry) => entry.id === selection.optionId);
              return <Text key={selection.optionId} style={styles.muted}>{option?.name}: {selection.choiceIds.map((id) => option?.choices.find((choice) => choice.id === id)?.name ?? id).join(', ')}</Text>;
            })}
            {!!item.note && <Text style={styles.muted}>Ghi chú: {item.note}</Text>}
          </View>)}
        </View>
        <VoucherPicker disabled={busy} />
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          {([
            { value: 'cash', label: 'Tiền mặt', detail: 'Thanh toán khi nhận hàng' },
            { value: 'wallet', label: 'Ví điện tử (giả lập)', detail: 'Chỉ mô phỏng lựa chọn; không thu tiền thật' },
          ] as const).map((method) => <Pressable key={method.value} accessibilityRole="radio"
            accessibilityLabel={method.label} accessibilityState={{ checked: payment === method.value, disabled: busy }}
            aria-checked={payment === method.value}
            disabled={busy} onPress={() => setPayment(method.value)} style={[checkoutStyles.payment, payment === method.value && checkoutStyles.selected, busy && styles.disabled]}>
            <Text style={styles.sectionTitle}>{payment === method.value ? '● ' : '○ '}{method.label}</Text>
            <Text style={styles.muted}>{method.detail}</Text>
          </Pressable>)}
        </View>
        <ErrorMessage message={pricingError} />
        {pricing && <PricingBreakdown pricing={pricing} />}
        <ErrorMessage message={state.error} />
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.muted}>Kiểm tra món, lựa chọn và tổng tiền trước khi đặt.</Text>
        <ActionButton label={busy ? 'Đang tạo đơn…' : `Đặt đơn${pricing ? ' · ' + displayMoney(pricing.total) : ''}`}
          loading={busy} disabled={!pricing || !!voucherError || !payment || !address.trim()}
          onPress={() => controller.submit(review, payment)} />
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const checkoutStyles = StyleSheet.create({
  payment: { padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, gap: spacing.xs },
  selected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
});
