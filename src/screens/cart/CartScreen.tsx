import React, { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { cartErrorMessage, useCartStore } from '../../store/cartStore';
import { ActionButton, CartItemCard, displayMoney, EmptyCart, ErrorMessage, PricingBreakdown, readCartPricing, styles } from './CartComponents';
import VoucherPicker from './VoucherPicker';

export default function CartScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const cart = useCartStore();
  const [error, setError] = useState<string | null>(null);
  const { pricing, error: pricingError, voucherError } = readCartPricing(cart);
  function change(action: () => void) {
    try { action(); setError(null); } catch (caught) { setError(cartErrorMessage(caught)); }
  }
  if (!cart.items.length) return <SafeAreaView edges={['bottom']} style={styles.screen}>
    <EmptyCart onBrowse={() => nav.navigate('Tabs', { screen: 'Home' })} />
  </SafeAreaView>;
  return <SafeAreaView edges={['bottom']} style={styles.screen}>
    <FlatList data={cart.items} keyExtractor={(item) => item.key} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"
      ListHeaderComponent={<View style={styles.flex}>
        <Text style={styles.heading}>{cart.restaurant?.name}</Text>
        <Text style={styles.muted}>Một giỏ hàng · Một quán ăn</Text>
        <ErrorMessage message={error || pricingError} />
      </View>}
      renderItem={({ item }) => <CartItemCard item={item} disabled={cart.checkoutLocked}
        onQuantity={(quantity) => change(() => cart.updateQuantity(item.key, quantity))} onRemove={() => change(() => cart.removeItem(item.key))} />}
      ListFooterComponent={<View style={styles.flex}>
        <VoucherPicker />
        {pricing && <PricingBreakdown pricing={pricing} />}
      </View>} />
    <View style={styles.footer}>
      <Text style={styles.total}>{pricing ? displayMoney(pricing.total) : 'Chưa thể tính tiền'}</Text>
      <ActionButton label="Tiếp tục thanh toán" disabled={!pricing || !!voucherError || cart.checkoutLocked} onPress={() => nav.navigate('Checkout')} />
    </View>
  </SafeAreaView>;
}
