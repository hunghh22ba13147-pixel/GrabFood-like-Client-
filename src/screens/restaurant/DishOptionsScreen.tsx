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
import { colors, formatVND, radius, spacing } from '../../theme';
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
import { addToCartWithConfirmation } from '../cart/addToCartWithConfirmation';

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

  const handleAddToCart = async () => {
    if (!restaurant || !dish) return;
    const missing = getMissingRequiredOptionNames(dish, selectedOptions);
    if (missing.length > 0) {
      const msg = `Vui lòng chọn: ${missing.join(', ')}`;
      if (Platform.OS === 'web') {
        globalThis.alert(`Chưa chọn đủ\n${msg}`);
      } else {
        Alert.alert('Chưa chọn đủ', msg);
      }
      return;
    }

    try {
      const added = await addToCartWithConfirmation(
        restaurant,
        dish,
        quantity,
        selectedOptions,
        note.trim() ? note.trim() : undefined,
      );
      if (added) {
        showToast('Đã thêm vào giỏ hàng');
        navigation.goBack();
      }
    } catch (err: any) {
      const msg = err?.message || 'Không thể thêm món vào giỏ hàng.';
      if (Platform.OS === 'web') {
        globalThis.alert(msg);
      } else {
        Alert.alert('Lỗi thêm món', msg);
      }
    }
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
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
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
