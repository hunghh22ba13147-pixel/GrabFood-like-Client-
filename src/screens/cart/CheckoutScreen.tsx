import React, { useRef, useState, useSyncExternalStore } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
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
import AddressPicker, { PickedAddress } from '../../components/AddressPicker';
import { showToast } from '../../components/Toast';

export default function CheckoutScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const cart = useCartStore();
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const address = user?.address ?? '18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội';

  const [payment, setPayment] = useState<PaymentMethod | null>('cash');
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  const controllerRef = useRef<ReturnType<typeof createCheckoutController> | null>(null);
  if (!controllerRef.current) controllerRef.current = createCheckoutController({
    placeOrder: (payload) => useOrderStore.getState().placeOrder(payload),
    getAddress: () => useAuthStore.getState().user?.address ?? '18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
    openTracking: (orderId) => nav.replace('OrderTracking', { orderId }),
  });
  const controller = controllerRef.current;
  const state = useSyncExternalStore(controller.subscribe, controller.getState, controller.getState);
  const { pricing, error: pricingError, voucherError } = readCartPricing(cart);
  const review = pricing ? checkoutReview(cart, address) : null;
  const busy = state.phase === 'submitting' || cart.checkoutLocked;

  const handleSelectAddress = async (place: PickedAddress) => {
    setShowAddressPicker(false);
    try {
      await updateProfile({ address: place.address });
      showToast('Đã đổi địa chỉ giao hàng!');
    } catch {
      // ignore
    }
  };

  if (state.phase === 'created') return <SafeAreaView edges={['bottom']} style={styles.screen}>
    <View style={styles.empty}>
      <Text style={styles.heading}>Đơn hàng đã được tạo</Text>
      <Text style={styles.body}>Mã đơn: {state.orderId}</Text>
      <ErrorMessage message={state.error} />
      <ActionButton label="Mở theo dõi đơn hàng" onPress={controller.openTracking} />
    </View>
  </SafeAreaView>;

  if (!cart.items.length) return <SafeAreaView edges={['bottom']} style={styles.screen}>
    <EmptyCart onBrowse={() => nav.navigate('Tabs', { screen: 'Home' })} />
  </SafeAreaView>;

  return <SafeAreaView edges={['bottom']} style={styles.screen}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Mục Địa chỉ giao hàng - Bấm vào là đổi được ngay */}
        <TouchableOpacity
          style={[styles.card, { borderColor: colors.primary, borderWidth: 1 }]}
          onPress={() => setShowAddressPicker(true)}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <Text style={[styles.sectionTitle, { marginLeft: 6, marginBottom: 0 }]}>Địa chỉ giao hàng</Text>
            </View>
            <View style={{ backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ color: colors.primaryDark, fontSize: 12, fontWeight: '700' }}>Thay đổi</Text>
            </View>
          </View>
          <Text style={[styles.body, { fontWeight: '700', color: colors.text }]}>{address}</Text>
          <Text style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>Chạm vào đây để chọn vị trí trên bản đồ hoặc tìm kiếm</Text>
        </TouchableOpacity>

        {/* Tóm tắt nhà hàng & Món ăn */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nhà hàng</Text>
          <Text style={[styles.body, { fontWeight: '700', color: colors.primaryDark }]}>{cart.restaurant?.name}</Text>
          <Text style={styles.muted}>{cart.restaurant?.address}</Text>
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />
          <Text style={[styles.sectionTitle, { fontSize: 14 }]}>Món đã chọn ({cart.items.length})</Text>
          {cart.items.map((item) => (
            <View key={item.key} style={[styles.flex, { marginVertical: 4 }]}>
              <Text style={[styles.body, { flex: 1 }]}>{item.quantity}x {item.dish.name}</Text>
              <Text style={[styles.body, { fontWeight: '700' }]}>{displayMoney(item.unitPrice * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Mã giảm giá */}
        <VoucherPicker />

        {/* Phương thức thanh toán */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <Pressable
            style={[s.payOpt, payment === 'cash' && s.payOptActive]}
            onPress={() => setPayment('cash')}
          >
            <Ionicons name="cash-outline" size={20} color={payment === 'cash' ? colors.primary : colors.muted} />
            <Text style={[s.payText, payment === 'cash' && s.payTextActive]}>Tiền mặt khi nhận món (COD)</Text>
            {payment === 'cash' && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
          </Pressable>

          <Pressable
            style={[s.payOpt, payment === 'wallet' && s.payOptActive, { marginTop: 8 }]}
            onPress={() => setPayment('wallet')}
          >
            <Ionicons name="wallet-outline" size={20} color={payment === 'wallet' ? colors.primary : colors.muted} />
            <Text style={[s.payText, payment === 'wallet' && s.payTextActive]}>Ví điện tử GrabPay / Thẻ</Text>
            {payment === 'wallet' && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
          </Pressable>
        </View>

        {/* Chi tiết giá & phí ship */}
        {pricing && <PricingBreakdown pricing={pricing} />}
        <ErrorMessage message={state.error || pricingError} />
      </ScrollView>

      {/* Footer đặt đơn */}
      <View style={styles.footer}>
        <Text style={styles.muted}>Kiểm tra món, địa chỉ và tổng tiền trước khi đặt.</Text>
        <ActionButton
          label={busy ? 'Đang tạo đơn…' : `Đặt đơn${pricing ? ' • ' + displayMoney(pricing.total) : ''}`}
          loading={busy}
          disabled={!pricing || !!voucherError || !payment || !address.trim()}
          onPress={() => controller.submit(review, payment)}
        />
      </View>
    </KeyboardAvoidingView>

    {/* Modal chọn địa chỉ */}
    <AddressPicker
      visible={showAddressPicker}
      onClose={() => setShowAddressPicker(false)}
      onSelect={handleSelectAddress}
    />
  </SafeAreaView>;
}

const s = StyleSheet.create({
  payOpt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  payOptActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  payText: { flex: 1, marginLeft: 8, fontSize: 13, color: colors.text, fontWeight: '600' },
  payTextActive: { color: colors.primaryDark, fontWeight: '700' },
});
