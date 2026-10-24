import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Dish, Restaurant } from '../../models/types';
import { RootStackParamList } from '../../navigation/types';
import { api } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { colors, formatVND, radius, spacing } from '../../theme';
import { buildCartItem } from './buildCartItem';
import {
  calcItemTotalPrice,
  createDefaultSelectedOptions,
  getMissingRequiredOptionNames,
  toggleSelectedChoice,
} from './calcItemTotalPrice';
import OptionGroupSection from './OptionGroupSection';
import QuantityStepper from './QuantityStepper';
import { SelectedOption } from './restaurantMenuTypes';
import { showToast } from '../../components/Toast';

type DishOptionsScreenProps = NativeStackScreenProps<RootStackParamList, 'DishOptions'>;

export default function DishOptionsScreen({ navigation, route }: DishOptionsScreenProps) {
  const { restaurantId, dishId } = route.params;
  const [restaurant, setRestaurant] = useState<Restaurant | undefined>(undefined);
  const [dish, setDish] = useState<Dish | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const addToCart = useCartStore((state) => state.addToCart);
  const clearCart = useCartStore((state) => state.clear);
  const needsConfirmSwitch = useCartStore((state) => state.needsConfirmSwitch);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    setRestaurant(undefined);
    setDish(undefined);
    setQuantity(1);
    setNote('');
    setSelectedOptions([]);
    Promise.all([api.getRestaurant(restaurantId), api.getDishes(restaurantId)]).then(
      ([nextRestaurant, dishes]) => {
        if (cancelled) return;
        const nextDish = dishes.find((item) => item.id === dishId);
        setRestaurant(nextRestaurant);
        setDish(nextDish);
        if (nextDish) setSelectedOptions(createDefaultSelectedOptions(nextDish));
        setLoading(false);
      },
    ).catch(() => {
      if (cancelled) return;
      setLoadError(true);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [dishId, restaurantId, retryCount]);

  const itemTotalPrice = useMemo(() => {
    if (!dish) return 0;
    return calcItemTotalPrice(dish, selectedOptions, quantity);
  }, [dish, quantity, selectedOptions]);

  const onToggle = (optionId: string, choiceId: string, multiple: boolean) => {
    setSelectedOptions((current) => toggleSelectedChoice(current, optionId, choiceId, multiple));
  };

  const commitAddToCart = (targetRestaurant: Restaurant, targetDish: Dish) => {
    const cartItem = buildCartItem({
      dish: targetDish,
      quantity,
      selectedOptions,
      note,
    });
    addToCart(
      targetRestaurant,
      cartItem.dish,
      cartItem.quantity,
      cartItem.selectedOptions,
      cartItem.note,
    );
    showToast('Đã thêm vào giỏ hàng');
    navigation.goBack();
  };

  const handleAddToCart = () => {
    if (!restaurant || !dish) return;
    const missing = getMissingRequiredOptionNames(dish, selectedOptions);
    if (missing.length > 0) {
      Alert.alert('Chưa chọn đủ', `Vui lòng chọn: ${missing.join(', ')}`);
      return;
    }
    if (needsConfirmSwitch(restaurant.id)) {
      Alert.alert(
        'Đổi quán?',
        'Bạn có muốn xóa giỏ hàng hiện tại để tạo đơn mới tại quán này không?',
        [
          { text: 'Huỷ', style: 'cancel' },
          {
            text: 'Đồng ý',
            onPress: () => {
              clearCart();
              commitAddToCart(restaurant, dish);
            },
          },
        ],
      );
      return;
    }
    commitAddToCart(restaurant, dish);
  };

  return (
    <View style={styles.root}>
      <Pressable style={styles.backdrop} onPress={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheetWrap}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : loadError ? (
            <View style={styles.errorState}>
              <Text style={styles.error}>Không thể tải thông tin món.</Text>
              <Pressable style={styles.retryButton} onPress={() => setRetryCount((count) => count + 1)}>
                <Text style={styles.retryText}>Thử lại</Text>
              </Pressable>
            </View>
          ) : !dish ? (
            <Text style={styles.error}>Không tìm thấy món.</Text>
          ) : (
            <>
              <Text style={styles.title}>{dish.name}</Text>
              <Text style={styles.desc}>{dish.description}</Text>
              <Text style={styles.basePrice}>Giá gốc {formatVND(dish.price)}</Text>
              <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
                {dish.options.map((option) => (
                  <OptionGroupSection
                    key={option.id}
                    option={option}
                    selectedOptions={selectedOptions}
                    onToggle={onToggle}
                  />
                ))}
                <Text style={styles.label}>Ghi chú</Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Ví dụ: Ít đá, 50% đường"
                  placeholderTextColor={colors.muted}
                  style={styles.note}
                  multiline
                />
              </ScrollView>
              <View style={styles.footer}>
                <QuantityStepper quantity={quantity} onChange={setQuantity} />
                <Pressable style={styles.addBtn} onPress={handleAddToCart}>
                  <Text style={styles.addText}>Thêm vào giỏ hàng · {formatVND(itemTotalPrice)}</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheetWrap: { maxHeight: '88%' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '100%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  loader: { marginVertical: spacing.xl },
  error: { textAlign: 'center', color: colors.danger, marginVertical: spacing.xl },
  errorState: { alignItems: 'center' },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  desc: { color: colors.muted, marginTop: 4 },
  basePrice: { color: colors.primaryDark, fontWeight: '600', marginVertical: spacing.sm },
  body: { maxHeight: 360 },
  label: { fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  note: {
    minHeight: 72,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    textAlignVertical: 'top',
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  addBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
